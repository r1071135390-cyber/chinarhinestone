#!/usr/bin/env node
/**
 * Image sitemap generator for chinarhinestone.com.
 *
 * Walks the prerendered HTML in ./out, extracts every <img> and
 * <source> src/url, deduplicates per page, and emits
 * ./out/image-sitemap.xml following Google's image-sitemap spec.
 *
 * Why a separate sitemap for images:
 *   Google Images is a separate index from web search. Submitting a
 *   dedicated image-sitemap.xml tells the crawler "these are the
 *   images I want indexed" — without it, image discovery relies on
 *   the standard sitemap's crawl path, which often misses
 *   second-and-later gallery images.
 *
 *   Spec: https://developers.google.com/search/docs/specialty/image-sitemaps
 *
 * Run as a postbuild step (after generate-sitemap.mjs).
 */
import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://chinarhinestone.com";
const OUT_DIR = fileURLToPath(new URL("../out", import.meta.url));

/* ── Image extensions we care about for the image sitemap. ──
 * Only output an entry for raster / vector / video poster images
 * that Google Images can actually index. Skip icons, favicons and
 * data: URIs.
 * ─────────────────────────────────────────────────────────── */
const IMG_RE = /\/(images|logo|pictures|gallery|products|industries|apps|fabrics|hero|rhinestone-assets|silicone-assets|dtf-assets|3d-assets|pu-assets|flock-assets|glitter-assets|reflective-assets|specialty-assets|tech-assets|transfer-assets|product-assets|sample-assets)\/[^"')\s>]+\.(?:jpg|jpeg|png|webp|avif|gif|svg)(?:\?[^"')\s>]*)?/gi;

const EXCLUDE_ROUTE = new Set(["/404", "/500", "/404.html", "/500.html"]);

function htmlPathToRoute(absPath) {
  const rel = relative(OUT_DIR, absPath).split(sep);
  if (rel[rel.length - 1] === "index.html") {
    rel.pop();
    return "/" + rel.join("/");
  }
  if (rel[rel.length - 1].endsWith(".html")) {
    rel[rel.length - 1] = rel[rel.length - 1].slice(0, -".html".length);
    return "/" + rel.join("/");
  }
  return null;
}

function pageTitleFromRoute(route) {
  if (route === "/") return "ChinaRhinestone — Custom Heat Transfer Manufacturer";
  const segments = route.split("/").filter(Boolean);
  if (segments.length === 0) return "ChinaRhinestone";
  /* "/heat-transfers/rhinestone-heat-transfers" -> "Rhinestone Heat Transfers" */
  const last = segments[segments.length - 1]
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  if (segments[0] === "heat-transfers") return `${last} — Custom Heat Transfers | ChinaRhinestone`;
  if (segments[0] === "industries") return `${last} — Heat Transfers for ${last} | ChinaRhinestone`;
  if (segments[0] === "applications") return `${last} Heat Transfers | ChinaRhinestone`;
  if (segments[0] === "fabrics") return `Heat Transfers for ${last} | ChinaRhinestone`;
  if (segments[0] === "resources") return `${last} — Custom Heat Transfer Guide | ChinaRhinestone`;
  return `${last} | ChinaRhinestone`;
}

function captionFromImageUrl(url, pageTitle) {
  /* Filename → human label: "rhinestone-austrian-grade" -> "Austrian Grade Rhinestone" */
  const filename = url.split("/").pop() || url;
  const stem = filename.replace(/\.[^.]+$/, "").replace(/-\d+$/, "");
  const human = stem
    .split("-")
    .filter((w) => !/^(webp|jpg|png|avif|gif|svg|img|image|photo|product|hero|gallery)$/i.test(w))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const short = human || pageTitle.split("—")[0].trim();
  return `${short} — production sample from ChinaRhinestone`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (e.name.endsWith(".html")) out.push(full);
  }
  return out;
}

async function main() {
  try {
    await stat(OUT_DIR);
  } catch {
    console.error(`[image-sitemap] No out/ at ${OUT_DIR}. Run \`next build\` first.`);
    process.exit(1);
  }

  const files = await walk(OUT_DIR);
  const entries = [];
  let totalImages = 0;

  for (const f of files) {
    const route = htmlPathToRoute(f);
    if (!route || EXCLUDE_ROUTE.has(route)) continue;

    const html = await readFile(f, "utf8");
    IMG_RE.lastIndex = 0;
    const seen = new Set();
    const images = [];
    let m;
    while ((m = IMG_RE.exec(html)) !== null) {
      let src = m[0];
      if (!src.startsWith("/")) continue;
      /* Normalize: drop query string, resolve relative to root. */
      src = src.split("?")[0];
      if (seen.has(src)) continue;
      seen.add(src);
      images.push(src);
      if (images.length >= 50) break; /* cap per page */
    }
    if (images.length === 0) continue;
    const title = pageTitleFromRoute(route);
    entries.push({ route, title, images });
    totalImages += images.length;
  }

  /* Sort for stable output. */
  entries.sort((a, b) => a.route.localeCompare(b.route));

  /* ── Emit XML. ── */
  let body = "";
  for (const e of entries) {
    body += `  <url>\n`;
    body += `    <loc>${SITE_URL}${e.route}</loc>\n`;
    for (const src of e.images) {
      const caption = captionFromImageUrl(src, e.title);
      body += `    <image:image>\n`;
      body += `      <image:loc>${SITE_URL}${src}</image:loc>\n`;
      body += `      <image:title>${escapeXml(e.title)}</image:title>\n`;
      body += `      <image:caption>${escapeXml(caption)}</image:caption>\n`;
      body += `    </image:image>\n`;
    }
    body += `  </url>\n`;
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n` +
    `<urlset\n` +
    `  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    body +
    `</urlset>\n`;

  await writeFile(join(OUT_DIR, "image-sitemap.xml"), xml, "utf8");
  console.log(
    `[image-sitemap] Wrote ${totalImages} images from ${entries.length} pages to out/image-sitemap.xml`
  );
}

main().catch((err) => {
  console.error("[image-sitemap]", err);
  process.exit(1);
});
