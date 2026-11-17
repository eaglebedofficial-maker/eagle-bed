"use client";
/* Shared building blocks for the keyword, listing, competitor, review and market pages. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Check, ListPlus, Minus, PackageSearch, Plus } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { ProductThumb, type ProductBrief } from "@/components/app/product";
import { EmptyState, ErrorState, LoadingRows, NotConfigured } from "@/components/ui/data";
import { Dialog, Select, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Field, Input, SearchInput } from "@/components/ui/primitives";
import { ApiError, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, download, money, num } from "@/lib/utils";

/* ---------------------------------------------------------------- types */
export type Provenance = { provider?: string; classification?: string; retrieved_at?: string | null; cached?: boolean; period_from?: string | null; period_to?: string | null; note?: string };
export type Kw = {
  id: number; keyword: string; search_volume: number | null; volume_source: string; difficulty: number | null; cpc: number | null; result_count: number | null;
  trend: { month?: string; volume?: number | null }[] | null; updated_at: string | null;
};
export type KwList = { id: number; name: string; marketplace: string; source: string; count: number; updated_at: string | null };
export type KwListDetail = { id: number; name: string; marketplace: string; items: (Kw & { item_id: number; relevance: number | null; tags: unknown })[] };

/* ---------------------------------------------------------------- provider names */
const PROVIDER_NAMES: Record<string, string> = {
  dataforseo: "DataForSEO", anthropic: "Claude (Anthropic API)", sp_api: "Amazon SP-API", ads_api: "Amazon Ads API", pa_api: "Amazon PA-API", keepa: "Keepa",
};
export const providerName = (k?: string) => (k ? PROVIDER_NAMES[k] ?? k : undefined);

export const isNotConfigured = (e: unknown) => e instanceof ApiError && (e.status === 424 || e.notConfigured);

/** ErrorState that renders the not-configured state (HTTP 424) with a readable provider name. */
export function ApiErrorView({ error, onRetry, className, fallbackProvider }: { error: unknown; onRetry?: () => void; className?: string; fallbackProvider?: string }) {
  if (error instanceof ApiError && (error.status === 424 || error.notConfigured)) {
    return <NotConfigured className={className} provider={providerName(error.body.provider) ?? fallbackProvider} message={error.body.message} />;
  }
  return <ErrorState className={className} error={error} onRetry={onRetry} />;
}

/* ---------------------------------------------------------------- role gate */
export function useAnalyst() {
  const { can } = useSession();
  return can("analyst");
}
/** Wraps an action so viewers see it disabled with an explanation rather than a dead button. */
export function Gate({ allowed, reason = "Analyst role or higher required", children }: { allowed: boolean; reason?: string; children: React.ReactElement<{ disabled?: boolean }> }) {
  if (allowed) return children;
  return <Tooltip content={reason}><span className="inline-flex">{React.cloneElement(children, { disabled: true })}</span></Tooltip>;
}

/* ---------------------------------------------------------------- helpers */
export const splitLines = (s: string) => s.split(/[\n,;\t]+/).map((x) => x.trim()).filter(Boolean);
/** ASINs from free text: bare ASINs/ISBN-10s, or the /dp/ part of Amazon product URLs. */
export function extractAsins(s: string): string[] {
  const out: string[] = [];
  for (const tok of s.split(/[\s,;]+/).filter(Boolean)) {
    if (tok.includes("/")) {
      const m = tok.match(/\/(?:dp|gp\/product|product|gp\/aw\/d)\/([A-Z0-9]{10})(?=[/?#]|$)/i);
      if (m) out.push(m[1].toUpperCase());
    } else if (/^(B0[A-Z0-9]{8}|[0-9]{9}[0-9X])$/i.test(tok)) out.push(tok.toUpperCase());
  }
  return Array.from(new Set(out));
}

export function toCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const esc = (v: unknown) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
}
export function downloadCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  download(filename, new Blob(["﻿" + toCsv(headers, rows)], { type: "text/csv;charset=utf-8" }));
}
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "export";
export const today = () => new Date().toISOString().slice(0, 10);

/** Rank movement: positive = improved (moved up the results). */
export function Movement({ value, className }: { value: number | null | undefined; className?: string }) {
  if (value == null) return <span className={cn("text-subtle", className)}>—</span>;
  if (value === 0) return <span className={cn("inline-flex items-center gap-0.5 text-muted num", className)}><Minus className="size-3" />0</span>;
  const up = value > 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-medium num", up ? "text-success" : "text-danger", className)}>
      {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}{Math.abs(value)}
    </span>
  );
}

export function PositionBadge({ pos, sponsored }: { pos: number | null | undefined; sponsored?: boolean }) {
  if (pos == null) return <span className="text-subtle">—</span>;
  const tone = sponsored ? "violet" : pos <= 3 ? "success" : pos <= 10 ? "primary" : pos <= 48 ? "neutral" : "warning";
  return <Badge tone={tone} size="sm" className="min-w-[34px] justify-center num">#{pos}</Badge>;
}

