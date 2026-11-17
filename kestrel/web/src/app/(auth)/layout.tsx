import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/app/logo";

const POINTS = [
  ["Product intelligence", "Opportunity scores that explain themselves, with every number labelled by source."],
  ["Historical truth", "Keepa price, rank, buy-box and offer history — only what was actually retrieved."],
  ["Supplier sourcing", "Find manufacturers and authorised distributors, verify them against public registers."],
  ["Invoice documentation", "Assess supplier invoices against Amazon's published requirements before you buy."],
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <section className="relative hidden overflow-hidden border-r border-line bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(600px 400px at 10% 0%, rgb(var(--primary) / 0.14), transparent 60%), radial-gradient(500px 360px at 90% 100%, rgb(var(--cyan) / 0.10), transparent 60%)" }} />
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgb(var(--line))_1px,transparent_1px),linear-gradient(90deg,rgb(var(--line))_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
        <div className="relative"><Logo /></div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">Know what to sell, and exactly who to buy it from.</h2>
          <ul className="mt-8 space-y-5">
            {POINTS.map(([t, d]) => (
              <li key={t} className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><div><div className="text-sm font-semibold">{t}</div><div className="mt-0.5 text-[13px] text-muted">{d}</div></div></li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs text-subtle">Amazon UK first · US, DE, FR, IT, ES, NL, CA, AU supported</div>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[400px]"><div className="mb-8 lg:hidden"><Logo /></div>{children}</div>
      </section>
    </div>
  );
}
