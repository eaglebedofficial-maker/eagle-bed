"use client";
/* Keyword Tracker: per-keyword rank tracks, history, and the Index Checker. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleHelp, Download, ListChecks, Plus, RefreshCw, ScanLine, Search, Trash2, TrendingDown, TrendingUp, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import type { ProductBrief } from "@/components/app/product";
import { RangeButtons } from "@/components/ui/charts";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, KeyValue, LoadingRows, MetricCard, PageHeader, SourceBadge } from "@/components/ui/data";
import { ConfirmDialog, Select, Sheet, Tabs } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, SearchInput, Segmented, Textarea } from "@/components/ui/primitives";
import { del, errorMessage, get, post } from "@/lib/api";
import { ago, dateShort, num } from "@/lib/utils";
import { ApiErrorView, Gate, isNotConfigured, Movement, PositionBadge, ProductSelect, downloadCsv, splitLines, today, useAnalyst, useKeywordLists, type KwListDetail } from "./common";
import { AddTracksDialog, RankChart, RankSpark, useCheckTracks, useTracks, type Track } from "./tracks";

const DAYS = [{ value: 7, label: "7D" }, { value: 30, label: "30D" }, { value: 90, label: "90D" }];
const DFS = { provider: "DataForSEO (Amazon search results)", classification: "licensed" };

export function KeywordTrackerPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = React.useState(sp.get("tab") === "index" ? "index" : "tracks");
  const change = (t: string) => { setTab(t); router.replace(`/keyword-tracker${t === "index" ? "?tab=index" : ""}`, { scroll: false }); };
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Keyword intelligence" title="Keyword Tracker"
        description="Follow each product's organic and sponsored position for the keywords that matter, day by day, and confirm which keywords your listing is indexed for."
        actions={<Button variant="secondary" asChild><Link href="/ranks"><TrendingUp />Rank overview</Link></Button>} />
      <div>
        <Tabs value={tab} onValueChange={change} tabs={[{ value: "tracks", label: "Tracked keywords" }, { value: "index", label: "Index checker" }]} />
        <div className={tab === "tracks" ? "pt-5" : "hidden"}><TracksView /></div>
        <div className={tab === "index" ? "pt-5" : "hidden"}><IndexChecker /></div>
      </div>
    </div>
  );
}

/* ================================================================ tracks */
function TracksView() {
  const qc = useQueryClient();
  const analyst = useAnalyst();
  const [days, setDays] = React.useState(30);
  const [product, setProduct] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [move, setMove] = React.useState<"all" | "up" | "down">("all");
  const [adding, setAdding] = React.useState(false);
  const [selected, setSelected] = React.useState<Track[]>([]);
  const [open, setOpen] = React.useState<Track | null>(null);
  const [removing, setRemoving] = React.useState<Track[] | null>(null);
  const q = useTracks(days);
  const check = useCheckTracks();
  const remove = useMutation({
    mutationFn: async (ts: Track[]) => { for (const t of ts) await del(`/keywords/tracks/${t.id}`); return ts.length; },
    onSuccess: (n) => { toast.success(`Stopped tracking ${n} keyword${n === 1 ? "" : "s"}`); setRemoving(null); setOpen(null); qc.invalidateQueries({ queryKey: ["keyword-tracks"] }); },
    onError: (e) => { toast.error(errorMessage(e)); qc.invalidateQueries({ queryKey: ["keyword-tracks"] }); },
  });
  const all = React.useMemo(() => q.data ?? [], [q.data]);
  const products = React.useMemo(() => Array.from(new Map(all.map((t) => [t.product_id, { id: t.product_id, asin: t.asin, title: t.product_title }])).values()), [all]);
  const rows = React.useMemo(() => all.filter((t) => (product === "all" || String(t.product_id) === product)
    && (!search || t.keyword.includes(search.toLowerCase()) || t.asin.toLowerCase().includes(search.toLowerCase()))
    && (move === "all" || (move === "up" ? (t.change_7d ?? 0) > 0 : (t.change_7d ?? 0) < 0))), [all, product, search, move]);
  const ranked = rows.filter((t) => t.organic != null);
  const up = rows.filter((t) => (t.change_7d ?? 0) > 0).length, down = rows.filter((t) => (t.change_7d ?? 0) < 0).length;

  const cols = React.useMemo<ColumnDef<Track, any>[]>(() => [
    { id: "keyword", header: "Keyword", accessorKey: "keyword", enableHiding: false, cell: ({ row: { original: t } }) => <div className="min-w-[180px]"><div className="font-medium">{t.keyword}</div>{!t.active && <Badge size="sm" className="mt-0.5">Paused</Badge>}</div> },
    { id: "product", header: "Product", accessorKey: "asin", cell: ({ row: { original: t } }) => <div className="min-w-[160px] max-w-[260px]"><Link href={`/products/${t.product_id}`} onClick={(e) => e.stopPropagation()} className="line-clamp-1 text-[13px] hover:text-primary">{t.product_title || t.asin}</Link><div className="font-mono text-2xs text-subtle">{t.asin}</div></div> },
    { id: "search_volume", header: "Search volume", accessorKey: "search_volume", meta: { align: "right" }, cell: ({ getValue }) => num(getValue()) },
    { id: "organic", header: "Organic", accessorKey: "organic", meta: { align: "right" }, sortDescFirst: false, sortUndefined: "last", cell: ({ row: { original: t } }) => t.checked_at ? (t.organic == null ? <span className="text-xs text-subtle">Not in top results</span> : <PositionBadge pos={t.organic} />) : <span className="text-xs text-subtle">Not checked</span> },
    { id: "sponsored", header: "Sponsored", accessorKey: "sponsored", meta: { align: "right" }, sortDescFirst: false, cell: ({ getValue }) => <PositionBadge pos={getValue()} sponsored /> },
    { id: "change", header: "Last change", accessorKey: "change", meta: { align: "right" }, cell: ({ getValue }) => <Movement value={getValue()} /> },
    { id: "change_7d", header: "7 days", accessorKey: "change_7d", meta: { align: "right" }, cell: ({ getValue }) => <Movement value={getValue()} /> },
    { id: "history", header: "History", enableSorting: false, cell: ({ row }) => <RankSpark points={row.original.history} /> },
    { id: "checked_at", header: "Checked", accessorKey: "checked_at", cell: ({ getValue }) => <span className="text-xs text-muted">{ago(getValue())}</span> },
  ], []);

  if (q.error) return <Card><ApiErrorView error={q.error} onRetry={() => q.refetch()} /></Card>;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard loading={q.isLoading} label="Tracked keywords" icon={ListChecks} value={num(rows.length)} sub={<span>{num(products.length)} product{products.length === 1 ? "" : "s"}</span>} />
        <MetricCard loading={q.isLoading} label="Ranking organically" icon={Search} tone="cyan" value={num(ranked.length)} sub={<span>{num(ranked.filter((t) => t.organic! <= 10).length)} in top 10</span>} source={DFS} />
        <MetricCard loading={q.isLoading} label="Improved (7 days)" icon={TrendingUp} tone="success" value={num(up)} />
        <MetricCard loading={q.isLoading} label="Declined (7 days)" icon={TrendingDown} tone="danger" value={num(down)} />
      </div>
      <DataTable columns={cols} data={rows} loading={q.isLoading} selectable onSelectionChange={setSelected} getRowId={(t) => String(t.id)} onRowClick={setOpen} storageKey="kw-tracks" dense maxHeight="70vh"
        toolbar={<>
          <SearchInput value={search} onChange={setSearch} placeholder="Filter keyword or ASIN" className="w-full sm:w-56" />
          <div className="w-full sm:w-56"><Select size="sm" value={product} onChange={setProduct} options={[{ value: "all", label: "All products" }, ...products.map((p) => ({ value: String(p.id), label: `${p.asin} · ${p.title?.slice(0, 40) || ""}` }))]} aria-label="Product" /></div>
          <Segmented size="sm" value={move} onChange={setMove} options={[{ value: "all", label: "All" }, { value: "up", label: "Improved" }, { value: "down", label: "Declined" }]} />
          <RangeButtons value={days} onChange={setDays} options={DAYS} />
          <div className="ml-auto flex flex-wrap gap-2">
            {selected.length > 0 && <Gate allowed={analyst}><Button size="sm" variant="ghost" className="text-danger" onClick={() => setRemoving(selected)}><Trash2 />Stop tracking</Button></Gate>}
            <Button size="sm" variant="secondary" disabled={!rows.length} onClick={() => downloadCsv(`keyword-tracker-${today()}.csv`, ["Keyword", "ASIN", "Product", "Search volume", "Organic position", "Sponsored position", "Last change", "7-day change", "Checked at"], rows.map((t) => [t.keyword, t.asin, t.product_title, t.search_volume, t.organic, t.sponsored, t.change, t.change_7d, t.checked_at]))}><Download />Export</Button>
            <Gate allowed={analyst}><Button size="sm" variant="secondary" loading={check.isPending} disabled={!all.length} onClick={() => check.mutate(selected.map((t) => t.id))}><RefreshCw />{selected.length ? `Check ${selected.length} now` : "Check all now"}</Button></Gate>
            <Gate allowed={analyst}><Button size="sm" onClick={() => setAdding(true)}><Plus />Track keywords</Button></Gate>
          </div>
        </>}
        empty={all.length ? <EmptyState compact title="No keywords match these filters" /> : (
          <EmptyState icon={ListChecks} title="No keywords tracked yet" description="Pick a product and the keywords you want to rank for. Kestrel records organic and sponsored positions every day from Amazon search results."
            action={<Gate allowed={analyst}><Button onClick={() => setAdding(true)}><Plus />Track keywords</Button></Gate>} />
        )} />
      {isNotConfigured(check.error) && <Card><ApiErrorView error={check.error} /></Card>}
      <TrackSheet track={open} onClose={() => setOpen(null)} onRemove={(t) => setRemoving([t])} />
      <AddTracksDialog open={adding} onOpenChange={setAdding} />
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Stop tracking?" confirmLabel="Stop tracking" loading={remove.isPending}
        description={<>{removing?.length === 1 ? <>“{removing[0].keyword}” for {removing[0].asin}</> : <>{removing?.length} keywords</>} will stop being checked and their rank history will be deleted.</>}
        onConfirm={() => removing && remove.mutate(removing)} />
    </div>
  );
}

