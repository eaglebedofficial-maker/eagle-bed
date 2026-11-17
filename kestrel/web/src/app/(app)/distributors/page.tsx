"use client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Info, Link2, Truck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, PageHeader, ScorePill } from "@/components/ui/data";
import { Select, Tooltip } from "@/components/ui/overlay";
import { Button, Card, SearchInput } from "@/components/ui/primitives";
import { evidenceLabel } from "@/components/suppliers/profile";
import { AsyncError } from "@/components/suppliers/states";
import { AuthStatusBadge, countryName, hostOf, SupplierStatusBadge } from "@/components/suppliers/status";
import { get } from "@/lib/api";
import { dateShort } from "@/lib/utils";

type Dist = {
  id: number; brand: string; brand_id: number; supplier: string; supplier_id: number; country: string; status: string; evidence_type: string; statement: string; source_url: string;
  verified_at: string | null; supplier_status: string; supplier_score: number | null;
};

const FILTERS = [
  { value: "all", label: "All records" },
  { value: "brand", label: "Brand evidence (listed or confirmed)" },
  { value: "claimed", label: "Supplier claims only" },
  { value: "unverified", label: "Unverified" },
];

export default function DistributorsPage() {
  const q = useQuery({ queryKey: ["distributors"], queryFn: () => get<Dist[]>("/distributors") });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const rows = (q.data ?? []).filter((d) => {
    if (search && !`${d.brand} ${d.supplier}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "brand") return d.status === "listed_by_brand" || d.status === "confirmed_by_brand";
    if (filter === "claimed") return d.status === "claimed";
    if (filter === "unverified") return !["listed_by_brand", "confirmed_by_brand", "claimed"].includes(d.status);
    return true;
  });
  const cols = useMemo<ColumnDef<Dist>[]>(() => [
    { header: "Brand", accessorKey: "brand", cell: ({ row: { original: d } }) => <Link href={`/brands?id=${d.brand_id}`} className="font-medium hover:text-primary">{d.brand}</Link> },
    {
      header: "Supplier", accessorKey: "supplier",
      cell: ({ row: { original: d } }) => <div className="min-w-[180px]"><Link href={`/suppliers/${d.supplier_id}`} className="font-medium hover:text-primary">{d.supplier}</Link><div className="text-xs text-muted">{countryName(d.country)}</div></div>,
    },
    { header: "Brand record", accessorKey: "status", cell: ({ row: { original: d } }) => <AuthStatusBadge status={d.status} size="sm" /> },
    {
      header: "Evidence", accessorKey: "evidence_type", enableSorting: false,
      cell: ({ row: { original: d } }) => (
        <div className="max-w-[340px] min-w-[220px] py-2">
          <div className="text-xs font-medium">{evidenceLabel(d.evidence_type === "distributor_claim" ? "website_claim" : d.evidence_type)}</div>
          {d.statement && <Tooltip content={d.statement}><p className="line-clamp-2 cursor-help text-xs text-muted">“{d.statement}”</p></Tooltip>}
          {d.source_url ? <a href={d.source_url} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex max-w-full items-center gap-1 text-xs text-primary hover:underline"><Link2 className="size-3 shrink-0" /><span className="truncate">{hostOf(d.source_url)}</span></a>
            : <span className="text-xs text-subtle">No source cited</span>}
        </div>
      ),
    },
    { header: "Recorded", accessorKey: "verified_at", cell: ({ row: { original: d } }) => <span className="text-xs text-muted">{d.verified_at ? dateShort(d.verified_at) : "—"}</span> },
    { header: "Supplier status", accessorKey: "supplier_status", cell: ({ row: { original: d } }) => <SupplierStatusBadge status={d.supplier_status} size="sm" /> },
    { header: "Score", accessorKey: "supplier_score", meta: { align: "right" }, cell: ({ row: { original: d } }) => <ScorePill score={d.supplier_score} /> },
  ], []);
  const brandEvidenced = (q.data ?? []).filter((d) => d.status === "listed_by_brand" || d.status === "confirmed_by_brand").length;
  const claims = (q.data ?? []).filter((d) => d.status === "claimed").length;

  return (
    <>
      <PageHeader eyebrow="Supplier intelligence" title="Authorised Distributors"
        description="Every supplier–brand relationship you've recorded, with the evidence behind it. A supplier is shown as a verified authorised distributor only when brand evidence is on file."
        actions={<Button variant="secondary" asChild><Link href="/suppliers?mode=discover">Find distributors<ArrowRight /></Link></Button>} />
      <div className="space-y-6">
        <Card className="flex flex-wrap items-start gap-3 p-4 text-[13px]">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1 text-muted">
            <b className="text-fg">{brandEvidenced}</b> record{brandEvidenced === 1 ? "" : "s"} backed by brand evidence (the brand's own distributor page or written confirmation) and <b className="text-fg">{claims}</b> supplier claim{claims === 1 ? "" : "s"} that still need confirming with the brand.
            The brand record and the supplier's overall status are separate: a supplier can also be flagged high risk for registry or VAT problems.
          </div>
        </Card>
        {q.error ? <Card><AsyncError error={q.error} onRetry={() => q.refetch()} /></Card> : (
          <DataTable columns={cols} data={rows} loading={q.isLoading} getRowId={(d) => String(d.id)} storageKey="distributors"
            toolbar={<><SearchInput value={search} onChange={setSearch} placeholder="Search brand or supplier" className="w-full sm:w-64" /><div className="w-full sm:w-72"><Select value={filter} onChange={setFilter} options={FILTERS} aria-label="Evidence filter" /></div></>}
            empty={(q.data ?? []).length === 0
              ? <EmptyState icon={Truck} title="No distributor records yet" description="Records are created when you add brand evidence on a supplier profile, or save a discovered supplier that claims a brand relationship."
                  action={<><Button asChild><Link href="/suppliers?mode=discover">Branded discovery</Link></Button><Button variant="secondary" asChild><Link href="/suppliers">My suppliers</Link></Button></>} />
              : <EmptyState compact title="No records match" action={<Button variant="secondary" onClick={() => { setSearch(""); setFilter("all"); }}>Clear filters</Button>} />} />
        )}
      </div>
    </>
  );
}
