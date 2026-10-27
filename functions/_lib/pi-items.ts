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

/**
 * Normalize a multi-line text field (description, fabric).
 *
 * Mirrors normalizePiText() in lib/pi-item.ts: Windows line endings become
 * Unix ones, tabs become a single space and trailing spaces are dropped.
 * The line breaks themselves are kept — the admin types a bullet list into
 * the fabric field and both the screen and the PDF have to show it as a
 * list. The function lives here as well because the Cloudflare Functions
 * bundle cannot import from the app's lib/ directory.
 */
export function multiText(v: unknown): string {
  if (typeof v !== "string") return "";
  return v
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .split("\n")
    .map((line) => line.replace(/[ ]+$/, ""))
    .join("\n")
    .trim();
}

export function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function toCents(v: unknown): number {
  return Math.round(num(v) * 100);
}

/**
 * Largest inline `data:` artwork URL that is kept in the row.
 *
 * The browser downscales the picked photo to a ~600px JPEG before upload
 * (lib/pi-image.ts), so a stored picture is a few tens of kilobytes. Keeping
 * it means the customer-facing PI and the downloaded PDF show the very same
 * product picture the admin saw in "New PI" — a bigger upload is dropped
 * rather than bloating the row.
 */
export const MAX_INLINE_IMAGE_LENGTH = 150_000;

/**
 * Normalize one line item for storage.
 *
 * Inline `data:` artwork URLs are kept when they are small enough (the
 * browser downsizes them first); oversized ones are dropped so a row can
 * never grow into megabytes of base64.
 */
export function buildLineItem(raw: ItemRow): Record<string, unknown> {
  const description = multiText(raw.description);
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

  const fabric = multiText(raw.fabric);
  if (fabric) row.fabric = fabric;
  const unit = text(raw.unit);
  if (unit) row.unit = unit;

  const imageUrl = text(raw.imageUrl);
  if (imageUrl) {
    const isInline = imageUrl.startsWith("data:image/");
    if (!isInline || imageUrl.length <= MAX_INLINE_IMAGE_LENGTH) {
      row.image_url = imageUrl;
    }
  }

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
