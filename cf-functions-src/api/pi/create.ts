/**
 * functions/api/pi/create.ts
 *
 * POST /api/pi/create
 *
 * Body: the full PI record. Inserts into proforma_invoices.
 * If `pi_number` is omitted, we generate one via next_pi_number('CH').
 * Status is set to 'sent' by default (owner is creating live invoices).
 *
 * Auth: soft — X-Admin-Token must match ADMIN_TOKEN env var if set.
 */

import { getSupabase, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";

interface CreatePiBody {
  pi_number?: string;
  status?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_company?: string;
  customer_address?: string;
  customer_country?: string;
  currency: string;
  line_items: unknown[];
  subtotal_cents?: number;
  shipping_cents?: number;
  total_cents: number;
  bank_account_currency?: string;
  notes?: string;
  valid_until?: string;
}

export const onRequestPost: PagesFunction<Env & { ADMIN_TOKEN?: string }> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  if (env.ADMIN_TOKEN) {
    const supplied = context.request.headers.get("X-Admin-Token") ?? "";
    if (supplied !== env.ADMIN_TOKEN) {
      return jsonResponse({ error: "Forbidden" }, { status: 403, request: context.request, env });
    }
  }

  let body: CreatePiBody;
  try {
    body = await context.request.json<CreatePiBody>();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400, request: context.request, env });
  }

  if (!body.currency || !Array.isArray(body.line_items) || !Number.isFinite(body.total_cents)) {
    return jsonResponse(
      { error: "Missing required fields: currency, line_items, total_cents" },
      { status: 400, request: context.request, env }
    );
  }

  const supabase = getSupabase(env);

  // Generate pi_number if not provided
  let piNumber = (body.pi_number ?? "").trim();
  if (!piNumber) {
    const { data: generated, error: rpcErr } = await supabase.rpc("next_pi_number", { prefix: "CH" });
    if (rpcErr || !generated) {
      return jsonResponse(
        { error: rpcErr?.message ?? "Failed to generate pi_number" },
        { status: 500, request: context.request, env }
      );
    }
    piNumber = generated as string;
  }

  const { data, error } = await supabase
    .from("proforma_invoices")
    .insert({
      pi_number: piNumber,
      site_slug: siteSlug,
      status: body.status ?? "sent",
      customer_name: body.customer_name ?? null,
      customer_email: body.customer_email ?? null,
      customer_phone: body.customer_phone ?? null,
      customer_company: body.customer_company ?? null,
      customer_address: body.customer_address ?? null,
      customer_country: body.customer_country ?? null,
      currency: body.currency,
      line_items: body.line_items,
      subtotal_cents: body.subtotal_cents ?? null,
      shipping_cents: body.shipping_cents ?? null,
      total_cents: body.total_cents,
      bank_account_currency: body.bank_account_currency ?? null,
      notes: body.notes ?? null,
      valid_until: body.valid_until ?? null,
    })
    .select("pi_number, status, created_at")
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500, request: context.request, env });
  }

  return jsonResponse({ pi: data }, { status: 201, request: context.request, env });
};
