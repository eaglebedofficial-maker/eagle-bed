"use client";
/* Product detail tabs: overview, sales estimate, history, buy box & offers, opportunity score. */
import { AlertTriangle, BarChart3, CheckCircle2, CircleSlash, Crown, Database, Gauge, Info, PackageSearch, ShoppingCart, Star, TrendingUp, Wallet } from "lucide-react";
import * as React from "react";
import { TimeChart } from "@/components/ui/charts";
import { EmptyState, ErrorState, KeyValue, MetricCard, ScoreRing, SourceBadge } from "@/components/ui/data";
import { InfoTip, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Progress, Skeleton } from "@/components/ui/primitives";
import { ago, cn, dateShort, money, num, pct, scoreTone } from "@/lib/utils";
import { AveragesTable, BuyBoxShareList, FetchHistoryButton, HistoryCharts, SignalTiles, useHistory } from "./history-chart";
import type { ProductDetail, ScoreFactor } from "./types";

export type TabProps = { p: ProductDetail; goTab: (t: string) => void };

const yesNo = (v: boolean | null | undefined) => (v == null ? undefined : v ? "Yes" : "No");
const dims = (p: ProductDetail) => (p.length_cm && p.width_cm && p.height_cm ? `${p.length_cm} × ${p.width_cm} × ${p.height_cm} cm` : undefined);

/** Confidence tier implied by the estimation method (mirrors api/app/services/estimation.py). */
export function estConfidence(method: string): { label: string; tone: "success" | "warning" | "danger" | "neutral"; why: string } {
  const m = (method || "").toLowerCase();
  if (m.includes("monthly-bought")) return { label: "Medium–high", tone: "success", why: "Anchored to Amazon's published “bought in past month” bucket; high when the rank model agrees with it." };
  if (m.includes("rank-drop")) return { label: "Medium", tone: "warning", why: "Rank model with a floor from Keepa sales-rank drops (each drop is at least one sale)." };
  if (m.includes("category curve")) return { label: "Low–medium", tone: "warning", why: "Best Sellers Rank model only. Medium-low when the category curve is known, low when it isn't." };
  return { label: "None", tone: "neutral", why: "No rank or sales signal is available, so no estimate is made." };
}

