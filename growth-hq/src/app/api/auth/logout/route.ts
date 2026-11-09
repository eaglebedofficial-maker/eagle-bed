import { clearSession, handle } from "@/lib/session";
export const POST = handle(async () => {
  await clearSession();
  return Response.json({ ok: true });
});
