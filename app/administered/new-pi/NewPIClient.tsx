"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Save, ExternalLink, Check, Copy, Eye } from "lucide-react";

// ─── Bank accounts ───────────────────────────────────────────────────────────
// Single source of truth lives in @/lib/bank-accounts (the real factory
// accounts, copied from the shared BANK Supabase project).
import {
  getBankAccount,
  bankAccountFromRow,
  SUPPORTED_CURRENCIES,
  type BankAccountInfo,
  type BankAccountRow,
  type SupportedCurrency,
} from "@/lib/bank-accounts";

export { BANK_ACCOUNTS, SUPPORTED_CURRENCIES, getBankAccount, bankAccountFromRow } from "@/lib/bank-accounts";
export type { BankAccountInfo, BankAccountRow, SupportedCurrency } from "@/lib/bank-accounts";

// ─── Shared PI document ──────────────────────────────────────────────────────
// The PI layout lives in one place: the customer-facing /pay page renders the
// very same component, so a browsed PI always looks like a freshly created one.
import PIDocument, {
  DEFAULT_TERMS_PAYMENT,
  getItemQty,
  type LineItem,
} from "@/components/pi/PIDocument";
import { fileToPiImageDataUrl, isStorableImage } from "@/lib/pi-image";

// ─── Inline FxRates type (adapted from @/lib/fx-rates) ──────────────────────
export interface FxRates {
  baseCurrency: string;
  rates: Record<string, number>;
  asOf: string;
  source: string;
}

type PrefillPayload = {
  pi_number?: string;
  issue_date?: string;
  lead_time_text?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  items?: Array<{
    description?: string;
    fabric?: string;
    qty?: number;
    unit?: string;
    unit_price?: number;
    image_url?: string;
    sizes?: { label: string; qty: number }[];
  }>;
  shipping_label?: string;
  shipping_method?: string;
  shipping_cost?: number;
  payment_terms_text?: string;
  total?: number;
};

function todayPiNumber() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  // Same shape the next_pi_number RPC produces (CRYYYYMMDDNNNN) so a
  // second PI on the same day never collides on UNIQUE(site_slug, pi_number).
  return `CR${yyyy}${mm}${dd}0001`;
}

function todayIsoDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/**
 * Turn a failed save response into something an operator can act on.
 *
 * The API answers with JSON that carries the exact missing configuration
 * (e.g. the Supabase env vars on the Cloudflare Pages project). Showing that
 * raw blob in the UI tells the operator nothing — spell it out instead.
 */
function describeSaveFailure(status: number, body: string): string {
  let parsed: {
    error?: string;
    diagnostic?: {
      mainUrlSet?: boolean;
      mainKeySet?: boolean;
      siteSlug?: string | null;
      expectedEnvVars?: Array<{ name: string; value: string }>;
      note?: string;
    };
  } | null = null;
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = null;
  }

  if (!parsed?.error) {
    // Cloudflare's own error pages ("error code: 1101") are not JSON.
    return `Save failed (${status}): ${body.slice(0, 300)}`;
  }

  const d = parsed.diagnostic;
  if (d && d.mainUrlSet === false) {
    return [
      "保存失败：Cloudflare Pages 尚未配置本网站的 Supabase 环境变量，PI 无法入库。",
      "",
      `缺少：${[
        !d.mainUrlSet ? "SUPABASE_URL" : null,
        !d.mainKeySet ? "SUPABASE_SERVICE_ROLE_KEY" : null,
        !d.siteSlug ? "SITE_SLUG" : null,
      ]
        .filter(Boolean)
        .join("、")}`,
      "",
      "操作步骤：",
      "1. 打开 Cloudflare Dashboard → Workers & Pages → chinarhinestone → Settings → Environment variables",
      "2. 在 Production 和 Preview 两个标签页都添加以下变量",
      ...(d.expectedEnvVars ?? []).map((v) => `   - ${v.name} = ${v.value}`),
      "3. 保存后点击 Retry deployment（改环境变量不会自动重新部署）",
      "4. 之后访问 /api/admin/pi-store-check 自检数据库结构",
    ].join("\n");
  }

  return `保存失败 (${status}): ${parsed.error}`;
}

