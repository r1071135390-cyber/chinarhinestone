// R125-F: read-only inventory of the Cloudflare Access configuration.
// Runs inside GitHub Actions so it can use the CLOUDFLARE_API_TOKEN secret.
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
    json = { raw: text.slice(0, 500) };
  }
  return { status: res.status, json };
}

function show(title, obj) {
  console.log(`\n===== ${title} =====`);
  console.log(JSON.stringify(obj, null, 2));
}

// ---- 1. Access applications (self-hosted + zone apps) ----
const apps = await cf(`/accounts/${ACCOUNT}/access/apps`);
if (apps.status !== 200 || !apps.json.result) {
  console.log("apps error:", apps.status, JSON.stringify(apps.json).slice(0, 400));
} else {
  console.log(`\n===== ACCESS APPLICATIONS (${apps.json.result.length}) =====`);
  for (const app of apps.json.result) {
    console.log(`\n--- app id=${app.id} ---`);
    console.log(`  name        : ${app.name}`);
    console.log(`  domain      : ${app.domain}`);
    console.log(`  type        : ${app.type}`);
    console.log(`  session_duration : ${app.session_duration}`);
    console.log(`  created     : ${app.created_at}`);
    console.log(`  updated     : ${app.updated_at}`);
    console.log(`  domains     : ${JSON.stringify(app.domains ?? [])}`);
    console.log(`  app_id      : ${app.app_id}`);

    // Policies attached to this app
    const pol = await cf(
      `/accounts/${ACCOUNT}/access/apps/${app.id}/policies`,
    );
    if (pol.status === 200 && pol.json.result) {
      console.log(`  policies (${pol.json.result.length}):`);
      for (const p of pol.json.result) {
        console.log(
          `    id=${p.id}  decision=${p.decision}  precedence=${p.precedence}  name=${p.name}`,
        );
        console.log(`      include: ${JSON.stringify(p.include ?? [])}`);
        console.log(`      exclude: ${JSON.stringify(p.exclude ?? [])}`);
        console.log(`      require: ${JSON.stringify(p.require ?? [])}`);
      }
    } else {
      console.log(`  policies error: ${pol.status} ${JSON.stringify(pol.json).slice(0, 300)}`);
    }
  }
}

// ---- 2. Access identity providers ----
const idps = await cf(`/accounts/${ACCOUNT}/access/identity_providers`);
console.log(`\n===== IDENTITY PROVIDERS (${idps.json.result?.length ?? 0}) =====`);
for (const idp of idps.json.result ?? []) {
  console.log(
    `  id=${idp.id}  name=${idp.name}  type=${idp.type}  config_keys=${Object.keys(idp.config ?? {}).join(",")}`,
  );
}

// ---- 3. Access groups ----
const groups = await cf(`/accounts/${ACCOUNT}/access/groups`);
console.log(`\n===== ACCESS GROUPS (${groups.json.result?.length ?? 0}) =====`);
for (const g of groups.json.result ?? []) {
  console.log(`  id=${g.id}  name=${g.name}`);
  console.log(`    include: ${JSON.stringify(g.include ?? [])}`);
}

// ---- 4. Access teams / account ----
const teams = await cf(`/accounts/${ACCOUNT}/access/teams`);
console.log(`\n===== ACCESS TEAMS (${teams.json.result?.length ?? 0}) =====`);
for (const t of teams.json.result ?? []) {
  console.log(`  id=${t.id}  name=${t.name}  auth_domain=${t.auth_domain}`);
}

// ---- 5. Access settings (login/logout pages, allow auth without login) ----
const settings = await cf(`/accounts/${ACCOUNT}/access/settings`);
show("ACCESS SETTINGS", settings.json.result ?? settings.json);

// ---- 6. The Pages project itself: is pages.dev protected? ----
const projects = await cf(`/accounts/${ACCOUNT}/pages/projects`);
console.log(`\n===== ALL PAGES PROJECTS (${projects.json.result?.length ?? 0}) =====`);
for (const p of projects.json.result ?? []) {
  console.log(
    `  name=${p.name}  sub_domain=${p.sub_domain}  prod_branch=${p.production_branch}`,
  );
  console.log(`    domains: ${JSON.stringify(p.domains ?? [])}`);
  console.log(
    `    deployment_configs: ${JSON.stringify(p.deployment_configs ?? {}).slice(0, 300)}`,
  );
}

const proj = await cf(`/accounts/${ACCOUNT}/pages/projects/sublimapparel`);
if (proj.status === 200 && proj.json.result) {
  const p = proj.json.result;
  console.log(`\n===== PAGES PROJECT sublimapparel =====`);
  console.log(`  name: ${p.name}`);
  console.log(`  sub_domain: ${p.sub_domain}`);
  console.log(`  domains: ${JSON.stringify(p.domains ?? [])}`);
  console.log(`  production_branch: ${p.production_branch}`);
  console.log(`  canonical_deployment: ${p.canonical_deployment?.url}`);
  console.log(`  deployment_configs: ${JSON.stringify(p.deployment_configs ?? {}, null, 2)}`);
} else {
  console.log("project error:", proj.status, JSON.stringify(proj.json).slice(0, 300));
}

// ---- 7. Is there already an Access app covering pages.dev? ----
console.log("\n===== Access apps whose domain mentions pages.dev =====");
const allApps = await cf(`/accounts/${ACCOUNT}/access/apps`);
for (const app of allApps.json.result ?? []) {
  const hay = `${app.domain} ${JSON.stringify(app.domains ?? [])}`;
  if (hay.includes("pages.dev")) {
    console.log(`  id=${app.id}  name=${app.name}  domain=${app.domain}`);
  }
}
console.log("(none listed above means no pages.dev Access app exists yet)");
