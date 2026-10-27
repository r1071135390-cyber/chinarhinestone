/**
 * functions/admin.ts
 *
 * The admin portal lives at /administered. This handler retires the old
 * /admin path so it can never be used to reach the portal.
 *
 * See _lib/retired-admin.ts for why a Function is needed instead of simply
 * removing the route.
 */

import { retiredAdminHandler } from "./_lib/retired-admin";

export const onRequest = retiredAdminHandler;
