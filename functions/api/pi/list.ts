/**
 * functions/api/pi/list.ts
 *
 * GET /api/pi/list
 *
 * Admin overview of every PI for this site: the rows the /admin/summary
 * table renders plus the summary numbers behind its stat cards.
 *
 * Response: { summary: SummaryStats, pis: PiListItem[] }
 *
 * Money: the DB stores cents. Per-currency totals stay in the PI's own
 * currency; the "USD Equivalent" headline converts with a fixed rate table.
 *
 * Auth: none — see /api/pi/create for why a shared-secret header is not
 * real protection here.
 */

import { getSupabase, isPiStoreConfigured, piStoreEnvDiagnostic, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";

const ROW_LIMIT = 500;

const SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", CNY: "¥" };

/** Base USD: 1 USD = <rate> units of the target currency. */
const FX_RATES: Record<string, number> = { EUR: 0.92, CNY: 7.24, GBP: 0.79 };
const FX_SOURCE = "fixed rate table";

interface PiRow {
  id: number;
  pi_number: string;
  customer_name: string | null;
  customer_company: string | null;
  total_cents: number | null;
  currency: string | null;
  status: string | null;
  created_at: string;
}

function formatCents(cents: number, currency: string): string {
  const symbol = SYMBOLS[currency] ?? `${currency} `;
  return `${symbol}${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Convert cents of `currency` into cents of USD. */
function toUsdCents(cents: number, currency: string): number {
  const rate = FX_RATES[currency];
  if (!rate) return cents; // unknown currency — treated as 1:1
  return Math.round(cents / rate);
}

function isSameUtcMonth(iso: string, now: Date): boolean {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  return (
    d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth()
  );
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
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

  const supabase = getSupabase(env);

  const { data, error } = await supabase
    .from("proforma_invoices")
    .select("id, pi_number, customer_name, customer_company, total_cents, currency, status, created_at")
    .eq("site_slug", siteSlug)
    .order("created_at", { ascending: false })
    .limit(ROW_LIMIT);

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500, request: context.request, env });
  }

  const rows = (data ?? []) as PiRow[];

  // ── Payment ledger ────────────────────────────────────────────────────────
  // Every successful Stripe payment is written to pi_payments by the webhook.
  // More than one ledger row for the same invoice means the customer paid
  // twice — the admin list surfaces that so the extra payment can be
  // refunded. If the table does not exist yet (migration not applied) the
  // query fails and we simply report zero payments.
  const paymentTotals = new Map<string, { count: number; cents: number }>();
  const { data: paymentRows, error: paymentsError } = await supabase
    .from("pi_payments")
    .select("pi_number, amount_cents")
    .eq("site_slug", siteSlug);

  if (!paymentsError && paymentRows) {
    for (const row of paymentRows as { pi_number: string; amount_cents: number | null }[]) {
      const entry = paymentTotals.get(row.pi_number) ?? { count: 0, cents: 0 };
      entry.count += 1;
      entry.cents += row.amount_cents ?? 0;
      paymentTotals.set(row.pi_number, entry);
    }
  }

  // Total count is separate — the list above is capped at ROW_LIMIT.
  const { count } = await supabase
    .from("proforma_invoices")
    .select("id", { count: "exact", head: true })
    .eq("site_slug", siteSlug);

  const now = new Date();
  const totalsByCurrency: Record<string, { cents: number; display: string }> = {};
  const monthTotalsByCurrency: Record<string, { cents: number; display: string }> = {};
  let totalUsdCents = 0;
  let monthUsdCents = 0;
  let monthCount = 0;

  for (const row of rows) {
    const currency = (row.currency ?? "USD").toUpperCase();
    const cents = row.total_cents ?? 0;

    totalsByCurrency[currency] = totalsByCurrency[currency] ?? { cents: 0, display: "" };
    totalsByCurrency[currency].cents += cents;
    totalUsdCents += toUsdCents(cents, currency);

    if (isSameUtcMonth(row.created_at, now)) {
      monthCount += 1;
      monthTotalsByCurrency[currency] = monthTotalsByCurrency[currency] ?? { cents: 0, display: "" };
      monthTotalsByCurrency[currency].cents += cents;
      monthUsdCents += toUsdCents(cents, currency);
    }
  }

  for (const [code, bucket] of Object.entries(totalsByCurrency)) {
    bucket.display = formatCents(bucket.cents, code);
  }
  for (const [code, bucket] of Object.entries(monthTotalsByCurrency)) {
    bucket.display = formatCents(bucket.cents, code);
  }

  const pis = rows.map((row) => {
    const currency = (row.currency ?? "USD").toUpperCase();
    const cents = row.total_cents ?? 0;
    const payments = paymentTotals.get(row.pi_number);
    return {
      id: row.id,
      piNumber: row.pi_number,
      customerName: row.customer_name,
      customerCompany: row.customer_company,
      totalCents: cents,
      currency,
      totalDisplay: formatCents(cents, currency),
      status: row.status,
      createdAt: row.created_at,
      paymentCount: payments?.count ?? 0,
      paidAmountCents: payments?.cents ?? 0,
      duplicatePayment: (payments?.count ?? 0) > 1,
    };
  });

  const duplicatePaymentCount = [...paymentTotals.values()].filter((p) => p.count > 1).length;

  const summary = {
    totalCount: count ?? rows.length,
    shownCount: pis.length,
    monthCount,
    duplicatePaymentCount,
    totalsByCurrency,
    monthTotalsByCurrency,
    totalValueUsdCents: totalUsdCents,
    totalValueUsdDisplay: formatCents(totalUsdCents, "USD"),
    monthValueUsdCents: monthUsdCents,
    monthValueUsdDisplay: formatCents(monthUsdCents, "USD"),
    fx: {
      baseCurrency: "USD",
      rates: FX_RATES,
      asOf: now.toISOString().slice(0, 10),
      source: FX_SOURCE,
    },
  };

  return jsonResponse({ summary, pis }, { status: 200, request: context.request, env });
};
