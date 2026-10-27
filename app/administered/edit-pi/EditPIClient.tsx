"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Save, ExternalLink, RefreshCw, Check, Copy, Eye, AlertTriangle, Lock } from "lucide-react";

// ─── Bank accounts ───────────────────────────────────────────────────────────
// Single source of truth lives in @/lib/bank-accounts (the real factory
// accounts, copied from the shared BANK Supabase project).
import {
  getBankAccount,
  SUPPORTED_CURRENCIES,
  type BankAccountInfo,
  type SupportedCurrency,
} from "@/lib/bank-accounts";

export { BANK_ACCOUNTS, SUPPORTED_CURRENCIES, getBankAccount } from "@/lib/bank-accounts";
export type { BankAccountInfo, BankAccountRow, SupportedCurrency } from "@/lib/bank-accounts";

// ─── Shared PI document ──────────────────────────────────────────────────────
// Same component the customer sees on /pay, so an edited PI keeps the exact
// format it was created with.
import PIDocument, {
  DEFAULT_TERMS_PAYMENT,
  getItemQty,
  type LineItem,
} from "@/components/pi/PIDocument";
import { fileToPiImageDataUrl, isStorableImage } from "@/lib/pi-image";

export default function EditPIPage() {
  const searchParams = useSearchParams();
  const piNumberParam = searchParams.get("pi") ?? "";

  const [piNumber] = useState(piNumberParam);
  const [issueDate, setIssueDate] = useState("");
  const [leadTimeText, setLeadTimeText] = useState("Within 30 days");
  const [currency, setCurrency] = useState<SupportedCurrency>("usd");
  const [bankInfo, setBankInfo] = useState<BankAccountInfo>(() => getBankAccount("usd"));
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", fabric: "", qty: 1, unit: "set", unitPrice: 0, imageUrl: "", hasSizeBreakdown: false, sizes: [] },
  ]);
  const [shippingLabel, setShippingLabel] = useState("Shipping Cost");
  const [shippingMethod, setShippingMethod] = useState("DDP by AIR");
  const [shippingQty, setShippingQty] = useState(1);
  const [shippingCost, setShippingCost] = useState(118);
  const [termsPaymentText, setTermsPaymentText] = useState(DEFAULT_TERMS_PAYMENT);
  const [shippingTerm, setShippingTerm] = useState("DDP");

  const [saving, setSaving] = useState(false);
  const [savedLink, setSavedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [locked, setLocked] = useState(false);

  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // ── Load PI from API ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!piNumberParam) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/pi/${encodeURIComponent(piNumberParam)}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
          } else {
            setError(`Load failed (${res.status})`);
          }
          return;
        }
        const data = (await res.json()) as {
          piNumber?: string;
          issueDate?: string;
          leadTimeText?: string;
          customerName?: string;
          customerEmail?: string;
          customerCompany?: string;
          customerAddress?: string;
          customerPhone?: string;
          items?: Array<{
            description?: string;
            fabric?: string;
            qty?: number;
            unit?: string;
            unitPrice?: number;
            imageUrl?: string;
            sizes?: { label: string; qty: number }[];
          }>;
          shippingLabel?: string;
          shippingMethod?: string;
          shippingQty?: number;
          shippingTerm?: string;
          shippingCost?: number;
          paymentTermsText?: string;
          currency?: string;
          status?: string;
        };

        if (cancelled) return;

        const status = (data.status || "draft").toLowerCase();
        if (status !== "draft" && status !== "sent") {
          setLocked(true);
          return;
        }

        if (data.issueDate) setIssueDate(data.issueDate);
        if (data.leadTimeText) setLeadTimeText(data.leadTimeText);
        if (data.customerName) setCustomerName(data.customerName);
        if (data.customerEmail) setCustomerEmail(data.customerEmail);
        if (data.customerCompany) setCustomerCompany(data.customerCompany);
        if (data.customerAddress) setCustomerAddress(data.customerAddress);
        if (data.customerPhone) setCustomerPhone(data.customerPhone);
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(
            data.items.map((it) => ({
              description: it.description || "",
              fabric: it.fabric || "",
              qty: it.qty || 1,
              unit: it.unit || "set",
              unitPrice: it.unitPrice ?? 0,
              imageUrl: it.imageUrl || "",
              hasSizeBreakdown: Array.isArray(it.sizes) && it.sizes.length > 0,
              sizes: Array.isArray(it.sizes)
                ? it.sizes.map((s) => ({ label: String(s.label ?? ""), qty: Number(s.qty ?? 0) }))
                : [],
            })),
          );
        }
        if (data.shippingLabel) setShippingLabel(data.shippingLabel);
        if (data.shippingMethod) setShippingMethod(data.shippingMethod);
        if (typeof data.shippingQty === "number" && data.shippingQty > 0) setShippingQty(data.shippingQty);
        if (data.shippingTerm) setShippingTerm(data.shippingTerm);
        if (typeof data.shippingCost === "number") setShippingCost(data.shippingCost);
        if (data.paymentTermsText) setTermsPaymentText(data.paymentTermsText);
        if (data.currency) {
          const c = data.currency as SupportedCurrency;
          setCurrency(SUPPORTED_CURRENCIES.includes(c) ? c : "usd");
          setBankInfo(getBankAccount(c));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [piNumberParam]);

  const itemsSubtotal = useMemo(
    () => items.reduce((sum, it) => sum + getItemQty(it) * it.unitPrice, 0),
    [items],
  );
  const grandTotal = itemsSubtotal + shippingCost * shippingQty;

  function addItem() {
    setItems([
      ...items,
      { description: "", fabric: "", qty: 1, unit: "set", unitPrice: 0, imageUrl: "", hasSizeBreakdown: false, sizes: [] },
    ]);
  }

  function removeItem(idx: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  async function onItemImageFile(idx: number, file: File) {
    setImageError(null);
    try {
      const url = await fileToPiImageDataUrl(file);
      if (!isStorableImage(url)) {
        setImageError(
          "This picture is too large to store. Please upload a smaller image (under 1 MB).",
        );
        return;
      }
      updateItem(idx, { imageUrl: url });
    } catch (e) {
      setImageError(
        e instanceof Error
          ? e.message
          : "This picture could not be processed. Please try another file.",
      );
    }
  }

  async function onSave() {
    setError(null);
    setImageError(null);
    setSaveWarning(null);
    setSavedLink(null);

    if (!customerName.trim()) { setError("Contact name is required"); return; }
    if (!customerPhone.trim()) { setError("Customer phone is required"); return; }
    if (!piNumber.trim()) { setError("PI number is required"); return; }
    if (items.length === 0 || items.every((it) => !it.description.trim())) {
      setError("At least one item with a description is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/pi/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          piNumber: piNumber.trim(),
          issueDate: issueDate || undefined,
          leadTimeText: leadTimeText || undefined,
          paymentTermsText: termsPaymentText || undefined,
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim() || undefined,
            company: customerCompany.trim() || undefined,
            address: customerAddress.trim() || undefined,
          },
          items: items
            .filter((it) => it.description.trim())
            .map((it) => {
              const item: Record<string, unknown> = {
                description: it.description.trim(),
                fabric: it.fabric.trim() || undefined,
                quantity: getItemQty(it),
                unit: it.unit.trim() || undefined,
                unitPrice: Number(it.unitPrice) || 0,
                imageUrl: it.imageUrl || undefined,
              };
              if (it.hasSizeBreakdown && it.sizes.length > 0) {
                item.sizes = it.sizes.map((s) => ({ label: s.label, qty: Number(s.qty) || 0 }));
              }
              return item;
            }),
          shippingLabel: shippingLabel.trim() || undefined,
          shippingMethod: shippingMethod.trim() || undefined,
          shippingQty: shippingQty,
          shippingTerm: shippingTerm,
          shippingCost: Number(shippingCost) || 0,
          currency,
          notes: termsPaymentText || undefined,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        setError(`Save failed (${res.status}): ${txt}`);
        return;
      }

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        warning?: string;
        piNumber?: string;
        paymentUrl?: string | null;
      };

      if (!data.success) {
        setError(data.error || "Save failed");
        return;
      }

      // The server reports rows whose picture did not fit into storage. The PI
      // is saved, but the admin has to know the artwork is missing.
      if (data.warning) setSaveWarning(data.warning);

      const publicPiLink = data.paymentUrl || `/pay/?pi=${encodeURIComponent(piNumber.trim())}`;
      setSavedLink(publicPiLink);
    } catch (e) {
      setError(`Network error: ${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setSaving(false);
    }
  }

  function copyLink() {
    if (!savedLink) return;
    const full = `${window.location.origin}${savedLink}`;
    void navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Locked / not-found / loading states ─────────────────────────────────
  if (locked) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 border-2 border-black rounded-lg p-8 max-w-md text-center shadow-[6px_6px_0_0_rgba(10,10,10,1)]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black mb-2">PI {piNumber} is locked</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Only PIs with status <strong>draft</strong> or <strong>sent</strong> can be edited.
          </p>
          <Link href="/administered/summary/" className="text-sm font-bold text-[#ff4d00] hover:underline">
            ← Back to PI Summary
          </Link>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 border-2 border-black rounded-lg p-8 max-w-md text-center shadow-[6px_6px_0_0_rgba(10,10,10,1)]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black mb-2">PI not found</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            No PI with number <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">{piNumberParam}</code> was found.
          </p>
          <Link href="/administered/summary/" className="text-sm font-bold text-[#ff4d00] hover:underline">
            ← Back to PI Summary
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#ff4d00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 py-8 px-4">
      <h1 className="sr-only">Edit Proforma Invoice {piNumber}</h1>
      <div className="max-w-5xl mx-auto">
        {savedLink ? (
          <SuccessPanel
            link={savedLink}
            piNumber={piNumber}
            customerName={customerName}
            total={grandTotal}
            itemCount={items.length}
            currency={bankInfo.symbol}
            currencyCode={currency.toUpperCase()}
            copied={copied}
            onCopy={copyLink}
          />
        ) : (
          <PIDocument
            piNumber={piNumber}
            piNumberLocked={true}
            issueDate={issueDate}
            onIssueDateChange={setIssueDate}
            leadTimeText={leadTimeText}
            onLeadTimeChange={setLeadTimeText}
            currency={currency}
            onCurrencyChange={setCurrency}
            bank={bankInfo}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            customerEmail={customerEmail}
            onCustomerEmailChange={setCustomerEmail}
            customerCompany={customerCompany}
            onCustomerCompanyChange={setCustomerCompany}
            customerAddress={customerAddress}
            onCustomerAddressChange={setCustomerAddress}
            customerPhone={customerPhone}
            onCustomerPhoneChange={setCustomerPhone}
            items={items}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
            onItemImageFile={onItemImageFile}
            fileInputRefs={fileInputRefs}
            shippingLabel={shippingLabel}
            onShippingLabelChange={setShippingLabel}
            shippingMethod={shippingMethod}
            onShippingMethodChange={setShippingMethod}
            shippingQty={shippingQty}
            onShippingQtyChange={setShippingQty}
            shippingCost={shippingCost}
            onShippingCostChange={setShippingCost}
            itemsSubtotal={itemsSubtotal}
            grandTotal={grandTotal}
            termsPaymentText={termsPaymentText}
            onTermsPaymentTextChange={setTermsPaymentText}
            shippingTerm={shippingTerm}
            onShippingTermChange={setShippingTerm}
          />
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {imageError && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded text-amber-800 dark:text-amber-200 text-sm">
            {imageError}
          </div>
        )}

        {saveWarning && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded text-amber-800 dark:text-amber-200 text-sm">
            {saveWarning}
          </div>
        )}

        {!savedLink && (
          <div className="mt-6 flex items-center justify-end gap-3 sticky bottom-4 bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800">
            <Link
              href="/administered/summary/"
              className="px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              Cancel
            </Link>
            <button
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-[#ff4d00] hover:bg-[#e64500] disabled:opacity-50 text-black rounded font-semibold"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
function SuccessPanel({
  link, piNumber, customerName, total, itemCount, currency, currencyCode, copied, onCopy,
}: {
  link: string;
  piNumber: string;
  customerName: string;
  total: number;
  itemCount: number;
  currency: string;
  currencyCode: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const previewUrl = typeof window !== "undefined" ? `${window.location.origin}${link}` : link;
  return (
    <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
      <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 px-6 py-4 flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white shrink-0">
          <Check className="w-5 h-5" strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-green-900 dark:text-green-100">PI {piNumber} updated successfully</h2>
          <p className="text-sm text-green-700 dark:text-green-300">Changes saved to Supabase</p>
        </div>
      </div>

      <div className="p-8 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-6 text-left">
          <div>
            <div className="text-xs uppercase text-neutral-500 tracking-wide">PI Number</div>
            <div className="font-mono font-bold text-base mt-0.5">{piNumber}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-neutral-500 tracking-wide">Customer</div>
            <div className="font-semibold mt-0.5 truncate">{customerName || "—"}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-neutral-500 tracking-wide">Items</div>
            <div className="font-semibold mt-0.5">{itemCount}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-neutral-500 tracking-wide">Total</div>
            <div className="font-bold text-[#ff4d00] text-base mt-0.5">{currency} {total.toFixed(2)} {currencyCode}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 max-w-2xl mx-auto mb-6">
          <input readOnly value={previewUrl} className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded bg-neutral-50 dark:bg-neutral-800 text-sm" />
          <button onClick={onCopy} className="inline-flex items-center gap-1 px-4 py-2 bg-[#ff4d00] hover:bg-[#e64500] text-black rounded text-sm font-semibold">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="flex justify-center flex-wrap gap-3">
          <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-4 py-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white rounded text-sm font-semibold">
            <Eye className="w-4 h-4" />
            Preview PI
          </a>
          <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <ExternalLink className="w-4 h-4" />
            Open in new tab
          </a>
          <Link href="/administered/summary/" className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">
            Back to Summary
          </Link>
        </div>
      </div>
    </div>
  );
}
