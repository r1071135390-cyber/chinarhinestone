/**
 * functions/api/ping.ts
 *
 * GET /api/ping — debug endpoint: returns "pong" with a timestamp.
 *
 * No imports of env vars or helpers — pure plumbing sanity check.
 * If this returns JSON, Pages Functions are routing and running.
 * If it returns Next.js 404, the routing itself is broken.
 *
 * The PagesFunction type is imported explicitly (rather than relying on
 * a global @cloudflare/workers-types) so the build works regardless of
 * which bundler CF Pages uses.
 */
import { PagesFunction } from "../_lib/pages-function";

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ pong: true, ts: new Date().toISOString() }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};
