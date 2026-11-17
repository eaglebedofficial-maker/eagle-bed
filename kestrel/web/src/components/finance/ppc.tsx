"use client";
/* PPC Analytics from the user's Sponsored Products reports (/ppc, /ppc/import). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, Megaphone, MousePointerClick, Percent, ShoppingBag, Target, TrendingUp, Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { RangeButtons, SeriesToggle, TimeChart, type SeriesDef } from "@/components/ui/charts";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, ErrorState, MetricCard, PageHeader, SourceBadge, Stat } from "@/components/ui/data";
import { Dialog, InfoTip, TabPanel, Tabs } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Skeleton, Switch } from "@/components/ui/primitives";
import { errorMessage, get } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, dateShort, money, num, pct } from "@/lib/utils";
import { FilePick, Notice, NumInput, postForm, RoleGate, toNum, useDebounced } from "./shared";

type Agg = { impressions: number; clicks: number; spend: number; sales: number; orders: number; acos: number | null; roas: number | null; cpc: number | null; ctr: number | null; cvr: number | null };
type Term = Agg & { term: string; match_type: string; campaign: string };
type Resp =
  | { available: false; reason: string }
  | { available: true; period: { from: string; to: string }; totals: Agg & { tacos: number | null }; campaigns: (Agg & { campaign: string })[]; search_terms: Term[];
      daily: (Agg & { date: string })[]; wasted_spend: Term[]; harvest: Term[]; wasted_total: number; classification: string };

function metricCols<T extends Agg>(currency: string, target: number): ColumnDef<T>[] {
  return [
    { header: "Impr.", accessorKey: "impressions", meta: { align: "right" }, cell: ({ getValue }) => num(getValue() as number, { compact: true }) },
    { header: "Clicks", accessorKey: "clicks", meta: { align: "right" }, cell: ({ getValue }) => num(getValue() as number) },
    { header: "CTR", accessorKey: "ctr", meta: { align: "right" }, cell: ({ getValue }) => pct(getValue() as number | null, 2) },
    { header: "Spend", accessorKey: "spend", meta: { align: "right" }, cell: ({ getValue }) => money(getValue() as number, currency) },
    { header: "Sales", accessorKey: "sales", meta: { align: "right" }, cell: ({ getValue }) => money(getValue() as number, currency) },
    { header: "Orders", accessorKey: "orders", meta: { align: "right" }, cell: ({ getValue }) => num(getValue() as number) },
    { header: "ACoS", accessorKey: "acos", meta: { align: "right" }, sortingFn: (a, b) => (a.original.acos ?? 1e9) - (b.original.acos ?? 1e9), cell: ({ getValue }) => { const v = getValue() as number | null; return <span className={cn(v != null && v > target && "text-danger", v != null && v <= target && "font-medium")}>{v == null ? "—" : pct(v, 1)}</span>; } },
    { header: "ROAS", accessorKey: "roas", meta: { align: "right" }, cell: ({ getValue }) => { const v = getValue() as number | null; return v == null ? "—" : `${v.toFixed(2)}×`; } },
    { header: "CPC", accessorKey: "cpc", meta: { align: "right" }, cell: ({ getValue }) => money(getValue() as number | null, currency) },
    { header: "CVR", accessorKey: "cvr", meta: { align: "right" }, cell: ({ getValue }) => pct(getValue() as number | null, 1) },
  ];
}

export function PpcAnalytics() {
  const qc = useQueryClient();
  const { currency, can } = useSession();
  const [days, setDays] = React.useState(30);
  const [target, setTarget] = React.useState("25");
  const targetN = toNum(target) ?? 25;
  const dTarget = useDebounced(targetN, 400);
  const q = useQuery({ queryKey: ["ppc", days, dTarget], queryFn: () => get<Resp>("/ppc", { days, target_acos: dTarget }) });
  const [tab, setTab] = React.useState("campaigns");
  const [importOpen, setImportOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [replace, setReplace] = React.useState(true);
  const [series, setSeries] = React.useState<SeriesDef[]>([
    { key: "spend", label: "Spend", tone: "warning", type: "bar" }, { key: "sales", label: "Ad sales", tone: "primary", type: "area" }, { key: "acos", label: "ACoS %", tone: "violet", axis: "right" },
  ]);
  const imp = useMutation({
    mutationFn: () => { const fd = new FormData(); fd.append("file", file!); fd.append("replace", String(replace)); return postForm<{ imported: number }>("/ppc/import", fd); },
    onSuccess: (r) => { toast.success(`Imported ${num(r.imported)} rows`); setImportOpen(false); setFile(null); qc.invalidateQueries({ queryKey: ["ppc"] }); qc.invalidateQueries({ queryKey: ["sales"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const d = q.data;
  const ok = d && d.available ? d : null;
  const termCols = React.useMemo<ColumnDef<Term>[]>(() => [
    { header: "Search term / target", accessorKey: "term", cell: ({ row: { original: t } }) => <div className="min-w-[220px] max-w-[340px]"><div className="truncate font-medium">{t.term || "—"}</div><div className="truncate text-2xs text-subtle">{t.campaign}</div></div> },
    { header: "Match", accessorKey: "match_type", cell: ({ getValue }) => getValue() ? <Badge size="sm" className="capitalize">{String(getValue()).toLowerCase()}</Badge> : <span className="text-subtle">—</span> },
    ...metricCols<Term>(currency, targetN),
  ], [currency, targetN]);
  const campCols = React.useMemo<ColumnDef<Agg & { campaign: string }>[]>(() => [
    { header: "Campaign", accessorKey: "campaign", cell: ({ getValue }) => <div className="min-w-[200px] max-w-[340px] truncate font-medium">{(getValue() as string) || "(unnamed)"}</div> },
    ...metricCols<Agg & { campaign: string }>(currency, targetN),
  ], [currency, targetN]);
  const chart = (ok?.daily ?? []).map((r) => ({ t: Date.parse(r.date), spend: r.spend, sales: r.sales, acos: r.acos }));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Financial tools" title="PPC Analytics"
        description="ACoS, TACoS and ROAS from your own Sponsored Products reports, with wasted spend and keywords worth harvesting."
        actions={<>
          <RangeButtons value={days} onChange={setDays} options={[{ value: 7, label: "7d" }, { value: 14, label: "14d" }, { value: 30, label: "30d" }, { value: 60, label: "60d" }, { value: 90, label: "90d" }]} />
          <RoleGate>{(a) => <Button disabled={!a} onClick={() => setImportOpen(true)}><Upload />Import report</Button>}</RoleGate>
        </>} />

      {q.isLoading ? (
        <div className="space-y-4"><div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[112px]" />)}</div><Skeleton className="h-[340px] w-full" /></div>
      ) : q.error ? <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card> : !ok ? (
        <Card>
          <EmptyState icon={Megaphone} title="No advertising data yet" description={<>{d && !d.available ? d.reason : ""} Download a Sponsored Products Search Term or Campaign report (daily) from Amazon Ads → Reports and import it here.</>}
            action={can("analyst") ? <Button onClick={() => setImportOpen(true)}><Upload />Import report</Button> : undefined} />
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted"><SourceBadge classification={ok.classification} /><span>{dateShort(ok.period.from)} – {dateShort(ok.period.to)}</span><span>·</span><span>From your imported advertising reports</span></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <MetricCard label="Ad spend" icon={Coins} tone="warning" value={money(ok.totals.spend, currency, { compact: true })} />
            <MetricCard label="Ad sales" icon={ShoppingBag} value={money(ok.totals.sales, currency, { compact: true })} sub={<span className="num">{num(ok.totals.orders)} orders</span>} />
            <MetricCard label="ACoS" icon={Percent} tone={ok.totals.acos != null && ok.totals.acos > targetN ? "danger" : "success"} value={pct(ok.totals.acos, 1)} tooltip="Ad spend ÷ ad-attributed sales." sub={`target ${pct(targetN, 0)}`} />
            <MetricCard label="ROAS" icon={TrendingUp} tone="cyan" value={ok.totals.roas == null ? "—" : `${ok.totals.roas.toFixed(2)}×`} tooltip="Ad-attributed sales ÷ ad spend." />
            <MetricCard label="TACoS" icon={Target} tone="violet" value={pct(ok.totals.tacos, 1)} tooltip="Ad spend ÷ total sales imported in Sales Analytics for the same period." sub={ok.totals.tacos == null ? "Import sales to see TACoS" : undefined} />
            <MetricCard label="Wasted spend" icon={MousePointerClick} tone="danger" value={money(ok.wasted_total, currency, { compact: true })} tooltip="Spend on search terms with 10+ clicks and no orders (top 50)." />
          </div>

          <Card>
            <CardHeader title="Daily performance" action={<SeriesToggle series={series} onToggle={(k) => setSeries((s) => s.map((x) => (x.key === k ? { ...x, hidden: !x.hidden } : x)))} />} />
            <CardBody>
              {chart.length > 1 ? (
                <TimeChart data={chart} series={series} height={300} leftFormat={(v) => money(v, currency, { compact: true, decimals: 0 })} rightFormat={(v) => `${Math.round(v)}%`}
                  valueFormat={(v, k) => (k === "acos" ? pct(v, 1) : money(v, currency))} reference={series.find((s) => s.key === "acos" && !s.hidden) ? { y: targetN, label: `Target ${targetN}%`, axis: "right" } : undefined} />
              ) : <EmptyState compact title="Not enough days to chart" description="Import a report covering more than one day." />}
              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-line pt-4">
                <Stat label="CPC" value={money(ok.totals.cpc, currency)} />
                <Stat label="CTR" value={pct(ok.totals.ctr, 2)} />
                <Stat label="Conversion rate" value={pct(ok.totals.cvr, 1)} />
              </div>
            </CardBody>
          </Card>

          <Tabs value={tab} onValueChange={setTab} tabs={[
            { value: "campaigns", label: "Campaigns", count: ok.campaigns.length }, { value: "terms", label: "Search terms", count: ok.search_terms.length },
            { value: "wasted", label: "Wasted spend", count: ok.wasted_spend.length }, { value: "harvest", label: "Harvest", count: ok.harvest.length },
          ]}>
            <TabPanel value="campaigns">
              <DataTable columns={campCols} data={ok.campaigns} getRowId={(c) => c.campaign} storageKey="ppc-campaigns" dense
                toolbar={<div className="flex items-center gap-2"><span className="text-[13px] text-muted">Target ACoS</span><NumInput value={target} onChange={setTarget} suffix="%" className="w-24" aria-label="Target ACoS" /></div>}
                empty={<EmptyState compact title="No campaigns in this period" />} />
            </TabPanel>
            <TabPanel value="terms">
              <DataTable columns={termCols} data={ok.search_terms} getRowId={(t) => `${t.term}|${t.match_type}|${t.campaign}`} storageKey="ppc-terms" dense
                toolbar={<span className="text-xs text-muted">Top 500 by spend</span>} empty={<EmptyState compact title="No search terms in this period" />} />
            </TabPanel>
            <TabPanel value="wasted" className="space-y-3">
              <Notice tone="warning">Terms with at least 10 clicks and no orders. Consider adding them as negative keywords — check relevance first, as some convert outside the attribution window.</Notice>
              <DataTable columns={termCols} data={ok.wasted_spend} getRowId={(t) => `${t.term}|${t.match_type}|${t.campaign}`} dense
                empty={<EmptyState compact title="No wasted spend found" description="No term reached 10 clicks without an order in this period." />} />
            </TabPanel>
            <TabPanel value="harvest" className="space-y-3">
              <Notice>Terms with 2+ orders at or below your target ACoS ({pct(targetN, 0)}) that aren't yet exact match — candidates for their own exact-match campaign.</Notice>
              <DataTable columns={termCols} data={ok.harvest} getRowId={(t) => `${t.term}|${t.match_type}|${t.campaign}`} dense
                empty={<EmptyState compact title="No harvest candidates" description="Try a higher target ACoS or a longer period." />} />
            </TabPanel>
          </Tabs>
        </>
      )}

      <Dialog open={importOpen} onOpenChange={(v) => { setImportOpen(v); if (!v) setFile(null); }} title="Import advertising report"
        description="Sponsored Products Search Term or Campaign report with a daily time unit, as CSV or XLSX."
        footer={<><Button variant="secondary" onClick={() => setImportOpen(false)}>Cancel</Button><Button disabled={!file} loading={imp.isPending} onClick={() => imp.mutate()}><Upload />Import</Button></>}>
        <div className="space-y-4">
          <FilePick file={file} onFile={setFile} />
          <Switch checked={replace} onCheckedChange={setReplace} label="Replace existing rows for these dates" description="Recommended when re-importing an overlapping period, so days aren't counted twice." />
          <Field label={<span className="inline-flex items-center gap-1.5">Recognised columns<InfoTip content="Matching is case-insensitive." /></span>}>
            <p className="text-xs text-subtle">Date, Campaign Name, Ad Group Name, Targeting, Match Type, Customer Search Term, Impressions, Clicks, Spend, 7/14 Day Total Sales, 7/14 Day Total Orders.</p>
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
