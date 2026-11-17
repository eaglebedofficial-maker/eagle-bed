"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle, ArrowLeft, Bookmark, BookmarkCheck, CheckCircle2, ClipboardList, ExternalLink, FilePlus2, GitCompareArrows, Globe, Info, MapPin, Pencil, PlugZap, ShieldCheck, Trash2, UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader, ScoreRing } from "@/components/ui/data";
import { ConfirmDialog, TabPanel, Tabs } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Skeleton } from "@/components/ui/primitives";
import {
  AddContactDialog, AddEvidenceDialog, CommsTab, ContactsTab, DocumentsTab, EvidenceTab, Overview, ProductsTab, QuotesTab, type Profile,
} from "@/components/suppliers/profile";
import { RfqDialog } from "@/components/suppliers/rfq-dialog";
import { AsyncError, GatedButton } from "@/components/suppliers/states";
import { useSaveSupplier } from "@/components/suppliers/supplier-card";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form";
import { countryName, hostOf, hrefOf, initials, RiskBadge, SupplierStatusBadge, typeLabel, VatBadge } from "@/components/suppliers/status";
import { ApiError, del, errorMessage, get, post } from "@/lib/api";
import { ago, cn } from "@/lib/utils";

type VerifyRes = {
  registry: Record<string, any> | null; vat: Record<string, any> | null; notes: string[]; score: number; status: string; risk_level: string; risk_reasons: string[]; disclaimer: string;
};

function VerifyResult({ r, onClose }: { r: VerifyRes; onClose: () => void }) {
  const needsSetup = r.notes.filter((n) => /^Connect /.test(n));
  const other = r.notes.filter((n) => !/^Connect /.test(n));
  return (
    <Card className="border-primary/30">
      <CardHeader eyebrow="Verification result" title={r.registry ? `Matched ${r.registry.name} (${r.registry.number})` : "No registry record matched"}
        description={r.disclaimer} action={<Button variant="ghost" size="sm" onClick={onClose}>Dismiss</Button>} />
      <CardBody className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <SupplierStatusBadge status={r.status} size="sm" /><RiskBadge level={r.risk_level} size="sm" /><Badge size="sm" className="num">Score {r.score}/100</Badge>
          {r.registry && <Badge size="sm" tone="primary"><CheckCircle2 className="size-3" />Companies House: {r.registry.status}</Badge>}
          {r.vat && <VatBadge valid={r.vat.valid} size="sm" />}
        </div>
        {needsSetup.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface-2 p-3 text-[13px]">
            <PlugZap className="size-4 shrink-0 text-primary" />
            <ul className="min-w-0 flex-1 space-y-0.5 text-muted">{needsSetup.map((n) => <li key={n}>{n}</li>)}</ul>
            <Button size="sm" variant="secondary" asChild><Link href="/settings?tab=integrations">Open integrations</Link></Button>
          </div>
        )}
        {other.length > 0 && <ul className="space-y-1 text-[13px] text-muted">{other.map((n) => <li key={n} className="flex gap-2"><Info className="mt-0.5 size-3.5 shrink-0 text-subtle" />{n}</li>)}</ul>}
      </CardBody>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Skeleton className="size-14 rounded-xl" /><div className="space-y-2"><Skeleton className="h-6 w-64" /><Skeleton className="h-4 w-40" /></div></div>
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]"><Skeleton className="h-72 rounded-xl" /><Skeleton className="h-72 rounded-xl" /></div>
    </div>
  );
}