/* ---------------------------------------------------------------- Overview */
export function OverviewTab({ p, goTab }: TabProps) {
  const sc = p.score_components;
  const dq = p.data_quality;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Price" icon={ShoppingCart} value={money(p.price, p.currency)} source={{ provider: p.source, classification: p.classification, retrieved_at: p.last_refreshed_at }} />
        <MetricCard label="Est. monthly units" icon={TrendingUp} tone="cyan" value={num(p.units)} sub={p.units != null ? <span className="num">{num(p.units_low)}–{num(p.units_high)}</span> : undefined} source={{ classification: "estimated", note: p.est_method }} tooltip="A Kestrel estimate, not an Amazon sales figure. See the Sales & demand tab for the method." />
        <MetricCard label="Est. monthly revenue" icon={BarChart3} tone="violet" value={money(p.revenue, p.currency, { compact: true })} source={{ classification: "estimated" }} tooltip="Estimated units × current price." />
        <MetricCard label="Best Sellers Rank" icon={Gauge} tone="success" value={p.bsr ? `#${num(p.bsr)}` : "—"} sub={p.bsr_category ? <span className="truncate">{p.bsr_category}</span> : undefined} />
        <MetricCard label="Reviews" icon={Star} tone="warning" value={num(p.reviews)} sub={p.rating ? <span>{p.rating.toFixed(1)}★ average</span> : undefined} />
        <MetricCard label="Offers" icon={PackageSearch} value={num(p.offers)} sub={p.fba_offers != null || p.fbm_offers != null ? <span className="num">FBA {num(p.fba_offers)} · FBM {num(p.fbm_offers)}</span> : undefined} />
        <MetricCard label="Est. profit / unit" icon={Wallet} tone={p.profit != null && p.profit < 0 ? "danger" : "success"} value={money(p.profit, p.currency)} source={{ classification: "estimated" }}
          sub={p.cost_assumed ? <Tooltip content="Uses an assumed unit cost of 25% of price (ex VAT). Set your real cost from the header."><span className="cursor-help text-warning">Assumed cost</span></Tooltip> : <span>Your unit cost</span>} />
        <MetricCard label="Est. margin · ROI" icon={Database} tone="cyan" value={<span>{pct(p.margin)} <span className="text-base text-muted">· {pct(p.roi)}</span></span>} source={{ classification: "estimated" }} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader eyebrow="Opportunity score" title="Summary" action={<Button variant="ghost" size="sm" onClick={() => goTab("score")}>All 12 factors</Button>} />
          <CardBody className="space-y-4">
            {sc ? (
              <>
                <div className="flex items-center gap-4">
                  <ScoreRing score={sc.score} size={72} stroke={6} label="Opportunity score" />
                  <div className="min-w-0 text-[13px]">
                    <div className="font-medium">{Math.round(sc.coverage * 100)}% of factors scored</div>
                    <div className="text-muted">Confidence: <span className="capitalize">{sc.confidence}</span></div>
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed text-muted">{sc.summary}</p>
                <p className="text-2xs text-subtle">{sc.disclaimer}</p>
              </>
            ) : <EmptyState compact icon={Gauge} title="Not scored yet" description="Refresh the product or add a price and sales signal to score it." />}
          </CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Product" title="Identifiers & attributes" />
          <CardBody>
            <KeyValue rows={[
              ["ASIN", <span key="a" className="font-mono">{p.asin}</span>], ["Parent ASIN", p.parent_asin ? <span className="font-mono">{p.parent_asin}</span> : undefined],
              ["EAN", p.ean || undefined], ["UPC", p.upc || undefined], ["ISBN", p.isbn || undefined], ["Brand", p.brand || undefined], ["Manufacturer", p.manufacturer || undefined],
              ["Category", p.category || undefined], ["Subcategory", p.subcategory || undefined], ["Size tier", p.size_tier || undefined],
              ["Weight", p.weight_g ? `${(p.weight_g / 1000).toFixed(2)} kg` : undefined], ["Dimensions", dims(p)], ["Listed since", p.listed_at ? dateShort(p.listed_at) : undefined],
            ]} />
          </CardBody>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader eyebrow="Listing" title="Content & variations" />
            <CardBody>
              <KeyValue rows={[["Images", num(p.images)], ["A+ content", yesNo(p.has_aplus) ?? "Unknown"], ["Video", yesNo(p.has_video) ?? "Unknown"], ["Variations", num(p.variations)],
                ["Listing quality", p.listing_quality != null ? `${Math.round(p.listing_quality)}/100` : "Not assessed"], ["Fulfilment", p.fulfilment || undefined],
                ["Amazon sells", p.amazon_sells == null ? "Unknown" : p.amazon_sells ? <Badge key="am" tone="warning" size="sm">Yes</Badge> : "No"]]} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader eyebrow="Data quality" title={dq?.score != null ? `${dq.score}/100` : "Not assessed"} />
            <CardBody className="space-y-3">
              {dq?.score != null && <Progress value={dq.score} tone={dq.score >= 80 ? "success" : dq.score >= 50 ? "warning" : "danger"} />}
              {dq?.issues?.length ? (
                <ul className="space-y-1.5 text-[13px]">{dq.issues.map((i) => <li key={i} className="flex items-start gap-2 text-muted"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />{i}</li>)}</ul>
              ) : <p className="flex items-center gap-2 text-[13px] text-muted"><CheckCircle2 className="size-4 text-success" />No data gaps detected.</p>}
            </CardBody>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader eyebrow="Provenance" title="Where this data came from" description="Every retrieval is logged with its provider, classification and period." />
        <CardBody>
          {p.sources.length ? (
            <ul className="divide-y divide-line">
              {p.sources.map((s, i) => (
                <li key={i} className="flex flex-wrap items-center gap-3 py-2.5 text-[13px]">
                  <SourceBadge source={s} /><span className="font-medium capitalize">{s.provider.replace(/_/g, " ")}</span>
                  {(s.period_from || s.period_to) && <span className="text-muted">History {dateShort(s.period_from)} – {dateShort(s.period_to)}</span>}
                  <span className="ml-auto text-xs text-subtle">{ago(s.retrieved_at)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-[13px] text-muted">Added as <b>{p.source}</b> ({p.classification.replace(/_/g, " ")}) · last refreshed {ago(p.last_refreshed_at)}. No provider retrievals logged yet.</p>}
        </CardBody>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------- Sales & demand */
export function SalesTab({ p, goTab }: TabProps) {
  const conf = estConfidence(p.est_method);
  const ks = p.keepa_stats || {};
  const drops: [string, number | undefined][] = [["30 days", ks.salesRankDrops30], ["90 days", ks.salesRankDrops90], ["180 days", ks.salesRankDrops180], ["365 days", ks.salesRankDrops365]];
  const hasDrops = drops.some(([, v]) => v != null && v >= 0);
  const span = p.units_high && p.units_low != null ? p.units_high - p.units_low : null;
  const pos = (v: number | null) => (v == null || !p.units_high ? 0 : Math.min(100, (v / (p.units_high * 1.1)) * 100));
  const hist = useHistory(p.id, 365);
  const ms = hist.data?.series.monthly_sold ?? [];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader eyebrow="Sales estimate" title="Estimated monthly units" description="An estimate from public signals. Amazon does not publish unit sales." action={<SourceBadge source={{ classification: "estimated", note: p.est_method }} />} />
          <CardBody className="space-y-5">
            {p.units == null ? (
              <EmptyState compact icon={TrendingUp} title="No estimate available" description="Kestrel needs a Best Sellers Rank or Amazon's “bought in past month” figure. Refresh from Keepa or SP-API, or import them." />
            ) : (
              <>
                <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
                  <div><div className="text-xs text-muted">Point estimate</div><div className="text-4xl font-semibold tracking-tight num">{num(p.units)}</div><div className="text-xs text-subtle">units / month</div></div>
                  <div><div className="text-xs text-muted">Range</div><div className="text-xl font-semibold num">{num(p.units_low)} – {num(p.units_high)}</div><div className="text-xs text-subtle">{span != null && p.units ? `±${Math.round((span / 2 / p.units) * 100)}% around the estimate` : ""}</div></div>
                  <div><div className="text-xs text-muted">Est. revenue</div><div className="text-xl font-semibold num">{money(p.revenue, p.currency)}</div><div className="text-xs text-subtle">units × current price</div></div>
                </div>
                <div className="space-y-1.5">
                  <div className="relative h-2 rounded-full bg-surface-3">
                    <div className="absolute inset-y-0 rounded-full bg-cyan/40" style={{ left: `${pos(p.units_low)}%`, width: `${pos(p.units_high) - pos(p.units_low)}%` }} />
                    <div className="absolute -top-1 h-4 w-1 rounded-full bg-cyan" style={{ left: `calc(${pos(p.units)}% - 2px)` }} />
                  </div>
                  <div className="flex justify-between text-2xs text-subtle num"><span>0</span><span>{num(Math.round((p.units_high ?? 0) * 1.1))}</span></div>
                </div>
                <KeyValue rows={[
                  ["Method", p.est_method || "—"],
                  ["Confidence", <span key="c" className="inline-flex items-center gap-2"><Badge tone={conf.tone} size="sm">{conf.label}</Badge><InfoTip content={conf.why} /></span>],
                  ["Best Sellers Rank", p.bsr ? `#${num(p.bsr)} in ${p.bsr_category || p.category || "unknown category"}` : "Not available"],
                  ["Amazon “bought in past month”", p.bought_past_month ? `${num(p.bought_past_month)}+` : "Not shown on the listing"],
                ]} />
              </>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Signals" title="Keepa sales-rank drops" description="Each drop in sales rank is at least one sale, so drops give a floor for slower sellers." action={hasDrops ? <SourceBadge classification="licensed" source={{ provider: "keepa" }} /> : undefined} />
          <CardBody>
            {hasDrops ? (
              <div className="grid grid-cols-2 gap-3">
                {drops.map(([l, v]) => <div key={l} className="rounded-xl border border-line p-3"><div className="text-xs text-muted">{l}</div><div className="mt-1 text-xl font-semibold num">{v != null && v >= 0 ? num(v) : "—"}</div></div>)}
              </div>
            ) : <EmptyState compact icon={Info} title="No rank-drop data" description="Fetch Keepa history to add rank-drop counts to the estimate." action={<Button variant="secondary" size="sm" onClick={() => goTab("history")}>Open history</Button>} />}
          </CardBody>
        </Card>
      </div>
      <Card>
        <CardHeader eyebrow="Demand history" title="Amazon “bought in past month” over time" action={ms.length ? <SourceBadge classification="licensed" source={{ provider: "keepa" }} /> : undefined} />
        <CardBody>
          {hist.isLoading ? <Skeleton className="h-[220px] w-full" /> : hist.error ? <ErrorState error={hist.error} onRetry={() => hist.refetch()} /> : ms.length > 1 ? (
            <TimeChart data={ms.map(([t, v]) => ({ t, monthly_sold: v }))} series={[{ key: "monthly_sold", label: "Bought in past month", tone: "success", type: "step" }]} height={220} leftFormat={(v) => num(v, { compact: true })} valueFormat={(v) => `${num(v)}+`} />
          ) : <EmptyState compact icon={BarChart3} title="No monthly-bought history" description="Keepa records this when Amazon shows a “bought in past month” badge on the listing." action={<FetchHistoryButton productId={p.id} />} />}
        </CardBody>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------- History */
export function HistoryTab({ p }: TabProps) {
  const a = p.history_summary;
  return (
    <div className="space-y-4">
      <HistoryCharts productId={p.id} />
      <Card>
        <CardHeader eyebrow="Analytics" title="Averages & volatility" description="Time-weighted averages from retrieved history. Partial windows are marked." action={a.available ? <SourceBadge source={{ provider: a.source ?? undefined, classification: a.source === "keepa" ? "licensed" : "user", period_from: a.period_from, period_to: a.period_to }} /> : undefined} />
        <CardBody className="space-y-5">
          <AveragesTable a={a} currency={p.currency} />
          {a.available && <SignalTiles a={a} />}
        </CardBody>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------- Buy box & offers */
export function BuyBoxTab({ p, goTab }: TabProps) {
  const h = useHistory(p.id, 90);
  const a = h.data?.analytics ?? p.history_summary;
  const offers = h.data?.offers ?? [];
  const ks = p.keepa_stats || {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Amazon buy box share (90d)" icon={Crown} tone="warning" value={a.buybox ? pct(a.buybox.amazon_share * 100, 1) : "—"} source={a.buybox ? { classification: "licensed", provider: "keepa" } : undefined} />
        <MetricCard label="Leading seller share" icon={Crown} value={a.buybox?.stability != null ? pct(a.buybox.stability * 100, 1) : "—"} tooltip="Share of the last 90 days the top seller held the buy box. Higher means harder to win a share." />
        <MetricCard label="Buy box changes (90d)" icon={TrendingUp} tone="cyan" value={a.buybox ? num(a.buybox.changes_90d) : "—"} />
        <MetricCard label="Offers now" icon={PackageSearch} tone="violet" value={num(p.offers)} sub={<span className="num">FBA {num(p.fba_offers ?? ks.offerCountFBA)} · FBM {num(p.fbm_offers ?? ks.offerCountFBM)}</span>} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card>
          <CardHeader eyebrow="Buy box" title="Seller share, last 90 days" description="Time each seller held the buy box, from Keepa's buy box seller history." />
          <CardBody>
            {h.isLoading ? <Skeleton className="h-40 w-full" /> : a.buybox ? <BuyBoxShareList a={a} /> : (
              <EmptyState compact icon={Crown} title="No buy box history" description="Fetch Keepa history to see who has held the buy box." action={<FetchHistoryButton productId={p.id} />} />
            )}
            {(ks.buyBoxIsAmazon != null || ks.buyBoxIsFBA != null) && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3 text-xs text-muted">
                Current buy box: {ks.buyBoxIsAmazon ? <Badge tone="warning" size="sm">Amazon</Badge> : <Badge size="sm">Third-party</Badge>}{ks.buyBoxIsFBA != null && <Badge size="sm">{ks.buyBoxIsFBA ? "FBA" : "FBM"}</Badge>}
              </div>
            )}
          </CardBody>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Offers" title="Current offers" description={h.data?.offers_at ? `Snapshot ${dateShort(h.data.offers_at)} (${ago(h.data.offers_at)})` : "From the latest Keepa offers retrieval."} />
          {h.error ? <ErrorState error={h.error} onRetry={() => h.refetch()} /> : h.isLoading ? <CardBody><Skeleton className="h-40 w-full" /></CardBody> : offers.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead><tr className="border-y border-line bg-surface-2 text-2xs uppercase tracking-[0.06em] text-subtle"><th className="px-4 py-2 text-left font-semibold">Seller</th><th className="px-3 text-left font-semibold">Condition</th><th className="px-3 text-left font-semibold">Fulfilment</th><th className="px-4 text-right font-semibold">Price</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {[...offers].sort((x, y) => (x.price ?? Infinity) - (y.price ?? Infinity)).map((o, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5"><span className="font-mono text-xs">{o.seller_id || "—"}</span>{o.is_amazon && <Badge tone="warning" size="sm" className="ml-2">Amazon</Badge>}{o.is_buybox && <Badge tone="primary" size="sm" className="ml-2">Buy box</Badge>}</td>
                      <td className="px-3 capitalize text-muted">{o.condition}</td>
                      <td className="px-3"><Badge size="sm">{o.is_fba ? "FBA" : "FBM"}</Badge></td>
                      <td className="px-4 text-right num">{money(o.price, p.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState compact icon={ShoppingCart} title="No offers retrieved" description="Fetch Keepa history with “Offers” switched on to list current sellers and prices." action={<Button variant="secondary" size="sm" onClick={() => goTab("history")}>Go to history</Button>} />}
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Opportunity score */
export function ScoreTab({ p }: TabProps) {
  const sc = p.score_components;
  if (!sc) return <Card><EmptyState icon={Gauge} title="This product hasn't been scored" description="Scores are calculated from price, sales signals, competition, history, suppliers and eligibility. Refresh the product to score it." /></Card>;
  const all = Object.entries(sc.factors).map(([k, f]) => ({ key: k, ...f }));
  const scored = all.filter((f) => f.score != null && !f.missing).sort((a, b) => b.weight - a.weight);
  const missing = all.filter((f) => f.score == null || f.missing);
  const wsum = scored.reduce((s, f) => s + f.weight, 0) || 1;
  const total = all.reduce((s, f) => s + f.weight, 0);
  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-5 p-5 md:flex-row md:items-center">
        <ScoreRing score={sc.score} size={96} stroke={8} label="Opportunity score" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold">Opportunity score {sc.score ?? "—"}/100</h3><SourceBadge classification="estimated" /><Badge tone={sc.confidence === "high" ? "success" : sc.confidence === "medium" ? "warning" : "danger"} size="sm">{sc.confidence} confidence</Badge></div>
          <p className="text-[13px] leading-relaxed text-muted">{sc.summary}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-subtle"><span className="num">{scored.length} of {all.length} factors scored ({Math.round(sc.coverage * 100)}% of weight)</span><span>·</span><span>{sc.disclaimer}</span></div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader eyebrow="Breakdown" title="Scored factors" description="Weights are renormalised across the factors that have data, so missing inputs are never guessed." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead><tr className="border-y border-line bg-surface-2 text-2xs uppercase tracking-[0.06em] text-subtle">
              <th className="px-5 py-2 text-left font-semibold">Factor</th><th className="px-3 text-right font-semibold">Weight</th><th className="px-3 text-right font-semibold">Effective</th>
              <th className="w-[200px] px-3 text-left font-semibold">Value</th><th className="px-3 text-right font-semibold">Contribution</th><th className="px-5 text-left font-semibold">Why</th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {scored.map((f) => {
                const tone = scoreTone(f.score);
                return (
                  <tr key={f.key}>
                    <td className="px-5 py-3 font-medium">{f.label}</td>
                    <td className="px-3 text-right text-muted num">{f.weight}/{total}</td>
                    <td className="px-3 text-right num">{pct((f.weight / wsum) * 100, 1)}</td>
                    <td className="px-3"><div className="flex items-center gap-2"><Progress value={f.score ?? 0} tone={tone === "neutral" ? "primary" : tone} className="flex-1" /><span className="w-8 text-right font-medium num">{f.score}</span></div></td>
                    <td className="px-3 text-right font-medium num">{(((f.score ?? 0) * f.weight) / wsum).toFixed(1)}</td>
                    <td className="max-w-[420px] px-5 py-3 text-muted">{f.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {missing.length > 0 && (
        <Card>
          <CardHeader eyebrow="Excluded" title={`${missing.length} factor${missing.length === 1 ? "" : "s"} not scored`} description="These are left out of the score rather than estimated. Add the data to include them." />
          <CardBody>
            <ul className="grid gap-2 md:grid-cols-2">
              {missing.map((f: ScoreFactor & { key: string }) => (
                <li key={f.key} className="flex items-start gap-3 rounded-xl border border-dashed border-line p-3">
                  <CircleSlash className="mt-0.5 size-4 shrink-0 text-subtle" />
                  <div className="min-w-0"><div className="text-[13px] font-medium">{f.label} <span className="font-normal text-subtle num">· weight {f.weight}</span></div><div className="text-xs text-muted">{f.reason.replace(/^Not scored — /, "Needs: ")}</div></div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
      <p className={cn("text-xs text-subtle")}>A negative estimated margin caps the score at 25. Scores update whenever the product is refreshed, a unit cost is set, a supplier is linked or eligibility is recorded.</p>
    </div>
  );
}
