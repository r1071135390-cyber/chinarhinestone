/**
 * functions/api/admin/customers/update.ts
 *
 * POST /api/admin/customers/update
 *
 * Body: { customerId, customerName?, customerEmail?, customerCompany?,
 *         customerPhone?, customerAddress? }
 *
 * There is no customers table — a customer is derived from the PI rows that
 * share an identity (see _lib/customers.ts). So "editing a customer" means
 * writing the new contact details onto every PI row in that customer's
 * group. That keeps one source of truth: fix a typo in the customer name
 * once and every invoice of that customer shows the corrected name.
 *
 * The grouping key is derived from the email (or the name when there is no
 * email), so editing the email moves the customer to a new key. All rows of
 * the group are updated in one statement, so the group stays together.
 *
 * Auth: none — see /api/admin/customers/list for why a shared-secret header
 * is not real protection here. The admin pages are password-gated in the UI.
 */

import { getSupabase, isPiStoreConfigured, type Env } from "../../../_lib/supabase";
import { jsonResponse } from "../../../_lib/cors";
import { PagesFunction } from "../../../_lib/pages-function";
import {
  PI_CUSTOMER_FIELDS,
  customerKey,
  decodeCustomerId,
  encodeCustomerId,
  type PiCustomerRow,
} from "../../../_lib/customers";

interface UpdateCustomerBody {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerCompany?: string;
  customerPhone?: string;
  customerAddress?: string;
}

/** Trims a field and turns an empty string into null (clear the value). */
function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const siteSlug = env.SITE_SLUG ?? "chinarhinestone";

  if (!isPiStoreConfigured(env)) {
    return jsonResponse(
      { error: "PI store is not configured on this deployment." },
      { status: 500, request: context.request, env }
    );
  }

  let body: UpdateCustomerBody;
  try {
    body = (await context.request.json()) as UpdateCustomerBody;
  } catch {
    return jsonResponse(
      { error: "Invalid JSON body" },
      { status: 400, request: context.request, env }
    );
  }

  const customerId = (body.customerId ?? "").trim();
  if (!customerId) {
    return jsonResponse(
      { error: "Missing required field: customerId" },
      { status: 400, request: context.request, env }
    );
  }

  let key: string;
  try {
    key = decodeCustomerId(customerId);
  } catch {
    return jsonResponse(
      { error: "Invalid customer id" },
      { status: 400, request: context.request, env }
    );
  }

  const name = clean(body.customerName);
  const email = clean(body.customerEmail);
  const company = clean(body.customerCompany);
  const phone = clean(body.customerPhone);
  const address = clean(body.customerAddress);

  if (!name && !email) {
    return jsonResponse(
      {
        error: "A customer needs at least a name or an email address.",
        hint: "The customer identity is derived from these two fields.",
      },
      { status: 400, request: context.request, env }
    );
  }

  const supabase = getSupabase(env);

  const { data, error } = await supabase
    .from("proforma_invoices")
    .select(PI_CUSTOMER_FIELDS)
    .eq("site_slug", siteSlug)
    .order("created_at", { ascending: false });

  if (error) {
    return jsonResponse(
      { error: error.message },
      { status: 500, request: context.request, env }
    );
  }

  const rows = (data ?? []) as PiCustomerRow[];
  const targetRows = rows.filter((row) => customerKey(row) === key);

  if (targetRows.length === 0) {
    return jsonResponse(
      { error: "Customer not found" },
      { status: 404, request: context.request, env }
    );
  }

  const ids = targetRows.map((row) => row.id);

  // The grouping key is derived from the email (or the name when there is no
  // email), so editing the email moves the customer to a new key. Compute it
  // from the new values so the UI can follow the customer to its new id.
  const newKey = email
    ? `email:${email.toLowerCase()}`
    : name
      ? `name:${name.toLowerCase()}`
      : key;

  const { data: updated, error: updateErr } = await supabase
    .from("proforma_invoices")
    .update({
      customer_name: name,
      customer_email: email,
      customer_company: company,
      customer_phone: phone,
      customer_address: address,
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)
    .eq("site_slug", siteSlug)
    .select("id");

  if (updateErr) {
    return jsonResponse(
      { error: updateErr.message },
      { status: 500, request: context.request, env }
    );
  }

  return jsonResponse(
    {
      success: true,
      updatedInvoices: Array.isArray(updated) ? updated.length : ids.length,
      customerId: encodeCustomerId(newKey),
      customer: {
        customer_name: name ?? "Unnamed customer",
        company,
        email,
        phone,
        address,
      },
    },
    { status: 200, request: context.request, env }
  );
};
