// R126-I: create an account-level Cloudflare Access application that covers
// the Pages deployment hostnames, so *.pages.dev can no longer be used to
// bypass the Access policy that guards sublimapparel.com.
//
// Why account level: pages.dev is not a zone the customer owns, so the only
// scope that can protect it is an account-level self-hosted application.
//
// API contract notes (verified against the live OpenAPI schema):
//   - `destinations` supersedes `self_hosted_domains` (deprecated 2025-11-21).
//     A public destination is { type: "public", uri: "hostname/path" }.
//   - `uri` implicitly covers sub-paths; override path patterns do not.
//   - `policies` may carry inline policy objects, so app + policy can be
//     created in one call and the app is never briefly policy-less.
//
// The Pages account has an empty Zero Trust org (0 IdPs, 0 account apps), so
// this script also provisions the built-in One-time PIN IdP that the email
// policy needs. Without an IdP the app would exist but nobody could log in.
//
// Mode:
//   probe  (default) — dry run. Reads current state, POSTs an empty body to
//                       learn whether the token may write Access apps at all
//                       (a validation error proves write access without
//                       creating anything).
//   create          — provisions the IdP if needed, creates the app and
//                       attaches the allow policy.

const TOKEN = process.env.CF_TOKEN;
const ACCOUNT = process.env.PAGES_ACCOUNT_ID;
const MODE = process.env.R126_MODE || "probe";
const ALLOW_EMAIL = process.env.R126_ALLOW_EMAIL || "admin@sublimapparel.com";

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
    json = { raw: text.slice(0, 600) };
  }
  return { status: res.status, json };
}

function brief(res, max = 500) {
  return `${res.status} ${JSON.stringify(res.json).slice(0, max)}`;
}

// Both the stable project hostname and every deployment-hash hostname must be
// covered: Pages serves <hash>.<project>.pages.dev for each deployment, and
// the hash subdomain alone would bypass a project-only rule.
const DESTINATIONS = [
  { type: "public", uri: "sublimapparel.pages.dev/administered" },
  { type: "public", uri: "*.sublimapparel.pages.dev/administered" },
];

const APP_NAME = "SublimApparel Pages admin";

// ---------------------------------------------------------------- probe
console.log("===== PROBE =====");

const list = await cf(`/accounts/${ACCOUNT}/access/apps?per_page=100`);
console.log(`apps list         : ${brief(list, 200)}`);

// An empty body must fail validation if — and only if — this token is
// allowed to create Access applications. Nothing is created either way.
const validation = await cf(`/accounts/${ACCOUNT}/access/apps`, "POST", {});
console.log(`write validation  : ${brief(validation, 600)}`);

const idps = await cf(`/accounts/${ACCOUNT}/access/identity_providers`);
console.log(`identity providers: ${brief(idps, 400)}`);

// Same trick for IdPs: an empty body proves write access without creating.
const idpValidation = await cf(
  `/accounts/${ACCOUNT}/access/identity_providers`,
  "POST",
  {},
);
console.log(`idp write probe   : ${brief(idpValidation, 400)}`);

const idpList = idps.json?.result ?? [];
const otpIdp = idpList.find(
  (i) => i.type === "onetime_pin" || i.name === "One-time PIN",
);

console.log(`existing otp idp  : ${otpIdp ? `${otpIdp.id} (${otpIdp.type})` : "none"}`);

if (MODE !== "create") {
  console.log("\nprobe-only run — no changes made");
  process.exit(0);
}

// --------------------------------------------------------------- create
console.log("\n===== CREATE =====");

// 1. An email-based allow policy needs an identity provider to authenticate
//    against. The Pages account has none, so provision the built-in OTP one.
let allowedIdps = idpList.map((i) => i.id);
if (!otpIdp) {
  console.log("no One-time PIN IdP — creating it");
  const created = await cf(
    `/accounts/${ACCOUNT}/access/identity_providers`,
    "POST",
    { name: "One-time PIN", type: "onetime_pin", config: {} },
  );
  console.log(`create idp        : ${brief(created, 600)}`);
  const newIdp = created.json?.result;
  if (newIdp?.id) {
    allowedIdps = [...allowedIdps, newIdp.id];
  }
} else {
  console.log("One-time PIN IdP already present — reusing it");
}

// 2. Never create a duplicate app.
const existing = (list.json?.result ?? []).find((a) =>
  (a.destinations ?? []).some((d) =>
    DESTINATIONS.some((want) => d.uri === want.uri),
  ),
);
if (existing) {
  console.log(`already exists: id=${existing.id}`);
  const pol = await cf(`/accounts/${ACCOUNT}/access/apps/${existing.id}/policies`);
  console.log(`policies: ${brief(pol, 900)}`);
  process.exit(0);
}

const appBody = {
  name: APP_NAME,
  type: "self_hosted",
  domain: "sublimapparel.pages.dev/administered",
  destinations: DESTINATIONS,
  session_duration: "24h",
  auto_redirect_to_identity: false,
  app_launcher_visible: false,
  allowed_idps: allowedIdps,
  policies: [
    {
      name: "Pages admin path",
      decision: "allow",
      precedence: 1,
      include: [{ email: { email: ALLOW_EMAIL } }],
      exclude: [],
      require: [],
    },
  ],
};

console.log(
  `creating app: ${JSON.stringify({
    name: appBody.name,
    domain: appBody.domain,
    destinations: appBody.destinations,
    allowed_idps: appBody.allowed_idps,
  })}`,
);

const created = await cf(`/accounts/${ACCOUNT}/access/apps`, "POST", appBody);
console.log(`create app        : ${brief(created, 900)}`);

if (created.status >= 300 || !created.json?.result?.id) {
  console.log("CREATE FAILED — no policy was attached, nothing else to do");
  process.exit(1);
}

const appId = created.json.result.id;
console.log(`created app id    : ${appId}`);

const policies = await cf(`/accounts/${ACCOUNT}/access/apps/${appId}/policies`);
console.log(`policies          : ${brief(policies, 900)}`);

// The inline policy may have been rejected silently. If the app came back
// without one, attach it explicitly.
const policyCount = (policies.json?.result ?? []).length;
if (!policyCount) {
  console.log("no policy attached — creating it explicitly");
  const policy = await cf(
    `/accounts/${ACCOUNT}/access/apps/${appId}/policies`,
    "POST",
    {
      name: "Pages admin path",
      decision: "allow",
      precedence: 1,
      include: [{ email: { email: ALLOW_EMAIL } }],
      exclude: [],
      require: [],
    },
  );
  console.log(`create policy     : ${brief(policy, 900)}`);
}

const final = await cf(`/accounts/${ACCOUNT}/access/apps/${appId}`);
console.log(`final app         : ${brief(final, 900)}`);

console.log("\nDONE-CREATE");
