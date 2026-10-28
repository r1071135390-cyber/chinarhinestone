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
 * Three guards keep real money safe:
 *   1. A "paid" invoice is refused. The money has to be refunded first,
 *      which flips the status to "refunded".
 *   2. An invoice with a row in the Stripe payment ledger is refused unless
 *      it was refunded. Without this a missed webhook could let a paid
 *      invoice be deleted and the payment would disappear from the books.
 *      The invoice's ledger rows are removed together with the invoice.
 *   3. When the invoice row carries a Stripe PaymentIntent id, Stripe is
 *      asked directly whether that intent succeeded. This catches the case
 *      the other two guards cannot see: the customer paid, but the webhook
 *      never arrived, so the invoice still says "sent" and the ledger is
 *      empty. Stripe is the source of truth for its own payments.
 *
 * Auth: none — see /api/pi/create for why a shared-secret header is not
 * real protection here. The admin UI is password-gated and asks the owner
 * to type the PI number before deleting.
 */

import { getSupabase, isPiStoreConfigured, piStoreEnvDiagnostic, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";
import { getStripe } from "../../_lib/stripe";
import { PagesFunction } from "../../_lib/pages-function";

interface DeleteBody {
  piNumber?: string;
}

interface ExistingPi {
  id: number;
  status: string;
  stripe_payment_intent_id: string | null;
}

/** The deployment predates a column the query asked for. */
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

  let existing: ExistingPi | null = null;

  const lookup = await supabase
    .from("proforma_invoices")
    .select("id, status, stripe_payment_intent_id")
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug)
    .maybeSingle<ExistingPi>();

  if (lookup.error) {
    if (!isMissingColumn(lookup.error.code, lookup.error.message)) {
      return jsonResponse({ error: lookup.error.message }, { status: 500, request: context.request, env });
    }

    // Older deployment without the Stripe column — retry without it. The
    // Stripe cross-check below is then skipped, the other guards still run.
    const retry = await supabase
      .from("proforma_invoices")
      .select("id, status")
      .eq("pi_number", piNumber)
      .eq("site_slug", siteSlug)
      .maybeSingle<{ id: number; status: string }>();

    if (retry.error) {
      return jsonResponse({ error: retry.error.message }, { status: 500, request: context.request, env });
    }
    existing = retry.data ? { ...retry.data, stripe_payment_intent_id: null } : null;
  } else {
    existing = lookup.data;
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

  // ── Stripe cross-check ───────────────────────────────────────────────────
  // The ledger is written by the webhook, so a payment whose webhook never
  // arrived leaves no trace there — the invoice still says "sent". Stripe
  // knows whether its own PaymentIntent succeeded, so ask it directly
  // before removing an invoice that already has a PaymentIntent id.
  //
  // This also repairs the invoice row when the webhook was missed, so the
  // admin list stops showing a paid invoice as unpaid.
  if (
    existing.status !== "refunded" &&
    existing.stripe_payment_intent_id &&
    env.STRIPE_SECRET_KEY
  ) {
    try {
      const stripe = getStripe(env.STRIPE_SECRET_KEY);
      const intent = await stripe.paymentIntents.retrieve(existing.stripe_payment_intent_id);

      if (intent.status === "succeeded") {
        // The customer paid but the webhook never landed — flip the row so
        // the books agree with Stripe, then refuse the delete.
        await supabase
          .from("proforma_invoices")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            payment_method: "stripe",
          })
          .eq("pi_number", piNumber)
          .eq("site_slug", siteSlug);

        return jsonResponse(
          {
            error: `PI "${piNumber}" was paid via Stripe and cannot be deleted.`,
            hint: "Refund it from the Stripe Dashboard first, then delete it.",
          },
          { status: 409, request: context.request, env }
        );
      }

      // The intent was never paid. Cancel it so a customer who still has the
      // payment page open in another tab cannot pay an invoice that no
      // longer exists — the money would arrive for a row that is gone.
      if (intent.status !== "canceled") {
        try {
          await stripe.paymentIntents.cancel(existing.stripe_payment_intent_id);
        } catch {
          // Already cancelled or not cancellable — the delete can proceed.
        }
      }
    } catch {
      // Stripe is unreachable or the intent is gone — do not block the
      // cleanup on an API hiccup. The other guards still apply.
    }
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
