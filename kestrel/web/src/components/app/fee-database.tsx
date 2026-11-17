"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/data";
import { Dialog, Select } from "@/components/ui/overlay";
import { Badge, Button, Card, Field, Input, Segmented } from "@/components/ui/primitives";
import { errorMessage, get, put } from "@/lib/api";
import { useSession } from "@/lib/session";
import { dateShort } from "@/lib/utils";

type Fee = { id: number; marketplace: string; fee_type: string; size_tier: string; max_length_cm: number | null; max_width_cm: number | null; max_height_cm: number | null; weight_from_g: number; weight_to_g: number | null; amount: number; per_kg_over: number; unit: string; season: string; effective_from: string; effective_to: string | null; source_url: string; notes: string; is_custom: boolean };
type Ref = { id: number; category: string; rate: number; threshold: number | null; rate_above: number | null; min_fee: number; effective_from: string; source_url: string; is_custom: boolean };

export function FeeDatabase() {
  const { marketplaces, can } = useSession();
  const qc = useQueryClient();
  const [mkt, setMkt] = useState("UK");
  const [type, setType] = useState<"fba" | "storage" | "referral">("fba");
  const q = useQuery({ queryKey: ["fees", mkt], queryFn: () => get<{ fees: Fee[]; referral: Ref[] }>("/fees", { marketplace: mkt }) });
  const [edit, setEdit] = useState<Fee | null>(null);
  const [amt, setAmt] = useState({ amount: "", per_kg_over: "", effective_from: "", source_url: "" });
  const cur = marketplaces.find((m) => m.code === mkt)?.currency ?? "GBP";
  const save = useMutation({
    mutationFn: () => put(`/fees/${edit!.id}`, { ...edit, amount: Number(amt.amount), per_kg_over: Number(amt.per_kg_over || 0), effective_from: amt.effective_from, source_url: amt.source_url }),
    onSuccess: () => { toast.success("Fee saved for your organisation"); setEdit(null); qc.invalidateQueries({ queryKey: ["fees", mkt] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const g = (v: number | null) => v == null ? "—" : v >= 1000 ? `${(v / 1000).toLocaleString()} kg` : `${v.toLocaleString()} g`;
  const feeCols = useMemo<ColumnDef<Fee, any>[]>(() => [
    { header: "Size tier", accessorKey: "size_tier", cell: ({ row: { original: f } }) => <div><div className="font-medium">{f.size_tier}{f.is_custom && <Badge tone="violet" size="sm" className="ml-2">Your override</Badge>}</div><div className="text-2xs text-subtle">{f.max_length_cm ? `≤ ${f.max_length_cm} × ${f.max_width_cm} × ${f.max_height_cm} cm` : "Any size above previous tiers"}</div></div> },
    { header: "Weight band", accessorKey: "weight_from_g", cell: ({ row: { original: f } }) => `${g(f.weight_from_g)} – ${f.weight_to_g ? g(f.weight_to_g) : "and over"}` },
    { header: "Fee", accessorKey: "amount", meta: { align: "right" }, cell: ({ row: { original: f } }) => <span className="font-medium">{f.amount.toFixed(2)} {cur}{f.per_kg_over ? <span className="text-subtle"> + {f.per_kg_over.toFixed(2)}/kg</span> : ""}</span> },
    { header: "Season", accessorKey: "season", cell: ({ getValue }) => <span className="capitalize text-muted">{getValue()}</span> },
    { header: "Effective", accessorKey: "effective_from", cell: ({ row: { original: f } }) => <span className="text-muted">{dateShort(f.effective_from)}{f.effective_to ? ` – ${dateShort(f.effective_to)}` : " →"}</span> },
    { header: "Source", accessorKey: "source_url", enableSorting: false, cell: ({ getValue }) => getValue() ? <a className="text-primary hover:underline" target="_blank" rel="noreferrer" href={getValue()}>Rate card</a> : "—" },
    { id: "edit", header: "", enableSorting: false, cell: ({ row: { original: f } }) => can("admin") ? <Button variant="ghost" size="icon-sm" aria-label="Edit fee" onClick={() => { setEdit(f); setAmt({ amount: String(f.amount), per_kg_over: String(f.per_kg_over), effective_from: new Date().toISOString().slice(0, 10), source_url: f.source_url }); }}><Pencil /></Button> : null },
  ], [cur, can]);
  const refCols = useMemo<ColumnDef<Ref, any>[]>(() => [
    { header: "Category", accessorKey: "category", cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { header: "Rate", accessorKey: "rate", meta: { align: "right" }, cell: ({ getValue }) => `${(getValue() * 100).toFixed(0)}%` },
    { header: "Above threshold", accessorKey: "threshold", cell: ({ row: { original: r } }) => r.threshold ? `${(r.rate_above! * 100).toFixed(0)}% above ${r.threshold} ${cur}` : "—" },
    { header: "Minimum", accessorKey: "min_fee", meta: { align: "right" }, cell: ({ getValue }) => `${Number(getValue()).toFixed(2)} ${cur}` },
    { header: "Effective", accessorKey: "effective_from", cell: ({ getValue }) => dateShort(getValue()) },
  ], [cur]);
  if (q.error) return <ErrorState error={q.error} />;
  const rows = (q.data?.fees ?? []).filter((f) => f.fee_type === type);
  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="w-48"><Select value={mkt} onChange={setMkt} options={marketplaces.map((m) => ({ value: m.code, label: m.name }))} aria-label="Marketplace" /></div>
        <Segmented value={type} onChange={setType} options={[{ value: "fba", label: "Fulfilment" }, { value: "storage", label: "Storage" }, { value: "referral", label: "Referral" }]} />
        <p className="ml-auto max-w-xl text-xs text-muted">Seeded from Amazon's published 2025 rate cards. Amazon changes fees; edit a row to add your own effective-dated value. Your overrides apply only to your organisation. Connect SP-API for exact per-ASIN estimates.</p>
      </Card>
      {type === "referral" ? <DataTable columns={refCols} data={q.data?.referral ?? []} loading={q.isLoading} dense /> : <DataTable columns={feeCols} data={rows} loading={q.isLoading} dense />}
      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)} title={`Edit ${edit?.size_tier} fee`} description="Creates an effective-dated override for your organisation. Platform defaults stay unchanged."
        footer={<><Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button><Button loading={save.isPending} onClick={() => save.mutate()}>Save override</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`Fee (${cur})`}><Input type="number" step="0.01" value={amt.amount} onChange={(e) => setAmt({ ...amt, amount: e.target.value })} /></Field>
          <Field label={`Per kg over band (${cur})`}><Input type="number" step="0.01" value={amt.per_kg_over} onChange={(e) => setAmt({ ...amt, per_kg_over: e.target.value })} /></Field>
          <Field label="Effective from"><Input type="date" value={amt.effective_from} onChange={(e) => setAmt({ ...amt, effective_from: e.target.value })} /></Field>
          <Field label="Source URL"><Input value={amt.source_url} onChange={(e) => setAmt({ ...amt, source_url: e.target.value })} /></Field>
        </div>
      </Dialog>
    </div>
  );
}
