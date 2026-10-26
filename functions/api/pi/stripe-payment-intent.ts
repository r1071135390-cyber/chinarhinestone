/**
 * functions/api/pi/stripe-payment-intent.ts
 *
 * POST /api/pi/stripe-payment-intent
 *
 * Body: { pi_number: string, currency?: string, amount_cents?: number }
 *
 * Creates (or reuses) a Stripe PaymentIntent for the given PI.
 *
 * ── Duplicate-payment protection ───────────────────────────────────────────
 * The customer must never be able to charge the same PI twice. Three server
 * side guards enforce that:
 *
 *   1. A PI whose status is already paid / cancelled / refunded is refused
 *      with 409 — no new intent is minted.
 *   2. If the PI already points at a PaymentIntent that Stripe reports as
 *      `succeeded`, the request is refused with 409 as well (the webhook
 *      may simply not have run yet). This is the case that used to fall
 *      through and hand the customer a second, payable intent.
 *   3. Every `paymentIntents.create` call carries an idempotency key, so a
 *      double click, a retry after a network timeout, or two browser tabs
 *      all resolve to the SAME PaymentIntent instead of creating several.
 *
 * The idempotency key is derived from the PI number, the amount and a hash
 * of the request parameters. Stripe rejects a key that is reused with
 * different parameters, so the parameter hash is part of the key: if the
 * invoice changes (new amount, new address) a new intent is created,
 * otherwise the key is stable and the request is de-duplicated.
 */

import type Stripe from "stripe";
import { getSupabase, isPiStoreConfigured, piStoreEnvDiagnostic, type Env } from "../../_lib/supabase";
import { getStripe } from "../../_lib/stripe";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";

interface CreateIntentBody {
  pi_number?: string;
  currency?: string;
  amount_cents?: number;
  /** Major units — accepted as a fallback for older clients. */
  amount?: number;
  customer_email?: string;
  customer_name?: string;
}

interface PiRow {
  customer_name?: string | null;
  customer_email?: string | null;
  customer_address?: string | null;
  customer_country?: string | null;
}

/** Statuses that must never accept another payment. */
const CLOSED_STATUSES = ["paid", "cancelled", "refunded"];

/**
 * FNV-1a 32-bit hash — a stable, dependency-free fingerprint of the
 * request parameters. Used to build the Stripe idempotency key.
 */
function stableHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/**
 * Build the Stripe `shipping` object for a PI.
 *
 * Stripe types `shipping.address` as required, so shipping can only be sent
 * when we can produce a usable address. The PI stores the address as a single
 * free-text blob, so the first line becomes `line1` and the remainder
 * `line2`. `country` is only forwarded when it already looks like an ISO
 * 3166-1 alpha-2 code — Stripe rejects other formats.
 */
