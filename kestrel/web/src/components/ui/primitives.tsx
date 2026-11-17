"use client";
import * as CheckboxP from "@radix-ui/react-checkbox";
import * as SwitchP from "@radix-ui/react-switch";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, Loader2, Minus, Search, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- Button */
const buttonV = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-[background,color,border,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg shadow-sm hover:bg-primary/90 active:bg-primary/85",
        secondary: "bg-surface-2 text-fg border border-line hover:bg-surface-3 hover:border-line-strong",
        outline: "border border-line-strong bg-transparent text-fg hover:bg-surface-2",
        ghost: "text-muted hover:text-fg hover:bg-surface-2",
        danger: "bg-danger text-white hover:bg-danger/90",
        link: "text-primary underline-offset-4 hover:underline px-0 h-auto",
      },
      size: { xs: "h-7 px-2 text-xs", sm: "h-8 px-3 text-[13px]", md: "h-9 px-3.5 text-sm", lg: "h-11 px-5 text-sm", icon: "h-9 w-9", "icon-sm": "h-8 w-8" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonV> { asChild?: boolean; loading?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, loading, children, disabled, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp ref={ref} className={cn(buttonV({ variant, size }), className)} disabled={disabled || loading} {...props}>
      {asChild ? children : <>{loading && <Loader2 className="animate-spin" />}{children}</>}
    </Comp>
  );
});
Button.displayName = "Button";

/* ---------------------------------------------------------------- Card */
export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-line bg-surface shadow-card", className)} {...p} />;
}
export function CardHeader({ className, title, description, action, eyebrow }: { className?: string; title?: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; eyebrow?: React.ReactNode }) {
  return (
    <div className={cn("flex items-start gap-3 px-5 pt-4 pb-3", className)}>
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="mb-1 text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">{eyebrow}</div>}
        {title && <h3 className="text-[15px] font-semibold leading-tight">{title}</h3>}
        {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
export const CardBody = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("px-5 pb-5", className)} {...p} />;

/* ---------------------------------------------------------------- Badge */
const badgeV = cva("inline-flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap", {
  variants: {
    tone: {
      neutral: "bg-surface-2 text-muted border border-line", primary: "bg-primary-soft text-primary", success: "bg-success-soft text-success",
      warning: "bg-warning-soft text-warning", danger: "bg-danger-soft text-danger", cyan: "bg-cyan-soft text-cyan", violet: "bg-violet-soft text-violet",
    },
    size: { sm: "h-5 px-1.5 text-2xs", md: "h-6 px-2 text-xs" },
  },
  defaultVariants: { tone: "neutral", size: "md" },
});
export function Badge({ className, tone, size, dot, children, ...p }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeV> & { dot?: boolean }) {
  return <span className={cn(badgeV({ tone, size }), className)} {...p}>{dot && <span className="size-1.5 rounded-full bg-current" />}{children}</span>;
}

/* ---------------------------------------------------------------- Inputs */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { prefix?: React.ReactNode; suffix?: React.ReactNode; invalid?: boolean }>(
  ({ className, prefix, suffix, invalid, ...p }, ref) => {
    const base = "h-9 w-full min-w-0 rounded-lg border bg-surface text-sm text-fg placeholder:text-subtle transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60 num";
    if (!prefix && !suffix) return <input ref={ref} className={cn(base, "px-3", invalid ? "border-danger" : "border-line", className)} {...p} />;
    return (
      <div className={cn("flex h-9 items-center rounded-lg border bg-surface transition-colors focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary", invalid ? "border-danger" : "border-line", className)}>
        {prefix && <span className="pl-3 text-sm text-subtle">{prefix}</span>}
        <input ref={ref} className="h-full w-full min-w-0 bg-transparent px-2.5 text-sm text-fg placeholder:text-subtle focus:outline-none num" {...p} />
        {suffix && <span className="pr-3 text-sm text-subtle">{suffix}</span>}
      </div>
    );
  });
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn("min-h-[88px] w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary", className)} {...p} />
));
Textarea.displayName = "Textarea";

