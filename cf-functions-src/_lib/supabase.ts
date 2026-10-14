/**
 * functions/_lib/supabase.ts
 *
 * Server-side Supabase client (Pages Function context).
 * Uses service_role key — bypasses RLS, so NEVER expose to the browser.
 *
 * Env vars (set in CF Pages Dashboard → Settings → Functions):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
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

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  // Optional: which site this Pages project serves.
  // Used to scope bank_accounts / proforma_invoices queries.
  SITE_SLUG?: string;
}
