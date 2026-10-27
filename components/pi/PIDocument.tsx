"use client";

/**
 * components/pi/PIDocument.tsx
 *
 * The one and only Proforma Invoice layout in this project.
 *
 * It is used by three pages:
 *   - app/administered/new-pi  (editable form, all handlers provided)
 *   - app/administered/edit-pi  (editable form, PI number locked)
 *   - components/pi/PIDisplay   (read-only, customer-facing /pay page)
 *
 * Because the customer-facing document renders this exact component, the
 * PI a customer sees is guaranteed to have the same format as the PI the
 * admin creates — same header, same invoice-info block, same item table,
 * same terms, same bank info, same clauses.
 *
 * Read-only mode is decided by the presence of the change handlers: a field
 * with no handler renders as plain text instead of an input.
 */

import { useRef } from "react";
import { Plus, Trash2, RefreshCw, Upload, X, Ruler } from "lucide-react";
import { SUPPORTED_CURRENCIES, type BankAccountInfo, type SupportedCurrency } from "@/lib/bank-accounts";
import { getItemQty, type LineItem, type SizeRow } from "@/lib/pi-item";
import {
  BANK_LABEL_ACCOUNT,
  BANK_LABEL_BANK_ADDRESS,
  BANK_LABEL_BANK_NAME,
  BANK_LABEL_BENEFICIARY,
  BANK_LABEL_CNAPS,
  BANK_LABEL_COMPANY_ADDRESS,
  BANK_LABEL_NOTES,
  BANK_LABEL_SWIFT,
  BENEFICIARY_REMINDER,
  CLAUSE_ADDITIONAL_ITEMS,
  CLAUSE_PRODUCTION_TIME,
  CLAUSE_TOLERANCE_ITEMS,
  CONTRACT_NOTE,
  DEFAULT_TERMS_PAYMENT,
  SELLER_ADDRESS,
  SELLER_ADDRESS_UPPER,
  SELLER_COMPANY,
  SELLER_CONTACT,
  SELLER_WEBSITE,
  SIGNATURE_BUYER,
  SIGNATURE_SELLER,
  TERMS_PORT_OF_DESTINATION,
  TERMS_PORT_OF_LOADING,
} from "@/lib/pi-meta";

export type { LineItem, SizeRow } from "@/lib/pi-item";
export { getItemQty } from "@/lib/pi-item";
export { DEFAULT_TERMS_PAYMENT, SELLER_ADDRESS, SELLER_COMPANY, SELLER_CONTACT } from "@/lib/pi-meta";

export const SIZE_PRESETS: Record<string, SizeRow[]> = {
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

// ---------------------------------------------------------------------------
// Module-level UI helpers
// ---------------------------------------------------------------------------
export function BlackCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-2 py-1 text-sm ${className}`}>{children}</div>;
}

export const RedInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full bg-white dark:bg-neutral-900 border-2 border-[#ff4d00] dark:border-[#ff4d00] rounded px-2 py-1 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff4d00]/30 ${props.className || ""}`}
  />
);

export function BlueText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-[#0a6cff] font-medium ${className}`}>{children}</span>;
}

export function RedReminder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-1 text-xs italic text-[#ff4d00] ${className}`}>{children}</div>;
}

export const fmt = (dollars: number, symbol = "$") =>
  `${symbol}${dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
          <div
            key={`${s.label}-${i}`}
            className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-2 py-1"
          >
            <input
              type="text"
              value={s.label}
              onChange={(e) => {
                const next = [...it.sizes];
                next[i] = { ...s, label: e.target.value };
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
                next[i] = { ...s, qty: parseInt(e.target.value) || 0 };
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
          onClick={() =>
            onUpdateItem(idx, {
              sizes: [...it.sizes, { label: "", qty: 0 }],
            })
          }
          className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded border border-dashed border-neutral-400 text-neutral-500 hover:border-[#ff4d00] hover:text-[#ff4d00]"
        >
          <Plus className="w-3.5 h-3.5" />
          Add size
        </button>
      </div>
    </div>
  );
}

function PISourceBadge({ source }: { source: "auto" | "uploaded" | "manual" }) {
  const map = {
    auto: { label: "auto-suggested", cls: "bg-neutral-200 text-neutral-700" },
    uploaded: { label: "← from upload", cls: "bg-blue-100 text-blue-700" },
    manual: { label: "manual", cls: "bg-orange-100 text-orange-700" },
  } as const;
  const m = map[source];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${m.cls}`}>{m.label}</span>;
}

