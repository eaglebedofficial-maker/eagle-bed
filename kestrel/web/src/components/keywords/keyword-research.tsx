"use client";
/* Keyword Research: related keywords (Magnet-style), bulk volume lookup, live Amazon SERP, keyword processor. */
import { useMutation } from "@tanstack/react-query";
import { Copy, Download, Eraser, Filter, Hash, ListChecks, ListPlus, Radar, ScanSearch, Search, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { AmazonLink } from "@/components/app/product";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { BarList, EmptyState, LoadingRows, MetricCard, PageHeader, SourceBadge } from "@/components/ui/data";
import { InfoTip, Select, Tabs } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Progress, Switch, Textarea } from "@/components/ui/primitives";
import { post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, money, num } from "@/lib/utils";
import {
  AddToListDialog, ApiErrorView, Gate, PositionBadge, TrendSpark, classifyKeyword, downloadCsv, slug, splitLines, today, useAnalyst, type Kw, type Provenance,
} from "./common";
import { KeywordListsSheet } from "./keyword-lists";

type ResearchRow = Kw & { depth: number | null; relevance: number | null };
type ResearchResp = { seed: string; items: ResearchRow[]; source: Provenance; bids_note: string | null };
type VolumeResp = { items: Kw[]; source: Provenance };
type SerpItem = { asin: string | null; title: string | null; type: string | null; rank_group: number | null; rank_absolute: number | null; price: number | null; rating: number | null; reviews: number | null; sponsored: boolean };
type SerpResp = { keyword: Kw; items: SerpItem[]; source: Provenance; difficulty_method: string };
type ProcessResp = { input_count: number; unique_count: number; removed: number; phrases: string[]; words: { word: string; count: number }[]; bigrams: { phrase: string; count: number }[]; backend_terms: string; backend_bytes: number };

const copy = (text: string, what = "Copied") => navigator.clipboard.writeText(text).then(() => toast.success(what), () => toast.error("Clipboard not available in this browser"));

/* ================================================================ page */
export function KeywordResearchPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = React.useState(sp.get("tab") || "research");
  const [listsOpen, setListsOpen] = React.useState(false);
  const [serpKw, setSerpKw] = React.useState<{ k: string; n: number } | null>(null);
  const changeTab = (t: string) => { setTab(t); const u = new URLSearchParams(sp.toString()); u.set("tab", t); router.replace(`/keywords?${u.toString()}`, { scroll: false }); };
  const openSerp = React.useCallback((k: string) => { setSerpKw((p) => ({ k, n: (p?.n ?? 0) + 1 })); changeTab("serp"); /* eslint-disable-next-line */ }, [sp]);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Keyword intelligence" title="Keyword Research"
        description="Find the search terms Amazon shoppers use, check exact search volumes, inspect page 1 and clean keyword sets for your listing. Volumes come from DataForSEO's Amazon data."
        actions={<><Button variant="secondary" onClick={() => setListsOpen(true)}><ListChecks />Keyword lists</Button><Button variant="secondary" asChild><Link href="/reverse-asin"><ScanSearch />Reverse ASIN</Link></Button></>} />
      <div>
        <Tabs value={tab} onValueChange={changeTab} tabs={[{ value: "research", label: "Keyword research" }, { value: "volume", label: "Search volume lookup" }, { value: "serp", label: "Live SERP" }, { value: "process", label: "Keyword processor" }]} />
        {/* Panels stay mounted so results survive switching tabs. */}
        <div className={tab === "research" ? "pt-5" : "hidden"}><ResearchTab initialSeed={sp.get("q") ?? ""} onSerp={openSerp} /></div>
        <div className={tab === "volume" ? "pt-5" : "hidden"}><VolumeTab /></div>
        <div className={tab === "serp" ? "pt-5" : "hidden"}><SerpTab request={serpKw} /></div>
        <div className={tab === "process" ? "pt-5" : "hidden"}><ProcessTab /></div>
      </div>
      <KeywordListsSheet open={listsOpen} onOpenChange={setListsOpen} />
    </div>
  );
}

