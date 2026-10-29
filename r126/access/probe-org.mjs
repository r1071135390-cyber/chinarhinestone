// R126-G: read-only probe of the Zero Trust ORGANIZATION that backs the
// Pages account, plus a full dump of the Pages project.
//
// Why: the app that guards sublimapparel.com redirects to
// sublimapparelteam.cloudflareaccess.com. Before creating an account-level
// app for *.pages.dev we must know whether that team lives in THIS account
// (same auth_domain -> same IdP, same users) and whether the org has
// deny_unmatched_requests enabled (if so, a path-scoped app would block the
// rest of the public site).
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

function dump(title, res) {
  console.log(`\n===== ${title} (status=${res.status}) =====`);
  console.log(JSON.stringify(res.json, null, 2).slice(0, 6000));
}

// ---- 1. the Zero Trust organization of this account -------------------
dump("ORGANIZATION", await cf(`/accounts/${ACCOUNT}/access/organizations`));

// ---- 2. every account-level app, in full ------------------------------
dump("ACCOUNT ACCESS APPS", await cf(`/accounts/${ACCOUNT}/access/apps?per_page=100`));

// ---- 3. reusable policies ---------------------------------------------
dump("REUSABLE POLICIES", await cf(`/accounts/${ACCOUNT}/access/policies?per_page=100`));

// ---- 4. identity providers, in full -----------------------------------
dump("IDENTITY PROVIDERS", await cf(`/accounts/${ACCOUNT}/access/identity_providers`));

// ---- 5. the Pages project, in full ------------------------------------
dump("PAGES PROJECT sublimapparel", await cf(`/accounts/${ACCOUNT}/pages/projects/sublimapparel`));

// ---- 6. each domain of that project ------------------------------------
for (const d of ["sublimapparel.pages.dev", "sublimapparel.com"]) {
  dump(
    `PAGES DOMAIN ${d}`,
    await cf(`/accounts/${ACCOUNT}/pages/projects/sublimapparel/domains/${d}`),
  );
}

// ---- 7. which token is this --------------------------------------------
dump("TOKEN VERIFY", await cf("/user/tokens/verify"));

// ---- 8. teams (expected 403 with this token, kept for completeness) ----
dump("TEAMS", await cf(`/accounts/${ACCOUNT}/access/teams`));

console.log("\nDONE-PROBE-ORG");
