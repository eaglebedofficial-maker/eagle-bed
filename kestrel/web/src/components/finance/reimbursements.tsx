"use client";
/* Reimbursement analysis: possible lost/damaged inventory discrepancies from the user's own reports. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileSearch, Hash, PackageX, Receipt, ScanSearch, Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, ErrorState, KeyValue, MetricCard, PageHeader, SourceBadge } from "@/components/ui/data";
import { Dialog, Select, Sheet, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, Field, Segmented } from "@/components/ui/primitives";
import { errorMessage, get, patch } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, currencySymbol, dateShort, money, num } from "@/lib/utils";
import { FilePick, Notice, NumInput, postForm, RoleGate, toNum } from "./shared";

type Case = {
  id: number; type: string; sku: string; quantity: number; estimated_amount: number; status: Status; updated_at: string;
  evidence: { lost?: number; damaged?: number; found?: number; reimbursed_units?: number; valuation_basis?: string; references?: string[] };
};
type Resp = { items: Case[]; note: string };
type Status = "identified" | "reviewed_by_seller" | "filed_by_seller" | "resolved" | "dismissed";
const STATUS: Record<Status, { label: string; tone: "warning" | "primary" | "cyan" | "neutral" | "violet" }> = {
  identified: { label: "Identified", tone: "warning" }, reviewed_by_seller: { label: "Reviewed", tone: "primary" }, filed_by_seller: { label: "Filed by you", tone: "cyan" },
  resolved: { label: "Resolved", tone: "violet" }, dismissed: { label: "Dismissed", tone: "neutral" },
};
const TYPE: Record<string, string> = { lost_or_damaged_in_warehouse: "Lost or damaged in warehouse" };

export function Reimbursements() {
  const qc = useQueryClient();
  const { currency, can } = useSession();
  const q = useQuery({ queryKey: ["reimbursements"], queryFn: () => get<Resp>("/reimbursements") });
  const [filter, setFilter] = React.useState<"open" | "all" | Status>("open");
  const [detail, setDetail] = React.useState<Case | null>(null);
  const [open, setOpen] = React.useState(false);
  const [adj, setAdj] = React.useState<File | null>(null);
  const [reim, setReim] = React.useState<File | null>(null);
  const [unitValue, setUnitValue] = React.useState("");

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Status }) => patch(`/reimbursements/${id}`, { status }),
    onSuccess: (_, v) => { toast.success(`Marked ${STATUS[v.status].label.toLowerCase()}`); setDetail((d) => (d && d.id === v.id ? { ...d, status: v.status } : d)); qc.invalidateQueries({ queryKey: ["reimbursements"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const analyse = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("adjustments", adj!);
      if (reim) fd.append("reimbursements", reim);
      fd.append("unit_value", String(toNum(unitValue) ?? 0));
      return postForm<{ cases: number; estimated_total: number }>("/reimbursements/analyse", fd);
    },
    onSuccess: (r) => { toast.success(`${num(r.cases)} possible discrepanc${r.cases === 1 ? "y" : "ies"} found`, { description: r.cases ? `Estimated ${money(r.estimated_total, currency)}` : undefined }); setOpen(false); setAdj(null); setReim(null); qc.invalidateQueries({ queryKey: ["reimbursements"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const d = q.data;
  const all = d?.items ?? [];
  const openCases = all.filter((c) => c.status !== "resolved" && c.status !== "dismissed");
  const rows = filter === "all" ? all : filter === "open" ? openCases : all.filter((c) => c.status === filter);

  const statusCell = (c: Case) => (
    <div className="w-40" onClick={(e) => e.stopPropagation()}>
      {can("analyst") ? <Select size="sm" value={c.status} onChange={(s) => setStatus.mutate({ id: c.id, status: s })} options={(Object.keys(STATUS) as Status[]).map((s) => ({ value: s, label: STATUS[s].label }))} aria-label="Case status" />
        : <Tooltip content="Analyst role or higher required to change status"><span><Badge tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Badge></span></Tooltip>}
    </div>
  );
  const cols = React.useMemo<ColumnDef<Case>[]>(() => [
    { header: "SKU", accessorKey: "sku", cell: ({ row: { original: c } }) => <div className="min-w-[160px]"><div className="font-mono text-[13px] font-medium">{c.sku || "—"}</div><div className="text-2xs text-subtle">{TYPE[c.type] ?? c.type.replace(/_/g, " ")}</div></div> },
    { header: "Units", accessorKey: "quantity", meta: { align: "right" }, cell: ({ getValue }) => num(getValue() as number) },
    { header: "Lost", id: "lost", accessorFn: (c) => c.evidence.lost ?? 0, meta: { align: "right" }, cell: ({ getValue }) => <span className="text-muted">{num(getValue() as number)}</span> },
    { header: "Damaged", id: "damaged", accessorFn: (c) => c.evidence.damaged ?? 0, meta: { align: "right" }, cell: ({ getValue }) => <span className="text-muted">{num(getValue() as number)}</span> },
    { header: "Found", id: "found", accessorFn: (c) => c.evidence.found ?? 0, meta: { align: "right" }, cell: ({ getValue }) => <span className="text-muted">{num(getValue() as number)}</span> },
    { header: "Reimbursed", id: "reimbursed", accessorFn: (c) => c.evidence.reimbursed_units ?? 0, meta: { align: "right" }, cell: ({ getValue }) => <span className="text-muted">{num(getValue() as number)}</span> },
    { header: "Est. value", accessorKey: "estimated_amount", meta: { align: "right" }, cell: ({ row: { original: c } }) => <Tooltip content={`Valued at ${c.evidence.valuation_basis ?? "—"}`}><span className="cursor-help font-medium">{money(c.estimated_amount, currency)}</span></Tooltip> },
    { header: "Status", accessorKey: "status", cell: ({ row: { original: c } }) => statusCell(c) },
    { header: "Updated", accessorKey: "updated_at", cell: ({ getValue }) => <span className="text-muted">{ago(getValue() as string)}</span> },
  ], [currency, can]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Financial tools" title="Reimbursements"
        description="Find units Amazon's warehouses lost or damaged that don't appear to have been reimbursed, from your own Seller Central reports."
        actions={<RoleGate>{(a) => <Button disabled={!a} onClick={() => setOpen(true)}><ScanSearch />Analyse reports</Button>}</RoleGate>} />

      {d?.note && <Notice>{d.note}</Notice>}

      {q.error ? <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card> : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricCard loading={!d} label="Open cases" icon={FileSearch} tone="warning" value={num(openCases.length)} />
            <MetricCard loading={!d} label="Units in open cases" icon={PackageX} tone="danger" value={num(openCases.reduce((a, c) => a + c.quantity, 0))} />
            <MetricCard loading={!d} label="Est. value of open cases" icon={Receipt} tone="violet" value={money(openCases.reduce((a, c) => a + c.estimated_amount, 0), currency, { compact: true })} source={{ classification: "estimated", note: "Average past reimbursement per unit, or the unit value you entered." }} />
            <MetricCard loading={!d} label="Resolved" icon={Hash} tone="cyan" value={num(all.filter((c) => c.status === "resolved").length)} />
          </div>

          <DataTable columns={cols} data={rows} loading={q.isLoading} getRowId={(c) => String(c.id)} onRowClick={setDetail} storageKey="reimbursements"
            toolbar={<Segmented size="sm" value={filter} onChange={setFilter} options={[
              { value: "open", label: `Open · ${openCases.length}` }, { value: "filed_by_seller", label: "Filed" }, { value: "resolved", label: "Resolved" }, { value: "dismissed", label: "Dismissed" }, { value: "all", label: `All · ${all.length}` },
            ]} />}
            empty={all.length === 0 ? (
              <EmptyState icon={Receipt} title="No analysis yet" description="Download the Inventory Adjustments report (and optionally the Reimbursements report) from Seller Central → Reports → Fulfilment, then analyse them here."
                action={can("analyst") ? <Button onClick={() => setOpen(true)}><ScanSearch />Analyse reports</Button> : undefined} />
            ) : <EmptyState compact title="No cases with this status" action={<Button variant="secondary" onClick={() => setFilter("all")}>Show all</Button>} />} />
        </>
      )}

      <Sheet open={!!detail} onOpenChange={(v) => !v && setDetail(null)} title={detail ? `SKU ${detail.sku}` : ""} description={detail ? TYPE[detail.type] ?? detail.type : undefined} width={500}>
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2"><Badge tone={STATUS[detail.status].tone}>{STATUS[detail.status].label}</Badge><SourceBadge classification="estimated" source={{ classification: "estimated", note: "Value is an estimate from your reports." }} /></div>
            <div className="rounded-xl border border-line bg-surface-2 p-4">
              <div className="text-xs text-muted">Possible unreimbursed units</div>
              <div className="mt-1 text-2xl font-semibold num">{num(detail.quantity)} <span className="text-base font-normal text-muted">· est. {money(detail.estimated_amount, currency)}</span></div>
              <div className="mt-1 text-xs text-subtle">Lost + damaged − found − already reimbursed</div>
            </div>
            <KeyValue rows={[
              ["Lost / misplaced", num(detail.evidence.lost ?? 0)], ["Damaged", num(detail.evidence.damaged ?? 0)], ["Found", num(detail.evidence.found ?? 0)],
              ["Already reimbursed", num(detail.evidence.reimbursed_units ?? 0)], ["Valuation basis", detail.evidence.valuation_basis ?? "—"], ["Last updated", dateShort(detail.updated_at)],
            ]} />
            <div>
              <div className="mb-2 text-[13px] font-medium">Report references</div>
              {detail.evidence.references?.length ? (
                <div className="flex flex-wrap gap-1.5">{detail.evidence.references.map((r) => <Badge key={r} size="sm" className="font-mono">{r}</Badge>)}</div>
              ) : <p className="text-xs text-subtle">No transaction references in the uploaded report.</p>}
            </div>
            <Field label="Status">{statusCell(detail)}</Field>
            <Notice>Check these units against Seller Central before filing. Kestrel never submits claims to Amazon — mark the case as filed once you've done so yourself.</Notice>
          </div>
        )}
      </Sheet>

      <Dialog open={open} onOpenChange={setOpen} title="Analyse reimbursement reports" size="lg"
        description="Re-running replaces cases still marked Identified. Cases you've reviewed, filed, resolved or dismissed are kept."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={!adj} loading={analyse.isPending} onClick={() => analyse.mutate()}><Upload />Analyse</Button></>}>
        <div className="space-y-4">
          <Field label="Inventory Adjustments report" aside="Required"><FilePick file={adj} onFile={setAdj} label="Choose adjustments report" /></Field>
          <Field label="Reimbursements report" aside="Optional" hint="Used to subtract units already reimbursed and to value cases at your average past reimbursement."><FilePick file={reim} onFile={setReim} label="Choose reimbursements report" /></Field>
          <Field label="Unit value" hint="Used only when a SKU has no past reimbursements to average. Leave 0 to show units without a value.">
            <NumInput value={unitValue} onChange={setUnitValue} prefix={currencySymbol(currency)} placeholder="0.00" className="sm:w-48" />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