/* ================================================================ research */
type Filters = { minVol: string; maxVol: string; words: string; include: string; exclude: string; cls: string };
const NO_FILTERS: Filters = { minVol: "", maxVol: "", words: "any", include: "", exclude: "", cls: "all" };

function ResearchTab({ initialSeed, onSerp }: { initialSeed: string; onSerp: (k: string) => void }) {
  const { marketplace, currency } = useSession();
  const analyst = useAnalyst();
  const [seed, setSeed] = React.useState(initialSeed);
  const [f, setF] = React.useState<Filters>(NO_FILTERS);
  const [selected, setSelected] = React.useState<ResearchRow[]>([]);
  const [adding, setAdding] = React.useState<string[] | null>(null);
  const m = useMutation({ mutationFn: (s: string) => post<ResearchResp>("/keywords/research", { seed: s, marketplace, limit: 300 }) });
  const ran = React.useRef(false);
  React.useEffect(() => { if (initialSeed && analyst && !ran.current) { ran.current = true; m.mutate(initialSeed); } /* eslint-disable-next-line */ }, [initialSeed, analyst]);

  const rows = React.useMemo(() => {
    const items = m.data?.items ?? [];
    const inc = splitLines(f.include.toLowerCase()), exc = splitLines(f.exclude.toLowerCase());
    return items.filter((r) => {
      const v = r.search_volume ?? 0, wc = r.keyword.split(/\s+/).length, k = r.keyword.toLowerCase();
      if (f.minVol && v < Number(f.minVol)) return false;
      if (f.maxVol && v > Number(f.maxVol)) return false;
      if (f.words !== "any" && (f.words === "4" ? wc < 4 : wc !== Number(f.words))) return false;
      if (inc.length && !inc.every((t) => k.includes(t))) return false;
      if (exc.length && exc.some((t) => k.includes(t))) return false;
      if (f.cls !== "all" && classifyKeyword(r.keyword, r.relevance).label !== f.cls) return false;
      return true;
    });
  }, [m.data, f]);
  const hasCpc = rows.some((r) => r.cpc != null), hasDiff = rows.some((r) => r.difficulty != null), hasTrend = rows.some((r) => (r.trend ?? []).length > 1);
  const totalVol = rows.reduce((a, r) => a + (r.search_volume ?? 0), 0);
  const withVol = rows.filter((r) => r.search_volume != null).map((r) => r.search_volume!).sort((a, b) => a - b);
  const median = withVol.length ? withVol[Math.floor(withVol.length / 2)] : null;
  const filtered = JSON.stringify(f) !== JSON.stringify(NO_FILTERS);

  const columns = React.useMemo<ColumnDef<ResearchRow, any>[]>(() => {
    const c: ColumnDef<ResearchRow, any>[] = [
      { id: "keyword", header: "Keyword", accessorKey: "keyword", enableHiding: false, cell: ({ row: { original: r } }) => {
        const cl = classifyKeyword(r.keyword, r.relevance);
        return <div className="flex min-w-[220px] flex-wrap items-center gap-2"><span className="font-medium">{r.keyword}</span><Badge tone={cl.tone} size="sm">{cl.label}</Badge></div>;
      } },
      { id: "search_volume", header: "Search volume", accessorKey: "search_volume", meta: { align: "right" }, sortUndefined: "last", cell: ({ getValue }) => getValue() == null ? <span className="text-subtle">No data</span> : num(getValue()) },
    ];
    if (hasTrend) c.push({ id: "trend", header: "Trend", enableSorting: false, cell: ({ row }) => <TrendSpark trend={row.original.trend} /> });
    c.push({ id: "relevance", header: "Relevancy", accessorKey: "relevance", meta: { align: "right" }, cell: ({ getValue }) => {
      const v = getValue() as number | null;
      return v == null ? "—" : <div className="ml-auto flex w-24 items-center gap-2"><Progress value={v * 100} tone={v >= 0.75 ? "success" : v >= 0.4 ? "primary" : "warning"} /><span className="w-8 text-right num">{Math.round(v * 100)}</span></div>;
    } });
    if (hasDiff) c.push({ id: "difficulty", header: "Difficulty", accessorKey: "difficulty", meta: { align: "right" }, cell: ({ getValue }) => getValue() == null ? "—" : <Badge size="sm" tone={getValue() >= 70 ? "danger" : getValue() >= 40 ? "warning" : "success"} className="num">{getValue()}</Badge> });
    if (hasCpc) c.push({ id: "cpc", header: "Suggested bid", accessorKey: "cpc", meta: { align: "right" }, cell: ({ getValue }) => money(getValue(), currency) });
    c.push({ id: "depth", header: "Depth", accessorKey: "depth", meta: { align: "right" }, cell: ({ getValue }) => getValue() == null ? "—" : getValue() === 0 ? <span className="text-muted">Seed</span> : num(getValue()) });
    c.push({ id: "actions", header: "", enableSorting: false, enableHiding: false, cell: ({ row: { original: r } }) => (
      <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100">
        <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); onSerp(r.keyword); }}><Radar />SERP</Button>
      </div>
    ) });
    return c;
  }, [hasCpc, hasDiff, hasTrend, currency, onSerp]);

  const exportRows = (list: ResearchRow[]) => downloadCsv(`keywords-${slug(m.data?.seed ?? "research")}-${marketplace}-${today()}.csv`,
    ["Keyword", "Search volume", "Relevancy", "Classification (Kestrel)", "Difficulty (estimate)", "Suggested bid", "Depth", "Volume source"],
    list.map((r) => [r.keyword, r.search_volume, r.relevance, classifyKeyword(r.keyword, r.relevance).label, r.difficulty, r.cpc, r.depth, r.volume_source]));

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <form className="flex flex-col gap-3 md:flex-row" onSubmit={(e) => { e.preventDefault(); if (seed.trim()) { setF(NO_FILTERS); m.mutate(seed.trim()); } }}>
          <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
            <Hash className="size-5 shrink-0 text-subtle" />
            <input value={seed} onChange={(e) => setSeed(e.target.value)} maxLength={200} placeholder="Seed keyword, e.g. ottoman bed double" className="h-full w-full min-w-0 bg-transparent text-[15px] text-fg placeholder:text-subtle focus:outline-none" aria-label="Seed keyword" />
            <Badge size="sm">Amazon {marketplace}</Badge>
          </div>
          <Gate allowed={analyst}><Button type="submit" size="lg" loading={m.isPending} disabled={!seed.trim()}><Search />Find keywords</Button></Gate>
        </form>
      </Card>

      {m.isIdle ? (
        <Card><EmptyState icon={Hash} title="Start with a seed keyword" description="Kestrel pulls related Amazon search terms two levels deep, with monthly search volume, relevancy to your seed and suggested bids when the Amazon Ads API is connected." /></Card>
      ) : m.isPending ? (
        <Card><div className="flex items-center gap-2 border-b border-line px-4 py-3 text-[13px] text-muted"><Sparkles className="size-4 animate-pulse text-primary" />Fetching related keywords from DataForSEO…</div><LoadingRows rows={8} /></Card>
      ) : m.error ? (
        <Card><ApiErrorView error={m.error} fallbackProvider="DataForSEO" onRetry={() => m.mutate(seed.trim())} /></Card>
      ) : m.data && !m.data.items.length ? (
        <Card><EmptyState icon={Search} title={`No related keywords for “${m.data.seed}”`} description="DataForSEO returned no Amazon terms for this seed. Try a broader, shorter phrase (two or three words)." /></Card>
      ) : m.data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Keywords" icon={Hash} value={num(rows.length)} sub={filtered ? <span>of {num(m.data.items.length)}</span> : undefined} />
            <MetricCard label="Total search volume" icon={Search} tone="cyan" value={num(totalVol, { compact: true })} tooltip="Sum of monthly Amazon search volume for the keywords shown." source={m.data.source} />
            <MetricCard label="Median volume" icon={Filter} tone="violet" value={num(median)} tooltip="Median monthly search volume of keywords with data." />
            <MetricCard label="Core keywords" icon={Sparkles} tone="success" value={num(rows.filter((r) => (r.relevance ?? 0) >= 0.75).length)} tooltip="Keywords where at least 75% of words match your seed. Classification is Kestrel's, from word overlap." />
          </div>
          {m.data.bids_note && <p className="rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning">Suggested bids unavailable: {m.data.bids_note}</p>}
          <FilterBar f={f} setF={setF} />
          <DataTable columns={columns} data={rows} selectable onSelectionChange={setSelected} getRowId={(r) => String(r.id)} storageKey="kw-research" dense maxHeight="70vh"
            toolbar={<>
              <span className="text-[13px] font-medium">Results for “{m.data.seed}”</span><SourceBadge source={m.data.source} />
              <div className="ml-auto flex flex-wrap gap-2">
                <Gate allowed={analyst}><Button size="sm" variant="secondary" disabled={!selected.length && !rows.length} onClick={() => setAdding((selected.length ? selected : rows).map((r) => r.keyword))}><ListPlus />{selected.length ? `Add ${selected.length} to list` : "Add all to list"}</Button></Gate>
                <Button size="sm" variant="secondary" disabled={!rows.length} onClick={() => exportRows(selected.length ? selected : rows)}><Download />{selected.length ? "Export selected" : "Export CSV"}</Button>
              </div>
            </>}
            empty={<EmptyState compact icon={Filter} title="No keywords match these filters" action={<Button variant="secondary" onClick={() => setF(NO_FILTERS)}><Eraser />Clear filters</Button>} />} />
        </>
      )}
      <AddToListDialog open={!!adding} onOpenChange={(v) => !v && setAdding(null)} keywords={adding ?? []} source="keyword_research" />
    </div>
  );
}

