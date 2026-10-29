"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Pencil, X } from "lucide-react";

/**
 * Edit control for a customer.
 *
 * There is no customers table — a customer is derived from the PI rows that
 * share an identity — so saving writes the new contact details onto every
 * proforma invoice of that customer. One source of truth: fix a typo in the
 * customer name once and every invoice shows the corrected name.
 */

export interface CustomerEditable {
  id: string;
  customer_name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface CustomerEditDialogProps {
  customer: CustomerEditable;
  /** Called after a successful save. Receives the (possibly new) customer id. */
  onDone: (customerId: string) => void | Promise<void>;
  onClose: () => void;
}

export default function CustomerEditDialog({
  customer,
  onDone,
  onClose,
}: CustomerEditDialogProps) {
  const [name, setName] = useState(customer.customer_name ?? "");
  const [company, setCompany] = useState(customer.company ?? "");
  const [email, setEmail] = useState(customer.email ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [address, setAddress] = useState(customer.address ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, saving]);

  async function save() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/customers/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          customerName: name,
          customerCompany: company,
          customerEmail: email,
          customerPhone: phone,
          customerAddress: address,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        customerId?: string;
        error?: string;
        hint?: string;
      };
      if (!res.ok || !data.success) {
        setError(
          data.hint
            ? `${data.error || "Save failed"} — ${data.hint}`
            : data.error || `Save failed (${res.status})`
        );
        return;
      }
      await onDone(data.customerId ?? customer.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full border-2 border-black/20 bg-white px-3 py-2 text-sm text-black outline-none transition-colors focus:border-[#ff4d00] disabled:opacity-50";
  const labelClass = "mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#6b6b6b]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-edit-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="my-auto w-full max-w-lg border-2 border-black bg-white shadow-[8px_8px_0_0_rgba(255,77,0,1)]">
        <div className="flex items-start justify-between border-b-2 border-black bg-[#0a0a0a] px-5 py-3 text-white">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5" strokeWidth={2.5} />
            <h2 id="customer-edit-title" className="text-base font-black uppercase tracking-tight">
              Edit Customer
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-white hover:text-[#ff4d00] disabled:opacity-30"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="mb-4 border-l-2 border-[#ff4d00] bg-[#fff7f3] px-3 py-2 text-xs text-[#0a0a0a]">
            Changes are applied to every proforma invoice of this customer.
          </p>

          <div className="mb-4">
            <label className={labelClass} htmlFor="cust-name">
              Name
            </label>
            <input
              id="cust-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              autoFocus
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className={labelClass} htmlFor="cust-company">
              Company
            </label>
            <input
              id="cust-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={saving}
              className={inputClass}
            />
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="cust-email">
                Email
              </label>
              <input
                id="cust-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={saving}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="cust-phone">
                Phone
              </label>
              <input
                id="cust-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={saving}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className={labelClass} htmlFor="cust-address">
              Address
            </label>
            <textarea
              id="cust-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={saving}
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>

          {error && (
            <div className="mb-3 border-2 border-[#ff4d00] bg-white px-3 py-2 text-xs font-bold text-[#ff4d00]">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-neutral-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-[#ff4d00] px-4 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-[#e64500] disabled:opacity-40"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
                  Saving…
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
