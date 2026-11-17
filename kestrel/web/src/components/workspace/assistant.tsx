"use client";
/* AI Research Assistant: threaded chat over the organisation's own data, with cited evidence (/assistant/*). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle, ArrowUp, BookOpenCheck, Check, CircleHelp, Copy, Database, ListChecks, MessageSquarePlus, MessagesSquare, ShieldAlert, Sparkles, Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { RoleGate } from "@/components/finance/shared";
import { ErrorState, NotConfigured, PageHeader, SourceBadge } from "@/components/ui/data";
import { ConfirmDialog, Sheet, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, Skeleton, Textarea } from "@/components/ui/primitives";
import { ApiError, del, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, cn, dateShort } from "@/lib/utils";
import { Markdown, type RecordRef } from "./markdown";

type SourceRef = { id: string; type: string; label: string; href: string; retrieved_at?: string | null; classification?: string };
type Structured = {
  answer: string; evidence: { claim: string; record_ids: string[]; sources?: SourceRef[] }[]; assumptions: string[]; confidence: "high" | "medium" | "low";
  missing_information: string[]; risks: string[]; sources?: SourceRef[]; retrieved_records?: number;
};
type Msg = { id: number; role: "user" | "assistant"; content: string; structured: Structured | null; created_at: string };
type Thread = { id: number; title: string; messages: Msg[] };
type ThreadRow = { id: number; title: string; updated_at: string };
type AskResp = { thread_id: number; message: Msg };

const PROMPTS = [
  "Which of my products have strong demand and manageable competition?",
  "Compare my top three opportunities on profit, competition and risk",
  "Which suppliers carry the most risk, and why?",
  "Explain why my lowest-scoring product scores badly",
];
const CONF: Record<string, { label: string; tone: "primary" | "warning" | "danger" }> = { high: { label: "High confidence", tone: "primary" }, medium: { label: "Medium confidence", tone: "warning" }, low: { label: "Low confidence", tone: "danger" } };
const TYPE_LABEL: Record<string, string> = { product: "Product", supplier: "Supplier", history: "Price & rank history", keywords: "Keyword list" };

export function Assistant() {
  const router = useRouter();
  const sp = useSearchParams();
  const qc = useQueryClient();
  const { can, me } = useSession();
  const initialQ = sp.get("q");
  const [threadId, setThreadId] = React.useState<number | null>(() => Number(sp.get("thread")) || null);
  const [draft, setDraft] = React.useState("");
  const [pending, setPending] = React.useState<string | null>(null);
  const [askError, setAskError] = React.useState<{ q: string; e: unknown } | null>(null);
  const [threadsOpen, setThreadsOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState<ThreadRow | null>(null);
  const autoAsked = React.useRef(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  const threads = useQuery({ queryKey: ["assistant-threads"], queryFn: () => get<ThreadRow[]>("/assistant/threads") });
  const thread = useQuery({ queryKey: ["assistant-thread", threadId], queryFn: () => get<Thread>(`/assistant/threads/${threadId}`), enabled: !!threadId });

  const select = (id: number | null) => {
    setThreadId(id); setAskError(null); setThreadsOpen(false);
    router.replace(id ? `/assistant?thread=${id}` : "/assistant", { scroll: false });
  };

  const ask = useMutation({
    mutationFn: (v: { question: string; thread_id: number | null }) => post<AskResp>("/assistant/ask", { question: v.question, thread_id: v.thread_id, context: {} }),
    onMutate: (v) => { setPending(v.question); setAskError(null); },
    onSuccess: async (r) => {
      if (r.thread_id !== threadId) { setThreadId(r.thread_id); router.replace(`/assistant?thread=${r.thread_id}`, { scroll: false }); }
      await Promise.all([qc.invalidateQueries({ queryKey: ["assistant-thread", r.thread_id] }), qc.invalidateQueries({ queryKey: ["assistant-threads"] })]);
    },
    onError: (e, v) => { setAskError({ q: v.question, e }); setDraft((d) => d || v.question); },
    onSettled: () => setPending(null),
  });
  const send = (text?: string) => {
    const q = (text ?? draft).trim();
    if (q.length < 2 || ask.isPending) return;
    setDraft("");
    ask.mutate({ question: q, thread_id: threadId });
  };

  // honour ?q= once on load: start a fresh conversation with it
  React.useEffect(() => {
    if (!me) return;
    if (initialQ && !autoAsked.current && can("analyst")) {
      autoAsked.current = true;
      setThreadId(null);
      ask.mutate({ question: initialQ, thread_id: null });
    } else if (initialQ && !autoAsked.current) {
      autoAsked.current = true;
      setDraft(initialQ);
    }
  }, [initialQ, me]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeThread = useMutation({
    mutationFn: (id: number) => del(`/assistant/threads/${id}`),
    onSuccess: (_, id) => { toast.success("Conversation deleted"); setRemoving(null); if (id === threadId) select(null); qc.invalidateQueries({ queryKey: ["assistant-threads"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const msgs = threadId ? thread.data?.messages ?? [] : [];
  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs.length, pending]);

  const threadList = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="p-3"><Button variant="secondary" className="w-full" onClick={() => select(null)}><MessageSquarePlus />New conversation</Button></div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {threads.isLoading ? <div className="space-y-2 px-1">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-11 w-full" />)}</div>
          : threads.error ? <ErrorState error={threads.error} onRetry={() => threads.refetch()} className="px-2 py-6" />
          : !threads.data?.length ? <p className="px-3 py-6 text-center text-xs text-subtle">Your conversations appear here.</p>
          : (
            <ul className="space-y-0.5">
              {threads.data.map((t) => (
                <li key={t.id} className="group relative">
                  <button type="button" onClick={() => select(t.id)} className={cn("w-full rounded-lg px-3 py-2 pr-9 text-left transition-colors", t.id === threadId ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2/70 hover:text-fg")}>
                    <div className="truncate text-[13px] font-medium">{t.title}</div>
                    <div className="text-2xs text-subtle">{ago(t.updated_at)}</div>
                  </button>
                  {can("analyst") && <button type="button" aria-label="Delete conversation" onClick={() => setRemoving(t)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-subtle opacity-0 transition-opacity hover:text-danger focus:opacity-100 group-hover:opacity-100"><Trash2 className="size-3.5" /></button>}
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  );

  const notConfigured = askError && askError.e instanceof ApiError && askError.e.notConfigured ? askError.e : null;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="AI research assistant" title="Research Assistant"
        description="Ask about your products, markets and suppliers. Answers use only your workspace data and cite the records they rely on."
        actions={<>
          <Button variant="secondary" className="lg:hidden" onClick={() => setThreadsOpen(true)}><MessagesSquare />Conversations</Button>
          <Button variant="ghost" onClick={() => select(null)}><MessageSquarePlus />New</Button>
        </>} />

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="hidden h-[calc(100vh-200px)] min-h-[520px] flex-col overflow-hidden lg:flex">
          <div className="border-b border-line px-4 py-3 text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">Conversations</div>
          {threadList}
        </Card>

        <Card className="flex h-[calc(100vh-200px)] min-h-[520px] flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
            {threadId && thread.isLoading ? (
              <div className="mx-auto max-w-3xl space-y-4"><Skeleton className="ml-auto h-10 w-2/3" /><Skeleton className="h-48 w-full" /></div>
            ) : threadId && thread.error ? (
              <ErrorState error={thread.error} onRetry={() => thread.refetch()} />
            ) : !msgs.length && !pending ? (
              notConfigured ? null : (
                <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
                  <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-violet-soft text-violet"><Sparkles className="size-6" /></div>
                  <h2 className="text-lg font-semibold">What would you like to research?</h2>
                  <p className="mt-1.5 text-[13px] text-muted">Kestrel retrieves the relevant products, history, suppliers and keyword lists from your workspace, then answers with evidence, assumptions, confidence and risks.</p>
                  <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                    {PROMPTS.map((p) => (
                      <RoleGate key={p}>{(ok) => <button type="button" disabled={!ok || ask.isPending} onClick={() => send(p)} className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-left text-[13px] text-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-60">{p}</button>}</RoleGate>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {msgs.map((m) => m.role === "user" ? <UserBubble key={m.id} text={m.content} /> : <Answer key={m.id} m={m} />)}
                {pending && (
                  <>
                    <UserBubble text={pending} />
                    <div className="rounded-xl border border-line p-4">
                      <div className="mb-3 flex items-center gap-2 text-[13px] text-muted"><Sparkles className="size-4 animate-pulse text-violet" />Retrieving records from your workspace and drafting an answer…</div>
                      <div className="space-y-2"><Skeleton className="h-4 w-11/12" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-4 w-2/3" /></div>
                    </div>
                  </>
                )}
              </div>
            )}
            {askError && (
              <div className="mx-auto mt-6 max-w-3xl">
                {notConfigured ? (
                  <Card><NotConfigured provider={notConfigured.body.provider || "Anthropic (Claude)"} message={notConfigured.message || "Add an Anthropic API key in Settings → Integrations to use the research assistant."} /></Card>
                ) : (
                  <Card><ErrorState error={askError.e} onRetry={() => { const q = askError.q; setDraft(""); ask.mutate({ question: q, thread_id: threadId }); }} /></Card>
                )}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-line bg-surface p-3 md:p-4">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mx-auto max-w-3xl">
              <div className="flex items-end gap-2 rounded-xl border border-line bg-surface-2 p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={4000} rows={1} disabled={!can("analyst")}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
                  placeholder={can("analyst") ? (threadId ? "Ask a follow-up…" : "Ask about your products, markets or suppliers…") : "Analyst role or higher required to ask questions"}
                  className="max-h-40 min-h-[40px] resize-none border-0 bg-transparent px-2 py-2 focus:ring-0" />
                <RoleGate>{(ok) => <Button type="submit" size="icon" aria-label="Ask" disabled={!ok || draft.trim().length < 2} loading={ask.isPending}>{!ask.isPending && <ArrowUp />}</Button>}</RoleGate>
              </div>
              <p className="mt-1.5 px-1 text-2xs text-subtle">AI analysis can be wrong. Check the cited records before acting. Enter to send, Shift+Enter for a new line.</p>
            </form>
          </div>
        </Card>
      </div>

      <Sheet open={threadsOpen} onOpenChange={setThreadsOpen} title="Conversations" width={340}><div className="-mx-5 -my-4 flex h-full flex-col">{threadList}</div></Sheet>
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Delete conversation?" description={<>Delete <b>{removing?.title}</b>? This can't be undone.</>}
        confirmLabel="Delete" loading={removeThread.isPending} onConfirm={() => removing && removeThread.mutate(removing.id)} />
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return <div className="flex justify-end"><div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[14px] text-primary-fg">{text}</div></div>;
}

function ListSection({ icon: Icon, title, items, empty, tone }: { icon: React.ComponentType<{ className?: string }>; title: string; items: string[]; empty: string; tone?: "warning" | "danger" }) {
  return (
    <div className="min-w-0 rounded-lg border border-line p-3.5">
      <div className={cn("mb-2 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.08em]", tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-subtle")}><Icon className="size-3.5" />{title}</div>
      {items.length ? <ul className="space-y-1.5 text-[13px] text-muted">{items.map((t, i) => <li key={i} className="flex gap-2"><span className="mt-[7px] size-1 shrink-0 rounded-full bg-current opacity-60" /><span className="min-w-0">{t}</span></li>)}</ul>
        : <p className="text-[13px] text-subtle">{empty}</p>}
    </div>
  );
}

function Answer({ m }: { m: Msg }) {
  const s = m.structured;
  const [copied, setCopied] = React.useState(false);
  const allSources = React.useMemo(() => {
    const map = new Map<string, SourceRef>();
    (s?.sources ?? []).forEach((x) => map.set(x.id, x));
    (s?.evidence ?? []).forEach((e) => (e.sources ?? []).forEach((x) => map.set(x.id, x)));
    return [...map.values()];
  }, [s]);
  const refs = React.useMemo(() => Object.fromEntries(allSources.map((x) => [x.id, { href: x.href, label: x.label } as RecordRef])), [allSources]);
  const copy = () => navigator.clipboard.writeText(s?.answer ?? m.content).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }, () => toast.error("Couldn't copy"));
  const conf = s ? CONF[s.confidence] ?? CONF.low : null;

  return (
    <article className="space-y-4">
      <header className="flex flex-wrap items-center gap-2">
        <div className="grid size-7 place-items-center rounded-lg bg-violet-soft text-violet"><Sparkles className="size-3.5" /></div>
        <span className="text-[13px] font-semibold">Kestrel AI</span>
        <SourceBadge classification="ai" source={{ classification: "ai", retrieved_at: m.created_at, note: s?.retrieved_records != null ? `Answered from ${s.retrieved_records} records retrieved from your workspace.` : undefined }} />
        {conf && <Badge tone={conf.tone} size="sm">{conf.label}</Badge>}
        <span className="ml-auto flex items-center gap-1 text-2xs text-subtle">
          {ago(m.created_at)}
          <Tooltip content={copied ? "Copied" : "Copy answer"}><Button variant="ghost" size="icon-sm" aria-label="Copy answer" onClick={copy}>{copied ? <Check /> : <Copy />}</Button></Tooltip>
        </span>
      </header>

      {!s ? (
        <div className="space-y-3">
          <Markdown text={m.content} />
          <p className="flex items-center gap-1.5 text-xs text-warning"><AlertTriangle className="size-3.5" />This answer was stored without structured evidence. Treat it as unverified.</p>
        </div>
      ) : (
        <>
          <Markdown text={s.answer} refs={refs} />

          <section className="rounded-lg border border-line p-3.5">
            <div className="mb-2.5 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-subtle"><BookOpenCheck className="size-3.5" />Evidence</div>
            {s.evidence.length ? (
              <ol className="space-y-2.5">
                {s.evidence.map((e, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px]">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-surface-2 text-2xs text-muted num">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-fg/90">{e.claim}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {(e.sources?.length ? e.sources : []).map((src) => (
                          <Link key={src.id} href={src.href} className="inline-flex max-w-full items-center gap-1 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-2xs text-muted transition-colors hover:border-primary hover:text-primary">
                            <span className="font-mono">{src.id}</span><span className="truncate">{src.label}</span>
                          </Link>
                        ))}
                        {e.record_ids.filter((id) => !e.sources?.some((x) => x.id === id)).map((id) => (
                          <Tooltip key={id} content="This id wasn't among the records retrieved — the claim can't be traced."><span className="inline-flex items-center gap-1 rounded-md border border-warning/40 bg-warning-soft px-1.5 py-0.5 font-mono text-2xs text-warning">{id} · not found</span></Tooltip>
                        ))}
                        {!e.record_ids.length && <span className="text-2xs text-warning">No record cited</span>}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className="text-[13px] text-warning">No evidence was cited for this answer — treat it as unverified.</p>}
          </section>

          <section className="rounded-lg border border-line p-3.5">
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-subtle"><Database className="size-3.5" />Data sources & retrieval dates
              {s.retrieved_records != null && <span className="ml-auto font-normal normal-case tracking-normal text-subtle">{s.retrieved_records} records retrieved {dateShort(m.created_at)}</span>}
            </div>
            {allSources.length ? (
              <ul className="divide-y divide-line">
                {allSources.map((src) => (
                  <li key={src.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-[13px]">
                    <span className="w-10 shrink-0 font-mono text-2xs text-subtle">{src.id}</span>
                    <Link href={src.href} className="min-w-0 flex-1 truncate hover:text-primary">{src.label}</Link>
                    <span className="text-2xs text-subtle">{TYPE_LABEL[src.type] ?? src.type}</span>
                    <SourceBadge classification={src.classification} source={{ classification: src.classification, retrieved_at: src.retrieved_at ?? undefined }} />
                    <span className="w-24 shrink-0 text-right text-2xs text-subtle">{src.retrieved_at ? `Data ${dateShort(src.retrieved_at)}` : "Date unknown"}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-[13px] text-subtle">No workspace records were cited.</p>}
          </section>

          <div className="grid gap-3 md:grid-cols-3">
            <ListSection icon={ListChecks} title="Assumptions" items={s.assumptions} empty="None stated." />
            <ListSection icon={CircleHelp} title="Missing information" items={s.missing_information} empty="Nothing flagged as missing." tone="warning" />
            <ListSection icon={ShieldAlert} title="Risks" items={s.risks} empty="No risks flagged." tone="danger" />
          </div>
        </>
      )}
    </article>
  );
}

