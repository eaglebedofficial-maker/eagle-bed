"use client";
import { useState } from "react";
import { api, useApp } from "./state";
import { agentById } from "@/catalog/agents";
import { CONNECTIONS } from "@/catalog/connections";
import type { Action } from "@/catalog/actions";

export function useRun() {
  const { toast, openRun, refresh } = useApp();
  return async (body: { actionId?: string; focus?: string; weeks?: string; order?: string }) => {
    try {
      const { runId } = await api<{ runId: string }>("/api/run", body);
      openRun(runId);
      void refresh();
    } catch (e) {
      toast((e as Error).message);
    }
  };
}

export function ActionCard({ a, compact }: { a: Action; compact?: boolean }) {
  const { s } = useApp();
  const run = useRun();
  const [focus, setFocus] = useState("");
  const [busy, setBusy] = useState(false);
  const connected = new Set(CONNECTIONS.filter((c) => s?.connections[c.id]?.status === "connected").flatMap((c) => c.provides));
  const missing = a.needs.filter((n) => !connected.has(n));
  const isWeeks = a.id === "social-plan";
  return (
    <div className="card action">
      <div className="row sp" style={{ alignItems: "flex-start" }}>
        <h3>{a.title}</h3>
        {a.proposes && <span className="pill info" title="Changes wait for your approval on the Board">Board</span>}
      </div>
      {!compact && <p className="muted small">{a.agents.map((id) => agentById(id)?.name).filter(Boolean).join(" · ")}</p>}
      {a.focus && (isWeeks ? (
        <select aria-label="Weeks" value={focus || "2"} onChange={(e) => setFocus(e.target.value)}>
          {["1", "2", "3", "4"].map((w) => <option key={w} value={w}>{w} week{w === "1" ? "" : "s"}</option>)}
        </select>
      ) : (
        <input type="text" placeholder={a.focus} value={focus} onChange={(e) => setFocus(e.target.value)} aria-label={a.focus} />
      ))}
      <div className="row sp">
        <span className="meta">
          {missing.length ? <span className="pill warn" title={"Connect for better results: " + missing.join(", ")}>Partly connected</span> : <span className="pill ok">Ready</span>}
          {a.every && <span className="pill">every {a.every}</span>}
        </span>
        <button className="btn sm" disabled={busy} onClick={async () => { setBusy(true); await run(isWeeks ? { actionId: a.id, weeks: focus || "2" } : { actionId: a.id, focus: focus || undefined }); setBusy(false); }}>
          {busy ? <span className="spin" /> : "Run"}
        </button>
      </div>
      {!compact && <p className="muted small" style={{ margin: 0 }}>From Eagle Bed HQ: {a.origin}</p>}
    </div>
  );
}
