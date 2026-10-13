"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProformaInvoice } from "@/components/pi/PIDisplay";
import type { BankAccount } from "@/lib/bank-accounts";
import PIDisplay from "@/components/pi/PIDisplay";
import StripeProvider from "@/components/stripe/StripeProvider";
import PayWithStripeElements from "@/components/stripe/PayWithStripeElements";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface PayClientProps {
  searchParams: Promise<{ pi?: string; payment?: string }>;
}

export default function PayClient({ searchParams }: PayClientProps) {
  const router = useRouter();
  const [piNumber, setPiNumber] = useState<string | null>(null);
  const [pi, setPi] = useState<ProformaInvoice | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | null>(null);
  const [bankTransferConfirmed, setBankTransferConfirmed] = useState(false);

  useEffect(() => {
    searchParams.then((params) => {
      setPiNumber(params.pi ?? null);
      setPaymentSuccess(params.payment === "success");
    });
  }, [searchParams]);

  useEffect(() => {
    if (!piNumber) {
      setLoading(false);
      return;
    }

    const fetchPI = async () => {
      try {
        const res = await fetch(`/api/pi/${piNumber}`);
        if (!res.ok) {
          throw new Error("Proforma Invoice not found");
        }
        const data = await res.json();
        setPi(data.pi);
        setBankAccount(data.bankAccount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load PI");
      } finally {
        setLoading(false);
      }
    };

    fetchPI();
  }, [piNumber]);

  const handlePayByCard = async () => {
    if (!piNumber || !pi) return;

    try {
      const res = await fetch(`/api/pi/stripe-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pi_number: piNumber, amount: pi.total, currency: pi.currency }),
      });
      const data = await res.json();
      if (data.client_secret) {
        setClientSecret(data.client_secret);
        setPaymentMethod("card");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize payment");
    }
  };

  const handleBankTransfer = async () => {
    if (!piNumber) return;

    try {
      const res = await fetch(`/api/pi/${piNumber}/confirm-bank`, {
        method: "POST",
      });
      if (res.ok) {
        setBankTransferConfirmed(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm bank transfer");
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("pi-document");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`PI-${piNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff4d00] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Proforma Invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="rounded-full bg-red-100 p-4 inline-block mb-4">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">PI Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => router.push("/")} className="text-[#ff4d00] hover:underline">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess && pi) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-[#0a0a0a] text-white py-4 px-6">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-lg font-bold">ChinaRhinestone</h1>
          </div>
        </header>
        <main className="mx-auto max-w-4xl p-6">
          <div className="rounded-lg bg-white p-8 shadow-lg text-center">
            <div className="rounded-full bg-green-100 p-4 inline-block mb-4">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your payment. PI #{pi.pi_number} has been confirmed.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h2 className="font-semibold mb-2">Order Summary</h2>
              <p className="text-sm text-gray-600">
                <span className="font-medium">PI Number:</span> {pi.pi_number}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Amount:</span> {pi.currency} {pi.total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Paid Via:</span> Card
              </p>
            </div>
            <button onClick={handleDownloadPDF} className="rounded bg-[#ff4d00] px-6 py-2 font-semibold text-white hover:bg-[#e64500] mr-4">
              Download Receipt
            </button>
            <button onClick={() => router.push("/")} className="rounded border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50">
              Return to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!pi || !bankAccount) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0a0a0a] text-white py-4 px-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-lg font-bold">ChinaRhinestone</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold">Proforma Invoice #{pi.pi_number}</h1>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Print
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg mb-6">
          <PIDisplay pi={pi} bankAccount={bankAccount} />
        </div>

        {bankTransferConfirmed ? (
          <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
            <div className="rounded-full bg-green-100 p-4 inline-block mb-4">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-800 mb-2">Bank Transfer Initiated</h2>
            <p className="text-green-700 mb-4">
              Your bank transfer has been initiated. We will confirm once the payment is received.
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Select Payment Method</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handlePayByCard}
                disabled={paymentMethod === "card"}
                className="rounded-lg border-2 border-[#ff4d00] p-4 text-center hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-2xl mb-2">💳</div>
                <div className="font-semibold text-[#ff4d00]">Pay by Card</div>
                <div className="text-sm text-gray-500">Credit / Debit Card</div>
              </button>
              <button
                onClick={handleBankTransfer}
                disabled={paymentMethod === "bank"}
                className="rounded-lg border-2 border-gray-200 p-4 text-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-2xl mb-2">🏦</div>
                <div className="font-semibold">Bank Transfer</div>
                <div className="text-sm text-gray-500">Wire Transfer</div>
              </button>
            </div>

            {paymentMethod === "card" && clientSecret && (
              <div className="mt-6">
                <StripeProvider clientSecret={clientSecret}>
                  <PayWithStripeElements
                    clientSecret={clientSecret}
                    piNumber={pi.pi_number}
                    amount={pi.total}
                    currency={pi.currency}
                  />
                </StripeProvider>
              </div>
            )}

            {paymentMethod === "card" && !clientSecret && (
              <div className="mt-6 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ff4d00] border-t-transparent mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Initializing payment...</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