export function TrendSpark({ trend }: { trend: Kw["trend"] }) {
  const vals = (trend ?? []).map((t) => (typeof t?.volume === "number" ? t.volume : null)).filter((v): v is number => v != null);
  if (vals.length < 2) return <span className="text-subtle">—</span>;
  const W = 64, H = 20, min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
  const d = vals.map((v, i) => `${i ? "L" : "M"}${((i / (vals.length - 1)) * W).toFixed(1)} ${(H - 2 - ((v - min) / span) * (H - 4)).toFixed(1)}`).join(" ");
  const up = vals[vals.length - 1] >= vals[0];
  return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label="Search volume trend"><path d={d} fill="none" stroke={`rgb(var(--${up ? "success" : "danger"}))`} strokeWidth="1.5" /></svg>;
}

/** Kestrel's own keyword classification from relevance and length. Labelled as such in the UI. */
export function classifyKeyword(keyword: string, relevance: number | null | undefined) {
  const words = keyword.trim().split(/\s+/).length;
  if (relevance != null && relevance >= 0.75) return words >= 4 ? { label: "Core long-tail", tone: "primary" as const } : { label: "Core", tone: "success" as const };
  if (relevance != null && relevance >= 0.4) return { label: "Related", tone: "cyan" as const };
  return words >= 4 ? { label: "Long-tail", tone: "violet" as const } : { label: "Broad", tone: "neutral" as const };
}

/* ---------------------------------------------------------------- keyword lists */
export function useKeywordLists() {
  return useQuery({ queryKey: ["keyword-lists"], queryFn: () => get<KwList[]>("/keywords/lists") });
}

