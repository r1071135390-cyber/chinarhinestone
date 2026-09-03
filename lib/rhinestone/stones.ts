/**
 * Rhinestone domain reference data: SS size table, stone color card,
 * color utilities. Single source of truth shared by the designer UI,
 * pricing and the SVG template builders.
 */

export interface StoneSize {
  id: string;
  label: string;
  diameterMm: number;
}

/** Industry-standard hotfix rhinestone sizes (round stones). */
export const STONE_SIZES: StoneSize[] = [
  { id: "ss6", label: "SS6", diameterMm: 2.0 },
  { id: "ss8", label: "SS8", diameterMm: 2.4 },
  { id: "ss10", label: "SS10", diameterMm: 2.9 },
  { id: "ss12", label: "SS12", diameterMm: 3.3 },
  { id: "ss16", label: "SS16", diameterMm: 3.9 },
  { id: "ss20", label: "SS20", diameterMm: 4.7 },
  { id: "ss30", label: "SS30", diameterMm: 6.4 },
];

export function getSize(id: string): StoneSize {
  return STONE_SIZES.find((s) => s.id === id) ?? STONE_SIZES[2];
}

export interface StoneColor {
  id: string;
  name: string;
  hex: string;
}

/** Representative hotfix stone color card (crystal, AB, jewel tones, pastels). */
export const STONE_COLORS: StoneColor[] = [
  { id: "crystal", name: "Crystal", hex: "#EDEDF2" },
  { id: "crystal-ab", name: "Crystal AB", hex: "#C9D4EE" },
  { id: "jet", name: "Jet Black", hex: "#1A1A1E" },
  { id: "ruby", name: "Ruby", hex: "#C8102E" },
  { id: "siam", name: "Siam", hex: "#8E0F2B" },
  { id: "light-rose", name: "Light Rose", hex: "#E8A0B4" },
  { id: "rose", name: "Rose", hex: "#D46A8C" },
  { id: "fuchsia", name: "Fuchsia", hex: "#C13AA0" },
  { id: "light-amethyst", name: "Light Amethyst", hex: "#B48CD9" },
  { id: "amethyst", name: "Amethyst", hex: "#7D4FA6" },
  { id: "sapphire", name: "Sapphire", hex: "#0F52BA" },
  { id: "light-sapphire", name: "Light Sapphire", hex: "#6FA8DC" },
  { id: "aquamarine", name: "Aquamarine", hex: "#7FD4D0" },
  { id: "emerald", name: "Emerald", hex: "#0E8A5F" },
  { id: "peridot", name: "Peridot", hex: "#9ACD32" },
  { id: "topaz", name: "Topaz Gold", hex: "#D9A441" },
  { id: "light-topaz", name: "Light Topaz", hex: "#E8C77A" },
  { id: "chrysolite", name: "Chrysolite", hex: "#B5D36E" },
  { id: "turquoise", name: "Turquoise", hex: "#3EB8C5" },
  { id: "coral", name: "Coral", hex: "#E8735A" },
  { id: "champagne", name: "Champagne", hex: "#D9C4A9" },
  { id: "peach", name: "Peach", hex: "#F2C199" },
];

export function getColor(id: string): StoneColor {
  return STONE_COLORS.find((c) => c.id === id) ?? STONE_COLORS[0];
}

/** Default gap between stones (mm) in hexagonal packing. */
export const DEFAULT_GAP_MM = 0.35;

/** Extra hole diameter (mm) when cutting reusable stencils. */
export const STENCIL_TOLERANCE_MM = 0.15;

/* ------------------------------- color utils ------------------------------ */

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** amt > 0 lightens toward white, amt < 0 darkens toward black. */
export function shade(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const target = amt < 0 ? 0 : 255;
  const p = Math.min(1, Math.abs(amt));
  const mix = (c: number) => (target - c) * p + c;
  return rgbToHex(mix(r), mix(g), mix(b));
}

/** Find the card stone color closest to an RGB pixel color. */
export function nearestStoneColor(r: number, g: number, b: number): StoneColor {
  let best = STONE_COLORS[0];
  let bestD = Infinity;
  for (const c of STONE_COLORS) {
    const { r: cr, g: cg, b: cb } = hexToRgb(c.hex);
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}
