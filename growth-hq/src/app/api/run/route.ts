import { startRun } from "@/lib/engine";
import { handle, HttpError, requireWorkspace } from "@/lib/session";

export const POST = handle(async (req: Request) => {
  const { ws } = await requireWorkspace();
  const b = (await req.json()) as { actionId?: string; focus?: string; weeks?: string; order?: string };
  if (!b.actionId && !b.order?.trim()) throw new HttpError(400, "Pick an action or write an order.");
  try {
    const id = await startRun(ws.id, { actionId: b.actionId, focus: b.focus?.slice(0, 500), weeks: b.weeks, order: b.order?.slice(0, 4000), trigger: "button" });
    return Response.json({ runId: id });
  } catch (e) {
    throw new HttpError(400, e instanceof Error ? e.message : "Could not start");
  }
});