function SupplierProfileInner() {
  const { id } = useParams<{ id: string }>();
  const sid = Number(id);
  const router = useRouter();
  const sp = useSearchParams();
  const qc = useQueryClient();
  const tab = sp.get("tab") || "overview";
  const setTab = (t: string) => router.replace(`/suppliers/${sid}${t === "overview" ? "" : `?tab=${t}`}`, { scroll: false });
  const q = useQuery({ queryKey: ["supplier", sid], queryFn: () => get<Profile>(`/suppliers/${sid}`), enabled: Number.isFinite(sid) });
  const [verifyRes, setVerifyRes] = useState<VerifyRes | null>(null);
  const [dlg, setDlg] = useState<null | "edit" | "evidence" | "contact" | "rfq" | "delete">(null);
  const save = useSaveSupplier();

  const verify = useMutation({
    mutationFn: () => post<VerifyRes>(`/suppliers/${sid}/verify`),
    onSuccess: (r) => {
      setVerifyRes(r);
      toast.success("Verification complete", { description: r.notes.length ? r.notes[0] : `Status: ${r.status.replace(/_/g, " ")}` });
      qc.invalidateQueries({ queryKey: ["supplier", sid] }); qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: () => del(`/suppliers/${sid}`),
    onSuccess: () => { toast.success("Supplier deleted"); qc.invalidateQueries({ queryKey: ["suppliers"] }); qc.removeQueries({ queryKey: ["supplier", sid] }); router.push("/suppliers"); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (q.isLoading) return <ProfileSkeleton />;
  if (q.error) {
    if (q.error instanceof ApiError && q.error.status === 404) {
      return <Card><EmptyState title="Supplier not found" description="It may have been deleted, or it belongs to a different organisation." action={<Button asChild variant="secondary"><Link href="/suppliers"><ArrowLeft />Back to suppliers</Link></Button>} /></Card>;
    }
    return <Card><AsyncError error={q.error} onRetry={() => q.refetch()} /></Card>;
  }
  const s = q.data!;
  const brandHint = (s.brands_supplied ?? [])[0] ?? "";
  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "evidence", label: "Evidence", count: s.evidence.length },
    { value: "products", label: "Products", count: s.products.length },
    { value: "contacts", label: "Contacts", count: s.contacts.length },
    { value: "communications", label: "Communications", count: s.communications.length },
    { value: "documents", label: "Documents", count: s.documents.length },
    { value: "quotes", label: "Quotes & orders", count: s.quotations.length + s.purchase_orders.length },
  ];

  return (
    <>
      <PageHeader eyebrow={<Link href="/suppliers" className="inline-flex items-center gap-1 hover:text-fg"><ArrowLeft className="size-3" />Supplier Finder</Link>}
        title={<span className="flex flex-wrap items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-sm font-semibold text-muted">{initials(s.name)}</span><span className="min-w-0">{s.name}</span></span>}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {s.trading_name && s.legal_name !== s.name && <span>{s.legal_name}</span>}
            <span>{typeLabel(s.supplier_type)}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{[s.city, countryName(s.country)].filter(Boolean).join(", ")}</span>
            {s.website && <a href={hrefOf(s.website)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><Globe className="size-3.5" />{hostOf(s.website)}<ExternalLink className="size-3" /></a>}
          </span>
        } />

      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            <ScoreRing score={s.score} size={96} stroke={7} label="Supplier score" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2"><SupplierStatusBadge status={s.status} /><RiskBadge level={s.risk_level} /><VatBadge valid={s.vat_valid} /></div>
              <div className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
                <div><div className="text-xs text-muted">Registry</div><div className="mt-0.5 font-medium">{s.registry_checked_at ? `Checked ${ago(s.registry_checked_at)}` : "Not checked"}</div></div>
                <div><div className="text-xs text-muted">Trading</div><div className="mt-0.5 font-medium num">{s.years_trading != null ? `${s.years_trading} yrs` : "Unknown"}</div></div>
                <div><div className="text-xs text-muted">Brand evidence</div><div className="mt-0.5 font-medium">{s.has_authorisation_evidence ? "On file" : "None"}</div></div>
                <div><div className="text-xs text-muted">Invoice risk</div><div className="mt-0.5 font-medium capitalize">{s.documentation === "none" || !s.documentation ? "Not assessed" : s.documentation}</div></div>
              </div>
              <p className="flex gap-1.5 text-xs text-subtle"><Info className="mt-0.5 size-3.5 shrink-0" />{s.score_disclaimer}</p>
              {s.status === "high_risk" && (s.risk_reasons ?? []).length > 0 && (
                <p className="flex gap-1.5 text-xs text-danger"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{s.risk_reasons![0]}</p>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">Actions</div>
            <div className="space-y-2">
              <GatedButton className="w-full justify-start" loading={verify.isPending} onClick={() => verify.mutate()}><ShieldCheck />Verify company & VAT</GatedButton>
              <p className="px-1 pb-1 text-2xs text-subtle">{s.country === "GB" ? "Companies House" : `No registry for ${s.country}`}{s.vat_number ? ` · ${s.country === "GB" || s.vat_number.toUpperCase().startsWith("GB") ? "HMRC VAT" : "EU VIES"}` : " · add a VAT number to check it"}</p>
              <div className="grid grid-cols-2 gap-2">
                <GatedButton variant="secondary" size="sm" className="justify-start" onClick={() => setDlg("evidence")}><FilePlus2 />Evidence</GatedButton>
                <GatedButton variant="secondary" size="sm" className="justify-start" onClick={() => setDlg("contact")}><UserPlus />Contact</GatedButton>
                <GatedButton variant="secondary" size="sm" className="justify-start" onClick={() => setDlg("rfq")}><ClipboardList />Request quote</GatedButton>
                <GatedButton variant="secondary" size="sm" className={cn("justify-start", s.saved && "text-primary")} loading={save.isPending} onClick={() => save.mutate({ id: s.id, saved: !s.saved })}>
                  {s.saved ? <BookmarkCheck /> : <Bookmark />}{s.saved ? "Saved" : "Save"}
                </GatedButton>
                <GatedButton variant="secondary" size="sm" className="justify-start" onClick={() => setDlg("edit")}><Pencil />Edit</GatedButton>
                <Button variant="secondary" size="sm" className="justify-start" asChild><Link href={`/suppliers/compare?ids=${s.id}`}><GitCompareArrows />Compare</Link></Button>
              </div>
              <GatedButton variant="ghost" size="sm" className="w-full justify-start text-danger hover:text-danger" onClick={() => setDlg("delete")}><Trash2 />Delete supplier</GatedButton>
            </div>
          </Card>
        </div>

        {verifyRes && <VerifyResult r={verifyRes} onClose={() => setVerifyRes(null)} />}

        <Tabs value={tab} onValueChange={setTab} tabs={tabs}>
          <TabPanel value="overview"><Overview s={s} onVerify={() => verify.mutate()} verifying={verify.isPending} /></TabPanel>
          <TabPanel value="evidence"><EvidenceTab s={s} onAdd={() => setDlg("evidence")} /></TabPanel>
          <TabPanel value="products"><ProductsTab s={s} /></TabPanel>
          <TabPanel value="contacts"><ContactsTab s={s} onAdd={() => setDlg("contact")} /></TabPanel>
          <TabPanel value="communications"><CommsTab s={s} /></TabPanel>
          <TabPanel value="documents"><DocumentsTab s={s} /></TabPanel>
          <TabPanel value="quotes"><QuotesTab s={s} onRfq={() => setDlg("rfq")} /></TabPanel>
        </Tabs>
      </div>

      <SupplierFormDialog open={dlg === "edit"} onOpenChange={(v) => setDlg(v ? "edit" : null)} supplier={s} />
      <AddEvidenceDialog open={dlg === "evidence"} onOpenChange={(v) => setDlg(v ? "evidence" : null)} supplierId={s.id} defaultBrand={brandHint} />
      <AddContactDialog open={dlg === "contact"} onOpenChange={(v) => setDlg(v ? "contact" : null)} supplierId={s.id} />
      <RfqDialog open={dlg === "rfq"} onOpenChange={(v) => setDlg(v ? "rfq" : null)} supplier={{ id: s.id, name: s.name, status: s.status, country: s.country }}
        onCreated={(r) => toast("Open RFQ Manager to review and send", { action: { label: "Open", onClick: () => router.push(`/rfq?rfq=${r.id}`) } })} />
      <ConfirmDialog open={dlg === "delete"} onOpenChange={(v) => setDlg(v ? "delete" : null)} title="Delete supplier?" confirmLabel="Delete" loading={remove.isPending} onConfirm={() => remove.mutate()}
        description={<>This permanently deletes <b>{s.name}</b>, with its evidence, contacts, linked products, quotations, purchase orders and communications log. Uploaded documents stay in Invoice Compliance, unlinked from the supplier.</>} />
    </>
  );
}

export default function SupplierProfilePage() {
  return <Suspense><SupplierProfileInner /></Suspense>;
}
