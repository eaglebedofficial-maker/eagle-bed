"use client";
/* Reverse ASIN (Cerebro-style): the keywords one or more ASINs rank for, organic vs sponsored, gaps and overlap. */
import { useMutation } from "@tanstack/react-query";
import { Download, Eraser, Filter, Hash, ListPlus, PackageSearch, ScanSearch, Sparkles, Target, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { CategoryChart } from "@/components/ui/charts";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, LoadingRows, MetricCard, PageHeader, ScorePill, SourceBadge } from "@/components/ui/data";
import { InfoTip, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Segmented } from "@/components/ui/primitives";
import { post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, num } from "@/lib/utils";
import { AddToListDialog, ApiErrorView, Gate, PositionBadge, ProductPickerDialog, downloadCsv, extractAsins, splitLines, today, useAnalyst, type Provenance } from "./common";

type Pos = { position: number | null; sponsored: boolean };
type Row = { keyword: string; search_volume: number | null; positions: Record<string, Pos>; ranking_count: number; overlap: number; best_position: number | null; opportunity: number };
type Resp = { asins: string[]; items: Row[]; gaps: Record<string, string[]>; overlap_matrix: Record<string, Record<string, number>>; source: Provenance };
type Preset = "all" | "opportunity" | "gaps" | "page2" | "top10" | "sponsored";

