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
  total_cents: number | null;
  currency: string | null;
  status: string | null;
  created_at: string;
}

export interface CustomerGroup {
  /** Raw grouping key — never sent to the browser. */
  key: string;
  /** base64url(groupKey) — what the UI navigates with. */
  id: string;
  customer_name: string;
  company: string | null;
  email: string | null;
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

    groups.push({
      key,
      id: encodeCustomerId(key),
      customer_name: (named.customer_name ?? "").trim() || "Unnamed customer",
      company: (withCompany.customer_company ?? "").trim() || null,
      email: (withEmail.customer_email ?? "").trim() || null,
      pi_count: bucket.length,
      last_pi_date: latest.created_at ?? null,
    });
  }
  return groups;
}

export function matchesSearch(group: CustomerGroup, needle: string): boolean {
  if (!needle) return true;
  return [group.customer_name, group.company, group.email].some((value) =>
    (value ?? "").toLowerCase().includes(needle)
  );
}
