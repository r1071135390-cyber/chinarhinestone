/**
 * functions/api/admin/bank-accounts.ts
 *
 * GET  /api/admin/bank-accounts          — list 4 currencies (read from BANK Supabase)
 * PUT  /api/admin/bank-accounts          — DISABLED (BANK is read-only across sites)
 *
 * Bank accounts live in a shared BANK Supabase project owned by sublimapparel.
 * Chinarhinestone reads from there to keep bank info in sync automatically.
 * Edits must happen in sublimapparel's admin or directly in the BANK DB — the
 * factory has a single source of truth across all sites.
 */

import { getBankSupabase, getSupabase, isBankSupabaseConfigured, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";

interface BankAccountRow {
  id: number;
  site_slug: string;
  currency: string;
  label: string;
  symbol: string;
  beneficiary: string;
  company_address: string;
  bank_name: string;
  account: string;
  swift: string;
  bank_address: string;
  iban: string | null;
  bank_country: string | null;
  routing_number: string | null;
  cnaps: string | null;
  intermediary_bank: string | null;
  intermediary_swift: string | null;
  notes: string | null;
  updated_at: string;
}

/**
 * Filter site_slug used when reading from the shared BANK Supabase.
 * sublimapparel's BANK DB rows are stored under site_slug='sublimapparel'.
 */
const BANK_SOURCE_SITE = "sublimapparel";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const env = context.env;

  // Diagnostic — exposes which env vars are set so we can tell from the
  // JSON response whether missing config is the cause of any 500.
  // Returns boolean only (NOT values) so no secrets leak.
  const diag = {
    bankUrlSet: Boolean(env.BANK_SUPABASE_URL),
    bankKeySet: Boolean(env.BANK_SUPABASE_SERVICE_ROLE_KEY),
    mainUrlSet: Boolean(env.SUPABASE_URL),
    mainKeySet: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    siteSlug: env.SITE_SLUG ?? null,
  };

  let bankConfigured = false;
  let supabase;
  try {
    bankConfigured = isBankSupabaseConfigured(env);
    supabase = bankConfigured ? getBankSupabase(env) : getSupabase(env);
  } catch (e) {
    return jsonResponse(
      { error: (e as Error).message, bankConfigured: false, ...diag },
      { status: 500, request: context.request, env }
    );
  }

  // When BANK is configured, rows come from site_slug='sublimapparel'.
  // When BANK is missing, we fall back to this site's own bank_accounts
  // (site_slug=chinarhinestone) for local-dev convenience.
  const filterSlug = bankConfigured ? BANK_SOURCE_SITE : env.SITE_SLUG ?? "chinarhinestone";

  let data, error;
  try {
    ({ data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("site_slug", filterSlug)
      .order("currency", { ascending: true }));
  } catch (e) {
    return jsonResponse(
      { error: (e as Error).message, bankConfigured, ...diag },
      { status: 500, request: context.request, env }
    );
  }

  if (error) {
    return jsonResponse({ error: error.message, bankConfigured, ...diag }, { status: 500, request: context.request, env });
  }
  return jsonResponse(
    {
      accounts: data ?? [],
      bankSource: bankConfigured ? "shared-bank-supabase" : "local-main-supabase",
      readOnly: bankConfigured,
      bankConfigured,
      ...diag,
    },
    { status: 200, request: context.request, env }
  );
};

/**
 * PUT is disabled because:
 *   - The BANK DB is the shared source of truth across all factory sites.
 *   - Edits made through chinarhinestone's admin would silently break
 *     sublimapparel.com PI defaults.
 *   - Edits should be done via sublimapparel's admin or the BANK SQL editor.
 */
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const env = context.env;
  return jsonResponse(
    {
      error: "Read-only",
      message:
        "Bank accounts are managed in the shared BANK Supabase (sublimapparel-owned). Edits through this site are disabled. Update sublimapparel's admin or the BANK DB directly.",
    },
    { status: 405, request: context.request, env }
  );
};
