/**
 * SVG template generation — the bridge between the browser designer and
 * production. Two flavors:
 *
 *  - buildProductionSvg(): plain circles in real millimeters, grouped by
 *    "SS size + stone color". This is the interchange format understood by
 *    cutters, stencil makers and automatic setting machines (converts to DXF
 *    in one step).
 *
 *  - buildMockupSvg(): pretty, gradient-shaded stones for customer proofs.
 */

import { getColor, getSize, shade } from "./stones";
import type { Stone } from "./fill";

export interface LayerMeta {
  sizeId: string;
  colorId: string;
}

export interface SvgParams {
  stones: Stone[];
  /** layer index -> size/color assignment */
  layers: Record<number, LayerMeta>;
  /** physical design width in millimeters */
  designWidthMm: number;
  /** source image dimensions in pixels */
  imageWidth: number;
  imageHeight: number;
  designName?: string;
}

function groupStones(stones: Stone[]): Map<number, Stone[]> {
  const byLayer = new Map<number, Stone[]>();
  for (const s of stones) {
    const list = byLayer.get(s.layer);
    if (list) list.push(s);
    else byLayer.set(s.layer, [s]);
  }
  return byLayer;
}

function sanitizeName(name?: string): string {
  return (name ?? "untitled").replace(/[^a-zA-Z0-9 ._-]/g, "").slice(0, 60);
}

export function buildProductionSvg(p: SvgParams): string {
  const pxPerMm = p.imageWidth / p.designWidthMm;
  const wMm = p.designWidthMm;
  const hMm = p.imageHeight / pxPerMm;
  const byLayer = groupStones(p.stones);

  const countLines: string[] = [];
  const body: string[] = [];

  for (const [layerId, list] of byLayer) {
    const meta = p.layers[layerId];
    if (!meta) continue;
    const size = getSize(meta.sizeId);
    const color = getColor(meta.colorId);
    const rMm = size.diameterMm / 2;
    body.push(
      `<g id="${size.label}-${color.id.toUpperCase()}" fill="${color.hex}" data-count="${list.length}">`,
    );
    for (const s of list) {
      const x = (s.x / pxPerMm).toFixed(2);
      const y = (s.y / pxPerMm).toFixed(2);
      body.push(`<circle cx="${x}" cy="${y}" r="${rMm.toFixed(2)}"/>`);
    }
    body.push(`</g>`);
    countLines.push(`  ${size.label} ${color.name}: ${list.length} pcs`);
  }

  const header = [
    "ChinaRhinestone.com production template",
    `Design: ${sanitizeName(p.designName)}`,
    `Total stones: ${p.stones.length}`,
    ...countLines,
    "Units: millimeters. Each circle marks a stone center; r = stone radius.",
    "Add stencil cut tolerance (e.g. +0.15mm) when cutting template holes.",
    `Generated: ${new Date().toISOString()}`,
  ].join("\n");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${wMm.toFixed(2)}mm" height="${hMm.toFixed(2)}mm" viewBox="0 0 ${wMm.toFixed(2)} ${hMm.toFixed(2)}">`,
    `<!--\n${header}\n-->`,
    ...body,
    `</svg>`,
  ].join("\n");
}

export function buildMockupSvg(p: SvgParams): string {
  const pxPerMm = p.imageWidth / p.designWidthMm;
  const wMm = p.designWidthMm;
  const hMm = p.imageHeight / pxPerMm;
  const byLayer = groupStones(p.stones);

  const defs: string[] = [];
  const body: string[] = [];

  for (const [layerId, list] of byLayer) {
    const meta = p.layers[layerId];
    if (!meta) continue;
    const size = getSize(meta.sizeId);
    const color = getColor(meta.colorId);
    const rMm = size.diameterMm / 2;
    defs.push(
      `<radialGradient id="g${layerId}" cx="35%" cy="32%" r="75%">` +
        `<stop offset="0%" stop-color="${shade(color.hex, 0.6)}"/>` +
        `<stop offset="45%" stop-color="${color.hex}"/>` +
        `<stop offset="100%" stop-color="${shade(color.hex, -0.45)}"/>` +
        `</radialGradient>`,
    );
    body.push(`<g>`);
    for (const s of list) {
      const x = (s.x / pxPerMm).toFixed(2);
      const y = (s.y / pxPerMm).toFixed(2);
      body.push(
        `<circle cx="${x}" cy="${y}" r="${rMm.toFixed(2)}" fill="url(#g${layerId})"/>`,
      );
    }
    body.push(`</g>`);
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${wMm.toFixed(2)}mm" height="${hMm.toFixed(2)}mm" viewBox="0 0 ${wMm.toFixed(2)} ${hMm.toFixed(2)}">`,
    `<defs>${defs.join("")}</defs>`,
    `<rect width="100%" height="100%" fill="#101014"/>`,
    body.join("\n"),
    `</svg>`,
  ].join("\n");
}
