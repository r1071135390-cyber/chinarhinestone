/**
 * functions/_lib/retired-admin.ts
 *
 * Shared handler for the retired /admin path family.
 *
 * The admin portal moved to /administered. Cloudflare Pages keeps serving the
 * cached HTML document of a path that a previous deployment published, until
 * that cache entry expires (the old pages were served with
 * `s-maxage=604800`). So the renamed route alone does not take the old URL
 * down — /admin and its sub-paths stayed reachable from the edge cache for
 * days after the rename.
 *
 * A Pages Function that matches the path wins over the static asset, so
 * routing /admin here retires the old URL immediately and permanently.
 *
 * The response is deliberately tiny and never cached.
 */

import { PagesFunction } from "./pages-function";

/** True for the retired portal paths: /admin and /admin/<anything>. */
function isRetiredAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export const retiredAdminHandler: PagesFunction = async (context) => {
  const { pathname } = new URL(context.request.url);

  // Guard: if this handler is ever reached for a path outside the retired
  // /admin family, fall through to the normal asset/function pipeline so a
  // misconfigured route can never take the live portal down with it.
  if (!isRetiredAdminPath(pathname)) {
    return context.next();
  }

  return new Response("Not Found", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "x-robots-tag": "noindex, nofollow",
    },
  });
};
