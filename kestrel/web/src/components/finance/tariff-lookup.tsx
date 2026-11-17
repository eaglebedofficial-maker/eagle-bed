"use client";
/* UK Trade Tariff lookup: search commodity codes (/tariff/search) and read the third-country duty (/tariff/{code}). */
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Landmark, Search } from "lucide-react";
import * as React from "react";
import { EmptyState, ErrorState, LoadingRows, SourceBadge, type Source } from "@/components/ui/data";
import { Dialog } from "@/components/ui/overlay";
import { Badge, Button, SearchInput } from "@/components/ui/primitives";
import { get } from "@/lib/api";
import { Notice, useDebounced } from "./shared";

type SearchResp = { results: { code: string | null; description: string | null; kind: string }[]; source: Source };
type Commodity = { code: string; description: string | null; third_country_duty: string | number | null; url: string; source: Source };

/** Returns an ad-valorem % if the duty expression is a plain percentage; otherwise null (compound duties must be entered by hand). */
export function parseDutyPct(v: string | number | null | undefined): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = v.replace(/<[^>]+>/g, "").trim();
  const m = /^([\d.]+)\s*%$/.exec(s);
  if (m) return Number(m[1]);
  if (/^[\d.]+$/.test(s)) return Number(s);
  return null;
}

const stripTags = (s?: string | null) => (s || "").replace(/<[^>]+>/g, "");

export function TariffLookup({ open, onOpenChange, onApply }: { open: boolean; onOpenChange: (v: boolean) => void; onApply: (pct: number, code: string, description: string) => void }) {
  const [q, setQ] = React.useState("");
  const [code, setCode] = React.useState<string | null>(null);
  const dq = useDebounced(q.trim(), 400);
  const s = useQuery({ queryKey: ["tariff-search", dq], queryFn: () => get<SearchResp>("/tariff/search", { q: dq }), enabled: open && dq.length >= 2, staleTime: 3600_000 });
  const c = useQuery({ queryKey: ["tariff", code], queryFn: () => get<Commodity>(`/tariff/${code}`), enabled: open && !!code, staleTime: 3600_000 });
  const pct = parseDutyPct(c.data?.third_country_duty);
  React.useEffect(() => { if (!open) { setCode(null); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" title="Look up import duty"
      description="Search the UK Global Tariff for a commodity code and its third-country duty rate. Preferential rates under trade agreements are not applied.">
      {code ? (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setCode(null)}><ArrowLeft />Back to results</Button>
          {c.isLoading ? <LoadingRows rows={3} className="p-0" /> : c.error ? <ErrorState error={c.error} onRetry={() => c.refetch()} /> : c.data && (
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-surface-2 p-4">
                <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-semibold">{c.data.code}</span><SourceBadge source={c.data.source} /></div>
                <p className="mt-2 text-[13px] text-muted">{stripTags(c.data.description) || "No description returned."}</p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div><div className="text-xs text-muted">Third-country duty</div><div className="mt-1 text-2xl font-semibold num">{c.data.third_country_duty != null ? stripTags(String(c.data.third_country_duty)) : "Not returned"}</div></div>
                  <Button variant="ghost" size="sm" asChild><a href={c.data.url} target="_blank" rel="noreferrer">View on trade-tariff.service.gov.uk<ExternalLink /></a></Button>
                </div>
              </div>
              {pct == null && <Notice tone="warning">This duty isn't a simple percentage (or wasn't returned), so it can't be applied automatically. Check the tariff page and enter the effective rate yourself.</Notice>}
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setCode(null)}>Choose another</Button>
                <Button disabled={pct == null} onClick={() => { if (pct != null) { onApply(pct, c.data!.code, stripTags(c.data!.description)); onOpenChange(false); } }}>Use {pct != null ? `${pct}%` : "rate"}</Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <SearchInput autoFocus value={q} onChange={setQ} placeholder="e.g. bed frame, cotton t-shirt, 9403" />
          {dq.length < 2 ? (
            <EmptyState compact icon={Landmark} title="Search the tariff" description="Describe the product or type a commodity code. Results come live from HMRC's Trade Tariff API." />
          ) : s.isLoading ? <LoadingRows rows={5} className="p-0" /> : s.error ? <ErrorState error={s.error} onRetry={() => s.refetch()} /> : !s.data?.results.filter((r) => r.code).length ? (
            <EmptyState compact icon={Search} title="No matches" description="Try a broader description or the first four digits of the code." />
          ) : (
            <>
              <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
                {s.data.results.filter((r) => r.code).map((r, i) => (
                  <li key={`${r.code}-${i}`}>
                    <button type="button" onClick={() => setCode(r.code!)} className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-2">
                      <span className="w-[92px] shrink-0 font-mono text-[13px] font-medium">{r.code}</span>
                      <span className="min-w-0 flex-1 text-[13px] text-muted">{stripTags(r.description) || "—"}</span>
                      <Badge size="sm" className="capitalize">{r.kind}</Badge>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-2xs text-subtle"><SourceBadge source={s.data.source} />Headings and chapters may need a more specific 10-digit commodity code.</div>
            </>
          )}
        </div>
      )}
    </Dialog>
  );
}
