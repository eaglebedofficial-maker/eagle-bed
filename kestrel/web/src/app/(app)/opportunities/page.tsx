"use client";
import { useQuery } from "@tanstack/react-query";
import { Activity, Compass, LayoutGrid, Rows3, Search, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AmazonLink, CompetitionBadge, ProductThumb, useTrack } from "@/components/app/product";
import { BulkActions, NO_ROWS, researchColumns } from "@/components/products/explorer";
import type { OpportunityItem, OpportunityResponse } from "@/components/products/types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, ErrorState, PageHeader, ScoreRing, SourceBadge } from "@/components/ui/data";
import { Tabs, Tooltip } from "@/components/ui/overlay";
import { Button, Card, Segmented, Skeleton } from "@/components/ui/primitives";
import { get } from "@/lib/api";
import { useSession } from "@/lib/session";
import { money, num, pct } from "@/lib/utils";

const KINDS: { value: string; label: string; description: string; empty: string }[] = [
  { value: "high_demand_low_competition", label: "High demand, low competition", description: "300+ estimated units a month with 300 reviews or fewer.", empty: "No products clear 300 estimated units with 300 or fewer reviews yet." },
  { value: "consistent_sales", label: "Consistent sales", description: "Sales-rank history consistency of 0.7 or more.", empty: "Needs rank history. Connect Keepa or track products to build it." },
  { value: "improving_demand", label: "Improving demand", description: "Best Sellers Rank improved 15%+ over the last 90 days.", empty: "Needs rank history from Keepa covering at least 90 days." },
  { value: "stable_prices", label: "Stable prices", description: "Price stability of 0.8 or more across retrieved history.", empty: "Needs price history. Connect Keepa or track products to build it." },
  { value: "weak_listings", label: "Weak competitor listings", description: "Rating under 4.2, or listing quality under 60/100.", empty: "No weak listings found among products with ratings or listing-quality data." },
  { value: "differentiation", label: "Room to differentiate", description: "Rating under 4.3 with 50+ reviews: buyers are telling you what to fix.", empty: "No products with 50+ reviews and a rating under 4.3 yet." },
  { value: "multiple_suppliers", label: "Multiple suppliers", description: "Two or more distinct suppliers linked to the product.", empty: "Link supplier products to your products from Supplier Finder to see this." },
  { value: "wholesale_margin", label: "Wholesale margins", description: "20%+ estimated margin with your unit cost entered and 2+ sellers.", empty: "Enter unit costs on products (product page → Set unit cost) to unlock this." },
  { value: "private_label", label: "Private-label potential", description: "150+ estimated units, 500 reviews or fewer, Amazon not selling, 20%+ estimated margin.", empty: "No products meet all four private-label criteria yet." },
];

