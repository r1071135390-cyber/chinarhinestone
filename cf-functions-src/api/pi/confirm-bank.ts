/**
 * functions/api/pi/confirm-bank.ts
 *
 * POST /api/pi/confirm-bank
 *
 * Body: { pi_number: string, reference: string, sender_name?: string }
 *
 * Customer-facing endpoint: customer clicks "I have wired the money"
 * after reading bank instructions on /pay. We mark the PI as
 * `awaiting_payment` (or `bank_transfer_pending`) so the owner can
 * reconcile against actual bank statements before flipping to `paid`.
 *
 * Optional auth: we check a shared secret in the X-Confirm-Token header
 * if CONFIRM_TOKEN env var is set. This prevents random people from
 * marking PIs as awaiting without having seen the bank info.
 */

import { getSupabase, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";

interface ConfirmBody {
  pi_number?: string;
  reference?: string;
  sender_name?: string;
}

export const onRequestPost: PagesFunction<Env & { CONFIRM_TOKEN?: string }> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  // Optional soft-auth: only callers with the token can submit
  if (env.CONFIRM_TOKEN) {
    const supplied = context.request.headers.get("X-Confirm-Token") ?? "";
    if (supplied !== env.CONFIRM_TOKEN) {
      return jsonResponse({ error: "Forbidden" }, { status: 403, request: context.request, env });
    }
  }

  let body: ConfirmBody;
  try {
    body = await context.request.json<ConfirmBody>();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400, request: context.request, env });
  }

  const piNumber = (body.pi_number ?? "").trim();
  const reference = (body.reference ?? "").trim().slice(0, 200);
  const senderName = (body.sender_name ?? "").trim().slice(0, 200);

  if (!piNumber) {
    return jsonResponse({ error: "Missing pi_number" }, { status: 400, request: context.request, env });
  }

  const supabase = getSupabase(env);
  const { data: pi, error: lookupErr } = await supabase
    .from("proforma_invoices")
    .select("pi_number, status")
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug)
    .maybeSingle();

  if (lookupErr) {
    return jsonResponse({ error: lookupErr.message }, { status: 500, request: context.request, env });
  }
  if (!pi) {
    return jsonResponse({ error: "PI not found" }, { status: 404, request: context.request, env });
  }
  if (pi.status === "paid") {
    return jsonResponse({ error: "PI already paid" }, { status: 409, request: context.request, env });
  }

  const { error: updateErr } = await supabase
    .from("proforma_invoices")
    .update({
      status: "awaiting_payment",
      bank_transfer_reference: reference || null,
      bank_transfer_sender: senderName || null,
      bank_transfer_marked_at: new Date().toISOString(),
    })
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug);

  if (updateErr) {
    return jsonResponse({ error: updateErr.message }, { status: 500, request: context.request, env });
  }

  return jsonResponse({ ok: true }, { status: 200, request: context.request, env });
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
