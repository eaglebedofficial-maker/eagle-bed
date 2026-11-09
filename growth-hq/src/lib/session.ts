import { cookies } from "next/headers";
import { sign, unsign } from "./crypto";
import { listUsers, getWorkspace } from "./store";
import type { User, Workspace } from "./types";

const COOKIE = "ghq_session";

export async function setSession(userId: string) {
  (await cookies()).set(COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const id = unsign((await cookies()).get(COOKIE)?.value);
  if (!id) return null;
  return (await listUsers()).find((u) => u.id === id) || null;
}

export class HttpError extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

export async function requireWorkspace(): Promise<{ user: User; ws: Workspace }> {
  const user = await currentUser();
  if (!user) throw new HttpError(401, "Please log in.");
  const ws = await getWorkspace(user.workspaceId);
  if (!ws) throw new HttpError(404, "Workspace missing.");
  return { user, ws };
}

/** Wrap a route handler: JSON errors with the right status code. */
export function handle<A extends unknown[]>(fn: (...a: A) => Promise<Response>) {
  return async (...a: A): Promise<Response> => {
    try {
      return await fn(...a);
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      if (status === 500) console.error(e);
      return Response.json({ error: msg }, { status });
    }
  };
}
