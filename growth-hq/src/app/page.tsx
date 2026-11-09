"use client";
import { useState } from "react";
import { ACTIONS } from "@/catalog/actions";
import { AGENTS, DEPARTMENTS } from "@/catalog/agents";
import { CONNECTIONS } from "@/catalog/connections";

export default function Landing() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) location.href = mode === "signup" ? "/app/brief" : "/app"; else { setErr(j.error || "Something went wrong."); setBusy(false); }
  };
  return (
    <>
      <section className="hero">
        <div>
          <div className="row" style={{ marginBottom: 14 }}><div className="logo">G</div><b>Growth HQ</b></div>
          <h1>An AI growth team for your business</h1>
          <p className="lead">{AGENTS.length + 1} AI agents in {DEPARTMENTS.length} departments do your SEO, social media, ads, sales pages and customer care. Connect your accounts, press a button, approve the changes. It runs on your own Claude account, so you control the cost.</p>
          <div className="chips" style={{ marginTop: 14 }}>
            <span className="pill ok">{ACTIONS.length} one-tap jobs</span><span className="pill ok">{CONNECTIONS.length} connections</span><span className="pill ok">Nothing goes live without you</span><span className="pill ok">Daily autopilot</span>
          </div>
        </div>
        <form className="card stack" onSubmit={go} style={{ gap: 10 }}>
          <div className="chips" role="tablist">
            <button type="button" className="chip" aria-pressed={mode === "signup"} onClick={() => setMode("signup")}>Create account</button>
            <button type="button" className="chip" aria-pressed={mode === "login"} onClick={() => setMode("login")}>Log in</button>
          </div>
          <label className="f">Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          <label className="f">Password<input type="password" required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>
          {err && <p className="small" style={{ color: "var(--bad)", margin: 0 }}>{err}</p>}
          <button className="btn" disabled={busy}>{busy ? <span className="spin" /> : mode === "signup" ? "Start free" : "Log in"}</button>
          <p className="muted small" style={{ margin: 0 }}>You&apos;ll need a Claude API key from console.anthropic.com. Agents use it to run your jobs.</p>
        </form>
      </section>
      <section className="feat">
        <div className="grid g3">
          {DEPARTMENTS.map((d) => (
            <div key={d.name} className="card"><h3>{d.name}</h3><p className="muted small">{d.goal}</p>
              <p className="small">{AGENTS.filter((a) => a.dept === d.name).map((a) => a.name).join(" · ")}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}
