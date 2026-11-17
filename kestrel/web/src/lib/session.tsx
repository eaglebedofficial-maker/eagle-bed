"use client";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/overlay";
import { ApiError, get, post, setOrgHeader } from "./api";

export type Org = { id: number; name: string; role: string; is_demo: boolean; default_marketplace: string; vat_registered: boolean };
export type Me = { user: { id: number; email: string; name: string }; organisations: { id: number; name: string; role: string; is_demo: boolean }[]; active_org: Org | null };
export type Marketplace = { code: string; name: string; domain: string; currency: string; vat_rate: number };

type Ctx = {
  me: Me | null; loading: boolean; refresh: () => void; logout: () => Promise<void>;
  marketplace: string; setMarketplace: (m: string) => void; marketplaces: Marketplace[]; currency: string;
  theme: "dark" | "light"; toggleTheme: () => void; sidebarCollapsed: boolean; setSidebarCollapsed: (v: boolean) => void;
  can: (role: "viewer" | "analyst" | "admin" | "owner") => boolean;
};
const SessionCtx = React.createContext<Ctx | null>(null);
const RANK = { viewer: 0, analyst: 1, admin: 2, owner: 3 } as const;

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = React.useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: (n, e) => !(e instanceof ApiError && e.status < 500) && n < 2 } },
  }));
  return (
    <QueryClientProvider client={qc}>
      <TooltipProvider delayDuration={200}>
        <SessionProvider>{children}</SessionProvider>
        <Toaster position="bottom-right" toastOptions={{ className: "!rounded-xl !border !border-line !bg-surface !text-fg !shadow-pop !text-[13px]" }} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const PUBLIC = ["/login", "/register"];

function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));
  const meQ = useQuery({ queryKey: ["me"], queryFn: () => get<Me>("/auth/me"), enabled: !isPublic, retry: false });
  const mpQ = useQuery({ queryKey: ["marketplaces"], queryFn: () => get<Marketplace[]>("/marketplaces"), enabled: !!meQ.data, staleTime: Infinity });
  const [marketplace, setMp] = React.useState("UK");
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");
  const [sidebarCollapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    try {
      setTheme((localStorage.getItem("k:theme") as "dark" | "light") || "dark");
      setCollapsed(localStorage.getItem("k:sidebar") === "1");
      const m = localStorage.getItem("k:mkt");
      if (m) setMp(m);
    } catch { /* ignore */ }
  }, []);
  React.useEffect(() => {
    if (meQ.data?.active_org) {
      setOrgHeader(meQ.data.active_org.id);
      try { if (!localStorage.getItem("k:mkt")) setMp(meQ.data.active_org.default_marketplace); } catch { setMp(meQ.data.active_org.default_marketplace); }
    }
  }, [meQ.data]);
  React.useEffect(() => {
    if (!isPublic && meQ.error instanceof ApiError && meQ.error.status === 401) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [meQ.error, isPublic, pathname, router]);

  const value: Ctx = {
    me: meQ.data ?? null, loading: meQ.isLoading, refresh: () => qc.invalidateQueries({ queryKey: ["me"] }),
    logout: async () => { await post("/auth/logout"); qc.clear(); router.replace("/login"); },
    marketplace, marketplaces: mpQ.data ?? [],
    setMarketplace: (m) => { setMp(m); try { localStorage.setItem("k:mkt", m); } catch { /* ignore */ } },
    currency: mpQ.data?.find((m) => m.code === marketplace)?.currency ?? "GBP",
    theme, toggleTheme: () => {
      const next = theme === "dark" ? "light" : "dark";
      setTheme(next); document.documentElement.classList.toggle("dark", next === "dark");
      try { localStorage.setItem("k:theme", next); } catch { /* ignore */ }
    },
    sidebarCollapsed, setSidebarCollapsed: (v) => { setCollapsed(v); try { localStorage.setItem("k:sidebar", v ? "1" : "0"); } catch { /* ignore */ } },
    can: (role) => RANK[(meQ.data?.active_org?.role ?? "viewer") as keyof typeof RANK] >= RANK[role],
  };
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  const c = React.useContext(SessionCtx);
  if (!c) throw new Error("useSession outside provider");
  return c;
}
