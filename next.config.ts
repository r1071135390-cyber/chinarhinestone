import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // V1 → V2 rewrites
      { source: "/products", destination: "/heat-transfers", permanent: true },
      { source: "/products/:slug", destination: "/heat-transfers", permanent: true },
      { source: "/design", destination: "/designer.html", permanent: false },
    ];
  },
};

export default nextConfig;
