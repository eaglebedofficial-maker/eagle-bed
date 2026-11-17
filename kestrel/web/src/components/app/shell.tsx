"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Command } from "cmdk";
import {
  Bell, BookOpen, Building2, ChevronsLeft, ChevronsRight, CircleHelp, LogOut, Menu as MenuIcon, Moon, Package, Search, Settings, Sparkles, Sun, X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { get, post } from "@/lib/api";
import { ALL_NAV, EXTRA_NAV, findNav, NAV } from "@/lib/nav";
import { useSession } from "@/lib/session";
import { ago, cn } from "@/lib/utils";
import { Menu, Popover, Tooltip } from "../ui/overlay";
import { Badge, Button, Kbd } from "../ui/primitives";
import { Logo, LogoMark } from "./logo";

/* ---------------------------------------------------------------- Sidebar */
function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = findNav(pathname)?.href;
  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 [scrollbar-width:thin]" aria-label="Main">
      {NAV.map((s) => (
        <div key={s.title} className="mt-4 first:mt-2">
          {collapsed ? <div className="mx-auto mb-1.5 h-px w-6 bg-line" /> : <div className="mb-1 px-2.5 text-2xs font-semibold uppercase tracking-[0.09em] text-subtle">{s.title}</div>}
          <ul className="space-y-0.5">
            {s.items.map((it) => {
              const on = active === it.href;
              const link = (
                <Link href={it.href} onClick={onNavigate} aria-current={on ? "page" : undefined}
                  className={cn("group flex h-8 items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150",
                    collapsed ? "justify-center px-0" : "px-2.5",
                    on ? "bg-primary-soft text-fg" : "text-muted hover:bg-surface-2 hover:text-fg")}>
                  <it.icon className={cn("size-4 shrink-0", on ? "text-primary" : "text-subtle group-hover:text-muted")} />
                  {!collapsed && <span className="truncate">{it.label}</span>}
                </Link>
              );
              return <li key={it.href}>{collapsed ? <Tooltip side="right" content={it.label}>{link}</Tooltip> : link}</li>;
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const { sidebarCollapsed: c, setSidebarCollapsed, me } = useSession();
  const pathname = usePathname();
  return (
    <aside className={cn("fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-surface transition-[width] duration-200 lg:flex", c ? "w-[76px]" : "w-[250px]")}>
      <div className={cn("flex h-[var(--topbar-h)] shrink-0 items-center border-b border-line", c ? "justify-center px-2" : "px-4")}>
        <Link href="/dashboard" aria-label="Kestrel home">{c ? <LogoMark /> : <Logo />}</Link>
      </div>
      <SidebarNav collapsed={c} />
      <div className={cn("shrink-0 border-t border-line p-3", c && "px-2")}>
        <Link href="/assistant" className={cn("mb-1 flex h-8 items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors", c ? "justify-center" : "px-2.5",
          pathname.startsWith("/assistant") ? "bg-violet-soft text-violet" : "text-muted hover:bg-surface-2 hover:text-fg")}>
          <Sparkles className="size-4 text-violet" />{!c && "AI Research Assistant"}
        </Link>
        <Link href="/settings" className={cn("mb-2 flex h-8 items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors", c ? "justify-center" : "px-2.5",
          pathname.startsWith("/settings") ? "bg-primary-soft text-fg" : "text-muted hover:bg-surface-2 hover:text-fg")}>
          <Settings className="size-4 text-subtle" />{!c && "Settings"}
        </Link>
        <div className={cn("flex items-center", c ? "justify-center" : "justify-between gap-2")}>
          {!c && me?.active_org && <div className="min-w-0 px-2.5"><div className="truncate text-xs font-medium">{me.active_org.name}</div><div className="text-2xs capitalize text-subtle">{me.active_org.role}{me.active_org.is_demo ? " · demo" : ""}</div></div>}
          <Button variant="ghost" size="icon-sm" aria-label={c ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setSidebarCollapsed(!c)}>{c ? <ChevronsRight /> : <ChevronsLeft />}</Button>
        </div>
      </div>
    </aside>
  );
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55] lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-line bg-surface shadow-pop animate-in slide-in-from-left duration-200">
        <div className="flex h-[var(--topbar-h)] items-center justify-between border-b border-line px-4"><Logo /><Button variant="ghost" size="icon-sm" aria-label="Close menu" onClick={onClose}><X /></Button></div>
        <SidebarNav collapsed={false} onNavigate={onClose} />
        <div className="border-t border-line p-3">
          {EXTRA_NAV.filter((n) => ["/assistant", "/settings"].includes(n.href)).map((n) => (
            <Link key={n.href} href={n.href} onClick={onClose} className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-muted hover:bg-surface-2"><n.icon className="size-4" />{n.label}</Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------------- Command palette (global search) */
type SearchHit = { type: "product" | "supplier" | "brand" | "keyword"; id: number | string; title: string; subtitle?: string; href: string };

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const { marketplace } = useSession();
  const hits = useQuery({ queryKey: ["global-search", q, marketplace], queryFn: () => get<SearchHit[]>("/search", { q, marketplace }), enabled: open && q.trim().length >= 2, staleTime: 10_000 });
  React.useEffect(() => { if (!open) setQ(""); }, [open]);
  const go = (href: string) => { onOpenChange(false); router.push(href); };
  const looksLikeId = /^(B0[A-Z0-9]{8}|\d{12,13}|[0-9]{9}[0-9X])$/i.test(q.trim()) || /amazon\./i.test(q);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal aria-label="Search">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => onOpenChange(false)} />
      <Command shouldFilter={false} className="absolute left-1/2 top-[12vh] w-[min(640px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface shadow-pop animate-in fade-in-0 zoom-in-95 duration-150"
        onKeyDown={(e) => { if (e.key === "Escape") onOpenChange(false); }}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 text-subtle" />
          <Command.Input autoFocus value={q} onValueChange={setQ} placeholder="Search products, ASIN, EAN, suppliers, brands or pages…" className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-subtle" />
          <Kbd>Esc</Kbd>
        </div>
        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-muted">{q.length < 2 ? "Type to search" : hits.isLoading ? "Searching…" : "No matches in your workspace."}</Command.Empty>
          {q.trim().length >= 2 && (
            <Command.Group heading="Research" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-subtle">
              <PaletteItem onSelect={() => go(`/research?q=${encodeURIComponent(q.trim())}`)} icon={<Search />} title={`Research “${q.trim()}”`} subtitle={looksLikeId ? "Look up this identifier" : `Product research on Amazon ${marketplace}`} />
              <PaletteItem onSelect={() => go(`/suppliers?q=${encodeURIComponent(q.trim())}`)} icon={<Building2 />} title={`Find suppliers for “${q.trim()}”`} subtitle="Supplier Finder" />
            </Command.Group>
          )}
          {(hits.data ?? []).length > 0 && (
            <Command.Group heading="In your workspace" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-subtle">
              {hits.data!.map((h) => <PaletteItem key={`${h.type}-${h.id}`} onSelect={() => go(h.href)} icon={h.type === "supplier" ? <Building2 /> : <Package />} title={h.title} subtitle={`${h.type} · ${h.subtitle ?? ""}`} />)}
            </Command.Group>
          )}
          <Command.Group heading="Go to" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-subtle">
            {ALL_NAV.filter((n) => !q || n.label.toLowerCase().includes(q.toLowerCase())).slice(0, q ? 8 : 6).map((n) => (
              <PaletteItem key={n.href} onSelect={() => go(n.href)} icon={<n.icon />} title={n.label} subtitle={n.description} />
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
function PaletteItem({ icon, title, subtitle, onSelect }: { icon: React.ReactNode; title: string; subtitle?: string; onSelect: () => void }) {
  return (
    <Command.Item onSelect={onSelect} className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm aria-selected:bg-surface-2 [&_svg]:size-4 [&_svg]:text-subtle">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface-2">{icon}</span>
      <span className="min-w-0"><span className="block truncate font-medium">{title}</span>{subtitle && <span className="block truncate text-xs text-muted">{subtitle}</span>}</span>
    </Command.Item>
  );
}

/* ---------------------------------------------------------------- Notifications */
type AlertEvent = { id: number; kind: string; title: string; body: string; triggered_at: string; read_at: string | null };
function Notifications() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["notifications"], queryFn: () => get<{ unread: number; items: AlertEvent[] }>("/alerts/events", { limit: 12 }), refetchInterval: 60_000, retry: false });
  const unread = q.data?.unread ?? 0;
  return (
    <Popover className="w-[min(380px,calc(100vw-24px))]" trigger={
      <Button variant="ghost" size="icon" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative">
        <Bell />{unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white num">{unread > 9 ? "9+" : unread}</span>}
      </Button>}>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="text-sm font-semibold">Notifications</div>
        {unread > 0 && <button className="text-xs text-primary hover:underline" onClick={async () => { await post("/alerts/events/read-all"); qc.invalidateQueries({ queryKey: ["notifications"] }); }}>Mark all read</button>}
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {(q.data?.items ?? []).length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted">No notifications yet. Create alert rules to hear about price, rank, buy-box and supplier changes.</div>
        ) : q.data!.items.map((e) => (
          <div key={e.id} className={cn("border-b border-line px-4 py-3 last:border-0", !e.read_at && "bg-primary-soft/30")}>
            <div className="flex items-start gap-2">{!e.read_at && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />}<div className="min-w-0"><div className="text-[13px] font-medium">{e.title}</div>{e.body && <div className="mt-0.5 text-xs text-muted">{e.body}</div>}<div className="mt-1 text-2xs text-subtle">{ago(e.triggered_at)}</div></div></div>
          </div>
        ))}
      </div>
      <div className="border-t border-line p-2"><Button asChild variant="ghost" size="sm" className="w-full"><Link href="/alerts">Manage alerts</Link></Button></div>
    </Popover>
  );
}

/* ---------------------------------------------------------------- Top bar */
export function Topbar({ onOpenPalette, onOpenMobile }: { onOpenPalette: () => void; onOpenMobile: () => void }) {
  const { me, marketplaces, marketplace, setMarketplace, theme, toggleTheme, logout } = useSession();
  const pathname = usePathname();
  const current = findNav(pathname);
  const flag: Record<string, string> = { UK: "🇬🇧", US: "🇺🇸", DE: "🇩🇪", FR: "🇫🇷", IT: "🇮🇹", ES: "🇪🇸", NL: "🇳🇱", CA: "🇨🇦", AU: "🇦🇺" };
  const initials = (me?.user.name || me?.user.email || "?").split(/[\s@.]/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
  return (
    <header className="sticky top-0 z-30 flex h-[var(--topbar-h)] items-center gap-2 border-b border-line bg-bg/85 px-4 backdrop-blur-md md:gap-3 md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={onOpenMobile}><MenuIcon /></Button>
      <div className="hidden min-w-0 items-center gap-2 text-[13px] text-muted xl:flex xl:w-56">
        {current && <><current.icon className="size-4 shrink-0 text-subtle" /><span className="truncate font-medium text-fg">{current.label}</span></>}
      </div>
      <button onClick={onOpenPalette} className="flex h-9 min-w-0 max-w-xl flex-1 items-center gap-2.5 rounded-lg border border-line bg-surface px-3 text-left text-sm text-subtle transition-colors hover:border-line-strong">
        <Search className="size-4 shrink-0" /><span className="truncate">Search products, ASIN, EAN, suppliers…</span>
        <span className="ml-auto hidden items-center gap-1 sm:flex"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
      </button>
      <div className="ml-auto flex items-center gap-1">
        <Menu label="Marketplace" align="end" trigger={
          <Button variant="secondary" size="sm" className="gap-1.5 px-2.5" aria-label="Marketplace"><span aria-hidden>{flag[marketplace]}</span><span className="font-semibold">{marketplace}</span></Button>}
          items={marketplaces.map((m) => ({ label: <span className="flex w-full items-center justify-between gap-4"><span>{flag[m.code]} {m.name}</span><span className="text-xs text-subtle">{m.currency}</span></span>, onSelect: () => setMarketplace(m.code) }))} />
        <Notifications />
        <Popover className="w-72 p-2" trigger={<Button variant="ghost" size="icon" aria-label="Help"><CircleHelp /></Button>}>
          <div className="px-2 py-1.5 text-2xs font-semibold uppercase tracking-wider text-subtle">Help centre</div>
          {[["Data sources and accuracy", "/settings?tab=integrations"], ["Connect Keepa, SP-API and others", "/settings?tab=integrations"], ["Fee database", "/settings?tab=fees"]].map(([l, h]) => (
            <Link key={l} href={h} className="flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] hover:bg-surface-2"><BookOpen className="size-4 text-subtle" />{l}</Link>
          ))}
          <div className="mt-1 border-t border-line px-2 pt-2 text-xs text-muted">Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> anywhere to search.</div>
        </Popover>
        <Button variant="ghost" size="icon" aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={toggleTheme}>{theme === "dark" ? <Sun /> : <Moon />}</Button>
        <Menu align="end" label={me?.user.email} trigger={
          <button aria-label="Account" className="ml-1 grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary to-violet text-xs font-semibold text-white">{initials}</button>}
          items={[{ label: "Settings", icon: <Settings />, onSelect: () => (location.href = "/settings") }, { label: "Team & roles", icon: <Building2 />, onSelect: () => (location.href = "/settings?tab=team") }, "sep", { label: "Sign out", icon: <LogOut />, onSelect: logout, danger: true }]} />
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- App frame */
export function AppFrame({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, me, loading } = useSession();
  const [palette, setPalette] = React.useState(false);
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((v) => !v); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  if (loading || !me) {
    return <div className="grid min-h-screen place-items-center"><div className="flex items-center gap-3 text-sm text-muted"><LogoMark className="animate-pulse" />Loading your workspace…</div></div>;
  }
  return (
    <div style={{ ["--topbar-h" as string]: "60px" }}>
      <Sidebar />
      <MobileNav open={mobile} onClose={() => setMobile(false)} />
      <div className={cn("transition-[padding] duration-200", sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-[250px]")}>
        <Topbar onOpenPalette={() => setPalette(true)} onOpenMobile={() => setMobile(true)} />
        {me.active_org?.is_demo && (
          <div className="border-b border-warning/30 bg-warning-soft px-6 py-2 text-center text-xs text-warning">Demo workspace — every figure here is illustrative demo data, labelled as such. Create your own organisation to research real products.</div>
        )}
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
      <CommandPalette open={palette} onOpenChange={setPalette} />
    </div>
  );
}
