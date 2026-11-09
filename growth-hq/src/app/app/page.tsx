"use client";
import Link from "next/link";
import { api, useApp } from "@/components/state";
import { ActionCard } from "@/components/action-card";
import { actionById } from "@/catalog/actions";
import { agentsFor, DEPARTMENTS } from "@/catalog/agents";

export default function Office() {
  const { s, openRun, refresh, toast } = useApp();
  if (!s) return <p className="muted">Loading…</p>;
  const has = (id: string) => s.connections[id]?.status === "connected";
  const steps: [boolean, string, string][] = [
    [has("anthropic"), "Connect your Claude API key", "/app/connect"],
    [!!s.brief, "Fill in your business brief", "/app/brief"],
    [has("shopify") || has("woocommerce"), "Connect your store or website", "/app/connect"],
    [has("search_console") || has("ga4"), "Connect Google Search Console / Analytics", "/app/connect"],
    [has("meta") || has("publer") || has("zapier"), "Connect social accounts", "/app/connect"],
  ];
  const done = steps.filter((x) => x[0]).length;
  const running = s.runs.filter((r) => r.status === "running");
  const pending = s.board.filter((b) => b.status === "pending").length;
  const team = agentsFor(s.brief?.category || "other");
  const onDuty = team.filter((a) => !s.agentsOff.includes(a.id)).length;
  const setAuto = async (autopilot: string) => { await api("/api/settings", { autopilot }); await refresh(); toast(`Autopilot ${autopilot}.`); };

  return (
    <>
      <div className="head">
        <div><h1>{s.brief?.name ? `${s.brief.name} HQ` : "Your Growth HQ"}</h1><p className="muted">Your AI team: {onDuty} agents on duty, led by the Manager.</p></div>
        <Link className="btn" href="/app/actions">All actions</Link>
      </div>

      {done < steps.length && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="row sp"><h2>Get set up</h2><span className="pill">{done}/{steps.length}</span></div>
          <div className="stack" style={{ gap: 6, marginTop: 6 }}>
            {steps.map(([ok, label, href]) => (
              <Link key={label} href={href} className="row" style={{ color: ok ? "var(--muted)" : "var(--ink)", flexWrap: "nowrap" }}>
                <span className={`pill ${ok ? "ok" : "warn"}`}>{ok ? "Done" : "To do"}</span> {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid g4">
        <div className="card kpi"><b>{pending}</b><span>changes waiting for you</span></div>
        <div className="card kpi"><b>{s.reports.length}</b><span>reports written</span></div>
        <div className="card kpi"><b>{running.length}</b><span>jobs running now</span></div>
        <div className="card kpi"><b>{s.memory.lessons.length}</b><span>lessons learned</span></div>
      </div>

      <div className="grid g2" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="row sp"><h2>24/7 Autopilot</h2><span className={`pill ${s.autopilot === "running" ? "ok" : s.autopilot === "paused" ? "warn" : "bad"}`}><span className="dot" />{s.autopilot}</span></div>
          <p className="muted small">Runs every morning in the cloud, phone on or off: {s.autopilotActions.map((a) => actionById(a)?.title).filter(Boolean).join(", ") || "nothing selected"}. Pause = emergencies only. Close = nothing.</p>
          <div className="row">
            {(["running", "paused", "closed"] as const).map((m) => <button key={m} className={`btn sm ${s.autopilot === m ? "" : "ghost"}`} onClick={() => setAuto(m)}>{m === "running" ? "Resume" : m === "paused" ? "Pause" : "Close"}</button>)}
            <Link className="btn ghost sm" href="/app/team">Choose jobs</Link>
          </div>
          {s.lastAutopilot && <p className="muted small" style={{ marginTop: 8 }}>Last run {new Date(s.lastAutopilot).toLocaleString()}</p>}
        </div>
        <div className="card">
          <h2>Live activity</h2>
          {!s.runs.length && <p className="muted">Nothing yet. Press a button below or ask the Manager.</p>}
          <div className="stack" style={{ gap: 4 }}>
            {s.runs.slice(0, 6).map((r) => (
              <button key={r.id} className="row sp" style={{ background: "none", border: 0, padding: "6px 0", cursor: "pointer", textAlign: "left", borderTop: "1px solid var(--line)" }} onClick={() => openRun(r.id)}>
                <span>{r.status === "running" ? <span className="spin" style={{ display: "inline-block", verticalAlign: -2 }} /> : r.status === "done" ? "✓" : "!"} {r.title}</span>
                <span className="muted small">{new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <h2 className="section">Start here</h2>
      <div className="grid g3">
        {["master-audit", "daily-autopilot", "why-not-buying", "ceo-review", "seo-full", "social-plan"].map((id) => <ActionCard key={id} a={actionById(id)!} compact />)}
      </div>

      <h2 className="section">The office</h2>
      <div className="grid g2">
        {DEPARTMENTS.map((d) => {
          const ag = team.filter((a) => a.dept === d.name);
          if (!ag.length) return null;
          return (
            <div key={d.name} className="card">
              <h3>{d.name}</h3><p className="muted small">{d.goal}</p>
              <div className="chips">
                {ag.map((a) => <span key={a.id} className="pill" style={{ opacity: s.agentsOff.includes(a.id) ? 0.45 : 1 }}><span className="dot" style={{ color: a.color }} />{a.name}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
