"use client";
import { useState } from "react";
import { api, useApp } from "@/components/state";
import { Markdown } from "@/components/markdown";
import { agentById } from "@/catalog/agents";

export default function Reports() {
  const { s } = useApp();
  const [open, setOpen] = useState<{ title: string; body: string; createdAt: string } | null>(null);
  if (!s) return <p className="muted">Loading…</p>;
  return (
    <>
      <div className="head"><div><h1>Reports</h1><p className="muted">Every finished job, newest first.</p></div></div>
      {!s.reports.length && <p className="empty">No reports yet. Run the Master Audit to get the first big one.</p>}
      <div className="grid g2">
        {s.reports.map((r) => (
          <button key={r.id} className="card" style={{ textAlign: "left", cursor: "pointer" }} onClick={async () => setOpen(await api(`/api/reports/${r.id}`))}>
            <div className="row sp"><span className="pill">{agentById(r.agent)?.name || r.agent}</span><span className="muted small">{new Date(r.createdAt).toLocaleString()}</span></div>
            <h3 style={{ marginTop: 8 }}>{r.title}</h3>
            <p className="muted small">{r.preview}…</p>
          </button>
        ))}
      </div>
      {open && (
        <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setOpen(null)}>
          <div className="pane">
            <div className="row sp"><h2>{open.title}</h2><div className="row"><button className="btn ghost sm" onClick={() => window.print()}>Print / PDF</button><button className="btn ghost sm" onClick={() => setOpen(null)}>Close</button></div></div>
            <p className="muted small">{new Date(open.createdAt).toLocaleString()}</p>
            <Markdown text={open.body} />
          </div>
        </div>
      )}
    </>
  );
}
