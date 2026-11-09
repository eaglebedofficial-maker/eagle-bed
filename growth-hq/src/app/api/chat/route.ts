import { startRun } from "@/lib/engine";
import { newId } from "@/lib/crypto";
import { updateWorkspace } from "@/lib/store";
import { handle, HttpError, requireWorkspace } from "@/lib/session";

export const POST = handle(async (req: Request) => {
  const { ws } = await requireWorkspace();
  const { text } = (await req.json()) as { text?: string };
  const t = String(text || "").trim().slice(0, 4000);
  if (!t) throw new HttpError(400, "Write a message.");
  await updateWorkspace(ws.id, (w) => void w.chat.push({ id: newId("msg"), role: "user", text: t, t: new Date().toISOString() }));
  try {
    const runId = await startRun(ws.id, { chat: t, trigger: "chat" });
    return Response.json({ runId });
  } catch (e) {
    throw new HttpError(400, e instanceof Error ? e.message : "Could not start");
  }
});

export const DELETE = handle(async () => {
  const { ws } = await requireWorkspace();
  await updateWorkspace(ws.id, (w) => void (w.chat = []));
  return Response.json({ ok: true });
});
