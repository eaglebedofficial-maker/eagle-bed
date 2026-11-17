"use client";
/* Sales Analytics: actual sales from the seller's own reports or SP-API (/sales, /sales/import, /sales/sync). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, Boxes, LineChart, Megaphone, Percent, Receipt, Undo2, Upload, Wallet } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { CategoryChart, RangeButtons, SeriesToggle, TimeChart, type SeriesDef } from "@/components/ui/charts";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, ErrorState, MetricCard, PageHeader, SourceBadge } from "@/components/ui/data";
import { Dialog } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Skeleton, Switch } from "@/components/ui/primitives";
import { errorMessage, get } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, money, num, pct } from "@/lib/utils";
import { classifyOpsSource, FilePick, Notice, postForm, RoleGate, SOURCE_LABEL, SyncButton } from "./shared";

type Fin = { units: number; revenue: number; fees: number; refunds: number; cogs: number; profit: number; margin: number | null; roi: number | null };
type Prod = Fin & { sku: string; title: string; asin: string; sessions: number };
type Resp =
  | { available: false; reason: string }
  | { available: true; totals: Fin & { ad_spend: number; tacos: number | null; profit_after_ads: number }; daily: (Fin & { date: string })[]; products: Prod[]; sources: string[]; classification: string; cogs_note: string };

export function SalesAnalytics() {
  const qc = useQueryClient();
  const { currency, marketplace, can } = useSession();
  const [days, setDays] = React.useState(90);
  const q = useQuery({ queryKey: ["sales", days], queryFn: () => get<Resp>("/sales", { days }) });
  const [importOpen, setImportOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [periodEnd, setPeriodEnd] = React.useState("");
  const [replace, setReplace] = React.useState(false);
  const [series, setSeries] = React.useState<SeriesDef[]>([
    { key: "revenue", label: "Revenue", tone: "primary", type: "area" }, { key: "profit", label: "Profit", tone: "success" }, { key: "units", label: "Units", tone: "cyan", type: "bar", axis: "right" },
  ]);
  const imp = useMutation({
    mutationFn: () => { const fd = new FormData(); fd.append("file", file!); fd.append("period_end", periodEnd); fd.append("replace", String(replace)); return postForm<{ imported: number; source: string | null }>("/sales/import", fd); },
    onSuccess: (r) => {
      toast.success(`Imported ${num(r.imported)} rows`, { description: r.source ? `Detected: ${SOURCE_LABEL[r.source] ?? r.source}` : undefined });
      setImportOpen(false); setFile(null); qc.invalidateQueries({ queryKey: ["sales"] }); qc.invalidateQueries({ queryKey: ["inventory"] }); qc.invalidateQueries({ queryKey: ["ppc"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const d = q.data;
  const ok = d && d.available ? d : null;
  const m = (v: number | null | undefined, compact = false) => money(v, currency, { compact });
  const chart = (ok?.daily ?? []).map((r) => ({ t: Date.parse(r.date), revenue: r.revenue, profit: r.profit, units: r.units }));
  const hasFees = !!ok && ok.totals.fees > 0;
  const classes = [...new Set((ok?.sources ?? []).map(classifyOpsSource))];

  const cols = React.useMemo<ColumnDef<Prod>[]>(() => [
    { header: "Product", accessorKey: "sku", cell: ({ row: { original: p } }) => <div className="min-w-[220px] max-w-[340px]"><div className="truncate font-medium">{p.title || p.sku || p.asin}</div><div className="flex gap-1.5 font-mono text-2xs text-subtle"><span>{p.sku}</span>{p.asin && <span>· {p.asin}</span>}</div></div> },
    { header: "Units", accessorKey: "units", meta: { align: "right" }, cell: ({ getValue }) => num(getValue() as number) },
    { header: "Revenue", accessorKey: "revenue", meta: { align: "right" }, cell: ({ getValue }) => <span className="font-medium">{money(getValue() as number, currency)}</span> },
    { header: "Amazon fees", accessorKey: "fees", meta: { align: "right" }, cell: ({ getValue }) => money(getValue() as number, currency) },
    { header: "Refunds", accessorKey: "refunds", meta: { align: "right" }, cell: ({ getValue }) => money(getValue() as number, currency) },
    { header: "COGS", accessorKey: "cogs", meta: { align: "right" }, cell: ({ getValue }) => (getValue() as number) ? money(getValue() as number, currency) : <span className="text-subtle">—</span> },
    { header: "Profit", accessorKey: "profit", meta: { align: "right" }, cell: ({ getValue }) => <span className={cn("font-medium", (getValue() as number) < 0 && "text-danger")}>{money(getValue() as number, currency)}</span> },
    { header: "Margin", accessorKey: "margin", meta: { align: "right" }, cell: ({ getValue }) => pct(getValue() as number | null, 1) },
    { header: "Sessions", accessorKey: "sessions", meta: { align: "right" }, cell: ({ getValue }) => (getValue() as number) ? num(getValue() as number) : <span className="text-subtle">—</span> },
  ], [currency]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Financial tools" title="Sales Analytics"
        description="Your actual revenue, units and profit from Seller Central reports or the Selling Partner API — not estimates."
        actions={<>
          <RangeButtons value={days} onChange={setDays} options={[{ value: 30, label: "30d" }, { value: 90, label: "90d" }, { value: 180, label: "180d" }, { value: 365, label: "1y" }]} />
          <SyncButton path="/sales/sync" params={{ marketplace, days: Math.min(days, 90) }} invalidate={[["sales"], ["inventory"]]} onDone={(r) => `Synced ${num(r.synced)} days of order metrics`} />
          <RoleGate>{(a) => <Button disabled={!a} onClick={() => setImportOpen(true)}><Upload />Import report</Button>}</RoleGate>
        </>} />

      {q.isLoading ? (
        <div className="space-y-4"><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[112px]" />)}</div><Skeleton className="h-[340px] w-full" /></div>
      ) : q.error ? <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card> : !ok ? (
        <Card>
          <EmptyState icon={LineChart} title="No sales in this period" description={<>{d && !d.available ? d.reason : ""} Import an All Orders report, a Business Report (Detail Page Sales and Traffic by Child Item) or a settlement flat file — or sync order metrics from SP-API.</>}
            action={<>{can("analyst") && <Button onClick={() => setImportOpen(true)}><Upload />Import report</Button>}{days < 365 && <Button variant="secondary" onClick={() => setDays(365)}>Look back 1 year</Button>}</>} />
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            {classes.map((c) => <SourceBadge key={c} classification={c} />)}
            <span>Sources:</span>{ok.sources.map((s) => <Badge key={s} size="sm">{SOURCE_LABEL[s] ?? s}</Badge>)}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricCard label="Revenue" icon={Banknote} value={m(ok.totals.revenue, true)} trend={ok.daily.map((x) => x.revenue)} />
            <MetricCard label="Units sold" icon={Boxes} tone="cyan" value={num(ok.totals.units)} trend={ok.daily.map((x) => x.units)} />
            <MetricCard label="Profit before ads" icon={Wallet} tone={ok.totals.profit < 0 ? "danger" : "success"} value={m(ok.totals.profit, true)} sub={<span className="num">{pct(ok.totals.margin, 1)} margin</span>}
              tooltip="Revenue − Amazon fees − refunds − COGS, from your reports." />
            <MetricCard label="Profit after ads" icon={Wallet} tone={ok.totals.profit_after_ads < 0 ? "danger" : "violet"} value={m(ok.totals.profit_after_ads, true)} tooltip="Profit before ads minus ad spend imported in PPC Analytics." />
            <MetricCard label="Amazon fees" icon={Receipt} tone="warning" value={m(ok.totals.fees, true)} sub={!hasFees ? "Settlement reports only" : undefined} />
            <MetricCard label="Refunds" icon={Undo2} tone="danger" value={m(ok.totals.refunds, true)} />
            <MetricCard label="Ad spend" icon={Megaphone} tone="warning" value={m(ok.totals.ad_spend, true)} href="/ppc" />
            <MetricCard label="TACoS" icon={Percent} tone="cyan" value={pct(ok.totals.tacos, 1)} tooltip="Ad spend ÷ total revenue." />
          </div>
          {(!hasFees || ok.totals.cogs === 0) && (
            <Notice tone="warning">
              {!hasFees && <>Amazon fees only come from settlement reports, so profit is overstated until you import one. </>}
              {ok.totals.cogs === 0 && <>No COGS yet — add unit costs in the <Link href="/inventory" className="underline">Inventory Manager</Link>. </>}
              {ok.cogs_note}
            </Notice>
          )}

          <Card>
            <CardHeader title="Revenue, profit and units by day" action={<SeriesToggle series={series} onToggle={(k) => setSeries((s) => s.map((x) => (x.key === k ? { ...x, hidden: !x.hidden } : x)))} />} />
            <CardBody>
              {chart.length > 1 ? <TimeChart data={chart} series={series} height={300} brush={chart.length > 45} leftFormat={(v) => money(v, currency, { compact: true, decimals: 0 })} rightFormat={(v) => num(v, { compact: true })}
                valueFormat={(v, k) => (k === "units" ? num(v) : money(v, currency))} />
                : <EmptyState compact title="One day of data" description="Business Reports have no per-day rows — import All Orders or settlement reports for a daily trend." />}
            </CardBody>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <Card>
              <CardHeader title="Top products by revenue" />
              <CardBody>
                <CategoryChart horizontal height={Math.max(160, Math.min(8, ok.products.length) * 36)} x="label" series={[{ key: "revenue", label: "Revenue", tone: "primary" }]}
                  data={ok.products.slice(0, 8).map((p) => { const l = p.title || p.sku || p.asin; return { label: l.length > 22 ? l.slice(0, 21) + "…" : l, revenue: p.revenue }; })}
                  valueFormat={(v) => money(v, currency, { compact: true, decimals: 0 })} />
              </CardBody>
            </Card>
            <DataTable columns={cols} data={ok.products} getRowId={(p) => p.sku || p.asin} storageKey="sales-products" dense toolbar={<span className="text-sm font-semibold">By product</span>}
              empty={<EmptyState compact title="No products" />} />
          </div>
        </>
      )}

      <Dialog open={importOpen} onOpenChange={(v) => { setImportOpen(v); if (!v) setFile(null); }} title="Import sales report"
        description="The report type is detected from its columns. Data stays in your workspace and is classified as your own data."
        footer={<><Button variant="secondary" onClick={() => setImportOpen(false)}>Cancel</Button><Button disabled={!file} loading={imp.isPending} onClick={() => imp.mutate()}><Upload />Import</Button></>}>
        <div className="space-y-4">
          <FilePick file={file} onFile={setFile} />
          <ul className="space-y-1 text-xs text-subtle">
            <li><b className="text-muted">All Orders report</b> — daily units and revenue per SKU (cancelled orders skipped).</li>
            <li><b className="text-muted">Business Report</b> (by child item) — units, revenue and sessions for the whole period.</li>
            <li><b className="text-muted">Settlement flat file (v2)</b> — revenue, Amazon fees and refunds per day.</li>
          </ul>
          <Field label="Period end date" hint="Business Reports only — rows are dated to this day. Blank uses today.">
            <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="sm:w-56" />
          </Field>
          <Switch checked={replace} onCheckedChange={setReplace} label="Replace earlier imports of the same report type" description="Removes previously imported rows from the same source before adding these." />
        </div>
      </Dialog>
    </div>
  );
}
