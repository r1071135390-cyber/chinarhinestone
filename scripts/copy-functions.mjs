/**
 * scripts/copy-functions.mjs
 *
 * Postbuild: copy ./cf-functions-src into ./out/ so Cloudflare Pages
 * picks them up as Pages Functions alongside the static export.
 *
 * Pages Functions files are auto-discovered at: <build_output>/functions
 * For us that's out/functions, so the build artifact must contain it.
 *
 * Files copied:
 *   cf-functions-src/_routes.json  →  out/_routes.json
 *   cf-functions-src/_lib/         →  out/functions/_lib/
 *   cf-functions-src/api/          →  out/functions/api/
 *
 * IMPORTANT: _routes.json must be at the ROOT of the build output
 * (i.e. out/_routes.json), NOT inside out/functions/. Without this,
 * CF Pages has no idea that /api/* should be routed to functions
 * and falls back to serving out/404.html for every /api/* request.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "cf-functions-src");
const FUNCTIONS_SRC = path.join(SRC);
const FUNCTIONS_DST = path.join(ROOT, "out", "functions");
const ROOT_ROUTES_SRC = path.join(SRC, "_routes.json");
const ROOT_ROUTES_DST = path.join(ROOT, "out", "_routes.json");

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules — CF Pages installs deps from
      // out/functions/package.json itself at deploy time. Bundling
      // node_modules/*.d.ts into the build triggers esbuild type errors.
      if (entry.name === "node_modules") continue;
      await copyDir(s, d);
    } else if (entry.isFile()) {
      // _routes.json doesn't belong inside functions/ — skip it.
      if (entry.name === "_routes.json") continue;
      await fs.copyFile(s, d);
    }
  }
}

async function main() {
  try {
    await fs.access(SRC);
  } catch {
    console.log("[copy-functions] no ./cf-functions-src directory, skipping");
    return;
  }
  try {
    await fs.access(path.join(ROOT, "out"));
  } catch {
    console.error("[copy-functions] ./out does not exist — run `next build` first.");
    process.exit(1);
  }

  // 1. Copy everything under cf-functions-src/ → out/functions/
  await copyDir(FUNCTIONS_SRC, FUNCTIONS_DST);
  console.log(`[copy-functions] copied ${FUNCTIONS_SRC} → ${FUNCTIONS_DST}`);

  // 2. Copy _routes.json to out/_routes.json (CF Pages reads from
  //    the build output root, not from inside functions/).
  try {
    await fs.access(ROOT_ROUTES_SRC);
    await fs.copyFile(ROOT_ROUTES_SRC, ROOT_ROUTES_DST);
    console.log(`[copy-functions] copied ${ROOT_ROUTES_SRC} → ${ROOT_ROUTES_DST}`);
  } catch {
    console.log(`[copy-functions] no ${ROOT_ROUTES_SRC}, skipping _routes.json`);
  }
}

main().catch((err) => {
  console.error("[copy-functions] failed:", err);
  process.exit(1);
});
