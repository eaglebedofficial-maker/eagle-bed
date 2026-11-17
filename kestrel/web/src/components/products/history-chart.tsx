"use client";
/* Keepa-style history: price and rank on one chart, offers/reviews and rating/monthly-bought below,
   range buttons, series toggles and brush zoom. Only retrieved history is drawn — nothing is interpolated. */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChartCandlestick, CloudDownload, Crown } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { RangeButtons, SeriesToggle, TimeChart, type SeriesDef } from "@/components/ui/charts";
import { EmptyState, ErrorState, NotConfigured, SourceBadge } from "@/components/ui/data";
import { InfoTip, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Skeleton, Switch } from "@/components/ui/primitives";
import { ApiError, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, dateShort, money, num, pct } from "@/lib/utils";
import type { Analytics, HistoryResponse, Point } from "./types";

export const RANGES = [{ value: 30, label: "30d" }, { value: 90, label: "90d" }, { value: 180, label: "180d" }, { value: 365, label: "1y" }, { value: 0, label: "All" }];

const PRICE_SERIES: { key: string; tone: string; type?: SeriesDef["type"]; dashed?: boolean; defaultHidden?: boolean }[] = [
  { key: "amazon", tone: "warning", type: "step" }, { key: "new", tone: "primary", type: "step" }, { key: "buybox", tone: "danger", type: "step" },
  { key: "used", tone: "violet", type: "step", defaultHidden: true }, { key: "fba", tone: "cyan", type: "step", defaultHidden: true },
  { key: "fbm", tone: "success", type: "step", defaultHidden: true }, { key: "warehouse", tone: "violet", type: "step", dashed: true, defaultHidden: true },
  { key: "list", tone: "subtle", type: "step", dashed: true, defaultHidden: true },
];

export function historyQueryKey(id: number, days: number) { return ["history", id, days] as const; }
export function useHistory(id: number, days: number, enabled = true) {
  return useQuery({ queryKey: historyQueryKey(id, days), queryFn: () => get<HistoryResponse>(`/history/${id}`, { days }), enabled: enabled && !!id, placeholderData: keepPreviousData });
}

/** Merge {key: [[t, v]]} into rows keyed by timestamp; bucket when very dense so the chart stays responsive. */
function merge(series: Record<string, Point[]>, maxRows = 2400): Record<string, number | null>[] {
  const map = new Map<number, Record<string, number | null>>();
  for (const [k, pts] of Object.entries(series)) for (const [t, v] of pts) { const r = map.get(t) ?? { t }; r[k] = v; map.set(t, r); }
  const rows = [...map.values()].sort((a, b) => (a.t as number) - (b.t as number));
  if (rows.length <= maxRows) return rows;
  const t0 = rows[0].t as number, t1 = rows[rows.length - 1].t as number, size = (t1 - t0) / maxRows || 1;
  const buckets = new Map<number, Record<string, number | null>>();
  for (const r of rows) {
    const b = Math.floor(((r.t as number) - t0) / size);
    const cur = buckets.get(b) ?? { t: r.t };
    for (const [k, v] of Object.entries(r)) if (k !== "t" && v != null) cur[k] = v; // last value in bucket (step semantics)
    cur.t = r.t;
    buckets.set(b, cur);
  }
  return [...buckets.values()];
}

function useToggles(initial: Record<string, boolean>) {
  const [hidden, setHidden] = React.useState<Record<string, boolean>>(initial);
  return { hidden, toggle: (k: string) => setHidden((h) => ({ ...h, [k]: !h[k] })) };
}

