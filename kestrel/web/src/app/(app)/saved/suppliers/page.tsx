"use client";
import { useQuery } from "@tanstack/react-query";
import { BookmarkCheck, GitCompareArrows, LayoutGrid, Rows3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState, PageHeader } from "@/components/ui/data";
import { Select } from "@/components/ui/overlay";
import { Button, Card, SearchInput, Segmented, Skeleton } from "@/components/ui/primitives";
import { useDebounced } from "@/components/suppliers/pickers";
import { AsyncError } from "@/components/suppliers/states";
import { SupplierCard, supplierColumns } from "@/components/suppliers/supplier-card";
import { type SupplierList } from "@/components/suppliers/status";
import { get } from "@/lib/api";
import { num } from "@/lib/utils";

const SORTS = [{ value: "score", label: "Highest score" }, { value: "name", label: "Name A–Z" }, { value: "recent", label: "Recently added" }, { value: "moq", label: "Lowest MOQ" }];

export default function SavedSuppliersPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [sort, setSort] = useState("score");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [selected, setSelected] = useState<number[]>([]);
  const params = { saved: true, q: dq, sort, page_size: 200 };
  const r = useQuery({ queryKey: ["suppliers", "saved", params], queryFn: () => get<SupplierList>("/suppliers", params) });
  const cols = useMemo(() => supplierColumns(), []);
  const items = r.data?.items ?? [];
  const compareIds = view === "table" ? selected : items.map((s) => s.id);
  const empty = dq
    ? <EmptyState compact title="No saved suppliers match" action={<Button variant="secondary" onClick={() => setQ("")}>Clear search</Button>} />
    : <EmptyState icon={BookmarkCheck} title="No saved suppliers" description="Save suppliers from Supplier Finder or a supplier profile to build a shortlist you can compare." action={<Button asChild><Link href="/suppliers">Open Supplier Finder</Link></Button>} />;

  return (
    <>
      <PageHeader eyebrow="Workspace" title="Saved Suppliers" description="Your supplier shortlist. Status, score and risk update as you verify suppliers and add evidence."
        actions={<Button variant="secondary" disabled={compareIds.length < 2} onClick={() => router.push(`/suppliers/compare?ids=${compareIds.slice(0, 10).join(",")}`)}>
          <GitCompareArrows />{view === "table" ? `Compare selected${selected.length ? ` (${Math.min(selected.length, 10)})` : ""}` : `Compare ${Math.min(items.length, 10)}`}
        </Button>} />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Search saved suppliers" className="w-full sm:w-72" />
          <div className="w-40"><Select value={sort} onChange={setSort} options={SORTS} aria-label="Sort" /></div>
          <span className="text-xs text-muted num">{r.data ? `${num(r.data.total)} saved` : ""}</span>
          <div className="ml-auto"><Segmented value={view} onChange={setView} options={[{ value: "grid", label: <span className="flex items-center gap-1.5"><LayoutGrid className="size-3.5" />Cards</span> }, { value: "table", label: <span className="flex items-center gap-1.5"><Rows3 className="size-3.5" />Table</span> }]} /></div>
        </div>
        {r.error ? <Card><AsyncError error={r.error} onRetry={() => r.refetch()} /></Card>
          : view === "table" ? (
            <DataTable columns={cols} data={items} loading={r.isLoading} getRowId={(s) => String(s.id)} selectable onSelectionChange={(rows) => setSelected(rows.map((x) => x.id))}
              onRowClick={(s) => router.push(`/suppliers/${s.id}`)} storageKey="saved-suppliers" empty={empty} />
          ) : r.isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[214px] rounded-xl" />)}</div>
          ) : items.length === 0 ? <Card>{empty}</Card> : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{items.map((s) => <SupplierCard key={s.id} s={s} />)}</div>
          )}
        {(r.data?.total ?? 0) > 200 && <p className="text-xs text-muted">Showing the first 200 saved suppliers. Use search to narrow the list.</p>}
      </div>
    </>
  );
}
