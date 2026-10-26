"use client";

import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface PayWithStripeElementsProps {
  clientSecret: string;
  piNumber: string;
  amount: number;
  currency: string;
}

const FIELD_STYLE = {
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
};

const FIELD_OPTIONS = { style: FIELD_STYLE };

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
  const [postalCode, setPostalCode] = useState("");

  // Ref-level lock: React state updates are async, so a double click can
  // start two confirmations before `isLoading` flips to true. This guard
  // makes the second click a no-op — the customer must never be charged
  // twice by accident.
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }
    if (submittingRef.current) {
      return;
    }
    submittingRef.current = true;

    setIsLoading(true);
    setErrorMessage(null);

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setErrorMessage("Card element not found");
      submittingRef.current = false;
      setIsLoading(false);
      return;
    }

    const trimmedPostal = postalCode.trim();

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumberElement,
        ...(trimmedPostal
          ? { billing_details: { address: { postal_code: trimmedPostal } } }
          : {}),
      },
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed");
      submittingRef.current = false;
      setIsLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Do not let the CVC linger in the DOM after a successful charge.
      const cvcElement = elements.getElement(CardCvcElement);
      cvcElement?.clear();
      router.push(`/pay/?pi=${piNumber}&payment=success`);
      return;
    }

    // Any other state (processing / requires_action) is not a failure —
    // keep the lock AND the disabled button on, so the customer cannot
    // submit a second payment while this one is still settling.
    setErrorMessage(
      "Your payment is still processing. Please do not submit again — we will confirm once it settles."
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded border border-gray-300 p-4 bg-white space-y-4">
        <div>
          <label
            htmlFor="card-number"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600"
          >
            Card Number
          </label>
          <div
            id="card-number"
            className="rounded border border-gray-300 bg-white px-3 py-2.5 focus-within:border-[#ff4d00]"
          >
            <CardNumberElement
              options={{ ...FIELD_OPTIONS, placeholder: "1234 1234 1234 1234" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="card-expiry"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600"
            >
              Expiry Date
            </label>
            <div
              id="card-expiry"
              className="rounded border border-gray-300 bg-white px-3 py-2.5 focus-within:border-[#ff4d00]"
            >
              <CardExpiryElement
                options={{ ...FIELD_OPTIONS, placeholder: "MM / YY" }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="card-cvc"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600"
            >
              Security Code (CVC)
            </label>
            <div
              id="card-cvc"
              className="rounded border border-gray-300 bg-white px-3 py-2.5 focus-within:border-[#ff4d00]"
            >
              <CardCvcElement
                options={{ ...FIELD_OPTIONS, placeholder: "CVC" }}
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="card-postal"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600"
          >
            Postal Code <span className="font-normal normal-case text-gray-400">(optional)</span>
          </label>
          <input
            id="card-postal"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={12}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="Postal / ZIP code"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-[16px] text-[#0a0a0a] outline-none focus:border-[#ff4d00]"
          />
        </div>
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

      <p className="text-center text-xs text-gray-500">
        Your card details go directly to Stripe — we never see or store them.
      </p>
    </form>
  );
}
