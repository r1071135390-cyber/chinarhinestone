/**
 * functions/api/admin/customers/[id].ts
 *
 * GET /api/admin/customers/:id
 *
 * Returns one customer plus their PI history. The id is the base64url
 * encoding of the customer grouping key produced by /api/admin/customers/list
 * (see _lib/customers.ts).
 *
 * Response: { ok: true, customer: CustomerDetail | null }
 */

import { getSupabase, isPiStoreConfigured, type Env } from "../../../_lib/supabase";
import { jsonResponse } from "../../../_lib/cors";
import { PagesFunction } from "../../../_lib/pages-function";
import {
  PI_CUSTOMER_FIELDS,
  customerKey,
  decodeCustomerId,
  groupCustomers,
  type PiCustomerRow,
} from "../../../_lib/customers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  // No token gate here on purpose — see list.ts for the reasoning.

  const rawId = Array.isArray(context.params.id) ? context.params.id[0] : context.params.id;
  if (!rawId) {
    return jsonResponse(
      { ok: false, error: "Missing customer id" },
      { status: 400, request: context.request, env }
    );
  }

  if (!isPiStoreConfigured(env)) {
    return jsonResponse(
      { ok: true, customer: null },
      { status: 200, request: context.request, env }
    );
  }

  let key: string;
  try {
    key = decodeCustomerId(rawId);
  } catch {
    return jsonResponse(
      { ok: false, error: "Invalid customer id" },
      { status: 400, request: context.request, env }
    );
  }

  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from("proforma_invoices")
    .select(PI_CUSTOMER_FIELDS)
    .eq("site_slug", siteSlug)
    .order("created_at", { ascending: false });

  if (error) {
    return jsonResponse(
      { ok: false, error: error.message },
      { status: 500, request: context.request, env }
    );
  }

  const rows = (data ?? []) as PiCustomerRow[];
  const group = groupCustomers(rows).find((candidate) => candidate.key === key);
  if (!group) {
    return jsonResponse(
      { ok: true, customer: null },
      { status: 200, request: context.request, env }
    );
  }

  const piHistory = rows
    .filter((row) => customerKey(row) === key)
    .map((row) => ({
      id: String(row.id),
      pi_number: row.pi_number,
      created_at: row.created_at,
      total_amount: row.total_cents === null ? null : (row.total_cents / 100).toFixed(2),
      currency: row.currency,
      status: row.status,
    }));

  return jsonResponse(
    {
      ok: true,
      customer: {
        customer_name: group.customer_name,
        company: group.company,
        email: group.email,
        phone: group.phone,
        address: group.address,
        pi_history: piHistory,
      },
    },
    { status: 200, request: context.request, env }
  );
};
