import { listUsers } from "@/lib/store";
import { checkPassword } from "@/lib/crypto";
import { handle, HttpError, setSession } from "@/lib/session";

export const POST = handle(async (req: Request) => {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  const u = (await listUsers()).find((x) => x.email === String(email || "").trim().toLowerCase());
  if (!u || !checkPassword(String(password || ""), u.pass)) throw new HttpError(401, "Wrong email or password.");
  await setSession(u.id);
  return Response.json({ ok: true });
});
