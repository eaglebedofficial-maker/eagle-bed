import { handle, HttpError, requireWorkspace } from "@/lib/session";
export const GET = handle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const { ws } = await requireWorkspace();
  const r = ws.runs.find((x) => x.id === id);
  if (!r) throw new HttpError(404, "Run not found");
  return Response.json(r);
});
