"use client";
import { useState } from "react";
import { api, useApp } from "@/components/state";
import { agentById } from "@/catalog/agents";
import type { Proposal } from "@/lib/types";

const TONE: Record<Proposal["status"], string> = { pending: "warn", approved: "info", applied: "ok", rejected: "", undone: "", failed: "bad" };

export default function Board() {
  const { s, refresh, toast } = useApp();
  const [filter, setFilter] = useState<string>("pending");
  const [busy, setBusy] = useState<string | null>(null);
  if (!s) return <p className="muted">Loading…</p>;
  const list = s.board.filter((b) => filter === "all" || b.status === filter);
  const act = async (id: string, op: string) => {
    setBusy(id + op);
    try {
      const r = await api<{ status: string }>(`/api/board/${id}`, { op });
      toast(r.status === "applied" ? "Applied. The old version is kept for undo." : r.status === "failed" ? "Couldn't apply automatically — see the note." : `Marked ${r.status}.`);
      await refresh();
    } catch (e) { toast((e as Error).message); }
    setBusy(null);
  };
  return (
    <>
      <div className="head"><div><h1>Approval Board</h1><p className="muted">Nothing goes live without you. Approve and the team applies it through your connected account, with one-tap undo.</p></div></div>
      <div className="chips" style={{ marginBottom: 12 }} role="group" aria-label="Filter">
        {["pending", "applied", "failed", "rejected", "all"].map((f) => <button key={f} className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f} ({f === "all" ? s.board.length : s.board.filter((b) => b.status === f).length})</button>)}
      </div>
      {!list.length && <p className="empty">Nothing here. Run an action and the team's proposed changes appear here.</p>}
      <div className="stack">
        {list.map((p) => (
          <div key={p.id} className="card">
            <div className="row sp" style={{ alignItems: "flex-start" }}>
              <div><span className={`pill ${p.priority === "P0" ? "bad" : p.priority === "P1" ? "warn" : ""}`}>{p.priority}</span> <span className={`pill ${TONE[p.status]}`}>{p.status}</span>
                <h3 style={{ marginTop: 6 }}>{p.title}</h3>
                <p className="muted small">{agentById(p.agent)?.name || p.agent} · {p.system} · {p.target}</p></div>
              <span className="muted small">{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="diff"><div><div className="muted small">Now</div><pre>{p.before}</pre></div><div><div className="muted small">Proposed</div><pre>{p.after}</pre></div></div>
            <p className="small" style={{ marginTop: 8 }}><b>Why:</b> {p.why}</p>
            <p className="small"><b>KPI:</b> {p.kpi}</p>
            {p.result && <p className="small muted"><b>Result:</b> {p.result}</p>}
            <div className="row">
              {(p.status === "pending" || p.status === "failed") && <>
                <button className="btn sm" disabled={!!busy} onClick={() => act(p.id, "approve")}>{busy === p.id + "approve" ? <span className="spin" /> : "Approve & apply"}</button>
                <button className="btn ghost sm" disabled={!!busy} onClick={() => act(p.id, "mark_applied")}>I applied it myself</button>
                <button className="btn ghost sm" disabled={!!busy} onClick={() => act(p.id, "reject")}>Reject</button>
              </>}
              {p.status === "applied" && <button className="btn ghost sm" disabled={!!busy} onClick={() => act(p.id, "undo")}>{busy === p.id + "undo" ? <span className="spin" /> : "Undo"}</button>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
