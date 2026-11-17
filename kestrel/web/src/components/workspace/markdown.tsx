"use client";
/* Minimal, safe Markdown renderer for AI answers (no HTML passthrough). Record ids like P12 / S3 become links when known. */
import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

export type RecordRef = { href?: string; label?: string };

const INLINE = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\[[PSHK]\d+(?:\s*,\s*[PSHK]\d+)*\]|\b[PSHK]\d+\b|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;

function RecordLink({ id, refs }: { id: string; refs: Record<string, RecordRef> }) {
  const r = refs[id];
  if (!r?.href) return <span className="font-mono text-[0.92em] text-muted">{id}</span>;
  return <Link href={r.href} title={r.label} className="rounded bg-primary-soft px-1 font-mono text-[0.85em] text-primary hover:underline">{id}</Link>;
}

function inline(text: string, refs: Record<string, RecordRef>, key = ""): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0, i = 0;
  for (const m of text.matchAll(INLINE)) {
    const t = m[0], at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const k = `${key}-${i++}`;
    if (t.startsWith("**") || t.startsWith("__")) out.push(<strong key={k} className="font-semibold text-fg">{inline(t.slice(2, -2), refs, k)}</strong>);
    else if (t.startsWith("`")) out.push(<code key={k} className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.88em]">{t.slice(1, -1)}</code>);
    else if (/^\[[PSHK]\d+/.test(t) && !t.includes("](")) {
      const ids = t.slice(1, -1).split(/\s*,\s*/);
      out.push(<span key={k} className="inline-flex flex-wrap gap-0.5 align-baseline">{ids.map((id) => <RecordLink key={id} id={id} refs={refs} />)}</span>);
    } else if (t.startsWith("[")) {
      const mm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(t);
      const href = mm?.[2] ?? "";
      if (mm && href.startsWith("/")) out.push(<Link key={k} href={href} className="text-primary hover:underline">{mm[1]}</Link>);
      else if (mm && /^https?:\/\//.test(href)) out.push(<a key={k} href={href} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline">{mm[1]}</a>);
      else out.push(t);
    } else if (/^[PSHK]\d+$/.test(t)) out.push(<RecordLink key={k} id={t} refs={refs} />);
    else out.push(<em key={k}>{inline(t.slice(1, -1), refs, k)}</em>);
    last = at + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block = { kind: "h"; level: number; text: string } | { kind: "ul"; items: string[] } | { kind: "ol"; items: string[] } | { kind: "p"; text: string } | { kind: "code"; text: string } | { kind: "hr" };

function parse(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => { if (para.length) { blocks.push({ kind: "p", text: para.join(" ") }); para = []; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line.trim())) {
      flush();
      const buf: string[] = [];
      for (i++; i < lines.length && !/^```/.test(lines[i].trim()); i++) buf.push(lines[i]);
      blocks.push({ kind: "code", text: buf.join("\n") });
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) { flush(); blocks.push({ kind: "h", level: h[1].length, text: h[2] }); continue; }
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) { flush(); blocks.push({ kind: "hr" }); continue; }
    const ul = /^\s*[-*+]\s+(.*)$/.exec(line), ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ul || ol) {
      flush();
      const kind = ul ? "ul" : "ol";
      const prev = blocks[blocks.length - 1];
      const text = (ul ?? ol)![1];
      if (prev && prev.kind === kind) prev.items.push(text); else blocks.push({ kind, items: [text] });
      continue;
    }
    if (!line.trim()) { flush(); continue; }
    // continuation of a list item
    const prev = blocks[blocks.length - 1];
    if (!para.length && prev && (prev.kind === "ul" || prev.kind === "ol") && /^\s{2,}/.test(line)) { prev.items[prev.items.length - 1] += " " + line.trim(); continue; }
    para.push(line.trim());
  }
  flush();
  return blocks;
}

export function Markdown({ text, refs = {}, className }: { text: string; refs?: Record<string, RecordRef>; className?: string }) {
  const blocks = React.useMemo(() => parse(text || ""), [text]);
  return (
    <div className={cn("space-y-3 text-[14px] leading-relaxed text-fg/90", className)}>
      {blocks.map((b, i) => {
        if (b.kind === "h") return <div key={i} className={cn("font-semibold text-fg", b.level <= 2 ? "pt-1 text-[15px]" : "text-[14px]")}>{inline(b.text, refs, `h${i}`)}</div>;
        if (b.kind === "ul") return <ul key={i} className="space-y-1.5 pl-1">{b.items.map((t, j) => <li key={j} className="flex gap-2.5"><span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-line-strong" /><span className="min-w-0">{inline(t, refs, `u${i}${j}`)}</span></li>)}</ul>;
        if (b.kind === "ol") return <ol key={i} className="space-y-1.5 pl-1">{b.items.map((t, j) => <li key={j} className="flex gap-2.5"><span className="w-5 shrink-0 text-right text-muted num">{j + 1}.</span><span className="min-w-0">{inline(t, refs, `o${i}${j}`)}</span></li>)}</ol>;
        if (b.kind === "code") return <pre key={i} className="overflow-x-auto rounded-lg border border-line bg-surface-2 p-3 font-mono text-xs">{b.text}</pre>;
        if (b.kind === "hr") return <hr key={i} className="border-line" />;
        return <p key={i}>{inline(b.text, refs, `p${i}`)}</p>;
      })}
    </div>
  );
}
