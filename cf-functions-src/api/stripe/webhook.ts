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
    const piNumber = await extractPiNumber(event, stripe);
    if (!piNumber) {
      // No PI metadata — nothing to do.
      return jsonResponse({ received: true, ignored: true }, { status: 200, request: context.request, env });
    }

    const { error } = await supabase
      .from("proforma_invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_method: "stripe",
      })
      .eq("pi_number", piNumber)
      .eq("site_slug", siteSlug);

    if (error) {
      // Return 500 so Stripe retries the webhook.
      return jsonResponse({ error: error.message }, { status: 500, request: context.request, env });
    }
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

async function extractPiNumber(event: Stripe.Event, stripe: Stripe): Promise<string | null> {
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    if (intent.metadata?.pi_number) return intent.metadata.pi_number;
    // Fallback: look up the PI by stored intent id
    if (intent.id) return await fetchPiNumberFromIntent(stripe, intent.id);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.pi_number) return session.metadata.pi_number;
    if (session.client_reference_id) return session.client_reference_id;
    if (typeof session.payment_intent === "string") {
      return await fetchPiNumberFromIntent(stripe, session.payment_intent);
    }
  }
  return null;
}

async function fetchPiNumberFromIntent(stripe: Stripe, intentId: string): Promise<string | null> {
  try {
    const intent = await stripe.paymentIntents.retrieve(intentId);
    return (intent.metadata?.pi_number as string | undefined) ?? null;
  } catch {
    return null;
  }
};
