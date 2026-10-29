// R126-K: definitive boundary probe.
//
// Facts established by probe2:
//   - Pages account 25051d5cc4fd3edd4dce0880c7d0b28e owns project sublimapparel
//     with domains [sublimapparel.pages.dev, sublimapparel.com]
//   - the token CANNOT list zones (GET /zones -> count 0) and CANNOT list
//     accounts (GET /accounts -> count 0)
//   - GET  /accounts/{acct}/access/apps -> 200, count 0
//   - POST /accounts/{acct}/access/apps -> 403 auth.forbidden
//   - Pages account has 0 IdPs and 0 account-level Access apps
//   - the Access app guarding sublimapparel.com has kid f52942b1...b90f2d and
//     redirects to team domain sublimapparelteam.cloudflareaccess.com
//   - the custom domain entry carries zone id 9b222aa6cbde5d084b8575c6dfb37479
//
// This probe answers the remaining questions:
//   A. can the token SEE the zone when addressed by id (not by name)?
//   B. does the zone live in the Pages account, and does that zone hold the
//      app that guards sublimapparel.com?
//   C. can the token WRITE an Access app at ZONE level?
//   D. what exact permission groups does this token carry?
//      GET /user/tokens/{id} is the only API that reports them.
//   E. does the org set deny_unmatched_requests? If yes, an account-level
//      app would also block the public site, and we must NOT create one
//      without a careful path scope.
//
// Every write probe POSTs an empty body: Cloudflare rejects it on validation
// AFTER the permission check, so a 4xx proves the permission state without
// creating anything.

const TOKEN = process.env.CF_TOKEN;
const ACCOUNT = process.env.PAGES_ACCOUNT_ID;
const ZONE = "9b222aa6cbde5d084b8575c6dfb37479";
const APP_ID =
  "f52942b1cb7229dc9cc021dd29194a80f09ff597452993f58c56aa01f8b90f2d";

if (!TOKEN || !ACCOUNT) {
  console.error("CF_TOKEN or PAGES_ACCOUNT_ID missing");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function cf(pathname, method = "GET", body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  return { status: res.status, json };
}

function line(label, res, max = 700) {
  console.log(`\n### ${label}  [${res.status}]`);
  console.log(JSON.stringify(res.json).slice(0, max));
}

// ------------------------------------------------------------------- D
const verify = await cf("/user/tokens/verify");
const tokenId = verify.json?.result?.id;
console.log(`token id = ${tokenId} status = ${verify.json?.result?.status}`);

if (tokenId) {
  const full = await cf(`/user/tokens/${tokenId}`);
  console.log(`\n### D token permission groups`);
  if (full.status === 200) {
    const p = full.json?.result?.permissions ?? [];
    console.log(`  count=${p.length}`);
    for (const perm of p) {
      const groups = Array.isArray(perm.permissions)
        ? perm.permissions
        : perm.permissions ?? [];
      for (const g of groups) {
        console.log(
          `  ${g.id ?? g.name ?? JSON.stringify(g)}  scope=${perm.scope?.id ?? perm.scope?.name ?? "?"}`,
        );
      }
    }
  } else {
    console.log(JSON.stringify(full.json).slice(0, 500));
  }
}

// ------------------------------------------------------------------- E
const org = await cf(`/accounts/${ACCOUNT}/access/organizations`);
console.log(`\n### E organization`);
if (org.status === 200) {
  const o = org.json?.result?.[0] ?? {};
  console.log(`  auth_domain=${o.auth_domain}`);
  console.log(`  deny_unmatched_requests=${o.deny_unmatched_requests}`);
  console.log(`  allow_authenticate_via_warp=${o.allow_authenticate_via_warp}`);
  console.log(`  is_ui_read_only=${o.is_ui_read_only}`);
} else {
  console.log(JSON.stringify(org.json).slice(0, 500));
}

// ------------------------------------------------------------------- A
const zone = await cf(`/zones/${ZONE}`);
console.log(`\n### A zone by id`);
if (zone.status === 200) {
  const z = zone.json?.result ?? {};
  console.log(`  name=${z.name} status=${z.status}`);
  console.log(`  account.id=${z.account?.id} account.name=${z.account?.name}`);
  console.log(`  accountMatchesPagesAccount=${z.account?.id === ACCOUNT}`);
} else {
  console.log(JSON.stringify(zone.json).slice(0, 400));
}

// ------------------------------------------------------------------- B
const zoneApps = await cf(`/zones/${ZONE}/access/apps?per_page=50`);
console.log(`\n### B zone-level access apps [${zoneApps.status}]`);
for (const app of zoneApps.json?.result ?? []) {
  console.log(`  id=${app.id}`);
  console.log(`    name=${JSON.stringify(app.name)} type=${app.type}`);
  console.log(`    domain=${JSON.stringify(app.domain)}`);
  console.log(`    destinations=${JSON.stringify(app.destinations)}`);
  console.log(`    allowed_idps=${JSON.stringify(app.allowed_idps)}`);
  console.log(`    self_hosted=${app.self_hosted}`);
  const pol = await cf(`/zones/${ZONE}/access/apps/${app.id}/policies`);
  console.log(`    policies=${JSON.stringify(pol.json?.result ?? []).slice(0, 1500)}`);
}

// ------------------------------------------------------------------- C
const zoneWrite = await cf(`/zones/${ZONE}/access/apps`, "POST", {});
console.log(`\n### C zone-level Access app WRITE probe`);
console.log(`  status=${zoneWrite.status}`);
console.log(`  ${JSON.stringify(zoneWrite.json).slice(0, 500)}`);

// can we see the known app at account level?
const appAtAccount = await cf(`/accounts/${ACCOUNT}/access/apps/${APP_ID}`);
console.log(
  `\n### known app ${APP_ID.slice(0, 8)} at account level [${appAtAccount.status}]`,
);
console.log(`  ${JSON.stringify(appAtAccount.json).slice(0, 400)}`);

// and at zone level?
const appAtZone = await cf(`/zones/${ZONE}/access/apps/${APP_ID}`);
console.log(`\n### known app at zone level [${appAtZone.status}]`);
console.log(`  ${JSON.stringify(appAtZone.json).slice(0, 400)}`);

console.log("\nDONE-PROBE-SCOPE-3");
