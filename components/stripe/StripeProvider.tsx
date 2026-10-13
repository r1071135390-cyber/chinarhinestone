"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useMemo } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
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
