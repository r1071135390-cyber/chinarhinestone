/**
 * lib/pi-types.ts
 *
 * Wire format of the public PI endpoint (GET /api/pi/:pi_number).
 *
 * Kept in its own module so both the React document and the PDF generator
 * can import the types without pulling React in.
 */

export interface ProformaInvoiceLineItem {
  description: string;
  size?: string;
  fabric?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  total: number;
  image_url?: string;
  sizes?: { label: string; qty: number }[];
}

export type ProformaInvoiceStatus =
  | "draft"
  | "sent"
  | "awaiting_payment"
  | "paid"
  | "cancelled"
  | "refunded";

export interface ProformaInvoice {
  id: string;
  pi_number: string;
  date: string;
  issue_date?: string;
  lead_time_text?: string;
  from_company: string;
  from_address: string;
  from_phone?: string;
  from_email?: string;
  to_company: string;
  to_address: string;
  to_country?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_company?: string;
  line_items: ProformaInvoiceLineItem[];
  subtotal: number;
  shipping?: number;
  shipping_qty?: number;
  shipping_label?: string;
  shipping_method?: string;
  shipping_term?: string;
  total: number;
  currency: string;
  notes?: string;
  bank_account_id?: string;
  status: ProformaInvoiceStatus | string;
  created_at: string;
}
