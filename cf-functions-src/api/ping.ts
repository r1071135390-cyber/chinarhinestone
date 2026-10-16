/**
 * functions/api/ping.ts
 *
 * GET /api/ping — debug endpoint: returns "pong" with a timestamp.
 *
 * No imports, no env vars, no helpers — pure plumbing sanity check.
 * If this returns JSON, Pages Functions are routing and running.
 * If it returns Next.js 404, the routing itself is broken.
 */
export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ pong: true, ts: new Date().toISOString() }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};

// CF Pages PagesFunction type is provided globally by the Functions runtime.