function TrackSheet({ track, onClose, onRemove }: { track: Track | null; onClose: () => void; onRemove: (t: Track) => void }) {
  const analyst = useAnalyst();
  const check = useCheckTracks();
  const t = track;
  const best = t ? Math.min(...t.history.map((h) => h.organic ?? Infinity)) : Infinity;
  return (
    <Sheet open={!!t} onOpenChange={(v) => !v && onClose()} width={640} title={t?.keyword ?? ""} description={t ? `${t.asin} · ${t.product_title}` : undefined}
      footer={t && <><Gate allowed={analyst}><Button variant="ghost" className="mr-auto text-danger" onClick={() => onRemove(t)}><Trash2 />Stop tracking</Button></Gate>
        <Button variant="secondary" asChild><Link href={`/keywords?tab=research&q=${encodeURIComponent(t.keyword)}`}>Related keywords</Link></Button>
        <Gate allowed={analyst}><Button loading={check.isPending} onClick={() => check.mutate([t.id])}><RefreshCw />Check now</Button></Gate></>}>
      {t && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Organic", t.organic != null ? `#${t.organic}` : "—"], ["Sponsored", t.sponsored != null ? `#${t.sponsored}` : "—"], ["Best in range", Number.isFinite(best) ? `#${best}` : "—"], ["Search volume", num(t.search_volume)]].map(([l, v]) => (
              <div key={l} className="rounded-xl border border-line p-3"><div className="text-xs text-muted">{l}</div><div className="mt-1 text-lg font-semibold num">{v}</div></div>
            ))}
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between"><h4 className="text-[13px] font-semibold">Rank history</h4><SourceBadge source={DFS} /></div>
            {t.history.length > 1 ? <RankChart series={[{ key: "k", label: t.keyword, points: t.history }]} showSponsored />
              : <EmptyState compact icon={TrendingUp} title={t.history.length ? "One reading so far" : "No readings yet"} description="A chart appears after two daily checks. Use “Check now” for an immediate reading." />}
          </div>
          {t.history.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-line">
              <table className="w-full text-[13px]">
                <thead className="bg-surface-2 text-2xs uppercase tracking-[0.06em] text-subtle"><tr><th className="px-3 py-2 text-left font-semibold">Checked</th><th className="px-3 py-2 text-right font-semibold">Organic</th><th className="px-3 py-2 text-right font-semibold">Sponsored</th></tr></thead>
                <tbody className="divide-y divide-line">{[...t.history].reverse().slice(0, 30).map((h) => <tr key={h.ts}><td className="px-3 py-2 text-muted">{new Date(h.ts).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td><td className="px-3 py-2 text-right"><PositionBadge pos={h.organic} /></td><td className="px-3 py-2 text-right"><PositionBadge pos={h.sponsored} sponsored /></td></tr>)}</tbody>
              </table>
            </div>
          )}
          <KeyValue rows={[["Tracking since", dateShort(t.history[0]?.ts)], ["Last checked", t.checked_at ? `${ago(t.checked_at)} · ${dateShort(t.checked_at)}` : "Not checked yet"], ["Method", "Position among organic results (sponsored placements excluded) in Amazon search, up to 100 results deep."]]} />
        </div>
      )}
    </Sheet>
  );
}

