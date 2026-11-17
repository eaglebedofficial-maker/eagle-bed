"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FileCheck2, FileSearch, FileText, MoreHorizontal, Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, PageHeader } from "@/components/ui/data";
import { ConfirmDialog, Menu, Select, TabPanel, Tabs } from "@/components/ui/overlay";
import { Badge, Button, Card, Field } from "@/components/ui/primitives";
import { ACCEPTED_DOCS, fileSize, openDocument, uploadDocument, type UploadResult } from "@/components/suppliers/documents";
import { AssessDialog, AssessmentView, PolicyReference, PolicySettings, RISK_META, uploadMeta, type DocRow, type Policy } from "@/components/suppliers/invoice";
import { SupplierPicker, type PickedSupplier } from "@/components/suppliers/pickers";
import { AsyncError, GatedButton } from "@/components/suppliers/states";
import { del, errorMessage, get } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, cn, dateShort } from "@/lib/utils";

const KINDS = [{ value: "invoice", label: "Supplier invoice" }, { value: "other", label: "Other supplier document" }];

function UploadCard({ onUploaded }: { onUploaded: (r: UploadResult, supplier: PickedSupplier | null, filename: string) => void }) {
  const { can } = useSession();
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [supplier, setSupplier] = useState<PickedSupplier | null>(null);
  const [kind, setKind] = useState("invoice");
  const up = useMutation({
    mutationFn: (file: File) => uploadDocument(file, { kind, supplierId: supplier?.id }).then((r) => ({ r, name: file.name })),
    onSuccess: ({ r, name }) => {
      uploadMeta.set(r.id, r.meta);
      qc.invalidateQueries({ queryKey: ["documents"] });
      if (supplier) qc.invalidateQueries({ queryKey: ["supplier", supplier.id] });
      toast.success("Document uploaded", { description: `${r.pages} page${r.pages === 1 ? "" : "s"}${r.has_text ? "" : " · no text layer: connect Claude to read it, or correct fields by hand"}` });
      onUploaded(r, supplier, name);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const disabled = !can("analyst") || up.isPending;
  const pick = (f?: File | null) => { if (f && !disabled) up.mutate(f); };
  return (
    <Card className="p-4">
      <input ref={input} type="file" accept={ACCEPTED_DOCS} className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <button type="button" disabled={disabled} onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
          className={cn("flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            drag ? "border-primary bg-primary-soft" : "border-line hover:border-line-strong hover:bg-surface-2")}>
          <UploadCloud className={cn("size-7", up.isPending ? "animate-pulse text-primary" : "text-subtle")} />
          <span className="text-sm font-medium">{up.isPending ? "Uploading…" : "Drop an invoice here, or click to choose a file"}</span>
          <span className="text-xs text-muted">{can("analyst") ? "PDF, PNG or JPEG. PDFs give the most reliable checks: text, metadata and editing history." : "Analyst role or above is needed to upload."}</span>
        </button>
        <div className="space-y-3">
          <Field label="Supplier" hint="Link now to run identity checks against the supplier record."><SupplierPicker value={supplier} onChange={setSupplier} placeholder="Optional" /></Field>
          <Field label="Document type"><Select value={kind} onChange={setKind} options={KINDS} /></Field>
        </div>
      </div>
    </Card>
  );
}

function Documents({ onOpenAssessment, onAssess }: { onOpenAssessment: (id: number) => void; onAssess: (d: { id: number; filename: string; supplier: PickedSupplier | null }) => void }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["documents"], queryFn: () => get<DocRow[]>("/documents") });
  const policy = useQuery({ queryKey: ["compliance-policy"], queryFn: () => get<Policy>("/compliance/policy") });
  const [removing, setRemoving] = useState<DocRow | null>(null);
  const rm = useMutation({
    mutationFn: (id: number) => del(`/documents/${id}`),
    onSuccess: (_d, id) => { toast.success("Document deleted"); setRemoving(null); uploadMeta.delete(id); qc.invalidateQueries({ queryKey: ["documents"] }); qc.invalidateQueries({ queryKey: ["supplier"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const open = (id: number) => openDocument(id).catch((e) => toast.error(errorMessage(e)));
  const cols = useMemo<ColumnDef<DocRow>[]>(() => [
    {
      header: "Document", accessorKey: "filename",
      cell: ({ row: { original: d } }) => (
        <div className="flex min-w-[220px] items-center gap-2.5">
          <FileText className="size-4 shrink-0 text-subtle" />
          <div className="min-w-0"><button onClick={(e) => { e.stopPropagation(); open(d.id); }} className="block max-w-[320px] truncate text-left font-medium hover:text-primary">{d.filename}</button>
            <div className="text-xs text-muted">{KINDS.find((k) => k.value === d.kind)?.label ?? d.kind} · {d.pages} page{d.pages === 1 ? "" : "s"} · {fileSize(d.size_bytes)}</div></div>
        </div>
      ),
    },
    { header: "Supplier", accessorKey: "supplier", sortingFn: (a, b) => (a.original.supplier?.name ?? "").localeCompare(b.original.supplier?.name ?? ""), cell: ({ row: { original: d } }) => d.supplier ? <Link href={`/suppliers/${d.supplier.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary">{d.supplier.name}</Link> : <span className="text-subtle">Not linked</span> },
    { header: "Uploaded", accessorKey: "uploaded_at", cell: ({ row: { original: d } }) => <span className="text-xs text-muted" title={dateShort(d.uploaded_at)}>{ago(d.uploaded_at)}</span> },
    {
      header: "Documentation assessment", accessorKey: "assessment", sortingFn: (a, b) => ["low", "medium", "high"].indexOf(a.original.assessment?.risk_level ?? "") - ["low", "medium", "high"].indexOf(b.original.assessment?.risk_level ?? ""),
      cell: ({ row: { original: d } }) => {
        if (!d.assessment) return <span className="text-xs text-subtle">Not assessed</span>;
        const m = RISK_META[d.assessment.risk_level];
        const c = d.assessment.counts;
        return <div className="flex flex-wrap items-center gap-2"><Badge size="sm" tone={m?.tone ?? "neutral"} dot>{m?.label ?? d.assessment.risk_level}</Badge>{c && <span className="text-2xs text-subtle num">{c.pass}✓ {c.warn}! {c.fail}✕</span>}</div>;
      },
    },
    {
      id: "actions", header: "", enableSorting: false, enableHiding: false, size: 150,
      cell: ({ row: { original: d } }) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {d.assessment ? <Button size="xs" variant="secondary" onClick={() => onOpenAssessment(d.assessment!.id)}>View<ArrowRight /></Button>
            : <GatedButton size="xs" onClick={() => onAssess({ id: d.id, filename: d.filename, supplier: d.supplier })}><FileSearch />Assess</GatedButton>}
          <Menu trigger={<Button variant="ghost" size="icon-sm" aria-label="More actions"><MoreHorizontal /></Button>} items={[
            { label: "Open file", icon: <FileText />, onSelect: () => open(d.id) },
            { label: d.assessment ? "Re-assess" : "Assess", icon: <FileSearch />, onSelect: () => onAssess({ id: d.id, filename: d.filename, supplier: d.supplier }) },
            "sep",
            { label: "Delete", icon: <Trash2 />, danger: true, onSelect: () => setRemoving(d) },
          ]} />
        </div>
      ),
    },
  ], []); // eslint-disable-line react-hooks/exhaustive-deps

  const docs = q.data ?? [];
  const counts = docs.reduce((a, d) => { const r = d.assessment?.risk_level ?? "none"; a[r] = (a[r] ?? 0) + 1; return a; }, {} as Record<string, number>);
  return (
    <div className="space-y-4">
      {policy.data && <PolicyReference policy={policy.data} />}
      {q.error ? <Card><AsyncError error={q.error} onRetry={() => q.refetch()} /></Card> : (
        <DataTable columns={cols} data={docs} loading={q.isLoading} getRowId={(d) => String(d.id)} storageKey="invoice-docs"
          onRowClick={(d) => d.assessment ? onOpenAssessment(d.assessment.id) : onAssess({ id: d.id, filename: d.filename, supplier: d.supplier })}
          toolbar={<div className="flex flex-wrap items-center gap-2 text-xs text-muted"><span className="text-sm font-semibold text-fg">Documents</span>
            {(["high", "medium", "low", "none"] as const).filter((k) => counts[k]).map((k) => <Badge key={k} size="sm" tone={k === "none" ? "neutral" : RISK_META[k].tone}>{counts[k]} {k === "none" ? "not assessed" : `${k} risk`}</Badge>)}</div>}
          empty={<EmptyState icon={FileCheck2} title="No documents uploaded" description="Upload a supplier invoice above. Kestrel extracts its fields, checks them against commonly published Amazon requirements and your supplier's registry details, and looks for editing indicators." />} />
      )}
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Delete document?" confirmLabel="Delete" loading={rm.isPending} onConfirm={() => removing && rm.mutate(removing.id)}
        description={<>This deletes <b>{removing?.filename}</b> and its assessments. Supplier scores that used it are recalculated the next time the supplier changes.</>} />
    </div>
  );
}

function InvoicesInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const tab = sp.get("tab") === "policy" ? "policy" : "documents";
  const assessmentId = Number(sp.get("assessment")) || null;
  const docParam = Number(sp.get("doc")) || null;
  const [assessing, setAssessing] = useState<{ id: number; filename: string; supplier: PickedSupplier | null } | null>(null);
  const docs = useQuery({ queryKey: ["documents"], queryFn: () => get<DocRow[]>("/documents"), enabled: !!docParam && !assessing });
  // Deep link ?doc=ID (from a supplier profile or after upload) opens the assess dialog once the document list is loaded.
  const deepDoc = docParam && !assessing ? docs.data?.find((d) => d.id === docParam) : undefined;
  const go = (qs: string) => router.replace(`/invoices${qs ? `?${qs}` : ""}`, { scroll: false });
  const openAssessment = (id: number) => go(`assessment=${id}`);
  const dialogDoc = assessing ?? (deepDoc ? { id: deepDoc.id, filename: deepDoc.filename, supplier: deepDoc.supplier } : null);

  return (
    <>
      <PageHeader eyebrow="Supplier intelligence" title="Invoice Compliance"
        description="Amazon Supplier & Invoice Compliance Checker. Upload a supplier invoice for a documentation assessment against commonly published Amazon requirements, your supplier's registry record and file-integrity indicators. Amazon makes its own decision."
        actions={tab === "documents" && !assessmentId ? <Button variant="secondary" onClick={() => go("tab=policy")}>Policy settings</Button> : undefined} />
      <Tabs value={tab} onValueChange={(v) => go(v === "policy" ? "tab=policy" : "")} tabs={[{ value: "documents", label: "Documents & assessments" }, { value: "policy", label: "Compliance policy" }]}>
        <TabPanel value="documents">
          {assessmentId ? (
            <AssessmentView id={assessmentId} onBack={() => go("")} onReassessed={(a) => openAssessment(a.id)} />
          ) : (
            <div className="space-y-6">
              <UploadCard onUploaded={(r, supplier, filename) => { if (r.id) setAssessing({ id: r.id, filename, supplier }); }} />
              <Documents onOpenAssessment={openAssessment} onAssess={setAssessing} />
              {docParam && docs.isSuccess && !deepDoc && !assessing && (
                <Card className="flex flex-wrap items-center gap-3 p-4 text-[13px] text-muted">That document wasn't found. It may have been deleted.<Button size="sm" variant="ghost" onClick={() => go("")}>Dismiss</Button></Card>
              )}
            </div>
          )}
        </TabPanel>
        <TabPanel value="policy"><PolicySettings /></TabPanel>
      </Tabs>
      <AssessDialog open={!!dialogDoc} doc={dialogDoc}
        onOpenChange={(v) => { if (!v) { setAssessing(null); if (docParam) go(""); } }}
        onDone={(a) => { setAssessing(null); qc.invalidateQueries({ queryKey: ["documents"] }); openAssessment(a.id); }} />
    </>
  );
}

export default function InvoicesPage() {
  return <Suspense><InvoicesInner /></Suspense>;
}
