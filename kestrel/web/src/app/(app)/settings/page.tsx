"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleDashed, ExternalLink, KeyRound, PlugZap, ShieldAlert, Trash2, UserPlus, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FeeDatabase } from "@/components/app/fee-database";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { ErrorState, KeyValue, PageHeader, SourceBadge } from "@/components/ui/data";
import { ConfirmDialog, Dialog, Select, Sheet, TabPanel, Tabs } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Switch } from "@/components/ui/primitives";
import { del, errorMessage, get, patch, post, put } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, cn, dateShort } from "@/lib/utils";

type Integration = {
  key: string; name: string; category: string; description: string; classification: string; docs_url: string; signup_url: string; cost: string;
  capabilities: string[]; requires_config: boolean; fields: { name: string; label: string; secret: boolean; required: boolean; help: string; placeholder: string }[];
  values: Record<string, string>; status: string; last_ok_at: string | null; last_error: string; usage: Record<string, unknown>;
};
const CATEGORY: Record<string, string> = { amazon_data: "Amazon data", keywords: "Keyword data", registry: "Company & VAT registers", search: "Web search", ai: "AI", finance: "Finance & customs", messaging: "Messaging" };

function StatusBadge({ s }: { s: string }) {
  if (s === "ok") return <Badge tone="success" dot>Connected</Badge>;
  if (s === "available") return <Badge tone="success" dot>Ready · no key needed</Badge>;
  if (s === "configured") return <Badge tone="primary" dot>Saved · not tested</Badge>;
  if (s === "error") return <Badge tone="danger" dot>Error</Badge>;
  return <Badge tone="neutral">Not connected</Badge>;
}

