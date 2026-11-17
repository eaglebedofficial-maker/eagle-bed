/* API client: same-origin /api (Next rewrites to FastAPI), httpOnly cookie auth, one silent refresh on 401. */

export type ApiErrorBody = { code: string; message: string; provider?: string; kind?: string; fields?: { field: string; message: string }[]; retry_after?: number };

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;
  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.status = status;
    this.body = body;
  }
  get isProvider() { return this.body.kind === "provider"; }
  get notConfigured() { return this.body.code === "not_configured"; }
}

let refreshing: Promise<boolean> | null = null;
let orgId: string | null = null;
export const setOrgHeader = (id: number | null) => { orgId = id ? String(id) : null; };

async function doRefresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch("/api/auth/refresh", { method: "POST", credentials: "include", headers: orgId ? { "x-org-id": orgId } : {} })
      .then((r) => r.ok).catch(() => false).finally(() => { setTimeout(() => (refreshing = null), 0); });
  }
  return refreshing;
}

type Opts = { method?: string; body?: unknown; form?: FormData; raw?: boolean; signal?: AbortSignal; params?: Record<string, unknown> };

export async function api<T = any>(path: string, opts: Opts = {}, retried = false): Promise<T> {
  let url = path.startsWith("/api") ? path : `/api${path}`;
  if (opts.params) {
    const q = new URLSearchParams();
    Object.entries(opts.params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v)) v.forEach((x) => q.append(k, String(x)));
      else q.set(k, String(v));
    });
    const s = q.toString();
    if (s) url += (url.includes("?") ? "&" : "?") + s;
  }
  const headers: Record<string, string> = {};
  if (orgId) headers["x-org-id"] = orgId;
  if (opts.body !== undefined) headers["content-type"] = "application/json";
  const r = await fetch(url, {
    method: opts.method || (opts.body !== undefined || opts.form ? "POST" : "GET"),
    credentials: "include", headers, signal: opts.signal,
    body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
  });
  if (r.status === 401 && !retried && !url.startsWith("/api/auth/")) {
    if (await doRefresh()) return api<T>(path, opts, true);
    if (typeof window !== "undefined" && !location.pathname.startsWith("/login")) location.href = `/login?next=${encodeURIComponent(location.pathname)}`;
  }
  if (!r.ok) {
    let body: ApiErrorBody = { code: "error", message: `Request failed (${r.status})` };
    try { const j = await r.json(); body = j.error ?? body; } catch { /* non-JSON */ }
    throw new ApiError(r.status, body);
  }
  if (opts.raw) return r as unknown as T;
  if (r.status === 204) return undefined as T;
  const ct = r.headers.get("content-type") || "";
  return (ct.includes("json") ? r.json() : r.text()) as Promise<T>;
}

export const get = <T = any>(path: string, params?: Record<string, unknown>) => api<T>(path, { params });
export const post = <T = any>(path: string, body?: unknown) => api<T>(path, { method: "POST", body: body ?? {} });
export const put = <T = any>(path: string, body?: unknown) => api<T>(path, { method: "PUT", body: body ?? {} });
export const patch = <T = any>(path: string, body?: unknown) => api<T>(path, { method: "PATCH", body: body ?? {} });
export const del = <T = any>(path: string) => api<T>(path, { method: "DELETE" });

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.body.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong.";
}
