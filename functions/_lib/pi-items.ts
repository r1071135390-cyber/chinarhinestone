/**
 * functions/_lib/pi-items.ts
 *
 * Shared normalisation for PI line items and money, used by both
 * /api/pi/create and /api/pi/update so a PI looks the same whether it was
 * created or edited.
 *
 * Money: the client sends major units (dollars). The DB stores cents in
 * subtotal_cents / shipping_cents / total_cents. `line_items` is a JSONB
 * document (not a money column), so the values inside it stay in major
 * units — the PI document renders it that way.
 */

export interface SizeRow {
  label?: string;
  qty?: number;
}

export interface ItemRow {
  description?: string;
  fabric?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  imageUrl?: string;
  sizes?: SizeRow[];
}

export function text(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function toCents(v: unknown): number {
  return Math.round(num(v) * 100);
}

/**
 * Normalize one line item for storage.
 * Inline `data:` artwork URLs are dropped — they are megabytes of base64 and
 * would bloat the row.
 */
export function buildLineItem(raw: ItemRow): Record<string, unknown> {
  const description = text(raw.description);
  const quantity = num(raw.quantity);
  const unitPrice = num(raw.unitPrice);
  const sizes = (raw.sizes ?? [])
    .map((s) => ({ label: text(s.label), qty: num(s.qty) }))
    .filter((s) => s.label);

  const row: Record<string, unknown> = {
    description,
    quantity,
    unit_price: unitPrice,
    total: Math.round(quantity * unitPrice * 100) / 100,
  };

  const fabric = text(raw.fabric);
  if (fabric) row.fabric = fabric;
  const unit = text(raw.unit);
  if (unit) row.unit = unit;

  const imageUrl = text(raw.imageUrl);
  if (imageUrl && !imageUrl.startsWith("data:")) row.image_url = imageUrl;

  if (sizes.length > 0) {
    row.sizes = sizes;
    row.size = sizes.map((s) => `${s.label}:${s.qty}`).join(" ");
  }

  return row;
}

/** Drop blank rows and normalize the rest. */
export function normalizeItems(items: ItemRow[] | undefined): Record<string, unknown>[] {
  return (items ?? []).filter((it) => text(it.description)).map(buildLineItem);
}

/** Subtotal of the normalized items, in cents. */
export function itemsSubtotalCents(items: Record<string, unknown>[]): number {
  const subtotal = items.reduce((sum, it) => sum + num(it.total), 0);
  return toCents(subtotal);
}