/* ================================================================ index checker */
type IndexRow = { keyword: string; indexed: boolean | null };
type IndexHist = { keyword: string | null; indexed: boolean | null; checked_at: string };

function IndexedBadge({ v }: { v: boolean | null }) {
  if (v === true) return <Badge tone="success" size="sm"><CheckCircle2 className="size-3" />Indexed</Badge>;
  if (v === false) return <Badge tone="danger" size="sm"><XCircle className="size-3" />Not indexed</Badge>;
  return <Badge size="sm"><CircleHelp className="size-3" />Couldn't check</Badge>;
}

function IndexChecker() {
  const qc = useQueryClient();
  const analyst = useAnalyst();
  const lists = useKeywordLists();
  const [product, setProduct] = React.useState<ProductBrief | null>(null);
  const [text, setText] = React.useState("");
  const [listId, setListId] = React.useState("");
  const [view, setView] = React.useState<"latest" | "all">("latest");
  const kws = Array.from(new Set(splitLines(text).map((k) => k.toLowerCase())));
  const hist = useQuery({ queryKey: ["index-check", product?.id], enabled: !!product, queryFn: () => get<IndexHist[]>("/keywords/index-check", { product_id: product!.id }) });
  const tracks = useTracks(30, product?.id);
  const run = useMutation({
    mutationFn: () => post<{ items: IndexRow[]; method: string }>("/keywords/index-check", { product_id: product!.id, keywords: kws.slice(0, 50) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["index-check", product?.id] }),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const loadList = useMutation({
    mutationFn: (id: string) => get<KwListDetail>(`/keywords/lists/${id}`),
    onSuccess: (l) => setText((t) => Array.from(new Set([...splitLines(t), ...l.items.map((i) => i.keyword)])).join("\n")),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const latest = React.useMemo(() => {
    const seen = new Map<string, IndexHist>();
    (hist.data ?? []).forEach((h) => { if (h.keyword && !seen.has(h.keyword)) seen.set(h.keyword, h); });
    return Array.from(seen.values());
  }, [hist.data]);
  const histRows = view === "latest" ? latest : hist.data ?? [];
  const histCols: ColumnDef<IndexHist, any>[] = [
    { id: "keyword", header: "Keyword", accessorKey: "keyword", cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { id: "indexed", header: "Status", accessorKey: "indexed", cell: ({ getValue }) => <IndexedBadge v={getValue()} /> },
    { id: "checked_at", header: "Checked", accessorKey: "checked_at", cell: ({ getValue }) => <span className="text-muted">{new Date(getValue()).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span> },
  ];
  const r = run.data;
  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="self-start">
        <CardHeader eyebrow="Index checker" title="Is your listing indexed for these keywords?" description="Kestrel searches Amazon for “ASIN + keyword”. If the product appears, the keyword is attached to the listing. Up to 50 keywords per run." />
        <CardBody className="space-y-4">
          <Field label="Product"><ProductSelect value={product} onChange={(p) => { setProduct(p); run.reset(); }} /></Field>
          <Field label="Keywords" aside={`${num(kws.length)}${kws.length > 50 ? " · first 50 checked" : ""}`}>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[150px]" placeholder={"One per line\nottoman bed double"} />
          </Field>
          <div className="flex flex-wrap gap-2">
            {!!tracks.data?.length && product && <Button size="sm" variant="ghost" onClick={() => setText(Array.from(new Set([...splitLines(text), ...tracks.data!.map((t) => t.keyword)])).join("\n"))}>Use {tracks.data.length} tracked keywords</Button>}
            {!!lists.data?.length && (
              <div className="flex min-w-0 flex-1 gap-2">
                <div className="min-w-0 flex-1"><Select size="sm" value={listId} onChange={setListId} placeholder="From a keyword list" options={lists.data.map((l) => ({ value: String(l.id), label: `${l.name} (${l.count})` }))} aria-label="Keyword list" /></div>
                <Button size="sm" variant="secondary" disabled={!listId} loading={loadList.isPending} onClick={() => loadList.mutate(listId)}>Add</Button>
              </div>
            )}
          </div>
          <Gate allowed={analyst}><Button className="w-full" loading={run.isPending} disabled={!product || !kws.length} onClick={() => run.mutate()}><ScanLine />Check indexing</Button></Gate>
          {run.isPending && <p className="text-xs text-muted">Each keyword is a live Amazon search, so this can take a few minutes for long lists.</p>}
        </CardBody>
      </Card>
      <div className="min-w-0 space-y-4">
        {!product ? <Card><EmptyState icon={ScanLine} title="Choose a product to start" description="Index checks run against one of your products. Results are kept so you can see when keywords drop off the listing." /></Card> : (
          <>
            {run.error ? <Card><ApiErrorView error={run.error} fallbackProvider="DataForSEO" onRetry={() => run.mutate()} /></Card> : r && (
              <Card>
                <CardHeader eyebrow="This run" title={`${num(r.items.filter((i) => i.indexed).length)} of ${num(r.items.length)} keywords indexed`} description={r.method} action={<SourceBadge source={DFS} />} />
                <CardBody>
                  <ul className="divide-y divide-line rounded-xl border border-line">
                    {r.items.map((i) => <li key={i.keyword} className="flex items-center justify-between gap-3 px-3 py-2 text-[13px]"><span className="min-w-0 truncate">{i.keyword}</span><IndexedBadge v={i.indexed} /></li>)}
                  </ul>
                  {r.items.some((i) => i.indexed === false) && <p className="mt-3 text-xs text-muted">Keywords that aren't indexed won't show your product in search. Add them to the title, bullets or backend search terms in the <Link className="text-primary hover:underline" href="/listing">Listing Optimizer</Link>, then re-check after Amazon re-indexes (often 24–72 hours).</p>}
                </CardBody>
              </Card>
            )}
            <DataTable columns={histCols} data={histRows} loading={hist.isLoading} dense maxHeight="60vh" getRowId={(h) => `${h.keyword}-${h.checked_at}`}
              toolbar={<><span className="text-[13px] font-medium">Check history</span><Segmented size="sm" value={view} onChange={setView} options={[{ value: "latest", label: "Latest per keyword" }, { value: "all", label: "All checks" }]} />
                <Button size="sm" variant="secondary" className="ml-auto" disabled={!histRows.length} onClick={() => downloadCsv(`index-check-${product.asin}-${today()}.csv`, ["Keyword", "Indexed", "Checked at"], histRows.map((h) => [h.keyword, h.indexed == null ? "unknown" : h.indexed ? "yes" : "no", h.checked_at]))}><Download />Export</Button></>}
              empty={hist.error ? <ApiErrorView error={hist.error} onRetry={() => hist.refetch()} /> : <EmptyState compact icon={ScanLine} title="No index checks for this product yet" description="Add keywords on the left and run a check." />} />
          </>
        )}
      </div>
    </div>
  );
}

