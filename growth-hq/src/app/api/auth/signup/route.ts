import { addUser, emptyWorkspace, saveWorkspace } from "@/lib/store";
import { hashPassword, newId } from "@/lib/crypto";
import { handle, HttpError, setSession } from "@/lib/session";
import { isOwnerEmail } from "@/lib/billing";

export const POST = handle(async (req: Request) => {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  const e = String(email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new HttpError(400, "Enter a valid email.");
  if (String(password || "").length < 10) throw new HttpError(400, "Use a password of at least 10 characters.");
  const ws = emptyWorkspace();
  if (isOwnerEmail(e)) ws.billing = { status: "active", plan: "yearly" }; // the company's own accounts
  await saveWorkspace(ws);
  const user = { id: newId("usr"), email: e, pass: hashPassword(String(password)), workspaceId: ws.id, createdAt: new Date().toISOString() };
  await addUser(user);
  await setSession(user.id);
  return Response.json({ ok: true });
});
