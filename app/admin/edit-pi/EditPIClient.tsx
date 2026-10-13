"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, Save, ExternalLink, RefreshCw, Upload, X, Check, Copy, Eye, Ruler, AlertTriangle, Lock } from "lucide-react";

// ─── Inline types (same as NewPIClient) ─────────────────────────────────────
export const SUPPORTED_CURRENCIES = ["usd", "eur", "gbp", "cny"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export interface BankAccount {
  currency: string;
  label: string;
  symbol: string;
  beneficiary: string;
  companyAddress: string;
  bankName: string;
  account: string;
  swift: string;
  bankAddress: string;
  iban?: string;
  bankCountry?: string;
  routingNumber?: string;
  cnaps?: string;
  intermediaryBank?: string;
  notes?: string;
}

export const BANK_ACCOUNTS: Record<SupportedCurrency, BankAccount> = {
  usd: {
    currency: "usd",
    label: "USD — US Dollar",
    symbol: "$",
    beneficiary: "YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD",
    companyAddress: "2nd Floor, No.11 Anshang Road, Yiwu City, Jinhua, Zhejiang Province, China",
    bankName: "Agricultural Bank of China, Zhejiang Branch",
    account: "19648014040108531",
    swift: "ABOCCNBJ110",
    bankAddress: "No. 181 Binwang Road, Yiwu City, Jinhua, Zhejiang Province, China",
    notes: "Add reference: PI number (e.g. CR202610020002).",
  },
  eur: {
    currency: "eur",
    label: "EUR — Euro",
    symbol: "€",
    beneficiary: "YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD",
    companyAddress: "2nd Floor, No.11 Anshang Road, Yiwu City, Jinhua, Zhejiang Province, China",
    bankName: "Agricultural Bank of China, Zhejiang Branch",
    account: "19648014040108531",
    swift: "ABOCCNBJ110",
    bankAddress: "No. 181 Binwang Road, Yiwu City, Jinhua, Zhejiang Province, China",
    notes: "EUR wires may route via intermediary bank. Sender's bank may charge a fee; we receive net only.",
  },
  gbp: {
    currency: "gbp",
    label: "GBP — British Pound",
    symbol: "£",
    beneficiary: "YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD",
    companyAddress: "2nd Floor, No.11 Anshang Road, Yiwu City, Jinhua, Zhejiang Province, China",
    bankName: "Agricultural Bank of China, Zhejiang Branch",
    account: "19648014040108531",
    swift: "ABOCCNBJ110",
    bankAddress: "No. 181 Binwang Road, Yiwu City, Jinhua, Zhejiang Province, China",
    notes: "GBP wires via SWIFT; please add PI number in the wire reference.",
  },
  cny: {
    currency: "cny",
    label: "CNY — Chinese Yuan (RMB)",
    symbol: "¥",
    beneficiary: "义乌市好梦家居用品制造有限公司",
    companyAddress: "浙江省义乌市安商路11号二楼",
    bankName: "中国农业银行浙江省分行",
    account: "19648014040108531",
    swift: "ABOCCNBJ110",
    bankAddress: "浙江省金华市义乌市宾王路181号",
    cnaps: "103338671188",
    notes: "国内人民币电汇请使用CNAPS代码103338671188。",
  },
};

export function getBankAccount(currency: string | null | undefined): BankAccount {
  const key = (currency ?? "usd").toLowerCase() as SupportedCurrency;
  return BANK_ACCOUNTS[key] ?? BANK_ACCOUNTS.usd;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type SizeRow = { label: string; qty: number };

type LineItem = {
  description: string;
  fabric: string;
  qty: number;
  unit: string;
  unitPrice: number;
  imageUrl: string;
  hasSizeBreakdown: boolean;
  sizes: SizeRow[];
};

const SIZE_PRESETS: Record<string, SizeRow[]> = {
  "Adult Standard": [
    { label: "S", qty: 0 },
    { label: "M", qty: 0 },
    { label: "L", qty: 0 },
    { label: "XL", qty: 0 },
    { label: "2XL", qty: 0 },
  ],
  "Adult Plus": [
    { label: "2XL", qty: 0 },
    { label: "3XL", qty: 0 },
    { label: "4XL", qty: 0 },
    { label: "5XL", qty: 0 },
  ],
  "Kids Standard": [
    { label: "2T", qty: 0 },
    { label: "3T", qty: 0 },
    { label: "4T", qty: 0 },
    { label: "5", qty: 0 },
    { label: "6", qty: 0 },
    { label: "7", qty: 0 },
    { label: "8", qty: 0 },
    { label: "10", qty: 0 },
    { label: "12", qty: 0 },
  ],
  Custom: [],
};

const DEFAULT_TERMS_PAYMENT =
  "The buyer should pay 100% of payment amount 3 days after confirmation of the PI. The seller should arrange production after receiving the payment and approval of PP samples.";

// ---------------------------------------------------------------------------
// Module-level UI helpers
// ---------------------------------------------------------------------------
function BlackCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-2 py-1 text-sm ${className}`}>{children}</div>;
}

const RedInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full bg-white dark:bg-neutral-900 border-2 border-[#ff4d00] dark:border-[#ff4d00] rounded px-2 py-1 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff4d00]/30 ${props.className || ""}`}
  />
);

