/**
 * functions/api/pi/update.ts
 *
 * POST /api/pi/update
 *
 * Saves changes to an existing PI (the /administered/edit-pi page).
 *
 * Body: { piNumber, issueDate?, leadTimeText?, paymentTermsText?,
 *         customer: { name, phone, email?, company?, address? },
 *         items: [...], shippingLabel?, shippingMethod?, shippingQty?,
 *         shippingTerm?, shippingCost?, currency, notes? }
 *
 * Money: the client sends major units (dollars). The DB stores cents, and
 * the totals are recomputed server-side from the line items — the client's
 * totals are never trusted.
 *
 * Auth: none — see /api/pi/create for why a shared-secret header is not
 * real protection here.
 */

import { getSupabase, isPiStoreConfigured, piStoreEnvDiagnostic, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";
import {
  droppedImagesWarning,
  itemsSubtotalCents,
  normalizeItems,
  num,
  text,
  toCents,
  type ItemRow,
} from "../../_lib/pi-items";

interface UpdatePiBody {
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

function isMissingColumn(code?: string, message?: string): boolean {
  if (code === "42703" || code === "PGRST204") return true;
  return /column\s+"?[a-zA-Z0-9_.]+"?\s+does not exist/i.test(message ?? "");
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  if (!isPiStoreConfigured(env)) {
    return jsonResponse(
      {
        error: "PI store is not configured on this deployment.",
        diagnostic: piStoreEnvDiagnostic(env),
      },
      { status: 500, request: context.request, env }
    );
  }

  let body: UpdatePiBody;
  try {
    body = (await context.request.json()) as UpdatePiBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400, request: context.request, env });
  }

  const piNumber = text(body.piNumber);
  if (!piNumber) {
    return jsonResponse({ error: "Missing required field: piNumber" }, { status: 400, request: context.request, env });
  }

  const currency = text(body.currency).toUpperCase();
  if (!currency) {
    return jsonResponse({ error: "Missing required field: currency" }, { status: 400, request: context.request, env });
  }

  const { items, droppedImages } = normalizeItems(body.items);
  const imageWarning = droppedImagesWarning(droppedImages);
  if (items.length === 0) {
    return jsonResponse({ error: "Missing required field: items" }, { status: 400, request: context.request, env });
  }

  const supabase = getSupabase(env);

  // ── Guard: the PI must exist and still be editable ───────────────────────
  const { data: existing, error: lookupErr } = await supabase
    .from("proforma_invoices")
    .select("id, status")
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug)
    .maybeSingle<{ id: number; status: string }>();

  if (lookupErr) {
    return jsonResponse({ error: lookupErr.message }, { status: 500, request: context.request, env });
  }
  if (!existing) {
    return jsonResponse({ error: `PI "${piNumber}" was not found.` }, { status: 404, request: context.request, env });
  }
  if (existing.status !== "draft" && existing.status !== "sent") {
    return jsonResponse(
      {
        error: `PI "${piNumber}" has status "${existing.status}" and can no longer be edited.`,
        hint: "Only draft and sent PIs can be changed.",
      },
      { status: 409, request: context.request, env }
    );
  }

  // ── Amounts (recomputed server-side) ─────────────────────────────────────
  const shippingQty = Math.max(1, num(body.shippingQty) || 1);
  const shippingTotal = num(body.shippingCost) * shippingQty;
  const subtotalCents = itemsSubtotalCents(items);
  const shippingCents = toCents(shippingTotal);
  const totalCents = subtotalCents + shippingCents;

  const customer = body.customer ?? {};
  const notes = text(body.notes) || text(body.paymentTermsText) || null;

  const basePatch: Record<string, unknown> = {
    customer_name: text(customer.name) || null,
    customer_email: text(customer.email) || null,
    customer_phone: text(customer.phone) || null,
    customer_company: text(customer.company) || null,
    customer_address: text(customer.address) || null,
    currency,
    line_items: items,
    subtotal_cents: subtotalCents,
    shipping_cents: shippingCents,
    total_cents: totalCents,
    bank_account_currency: currency,
    notes,
  };

  // Extended metadata — only present after 20261025_pi_admin_fields.sql runs.
  const extendedPatch: Record<string, unknown> = {
    ...basePatch,
    issue_date: text(body.issueDate) || null,
    lead_time_text: text(body.leadTimeText) || null,
    shipping_label: text(body.shippingLabel) || null,
    shipping_method: text(body.shippingMethod) || null,
    shipping_qty: shippingQty,
    shipping_term: text(body.shippingTerm) || null,
  };

  const warnings: string[] = imageWarning ? [imageWarning] : [];

  const first = await supabase
    .from("proforma_invoices")
    .update(extendedPatch)
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug)
    .select("id, pi_number, status");

  if (first.error) {
    if (isMissingColumn(first.error.code, first.error.message)) {
      // The extra columns are not there yet — save the core fields anyway.
      const retry = await supabase
        .from("proforma_invoices")
        .update(basePatch)
        .eq("pi_number", piNumber)
        .eq("site_slug", siteSlug)
        .select("id, pi_number, status");
      if (retry.error) {
        return jsonResponse({ error: retry.error.message }, { status: 500, request: context.request, env });
      }
      warnings.push(`Saved without ISSUE DATE / LEAD TIME / SHIPPING details — run supabase/migrations/20261025_pi_admin_fields.sql in the Supabase SQL editor to store them. (missing column: ${OPTIONAL_COLUMNS.join(", ")})`);
    } else {
      return jsonResponse({ error: first.error.message }, { status: 500, request: context.request, env });
    }
  }

  return jsonResponse(
    {
      success: true,
      piNumber,
      total: totalCents / 100,
      totalCents,
      subtotalCents,
      shippingCents,
      currency,
      status: existing.status,
      paymentUrl: `/pay/?pi=${encodeURIComponent(piNumber)}`,
      ...(warnings.length > 0 ? { warning: warnings.join(" ") } : {}),
    },
    { status: 200, request: context.request, env }
  );
};
