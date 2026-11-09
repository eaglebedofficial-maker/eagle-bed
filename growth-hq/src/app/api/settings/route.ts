import { ACTIONS } from "@/catalog/actions";
import { AGENTS } from "@/catalog/agents";
import { updateWorkspace } from "@/lib/store";
import { handle, requireWorkspace } from "@/lib/session";

export const POST = handle(async (req: Request) => {
  const { ws } = await requireWorkspace();
  const b = (await req.json()) as { agentsOff?: string[]; autopilot?: "running" | "paused" | "closed"; autopilotActions?: string[] };
  await updateWorkspace(ws.id, (w) => {
    if (b.agentsOff) w.agentsOff = b.agentsOff.filter((id) => AGENTS.some((a) => a.id === id));
    if (b.autopilot && ["running", "paused", "closed"].includes(b.autopilot)) w.autopilot = b.autopilot;
    if (b.autopilotActions) w.autopilotActions = b.autopilotActions.filter((id) => ACTIONS.some((a) => a.id === id));
  });
  return Response.json({ ok: true });
});
