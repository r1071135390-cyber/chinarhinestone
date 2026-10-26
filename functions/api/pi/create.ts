/**
 * functions/api/pi/create.ts
 *
 * POST /api/pi/create
 *
 * Accepts the admin "New PI" payload (camelCase, as produced by
 * app/admin/new-pi/NewPIClient.tsx) and inserts one row into
 * proforma_invoices.
 *
 * Auth: none. The browser cannot hold a secret — any token the client sends
 * is readable from the bundle — so a shared-secret header is not real
 * protection. This follows the same model as /api/admin/customers/list and
 * /api/admin/bank-accounts.
 *
 * Money: the client sends major units (dollars). The DB stores cents
 * (subtotal_cents / shipping_cents / total_cents), so every amount is
 * converted here. Totals are recomputed server-side from the line items —
 * the client's totals are never trusted.
 */

import { getSupabase, isPiStoreConfigured, piStoreEnvDiagnostic, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";
import {
  itemsSubtotalCents,
  normalizeItems,
  text,
  toCents,
  type ItemRow,
} from "../../_lib/pi-items";
import { formatPiNumber, PI_NUMBER_PREFIX } from "../../_lib/pi-number";

interface CreatePiBody {
  piNumber?: string;
  issueDate?: string;
  leadTimeText?: string;
  paymentTermsText?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    country?: string;
  };
  items?: ItemRow[];
  shippingLabel?: string;
  shippingMethod?: string;
  shippingQty?: number;
  shippingTerm?: string;
  shippingCost?: number;
  currency?: string;
  notes?: string;
}

/** Columns added by supabase/migrations/20261025_pi_admin_fields.sql. */
const OPTIONAL_COLUMNS = [
  "issue_date",
  "lead_time_text",
  "shipping_label",
  "shipping_method",
  "shipping_qty",
  "shipping_term",
] as const;

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  // The PI store lives in this site's own Supabase project. Without the
  // service_role key nothing can be saved — say so plainly, with the exact
  // setup steps, instead of throwing.
  if (!isPiStoreConfigured(env)) {
    return jsonResponse(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is not set on this Cloudflare Pages project, so proforma invoices cannot be saved yet.",
        diagnostic: piStoreEnvDiagnostic(env),
      },
      { status: 500, request: context.request, env }
    );
  }

  let body: CreatePiBody;
  try {
    body = (await context.request.json()) as CreatePiBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400, request: context.request, env });
  }

  const currency = text(body.currency).toUpperCase();
  const items = normalizeItems(body.items);

  if (!currency) {
    return jsonResponse({ error: "Missing required field: currency" }, { status: 400, request: context.request, env });
  }
  if (items.length === 0) {
    return jsonResponse({ error: "Missing required field: items" }, { status: 400, request: context.request, env });
  }

  const supabase = getSupabase(env);

  // ── PI number ────────────────────────────────────────────────────────────
  let piNumber = text(body.piNumber);
  if (!piNumber) {
    const { data: generated, error: rpcErr } = await supabase.rpc("next_pi_number", { prefix: PI_NUMBER_PREFIX });
    if (rpcErr || !generated) {
      return jsonResponse(
        { error: rpcErr?.message ?? "Failed to generate pi_number" },
        { status: 500, request: context.request, env }
      );
    }
    piNumber = formatPiNumber(String(generated));
  }

  // ── Amounts (recomputed server-side) ─────────────────────────────────────
  const shippingQty = Math.max(1, num(body.shippingQty) || 1);
  const shippingTotal = num(body.shippingCost) * shippingQty;
  const subtotalCents = itemsSubtotalCents(items);
  const shippingCents = toCents(shippingTotal);
  const totalCents = subtotalCents + shippingCents;

  const customer = body.customer ?? {};
  const notes = text(body.notes) || text(body.paymentTermsText) || null;

  const baseRow: Record<string, unknown> = {
    pi_number: piNumber,
    site_slug: siteSlug,
    status: "sent",
    customer_name: text(customer.name) || null,
    customer_email: text(customer.email) || null,
    customer_phone: text(customer.phone) || null,
    customer_company: text(customer.company) || null,
    customer_address: text(customer.address) || null,
    customer_country: text(customer.country) || null,
    currency,
    line_items: items,
    subtotal_cents: subtotalCents,
    shipping_cents: shippingCents,
    total_cents: totalCents,
    bank_account_currency: currency,
    notes,
    valid_until: null,
  };

  // Extended metadata — only present after 20261025_pi_admin_fields.sql runs.
  const extendedRow: Record<string, unknown> = {
    ...baseRow,
    issue_date: text(body.issueDate) || null,
    lead_time_text: text(body.leadTimeText) || null,
    shipping_label: text(body.shippingLabel) || null,
    shipping_method: text(body.shippingMethod) || null,
    shipping_qty: shippingQty,
    shipping_term: text(body.shippingTerm) || null,
  };

  const SELECT = "id, pi_number, status, created_at";

  let row: { id: number; pi_number: string; status: string; created_at: string } | null = null;
  let warning: string | undefined;

  const first = await supabase.from("proforma_invoices").insert(extendedRow).select(SELECT).single();

  if (first.error) {
    const code = first.error.code ?? "";
    const msg = first.error.message ?? "";
    const missingColumn =
      code === "42703" || code === "PGRST204" || /does not exist|unknown column/i.test(msg);

    if (missingColumn) {
      // The extra columns are not there yet — save the core record anyway.
      const retry = await supabase.from("proforma_invoices").insert(baseRow).select(SELECT).single();
      if (retry.error) {
        if (retry.error.code === "23505") {
          return jsonResponse(
            { error: `PI number "${piNumber}" already exists. Change the invoice number and save again.` },
            { status: 409, request: context.request, env }
          );
        }
        return jsonResponse({ error: retry.error.message }, { status: 500, request: context.request, env });
      }
      row = retry.data;
      warning = `Saved without ISSUE DATE / LEAD TIME / SHIPPING details — run supabase/migrations/20261025_pi_admin_fields.sql in the Supabase SQL editor to store them. (missing column: ${OPTIONAL_COLUMNS.join(", ")})`;
    } else if (code === "23505") {
      return jsonResponse(
        { error: `PI number "${piNumber}" already exists. Change the invoice number and save again.` },
        { status: 409, request: context.request, env }
      );
    } else {
      return jsonResponse({ error: first.error.message }, { status: 500, request: context.request, env });
    }
  } else {
    row = first.data;
  }

  const total = totalCents / 100;

  return jsonResponse(
    {
      success: true,
      id: row?.id,
      piNumber,
      total,
      totalCents,
      subtotalCents,
      shippingCents,
      currency,
      status: row?.status ?? "sent",
      paymentUrl: `/pay/?pi=${encodeURIComponent(piNumber)}`,
      ...(warning ? { warning } : {}),
    },
    { status: 201, request: context.request, env }
  );
};
