"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppProvider, useApp } from "@/components/state";
import { Icon, type IconName } from "@/components/icons";
import { RunSheet } from "@/components/run-sheet";

const NAV: [string, string, IconName][] = [
  ["/app", "Office", "office"],
  ["/app/actions", "Actions", "actions"],
  ["/app/chat", "Manager", "chat"],
  ["/app/board", "Board", "board"],
  ["/app/reports", "Reports", "reports"],
  ["/app/team", "Team", "team"],
  ["/app/connect", "Connections", "connect"],
  ["/app/brief", "Business brief", "brief"],
  ["/app/memory", "Memory", "memory"],
];
const MOBILE = ["/app", "/app/actions", "/app/chat", "/app/board", "/app/connect"];

function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { s } = useApp();
  const pending = s?.board.filter((b) => b.status === "pending").length || 0;
  const cur = (h: string) => (h === "/app" ? path === "/app" : path.startsWith(h)) ? "page" : undefined;
  return (
    <div className="shell">
      <aside className="side" aria-label="Main">
        <div className="brand"><div className="logo">G</div><div>Growth HQ<div className="muted small" style={{ fontWeight: 400 }}>{s?.brief?.name || "Your business"}</div></div></div>
        <nav className="nav">
          {NAV.map(([h, l, i]) => (
            <Link key={h} href={h} aria-current={cur(h)}><Icon name={i} />{l}{h === "/app/board" && pending > 0 && <span className="pill warn" style={{ marginLeft: "auto" }}>{pending}</span>}</Link>
          ))}
        </nav>
        <div className="foot">{s?.email}<br /><button className="btn ghost sm" style={{ marginTop: 6 }} onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/"; }}>Log out</button></div>
      </aside>
      <main className="page">{children}</main>
      <nav className="tabbar" aria-label="Main">
        {NAV.filter(([h]) => MOBILE.includes(h)).map(([h, l, i]) => (
          <Link key={h} href={h} aria-current={cur(h)}><Icon name={i} />{l}{h === "/app/board" && pending > 0 ? ` (${pending})` : ""}</Link>
        ))}
      </nav>
      <RunSheet />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppProvider><Shell>{children}</Shell></AppProvider>;
}
