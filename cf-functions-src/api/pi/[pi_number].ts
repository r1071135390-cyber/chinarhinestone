/**
 * functions/api/pi/[pi_number].ts
 *
 * GET /api/pi/:pi_number
 *
 * Public endpoint: returns a single PI by number.
 * Only returns the row if status is "sent" or "paid" (drafts are private).
 *
 * Response shape: { pi: PiRecord }
 *
 * PiRecord columns we expose (snake_case to match Supabase):
 *   pi_number, customer_name, customer_email, customer_phone,
 *   customer_company, customer_address, customer_country,
 *   currency, line_items (JSONB), subtotal_cents, total_cents,
 *   status, notes, created_at, valid_until, payment_method,
 *   shipping_method, shipping_cents
 */

import { getSupabase, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";

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

  return jsonResponse({ pi: data }, { status: 200, request: context.request, env });
};

interface PagesFunction<E = unknown> {
  (context: {
    request: Request;
    env: E;
    params: Record<string, string | string[]>;
    data: unknown;
    next: () => Promise<Response>;
    waitUntil: (promise: Promise<unknown>) => void;
  }): Promise<Response> | Response;
}
