"use client";
/* Product picker dialog: searches the organisation's Product Database (/products/query). */
import { useQuery } from "@tanstack/react-query";
import { PackageSearch, Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { ProductThumb, type ProductBrief } from "@/components/app/product";
import { EmptyState, ErrorState, LoadingRows } from "@/components/ui/data";
import { Dialog } from "@/components/ui/overlay";
import { Button, SearchInput } from "@/components/ui/primitives";
import { post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { money } from "@/lib/utils";
import { useDebounced } from "./shared";

type QueryResp = { total: number; items: ProductBrief[] };

export function ProductPicker({ open, onOpenChange, onPick, title = "Choose a product", description, allMarketplaces }: {
  open: boolean; onOpenChange: (v: boolean) => void; onPick: (p: ProductBrief) => void; title?: string; description?: string; allMarketplaces?: boolean;
}) {
  const { marketplace } = useSession();
  const [q, setQ] = React.useState("");
  const dq = useDebounced(q.trim(), 300);
  const filters = { q: dq || undefined, marketplace: allMarketplaces ? undefined : marketplace };
  const r = useQuery({
    queryKey: ["product-picker", marketplace, dq, !!allMarketplaces],
    queryFn: () => post<QueryResp>("/products/query", { filters, sort: "score", dir: "desc", page: 1, page_size: 12 }),
    enabled: open,
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description ?? `Products in your workspace${allMarketplaces ? "" : ` for Amazon ${marketplace}`}.`} size="lg">
      <div className="space-y-3">
        <SearchInput autoFocus value={q} onChange={setQ} placeholder="Search by title, ASIN, brand or EAN" />
        {r.isLoading ? <LoadingRows rows={5} className="p-0" /> : r.error ? <ErrorState error={r.error} onRetry={() => r.refetch()} /> : !r.data?.items.length ? (
          <EmptyState compact icon={dq ? Search : PackageSearch} title={dq ? "No matching products" : "No products in your workspace yet"}
            description={dq ? "Try a different term, or research the product first." : "Research or import products, then pick one here to prefill its price, category and dimensions."}
            action={<Button variant="secondary" asChild><Link href="/research">Research products</Link></Button>} />
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
            {r.data.items.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => { onPick(p); onOpenChange(false); }} className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-2">
                  <ProductThumb src={p.image_url} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">{p.title || p.asin}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-2xs text-subtle"><span className="font-mono">{p.asin}</span><span>·</span><span>{p.marketplace}</span>{p.category && <><span>·</span><span className="truncate">{p.category}</span></>}</div>
                  </div>
                  <div className="shrink-0 text-right text-[13px] font-medium num">{money(p.price, p.currency)}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
        {r.data && r.data.total > r.data.items.length && <p className="text-xs text-subtle num">Showing {r.data.items.length} of {r.data.total.toLocaleString()} — refine your search to narrow the list.</p>}
      </div>
    </Dialog>
  );
}
