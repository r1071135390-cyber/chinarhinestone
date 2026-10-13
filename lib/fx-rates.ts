export interface FxRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  CNY: "¥",
  GBP: "£",
  AUD: "A$",
  CAD: "C$",
};

export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  return `${symbol}${amount.toFixed(2)}`;
}

export async function getFxRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;
  // In production, fetch from API (e.g., Frankfurter API)
  // For now, return mock rates
  const mockRates: Record<string, Record<string, number>> = {
    USD: { EUR: 0.92, CNY: 7.24, GBP: 0.79 },
    EUR: { USD: 1.09, CNY: 7.87, GBP: 0.86 },
    CNY: { USD: 0.14, EUR: 0.13, GBP: 0.11 },
  };
  return mockRates[from]?.[to] ?? 1;
}
