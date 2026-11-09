import { updateWorkspace } from "@/lib/store";
import { handle, HttpError, requireWorkspace } from "@/lib/session";
import { CATEGORIES } from "@/catalog/categories";
import type { BusinessBrief } from "@/lib/types";

export const POST = handle(async (req: Request) => {
  const { ws } = await requireWorkspace();
  const b = (await req.json()) as BusinessBrief;
  if (!b.name?.trim() || !b.products?.trim()) throw new HttpError(400, "Business name and what you sell are required.");
  if (!CATEGORIES.some((c) => c.id === b.category)) throw new HttpError(400, "Pick a business category.");
  const clean: BusinessBrief = {
    ...b,
    domain: String(b.domain || "").replace(/^https?:\/\//, "").replace(/\/$/, ""),
    product: b.product?.trim() || b.products.trim().replace(/s$/, ""),
    adCapPerDay: Math.max(0, Number(b.adCapPerDay) || 0),
    postSlots: (Array.isArray(b.postSlots) ? b.postSlots : String(b.postSlots || "").split(",")).map((s) => s.trim()).filter(Boolean),
  };
  await updateWorkspace(ws.id, (w) => void (w.brief = clean));
  return Response.json({ ok: true });
});
