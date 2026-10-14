/**
 * functions/_middleware.ts
 *
 * Runs on every Functions request before the route handler.
 * - Adds CORS headers
 * - Short-circuits OPTIONS preflight
 *
 * NOTE: Pages Functions _middleware.ts lives at functions/_middleware.ts
 * and applies to all files in functions/ and subdirectories.
 */

import { corsHeaders, handleOptions } from "./_lib/cors";

export const onRequest: PagesFunction<{ ALLOWED_ORIGINS?: string }> = async (context) => {
  // Preflight: short-circuit
  if (context.request.method === "OPTIONS") {
    return handleOptions(context.request, context.env);
  }

  // Continue to the actual handler
  const response = await context.next();

  // Attach CORS headers to the response
  const cors = corsHeaders(context.request, context.env);
  for (const [k, v] of cors.entries()) {
    response.headers.set(k, v);
  }
  return response;
};

interface PagesFunction<E = unknown> {
  (context: {
    request: Request;
    env: E;
    params: Record<string, string | string[]>;
    data: unknown;
    next: () => Promise<Response>;
    waitUntil: (promise: Promise<unknown>) => void;
  }): Promise<Response> | Response;
}