function FilterBar({ f, setF }: { f: Filters; setF: (f: Filters) => void }) {
  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Card className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
      <Field label="Min volume"><Input type="number" min={0} value={f.minVol} onChange={set("minVol")} placeholder="0" /></Field>
      <Field label="Max volume"><Input type="number" min={0} value={f.maxVol} onChange={set("maxVol")} placeholder="Any" /></Field>
      <Field label="Word count"><Select value={f.words} onChange={(v) => setF({ ...f, words: v })} options={[{ value: "any", label: "Any" }, { value: "1", label: "1 word" }, { value: "2", label: "2 words" }, { value: "3", label: "3 words" }, { value: "4", label: "4+ words" }]} aria-label="Word count" /></Field>
      <Field label="Classification"><Select value={f.cls} onChange={(v) => setF({ ...f, cls: v })} options={["all", "Core", "Core long-tail", "Related", "Broad", "Long-tail"].map((v) => ({ value: v, label: v === "all" ? "All" : v }))} aria-label="Classification" /></Field>
      <Field label="Include terms" aside="all must match"><Input value={f.include} onChange={set("include")} placeholder="e.g. storage" /></Field>
      <Field label="Exclude terms" aside="any"><Input value={f.exclude} onChange={set("exclude")} placeholder="e.g. single, kids" /></Field>
    </Card>
  );
}

