"use client";
/* Rank Tracker: product-level overview of tracked ASIN × keyword positions, movement and history. */
import { ArrowRight, Download, ListChecks, Plus, RefreshCw, Search, Target, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import type { ProductBrief } from "@/components/app/product";
import { CategoryChart, RangeButtons, tokenColor, PALETTE } from "@/components/ui/charts";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, LoadingRows, MetricCard, PageHeader, SourceBadge } from "@/components/ui/data";
import { Badge, Button, Card, CardBody, CardHeader, Skeleton } from "@/components/ui/primitives";
import { ago, cn, num } from "@/lib/utils";
import { ApiErrorView, Gate, isNotConfigured, Movement, PositionBadge, downloadCsv, today, useAnalyst } from "./common";
import { AddTracksDialog, RANK_BUCKETS, RankChart, RankSpark, useCheckTracks, useTracks, type Track } from "./tracks";

const DFS = { provider: "DataForSEO (Amazon search results)", classification: "licensed" };
type ProductRow = { product_id: number; asin: string; title: string; tracks: Track[]; ranked: number; top10: number; avg: number | null; up: number; down: number; checked_at: string | null };

export function RankTrackerPage() {
  const analyst = useAnalyst();
  const [days, setDays] = React.useState(30);
  const [adding, setAdding] = React.useState(false);
  const [addFor, setAddFor] = React.useState<ProductBrief | null>(null);
  const openAdd = (p: ProductBrief | null) => { setAddFor(p); setAdding(true); };
  const [sel, setSel] = React.useState<number | null>(null);
  const q = useTracks(days);
  const check = useCheckTracks();
  const all = React.useMemo(() => q.data ?? [], [q.data]);

  const products = React.useMemo<ProductRow[]>(() => {
    const g = new Map<number, Track[]>();
    all.forEach((t) => g.set(t.product_id, [...(g.get(t.product_id) ?? []), t]));
    return Array.from(g.entries()).map(([pid, ts]) => {
      const ranked = ts.filter((t) => t.organic != null);
      return {
        product_id: pid, asin: ts[0].asin, title: ts[0].product_title, tracks: ts, ranked: ranked.length, top10: ranked.filter((t) => t.organic! <= 10).length,
        avg: ranked.length ? Math.round(ranked.reduce((a, t) => a + t.organic!, 0) / ranked.length) : null,
        up: ts.filter((t) => (t.change_7d ?? 0) > 0).length, down: ts.filter((t) => (t.change_7d ?? 0) < 0).length,
        checked_at: ts.map((t) => t.checked_at).filter(Boolean).sort().reverse()[0] ?? null,
      };
    }).sort((a, b) => b.tracks.length - a.tracks.length);
  }, [all]);
  const active = products.find((p) => p.product_id === sel) ?? products[0] ?? null;

  const ranked = all.filter((t) => t.organic != null);
  const dist = RANK_BUCKETS.map((b) => ({ bucket: b.label, keywords: ranked.filter((t) => b.test(t.organic!)).length }));
  const unranked = all.filter((t) => t.checked_at && t.organic == null).length;
  const movers = all.filter((t) => t.change_7d != null && t.change_7d !== 0).sort((a, b) => (b.change_7d ?? 0) - (a.change_7d ?? 0));
  const gainers = movers.filter((t) => (t.change_7d ?? 0) > 0).slice(0, 6);
  const losers = movers.filter((t) => (t.change_7d ?? 0) < 0).reverse().slice(0, 6);
  const volWeighted = ranked.filter((t) => t.search_volume);
  const vw = volWeighted.length ? volWeighted.reduce((a, t) => a + t.organic! * t.search_volume!, 0) / volWeighted.reduce((a, t) => a + t.search_volume!, 0) : null;

  const cols = React.useMemo<ColumnDef<ProductRow, any>[]>(() => [
    { id: "product", header: "Product", accessorKey: "title", enableHiding: false, cell: ({ row: { original: p } }) => <div className="min-w-[220px] max-w-[360px]"><div className="line-clamp-1 font-medium">{p.title || p.asin}</div><div className="font-mono text-2xs text-subtle">{p.asin}</div></div> },
    { id: "keywords", header: "Keywords", accessorFn: (p) => p.tracks.length, meta: { align: "right" } },
    { id: "ranked", header: "Ranking", accessorKey: "ranked", meta: { align: "right" }, cell: ({ row: { original: p } }) => <span className="num">{p.ranked}<span className="text-subtle">/{p.tracks.length}</span></span> },
    { id: "top10", header: "Top 10", accessorKey: "top10", meta: { align: "right" } },
    { id: "avg", header: "Avg organic", accessorKey: "avg", meta: { align: "right" }, sortDescFirst: false, cell: ({ getValue }) => getValue() == null ? "—" : `#${getValue()}` },
    { id: "up", header: "Improved 7d", accessorKey: "up", meta: { align: "right" }, cell: ({ getValue }) => getValue() ? <span className="text-success num">{getValue()}</span> : <span className="text-subtle">0</span> },
    { id: "down", header: "Declined 7d", accessorKey: "down", meta: { align: "right" }, cell: ({ getValue }) => getValue() ? <span className="text-danger num">{getValue()}</span> : <span className="text-subtle">0</span> },
    { id: "checked_at", header: "Last check", accessorKey: "checked_at", cell: ({ getValue }) => <span className="text-xs text-muted">{ago(getValue())}</span> },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Keyword intelligence" title="Rank Tracker"
        description="Organic and sponsored Amazon positions for every product you track, with daily movement. Positions come from live Amazon search results checked once a day."
        actions={<>
          <RangeButtons value={days} onChange={setDays} options={[{ value: 7, label: "7D" }, { value: 30, label: "30D" }, { value: 90, label: "90D" }]} />
          <Gate allowed={analyst}><Button variant="secondary" loading={check.isPending} disabled={!all.length} onClick={() => check.mutate([])}><RefreshCw />Check all now</Button></Gate>
          <Gate allowed={analyst}><Button onClick={() => openAdd(null)}><Plus />Track keywords</Button></Gate>
        </>} />

      {q.error ? <Card><ApiErrorView error={q.error} onRetry={() => q.refetch()} /></Card> : !q.isLoading && !all.length ? (
        <Card><EmptyState icon={TrendingUp} title="No rank tracking yet" description="Choose a product and the keywords you want it to rank for. Kestrel checks Amazon search results daily and charts organic and sponsored positions. Requires DataForSEO."
          action={<><Gate allowed={analyst}><Button onClick={() => openAdd(null)}><Plus />Track keywords</Button></Gate><Button variant="secondary" asChild><Link href="/reverse-asin"><Search />Find keywords with Reverse ASIN</Link></Button></>} /></Card>
      ) : (
        <>
          {isNotConfigured(check.error) && <Card><ApiErrorView error={check.error} /></Card>}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard loading={q.isLoading} label="Keyword tracks" icon={ListChecks} value={num(all.length)} sub={<span>{num(products.length)} product{products.length === 1 ? "" : "s"}</span>} />
            <MetricCard loading={q.isLoading} label="Volume-weighted rank" icon={Target} tone="cyan" value={vw == null ? "—" : `#${Math.round(vw)}`} tooltip="Average organic position weighted by each keyword's search volume. Lower is better." source={DFS} />
            <MetricCard loading={q.isLoading} label="Improved (7 days)" icon={TrendingUp} tone="success" value={num(all.filter((t) => (t.change_7d ?? 0) > 0).length)} />
            <MetricCard loading={q.isLoading} label="Declined (7 days)" icon={TrendingDown} tone="danger" value={num(all.filter((t) => (t.change_7d ?? 0) < 0).length)} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader eyebrow="Rank distribution" title="Where your keywords rank now" description={`Latest organic position per tracked keyword.${unranked ? ` ${num(unranked)} checked keyword${unranked === 1 ? " isn't" : "s aren't"} in the top results.` : ""}`} action={<SourceBadge source={DFS} />} />
              <CardBody>{q.isLoading ? <Skeleton className="h-[220px] w-full" /> : ranked.length ? <CategoryChart height={220} data={dist} x="bucket" series={[{ key: "keywords", label: "Keywords", tone: "primary" }]} valueFormat={(v) => num(v)} />
                : <EmptyState compact icon={RefreshCw} title="No positions recorded yet" description="Positions appear after the first daily check, or run “Check all now”." />}</CardBody>
            </Card>
            <Card>
              <CardHeader eyebrow="Movement" title="Biggest 7-day movers" />
              <CardBody>
                {q.isLoading ? <LoadingRows rows={4} className="p-0" /> : !movers.length ? <EmptyState compact icon={TrendingUp} title="No movement yet" description="Movement needs at least a week of daily checks." /> : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    {[["Gainers", gainers], ["Decliners", losers]].map(([label, list]) => (
                      <div key={label as string}>
                        <div className="mb-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">{label as string}</div>
                        {(list as Track[]).length ? <ul className="space-y-1">{(list as Track[]).map((t) => (
                          <li key={t.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-surface-2"><span className="min-w-0 flex-1"><span className="block truncate">{t.keyword}</span><span className="font-mono text-2xs text-subtle">{t.asin}</span></span><PositionBadge pos={t.organic} /><Movement value={t.change_7d} className="w-10 justify-end" /></li>
                        ))}</ul> : <p className="px-2 text-xs text-subtle">None</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader eyebrow="By product" title="Tracked products" description="Select a product to chart its keyword positions." action={<Button size="sm" variant="ghost" disabled={!all.length} onClick={() => downloadCsv(`rank-tracker-${today()}.csv`, ["ASIN", "Product", "Keyword", "Search volume", "Organic", "Sponsored", "Last change", "7-day change", "Checked at"], all.map((t) => [t.asin, t.product_title, t.keyword, t.search_volume, t.organic, t.sponsored, t.change, t.change_7d, t.checked_at]))}><Download />Export</Button>} />
            <DataTable className="rounded-none border-x-0 border-b-0 shadow-none" columns={cols} data={products} loading={q.isLoading} getRowId={(p) => String(p.product_id)} onRowClick={(p) => setSel(p.product_id)} dense />
          </Card>

          {active && <ProductRanks p={active} onAdd={() => openAdd({ id: active.product_id, asin: active.asin, title: active.title } as ProductBrief)} />}
        </>
      )}
      <AddTracksDialog open={adding} onOpenChange={setAdding} initialProduct={addFor} />
    </div>
  );
}

function ProductRanks({ p, onAdd }: { p: ProductRow; onAdd: () => void }) {
  const analyst = useAnalyst();
  const byVol = [...p.tracks].sort((a, b) => (b.search_volume ?? 0) - (a.search_volume ?? 0));
  const [shown, setShown] = React.useState<number[]>([]);
  React.useEffect(() => { setShown(byVol.filter((t) => t.history.length).slice(0, 5).map((t) => t.id)); /* eslint-disable-next-line */ }, [p.product_id]);
  const charted = p.tracks.filter((t) => shown.includes(t.id) && t.history.length);
  return (
    <Card>
      <CardHeader eyebrow="Keyword positions" title={<span className="line-clamp-1">{p.title || p.asin}</span>} description={<span className="font-mono">{p.asin}</span>}
        action={<><Button size="sm" variant="ghost" asChild><Link href={`/products/${p.product_id}`}>Product<ArrowRight /></Link></Button><Gate allowed={analyst}><Button size="sm" variant="secondary" onClick={onAdd}><Plus />Add keywords</Button></Gate></>} />
      <CardBody className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {byVol.map((t) => {
            const i = charted.findIndex((c) => c.id === t.id);
            const on = i >= 0;
            return (
              <button key={t.id} disabled={!t.history.length} onClick={() => setShown((s) => on ? s.filter((x) => x !== t.id) : [...s, t.id].slice(-6))} aria-pressed={on}
                className={cn("inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors disabled:opacity-40", on ? "border-line-strong bg-surface-2 text-fg" : "border-line text-subtle hover:text-fg")}>
                <span className="size-2 rounded-full" style={{ background: on ? tokenColor(PALETTE[i % PALETTE.length]) : "rgb(var(--line-strong))" }} />{t.keyword}
              </button>
            );
          })}
        </div>
        {charted.length ? <RankChart height={300} series={charted.map((t) => ({ key: `k${t.id}`, label: t.keyword, points: t.history }))} />
          : <EmptyState compact icon={TrendingUp} title="Nothing to chart yet" description="Select keywords above. Keywords appear once they have at least one daily reading." />}
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead className="bg-surface-2 text-2xs uppercase tracking-[0.06em] text-subtle"><tr>{["Keyword", "Volume", "Organic", "Sponsored", "Change", "7 days", "Trend"].map((h, i) => <th key={h} className={cn("px-3 py-2 font-semibold", i ? "text-right" : "text-left")}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {byVol.map((t) => (
                <tr key={t.id}>
                  <td className="px-3 py-2"><Link className="hover:text-primary" href={`/keyword-tracker`}>{t.keyword}</Link>{!t.checked_at && <Badge size="sm" className="ml-2">Not checked</Badge>}</td>
                  <td className="px-3 py-2 text-right num">{num(t.search_volume)}</td>
                  <td className="px-3 py-2 text-right"><PositionBadge pos={t.organic} /></td>
                  <td className="px-3 py-2 text-right"><PositionBadge pos={t.sponsored} sponsored /></td>
                  <td className="px-3 py-2 text-right"><Movement value={t.change} /></td>
                  <td className="px-3 py-2 text-right"><Movement value={t.change_7d} /></td>
                  <td className="px-3 py-2"><div className="flex justify-end"><RankSpark points={t.history} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
