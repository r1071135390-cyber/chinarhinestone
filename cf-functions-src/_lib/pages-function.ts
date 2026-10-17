/**
 * functions/_lib/pages-function.ts
 *
 * Local PagesFunction type — used as a `global` shim in CF Pages Functions
 * source files. CF Pages build pipeline does not auto-resolve
 * `@cloudflare/workers-types`, so the global `PagesFunction` identifier
 * TypeScript otherwise expects is undefined at compile time and the
 * build silently fails — `pages-functions-build` then produces a
 * 404.html fallback for every /api/* path even though `wrangler pages
 * deploy` and the GitHub Integration deploy both report success.
 *
 * Re-declaring the interface here (and importing it explicitly) makes
 * the types work regardless of which esbuild / wrangler tool is doing
 * the bundling.
 */

export interface PagesFunction<E = unknown> {
  (context: {
    request: Request;
    env: E;
    params: Record<string, string | string[]>;
    data: unknown;
    next: () => Promise<Response>;
    waitUntil: (promise: Promise<unknown>) => void;
  }): Promise<Response> | Response;
}