function OppCard({ p }: { p: OpportunityItem }) {
  const track = useTrack();
  const { can } = useSession();
  return (
    <Card className="flex flex-col p-4 transition-colors hover:border-line-strong">
      <div className="flex items-start gap-3">
        <ProductThumb src={p.image_url} size={56} />
        <div className="min-w-0 flex-1">
          <Link href={`/products/${p.id}`} className="line-clamp-2 text-[13px] font-medium leading-snug hover:text-primary">{p.title || p.asin}</Link>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-2xs text-subtle"><span className="font-mono">{p.asin}</span>{p.brand && <span>· {p.brand}</span>}</div>
        </div>
        <ScoreRing score={p.score} size={46} label="Opportunity score" />
      </div>
      {p.why && <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted">{p.why}</p>}
      <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 border-t border-line pt-3 text-xs">
        <div><dt className="text-subtle">Price</dt><dd className="mt-0.5 font-medium num">{money(p.price, p.currency)}</dd></div>
        <div><dt className="text-subtle">Units / mo <span className="text-warning">est.</span></dt><dd className="mt-0.5 font-medium num">{num(p.units)}</dd></div>
        <div><dt className="text-subtle">Revenue <span className="text-warning">est.</span></dt><dd className="mt-0.5 font-medium num">{money(p.revenue, p.currency, { compact: true })}</dd></div>
        <div><dt className="text-subtle">Reviews</dt><dd className="mt-0.5 font-medium num">{num(p.reviews)}{p.rating ? <span className="text-subtle"> · {p.rating.toFixed(1)}★</span> : null}</dd></div>
        <div><dt className="text-subtle">Margin <span className="text-warning">est.</span></dt><dd className="mt-0.5 font-medium num">{pct(p.margin)}{p.cost_assumed && p.margin != null && <Tooltip content="Uses an assumed unit cost (25% of price ex VAT)."><span className="cursor-help text-subtle">*</span></Tooltip>}</dd></div>
        <div><dt className="text-subtle">Competition</dt><dd className="mt-0.5"><CompetitionBadge level={p.competition} /></dd></div>
      </dl>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
        <SourceBadge source={{ provider: p.source, classification: p.classification, retrieved_at: p.last_refreshed_at }} />
        <div className="ml-auto flex gap-1">
          <Tooltip content={!can("analyst") ? "Viewers can't track products" : p.tracked ? "Already tracked" : undefined}>
            <span><Button size="xs" variant="ghost" disabled={!can("analyst") || p.tracked} loading={track.isPending} onClick={() => track.mutate([p.id])}><Activity />{p.tracked ? "Tracked" : "Track"}</Button></span>
          </Tooltip>
          <AmazonLink p={p} />
        </div>
      </div>
    </Card>
  );
}

function OppInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { marketplace } = useSession();
  const kind = KINDS.some((k) => k.value === sp.get("kind")) ? sp.get("kind")! : KINDS[0].value;
  const [view, setView] = useState<"cards" | "table">("cards");
  const [selected, setSelected] = useState<OpportunityItem[]>([]);
  const meta = KINDS.find((k) => k.value === kind)!;
  const q = useQuery({ queryKey: ["opportunities", marketplace, kind], queryFn: () => get<OpportunityResponse>("/opportunities", { kind, marketplace, limit: 60 }) });
  const items = q.data?.[kind]?.items ?? NO_ROWS;
  const whyCol: ColumnDef<OpportunityItem, any> = { id: "why", header: "Why it ranks", accessorKey: "why", cell: ({ getValue }) => <span className="line-clamp-2 block max-w-[320px] text-xs text-muted">{getValue() || "—"}</span> };
  const columns = [...(researchColumns(false) as ColumnDef<OpportunityItem, any>[]), whyCol];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Product intelligence" title="Opportunity Finder"
        description="Products in your workspace that match proven opportunity patterns, ranked by opportunity score. Each one explains why it ranks; open a product to see every scored factor."
        actions={<><Segmented value={view} onChange={setView} options={[{ value: "cards", label: <span className="inline-flex items-center gap-1.5"><LayoutGrid className="size-3.5" />Cards</span> }, { value: "table", label: <span className="inline-flex items-center gap-1.5"><Rows3 className="size-3.5" />Table</span> }]} /><Button asChild><Link href="/research"><Search />Research more</Link></Button></>} />

      <Tabs value={kind} onValueChange={(v) => router.replace(`/opportunities?kind=${v}`)} tabs={KINDS.map((k) => ({ value: k.value, label: k.label }))} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[13px] text-muted"><Sparkles className="size-4 shrink-0 text-primary" />{meta.description}</p>
        <div className="flex items-center gap-2 text-xs text-subtle"><SourceBadge classification="estimated" />Scores and estimates are Kestrel models; a high score is not a guarantee of profit.</div>
      </div>

      {q.error ? <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card>
        : view === "cards" ? (
          q.isLoading ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}</div>
            : items.length === 0 ? <Card><EmptyState icon={Compass} title={`No “${meta.label.toLowerCase()}” opportunities yet`} description={meta.empty}
              action={<><Button asChild><Link href="/research"><Search />Research products</Link></Button><Button variant="secondary" asChild><Link href="/settings?tab=integrations">Connect data sources</Link></Button></>} /></Card>
            : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">{items.map((p) => <OppCard key={p.id} p={p} />)}</div>
        ) : (
          <DataTable<OpportunityItem> storageKey="opportunities" columns={columns} data={items} loading={q.isLoading} selectable onSelectionChange={setSelected}
            getRowId={(p) => String(p.id)} onRowClick={(p) => router.push(`/products/${p.id}`)}
            toolbar={<><span className="text-sm font-semibold">{meta.label}</span><span className="text-xs text-muted num">{items.length} product{items.length === 1 ? "" : "s"}</span><BulkActions rows={selected} /></>}
            empty={<EmptyState compact icon={Star} title="Nothing matches yet" description={meta.empty} />} />
        )}
    </div>
  );
}

export default function OpportunitiesPage() {
  return <Suspense><OppInner /></Suspense>;
}
