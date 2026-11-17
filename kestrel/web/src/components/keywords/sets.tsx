"use client";
/* Product sets: competitor sets (Competitor Analysis) and market sets (Market Tracker). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, ArrowDownRight, ArrowUpRight, Boxes, Coins, DollarSign, PackageSearch, Plus, Radar, Star, Target, Trash2, TrendingUp, Users } from "lucide-react";
import * as React from "react";
import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip as RTooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import { toast } from "sonner";
import { CompetitionBadge, ProductCell, UnitsCell, type ProductBrief } from "@/components/app/product";
import { CategoryChart, Donut, PALETTE, RangeButtons, TrendArea, tokenColor } from "@/components/ui/charts";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { BarList, EmptyState, LoadingRows, MetricCard, PageHeader, ScorePill, SourceBadge } from "@/components/ui/data";
import { ConfirmDialog, Dialog, InfoTip } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Segmented, Skeleton } from "@/components/ui/primitives";
import { del, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, cn, dateShort, money, num } from "@/lib/utils";
import { ApiErrorView, Gate, ProductPickerDialog, downloadCsv, slug, today, useAnalyst } from "./common";

type Kind = "competitor_set" | "market";
type SetRow = { id: number; name: string; kind: Kind; count: number; created_at: string };
type SetProduct = ProductBrief & { share: number | null };
type Change = { product_id: number; asin: string; title: string; at: string; type: "price" | "sellers" | "reviews"; from: number; to: number };
type SetDetail = {
  id: number; name: string; kind: Kind; products: SetProduct[]; total_revenue: number; changes: Change[]; revenue_series: Record<string, string | number>[];
  classification: string; basis: string;
};

const CONF: Record<Kind, { max: number; noun: string; plural: string; eyebrow: string; title: string; description: string; emptyTitle: string; emptyText: string; icon: typeof Target }> = {
  competitor_set: {
    max: 10, noun: "competitor set", plural: "Competitor sets", eyebrow: "Competitor intelligence", title: "Competitor Analysis", icon: Target,
    description: "Group up to 10 rival products to compare price, rating, reviews and estimated revenue share, and see every price, seller and review change as it happens.",
    emptyTitle: "Create your first competitor set", emptyText: "Pick up to 10 products from your workspace, including your own, to compare them side by side. Products need to be researched or imported first.",
  },
  market: {
    max: 50, noun: "market", plural: "Markets", eyebrow: "Competitor intelligence", title: "Market Tracker", icon: Radar,
    description: "Define a market segment as a set of products, then watch each product's share of estimated revenue and total demand change over time.",
    emptyTitle: "Track your first market", emptyText: "Choose the products that make up a segment, such as the top 20 for “ottoman bed double”. Kestrel tracks them daily and charts share over time.",
  },
};

const BASIS = (d: SetDetail) => ({ classification: "estimated", provider: "Kestrel estimates", note: d.basis });

/* ================================================================ shell */
export function SetsPage({ kind }: { kind: Kind }) {
  const c = CONF[kind];
  const analyst = useAnalyst();
  const sets = useQuery({ queryKey: ["sets", kind], queryFn: () => get<SetRow[]>("/sets", { kind }) });
  const [active, setActive] = React.useState<number | null>(null);
  const [creating, setCreating] = React.useState(false);
  React.useEffect(() => { if (sets.data?.length && (active == null || !sets.data.some((s) => s.id === active))) setActive(sets.data[0].id); }, [sets.data, active]);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description}
        actions={<Gate allowed={analyst}><Button onClick={() => setCreating(true)}><Plus />New {c.noun}</Button></Gate>} />
      {sets.error ? <Card><ApiErrorView error={sets.error} onRetry={() => sets.refetch()} /></Card> : sets.isLoading ? <Card><LoadingRows rows={5} /></Card> : !sets.data?.length ? (
        <Card><EmptyState icon={c.icon} title={c.emptyTitle} description={c.emptyText} action={<Gate allowed={analyst}><Button onClick={() => setCreating(true)}><Plus />New {c.noun}</Button></Gate>} /></Card>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {sets.data.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)} className={cn("flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-left transition-colors", s.id === active ? "border-primary bg-primary-soft/40" : "border-line bg-surface hover:border-line-strong")}>
                <span className="text-[13px] font-medium">{s.name}</span><Badge size="sm" className="num">{s.count}</Badge>
              </button>
            ))}
          </div>
          {active != null && <SetView key={active} id={active} kind={kind} onDeleted={() => setActive(null)} />}
        </>
      )}
      <CreateSetDialog kind={kind} open={creating} onOpenChange={setCreating} onCreated={setActive} />
    </div>
  );
}

