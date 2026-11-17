"use client";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowRight, Bell, Building2, Coins, Compass, Gauge, PackageSearch, Search, ShieldCheck, Sparkles, TrendingUp, Upload, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { productColumns, type ProductBrief } from "@/components/app/product";
import { CategoryChart, TrendArea } from "@/components/ui/charts";
import { DataTable } from "@/components/ui/data-table";
import { BarList, EmptyState, ErrorState, MetricCard, ScorePill, SourceBadge } from "@/components/ui/data";
import { Badge, Button, Card, CardBody, CardHeader, Skeleton, Textarea } from "@/components/ui/primitives";
import { get } from "@/lib/api";
import { SUPPLIER_STATUS } from "@/components/app/supplier";
import { useSession } from "@/lib/session";
import { ago, money, num } from "@/lib/utils";

type Dash = {
  kpis: Record<string, { value: number | null; trend?: number[]; delta?: number | null; classification?: string }>;
  top_opportunities: ProductBrief[]; categories: { category: string; products: number; avg_score: number | null; revenue: number | null; avg_reviews: number | null }[];
  market_trend: { week: string; avg_units: number | null; avg_price: number | null; samples: number }[];
  suppliers: { id: number; name: string; country: string; status: string; type: string; score: number | null; risk_level: string; matched_products: number; registry_checked: boolean; vat_valid: boolean | null }[];
  activity: { kind: string; title: string; body: string; at: string }[];
};


