"use client";
import { api, useApp } from "@/components/state";
import { agentById } from "@/catalog/agents";

export default function Memory() {
  const { s, refresh } = useApp();
  if (!s) return <p className="muted">Loading…</p>;
  const forget = async (kind: "facts" | "lessons", t: string) => { await api("/api/memory", { kind, t }, "DELETE"); await refresh(); };
  return (
    <>
      <div className="head"><div><h1>Memory</h1><p className="muted">What every agent knows about your business, and what they learned from past jobs.</p></div></div>
      <div className="grid g2">
        <div className="card"><h2>Remembered facts</h2>
          {!s.memory.facts.length && <p className="muted">Tell the Manager facts in Chat and they appear here.</p>}
          {s.memory.facts.slice().reverse().map((f) => <div key={f.t} className="row sp" style={{ borderTop: "1px solid var(--line)", padding: "8px 0" }}><span>{f.text}</span><button className="btn ghost sm" onClick={() => forget("facts", f.t)}>Forget</button></div>)}
        </div>
        <div className="card"><h2>Lessons learned</h2>
          {!s.memory.lessons.length && <p className="muted">After every job the team saves one lesson.</p>}
          {s.memory.lessons.slice().reverse().map((l) => <div key={l.t} className="row sp" style={{ borderTop: "1px solid var(--line)", padding: "8px 0" }}><span><span className="pill">{agentById(l.agent)?.name || l.agent}</span> {l.text}</span><button className="btn ghost sm" onClick={() => forget("lessons", l.t)}>Forget</button></div>)}
        </div>
      </div>
    </>
  );
}
