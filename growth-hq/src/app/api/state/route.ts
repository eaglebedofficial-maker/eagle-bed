import { handle, requireWorkspace } from "@/lib/session";
import { access, billingEnabled, PLANS, trialEndsAt } from "@/lib/billing";

// Everything the UI needs, without secrets.
export const GET = handle(async () => {
  const { user, ws } = await requireWorkspace();
  const connections = Object.fromEntries(
    Object.entries(ws.connections).map(([k, v]) => [k, { status: v.status, meta: v.meta || {}, checkedAt: v.checkedAt, note: v.note }]),
  );
  return Response.json({
    email: user.email,
    billing: { ...(ws.billing || { status: "none" }), enabled: billingEnabled(), access: access(ws), trialEndsAt: trialEndsAt(ws).toISOString(), plans: PLANS },
    brief: ws.brief,
    connections,
    agentsOff: ws.agentsOff,
    autopilot: ws.autopilot,
    autopilotActions: ws.autopilotActions,
    lastAutopilot: ws.lastAutopilot,
    memory: ws.memory,
    board: ws.board.slice().reverse(),
    reports: ws.reports.slice().reverse().map((r) => ({ id: r.id, createdAt: r.createdAt, agent: r.agent, title: r.title, runId: r.runId, preview: r.body.slice(0, 220) })),
    runs: ws.runs.slice().reverse().slice(0, 60).map((r) => ({ id: r.id, title: r.title, status: r.status, createdAt: r.createdAt, finishedAt: r.finishedAt, trigger: r.trigger, actionId: r.actionId, usage: r.usage, last: r.log.at(-1)?.text?.slice(-160) })),
    chat: ws.chat.slice(-60),
  });
});
