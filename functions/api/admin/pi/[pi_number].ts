/**
 * functions/api/admin/pi/[pi_number].ts
 *
 * GET /api/admin/pi/:pi_number
 *
 * Admin view of one PI, shaped for the /admin/edit-pi form (flat camelCase
 * — the same shape the create endpoint accepts).
 *
 * Unlike the public /api/pi/:pi_number endpoint this one returns every
 * status, including drafts, so the owner can still edit a PI that has not
 * been sent yet.
 *
 * Response: { piNumber, issueDate, leadTimeText, paymentTermsText,
 *              shippingTerm, customerName, customerEmail, customerCompany,
 *              customerAddress, customerPhone, items, shippingLabel,
 *              shippingMethod, shippingQty, shippingCost, currency, notes,
 *              status, paymentUrl }
 */

import { getSupabase, isPiStoreConfigured, piStoreEnvDiagnostic, type Env } from "../../../_lib/supabase";
import { jsonResponse } from "../../../_lib/cors";
import { PagesFunction } from "../../../_lib/pages-function";

interface PiRow {
  id: number;
  pi_number: string;
  status: string;
  currency: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_company: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  line_items: unknown;
  shipping_cents: number | null;
  notes: string | null;
  issue_date: string | null;
  lead_time_text: string | null;
  shipping_label: string | null;
  shipping_method: string | null;
  shipping_qty: number | null;
  shipping_term: string | null;
}

const BASE_SELECT =
  "id, pi_number, status, currency, customer_name, customer_email, customer_company, " +
  "customer_address, customer_phone, line_items, shipping_cents, notes";

const EXT_SELECT =
  BASE_SELECT +
  ", issue_date, lead_time_text, shipping_label, shipping_method, shipping_qty, shipping_term";

function isMissingColumn(code?: string, message?: string): boolean {
  if (code === "42703" || code === "PGRST204") return true;
  return /column\s+"?[a-zA-Z0-9_.]+"?\s+does not exist/i.test(message ?? "");
}

interface OutItem {
  description: string;
  fabric: string;
  qty: number;
  unit: string;
  unitPrice: number;
  imageUrl: string;
  sizes: { label: string; qty: number }[];
}

function toItems(raw: unknown): OutItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((it) => {
    const row = (it ?? {}) as Record<string, unknown>;
    const sizes = Array.isArray(row.sizes)
      ? (row.sizes as unknown[])
          .map((s) => {
            const sr = (s ?? {}) as Record<string, unknown>;
            return { label: String(sr.label ?? ""), qty: Number(sr.qty ?? 0) || 0 };
          })
          .filter((s) => s.label)
      : [];
    return {
      description: String(row.description ?? ""),
      fabric: String(row.fabric ?? ""),
      qty: Number(row.quantity ?? 0) || 0,
      unit: String(row.unit ?? "set"),
      unitPrice: Number(row.unit_price ?? 0) || 0,
      imageUrl: String(row.image_url ?? ""),
      sizes,
    };
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";
  const piNumber = String(context.params.pi_number ?? "").trim();

  if (!piNumber) {
    return jsonResponse({ error: "Missing pi_number" }, { status: 400, request: context.request, env });
  }

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

  let row: PiRow | null = null;
  let warning: string | undefined;

  const first = await supabase
    .from("proforma_invoices")
    .select(EXT_SELECT)
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug)
    .maybeSingle<PiRow>();

  if (first.error) {
    if (isMissingColumn(first.error.code, first.error.message)) {
      // The extra columns are not there yet — read the core fields only.
      const retry = await supabase
        .from("proforma_invoices")
        .select(BASE_SELECT)
        .eq("pi_number", piNumber)
        .eq("site_slug", siteSlug)
        .maybeSingle<PiRow>();
      if (retry.error) {
        return jsonResponse({ error: retry.error.message }, { status: 500, request: context.request, env });
      }
      row = retry.data;
      warning =
        "ISSUE DATE / LEAD TIME / SHIPPING details are empty — run supabase/migrations/20261025_pi_admin_fields.sql in the Supabase SQL editor to store them.";
    } else {
      return jsonResponse({ error: first.error.message }, { status: 500, request: context.request, env });
    }
  } else {
    row = first.data;
  }

  if (!row) {
    return jsonResponse({ error: "PI not found" }, { status: 404, request: context.request, env });
  }

  const currency = (row.currency ?? "USD").toLowerCase();

  return jsonResponse(
    {
      piNumber: row.pi_number,
      issueDate: row.issue_date ?? "",
      leadTimeText: row.lead_time_text ?? "",
      paymentTermsText: row.notes ?? "",
      shippingTerm: row.shipping_term ?? "DDP",
      customerName: row.customer_name ?? "",
      customerEmail: row.customer_email ?? "",
      customerCompany: row.customer_company ?? "",
      customerAddress: row.customer_address ?? "",
      customerPhone: row.customer_phone ?? "",
      items: toItems(row.line_items),
      shippingLabel: row.shipping_label ?? "",
      shippingMethod: row.shipping_method ?? "",
      shippingQty: row.shipping_qty ?? 1,
      shippingCost: (row.shipping_cents ?? 0) / 100,
      currency,
      notes: row.notes ?? "",
      status: row.status,
      paymentUrl: `/pay/?pi=${encodeURIComponent(row.pi_number)}`,
      ...(warning ? { warning } : {}),
    },
    { status: 200, request: context.request, env }
  );
};
