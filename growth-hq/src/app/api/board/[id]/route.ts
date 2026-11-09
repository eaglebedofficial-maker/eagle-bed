import { applyProposal } from "@/lib/engine";
import { updateWorkspace } from "@/lib/store";
import { handle, HttpError, requireWorkspace } from "@/lib/session";

type Op = "approve" | "reject" | "mark_applied" | "undo";

export const POST = handle(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const { ws } = await requireWorkspace();
  const { op } = (await req.json()) as { op?: Op };
  const p = ws.board.find((x) => x.id === id);
  if (!p) throw new HttpError(404, "Board item not found");
  if (op === "reject" || op === "mark_applied") {
    await updateWorkspace(ws.id, (w) => {
      const q = w.board.find((x) => x.id === id)!;
      q.status = op === "reject" ? "rejected" : "applied";
    });
    return Response.json({ status: op === "reject" ? "rejected" : "applied" });
  }
  if (op === "approve") {
    if (p.status !== "pending" && p.status !== "failed") throw new HttpError(409, "Already handled.");
    await updateWorkspace(ws.id, (w) => void (w.board.find((x) => x.id === id)!.status = "approved"));
    return Response.json({ status: await applyProposal(ws.id, id, "apply") });
  }
  if (op === "undo") {
    if (p.status !== "applied") throw new HttpError(409, "Only applied changes can be undone.");
    return Response.json({ status: await applyProposal(ws.id, id, "undo") });
  }
  throw new HttpError(400, "Unknown operation");
});
