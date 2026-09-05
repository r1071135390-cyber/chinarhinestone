#!/usr/bin/env node
/**
 * Sitemap generator for the static-export Next.js build.
 *
 * Why a custom script: `next-sitemap` (and Next.js's built-in sitemap)
 * read from a build manifest that doesn't exist after `output: "export"`.
 * We instead walk the rendered HTML files in ./out directly. Each .html
 * is one prerendered route. We assign priority/changefreq/lastmod per
 * path, then write ./out/sitemap.xml and ./out/robots.txt so the
 * Cloudflare Pages deploy serves the corrected version.
 *
 * Run as a `postbuild` script: `node scripts/generate-sitemap.mjs`.
 */
import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://chinarhinestone.com";
const OUT_DIR = fileURLToPath(new URL("../out", import.meta.url));
const TODAY = new Date().toISOString();

// Paths we never want indexed.
const EXCLUDE = new Set(["/404", "/404.html", "/500", "/500.html"]);

function htmlPathToRoute(absPath) {
  const rel = relative(OUT_DIR, absPath).split(sep);
  // out/heat-transfers/index.html -> /heat-transfers
  // out/heat-transfers/rhinestone-heat-transfers.html -> /heat-transfers/rhinestone-heat-transfers
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

function classify(path) {
  if (path === "/") return { priority: 1.0, changefreq: "weekly" };
  if (path === "/heat-transfers" || path === "/industries" || path === "/applications")
    return { priority: 0.9, changefreq: "weekly" };
  if (
    path === "/case-studies" ||
    path === "/get-a-quote" ||
    path.startsWith("/heat-transfers/") ||
    path.startsWith("/industries/") ||
    path.startsWith("/applications/")
  )
    return { priority: 0.8, changefreq: "monthly" };
  if (path.startsWith("/resources/") || path.startsWith("/fabrics/"))
    return { priority: 0.6, changefreq: "monthly" };
  if (
    path === "/about" ||
    path === "/contact" ||
    path === "/manufacturing" ||
    path === "/quality-control"
  )
    return { priority: 0.5, changefreq: "monthly" };
  return { priority: 0.7, changefreq: "monthly" };
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (e.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  try {
    await stat(OUT_DIR);
  } catch {
    console.error(`[sitemap] No out/ directory at ${OUT_DIR}. Run \`next build\` first.`);
    process.exit(1);
  }

  const files = await walk(OUT_DIR);
  const routes = [];
  for (const f of files) {
    const route = htmlPathToRoute(f);
    if (!route) continue;
    if (EXCLUDE.has(route)) continue;
    const { priority, changefreq } = classify(route);
    routes.push({ loc: route, priority, changefreq, lastmod: TODAY });
  }

  // Stable, predictable order for the file we ship to Cloudflare.
  routes.sort((a, b) => a.loc.localeCompare(b.loc));

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    routes
      .map(
        (r) =>
          `  <url>\n` +
          `    <loc>${SITE_URL}${r.loc}</loc>\n` +
          `    <lastmod>${r.lastmod}</lastmod>\n` +
          `    <changefreq>${r.changefreq}</changefreq>\n` +
          `    <priority>${r.priority}</priority>\n` +
          `  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  await writeFile(join(OUT_DIR, "sitemap.xml"), xml, "utf8");

  // robots.txt — only write if the project doesn't already ship one in
  // public/, which takes precedence when present.
  const robots =
    `User-agent: *\n` +
    `Allow: /\n` +
    `\n` +
    `Sitemap: ${SITE_URL}/sitemap.xml\n`;
  await writeFile(join(OUT_DIR, "robots.txt"), robots, "utf8");

  console.log(`[sitemap] Wrote ${routes.length} URLs to out/sitemap.xml`);
}

main().catch((err) => {
  console.error("[sitemap]", err);
  process.exit(1);
});
