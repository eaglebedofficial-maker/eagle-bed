import Anthropic from "@anthropic-ai/sdk";
import { connectionById } from "@/catalog/connections";
import { seal } from "@/lib/crypto";
import { updateWorkspace } from "@/lib/store";
import { handle, HttpError, requireWorkspace } from "@/lib/session";

type P = { params: Promise<{ id: string }> };

// Save a key / token (key and mcp kinds). OAuth kinds use /api/oauth/[id]/start.
export const POST = handle(async (req: Request, ctx: P) => {
  const { id } = await ctx.params;
  const def = connectionById(id);
  if (!def) throw new HttpError(404, "Unknown connection");
  const { ws } = await requireWorkspace();
  const body = (await req.json()) as { secret?: string; meta?: Record<string, string> };
  const secret = String(body.secret || "").trim();
  if (!secret) throw new HttpError(400, "Paste the key or token.");
  let note = "Saved.";
  if (id === "anthropic") {
    try {
      await new Anthropic({ apiKey: secret, maxRetries: 1 }).models.list({ limit: 1 });
      note = "Key works.";
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) throw new HttpError(400, "Anthropic rejected that key.");
      throw new HttpError(502, "Couldn't reach Anthropic to check the key. Try again.");
    }
  }
  const meta = Object.fromEntries(Object.entries(body.meta || {}).map(([k, v]) => [k, String(v).slice(0, 300)]));
  await updateWorkspace(ws.id, (w) => {
    w.connections[id] = { status: "connected", secret: seal(secret), meta, checkedAt: new Date().toISOString(), note };
  });
  return Response.json({ ok: true, note });
});

export const DELETE = handle(async (_req: Request, ctx: P) => {
  const { id } = await ctx.params;
  const { ws } = await requireWorkspace();
  await updateWorkspace(ws.id, (w) => void delete w.connections[id]);
  return Response.json({ ok: true });
});
