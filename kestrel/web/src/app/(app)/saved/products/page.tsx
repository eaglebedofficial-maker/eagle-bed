"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, ArrowRight, Bookmark, Copy, Database, ExternalLink, FolderPlus, LayoutTemplate, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProductThumb } from "@/components/app/product";
import { chipLabel, clean, countActive, SAVED_MODULE } from "@/components/products/filters";
import { GROUP_TONES, groupTone, type SavedSearch, type TrackerResponse, type TrackingGroup } from "@/components/products/types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui/data";
import { ConfirmDialog, Dialog, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Segmented, Skeleton } from "@/components/ui/primitives";
import { del, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, cn, dateShort, money, num } from "@/lib/utils";

const openHref = (s: SavedSearch) => `/products?filters=${encodeURIComponent(JSON.stringify(clean(s.filters)))}`;

function SavedSearches() {
  const qc = useQueryClient();
  const { can, currency } = useSession();
  const analyst = can("analyst");
  const [kind, setKind] = useState<"all" | "templates" | "searches">("all");
  const [removing, setRemoving] = useState<SavedSearch | null>(null);
  const q = useQuery({ queryKey: ["saved-searches", SAVED_MODULE], queryFn: () => get<SavedSearch[]>("/saved-searches", { module: SAVED_MODULE }) });
  const inv = () => qc.invalidateQueries({ queryKey: ["saved-searches"] });
  const dup = useMutation({
    mutationFn: (s: SavedSearch) => post("/saved-searches", { module: SAVED_MODULE, name: s.is_template ? `${s.name} (copy)` : s.name, filters: s.filters, is_template: true }),
    onSuccess: (_, s) => { toast.success(s.is_template ? "Template duplicated" : "Saved as a team template"); inv(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const rm = useMutation({ mutationFn: (s: SavedSearch) => del(`/saved-searches/${s.id}`), onSuccess: () => { toast.success("Deleted"); setRemoving(null); inv(); }, onError: (e) => toast.error(errorMessage(e)) });
  const rows = useMemo(() => (q.data ?? []).filter((s) => kind === "all" || (kind === "templates" ? s.is_template : !s.is_template)), [q.data, kind]);
  const cols = useMemo<ColumnDef<SavedSearch, any>[]>(() => [
    { id: "name", header: "Name", accessorKey: "name", enableHiding: false, cell: ({ row: { original: s } }) => (
      <Link href={openHref(s)} className="flex items-center gap-2 font-medium hover:text-primary">{s.is_template ? <LayoutTemplate className="size-4 shrink-0 text-violet" /> : <Bookmark className="size-4 shrink-0 text-subtle" />}{s.name}</Link>
    ) },
    { id: "type", header: "Type", accessorKey: "is_template", cell: ({ getValue }) => getValue() ? <Badge tone="violet" size="sm">Template</Badge> : <Badge size="sm">Saved search</Badge> },
    { id: "filters", header: "Filters", enableSorting: false, cell: ({ row: { original: s } }) => {
      const e = Object.entries(clean(s.filters)).filter(([k]) => k !== "marketplace");
      return <div className="flex max-w-[520px] flex-wrap gap-1">{e.slice(0, 5).map(([k, v]) => <Badge key={k} size="sm" className="max-w-[220px] truncate">{chipLabel(k, v, currency)}</Badge>)}{e.length > 5 && <span className="text-2xs text-subtle">+{e.length - 5} more</span>}{!e.length && <span className="text-subtle">No filters</span>}</div>;
    } },
    { id: "created_at", header: "Created", accessorKey: "created_at", cell: ({ getValue }) => <span className="whitespace-nowrap text-muted">{dateShort(getValue())}</span> },
    { id: "actions", header: "", enableSorting: false, enableHiding: false, cell: ({ row: { original: s } }) => (
      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="xs" asChild><Link href={openHref(s)}>Open<ArrowRight /></Link></Button>
        <Tooltip content={!analyst ? "Viewers can't save searches" : s.is_template ? "Duplicate this template" : "Save a copy as a team template"}>
          <span><Button variant="ghost" size="icon-sm" aria-label={`Duplicate ${s.name}`} disabled={!analyst} onClick={() => dup.mutate(s)}><Copy /></Button></span>
        </Tooltip>
        <Tooltip content={!analyst ? "Viewers can't delete" : undefined}><span><Button variant="ghost" size="icon-sm" aria-label={`Delete ${s.name}`} disabled={!analyst} onClick={() => setRemoving(s)}><Trash2 /></Button></span></Tooltip>
      </div>
    ) },
  ], [analyst, currency]); // eslint-disable-line
  if (q.error) return <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card>;
  const all = q.data ?? [];
  return (
    <>
      <DataTable<SavedSearch> storageKey="saved-searches" columns={cols} data={rows} loading={q.isLoading} getRowId={(s) => String(s.id)}
        toolbar={<>
          <span className="text-sm font-semibold">Saved searches & templates</span>
          <Segmented size="sm" value={kind} onChange={setKind} options={[{ value: "all", label: `All ${all.length}` }, { value: "templates", label: `Templates ${all.filter((s) => s.is_template).length}` }, { value: "searches", label: `Searches ${all.filter((s) => !s.is_template).length}` }]} />
        </>}
        empty={<EmptyState compact icon={Bookmark} title={all.length ? "Nothing in this view" : "No saved searches yet"} description="Set filters in the Product Database or Product Research, then choose Saved → Save current."
          action={<Button variant="secondary" asChild><Link href="/products"><Database />Open Product Database</Link></Button>} />} />
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Delete saved search?" confirmLabel="Delete" loading={rm.isPending} onConfirm={() => removing && rm.mutate(removing)}
        description={<>Delete <b>{removing?.name}</b> for everyone in your organisation? {removing && `It has ${countActive(removing.filters)} filter${countActive(removing.filters) === 1 ? "" : "s"}.`}</>} />
    </>
  );
}

function Groups() {
  const qc = useQueryClient();
  const { can } = useSession();
  const analyst = can("analyst");
  const q = useQuery({ queryKey: ["tracker", null], queryFn: () => get<TrackerResponse>("/tracker") });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tone, setTone] = useState<string>("primary");
  const [removing, setRemoving] = useState<TrackingGroup | null>(null);
  const inv = () => qc.invalidateQueries({ queryKey: ["tracker"] });
  const create = useMutation({ mutationFn: () => post("/tracker/groups", { name: name.trim(), colour: tone, kind: "tracker" }), onSuccess: () => { toast.success("Group created"); setOpen(false); setName(""); inv(); }, onError: (e) => toast.error(errorMessage(e)) });
  const rm = useMutation({ mutationFn: (g: TrackingGroup) => del(`/tracker/groups/${g.id}`), onSuccess: () => { toast.success("Group deleted"); setRemoving(null); inv(); }, onError: (e) => toast.error(errorMessage(e)) });
  const groups = q.data?.groups ?? [];
  const items = q.data?.items ?? [];
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Card>
        <CardHeader eyebrow="Organise" title="Tracking groups" description="Group tracked products by niche, supplier or launch."
          action={<Tooltip content={!analyst ? "Viewers can't create groups" : undefined}><span><Button size="sm" variant="secondary" disabled={!analyst} onClick={() => setOpen(true)}><FolderPlus />New group</Button></span></Tooltip>} />
        <CardBody>
          {q.error ? <ErrorState error={q.error} onRetry={() => q.refetch()} /> : q.isLoading ? <div className="space-y-2"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>
            : groups.length === 0 ? <EmptyState compact icon={FolderPlus} title="No groups yet" description="Create a group, then add tracked products to it from the Product Tracker." action={<Button size="sm" disabled={!analyst} onClick={() => setOpen(true)}><FolderPlus />New group</Button>} />
            : (
              <ul className="divide-y divide-line">
                {groups.map((g) => (
                  <li key={g.id} className="flex items-center gap-3 py-2.5">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: `rgb(var(--${groupTone(g.colour)}))` }} />
                    <Link href={`/tracker?group=${g.id}`} className="min-w-0 flex-1 truncate text-[13px] font-medium hover:text-primary">{g.name}</Link>
                    <span className="text-xs text-muted num">{g.count} product{g.count === 1 ? "" : "s"}</span>
                    <Button variant="ghost" size="xs" asChild><Link href={`/tracker?group=${g.id}`}>Open<ArrowRight /></Link></Button>
                    <Tooltip content={!analyst ? "Viewers can't delete groups" : undefined}><span><Button variant="ghost" size="icon-sm" aria-label={`Delete ${g.name}`} disabled={!analyst} onClick={() => setRemoving(g)}><Trash2 /></Button></span></Tooltip>
                  </li>
                ))}
              </ul>
            )}
        </CardBody>
      </Card>
      <Card>
        <CardHeader eyebrow="Saved products" title={q.data ? `${num(items.length)} tracked product${items.length === 1 ? "" : "s"}` : "Tracked products"} description="Products you follow, most recently added first."
          action={<Button size="sm" variant="ghost" asChild><Link href="/tracker">Product Tracker<ArrowRight /></Link></Button>} />
        <CardBody>
          {q.error ? <ErrorState error={q.error} onRetry={() => q.refetch()} /> : q.isLoading ? <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            : items.length === 0 ? <EmptyState compact icon={Activity} title="No saved products yet" description="Track products from Product Research, the Product Database or a product page to save them here." action={<Button size="sm" variant="secondary" asChild><Link href="/research">Research products</Link></Button>} />
            : (
              <ul className="divide-y divide-line">
                {items.slice(0, 8).map((p) => {
                  const g = groups.find((x) => x.id === p.group_id);
                  return (
                    <li key={p.id} className="flex items-center gap-3 py-2">
                      <ProductThumb src={p.image_url} size={36} />
                      <div className="min-w-0 flex-1">
                        <Link href={`/products/${p.id}`} className="block truncate text-[13px] font-medium hover:text-primary">{p.title || p.asin}</Link>
                        <div className="flex items-center gap-1.5 text-2xs text-subtle"><span className="font-mono">{p.asin}</span><span>· since {ago(p.tracked_since)}</span>{g && <span className={cn("inline-flex items-center gap-1")}>· <span className="size-1.5 rounded-full" style={{ background: `rgb(var(--${groupTone(g.colour)}))` }} />{g.name}</span>}</div>
                      </div>
                      <span className="text-[13px] num">{money(p.price, p.currency)}</span>
                      <a href={`/products/${p.id}`} aria-label="Open product" className="text-subtle hover:text-fg"><ExternalLink className="size-3.5" /></a>
                    </li>
                  );
                })}
              </ul>
            )}
        </CardBody>
      </Card>
      <Dialog open={open} onOpenChange={setOpen} title="New tracking group" size="sm"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={!name.trim()} loading={create.isPending} onClick={() => create.mutate()}>Create group</Button></>}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (name.trim()) create.mutate(); }}>
          <Field label="Name" htmlFor="grp-name"><Input id="grp-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="e.g. Garden wholesale" /></Field>
          <Field label="Colour">
            <div className="flex gap-2">{GROUP_TONES.map((t) => (
              <button key={t} type="button" aria-label={t} aria-pressed={tone === t} onClick={() => setTone(t)} className={cn("grid size-8 place-items-center rounded-full border-2", tone === t ? "border-fg" : "border-transparent")}>
                <span className="size-5 rounded-full" style={{ background: `rgb(var(--${t}))` }} />
              </button>
            ))}</div>
          </Field>
        </form>
      </Dialog>
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Delete group?" confirmLabel="Delete group" loading={rm.isPending} onConfirm={() => removing && rm.mutate(removing)}
        description={<>Delete <b>{removing?.name}</b>? Its products stay tracked, without a group.</>} />
    </div>
  );
}

export default function SavedProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Workspace" title="Saved Products"
        description="Your saved product searches, team filter templates, tracking groups and tracked products in one place."
        actions={<><Button variant="secondary" asChild><Link href="/tracker"><Activity />Product Tracker</Link></Button><Button asChild><Link href="/products"><Database />Product Database</Link></Button></>} />
      <SavedSearches />
      <Groups />
    </div>
  );
}
