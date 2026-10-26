/**
 * functions/_lib/pi-number.ts
 *
 * PI numbers on this site are CR + YYYYMMDD + NNNN with no separators
 * (CR202610260001) — the same shape the factory uses on its other site
 * (SA202610020002).
 *
 * The sequence itself lives in Postgres (next_pi_number). This module only
 * guarantees the *shape* of whatever that RPC returns: a database that
 * still carries the old CH-YYYYMMDD-NNNN definition would otherwise hand
 * out numbers with dashes in them.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/** The prefix every PI number on this site starts with. */
export const PI_NUMBER_PREFIX = "CR";

/**
 * Rewrite a generated PI number into the canonical shape.
 *
 * Accepts CR202610260001 and CR-20261026-0001 alike; anything that does
 * not carry a readable date + sequence is returned untouched.
 */
export function formatPiNumber(raw: string, prefix: string = PI_NUMBER_PREFIX): string {
  const value = raw.trim().toUpperCase();
  const match = value.match(/^([A-Z]{2})[-_ ]?(\d{8})[-_ ]?(\d+)$/);
  if (!match) return value;
  return `${prefix}${match[2]}${match[3].padStart(4, "0")}`;
}

/** The date part of a PI number for today: CR20261026. */
function todayStem(prefix: string): string {
  const now = new Date();
  return (
    prefix +
    String(now.getFullYear()) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0")
  );
}

/**
 * Next free number in the CRYYYYMMDDNNNN shape for today.
 *
 * The next_pi_number RPC is the primary source, but a database that still
 * carries the older definition scans the old CH-YYYYMMDD-NNNN shape and
 * therefore hands out the same number twice in one day. This looks at the
 * rows that actually exist and picks the next free sequence instead.
 */
export async function nextFreePiNumber(
  client: SupabaseClient,
  prefix: string = PI_NUMBER_PREFIX,
  siteSlug: string = "chinarhinestone",
): Promise<string | null> {
  const stem = todayStem(prefix);

  const { data, error } = await client
    .from("proforma_invoices")
    .select("pi_number")
    .eq("site_slug", siteSlug)
    .like("pi_number", `${stem}%`)
    .limit(200);
  if (error) return null;

  let max = 0;
  for (const row of data ?? []) {
    const value = String((row as { pi_number?: string | null }).pi_number ?? "");
    if (!value.startsWith(stem)) continue;
    const seq = Number(value.slice(stem.length));
    if (Number.isFinite(seq) && seq > max) max = seq;
  }
  return `${stem}${String(max + 1).padStart(4, "0")}`;
}
