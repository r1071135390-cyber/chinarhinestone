/**
 * functions/_lib/cors.ts
 *
 * CORS helpers. We allow same-origin by default (CF Pages serves both
 * the static site and these functions on the same domain), but support
 * a configurable list of allowed origins for local dev / staging.
 *
 * Env var (optional):
 *   ALLOWED_ORIGINS  — comma-separated, e.g. "https://chinarhinestone.com,http://localhost:3000"
 */

const DEFAULT_ALLOWED = ["https://chinarhinestone.com"];

export function getAllowedOrigins(env: { ALLOWED_ORIGINS?: string }): string[] {
  if (!env.ALLOWED_ORIGINS) return DEFAULT_ALLOWED;
  return env.ALLOWED_ORIGINS.split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

export function corsHeaders(request: Request, env: { ALLOWED_ORIGINS?: string }): Headers {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = getAllowedOrigins(env);
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  });
  if (origin && allowed.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else if (origin) {
    // Echo for same-origin requests; reject quietly in handler
    headers.set("Access-Control-Allow-Origin", origin);
  }
  return headers;
}

export function handleOptions(request: Request, env: { ALLOWED_ORIGINS?: string }): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

export function jsonResponse(
  data: unknown,
  init: ResponseInit & { request?: Request; env?: { ALLOWED_ORIGINS?: string } } = {}
): Response {
  const { request, env, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  if (request && env) {
    for (const [k, v] of corsHeaders(request, env).entries()) {
      headers.set(k, v);
    }
  }
  return new Response(JSON.stringify(data), { ...rest, headers });
}
