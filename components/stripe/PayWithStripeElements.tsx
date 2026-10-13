"use client";

import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PayWithStripeElementsProps {
  clientSecret: string;
  piNumber: string;
  amount: number;
  currency: string;
}

export default function PayWithStripeElements({
  clientSecret,
  piNumber,
  amount,
  currency,
}: PayWithStripeElementsProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("Card element not found");
      setIsLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed");
      setIsLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      router.push(`/pay/?pi=${piNumber}&payment=success`);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#0a0a0a",
        fontFamily: "system-ui, sans-serif",
        "::placeholder": {
          color: "#9ca3af",
        },
      },
      invalid: {
        color: "#ef4444",
        iconColor: "#ef4444",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded border border-gray-300 p-4 bg-white">
        <CardElement options={cardElementOptions} />
      </div>

      {errorMessage && (
        <div className="rounded bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full rounded bg-[#ff4d00] px-6 py-3 font-semibold text-white transition hover:bg-[#e64500] disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isLoading ? "Processing..." : `Pay ${currency} ${amount.toFixed(2)} Now`}
      </button>
    </form>
  );
}
