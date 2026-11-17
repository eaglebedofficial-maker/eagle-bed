import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="rgb(var(--primary))" />
      <path d="M8 22.5 15.2 9.5c.4-.7 1.4-.7 1.7 0l2.4 4.6-4.9 8.4H8Z" fill="#fff" />
      <path d="m17.6 22.5 3.4-5.9 3.2 5.9h-6.6Z" fill="#22C7E8" />
    </svg>
  );
}

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!collapsed && (
        <div className="min-w-0 leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">Kestrel</div>
          <div className="text-2xs text-subtle">Amazon intelligence</div>
        </div>
      )}
    </div>
  );
}
