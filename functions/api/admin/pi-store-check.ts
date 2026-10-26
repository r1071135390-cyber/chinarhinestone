/**
 * functions/api/admin/pi-store-check.ts
 *
 * GET /api/admin/pi-store-check
 *
 * Operational check for the PI store. Reports, for every Supabase project
 * this Pages deployment knows about:
 *   - whether the env vars are present
 *   - whether `proforma_invoices` exists and which columns it has
 *   - whether site_slug = 'chinarhinestone' is accepted by its CHECK
 *     constraint (an insert is the only way to see that through the REST
 *     API — service_role cannot run arbitrary SQL)
 *   - whether the `next_pi_number` RPC exists and which argument name it takes
 *
 * This exists because the PI store spans two projects (this site's own
 * project + the shared BANK project) and a misconfigured env var looks
 * identical to a missing table from the outside.
 */

import { getSupabase, getBankSupabase, isBankSupabaseConfigured, isPiStoreConfigured, DEFAULT_SITE_SLUG, type Env } from "../../_lib/supabase";
import { formatPiNumber } from "../../_lib/pi-number";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";
import type { SupabaseClient } from "@supabase/supabase-js";

interface ProbeResult {
  label: string;
  envConfigured: boolean;
  reachable: boolean;
  tableExists?: boolean;
  error?: { code?: string; message: string; details?: string | null };
  /** Columns confirmed present. */
  columns?: string[];
  /** Columns confirmed absent. */
  missingColumns?: string[];
  rowCount?: number;
  /** Distinct site_slug / payment_site values already stored. */
  siteSlugValues?: string[];
  /** Distinct currency values stored in bank_accounts (bank project only). */
  currencies?: string[];
  /** Result of the CHECK-constraint probe: "allowed" | "rejected" | "unknown". */
  siteSlugProbe?: string;
  siteSlugError?: string;
  rpc?: { ok: boolean; error?: string; value?: unknown };
  /**
   * Shape of `proforma_invoices` in the BANK project. That table is the
   * fallback PI store — it is keyed by `payment_site` rather than
   * `site_slug` — so it is probed separately from `bank_accounts`.
   */
  proforma?: {
    tableExists: boolean;
    columns?: string[];
    missingColumns?: string[];
    rowCount?: number;
    siteSlugValues?: string[];
    /** "allowed" | "rejected" | "unknown" — can this site store a row? */
    siteSlugProbe?: string;
    siteSlugError?: string;
  };
}

const COLUMN_CANDIDATES = [
  "id",
  "pi_number",
  "site_slug",
  "payment_site",
  "status",
  "customer_name",
  "customer_email",
  "customer_phone",
  "customer_company",
  "customer_address",
  "customer_country",
  "currency",
  "line_items",
  "subtotal_cents",
  "shipping_cents",
  "total_cents",
  "bank_account_currency",
  "payment_method",
  "notes",
  "valid_until",
  "paid_at",
  "refunded_at",
  "stripe_payment_intent_id",
  "bank_transfer_reference",
  "bank_transfer_sender",
  "bank_transfer_marked_at",
  "created_at",
  "updated_at",
  "issue_date",
  "lead_time_text",
  "shipping_label",
  "shipping_method",
  "shipping_qty",
];

/** Columns of the shared bank_accounts table (BANK project). */
const BANK_COLUMN_CANDIDATES = [
  "id",
  "site_slug",
  "payment_site",
  "currency",
  "label",
  "symbol",
  "beneficiary",
  "company_address",
  "bank_name",
  "account",
  "swift",
  "bank_address",
  "iban",
  "bank_country",
  "routing_number",
  "cnaps",
  "intermediary_bank",
  "notes",
  "created_at",
  "updated_at",
];

/**
 * True when the *relation* is missing — not merely a column.
 *
 * PostgREST says `relation "public.proforma_invoices" does not exist` for a
 * missing table but `column proforma_invoices.site_slug does not exist` for a
 * missing column. Both contain "does not exist", so the match has to look at
 * the noun in front of it.
 */
function isRelationMissing(code?: string, message?: string): boolean {
  if (code === "42P01") return true;
  if (code === "42703" || code === "PGRST204") return false;
  return /relation\b.*does not exist|not found in the schema cache/i.test(message ?? "");
}

/** Pull the offending column name out of a PostgREST "column not found" error. */
function missingColumnName(message?: string): string | null {
  if (!message) return null;
  const match =
    message.match(/Could not find the '([^']+)' column/i) ??
    message.match(/column\s+"?[a-zA-Z0-9_.]+"?\."?([a-zA-Z0-9_]+)"?\s+does not exist/i) ??
    message.match(/column\s+"?([a-zA-Z0-9_.]+?)"?\s+does not exist/i) ??
    message.match(/column\s+([a-zA-Z0-9_]+)\s+of relation/i);
  if (!match) return null;
  // "proforma_invoices.site_slug" → "site_slug"
  return match[1].split(".").pop() ?? match[1];
}

