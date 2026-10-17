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
  // Backend API routes live under ./functions/ at the project root.
  // Cloudflare Pages' GitHub Integration build pipeline reads this
  // directory directly (NOT out/functions/) and bundles it into _worker.js
  // using its built-in pages-functions-build tool — see
  // https://developers.cloudflare.com/pages/functions/get-started/
  // ("Make sure that the /functions directory is at the root of your
  // Pages project (and not in the static root, such as /dist).")
  //
  // `./functions` is excluded from the Next.js TypeScript compile via
  // tsconfig.json so it doesn't get picked up by `next build` either.
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