function CreateSetDialog({ kind, open, onOpenChange, onCreated }: { kind: Kind; open: boolean; onOpenChange: (v: boolean) => void; onCreated: (id: number) => void }) {
  const c = CONF[kind];
  const qc = useQueryClient();
  const [name, setName] = React.useState("");
  const [products, setProducts] = React.useState<ProductBrief[]>([]);
  const [picker, setPicker] = React.useState(false);
  React.useEffect(() => { if (open) { setName(""); setProducts([]); } }, [open]);
  const m = useMutation({
    mutationFn: () => post<{ id: number }>("/sets", { name: name.trim(), kind, product_ids: products.map((p) => p.id) }),
    onSuccess: (r) => { toast.success(`${c.noun[0].toUpperCase()}${c.noun.slice(1)} created`); qc.invalidateQueries({ queryKey: ["sets", kind] }); onCreated(r.id); onOpenChange(false); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} title={`New ${c.noun}`} size="lg" description={`Add up to ${c.max} products. Each is tracked daily so changes and share history build up from today.`}
        footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button loading={m.isPending} disabled={!name.trim() || !products.length} onClick={() => m.mutate()}>Create</Button></>}>
        <div className="space-y-4">
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === "market" ? "e.g. Ottoman beds — double" : "e.g. My divan vs top rivals"} autoFocus /></Field>
          <Field label="Products" aside={`${products.length} / ${c.max}`}>
            {products.length ? (
              <ul className="divide-y divide-line rounded-lg border border-line">
                {products.map((p) => <li key={p.id} className="flex items-center gap-2 px-3 py-1.5"><div className="min-w-0 flex-1"><ProductCell p={p} href={false} /></div><Button size="icon-sm" variant="ghost" aria-label="Remove" onClick={() => setProducts(products.filter((x) => x.id !== p.id))}><Trash2 /></Button></li>)}
              </ul>
            ) : <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-muted">No products chosen yet.</p>}
            <Button variant="secondary" className="mt-2" onClick={() => setPicker(true)}><PackageSearch />Choose products</Button>
          </Field>
        </div>
      </Dialog>
      <ProductPickerDialog open={picker} onOpenChange={setPicker} multiple max={c.max} initial={products} title={`Products for this ${c.noun}`} onPick={setProducts} />
    </>
  );
}