function BlueText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-[#0a6cff] font-medium ${className}`}>{children}</span>;
}

function RedReminder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mt-1 text-xs italic text-[#ff4d00] ${className}`}>
      {children}
    </div>
  );
}

const fmt = (dollars: number, symbol = "$") =>
  `${symbol}${dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function getItemQty(it: LineItem): number {
  if (!it.hasSizeBreakdown) return it.qty;
  return it.sizes.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);
}

function SizeBreakdownEditor({
  it,
  idx,
  onUpdateItem,
}: {
  it: LineItem;
  idx: number;
  onUpdateItem: (idx: number, patch: Partial<LineItem>) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1 font-bold text-[#ff4d00]">
          <Ruler className="w-3.5 h-3.5" />
          SIZE BREAKDOWN
        </span>
        <span className="text-neutral-500">
          QTY is auto-summed ({getItemQty(it).toLocaleString()} pcs)
        </span>
        <button
          type="button"
          onClick={() => onUpdateItem(idx, { hasSizeBreakdown: false, sizes: [] })}
          className="ml-auto text-neutral-500 hover:text-[#ff4d00] underline"
        >
          Turn off
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-500">Preset:</span>
        {Object.keys(SIZE_PRESETS).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onUpdateItem(idx, { sizes: SIZE_PRESETS[name].map((s) => ({ ...s })) })}
            className="px-2 py-1 rounded border border-[#ff4d00] text-[#ff4d00] hover:bg-[#ff4d00] hover:text-black transition-colors"
          >
            {name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {it.sizes.map((s, i) => (
          <div key={`${s.label}-${i}`} className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-2 py-1">
            <input
              type="text"
              value={s.label}
              onChange={(e) => {
                const next = [...it.sizes];
                next[i] = { ...next[i], label: e.target.value };
                onUpdateItem(idx, { sizes: next });
              }}
              className="w-14 bg-transparent text-center font-bold focus:outline-none"
              placeholder="Size"
            />
            <span className="text-neutral-400">×</span>
            <input
              type="number"
              min={0}
              value={s.qty}
              onChange={(e) => {
                const next = [...it.sizes];
                next[i] = { ...next[i], qty: parseInt(e.target.value) || 0 };
                onUpdateItem(idx, { sizes: next });
              }}
              className="w-16 bg-transparent text-center focus:outline-none"
              placeholder="0"
            />
            <button
              type="button"
              onClick={() => {
                const next = it.sizes.filter((_, j) => j !== i);
                onUpdateItem(idx, { sizes: next });
              }}
              className="text-neutral-400 hover:text-red-500"
              title="Remove size"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onUpdateItem(idx, { sizes: [...it.sizes, { label: "", qty: 0 }] })}
          className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded border border-dashed border-neutral-400 text-neutral-500 hover:border-[#ff4d00] hover:text-[#ff4d00]"
        >
          <Plus className="w-3.5 h-3.5" />
          Add size
        </button>
      </div>
    </div>
  );
}

export default function EditPIPage() {
  const searchParams = useSearchParams();
  const piNumberParam = searchParams.get("pi") ?? "";

  const [piNumber] = useState(piNumberParam);
  const [issueDate, setIssueDate] = useState("");
  const [leadTimeText, setLeadTimeText] = useState("Within 30 days");
  const [currency, setCurrency] = useState<SupportedCurrency>("usd");
  const [bankInfo, setBankInfo] = useState<BankAccount>(() => getBankAccount("usd"));
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
        const res = await fetch(`/api/pi/${encodeURIComponent(piNumberParam)}`, { cache: "no-store" });
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
          shippingCost?: number;
          paymentTermsText?: string;
          shippingTerm?: string;
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
        if (typeof data.shippingCost === "number") setShippingCost(data.shippingCost);
        if (data.paymentTermsText) setTermsPaymentText(data.paymentTermsText);
        if (data.shippingTerm) setShippingTerm(data.shippingTerm);
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
  const grandTotal = itemsSubtotal + shippingCost;

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

  function onItemImageFile(idx: number, file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result;
      if (typeof url === "string") {
        updateItem(idx, { imageUrl: url });
      }
    };
    reader.readAsDataURL(file);
  }

  async function onSave() {
    setError(null);
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
        piNumber?: string;
        paymentUrl?: string | null;
      };

      if (!data.success) {
        setError(data.error || "Save failed");
        return;
      }

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
          <Link href="/admin/summary/" className="text-sm font-bold text-[#ff4d00] hover:underline">
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
          <Link href="/admin/summary/" className="text-sm font-bold text-[#ff4d00] hover:underline">
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
          <PIPreview
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
            BlackCell={BlackCell}
            RedInput={RedInput}
            BlueText={BlueText}
            RedReminder={RedReminder}
          />
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {!savedLink && (
          <div className="mt-6 flex items-center justify-end gap-3 sticky bottom-4 bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800">
            <Link
              href="/admin/summary/"
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

// ─── PI Preview (same as NewPIClient but PI number is locked) ───────────────
export function PIPreview(props: {
  piNumber: string;
  piNumberLocked: boolean;
  issueDate: string;
  onIssueDateChange: (v: string) => void;
  leadTimeText: string;
  onLeadTimeChange: (v: string) => void;
  currency: SupportedCurrency;
  onCurrencyChange: (v: SupportedCurrency) => void;
  bank: ReturnType<typeof getBankAccount>;
  customerName: string;
  onCustomerNameChange: (v: string) => void;
  customerEmail: string;
  onCustomerEmailChange: (v: string) => void;
  customerCompany: string;
  onCustomerCompanyChange: (v: string) => void;
  customerAddress: string;
  onCustomerAddressChange: (v: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (v: string) => void;
  items: LineItem[];
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
  onUpdateItem: (idx: number, patch: Partial<LineItem>) => void;
  onItemImageFile: (idx: number, file: File) => void;
  fileInputRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;
  shippingLabel: string;
  onShippingLabelChange: (v: string) => void;
  shippingMethod: string;
  onShippingMethodChange: (v: string) => void;
  shippingQty: number;
  onShippingQtyChange: (v: number) => void;
  shippingCost: number;
  onShippingCostChange: (v: number) => void;
  itemsSubtotal: number;
  grandTotal: number;
  termsPaymentText: string;
  onTermsPaymentTextChange: (v: string) => void;
  shippingTerm: string;
  onShippingTermChange: (v: string) => void;
  BlackCell: React.FC<{ children: React.ReactNode; className?: string }>;
  RedInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>>;
  BlueText: React.FC<{ children: React.ReactNode }>;
  RedReminder: React.FC<{ children: React.ReactNode }>;
}) {
  const {
    piNumber, piNumberLocked,
    issueDate, onIssueDateChange, leadTimeText, onLeadTimeChange,
    currency, onCurrencyChange, bank,
    customerName, onCustomerNameChange, customerEmail, onCustomerEmailChange, customerCompany, onCustomerCompanyChange, customerAddress, onCustomerAddressChange, customerPhone, onCustomerPhoneChange,
    items, onAddItem, onRemoveItem, onUpdateItem, onItemImageFile, fileInputRefs,
    shippingLabel, onShippingLabelChange, shippingMethod, onShippingMethodChange,
    shippingQty, onShippingQtyChange, shippingCost, onShippingCostChange,
    itemsSubtotal, grandTotal,
    termsPaymentText, onTermsPaymentTextChange,
    shippingTerm, onShippingTermChange,
    BlackCell, RedInput, BlueText, RedReminder,
  } = props;
  const currencyUpper = currency.toUpperCase();

  return (
    <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
      {/* ── HEADER ── */}
      <div className="px-6 py-6 border-b-2 border-black dark:border-white">
        <div className="flex items-start gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="ChinaRhinestone"
            width={220}
            height={88}
            loading="eager"
            decoding="async"
            className="h-24 w-auto shrink-0 hover:scale-[1.01] transition-transform"
          />
          <div className="flex-1 pl-[6%]">
            <div className="text-lg font-bold tracking-wide whitespace-nowrap">
              YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD
            </div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
              ADD: 2nd Floor, No.11 Anshang Road, Yiwu City, China
            </div>
            <div className="text-3xl font-extrabold tracking-widest mt-4">
              PROFORMA INVOICE
            </div>
          </div>
        </div>
      </div>

      {/* ── FM + INVOICE INFO ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 p-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="space-y-1">
          <div className="flex gap-2">
            <BlackCell>FM:</BlackCell>
            <BlackCell>ChinaRhinestone.com</BlackCell>
          </div>
          <BlackCell>YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD</BlackCell>
          <BlackCell>2ND FLOOR, NO.11 ANSHANG ROAD, YIWU, CHINA</BlackCell>
          <BlackCell>Annt.: Miss Chris Ma / +86 19817930190 / chris@chinarhinestone.com</BlackCell>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BlackCell className="w-32 shrink-0">INVOICE NO.:</BlackCell>
            <div className="flex-1 flex items-center gap-2">
              <RedInput
                value={piNumber}
                disabled={piNumberLocked}
                className="opacity-70 cursor-not-allowed font-mono font-bold"
              />
              <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-600">read-only</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BlackCell className="w-32 shrink-0">ISSUE DATE:</BlackCell>
            <RedInput
              type="date"
              value={issueDate}
              onChange={(e) => onIssueDateChange(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <BlackCell className="w-32 shrink-0">LEAD TIME:</BlackCell>
            <RedInput
              value={leadTimeText}
              onChange={(e) => onLeadTimeChange(e.target.value)}
              placeholder="Within 30 days"
            />
          </div>
          <div className="flex items-center gap-2">
            <BlackCell className="w-32 shrink-0">CURRENCY:</BlackCell>
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as SupportedCurrency)}
              className="flex-1 bg-white dark:bg-neutral-900 border-2 border-[#00c2ff] rounded px-2 py-1 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/30"
            >
              {SUPPORTED_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code.toUpperCase()} — {code === "usd" ? "US Dollar" : code === "eur" ? "Euro" : code === "gbp" ? "British Pound" : "Chinese Yuan (RMB)"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── TO: block ── */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex gap-2 items-start">
          <BlackCell className="w-16 shrink-0 pt-1">TO:</BlackCell>
          <div className="flex-1 space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Contact Name <span className="text-red-500">*</span></div>
                <RedInput value={customerName} onChange={(e) => onCustomerNameChange(e.target.value)} placeholder="Contact name" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Company <span className="text-neutral-400">(optional)</span></div>
                <RedInput value={customerCompany} onChange={(e) => onCustomerCompanyChange(e.target.value)} placeholder="Company name" />
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Address</div>
              <RedInput value={customerAddress} onChange={(e) => onCustomerAddressChange(e.target.value)} placeholder="Shipping address" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Phone <span className="text-red-500">*</span></div>
                <RedInput value={customerPhone} onChange={(e) => onCustomerPhoneChange(e.target.value)} placeholder="Phone number" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Email <span className="text-neutral-400">(optional)</span></div>
                <RedInput type="email" value={customerEmail} onChange={(e) => onCustomerEmailChange(e.target.value)} placeholder="Email" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Items table ── */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-black dark:border-white text-sm">
            <thead>
              <tr className="bg-neutral-100 dark:bg-neutral-800">
                <th className="border border-black dark:border-white p-2 w-32 text-left">PRODUCT PICTURE</th>
                <th className="border border-black dark:border-white p-2 text-left">DESCRIPTION</th>
                <th className="border border-black dark:border-white p-2 text-left">FABRIC CONTENT</th>
                <th className="border border-black dark:border-white p-2 w-28 text-left">QTY / UNIT</th>
                <th className="border border-black dark:border-white p-2 w-24 text-left">PRICE ({bank.symbol})</th>
                <th className="border border-black dark:border-white p-2 w-28 text-left">TOTAL {currencyUpper}</th>
                <th className="border border-black dark:border-white p-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td className="border border-black dark:border-white p-1.5 align-top">
                    <div className="w-24 h-24 border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 relative overflow-hidden">
                      {it.imageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={it.imageUrl} alt="" width={96} height={96} loading="lazy" decoding="async" className="object-cover w-full h-full" />
                          <button onClick={() => onUpdateItem(idx, { imageUrl: "" })} className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-white rounded">
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => fileInputRefs.current[idx]?.click()} className="text-xs text-neutral-500 hover:text-[#ff4d00] flex flex-col items-center gap-1">
                          <Upload className="w-5 h-5" />
                          upload
                        </button>
                      )}
                      <input
                        ref={(el) => { fileInputRefs.current[idx] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onItemImageFile(idx, file);
                          e.target.value = "";
                        }}
                      />
                    </div>
                  </td>
                  <td className="border border-black dark:border-white p-1.5 align-top">
                    <textarea value={it.description} onChange={(e) => onUpdateItem(idx, { description: e.target.value })} rows={4} className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40" />
                  </td>
                  <td className="border border-black dark:border-white p-1.5 align-top">
                    <textarea value={it.fabric} onChange={(e) => onUpdateItem(idx, { fabric: e.target.value })} rows={4} className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40" />
                  </td>
                  <td className="border border-black dark:border-white p-1.5 align-top">
                    <div className="flex items-center gap-1">
                      {it.hasSizeBreakdown ? (
                        <div className="w-24 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-1 text-sm font-semibold text-center text-neutral-700 dark:text-neutral-200" title="Auto-summed from size breakdown below">
                          {getItemQty(it).toLocaleString()}
                        </div>
                      ) : (
                        <input type="number" min={1} value={it.qty} onChange={(e) => onUpdateItem(idx, { qty: parseInt(e.target.value) || 0 })} className="w-24 bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40" />
                      )}
                      <input type="text" value={it.unit} onChange={(e) => onUpdateItem(idx, { unit: e.target.value })} placeholder="set" className="w-16 bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40" />
                      {!it.hasSizeBreakdown && (
                        <button type="button" onClick={() => onUpdateItem(idx, { hasSizeBreakdown: true, sizes: SIZE_PRESETS["Adult Standard"].map((s) => ({ ...s })) })} className="text-neutral-400 hover:text-[#ff4d00]" title="Enable size breakdown">
                          <Ruler className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="border border-black dark:border-white p-1.5 align-top">
                    <div className="flex items-center">
                      <span className="text-sm mr-0.5">{bank.symbol}</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        defaultValue={it.unitPrice > 0 ? it.unitPrice.toString() : ""}
                        key={`price-${idx}-${items.length}-${items[idx]?.description ?? ""}`}
                        onBlur={(e) => {
                          const v = parseFloat(e.target.value || "0");
                          if (!isNaN(v) && v !== it.unitPrice) onUpdateItem(idx, { unitPrice: v });
                        }}
                        placeholder="0.000"
                        className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40"
                      />
                    </div>
                  </td>
                  <td className="border border-black dark:border-white p-1.5 align-top text-sm font-semibold">
                    {fmt(getItemQty(it) * it.unitPrice, bank.symbol)}
                  </td>
                  <td className="border border-black dark:border-white p-1.5 align-top text-center">
                    {items.length > 1 && (
                      <button onClick={() => onRemoveItem(idx)} className="text-neutral-400 hover:text-red-500" title="Remove item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {items.map((it, idx) =>
                it.hasSizeBreakdown ? (
                  <tr key={`sizes-${idx}`} className="bg-[#fff7f0] dark:bg-[#2a1a0e]">
                    <td colSpan={7} className="border border-black dark:border-white p-3 align-top">
                      <SizeBreakdownEditor it={it} idx={idx} onUpdateItem={onUpdateItem} />
                    </td>
                  </tr>
                ) : null
              )}

              {/* Shipping row */}
              <tr>
                <td className="border border-black dark:border-white p-1.5 align-top text-center text-xs text-neutral-500">—</td>
                <td className="border border-black dark:border-white p-1.5 align-top">
                  <input value={shippingLabel} onChange={(e) => onShippingLabelChange(e.target.value)} placeholder="Shipping Cost" className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40" />
                </td>
                <td className="border border-black dark:border-white p-1.5 align-top">
                  <input value={shippingMethod} onChange={(e) => onShippingMethodChange(e.target.value)} placeholder="DDP by AIR" className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40" />
                </td>
                <td className="border border-black dark:border-white p-1.5 align-top">
                  <input type="number" min={1} value={shippingQty} onChange={(e) => onShippingQtyChange(parseInt(e.target.value) || 1)} className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40" />
                </td>
                <td className="border border-black dark:border-white p-1.5 align-top">
                  <div className="flex items-center">
                    <span className="text-sm mr-0.5">{bank.symbol}</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      defaultValue={shippingCost.toFixed(2)}
                      key={`ship-cost-${shippingCost}`}
                      onBlur={(e) => {
                        const v = parseFloat(e.target.value || "0");
                        if (!isNaN(v) && v !== shippingCost) onShippingCostChange(v);
                      }}
                      placeholder="0.00"
                      className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40"
                    />
                  </div>
                </td>
                <td className="border border-black dark:border-white p-1.5 align-top text-sm font-semibold">{fmt(shippingQty * shippingCost, bank.symbol)}</td>
                <td className="border border-black dark:border-white p-1.5 align-top"></td>
              </tr>

              {/* TOTAL row */}
              <tr className="bg-neutral-100 dark:bg-neutral-800 font-bold">
                <td colSpan={5} className="border border-black dark:border-white p-2 text-right">TOTAL:</td>
                <td className="border border-black dark:border-white p-2 text-base">{fmt(grandTotal, bank.symbol)}</td>
                <td className="border border-black dark:border-white p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-between items-center text-sm">
          <button onClick={onAddItem} className="inline-flex items-center gap-1 text-[#ff4d00] hover:text-[#e64500] font-semibold">
            <Plus className="w-4 h-4" />
            Add item
          </button>
          <div className="text-neutral-500 text-xs">
            Subtotal: {fmt(itemsSubtotal, bank.symbol)} + Shipping: {fmt(shippingCost, bank.symbol)} = <strong className="text-black dark:text-white">{fmt(grandTotal, bank.symbol)}</strong>
          </div>
        </div>
      </div>

      {/* ── Terms ── */}
      <div className="p-6 space-y-1 border-b border-neutral-200 dark:border-neutral-800 text-sm">
        <div><strong>(1) Port of Loading:</strong> Yiwu / Ningbo / Shanghai or any designated Chinese ports</div>
        <div><strong>(2) Port of Destination:</strong> As Buyer address above</div>
        <div><strong>(3) Shipping Term:</strong>{" "}
          <select
            value={shippingTerm}
            onChange={(e) => onShippingTermChange(e.target.value)}
            className="ml-1 bg-white dark:bg-neutral-900 border-2 border-[#00c2ff] rounded px-2 py-0.5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/30"
          >
            <option value="DDP">DDP</option>
            <option value="FOB">FOB</option>
            <option value="EXW">EXW</option>
            <option value="CIF">CIF</option>
            <option value="DAP">DAP</option>
            <option value="DDU">DDU</option>
            <option value="CFR">CFR</option>
            <option value="CPT">CPT</option>
            <option value="CIP">CIP</option>
            <option value="DPU">DPU</option>
          </select>
        </div>
        <div className="pt-2">
          <strong>(4) Terms of Payment:</strong>
          <textarea
            value={termsPaymentText}
            onChange={(e) => onTermsPaymentTextChange(e.target.value)}
            rows={2}
            className="w-full mt-1 bg-white dark:bg-neutral-900 border-2 border-[#ff4d00] rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d00]/30"
          />
        </div>
      </div>

      {/* ── Bank Info ── */}
      <div className="p-6 space-y-2 border-b border-neutral-200 dark:border-neutral-800 text-sm">
        <div className="font-bold">BANK INFO:</div>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 items-start">
          <BlackCell>BENEFICIARY (COMPANY NAME):</BlackCell>
          <div>
            <BlueText>{bank.beneficiary}</BlueText>
            <RedReminder>The company name must be written in full.</RedReminder>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 items-start">
          <BlackCell>COMPANY ADDRESS:</BlackCell>
          <BlueText>{bank.companyAddress}</BlueText>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1">
          <BlackCell>BANK NAME:</BlackCell>
          <BlackCell>{bank.bankName}</BlackCell>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1">
          <BlackCell>BANK ACCOUNT:</BlackCell>
          <BlackCell>{bank.account}</BlackCell>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1">
          <BlackCell>BANK SWIFT CODE:</BlackCell>
          <BlackCell>{bank.swift}</BlackCell>
        </div>
        {bank.cnaps && (
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1">
            <BlackCell>CNAPS CODE:</BlackCell>
            <BlackCell>{bank.cnaps}</BlackCell>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1">
          <BlackCell>BANK ADDRESS:</BlackCell>
          <BlackCell>{bank.bankAddress}</BlackCell>
        </div>
        {bank.notes && (
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 items-start">
            <BlackCell>NOTES:</BlackCell>
            <span className="italic text-neutral-600 dark:text-neutral-400">{bank.notes}</span>
          </div>
        )}
      </div>

      {/* ── Clauses ── */}
      <div className="p-6 space-y-2 border-b border-neutral-200 dark:border-neutral-800 text-sm leading-relaxed">
        <div><strong>(5) Production Time:</strong> Normally about 45 days after order payment received and approval of PP samples.</div>
        <div className="pt-2">
          <strong>(6) Tolerance:</strong>
          <div className="pl-4 space-y-0.5">
            <div>Knitted Fabric GSM tolerance of +10gram and Size Measurement of +1.5 inch can be allowed and accepted.</div>
            <div>Quantity Tolerance: +5% can be accepted, seller should make up if the quantity less is more than 5%.</div>
            <div>2% - 3% of the defective products can be allowed and accepted.</div>
          </div>
        </div>
        <div className="pt-2">
          <strong>(7) Additional Clause:</strong>
          <div className="pl-4 space-y-0.5">
            <div>(a). Buyer confirm to have the commercial rights to reproduce the design.</div>
            <div>(b). Any loss caused by buyer's change in connection with the agreed contract will be on buyer's account.</div>
            <div>(c). The Seller should inform buyer to arrange the balance ONE week before the goods ready for shipment.</div>
            <div>(d). The contract effective date will be started since the seller receives the deposit from the buyer.</div>
            <div>(e). Force Majeure: In case of Force Majeure the Sellers shall not be responsible for delay in delivery.</div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="p-6 space-y-4 text-sm">
        <div>This contract is made out in two original copies, one copy to be held by each party in witness thereof.</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div>
            <div className="font-bold">Seller Stamp / Signature:</div>
            <div className="mt-8 border-b border-black dark:border-white w-3/4" />
            <div className="mt-1 text-sm">YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD</div>
          </div>
          <div>
            <div className="font-bold">Buyer Stamp / Signature:</div>
            <div className="mt-8 border-b border-black dark:border-white w-3/4" />
            <div className="mt-1 text-sm">{customerName || "(customer name)"}</div>
          </div>
        </div>
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
          <Link href="/admin/summary/" className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">
            Back to Summary
          </Link>
        </div>
      </div>
    </div>
  );
}
