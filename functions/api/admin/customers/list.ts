/**
 * functions/api/admin/customers/list.ts
 *
 * GET /api/admin/customers/list?search=...
 *
 * Lists the customers behind this site's proforma invoices, most recent
 * activity first. There is no customers table — customers are derived from
 * the PI rows (see _lib/customers.ts).
 *
 * Response: { ok: true, customers: CustomerGroup[], warning?: string }
 */

import { getSupabase, type Env } from "../../../_lib/supabase";
import { jsonResponse } from "../../../_lib/cors";
import { PagesFunction } from "../../../_lib/pages-function";
import { groupCustomers, matchesSearch, type PiCustomerRow } from "../../../_lib/customers";

const PI_FIELDS =
  "id, pi_number, customer_name, customer_email, customer_company, customer_phone, total_cents, currency, status, created_at";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  // No token gate here on purpose. The browser cannot hold a secret — any
  // token the client sends is readable by anyone — so a shared-secret header
  // is not real protection. The admin pages are password-gated in the UI and
  // /api/admin/bank-accounts (the other admin data endpoint) follows the
  // same model.

  // The PI store is not connected yet — an empty list is the correct answer
  // here, not an error. The warning explains why it is empty.
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(
      {
        ok: true,
        customers: [],
        warning:
          "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set, so the proforma invoice store is not connected yet — no customers can be listed.",
      },
      { status: 200, request: context.request, env }
    );
  }

  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from("proforma_invoices")
    .select(PI_FIELDS)
    .eq("site_slug", siteSlug)
    .order("created_at", { ascending: false });

  if (error) {
    return jsonResponse(
      { ok: false, error: error.message },
      { status: 500, request: context.request, env }
    );
  }

  const rows = (data ?? []) as PiCustomerRow[];
  const search = (new URL(context.request.url).searchParams.get("search") ?? "").trim().toLowerCase();
  const customers = groupCustomers(rows).filter((group) => matchesSearch(group, search));

  return jsonResponse(
    { ok: true, customers },
    { status: 200, request: context.request, env }
  );
};
