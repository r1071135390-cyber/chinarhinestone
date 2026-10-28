/**
 * functions/api/pi/delete.ts
 *
 * POST /api/pi/delete
 *
 * Body: { piNumber: string }
 *
 * Permanently removes one PI (the delete button in the admin PI lists).
 *
 * This is the cleanup path for invoices that were never valid — abandoned
 * drafts, duplicates, invoices the customer walked away from, cancelled or
 * refunded ones.
 *
 * Two guards keep real money safe:
 *   1. A "paid" invoice is refused. The money has to be refunded first,
 *      which flips the status to "refunded".
 *   2. An invoice with a row in the Stripe payment ledger is refused unless
 *      it was refunded. Without this a missed webhook could let a paid
 *      invoice be deleted and the payment would disappear from the books.
 *      The invoice's ledger rows are removed together with the invoice.
 *
 * Auth: none — see /api/pi/create for why a shared-secret header is not
 * real protection here. The admin UI is password-gated and asks the owner
 * to type the PI number before deleting.
 */

import { getSupabase, isPiStoreConfigured, piStoreEnvDiagnostic, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";

interface DeleteBody {
  piNumber?: string;
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

  let body: DeleteBody;
  try {
    body = (await context.request.json()) as DeleteBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400, request: context.request, env });
  }

  const piNumber = (body.piNumber ?? "").trim();
  if (!piNumber) {
    return jsonResponse({ error: "Missing required field: piNumber" }, { status: 400, request: context.request, env });
  }

  const supabase = getSupabase(env);

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
    return jsonResponse(
      { error: `PI "${piNumber}" was not found — it may already be deleted.` },
      { status: 404, request: context.request, env }
    );
  }
  if (existing.status === "paid") {
    return jsonResponse(
      {
        error: `PI "${piNumber}" is already paid and cannot be deleted.`,
        hint: "Refund it from the Stripe Dashboard first, then mark it refunded.",
      },
      { status: 409, request: context.request, env }
    );
  }

  // ── Payment ledger guard ─────────────────────────────────────────────────
  // An invoice that already received a real Stripe payment is protected too,
  // even if the status was never flipped to "paid" (a missed webhook, a
  // manual override). Deleting it would make the money invisible. Once the
  // payment has been refunded the status becomes "refunded" and the invoice
  // can be cleaned up.
  //
  // The ledger is optional — it only exists after
  // supabase/migrations/20261026_pi_payment_tracking.sql has run. When the
  // table is missing the query fails and we treat it as "no payments".
  const { data: ledgerRows } = await supabase
    .from("pi_payments")
    .select("id")
    .eq("site_slug", siteSlug)
    .eq("pi_number", piNumber);

  const hasPayments = Array.isArray(ledgerRows) && ledgerRows.length > 0;

  if (hasPayments && existing.status !== "refunded") {
    return jsonResponse(
      {
        error: `PI "${piNumber}" has a recorded payment that has not been refunded.`,
        hint: "Refund it from the Stripe Dashboard first, then delete it.",
      },
      { status: 409, request: context.request, env }
    );
  }

  const { error: deleteErr } = await supabase
    .from("proforma_invoices")
    .delete()
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug);

  if (deleteErr) {
    return jsonResponse({ error: deleteErr.message }, { status: 500, request: context.request, env });
  }

  // The invoice is gone, so its ledger rows would be orphans pointing at a
  // PI number that no longer exists. Clean them up; a failure here does not
  // undo the delete.
  if (hasPayments) {
    await supabase
      .from("pi_payments")
      .delete()
      .eq("site_slug", siteSlug)
      .eq("pi_number", piNumber);
  }

  return jsonResponse({ success: true, piNumber }, { status: 200, request: context.request, env });
};