export interface PIDocumentProps {
  /** Render plain text instead of form controls. */
  readOnly?: boolean;
  /** id of the wrapping element (used by the PDF/print tooling). */
  documentId?: string;
  className?: string;

  piNumber: string;
  piSource?: "auto" | "uploaded" | "manual";
  piNumberLocked?: boolean;
  onPiNumberChange?: (v: string) => void;
  onRefreshPi?: () => void;

  issueDate: string;
  onIssueDateChange?: (v: string) => void;
  leadTimeText: string;
  onLeadTimeChange?: (v: string) => void;
  currency: SupportedCurrency;
  onCurrencyChange?: (v: SupportedCurrency) => void;
  bank: BankAccountInfo;

  customerName: string;
  onCustomerNameChange?: (v: string) => void;
  customerEmail: string;
  onCustomerEmailChange?: (v: string) => void;
  customerCompany: string;
  onCustomerCompanyChange?: (v: string) => void;
  customerAddress: string;
  onCustomerAddressChange?: (v: string) => void;
  customerPhone: string;
  onCustomerPhoneChange?: (v: string) => void;

  items: LineItem[];
  onAddItem?: () => void;
  onRemoveItem?: (idx: number) => void;
  onUpdateItem?: (idx: number, patch: Partial<LineItem>) => void;
  onItemImageFile?: (idx: number, file: File) => void;
  fileInputRefs?: React.MutableRefObject<Array<HTMLInputElement | null>>;

  shippingLabel: string;
  onShippingLabelChange?: (v: string) => void;
  shippingMethod: string;
  onShippingMethodChange?: (v: string) => void;
  shippingQty: number;
  onShippingQtyChange?: (v: number) => void;
  shippingCost: number;
  onShippingCostChange?: (v: number) => void;
  itemsSubtotal: number;
  grandTotal: number;
  termsPaymentText: string;
  onTermsPaymentTextChange?: (v: string) => void;
  shippingTerm: string;
  onShippingTermChange?: (v: string) => void;
}

/**
 * Plain-text rendering of a field value (read-only mode).
 *
 * Line breaks are preserved (`whitespace-pre-wrap`) so a multi-line field
 * such as FABRIC CONTENT looks exactly like the textarea it was typed in,
 * and like the PDF.
 */
function ReadValue({ value, placeholder }: { value: string; placeholder?: string }) {
  const text = (value ?? "").trim();
  if (!text) {
    return <span className="text-sm text-neutral-400">{placeholder ?? "—"}</span>;
  }
  return (
    <span className="text-sm text-black dark:text-white break-words whitespace-pre-wrap">{text}</span>
  );
}

