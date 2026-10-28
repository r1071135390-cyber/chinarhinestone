const API = "https://api.cloudflare.com/client/v4";
const ACCOUNT = process.env.PAGES_ACCOUNT_ID || "25051d5cc4fd3edd4dce0880c7d0b28e";
const PROJECT = process.env.PAGES_PROJECT || "sublimapparel";
const CF_TOKEN = process.env.CF_TOKEN;

const RESTORE = {
  COZE_SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  COZE_SUPABASE_URL: process.env.COZE_SUPABASE_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,
};

for (const [k, v] of Object.entries(RESTORE)) {
  if (!v) throw new Error("missing env value for " + k);
}

async function cf(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${CF_TOKEN}`,
      "Content-Type": "application/json",
    },
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

function inventory(label, vars) {
  console.log("== " + label + " ==");
  for (const k of Object.keys(vars || {}).sort()) {
    const v = vars[k] || {};
    const len = String(v.value == null ? "" : v.value).length;
    console.log(`   ${k}: type=${v.type || "?"} len=${len}`);
  }
  if (!vars || Object.keys(vars).length === 0) console.log("   (none)");
  console.log("");
}

// The GET response masks secret_text values as an empty string, so the whole
// env_vars map must be rebuilt from what we know for certain. Every key we
// do not own is written back with its own reported type: plain_text keys
// still carry their real value, secret_text keys are already empty in the
// live deployment (the earlier PATCH wiped them) so writing "" changes
// nothing.
function rebuild(existing) {
  const out = {};
  for (const [k, v] of Object.entries(existing || {})) {
    if (RESTORE[k]) {
      const type = k.startsWith("NEXT_PUBLIC_") ? "plain_text" : v.type === "plain_text" ? "plain_text" : "secret_text";
      out[k] = { type, value: RESTORE[k] };
      continue;
    }
    if (v.type === "plain_text") {
      out[k] = { type: "plain_text", value: v.value };
    } else {
      out[k] = { type: v.type || "secret_text", value: "" };
    }
  }
  for (const [k, val] of Object.entries(RESTORE)) {
    if (!out[k]) {
      out[k] = {
        type: k.startsWith("NEXT_PUBLIC_") ? "plain_text" : "secret_text",
        value: val,
      };
    }
  }
  return out;
}

const cur = await cf("GET", `/accounts/${ACCOUNT}/pages/projects/${PROJECT}`);
if (!cur.json.success) {
  console.error("GET project failed:", cur.status, JSON.stringify(cur.json.errors ?? cur.json.raw));
  process.exit(1);
}
const project = cur.json.result;
console.log(`project: ${project.name} (${project.subdomain ?? "?"})`);
console.log(`source : ${JSON.stringify(project.source ?? null)}`);
console.log(`prod_branch: ${project.production_branch ?? "?"}`);
console.log("");

const prodVars = project.deployment_configs?.production?.env_vars ?? {};
const prevVars = project.deployment_configs?.preview?.env_vars ?? {};
inventory("BEFORE production", prodVars);
inventory("BEFORE preview", prevVars);

const payload = {
  deployment_configs: {
    production: { env_vars: rebuild(prodVars) },
    preview: { env_vars: rebuild(prevVars) },
  },
};

console.log("== PATCH ==");
const patched = await cf("PATCH", `/accounts/${ACCOUNT}/pages/projects/${PROJECT}`, payload);
console.log(patched.json.success ? "   PATCH OK" : `   PATCH FAILED ${patched.status}: ${JSON.stringify(patched.json.errors ?? patched.json.raw)}`);
if (!patched.json.success) process.exit(1);

const after = await cf("GET", `/accounts/${ACCOUNT}/pages/projects/${PROJECT}`);
const p2 = after.json.result.deployment_configs?.production?.env_vars ?? {};
const v2 = after.json.result.deployment_configs?.preview?.env_vars ?? {};
inventory("AFTER production", p2);
inventory("AFTER preview", v2);

console.log("== trigger production deployment ==");
const dep = await cf("POST", `/accounts/${ACCOUNT}/pages/projects/${PROJECT}/deployments`, {
  branch: project.production_branch || "main",
});
if (dep.json.success) {
  console.log(`   deployment id  : ${dep.json.result.id}`);
  console.log(`   deployment url : ${dep.json.result.url}`);
  console.log(`   aliases        : ${JSON.stringify(dep.json.result.aliases ?? [])}`);
} else {
  console.log(`   DEPLOY TRIGGER FAILED ${dep.status}: ${JSON.stringify(dep.json.errors ?? dep.json.raw)}`);
}
