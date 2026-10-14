import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — produces plain HTML/CSS/JS under ./out.
  // Cloudflare Pages serves these directly from the edge cache, so we don't
  // need a Worker and won't hit the Workers 10ms CPU limit. Image
  // optimization must be disabled because it requires a server.
  //
  // Note: `redirects()` is not available with `output: "export"`. The
  // V1 → V2 rewrites are configured in public/_redirects instead, which
  // Cloudflare Pages honours at the edge.
  //
  // Backend API routes live under ./cf-functions-src/ (kept OUT of the
  // Next.js scan by convention) and are copied to ./out/functions/ by
  // scripts/copy-functions.mjs at postbuild time. Cloudflare Pages picks
  // them up as Pages Functions alongside the static export.
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