/* ================================================================ volume */
function VolumeTab() {
  const { marketplace } = useSession();
  const analyst = useAnalyst();
  const [text, setText] = React.useState("");
  const [adding, setAdding] = React.useState<string[] | null>(null);
  const list = React.useMemo(() => Array.from(new Set(splitLines(text).map((k) => k.toLowerCase()))), [text]);
  const m = useMutation({ mutationFn: (keywords: string[]) => post<VolumeResp>("/keywords/volume", { keywords, marketplace }) });
  const items = m.data?.items ?? [];
  const found = new Set(items.map((i) => i.keyword));
  const missing = (m.variables ?? []).filter((k) => !found.has(k.toLowerCase().split(/\s+/).filter(Boolean).join(" ")));
  const cols = React.useMemo<ColumnDef<Kw, any>[]>(() => [
    { id: "keyword", header: "Keyword", accessorKey: "keyword", enableHiding: false, cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { id: "search_volume", header: "Monthly search volume", accessorKey: "search_volume", meta: { align: "right" }, cell: ({ getValue }) => getValue() == null ? <span className="text-subtle">No data</span> : num(getValue()) },
    { id: "trend", header: "Trend", enableSorting: false, cell: ({ row }) => <TrendSpark trend={row.original.trend} /> },
    { id: "updated", header: "Retrieved", accessorKey: "updated_at", cell: ({ getValue }) => <span className="text-muted">{getValue() ? new Date(getValue()).toLocaleDateString("en-GB") : "—"}</span> },
  ], []);
  return (
    <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card className="self-start">
        <CardHeader eyebrow="Bulk lookup" title="Search volume for your keywords" description="Paste up to 1,000 keywords. One per line, or separated by commas." />
        <CardBody className="space-y-3">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[240px] font-mono text-xs" placeholder={"divan bed double\nottoman storage bed\nbed frame king size"} aria-label="Keywords" />
          <div className="flex items-center justify-between gap-2 text-xs text-muted"><span className="num">{num(list.length)} unique keyword{list.length === 1 ? "" : "s"}{list.length > 1000 && <span className="text-danger"> · first 1,000 will be checked</span>}</span>
            <Gate allowed={analyst}><Button loading={m.isPending} disabled={!list.length} onClick={() => m.mutate(list.slice(0, 1000))}><Search />Get volumes</Button></Gate>
          </div>
        </CardBody>
      </Card>
      <div className="min-w-0">
        {m.isIdle ? <Card><EmptyState icon={Search} title="Exact Amazon search volumes" description={`Monthly searches on Amazon ${marketplace} for each keyword you paste, from DataForSEO. Use it to size terms you already know about.`} /></Card>
          : m.isPending ? <Card><LoadingRows rows={8} /></Card>
            : m.error ? <Card><ApiErrorView error={m.error} fallbackProvider="DataForSEO" onRetry={() => m.variables && m.mutate(m.variables)} /></Card>
              : (
                <div className="space-y-3">
                  {missing.length > 0 && <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs text-muted"><span className="font-medium text-fg num">{num(missing.length)}</span> keyword{missing.length === 1 ? " has" : "s have"} no Amazon volume data: {missing.slice(0, 12).join(", ")}{missing.length > 12 ? "…" : ""}</p>}
                  <DataTable columns={cols} data={items} getRowId={(r) => String(r.id)} dense maxHeight="70vh"
                    toolbar={<><span className="text-[13px] font-medium num">{num(items.length)} results</span>{m.data && <SourceBadge source={m.data.source} />}
                      <div className="ml-auto flex flex-wrap gap-2">
                        <Gate allowed={analyst}><Button size="sm" variant="secondary" disabled={!items.length} onClick={() => setAdding(items.map((i) => i.keyword))}><ListPlus />Add to list</Button></Gate>
                        <Button size="sm" variant="secondary" disabled={!items.length} onClick={() => downloadCsv(`search-volume-${marketplace}-${today()}.csv`, ["Keyword", "Monthly search volume", "Source"], items.map((i) => [i.keyword, i.search_volume, i.volume_source]))}><Download />Export CSV</Button>
                      </div></>}
                    empty={<EmptyState compact title="No volumes returned" description="DataForSEO had no Amazon data for these keywords." />} />
                </div>
              )}
      </div>
      <AddToListDialog open={!!adding} onOpenChange={(v) => !v && setAdding(null)} keywords={adding ?? []} source="volume_lookup" />
    </div>
  );
}

/* ================================================================ live SERP */
function SerpTab({ request }: { request: { k: string; n: number } | null }) {
  const { marketplace, currency } = useSession();
  const analyst = useAnalyst();
  const [kw, setKw] = React.useState("");
  const [show, setShow] = React.useState<"all" | "organic" | "sponsored">("all");
  const m = useMutation({ mutationFn: (k: string) => post<SerpResp>("/keywords/serp", { keyword: k, marketplace }) });
  React.useEffect(() => { if (request && analyst) { setKw(request.k); m.mutate(request.k); } /* eslint-disable-next-line */ }, [request]);
  const items = (m.data?.items ?? []).filter((i) => i.asin || i.title);
  let org = 0;
  const rows = items.map((i) => ({ ...i, organic_pos: i.sponsored ? null : ++org }));
  const shown = rows.filter((r) => show === "all" || (show === "sponsored" ? r.sponsored : !r.sponsored));
  const organicRevs = rows.filter((r) => !r.sponsored).slice(0, 16).map((r) => r.reviews ?? 0).sort((a, b) => a - b);
  const medRev = organicRevs.length ? organicRevs[Math.floor(organicRevs.length / 2)] : null;
  type Row = (typeof rows)[number];
  const cols: ColumnDef<Row, any>[] = [
    { id: "pos", header: "Position", accessorKey: "rank_absolute", meta: { align: "right" }, cell: ({ row: { original: r } }) => <PositionBadge pos={r.rank_absolute} sponsored={r.sponsored} /> },
    { id: "organic", header: "Organic #", accessorKey: "organic_pos", meta: { align: "right" }, cell: ({ getValue }) => getValue() ?? <span className="text-subtle">—</span> },
    { id: "type", header: "Type", accessorKey: "sponsored", cell: ({ getValue }) => getValue() ? <Badge tone="violet" size="sm">Sponsored</Badge> : <Badge size="sm">Organic</Badge> },
    { id: "title", header: "Product", accessorKey: "title", cell: ({ row: { original: r } }) => <div className="min-w-[240px] max-w-[460px]"><div className="line-clamp-2 text-[13px] font-medium">{r.title || "—"}</div>{r.asin && <div className="mt-0.5 font-mono text-2xs text-subtle">{r.asin}</div>}</div> },
    { id: "price", header: "Price", accessorKey: "price", meta: { align: "right" }, cell: ({ getValue }) => money(getValue(), currency) },
    { id: "rating", header: "Rating", accessorKey: "rating", meta: { align: "right" }, cell: ({ getValue }) => getValue() == null ? "—" : Number(getValue()).toFixed(1) },
    { id: "reviews", header: "Reviews", accessorKey: "reviews", meta: { align: "right" }, cell: ({ getValue }) => num(getValue()) },
    { id: "links", header: "", enableSorting: false, cell: ({ row: { original: r } }) => r.asin ? <div className="flex justify-end gap-1"><Button variant="ghost" size="xs" asChild><Link href={`/reverse-asin?asin=${r.asin}`}>Reverse ASIN</Link></Button><AmazonLink p={{ asin: r.asin, marketplace }} /></div> : null },
  ];
  return (
    <div className="space-y-5">
      <Card className="p-4">
        <form className="flex flex-col gap-3 md:flex-row" onSubmit={(e) => { e.preventDefault(); if (kw.trim()) m.mutate(kw.trim()); }}>
          <Input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="Keyword, e.g. memory foam mattress double" className="h-11 flex-1" aria-label="Keyword" />
          <Gate allowed={analyst}><Button type="submit" size="lg" loading={m.isPending} disabled={!kw.trim()}><Radar />Check page 1</Button></Gate>
        </form>
        <p className="mt-2 text-xs text-subtle">Live Amazon {marketplace} results, collected on request. It can take up to a minute.</p>
      </Card>
      {m.isIdle ? <Card><EmptyState icon={Radar} title="See who ranks for a keyword right now" description="Organic and sponsored positions on page 1, with prices, ratings and review counts, plus Kestrel's difficulty estimate from page-1 review walls." /></Card>
        : m.isPending ? <Card><div className="flex items-center gap-2 border-b border-line px-4 py-3 text-[13px] text-muted"><Radar className="size-4 animate-pulse text-primary" />Collecting Amazon results for “{m.variables}”. This usually takes 15–60 seconds…</div><LoadingRows rows={8} /></Card>
          : m.error ? <Card><ApiErrorView error={m.error} fallbackProvider="DataForSEO" onRetry={() => m.variables && m.mutate(m.variables)} /></Card>
            : m.data && (
              <>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <MetricCard label="Difficulty" icon={Wand2} tone={(m.data.keyword.difficulty ?? 0) >= 70 ? "danger" : (m.data.keyword.difficulty ?? 0) >= 40 ? "warning" : "success"} value={m.data.keyword.difficulty ?? "—"}
                    tooltip={`0–100. ${m.data.difficulty_method}. Higher means bigger review walls on page 1.`} source={{ classification: "estimated", provider: "Kestrel" }} />
                  <MetricCard label="Amazon results" icon={Hash} tone="cyan" value={num(m.data.keyword.result_count, { compact: true })} tooltip="Total results Amazon reports for this search." source={m.data.source} />
                  <MetricCard label="Sponsored on page" icon={Sparkles} tone="violet" value={num(rows.filter((r) => r.sponsored).length)} sub={<span>of {num(rows.length)} placements</span>} />
                  <MetricCard label="Median page-1 reviews" icon={Filter} value={num(medRev)} tooltip="Median review count of the top 16 organic results." />
                </div>
                <DataTable columns={cols} data={shown} dense getRowId={(r) => `${r.rank_absolute}-${r.asin}`} maxHeight="70vh"
                  toolbar={<><span className="text-[13px] font-medium">“{m.data.keyword.keyword}”</span><SourceBadge source={m.data.source} />
                    <div className="ml-auto flex flex-wrap gap-2">
                      <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">{(["all", "organic", "sponsored"] as const).map((v) => <button key={v} onClick={() => setShow(v)} className={cn("h-7 rounded-md px-2.5 text-xs font-medium capitalize", show === v ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg")}>{v}</button>)}</div>
                      <Button size="sm" variant="secondary" disabled={!rows.length} onClick={() => downloadCsv(`serp-${slug(m.data!.keyword.keyword)}-${marketplace}-${today()}.csv`, ["Position", "Organic position", "Sponsored", "ASIN", "Title", "Price", "Rating", "Reviews"], rows.map((r) => [r.rank_absolute, r.organic_pos, r.sponsored, r.asin, r.title, r.price, r.rating, r.reviews]))}><Download />Export CSV</Button>
                    </div></>}
                  empty={<EmptyState compact title="No products on this page" description="Amazon returned no product results for this search." />} />
              </>
            )}
    </div>
  );
}

