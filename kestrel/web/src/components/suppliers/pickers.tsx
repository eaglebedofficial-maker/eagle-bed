"use client";
import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronDown, Package, X } from "lucide-react";
import * as React from "react";
import { Popover } from "@/components/ui/overlay";
import { Button, SearchInput, Skeleton } from "@/components/ui/primitives";
import { errorMessage, get, post } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SupplierStatusBadge, type SupplierList } from "./status";

function useDebounced<T>(v: T, ms = 250) {
  const [d, setD] = React.useState(v);
  React.useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}
export { useDebounced };

export type PickedSupplier = { id: number; name: string; status?: string; country?: string };

/** Searchable supplier picker backed by GET /suppliers. */
export function SupplierPicker({ value, onChange, placeholder = "Choose a supplier", className, exclude = [] }: {
  value: PickedSupplier | null; onChange: (s: PickedSupplier | null) => void; placeholder?: string; className?: string; exclude?: number[];
}) {
  const [q, setQ] = React.useState("");
  const dq = useDebounced(q);
  const r = useQuery({ queryKey: ["suppliers", "picker", dq], queryFn: () => get<SupplierList>("/suppliers", { q: dq, page_size: 20, sort: "name" }) });
  const items = (r.data?.items ?? []).filter((s) => !exclude.includes(s.id));
  return (
    <Popover align="start" className="w-[min(380px,calc(100vw-32px))] p-2"
      trigger={
        <button type="button" className={cn("inline-flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary/30", className)}>
          <Building2 className="size-4 shrink-0 text-subtle" />
          <span className={cn("min-w-0 flex-1 truncate", !value && "text-subtle")}>{value ? value.name : placeholder}</span>
          {value ? <X role="button" aria-label="Clear supplier" className="size-4 text-subtle hover:text-fg" onClick={(e) => { e.stopPropagation(); onChange(null); }} /> : <ChevronDown className="size-4 text-subtle" />}
        </button>
      }>
      <SearchInput value={q} onChange={setQ} placeholder="Search suppliers" autoFocus />
      <div className="mt-2 max-h-72 overflow-y-auto">
        {r.isLoading ? <div className="space-y-1.5 p-1">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-9" />)}</div>
          : r.error ? <p className="p-3 text-xs text-danger">{errorMessage(r.error)}</p>
          : items.length === 0 ? <p className="p-3 text-xs text-muted">{dq ? "No suppliers match." : "No suppliers yet. Add one in Supplier Finder."}</p>
          : items.map((s) => (
            <button key={s.id} type="button" onClick={() => onChange({ id: s.id, name: s.name, status: s.status, country: s.country })}
              className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] hover:bg-surface-2", value?.id === s.id && "bg-surface-2")}>
              <span className="min-w-0 flex-1 truncate">{s.name}<span className="ml-1.5 text-2xs text-subtle">{s.country}</span></span>
              <SupplierStatusBadge status={s.status} size="sm" withTip={false} />
            </button>
          ))}
      </div>
    </Popover>
  );
}

export type PickedProduct = { id: number; title: string; asin: string; brand?: string | null };

/** Searchable picker over the product database (POST /products/query). */
export function ProductPicker({ value, onChange, placeholder = "Link a researched product (optional)", className }: {
  value: PickedProduct | null; onChange: (p: PickedProduct | null) => void; placeholder?: string; className?: string;
}) {
  const [q, setQ] = React.useState("");
  const dq = useDebounced(q);
  const r = useQuery({
    queryKey: ["products", "picker", dq],
    queryFn: () => post<{ items: { id: number; title: string; asin: string; brand: string | null; marketplace: string }[] }>("/products/query", { filters: dq ? { q: dq } : {}, sort: "updated", dir: "desc", page: 1, page_size: 20 }),
  });
  return (
    <Popover align="start" className="w-[min(440px,calc(100vw-32px))] p-2"
      trigger={
        <button type="button" className={cn("inline-flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary/30", className)}>
          <Package className="size-4 shrink-0 text-subtle" />
          <span className={cn("min-w-0 flex-1 truncate", !value && "text-subtle")}>{value ? `${value.asin} · ${value.title}` : placeholder}</span>
          {value ? <X role="button" aria-label="Clear product" className="size-4 text-subtle hover:text-fg" onClick={(e) => { e.stopPropagation(); onChange(null); }} /> : <ChevronDown className="size-4 text-subtle" />}
        </button>
      }>
      <SearchInput value={q} onChange={setQ} placeholder="Search title, ASIN, brand or EAN" autoFocus />
      <div className="mt-2 max-h-72 overflow-y-auto">
        {r.isLoading ? <div className="space-y-1.5 p-1">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-9" />)}</div>
          : r.error ? <p className="p-3 text-xs text-danger">{errorMessage(r.error)}</p>
          : (r.data?.items ?? []).length === 0 ? <p className="p-3 text-xs text-muted">{dq ? "No products match." : "No products in your database yet. Research products first."}</p>
          : r.data!.items.map((p) => (
            <button key={p.id} type="button" onClick={() => onChange({ id: p.id, title: p.title, asin: p.asin, brand: p.brand })}
              className={cn("flex w-full flex-col rounded-lg px-2 py-2 text-left hover:bg-surface-2", value?.id === p.id && "bg-surface-2")}>
              <span className="line-clamp-1 text-[13px]">{p.title}</span>
              <span className="text-2xs text-subtle">{p.asin} · {p.marketplace}{p.brand ? ` · ${p.brand}` : ""}</span>
            </button>
          ))}
      </div>
      {value && <div className="mt-2 border-t border-line pt-2"><Button size="xs" variant="ghost" onClick={() => onChange(null)}>Clear selection</Button></div>}
    </Popover>
  );
}
