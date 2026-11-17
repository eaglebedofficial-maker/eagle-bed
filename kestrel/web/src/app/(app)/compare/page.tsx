"use client";
import { useQuery } from "@tanstack/react-query";
import { Download, GitCompareArrows, Plus, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { amazonUrl, CompetitionBadge, ProductThumb } from "@/components/app/product";
import { exportRowsCsv } from "@/components/products/explorer";
import { ProductPicker } from "@/components/products/product-picker";
import type { CompareRow } from "@/components/products/types";
import { EmptyState, ErrorState, PageHeader, ScoreRing, SourceBadge } from "@/components/ui/data";
import { InfoTip, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, Skeleton } from "@/components/ui/primitives";
import { get } from "@/lib/api";
import { cn, dateShort, money, num, pct } from "@/lib/utils";

type Better = "high" | "low" | null;
type Metric = { label: string; value: (p: CompareRow) => number | null | undefined; show?: (p: CompareRow) => React.ReactNode; better: Better; help?: string; estimate?: boolean };
const COMP_RANK: Record<string, number> = { low: 1, medium: 2, high: 3 };

const GROUPS: { title: string; rows: Metric[] }[] = [
  { title: "Demand", rows: [
    { label: "Price", value: (p) => p.price, show: (p) => money(p.price, p.currency), better: null },
    { label: "Est. monthly units", value: (p) => p.units, show: (p) => p.units == null ? "—" : <span>{num(p.units)}<span className="block text-2xs text-subtle">{num(p.units_low)}–{num(p.units_high)}</span></span>, better: "high", estimate: true },
    { label: "Est. monthly revenue", value: (p) => p.revenue, show: (p) => money(p.revenue, p.currency, { compact: true }), better: "high", estimate: true },
    { label: "Best Sellers Rank", value: (p) => p.bsr, show: (p) => p.bsr ? `#${num(p.bsr)}` : "—", better: "low" },
    { label: "Bought in past month", value: (p) => p.bought_past_month, show: (p) => p.bought_past_month ? `${num(p.bought_past_month)}+` : "—", better: "high", help: "Amazon's published “bought in past month” figure, where shown." },
    { label: "BSR movement (90d)", value: (p) => p.history.bsr_movement_pct, show: (p) => p.history.bsr_movement_pct == null ? "—" : `${p.history.bsr_movement_pct > 0 ? "+" : ""}${p.history.bsr_movement_pct.toFixed(1)}%`, better: "high", help: "Positive means the rank improved over the last 90 days." },
  ] },
  { title: "Competition", rows: [
    { label: "Reviews", value: (p) => p.reviews, show: (p) => num(p.reviews), better: "low", help: "Fewer reviews means a lower barrier for a new seller." },
    { label: "Rating", value: (p) => p.rating, show: (p) => p.rating ? `${p.rating.toFixed(1)}★` : "—", better: "high" },
    { label: "Offers", value: (p) => p.offers, show: (p) => num(p.offers), better: "low" },
    { label: "FBA / FBM offers", value: () => null, show: (p) => p.fba_offers == null && p.fbm_offers == null ? "—" : `${num(p.fba_offers)} / ${num(p.fbm_offers)}`, better: null },
    { label: "Competition", value: (p) => COMP_RANK[p.competition] ?? null, show: (p) => <CompetitionBadge level={p.competition} />, better: "low" },
    { label: "Amazon sells", value: (p) => p.amazon_sells == null ? null : p.amazon_sells ? 1 : 0, show: (p) => p.amazon_sells == null ? "—" : p.amazon_sells ? <Badge tone="warning" size="sm">Yes</Badge> : "No", better: "low" },
    { label: "Buy box stability (90d)", value: (p) => p.history.buybox_stability, show: (p) => p.history.buybox_stability == null ? "—" : pct(p.history.buybox_stability * 100), better: null, help: "Share of time the leading seller held the buy box." },
    { label: "Listing quality", value: (p) => p.listing_quality, show: (p) => p.listing_quality == null ? "—" : `${Math.round(p.listing_quality)}/100`, better: "high" },
  ] },
  { title: "Profitability (estimates)", rows: [
    { label: "Est. profit / unit", value: (p) => p.profit, show: (p) => p.profit == null ? "—" : <span>{money(p.profit, p.currency)}{p.cost_assumed && <span className="text-subtle">*</span>}</span>, better: "high", estimate: true },
    { label: "Est. margin", value: (p) => p.margin, show: (p) => pct(p.margin), better: "high", estimate: true },
    { label: "Est. ROI", value: (p) => p.roi, show: (p) => pct(p.roi), better: "high", estimate: true },
    { label: "FBA fee", value: (p) => p.fba_fee, show: (p) => money(p.fba_fee, p.currency), better: "low" },
    { label: "Referral fee", value: (p) => p.referral_fee, show: (p) => money(p.referral_fee, p.currency), better: "low" },
    { label: "Unit cost", value: () => null, show: (p) => p.unit_cost != null ? money(p.unit_cost, p.currency) : <span className="text-subtle">Assumed</span>, better: null },
  ] },
  { title: "Stability & history", rows: [
    { label: "Avg price (90d)", value: (p) => p.history.avg_price_90, show: (p) => money(p.history.avg_price_90, p.currency), better: null },
    { label: "Avg BSR (90d)", value: (p) => p.history.avg_bsr_90, show: (p) => p.history.avg_bsr_90 ? `#${num(p.history.avg_bsr_90)}` : "—", better: "low" },
    { label: "Price stability", value: (p) => p.price_stability, show: (p) => p.price_stability == null ? "—" : `${Math.round(p.price_stability * 100)}/100`, better: "high" },
    { label: "Sales consistency", value: (p) => p.sales_consistency, show: (p) => p.sales_consistency == null ? "—" : `${Math.round(p.sales_consistency * 100)}/100`, better: "high" },
    { label: "Seasonality", value: (p) => p.seasonality, show: (p) => p.seasonality == null ? "—" : `${Math.round(p.seasonality * 100)}/100`, better: "low", help: "Lower means steadier demand through the year." },
  ] },
  { title: "Product & sourcing", rows: [
    { label: "Opportunity score", value: (p) => p.score, show: (p) => p.score ?? "—", better: "high", estimate: true },
    { label: "Linked suppliers", value: (p) => p.supplier_count, show: (p) => num(p.supplier_count), better: "high" },
    { label: "Size tier", value: () => null, show: (p) => p.size_tier || "—", better: null },
    { label: "Weight", value: (p) => p.weight_g, show: (p) => p.weight_g ? `${(p.weight_g / 1000).toFixed(2)} kg` : "—", better: "low" },
    { label: "Variations", value: (p) => p.variations, show: (p) => num(p.variations), better: null },
    { label: "Listed since", value: () => null, show: (p) => dateShort(p.listed_at), better: null },
    { label: "Category", value: () => null, show: (p) => <span className="line-clamp-2">{p.category || "—"}</span>, better: null },
    { label: "Data source", value: () => null, show: (p) => <SourceBadge source={{ provider: p.source, classification: p.classification, retrieved_at: p.last_refreshed_at }} />, better: null },
  ] },
];

function bestIds(rows: CompareRow[], m: Metric): Set<number> {
  if (!m.better) return new Set();
  const vals = rows.map((p) => ({ id: p.id, v: m.value(p) })).filter((x): x is { id: number; v: number } => x.v != null && Number.isFinite(x.v));
  if (vals.length < 2) return new Set();
  const target = m.better === "high" ? Math.max(...vals.map((x) => x.v)) : Math.min(...vals.map((x) => x.v));
  if (vals.every((x) => x.v === target)) return new Set();
  return new Set(vals.filter((x) => x.v === target).map((x) => x.id));
}

function CompareInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const ids = (sp.get("ids") || "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 10);
  const [picker, setPicker] = useState(false);
  const setIds = (next: number[]) => router.replace(next.length ? `/compare?ids=${next.join(",")}` : "/compare");
  const q = useQuery({ queryKey: ["compare", ids.join(",")], queryFn: () => get<CompareRow[]>("/compare", { ids }), enabled: ids.length > 0 });
  const rows = q.data ?? [];
  const wins = new Map<number, number>();
  if (rows.length > 1) GROUPS.flatMap((g) => g.rows).forEach((m) => bestIds(rows, m).forEach((id) => wins.set(id, (wins.get(id) ?? 0) + 1)));
  const leader = [...wins.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Product intelligence" title="Product Comparison"
        description="Compare up to 10 products side by side. The best value in each row is highlighted where a direction is meaningful; estimates are marked."
        actions={<>
          {rows.length > 0 && <Button variant="secondary" onClick={() => exportRowsCsv(rows, "product-comparison")}><Download />Export CSV</Button>}
          <Tooltip content={ids.length >= 10 ? "Compare up to 10 products at a time" : undefined}><span><Button disabled={ids.length >= 10} onClick={() => setPicker(true)}><Plus />Add products</Button></span></Tooltip>
        </>} />

      {ids.length === 0 ? (
        <Card><EmptyState icon={GitCompareArrows} title="Pick products to compare" description="Choose 2–10 products from your workspace. You can also select products in Product Research or the Product Database and press Compare."
          action={<><Button onClick={() => setPicker(true)}><Plus />Choose products</Button><Button variant="secondary" asChild><Link href="/products">Open Product Database</Link></Button></>} /></Card>
      ) : q.error ? <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card>
        : q.isLoading ? <Card className="p-5"><div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${ids.length}, minmax(180px, 1fr))` }}>{Array.from({ length: (ids.length + 1) * 6 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div></Card>
        : (
          <>
            {rows.length === 1 && <Card className="flex flex-wrap items-center gap-3 p-4 text-[13px] text-muted"><GitCompareArrows className="size-4 text-primary" />Add at least one more product to highlight the best values.<Button size="sm" variant="secondary" className="ml-auto" onClick={() => setPicker(true)}><Plus />Add product</Button></Card>}
            {leader && rows.length > 1 && (
              <Card className="flex flex-wrap items-center gap-3 p-4">
                <Trophy className="size-4 text-warning" />
                <span className="text-[13px]"><b>{rows.find((r) => r.id === leader[0])?.title.slice(0, 80) || "—"}</b> <span className="text-muted">leads on {leader[1]} of the compared metrics. Wins aren't weighted; check the opportunity score breakdown on each product for a weighted view.</span></span>
              </Card>
            )}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-[13px]">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-20 min-w-[170px] border-b border-r border-line bg-surface p-3 text-left align-bottom text-2xs font-semibold uppercase tracking-[0.06em] text-subtle">Metric</th>
                      {rows.map((p) => (
                        <th key={p.id} className="min-w-[200px] border-b border-line p-3 text-left align-top font-normal">
                          <div className="flex items-start gap-2">
                            <ProductThumb src={p.image_url} size={44} />
                            <div className="min-w-0 flex-1">
                              <Link href={`/products/${p.id}`} className="line-clamp-2 text-[13px] font-medium leading-snug hover:text-primary">{p.title || p.asin}</Link>
                              <a href={amazonUrl(p)} target="_blank" rel="noreferrer" className="mt-0.5 block font-mono text-2xs text-subtle hover:text-primary">{p.asin}</a>
                            </div>
                            <Button variant="ghost" size="icon-sm" aria-label={`Remove ${p.asin}`} onClick={() => setIds(ids.filter((i) => i !== p.id))}><X /></Button>
                          </div>
                          <div className="mt-2 flex items-center gap-2"><ScoreRing score={p.score} size={34} stroke={3} /><span className="text-xs text-muted">{wins.get(p.id) ?? 0} best values</span></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {GROUPS.map((g) => (
                      <GroupRows key={g.title} title={g.title} metrics={g.rows} rows={rows} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="text-xs text-subtle">* Profit uses an assumed unit cost (25% of price ex VAT) where you haven't entered one. Estimates are Kestrel models, not Amazon figures.</p>
          </>
        )}

      <ProductPicker open={picker} onOpenChange={setPicker} title="Add products to compare" max={10 - ids.length} exclude={ids} confirmLabel="Compare"
        onConfirm={(items) => { setIds([...ids, ...items.map((p) => p.id)].slice(0, 10)); setPicker(false); }} />
    </div>
  );
}

function GroupRows({ title, metrics, rows }: { title: string; metrics: Metric[]; rows: CompareRow[] }) {
  return (
    <>
      <tr><td colSpan={rows.length + 1} className="sticky left-0 border-b border-line bg-surface-2 px-3 py-2 text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">{title}</td></tr>
      {metrics.map((m) => {
        const best = bestIds(rows, m);
        return (
          <tr key={m.label} className="hover:bg-surface-2/50">
            <td className="sticky left-0 z-10 border-b border-r border-line bg-surface px-3 py-2.5 text-muted">
              <span className="inline-flex items-center gap-1.5">{m.label}{m.estimate && <span className="text-2xs text-warning">est.</span>}{m.help && <InfoTip content={m.help} />}</span>
            </td>
            {rows.map((p) => (
              <td key={p.id} className={cn("border-b border-line px-3 py-2.5 num", best.has(p.id) && "bg-success-soft font-semibold text-success")}>
                {m.show ? m.show(p) : String(m.value(p) ?? "—")}
              </td>
            ))}
          </tr>
        );
      })}
    </>
  );
}

export default function ComparePage() {
  return <Suspense><CompareInner /></Suspense>;
}
