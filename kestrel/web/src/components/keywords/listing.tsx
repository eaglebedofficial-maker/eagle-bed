"use client";
/* Listing Optimizer: analyzer, listing builder drafts with live keyword coverage, and the AI listing writer. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Circle, Copy, FileText, Gauge, ListChecks, Plus, Save, Sparkles, Trash2, Wand2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import type { ProductBrief } from "@/components/app/product";
import { EmptyState, LoadingRows, PageHeader, ScoreRing, SourceBadge } from "@/components/ui/data";
import { ConfirmDialog, InfoTip, Select, Sheet, Tabs } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Progress, Segmented, Skeleton, Textarea } from "@/components/ui/primitives";
import { del, errorMessage, get, post, put } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, cn, num } from "@/lib/utils";
import { ApiErrorView, CharCount, Gate, ProductPickerDialog, ProductSelect, splitLines, useAnalyst, useKeywordLists, type KwListDetail, type Provenance } from "./common";

/* ---------------------------------------------------------------- types */
export type Analysis = {
  score: number; components: Record<string, { label: string; score: number; max: number; note: string }>;
  issues: { severity: "high" | "medium" | "low"; title: string; detail: string; field: string }[];
  keyword_usage: { used: string[]; front: string[]; missing: string[] }; competitor_gaps: { word: string; competitors: number }[];
  stats: { title_chars: number; bullets: number; description_chars: number; backend_bytes: number }; classification: string; method: string;
};
type Draft = { id: number; name: string; product_id: number | null; title: string; bullets: string[]; description: string; backend_terms: string; keyword_list_id: number | null; facts: string; updated_at: string | null };
type DraftIn = Omit<Draft, "id" | "updated_at">;
type Generated = { title: string; bullets: string[]; description: string; backend_terms: string; keyword_placement: { keyword: string; where: string }[]; notes: string[]; analysis: Analysis; source: Provenance };
type Dataset = { id: number; name: string; review_count: number; has_ai: boolean };
type AiSeed = { facts: string; keyword_list_id: number | null; draft: Draft | null; product_id: number | null; n: number };

const LIMITS = { title: 200, bullet: 500, description: 2000, backend: 249 };
const SEV = { high: "danger", medium: "warning", low: "neutral" } as const;
const blankDraft = (): DraftIn => ({ name: "Untitled listing", product_id: null, title: "", bullets: ["", "", "", "", ""], description: "", backend_terms: "", keyword_list_id: null, facts: "" });
const copy = (t: string) => navigator.clipboard.writeText(t).then(() => toast.success("Copied"), () => toast.error("Clipboard not available"));

/* ================================================================ page */
export function ListingOptimizerPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = React.useState(["analyze", "builder", "ai"].includes(sp.get("tab") ?? "") ? sp.get("tab")! : "analyze");
  const [aiSeed, setAiSeed] = React.useState<AiSeed | null>(null);
  const [openDraft, setOpenDraft] = React.useState<number | null>(null);
  const change = (t: string) => { setTab(t); router.replace(`/listing?tab=${t}`, { scroll: false }); };
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Keyword intelligence" title="Listing Optimizer"
        description="Score a listing against Amazon's style rules and your target keywords, build drafts with live character limits and keyword coverage, and draft copy with AI from facts you supply."
        actions={<Button variant="secondary" asChild><Link href="/keywords"><ListChecks />Keyword lists</Link></Button>} />
      <div>
        <Tabs value={tab} onValueChange={change} tabs={[{ value: "analyze", label: "Listing analyzer" }, { value: "builder", label: "Listing builder" }, { value: "ai", label: "AI writer" }]} />
        <div className={tab === "analyze" ? "pt-5" : "hidden"}><Analyzer /></div>
        <div className={tab === "builder" ? "pt-5" : "hidden"}><Builder openId={openDraft} onOpened={() => setOpenDraft(null)} onAi={(s) => { setAiSeed({ ...s, n: (aiSeed?.n ?? 0) + 1 }); change("ai"); }} /></div>
        <div className={tab === "ai" ? "pt-5" : "hidden"}><AiWriter seed={aiSeed} onSaved={(id) => { setOpenDraft(id); change("builder"); }} /></div>
      </div>
    </div>
  );
}