function buildShipping(
  pi: PiRow | null,
  fallbackName: string
): { name: string; address: Stripe.AddressParam } | undefined {
  const name = (pi?.customer_name ?? fallbackName ?? "").trim();
  if (!name) return undefined;

  const parts = (pi?.customer_address ?? "")
    .split(/[\r\n]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return undefined;

  const line1 = parts[0];
  const line2 = parts.slice(1).join(", ") || undefined;

  const rawCountry = (pi?.customer_country ?? "").trim();
  const country = /^[A-Za-z]{2}$/.test(rawCountry) ? rawCountry.toUpperCase() : undefined;

  return {
    name,
    address: {
      line1,
      ...(line2 ? { line2 } : {}),
      ...(country ? { country } : {}),
    },
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  let body: CreateIntentBody;
  try {
    body = (await context.request.json()) as CreateIntentBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400, request: context.request, env });
  }

  const piNumber = (body.pi_number ?? "").trim();
  const requestedCents =
    Number(body.amount_cents ?? 0) ||
    (Number(body.amount ?? 0) > 0 ? Math.round(Number(body.amount) * 100) : 0);
  const customerEmail = (body.customer_email ?? "").trim();
  const customerName = (body.customer_name ?? "").trim();

  if (!piNumber) {
    return jsonResponse({ error: "Missing pi_number" }, { status: 400, request: context.request, env });
  }

  // Without this the lookup would throw and Cloudflare would answer with a
  // bare "error code: 1101" page instead of JSON.
  if (!isPiStoreConfigured(env)) {
    return jsonResponse(
      {
        error: "PI store is not configured on this deployment.",
        diagnostic: piStoreEnvDiagnostic(env),
      },
      { status: 500, request: context.request, env }
    );
  }

  const supabase = getSupabase(env);

  // 1. Look up the PI to confirm it exists and is payable
  const { data: pi, error: piError } = await supabase
    .from("proforma_invoices")
    .select("pi_number, status, paid_at, stripe_payment_intent_id, total_cents, currency, customer_name, customer_email, customer_address, customer_country")
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug)
    .maybeSingle();

  if (piError) {
    return jsonResponse({ error: piError.message }, { status: 500, request: context.request, env });
  }
  if (!pi) {
    return jsonResponse({ error: "PI not found" }, { status: 404, request: context.request, env });
  }

  const piStatus = (pi.status ?? "").toLowerCase();
  if (CLOSED_STATUSES.includes(piStatus)) {
    return jsonResponse(
      {
        error:
          piStatus === "paid"
            ? "This invoice has already been paid."
            : `This invoice is closed (${piStatus}) and cannot be paid.`,
        alreadyPaid: piStatus === "paid",
        status: piStatus,
      },
      { status: 409, request: context.request, env }
    );
  }

  // The amount always comes from the stored PI — the client's figure is only
  // a fallback for rows created before total_cents was populated.
  const amountCents = pi.total_cents != null ? Number(pi.total_cents) : requestedCents;
  if (!Number.isFinite(amountCents) || amountCents < 50) {
    return jsonResponse({ error: "PI total is missing or below the minimum charge amount" }, { status: 400, request: context.request, env });
  }

  // Currency comes from the stored PI first — the client must not be able to
  // charge an amount in a different currency than the invoice states.
  const currency = (pi.currency || body.currency || "USD").toLowerCase();

  // Stripe is optional during initial deployment — return a soft-unavailable
  // signal so the frontend can hide the card-payment button instead of
  // crashing the whole /pay page.
  if (!env.STRIPE_SECRET_KEY) {
    return jsonResponse(
      { unavailable: true, reason: "stripe_not_configured" },
      { status: 200, request: context.request, env }
    );
  }

  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  // 2. Reuse the existing PaymentIntent when it is still usable.
  //
  // Guard: a PaymentIntent Stripe already reports as `succeeded` means the
  // customer HAS paid. Handing out a second intent here is exactly how a
  // customer ends up paying twice, so this is refused — and the PI row is
  // repaired in case the webhook never arrived.
  let staleIntentId: string | null = null;

  if (pi.stripe_payment_intent_id) {
    try {
      const existing = await stripe.paymentIntents.retrieve(pi.stripe_payment_intent_id);

      if (existing.status === "succeeded") {
        await supabase
          .from("proforma_invoices")
          .update({
            status: "paid",
            paid_at: pi.paid_at ?? new Date().toISOString(),
            payment_method: "stripe",
          })
          .eq("pi_number", piNumber)
          .eq("site_slug", siteSlug);

        return jsonResponse(
          {
            error: "This invoice has already been paid.",
            alreadyPaid: true,
            payment_intent_id: existing.id,
          },
          { status: 409, request: context.request, env }
        );
      }

      if (existing.status !== "canceled") {
        if (existing.amount === amountCents) {
          // Same invoice, same amount — reuse it. Two tabs, a double click
          // or a page reload all end up on this one intent.
          return jsonResponse(
            {
              client_secret: existing.client_secret,
              payment_intent_id: existing.id,
              reused: true,
              bankTransferPending: piStatus === "awaiting_payment",
            },
            { status: 200, request: context.request, env }
          );
        }

        // The invoice amount changed after the intent was created — the old
        // intent would charge the old amount, so it must not be reused.
        staleIntentId = existing.id;
      }
    } catch {
      // Existing intent is gone (deleted, wrong env, etc.) — fall through and create a new one.
    }
  }

  // 3. Create a new PaymentIntent.
  //
  // Stripe's `shipping` object requires an `address` — a bare `{ name }` is
  // rejected by the type (and would fail at runtime). The PI stores the
  // address as one free-text blob, so split it into line1 / line2 and only
  // attach shipping when we actually have a usable line1. Country is only
  // sent when it is a real ISO 3166-1 alpha-2 code, because Stripe validates
  // the format and rejects anything else.
  const shipping = buildShipping(pi, customerName);

  const params: Stripe.PaymentIntentCreateParams = {
    amount: amountCents,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      pi_number: piNumber,
      site_slug: siteSlug,
    },
    description: `Proforma Invoice ${piNumber}`,
    receipt_email: (pi.customer_email || customerEmail) || undefined,
    shipping,
  };

  // Retire the superseded intent so a stale client_secret cannot be used to
  // charge the old amount later on.
  if (staleIntentId) {
    try {
      await stripe.paymentIntents.cancel(staleIntentId);
    } catch {
      // Best effort — a failure here must not block the new intent.
    }
  }

  // Idempotency key: stable for identical requests (so retries collapse into
  // one intent) and different when the invoice changes (so Stripe does not
  // reject the request for key reuse with different parameters).
  const keyBase = `cr-pi-${piNumber}-${amountCents}-${stableHash(JSON.stringify(params))}`;

  let intent: Stripe.PaymentIntent | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const idempotencyKey = attempt === 0 ? keyBase : `${keyBase}-${attempt + 1}`;
    intent = await stripe.paymentIntents.create(params, { idempotencyKey });

    // A cached idempotent response can hand back an intent that was
    // cancelled in the meantime. Retry with the next key to get a fresh one.
    if (intent.status !== "canceled") break;
  }

  if (!intent) {
    return jsonResponse({ error: "Failed to create payment intent" }, { status: 500, request: context.request, env });
  }

  // 4. Persist the intent id on the PI for later webhook reconciliation
  await supabase
    .from("proforma_invoices")
    .update({ stripe_payment_intent_id: intent.id })
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug);

  if (intent.status === "succeeded") {
    // The idempotent key pointed at an already-successful payment.
    return jsonResponse(
      {
        error: "This invoice has already been paid.",
        alreadyPaid: true,
        payment_intent_id: intent.id,
      },
      { status: 409, request: context.request, env }
    );
  }

  if (intent.status === "canceled") {
    // Every attempt came back cancelled — refuse instead of handing the
    // customer a client_secret that can never be paid.
    return jsonResponse(
      { error: "Could not start the payment. Please try again in a moment." },
      { status: 503, request: context.request, env }
    );
  }

  return jsonResponse(
    {
      client_secret: intent.client_secret,
      payment_intent_id: intent.id,
      reused: false,
      bankTransferPending: piStatus === "awaiting_payment",
    },
    { status: 200, request: context.request, env }
  );
};
