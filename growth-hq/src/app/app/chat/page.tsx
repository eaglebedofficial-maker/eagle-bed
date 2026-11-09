"use client";
import { useEffect, useRef, useState } from "react";
import { api, useApp } from "@/components/state";

const SUGGEST = [
  "What should we do this week to get more sales?",
  "Why are visitors not buying?",
  "Write next week's social posts",
  "Remember: we close on Sundays",
  "What did the team do yesterday?",
];

export default function Chat() {
  const { s, refresh, toast, openRun } = useApp();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const thinking = s?.runs.some((r) => r.trigger === "chat" && r.status === "running");
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [s?.chat.length, thinking]);

  const send = async (t: string, asOrder = false) => {
    if (!t.trim()) return;
    setBusy(true);
    try {
      if (asOrder) { const { runId } = await api<{ runId: string }>("/api/run", { order: t }); openRun(runId); }
      else await api("/api/chat", { text: t });
      setText("");
      await refresh();
    } catch (e) { toast((e as Error).message); }
    setBusy(false);
  };

  return (
    <>
      <div className="head"><div><h1>Talk to the Manager</h1><p className="muted">Ask anything or give orders. Important facts go into Memory so every agent knows them.</p></div>
        <button className="btn ghost sm" onClick={async () => { await api("/api/chat", undefined, "DELETE"); await refresh(); }}>New chat</button></div>
      <div className="msgs">
        {!s?.chat.length && <p className="empty">Say hello, or tap a suggestion below.</p>}
        {s?.chat.map((m) => <div key={m.id} className={`msg ${m.role === "user" ? "me" : "ai"}`}>{m.text}</div>)}
        {thinking && <div className="msg ai"><span className="spin" style={{ display: "inline-block" }} /> The Manager is working…</div>}
        <div ref={end} />
      </div>
      <div className="card" style={{ marginTop: 14, position: "sticky", bottom: 80 }}>
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Message the Manager" onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send(text); }} />
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn" disabled={busy || !text.trim()} onClick={() => send(text)}>Send</button>
          <button className="btn ghost" disabled={busy || !text.trim()} onClick={() => send(text, true)} title="The Manager plans it, the team works on it, and you get a report">Send as an order</button>
        </div>
        <div className="chips" style={{ marginTop: 10 }}>{SUGGEST.map((x) => <button key={x} className="chip" onClick={() => setText(x)}>{x}</button>)}</div>
      </div>
    </>
  );
}
