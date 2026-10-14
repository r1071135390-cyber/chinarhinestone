/**
 * scripts/copy-functions.mjs
 *
 * Postbuild: copy ./functions into ./out/functions so Cloudflare Pages
 * picks them up as Pages Functions alongside the static export.
 *
 * Pages Functions files are auto-discovered at: <build_output>/functions
 * For us that's out/functions, so the build artifact must contain it.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "cf-functions-src");
const DST = path.join(ROOT, "out", "functions");

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      await copyDir(s, d);
    } else if (entry.isFile()) {
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
  await copyDir(SRC, DST);
  console.log(`[copy-functions] copied ${SRC} → ${DST}`);
}

main().catch((err) => {
  console.error("[copy-functions] failed:", err);
  process.exit(1);
});