/** Add a set of keywords to a new or existing keyword list. */
export function AddToListDialog({ open, onOpenChange, keywords, source }: { open: boolean; onOpenChange: (v: boolean) => void; keywords: string[]; source: string }) {
  const { marketplace } = useSession();
  const qc = useQueryClient();
  const lists = useKeywordLists();
  const [mode, setMode] = React.useState<"existing" | "new">("existing");
  const [listId, setListId] = React.useState("");
  const [name, setName] = React.useState("");
  React.useEffect(() => { if (open) { setName(""); setListId(""); } }, [open]);
  React.useEffect(() => { if (lists.data && !lists.data.length) setMode("new"); }, [lists.data]);
  const m = useMutation({
    mutationFn: async () => {
      if (mode === "new") return post<{ id: number }>("/keywords/lists", { name: name.trim(), marketplace, keywords, source });
      return post(`/keywords/lists/${listId}/items`, { keywords });
    },
    onSuccess: () => {
      toast.success(`${num(keywords.length)} keyword${keywords.length === 1 ? "" : "s"} added`);
      qc.invalidateQueries({ queryKey: ["keyword-lists"] });
      qc.invalidateQueries({ queryKey: ["keyword-list"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const valid = mode === "new" ? name.trim().length > 0 : !!listId;
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add to keyword list" description={`${num(keywords.length)} keyword${keywords.length === 1 ? "" : "s"} selected. Duplicates already in a list are skipped.`}
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button loading={m.isPending} disabled={!valid || !keywords.length} onClick={() => m.mutate()}><ListPlus />Add keywords</Button></>}>
      <div className="space-y-4">
        <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
          {(["existing", "new"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setMode(v)} disabled={v === "existing" && !lists.data?.length}
              className={cn("h-7 rounded-md px-3 text-[13px] font-medium transition-colors disabled:opacity-40", mode === v ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg")}>
              {v === "existing" ? "Existing list" : "New list"}
            </button>
          ))}
        </div>
        {mode === "existing" ? (
          lists.isLoading ? <LoadingRows rows={1} className="p-0" /> : lists.error ? <ApiErrorView error={lists.error} onRetry={() => lists.refetch()} /> : (
            <Field label="List">
              <Select value={listId} onChange={setListId} placeholder="Choose a list" options={(lists.data ?? []).map((l) => ({ value: String(l.id), label: `${l.name} · ${l.marketplace} · ${l.count}` }))} aria-label="Keyword list" />
            </Field>
          )
        ) : (
          <Field label="List name" hint={`Created for Amazon ${marketplace}.`}><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Divan beds — core terms" autoFocus /></Field>
        )}
        <div className="max-h-40 overflow-y-auto rounded-lg border border-line bg-surface-2 p-2 text-xs text-muted">
          {keywords.slice(0, 60).join(" · ")}{keywords.length > 60 && ` … and ${keywords.length - 60} more`}
        </div>
      </div>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- product picker */
type QueryResp = { total: number; items: ProductBrief[] };

export function ProductPickerDialog({ open, onOpenChange, onPick, multiple, max = 10, title = "Choose products", description, initial = [], confirmLabel }: {
  open: boolean; onOpenChange: (v: boolean) => void; onPick: (p: ProductBrief[]) => void; multiple?: boolean; max?: number; title?: string; description?: string; initial?: ProductBrief[]; confirmLabel?: string;
}) {
  const { marketplace, currency } = useSession();
  const [q, setQ] = React.useState("");
  const [dq, setDq] = React.useState("");
  const [sel, setSel] = React.useState<ProductBrief[]>(initial);
  React.useEffect(() => { if (open) { setSel(initial); setQ(""); setDq(""); } /* eslint-disable-next-line */ }, [open]);
  React.useEffect(() => { const t = setTimeout(() => setDq(q.trim()), 250); return () => clearTimeout(t); }, [q]);
  const res = useQuery({
    queryKey: ["kw-product-picker", marketplace, dq], enabled: open,
    queryFn: () => post<QueryResp>("/products/query", { filters: { marketplace, ...(dq ? { q: dq } : {}) }, sort: "score", dir: "desc", page: 1, page_size: 30 }),
  });
  const toggle = (p: ProductBrief) => {
    if (!multiple) { onPick([p]); onOpenChange(false); return; }
    setSel((s) => s.some((x) => x.id === p.id) ? s.filter((x) => x.id !== p.id) : s.length >= max ? s : [...s, p]);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} size="lg"
      description={description ?? `Products in your workspace for Amazon ${marketplace}. Research or import products to add more.`}
      footer={multiple ? <><span className="mr-auto text-xs text-muted num">{sel.length} of {max} selected</span><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!sel.length} onClick={() => { onPick(sel); onOpenChange(false); }}>{confirmLabel ?? "Use selection"}</Button></> : undefined}>
      <div className="space-y-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search by title, ASIN, brand or EAN" autoFocus />
        {res.isLoading ? <LoadingRows rows={5} className="p-0" /> : res.error ? <ApiErrorView error={res.error} onRetry={() => res.refetch()} /> : !res.data?.items.length ? (
          <EmptyState compact icon={PackageSearch} title={dq ? "No matching products" : "No products in this marketplace yet"}
            description="Products come from Product Research or a CSV import." action={<Button variant="secondary" asChild><Link href="/research">Research products</Link></Button>} />
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line">
            {res.data.items.map((p) => {
              const on = sel.some((x) => x.id === p.id);
              const full = multiple && !on && sel.length >= max;
              return (
                <li key={p.id}>
                  <button type="button" disabled={full} onClick={() => toggle(p)} className={cn("flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-2 disabled:opacity-40", on && "bg-primary-soft/40")}>
                    {multiple && <span className={cn("grid size-4 shrink-0 place-items-center rounded-[5px] border", on ? "border-primary bg-primary text-white" : "border-line-strong")}>{on && <Check className="size-3" strokeWidth={3} />}</span>}
                    <ProductThumb src={p.image_url} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-[13px] font-medium">{p.title || p.asin}</span>
                      <span className="mt-0.5 flex flex-wrap gap-x-2 text-2xs text-subtle"><span className="font-mono">{p.asin}</span>{p.brand && <span>{p.brand}</span>}<span className="num">{money(p.price, p.currency || currency)}</span>{p.reviews != null && <span className="num">{num(p.reviews)} reviews</span>}</span>
                    </span>
                    {!multiple && <Plus className="size-4 text-subtle" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
}

/** Button that shows the chosen product and opens the picker. */
export function ProductSelect({ value, onChange, placeholder = "Choose a product", allowClear }: { value: ProductBrief | null; onChange: (p: ProductBrief | null) => void; placeholder?: string; allowClear?: boolean }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" onClick={() => setOpen(true)} className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-left text-sm transition-colors hover:border-line-strong">
          {value ? <><ProductThumb src={value.image_url} size={24} className="rounded-md" /><span className="min-w-0 flex-1 truncate">{value.title || value.asin}</span><span className="font-mono text-2xs text-subtle">{value.asin}</span></>
            : <><PackageSearch className="size-4 text-subtle" /><span className="text-subtle">{placeholder}</span></>}
        </button>
        {allowClear && value && <Button variant="ghost" size="sm" onClick={() => onChange(null)}>Clear</Button>}
      </div>
      <ProductPickerDialog open={open} onOpenChange={setOpen} onPick={(p) => onChange(p[0] ?? null)} title="Choose a product" />
    </>
  );
}

/** Small "used / limit" counter that warns over the limit. */
export function CharCount({ value, limit, bytes, recommended }: { value: string; limit: number; bytes?: boolean; recommended?: [number, number] }) {
  const n = bytes ? new TextEncoder().encode(value).length : value.length;
  const over = n > limit;
  const inRange = recommended ? n >= recommended[0] && n <= recommended[1] : !over;
  return (
    <span className={cn("num", over ? "text-danger" : n === 0 ? "text-subtle" : inRange ? "text-success" : "text-warning")}>
      {num(n)} / {num(limit)}{bytes ? " bytes" : ""}
    </span>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full border border-line bg-surface-2 px-2 py-0.5 text-xs text-muted", className)}>{children}</span>;
}