/* ================================================================ analysis view */
export function AnalysisView({ a, compact }: { a: Analysis; compact?: boolean }) {
  const comps = Object.values(a.components);
  const kw = a.keyword_usage;
  const total = kw.used.length + kw.missing.length;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-5">
        <ScoreRing score={a.score} size={compact ? 64 : 84} stroke={6} label="Listing score" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="text-[15px] font-semibold">Listing score</span><SourceBadge classification="estimated" source={{ classification: "estimated", provider: "Kestrel listing rules", note: a.method }} /></div>
          <p className="mt-1 text-[13px] text-muted">{a.issues.filter((i) => i.severity === "high").length} high, {a.issues.filter((i) => i.severity === "medium").length} medium and {a.issues.filter((i) => i.severity === "low").length} low-priority issues. {a.method}.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {comps.map((c) => (
          <div key={c.label} className="rounded-xl border border-line p-3">
            <div className="flex items-center justify-between text-[13px]"><span className="font-medium">{c.label}</span><span className="text-muted num">{c.score}/{c.max}</span></div>
            <Progress className="mt-2" value={(c.score / c.max) * 100} tone={c.score / c.max >= 0.8 ? "success" : c.score / c.max >= 0.5 ? "warning" : "danger"} />
            {c.note && <div className="mt-1.5 text-xs text-subtle">{c.note}</div>}
          </div>
        ))}
      </div>
      {a.issues.length > 0 ? (
        <div>
          <h4 className="mb-2 text-[13px] font-semibold">What to fix</h4>
          <ul className="space-y-2">
            {a.issues.map((i, k) => (
              <li key={k} className="flex gap-3 rounded-xl border border-line p-3">
                <Badge tone={SEV[i.severity]} size="sm" className="mt-0.5 capitalize">{i.severity}</Badge>
                <div className="min-w-0"><div className="text-[13px] font-medium">{i.title}</div><div className="mt-0.5 break-words text-xs text-muted">{i.detail}</div>{i.field && <div className="mt-1 text-2xs uppercase tracking-wider text-subtle">{i.field}</div>}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-3 py-2 text-[13px] text-success"><CheckCircle2 className="size-4" />No rule issues found.</div>}
      {total > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-[13px] font-semibold">Keyword coverage <span className="font-normal text-muted num">{kw.used.length}/{total}</span></h4>
          <div className="flex flex-wrap gap-1.5">
            {kw.used.map((k) => <Badge key={k} tone={kw.front.includes(k) ? "success" : "cyan"} size="sm"><CheckCircle2 className="size-3" />{k}</Badge>)}
            {kw.missing.map((k) => <Badge key={k} tone="danger" size="sm"><X className="size-3" />{k}</Badge>)}
          </div>
          <p className="mt-1.5 text-2xs text-subtle">Green: in title, bullets or description. Cyan: only in backend terms. Red: missing.</p>
        </div>
      )}
      {a.competitor_gaps.length > 0 && (
        <div>
          <h4 className="mb-2 text-[13px] font-semibold">Words competitors use that you don't</h4>
          <div className="flex flex-wrap gap-1.5">{a.competitor_gaps.map((g) => <Badge key={g.word} size="sm">{g.word}<span className="text-subtle num">×{g.competitors}</span></Badge>)}</div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ analyzer */
function Analyzer() {
  const lists = useKeywordLists();
  const [product, setProduct] = React.useState<ProductBrief | null>(null);
  const [f, setF] = React.useState({ title: "", bullets: ["", "", "", "", ""], description: "", backend: "", keywords: "", images: "", aplus: "unknown", video: "unknown" });
  const [kwMode, setKwMode] = React.useState<"type" | "list">("type");
  const [listId, setListId] = React.useState("");
  const [comps, setComps] = React.useState<ProductBrief[]>([]);
  const [picker, setPicker] = React.useState(false);
  const tri = (v: string) => (v === "yes" ? true : v === "no" ? false : null);
  const m = useMutation({
    mutationFn: () => post<Analysis>("/listings/analyse", {
      product_id: product?.id ?? null, title: f.title, bullets: f.bullets.filter((b) => b.trim()), description: f.description, backend: f.backend,
      keywords: kwMode === "type" ? splitLines(f.keywords) : [], keyword_list_id: kwMode === "list" && listId ? Number(listId) : null,
      images: f.images === "" ? null : Number(f.images), has_aplus: tri(f.aplus), has_video: tri(f.video), competitor_ids: comps.map((c) => c.id),
    }),
  });
  const hasContent = !!(product || f.title.trim() || f.bullets.some((b) => b.trim()) || f.description.trim());
  const yn = [{ value: "unknown", label: "Not specified" }, { value: "yes", label: "Yes" }, { value: "no", label: "No" }];
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card className="self-start">
        <CardHeader eyebrow="Input" title="Listing to analyse" description="Choose one of your products to use its stored title, bullets, images, A+ and rating, or paste copy to score a draft. Anything you type overrides the product's values." />
        <CardBody className="space-y-4">
          <Field label="Product" aside="Optional"><ProductSelect value={product} onChange={setProduct} allowClear placeholder="Use a product from your workspace" /></Field>
          <Field label="Title" aside={<CharCount value={f.title} limit={LIMITS.title} recommended={[120, 200]} />}><Textarea value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="min-h-[64px]" placeholder={product ? "Leave blank to use the product's title" : "Product title"} /></Field>
          {f.bullets.map((b, i) => (
            <Field key={i} label={`Bullet ${i + 1}`} aside={<CharCount value={b} limit={LIMITS.bullet} recommended={[120, 500]} />}>
              <Textarea value={b} onChange={(e) => { const bs = [...f.bullets]; bs[i] = e.target.value; setF({ ...f, bullets: bs }); }} className="min-h-[56px]" />
            </Field>
          ))}
          <Field label="Description" aside={<CharCount value={f.description} limit={LIMITS.description} recommended={[1000, 2000]} />}><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Field label="Backend search terms" aside={<CharCount value={f.backend} limit={LIMITS.backend} bytes />}><Textarea value={f.backend} onChange={(e) => setF({ ...f, backend: e.target.value })} className="min-h-[56px]" /></Field>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2"><span className="text-[13px] font-medium">Target keywords</span><Segmented size="sm" value={kwMode} onChange={setKwMode} options={[{ value: "type", label: "Type" }, { value: "list", label: "Keyword list" }]} /></div>
            {kwMode === "type" ? <Textarea value={f.keywords} onChange={(e) => setF({ ...f, keywords: e.target.value })} className="min-h-[64px]" placeholder="Most important first. One per line or comma-separated." />
              : lists.data?.length ? <Select value={listId} onChange={setListId} placeholder="Choose a list" options={lists.data.map((l) => ({ value: String(l.id), label: `${l.name} (${l.count})` }))} aria-label="Keyword list" />
                : <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs text-muted">No keyword lists yet. Save keywords from <Link className="text-primary hover:underline" href="/keywords">Keyword Research</Link>.</p>}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Images"><Input type="number" min={0} max={20} value={f.images} onChange={(e) => setF({ ...f, images: e.target.value })} placeholder={product ? "From product" : "—"} /></Field>
            <Field label="A+ content"><Select value={f.aplus} onChange={(v) => setF({ ...f, aplus: v })} options={yn} aria-label="A+ content" /></Field>
            <Field label="Video"><Select value={f.video} onChange={(v) => setF({ ...f, video: v })} options={yn} aria-label="Video" /></Field>
          </div>
          <Field label="Competitors" aside="Optional · finds words they use that you don't">
            <div className="flex flex-wrap items-center gap-1.5">
              {comps.map((c) => <Badge key={c.id} className="max-w-[220px]"><span className="truncate">{c.title || c.asin}</span><button aria-label="Remove" onClick={() => setComps(comps.filter((x) => x.id !== c.id))}><X className="size-3" /></button></Badge>)}
              <Button size="sm" variant="ghost" onClick={() => setPicker(true)}><Plus />{comps.length ? "Edit" : "Add competitors"}</Button>
            </div>
          </Field>
          <Button className="w-full" loading={m.isPending} disabled={!hasContent} onClick={() => m.mutate()}><Gauge />Analyse listing</Button>
        </CardBody>
      </Card>
      <Card className="self-start xl:sticky xl:top-[calc(var(--topbar-h,56px)+16px)]">
        <CardHeader eyebrow="Result" title="Listing analysis" />
        <CardBody>
          {m.isIdle ? <EmptyState compact icon={Gauge} title="No analysis yet" description="Scores cover title, bullets, description/A+, images, video, keyword coverage and rating, using Amazon style-guide limits. Restricted claims are flagged." />
            : m.isPending ? <div className="space-y-3"><Skeleton className="h-20 w-full" /><LoadingRows rows={4} className="p-0" /></div>
              : m.error ? <ApiErrorView error={m.error} onRetry={() => m.mutate()} />
                : m.data && <AnalysisView a={m.data} />}
        </CardBody>
      </Card>
      <ProductPickerDialog open={picker} onOpenChange={setPicker} multiple max={10} initial={comps} title="Choose competitor products" onPick={setComps} />
    </div>
  );
}

/* ================================================================ builder */
function Builder({ onAi, openId, onOpened }: { onAi: (s: Omit<AiSeed, "n">) => void; openId: number | null; onOpened: () => void }) {
  const qc = useQueryClient();
  const analyst = useAnalyst();
  const drafts = useQuery({ queryKey: ["listing-drafts"], queryFn: () => get<Draft[]>("/listings/drafts") });
  const [active, setActive] = React.useState<number | null>(null);
  React.useEffect(() => { if (openId != null) { setActive(openId); onOpened(); } /* eslint-disable-next-line */ }, [openId]);
  React.useEffect(() => { if (active == null && drafts.data?.length) setActive(drafts.data[0].id); }, [drafts.data, active]);
  const create = useMutation({
    mutationFn: () => post<{ id: number }>("/listings/drafts", blankDraft()),
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ["listing-drafts"] }); setActive(r.id); toast.success("Draft created"); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const draft = drafts.data?.find((d) => d.id === active) ?? null;
  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <Card className="self-start">
        <CardHeader title="Drafts" action={<Gate allowed={analyst}><Button size="sm" variant="secondary" loading={create.isPending} onClick={() => create.mutate()}><Plus />New</Button></Gate>} />
        <CardBody className="px-2 pb-2">
          {drafts.isLoading ? <LoadingRows rows={3} className="p-2" /> : drafts.error ? <ApiErrorView error={drafts.error} onRetry={() => drafts.refetch()} /> : !drafts.data?.length ? (
            <EmptyState compact icon={FileText} title="No drafts" description="Create a draft to write a listing with live limits and keyword coverage." />
          ) : (
            <ul className="space-y-0.5">
              {drafts.data.map((d) => (
                <li key={d.id}><button onClick={() => setActive(d.id)} className={cn("w-full rounded-lg px-3 py-2 text-left transition-colors", d.id === active ? "bg-surface-2" : "hover:bg-surface-2/60")}>
                  <div className="truncate text-[13px] font-medium">{d.name || "Untitled listing"}</div>
                  <div className="truncate text-2xs text-subtle">{d.title ? `${d.title.length} char title` : "No title yet"} · {ago(d.updated_at)}</div>
                </button></li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
      <div className="min-w-0">
        {drafts.isLoading ? <Card><LoadingRows rows={8} /></Card> : draft ? <DraftEditor key={`${draft.id}:${draft.updated_at ?? ""}:${draft.title.length}:${draft.description.length}`} draft={draft} onAi={onAi} onDeleted={() => setActive(null)} />
          : !drafts.error && <Card><EmptyState icon={FileText} title="Build a listing" description="Drafts keep your title, five bullets, description and backend terms with Amazon's limits, and check every target keyword is covered."
            action={<Gate allowed={analyst}><Button loading={create.isPending} onClick={() => create.mutate()}><Plus />New draft</Button></Gate>} /></Card>}
      </div>
    </div>
  );
}

function DraftEditor({ draft, onAi, onDeleted }: { draft: Draft; onAi: (s: Omit<AiSeed, "n">) => void; onDeleted: () => void }) {
  const qc = useQueryClient();
  const analyst = useAnalyst();
  const lists = useKeywordLists();
  const init = (): DraftIn => ({ name: draft.name, product_id: draft.product_id, title: draft.title, bullets: [...(draft.bullets ?? []), "", "", "", "", ""].slice(0, 5), description: draft.description, backend_terms: draft.backend_terms, keyword_list_id: draft.keyword_list_id, facts: draft.facts });
  const [f, setF] = React.useState<DraftIn>(init);
  const [removing, setRemoving] = React.useState(false);
  const [analysis, setAnalysis] = React.useState(false);
  const dirty = JSON.stringify(f) !== JSON.stringify(init());
  const prod = useQuery({ queryKey: ["product", f.product_id], enabled: !!f.product_id, queryFn: () => get<ProductBrief>(`/products/${f.product_id}`) });
  const list = useQuery({ queryKey: ["keyword-list", f.keyword_list_id], enabled: !!f.keyword_list_id, queryFn: () => get<KwListDetail>(`/keywords/lists/${f.keyword_list_id}`) });
  const save = useMutation({
    mutationFn: () => put(`/listings/drafts/${draft.id}`, f),
    onSuccess: () => { toast.success("Draft saved"); qc.invalidateQueries({ queryKey: ["listing-drafts"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: () => del(`/listings/drafts/${draft.id}`),
    onSuccess: () => { toast.success("Draft deleted"); setRemoving(false); qc.invalidateQueries({ queryKey: ["listing-drafts"] }); onDeleted(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const analyse = useMutation({
    mutationFn: () => post<Analysis>("/listings/analyse", { product_id: f.product_id, title: f.title, bullets: f.bullets.filter((b) => b.trim()), description: f.description, backend: f.backend_terms, keyword_list_id: f.keyword_list_id }),
    onSuccess: () => setAnalysis(true),
    onError: (e) => toast.error(errorMessage(e)),
  });

  const lower = { title: f.title.toLowerCase(), bullets: f.bullets.join(" ").toLowerCase(), description: f.description.toLowerCase(), backend: f.backend_terms.toLowerCase() };
  const coverage = (list.data?.items ?? []).map((i) => {
    const k = i.keyword.toLowerCase();
    const where = [lower.title.includes(k) && "Title", lower.bullets.includes(k) && "Bullets", lower.description.includes(k) && "Description", lower.backend.includes(k) && "Backend"].filter(Boolean) as string[];
    return { keyword: i.keyword, volume: i.search_volume, where };
  });
  const covered = coverage.filter((c) => c.where.length).length;
  const set = <K extends keyof DraftIn>(k: K, v: DraftIn[K]) => setF((x) => ({ ...x, [k]: v }));

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card>
        <CardHeader title={<Input value={f.name} onChange={(e) => set("name", e.target.value)} className="h-9 max-w-md text-[15px] font-semibold" aria-label="Draft name" />}
          action={<>
            <Gate allowed={analyst}><Button size="sm" variant="ghost" className="text-danger" onClick={() => setRemoving(true)} aria-label="Delete draft"><Trash2 /></Button></Gate>
            <Button size="sm" variant="secondary" loading={analyse.isPending} onClick={() => analyse.mutate()}><Gauge />Analyse</Button>
            <Gate allowed={analyst}><Button size="sm" loading={save.isPending} disabled={!dirty} onClick={() => save.mutate()}><Save />{dirty ? "Save" : "Saved"}</Button></Gate>
          </>} />
        <CardBody className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Product" aside="Optional">
              <ProductSelect value={f.product_id && prod.data ? prod.data : null} onChange={(p) => set("product_id", p?.id ?? null)} allowClear placeholder={f.product_id ? (prod.isLoading ? "Loading product…" : `Product #${f.product_id}`) : "Link a product"} />
            </Field>
            <Field label="Target keyword list">
              <Select value={f.keyword_list_id ? String(f.keyword_list_id) : ""} onChange={(v) => set("keyword_list_id", v === "none" ? null : Number(v))} placeholder={lists.data?.length ? "Choose a list" : "No lists yet"}
                options={[{ value: "none", label: "No list" }, ...(lists.data ?? []).map((l) => ({ value: String(l.id), label: `${l.name} (${l.count})` }))]} aria-label="Keyword list" />
            </Field>
          </div>
          <Field label="Title" aside={<CharCount value={f.title} limit={LIMITS.title} recommended={[150, 200]} />} hint="Main keyword first. Title case, no promotional claims or special characters (! $ ? { } ^ ~ # < > *).">
            <Textarea value={f.title} onChange={(e) => set("title", e.target.value)} className="min-h-[64px]" />
          </Field>
          {f.bullets.map((b, i) => (
            <Field key={i} label={`Bullet ${i + 1}`} aside={<CharCount value={b} limit={LIMITS.bullet} recommended={[150, 250]} />}>
              <Textarea value={b} onChange={(e) => { const bs = [...f.bullets]; bs[i] = e.target.value; set("bullets", bs); }} className="min-h-[60px]" placeholder={i === 0 ? "BENEFIT LABEL – the proof, specifics and what's included" : undefined} />
            </Field>
          ))}
          <Field label="Description" aside={<CharCount value={f.description} limit={LIMITS.description} recommended={[800, 2000]} />}><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} className="min-h-[140px]" /></Field>
          <Field label="Backend search terms" aside={<CharCount value={f.backend_terms} limit={LIMITS.backend} bytes />} hint="Lower case, space-separated, no commas, no brand names, no words already in the title.">
            <Textarea value={f.backend_terms} onChange={(e) => set("backend_terms", e.target.value)} className="min-h-[60px] font-mono text-xs" />
          </Field>
          <Field label="Product facts" hint="Specs, materials, dimensions, what's in the box. The AI writer uses only these facts."><Textarea value={f.facts} onChange={(e) => set("facts", e.target.value)} /></Field>
        </CardBody>
      </Card>
      <div className="space-y-4 2xl:sticky 2xl:top-[calc(var(--topbar-h,56px)+16px)] 2xl:self-start">
        <Card>
          <CardHeader eyebrow="Checklist" title="Keyword coverage" description={f.keyword_list_id ? `${covered} of ${coverage.length} keywords used` : undefined}
            action={f.keyword_list_id && coverage.length ? <span className="text-xs text-muted num">{Math.round((covered / coverage.length) * 100)}%</span> : undefined} />
          <CardBody>
            {!f.keyword_list_id ? <EmptyState compact icon={ListChecks} title="Choose a keyword list" description="Pick a target list above to check each keyword is in your copy as you write." />
              : list.isLoading ? <LoadingRows rows={4} className="p-0" /> : list.error ? <ApiErrorView error={list.error} onRetry={() => list.refetch()} />
                : !coverage.length ? <EmptyState compact title="This list is empty" /> : (
                  <>
                    <Progress value={(covered / coverage.length) * 100} tone={covered / coverage.length >= 0.8 ? "success" : "warning"} className="mb-3" />
                    <ul className="max-h-[420px] space-y-1 overflow-y-auto">
                      {coverage.map((c) => (
                        <li key={c.keyword} className="flex items-start gap-2 text-[13px]">
                          {c.where.length ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <Circle className="mt-0.5 size-4 shrink-0 text-subtle" />}
                          <span className="min-w-0 flex-1"><span className={cn(!c.where.length && "text-muted")}>{c.keyword}</span>{c.where.length > 0 && <span className="block text-2xs text-subtle">{c.where.join(" · ")}</span>}</span>
                          {c.volume != null && <span className="text-2xs text-subtle num">{num(c.volume, { compact: true })}</span>}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
          </CardBody>
        </Card>
        <Card className="relative overflow-hidden">
          <CardHeader eyebrow={<span className="inline-flex items-center gap-1.5 text-violet"><Sparkles className="size-3.5" />AI writer</span>} title="Draft copy from your facts"
            description="Sends your product facts and keyword list to Claude. The result is a suggestion you review and save; it never overwrites this draft without you." />
          <CardBody><Gate allowed={analyst}><Button variant="secondary" className="w-full" disabled={f.facts.trim().length < 10} onClick={() => onAi({ facts: f.facts, keyword_list_id: f.keyword_list_id, draft, product_id: f.product_id })}><Wand2 />Write with AI</Button></Gate>
            {f.facts.trim().length < 10 && <p className="mt-2 text-xs text-subtle">Add product facts first (at least 10 characters).</p>}</CardBody>
        </Card>
      </div>
      <Sheet open={analysis && !!analyse.data} onOpenChange={setAnalysis} width={560} title="Draft analysis" description={f.name}>{analyse.data && <AnalysisView a={analyse.data} compact />}</Sheet>
      <ConfirmDialog open={removing} onOpenChange={setRemoving} title="Delete draft?" confirmLabel="Delete" loading={remove.isPending} description={<>“{draft.name}” will be permanently deleted.</>} onConfirm={() => remove.mutate()} />
    </div>
  );
}

/* ================================================================ AI writer */
function AiWriter({ seed, onSaved }: { seed: AiSeed | null; onSaved: (id: number) => void }) {
  const { marketplace } = useSession();
  const qc = useQueryClient();
  const analyst = useAnalyst();
  const lists = useKeywordLists();
  const datasets = useQuery({ queryKey: ["review-datasets"], queryFn: () => get<Dataset[]>("/reviews/datasets") });
  const [facts, setFacts] = React.useState("");
  const [kwMode, setKwMode] = React.useState<"list" | "type">("list");
  const [listId, setListId] = React.useState("");
  const [kwText, setKwText] = React.useState("");
  const [dsId, setDsId] = React.useState("none");
  const [comps, setComps] = React.useState<ProductBrief[]>([]);
  const [picker, setPicker] = React.useState(false);
  const [target, setTarget] = React.useState<{ draft: Draft | null; product_id: number | null } | null>(null);
  React.useEffect(() => {
    if (!seed) return;
    setFacts(seed.facts); setTarget({ draft: seed.draft, product_id: seed.product_id });
    if (seed.keyword_list_id) { setKwMode("list"); setListId(String(seed.keyword_list_id)); }
  }, [seed]);
  const gen = useMutation({
    mutationFn: () => post<Generated>("/listings/generate", {
      marketplace, facts, keywords: kwMode === "type" ? splitLines(kwText) : [], keyword_list_id: kwMode === "list" && listId ? Number(listId) : null,
      competitor_ids: comps.map((c) => c.id), review_dataset_id: dsId !== "none" ? Number(dsId) : null,
    }),
  });
  const g = gen.data;
  const body = (): DraftIn => ({
    name: target?.draft?.name ?? `AI draft · ${new Date().toLocaleDateString("en-GB")}`, product_id: target?.draft?.product_id ?? target?.product_id ?? null,
    title: g!.title, bullets: g!.bullets, description: g!.description, backend_terms: g!.backend_terms, keyword_list_id: kwMode === "list" && listId ? Number(listId) : target?.draft?.keyword_list_id ?? null, facts,
  });
  const saveNew = useMutation({
    mutationFn: () => post<{ id: number }>("/listings/drafts", body()),
    onSuccess: (r) => { toast.success("Saved as a new draft"); qc.invalidateQueries({ queryKey: ["listing-drafts"] }); onSaved(r.id); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const replace = useMutation({
    mutationFn: () => put(`/listings/drafts/${target!.draft!.id}`, body()),
    onSuccess: () => { toast.success("Draft updated with AI copy"); qc.invalidateQueries({ queryKey: ["listing-drafts"] }); onSaved(target!.draft!.id); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const kwCount = kwMode === "type" ? splitLines(kwText).length : lists.data?.find((l) => String(l.id) === listId)?.count ?? 0;
  const risks = g ? g.analysis.issues.filter((i) => i.severity !== "low") : [];
  const confidence = g ? (g.analysis.score >= 80 && g.notes.length <= 2 && !risks.some((r) => r.severity === "high") ? "high" : g.analysis.score >= 60 ? "medium" : "low") : null;
  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="self-start">
        <CardHeader eyebrow={<span className="inline-flex items-center gap-1.5 text-violet"><Sparkles className="size-3.5" />AI listing writer</span>} title="Write a listing from facts"
          description={`Claude writes for Amazon ${marketplace} using only the facts you give. It's told not to invent specs, certifications or claims; check everything before publishing.`} />
        <CardBody className="space-y-4">
          {target?.draft && <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs text-muted"><FileText className="size-3.5" /><span className="min-w-0 flex-1 truncate">For draft “{target.draft.name}”</span><button aria-label="Detach draft" onClick={() => setTarget(null)}><X className="size-3.5" /></button></div>}
          <Field label="Product facts" aside={`${facts.trim().length} chars`} hint="Materials, dimensions, weight, colours, what's included, care, warranty. Facts only."><Textarea value={facts} onChange={(e) => setFacts(e.target.value)} className="min-h-[180px]" placeholder={"Double ottoman bed, 4ft6 (135 × 190 cm)\nGrey plush velvet, solid pine slats\nGas-lift storage, 2 × 1,000 N struts\nDelivered flat-packed in 4 boxes; tools included"} /></Field>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><span className="text-[13px] font-medium">Target keywords</span><Segmented size="sm" value={kwMode} onChange={setKwMode} options={[{ value: "list", label: "Keyword list" }, { value: "type", label: "Type" }]} /></div>
            {kwMode === "list" ? (lists.data?.length ? <Select value={listId} onChange={setListId} placeholder="Choose a list" options={lists.data.map((l) => ({ value: String(l.id), label: `${l.name} (${l.count})` }))} aria-label="Keyword list" />
              : <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs text-muted">No lists yet. <Link className="text-primary hover:underline" href="/keywords">Find keywords</Link> or type them.</p>)
              : <Textarea value={kwText} onChange={(e) => setKwText(e.target.value)} className="min-h-[72px]" placeholder="Most important first" />}
          </div>
          <Field label="Address competitor complaints" aside="Optional" hint="Themes from a review dataset you imported, so the copy answers real objections with your facts.">
            <Select value={dsId} onChange={setDsId} options={[{ value: "none", label: "None" }, ...(datasets.data ?? []).map((d) => ({ value: String(d.id), label: `${d.name} (${num(d.review_count)} reviews)` }))]} aria-label="Review dataset" />
          </Field>
          <Field label="Competitor titles for context" aside="Optional">
            <div className="flex flex-wrap items-center gap-1.5">
              {comps.map((c) => <Badge key={c.id} className="max-w-[200px]"><span className="truncate">{c.title || c.asin}</span><button aria-label="Remove" onClick={() => setComps(comps.filter((x) => x.id !== c.id))}><X className="size-3" /></button></Badge>)}
              <Button size="sm" variant="ghost" onClick={() => setPicker(true)}><Plus />{comps.length ? "Edit" : "Add"}</Button>
            </div>
          </Field>
          <Gate allowed={analyst}><Button className="w-full" loading={gen.isPending} disabled={facts.trim().length < 10} onClick={() => gen.mutate()}><Sparkles />Generate listing</Button></Gate>
        </CardBody>
      </Card>
      <div className="min-w-0">
        {gen.isIdle ? <Card><EmptyState icon={Sparkles} title="Nothing generated yet" description="You'll get a title, five bullets, a description and backend terms, where each keyword was placed, a rule check, and a list of facts that would make the listing stronger." /></Card>
          : gen.isPending ? <Card><div className="flex items-center gap-2 border-b border-line px-4 py-3 text-[13px] text-muted"><Sparkles className="size-4 animate-pulse text-violet" />Writing with Claude. This usually takes 20–40 seconds…</div><LoadingRows rows={7} /></Card>
            : gen.error ? <Card><ApiErrorView error={gen.error} fallbackProvider="Claude (Anthropic API)" onRetry={() => gen.mutate()} /></Card>
              : g && (
                <div className="space-y-4">
                  <Card className="relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(500px 200px at 100% 0%, rgb(var(--violet) / 0.10), transparent 70%)" }} />
                    <CardHeader className="relative" eyebrow="AI-generated draft" title="Suggested listing"
                      description="Generated copy. Verify every claim against the product before publishing on Amazon."
                      action={<SourceBadge source={g.source} classification="ai" />} />
                    <CardBody className="relative space-y-4">
                      <GenBlock label="Title" text={g.title} counter={<CharCount value={g.title} limit={LIMITS.title} recommended={[150, 200]} />} />
                      {g.bullets.map((b, i) => <GenBlock key={i} label={`Bullet ${i + 1}`} text={b} counter={<CharCount value={b} limit={LIMITS.bullet} recommended={[150, 250]} />} />)}
                      <GenBlock label="Description" text={g.description} counter={<CharCount value={g.description} limit={LIMITS.description} />} />
                      <GenBlock label="Backend search terms" text={g.backend_terms} mono counter={<CharCount value={g.backend_terms} limit={LIMITS.backend} bytes />} />
                      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
                        {target?.draft && <Gate allowed={analyst}><Button variant="secondary" loading={replace.isPending} onClick={() => replace.mutate()}>Replace “{target.draft.name}”</Button></Gate>}
                        <Gate allowed={analyst}><Button loading={saveNew.isPending} onClick={() => saveNew.mutate()}><Save />Save as new draft</Button></Gate>
                      </div>
                    </CardBody>
                  </Card>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                      <CardHeader eyebrow="Evidence" title="What the AI was given and where keywords went" />
                      <CardBody className="space-y-3">
                        <ul className="space-y-1 text-[13px] text-muted">
                          <li>{facts.trim().split(/\n+/).length} lines of your product facts</li>
                          <li>{num(kwCount)} target keywords{kwMode === "list" && listId ? " from your keyword list" : ""} (first 80 used)</li>
                          {comps.length > 0 && <li>{comps.length} competitor title{comps.length === 1 ? "" : "s"} for context</li>}
                          {dsId !== "none" && <li>Negative themes from review dataset “{datasets.data?.find((d) => String(d.id) === dsId)?.name}”</li>}
                        </ul>
                        {g.keyword_placement.length ? (
                          <div className="max-h-64 overflow-y-auto rounded-lg border border-line">
                            <table className="w-full text-[12px]"><tbody className="divide-y divide-line">{g.keyword_placement.map((k, i) => <tr key={i}><td className="px-2.5 py-1.5">{k.keyword}</td><td className="px-2.5 py-1.5 text-right text-muted">{k.where}</td></tr>)}</tbody></table>
                          </div>
                        ) : <p className="text-xs text-subtle">The model didn't report keyword placement.</p>}
                      </CardBody>
                    </Card>
                    <Card>
                      <CardHeader eyebrow="Confidence & risks" title={<span className="flex items-center gap-2">Rule-check confidence: <Badge tone={confidence === "high" ? "success" : confidence === "medium" ? "warning" : "danger"} className="capitalize">{confidence}</Badge><InfoTip content="Kestrel's own check, not the model's: based on the listing-rule score of the generated copy, how many facts the model says are missing, and any high-severity rule issues." /></span>} />
                      <CardBody className="space-y-4">
                        <div>
                          <div className="mb-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">Assumptions</div>
                          <ul className="list-disc space-y-1 pl-4 text-[13px] text-muted">
                            <li>Your facts are accurate and complete; nothing outside them should appear in the copy.</li>
                            <li>Keyword order reflects priority; the first keyword leads the title.</li>
                            <li>Category limits follow Amazon's general style guide (200-character titles, 249-byte backend terms). Your category may be stricter.</li>
                          </ul>
                        </div>
                        <div>
                          <div className="mb-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">Missing information</div>
                          {g.notes.length ? <ul className="list-disc space-y-1 pl-4 text-[13px] text-muted">{g.notes.map((n, i) => <li key={i}>{n}</li>)}</ul> : <p className="text-[13px] text-muted">The model didn't flag missing facts.</p>}
                        </div>
                        <div>
                          <div className="mb-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">Risks</div>
                          {risks.length ? <ul className="space-y-1.5">{risks.map((r, i) => <li key={i} className="flex gap-2 text-[13px]"><AlertTriangle className={cn("mt-0.5 size-3.5 shrink-0", r.severity === "high" ? "text-danger" : "text-warning")} /><span><span className="font-medium">{r.title}.</span> <span className="text-muted">{r.detail}</span></span></li>)}</ul>
                            : <p className="text-[13px] text-muted">No high or medium rule issues. Still check claims against the product.</p>}
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                  <Card><CardHeader eyebrow="Rule check" title="Analysis of the generated copy" /><CardBody><AnalysisView a={g.analysis} compact /></CardBody></Card>
                </div>
              )}
      </div>
      <ProductPickerDialog open={picker} onOpenChange={setPicker} multiple max={10} initial={comps} title="Choose competitor products" onPick={setComps} />
    </div>
  );
}

function GenBlock({ label, text, counter, mono }: { label: string; text: string; counter: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2"><span className="text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">{label}</span><span className="flex items-center gap-2 text-2xs">{counter}<button className="text-subtle hover:text-fg" aria-label={`Copy ${label}`} onClick={() => copy(text)}><Copy className="size-3.5" /></button></span></div>
      <div className={cn("whitespace-pre-wrap rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[13px] leading-relaxed", mono && "font-mono text-xs")}>{text || <span className="text-subtle">Empty</span>}</div>
    </div>
  );
}
