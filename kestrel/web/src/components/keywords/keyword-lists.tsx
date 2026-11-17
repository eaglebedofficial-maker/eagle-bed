"use client";
/* Keyword lists side panel: list CRUD, items, export. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, ListPlus, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { EmptyState, LoadingRows, SourceBadge } from "@/components/ui/data";
import { ConfirmDialog, Sheet } from "@/components/ui/overlay";
import { Badge, Button, Field, Input, Textarea } from "@/components/ui/primitives";
import { del, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, num } from "@/lib/utils";
import { ApiErrorView, Gate, downloadCsv, slug, splitLines, today, useAnalyst, useKeywordLists, type KwListDetail } from "./common";

export function KeywordListsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [active, setActive] = React.useState<number | null>(null);
  React.useEffect(() => { if (!open) setActive(null); }, [open]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange} width={560} title={active ? "Keyword list" : "Keyword lists"}
      description={active ? undefined : "Save keywords from research, reverse ASIN and the processor. Lists feed the Listing Optimizer and AI listing writer."}>
      {active ? <ListDetail id={active} onBack={() => setActive(null)} /> : <ListIndex onOpen={setActive} />}
    </Sheet>
  );
}

function ListIndex({ onOpen }: { onOpen: (id: number) => void }) {
  const { marketplace } = useSession();
  const qc = useQueryClient();
  const analyst = useAnalyst();
  const lists = useKeywordLists();
  const [name, setName] = React.useState("");
  const [kws, setKws] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [removing, setRemoving] = React.useState<{ id: number; name: string } | null>(null);
  const create = useMutation({
    mutationFn: () => post<{ id: number }>("/keywords/lists", { name: name.trim(), marketplace, keywords: splitLines(kws), source: "manual" }),
    onSuccess: (r) => { toast.success("List created"); setName(""); setKws(""); setCreating(false); qc.invalidateQueries({ queryKey: ["keyword-lists"] }); onOpen(r.id); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => del(`/keywords/lists/${id}`),
    onSuccess: () => { toast.success("List deleted"); setRemoving(null); qc.invalidateQueries({ queryKey: ["keyword-lists"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="space-y-4">
      {creating ? (
        <div className="space-y-3 rounded-xl border border-line bg-surface-2 p-4">
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ottoman beds — launch" autoFocus /></Field>
          <Field label="Keywords" hint="Optional. One per line, or separated by commas."><Textarea value={kws} onChange={(e) => setKws(e.target.value)} placeholder={"ottoman bed\nottoman bed double"} /></Field>
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button><Button loading={create.isPending} disabled={!name.trim()} onClick={() => create.mutate()}>Create list</Button></div>
        </div>
      ) : (
        <Gate allowed={analyst}><Button variant="secondary" className="w-full" onClick={() => setCreating(true)}><Plus />New list</Button></Gate>
      )}
      {lists.isLoading ? <LoadingRows rows={4} className="p-0" /> : lists.error ? <ApiErrorView error={lists.error} onRetry={() => lists.refetch()} /> : !lists.data?.length ? (
        <EmptyState compact icon={ListPlus} title="No keyword lists yet" description="Run a keyword search, select the terms you want and choose “Add to list”, or create a list here." />
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {lists.data.map((l) => (
            <li key={l.id} className="flex items-center gap-3 px-3 py-2.5">
              <button type="button" onClick={() => onOpen(l.id)} className="min-w-0 flex-1 text-left">
                <div className="truncate text-[13px] font-medium hover:text-primary">{l.name}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-2xs text-subtle"><span className="num">{num(l.count)} keywords</span><span>Amazon {l.marketplace}</span>{l.source && <span>from {l.source.replace(/_/g, " ")}</span>}<span>updated {ago(l.updated_at)}</span></div>
              </button>
              <Gate allowed={analyst}><Button variant="ghost" size="icon-sm" aria-label={`Delete ${l.name}`} onClick={() => setRemoving(l)}><Trash2 /></Button></Gate>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Delete keyword list?" confirmLabel="Delete list" loading={remove.isPending}
        description={<>“{removing?.name}” and its keyword assignments will be removed. Keyword volume data stays in Kestrel.</>} onConfirm={() => removing && remove.mutate(removing.id)} />
    </div>
  );
}

function ListDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const qc = useQueryClient();
  const analyst = useAnalyst();
  const q = useQuery({ queryKey: ["keyword-list", id], queryFn: () => get<KwListDetail>(`/keywords/lists/${id}`) });
  const [add, setAdd] = React.useState("");
  const inval = () => { qc.invalidateQueries({ queryKey: ["keyword-list", id] }); qc.invalidateQueries({ queryKey: ["keyword-lists"] }); };
  const addM = useMutation({
    mutationFn: () => post(`/keywords/lists/${id}/items`, { keywords: splitLines(add) }),
    onSuccess: () => { toast.success("Keywords added"); setAdd(""); inval(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const rm = useMutation({
    mutationFn: (iid: number) => del(`/keywords/lists/${id}/items/${iid}`),
    onSuccess: () => inval(),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const d = q.data;
  const exportCsv = () => d && downloadCsv(`keyword-list-${slug(d.name)}-${today()}.csv`, ["Keyword", "Search volume", "Volume source", "Difficulty", "CPC", "Updated"],
    d.items.map((i) => [i.keyword, i.search_volume, i.volume_source, i.difficulty, i.cpc, i.updated_at]));
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2"><ArrowLeft />All lists</Button>
      {q.isLoading ? <LoadingRows rows={5} className="p-0" /> : q.error ? <ApiErrorView error={q.error} onRetry={() => q.refetch()} /> : d && (
        <>
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1"><h3 className="text-[15px] font-semibold">{d.name}</h3><p className="mt-0.5 text-xs text-muted">Amazon {d.marketplace} · <span className="num">{num(d.items.length)}</span> keywords</p></div>
            <Button variant="secondary" size="sm" disabled={!d.items.length} onClick={exportCsv}><Download />Export CSV</Button>
          </div>
          <div className="space-y-2">
            <Textarea value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Add keywords: one per line or comma-separated" className="min-h-[64px]" />
            <div className="flex justify-end"><Gate allowed={analyst}><Button size="sm" loading={addM.isPending} disabled={!splitLines(add).length} onClick={() => addM.mutate()}><Plus />Add</Button></Gate></div>
          </div>
          {!d.items.length ? <EmptyState compact icon={ListPlus} title="This list is empty" description="Add keywords above, or from Keyword Research and Reverse ASIN results." /> : (
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="flex items-center justify-between border-b border-line bg-surface-2 px-3 py-2 text-2xs font-semibold uppercase tracking-[0.06em] text-subtle"><span>Keyword</span><span className="flex items-center gap-2">Search volume <SourceBadge classification="licensed" source={{ provider: "DataForSEO", classification: "licensed" }} /></span></div>
              <ul className="max-h-[52vh] divide-y divide-line overflow-y-auto">
                {d.items.map((i) => (
                  <li key={i.item_id} className="group flex items-center gap-3 px-3 py-2 text-[13px]">
                    <span className="min-w-0 flex-1 truncate">{i.keyword}</span>
                    {i.search_volume == null ? <Badge size="sm">No volume yet</Badge> : <span className="num">{num(i.search_volume)}</span>}
                    <Gate allowed={analyst}><Button variant="ghost" size="icon-sm" aria-label={`Remove ${i.keyword}`} loading={rm.isPending && rm.variables === i.item_id} onClick={() => rm.mutate(i.item_id)}><Trash2 /></Button></Gate>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
