"use client";
import { api, useApp } from "@/components/state";
import { agentsFor, DEPARTMENTS, MANAGER } from "@/catalog/agents";
import { ACTIONS } from "@/catalog/actions";

export default function Team() {
  const { s, refresh } = useApp();
  if (!s) return <p className="muted">Loading…</p>;
  const team = agentsFor(s.brief?.category || "other");
  const save = async (body: object) => { await api("/api/settings", body); await refresh(); };
  const toggle = (id: string) => save({ agentsOff: s.agentsOff.includes(id) ? s.agentsOff.filter((x) => x !== id) : [...s.agentsOff, id] });
  const toggleAuto = (id: string) => save({ autopilotActions: s.autopilotActions.includes(id) ? s.autopilotActions.filter((x) => x !== id) : [...s.autopilotActions, id] });
  return (
    <>
      <div className="head"><div><h1>Your team</h1><p className="muted">{team.length} specialists picked for a {s.brief?.category?.replace("_", " ") || "business"} like yours. Switch any agent off.</p></div>
        <button className="btn ghost sm" onClick={() => save({ agentsOff: [] })}>All on</button></div>
      <div className="card agent" style={{ marginBottom: 14 }}>
        <div className="avatar" style={{ background: MANAGER.color }}>M</div>
        <div><h3>{MANAGER.name}</h3><p className="muted small">{MANAGER.role}</p></div>
      </div>
      {DEPARTMENTS.map((d) => {
        const ag = team.filter((a) => a.dept === d.name);
        if (!ag.length) return null;
        return (
          <section key={d.name}>
            <h2 className="section">{d.name} <span className="muted small" style={{ fontWeight: 400 }}>· {d.goal}</span></h2>
            <div className="grid g2">
              {ag.map((a) => (
                <div key={a.id} className="card agent" style={{ opacity: s.agentsOff.includes(a.id) ? 0.55 : 1 }}>
                  <div className="avatar" style={{ background: a.color }}>{a.name.slice(0, 2)}</div>
                  <div style={{ flex: 1 }}><h3>{a.name}</h3><p className="muted small">{a.role}</p></div>
                  <button className="switch" role="switch" aria-checked={!s.agentsOff.includes(a.id)} aria-label={`${a.name} on`} onClick={() => toggle(a.id)} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
      <h2 className="section">Autopilot jobs</h2>
      <p className="muted small">Ticked jobs run by themselves each morning (weekly ones on Mondays, monthly ones on the 1st).</p>
      <div className="grid g3">
        {ACTIONS.filter((a) => a.every).map((a) => (
          <label key={a.id} className="card row sp" style={{ cursor: "pointer" }}>
            <span><b>{a.title}</b><br /><span className="muted small">every {a.every}</span></span>
            <input type="checkbox" checked={s.autopilotActions.includes(a.id)} onChange={() => toggleAuto(a.id)} style={{ width: 22, height: 22 }} />
          </label>
        ))}
      </div>
    </>
  );
}
