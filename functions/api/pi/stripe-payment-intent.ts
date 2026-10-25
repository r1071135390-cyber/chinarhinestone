/**
 * functions/api/pi/stripe-payment-intent.ts
 *
 * POST /api/pi/stripe-payment-intent
 *
 * Body: { pi_number: string, currency: string, amount_cents: number }
 *
 * Creates (or reuses) a Stripe PaymentIntent for the given PI.
 * Idempotency: if a PaymentIntent with metadata.pi_number already exists
 * for this site, returns the same client_secret.
 *
 * Stores the intent id back in proforma_invoices.stripe_payment_intent_id.
 */

import { getSupabase, type Env } from "../../_lib/supabase";
import { getStripe } from "../../_lib/stripe";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";

interface CreateIntentBody {
  pi_number?: string;
  currency?: string;
  amount_cents?: number;
  customer_email?: string;
  customer_name?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  let body: CreateIntentBody;
  try {
    body = await context.request.json<CreateIntentBody>();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400, request: context.request, env });
  }

  const piNumber = (body.pi_number ?? "").trim();
  const currency = (body.currency ?? "USD").toLowerCase();
  const requestedCents = Number(body.amount_cents ?? 0);
  const customerEmail = (body.customer_email ?? "").trim();
  const customerName = (body.customer_name ?? "").trim();

  if (!piNumber) {
    return jsonResponse({ error: "Missing pi_number" }, { status: 400, request: context.request, env });
  }

  const supabase = getSupabase(env);

  // 1. Look up the PI to confirm it exists and is payable
  const { data: pi, error: piError } = await supabase
    .from("proforma_invoices")
    .select("pi_number, status, stripe_payment_intent_id, total_cents, currency")
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug)
    .maybeSingle();

  if (piError) {
    return jsonResponse({ error: piError.message }, { status: 500, request: context.request, env });
  }
  if (!pi) {
    return jsonResponse({ error: "PI not found" }, { status: 404, request: context.request, env });
  }
  if (pi.status === "paid") {
    return jsonResponse({ error: "PI already paid" }, { status: 409, request: context.request, env });
  }

  // The amount always comes from the stored PI — the client's figure is only
  // a fallback for rows created before total_cents was populated.
  const amountCents = pi.total_cents != null ? Number(pi.total_cents) : requestedCents;
  if (!Number.isFinite(amountCents) || amountCents < 50) {
    return jsonResponse({ error: "PI total is missing or below the minimum charge amount" }, { status: 400, request: context.request, env });
  }

  // Stripe is optional during initial deployment — return a soft-unavailable
  // signal so the frontend can hide the card-payment button instead of
  // crashing the whole /pay page.
  if (!env.STRIPE_SECRET_KEY) {
    return jsonResponse(
      { unavailable: true, reason: "stripe_not_configured" },
      { status: 200, request: context.request, env }
    );
  }

  // 2. Reuse existing PaymentIntent if one is already attached
  const stripe = getStripe(env.STRIPE_SECRET_KEY);
  if (pi.stripe_payment_intent_id) {
    try {
      const existing = await stripe.paymentIntents.retrieve(pi.stripe_payment_intent_id);
      if (existing.status !== "canceled" && existing.status !== "succeeded") {
        return jsonResponse(
          {
            client_secret: existing.client_secret,
            payment_intent_id: existing.id,
            reused: true,
          },
          { status: 200, request: context.request, env }
        );
      }
    } catch {
      // Existing intent is gone (deleted, wrong env, etc.) — fall through and create a new one.
    }
  }

  // 3. Create a new PaymentIntent
  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      pi_number: piNumber,
      site_slug: siteSlug,
    },
    description: `Proforma Invoice ${piNumber}`,
    receipt_email: customerEmail || undefined,
    shipping: customerName ? { name: customerName } : undefined,
  });

  // 4. Persist the intent id on the PI for later webhook reconciliation
  await supabase
    .from("proforma_invoices")
    .update({ stripe_payment_intent_id: intent.id })
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug);

  return jsonResponse(
    {
      client_secret: intent.client_secret,
      payment_intent_id: intent.id,
      reused: false,
    },
    { status: 200, request: context.request, env }
  );
};
