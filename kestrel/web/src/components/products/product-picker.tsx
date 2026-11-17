"use client";
/* Pick products from the workspace (POST /api/products/query with a text filter). */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Check, PackageSearch, Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { ProductThumb, type ProductBrief } from "@/components/app/product";
import { EmptyState, ErrorState, LoadingRows, ScorePill } from "@/components/ui/data";
import { Dialog } from "@/components/ui/overlay";
import { Button, SearchInput } from "@/components/ui/primitives";
import { post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, money } from "@/lib/utils";
import type { QueryResponse } from "./types";

function useDebounced<T>(v: T, ms = 250) {
  const [d, setD] = React.useState(v);
  React.useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

export function ProductPicker({ open, onOpenChange, title, description, max, exclude = [], onConfirm, confirmLabel = "Add", loading }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; description?: string; max?: number; exclude?: number[];
  onConfirm: (items: ProductBrief[]) => void; confirmLabel?: string; loading?: boolean;
}) {
  const { marketplace } = useSession();
  const [q, setQ] = React.useState("");
  const [picked, setPicked] = React.useState<ProductBrief[]>([]);
  React.useEffect(() => { if (open) { setPicked([]); setQ(""); } }, [open]);
  const dq = useDebounced(q.trim());
  const res = useQuery({
    queryKey: ["products", marketplace, "picker", dq],
    queryFn: () => post<QueryResponse>("/products/query", { filters: { marketplace, ...(dq ? { q: dq } : {}) }, sort: "score", dir: "desc", page: 1, page_size: 30 }),
    enabled: open, placeholderData: keepPreviousData,
  });
  const items = (res.data?.items ?? []).filter((p) => !exclude.includes(p.id));
  const full = max != null && picked.length >= max;
  const toggle = (p: ProductBrief) => setPicked((cur) => cur.some((x) => x.id === p.id) ? cur.filter((x) => x.id !== p.id) : full ? cur : [...cur, p]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" title={title} description={description}
      footer={<><span className="mr-auto text-xs text-muted num">{picked.length} selected{max != null ? ` · up to ${max}` : ""}</span><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!picked.length} loading={loading} onClick={() => onConfirm(picked)}>{confirmLabel}</Button></>}>
      <div className="space-y-3">
        <SearchInput autoFocus value={q} onChange={setQ} placeholder="Search your products by title, ASIN, brand, EAN…" />
        {res.error ? <ErrorState error={res.error} onRetry={() => res.refetch()} />
          : res.isLoading ? <LoadingRows rows={5} className="p-0" />
          : items.length === 0 ? <EmptyState compact icon={PackageSearch} title={dq ? "No matching products" : "No products in your workspace yet"} description="Products appear here once you research or import them." action={<Button variant="secondary" asChild><Link href="/research"><Search />Research products</Link></Button>} />
          : (
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {items.map((p) => {
                const on = picked.some((x) => x.id === p.id);
                return (
                  <li key={p.id}>
                    <button type="button" onClick={() => toggle(p)} disabled={!on && full} aria-pressed={on}
                      className={cn("flex w-full items-center gap-3 px-3 py-2 text-left transition-colors disabled:opacity-50", on ? "bg-primary-soft/50" : "hover:bg-surface-2")}>
                      <span className={cn("grid size-4 shrink-0 place-items-center rounded-[5px] border", on ? "border-primary bg-primary text-white" : "border-line-strong")}>{on && <Check className="size-3" strokeWidth={3} />}</span>
                      <ProductThumb src={p.image_url} size={32} />
                      <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium">{p.title || p.asin}</span><span className="block text-2xs text-subtle"><span className="font-mono">{p.asin}</span>{p.brand ? ` · ${p.brand}` : ""}</span></span>
                      <span className="hidden text-[13px] num sm:block">{money(p.price, p.currency)}</span>
                      <ScorePill score={p.score} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
      </div>
    </Dialog>
  );
}