/* ================================================================ set view */
function SetView({ id, kind, onDeleted }: { id: number; kind: Kind; onDeleted: () => void }) {
  const c = CONF[kind];
  const qc = useQueryClient();
  const analyst = useAnalyst();
  const [days, setDays] = React.useState(90);
  const [adding, setAdding] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const q = useQuery({ queryKey: ["set", id, days], queryFn: () => get<SetDetail>(`/sets/${id}`, { days }) });
  const add = useMutation({
    mutationFn: (ids: number[]) => post(`/sets/${id}/products`, ids),
    onSuccess: () => { toast.success("Products added"); qc.invalidateQueries({ queryKey: ["set", id] }); qc.invalidateQueries({ queryKey: ["sets", kind] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: () => del(`/sets/${id}`),
    onSuccess: () => { toast.success("Deleted"); setRemoving(false); qc.invalidateQueries({ queryKey: ["sets", kind] }); onDeleted(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (q.isLoading) return <div className="space-y-4"><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-72" /></div>;
  if (q.error) return <Card><ApiErrorView error={q.error} onRetry={() => q.refetch()} /></Card>;
  const d = q.data!;
  const room = c.max - d.products.length;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="min-w-0 flex-1 truncate text-[17px] font-semibold">{d.name}</h2>
        <RangeButtons value={days} onChange={setDays} options={[{ value: 30, label: "30D" }, { value: 90, label: "90D" }, { value: 180, label: "180D" }]} />
        <Button size="sm" variant="ghost" disabled={!d.products.length} onClick={() => downloadCsv(`${slug(d.name)}-${today()}.csv`,
          ["ASIN", "Title", "Brand", "Price", "Rating", "Reviews", "BSR", "Est. monthly units", "Est. monthly revenue", "Est. revenue share"],
          d.products.map((p) => [p.asin, p.title, p.brand, p.price, p.rating, p.reviews, p.bsr, p.units, p.revenue, p.share]))}>Export</Button>
        <Gate allowed={analyst && room > 0} reason={room > 0 ? undefined : `A ${c.noun} holds up to ${c.max} products`}><Button size="sm" variant="secondary" loading={add.isPending} onClick={() => setAdding(true)}><Plus />Add products</Button></Gate>
        <Gate allowed={analyst}><Button size="sm" variant="ghost" className="text-danger" onClick={() => setRemoving(true)} aria-label="Delete set"><Trash2 /></Button></Gate>
      </div>
      {!d.products.length ? (
        <Card><EmptyState icon={PackageSearch} title="No products in this set" description="Add products from your workspace to start comparing." action={<Gate allowed={analyst}><Button onClick={() => setAdding(true)}><Plus />Add products</Button></Gate>} /></Card>
      ) : kind === "competitor_set" ? <CompetitorView d={d} /> : <MarketView d={d} days={days} />}
      <ProductPickerDialog open={adding} onOpenChange={setAdding} multiple max={Math.max(1, room)} title={`Add up to ${room} product${room === 1 ? "" : "s"}`} confirmLabel="Add to set"
        onPick={(ps) => add.mutate(ps.filter((p) => !d.products.some((x) => x.id === p.id)).map((p) => p.id))} />
      <ConfirmDialog open={removing} onOpenChange={setRemoving} title={`Delete ${c.noun}?`} confirmLabel="Delete" loading={remove.isPending}
        description={<>“{d.name}” will be deleted. The products stay in your workspace.</>} onConfirm={() => remove.mutate()} />
    </div>
  );
}

const avg = (xs: (number | null | undefined)[]) => { const v = xs.filter((x): x is number => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const short = (p: { title: string; asin: string; brand?: string }, n = 26) => { const t = p.brand ? `${p.brand} · ${p.asin}` : p.title || p.asin; return t.length > n ? t.slice(0, n - 1) + "…" : t; };

function shareTable(d: SetDetail, currency: string): ColumnDef<SetProduct, any>[] {
  return [
    { id: "title", header: "Product", accessorKey: "title", enableHiding: false, cell: ({ row }) => <ProductCell p={row.original} /> },
    { id: "price", header: "Price", accessorKey: "price", meta: { align: "right" }, cell: ({ row: { original: p } }) => money(p.price, p.currency || currency) },
    { id: "rating", header: "Rating", accessorKey: "rating", meta: { align: "right" }, cell: ({ getValue }) => getValue() ? <span className="inline-flex items-center gap-1">{Number(getValue()).toFixed(1)}<Star className="size-3 fill-warning text-warning" /></span> : "—" },
    { id: "reviews", header: "Reviews", accessorKey: "reviews", meta: { align: "right" }, cell: ({ getValue }) => num(getValue()) },
    { id: "bsr", header: "BSR", accessorKey: "bsr", meta: { align: "right" }, cell: ({ getValue }) => getValue() ? `#${num(getValue())}` : "—" },
    { id: "offers", header: "Sellers", accessorKey: "offers", meta: { align: "right" }, cell: ({ getValue }) => num(getValue()) },
    { id: "units", header: "Est. units / mo", accessorKey: "units", meta: { align: "right" }, cell: ({ row }) => <UnitsCell p={row.original} /> },
    { id: "revenue", header: "Est. revenue / mo", accessorKey: "revenue", meta: { align: "right" }, cell: ({ row: { original: p } }) => money(p.revenue, p.currency || currency, { compact: true }) },
    { id: "share", header: "Est. share", accessorKey: "share", meta: { align: "right" }, cell: ({ getValue }) => getValue() == null ? "—" : <span className="font-medium num">{(getValue() * 100).toFixed(1)}%</span> },
    { id: "competition", header: "Competition", accessorKey: "competition", cell: ({ getValue }) => <CompetitionBadge level={getValue()} /> },
    { id: "score", header: "Score", accessorKey: "score", meta: { align: "right" }, cell: ({ getValue }) => <ScorePill score={getValue()} /> },
  ];
}

/* ---------------------------------------------------------------- competitor view */
function CompetitorView({ d }: { d: SetDetail }) {
  const { currency } = useSession();
  const [metric, setMetric] = React.useState<"price" | "reviews" | "rating" | "units">("price");
  const ps = d.products;
  const prices = ps.map((p) => p.price).filter((x): x is number => x != null);
  const withRev = ps.filter((p) => p.revenue).sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
  const donut = withRev.slice(0, 7).map((p) => ({ name: short(p), value: p.revenue! }));
  const other = withRev.slice(7).reduce((a, p) => a + (p.revenue ?? 0), 0);
  if (other) donut.push({ name: "Others", value: other });
  const leader = withRev[0];
  const scatter = ps.filter((p) => p.price != null && p.rating != null).map((p, i) => ({ x: p.price!, y: p.rating!, z: p.reviews ?? 0, name: short(p, 40), tone: PALETTE[i % PALETTE.length] }));
  const bars = ps.map((p) => ({ name: short(p, 18), value: p[metric] ?? 0 }));
  const metricLabel = { price: "Price", reviews: "Reviews", rating: "Rating", units: "Est. units / mo" }[metric];
  const fmt = (v: number) => metric === "price" ? money(v, currency) : metric === "rating" ? v.toFixed(1) : num(v, { compact: true });
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Combined est. revenue" icon={Coins} tone="cyan" value={money(d.total_revenue || null, currency, { compact: true })} source={BASIS(d)} tooltip="Sum of estimated monthly revenue across the set. Estimates, not Amazon figures." />
        <MetricCard label="Revenue leader" icon={TrendingUp} tone="success" value={leader?.share != null ? `${(leader.share * 100).toFixed(0)}%` : "—"} sub={leader ? <span className="truncate">{short(leader, 22)}</span> : undefined} source={BASIS(d)} />
        <MetricCard label="Average price" icon={DollarSign} value={money(avg(prices), currency)} sub={prices.length > 1 ? <span>{money(Math.min(...prices), currency)}–{money(Math.max(...prices), currency)} range</span> : undefined} />
        <MetricCard label="Average rating" icon={Star} tone="warning" value={avg(ps.map((p) => p.rating))?.toFixed(2) ?? "—"} sub={<span>{num(avg(ps.map((p) => p.reviews)))} reviews avg</span>} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader eyebrow="Share of revenue" title="Estimated revenue share" description="Each product's share of the set's estimated monthly revenue." action={<SourceBadge source={BASIS(d)} />} />
          <CardBody>{donut.length ? <Donut height={190} data={donut} valueFormat={(v) => money(v, currency, { compact: true })} center={<div><div className="text-[15px] font-semibold num">{money(d.total_revenue, currency, { compact: true })}</div><div className="text-2xs text-subtle">est. / month</div></div>} />
            : <EmptyState compact icon={Coins} title="No revenue estimates yet" description="Estimates need sales rank or Keepa data. Refresh the products from their product pages." />}</CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Positioning" title={<span className="flex items-center gap-1.5">Price vs rating <InfoTip content="Bubble size shows review count. Top-left is cheaper and better rated." /></span>} />
          <CardBody>{scatter.length > 1 ? <PriceRatingScatter data={scatter} currency={currency} /> : <EmptyState compact title="Not enough data" description="Needs at least two products with a price and rating." />}</CardBody>
        </Card>
      </div>
      <Card>
        <CardHeader eyebrow="Head to head" title={`${metricLabel} by product`} action={<Segmented size="sm" value={metric} onChange={setMetric} options={[{ value: "price", label: "Price" }, { value: "reviews", label: "Reviews" }, { value: "rating", label: "Rating" }, { value: "units", label: "Est. units" }]} />} />
        <CardBody><CategoryChart height={Math.max(200, ps.length * 34)} horizontal data={bars} x="name" series={[{ key: "value", label: metricLabel, tone: metric === "units" ? "cyan" : metric === "rating" ? "warning" : "primary" }]} valueFormat={(v) => fmt(v)} /></CardBody>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader eyebrow="Comparison" title="Side by side" action={<SourceBadge source={BASIS(d)} />} />
        <DataTable className="rounded-none border-x-0 border-b-0 shadow-none" columns={shareTable(d, currency)} data={ps} getRowId={(p) => String(p.id)} storageKey="competitor-set" />
      </Card>
      <ChangesFeed changes={d.changes} currency={currency} />
    </>
  );
}

function PriceRatingScatter({ data, currency }: { data: { x: number; y: number; z: number; name: string; tone: string }[]; currency: string }) {
  const AX = { stroke: "rgb(var(--line))", tick: { fill: "rgb(var(--subtle))", fontSize: 11 }, tickLine: false, axisLine: false } as const;
  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="rgb(var(--line))" strokeOpacity={0.6} />
          <XAxis type="number" dataKey="x" name="Price" tickFormatter={(v) => money(v, currency, { decimals: 0 })} domain={["auto", "auto"]} {...AX} />
          <YAxis type="number" dataKey="y" name="Rating" domain={[(min: number) => Math.max(1, Math.floor(min * 2) / 2 - 0.5), 5]} width={36} {...AX} />
          <ZAxis type="number" dataKey="z" range={[60, 600]} name="Reviews" />
          <RTooltip isAnimationActive={false} cursor={{ strokeDasharray: "3 3", stroke: "rgb(var(--line-strong))" }}
            content={({ active, payload }: any) => active && payload?.length ? (
              <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop"><div className="mb-1 font-medium">{payload[0].payload.name}</div>
                <div className="text-muted">{money(payload[0].payload.x, currency)} · {payload[0].payload.y.toFixed(1)}★ · {num(payload[0].payload.z)} reviews</div></div>
            ) : null} />
          {data.map((p, i) => <Scatter key={i} data={[p]} fill={tokenColor(p.tone)} fillOpacity={0.7} isAnimationActive={false} />)}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChangesFeed({ changes, currency }: { changes: Change[]; currency: string }) {
  const icon = { price: DollarSign, sellers: Users, reviews: Star };
  const label = { price: "Price changed", sellers: "Seller count changed", reviews: "Review jump" };
  return (
    <Card>
      <CardHeader eyebrow="Changes" title="What changed" description="Price moves of 5% or more, seller count changes and jumps of 20+ reviews between tracking snapshots." />
      <CardBody>
        {!changes.length ? <EmptyState compact icon={Activity} title="No changes recorded in this period" description="Changes come from daily tracking snapshots; new sets need a few days of history." /> : (
          <ol className="relative space-y-3 border-l border-line pl-5">
            {changes.slice(0, 40).map((ch, i) => {
              const I = icon[ch.type];
              const up = ch.to > ch.from;
              const fmt = (v: number) => ch.type === "price" ? money(v, currency) : num(v);
              return (
                <li key={i} className="relative">
                  <span className="absolute -left-[29px] top-0.5 grid size-5 place-items-center rounded-full border border-line bg-surface"><I className="size-3 text-muted" /></span>
                  <div className="flex flex-wrap items-baseline gap-x-2"><span className="text-[13px] font-medium">{label[ch.type]}</span>
                    <span className={cn("inline-flex items-center gap-0.5 text-[13px] num", ch.type === "price" ? (up ? "text-danger" : "text-success") : "text-muted")}>{fmt(ch.from)} → {fmt(ch.to)}{up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}</span>
                    <span className="text-2xs text-subtle">{ago(ch.at)}</span></div>
                  <div className="truncate text-xs text-muted"><span className="font-mono">{ch.asin}</span> · {ch.title}</div>
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}

/* ---------------------------------------------------------------- market view */
function MarketView({ d, days }: { d: SetDetail; days: number }) {
  const { currency } = useSession();
  const ps = d.products;
  const byId = new Map(ps.map((p) => [String(p.id), p]));
  const keys = Array.from(new Set(d.revenue_series.flatMap((r) => Object.keys(r).filter((k) => k !== "date"))));
  const totals = keys.map((k) => ({ k, sum: d.revenue_series.reduce((a, r) => a + (Number(r[k]) || 0), 0) })).sort((a, b) => b.sum - a.sum);
  const top = totals.slice(0, 6).map((t) => t.k);
  const series = d.revenue_series.map((r) => {
    const row: Record<string, number | string> = { date: String(r.date) };
    let other = 0, total = 0;
    keys.forEach((k) => { const v = Number(r[k]) || 0; total += v; if (top.includes(k)) row[k] = v; else other += v; });
    if (other) row.other = other;
    row.total = total;
    return row;
  });
  const brandMap = new Map<string, number>();
  ps.forEach((p) => brandMap.set(p.brand || "Unbranded", (brandMap.get(p.brand || "Unbranded") ?? 0) + (p.revenue ?? 0)));
  const brands = Array.from(brandMap.entries()).sort((a, b) => b[1] - a[1]);
  const shares = ps.map((p) => p.share ?? 0).filter((s) => s > 0);
  const hhi = shares.length ? Math.round(shares.reduce((a, s) => a + (s * 100) ** 2, 0)) : null;
  const first = series[0]?.total as number | undefined, last = series[series.length - 1]?.total as number | undefined;
  const growth = first && last && series.length > 1 ? ((last - first) / first) * 100 : null;
  const donut = ps.filter((p) => p.revenue).sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0)).slice(0, 6).map((p) => ({ name: short(p), value: p.revenue! }));
  const rest = ps.filter((p) => p.revenue).sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0)).slice(6).reduce((a, p) => a + (p.revenue ?? 0), 0);
  if (rest) donut.push({ name: "Others", value: rest });
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Market est. revenue" icon={Coins} tone="cyan" value={money(d.total_revenue || null, currency, { compact: true })} sub={<span>per month · {ps.length} products</span>} source={BASIS(d)} />
        <MetricCard label={`Demand change (${days}d)`} icon={TrendingUp} tone={growth != null && growth < 0 ? "danger" : "success"} value={growth == null ? "—" : `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`} tooltip="Change in combined estimated revenue between the first and latest tracked day in the period." source={BASIS(d)} />
        <MetricCard label="Top brand share" icon={Boxes} tone="violet" value={brands.length && d.total_revenue ? `${((brands[0][1] / d.total_revenue) * 100).toFixed(0)}%` : "—"} sub={brands[0] ? <span className="truncate">{brands[0][0]}</span> : undefined} />
        <MetricCard label="Concentration (HHI)" icon={Target} value={hhi == null ? "—" : num(hhi)} tooltip="Herfindahl–Hirschman index of estimated revenue shares (0–10,000). Under 1,500 is fragmented; over 2,500 is concentrated." sub={hhi == null ? undefined : <span>{hhi < 1500 ? "Fragmented" : hhi < 2500 ? "Moderate" : "Concentrated"}</span>} />
      </div>
      <Card>
        <CardHeader eyebrow="Share over time" title="Estimated revenue share by product" description="Daily share of the market's estimated revenue, from tracking snapshots." action={<SourceBadge source={BASIS(d)} />} />
        <CardBody>
          {series.length > 1 ? <ShareArea data={series} keys={[...top, ...(series.some((r) => r.other) ? ["other"] : [])]} label={(k) => k === "other" ? "Others" : short(byId.get(k) ?? { title: `#${k}`, asin: k })} />
            : <EmptyState compact icon={Radar} title="Share history is building" description={`Kestrel snapshots each product daily. The chart appears after two days of tracking${series.length === 1 ? ` (first snapshot ${dateShort(String(series[0].date))})` : ""}.`} />}
        </CardBody>
      </Card>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader eyebrow="Demand" title="Combined estimated revenue" />
          <CardBody>{series.length > 1 ? <TrendArea data={series} x="date" y="total" tone="cyan" height={220} valueFormat={(v) => money(v, currency, { compact: true })} xFormat={(v) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} />
            : <EmptyState compact title="Not enough history yet" />}</CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Current share" title="By product" />
          <CardBody>{donut.length ? <Donut height={150} data={donut} valueFormat={(v) => money(v, currency, { compact: true })} /> : <EmptyState compact title="No revenue estimates" />}</CardBody>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader eyebrow="Brands" title="Estimated revenue by brand" />
          <CardBody>{brands.some((b) => b[1]) ? <BarList rows={brands.slice(0, 10).map(([b, v]) => ({ label: b, value: v, tone: "violet" }))} format={(v) => money(v, currency, { compact: true })} /> : <EmptyState compact title="No revenue estimates" />}</CardBody>
        </Card>
        <div className="xl:col-span-2"><ChangesFeed changes={d.changes} currency={currency} /></div>
      </div>
      <Card className="overflow-hidden">
        <CardHeader eyebrow="Products" title="Market members" action={<SourceBadge source={BASIS(d)} />} />
        <DataTable className="rounded-none border-x-0 border-b-0 shadow-none" columns={shareTable(d, currency)} data={ps} getRowId={(p) => String(p.id)} storageKey="market-set" />
      </Card>
    </>
  );
}

function ShareArea({ data, keys, label }: { data: Record<string, number | string>[]; keys: string[]; label: (k: string) => string }) {
  const AX = { stroke: "rgb(var(--line))", tick: { fill: "rgb(var(--subtle))", fontSize: 11 }, tickLine: false, axisLine: false } as const;
  const tones = [...PALETTE, "subtle"];
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} stackOffset="expand" margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="rgb(var(--line))" strokeOpacity={0.6} vertical={false} />
          <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} minTickGap={36} {...AX} />
          <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} width={44} {...AX} />
          <RTooltip isAnimationActive={false} cursor={{ stroke: "rgb(var(--line-strong))", strokeDasharray: "3 3" }}
            content={({ active, payload, label: l }: any) => {
              if (!active || !payload?.length) return null;
              const tot = payload.reduce((a: number, p: any) => a + (Number(p.value) || 0), 0) || 1;
              return (
                <div className="min-w-[200px] rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
                  <div className="mb-1.5 font-medium text-muted">{dateShort(l)}</div>
                  {[...payload].reverse().map((p: any) => <div key={p.dataKey} className="flex items-center justify-between gap-4"><span className="flex min-w-0 items-center gap-1.5 text-muted"><span className="size-2 shrink-0 rounded-full" style={{ background: p.color }} /><span className="truncate">{p.name}</span></span><span className="font-medium text-fg num">{((Number(p.value) / tot) * 100).toFixed(1)}%</span></div>)}
                </div>
              );
            }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "rgb(var(--muted))" }} />
          {keys.map((k, i) => <Area key={k} dataKey={k} name={label(k)} stackId="1" type="monotone" stroke={tokenColor(k === "other" ? "subtle" : tones[i % PALETTE.length])} fill={tokenColor(k === "other" ? "subtle" : tones[i % PALETTE.length])} fillOpacity={0.55} isAnimationActive={false} connectNulls />)}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
