"use client";
/* Review Intelligence: analyse reviews the user imports (CSV or pasted text). Kestrel never generates reviews. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, FileUp, Info, MessageSquareQuote, Plus, Quote, ShieldCheck, Sparkles, Star, ThumbsDown, ThumbsUp, Trash2, Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import type { ProductBrief } from "@/components/app/product";
import { Donut } from "@/components/ui/charts";
import { BarList, EmptyState, LoadingRows, MetricCard, PageHeader, SourceBadge } from "@/components/ui/data";
import { ConfirmDialog, Dialog, Select, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, SearchInput, Segmented, Skeleton, Textarea } from "@/components/ui/primitives";
import { api, del, errorMessage, get, post } from "@/lib/api";
import { ago, cn, num } from "@/lib/utils";
import { ApiErrorView, Gate, ProductSelect, useAnalyst, type Provenance } from "./common";

type DatasetRow = { id: number; name: string; product_id: number | null; source: string; review_count: number; analysed_at: string | null; has_ai: boolean; created_at: string };
type Review = { rating: number | null; title: string; body: string; date?: string };
type Theme = { theme: string; mentions: number; share: number; negative: number; positive: number; example: string };
type AiItem = { theme: string; detail: string; review_ids: string[]; share_pct: number };
type AiReport = {
  summary: string; complaints: AiItem[]; praise: AiItem[]; defects: AiItem[]; packaging: AiItem[]; missing_features: AiItem[]; expectations: AiItem[];
  improvements: { change: string; why: string; review_ids: string[]; priority: "high" | "medium" | "low" }[]; competitor_weaknesses: string[]; confidence: "high" | "medium" | "low"; limitations: string[];
};
type Analysis = {
  count: number; stars: Record<string, number>; sentiment: { positive: number; neutral: number; negative: number } | null; themes: Theme[];
  complaint_terms: { term: string; count: number }[]; praise_terms: { term: string; count: number }[]; ai?: AiReport; ai_source?: Provenance; ai_reviews_used?: number;
};
type Dataset = { id: number; name: string; product_id: number | null; review_count: number; analysis: Analysis; reviews: Review[]; source: Provenance };

const TONE = { high: "danger", medium: "warning", low: "neutral" } as const;

export function ReviewIntelligencePage() {
  const analyst = useAnalyst();
  const list = useQuery({ queryKey: ["review-datasets"], queryFn: () => get<DatasetRow[]>("/reviews/datasets") });
  const [active, setActive] = React.useState<number | null>(null);
  const [importing, setImporting] = React.useState(false);
  React.useEffect(() => { if (list.data?.length && (active == null || !list.data.some((d) => d.id === active))) setActive(list.data[0].id); }, [list.data, active]);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Competitor intelligence" title="Review Intelligence"
        description="Turn reviews you import into themes, complaints, feature requests and a product improvement report, with every finding linked to the reviews behind it."
        actions={<Gate allowed={analyst}><Button onClick={() => setImporting(true)}><Upload />Import reviews</Button></Gate>} />
      <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[13px]">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-muted"><span className="font-medium text-fg">Kestrel never writes, generates or posts reviews.</span> It only analyses reviews you import from your own exports or copy from public Amazon pages, and every AI finding cites the review numbers it comes from.</p>
      </div>
      {list.error ? <Card><ApiErrorView error={list.error} onRetry={() => list.refetch()} /></Card> : !list.isLoading && !list.data?.length ? (
        <Card><EmptyState icon={MessageSquareQuote} title="Import reviews to analyse"
          description="Upload a CSV with rating, title and body columns, or paste reviews copied from an Amazon product page (each starting “x out of 5 stars”). Use your own products' reviews or competitors' to find what buyers complain about."
          action={<Gate allowed={analyst}><Button onClick={() => setImporting(true)}><Upload />Import reviews</Button></Gate>} /></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="self-start">
            <CardHeader title="Datasets" description="Each import is analysed on upload." />
            <CardBody className="px-2 pb-2">
              {list.isLoading ? <LoadingRows rows={3} className="p-2" /> : (
                <ul className="space-y-0.5">{list.data!.map((d) => (
                  <li key={d.id}><button onClick={() => setActive(d.id)} className={cn("w-full rounded-lg px-3 py-2 text-left transition-colors", d.id === active ? "bg-surface-2" : "hover:bg-surface-2/60")}>
                    <div className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate text-[13px] font-medium">{d.name}</span>{d.has_ai && <Badge tone="violet" size="sm">AI</Badge>}</div>
                    <div className="text-2xs text-subtle"><span className="num">{num(d.review_count)}</span> reviews · {ago(d.created_at)}</div>
                  </button></li>
                ))}</ul>
              )}
            </CardBody>
          </Card>
          <div className="min-w-0">{active != null ? <DatasetView key={active} id={active} onDeleted={() => setActive(null)} /> : <Card><LoadingRows rows={6} /></Card>}</div>
        </div>
      )}
      <ImportDialog open={importing} onOpenChange={setImporting} onCreated={setActive} />
    </div>
  );
}

/* ---------------------------------------------------------------- import */
function ImportDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: (id: number) => void }) {
  const qc = useQueryClient();
  const [name, setName] = React.useState("");
  const [product, setProduct] = React.useState<ProductBrief | null>(null);
  const [mode, setMode] = React.useState<"file" | "paste">("file");
  const [file, setFile] = React.useState<File | null>(null);
  const [text, setText] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { if (open) { setName(""); setProduct(null); setFile(null); setText(""); } }, [open]);
  const m = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (product) fd.append("product_id", String(product.id));
      if (mode === "file" && file) fd.append("file", file); else fd.append("text", text);
      return api<{ id: number; review_count: number }>("/reviews/datasets", { method: "POST", form: fd });
    },
    onSuccess: (r) => { toast.success(`Imported and analysed ${num(r.review_count)} reviews`); qc.invalidateQueries({ queryKey: ["review-datasets"] }); onCreated(r.id); onOpenChange(false); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const ready = name.trim() && (mode === "file" ? !!file : text.trim().length > 20);
  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" title="Import reviews" description="Reviews stay private to your organisation. Kestrel analyses them; it never creates or edits reviews."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button loading={m.isPending} disabled={!ready} onClick={() => m.mutate()}><Upload />Import and analyse</Button></>}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Dataset name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Competitor ottoman — 1★–3★" autoFocus /></Field>
          <Field label="Product" aside="Optional"><ProductSelect value={product} onChange={setProduct} allowClear placeholder="Link to a product" /></Field>
        </div>
        <Segmented value={mode} onChange={setMode} options={[{ value: "file", label: "Upload CSV" }, { value: "paste", label: "Paste text" }]} />
        {mode === "file" ? (
          <div>
            <input ref={inputRef} type="file" accept=".csv,text/csv,.txt,text/plain" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <button type="button" onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-2/50 px-4 py-8 text-center transition-colors hover:border-primary">
              <FileUp className="size-6 text-subtle" />
              {file ? <><span className="text-[13px] font-medium">{file.name}</span><span className="text-xs text-subtle">{num(Math.round(file.size / 1024))} KB · click to change</span></>
                : <><span className="text-[13px] font-medium">Drop a CSV here or click to choose</span><span className="text-xs text-subtle">Columns: rating (or stars), title, body (or review/text), optional date</span></>}
            </button>
          </div>
        ) : (
          <Field label="Reviews" hint="Paste straight from an Amazon review page. Each review should start with “x out of 5 stars”. Plain paragraphs also work (without ratings).">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[200px] text-xs" placeholder={"5.0 out of 5 stars Really sturdy\nReviewed in the United Kingdom on 2 May 2025\nVerified Purchase\nEasy to assemble and feels solid…"} />
          </Field>
        )}
      </div>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- dataset */
function DatasetView({ id, onDeleted }: { id: number; onDeleted: () => void }) {
  const qc = useQueryClient();
  const analyst = useAnalyst();
  const q = useQuery({ queryKey: ["review-dataset", id], queryFn: () => get<Dataset>(`/reviews/datasets/${id}`) });
  const [removing, setRemoving] = React.useState(false);
  const ai = useMutation({
    mutationFn: () => post<Analysis>(`/reviews/datasets/${id}/ai`),
    onSuccess: () => { toast.success("AI report ready"); qc.invalidateQueries({ queryKey: ["review-dataset", id] }); qc.invalidateQueries({ queryKey: ["review-datasets"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: () => del(`/reviews/datasets/${id}`),
    onSuccess: () => { toast.success("Dataset deleted"); setRemoving(false); qc.invalidateQueries({ queryKey: ["review-datasets"] }); onDeleted(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (q.isLoading) return <div className="space-y-4"><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div><Card><LoadingRows rows={6} /></Card></div>;
  if (q.error) return <Card><ApiErrorView error={q.error} onRetry={() => q.refetch()} /></Card>;
  const d = q.data!;
  const a = d.analysis;
  const rated = Object.entries(a.stars).reduce((s, [k, v]) => s + Number(k) * v, 0), nRated = Object.values(a.stars).reduce((s, v) => s + v, 0);
  const avg = nRated ? rated / nRated : null;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="min-w-0 flex-1 truncate text-[17px] font-semibold">{d.name}</h2>
        <SourceBadge source={d.source} />
        <Gate allowed={analyst}><Button size="sm" variant="ghost" className="text-danger" onClick={() => setRemoving(true)}><Trash2 />Delete</Button></Gate>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Reviews imported" icon={MessageSquareQuote} value={num(d.review_count)} source={d.source} />
        <MetricCard label="Average rating" icon={Star} tone="warning" value={avg == null ? "—" : avg.toFixed(2)} sub={nRated < d.review_count ? <span>{num(nRated)} with a rating</span> : undefined} />
        <MetricCard label="Negative (1–2★)" icon={ThumbsDown} tone="danger" value={a.sentiment && nRated ? `${Math.round((a.sentiment.negative / nRated) * 100)}%` : "—"} />
        <MetricCard label="Positive (4–5★)" icon={ThumbsUp} tone="success" value={a.sentiment && nRated ? `${Math.round((a.sentiment.positive / nRated) * 100)}%` : "—"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader eyebrow="Ratings" title="Star distribution" />
          <CardBody>{nRated ? <BarList rows={["5", "4", "3", "2", "1"].map((s) => ({ label: `${s} star`, value: a.stars[s] ?? 0, tone: Number(s) >= 4 ? "success" : s === "3" ? "warning" : "danger" }))} format={(v) => num(v)} />
            : <EmptyState compact icon={Star} title="No ratings in this import" description="The reviews had no star ratings, so only themes are shown." />}</CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Sentiment" title="By star rating" description="Positive 4–5★, neutral 3★, negative 1–2★." />
          <CardBody>{a.sentiment && nRated ? <Donut height={170} data={[{ name: "Positive", value: a.sentiment.positive, tone: "success" }, { name: "Neutral", value: a.sentiment.neutral, tone: "warning" }, { name: "Negative", value: a.sentiment.negative, tone: "danger" }]} valueFormat={(v) => num(v)} center={<div><div className="text-lg font-semibold num">{num(nRated)}</div><div className="text-2xs text-subtle">rated</div></div>} />
            : <EmptyState compact title="No ratings to split" />}</CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader eyebrow="Themes" title="What reviewers talk about" description="Keyword-matched themes across all imported reviews, with the share that are negative. Each example is a real review from your import." action={<SourceBadge classification="estimated" source={{ classification: "estimated", provider: "Kestrel theme rules", note: "Keyword matching; a review can count towards several themes." }} />} />
        <CardBody>
          {a.themes.length ? (
            <div className="space-y-3">{a.themes.map((t) => (
              <div key={t.theme} className="rounded-xl border border-line p-3">
                <div className="flex flex-wrap items-center gap-2"><span className="text-[13px] font-semibold">{t.theme}</span><span className="text-xs text-muted num">{num(t.mentions)} mention{t.mentions === 1 ? "" : "s"} · {Math.round(t.share * 100)}% of reviews</span>
                  <span className="ml-auto flex gap-1.5">{t.negative > 0 && <Badge tone="danger" size="sm">{t.negative} negative</Badge>}{t.positive > 0 && <Badge tone="success" size="sm">{t.positive} positive</Badge>}</span></div>
                <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div className="bg-danger" style={{ width: `${(t.negative / Math.max(1, t.mentions)) * 100}%` }} />
                  <div className="bg-success" style={{ width: `${(t.positive / Math.max(1, t.mentions)) * 100}%` }} />
                </div>
                {t.example && <p className="mt-2 flex gap-2 text-xs text-muted"><Quote className="mt-0.5 size-3 shrink-0 text-subtle" /><span className="italic">{t.example}{t.example.length >= 220 ? "…" : ""}</span></p>}
              </div>
            ))}</div>
          ) : <EmptyState compact title="No recognised themes" description="None of Kestrel's theme keywords appeared. The AI report can still find themes in free text." />}
        </CardBody>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card><CardHeader eyebrow="Complaint words" title="Most frequent negative terms" /><CardBody>{a.complaint_terms.length ? <BarList rows={a.complaint_terms.slice(0, 12).map((t) => ({ label: t.term, value: t.count, tone: "danger" }))} /> : <EmptyState compact title="None found" />}</CardBody></Card>
        <Card><CardHeader eyebrow="Praise words" title="Most frequent positive terms" /><CardBody>{a.praise_terms.length ? <BarList rows={a.praise_terms.slice(0, 12).map((t) => ({ label: t.term, value: t.count, tone: "success" }))} /> : <EmptyState compact title="None found" />}</CardBody></Card>
      </div>

      <AiSection d={d} pending={ai.isPending} error={ai.error} onRun={() => ai.mutate()} />
      <ReviewBrowser reviews={d.reviews} total={d.review_count} />
      <ConfirmDialog open={removing} onOpenChange={setRemoving} title="Delete review dataset?" confirmLabel="Delete" loading={remove.isPending}
        description={<>“{d.name}”, its {num(d.review_count)} imported reviews and any AI report will be permanently deleted.</>} onConfirm={() => remove.mutate()} />
    </div>
  );
}

/* ---------------------------------------------------------------- AI report */
function AiSection({ d, pending, error, onRun }: { d: Dataset; pending: boolean; error: unknown; onRun: () => void }) {
  const analyst = useAnalyst();
  const r = d.analysis.ai;
  const header = (
    <CardHeader eyebrow={<span className="inline-flex items-center gap-1.5 text-violet"><Sparkles className="size-3.5" />AI improvement report</span>}
      title={r ? "Product improvement report" : "Get an AI improvement report"}
      description={r ? `Claude read ${num(d.analysis.ai_reviews_used ?? d.review_count)} of ${num(d.review_count)} reviews. Every theme cites review numbers (R1, R2…) you can open below.` : "Claude reads up to 400 of your imported reviews and groups complaints, praise, defects, packaging issues and feature requests, citing the reviews behind each one."}
      action={<>{r && <SourceBadge source={{ ...(d.analysis.ai_source ?? {}), classification: "ai" }} />}<Gate allowed={analyst}><Button size="sm" variant={r ? "secondary" : "primary"} loading={pending} onClick={onRun}><Sparkles />{r ? "Regenerate" : "Generate report"}</Button></Gate></>} />
  );
  if (pending && !r) return <Card>{header}<CardBody><div className="mb-3 flex items-center gap-2 text-[13px] text-muted"><Sparkles className="size-4 animate-pulse text-violet" />Reading reviews. This usually takes 30–90 seconds…</div><LoadingRows rows={5} className="p-0" /></CardBody></Card>;
  if (error && !r) return <Card>{header}<CardBody><ApiErrorView error={error} fallbackProvider="Claude (Anthropic API)" onRetry={onRun} /></CardBody></Card>;
  if (!r) return <Card>{header}</Card>;
  const sections: [string, AiItem[], "danger" | "success" | "warning" | "cyan" | "violet" | "primary"][] = [
    ["Complaints", r.complaints, "danger"], ["Defects", r.defects, "danger"], ["Packaging & delivery", r.packaging, "warning"],
    ["Feature requests", r.missing_features, "violet"], ["Unmet expectations", r.expectations, "warning"], ["Praise", r.praise, "success"],
  ];
  return (
    <Card>
      {header}
      <CardBody className="space-y-5">
        <div className="rounded-xl border border-violet/30 bg-violet-soft/40 p-4">
          <div className="mb-1 flex flex-wrap items-center gap-2"><span className="text-[13px] font-semibold">Summary</span>
            <Badge tone={r.confidence === "high" ? "success" : r.confidence === "medium" ? "warning" : "danger"} size="sm" className="capitalize">{r.confidence} confidence</Badge></div>
          <p className="text-[13px] leading-relaxed text-muted">{r.summary}</p>
        </div>
        {r.improvements.length > 0 && (
          <div>
            <h4 className="mb-2 text-[13px] font-semibold">Recommended improvements</h4>
            <ul className="space-y-2">{r.improvements.map((i, k) => (
              <li key={k} className="rounded-xl border border-line p-3">
                <div className="flex flex-wrap items-start gap-2"><Badge tone={TONE[i.priority]} size="sm" className="capitalize">{i.priority}</Badge><span className="min-w-0 flex-1 text-[13px] font-medium">{i.change}</span></div>
                <p className="mt-1 text-xs text-muted">{i.why}</p>
                <Evidence ids={i.review_ids} reviews={d.reviews} />
              </li>
            ))}</ul>
          </div>
        )}
        <div className="grid gap-4 xl:grid-cols-2">
          {sections.filter(([, items]) => items.length).map(([label, items, tone]) => (
            <div key={label}>
              <h4 className="mb-2 text-[13px] font-semibold">{label}</h4>
              <ul className="space-y-2">{items.map((it, k) => (
                <li key={k} className="rounded-xl border border-line p-3">
                  <div className="flex items-start gap-2"><span className="min-w-0 flex-1 text-[13px] font-medium">{it.theme}</span><Badge tone={tone} size="sm" className="num">{Math.round(it.share_pct)}%</Badge></div>
                  <p className="mt-1 text-xs text-muted">{it.detail}</p>
                  <Evidence ids={it.review_ids} reviews={d.reviews} />
                </li>
              ))}</ul>
            </div>
          ))}
        </div>
        {r.competitor_weaknesses.length > 0 && (
          <div><h4 className="mb-2 text-[13px] font-semibold">Competitor weaknesses</h4><ul className="list-disc space-y-1 pl-5 text-[13px] text-muted">{r.competitor_weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul></div>
        )}
        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[13px] font-semibold"><AlertTriangle className="size-3.5 text-warning" />Limitations and missing information</div>
          <ul className="list-disc space-y-1 pl-5 text-xs text-muted">
            {r.limitations.map((l, i) => <li key={i}>{l}</li>)}
            {(d.analysis.ai_reviews_used ?? 0) < d.review_count && <li>Only the first {num(d.analysis.ai_reviews_used)} of {num(d.review_count)} reviews were read.</li>}
            <li>Percentages are shares of the imported reviews, not of all buyers. Imported reviews may not be representative.</li>
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}

function Evidence({ ids, reviews }: { ids: string[]; reviews: Review[] }) {
  const [open, setOpen] = React.useState(false);
  if (!ids.length) return <p className="mt-2 text-2xs text-subtle">No reviews cited.</p>;
  const quotes = ids.map((id) => ({ id, i: Number(id.replace(/\D/g, "")) - 1 })).map(({ id, i }) => ({ id, r: Number.isFinite(i) && i >= 0 ? reviews[i] : undefined }));
  return (
    <div className="mt-2">
      <button onClick={() => setOpen(!open)} className="inline-flex flex-wrap items-center gap-1 text-2xs text-primary hover:underline">
        <Quote className="size-3" />{open ? "Hide" : "Show"} evidence · {ids.slice(0, 8).join(", ")}{ids.length > 8 ? ` +${ids.length - 8}` : ""}
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5 border-l-2 border-line pl-3">
          {quotes.slice(0, 6).map(({ id, r }) => (
            <li key={id} className="text-xs">
              <span className="mr-1.5 font-mono text-2xs text-subtle">{id}</span>
              {r ? <><span className="text-warning num">{r.rating != null ? `${r.rating}★ ` : ""}</span>{r.title && <span className="font-medium">{r.title} — </span>}<span className="text-muted">{r.body.slice(0, 260)}{r.body.length > 260 ? "…" : ""}</span></>
                : <span className="text-subtle">Beyond the 300 reviews shown here; open the original import to read it.</span>}
            </li>
          ))}
          {quotes.length > 6 && <li className="text-2xs text-subtle">and {quotes.length - 6} more cited</li>}
        </ul>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- browser */
function ReviewBrowser({ reviews, total }: { reviews: Review[]; total: number }) {
  const [q, setQ] = React.useState("");
  const [stars, setStars] = React.useState("all");
  const [limit, setLimit] = React.useState(20);
  const rows = reviews.map((r, i) => ({ ...r, n: i + 1 })).filter((r) => (stars === "all" || (stars === "none" ? r.rating == null : Math.round(r.rating ?? 0) === Number(stars)))
    && (!q || `${r.title} ${r.body}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <Card>
      <CardHeader eyebrow="Imported reviews" title="Read the source reviews" description={`Showing the first ${num(reviews.length)} of ${num(total)}. Numbers match the AI report's citations.`}
        action={<SourceBadge classification="user" source={{ classification: "user", provider: "Your upload" }} />} />
      <CardBody className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <SearchInput value={q} onChange={(v) => { setQ(v); setLimit(20); }} placeholder="Search reviews" className="min-w-[200px] flex-1" />
          <div className="w-40"><Select value={stars} onChange={(v) => { setStars(v); setLimit(20); }} options={[{ value: "all", label: "All ratings" }, ...["5", "4", "3", "2", "1"].map((s) => ({ value: s, label: `${s} star` })), { value: "none", label: "No rating" }]} aria-label="Rating filter" /></div>
        </div>
        {!rows.length ? <EmptyState compact icon={Info} title="No reviews match" /> : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {rows.slice(0, limit).map((r) => (
              <li key={r.n} className="p-3">
                <div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-mono text-2xs text-subtle">R{r.n}</span>
                  {r.rating != null && <Tooltip content={`${r.rating} out of 5`}><span className="inline-flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("size-3", i < Math.round(r.rating!) ? "fill-warning text-warning" : "text-line-strong")} />)}</span></Tooltip>}
                  {r.title && <span className="font-medium">{r.title}</span>}{r.date && <span className="text-subtle">{r.date}</span>}</div>
                <p className="mt-1 text-[13px] text-muted">{r.body}</p>
              </li>
            ))}
          </ul>
        )}
        {rows.length > limit && <div className="flex justify-center"><Button variant="secondary" size="sm" onClick={() => setLimit(limit + 40)}><Plus />Show more ({num(rows.length - limit)} left)</Button></div>}
      </CardBody>
    </Card>
  );
}
