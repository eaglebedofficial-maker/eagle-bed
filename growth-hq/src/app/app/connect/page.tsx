"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, useApp } from "@/components/state";
import { CONNECTIONS, type ConnectionDef } from "@/catalog/connections";

const GROUPS = ["AI brain", "Store & website", "Search & SEO", "Ads", "Social", "Email & customers", "Creative", "Automation & data"] as const;

function Conn({ c }: { c: ConnectionDef }) {
  const { s, refresh, toast } = useApp();
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState("");
  const [extra, setExtra] = useState("");
  const [busy, setBusy] = useState(false);
  const st = s?.connections[c.id];
  const on = st?.status === "connected";
  const save = async () => {
    setBusy(true);
    try {
      const meta: Record<string, string> = {};
      if (extra.trim()) meta[c.kind === "mcp" ? "mcpUrl" : "account"] = extra.trim();
      const r = await api<{ note: string }>(`/api/connections/${c.id}`, { secret, meta });
      toast(`${c.name}: ${r.note}`); setSecret(""); setOpen(false); await refresh();
    } catch (e) { toast((e as Error).message); }
    setBusy(false);
  };
  return (
    <div className="card stack" style={{ gap: 8 }}>
      <div className="row sp"><h3>{c.name}</h3>
        <span className={`pill ${on ? "ok" : c.required ? "warn" : ""}`}><span className="dot" />{on ? "Connected" : c.required ? "Required" : "Not connected"}</span></div>
      <p className="muted small" style={{ margin: 0 }}>{c.what}</p>
      <div className="row">
        {c.kind === "oauth" ? (
          <>
            <a className={`btn sm ${on ? "ghost" : ""}`} href={`/api/oauth/${c.id}/start`}>{on ? "Reconnect" : "Connect"}</a>
            {c.pasteToken && <button className="btn ghost sm" onClick={() => setOpen(!open)}>Paste a token</button>}
          </>
        ) : (
          <button className={`btn sm ${on ? "ghost" : ""}`} onClick={() => setOpen(!open)}>{on ? "Change" : "Connect"}</button>
        )}
        {on && <button className="btn ghost sm" onClick={async () => { await api(`/api/connections/${c.id}`, undefined, "DELETE"); await refresh(); }}>Disconnect</button>}
        {c.inEagleBed && <span className="pill info" title="Eagle Bed HQ uses this">Used by Eagle Bed</span>}
      </div>
      {open && c.kind === "oauth" && c.pasteToken && <p className="muted small" style={{ margin: 0 }}>{c.pasteToken}</p>}
      {open && (
        <div className="stack" style={{ gap: 8 }}>
          <input type="password" autoComplete="off" placeholder={c.id === "anthropic" ? "sk-ant-…" : c.kind === "mcp" ? "Access token for this MCP server" : "API key"} value={secret} onChange={(e) => setSecret(e.target.value)} aria-label="Key" />
          {c.id !== "anthropic" && c.kind !== "oauth" && <input type="text" placeholder={c.id === "shopify" ? "yourstore.myshopify.com" : c.kind === "mcp" ? `MCP server URL (default ${c.mcpUrl || "none"})` : "Account / store ID (optional)"} value={extra} onChange={(e) => setExtra(e.target.value)} aria-label="Extra setting" />}
          <div className="row"><button className="btn sm" disabled={busy || !secret} onClick={save}>{busy ? <span className="spin" /> : "Save"}</button><span className="muted small">Stored encrypted. Never shown again.</span></div>
        </div>
      )}
      {st?.note && <p className="muted small" style={{ margin: 0 }}>{st.note}</p>}
    </div>
  );
}

function Msg() {
  const q = useSearchParams();
  const { toast, refresh } = useApp();
  useEffect(() => { const m = q.get("msg"); if (m) { toast(m); void refresh(); } }, [q, toast, refresh]);
  return null;
}

export default function Connect() {
  return (
    <>
      <Suspense><Msg /></Suspense>
      <div className="head"><div><h1>Connections</h1><p className="muted">Connect everything once. Every agent then works with your real data. You can disconnect any time.</p></div></div>
      {GROUPS.map((g) => (
        <section key={g}>
          <h2 className="section">{g}</h2>
          <div className="grid g2">{CONNECTIONS.filter((c) => c.group === g).map((c) => <Conn key={c.id} c={c} />)}</div>
        </section>
      ))}
    </>
  );
}
