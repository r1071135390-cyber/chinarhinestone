/**
 * functions/_lib/supabase.ts
 *
 * Server-side Supabase clients (Pages Function context).
 * Uses service_role key — bypasses RLS, so NEVER expose to the browser.
 *
 * Env vars (set in CF Pages Dashboard → Settings → Functions):
 *   MAIN Supabase (PI data for this site):
 *     SUPABASE_URL
 *     SUPABASE_SERVICE_ROLE_KEY
 *   BANK Supabase (authoritative bank accounts — shared with sublimapparel):
 *     BANK_SUPABASE_URL
 *     BANK_SUPABASE_SERVICE_ROLE_KEY
 *
 * If BANK_* env vars are missing, getBankSupabase() falls back to MAIN
 * so the function still works with a local seed (bank_accounts table),
 * but the canonical deployment points BANK_* at sublimapparel's project.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getSupabase(env: Env): SupabaseClient {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Cloudflare Pages → Settings → Functions."
    );
  }

  return createClient(url, key, {
    auth: {
      // Service role bypasses RLS — no need for session persistence
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Bank Supabase client.
 *
 * The user runs three factory sites (sublimapparel, oemtshirts, chinarhinestone)
 * under one legal entity (Yiwu HomeDorm). Bank details change rarely and apply
 * to every site, so they live in a single "BANK" Supabase project — same
 * physical Postgres instance is queried regardless of which site the request
 * originates from.
 *
 * The BANK DB rows are filtered by site_slug = 'sublimapparel' (the owner
 * of the BANK project). Other sites read sublimapparel's authoritative rows.
 *
 * If BANK env vars are unset (local dev), we fall back to the MAIN client
 * using its own bank_accounts table — keeps the system runnable without
 * the shared BANK project.
 */
export function getBankSupabase(env: Env): SupabaseClient {
  const url = env.BANK_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.BANK_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing BANK or MAIN Supabase env vars. Set BANK_SUPABASE_URL and BANK_SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Cloudflare Pages → Settings → Functions."
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Returns true when BANK env vars are configured.
 * Functions use this to decide whether the /admin/bank-accounts page can be
 * edited (NO when BANK is configured — single source of truth lives there)
 * or read-only.
 */
export function isBankSupabaseConfigured(env: Env): boolean {
  return Boolean(env.BANK_SUPABASE_URL && env.BANK_SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * True when this site's own Supabase project is not wired up.
 *
 * The PI store lives in MAIN (not BANK). Without these two vars nothing can
 * be read or written, and the failure mode differs per endpoint: getSupabase()
 * throws, and an uncaught throw inside a Pages Function makes Cloudflare
 * answer with a bare "error code: 1101" HTML page instead of JSON. Endpoints
 * check this first and return a JSON diagnostic instead.
 */
export function isPiStoreConfigured(env: Env): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * The payload every endpoint returns when the PI store is not configured.
 *
 * Contains booleans and setup instructions only — never a secret value.
 */
export function piStoreEnvDiagnostic(env: Env) {
  return {
    mainUrlSet: Boolean(env.SUPABASE_URL),
    mainKeySet: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    siteSlug: env.SITE_SLUG ?? null,
    setupLinks: {
      envVars: "https://dash.cloudflare.com/?to=/:account/pages/view/chinarhinestone",
    },
    expectedEnvVars: [
      { name: "SUPABASE_URL", value: "https://zxobbdaqzkbfaoyahggz.supabase.co" },
      {
        name: "SUPABASE_SERVICE_ROLE_KEY",
        value: "<MAIN Supabase zxobbdaqzkbfaoyahggz → Settings → API → service_role>",
      },
      { name: "SITE_SLUG", value: "chinarhinestone" },
    ],
    note:
      "CF Pages has two environment-variable tabs — Production and Preview. Both must be set. Changing values does NOT auto-redeploy; push a new commit (or click Retry deployment) for the new values to be picked up.",
  };
}

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  /** Shared bank-accounts Supabase (sublimapparel-owned). */
  BANK_SUPABASE_URL?: string;
  BANK_SUPABASE_SERVICE_ROLE_KEY?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  // Optional: which site this Pages project serves.
  // Used to scope bank_accounts / proforma_invoices queries.
  SITE_SLUG?: string;
  // Optional: comma-separated CORS origins (see _lib/cors.ts).
  ALLOWED_ORIGINS?: string;
}

