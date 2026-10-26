/**
 * functions/api/pi/delete.ts
 *
 * POST /api/pi/delete
 *
 * Body: { piNumber: string }
 *
 * Permanently removes one PI (the /admin/summary delete button).
 *
 * Auth: none — see /api/pi/create for why a shared-secret header is not
 * real protection here. The admin UI is password-gated and asks the owner
 * to type the PI number before deleting.
 */

import { getSupabase, isPiStoreConfigured, piStoreEnvDiagnostic, type Env } from "../../_lib/supabase";
import { jsonResponse } from "../../_lib/cors";
import { PagesFunction } from "../../_lib/pages-function";

interface DeleteBody {
  piNumber?: string;
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

  const { data: existing, error: lookupErr } = await supabase
    .from("proforma_invoices")
    .select("id, status")
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug)
    .maybeSingle<{ id: number; status: string }>();

  if (lookupErr) {
    return jsonResponse({ error: lookupErr.message }, { status: 500, request: context.request, env });
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

  const { error: deleteErr } = await supabase
    .from("proforma_invoices")
    .delete()
    .eq("pi_number", piNumber)
    .eq("site_slug", siteSlug);

  if (deleteErr) {
    return jsonResponse({ error: deleteErr.message }, { status: 500, request: context.request, env });
  }

  return jsonResponse({ success: true, piNumber }, { status: 200, request: context.request, env });
};
