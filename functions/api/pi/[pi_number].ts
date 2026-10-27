/**
 * functions/api/pi/[pi_number].ts
 *
 * GET /api/pi/:pi_number
 *
 * Public endpoint: returns a single PI by number plus its bank account.
 * Only returns the row if status is "sent" or "paid" (drafts are private).
 *
 * Response shape: { pi: ProformaInvoice, bankAccount: BankAccount }
 * Both use the camelCase contracts declared in
 * components/pi/PIDisplay.tsx and lib/bank-accounts.ts, so the /pay page
 * can hand them straight to <PIDisplay />.
 *
 * The payload carries every field the PI document needs (customer details,
 * issue date, lead time, shipping, fabric / picture per line item and the
 * full bank account), because the customer-facing document is rendered with
 * exactly the same layout as the admin "New PI" form.
 *
 * Money: the DB stores cents; the PI document renders major units.
 */

import { getSupabase, getBankSupabase, isPiStoreConfigured, piStoreEnvDiagnostic, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";

interface PiRow {
  id: number;
  pi_number: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_company: string | null;
  customer_address: string | null;
  customer_country: string | null;
  currency: string;
  line_items: unknown;
  subtotal_cents: number | null;
  shipping_cents: number | null;
  total_cents: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  valid_until: string | null;
  payment_method: string | null;
  bank_account_currency: string | null;
  issue_date: string | null;
  lead_time_text: string | null;
  shipping_label: string | null;
  shipping_method: string | null;
  shipping_qty: number | null;
  shipping_term: string | null;
}

interface BankAccountRow {
  id: number;
  site_slug: string;
  currency: string;
  label: string;
  symbol: string;
  beneficiary: string;
  company_address: string;
  bank_name: string;
  account: string;
  swift: string;
  bank_address: string;
  iban: string | null;
  bank_country: string | null;
  routing_number: string | null;
  cnaps: string | null;
  intermediary_bank: string | null;
  intermediary_swift: string | null;
  notes: string | null;
  updated_at: string;
}

const BANK_SOURCE_SITE = "sublimapparel";

const SELLER = {
  company: "Yiwu HomeDorm Commodity Manufacturing Co., Ltd.",
  address: "No.35 Lingyun Road, Yiwu, Zhejiang, China",
  phone: "+86 137 6459 3988",
  email: "info@chinarhinestone.com",
};

const BASE_SELECT =
  "id, pi_number, customer_name, customer_email, customer_phone, customer_company, " +
  "customer_address, customer_country, currency, line_items, subtotal_cents, shipping_cents, " +
  "total_cents, status, notes, created_at, valid_until, payment_method, bank_account_currency";

const EXT_SELECT =
  BASE_SELECT +
  ", issue_date, lead_time_text, shipping_label, shipping_method, shipping_qty, shipping_term";

function isMissingColumn(code?: string, message?: string): boolean {
  if (code === "42703" || code === "PGRST204") return true;
  return /column\s+"?[a-zA-Z0-9_.]+"?\s+does not exist/i.test(message ?? "");
}

async function fetchBankAccount(
  env: Env,
  currency: string,
  siteSlug: string,
): Promise<BankAccountRow | null> {
  const supabase = getBankSupabase(env);
  // BANK DB rows live under site_slug='sublimapparel'; main DB has rows for
  // this site's slug. Try BANK first, fall back to MAIN.
  //
  // Currency case is not consistent between the two databases: the BANK
  // project stores lowercase ('usd'), the MAIN migration seeds uppercase
  // ('USD'). The column is plain TEXT with no CHECK, so both spellings can
  // coexist — match case-insensitively instead of guessing.
  const variants = [currency, currency.toUpperCase(), currency.toLowerCase()];

  for (const variant of variants) {
    const fromBank = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("site_slug", BANK_SOURCE_SITE)
      .eq("currency", variant)
      .maybeSingle<BankAccountRow>();
    if (fromBank.data) return fromBank.data;
  }

  const fallback = getSupabase(env);
  for (const variant of variants) {
    const fromMain = await fallback
      .from("bank_accounts")
      .select("*")
      .eq("site_slug", siteSlug)
      .eq("currency", variant)
      .maybeSingle<BankAccountRow>();
    if (fromMain.data) return fromMain.data;
  }

  return null;
}

interface LineItem {
  description: string;
  fabric?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  total: number;
  image_url?: string;
  sizes?: { label: string; qty: number }[];
}

function toLineItems(raw: unknown): LineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((it) => {
    const row = (it ?? {}) as Record<string, unknown>;
    const quantity = Number(row.quantity ?? 0) || 0;
    const unitPrice = Number(row.unit_price ?? 0) || 0;
    const item: LineItem = {
      description: String(row.description ?? ""),
      quantity,
      unit_price: unitPrice,
      total: Number(row.total ?? quantity * unitPrice) || 0,
    };
    if (row.fabric) item.fabric = String(row.fabric);
    if (row.unit) item.unit = String(row.unit);
    if (row.image_url) item.image_url = String(row.image_url);
    if (Array.isArray(row.sizes)) {
      const sizes = (row.sizes as unknown[])
        .map((s) => {
          const sr = (s ?? {}) as Record<string, unknown>;
          return { label: String(sr.label ?? ""), qty: Number(sr.qty ?? 0) || 0 };
        })
        .filter((s) => s.label);
      if (sizes.length) item.sizes = sizes;
    }
    return item;
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const piNumber = String(context.params.pi_number ?? "").trim();
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  if (!piNumber) {
    return jsonResponse({ error: "Missing pi_number" }, { status: 400, request: context.request, env });
  }

  // Without this the query would throw and Cloudflare would answer with a
  // bare "error code: 1101" page instead of JSON.
  if (!isPiStoreConfigured(env)) {
    return jsonResponse(
      {
        error: "PI store is not configured on this deployment.",
        diagnostic: piStoreEnvDiagnostic(env),
      },
      { status: 500, request: context.request, env }
    );
  }

  const supabase = getSupabase(env);

  let data: PiRow | null = null;
  let warning: string | undefined;

  const first = await supabase
    .from("proforma_invoices")
    .select(EXT_SELECT)
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug)
    // 'awaiting_payment' is the state /api/pi/confirm-bank moves a PI into.
    // Leaving it out meant the customer reloading /pay after confirming a
    // wire transfer got a 404 ("Proforma Invoice not found") on the very
    // page that is supposed to confirm it.
    .in("status", ["sent", "awaiting_payment", "paid"])
    .maybeSingle<PiRow>();

  if (first.error) {
    if (isMissingColumn(first.error.code, first.error.message)) {
      // The extra columns are not there yet — read the core fields only.
      const retry = await supabase
        .from("proforma_invoices")
        .select(BASE_SELECT)
        .eq("pi_number", piNumber)
        .eq("site_slug", siteSlug)
        .in("status", ["sent", "awaiting_payment", "paid"])
        .maybeSingle<PiRow>();
      if (retry.error) {
        return jsonResponse({ error: retry.error.message }, { status: 500, request: context.request, env });
      }
      data = retry.data;
      warning =
        "ISSUE DATE / LEAD TIME / SHIPPING details are empty — run supabase/migrations/20261025_pi_admin_fields.sql in the Supabase SQL editor to store them.";
    } else {
      return jsonResponse({ error: first.error.message }, { status: 500, request: context.request, env });
    }
  } else {
    data = first.data;
  }

  if (!data) {
    return jsonResponse({ error: "PI not found" }, { status: 404, request: context.request, env });
  }

  // Resolve bank account for this PI's currency (or fall back to PI's currency).
  const bankCurrency = (data.bank_account_currency ?? data.currency ?? "USD").toUpperCase();
  const bankRow = await fetchBankAccount(env, bankCurrency, siteSlug);

  const bankAccount = bankRow
    ? {
        id: String(bankRow.id),
        currency: bankRow.currency,
        label: bankRow.label,
        symbol: bankRow.symbol,
        beneficiary_name: bankRow.beneficiary,
        company_address: bankRow.company_address,
        bank_name: bankRow.bank_name,
        bank_address: bankRow.bank_address,
        account_number: bankRow.account,
        swift_code: bankRow.swift,
        cnaps: bankRow.cnaps ?? undefined,
        iban: bankRow.iban ?? undefined,
        bank_country: bankRow.bank_country ?? undefined,
        routing_number: bankRow.routing_number ?? undefined,
        intermediary_bank: bankRow.intermediary_bank ?? undefined,
        intermediary_swift: bankRow.intermediary_swift ?? undefined,
        notes: bankRow.notes ?? undefined,
        is_active: true,
      }
    : null;

  const subtotal = (data.subtotal_cents ?? 0) / 100;
  const shipping = (data.shipping_cents ?? 0) / 100;
  const total = (data.total_cents ?? 0) / 100;
  const shippingQty = Number(data.shipping_qty) || 1;

  const pi = {
    id: String(data.id),
    pi_number: data.pi_number,
    date: data.created_at,
    issue_date: data.issue_date ?? "",
    lead_time_text: data.lead_time_text ?? "",
    customer_name: data.customer_name ?? "",
    customer_email: data.customer_email ?? "",
    customer_phone: data.customer_phone ?? "",
    customer_company: data.customer_company ?? "",
    from_company: SELLER.company,
    from_address: SELLER.address,
    from_phone: SELLER.phone,
    from_email: SELLER.email,
    to_company: data.customer_company || data.customer_name || "",
    to_address: data.customer_address || "",
    to_country: data.customer_country || "",
    line_items: toLineItems(data.line_items),
    subtotal,
    shipping,
    shipping_qty: shippingQty,
    shipping_label: data.shipping_label ?? "",
    shipping_method: data.shipping_method ?? "",
    shipping_term: data.shipping_term ?? "DDP",
    total,
    currency: (data.currency ?? "USD").toUpperCase(),
    notes: data.notes ?? undefined,
    status: data.status,
    created_at: data.created_at,
  };

  return jsonResponse(
    { pi, bankAccount, ...(warning ? { warning } : {}) },
    { status: 200, request: context.request, env }
  );
};
