/**
 * functions/admin/[[path]].ts
 *
 * Retires the whole /admin path family (/admin, /admin/summary,
 * /admin/new-pi, /admin/bank-accounts, ...) with a 404.
 *
 * The admin portal moved to /administered. Cloudflare Pages keeps serving the
 * cached HTML document of a path a previous deployment published, until that
 * cache entry expires — the old pages were served with
 * `s-maxage=604800`, so /admin/bank-accounts kept returning the full old
 * admin page for days after the rename. A Pages Function that matches the
 * path wins over the static asset, so routing /admin here retires the old
 * URLs immediately and permanently.
 *
 * The response is deliberately tiny and never cached.
 */

import { retiredAdminHandler } from "../_lib/retired-admin";

export const onRequest = retiredAdminHandler;
