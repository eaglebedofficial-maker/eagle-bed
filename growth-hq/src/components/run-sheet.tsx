"use client";
import { useEffect, useRef, useState } from "react";
import { api, useApp } from "./state";
import type { Run } from "@/lib/types";
import Link from "next/link";

export function RunSheet() {
  const { runId, closeRun, refresh } = useApp();
  const [run, setRun] = useState<Run | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!runId) return;
    setRun(null);
    let stop = false;
    const tick = async () => {
      try {
        const r = await api<Run>(`/api/runs/${runId}`);
        if (stop) return;
        setRun(r);
        if (r.status === "running") setTimeout(tick, 1500);
        else void refresh();
      } catch { /* closed */ }
    };
    void tick();
    return () => { stop = true; };
  }, [runId, refresh]);

  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight }); }, [run?.log.length]);

  if (!runId) return null;
  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Agent run" onClick={(e) => e.target === e.currentTarget && closeRun()}>
      <div className="pane">
        <div className="row sp" style={{ marginBottom: 10 }}>
          <div>
            <h2>{run?.title || "Starting…"}</h2>
            <span className={`pill ${run?.status === "done" ? "ok" : run?.status === "failed" ? "bad" : "info"}`}>
              {run?.status === "running" && <span className="spin" />} {run?.status || "starting"}
            </span>
            {run?.usage && <span className="muted small"> · {(run.usage.input / 1000).toFixed(1)}k in / {(run.usage.output / 1000).toFixed(1)}k out tokens on your Claude key</span>}
          </div>
          <button className="btn ghost sm" onClick={closeRun}>Close</button>
        </div>
        <div className="log" ref={box} aria-live="polite">
          {!run?.log.length && <span className="muted">The Manager is reading your brief and planning the work…</span>}
          {run?.log.map((l, i) => (
            <div key={i} className={l.kind}>{l.kind === "tool" ? "→ " + l.text : l.text}</div>
          ))}
        </div>
        <p className="muted small" style={{ marginTop: 10 }}>
          You can close this; the team keeps working. Proposed changes land on the <Link href="/app/board" onClick={closeRun}>Board</Link> and the write-up in <Link href="/app/reports" onClick={closeRun}>Reports</Link>.
        </p>
      </div>
    </div>
  );
}