/**
 * Work out which of the candidate columns exist by narrowing the select
 * list. PostgREST rejects the whole query when any listed column is
 * missing, and names the first offender — so one request per missing
 * column, and a single request when everything exists.
 */
async function probeColumns(
  client: SupabaseClient,
  table: string,
  candidates: string[],
): Promise<{ present: string[]; missing: string[]; fatal?: string }> {
  let wanted = [...candidates];
  const missing: string[] = [];

  for (let guard = 0; guard < candidates.length + 1; guard++) {
    const { data, error } = await client
      .from(table)
      .select(wanted.join(","))
      .limit(1);

    if (!error) {
      // Success: every column in `wanted` exists. Anything not in `wanted`
      // was never asked about.
      return { present: wanted, missing };
    }

    if (isRelationMissing(error.code, error.message)) {
      return { present: [], missing, fatal: error.message };
    }

    const offender = missingColumnName(error.message);
    if (offender && wanted.includes(offender)) {
      missing.push(offender);
      wanted = wanted.filter((c) => c !== offender);
      continue;
    }

    // Unknown failure — the columns may all exist but the query is blocked
    // for another reason (e.g. RLS on a specific column).
    return { present: wanted, missing, fatal: error.message };
  }

  return { present: wanted, missing };
}

async function probeMain(
  client: SupabaseClient,
): Promise<ProbeResult> {
  const result: ProbeResult = { label: "main", envConfigured: true, reachable: false };

  const columns = await probeColumns(client, "proforma_invoices", COLUMN_CANDIDATES);
  if (columns.fatal && isRelationMissing(undefined, columns.fatal)) {
    result.tableExists = false;
    result.error = { message: columns.fatal };
    return result;
  }
  if (columns.fatal) {
    result.error = { message: columns.fatal };
  }

  result.reachable = true;
  result.tableExists = true;
  result.columns = columns.present;
  result.missingColumns = columns.missing;

  // How many rows are already stored?
  const count = await client.from("proforma_invoices").select("id", { count: "exact" }).limit(1);
  if (!count.error) result.rowCount = count.count ?? 0;

  // Which site_slug values are already in use?
  const slugColumn = columns.present.includes("site_slug")
    ? "site_slug"
    : columns.present.includes("payment_site")
      ? "payment_site"
      : null;
  if (slugColumn) {
    const slugs = await client.from("proforma_invoices").select(slugColumn).limit(200);
    if (!slugs.error && Array.isArray(slugs.data)) {
      result.siteSlugValues = [
        ...new Set(slugs.data.map((r) => String((r as Record<string, unknown>)[slugColumn] ?? ""))),
      ].filter(Boolean);
    }
  }

  // Is site_slug = 'chinarhinestone' accepted by the CHECK constraint?
  // `.rollback()` sets `Prefer: tx=rollback`, so PostgREST runs the insert
  // in a transaction that is rolled back — constraints, RLS and triggers
  // all fire, but no row is ever persisted.
  if (slugColumn === "site_slug") {
    const marker = `__diag_${Date.now()}`;
    const row: Record<string, unknown> = {
      pi_number: marker,
      site_slug: "chinarhinestone",
      status: "draft",
      currency: "USD",
      line_items: [],
    };
    const insert = await client
      .from("proforma_invoices")
      .insert(row)
      .select("id")
      .rollback();
    if (insert.error) {
      result.siteSlugProbe = "rejected";
      result.siteSlugError = insert.error.message;
    } else {
      result.siteSlugProbe = "allowed";
    }
  }

  // Does next_pi_number exist, and which argument name does it take?
  for (const argName of ["prefix", "p_prefix"]) {
    const rpc = await client.rpc(
      "next_pi_number",
      { [argName]: "CR" } as Record<string, string>,
    );
    if (!rpc.error) {
      result.rpc = { ok: true, value: formatPiNumber(String(rpc.data)) };
      break;
    }
    result.rpc = { ok: false, error: rpc.error.message };
  }

  return result;
}

/**
 * The BANK project holds bank accounts, not invoices. It is shared with
 * sublimapparel and uses that site's schema — so `proforma_invoices` there
 * has `payment_site` instead of `site_slug` and says nothing about this
 * site's PI store. Probe `bank_accounts` instead.
 */
