// R126: read-only probe of the Cloudflare API scope held by the
// CLOUDFLARE_API_TOKEN secret.
//
// Goal: find where the Access application that guards sublimapparel.com
// actually lives, so the same protection can be mirrored onto
// sublimapparel.pages.dev.
//
// Prints structure only — never prints secret values.

const TOKEN = process.env.CF_TOKEN;
const ACCOUNT = process.env.PAGES_ACCOUNT_ID;

if (!TOKEN || !ACCOUNT) {
  console.error("CF_TOKEN or PAGES_ACCOUNT_ID missing");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
  "User-Agent": "r126-probe",
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
    json = { raw: text.slice(0, 400) };
  }
  return { status: res.status, json };
}

function errors(json) {
  return (json.errors ?? []).map((e) => `${e.code}:${e.message}`).join(", ");
}

// ---------------------------------------------------------------- accounts
const accounts = await cf("/accounts?per_page=50");
console.log("===== VISIBLE ACCOUNTS =====");
console.log(`status=${accounts.status}`);
for (const a of accounts.json.result ?? []) {
  console.log(`  id=${a.id}  name=${a.name}`);
}
if (accounts.status !== 200) console.log(`  errors: ${errors(accounts.json)}`);

// ------------------------------------------------------------------- zones
const zones = await cf("/zones?per_page=50");
console.log("\n===== ALL ZONES (token-scoped) =====");
console.log(`status=${zones.status} count=${zones.json.result?.length ?? 0}`);
for (const z of zones.json.result ?? []) {
  console.log(`  id=${z.id}  name=${z.name}  account=${z.account?.id}`);
}
if (zones.status !== 200) console.log(`  errors: ${errors(zones.json)}`);

const byName = await cf("/zones?name=sublimapparel.com");
console.log(
  `\n===== ZONE LOOKUP sublimapparel.com ===== status=${byName.status} count=${byName.json.result?.length ?? 0}`,
);
const zone = (byName.json.result ?? [])[0];
if (zone) console.log(`  id=${zone.id}  name=${zone.name}  status=${zone.status}`);
else console.log(`  errors: ${errors(byName.json)}`);

// ---------------------------------------------- zone-scoped Access apps
if (zone) {
  const apps = await cf(`/zones/${zone.id}/access/apps`);
  console.log(`\n===== ZONE ACCESS APPS status=${apps.status} count=${apps.json.result?.length ?? 0} =====`);
  for (const app of apps.json.result ?? []) {
    console.log(`  id=${app.id}`);
    console.log(`    name=${app.name}`);
    console.log(`    domain=${app.domain}`);
    console.log(`    path=${app.path ?? ""}`);
    console.log(`    type=${app.type}  aud=${app.aud}`);
    console.log(`    domains=${JSON.stringify(app.domains ?? [])}`);
    console.log(`    allowed_idps=${JSON.stringify(app.allowed_idps ?? [])}`);
    console.log(`    policies=${JSON.stringify(app.policies ?? [])}`);
  }
  if (apps.status !== 200) console.log(`  errors: ${errors(apps.json)}`);

  for (const sub of ["identity_providers", "groups"]) {
    const r = await cf(`/zones/${zone.id}/access/${sub}`);
    console.log(`\n===== ZONE ${sub} status=${r.status} =====`);
    if (r.status === 200) {
      console.log(`  count=${r.json.result?.length ?? 0}`);
      for (const item of r.json.result ?? []) {
        console.log(`  ${JSON.stringify(item).slice(0, 400)}`);
      }
    } else {
      console.log(`  errors: ${errors(r.json)}`);
    }
  }
}

// ------------------------------------------- account-scoped Access apps
const accApps = await cf(`/accounts/${ACCOUNT}/access/apps?per_page=100`);
console.log(`\n===== ACCOUNT ACCESS APPS status=${accApps.status} count=${accApps.json.result?.length ?? 0} =====`);
for (const app of accApps.json.result ?? []) {
  console.log(`  id=${app.id}  name=${app.name}  domain=${app.domain}  type=${app.type}`);
}
if (accApps.status !== 200) console.log(`  errors: ${errors(accApps.json)}`);

for (const sub of ["identity_providers", "teams", "groups", "settings"]) {
  const r = await cf(`/accounts/${ACCOUNT}/access/${sub}`);
  console.log(`\n===== ACCOUNT ${sub} status=${r.status} =====`);
  if (r.status === 200) {
    const list = r.json.result;
    if (Array.isArray(list)) {
      console.log(`  count=${list.length}`);
      for (const item of list) console.log(`  ${JSON.stringify(item).slice(0, 400)}`);
    } else {
      console.log(`  ${JSON.stringify(r.json.result).slice(0, 600)}`);
    }
  } else {
    console.log(`  errors: ${errors(r.json)}`);
  }
}

// --------------------------------------------------------------- identity
const whoami = await cf("/user");
console.log(`\n===== TOKEN OWNER status=${whoami.status} =====`);
if (whoami.status === 200) {
  console.log(`  email=${whoami.json.result?.email}  id=${whoami.json.result?.id}`);
} else {
  console.log(`  errors: ${errors(whoami.json)}`);
}

// ------------------------------------------------------------ write probe
// A GET on a non-existent app id returns 404 (not 403) when the token may
// write at that scope, and 403 when it may not.
const writeProbe = await cf(
  `/accounts/${ACCOUNT}/access/apps/00000000-0000-0000-0000-000000000000`,
);
console.log(`\n===== ACCOUNT WRITE PROBE status=${writeProbe.status} =====`);
console.log(`  ${errors(writeProbe.json)}`);

if (zone) {
  const zoneWriteProbe = await cf(
    `/zones/${zone.id}/access/apps/00000000-0000-0000-0000-000000000000`,
  );
  console.log(`===== ZONE WRITE PROBE status=${zoneWriteProbe.status} =====`);
  console.log(`  ${errors(zoneWriteProbe.json)}`);
}

// ------------------------------------------------------------- Pages info
const proj = await cf(`/accounts/${ACCOUNT}/pages/projects/sublimapparel`);
console.log(`\n===== PAGES PROJECT sublimapparel status=${proj.status} =====`);
if (proj.status === 200) {
  const p = proj.json.result;
  console.log(`  domains=${JSON.stringify(p.domains ?? [])}`);
  console.log(`  canonical=${p.canonical_deployment?.url}`);
  console.log(`  production_branch=${p.production_branch}`);
  console.log(
    `  production env keys=${Object.keys(p.deployment_configs?.production?.env_vars ?? {}).join(",")}`,
  );
} else {
  console.log(`  errors: ${errors(proj.json)}`);
}

console.log("\nDONE-PROBE");
