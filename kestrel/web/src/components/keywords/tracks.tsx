"use client";
/* Keyword rank tracks: types, queries, add dialog and rank-history chart shared by Keyword Tracker and Rank Tracker. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import * as React from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import type { ProductBrief } from "@/components/app/product";
import { PALETTE, tokenColor } from "@/components/ui/charts";
import { Dialog, Select } from "@/components/ui/overlay";
import { Button, Field, Textarea } from "@/components/ui/primitives";
import { errorMessage, get, post } from "@/lib/api";
import { num } from "@/lib/utils";
import { ProductSelect, splitLines, useKeywordLists, type KwListDetail } from "./common";

export type RankPoint = { ts: string; organic: number | null; sponsored: number | null };
export type Track = {
  id: number; active: boolean; product_id: number; asin: string; product_title: string; keyword_id: number; keyword: string; search_volume: number | null;
  organic: number | null; sponsored: number | null; change: number | null; change_7d: number | null; checked_at: string | null; history: RankPoint[];
};

export function useTracks(days: number, productId?: number | null) {
  return useQuery({ queryKey: ["keyword-tracks", days, productId ?? null], queryFn: () => get<Track[]>("/keywords/tracks", { days, product_id: productId ?? undefined }) });
}

export function useCheckTracks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => post<{ checked: number; errors: string[]; queued?: number }>("/keywords/tracks/check", ids),
    onSuccess: (r) => {
      if (r.queued) toast.success(`Checking ${num(r.queued)} tracks in the background. Positions update over the next few minutes.`);
      else if (r.checked) toast.success(`Checked ${num(r.checked)} keyword position${r.checked === 1 ? "" : "s"}`);
      else if (!r.errors.length) toast.message("No active tracks to check");
      r.errors.forEach((e) => toast.error(e));
      qc.invalidateQueries({ queryKey: ["keyword-tracks"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

/** Track keywords for a product. Keywords can be typed or pulled from a keyword list. */
export function AddTracksDialog({ open, onOpenChange, initialProduct }: { open: boolean; onOpenChange: (v: boolean) => void; initialProduct?: ProductBrief | null }) {
  const qc = useQueryClient();
  const lists = useKeywordLists();
  const [product, setProduct] = React.useState<ProductBrief | null>(initialProduct ?? null);
  const [text, setText] = React.useState("");
  const [listId, setListId] = React.useState("");
  React.useEffect(() => { if (open) { setProduct(initialProduct ?? null); setText(""); setListId(""); } /* eslint-disable-next-line */ }, [open]);
  const loadList = useMutation({
    mutationFn: (id: string) => get<KwListDetail>(`/keywords/lists/${id}`),
    onSuccess: (l) => setText((t) => Array.from(new Set([...splitLines(t), ...l.items.map((i) => i.keyword)])).join("\n")),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const kws = Array.from(new Set(splitLines(text).map((k) => k.toLowerCase())));
  const m = useMutation({
    mutationFn: () => post<{ added: number }>("/keywords/tracks", { product_id: product!.id, keywords: kws }),
    onSuccess: (r) => {
      toast.success(r.added ? `Tracking ${num(r.added)} new keyword${r.added === 1 ? "" : "s"}` : "Those keywords are already tracked");
      qc.invalidateQueries({ queryKey: ["keyword-tracks"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Track keywords" size="lg"
      description="Kestrel checks organic and sponsored positions daily from Amazon search results (DataForSEO). Use “Check now” for an immediate reading."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button loading={m.isPending} disabled={!product || !kws.length} onClick={() => m.mutate()}><Plus />Track {kws.length ? num(kws.length) : ""} keyword{kws.length === 1 ? "" : "s"}</Button></>}>
      <div className="space-y-4">
        <Field label="Product"><ProductSelect value={product} onChange={setProduct} /></Field>
        <Field label="Keywords" hint="One per line, or separated by commas." aside={`${num(kws.length)} unique`}>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[160px]" placeholder={"ottoman bed double\nstorage bed frame"} />
        </Field>
        {!!lists.data?.length && (
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Or add from a keyword list" className="min-w-[220px] flex-1"><Select value={listId} onChange={setListId} placeholder="Choose a list" options={lists.data.map((l) => ({ value: String(l.id), label: `${l.name} (${l.count})` }))} aria-label="Keyword list" /></Field>
            <Button variant="secondary" disabled={!listId} loading={loadList.isPending} onClick={() => loadList.mutate(listId)}>Add keywords</Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}

/** Rank history line chart; rank 1 is at the top. */
export function RankChart({ series, height = 280, showSponsored }: { series: { key: string; label: string; points: RankPoint[] }[]; height?: number; showSponsored?: boolean }) {
  const data = React.useMemo(() => {
    const byT = new Map<number, Record<string, number | null>>();
    series.forEach((s) => s.points.forEach((p) => {
      const t = new Date(p.ts).getTime();
      const row = byT.get(t) ?? { t };
      row[s.key] = p.organic;
      if (showSponsored) row[`${s.key}_sp`] = p.sponsored;
      byT.set(t, row);
    }));
    return Array.from(byT.values()).sort((a, b) => (a.t as number) - (b.t as number));
  }, [series, showSponsored]);
  const fmt = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const AX = { stroke: "rgb(var(--line))", tick: { fill: "rgb(var(--subtle))", fontSize: 11 }, tickLine: false, axisLine: false } as const;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="rgb(var(--line))" strokeOpacity={0.6} vertical={false} />
          <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={fmt} minTickGap={40} {...AX} />
          <YAxis reversed allowDecimals={false} domain={[1, "dataMax"]} width={40} tickFormatter={(v) => `#${v}`} {...AX} />
          <RTooltip isAnimationActive={false} cursor={{ stroke: "rgb(var(--line-strong))", strokeDasharray: "3 3" }}
            content={({ active, payload, label }: any) => active && payload?.length ? (
              <div className="min-w-[180px] rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
                <div className="mb-1.5 font-medium text-muted">{new Date(label).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</div>
                {payload.filter((p: any) => p.value != null).map((p: any) => (
                  <div key={p.dataKey} className="flex items-center justify-between gap-4"><span className="flex items-center gap-1.5 text-muted"><span className="size-2 rounded-full" style={{ background: p.color }} />{p.name}</span><span className="font-medium text-fg num">#{p.value}</span></div>
                ))}
              </div>
            ) : null} />
          {series.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "rgb(var(--muted))" }} />}
          {series.map((s, i) => {
            const c = tokenColor(PALETTE[i % PALETTE.length]);
            return [
              <Line key={s.key} dataKey={s.key} name={series.length > 1 ? s.label : "Organic"} stroke={c} strokeWidth={1.8} dot={{ r: 2 }} activeDot={{ r: 4 }} connectNulls={false} isAnimationActive={false} type="monotone" />,
              showSponsored ? <Line key={`${s.key}_sp`} dataKey={`${s.key}_sp`} name="Sponsored" stroke={tokenColor("violet")} strokeDasharray="4 3" strokeWidth={1.5} dot={{ r: 2 }} connectNulls={false} isAnimationActive={false} type="monotone" /> : null,
            ];
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Inline sparkline for a rank series (inverted so up = better). */
export function RankSpark({ points }: { points: RankPoint[] }) {
  const v = points.map((p) => p.organic).filter((x): x is number => x != null);
  if (v.length < 2) return <span className="text-subtle">—</span>;
  const W = 72, H = 22, min = Math.min(...v), max = Math.max(...v), span = max - min || 1;
  const d = v.map((y, i) => `${i ? "L" : "M"}${((i / (v.length - 1)) * W).toFixed(1)} ${(2 + ((y - min) / span) * (H - 4)).toFixed(1)}`).join(" ");
  const better = v[v.length - 1] <= v[0];
  return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label="Rank history"><path d={d} fill="none" stroke={`rgb(var(--${better ? "success" : "danger"}))`} strokeWidth="1.5" /></svg>;
}

/** Latest organic rank bucket used in distributions. */
export const RANK_BUCKETS = [
  { key: "top3", label: "Top 3", test: (p: number) => p <= 3 },
  { key: "top10", label: "4–10", test: (p: number) => p > 3 && p <= 10 },
  { key: "p1", label: "11–48 (page 1)", test: (p: number) => p > 10 && p <= 48 },
  { key: "p2", label: "Page 2+", test: (p: number) => p > 48 },
];
