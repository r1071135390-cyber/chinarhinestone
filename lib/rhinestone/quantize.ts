/**
 * Color separation: deterministic k-means clustering of opaque pixels.
 * The same artwork always separates the same way (seeded RNG).
 *
 * Runs fully in the browser on an ImageData buffer — no upload required.
 */

export interface SeparationResult {
  /** Cluster index per pixel. 255 = transparent / background. */
  assignment: Uint8Array;
  /** Mean RGB of each cluster, ordered by pixel count (desc). */
  centers: { r: number; g: number; b: number; count: number }[];
  /**
   * Mean squared distance of pixels to their cluster color.
   * High values suggest gradients / photos — hint to the user.
   */
  scatter: number;
}

/** Deterministic PRNG so results are reproducible across runs. */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function separateColors(img: ImageData, k: number): SeparationResult {
  const { data, width, height } = img;
  const n = width * height;
  const assignment = new Uint8Array(n).fill(255);

  // Collect opaque pixel indices.
  const opaque: number[] = [];
  for (let i = 0; i < n; i++) {
    if (data[i * 4 + 3] > 128) opaque.push(i);
  }
  if (opaque.length === 0 || k <= 0) {
    return { assignment, centers: [], scatter: 0 };
  }
  const K = Math.min(k, 8);

  // --- k-means++ initialization on a small subsample ------------------
  const initStride = Math.max(1, Math.floor(opaque.length / 5000));
  const initIdx: number[] = [];
  for (let s = 0; s < opaque.length; s += initStride) initIdx.push(opaque[s]);

  const rand = mulberry32(42);
  const centers: [number, number, number][] = [];
  const first = initIdx[Math.floor(rand() * initIdx.length)];
  centers.push([data[first * 4], data[first * 4 + 1], data[first * 4 + 2]]);

  const dist2 = new Float64Array(initIdx.length).fill(Infinity);
  while (centers.length < K) {
    const last = centers[centers.length - 1];
    let total = 0;
    for (let j = 0; j < initIdx.length; j++) {
      const p = initIdx[j] * 4;
      const d =
        (data[p] - last[0]) ** 2 +
        (data[p + 1] - last[1]) ** 2 +
        (data[p + 2] - last[2]) ** 2;
      if (d < dist2[j]) dist2[j] = d;
      total += dist2[j];
    }
    if (total === 0) break;
    let target = rand() * total;
    let pick = initIdx.length - 1;
    for (let j = 0; j < initIdx.length; j++) {
      target -= dist2[j];
      if (target <= 0) {
        pick = j;
        break;
      }
    }
    const pp = initIdx[pick] * 4;
    centers.push([data[pp], data[pp + 1], data[pp + 2]]);
  }

  // --- Lloyd iterations on a bounded subsample ------------------------
  const lloydStride = Math.max(1, Math.floor(opaque.length / 100000));
  const lloydIdx: number[] = [];
  for (let s = 0; s < opaque.length; s += lloydStride) lloydIdx.push(opaque[s]);

  const KK = centers.length;
  const sums: number[][] = Array.from({ length: KK }, () => [0, 0, 0, 0]);
  for (let iter = 0; iter < 10; iter++) {
    for (const s of sums) s.fill(0);
    for (const i of lloydIdx) {
      const p = i * 4;
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < KK; c++) {
        const d =
          (data[p] - centers[c][0]) ** 2 +
          (data[p + 1] - centers[c][1]) ** 2 +
          (data[p + 2] - centers[c][2]) ** 2;
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      sums[best][0] += data[p];
      sums[best][1] += data[p + 1];
      sums[best][2] += data[p + 2];
      sums[best][3]++;
    }
    let shift = 0;
    for (let c = 0; c < KK; c++) {
      if (sums[c][3] === 0) continue;
      const [nr, ng, nb] = [
        sums[c][0] / sums[c][3],
        sums[c][1] / sums[c][3],
        sums[c][2] / sums[c][3],
      ];
      shift += Math.abs(nr - centers[c][0]) + Math.abs(ng - centers[c][1]);
      centers[c] = [nr, ng, nb];
    }
    if (shift < 1) break;
  }

  // --- final assignment over every opaque pixel -----------------------
  const counts = new Array(KK).fill(0);
  let scatterSum = 0;
  for (const i of opaque) {
    const p = i * 4;
    let best = 0;
    let bestD = Infinity;
    for (let c = 0; c < KK; c++) {
      const d =
        (data[p] - centers[c][0]) ** 2 +
        (data[p + 1] - centers[c][1]) ** 2 +
        (data[p + 2] - centers[c][2]) ** 2;
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    assignment[i] = best;
    counts[best]++;
    scatterSum += bestD;
  }

  // Order clusters by pixel count (desc) and remap assignment values.
  const order = centers
    .map((_, c) => c)
    .filter((c) => counts[c] > 0)
    .sort((a, b) => counts[b] - counts[a]);
  const remap = new Uint8Array(KK);
  order.forEach((oldC, newC) => {
    remap[oldC] = newC;
  });
  for (let i = 0; i < n; i++) {
    if (assignment[i] !== 255) assignment[i] = remap[assignment[i]];
  }

  const centersOut = order.map((c) => ({
    r: Math.round(centers[c][0]),
    g: Math.round(centers[c][1]),
    b: Math.round(centers[c][2]),
    count: counts[c],
  }));

  return {
    assignment,
    centers: centersOut,
    scatter: opaque.length ? scatterSum / opaque.length : 0,
  };
}
