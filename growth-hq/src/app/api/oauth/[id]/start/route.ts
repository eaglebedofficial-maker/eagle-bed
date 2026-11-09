import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { connectionById } from "@/catalog/connections";
import { handle, HttpError, requireWorkspace } from "@/lib/session";

export const GET = handle(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  await requireWorkspace();
  const def = connectionById(id);
  if (!def?.oauth) throw new HttpError(404, "Not an OAuth connection");
  const clientId = process.env[`${def.oauth.envPrefix}_CLIENT_ID`];
  if (!clientId) throw new HttpError(501, `${def.name} login isn't set up on this server yet (${def.oauth.envPrefix}_CLIENT_ID missing).`);
  const state = randomBytes(16).toString("hex");
  (await cookies()).set("ghq_oauth", `${id}:${state}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  const base = process.env.APP_URL || new URL(req.url).origin;
  const u = new URL(def.oauth.authorizeUrl);
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", `${base}/api/oauth/${id}/callback`);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", def.oauth.scopes.join(def.oauth.envPrefix === "TIKTOK" ? "," : " "));
  u.searchParams.set("state", state);
  if (def.oauth.envPrefix === "GOOGLE") { u.searchParams.set("access_type", "offline"); u.searchParams.set("prompt", "consent"); }
  if (def.oauth.envPrefix === "TIKTOK") u.searchParams.set("client_key", clientId);
  return Response.redirect(u.toString(), 302);
});
