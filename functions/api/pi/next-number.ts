/**
 * functions/api/pi/next-number.ts
 *
 * GET /api/pi/next-number?prefix=CH
 *
 * Returns the next available PI number for today, e.g. "CH-20261014-0001".
 * Backed by the Postgres next_pi_number(prefix TEXT) RPC.
 */

import { getSupabase, isPiStoreConfigured, piStoreEnvDiagnostic, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const url = new URL(context.request.url);
  const prefix = (url.searchParams.get("prefix") ?? "CH").trim().toUpperCase().slice(0, 8);

  if (!prefix) {
    return jsonResponse({ error: "Missing prefix" }, { status: 400, request: context.request, env });
  }

  // Without this the RPC would throw and Cloudflare would answer with a bare
  // "error code: 1101" page instead of JSON.
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
  const { data, error } = await supabase.rpc("next_pi_number", { prefix });

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500, request: context.request, env });
  }

  return jsonResponse({ pi_number: data }, { status: 200, request: context.request, env });
};