export default function PIDocument(props: PIDocumentProps) {
  const {
    readOnly = false,
    documentId,
    className = "",
    piNumber, piSource = "auto", piNumberLocked = false, onPiNumberChange, onRefreshPi,
    issueDate, onIssueDateChange, leadTimeText, onLeadTimeChange,
    currency, onCurrencyChange, bank,
    customerName, onCustomerNameChange, customerEmail, onCustomerEmailChange,
    customerCompany, onCustomerCompanyChange, customerAddress, onCustomerAddressChange,
    customerPhone, onCustomerPhoneChange,
    items, onAddItem, onRemoveItem, onUpdateItem, onItemImageFile, fileInputRefs,
    shippingLabel, onShippingLabelChange, shippingMethod, onShippingMethodChange,
    shippingQty, onShippingQtyChange, shippingCost, onShippingCostChange,
    itemsSubtotal, grandTotal,
    termsPaymentText, onTermsPaymentTextChange,
    shippingTerm, onShippingTermChange,
  } = props;

  const localRefs = useRef<Array<HTMLInputElement | null>>([]);
  const refs = fileInputRefs ?? localRefs;

  const currencyUpper = currency.toUpperCase();
  const shippingTotal = shippingQty * shippingCost;

  // Read-only cells: a field without a handler cannot be edited, so it is
  // rendered as text.
  const ro = readOnly;
  const canEditItems = !ro && !!onUpdateItem;

  return (
    <div
      id={documentId}
      className={`bg-white dark:bg-neutral-900 shadow-lg rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 ${className}`}
    >
      {/* ── HEADER ── */}
      <div className="px-6 py-6 border-b-2 border-black dark:border-white">
        <div className="flex items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="ChinaRhinestone"
            width={220}
            height={88}
            loading="eager"
            decoding="async"
            className="h-[58px] w-auto shrink-0 ml-[20px] hover:scale-[1.01] transition-transform"
          />
          <div className="flex-1 pl-[30px]">
            <div className="text-lg font-bold tracking-wide whitespace-nowrap">
              {SELLER_COMPANY}
            </div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
              ADD: {SELLER_ADDRESS}
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
            <BlackCell>{SELLER_WEBSITE}</BlackCell>
          </div>
          <BlackCell>{SELLER_COMPANY}</BlackCell>
          <BlackCell>{SELLER_ADDRESS_UPPER}</BlackCell>
          <BlackCell>Annt.: {SELLER_CONTACT}</BlackCell>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BlackCell className="w-32 shrink-0">INVOICE NO.:</BlackCell>
            {ro || !onPiNumberChange ? (
              <div className="flex-1 px-1">
                <ReadValue value={piNumber} placeholder="—" />
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <RedInput
                  value={piNumber}
                  onChange={(e) => onPiNumberChange(e.target.value)}
                  placeholder="CR202610250001"
                  disabled={piNumberLocked}
                  className={piNumberLocked ? "opacity-70 cursor-not-allowed" : ""}
                />
                {onRefreshPi && (
                  <button
                    onClick={onRefreshPi}
                    title="Get next available PI number"
                    className="p-1.5 text-neutral-500 hover:text-[#ff4d00] border border-neutral-300 dark:border-neutral-700 rounded"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                <PISourceBadge source={piSource} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <BlackCell className="w-32 shrink-0">ISSUE DATE:</BlackCell>
            {ro || !onIssueDateChange ? (
              <div className="flex-1 px-1">
                <ReadValue value={issueDate} placeholder="—" />
              </div>
            ) : (
              <RedInput
                type="date"
                value={issueDate}
                onChange={(e) => onIssueDateChange(e.target.value)}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <BlackCell className="w-32 shrink-0">LEAD TIME:</BlackCell>
            {ro || !onLeadTimeChange ? (
              <div className="flex-1 px-1">
                <ReadValue value={leadTimeText} placeholder="—" />
              </div>
            ) : (
              <RedInput
                value={leadTimeText}
                onChange={(e) => onLeadTimeChange(e.target.value)}
                placeholder="Within 30 days"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <BlackCell className="w-32 shrink-0">CURRENCY:</BlackCell>
            {ro || !onCurrencyChange ? (
              <div className="flex-1 px-1">
                <ReadValue value={currencyUpper} placeholder="—" />
              </div>
            ) : (
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
            )}
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
                {ro || !onCustomerNameChange ? (
                  <ReadValue value={customerName} placeholder="—" />
                ) : (
                  <RedInput
                    value={customerName}
                    onChange={(e) => onCustomerNameChange(e.target.value)}
                    placeholder="Contact name"
                  />
                )}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Company <span className="text-neutral-400">(optional)</span></div>
                {ro || !onCustomerCompanyChange ? (
                  <ReadValue value={customerCompany} placeholder="—" />
                ) : (
                  <RedInput
                    value={customerCompany}
                    onChange={(e) => onCustomerCompanyChange(e.target.value)}
                    placeholder="Company name"
                  />
                )}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Address</div>
              {ro || !onCustomerAddressChange ? (
                <ReadValue value={customerAddress} placeholder="—" />
              ) : (
                <RedInput
                  value={customerAddress}
                  onChange={(e) => onCustomerAddressChange(e.target.value)}
                  placeholder="Shipping address"
                />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Phone <span className="text-red-500">*</span></div>
                {ro || !onCustomerPhoneChange ? (
                  <ReadValue value={customerPhone} placeholder="—" />
                ) : (
                  <RedInput
                    value={customerPhone}
                    onChange={(e) => onCustomerPhoneChange(e.target.value)}
                    placeholder="Phone number"
                  />
                )}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Email <span className="text-neutral-400">(optional)</span></div>
                {ro || !onCustomerEmailChange ? (
                  <ReadValue value={customerEmail} placeholder="—" />
                ) : (
                  <RedInput
                    type="email"
                    value={customerEmail}
                    onChange={(e) => onCustomerEmailChange(e.target.value)}
                    placeholder="Email"
                  />
                )}
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
                {canEditItems && <th className="border border-black dark:border-white p-2 w-8"></th>}
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
                          <img
                            src={it.imageUrl}
                            alt={it.description || "Product picture"}
                            width={96}
                            height={96}
                            loading="lazy"
                            decoding="async"
                            className="object-contain w-full h-full"
                          />
                          {canEditItems && (
                            <button
                              onClick={() => onUpdateItem?.(idx, { imageUrl: "" })}
                              className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-white rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </>
                      ) : canEditItems ? (
                        <button
                          onClick={() => refs.current[idx]?.click()}
                          className="text-xs text-neutral-500 hover:text-[#ff4d00] flex flex-col items-center gap-1"
                        >
                          <Upload className="w-5 h-5" />
                          upload
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                      {canEditItems && (
                        <input
                          ref={(el) => { refs.current[idx] = el; }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onItemImageFile?.(idx, file);
                            e.target.value = "";
                          }}
                        />
                      )}
                    </div>
                  </td>
                  <td className="border border-black dark:border-white p-1.5 align-top">
                    {ro || !canEditItems ? (
                      <ReadValue value={it.description} placeholder="—" />
                    ) : (
                      <textarea
                        value={it.description}
                        onChange={(e) => onUpdateItem?.(idx, { description: e.target.value })}
                        placeholder=""
                        rows={4}
                        className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40"
                      />
                    )}
                  </td>
                  <td className="border border-black dark:border-white p-1.5 align-top">
                    {ro || !canEditItems ? (
                      <ReadValue value={it.fabric} placeholder="—" />
                    ) : (
                      <textarea
                        value={it.fabric}
                        onChange={(e) => onUpdateItem?.(idx, { fabric: e.target.value })}
                        placeholder=""
                        rows={4}
                        className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40"
                      />
                    )}
                  </td>
                  <td className="border border-black dark:border-white p-1.5 align-top">
                    {ro || !canEditItems ? (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-semibold">{getItemQty(it).toLocaleString()}</span>
                        <span className="text-neutral-500">{it.unit}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {it.hasSizeBreakdown ? (
                          <div
                            className="w-24 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-1 text-sm font-semibold text-center text-neutral-700 dark:text-neutral-200"
                            title="Auto-summed from size breakdown below"
                          >
                            {getItemQty(it).toLocaleString()}
                          </div>
                        ) : (
                          <input
                            type="number"
                            min={1}
                            value={it.qty}
                            onChange={(e) => onUpdateItem?.(idx, { qty: parseInt(e.target.value) || 0 })}
                            className="w-24 bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40"
                          />
                        )}
                        <input
                          type="text"
                          value={it.unit}
                          onChange={(e) => onUpdateItem?.(idx, { unit: e.target.value })}
                          placeholder="set"
                          className="w-16 bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40"
                        />
                        {!it.hasSizeBreakdown && (
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateItem?.(idx, {
                                hasSizeBreakdown: true,
                                sizes: SIZE_PRESETS["Adult Standard"].map((s) => ({ ...s })),
                              })
                            }
                            className="text-neutral-400 hover:text-[#ff4d00]"
                            title="Enable size breakdown"
                          >
                            <Ruler className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="border border-black dark:border-white p-1.5 align-top">
                    {ro || !canEditItems ? (
                      <span className="text-sm">
                        {bank.symbol}
                        {it.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-sm mr-0.5">{bank.symbol}</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          defaultValue={it.unitPrice > 0 ? it.unitPrice.toString() : ""}
                          key={`price-${idx}-${items.length}-${items[idx]?.description ?? ""}`}
                          onBlur={(e) => {
                            const v = parseFloat(e.target.value || "0");
                            if (!isNaN(v) && v !== it.unitPrice) {
                              onUpdateItem?.(idx, { unitPrice: v });
                            }
                          }}
                          placeholder="0.000"
                          className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40"
                        />
                      </div>
                    )}
                  </td>
                  <td className="border border-black dark:border-white p-1.5 align-top text-sm font-semibold">
                    {fmt(getItemQty(it) * it.unitPrice, bank.symbol)}
                  </td>
                  {canEditItems && (
                    <td className="border border-black dark:border-white p-1.5 align-top text-center">
                      {items.length > 1 && (
                        <button
                          onClick={() => onRemoveItem?.(idx)}
                          className="text-neutral-400 hover:text-red-500"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {/* Size breakdown sub-rows */}
              {items.map((it, idx) =>
                it.hasSizeBreakdown ? (
                  <tr key={`sizes-${idx}`} className="bg-[#fff7f0] dark:bg-[#2a1a0e]">
                    <td colSpan={canEditItems ? 7 : 6} className="border border-black dark:border-white p-3 align-top">
                      {canEditItems ? (
                        <SizeBreakdownEditor it={it} idx={idx} onUpdateItem={onUpdateItem!} />
                      ) : (
                        <div className="text-sm">
                          <span className="font-bold text-[#ff4d00]">SIZE BREAKDOWN:</span>{" "}
                          <span className="text-black dark:text-white">
                            {it.sizes.map((s) => `${s.label}: ${s.qty}`).join("   ")}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : null
              )}

              {/* Shipping row */}
              <tr>
                <td className="border border-black dark:border-white p-1.5 align-top text-center text-xs text-neutral-500">
                  —
                </td>
                <td className="border border-black dark:border-white p-1.5 align-top">
                  {ro || !onShippingLabelChange ? (
                    <ReadValue value={shippingLabel} placeholder="Shipping Cost" />
                  ) : (
                    <input
                      value={shippingLabel}
                      onChange={(e) => onShippingLabelChange(e.target.value)}
                      placeholder="Shipping Cost"
                      className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40"
                    />
                  )}
                </td>
                <td className="border border-black dark:border-white p-1.5 align-top">
                  {ro || !onShippingMethodChange ? (
                    <ReadValue value={shippingMethod} placeholder="DDP by AIR" />
                  ) : (
                    <input
                      value={shippingMethod}
                      onChange={(e) => onShippingMethodChange(e.target.value)}
                      placeholder="DDP by AIR"
                      className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40"
                    />
                  )}
                </td>
                <td className="border border-black dark:border-white p-1.5 align-top">
                  {ro || !onShippingQtyChange ? (
                    <span className="text-sm">{shippingQty}</span>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      value={shippingQty}
                      onChange={(e) => onShippingQtyChange(parseInt(e.target.value) || 1)}
                      className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40"
                    />
                  )}
                </td>
                <td className="border border-black dark:border-white p-1.5 align-top">
                  {ro || !onShippingCostChange ? (
                    <span className="text-sm">
                      {bank.symbol}
                      {shippingCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-sm mr-0.5">{bank.symbol}</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        defaultValue={shippingCost.toFixed(2)}
                        key={`ship-cost-${shippingCost}`}
                        onBlur={(e) => {
                          const v = parseFloat(e.target.value || "0");
                          if (!isNaN(v) && v !== shippingCost) {
                            onShippingCostChange(v);
                          }
                        }}
                        placeholder="0.00"
                        className="w-full bg-white dark:bg-neutral-900 border border-[#ff4d00] rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40"
                      />
                    </div>
                  )}
                </td>
                <td className="border border-black dark:border-white p-1.5 align-top text-sm font-semibold">
                  {fmt(shippingTotal, bank.symbol)}
                </td>
                {canEditItems && <td className="border border-black dark:border-white p-1.5 align-top"></td>}
              </tr>

              {/* TOTAL row */}
              <tr className="bg-neutral-100 dark:bg-neutral-800 font-bold">
                <td colSpan={5} className="border border-black dark:border-white p-2 text-right">TOTAL:</td>
                <td className="border border-black dark:border-white p-2 text-base">{fmt(grandTotal, bank.symbol)}</td>
                {canEditItems && <td className="border border-black dark:border-white p-2"></td>}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex justify-between items-center text-sm">
          {canEditItems ? (
            <button
              onClick={onAddItem}
              className="inline-flex items-center gap-1 text-[#ff4d00] hover:text-[#e64500] font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add item
            </button>
          ) : (
            <span />
          )}
          <div className="text-neutral-500 text-xs">
            Subtotal: {fmt(itemsSubtotal, bank.symbol)} + Shipping: {fmt(shippingTotal, bank.symbol)} = <strong className="text-black dark:text-white">{fmt(grandTotal, bank.symbol)}</strong>
          </div>
        </div>
      </div>

      {/* ── Terms ── */}
      <div className="p-6 space-y-1 border-b border-neutral-200 dark:border-neutral-800 text-sm">
        <div><strong>(1) Port of Loading:</strong> {TERMS_PORT_OF_LOADING}</div>
        <div><strong>(2) Port of Destination:</strong> {TERMS_PORT_OF_DESTINATION}</div>
        <div><strong>(3) Shipping Term:</strong>{" "}
          {ro || !onShippingTermChange ? (
            <span className="text-black dark:text-white">{shippingTerm}</span>
          ) : (
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
          )}
        </div>
        <div className="pt-2">
          <strong>(4) Terms of Payment:</strong>
          {ro || !onTermsPaymentTextChange ? (
            <div className="mt-1 text-black dark:text-white whitespace-pre-wrap">{termsPaymentText}</div>
          ) : (
            <textarea
              value={termsPaymentText}
              onChange={(e) => onTermsPaymentTextChange(e.target.value)}
              rows={2}
              className="w-full mt-1 bg-white dark:bg-neutral-900 border-2 border-[#ff4d00] rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d00]/30"
            />
          )}
        </div>
      </div>

      {/* ── Bank Info ── */}
      <div className="p-6 space-y-2 border-b border-neutral-200 dark:border-neutral-800 text-sm">
        <div className="font-bold">BANK INFO:</div>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 items-start">
          <BlackCell>{BANK_LABEL_BENEFICIARY}</BlackCell>
          <div>
            <BlueText>{bank.beneficiary}</BlueText>
            <RedReminder>{BENEFICIARY_REMINDER}</RedReminder>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 items-start">
          <BlackCell>{BANK_LABEL_COMPANY_ADDRESS}</BlackCell>
          <BlueText>{bank.companyAddress}</BlueText>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1">
          <BlackCell>{BANK_LABEL_BANK_NAME}</BlackCell>
          <BlackCell>{bank.bankName}</BlackCell>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1">
          <BlackCell>{BANK_LABEL_ACCOUNT}</BlackCell>
          <BlackCell>{bank.account}</BlackCell>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1">
          <BlackCell>{BANK_LABEL_SWIFT}</BlackCell>
          <BlackCell>{bank.swift}</BlackCell>
        </div>
        {bank.cnaps && (
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1">
            <BlackCell>{BANK_LABEL_CNAPS}</BlackCell>
            <BlackCell>{bank.cnaps}</BlackCell>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1">
          <BlackCell>{BANK_LABEL_BANK_ADDRESS}</BlackCell>
          <BlackCell>{bank.bankAddress}</BlackCell>
        </div>
        {bank.notes && (
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 items-start">
            <BlackCell>{BANK_LABEL_NOTES}</BlackCell>
            <span className="italic text-neutral-600 dark:text-neutral-400">{bank.notes}</span>
          </div>
        )}
      </div>

      {/* ── Clauses (5)-(7) ── */}
      <div className="p-6 space-y-2 border-b border-neutral-200 dark:border-neutral-800 text-sm leading-relaxed">
        <div>
          <strong>(5) Production Time:</strong> {CLAUSE_PRODUCTION_TIME}
        </div>
        <div className="pt-2">
          <strong>(6) Tolerance:</strong>
          <div className="pl-4 space-y-0.5">
            {CLAUSE_TOLERANCE_ITEMS.map((t) => (
              <div key={t}>{t}</div>
            ))}
          </div>
        </div>
        <div className="pt-2">
          <strong>(7) Additional Clause:</strong>
          <div className="pl-4 space-y-0.5">
            {CLAUSE_ADDITIONAL_ITEMS.map((t) => (
              <div key={t}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer contract note + signatures ── */}
      <div className="p-6 space-y-4 text-sm">
        <div>
          {CONTRACT_NOTE}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div>
            <div className="font-bold">{SIGNATURE_SELLER}</div>
            <div className="mt-8 border-b border-black dark:border-white w-3/4" />
            <div className="mt-1 text-sm">{SELLER_COMPANY}</div>
          </div>
          <div>
            <div className="font-bold">{SIGNATURE_BUYER}</div>
            <div className="mt-8 border-b border-black dark:border-white w-3/4" />
            <div className="mt-1 text-sm">{customerName || "(customer name)"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
