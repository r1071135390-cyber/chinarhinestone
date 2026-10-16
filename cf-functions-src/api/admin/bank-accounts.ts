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

import { getBankSupabase, isBankSupabaseConfigured, type Env } from "../../../_lib/supabase";
import { jsonResponse } from "../../../_lib/cors";

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
  const bankConfigured = isBankSupabaseConfigured(env);
  const supabase = getBankSupabase(env);

  // When BANK is configured, rows come from site_slug='sublimapparel'.
  // When BANK is missing, we fall back to this site's own bank_accounts
  // (site_slug=chinarhinestone) for local-dev convenience.
  const filterSlug = bankConfigured ? BANK_SOURCE_SITE : env.SITE_SLUG ?? "chinarhinestone";

  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("site_slug", filterSlug)
    .order("currency", { ascending: true });

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500, request: context.request, env });
  }
  return jsonResponse(
    {
      accounts: data ?? [],
      bankSource: bankConfigured ? "shared-bank-supabase" : "local-main-supabase",
      readOnly: bankConfigured,
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