export default function NewPIPage() {
  const [piNumber, setPiNumber] = useState(todayPiNumber());
  const [piNumberLocked, setPiNumberLocked] = useState(false);
  const [piSource, setPiSource] = useState<"auto" | "uploaded" | "manual">("auto");
  const [issueDate, setIssueDate] = useState(todayIsoDate());
  const [leadTimeText, setLeadTimeText] = useState("Within 30 days");

  const [currency, setCurrency] = useState<SupportedCurrency>("usd");
  const [bankInfo, setBankInfo] = useState<BankAccountInfo>(() => getBankAccount(currency));
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/bank-accounts", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { ok: boolean; accounts?: BankAccountRow[] };
        if (cancelled || !data.accounts) return;
        const row =
          data.accounts.find((r) => r.currency?.toUpperCase() === currency.toUpperCase()) ?? null;
        setBankInfo(bankAccountFromRow(row, currency));
      } catch {
        // network blip — keep hardcoded fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currency]);

  // TO: block
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Items
  const [items, setItems] = useState<LineItem[]>([
    { description: "", fabric: "", qty: 1, unit: "set", unitPrice: 0, imageUrl: "", hasSizeBreakdown: false, sizes: [] },
  ]);
  const [shippingLabel, setShippingLabel] = useState("Shipping Cost");
  const [shippingMethod, setShippingMethod] = useState("DDP by AIR");
  const [shippingQty, setShippingQty] = useState(1);
  const [shippingCost, setShippingCost] = useState(118);

  // Terms
  const [termsPaymentText, setTermsPaymentText] = useState(DEFAULT_TERMS_PAYMENT);

  // Saving
  const [saving, setSaving] = useState(false);
  const [savedLink, setSavedLink] = useState<string | null>(null);
  const [savedPiNumber, setSavedPiNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [piNumberReady, setPiNumberReady] = useState(false);

  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const hasEditedPiRef = useRef(false);

  const [shippingTerm, setShippingTerm] = useState("DDP");

  // ── Mount: fetch next PI number + handle prefill from upload ────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    const encoded = params.get("data");
    if (from === "upload" && encoded) {
      try {
        const json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
        const payload = JSON.parse(json) as PrefillPayload;
        applyPrefill(payload);
        window.history.replaceState({}, "", "/administered/new-pi/");
      } catch (e) {
        console.error("Prefill parse failed:", e);
      }
      return;
    }

    void fetchNextPiNumber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyPrefill(p: PrefillPayload) {
    if (p.pi_number) {
      setPiNumber(p.pi_number);
      setPiNumberLocked(true);
      setPiSource("uploaded");
      setPiNumberReady(true);
    }
    if (p.issue_date) setIssueDate(p.issue_date);
    if (p.lead_time_text) setLeadTimeText(p.lead_time_text);
    if (p.customer_name) setCustomerName(p.customer_name);
    if (p.customer_email) setCustomerEmail(p.customer_email);
    if (p.customer_address) setCustomerAddress(p.customer_address);
    if (p.customer_phone) setCustomerPhone(p.customer_phone);
    if (Array.isArray(p.items) && p.items.length > 0) {
      setItems(
        p.items.map((it) => ({
          description: it.description || "",
          fabric: it.fabric || "",
          qty: it.qty || 1,
          unit: it.unit || "set",
          unitPrice: it.unit_price ?? 0,
          imageUrl: it.image_url || "",
          hasSizeBreakdown: Array.isArray(it.sizes) && it.sizes.length > 0,
          sizes: Array.isArray(it.sizes)
            ? it.sizes.map((s: unknown) => ({ label: String((s as { label?: string }).label ?? ""), qty: Number((s as { qty?: number }).qty ?? 0) }))
            : [],
        })),
      );
    }
    if (p.shipping_label) setShippingLabel(p.shipping_label);
    if (p.shipping_method) setShippingMethod(p.shipping_method);
    if (typeof p.shipping_cost === "number") setShippingCost(p.shipping_cost);
    if (p.payment_terms_text) setTermsPaymentText(p.payment_terms_text);
  }

  async function fetchNextPiNumber() {
    try {
      const res = await fetch("/api/pi/next-number", { method: "GET" });
      if (!res.ok) {
        setPiNumberReady(true);
        return;
      }
      const data = (await res.json()) as { ok?: boolean; pi_number?: string; next?: string };
      const next = data.pi_number || data.next;
      if (next && !hasEditedPiRef.current) {
        setPiNumber(next);
      }
    } catch {
      // dev environment
    } finally {
      setPiNumberReady(true);
    }
  }

  const itemsSubtotal = useMemo(
    () => items.reduce((sum, it) => sum + getItemQty(it) * it.unitPrice, 0),
    [items],
  );
  const shippingTotal = shippingQty * shippingCost;
  const grandTotal = itemsSubtotal + shippingTotal;

  function onPiNumberChange(v: string) {
    hasEditedPiRef.current = true;
    setPiNumber(v);
    setPiSource("manual");
    setPiNumberLocked(false);
  }

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
    setSavedPiNumber(null);

    if (!customerName.trim()) {
      setError("Contact name is required");
      return;
    }
    if (!customerPhone.trim()) {
      setError("Customer phone is required");
      return;
    }
    if (!piNumber.trim()) {
      setError("PI number is required");
      return;
    }
    if (items.length === 0 || items.every((it) => !it.description.trim())) {
      setError("At least one item with a description is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/pi/create", {
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
                item.sizes = it.sizes.map((s) => ({
                  label: s.label,
                  qty: Number(s.qty) || 0,
                }));
              }
              return item;
            }),
          shippingLabel: shippingLabel.trim() || undefined,
          shippingMethod: shippingMethod.trim() || undefined,
          shippingQty: Number(shippingQty) || 1,
          shippingTerm: shippingTerm.trim() || undefined,
          shippingCost: Number(shippingCost) || 0,
          currency: currency.toUpperCase(),
          notes: termsPaymentText || undefined,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        setError(describeSaveFailure(res.status, txt));
        return;
      }

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        warning?: string;
        id?: number;
        piNumber?: string;
        total?: number;
        currency?: string;
        clientSecret?: string | null;
        paymentIntentId?: string | null;
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
      setSavedPiNumber(data.piNumber || piNumber.trim());
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

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 py-8 px-4">
      <h1 className="sr-only">New Proforma Invoice — Manual Entry</h1>
      <div className="max-w-5xl mx-auto">
        {savedLink ? (
          <SuccessPanel
            link={savedLink}
            piNumber={savedPiNumber ?? piNumber}
            customerName={customerName}
            total={grandTotal}
            itemCount={items.length}
            currency={bankInfo.symbol}
            currencyCode={currency.toUpperCase()}
            copied={copied}
            onCopy={copyLink}
            onNew={() => window.location.reload()}
          />
        ) : (
          <PIDocument
            piNumber={piNumber}
            piSource={piSource}
            piNumberLocked={piNumberLocked}
            onPiNumberChange={onPiNumberChange}
            onRefreshPi={fetchNextPiNumber}
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
            <button
              onClick={onSave}
              disabled={saving || !piNumberReady}
              title={!piNumberReady ? "Fetching the next available PI number from the server…" : undefined}
              className="inline-flex items-center gap-2 px-6 py-2 bg-[#ff4d00] hover:bg-[#e64500] disabled:opacity-50 text-black rounded font-semibold"
            >
              <Save className="w-4 h-4" />
              {saving
                ? "Saving…"
                : !piNumberReady
                ? "Fetching PI number…"
                : "Save PI & get payment link"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SuccessPanel({
  link, piNumber, customerName, total, itemCount, currency, currencyCode, copied, onCopy, onNew,
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
  onNew: () => void;
}) {
  const previewUrl = typeof window !== "undefined" ? `${window.location.origin}${link}` : link;
  return (
    <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
      {/* Success banner */}
      <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 px-6 py-4 flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white shrink-0">
          <Check className="w-5 h-5" strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-green-900 dark:text-green-100">PI {piNumber} saved successfully</h2>
          <p className="text-sm text-green-700 dark:text-green-300">Stored in Supabase — share the link below to receive payment</p>
        </div>
      </div>

      <div className="p-8 text-center">
        {/* Quick summary */}
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
            <div className="font-bold text-[#ff4d00] text-base mt-0.5">
              {currency} {total.toFixed(2)} {currencyCode}
            </div>
          </div>
        </div>

        {/* Link */}
        <div className="flex items-center gap-2 max-w-2xl mx-auto mb-6">
          <input
            readOnly
            value={previewUrl}
            className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded bg-neutral-50 dark:bg-neutral-800 text-sm"
          />
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1 px-4 py-2 bg-[#ff4d00] hover:bg-[#e64500] text-black rounded text-sm font-semibold"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-center flex-wrap gap-3">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-4 py-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white rounded text-sm font-semibold"
          >
            <Eye className="w-4 h-4" />
            Preview PI
          </a>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <ExternalLink className="w-4 h-4" />
            Open in new tab
          </a>
          <button
            onClick={onNew}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Create another PI
          </button>
        </div>
      </div>
    </div>
  );
}
