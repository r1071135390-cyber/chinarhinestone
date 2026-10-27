/**
 * lib/pi-item.ts
 *
 * The PI line-item shape and its quantity rule.
 *
 * Kept outside the React tree so the PDF generator can reuse it without
 * pulling the document component into the bundle.
 */

export type SizeRow = { label: string; qty: number };

export type LineItem = {
  description: string;
  fabric: string;
  qty: number;
  unit: string;
  unitPrice: number;
  imageUrl: string;
  hasSizeBreakdown: boolean;
  sizes: SizeRow[];
};

/**
 * Quantity of a line item. When a size breakdown is present the item
 * quantity is the sum of its sizes, not the manually typed number.
 */
export function getItemQty(it: LineItem): number {
  if (!it.hasSizeBreakdown) return it.qty;
  return it.sizes.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);
}
