/**
 * functions/_lib/stripe.ts
 *
 * Server-side Stripe client (Pages Function context).
 *
 * Env vars (set in CF Pages Dashboard → Settings → Functions):
 *   STRIPE_SECRET_KEY       (sk_live_... or sk_test_...)
 *   STRIPE_WEBHOOK_SECRET   (whsec_..., from Stripe Dashboard → Webhooks)
 */

import Stripe from "stripe";

export function getStripe(secretKey: string): Stripe {
  if (!secretKey) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY env var. Set it in Cloudflare Pages → Settings → Functions."
    );
  }
  return new Stripe(secretKey, {
    apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
    typescript: true,
  });
}

/**
 * Verify a Stripe webhook signature.
 * Throws if verification fails — caller should return 400.
 *
 * Reference: https://stripe.com/docs/webhooks/signatures
 */
export function constructWebhookEvent(
  payload: string,
  signatureHeader: string,
  secret: string
): Stripe.Event {
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET env var.");
  }
  // stripe-node has built-in verify — works in Workers runtime.
  // The library is small enough for Pages Functions cold start.
  return Stripe.webhooks.constructEvent(payload, signatureHeader, secret);
}
