/**
 * functions/_lib/supabase.ts
 *
 * Server-side Supabase clients (Pages Function context).
 * Uses service_role key — bypasses RLS, so NEVER expose to the browser.
 *
 * Env vars (set in CF Pages Dashboard → Settings → Environment variables):
 *   MAIN Supabase (PI data for this site):
 *     SUPABASE_SERVICE_ROLE_KEY  ← the only one that must be set
 *     SUPABASE_URL               ← optional, defaults to DEFAULT_MAIN_SUPABASE_URL
 *   BANK Supabase (authoritative bank accounts — shared with sublimapparel):
 *     BANK_SUPABASE_URL
 *     BANK_SUPABASE_SERVICE_ROLE_KEY
 *
 * If BANK_* env vars are missing, getBankSupabase() falls back to MAIN
 * so the function still works with a local seed (bank_accounts table),
 * but the canonical deployment points BANK_* at sublimapparel's project.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * This site's own Supabase project. The URL is a public identifier (it is
 * already baked into the diagnostic payload below), so it is hardcoded as a
 * fallback — the only thing that genuinely has to be configured in the
 * Cloudflare Pages dashboard is SUPABASE_SERVICE_ROLE_KEY.
 *
 * Override it with the SUPABASE_URL env var if the project ever moves.
 */
export const DEFAULT_MAIN_SUPABASE_URL = "https://zxobbdaqzkbfaoyahggz.supabase.co";

/** The site_slug stored on every row of this site's PI store. */
export const DEFAULT_SITE_SLUG = "chinarhinestone";

export function getSupabase(env: Env): SupabaseClient {
  const url = env.SUPABASE_URL || DEFAULT_MAIN_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in Cloudflare Pages → Settings → Environment variables (Production tab)."
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
  const url = env.BANK_SUPABASE_URL || env.SUPABASE_URL || DEFAULT_MAIN_SUPABASE_URL;
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
 * Functions use this to decide whether the /administered/bank-accounts page can be
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
  return Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * The payload every endpoint returns when the PI store is not configured.
 *
 * Contains booleans and setup instructions only — never a secret value.
 */
export function piStoreEnvDiagnostic(env: Env) {
  return {
    mainUrlSet: true,
    mainUrl: env.SUPABASE_URL || DEFAULT_MAIN_SUPABASE_URL,
    mainKeySet: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    siteSlug: env.SITE_SLUG ?? DEFAULT_SITE_SLUG,
    setupLinks: {
      envVars: "https://dash.cloudflare.com/?to=/:account/pages/view/chinarhinestone",
    },
    expectedEnvVars: [
      {
        name: "SUPABASE_SERVICE_ROLE_KEY",
        value: "<MAIN Supabase zxobbdaqzkbfaoyahggz → Settings → API → service_role>",
        note: "This is the only variable that must be added — SUPABASE_URL and SITE_SLUG have built-in defaults.",
      },
    ],
    note:
      "CF Pages has two environment-variable tabs — Production and Preview. Both must be set. Changing values does NOT auto-redeploy; push a new commit (or click Retry deployment) for the new values to be picked up.",
  };
}

export interface Env {
  /** Optional — defaults to DEFAULT_MAIN_SUPABASE_URL. */
  SUPABASE_URL?: string;
  /** Required. The only env var without a built-in default. */
  SUPABASE_SERVICE_ROLE_KEY?: string;
  /** Shared bank-accounts Supabase (sublimapparel-owned). */
  BANK_SUPABASE_URL?: string;
  BANK_SUPABASE_SERVICE_ROLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  // Optional: which site this Pages project serves.
  // Used to scope bank_accounts / proforma_invoices queries.
  SITE_SLUG?: string;
  // Optional: comma-separated CORS origins (see _lib/cors.ts).
  ALLOWED_ORIGINS?: string;
}