function Integrations() {
  const qc = useQueryClient();
  const { can } = useSession();
  const q = useQuery({ queryKey: ["integrations"], queryFn: () => get<Integration[]>("/integrations") });
  const [edit, setEdit] = useState<Integration | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => put<Integration>(`/integrations/${edit!.key}`, { values: vals }),
    onSuccess: async (d) => { toast.success(`${d.name} saved`); qc.invalidateQueries({ queryKey: ["integrations"] }); const t = await post(`/integrations/${d.key}/test`); t.ok ? toast.success(`${d.name} connected`) : toast.error(t.result.message); qc.invalidateQueries({ queryKey: ["integrations"] }); setEdit(null); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const test = useMutation({ mutationFn: (k: string) => post(`/integrations/${k}/test`), onSuccess: (r, k) => { r.ok ? toast.success("Connection works") : toast.error(r.result.message); qc.invalidateQueries({ queryKey: ["integrations"] }); } });
  const remove = useMutation({ mutationFn: (k: string) => del(`/integrations/${k}`), onSuccess: () => { toast.success("Disconnected"); qc.invalidateQueries({ queryKey: ["integrations"] }); setEdit(null); } });
  if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const groups = Object.entries((q.data ?? []).reduce<Record<string, Integration[]>>((a, i) => { (a[i.category] ??= []).push(i); return a; }, {}));
  const connected = (q.data ?? []).filter((i) => ["ok", "configured", "available"].includes(i.status)).length;
  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><PlugZap className="size-5" /></div>
        <div className="min-w-0 flex-1"><div className="text-sm font-semibold">{connected} of {q.data?.length ?? 0} data sources ready</div><div className="text-[13px] text-muted">Kestrel never shows estimates in place of missing data. Features that need a source you haven't connected say so and link here. Keys are encrypted at rest and never shown again after saving.</div></div>
      </Card>
      {groups.map(([cat, items]) => (
        <section key={cat}>
          <h3 className="mb-3 text-2xs font-semibold uppercase tracking-[0.09em] text-subtle">{CATEGORY[cat] ?? cat}</h3>
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {items.map((i) => (
              <Card key={i.key} className="flex flex-col p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{i.name}</span><SourceBadge classification={i.classification} /></div><p className="mt-1.5 text-[13px] text-muted">{i.description}</p></div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-subtle"><StatusBadge s={i.status} /><span>{i.cost}</span></div>
                {i.status === "error" && i.last_error && <p className="mt-2 rounded-lg bg-danger-soft px-2.5 py-1.5 text-xs text-danger">{i.last_error}</p>}
                {i.last_ok_at && <p className="mt-2 text-xs text-subtle">Last checked {ago(i.last_ok_at)}{i.usage?.tokens_left != null ? ` · ${i.usage.tokens_left} Keepa tokens left` : ""}</p>}
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {i.requires_config && <Button size="sm" variant={i.status === "not_configured" ? "primary" : "secondary"} disabled={!can("admin")} onClick={() => { setEdit(i); setVals(Object.fromEntries(i.fields.map((f) => [f.name, i.values[f.name] ?? ""]))); }}>{i.status === "not_configured" ? "Connect" : "Edit"}</Button>}
                  {i.status !== "not_configured" && <Button size="sm" variant="ghost" loading={test.isPending && test.variables === i.key} onClick={() => test.mutate(i.key)}>Test connection</Button>}
                  {i.docs_url && <Button asChild size="sm" variant="ghost"><a href={i.docs_url} target="_blank" rel="noreferrer">Docs<ExternalLink /></a></Button>}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
      <Sheet open={!!edit} onOpenChange={(v) => !v && setEdit(null)} title={edit ? `Connect ${edit.name}` : ""} description={edit?.description}
        footer={<>{edit && edit.status !== "not_configured" && <Button variant="ghost" className="mr-auto text-danger" onClick={() => remove.mutate(edit.key)}><Trash2 />Disconnect</Button>}<Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button><Button loading={save.isPending} onClick={() => save.mutate()}>Save and test</Button></>}>
        {edit && (
          <div className="space-y-4">
            {edit.fields.map((f) => (
              <Field key={f.name} label={f.label} htmlFor={`f-${f.name}`} hint={f.help} aside={f.required ? "Required" : "Optional"}>
                <Input id={`f-${f.name}`} type={f.secret ? "password" : "text"} autoComplete="off" placeholder={f.placeholder || (f.secret && edit.values[f.name] ? "Saved — leave blank to keep" : "")}
                  value={f.secret && vals[f.name]?.includes("•") ? "" : vals[f.name] ?? ""} onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })} />
              </Field>
            ))}
            {edit.signup_url && <p className="text-[13px] text-muted">Don't have credentials? <a className="text-primary hover:underline" href={edit.signup_url} target="_blank" rel="noreferrer">Get them from {edit.name}</a>.</p>}
            <div className="rounded-lg border border-line bg-surface-2 p-3 text-xs text-muted"><KeyRound className="mb-1 size-4 text-subtle" />Credentials are encrypted with your organisation's key and used only for your organisation's requests. Each organisation must use its own licence for licensed data (Keepa, DataForSEO).</div>
            <div><div className="mb-1.5 text-xs font-medium text-muted">Unlocks</div><div className="flex flex-wrap gap-1.5">{edit.capabilities.map((c) => <Badge key={c} size="sm">{c.replace(/_/g, " ")}</Badge>)}</div></div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

type Member = { id: number; email: string; name: string; role: string; last_login_at: string | null; is_you: boolean };
function Team() {
  const qc = useQueryClient();
  const { can } = useSession();
  const q = useQuery({ queryKey: ["members"], queryFn: () => get<Member[]>("/org/members") });
  const [open, setOpen] = useState(false);
  const [inv, setInv] = useState({ email: "", name: "", role: "analyst", temporary_password: "" });
  const [removing, setRemoving] = useState<Member | null>(null);
  const add = useMutation({ mutationFn: () => post("/org/members", inv), onSuccess: () => { toast.success("Member added"); setOpen(false); qc.invalidateQueries({ queryKey: ["members"] }); }, onError: (e) => toast.error(errorMessage(e)) });
  const role = useMutation({ mutationFn: ({ id, r }: { id: number; r: string }) => patch(`/org/members/${id}`, { role: r }), onSuccess: () => { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["members"] }); }, onError: (e) => toast.error(errorMessage(e)) });
  const rm = useMutation({ mutationFn: (id: number) => del(`/org/members/${id}`), onSuccess: () => { toast.success("Member removed"); setRemoving(null); qc.invalidateQueries({ queryKey: ["members"] }); }, onError: (e) => toast.error(errorMessage(e)) });
  const roles = [{ value: "owner", label: "Owner" }, { value: "admin", label: "Admin" }, { value: "analyst", label: "Analyst" }, { value: "viewer", label: "Viewer" }];
  const cols = useMemo<ColumnDef<Member>[]>(() => [
    { header: "Member", accessorKey: "email", cell: ({ row: { original: m } }) => <div><div className="font-medium">{m.name || m.email}{m.is_you && <Badge size="sm" className="ml-2">You</Badge>}</div><div className="text-xs text-muted">{m.email}</div></div> },
    { header: "Role", accessorKey: "role", cell: ({ row: { original: m } }) => can("admin") && !m.is_you ? <div className="w-36"><Select size="sm" value={m.role} onChange={(r) => role.mutate({ id: m.id, r })} options={roles} aria-label="Role" /></div> : <span className="capitalize">{m.role}</span> },
    { header: "Last sign-in", accessorKey: "last_login_at", cell: ({ getValue }) => <span className="text-muted">{ago(getValue() as string)}</span> },
    { id: "x", header: "", enableSorting: false, cell: ({ row: { original: m } }) => can("admin") && !m.is_you && m.role !== "owner" ? <Button variant="ghost" size="icon-sm" aria-label="Remove member" onClick={() => setRemoving(m)}><Trash2 /></Button> : null },
  ], [can]); // eslint-disable-line
  return (
    <div className="space-y-4">
      <Card className="p-5"><div className="grid gap-4 text-[13px] sm:grid-cols-4">{[["Owner", "Everything, including billing and owners."], ["Admin", "Team, integrations, fee database."], ["Analyst", "Research, suppliers, documents, alerts."], ["Viewer", "Read-only access to the workspace."]].map(([r, d]) => <div key={r}><div className="font-semibold">{r}</div><div className="mt-0.5 text-muted">{d}</div></div>)}</div></Card>
      <DataTable columns={cols} data={q.data ?? []} loading={q.isLoading} toolbar={<span className="text-sm font-semibold">Team members</span>} getRowId={(m) => String(m.id)}
        empty={<ErrorState error={q.error} />} />
      {can("admin") && <Button onClick={() => setOpen(true)}><UserPlus />Add member</Button>}
      <Dialog open={open} onOpenChange={setOpen} title="Add a team member" description="They sign in with this email and the temporary password, then change it in Settings → Security."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button loading={add.isPending} onClick={() => add.mutate()}>Add member</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" className="sm:col-span-2"><Input type="email" value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} /></Field>
          <Field label="Name"><Input value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} /></Field>
          <Field label="Role"><Select value={inv.role} onChange={(r) => setInv({ ...inv, role: r })} options={roles.filter((r) => r.value !== "owner")} /></Field>
          <Field label="Temporary password" className="sm:col-span-2" hint="At least 10 characters. Share it securely."><Input type="text" value={inv.temporary_password} onChange={(e) => setInv({ ...inv, temporary_password: e.target.value })} /></Field>
        </div>
      </Dialog>
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Remove member?" description={<>Remove <b>{removing?.email}</b> from this organisation? Their account stays, but they lose access here.</>} confirmLabel="Remove" loading={rm.isPending} onConfirm={() => removing && rm.mutate(removing.id)} />
    </div>
  );
}

function Organisation() {
  const qc = useQueryClient();
  const { marketplaces, can, refresh } = useSession();
  const q = useQuery({ queryKey: ["org"], queryFn: () => get("/org") });
  const [f, setF] = useState<{ name: string; default_marketplace: string; vat_registered: boolean } | null>(null);
  useEffect(() => { if (q.data) setF({ name: q.data.name, default_marketplace: q.data.default_marketplace, vat_registered: q.data.vat_registered }); }, [q.data]);
  const save = useMutation({ mutationFn: () => patch("/org", f), onSuccess: () => { toast.success("Organisation saved"); qc.invalidateQueries({ queryKey: ["org"] }); refresh(); }, onError: (e) => toast.error(errorMessage(e)) });
  if (!f) return null;
  return (
    <Card className="max-w-2xl">
      <CardHeader title="Organisation" description="Defaults used across research, profit and VAT calculations." />
      <CardBody className="space-y-5">
        <Field label="Organisation name"><Input value={f.name} disabled={!can("admin")} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Default marketplace"><Select value={f.default_marketplace} onChange={(v) => setF({ ...f, default_marketplace: v })} options={marketplaces.map((m) => ({ value: m.code, label: `${m.name} (${m.currency})` }))} /></Field>
        <Switch checked={f.vat_registered} onCheckedChange={(v) => setF({ ...f, vat_registered: v })} label="VAT registered" description="When on, profit calculations reclaim input VAT and remove output VAT from the selling price. Change per calculation if your products differ." />
        {can("admin") && <div className="flex justify-end"><Button loading={save.isPending} onClick={() => save.mutate()}>Save changes</Button></div>}
      </CardBody>
    </Card>
  );
}

type AuditRow = { id: number; action: string; entity: string; entity_id: string; meta: Record<string, unknown>; ip: string; user: string; created_at: string };
function Audit() {
  const q = useQuery({ queryKey: ["audit"], queryFn: () => get<AuditRow[]>("/audit", { limit: 300 }) });
  const cols = useMemo<ColumnDef<AuditRow>[]>(() => [
    { header: "When", accessorKey: "created_at", cell: ({ getValue }) => <span className="whitespace-nowrap text-muted">{new Date(getValue() as string).toLocaleString("en-GB")}</span> },
    { header: "Action", accessorKey: "action", cell: ({ getValue }) => <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">{getValue() as string}</code> },
    { header: "User", accessorKey: "user" },
    { header: "Entity", accessorKey: "entity", cell: ({ row: { original: r } }) => r.entity ? `${r.entity} ${r.entity_id}` : "—" },
    { header: "Details", accessorKey: "meta", enableSorting: false, cell: ({ getValue }) => <span className="block max-w-md truncate font-mono text-xs text-muted">{Object.keys(getValue() as object).length ? JSON.stringify(getValue()) : ""}</span> },
    { header: "IP", accessorKey: "ip", cell: ({ getValue }) => <span className="font-mono text-xs text-subtle">{getValue() as string}</span> },
  ], []);
  if (q.error) return <ErrorState error={q.error} />;
  return <DataTable columns={cols} data={q.data ?? []} loading={q.isLoading} dense toolbar={<span className="text-sm font-semibold">Audit log</span>} maxHeight="70vh" />;
}

function Security() {
  const [f, setF] = useState({ current: "", new: "" });
  const m = useMutation({ mutationFn: () => post("/auth/password", f), onSuccess: () => { toast.success("Password changed"); setF({ current: "", new: "" }); }, onError: (e) => toast.error(errorMessage(e)) });
  const { me } = useSession();
  return (
    <div className="grid max-w-4xl gap-4 md:grid-cols-2">
      <Card>
        <CardHeader title="Change password" />
        <CardBody className="space-y-4">
          <Field label="Current password"><Input type="password" autoComplete="current-password" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} /></Field>
          <Field label="New password" hint="At least 10 characters."><Input type="password" autoComplete="new-password" value={f.new} onChange={(e) => setF({ ...f, new: e.target.value })} /></Field>
          <div className="flex justify-end"><Button loading={m.isPending} disabled={f.new.length < 10 || !f.current} onClick={() => m.mutate()}>Update password</Button></div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Account & data protection" />
        <CardBody>
          <KeyValue rows={[["Signed in as", me?.user.email], ["Organisation", me?.active_org?.name], ["Your role", <span key="r" className="capitalize">{me?.active_org?.role}</span>],
            ["Sessions", "15-minute access tokens with rotating refresh tokens"], ["Credentials", "Encrypted at rest (Fernet), never returned to the browser"], ["Audit", "Sign-ins, integration changes, exports and verifications are logged"]]} />
        </CardBody>
      </Card>
    </div>
  );
}

function SettingsInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const tab = sp.get("tab") || "organisation";
  const { can } = useSession();
  const tabs = [{ value: "organisation", label: "Organisation" }, { value: "team", label: "Team & roles" }, { value: "integrations", label: "Integrations" }, { value: "fees", label: "Fee database" }, { value: "security", label: "Security" }, ...(can("admin") ? [{ value: "audit", label: "Audit log" }] : [])];
  return (
    <>
      <PageHeader title="Settings" description="Organisation defaults, team access, data integrations and the fee database used by every calculation." />
      <Tabs value={tab} onValueChange={(v) => router.replace(`/settings?tab=${v}`)} tabs={tabs}>
        <TabPanel value="organisation"><Organisation /></TabPanel>
        <TabPanel value="team"><Team /></TabPanel>
        <TabPanel value="integrations"><Integrations /></TabPanel>
        <TabPanel value="fees"><FeeDatabase /></TabPanel>
        <TabPanel value="security"><Security /></TabPanel>
        <TabPanel value="audit"><Audit /></TabPanel>
      </Tabs>
    </>
  );
}

export default function SettingsPage() {
  return <Suspense><SettingsInner /></Suspense>;
}
