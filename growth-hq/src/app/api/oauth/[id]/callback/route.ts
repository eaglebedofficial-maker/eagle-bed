import { cookies } from "next/headers";
import { connectionById } from "@/catalog/connections";
import { seal } from "@/lib/crypto";
import { updateWorkspace } from "@/lib/store";
import { requireWorkspace } from "@/lib/session";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const base = process.env.APP_URL || url.origin;
  const back = (msg: string) => Response.redirect(`${base}/app/connect?msg=${encodeURIComponent(msg)}`, 302);
  try {
    const { ws } = await requireWorkspace();
    const def = connectionById(id);
    const jar = await cookies();
    const [cid, state] = (jar.get("ghq_oauth")?.value || "").split(":");
    jar.delete("ghq_oauth");
    if (!def?.oauth || cid !== id || state !== url.searchParams.get("state")) return back("Login expired, please try again.");
    const code = url.searchParams.get("code");
    if (!code) return back(`${def.name}: ${url.searchParams.get("error_description") || "login cancelled"}`);
    const p = def.oauth.envPrefix;
    const r = await fetch(def.oauth.tokenUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body: new URLSearchParams({
        grant_type: "authorization_code", code, redirect_uri: `${base}/api/oauth/${id}/callback`,
        client_id: process.env[`${p}_CLIENT_ID`] || "", client_secret: process.env[`${p}_CLIENT_SECRET`] || "",
        ...(p === "TIKTOK" ? { client_key: process.env.TIKTOK_CLIENT_ID || "" } : {}),
      }),
    });
    const j = (await r.json()) as { access_token?: string; refresh_token?: string; expires_in?: number; error?: string };
    if (!r.ok || !j.access_token) return back(`${def.name}: could not finish login (${j.error || r.status}).`);
    const tok = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_in ? Date.now() + j.expires_in * 1000 : undefined };
    await updateWorkspace(ws.id, (w) => {
      w.connections[id] = { status: "connected", secret: seal(JSON.stringify(tok)), meta: w.connections[id]?.meta || {}, checkedAt: new Date().toISOString(), note: "Connected." };
    });
    return back(`${def.name} connected.`);
  } catch {
    return back("Please log in and try again.");
  }
}
