"use client";

/**
 * components/pi/PIDisplay.tsx
 *
 * The customer-facing view of a Proforma Invoice (/pay?pi=...).
 *
 * It renders the shared document component, so a browsed PI has exactly the
 * same layout as the PI the admin creates in "New PI" — same header, same
 * invoice-info block, same item table, same terms, same bank info, same
 * clauses. There is only one layout in the project.
 */

import type { BankAccount } from "@/lib/bank-accounts";
import PIDocument from "@/components/pi/PIDocument";
import { toDocumentData } from "@/lib/pi-document-data";
import type { ProformaInvoice, ProformaInvoiceLineItem } from "@/lib/pi-types";

export type { ProformaInvoice, ProformaInvoiceLineItem } from "@/lib/pi-types";

interface PIDisplayProps {
  pi: ProformaInvoice;
  bankAccount: BankAccount | null;
}

export default function PIDisplay({ pi, bankAccount }: PIDisplayProps) {
  const data = toDocumentData(pi, bankAccount);

  return (
    <PIDocument
      readOnly
      documentId="pi-document"
      className="shadow-none border-0 rounded-none"
      piNumber={data.piNumber}
      issueDate={data.issueDate}
      leadTimeText={data.leadTimeText}
      currency={data.currency}
      bank={data.bank}
      customerName={data.customerName}
      customerEmail={data.customerEmail}
      customerCompany={data.customerCompany}
      customerAddress={data.customerAddress}
      customerPhone={data.customerPhone}
      items={data.items}
      shippingLabel={data.shippingLabel}
      shippingMethod={data.shippingMethod}
      shippingQty={data.shippingQty}
      shippingCost={data.shippingCost}
      itemsSubtotal={data.itemsSubtotal}
      grandTotal={data.grandTotal}
      termsPaymentText={data.termsPaymentText}
      shippingTerm={data.shippingTerm}
    />
  );
}