export function Field({ label, hint, error, children, className, htmlFor, aside }: { label: React.ReactNode; hint?: React.ReactNode; error?: string; children: React.ReactNode; className?: string; htmlFor?: string; aside?: React.ReactNode }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-fg">{label}</label>
        {aside && <span className="text-2xs text-subtle">{aside}</span>}
      </div>
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : hint ? <p className="text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, className, onClear, autoFocus, size = "md" }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; onClear?: () => void; autoFocus?: boolean; size?: "md" | "lg" }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border border-line bg-surface px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30", size === "lg" ? "h-12" : "h-9", className)}>
      <Search className={cn("shrink-0 text-subtle", size === "lg" ? "size-5" : "size-4")} />
      <input autoFocus={autoFocus} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={cn("h-full w-full min-w-0 bg-transparent text-fg placeholder:text-subtle focus:outline-none", size === "lg" ? "text-[15px]" : "text-sm")} />
      {value && <button aria-label="Clear" onClick={() => (onClear ? onClear() : onChange(""))} className="text-subtle hover:text-fg"><X className="size-4" /></button>}
    </div>
  );
}

export function Checkbox({ checked, onCheckedChange, indeterminate, label, className, "aria-label": ariaLabel }: { checked: boolean; onCheckedChange: (v: boolean) => void; indeterminate?: boolean; label?: React.ReactNode; className?: string; "aria-label"?: string }) {
  const box = (
    <CheckboxP.Root aria-label={ariaLabel} checked={indeterminate ? "indeterminate" : checked} onCheckedChange={(v) => onCheckedChange(v === true)}
      className={cn("grid size-4 shrink-0 place-items-center rounded-[5px] border border-line-strong bg-surface transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary", !label && className)}>
      <CheckboxP.Indicator className="text-white">{indeterminate ? <Minus className="size-3" strokeWidth={3} /> : <Check className="size-3" strokeWidth={3} />}</CheckboxP.Indicator>
    </CheckboxP.Root>
  );
  if (!label) return box;
  return <label className={cn("flex cursor-pointer items-center gap-2 text-sm", className)}>{box}<span>{label}</span></label>;
}

export function Switch({ checked, onCheckedChange, label, description, id }: { checked: boolean; onCheckedChange: (v: boolean) => void; label?: React.ReactNode; description?: React.ReactNode; id?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4">
      {(label || description) && <span className="min-w-0"><span className="block text-sm font-medium">{label}</span>{description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}</span>}
      <SwitchP.Root id={id} checked={checked} onCheckedChange={onCheckedChange} className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-line-strong transition-colors data-[state=checked]:bg-primary">
        <SwitchP.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow transition-transform duration-150 data-[state=checked]:translate-x-[18px]" />
      </SwitchP.Root>
    </label>
  );
}

export function Segmented<T extends string>({ value, onChange, options, size = "md", className }: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; size?: "sm" | "md"; className?: string }) {
  return (
    <div role="radiogroup" className={cn("inline-flex rounded-lg border border-line bg-surface-2 p-0.5", className)}>
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={cn("rounded-md font-medium transition-colors duration-150", size === "sm" ? "h-6 px-2 text-xs" : "h-7 px-3 text-[13px]",
            value === o.value ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-surface-2 px-1 font-mono text-[10px] text-muted">{children}</kbd>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("relative overflow-hidden rounded-md bg-surface-2", className)}><div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-surface-3/70 to-transparent" /></div>;
}

export function Separator({ className, vertical }: { className?: string; vertical?: boolean }) {
  return <div className={cn(vertical ? "w-px self-stretch" : "h-px w-full", "bg-line", className)} />;
}

export function Progress({ value, tone = "primary", className }: { value: number; tone?: "primary" | "success" | "warning" | "danger"; className?: string }) {
  const color = { primary: "bg-primary", success: "bg-success", warning: "bg-warning", danger: "bg-danger" }[tone];
  return <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-3", className)}><div className={cn("h-full rounded-full transition-[width] duration-300", color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}
