"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, CheckCircle2, CircleDashed, Globe, Package } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import type { ColumnDef } from "@/components/ui/data-table";
import { ScorePill, ScoreRing } from "@/components/ui/data";
import { Tooltip } from "@/components/ui/overlay";
import { Button, Card } from "@/components/ui/primitives";
import { errorMessage, patch } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, cn, money, num } from "@/lib/utils";
import { countryName, hostOf, initials, RiskBadge, SupplierStatusBadge, typeLabel, VatBadge, type SupplierBrief } from "./status";

/** Toggle the saved flag (PATCH /suppliers/{id} {saved}). */
export function useSaveSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, saved }: { id: number; saved: boolean }) => patch(`/suppliers/${id}`, { saved }),
    onSuccess: (_d, v) => {
      toast.success(v.saved ? "Supplier saved" : "Removed from saved suppliers");
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["supplier", v.id] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function SaveToggle({ s, size = "icon-sm" }: { s: Pick<SupplierBrief, "id" | "saved" | "name">; size?: "icon-sm" | "sm" }) {
  const save = useSaveSupplier();
  const { can } = useSession();
  const pending = save.isPending && save.variables?.id === s.id;
  const disabled = !can("analyst");
  const btn = (
    <Button variant={size === "sm" ? "secondary" : "ghost"} size={size} aria-pressed={s.saved} aria-label={s.saved ? `Unsave ${s.name}` : `Save ${s.name}`} loading={pending} disabled={disabled}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); save.mutate({ id: s.id, saved: !s.saved }); }}
      className={cn(s.saved && "text-primary")}>
      {!pending && (s.saved ? <BookmarkCheck /> : <Bookmark />)}{size === "sm" && (s.saved ? "Saved" : "Save")}
    </Button>
  );
  return <Tooltip content={disabled ? "Analyst role or above" : s.saved ? "Remove from saved" : "Save supplier"}><span className="inline-flex">{btn}</span></Tooltip>;
}

function RegistryFlag({ at }: { at: string | null }) {
  return at
    ? <span className="inline-flex items-center gap-1 text-xs text-muted"><CheckCircle2 className="size-3.5 text-primary" />Registry checked {ago(at)}</span>
    : <span className="inline-flex items-center gap-1 text-xs text-subtle"><CircleDashed className="size-3.5" />Registry not checked</span>;
}

export function SupplierCard({ s }: { s: SupplierBrief }) {
  return (
    <Link href={`/suppliers/${s.id}`} className="group block h-full focus:outline-none">
      <Card className="flex h-full flex-col gap-4 p-4 transition-colors group-hover:border-line-strong group-focus-visible:ring-2 group-focus-visible:ring-primary/30">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-xs font-semibold text-muted">{initials(s.name)}</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{s.name}</div>
            <div className="mt-0.5 truncate text-xs text-muted">{countryName(s.country)} · {typeLabel(s.supplier_type)}{s.website ? ` · ${hostOf(s.website)}` : ""}</div>
          </div>
          <SaveToggle s={s} />
        </div>
        <div className="flex items-center gap-3">
          <ScoreRing score={s.score} size={46} label="Supplier score" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <SupplierStatusBadge status={s.status} size="sm" />
            <div className="flex flex-wrap gap-1.5"><RiskBadge level={s.risk_level} size="sm" /><VatBadge valid={s.vat_valid} size="sm" /></div>
          </div>
        </div>
        <div className="mt-auto space-y-2 border-t border-line pt-3">
          <RegistryFlag at={s.registry_checked_at} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1"><Package className="size-3.5 text-subtle" /><span className="num">{num(s.matched_products ?? 0)}</span> matched product{s.matched_products === 1 ? "" : "s"}</span>
            {s.moq != null && <span>MOQ <span className="num text-fg">{num(s.moq)}</span></span>}
            {s.price_min != null && <span>From <span className="num text-fg">{money(s.price_min, s.currency)}</span></span>}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function supplierColumns(): ColumnDef<SupplierBrief>[] {
  return [
    {
      header: "Supplier", accessorKey: "name", size: 280,
      cell: ({ row: { original: s } }) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-2xs font-semibold text-muted">{initials(s.name)}</div>
          <div className="min-w-0"><Link href={`/suppliers/${s.id}`} onClick={(e) => e.stopPropagation()} className="block truncate font-medium hover:text-primary">{s.name}</Link>
            <div className="truncate text-xs text-muted">{typeLabel(s.supplier_type)}{s.website ? <> · <Globe className="inline size-3" /> {hostOf(s.website)}</> : null}</div></div>
        </div>
      ),
    },
    { header: "Country", accessorKey: "country", cell: ({ row: { original: s } }) => <span title={countryName(s.country)}>{s.country}</span> },
    { header: "Status", accessorKey: "status", cell: ({ row: { original: s } }) => <SupplierStatusBadge status={s.status} size="sm" /> },
    { header: "Score", accessorKey: "score", meta: { align: "right" }, cell: ({ row: { original: s } }) => <ScorePill score={s.score} /> },
    { header: "Risk", accessorKey: "risk_level", cell: ({ row: { original: s } }) => <RiskBadge level={s.risk_level} size="sm" /> },
    { header: "Registry", accessorKey: "registry_checked_at", cell: ({ row: { original: s } }) => s.registry_checked_at ? <span className="text-xs text-muted">{ago(s.registry_checked_at)}</span> : <span className="text-xs text-subtle">Not checked</span> },
    { header: "VAT", accessorKey: "vat_valid", cell: ({ row: { original: s } }) => <VatBadge valid={s.vat_valid} size="sm" /> },
    { header: "Matched products", accessorKey: "matched_products", meta: { align: "right" }, cell: ({ row: { original: s } }) => num(s.matched_products ?? 0) },
    { header: "MOQ", accessorKey: "moq", meta: { align: "right" }, cell: ({ row: { original: s } }) => num(s.moq) },
    { header: "Price from", accessorKey: "price_min", meta: { align: "right" }, cell: ({ row: { original: s } }) => money(s.price_min, s.currency) },
    { id: "save", header: "", enableSorting: false, enableHiding: false, size: 48, cell: ({ row: { original: s } }) => <SaveToggle s={s} /> },
  ];
}
