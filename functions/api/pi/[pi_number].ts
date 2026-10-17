/**
 * functions/api/pi/[pi_number].ts
 *
 * GET /api/pi/:pi_number
 *
 * Public endpoint: returns a single PI by number plus its bank account.
 * Only returns the row if status is "sent" or "paid" (drafts are private).
 *
 * Response shape: { pi: PiRecord, bankAccount: BankAccountRow }
 *
 * PiRecord columns we expose (snake_case to match Supabase):
 *   pi_number, customer_name, customer_email, customer_phone,
 *   customer_company, customer_address, customer_country,
 *   currency, line_items (JSONB), subtotal_cents, total_cents,
 *   status, notes, created_at, valid_until, payment_method,
 *   shipping_method, shipping_cents
 *
 * bankAccount is resolved from the shared BANK Supabase (filtered by the
 * PI's `bank_account_currency`). Falls back to local MAIN if BANK is not
 * configured. Used by /pay page to render Bank Info block.
 */

import { getSupabase, getBankSupabase, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";

interface PiRow {
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
  total_cents: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  valid_until: string | null;
  payment_method: string | null;
  shipping_method: string | null;
  shipping_cents: number | null;
  bank_account_currency: string | null;
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

async function fetchBankAccount(
  env: Env,
  currency: string,
  siteSlug: string,
): Promise<BankAccountRow | null> {
  const supabase = getBankSupabase(env);
  // BANK DB rows live under site_slug='sublimapparel'; main DB has rows for
  // this site's slug. Try BANK first, fall back to MAIN.
  const fromBank = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("site_slug", BANK_SOURCE_SITE)
    .eq("currency", currency)
    .maybeSingle<BankAccountRow>();
  if (fromBank.data) return fromBank.data;
  if (fromBank.error) {
    // continue to fallback
  }

  const fallback = getSupabase(env);
  const fromMain = await fallback
    .from("bank_accounts")
    .select("*")
    .eq("site_slug", siteSlug)
    .eq("currency", currency)
    .maybeSingle<BankAccountRow>();
  return fromMain.data ?? null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const piNumber = String(context.params.pi_number ?? "").trim();
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  if (!piNumber) {
    return jsonResponse({ error: "Missing pi_number" }, { status: 400, request: context.request, env });
  }

  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from("proforma_invoices")
    .select(
      "pi_number, customer_name, customer_email, customer_phone, customer_company, customer_address, customer_country, currency, line_items, subtotal_cents, total_cents, status, notes, created_at, valid_until, payment_method, shipping_method, shipping_cents, bank_account_currency"
    )
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug)
    .in("status", ["sent", "paid"])
    .maybeSingle<PiRow>();

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500, request: context.request, env });
  }
  if (!data) {
    return jsonResponse({ error: "PI not found" }, { status: 404, request: context.request, env });
  }

  // Resolve bank account for this PI's currency (or fall back to PI's currency).
  const bankCurrency =
    (data.bank_account_currency ?? data.currency ?? "USD").toUpperCase();
  const bankAccount = await fetchBankAccount(env, bankCurrency, siteSlug);

  return jsonResponse(
    { pi: data, bankAccount },
    { status: 200, request: context.request, env }
  );
};
