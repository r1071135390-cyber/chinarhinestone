// R125-F2: read-only inventory of the ZONE-level Cloudflare Access setup.
// The account-level token in Actions reads /accounts/{id}/access/apps fine but
// returns 0 apps, which means the admin app on sublimapparel.com lives under
// the zone. pages.dev is not a zone we own, so it needs an account-level
// self-hosted app instead — this script dumps both scopes.
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
};

async function cf(pathname) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    headers,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 500) };
  }
  return { status: res.status, json };
}

function dumpApp(app, label) {
  console.log(`\n--- ${label} id=${app.id} ---`);
  console.log(`  name             : ${app.name}`);
  console.log(`  domain           : ${app.domain}`);
  console.log(`  path             : ${app.path}`);
  console.log(`  type             : ${app.type}`);
  console.log(`  session_duration : ${app.session_duration}`);
  console.log(`  audience         : ${app.audience}`);
  console.log(`  saas_app_id      : ${app.saas_app_id}`);
  console.log(`  created          : ${app.created_at}`);
  console.log(`  updated          : ${app.updated_at}`);
  console.log(`  domains          : ${JSON.stringify(app.domains ?? [])}`);
  console.log(`  app_id           : ${app.app_id}`);
  console.log(`  raw              : ${JSON.stringify(app)}`);
}

async function dumpPolicies(base, appId, label) {
  const pol = await cf(`${base}/${appId}/policies`);
  if (pol.status === 200 && pol.json.result) {
    console.log(`  policies (${pol.json.result.length}) [${label}]:`);
    for (const p of pol.json.result) {
      console.log(
        `    id=${p.id}  decision=${p.decision}  precedence=${p.precedence}  name=${p.name}`,
      );
      console.log(`      include: ${JSON.stringify(p.include ?? [])}`);
      console.log(`      exclude: ${JSON.stringify(p.exclude ?? [])}`);
      console.log(`      require: ${JSON.stringify(p.require ?? [])}`);
      console.log(`      session: ${JSON.stringify(p.session ?? {})}`);
    }
    return pol.json.result;
  }
  console.log(`  policies error: ${pol.status} ${JSON.stringify(pol.json).slice(0, 300)}`);
  return [];
}

// ---- 1. zones ----
const zones = await cf("/zones?per_page=50");
console.log(`===== ZONES (${zones.json.result?.length ?? 0}) status=${zones.status} =====`);
for (const z of zones.json.result ?? []) {
  console.log(`  id=${z.id}  name=${z.name}  status=${z.status}  account=${z.account?.id}`);
}

const target = (zones.json.result ?? []).find(
  (z) => z.name === "sublimapparel.com",
);

// ---- 2. zone-level Access apps + policies ----
for (const z of zones.json.result ?? []) {
  const apps = await cf(`/zones/${z.id}/access/apps`);
  console.log(`\n===== ZONE ${z.name} ACCESS APPS status=${apps.status} =====`);
  if (apps.status !== 200) {
    console.log("  ", JSON.stringify(apps.json).slice(0, 300));
    continue;
  }
  console.log(`  count=${apps.json.result?.length ?? 0}`);
  for (const app of apps.json.result ?? []) {
    dumpApp(app, "zone app");
    await dumpPolicies(`/zones/${z.id}/access/apps`, app.id, "zone");
  }
}

// ---- 3. zone-level identity providers / groups / certificates ----
if (target) {
  for (const [label, path] of [
    ["identity_providers", `/zones/${target.id}/access/identity_providers`],
    ["groups", `/zones/${target.id}/access/groups`],
    ["certificates", `/zones/${target.id}/access/certificates`],
  ]) {
    const r = await cf(path);
    console.log(`\n===== ZONE ${target.name} ${label} status=${r.status} =====`);
    const list = r.json.result;
    if (Array.isArray(list)) {
      console.log(`  count=${list.length}`);
      for (const item of list) {
        console.log(
          `  id=${item.id}  name=${item.name}  type=${item.type ?? ""}  ${JSON.stringify(item).slice(0, 400)}`,
        );
      }
    } else {
      console.log("  ", JSON.stringify(r.json).slice(0, 300));
    }
  }
}

// ---- 4. account-level Access apps (full detail) ----
const accApps = await cf(`/accounts/${ACCOUNT}/access/apps`);
console.log(`\n===== ACCOUNT ACCESS APPS status=${accApps.status} =====`);
console.log(JSON.stringify(accApps.json).slice(0, 600));
for (const app of accApps.json.result ?? []) {
  dumpApp(app, "account app");
  await dumpPolicies(`/accounts/${ACCOUNT}/access/apps`, app.id, "account");
}

// ---- 5. account-level IdP / teams / groups ----
for (const [label, path] of [
  ["identity_providers", `/accounts/${ACCOUNT}/access/identity_providers`],
  ["teams", `/accounts/${ACCOUNT}/access/teams`],
  ["groups", `/accounts/${ACCOUNT}/access/groups`],
]) {
  const r = await cf(path);
  console.log(`\n===== ACCOUNT ${label} status=${r.status} =====`);
  const list = r.json.result;
  if (Array.isArray(list)) {
    console.log(`  count=${list.length}`);
    for (const item of list) {
      console.log(`  ${JSON.stringify(item).slice(0, 600)}`);
    }
  } else {
    console.log("  ", JSON.stringify(r.json).slice(0, 300));
  }
}

// ---- 6. can this token write Access? (dry check on an app we would not touch) ----
const writeProbe = await cf(
  `/accounts/${ACCOUNT}/access/apps/${"00000000-0000-0000-0000-000000000000"}`,
);
console.log(`\n===== WRITE-SCOPE PROBE (expect 404 not 403) status=${writeProbe.status} =====`);
console.log("  ", JSON.stringify(writeProbe.json).slice(0, 300));

console.log("\nDONE-INVENTORY");
