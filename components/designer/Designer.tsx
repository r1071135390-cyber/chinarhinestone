"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_GAP_MM,
  STONE_COLORS,
  STONE_SIZES,
  getColor,
  getSize,
  nearestStoneColor,
  rgbToHex,
  shade,
} from "@/lib/rhinestone/stones";
import { separateColors, type SeparationResult } from "@/lib/rhinestone/quantize";
import { fillLayer, type Stone } from "@/lib/rhinestone/fill";
import { GRADES, estimatePrice, type MaterialGrade } from "@/lib/rhinestone/pricing";
import { buildMockupSvg, buildProductionSvg, type LayerMeta } from "@/lib/rhinestone/svg";

const MAX_DIM = 640; // processing resolution cap
const GRADIENT_SCATTER_THRESHOLD = 2600;

const EDGE_MODES = [
  { id: "loose", label: "Loose", coverage: 0.4 },
  { id: "balanced", label: "Balanced", coverage: 0.55 },
  { id: "tight", label: "Tight", coverage: 0.75 },
] as const;
type EdgeMode = (typeof EDGE_MODES)[number]["id"];

const STEP_LABELS = ["Upload", "Separate", "Configure", "Export"];

interface SourceImage {
  data: ImageData;
  width: number;
  height: number;
  name: string;
}

interface LayerConfig {
  stoneColorId: string;
  sizeId: string;
  visible: boolean;
}

/** Pre-render one stone as a sprite (radial gradient + specular dot). */
function makeStoneSprite(hex: string, diameterPx: number): HTMLCanvasElement {
  const pad = 2;
  const size = Math.ceil(diameterPx) + pad * 2;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  const cx = size / 2;
  const r = diameterPx / 2;
  const grad = ctx.createRadialGradient(
    cx - r * 0.25,
    cx - r * 0.3,
    r * 0.1,
    cx,
    cx,
    r,
  );
  grad.addColorStop(0, shade(hex, 0.55));
  grad.addColorStop(0.45, hex);
  grad.addColorStop(1, shade(hex, -0.35));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cx, r, 0, Math.PI * 2);
  ctx.fill();
  // specular highlight
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cx - r * 0.35, Math.max(0.6, r * 0.18), 0, Math.PI * 2);
  ctx.fill();
  return c;
}

