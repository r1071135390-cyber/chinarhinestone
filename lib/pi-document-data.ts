/**
 * lib/pi-document-data.ts
 *
 * Converts the public PI payload (GET /api/pi/:pi_number) into the exact
 * data the PI document needs.
 *
 * Both the on-screen document (components/pi/PIDocument.tsx) and the PDF
 * generator (lib/pi-pdf.ts) consume this one object, so the PDF and the
 * page always show the same values.
 */

import {
  getBankAccount,
  bankAccountInfoFromDisplay,
  SUPPORTED_CURRENCIES,
  type BankAccount,
  type BankAccountInfo,
  type SupportedCurrency,
} from "@/lib/bank-accounts";
import { getItemQty, normalizePiText, type LineItem } from "@/lib/pi-item";
import { DEFAULT_TERMS_PAYMENT } from "@/lib/pi-meta";
import type { ProformaInvoice } from "@/lib/pi-types";

export interface PiDocumentData {
  piNumber: string;
  issueDate: string;
  leadTimeText: string;
  currency: SupportedCurrency;
  currencyLabel: string;
  symbol: string;
  bank: BankAccountInfo;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  customerAddress: string;
  customerPhone: string;
  items: LineItem[];
  shippingLabel: string;
  shippingMethod: string;
  shippingQty: number;
  shippingCost: number;
  shippingTotal: number;
  itemsSubtotal: number;
  grandTotal: number;
  termsPaymentText: string;
  shippingTerm: string;
}

function toIsoDate(value: string | undefined | null): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  const match = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return match[0];
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function toDocumentData(
  pi: ProformaInvoice,
  bankAccount?: BankAccount | null,
): PiDocumentData {
  const currencyLabel = (pi.currency ?? "USD").toUpperCase();
  const lower = currencyLabel.toLowerCase() as SupportedCurrency;
  const currency: SupportedCurrency = SUPPORTED_CURRENCIES.includes(lower) ? lower : "usd";

  const bank = bankAccount
    ? bankAccountInfoFromDisplay(bankAccount)
    : getBankAccount(currency);

  const items: LineItem[] = (pi.line_items ?? []).map((it) => ({
    description: normalizePiText(it.description ?? ""),
    fabric: normalizePiText(it.fabric ?? ""),
    qty: Number(it.quantity ?? 0) || 0,
    unit: it.unit || "set",
    unitPrice: Number(it.unit_price ?? 0) || 0,
    imageUrl: it.image_url ?? "",
    hasSizeBreakdown: Array.isArray(it.sizes) && it.sizes.length > 0,
    sizes: (it.sizes ?? []).map((s) => ({ label: s.label ?? "", qty: Number(s.qty ?? 0) || 0 })),
  }));

  const shippingQty = Math.max(1, Number(pi.shipping_qty ?? 1) || 1);
  const shippingTotal = Number(pi.shipping ?? 0) || 0;
  const shippingCost = shippingTotal / shippingQty;

  const itemsSubtotal = Number(pi.subtotal ?? 0) || 0;
  const grandTotal = Number(pi.total ?? 0) || 0;

  return {
    piNumber: pi.pi_number ?? "",
    issueDate: toIsoDate(pi.issue_date) || toIsoDate(pi.date),
    leadTimeText: pi.lead_time_text?.trim() || "Within 30 days",
    currency,
    currencyLabel,
    symbol: bank.symbol,
    bank,
    customerName: pi.customer_name ?? pi.to_company ?? "",
    customerEmail: pi.customer_email ?? "",
    customerCompany: pi.customer_company ?? "",
    customerAddress: pi.to_address ?? "",
    customerPhone: pi.customer_phone ?? "",
    items,
    shippingLabel: pi.shipping_label?.trim() || "Shipping Cost",
    shippingMethod: pi.shipping_method?.trim() || "DDP by AIR",
    shippingQty,
    shippingCost,
    shippingTotal,
    itemsSubtotal,
    grandTotal,
    // The admin form stores the payment terms in the `notes` column.
    termsPaymentText: pi.notes?.trim() || DEFAULT_TERMS_PAYMENT,
    shippingTerm: pi.shipping_term?.trim() || "DDP",
  };
}

/** Total quantity of a line item (size breakdown aware). */
export { getItemQty };
