import { updateWorkspace } from "@/lib/store";
import { handle, requireWorkspace } from "@/lib/session";

// Forget one remembered fact or lesson (by timestamp).
export const DELETE = handle(async (req: Request) => {
  const { ws } = await requireWorkspace();
  const { kind, t } = (await req.json()) as { kind: "facts" | "lessons"; t: string };
  await updateWorkspace(ws.id, (w) => {
    if (kind === "facts") w.memory.facts = w.memory.facts.filter((x) => x.t !== t);
    if (kind === "lessons") w.memory.lessons = w.memory.lessons.filter((x) => x.t !== t);
  });
  return Response.json({ ok: true });
});
