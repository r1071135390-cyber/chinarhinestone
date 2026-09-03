/**
 * Indicative pricing for hotfix rhinestone transfers.
 * Demo numbers — replace with your real material cost card before launch.
 * The same function must be used client-side (live estimate) and
 * server-side (order re-calculation) so numbers can never disagree.
 */

export type MaterialGrade = "standard" | "premium" | "luxury";

export const GRADES: { id: MaterialGrade; label: string; note: string }[] = [
  { id: "standard", label: "Standard", note: "Glass, machine-cut A-grade" },
  { id: "premium", label: "Premium DMC", note: "Korean DMC, higher sparkle" },
  { id: "luxury", label: "Luxury", note: "Czech / Austrian crystal" },
];

/** Indicative material cost per stone (USD, standard grade). */
const MATERIAL_COST: Record<string, number> = {
  ss6: 0.011,
  ss8: 0.013,
  ss10: 0.016,
  ss12: 0.02,
  ss16: 0.026,
  ss20: 0.038,
  ss30: 0.07,
};

const GRADE_MULTIPLIER: Record<MaterialGrade, number> = {
  standard: 1,
  premium: 1.8,
  luxury: 3.5,
};

/** One-time setup fee per design (template cutting + machine setup). */
export const SETUP_FEE_USD = 8;

export interface PriceBreakdown {
  stones: number;
  /** material cost of one transfer (all stones on it) */
  stoneCost: number;
  setupFee: number;
  /** cost per finished piece at various order quantities */
  perPiece: { qty: number; cost: number }[];
  suggestedRetail: number;
}

export function estimatePrice(
  counts: { sizeId: string; count: number }[],
  grade: MaterialGrade = "standard",
  qtys: number[] = [1, 6, 24],
): PriceBreakdown | null {
  if (counts.length === 0) return null;
  let stoneCost = 0;
  let stones = 0;
  for (const { sizeId, count } of counts) {
    const base = MATERIAL_COST[sizeId] ?? 0.02;
    stoneCost += base * GRADE_MULTIPLIER[grade] * count;
    stones += count;
  }
  const perPiece = qtys.map((qty) => ({
    qty,
    cost: stoneCost + SETUP_FEE_USD / qty,
  }));
  return {
    stones,
    stoneCost,
    setupFee: SETUP_FEE_USD,
    perPiece,
    suggestedRetail: Math.max(12, (stoneCost + SETUP_FEE_USD) * 2.6),
  };
}
