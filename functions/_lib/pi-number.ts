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
