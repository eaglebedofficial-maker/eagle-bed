"use client";
import { Database, Search, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ProductExplorer } from "@/components/products/explorer";
import { ImportDialog } from "@/components/products/import-dialog";
import type { Filters } from "@/components/products/types";
import { EmptyState, PageHeader } from "@/components/ui/data";
import { Button } from "@/components/ui/primitives";

const PRESETS: { label: string; filters: Filters }[] = [
  { label: "Strong scores", filters: { score_min: 70 } },
  { label: "Low competition", filters: { competition: ["low"] } },
  { label: "Under 300 reviews, 300+ units", filters: { reviews_max: 300, units_min: 300 } },
  { label: "No Amazon on listing", filters: { exclude_amazon: true } },
  { label: "Margin 25%+", filters: { margin_min: 25 } },
  { label: "Tracked", filters: { tracked: true } },
];

function ProductsInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(() => {
    try { const f = sp.get("filters"); if (f) return JSON.parse(f) as Filters; } catch { /* ignore malformed link */ }
    return sp.get("q") ? { q: sp.get("q")! } : {};
  });
  const importOpen = sp.get("import") === "1";
  const setImport = (v: boolean) => router.replace(v ? "/products?import=1" : "/products");
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Product intelligence" title="Product Database"
        description="Every product your team has researched or imported. Filter on more than 30 attributes, save templates, and export what you find."
        actions={<><Button variant="secondary" onClick={() => setImport(true)}><Upload />Import</Button><Button asChild><Link href="/research"><Search />Research products</Link></Button></>} />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">Quick filters</span>
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => setFilters({ ...filters, ...p.filters })} className="h-7 rounded-full border border-line bg-surface px-2.5 text-xs text-muted transition-colors hover:border-line-strong hover:text-fg">{p.label}</button>
        ))}
      </div>
      <ProductExplorer storageKey="product-database" filters={filters} onFilters={setFilters} allowDelete
        empty={<EmptyState compact icon={Database} title="Your product database is empty" description="Search Amazon from Product Research, or import a CSV or the Product Pilot extension export."
          action={<><Button onClick={() => setImport(true)}><Upload />Import products</Button><Button variant="secondary" asChild><Link href="/research">Research products</Link></Button></>} />} />
      <ImportDialog open={importOpen} onOpenChange={setImport} />
    </div>
  );
}

export default function ProductsPage() {
  return <Suspense><ProductsInner /></Suspense>;
}