export function FetchHistoryButton({ productId, onNotConfigured, size = "sm" }: { productId: number; onNotConfigured?: (e: ApiError) => void; size?: "sm" | "xs" }) {
  const qc = useQueryClient();
  const { can } = useSession();
  const [offers, setOffers] = React.useState(false);
  const m = useMutation({
    mutationFn: () => post<{ ok: boolean; tokens_left?: number; tokens_used?: number }>("/history/fetch", { product_id: productId, days: 0, offers: offers ? 20 : 0 }),
    onSuccess: (r) => {
      toast.success(`Keepa history updated${r.tokens_used != null ? ` · ${r.tokens_used} tokens used` : ""}${r.tokens_left != null ? ` · ${num(r.tokens_left)} left` : ""}`);
      qc.invalidateQueries({ queryKey: ["history", productId] });
      qc.invalidateQueries({ queryKey: ["product", productId] });
    },
    onError: (e) => { if (e instanceof ApiError && e.notConfigured && onNotConfigured) onNotConfigured(e); else toast.error(errorMessage(e)); },
  });
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tooltip content="Also retrieve current offers (costs extra Keepa tokens)."><div className="flex items-center gap-1.5 text-xs text-muted"><Switch id={`offers-${productId}`} checked={offers} onCheckedChange={setOffers} /><label htmlFor={`offers-${productId}`}>Offers</label></div></Tooltip>
      <Tooltip content={!can("analyst") ? "Viewers can't fetch data" : "Retrieve full history from Keepa. Uses Keepa tokens."}>
        <span><Button size={size} variant="secondary" disabled={!can("analyst")} loading={m.isPending} onClick={() => m.mutate()}><CloudDownload />Fetch from Keepa</Button></span>
      </Tooltip>
    </div>
  );
}

