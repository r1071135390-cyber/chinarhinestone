/**
 * functions/api/pi/mark-paid.ts
 *
 * POST /api/pi/mark-paid
 *
 * Body: { piNumber: string, paid?: boolean, paymentMethod?: string, reference?: string }
 *
 * Admin endpoint: lets the owner mark a PI as paid by hand.
 *
 * Why this exists: `status = "paid"` was only ever written by Stripe
 * (the webhook and the PaymentIntent recovery path). A customer who paid
 * by bank transfer never triggered either one — the PI stayed at
 * "awaiting_payment" forever and the admin list could not show it as
 * paid. This endpoint is the missing manual path.
 *
 * It also supports the reverse move (paid: false) so a mis-click can be
 * undone: the PI goes back to "sent" and the paid_at / payment_method
 * columns are cleared.
 *
 * The payment ledger (pi_payments) is deliberately NOT written here. That
 * table counts *Stripe* payments and is what drives the duplicate-payment
 * warning; a manual bank-transfer confirmation must not add a fake Stripe
 * row or every manually-paid invoice would look like a card payment.
 *
 * Auth: none — see /api/pi/create for why a shared-secret header is not
 * real protection here. The admin UI is password-gated and asks the owner
 * to type the PI number before the state change is applied.
 */

import { getSupabase, isPiStoreConfigured, piStoreEnvDiagnostic, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";

interface MarkPaidBody {
  piNumber?: string;
  /** false → revert the PI to "sent" and clear the paid fields. */
  paid?: boolean;
  /** "bank_transfer" | "stripe" | "manual" — defaults to "bank_transfer". */
  paymentMethod?: string;
  /** Bank transfer reference (SWIFT / wire confirmation number). */
  reference?: string;
}

const ALLOWED_PAYMENT_METHODS = ["bank_transfer", "stripe", "manual"];

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

  let body: MarkPaidBody;
  try {
    body = (await context.request.json()) as MarkPaidBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400, request: context.request, env });
  }

  const piNumber = (body.piNumber ?? "").trim();
  if (!piNumber) {
    return jsonResponse({ error: "Missing required field: piNumber" }, { status: 400, request: context.request, env });
  }

  const shouldUnmark = body.paid === false;

  const supabase = getSupabase(env);

  const { data: pi, error: lookupErr } = await supabase
    .from("proforma_invoices")
    .select("id, status, payment_method, paid_at")
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug)
    .maybeSingle<{ id: number; status: string; payment_method: string | null; paid_at: string | null }>();

  if (lookupErr) {
    return jsonResponse({ error: lookupErr.message }, { status: 500, request: context.request, env });
  }
  if (!pi) {
    return jsonResponse(
      { error: `PI "${piNumber}" was not found.` },
      { status: 404, request: context.request, env }
    );
  }

  const currentStatus = (pi.status ?? "").toLowerCase();

  // ── Undo: put the PI back into "sent" and clear the paid fields ─────────
  if (shouldUnmark) {
    if (currentStatus !== "paid") {
      return jsonResponse(
        {
          error: `PI "${piNumber}" is not marked as paid.`,
          hint: "Only a paid PI can be reverted to sent.",
        },
        { status: 409, request: context.request, env }
      );
    }

    const { error: updateErr } = await supabase
      .from("proforma_invoices")
      .update({
        status: "sent",
        paid_at: null,
        payment_method: null,
        updated_at: new Date().toISOString(),
      })
      .eq("pi_number", piNumber)
      .eq("site_slug", siteSlug);

    if (updateErr) {
      return jsonResponse({ error: updateErr.message }, { status: 500, request: context.request, env });
    }

    return jsonResponse(
      { success: true, piNumber, status: "sent", paid: false },
      { status: 200, request: context.request, env }
    );
  }

  // ── Mark as paid ─────────────────────────────────────────────────────────
  if (currentStatus === "paid") {
    return jsonResponse(
      {
        error: `PI "${piNumber}" is already marked as paid.`,
        hint: "Use \"Revert to sent\" if this was a mistake.",
        status: "paid",
        paidAt: pi.paid_at,
      },
      { status: 409, request: context.request, env }
    );
  }

  if (currentStatus === "cancelled" || currentStatus === "canceled" || currentStatus === "refunded") {
    return jsonResponse(
      {
        error: `PI "${piNumber}" is closed (${currentStatus}) and cannot be marked as paid.`,
        hint: "Refund or cancel it from Stripe first, then create a new invoice.",
      },
      { status: 409, request: context.request, env }
    );
  }

  const requestedMethod = (body.paymentMethod ?? "").trim().toLowerCase();
  const paymentMethod = ALLOWED_PAYMENT_METHODS.includes(requestedMethod)
    ? requestedMethod
    : "bank_transfer";

  const reference = (body.reference ?? "").trim().slice(0, 200);

  const now = new Date().toISOString();

  const patch: Record<string, unknown> = {
    status: "paid",
    paid_at: now,
    payment_method: paymentMethod,
    updated_at: now,
  };

  // Keep the bank-transfer reference the customer gave us on /pay, and add
  // the owner's own reference when one is supplied.
  if (reference) {
    patch.bank_transfer_reference = reference;
  }

  const { error: updateErr } = await supabase
    .from("proforma_invoices")
    .update(patch)
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug);

  if (updateErr) {
    // Older deployments may not have every column yet — retry with the
    // minimal set so the status change still lands.
    const retry = await supabase
      .from("proforma_invoices")
      .update({ status: "paid", paid_at: now, payment_method: paymentMethod })
      .eq("pi_number", piNumber)
      .eq("site_slug", siteSlug);

    if (retry.error) {
      return jsonResponse({ error: updateErr.message }, { status: 500, request: context.request, env });
    }
  }

  return jsonResponse(
    {
      success: true,
      piNumber,
      status: "paid",
      paid: true,
      paidAt: now,
      paymentMethod,
    },
    { status: 200, request: context.request, env }
  );
};
