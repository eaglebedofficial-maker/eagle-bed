"use client";
/* Market Overview: category, brand, price-band and competition aggregates across the workspace's products. */
import { useQuery } from "@tanstack/react-query";
import { Boxes, Coins, Globe2, Layers, Radar, Search, Swords, Tags, Upload } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { CategoryChart, Donut } from "@/components/ui/charts";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { BarList, EmptyState, MetricCard, PageHeader, ScorePill, SourceBadge } from "@/components/ui/data";
import { Button, Card, CardBody, CardHeader, Segmented, Skeleton } from "@/components/ui/primitives";
import { get } from "@/lib/api";
import { useSession } from "@/lib/session";
import { currencySymbol, money, num } from "@/lib/utils";
import { ApiErrorView } from "./common";

type Cat = { category: string; products: number; revenue: number | null; units: number | null; avg_price: number | null; avg_reviews: number | null; avg_rating: number | null; avg_score: number | null; avg_offers: number | null; share: number | null };
type Market = {
  categories: Cat[]; brands: { brand: string; products: number; revenue: number | null; share: number | null }[]; competition: Record<string, number>;
  price_bands: { band: string; products: number; revenue: number | null }[]; classification: string; basis: string;
};

export function MarketOverviewPage() {
  const { marketplace, marketplaces, currency } = useSession();
  const q = useQuery({ queryKey: ["market", marketplace], queryFn: () => get<Market>("/market", { marketplace }) });
  const [bandMetric, setBandMetric] = React.useState<"products" | "revenue">("products");
  const [catMetric, setCatMetric] = React.useState<"revenue" | "products" | "avg_score">("revenue");
  const d = q.data;
  const src = d ? { classification: "estimated", provider: "Your workspace products", note: d.basis } : null;
  const mName = marketplaces.find((m) => m.code === marketplace)?.name ?? `Amazon ${marketplace}`;
  const totalProducts = d?.categories.reduce((a, c) => a + c.products, 0) ?? 0;
  const totalRev = d?.categories.reduce((a, c) => a + (c.revenue ?? 0), 0) ?? 0;
  const empty = d && !d.categories.length && !d.price_bands.length;
  const sym = currencySymbol(currency);

  const cols = React.useMemo<ColumnDef<Cat, any>[]>(() => [
    { id: "category", header: "Category", accessorKey: "category", enableHiding: false, cell: ({ getValue }) => <span className="block min-w-[180px] font-medium">{getValue()}</span> },
    { id: "products", header: "Products", accessorKey: "products", meta: { align: "right" } },
    { id: "revenue", header: "Est. revenue / mo", accessorKey: "revenue", meta: { align: "right" }, cell: ({ getValue }) => money(getValue(), currency, { compact: true }) },
    { id: "share", header: "Share", accessorKey: "share", meta: { align: "right" }, cell: ({ getValue }) => getValue() == null ? "—" : `${(getValue() * 100).toFixed(1)}%` },
    { id: "units", header: "Est. units / mo", accessorKey: "units", meta: { align: "right" }, cell: ({ getValue }) => num(getValue(), { compact: true }) },
    { id: "avg_price", header: "Avg price", accessorKey: "avg_price", meta: { align: "right" }, cell: ({ getValue }) => money(getValue(), currency) },
    { id: "avg_reviews", header: "Avg reviews", accessorKey: "avg_reviews", meta: { align: "right" }, cell: ({ getValue }) => num(getValue()) },
    { id: "avg_rating", header: "Avg rating", accessorKey: "avg_rating", meta: { align: "right" }, cell: ({ getValue }) => getValue() == null ? "—" : Number(getValue()).toFixed(2) },
    { id: "avg_offers", header: "Avg sellers", accessorKey: "avg_offers", meta: { align: "right" }, cell: ({ getValue }) => getValue() == null ? "—" : Number(getValue()).toFixed(1) },
    { id: "avg_score", header: "Avg score", accessorKey: "avg_score", meta: { align: "right" }, cell: ({ getValue }) => <ScorePill score={getValue()} /> },
  ], [currency]);

  const compData = d ? (["low", "medium", "high"] as const).filter((k) => d.competition[k]).map((k) => ({ name: k[0].toUpperCase() + k.slice(1), value: d.competition[k], tone: k === "low" ? "success" : k === "medium" ? "warning" : "danger" })) : [];
  const catChart = (d?.categories ?? []).filter((c) => c[catMetric] != null).sort((a, b) => (b[catMetric] ?? 0) - (a[catMetric] ?? 0)).slice(0, 10)
    .map((c) => ({ category: c.category.length > 24 ? c.category.slice(0, 23) + "…" : c.category, value: c[catMetric] ?? 0 }));
  const catFmt = (v: number) => catMetric === "revenue" ? money(v, currency, { compact: true }) : catMetric === "avg_score" ? String(Math.round(v)) : num(v);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Overview" title="Market Overview"
        description={`Where demand and competition sit across the products you've researched in ${mName}: categories, brands, price bands and competition levels. Revenue and units are Kestrel estimates.`}
        actions={<><Button variant="secondary" asChild><Link href="/market-tracker"><Radar />Market Tracker</Link></Button><Button asChild><Link href="/research"><Search />Research products</Link></Button></>} />

      {q.error ? <Card><ApiErrorView error={q.error} onRetry={() => q.refetch()} /></Card> : empty ? (
        <Card><EmptyState icon={Globe2} title={`No products in ${mName} yet`} description="Market Overview aggregates the products in your workspace. Research products by keyword, ASIN or URL, or import a CSV, and this page fills in."
          action={<><Button asChild><Link href="/research"><Search />Research products</Link></Button><Button variant="secondary" asChild><Link href="/products?import=1"><Upload />Import products</Link></Button></>} /></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard loading={!d} label="Categories" icon={Layers} value={num(d?.categories.length)} sub={d && d.categories.length >= 40 ? <span>top 40 by revenue</span> : undefined} />
            <MetricCard loading={!d} label="Products analysed" icon={Boxes} tone="cyan" value={num(totalProducts)} />
            <MetricCard loading={!d} label="Est. monthly revenue" icon={Coins} tone="success" value={money(totalRev || null, currency, { compact: true })} source={src} tooltip="Sum of estimated monthly revenue across categorised products. Estimates, not Amazon figures." />
            <MetricCard loading={!d} label="Largest category" icon={Tags} tone="violet" value={d?.categories[0]?.share != null ? `${(d.categories[0].share * 100).toFixed(0)}%` : "—"} sub={d?.categories[0] ? <span className="truncate">{d.categories[0].category}</span> : undefined} source={src} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader eyebrow="Categories" title="Top categories" action={<Segmented size="sm" value={catMetric} onChange={setCatMetric} options={[{ value: "revenue", label: "Est. revenue" }, { value: "products", label: "Products" }, { value: "avg_score", label: "Avg score" }]} />} />
              <CardBody>{!d ? <Skeleton className="h-[300px] w-full" /> : catChart.length ? <CategoryChart height={Math.max(220, catChart.length * 30)} horizontal data={catChart} x="category" series={[{ key: "value", label: { revenue: "Est. revenue", products: "Products", avg_score: "Avg score" }[catMetric], tone: catMetric === "revenue" ? "cyan" : catMetric === "avg_score" ? "violet" : "primary" }]} valueFormat={catFmt} />
                : <EmptyState compact title="No categorised products" description="Products need a category from Keepa, SP-API or your import." />}</CardBody>
            </Card>
            <Card>
              <CardHeader eyebrow="Competition" title="Competition levels" description="Kestrel's competition rating per product, from reviews, sellers and rank." action={<SourceBadge classification="estimated" />} />
              <CardBody>{!d ? <Skeleton className="h-[200px] w-full" /> : compData.length ? <Donut height={180} data={compData} valueFormat={(v) => `${num(v)} products`} center={<div><Swords className="mx-auto size-4 text-subtle" /><div className="mt-1 text-[15px] font-semibold num">{num(compData.reduce((a, c) => a + c.value, 0))}</div></div>} />
                : <EmptyState compact title="No competition ratings yet" description="Ratings appear once products are scored." />}</CardBody>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader eyebrow="Price distribution" title={`Products by price band (${sym})`} description="Bands of 50; everything at 500 and above is grouped."
                action={<Segmented size="sm" value={bandMetric} onChange={setBandMetric} options={[{ value: "products", label: "Products" }, { value: "revenue", label: "Est. revenue" }]} />} />
              <CardBody>{!d ? <Skeleton className="h-[240px] w-full" /> : d.price_bands.length ? (
                <CategoryChart height={240} data={d.price_bands.map((b) => ({ band: b.band, value: bandMetric === "products" ? b.products : b.revenue ?? 0 }))} x="band"
                  series={[{ key: "value", label: bandMetric === "products" ? "Products" : "Est. revenue", tone: bandMetric === "products" ? "primary" : "cyan" }]}
                  valueFormat={(v) => bandMetric === "products" ? num(v) : money(v, currency, { compact: true })} />
              ) : <EmptyState compact title="No prices recorded" />}</CardBody>
            </Card>
            <Card>
              <CardHeader eyebrow="Brands" title="Leading brands by est. revenue" action={src && <SourceBadge source={src} />} />
              <CardBody>{!d ? <Skeleton className="h-[240px] w-full" /> : d.brands.some((b) => b.revenue) ? (
                <BarList rows={d.brands.filter((b) => b.revenue).slice(0, 10).map((b) => ({ label: <span>{b.brand} <span className="text-subtle">· {b.products}</span></span>, value: b.revenue ?? 0, tone: "violet" }))} format={(v) => money(v, currency, { compact: true })} />
              ) : <EmptyState compact title="No brand revenue estimates" description="Brands appear once products have brand names and revenue estimates." />}</CardBody>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader eyebrow="Category table" title="Every category in your research" description={d?.basis} action={src && <SourceBadge source={src} />} />
            <DataTable className="rounded-none border-x-0 border-b-0 shadow-none" columns={cols} data={d?.categories ?? []} loading={!d} getRowId={(c) => c.category} storageKey="market-categories" dense
              empty={<EmptyState compact title="No categories yet" />} />
          </Card>
        </>
      )}
    </div>
  );
}