/* ================================================================ processor */
function ProcessTab() {
  const [text, setText] = React.useState("");
  const [remove, setRemove] = React.useState("");
  const [minWords, setMinWords] = React.useState("1");
  const [dedupe, setDedupe] = React.useState(true);
  const [adding, setAdding] = React.useState<string[] | null>(null);
  const analyst = useAnalyst();
  const m = useMutation({ mutationFn: () => post<ProcessResp>("/keywords/process", { text, remove_words: splitLines(remove), min_words: Math.max(1, Number(minWords) || 1), dedupe_words: dedupe }) });
  const d = m.data;
  return (
    <div className="grid gap-4 xl:grid-cols-[400px_minmax(0,1fr)]">
      <Card className="self-start">
        <CardHeader eyebrow="Keyword processor" title="Merge, clean and de-duplicate" description="Paste keywords from any source. Kestrel normalises them, removes duplicates and words you don't want, ranks word frequency and builds a backend search-terms string." />
        <CardBody className="space-y-4">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[220px] font-mono text-xs" placeholder={"Paste keywords: one per line, or separated by commas or tabs"} aria-label="Keywords to process" />
          <Field label="Remove phrases containing" hint="Words, separated by commas. E.g. competitor brands or sizes you don't sell."><Input value={remove} onChange={(e) => setRemove(e.target.value)} placeholder="ikea, single, kids" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Minimum words"><Input type="number" min={1} max={10} value={minWords} onChange={(e) => setMinWords(e.target.value)} /></Field>
            <div className="pt-6"><Switch checked={dedupe} onCheckedChange={setDedupe} label="Unique words" description="In backend terms" /></div>
          </div>
          <Button className="w-full" loading={m.isPending} disabled={!text.trim()} onClick={() => m.mutate()}><Wand2 />Process keywords</Button>
        </CardBody>
      </Card>
      <div className="min-w-0 space-y-4">
        {m.isIdle ? <Card><EmptyState icon={Wand2} title="Nothing processed yet" description="Results show the cleaned phrase list, word and two-word frequency, and a backend search-terms string under Amazon's 249-byte limit." /></Card>
          : m.isPending ? <Card><LoadingRows rows={6} /></Card>
            : m.error ? <Card><ApiErrorView error={m.error} onRetry={() => m.mutate()} /></Card>
              : d && !d.unique_count ? <Card><EmptyState icon={Wand2} title="No keywords left after cleaning" description="Every phrase was removed by your filters or minimum word count. Loosen them and try again." /></Card>
                : d && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <MetricCard label="Phrases in" value={num(d.input_count)} />
                      <MetricCard label="Unique kept" tone="success" value={num(d.unique_count)} />
                      <MetricCard label="Removed" tone="warning" value={num(d.removed)} tooltip="Duplicates, phrases containing removed words, and phrases below the minimum word count." />
                    </div>
                    <Card>
                      <CardHeader eyebrow="Backend search terms" title={<span className="flex items-center gap-2">Generic keywords field <InfoTip content="Amazon indexes up to 249 bytes. Words are added in order of first appearance until the limit is reached. Remove brand names and words already in your title before using." /></span>}
                        action={<Button size="sm" variant="secondary" disabled={!d.backend_terms} onClick={() => copy(d.backend_terms, "Backend terms copied")}><Copy />Copy</Button>} />
                      <CardBody className="space-y-2">
                        <div className="rounded-lg border border-line bg-surface-2 p-3 font-mono text-xs leading-relaxed break-words">{d.backend_terms || <span className="text-subtle">No words available</span>}</div>
                        <div className="flex items-center gap-3"><Progress value={(d.backend_bytes / 249) * 100} tone={d.backend_bytes > 249 ? "danger" : "success"} /><span className="shrink-0 text-xs text-muted num">{d.backend_bytes} / 249 bytes</span></div>
                      </CardBody>
                    </Card>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Card>
                        <CardHeader eyebrow="Word frequency" title="Most common words" description="Stop words removed." />
                        <CardBody>{d.words.length ? <BarList rows={d.words.slice(0, 15).map((w) => ({ label: w.word, value: w.count }))} /> : <EmptyState compact title="No words" />}</CardBody>
                      </Card>
                      <Card>
                        <CardHeader eyebrow="Two-word phrases" title="Most common pairs" />
                        <CardBody>{d.bigrams.length ? <BarList rows={d.bigrams.slice(0, 15).map((w) => ({ label: w.phrase, value: w.count, tone: "cyan" }))} /> : <EmptyState compact title="No repeated pairs" description="Pairs appear when phrases share consecutive words." />}</CardBody>
                      </Card>
                    </div>
                    <Card>
                      <CardHeader eyebrow="Cleaned list" title={`${num(d.phrases.length)} unique phrases`}
                        action={<div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="ghost" onClick={() => copy(d.phrases.join("\n"), "Phrases copied")}><Copy />Copy</Button>
                          <Button size="sm" variant="ghost" onClick={() => downloadCsv(`processed-keywords-${today()}.csv`, ["Keyword"], d.phrases.map((p) => [p]))}><Download />CSV</Button>
                          <Gate allowed={analyst}><Button size="sm" variant="secondary" onClick={() => setAdding(d.phrases)}><ListPlus />Add to list</Button></Gate>
                        </div>} />
                      <CardBody><div className="max-h-72 overflow-y-auto rounded-lg border border-line bg-surface-2 p-3 font-mono text-xs leading-6">{d.phrases.map((p) => <div key={p}>{p}</div>)}</div></CardBody>
                    </Card>
                  </>
                )}
      </div>
      <AddToListDialog open={!!adding} onOpenChange={(v) => !v && setAdding(null)} keywords={adding ?? []} source="keyword_processor" />
    </div>
  );
}
