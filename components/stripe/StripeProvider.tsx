"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useMemo } from "react";

/**
 * Stripe publishable key for this factory's account.
 *
 * A publishable key is public by design — Stripe ships it to every browser
 * that loads Stripe.js — so baking it in is safe. It is kept as a fallback
 * because NEXT_PUBLIC_* values are inlined at BUILD time: a variable added
 * in the Cloudflare dashboard only reaches the client bundle after the
 * project is rebuilt (Retry deployment), and until then Stripe.js loads
 * with an empty key and the card form never mounts.
 *
 * Override it with NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY if the account ever
 * changes.
 */
const DEFAULT_PUBLISHABLE_KEY =
  "pk_live_51UISDfDHQnRnvrATssM9Z4L5nppagmx6S4eF0QTD06Wqpr24sjBTCMgjXFFMkPL3w4zNzQDJBPFtZoZyrOxhIWlY00iIiEcA67";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || DEFAULT_PUBLISHABLE_KEY
);

export default function StripeProvider({
  children,
  clientSecret,
}: {
  children: React.ReactNode;
  clientSecret?: string;
}) {
  const options = useMemo(
    () => ({
      appearance: {
        theme: "flat" as const,
        variables: {
          colorPrimary: "#ff4d00",
          colorBackground: "#ffffff",
          colorText: "#0a0a0a",
          borderRadius: "0px",
          fontFamily: "system-ui, sans-serif",
        },
      },
    }),
    []
  );

  if (!clientSecret) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={{ ...options, clientSecret }}>
      {children}
    </Elements>
  );
}