async function probeBank(
  client: SupabaseClient,
): Promise<ProbeResult> {
  const result: ProbeResult = { label: "bank", envConfigured: true, reachable: false };

  const columns = await probeColumns(client, "bank_accounts", BANK_COLUMN_CANDIDATES);
  if (columns.fatal && isRelationMissing(undefined, columns.fatal)) {
    result.tableExists = false;
    result.error = { message: columns.fatal };
    return result;
  }
  if (columns.fatal) {
    result.error = { message: columns.fatal };
  }

  result.reachable = true;
  result.tableExists = true;
  result.columns = columns.present;
  result.missingColumns = columns.missing;

  const count = await client.from("bank_accounts").select("id", { count: "exact" }).limit(1);
  if (!count.error) result.rowCount = count.count ?? 0;

  // Which currencies are actually stored? The column is plain TEXT with no
  // CHECK constraint, so the casing is not guaranteed — surface what is
  // really there instead of guessing.
  const slugColumn = columns.present.includes("site_slug")
    ? "site_slug"
    : columns.present.includes("payment_site")
      ? "payment_site"
      : null;
  if (slugColumn) {
    const slugs = await client.from("bank_accounts").select(slugColumn).limit(200);
    if (!slugs.error && Array.isArray(slugs.data)) {
      result.siteSlugValues = [
        ...new Set(slugs.data.map((r) => String((r as Record<string, unknown>)[slugColumn] ?? ""))),
      ].filter(Boolean);
    }
  }

  if (columns.present.includes("currency")) {
    const currencies = await client.from("bank_accounts").select("currency").limit(200);
    if (!currencies.error && Array.isArray(currencies.data)) {
      result.currencies = [
        ...new Set(currencies.data.map((r) => String((r as Record<string, unknown>).currency ?? ""))),
      ].filter(Boolean);
    }
  }

  return result;
}

/**
 * The BANK project also holds a `proforma_invoices` table — the shared one
 * that sublimapparel uses, keyed by `payment_site` instead of `site_slug`.
 * It is the fallback PI store for this site, so report what it looks like:
 * which columns it has, how many rows, which site values are in use, and
 * whether this site's slug would pass its CHECK constraint.
 */
async function probeBankProforma(
  client: SupabaseClient,
): Promise<NonNullable<ProbeResult["proforma"]>> {
  const result: NonNullable<ProbeResult["proforma"]> = { tableExists: false };

  const columns = await probeColumns(client, "proforma_invoices", COLUMN_CANDIDATES);
  if (columns.fatal && isRelationMissing(undefined, columns.fatal)) {
    return result;
  }

  result.tableExists = true;
  result.columns = columns.present;
  result.missingColumns = columns.missing;

  const count = await client.from("proforma_invoices").select("id", { count: "exact" }).limit(1);
  if (!count.error) result.rowCount = count.count ?? 0;

  const slugColumn = columns.present.includes("site_slug")
    ? "site_slug"
    : columns.present.includes("payment_site")
      ? "payment_site"
      : null;
  if (!slugColumn) return result;

  const slugs = await client.from("proforma_invoices").select(slugColumn).limit(200);
  if (!slugs.error && Array.isArray(slugs.data)) {
    result.siteSlugValues = [
      ...new Set(slugs.data.map((r) => String((r as Record<string, unknown>)[slugColumn] ?? ""))),
    ].filter(Boolean);
  }

  // Would a row for this site be accepted? Rolled back, so nothing is stored.
  const marker = `__diag_${Date.now()}`;
  const insert = await client
    .from("proforma_invoices")
    .insert({
      pi_number: marker,
      [slugColumn]: "chinarhinestone",
      status: "draft",
      currency: "USD",
      line_items: [],
    })
    .select("id")
    .rollback();

  if (!insert.error) {
    result.siteSlugProbe = "allowed";
    return result;
  }
  const message = insert.error.message ?? "";
  result.siteSlugError = message;
  result.siteSlugProbe = /check|violat|invalid input value/i.test(message)
    ? "rejected"
    : "unknown";
  return result;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const mainConfigured = isPiStoreConfigured(env);
  const bankConfigured = isBankSupabaseConfigured(env);

  const projects: ProbeResult[] = [];

  for (const [label, configured] of [
    ["main", mainConfigured],
    ["bank", bankConfigured],
  ] as const) {
    if (!configured) {
      projects.push({
        label,
        envConfigured: false,
        reachable: false,
        error: {
          message:
            label === "main"
              ? "SUPABASE_SERVICE_ROLE_KEY is not set on this Cloudflare Pages project (SUPABASE_URL and SITE_SLUG have built-in defaults)."
              : "BANK_SUPABASE_URL / BANK_SUPABASE_SERVICE_ROLE_KEY are not set.",
        },
      });
      continue;
    }

    try {
      const client = label === "main" ? getSupabase(env) : getBankSupabase(env);
      if (label === "main") {
        projects.push(await probeMain(client));
      } else {
        const bank = await probeBank(client);
        bank.proforma = await probeBankProforma(client);
        projects.push(bank);
      }
    } catch (e) {
      projects.push({
        label,
        envConfigured: true,
        reachable: false,
        error: { message: (e as Error).message },
      });
    }
  }

  return jsonResponse(
    {
      ok: true,
      siteSlug: env.SITE_SLUG ?? DEFAULT_SITE_SLUG,
      projects,
      setupLinks: {
        envVars: "https://dash.cloudflare.com/?to=/:account/pages/view/chinarhinestone",
      },
      note:
        "CF Pages has two environment-variable tabs — Production and Preview. Both must be set. Changing values does NOT auto-redeploy; push a new commit or click Retry deployment.",
    },
    { status: 200, request: context.request, env }
  );
};
