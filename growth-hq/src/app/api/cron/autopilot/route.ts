// Call once a day from any scheduler (Vercel Cron, Cloud Scheduler, crontab):
//   curl -H "Authorization: Bearer $CRON_SECRET" https://your-app/api/cron/autopilot
import { ACTIONS } from "@/catalog/actions";
import { startRun } from "@/lib/engine";
import { getWorkspace, listWorkspaceIds, updateWorkspace } from "@/lib/store";
import { isConnected } from "@/lib/connections";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "unauthorised" }, { status: 401 });
  const day = new Date().getUTCDay(); // 1 = Monday
  const date = new Date().getUTCDate();
  const started: string[] = [];
  for (const id of await listWorkspaceIds()) {
    const ws = await getWorkspace(id);
    if (!ws || ws.autopilot === "closed" || !isConnected(ws, "anthropic")) continue;
    const today = new Date().toISOString().slice(0, 10);
    if (ws.lastAutopilot?.startsWith(today)) continue;
    const due = ws.autopilot === "paused"
      ? ["daily-autopilot"] // paused: monitoring only, no changes proposed
      : ws.autopilotActions.filter((a) => {
          const every = ACTIONS.find((x) => x.id === a)?.every || "day";
          return every === "day" || (every === "week" && day === 1) || (every === "month" && date === 1);
        });
    for (const actionId of due) {
      try {
        await startRun(id, { actionId, trigger: "autopilot", focus: ws.autopilot === "paused" ? "Emergencies only: report problems, propose nothing." : undefined });
        started.push(`${id}:${actionId}`);
      } catch { /* key missing or invalid: skipped, shown in the app */ }
    }
    await updateWorkspace(id, (w) => void (w.lastAutopilot = new Date().toISOString()));
  }
  return Response.json({ started });
}
