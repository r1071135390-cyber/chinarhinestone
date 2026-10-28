"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Trash2, X, AlertTriangle, Lock } from "lucide-react";

/**
 * Delete control for the admin PI lists.
 *
 * Used to clear out invoices that were never valid — abandoned drafts,
 * duplicates, invoices the customer walked away from. A paid invoice is
 * protected: the money has to be refunded first.
 *
 * The owner has to type the PI number before the invoice is removed.
 */

interface DeleteControlProps {
  piNumber: string;
  status: string | null;
  customerName?: string | null;
  totalDisplay?: string;
  /** "sm" for the compact dashboard module, "md" for the overview table. */
  size?: "sm" | "md";
  /** Called after a successful delete so the list can refresh. */
  onDone?: () => void | Promise<void>;
}

export default function DeleteControl({
  piNumber,
  status,
  customerName,
  totalDisplay,
  size = "md",
  onDone,
}: DeleteControlProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPaid = (status || "").toLowerCase() === "paid";

  useEffect(() => {
    if (open) {
      setTyped("");
      setError(null);
    }
  }, [open, piNumber]);

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ piNumber }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        hint?: string;
      };
      if (!res.ok || !data.success) {
        setError(
          data.hint
            ? `${data.error || "Delete failed"} — ${data.hint}`
            : data.error || `Delete failed (${res.status})`
        );
        return;
      }
      setOpen(false);
      await onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setDeleting(false);
    }
  }

  const sm = size === "sm";
  const buttonClass = sm
    ? "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
    : "inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider";
  const iconClass = sm ? "h-3 w-3" : "h-3.5 w-3.5";

  if (isPaid) {
    return (
      <span
        className={`${buttonClass} cursor-not-allowed text-[#c0c0c0]`}
        title="Paid PIs cannot be deleted. Refund via Stripe Dashboard first."
      >
        <Lock className={iconClass} strokeWidth={2.5} />
        Locked
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${buttonClass} text-[#6b6b6b] hover:text-[#ff4d00]`}
        title={`Delete PI ${piNumber}`}
      >
        <Trash2 className={iconClass} strokeWidth={2.5} />
        Delete
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) setOpen(false);
          }}
        >
          <div className="w-full max-w-md border-2 border-black bg-white shadow-[8px_8px_0_0_rgba(255,77,0,1)]">
            <div className="flex items-start justify-between border-b-2 border-black bg-[#ff4d00] px-5 py-3 text-black">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" strokeWidth={2.5} />
                <h2 id="delete-modal-title" className="text-base font-black uppercase tracking-tight">
                  Delete this PI?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="text-black hover:opacity-70 disabled:opacity-30"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="mb-4 text-sm text-[#0a0a0a]">
                You are about to permanently delete this proforma invoice. This cannot be undone.
              </p>

              <dl className="mb-5 space-y-1 border-l-2 border-[#ff4d00] bg-[#fff7f3] px-3 py-2 text-xs">
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
                <div className="flex justify-between gap-3">
                  <dt className="font-black uppercase tracking-wider text-[#6b6b6b]">Status</dt>
                  <dd className="font-bold uppercase">{status || "draft"}</dd>
                </div>
              </dl>

              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#6b6b6b]">
                Type <code className="rounded bg-[#0a0a0a] px-1.5 py-0.5 text-[10px] text-white">{piNumber}</code> to confirm
              </label>
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={deleting}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                placeholder={piNumber}
                className="mb-2 w-full border-2 border-black bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d00]/40 disabled:opacity-50"
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
                  disabled={deleting}
                  className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-neutral-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={typed.trim() !== piNumber || deleting}
                  className="inline-flex items-center gap-1.5 bg-[#ff4d00] px-4 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-[#e64500] disabled:opacity-40"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Delete permanently
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
