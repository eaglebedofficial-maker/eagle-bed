#!/usr/bin/env node
// Minimal admin client for a LOCAL OmniRoute (127.0.0.1). Never prints secrets.
// usage:
//   node omni-api.mjs cli  METHOD /api/path [json]   (auth: OmniRoute local CLI token)
//   node omni-api.mjs dash METHOD /api/path [json]   (auth: dashboard login, ~/.omniroute/admin.pass)
//   node omni-api.mjs create-client-key <name>       (writes key to ~/.omniroute/claude-code.key, chmod 600)
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.OMNIROUTE_LOCAL_URL || "http://127.0.0.1:20128";
const HOME_DIR = process.env.OMNIROUTE_HOME || join(process.env.HOME, ".omniroute");
const globalRoot = execSync("npm root -g").toString().trim();
const { getCliToken, CLI_TOKEN_HEADER } = await import(
  join(globalRoot, "omniroute/bin/cli/utils/cliToken.mjs")
);

async function cliHeaders() {
  return { "content-type": "application/json", [CLI_TOKEN_HEADER]: await getCliToken() };
}

async function dashHeaders() {
  const password = readFileSync(join(HOME_DIR, "admin.pass"), "utf8").trim();
  const r = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!r.ok) throw new Error(`dashboard login failed (HTTP ${r.status})`);
  const cookie = (r.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
  return { "content-type": "application/json", cookie, origin: BASE };
}

const [mode, ...rest] = process.argv.slice(2);
if (mode === "create-client-key") {
  const r = await fetch(BASE + "/api/keys", {
    method: "POST",
    headers: await cliHeaders(),
    body: JSON.stringify({ name: rest[0] || "claude-code-local" }),
  });
  const j = await r.json();
  const key = j.key || j.apiKey?.key || j.data?.key;
  if (!r.ok || !key) {
    console.error(`key creation failed (HTTP ${r.status})`);
    process.exit(1);
  }
  writeFileSync(join(HOME_DIR, "claude-code.key"), key, { mode: 0o600 });
  console.log("client key created and stored in ~/.omniroute/claude-code.key");
} else if (mode === "cli" || mode === "dash") {
  const [method, path, body] = rest;
  const headers = mode === "cli" ? await cliHeaders() : await dashHeaders();
  const r = await fetch(BASE + path, { method, headers, body: body || undefined });
  console.log(r.status, await r.text());
  if (!r.ok) process.exit(1);
} else {
  console.error("usage: omni-api.mjs cli|dash METHOD PATH [JSON] | create-client-key [name]");
  process.exit(2);
}
