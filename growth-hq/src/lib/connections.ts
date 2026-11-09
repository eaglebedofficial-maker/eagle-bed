import { CONNECTIONS, connectionById } from "@/catalog/connections";
import type { Capability } from "@/catalog/agents";
import type { Workspace } from "./types";
import { open, seal } from "./crypto";
import { updateWorkspace } from "./store";
import type Anthropic from "@anthropic-ai/sdk";

export function isConnected(ws: Workspace, id: string) {
  return ws.connections[id]?.status === "connected" && !!ws.connections[id]?.secret;
}

export function capabilities(ws: Workspace): Set<Capability> {
  const s = new Set<Capability>();
  for (const c of CONNECTIONS) if (isConnected(ws, c.id)) c.provides.forEach((p) => s.add(p));
  return s;
}

export function secretOf(ws: Workspace, id: string): string | null {
  const c = ws.connections[id];
  return c?.secret ? open(c.secret) : null;
}

export function mcpUrl(ws: Workspace, id: string): string | undefined {
  const env = process.env[`CONN_${id.toUpperCase()}_MCP_URL`];
  return ws.connections[id]?.meta?.mcpUrl || env || connectionById(id)?.mcpUrl;
}

/** Remote MCP servers Claude should reach for this workspace. */
export function mcpServers(ws: Workspace): Anthropic.Beta.Messages.BetaRequestMCPServerURLDefinition[] {
  return CONNECTIONS.filter((c) => c.kind === "mcp" && isConnected(ws, c.id) && mcpUrl(ws, c.id)).map((c) => ({
    type: "url" as const,
    name: c.id,
    url: mcpUrl(ws, c.id)!,
    authorization_token: secretOf(ws, c.id),
  }));
}

interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

/** Access token for an OAuth connection, refreshed when it is about to expire. */
export async function oauthToken(ws: Workspace, id: string): Promise<string> {
  const raw = secretOf(ws, id);
  if (!raw) throw new Error(`${id} is not connected.`);
  let tok: OAuthToken;
  try { tok = JSON.parse(raw) as OAuthToken; } catch { return raw; } // pasted long-lived token
  if (!tok.expires_at || tok.expires_at - 60_000 > Date.now() || !tok.refresh_token) return tok.access_token;
  const def = connectionById(id)!;
  const p = def.oauth!.envPrefix;
  const r = await fetch(def.oauth!.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tok.refresh_token,
      client_id: process.env[`${p}_CLIENT_ID`] || "",
      client_secret: process.env[`${p}_CLIENT_SECRET`] || "",
    }),
  });
  if (!r.ok) throw new Error(`Could not refresh the ${def.name} login (${r.status}). Reconnect it in Connections.`);
  const j = (await r.json()) as { access_token: string; expires_in?: number; refresh_token?: string };
  const next: OAuthToken = { access_token: j.access_token, refresh_token: j.refresh_token || tok.refresh_token, expires_at: Date.now() + (j.expires_in || 3600) * 1000 };
  await updateWorkspace(ws.id, (w) => {
    w.connections[id] = { ...w.connections[id], secret: seal(JSON.stringify(next)), status: "connected" };
  });
  return next.access_token;
}
