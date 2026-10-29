// R126-J: settle the Access question for *.sublimapparel.pages.dev.
//
// Known so far:
//   - GET  /accounts/{pages}/access/apps                 -> 200, count=0
//   - POST /accounts/{pages}/access/apps                 -> 403 auth.forbidden
//   - the Access app that guards sublimapparel.com lives under team
//     domain sublimapparelteam.cloudflareaccess.com, i.e. a different
//     account than the one that owns the Pages project.
//
// Open questions this script answers:
//   Q1 which account owns the zone sublimapparel.com?
//   Q2 which account owns the Pages project, and does the token see both?
//   Q3 can the token write Access apps at ZONE level (a zone-scoped app may
//      still be able to claim a pages.dev hostname)?
//   Q4 can the token write Access apps in the ZONE's account (not the Pages
//      account)?
//   Q5 what exactly does the existing app that guards sublimapparel.com
//      cover — hostnames, paths, policy shape?
//
// Every write probe POSTs an empty body, which Cloudflare rejects on
// validation *after* the permission check. Nothing is ever created.

const TOKEN = process.env.CF_TOKEN;
const PAGES_ACCOUNT = process.env.PAGES_ACCOUNT_ID;

if (!TOKEN || !PAGES_ACCOUNT) {
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
    json = { raw: text.slice(0, 400) };
  }
  return { status: res.status, json };
}

function show(label, res, max = 900) {
  console.log(`\n### ${label}`);
  console.log(`status=${res.status}`);
  console.log(JSON.stringify(res.json).slice(0, max));
}

// ------------------------------------------------------------------ Q1
const zones = await cf("/zones?name=sublimapparel.com&per_page=5");
show("Q1 zone sublimapparel.com", zones, 700);
const zone = zones.json?.result?.[0];
const zoneId = zone?.id;
const zoneAccount = zone?.account?.id;
console.log(`zoneId=${zoneId} zoneAccount=${zoneAccount}`);

// ------------------------------------------------------------------ Q2
const accounts = await cf("/accounts?per_page=50");
const acctList = accounts.json?.result ?? [];
console.log(`\n### Q2 accounts visible to the token: ${acctList.length}`);
for (const a of acctList) {
  console.log(
    `  id=${a.id} name=${JSON.stringify(a.name)} pagesAccount=${a.id === PAGES_ACCOUNT}`,
  );
}

const pages = await cf(`/accounts/${PAGES_ACCOUNT}/pages/projects/sublimapparel`);
console.log(
  `\n### Q2 pages project (status=${pages.status}) domains=` +
    JSON.stringify(pages.json?.result?.domains),
);
console.log(
  `   production_branch=${pages.json?.result?.production_branch} ` +
    `canonical=${pages.json?.result?.canonical_deployment}`,
);

// ------------------------------------------------------------------ Q5
if (zoneId) {
  const zoneApps = await cf(`/zones/${zoneId}/access/apps?per_page=50`);
  console.log(`\n### Q5 zone-level access apps (status=${zoneApps.status})`);
  for (const app of zoneApps.json?.result ?? []) {
    console.log(
      `  id=${app.id} type=${app.type} domain=${JSON.stringify(app.domain)}`,
    );
    console.log(`     destinations=${JSON.stringify(app.destinations)}`);
    console.log(`     allowed_idps=${JSON.stringify(app.allowed_idps)}`);
    const pol = await cf(`/zones/${zoneId}/access/apps/${app.id}/policies`);
    console.log(
      `     policies=${JSON.stringify(pol.json?.result ?? []).slice(0, 1200)}`,
    );
  }

  // -------------------------------------------------------------- Q3
  const zoneWrite = await cf(`/zones/${zoneId}/access/apps`, "POST", {});
  show(
    "Q3 zone-level Access app WRITE probe",
    zoneWrite,
    700,
  );
}

// ------------------------------------------------------------------ Q4
if (zoneAccount && zoneAccount !== PAGES_ACCOUNT) {
  const acctApps = await cf(`/accounts/${zoneAccount}/access/apps?per_page=50`);
  console.log(
    `\n### Q4 account-level apps in the ZONE account ${zoneAccount} ` +
      `(status=${acctApps.status})`,
  );
  for (const app of acctApps.json?.result ?? []) {
    console.log(
      `  id=${app.id} type=${app.type} domain=${JSON.stringify(app.domain)} ` +
        `destinations=${JSON.stringify(app.destinations)}`,
    );
  }

  const acctWrite = await cf(`/accounts/${zoneAccount}/access/apps`, "POST", {});
  show("Q4 zone-account Access app WRITE probe", acctWrite, 700);
} else if (zoneAccount) {
  console.log("\n### Q4 zone account == pages account, covered by Q3/Q-above");
}

// --------------------------------------------------- existing access apps
const pagesAccountApps = await cf(
  `/accounts/${PAGES_ACCOUNT}/access/apps?per_page=50`,
);
console.log(
  `\n### pages-account apps (status=${pagesAccountApps.status}) count=` +
    `${(pagesAccountApps.json?.result ?? []).length}`,
);

const idps = await cf(`/accounts/${PAGES_ACCOUNT}/access/identity_providers`);
console.log(
  `### pages-account IdPs (status=${idps.status}) count=` +
    `${(idps.json?.result ?? []).length}`,
);

console.log("\nDONE-PROBE-SCOPE-2");
