/**
 * functions/api/admin/bank-accounts.ts
 *
 * GET  /api/admin/bank-accounts          — list all 4 currencies for this site
 * PUT  /api/admin/bank-accounts          — upsert one account
 *
 * Auth: the AdminGuard password gate on the frontend is the only barrier.
 * Server-side: optionally require X-Admin-Token == ADMIN_TOKEN env var.
 * (In production, the owner is the only person who ever calls this.)
 */

import { getSupabase, type Env } from "../../../_lib/supabase";
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

export const onRequestGet: PagesFunction<Env & { ADMIN_TOKEN?: string }> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";
  const supabase = getSupabase(env);

  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("site_slug", siteSlug)
    .order("currency", { ascending: true });

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500, request: context.request, env });
  }
  return jsonResponse({ accounts: data ?? [] }, { status: 200, request: context.request, env });
};

interface PutBody extends Partial<Omit<BankAccountRow, "id" | "site_slug" | "updated_at">> {
  currency: string;
}

export const onRequestPut: PagesFunction<Env & { ADMIN_TOKEN?: string }> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  if (env.ADMIN_TOKEN) {
    const supplied = context.request.headers.get("X-Admin-Token") ?? "";
    if (supplied !== env.ADMIN_TOKEN) {
      return jsonResponse({ error: "Forbidden" }, { status: 403, request: context.request, env });
    }
  }

  let body: PutBody;
  try {
    body = await context.request.json<PutBody>();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400, request: context.request, env });
  }

  if (!body.currency || !body.beneficiary || !body.bank_name || !body.account || !body.swift) {
    return jsonResponse(
      { error: "Missing required fields: currency, beneficiary, bank_name, account, swift" },
      { status: 400, request: context.request, env }
    );
  }

  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from("bank_accounts")
    .upsert(
      {
        site_slug: siteSlug,
        currency: body.currency,
        label: body.label ?? `${body.currency} — ${body.beneficiary}`,
        symbol: body.symbol ?? "$",
        beneficiary: body.beneficiary,
        company_address: body.company_address ?? "",
        bank_name: body.bank_name,
        account: body.account,
        swift: body.swift,
        bank_address: body.bank_address ?? "",
        iban: body.iban ?? null,
        bank_country: body.bank_country ?? null,
        routing_number: body.routing_number ?? null,
        cnaps: body.cnaps ?? null,
        intermediary_bank: body.intermediary_bank ?? null,
        intermediary_swift: body.intermediary_swift ?? null,
        notes: body.notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "site_slug,currency" }
    )
    .select()
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500, request: context.request, env });
  }
  return jsonResponse({ account: data }, { status: 200, request: context.request, env });
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
