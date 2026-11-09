"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { BusinessBrief, ChatMsg, Proposal, Run } from "@/lib/types";

export interface AppState {
  email: string;
  billing: {
    status: string; plan?: "monthly" | "yearly"; currentPeriodEnd?: string; enabled: boolean;
    access: { ok: boolean; why: string }; trialEndsAt: string;
    plans: Record<"monthly" | "yearly", { label: string; pence: number; interval: string }>;
  };
  brief: BusinessBrief | null;
  connections: Record<string, { status: string; meta: Record<string, string>; checkedAt?: string; note?: string }>;
  agentsOff: string[];
  autopilot: "running" | "paused" | "closed";
  autopilotActions: string[];
  lastAutopilot?: string;
  memory: { facts: { t: string; text: string }[]; lessons: { t: string; agent: string; text: string }[] };
  board: Proposal[];
  reports: { id: string; createdAt: string; agent: string; title: string; runId: string; preview: string }[];
  runs: (Pick<Run, "id" | "title" | "status" | "createdAt" | "finishedAt" | "trigger" | "actionId" | "usage"> & { last?: string })[];
  chat: ChatMsg[];
}

export async function api<T = unknown>(url: string, body?: unknown, method?: string): Promise<T> {
  const r = await fetch(url, {
    method: method || (body === undefined ? "GET" : "POST"),
    headers: body === undefined ? {} : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && typeof window !== "undefined") window.location.href = "/";
  if (!r.ok) throw new Error((j as { error?: string }).error || `Error ${r.status}`);
  return j as T;
}

interface Ctx {
  s: AppState | null;
  refresh: () => Promise<void>;
  toast: (m: string) => void;
  openRun: (id: string) => void;
  runId: string | null;
  closeRun: () => void;
}

const C = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(C);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<AppState | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    try {
      setS(await api<AppState>("/api/state"));
    } catch {
      /* redirected on 401 */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const busy = () => s?.runs.some((r) => r.status === "running");
    const id = setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, busy() ? 3000 : 8000);
    return () => clearInterval(id);
  }, [refresh, s?.runs]);

  const toast = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 3500);
  }, []);

  return (
    <C.Provider value={{ s, refresh, toast, openRun: setRunId, runId, closeRun: () => setRunId(null) }}>
      {children}
      {msg && <div className="toast" role="status">{msg}</div>}
    </C.Provider>
  );
}
