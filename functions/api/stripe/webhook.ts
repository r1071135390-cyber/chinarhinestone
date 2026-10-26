/**
 * functions/api/stripe/webhook.ts
 *
 * POST /api/stripe/webhook
 *
 * Stripe sends events here (checkout.session.completed,
 * payment_intent.succeeded, charge.refunded, etc.).
 *
 * Security: we verify the Stripe-Signature header against
 * STRIPE_WEBHOOK_SECRET. Bad signatures → 400, do nothing.
 *
 * Effect: on payment_intent.succeeded (or
 * checkout.session.completed) we flip the corresponding PI
 * to status='paid' and stamp paid_at.
 *
 * ── Duplicate-payment handling ─────────────────────────────────────────────
 * Stripe delivers the same event more than once, and a customer can pay the
 * same invoice twice. Two guards:
 *
 *   1. Every payment is written to the `pi_payments` ledger, which has a
 *      UNIQUE key on (site_slug, payment_intent_id). A webhook redelivery
 *      therefore hits the constraint and is ignored instead of counting as
 *      a second payment.
 *   2. The invoice is only flipped to "paid" when it is not already paid
 *      (`.neq("status", "paid")`), so a redelivery never overwrites the
 *      original paid_at timestamp.
 *
 * If more than one payment lands on the same invoice, the invoice is flagged
 * with duplicate_payment_at so the admin list can warn about it.
 *
 * Configuration: in Stripe Dashboard → Webhooks, add endpoint
 *   https://chinarhinestone.com/api/stripe/webhook
 * and select the events you care about (we listen for both
 * payment_intent.succeeded and checkout.session.completed for safety).
 */

import type Stripe from "stripe";
import { getSupabase, type Env } from "../../_lib/supabase";
import { constructWebhookEvent, getStripe } from "../../_lib/stripe";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";

interface PaymentInfo {
  piNumber: string | null;
  intentId: string | null;
  amountCents: number;
  currency: string;
}

/** PostgREST unique-violation — the payment is already in the ledger. */
function isUniqueViolation(code?: string): boolean {
  return code === "23505";
}

/** The ledger table does not exist yet (migration not applied). */
function isMissingTable(code?: string, message?: string): boolean {
  if (code === "PGRST205" || code === "42P01") return true;
  return /could not find the table|does not exist/i.test(message ?? "");
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  // Stripe is optional during initial deployment. If keys are missing,
  // accept-and-ignore the event (return 200 so Stripe stops retrying)
  // instead of throwing 500. This lets the rest of the PI system work
  // even before Stripe live keys are added.
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return jsonResponse(
      { received: true, ignored: true, reason: "stripe_not_configured" },
      { status: 200, request: context.request, env }
    );
  }

  const signature = context.request.headers.get("Stripe-Signature") ?? "";
  if (!signature) {
    return new Response("Missing Stripe-Signature", { status: 400 });
  }

  // Stripe needs the RAW body for HMAC verification.
  // context.request.text() preserves the body bytes.
  const payload = await context.request.text();

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bad signature";
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  const supabase = getSupabase(env);
  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  // We care about two event types — they both convey "the customer paid".
  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "checkout.session.completed"
  ) {
    const info = await extractPaymentInfo(event, stripe);
    if (!info.piNumber) {
      // No PI metadata — nothing to do.
      return jsonResponse({ received: true, ignored: true }, { status: 200, request: context.request, env });
    }

    const piNumber = info.piNumber;

    // ── 1. Record the payment in the ledger ─────────────────────────────────
    // The UNIQUE key on (site_slug, payment_intent_id) makes a webhook
    // redelivery a no-op: the insert fails and we skip the rest.
    let duplicate = false;
    let recorded = false;

    if (info.intentId) {
      const insert = await supabase
        .from("pi_payments")
        .insert({
          site_slug: siteSlug,
          pi_number: piNumber,
          payment_intent_id: info.intentId,
          amount_cents: info.amountCents,
          currency: info.currency,
        })
        .select("id")
        .maybeSingle();

      if (insert.error) {
        if (isUniqueViolation(insert.error.code)) {
          // Redelivery of an event we already recorded. This is NOT a second
          // payment — fall through to the status update below, because a
          // retry may arrive after the previous attempt failed to update
          // the invoice row.
        } else if (!isMissingTable(insert.error.code, insert.error.message)) {
          return jsonResponse({ error: insert.error.message }, { status: 500, request: context.request, env });
        }
        // Ledger table missing — fall through without the ledger.
      } else {
        recorded = true;

        const { count } = await supabase
          .from("pi_payments")
          .select("id", { count: "exact", head: true })
          .eq("site_slug", siteSlug)
          .eq("pi_number", piNumber);

        duplicate = (count ?? 0) > 1;

        if (duplicate) {
          await supabase
            .from("pi_payments")
            .update({ is_duplicate: true })
            .eq("site_slug", siteSlug)
            .eq("pi_number", piNumber);

          await supabase
            .from("proforma_invoices")
            .update({ duplicate_payment_at: new Date().toISOString() })
            .eq("pi_number", piNumber)
            .eq("site_slug", siteSlug);
        }
      }
    }

    // ── 2. Flip the invoice to paid ─────────────────────────────────────────
    // `.neq("status", "paid")` keeps the original paid_at when the same
    // payment arrives twice — a redelivery must not move the timestamp.
    const { error } = await supabase
      .from("proforma_invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_method: "stripe",
      })
      .eq("pi_number", piNumber)
      .eq("site_slug", siteSlug)
      .neq("status", "paid");

    if (error) {
      // Return 500 so Stripe retries the webhook.
      return jsonResponse({ error: error.message }, { status: 500, request: context.request, env });
    }

    return jsonResponse(
      { received: true, recorded, duplicate },
      { status: 200, request: context.request, env }
    );
  } else if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const piNumber =
      (charge.metadata?.pi_number as string | undefined) ??
      (charge.payment_intent
        ? (await fetchPiNumberFromIntent(stripe, charge.payment_intent as string))
        : null);

    if (piNumber) {
      await supabase
        .from("proforma_invoices")
        .update({
          status: "refunded",
          refunded_at: new Date().toISOString(),
        })
        .eq("pi_number", piNumber)
        .eq("site_slug", siteSlug);
    }
  }

  return jsonResponse({ received: true }, { status: 200, request: context.request, env });
};

async function extractPaymentInfo(event: Stripe.Event, stripe: Stripe): Promise<PaymentInfo> {
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    let piNumber = (intent.metadata?.pi_number as string | undefined) ?? null;
    if (!piNumber && intent.id) {
      piNumber = await fetchPiNumberFromIntent(stripe, intent.id);
    }
    return {
      piNumber,
      intentId: intent.id ?? null,
      amountCents: intent.amount_received ?? intent.amount ?? 0,
      currency: intent.currency ?? "usd",
    };
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    let piNumber =
      (session.metadata?.pi_number as string | undefined) ??
      session.client_reference_id ??
      null;

    const intentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    if (!piNumber && intentId) {
      piNumber = await fetchPiNumberFromIntent(stripe, intentId);
    }

    return {
      piNumber,
      intentId,
      amountCents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
    };
  }

  return { piNumber: null, intentId: null, amountCents: 0, currency: "usd" };
}

async function fetchPiNumberFromIntent(stripe: Stripe, intentId: string): Promise<string | null> {
  try {
    const intent = await stripe.paymentIntents.retrieve(intentId);
    return (intent.metadata?.pi_number as string | undefined) ?? null;
  } catch {
    return null;
  }
};
