"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, RefreshCw, Undo2, X, AlertTriangle } from "lucide-react";

/**
 * Mark Paid / Revert control for the admin PI lists.
 *
 * A customer who pays by bank transfer never triggers a Stripe webhook, so
 * the invoice would sit at "awaiting payment" forever. This button lets the
 * owner record that the money arrived.
 *
 * The owner has to type the PI number before the state change is applied —
 * the same confirmation pattern the delete dialog uses.
 */

interface MarkPaidControlProps {
  piNumber: string;
  status: string | null;
  customerName?: string | null;
  totalDisplay?: string;
  /** "sm" for the compact dashboard module, "md" for the overview table. */
  size?: "sm" | "md";
  /** Called after a successful state change so the list can refresh. */
  onDone?: () => void | Promise<void>;
}

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "stripe", label: "Stripe (manual check)" },
  { value: "manual", label: "Manual / other" },
] as const;

export default function MarkPaidControl({
  piNumber,
  status,
  customerName,
  totalDisplay,
  size = "md",
  onDone,
}: MarkPaidControlProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPaid = (status || "").toLowerCase() === "paid";
  const isClosed =
    ["cancelled", "canceled", "refunded"].includes((status || "").toLowerCase());

  useEffect(() => {
    if (open) {
      setTyped("");
      setError(null);
      setReference("");
      setPaymentMethod("bank_transfer");
    }
  }, [open, piNumber]);

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          piNumber,
          paid: !isPaid,
          ...(isPaid ? {} : { paymentMethod, reference: reference.trim() || undefined }),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        hint?: string;
      };
      if (!res.ok || !data.success) {
        setError(
          data.hint
            ? `${data.error || "Update failed"} — ${data.hint}`
            : data.error || `Update failed (${res.status})`
        );
        return;
      }
      setOpen(false);
      await onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  const sm = size === "sm";
  const buttonClass = sm
    ? "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
    : "inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider";
  const iconClass = sm ? "h-3 w-3" : "h-3.5 w-3.5";

  if (isClosed) {
    return (
      <span
        className={`${buttonClass} cursor-not-allowed text-[#c0c0c0]`}
        title={`This PI is ${status}. It cannot be marked as paid.`}
      >
        <BadgeCheck className={iconClass} strokeWidth={2.5} />
        N/A
      </span>
    );
  }

  return (
    <>
      {isPaid ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${buttonClass} text-[#6b6b6b] hover:text-[#ff4d00]`}
          title={`Undo the manual payment mark on PI ${piNumber}`}
        >
          <Undo2 className={iconClass} strokeWidth={2.5} />
          Revert
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${buttonClass} text-black hover:text-[#ff4d00]`}
          title={`Mark PI ${piNumber} as paid (e.g. bank transfer received)`}
        >
          <BadgeCheck className={iconClass} strokeWidth={2.5} />
          Mark paid
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mark-paid-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) setOpen(false);
          }}
        >
          <div className="w-full max-w-md border-2 border-black bg-white shadow-[8px_8px_0_0_rgba(0,194,255,1)]">
            <div className="flex items-start justify-between border-b-2 border-black bg-[#00c2ff] px-5 py-3 text-black">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5" strokeWidth={2.5} />
                <h2 id="mark-paid-modal-title" className="text-base font-black uppercase tracking-tight">
                  {isPaid ? "Revert payment mark?" : "Mark this PI as paid?"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={submitting}
                className="text-black hover:opacity-70 disabled:opacity-30"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="mb-4 text-sm text-[#0a0a0a]">
                {isPaid
                  ? "This will move the PI back to SENT and clear the paid date and payment method."
                  : "Use this when the money has arrived outside of Stripe, for example a bank transfer."}
              </p>

              <dl className="mb-5 space-y-1 border-l-2 border-[#00c2ff] bg-[#f2fbff] px-3 py-2 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="font-black uppercase tracking-wider text-[#6b6b6b]">PI Number</dt>
                  <dd className="font-bold">{piNumber}</dd>
                </div>
                {customerName !== undefined && (
                  <div className="flex justify-between gap-3">
                    <dt className="font-black uppercase tracking-wider text-[#6b6b6b]">Customer</dt>
                    <dd className="font-bold">{customerName || "—"}</dd>
                  </div>
                )}
                {totalDisplay !== undefined && (
                  <div className="flex justify-between gap-3">
                    <dt className="font-black uppercase tracking-wider text-[#6b6b6b]">Total</dt>
                    <dd className="font-bold">{totalDisplay}</dd>
                  </div>
                )}
              </dl>

              {!isPaid && (
                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#6b6b6b]">
                      Payment method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={submitting}
                      className="w-full border-2 border-black bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/40 disabled:opacity-50"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#6b6b6b]">
                      Reference (optional)
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      disabled={submitting}
                      placeholder="Wire / SWIFT ref."
                      className="w-full border-2 border-black bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/40 disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#6b6b6b]">
                Type <code className="rounded bg-[#0a0a0a] px-1.5 py-0.5 text-[10px] text-white">{piNumber}</code> to confirm
              </label>
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={submitting}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                placeholder={piNumber}
                className="mb-2 w-full border-2 border-black bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/40 disabled:opacity-50"
              />

              {error && (
                <div className="mb-3 flex items-start gap-2 border-2 border-[#ff4d00] bg-white px-3 py-2 text-xs font-bold text-[#ff4d00]">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-neutral-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={typed.trim() !== piNumber || submitting}
                  className="inline-flex items-center gap-1.5 bg-[#00c2ff] px-4 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-[#00a9e0] disabled:opacity-40"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
                      Saving…
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                      {isPaid ? "Revert to sent" : "Mark as paid"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
