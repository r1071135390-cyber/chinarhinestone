// R126-H: locate the Cloudflare account that owns the zone behind
// sublimapparel.com, and locate the existing Access application.
//
// Facts so far (from R126-G probe):
//   - Pages account 25051d5cc4fd3edd4dce0880c7d0b28e owns project sublimapparel
//   - the custom domain entry carries zone_tag 9b222aa6cbde5d084b8575c6dfb37479
//   - GET /zones returns count=0 for this token (no zone visibility)
//   - GET /accounts/{acct}/access/apps returns count=0 (no account-level app)
//   - the existing Access app has kid f52942b1...b90f2d and lives behind
//     team domain sublimapparelteam.cloudflareaccess.com
//
// The decisive question: is that zone in the SAME Cloudflare account as the
// Pages project? If yes, an account-level self-hosted app created here would
// share the same Zero Trust team (same login page, same IdP, same users).
//
// Read-only. Prints structure only.

const TOKEN = process.env.CF_TOKEN;
const ACCOUNT = process.env.PAGES_ACCOUNT_ID;
const ZONE = "9b222aa6cbde5d084b8575c6dfb37479";
const APP_ID = "f52942b1cb7229dc9cc021dd29194a80f09ff597452993f58c56aa01f8b90f2d";

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
    json = { raw: text.slice(0, 400) };
  }
  return { status: res.status, json };
}

function dump(title, res, max = 4000) {
  console.log(`\n===== ${title} (status=${res.status}) =====`);
  console.log(JSON.stringify(res.json, null, 2).slice(0, max));
}

// ---- 1. every account the token can see, with names ---------------------
const accounts = await cf("/accounts?per_page=50");
console.log("\n===== VISIBLE ACCOUNTS =====");
console.log(`status=${accounts.status}`);
for (const a of accounts.json?.result ?? []) {
  console.log(`  id=${a.id} name="${a.name}" type=${a.type}`);
}
if (!Array.isArray(accounts.json?.result)) {
  console.log("  raw:", JSON.stringify(accounts.json).slice(0, 800));
}

// ---- 2. the zone behind sublimapparel.com -------------------------------
dump("ZONE BY ID", await cf(`/zones/${ZONE}`));
dump("ZONE ACCESS APPS", await cf(`/zones/${ZONE}/access/apps`));
dump("ZONE ACCESS POLICIES", await cf(`/zones/${ZONE}/access/policies`));

// ---- 3. zones filtered by the Pages account ----------------------------
dump(
  "ZONES IN PAGES ACCOUNT",
  await cf(`/zones?account.id=${ACCOUNT}&per_page=50`),
  2000,
);

// ---- 4. is the known Access app account-level or zone-level? ------------
dump(
  "KNOWN APP BY ID (account)",
  await cf(`/accounts/${ACCOUNT}/access/apps/${APP_ID}`),
  3000,
);
dump(
  "KNOWN APP BY ID (zone)",
  await cf(`/zones/${ZONE}/access/apps/${APP_ID}`),
  3000,
);

// ---- 5. account-level app list, verbose ---------------------------------
dump(
  "ACCOUNT ACCESS APPS",
  await cf(`/accounts/${ACCOUNT}/access/apps?per_page=100`),
  2000,
);

// ---- 6. Zero Trust orgs list (accounts endpoint variant) ---------------
dump(
  "ACCOUNT ZERO TRUST ORGS",
  await cf(`/accounts/${ACCOUNT}/access/organizations?per_page=50`),
  2000,
);

// ---- 7. certificates: the team domain shows up here --------------------
dump(
  "ACCESS CERTIFICATES",
  await cf(`/accounts/${ACCOUNT}/access/certificates`),
  3000,
);

// ---- 8. every Pages project in the account ------------------------------
const projects = await cf(`/accounts/${ACCOUNT}/pages/projects`);
console.log("\n===== PAGES PROJECTS =====");
for (const p of projects.json?.result ?? []) {
  console.log(
    `  ${p.name} subdomain=${p.subdomain} domains=${JSON.stringify(p.domains)}`,
  );
}

console.log("\nDONE-PROBE-ZONE");