export function HistoryCharts({ productId, height = 340, showFetch = true }: { productId: number; height?: number; showFetch?: boolean }) {
  const [days, setDays] = React.useState(365);
  const [nc, setNc] = React.useState<ApiError | null>(null);
  const q = useHistory(productId, days);
  const d = q.data;
  const cur = d?.currency ?? "GBP";
  const priceT = useToggles(Object.fromEntries(PRICE_SERIES.filter((s) => s.defaultHidden).map((s) => [s.key, true])));
  const lowerT = useToggles({});

  const hasKeepa = !!d && Object.keys(d.series).length > 0;
  const main = React.useMemo(() => {
    if (!d) return { rows: [], series: [] as SeriesDef[] };
    const src: Record<string, Point[]> = {};
    const series: SeriesDef[] = [];
    if (hasKeepa) {
      for (const s of PRICE_SERIES) if (d.series[s.key]?.length) { src[s.key] = d.series[s.key]; series.push({ key: s.key, label: d.labels[s.key] ?? s.key, tone: s.tone, type: s.type, dashed: s.dashed, hidden: !!priceT.hidden[s.key] }); }
      if (d.series.rank?.length) { src.rank = d.series.rank; series.push({ key: "rank", label: "Sales rank (BSR)", tone: "success", axis: "right", type: "line", hidden: !!priceT.hidden.rank }); }
    } else {
      if (d.tracking.price.length) { src.t_price = d.tracking.price; series.push({ key: "t_price", label: "Price (tracked)", tone: "primary", type: "step", hidden: !!priceT.hidden.t_price }); }
      if (d.tracking.rank.length) { src.t_rank = d.tracking.rank; series.push({ key: "t_rank", label: "BSR (tracked)", tone: "success", axis: "right", hidden: !!priceT.hidden.t_rank }); }
    }
    return { rows: merge(src), series };
  }, [d, hasKeepa, priceT.hidden]);

  const lower = React.useMemo(() => {
    if (!d) return { rows: [], series: [] as SeriesDef[] };
    const src: Record<string, Point[]> = {};
    const series: SeriesDef[] = [];
    const add = (key: string, pts: Point[] | undefined, label: string, tone: string, axis: "left" | "right" = "left", type: SeriesDef["type"] = "step") => {
      if (pts?.length) { src[key] = pts; series.push({ key, label, tone, axis, type, hidden: !!lowerT.hidden[key] }); }
    };
    if (hasKeepa) {
      add("offers_new", d.series.offers_new, d.labels.offers_new ?? "New offers", "primary");
      add("offers_used", d.series.offers_used, d.labels.offers_used ?? "Used offers", "violet");
      add("reviews", d.series.reviews, d.labels.reviews ?? "Reviews", "cyan", "right", "line");
    } else add("t_offers", d.tracking.offers, "Offers (tracked)", "primary");
    return { rows: merge(src), series };
  }, [d, hasKeepa, lowerT.hidden]);

  const third = React.useMemo(() => {
    if (!d || !hasKeepa) return { rows: [], series: [] as SeriesDef[] };
    const src: Record<string, Point[]> = {};
    const series: SeriesDef[] = [];
    if (d.series.rating?.length) { src.rating = d.series.rating; series.push({ key: "rating", label: d.labels.rating ?? "Rating", tone: "warning", type: "step", hidden: !!lowerT.hidden.rating }); }
    if (d.series.monthly_sold?.length) { src.monthly_sold = d.series.monthly_sold; series.push({ key: "monthly_sold", label: d.labels.monthly_sold ?? "Bought in past month", tone: "success", axis: "right", type: "step", hidden: !!lowerT.hidden.monthly_sold }); }
    return { rows: merge(src), series };
  }, [d, hasKeepa, lowerT.hidden]);

  const fmtPrice = (v: number) => money(v, cur, { decimals: v >= 100 ? 0 : 2 });
  const fmtRank = (v: number) => `#${num(v, { compact: true })}`;
  const priceKeys = new Set([...PRICE_SERIES.map((s) => s.key), "t_price"]);

  const header = (
    <CardHeader eyebrow="Price & rank history" title={hasKeepa ? "Keepa history" : "Tracked history"}
      description={d?.source.period_from ? `${dateShort(d.source.period_from)} – ${dateShort(d.source.period_to)} · step lines hold each value until it changes` : "Retrieved history only; gaps are left as gaps."}
      action={<div className="flex flex-wrap items-center justify-end gap-2">{d?.available && <SourceBadge source={{ provider: d.source.provider ?? undefined, classification: d.source.classification, period_from: d.source.period_from, period_to: d.source.period_to }} />}<RangeButtons value={days} onChange={setDays} options={RANGES} /></div>} />
  );

  if (nc) return <Card>{header}<NotConfigured provider="Keepa" message={nc.message} /></Card>;
  if (q.error && !d) return <Card>{header}<ErrorState error={q.error} onRetry={() => q.refetch()} /></Card>;
  return (
    <div className="space-y-4">
      <Card>
        {header}
        <CardBody className="space-y-4">
          {!d ? <div style={{ height }}><Skeleton className="h-full w-full" /></div> : !d.available || main.series.length === 0 ? (
            <EmptyState icon={ChartCandlestick} title="No history retrieved yet" description="Fetch price, rank, offer and review history from Keepa, or track this product to build history from daily snapshots."
              action={showFetch ? <FetchHistoryButton productId={productId} onNotConfigured={setNc} /> : undefined} />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SeriesToggle series={main.series} onToggle={priceT.toggle} />
                {showFetch && <FetchHistoryButton productId={productId} onNotConfigured={setNc} size="xs" />}
              </div>
              <div className={cn("transition-opacity", q.isFetching && "opacity-60")}>
                <TimeChart data={main.rows} series={main.series} height={height} brush leftFormat={fmtPrice} rightFormat={fmtRank} rightInverted
                  valueFormat={(v, k) => priceKeys.has(k) ? money(v, cur) : `#${num(v)}`} />
              </div>
              <p className="text-2xs text-subtle">Rank axis is inverted (higher on the chart = better rank). Drag the handles under the chart to zoom.</p>
            </>
          )}
        </CardBody>
      </Card>
      {d?.available && lower.series.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader eyebrow="Competition" title="Offers & reviews" action={<SeriesToggle series={lower.series} onToggle={lowerT.toggle} />} />
            <CardBody><TimeChart data={lower.rows} series={lower.series} height={220} leftFormat={(v) => num(v)} rightFormat={(v) => num(v, { compact: true })} valueFormat={(v) => num(v)} /></CardBody>
          </Card>
          {third.series.length > 0 ? (
            <Card>
              <CardHeader eyebrow="Demand signals" title="Rating & monthly bought" action={<SeriesToggle series={third.series} onToggle={lowerT.toggle} />} />
              <CardBody><TimeChart data={third.rows} series={third.series} height={220} leftFormat={(v) => v.toFixed(1)} rightFormat={(v) => num(v, { compact: true })} valueFormat={(v, k) => k === "rating" ? `${v.toFixed(1)}★` : `${num(v)}+`} /></CardBody>
            </Card>
          ) : (
            <Card><EmptyState compact icon={ChartCandlestick} title="No rating or monthly-bought history" description="Keepa supplies these when Amazon publishes them for the listing." /></Card>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- analytics tables */
export function AveragesTable({ a, currency }: { a: Analytics; currency: string }) {
  if (!a.available || !a.windows) return <EmptyState compact icon={ChartCandlestick} title="No averages yet" description={a.reason || "Averages are calculated from retrieved history."} />;
  const wins = ["30", "90", "180", "365"];
  const cell = (v: number | undefined, f: (n: number) => string) => v == null ? <span className="text-subtle">—</span> : f(v);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-[13px]">
        <thead><tr className="text-2xs uppercase tracking-[0.06em] text-subtle">
          <th className="py-2 pr-3 text-left font-semibold">Window</th><th className="px-3 text-right font-semibold">Avg price</th><th className="px-3 text-right font-semibold">Min – max</th>
          <th className="px-3 text-right font-semibold">Price volatility <InfoTip content="Coefficient of variation: standard deviation ÷ mean of retrieved points." /></th><th className="px-3 text-right font-semibold">Avg BSR</th><th className="pl-3 text-right font-semibold">Best – worst BSR</th>
        </tr></thead>
        <tbody className="divide-y divide-line border-t border-line">
          {wins.map((w) => {
            const x = a.windows![w];
            if (!x) return null;
            return (
              <tr key={w}>
                <td className="py-2.5 pr-3"><span className="font-medium">{w} days</span>{!x.complete && <Tooltip content="History doesn't cover this whole window yet."><span><Badge tone="warning" size="sm" className="ml-2 cursor-help">Partial</Badge></span></Tooltip>}</td>
                <td className="px-3 text-right num">{cell(x.price.avg, (v) => money(v, currency))}</td>
                <td className="px-3 text-right text-muted num">{x.price.min != null ? `${money(x.price.min, currency)} – ${money(x.price.max, currency)}` : "—"}</td>
                <td className="px-3 text-right num">{x.price.cv != null ? pct(x.price.cv * 100, 1) : "—"}</td>
                <td className="px-3 text-right num">{cell(x.rank.avg, (v) => `#${num(v)}`)}</td>
                <td className="pl-3 text-right text-muted num">{x.rank.min != null ? `#${num(x.rank.min)} – #${num(x.rank.max)}` : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SignalTiles({ a }: { a: Analytics }) {
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const tiles: [string, React.ReactNode, string][] = [
    ["Price stability", a.price_stability != null ? `${Math.round(a.price_stability * 100)}/100` : "—", "1 − 5 × the 90-day price coefficient of variation."],
    ["Sales consistency", a.sales_consistency != null ? `${Math.round(a.sales_consistency * 100)}/100` : "—", "From the spread of log-rank over 90 days. Needs 4+ rank points."],
    ["Rank volatility", a.rank_volatility != null ? a.rank_volatility.toFixed(2) : "—", "Standard deviation of log10(rank) over 90 days. Lower is steadier."],
    ["BSR movement", a.bsr_movement_pct != null ? <span className={a.bsr_movement_pct >= 0 ? "text-success" : "text-danger"}>{a.bsr_movement_pct > 0 ? "+" : ""}{a.bsr_movement_pct.toFixed(1)}%</span> : "—", "Average rank in the last 30 days vs 60–90 days ago. Positive = rank improving."],
    ["Seasonality", a.seasonality != null ? `${Math.round(a.seasonality * 100)}/100` : "—", "Spread of monthly mean rank over 12 months. Needs about a year of history."],
    ["Best months", a.best_months?.length ? a.best_months.map((m) => MONTHS[m - 1]).join(", ") : "—", "Months with the best average rank in the last year."],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {tiles.map(([l, v, help]) => (
        <div key={l} className="rounded-xl border border-line bg-surface p-3">
          <div className="flex items-center gap-1 text-xs text-muted">{l}<InfoTip content={help} /></div>
          <div className="mt-1 text-lg font-semibold num">{v}</div>
        </div>
      ))}
    </div>
  );
}

export function BuyBoxShareList({ a }: { a: Analytics }) {
  if (!a.buybox) return <EmptyState compact icon={Crown} title="No buy box history" description="Keepa supplies buy box seller history. Fetch it from the history tab." />;
  return (
    <div className="space-y-3">
      {a.buybox.distribution.map((s) => (
        <div key={s.seller_id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
          <div className="flex min-w-0 items-center gap-2 text-[13px]"><span className="truncate font-mono text-xs">{s.seller_id}</span>{s.is_amazon && <Badge tone="warning" size="sm">Amazon</Badge>}</div>
          <div className="text-[13px] font-medium num">{pct(s.share * 100, 1)}</div>
          <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-surface-3"><div className={cn("h-full rounded-full", s.is_amazon ? "bg-warning" : "bg-primary")} style={{ width: `${s.share * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