export default function Designer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [srcImage, setSrcImage] = useState<SourceImage | null>(null);
  const [separation, setSeparation] = useState<SeparationResult | null>(null);
  const [layerConfigs, setLayerConfigs] = useState<LayerConfig[]>([]);
  const [stones, setStones] = useState<Stone[]>([]);
  const [busy, setBusy] = useState(false);

  const [k, setK] = useState(3);
  const [designWidthIn, setDesignWidthIn] = useState(9);
  const [gapMm, setGapMm] = useState(DEFAULT_GAP_MM);
  const [edgeMode, setEdgeMode] = useState<EdgeMode>("balanced");

  const [showSource, setShowSource] = useState(false);
  const [grade, setGrade] = useState<MaterialGrade>("standard");
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ------------------------------ artwork load ----------------------------- */

  const loadFromBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      setSrcImage({
        data: ctx.getImageData(0, 0, w, h),
        width: w,
        height: h,
        name,
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const loadSample = async () => {
    try {
      const res = await fetch("/samples/logo.jpg");
      if (!res.ok) throw new Error("sample not found");
      const blob = await res.blob();
      loadFromBlob(blob, "sample-logo.jpg");
    } catch {
      setToast("Sample artwork is not available — upload your own file.");
    }
  };

  /* --------------------------- pipeline: separation ------------------------- */

  useEffect(() => {
    if (!srcImage) {
      setSeparation(null);
      setLayerConfigs([]);
      return;
    }
    setBusy(true);
    const t = setTimeout(() => {
      const result = separateColors(srcImage.data, k);
      setSeparation(result);
      setLayerConfigs(
        result.centers.map((c) => ({
          stoneColorId: nearestStoneColor(c.r, c.g, c.b).id,
          sizeId: "ss10",
          visible: true,
        })),
      );
      setBusy(false);
    }, 30);
    return () => clearTimeout(t);
  }, [srcImage, k]);

  /* ---------------------------- pipeline: fill ------------------------------ */

  useEffect(() => {
    if (!srcImage || !separation || layerConfigs.length === 0) {
      setStones([]);
      return;
    }
    setBusy(true);
    const t = setTimeout(() => {
      const pxPerMm = srcImage.width / (designWidthIn * 25.4);
      const gapPx = gapMm * pxPerMm;
      const coverage = EDGE_MODES.find((m) => m.id === edgeMode)?.coverage ?? 0.55;
      const all: Stone[] = [];
      separation.centers.forEach((_, i) => {
        const cfg = layerConfigs[i];
        if (!cfg || !cfg.visible) return;
        const dPx = getSize(cfg.sizeId).diameterMm * pxPerMm;
        if (dPx < 1.5) return; // stone too small to resolve at this scale
        all.push(
          ...fillLayer(separation.assignment, srcImage.width, srcImage.height, i, {
            diameterPx: dPx,
            gapPx,
            coverage,
          }),
        );
      });
      setStones(all);
      setBusy(false);
    }, 60);
    return () => clearTimeout(t);
  }, [separation, layerConfigs, gapMm, designWidthIn, edgeMode, srcImage]);

  /* ----------------------------- canvas rendering --------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !srcImage) return;
    canvas.width = srcImage.width;
    canvas.height = srcImage.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (showSource) {
      ctx.putImageData(srcImage.data, 0, 0);
      return;
    }
    const pxPerMm = srcImage.width / (designWidthIn * 25.4);
    const sprites = new Map<number, HTMLCanvasElement>();
    layerConfigs.forEach((cfg, i) => {
      if (!cfg.visible) return;
      const d = getSize(cfg.sizeId).diameterMm * pxPerMm;
      if (d < 1.5) return;
      sprites.set(i, makeStoneSprite(getColor(cfg.stoneColorId).hex, d));
    });
    for (const s of stones) {
      const sp = sprites.get(s.layer);
      if (!sp) continue;
      ctx.drawImage(sp, s.x - sp.width / 2, s.y - sp.height / 2);
    }
  }, [stones, showSource, layerConfigs, designWidthIn, srcImage]);

  /* --------------------------------- derived -------------------------------- */

  const layerCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const s of stones) counts.set(s.layer, (counts.get(s.layer) ?? 0) + 1);
    return counts;
  }, [stones]);

  const layerMeta = useMemo(() => {
    const m: Record<number, LayerMeta> = {};
    layerConfigs.forEach((cfg, i) => {
      if (cfg.visible && (layerCounts.get(i) ?? 0) > 0) {
        m[i] = { sizeId: cfg.sizeId, colorId: cfg.stoneColorId };
      }
    });
    return m;
  }, [layerConfigs, layerCounts]);

  const price = useMemo(() => {
    if (!separation) return null;
    const counts: { sizeId: string; count: number }[] = [];
    separation.centers.forEach((_, i) => {
      const cfg = layerConfigs[i];
      const n = layerCounts.get(i) ?? 0;
      if (cfg && n > 0) counts.push({ sizeId: cfg.sizeId, count: n });
    });
    return estimatePrice(counts, grade);
  }, [separation, layerConfigs, layerCounts, grade]);

  const hasGradients = separation ? separation.scatter > GRADIENT_SCATTER_THRESHOLD : false;
  const step = !srcImage ? 1 : !separation ? 2 : stones.length === 0 ? 3 : 4;

  /* --------------------------------- export --------------------------------- */

  const download = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const svgParams = useMemo(() => {
    if (!srcImage || stones.length === 0) return null;
    return {
      stones,
      layers: layerMeta,
      designWidthMm: designWidthIn * 25.4,
      imageWidth: srcImage.width,
      imageHeight: srcImage.height,
      designName: srcImage.name,
    };
  }, [srcImage, stones, layerMeta, designWidthIn]);

  const exportProduction = () => {
    if (!svgParams) return;
    download(buildProductionSvg(svgParams), "chinarhinestone-template.svg");
    setToast(
      "Production SVG downloaded — ready for the cutting table or setting machine.",
    );
  };

  const exportMockup = () => {
    if (!svgParams) return;
    download(buildMockupSvg(svgParams), "chinarhinestone-mockup.svg");
    setToast("Mockup SVG downloaded — send it to your customer for approval.");
  };

  /* ---------------------------------- ui ------------------------------------ */

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFromBlob(f, f.name);
  };

  return (
    <div className="min-h-screen">
      {/* header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3">
          <a href="/" className="text-shimmer text-lg font-black tracking-tight">
            ChinaRhinestone.com
          </a>
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const state = n < step ? "done" : n === step ? "active" : "todo";
              return (
                <span
                  key={label}
                  className={
                    "rounded-full px-3 py-1 text-xs font-semibold " +
                    (state === "active"
                      ? "bg-fuchsia-500 text-zinc-950"
                      : state === "done"
                        ? "bg-fuchsia-500/15 text-fuchsia-300"
                        : "bg-zinc-900 text-zinc-500")
                  }
                >
                  {n}. {label}
                </span>
              );
            })}
          </div>
          <span className="hidden text-xs text-zinc-500 md:block">
            {busy ? "Processing…" : "All changes saved locally"}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[260px_1fr_320px]">
        {/* ------------------------------ left panel ----------------------------- */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Artwork
            </h2>
            {srcImage ? (
              <div className="mt-3 space-y-3">
                <p className="truncate text-sm font-semibold">{srcImage.name}</p>
                <p className="text-xs text-zinc-500">
                  {srcImage.width} × {srcImage.height} px processed
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-zinc-500"
                  >
                    Replace
                  </button>
                  <button
                    onClick={loadSample}
                    className="flex-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-zinc-500"
                  >
                    Sample
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                Drop a file on the canvas, or use the buttons in the center
                panel.
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadFromBlob(f, f.name);
                e.target.value = "";
              }}
            />
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Color separation
            </h2>
            <label className="mt-3 block text-xs text-zinc-400">
              Colors: <b className="text-zinc-200">{k}</b>
            </label>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="mt-1 w-full"
              disabled={!srcImage}
            />
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
              Fewer colors = bolder transfers and lower cost. 2–4 works best
              for most artwork.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Layout
            </h2>
            <label className="mt-3 block text-xs text-zinc-400">
              Design width:{" "}
              <b className="text-zinc-200">
                {designWidthIn}&quot; ({Math.round(designWidthIn * 25.4)} mm)
              </b>
            </label>
            <input
              type="range"
              min={4}
              max={16}
              step={0.5}
              value={designWidthIn}
              onChange={(e) => setDesignWidthIn(Number(e.target.value))}
              className="mt-1 w-full"
              disabled={!srcImage}
            />
            <label className="mt-3 block text-xs text-zinc-400">
              Stone gap: <b className="text-zinc-200">{gapMm.toFixed(2)} mm</b>
            </label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={gapMm}
              onChange={(e) => setGapMm(Number(e.target.value))}
              className="mt-1 w-full"
              disabled={!srcImage}
            />
            <p className="mt-3 block text-xs text-zinc-400">Edge fidelity</p>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {EDGE_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setEdgeMode(m.id)}
                  className={
                    "rounded-lg px-2 py-1.5 text-xs font-semibold " +
                    (edgeMode === m.id
                      ? "bg-fuchsia-500 text-zinc-950"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200")
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </section>
        </aside>

        {/* ------------------------------ center panel ---------------------------- */}
        <section className="flex flex-col gap-3">
          {hasGradients && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-300">
              This artwork contains gradients or photo detail. Try fewer
              colors, or submit it for a free manual proof — our designers
              will hand-place stones where automation can&apos;t.
            </div>
          )}
          {srcImage ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSource(false)}
                    className={
                      "rounded-lg px-3 py-1.5 text-xs font-semibold " +
                      (!showSource
                        ? "bg-fuchsia-500 text-zinc-950"
                        : "bg-zinc-900 text-zinc-400")
                    }
                  >
                    Stones
                  </button>
                  <button
                    onClick={() => setShowSource(true)}
                    className={
                      "rounded-lg px-3 py-1.5 text-xs font-semibold " +
                      (showSource
                        ? "bg-fuchsia-500 text-zinc-950"
                        : "bg-zinc-900 text-zinc-400")
                    }
                  >
                    Source
                  </button>
                </div>
                <span className="text-xs text-zinc-500">
                  {busy
                    ? "Processing…"
                    : `${stones.length.toLocaleString()} stones placed`}
                </span>
              </div>
              <div
                className="checker flex items-center justify-center overflow-hidden rounded-2xl border border-zinc-800"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
              >
                <canvas
                  ref={canvasRef}
                  className={
                    "h-auto w-full max-w-full transition-opacity " +
                    (dragOver ? "opacity-50" : "opacity-100")
                  }
                />
              </div>
              <p className="text-center text-[11px] text-zinc-600">
                Preview at processing resolution — the exported template uses
                exact millimeter coordinates.
              </p>
            </>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={
                "flex min-h-[480px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition " +
                (dragOver
                  ? "border-fuchsia-400 bg-fuchsia-500/10"
                  : "border-zinc-700 bg-zinc-900/30 hover:border-zinc-500")
              }
            >
              <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-400 shadow-[0_0_36px_rgba(232,121,249,0.5)]" />
              <p className="text-lg font-bold">Drop your artwork here</p>
              <p className="mt-1 text-sm text-zinc-500">
                PNG or JPG · flat, bold colors convert best
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void loadSample();
                }}
                className="mt-6 rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-300 hover:border-fuchsia-400 hover:text-fuchsia-300"
              >
                Or try a sample design
              </button>
            </div>
          )}
        </section>

        {/* ------------------------------ right panel ----------------------------- */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Color layers
            </h2>
            {separation && layerConfigs.length > 0 ? (
              <div className="mt-3 space-y-2">
                {separation.centers.map((c, i) => {
                  const cfg = layerConfigs[i];
                  if (!cfg) return null;
                  const count = layerCounts.get(i) ?? 0;
                  const stone = getColor(cfg.stoneColorId);
                  return (
                    <div
                      key={i}
                      className={
                        "rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 " +
                        (cfg.visible ? "" : "opacity-50")
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-5 w-5 shrink-0 rounded-full border border-zinc-700"
                          style={{
                            background: rgbToHex(c.r, c.g, c.b),
                          }}
                        />
                        <span className="flex-1 truncate text-xs font-semibold">
                          Layer {i + 1}
                          <span className="ml-1 font-normal text-zinc-500">
                            {count.toLocaleString()} stones
                          </span>
                        </span>
                        <button
                          onClick={() => {
                            setLayerConfigs((prev) =>
                              prev.map((p, j) =>
                                j === i ? { ...p, visible: !p.visible } : p,
                              ),
                            );
                          }}
                          className="rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-100"
                        >
                          {cfg.visible ? "HIDE" : "SHOW"}
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        <select
                          value={cfg.stoneColorId}
                          onChange={(e) => {
                            const v = e.target.value;
                            setLayerConfigs((prev) =>
                              prev.map((p, j) =>
                                j === i ? { ...p, stoneColorId: v } : p,
                              ),
                            );
                          }}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200"
                          style={{ color: stone.hex }}
                        >
                          {STONE_COLORS.map((sc) => (
                            <option key={sc.id} value={sc.id}>
                              {sc.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={cfg.sizeId}
                          onChange={(e) => {
                            const v = e.target.value;
                            setLayerConfigs((prev) =>
                              prev.map((p, j) =>
                                j === i ? { ...p, sizeId: v } : p,
                              ),
                            );
                          }}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200"
                        >
                          {STONE_SIZES.map((ss) => (
                            <option key={ss.id} value={ss.id}>
                              {ss.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                Upload artwork to see its color layers here. Each layer gets
                its own stone color and size.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Estimate
            </h2>
            {price ? (
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total stones</span>
                  <b>{price.stones.toLocaleString()}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Material / piece</span>
                  <b>${price.stoneCost.toFixed(2)}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Setup fee (once)</span>
                  <b>${price.setupFee.toFixed(2)}</b>
                </div>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as MaterialGrade)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200"
                >
                  {GRADES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label} — {g.note}
                    </option>
                  ))}
                </select>
                <div className="rounded-xl bg-zinc-950/60 p-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {price.perPiece.map((p) => (
                      <div key={p.qty}>
                        <p className="text-[10px] uppercase text-zinc-500">
                          {p.qty} pc{p.qty > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm font-bold">
                          ${p.cost.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-zinc-500">each</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-baseline justify-between border-t border-zinc-800 pt-3">
                    <span className="text-xs text-zinc-400">
                      Suggested retail (single)
                    </span>
                    <span className="text-lg font-black text-fuchsia-400">
                      ${price.suggestedRetail.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] leading-relaxed text-zinc-600">
                  Indicative demo pricing. Wire your real material cost card
                  into lib/rhinestone/pricing.ts before launch.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                Stone counts and pricing appear once layers are configured.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Export
            </h2>
            <div className="mt-3 space-y-2">
              <button
                onClick={exportProduction}
                disabled={!svgParams}
                className="w-full rounded-xl bg-fuchsia-500 px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Download production SVG
              </button>
              <button
                onClick={exportMockup}
                disabled={!svgParams}
                className="w-full rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Download mockup SVG
              </button>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                Production SVG: exact mm coordinates, grouped by SS size and
                stone color — feed it straight to your cutter or setting
                machine.
              </p>
            </div>
          </section>
        </aside>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-fuchsia-500/40 bg-zinc-950/95 px-5 py-2.5 text-sm font-medium text-fuchsia-200 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
