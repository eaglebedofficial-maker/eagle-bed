"use client";
/* Shared product building blocks: types, cells, columns, actions. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, ImageOff, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ColumnDef } from "@/components/ui/data-table";
import { ScorePill, SourceBadge } from "@/components/ui/data";
import { Tooltip } from "@/components/ui/overlay";
import { Badge, Button } from "@/components/ui/primitives";
import { errorMessage, post } from "@/lib/api";
import { cn, money, num, pct } from "@/lib/utils";

export type ProductBrief = {
  id: number; asin: string; marketplace: string; title: string; brand: string; category: string; image_url: string; price: number | null; currency: string;
  bsr: number | null; bsr_category: string; rating: number | null; reviews: number | null; offers: number | null; fulfilment: string; amazon_sells: boolean | null;
  units: number | null; units_low: number | null; units_high: number | null; revenue: number | null; profit: number | null; margin: number | null; roi: number | null;
  fba_fee: number | null; size_tier: string; competition: string; score: number | null; bought_past_month: number | null; source: string; classification: string;
  last_refreshed_at: string | null; unit_cost: number | null; cost_assumed: boolean; tracked?: boolean;
};

export const AMAZON_DOMAIN: Record<string, string> = { UK: "amazon.co.uk", US: "amazon.com", DE: "amazon.de", FR: "amazon.fr", IT: "amazon.it", ES: "amazon.es", NL: "amazon.nl", CA: "amazon.ca", AU: "amazon.com.au" };
export const amazonUrl = (p: { asin: string; marketplace: string }) => `https://www.${AMAZON_DOMAIN[p.marketplace] ?? "amazon.co.uk"}/dp/${p.asin}`;

export function ProductThumb({ src, size = 40, className }: { src?: string; size?: number; className?: string }) {
  return (
    <div className={cn("grid shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-white", className)} style={{ width: size, height: size }}>
      {src ? <img src={src} alt="" loading="lazy" className="h-full w-full object-contain" /> : <ImageOff className="size-4 text-slate-300" />}
    </div>
  );
}

export function ProductCell({ p, href = true }: { p: Pick<ProductBrief, "id" | "asin" | "title" | "image_url" | "brand" | "marketplace">; href?: boolean }) {
  const title = <span className="line-clamp-2 text-[13px] font-medium leading-snug text-fg group-hover:text-primary">{p.title || p.asin}</span>;
  return (
    <div className="flex min-w-[260px] max-w-[420px] items-center gap-3 py-1">
      <ProductThumb src={p.image_url} />
      <div className="min-w-0">
        {href ? <Link href={`/products/${p.id}`} className="group" onClick={(e) => e.stopPropagation()}>{title}</Link> : title}
        <div className="mt-0.5 flex items-center gap-1.5 text-2xs text-subtle"><span className="font-mono">{p.asin}</span>{p.brand && <><span>·</span><span className="truncate">{p.brand}</span></>}</div>
      </div>
    </div>
  );
}

export function UnitsCell({ p }: { p: ProductBrief }) {
  if (p.units == null) return <span className="text-subtle">—</span>;
  return (
    <Tooltip content={<div><div className="font-semibold">Estimated monthly units</div><div className="text-muted">Range {num(p.units_low)}–{num(p.units_high)}{p.bought_past_month ? ` · Amazon shows ${num(p.bought_past_month)}+ bought last month` : ""}</div><div className="mt-1 text-muted">An estimate, not an Amazon figure.</div></div>}>
      <span className="cursor-help border-b border-dotted border-line-strong num">{num(p.units)}</span>
    </Tooltip>
  );
}

export function ProfitCell({ p }: { p: ProductBrief }) {
  if (p.profit == null) return <span className="text-subtle">—</span>;
  return (
    <Tooltip content={p.cost_assumed ? "Uses an assumed unit cost of 25% of price (ex VAT). Set your real cost on the product." : "Uses your unit cost."}>
      <span className={cn("cursor-help num", p.profit < 0 ? "text-danger" : "text-fg")}>{money(p.profit, p.currency)}{p.cost_assumed && <span className="ml-0.5 text-subtle">*</span>}</span>
    </Tooltip>
  );
}

export function CompetitionBadge({ level }: { level: string }) {
  if (!level) return <span className="text-subtle">—</span>;
  const tone = level === "low" ? "success" : level === "medium" ? "warning" : "danger";
  return <Badge tone={tone} size="sm" className="capitalize">{level}</Badge>;
}

export function productColumns(opts: { compact?: boolean } = {}): ColumnDef<ProductBrief, any>[] {
  const cols: ColumnDef<ProductBrief, any>[] = [
    { id: "title", header: "Product", accessorKey: "title", enableHiding: false, cell: ({ row }) => <ProductCell p={row.original} /> },
    { id: "category", header: "Category", accessorKey: "category", cell: ({ getValue }) => <span className="block max-w-[160px] truncate text-muted">{getValue() || "—"}</span> },
    { id: "price", header: "Price", accessorKey: "price", meta: { align: "right" }, cell: ({ row: { original: p } }) => money(p.price, p.currency) },
    { id: "units", header: "Units / mo", accessorKey: "units", meta: { align: "right" }, cell: ({ row }) => <UnitsCell p={row.original} /> },
    { id: "revenue", header: "Revenue / mo", accessorKey: "revenue", meta: { align: "right" }, cell: ({ row: { original: p } }) => money(p.revenue, p.currency, { compact: true }) },
    { id: "bsr", header: "BSR", accessorKey: "bsr", meta: { align: "right" }, cell: ({ getValue }) => getValue() ? `#${num(getValue())}` : "—" },
    { id: "reviews", header: "Reviews", accessorKey: "reviews", meta: { align: "right" }, cell: ({ getValue }) => num(getValue()) },
    { id: "rating", header: "Rating", accessorKey: "rating", meta: { align: "right" }, cell: ({ getValue }) => getValue() ? <span className="inline-flex items-center gap-1">{Number(getValue()).toFixed(1)}<Star className="size-3 fill-warning text-warning" /></span> : "—" },
    { id: "profit", header: "Profit / unit", accessorKey: "profit", meta: { align: "right" }, cell: ({ row }) => <ProfitCell p={row.original} /> },
    { id: "roi", header: "ROI", accessorKey: "roi", meta: { align: "right" }, cell: ({ getValue }) => pct(getValue()) },
    { id: "competition", header: "Competition", accessorKey: "competition", cell: ({ getValue }) => <CompetitionBadge level={getValue()} /> },
    { id: "score", header: "Score", accessorKey: "score", meta: { align: "right" }, cell: ({ getValue }) => <ScorePill score={getValue()} /> },
  ];
  if (!opts.compact) cols.splice(1, 0, { id: "brand", header: "Brand", accessorKey: "brand", cell: ({ getValue }) => <span className="block max-w-[120px] truncate">{getValue() || "—"}</span> });
  if (!opts.compact) cols.push({ id: "source", header: "Source", accessorKey: "classification", cell: ({ row: { original: p } }) => <SourceBadge source={{ provider: p.source, classification: p.classification, retrieved_at: p.last_refreshed_at }} /> });
  return cols;
}

export function useTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => post("/tracker", { product_ids: ids }),
    onSuccess: (r) => { toast.success(r.added ? `Tracking ${r.added} product${r.added > 1 ? "s" : ""}` : "Already tracked"); qc.invalidateQueries({ queryKey: ["tracker"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function AmazonLink({ p }: { p: { asin: string; marketplace: string } }) {
  return <Button asChild variant="ghost" size="sm"><a href={amazonUrl(p)} target="_blank" rel="noreferrer">Amazon<ExternalLink /></a></Button>;
}
