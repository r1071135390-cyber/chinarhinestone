/**
 * functions/_lib/customers.ts
 *
 * Shared helpers for the admin Customers pages.
 *
 * There is no `customers` table — a customer is derived from the PI rows
 * that share an identity. The grouping key is the customer email when the
 * PI has one, otherwise the customer name, otherwise the PI is its own
 * bucket (an unnamed PI still needs to be reachable).
 *
 * The admin UI needs a stable id to navigate with, and it interpolates that
 * id into a query string and a path segment without encoding it itself, so
 * the id is base64url — URL-safe with no percent-encoding required.
 */

export interface PiCustomerRow {
  id: number;
  pi_number: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_company: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  total_cents: number | null;
  currency: string | null;
  status: string | null;
  created_at: string;
}

/**
 * The PI columns the customer screens need. Kept in one place so the list,
 * the detail view and the update endpoint cannot drift apart.
 *
 * `as const` keeps the literal type, which is what lets the Supabase client
 * infer the row shape from `.select(PI_CUSTOMER_FIELDS)`.
 */
export const PI_CUSTOMER_FIELDS =
  "id, pi_number, customer_name, customer_email, customer_company, customer_phone, customer_address, total_cents, currency, status, created_at" as const;

export interface CustomerGroup {
  /** Raw grouping key — never sent to the browser. */
  key: string;
  /** base64url(groupKey) — what the UI navigates with. */
  id: string;
  customer_name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  pi_count: number;
  last_pi_date: string | null;
}

export function customerKey(row: PiCustomerRow): string {
  const email = (row.customer_email ?? "").trim().toLowerCase();
  if (email) return `email:${email}`;
  const name = (row.customer_name ?? "").trim().toLowerCase();
  if (name) return `name:${name}`;
  return `pi:${row.id}`;
}

export function encodeCustomerId(key: string): string {
  const bytes = new TextEncoder().encode(key);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCustomerId(id: string): string {
  const base64 = id.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Group PI rows into customers.
 * `rows` must be ordered newest-first (created_at desc) — the first row of
 * each bucket is treated as the most recent activity.
 */
export function groupCustomers(rows: PiCustomerRow[]): CustomerGroup[] {
  const buckets = new Map<string, PiCustomerRow[]>();
  for (const row of rows) {
    const key = customerKey(row);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(row);
    else buckets.set(key, [row]);
  }

  const groups: CustomerGroup[] = [];
  for (const [key, bucket] of buckets) {
    const latest = bucket[0];
    const named = bucket.find((row) => (row.customer_name ?? "").trim()) ?? latest;
    const withCompany = bucket.find((row) => (row.customer_company ?? "").trim()) ?? latest;
    const withEmail = bucket.find((row) => (row.customer_email ?? "").trim()) ?? latest;
    const withPhone = bucket.find((row) => (row.customer_phone ?? "").trim()) ?? latest;
    const withAddress = bucket.find((row) => (row.customer_address ?? "").trim()) ?? latest;

    groups.push({
      key,
      id: encodeCustomerId(key),
      customer_name: (named.customer_name ?? "").trim() || "Unnamed customer",
      company: (withCompany.customer_company ?? "").trim() || null,
      email: (withEmail.customer_email ?? "").trim() || null,
      phone: (withPhone.customer_phone ?? "").trim() || null,
      address: (withAddress.customer_address ?? "").trim() || null,
      pi_count: bucket.length,
      last_pi_date: latest.created_at ?? null,
    });
  }
  return groups;
}

export function matchesSearch(group: CustomerGroup, needle: string): boolean {
  if (!needle) return true;
  return [group.customer_name, group.company, group.email, group.phone].some((value) =>
    (value ?? "").toLowerCase().includes(needle)
  );
}
