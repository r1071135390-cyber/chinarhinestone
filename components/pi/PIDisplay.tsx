"use client";

import type { BankAccount } from "@/lib/bank-accounts";
import { CURRENCY_SYMBOLS, formatCurrency } from "@/lib/fx-rates";

export interface ProformaInvoiceLineItem {
  description: string;
  size?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ProformaInvoice {
  id: string;
  pi_number: string;
  date: string;
  from_company: string;
  from_address: string;
  from_phone?: string;
  from_email?: string;
  to_company: string;
  to_address: string;
  to_country?: string;
  line_items: ProformaInvoiceLineItem[];
  subtotal: number;
  shipping?: number;
  total: number;
  currency: string;
  notes?: string;
  bank_account_id?: string;
  status: "draft" | "sent" | "paid" | "cancelled";
  created_at: string;
}

const SITE = {
  company: "Yiwu HomeDorm Commodity Manufacturing Co., Ltd.",
  address: "No.35 Lingyun Road, Yiwu, Zhejiang, China",
  phone: "+86 137 6459 3988",
  email: "info@chinarhinestone.com",
  website: "chinarhinestone.com",
};

interface PIDisplayProps {
  pi: ProformaInvoice;
  bankAccount: BankAccount;
}

export default function PIDisplay({ pi, bankAccount }: PIDisplayProps) {
  const currencySymbol = CURRENCY_SYMBOLS[pi.currency] ?? pi.currency;

  return (
    <article
      id="pi-document"
      className="mx-auto max-w-4xl bg-white p-8 font-sans text-black"
    >
      {/* Header */}
      <header className="border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              Proforma Invoice
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              <span className="font-semibold">PI Number:</span> {pi.pi_number}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Date:</span>{" "}
              {new Date(pi.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{SITE.company}</p>
            <p className="text-sm text-gray-600">{SITE.address}</p>
            <p className="text-sm text-gray-600">{SITE.phone}</p>
            <p className="text-sm text-gray-600">{SITE.email}</p>
          </div>
        </div>
      </header>

      {/* From / To */}
      <section className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            From (Seller)
          </h2>
          <p className="font-semibold">{pi.from_company}</p>
          <p className="text-sm whitespace-pre-line">{pi.from_address}</p>
          {pi.from_phone && (
            <p className="text-sm mt-1">Tel: {pi.from_phone}</p>
          )}
          {pi.from_email && (
            <p className="text-sm">Email: {pi.from_email}</p>
          )}
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            To (Buyer)
          </h2>
          <p className="font-semibold">{pi.to_company}</p>
          <p className="text-sm whitespace-pre-line">{pi.to_address}</p>
          {pi.to_country && <p className="text-sm">Country: {pi.to_country}</p>}
        </div>
      </section>

      {/* Line Items Table */}
      <section className="mb-8">
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-black text-white">
              <th className="border border-black px-3 py-2 text-left font-semibold">
                Description
              </th>
              <th className="border border-black px-3 py-2 text-center font-semibold w-24">
                Size
              </th>
              <th className="border border-black px-3 py-2 text-center font-semibold w-20">
                Qty
              </th>
              <th className="border border-black px-3 py-2 text-right font-semibold w-28">
                Unit Price
              </th>
              <th className="border border-black px-3 py-2 text-right font-semibold w-28">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {pi.line_items.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-black px-3 py-2">
                  {item.description}
                </td>
                <td className="border border-black px-3 py-2 text-center">
                  {item.size ?? "-"}
                </td>
                <td className="border border-black px-3 py-2 text-center">
                  {item.quantity}
                </td>
                <td className="border border-black px-3 py-2 text-right">
                  {currencySymbol}
                  {item.unit_price.toFixed(2)}
                </td>
                <td className="border border-black px-3 py-2 text-right font-medium">
                  {currencySymbol}
                  {item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals */}
      <section className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">
              {currencySymbol}
              {pi.subtotal.toFixed(2)}
            </span>
          </div>
          {pi.shipping !== undefined && pi.shipping > 0 && (
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium">
                {currencySymbol}
                {pi.shipping.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between py-2 bg-black text-white px-3 mt-1">
            <span className="font-bold">Total:</span>
            <span className="font-bold">
              {currencySymbol}
              {pi.total.toFixed(2)} {pi.currency}
            </span>
          </div>
        </div>
      </section>

      {/* Bank Info */}
      <section className="bg-gray-50 border border-black p-4 mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
          <span className="text-red-600 font-bold">Bank Info</span>
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
          <div>
            <span className="text-gray-500">Currency:</span>{" "}
            <span className="font-medium">{bankAccount.currency}</span>
          </div>
          <div>
            <span className="text-gray-500">Beneficiary:</span>{" "}
            <span className="font-medium">{bankAccount.beneficiary_name}</span>
          </div>
          <div>
            <span className="text-gray-500">Bank Name:</span>{" "}
            <span className="font-medium">{bankAccount.bank_name}</span>
          </div>
          <div>
            <span className="text-gray-500">Account No:</span>{" "}
            <span className="font-medium">{bankAccount.account_number}</span>
          </div>
          <div>
            <span className="text-gray-500">SWIFT Code:</span>{" "}
            <span className="font-medium">{bankAccount.swift_code}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Bank Address:</span>{" "}
            <span className="font-medium">{bankAccount.bank_address}</span>
          </div>
          {bankAccount.intermediary_bank && (
            <>
              <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-500">Intermediary Bank:</span>{" "}
                <span className="font-medium">
                  {bankAccount.intermediary_bank} ({bankAccount.intermediary_swift})
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Notes */}
      {pi.notes && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Notes
          </h2>
          <p className="text-sm whitespace-pre-line text-gray-700">{pi.notes}</p>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
        <p>
          {SITE.company} | {SITE.address}
        </p>
        <p>
          Tel: {SITE.phone} | Email: {SITE.email} | {SITE.website}
        </p>
        <p className="mt-1">This is a computer-generated document, no signature required.</p>
      </footer>
    </article>
  );
}
