/**
 * Stone placement: fill one color layer's pixel mask with a hexagonal
 * (honeycomb) grid of stones. Hex packing fits ~15% more stones per area
 * than a square grid and is the industry-standard arrangement.
 */

export interface Stone {
  /** Center position in source-image pixels. */
  x: number;
  y: number;
  /** Layer (color cluster) index. */
  layer: number;
}

export interface FillParams {
  /** Stone diameter in source-image pixels. */
  diameterPx: number;
  /** Gap between stones in source-image pixels. */
  gapPx: number;
  /**
   * Fraction of sampled points that must fall inside the layer mask
   * for a stone to be placed (higher = tighter edge fidelity).
   */
  coverage?: number;
}

const COL_STRIDE = 8192; // grid key stride (max columns per row)

export function fillLayer(
  assignment: Uint8Array,
  width: number,
  height: number,
  layer: number,
  params: FillParams,
): Stone[] {
  const { diameterPx: d, gapPx: g } = params;
  const coverage = params.coverage ?? 0.55;
  const pitch = d + g; // horizontal distance between stone centers
  const rowPitch = (pitch * Math.sqrt(3)) / 2;
  const r = d / 2;
  if (pitch <= 0 || r <= 0) return [];

  // Sample offsets inside the stone footprint (center + 4 mid-ring points).
  const offsets: [number, number][] = [
    [0, 0],
    [0.6 * r, 0],
    [-0.6 * r, 0],
    [0, 0.6 * r],
    [0, -0.6 * r],
  ];

  const occupied = new Set<number>();
  const key = (ry: number, rx: number) => ry * COL_STRIDE + rx;

  // Pass 1: generate candidate stones on the hex grid.
  const candidates: { x: number; y: number; ry: number; rx: number }[] = [];
  const rows = Math.floor((height - r) / rowPitch) + 1;
  for (let ry = 0; ry < rows; ry++) {
    const y = r + ry * rowPitch;
    if (y + r * 0.5 > height) break;
    const rowOffset = ry % 2 === 1 ? pitch / 2 : 0;
    const cols = Math.floor((width - r - rowOffset) / pitch) + 1;
    for (let rx = 0; rx < cols; rx++) {
      const x = r + rowOffset + rx * pitch;
      let inside = 0;
      for (const [dx, dy] of offsets) {
        const sx = Math.round(x + dx);
        const sy = Math.round(y + dy);
        if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
        if (assignment[sy * width + sx] === layer) inside++;
      }
      if (inside / offsets.length >= coverage) {
        candidates.push({ x, y, ry, rx });
        occupied.add(key(ry, rx));
      }
    }
  }

  // Pass 2: drop isolated stones (no occupied hex neighbor).
  const stones: Stone[] = [];
  for (const c of candidates) {
    const diag: [number, number][] =
      c.ry % 2 === 0
        ? [
            [-1, -1],
            [-1, 0],
            [1, -1],
            [1, 0],
          ]
        : [
            [-1, 0],
            [-1, 1],
            [1, 0],
            [1, 1],
          ];
    let keep =
      occupied.has(key(c.ry, c.rx - 1)) || occupied.has(key(c.ry, c.rx + 1));
    if (!keep) {
      for (const [dy, dx] of diag) {
        if (occupied.has(key(c.ry + dy, c.rx + dx))) {
          keep = true;
          break;
        }
      }
    }
    if (keep) stones.push({ x: c.x, y: c.y, layer });
  }

  return stones;
}