export function ReverseAsinPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const { marketplace } = useSession();
  const analyst = useAnalyst();
  const [chips, setChips] = React.useState<string[]>(() => extractAsins(sp.get("asin") ?? sp.get("asins") ?? "").slice(0, 10));
  const [draft, setDraft] = React.useState("");
  const [picker, setPicker] = React.useState(false);
  const [preset, setPreset] = React.useState<Preset>("all");
  const [minVol, setMinVol] = React.useState("");
  const [include, setInclude] = React.useState("");
  const [exclude, setExclude] = React.useState("");
  const [selected, setSelected] = React.useState<Row[]>([]);
  const [adding, setAdding] = React.useState<string[] | null>(null);
  const asins = Array.from(new Set([...chips, ...extractAsins(draft)]));
  const commit = (v: string) => {
    const found = extractAsins(v);
    if (found.length) { setChips((c) => Array.from(new Set([...c, ...found])).slice(0, 10)); setDraft(""); } else setDraft(v);
  };
  const m = useMutation({ mutationFn: (a: string[]) => post<Resp>("/keywords/reverse-asin", { asins: a, marketplace, limit: 300 }) });
  const ran = React.useRef(false);
  React.useEffect(() => {
    const pre = extractAsins(sp.get("asin") ?? sp.get("asins") ?? "");
    if (pre.length && analyst && !ran.current) { ran.current = true; m.mutate(pre.slice(0, 10)); }
    /* eslint-disable-next-line */
  }, [analyst]);
  const run = () => { if (!asins.length) return; const a = asins.slice(0, 10); setChips(a); setDraft(""); router.replace(`/reverse-asin?asin=${a.join(",")}`, { scroll: false }); m.mutate(a); };

  const d = m.data;
  const n = d?.asins.length ?? 0;
  const rows = React.useMemo(() => {
    if (!d) return [];
    const inc = splitLines(include.toLowerCase()), exc = splitLines(exclude.toLowerCase());
    return d.items.filter((r) => {
      const k = r.keyword.toLowerCase();
      if (minVol && (r.search_volume ?? 0) < Number(minVol)) return false;
      if (inc.length && !inc.every((t) => k.includes(t))) return false;
      if (exc.length && exc.some((t) => k.includes(t))) return false;
      const ps = Object.values(r.positions);
      switch (preset) {
        case "opportunity": return r.opportunity >= 60;
        case "gaps": return r.ranking_count < n;
        case "page2": return r.best_position != null && r.best_position > 10;
        case "top10": return r.best_position != null && r.best_position <= 10;
        case "sponsored": return ps.some((p) => p.sponsored);
        default: return true;
      }
    });
  }, [d, preset, minVol, include, exclude, n]);

  const perAsin = React.useMemo(() => (d?.asins ?? []).map((a) => {
    let organic = 0, sponsored = 0, top10 = 0;
    d!.items.forEach((r) => { const p = r.positions[a]; if (!p) return; p.sponsored ? sponsored++ : organic++; if (!p.sponsored && p.position && p.position <= 10) top10++; });
    return { asin: a, organic, sponsored, top10 };
  }), [d]);

  const columns = React.useMemo<ColumnDef<Row, any>[]>(() => {
    if (!d) return [];
    const c: ColumnDef<Row, any>[] = [
      { id: "keyword", header: "Keyword", accessorKey: "keyword", enableHiding: false, cell: ({ getValue }) => <span className="block min-w-[200px] font-medium">{getValue()}</span> },
      { id: "search_volume", header: "Search volume", accessorKey: "search_volume", meta: { align: "right" }, cell: ({ getValue }) => getValue() == null ? <span className="text-subtle">No data</span> : num(getValue()) },
    ];
    d.asins.forEach((a) => c.push({
      id: `pos_${a}`, header: a, meta: { align: "right" }, accessorFn: (r) => r.positions[a]?.position ?? 9999, sortDescFirst: false,
      cell: ({ row: { original: r } }) => {
        const p = r.positions[a];
        if (!p) return <Tooltip content="Not ranking in the keywords returned for this ASIN"><span className="text-subtle">—</span></Tooltip>;
        return <span className="inline-flex items-center gap-1">{p.sponsored && <Badge tone="violet" size="sm">S</Badge>}<PositionBadge pos={p.position} sponsored={p.sponsored} /></span>;
      },
    }));
    if (d.asins.length > 1) c.push({ id: "ranking_count", header: "Ranking", accessorKey: "ranking_count", meta: { align: "right" }, cell: ({ getValue }) => <span className="num">{getValue()}/{d.asins.length}</span> });
    c.push({ id: "best_position", header: "Best rank", accessorKey: "best_position", meta: { align: "right" }, sortDescFirst: false, cell: ({ getValue }) => getValue() == null ? "—" : <span className="num">#{getValue()}</span> });
    c.push({ id: "opportunity", header: "Opportunity", accessorKey: "opportunity", meta: { align: "right" }, cell: ({ getValue }) => <ScorePill score={getValue()} /> });
    c.push({ id: "go", header: "", enableSorting: false, enableHiding: false, cell: ({ row: { original: r } }) => <Button variant="ghost" size="xs" asChild><Link href={`/keywords?tab=research&q=${encodeURIComponent(r.keyword)}`} onClick={(e) => e.stopPropagation()}>Research</Link></Button> });
    return c;
  }, [d]);

  const exportRows = (list: Row[]) => d && downloadCsv(`reverse-asin-${d.asins.join("-")}-${marketplace}-${today()}.csv`,
    ["Keyword", "Search volume", ...d.asins.flatMap((a) => [`${a} position`, `${a} sponsored`]), "Ranking ASINs", "Best position", "Opportunity (Kestrel estimate)"],
    list.map((r) => [r.keyword, r.search_volume, ...d.asins.flatMap((a) => [r.positions[a]?.position ?? "", r.positions[a] ? r.positions[a].sponsored : ""]), r.ranking_count, r.best_position, r.opportunity]));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Keyword intelligence" title="Reverse ASIN"
        description="See every keyword a product ranks for on Amazon, organic and sponsored, then compare up to 10 ASINs to find keyword gaps and shared terms."
        actions={<Button variant="secondary" asChild><Link href="/keywords"><Hash />Keyword Research</Link></Button>} />

      <Card className="p-4">
        <form className="flex flex-col gap-3 lg:flex-row" onSubmit={(e) => { e.preventDefault(); run(); }}>
          <div className="flex min-h-12 min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
            <ScanSearch className="size-5 shrink-0 text-subtle" />
            {chips.map((a) => <Badge key={a} tone="primary" className="font-mono">{a}<button type="button" aria-label={`Remove ${a}`} onClick={() => setChips(chips.filter((x) => x !== a))}><X className="size-3" /></button></Badge>)}
            <input value={draft} onChange={(e) => /[\s,;]$/.test(e.target.value) ? commit(e.target.value) : setDraft(e.target.value)} onBlur={() => draft && commit(draft)}
              onPaste={(e) => { e.preventDefault(); commit(draft + " " + e.clipboardData.getData("text")); }}
              onKeyDown={(e) => { if (e.key === "Backspace" && !draft && chips.length) setChips(chips.slice(0, -1)); }}
              placeholder={chips.length ? "Add more ASINs or Amazon URLs" : "ASINs or Amazon URLs, separated by commas (up to 10)"}
              className="h-8 min-w-[200px] flex-1 bg-transparent text-sm text-fg placeholder:text-subtle focus:outline-none" aria-label="ASINs" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="lg" onClick={() => setPicker(true)}><PackageSearch />From workspace</Button>
            <Gate allowed={analyst}><Button type="submit" size="lg" loading={m.isPending} disabled={!asins.length}><ScanSearch />Find keywords</Button></Gate>
          </div>
        </form>
        {asins.length > 10 ? <p className="mt-2 text-xs text-warning">Only the first 10 ASINs will be analysed.</p>
          : draft.trim() && !extractAsins(draft).length ? <p className="mt-2 text-xs text-subtle">Enter a 10-character ASIN (e.g. B0ABC12345) or paste an Amazon product URL.</p> : null}
      </Card>

      {m.isIdle ? (
        <Card><EmptyState icon={ScanSearch} title="Enter one or more ASINs" description={`Kestrel asks DataForSEO which Amazon ${marketplace} searches each ASIN appears in, and where. With several ASINs you'll see who ranks for what, and where your gaps are.`}
          action={<Button variant="secondary" onClick={() => setPicker(true)}><PackageSearch />Choose from your products</Button>} /></Card>
      ) : m.isPending ? (
        <Card><div className="flex items-center gap-2 border-b border-line px-4 py-3 text-[13px] text-muted"><Sparkles className="size-4 animate-pulse text-primary" />Pulling ranked keywords for {m.variables?.join(", ")}…</div><LoadingRows rows={8} /></Card>
      ) : m.error ? (
        <Card><ApiErrorView error={m.error} fallbackProvider="DataForSEO" onRetry={() => m.variables && m.mutate(m.variables)} /></Card>
      ) : d && !d.items.length ? (
        <Card><EmptyState icon={ScanSearch} title="No ranking keywords found" description="DataForSEO has no keyword rankings for these ASINs in this marketplace. Newer or low-traffic listings often have none yet; check the marketplace selector too." /></Card>
      ) : d && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Ranking keywords" icon={Hash} value={num(d.items.length)} source={d.source} />
            <MetricCard label="Combined search volume" icon={TrendingUp} tone="cyan" value={num(d.items.reduce((a, r) => a + (r.search_volume ?? 0), 0), { compact: true })} tooltip="Monthly Amazon searches across all keywords found." />
            <MetricCard label="Top-10 organic keywords" icon={Target} tone="success" value={num(d.items.filter((r) => Object.values(r.positions).some((p) => !p.sponsored && p.position && p.position <= 10)).length)} />
            {n > 1 ? <MetricCard label="Shared by all ASINs" icon={Filter} tone="violet" value={num(d.items.filter((r) => r.ranking_count === n).length)} />
              : <MetricCard label="Sponsored placements" icon={Sparkles} tone="violet" value={num(perAsin[0]?.sponsored)} />}
          </div>

          <div className={cn("grid gap-4", n > 1 && "xl:grid-cols-2")}>
            <Card>
              <CardHeader eyebrow="Organic vs sponsored" title="Where each ASIN shows up" description="Count of keywords where the ASIN appears organically or as a sponsored placement." action={<SourceBadge source={d.source} />} />
              <CardBody><CategoryChart height={Math.max(160, n * 44)} horizontal stacked data={perAsin} x="asin" series={[{ key: "organic", label: "Organic", tone: "primary" }, { key: "sponsored", label: "Sponsored", tone: "violet" }]} valueFormat={(v) => num(v)} /></CardBody>
            </Card>
            {n > 1 && (
              <Card>
                <CardHeader eyebrow="Keyword overlap" title="Shared keywords between ASINs" description="Each cell counts keywords both ASINs rank for. The diagonal is each ASIN's total." />
                <CardBody className="overflow-x-auto">
                  <table className="w-full min-w-[360px] text-[12px]">
                    <thead><tr><th />{d.asins.map((a) => <th key={a} className="px-1.5 pb-2 text-right font-mono text-2xs font-medium text-subtle">{a}</th>)}</tr></thead>
                    <tbody>{d.asins.map((a) => {
                      const max = d.overlap_matrix[a]?.[a] || 1;
                      return (
                        <tr key={a}><td className="py-1 pr-2 font-mono text-2xs text-subtle">{a}</td>
                          {d.asins.map((b) => { const v = d.overlap_matrix[a]?.[b] ?? 0; return <td key={b} className="p-0.5"><div className="rounded-md px-2 py-1.5 text-right num" style={{ background: `rgb(var(--primary) / ${a === b ? 0.06 : Math.min(0.5, (v / max) * 0.5)})` }}>{num(v)}</div></td>; })}
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </CardBody>
              </Card>
            )}
          </div>

          {n > 1 && (
            <Card>
              <CardHeader eyebrow="Keyword gaps" title="High-volume keywords each ASIN is missing" description="Keywords at least one other ASIN ranks for, highest volume first." />
              <CardBody className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {d.asins.map((a) => {
                  const g = d.gaps[a] ?? [];
                  return (
                    <div key={a} className="rounded-xl border border-line p-3">
                      <div className="mb-2 flex items-center justify-between gap-2"><span className="font-mono text-xs font-medium">{a}</span>
                        <Gate allowed={analyst}><Button size="xs" variant="ghost" disabled={!g.length} onClick={() => setAdding(g)}><ListPlus />Save {g.length}</Button></Gate></div>
                      {g.length ? <div className="flex flex-wrap gap-1.5">{g.slice(0, 14).map((k) => <span key={k} className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted">{k}</span>)}{g.length > 14 && <span className="px-1 text-xs text-subtle">+{g.length - 14} more</span>}</div>
                        : <p className="text-xs text-muted">No gaps. This ASIN ranks for every keyword found.</p>}
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          )}

          <Card className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Segmented value={preset} onChange={setPreset} options={[
                { value: "all", label: "All" }, { value: "opportunity", label: "Opportunities" }, ...(n > 1 ? [{ value: "gaps" as Preset, label: "Gaps" }] : []),
                { value: "page2", label: "Page 2+" }, { value: "top10", label: "Top 10" }, { value: "sponsored", label: "Sponsored" },
              ]} />
              <InfoTip content="Opportunity is Kestrel's 0–100 estimate: higher search volume, keywords not every ASIN ranks for, and best rank beyond page 1 all raise it. Opportunities shows 60+." />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Min search volume"><Input type="number" min={0} value={minVol} onChange={(e) => setMinVol(e.target.value)} placeholder="0" /></Field>
              <Field label="Include terms"><Input value={include} onChange={(e) => setInclude(e.target.value)} placeholder="e.g. double" /></Field>
              <Field label="Exclude terms"><Input value={exclude} onChange={(e) => setExclude(e.target.value)} placeholder="e.g. brand names" /></Field>
            </div>
          </Card>

          <DataTable columns={columns} data={rows} selectable onSelectionChange={setSelected} getRowId={(r) => r.keyword} dense maxHeight="72vh"
            toolbar={<>
              <span className="text-[13px] font-medium num">{num(rows.length)} keywords</span><SourceBadge source={d.source} />
              <span className="hidden items-center gap-1 text-2xs text-subtle sm:inline-flex"><Badge tone="violet" size="sm">S</Badge>sponsored placement</span>
              <div className="ml-auto flex flex-wrap gap-2">
                <Gate allowed={analyst}><Button size="sm" variant="secondary" disabled={!rows.length} onClick={() => setAdding((selected.length ? selected : rows).map((r) => r.keyword))}><ListPlus />{selected.length ? `Add ${selected.length} to list` : "Add all to list"}</Button></Gate>
                <Button size="sm" variant="secondary" disabled={!rows.length} onClick={() => exportRows(selected.length ? selected : rows)}><Download />{selected.length ? "Export selected" : "Export CSV"}</Button>
              </div>
            </>}
            empty={<EmptyState compact icon={Filter} title="No keywords match" action={<Button variant="secondary" onClick={() => { setPreset("all"); setMinVol(""); setInclude(""); setExclude(""); }}><Eraser />Reset filters</Button>} />} />
        </>
      )}
      <ProductPickerDialog open={picker} onOpenChange={setPicker} multiple max={10} title="Choose up to 10 products" confirmLabel="Use these ASINs"
        onPick={(ps) => setChips((c) => Array.from(new Set([...c, ...ps.map((p) => p.asin)])).slice(0, 10))} />
      <AddToListDialog open={!!adding} onOpenChange={(v) => !v && setAdding(null)} keywords={adding ?? []} source="reverse_asin" />
    </div>
  );
}