function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function AssistantPanel() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const prompts = ["Which of my products have strong demand and manageable competition?", "Compare my top three opportunities", "Which suppliers carry the most risk, and why?", "Explain why my lowest-scoring product scores badly"];
  const go = (text: string) => router.push(`/assistant?q=${encodeURIComponent(text)}`);
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(500px 220px at 100% 0%, rgb(var(--violet) / 0.12), transparent 70%)" }} />
      <CardHeader eyebrow={<span className="inline-flex items-center gap-1.5 text-violet"><Sparkles className="size-3.5" />AI research assistant</span>} title="Ask about your products, markets and suppliers"
        description="Answers come from your workspace data, with the records cited, assumptions and confidence." />
      <CardBody className="relative space-y-3">
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()); }} className="space-y-2">
          <Textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Is the grey divan bed worth sourcing at £70 landed?" className="min-h-[72px]" />
          <div className="flex justify-end"><Button type="submit" disabled={!q.trim()}><Sparkles />Ask</Button></div>
        </form>
        <div className="flex flex-wrap gap-2">{prompts.map((p) => <button key={p} onClick={() => go(p)} className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-left text-xs text-muted transition-colors hover:border-line-strong hover:text-fg">{p}</button>)}</div>
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const { me, marketplace, marketplaces, currency } = useSession();
  const router = useRouter();
  const q = useQuery({ queryKey: ["dashboard", marketplace], queryFn: () => get<Dash>("/dashboard", { marketplace }) });
  const d = q.data;
  const mName = marketplaces.find((m) => m.code === marketplace)?.name ?? `Amazon ${marketplace}`;
  const k = d?.kpis;
  const empty = d && k?.products_analysed.value === 0;
  const trend = (d?.market_trend ?? []).filter((w) => w.samples > 0);
  const first = me?.user.name?.split(" ")[0];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-2xs font-semibold uppercase tracking-[0.1em] text-subtle">{greeting()}{first ? `, ${first}` : ""}</div>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight md:text-[28px]">Your Amazon intelligence workspace</h1>
          <p className="mt-1.5 text-sm text-muted">{mName} · {me?.active_org?.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild><Link href="/products?import=1"><Upload />Import products</Link></Button>
          <Button asChild><Link href="/research"><Search />Research products</Link></Button>
        </div>
      </div>

      {q.error ? <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card> : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
          <MetricCard loading={!d} label="Products analysed" icon={PackageSearch} value={num(k?.products_analysed.value)} trend={k?.products_analysed.trend} delta={k?.products_analysed.delta} deltaLabel="vs last week" tooltip="Products in your workspace for this marketplace." href="/products" />
          <MetricCard loading={!d} label="Potential opportunities" icon={Compass} tone="success" value={num(k?.opportunities.value)} tooltip="Products with an opportunity score of 65 or more." href="/opportunities" />
          <MetricCard loading={!d} label="Avg opportunity score" icon={Gauge} tone="violet" value={k?.avg_score.value ?? "—"} tooltip="Average 0–100 score across scored products. Scores exclude missing factors rather than guessing them." />
          <MetricCard loading={!d} label="Est. monthly revenue" icon={TrendingUp} tone="cyan" value={money(k?.est_monthly_revenue.value, currency, { compact: true })} tooltip="Sum of estimated monthly revenue for products scoring 65+. Estimates, not Amazon figures." source={{ classification: "estimated" }} />
          <MetricCard loading={!d} label="Potential net profit" icon={Wallet} tone="success" value={money(k?.potential_net_profit.value, currency, { compact: true })} tooltip="Estimated profit per unit × estimated units for opportunities. Uses your unit costs where set, otherwise an assumed cost." source={{ classification: "estimated" }} />
          <MetricCard loading={!d} label="Suppliers discovered" icon={Building2} tone="warning" value={num(k?.suppliers.value)} trend={k?.suppliers.trend} delta={k?.suppliers.delta} deltaLabel="vs last week" href="/suppliers" />
        </div>
      )}

      {empty && (
        <Card>
          <EmptyState icon={Coins} title="Start by bringing products in" description="Search Amazon by keyword, ASIN, EAN or URL (needs Keepa, SP-API or PA-API), or import a CSV or the Product Pilot extension export. Every metric below fills from real data."
            action={<><Button asChild><Link href="/research"><Search />Research products</Link></Button><Button variant="secondary" asChild><Link href="/settings?tab=integrations">Connect data sources</Link></Button></>} />
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader eyebrow="Market intelligence" title="Demand trend across tracked products" description="Weekly average of estimated monthly units, from daily tracking snapshots."
            action={<SourceBadge classification="estimated" />} />
          <CardBody>
            {!d ? <Skeleton className="h-[220px] w-full" /> : trend.length > 1 ? (
              <TrendArea data={trend} x="week" y="avg_units" height={220} valueFormat={(v) => num(v, { compact: true })} xFormat={(w) => new Date(w).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} />
            ) : <EmptyState compact icon={Activity} title="No trend yet" description="Track products to build weekly demand and price trends from real snapshots." action={<Button variant="secondary" asChild><Link href="/tracker">Open Product Tracker</Link></Button>} />}
          </CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Category opportunities" title="Where your best scores are" action={<Button variant="ghost" size="sm" asChild><Link href="/market">Market overview<ArrowRight /></Link></Button>} />
          <CardBody>
            {!d ? <Skeleton className="h-[220px] w-full" /> : d.categories.length ? (
              <CategoryChart height={230} horizontal data={d.categories.slice(0, 6).map((c) => ({ ...c, category: c.category.length > 22 ? c.category.slice(0, 21) + "…" : c.category }))} x="category" series={[{ key: "avg_score", label: "Avg score", tone: "primary" }]} valueFormat={(v) => String(Math.round(v))} />
            ) : <EmptyState compact title="No categories yet" description="Categories appear once products are in your workspace." />}
          </CardBody>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader eyebrow="Top product opportunities" title="Highest-scoring products" description="Click a product for its full intelligence profile. Scores explain themselves on the product page."
          action={<Button variant="ghost" size="sm" asChild><Link href="/opportunities">Opportunity Finder<ArrowRight /></Link></Button>} />
        <DataTable className="rounded-none border-x-0 border-b-0 shadow-none" columns={productColumns({ compact: true })} data={d?.top_opportunities ?? []} loading={!d} onRowClick={(p) => router.push(`/products/${p.id}`)} getRowId={(p) => String(p.id)}
          empty={<EmptyState compact title="No scored products yet" description="Research or import products to see ranked opportunities." />} />
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader eyebrow="Supplier intelligence" title="Recently added suppliers" action={<Button variant="ghost" size="sm" asChild><Link href="/suppliers">All suppliers<ArrowRight /></Link></Button>} />
          <CardBody className="space-y-1">
            {!d ? <Skeleton className="h-40 w-full" /> : d.suppliers.length ? d.suppliers.map((s) => {
              const st = SUPPLIER_STATUS[s.status] ?? SUPPLIER_STATUS.unverified;
              return (
                <Link key={s.id} href={`/suppliers/${s.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-2">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-xs font-semibold text-muted">{s.name.slice(0, 2).toUpperCase()}</div>
                  <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-medium">{s.name}</div><div className="text-2xs text-subtle">{s.country} · {s.type.replace(/_/g, " ")} · {s.matched_products} matched product{s.matched_products === 1 ? "" : "s"}</div></div>
                  <Badge tone={st.tone} size="sm">{st.label}</Badge>
                </Link>
              );
            }) : <EmptyState compact icon={ShieldCheck} title="No suppliers yet" description="Find manufacturers and distributors, then verify them against public registers." action={<Button variant="secondary" asChild><Link href="/suppliers">Find suppliers</Link></Button>} />}
          </CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Recent activity" title="What changed" action={<Button variant="ghost" size="sm" asChild><Link href="/alerts">Alerts<ArrowRight /></Link></Button>} />
          <CardBody>
            {!d ? <Skeleton className="h-40 w-full" /> : d.activity.length ? (
              <ol className="relative space-y-4 border-l border-line pl-4">
                {d.activity.map((a, i) => (
                  <li key={i} className="relative"><span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-surface bg-primary" />
                    <div className="text-[13px] font-medium">{a.title}</div>{a.body && <div className="truncate text-xs text-muted">{a.body}</div>}<div className="mt-0.5 text-2xs text-subtle">{ago(a.at)}</div></li>
                ))}
              </ol>
            ) : <EmptyState compact icon={Bell} title="Quiet so far" description="Price, rank, buy-box and supplier changes show up here." />}
          </CardBody>
        </Card>
        <AssistantPanel />
      </div>
    </div>
  );
}
