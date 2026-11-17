"use client";
import * as DialogP from "@radix-ui/react-dialog";
import * as DropdownP from "@radix-ui/react-dropdown-menu";
import * as PopoverP from "@radix-ui/react-popover";
import * as SelectP from "@radix-ui/react-select";
import * as TabsP from "@radix-ui/react-tabs";
import * as TooltipP from "@radix-ui/react-tooltip";
import { Check, ChevronDown, Info, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./primitives";

/* ---------------------------------------------------------------- Tooltip */
export const TooltipProvider = TooltipP.Provider;
export function Tooltip({ content, children, side = "top", className }: { content: React.ReactNode; children: React.ReactNode; side?: "top" | "bottom" | "left" | "right"; className?: string }) {
  if (!content) return <>{children}</>;
  return (
    <TooltipP.Root delayDuration={200}>
      <TooltipP.Trigger asChild>{children}</TooltipP.Trigger>
      <TooltipP.Portal>
        <TooltipP.Content side={side} sideOffset={6} className={cn("z-[80] max-w-xs rounded-lg border border-line bg-surface px-3 py-2 text-xs leading-relaxed text-fg shadow-pop data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0", className)}>
          {content}
        </TooltipP.Content>
      </TooltipP.Portal>
    </TooltipP.Root>
  );
}
export function InfoTip({ content, className }: { content: React.ReactNode; className?: string }) {
  return (
    <Tooltip content={content}>
      <button type="button" aria-label="More information" className={cn("inline-grid place-items-center text-subtle hover:text-muted", className)}><Info className="size-3.5" /></button>
    </Tooltip>
  );
}

/* ---------------------------------------------------------------- Dialog & Sheet */
export function Dialog({ open, onOpenChange, title, description, children, footer, size = "md" }: { open: boolean; onOpenChange: (v: boolean) => void; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode; size?: "sm" | "md" | "lg" | "xl" }) {
  const w = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" }[size];
  return (
    <DialogP.Root open={open} onOpenChange={onOpenChange}>
      <DialogP.Portal>
        <DialogP.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogP.Content className={cn("fixed left-1/2 top-1/2 z-[61] flex max-h-[88vh] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-line bg-surface shadow-pop duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", w)}>
          <div className="flex items-start gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0 flex-1">
              <DialogP.Title className="text-base font-semibold">{title}</DialogP.Title>
              {description ? <DialogP.Description className="mt-1 text-[13px] text-muted">{description}</DialogP.Description> : <DialogP.Description className="sr-only">{typeof title === "string" ? title : "Dialog"}</DialogP.Description>}
            </div>
            <DialogP.Close asChild><Button variant="ghost" size="icon-sm" aria-label="Close"><X /></Button></DialogP.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
        </DialogP.Content>
      </DialogP.Portal>
    </DialogP.Root>
  );
}

export function Sheet({ open, onOpenChange, title, description, children, footer, width = 480 }: { open: boolean; onOpenChange: (v: boolean) => void; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode; width?: number }) {
  return (
    <DialogP.Root open={open} onOpenChange={onOpenChange}>
      <DialogP.Portal>
        <DialogP.Overlay className="fixed inset-0 z-[60] bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogP.Content style={{ width: `min(${width}px, 100vw)` }} className="fixed inset-y-0 right-0 z-[61] flex flex-col border-l border-line bg-surface shadow-pop duration-200 data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right">
          <div className="flex items-start gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0 flex-1">
              <DialogP.Title className="text-base font-semibold">{title}</DialogP.Title>
              {description ? <DialogP.Description className="mt-1 text-[13px] text-muted">{description}</DialogP.Description> : <DialogP.Description className="sr-only">Panel</DialogP.Description>}
            </div>
            <DialogP.Close asChild><Button variant="ghost" size="icon-sm" aria-label="Close"><X /></Button></DialogP.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
        </DialogP.Content>
      </DialogP.Portal>
    </DialogP.Root>
  );
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", tone = "danger", onConfirm, loading }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; description: React.ReactNode; confirmLabel?: string; tone?: "danger" | "primary"; onConfirm: () => void; loading?: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} size="sm"
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant={tone} loading={loading} onClick={onConfirm}>{confirmLabel}</Button></>}>
      <div className="text-sm text-muted">{description}</div>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- Dropdown menu */
export function Menu({ trigger, items, align = "end", label }: { trigger: React.ReactNode; align?: "start" | "end"; label?: string; items: ({ label: React.ReactNode; icon?: React.ReactNode; onSelect: () => void; danger?: boolean; disabled?: boolean } | "sep")[] }) {
  return (
    <DropdownP.Root>
      <DropdownP.Trigger asChild>{trigger}</DropdownP.Trigger>
      <DropdownP.Portal>
        <DropdownP.Content align={align} sideOffset={6} className="z-[70] min-w-[200px] rounded-xl border border-line bg-surface p-1 shadow-pop data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          {label && <DropdownP.Label className="px-2.5 py-1.5 text-2xs font-semibold uppercase tracking-wider text-subtle">{label}</DropdownP.Label>}
          {items.map((it, i) => it === "sep" ? <DropdownP.Separator key={i} className="my-1 h-px bg-line" /> : (
            <DropdownP.Item key={i} disabled={it.disabled} onSelect={it.onSelect}
              className={cn("flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] outline-none data-[disabled]:opacity-50 data-[highlighted]:bg-surface-2 [&_svg]:size-4", it.danger ? "text-danger" : "text-fg")}>
              {it.icon}{it.label}
            </DropdownP.Item>
          ))}
        </DropdownP.Content>
      </DropdownP.Portal>
    </DropdownP.Root>
  );
}

export function Popover({ trigger, children, align = "end", className }: { trigger: React.ReactNode; children: React.ReactNode; align?: "start" | "center" | "end"; className?: string }) {
  return (
    <PopoverP.Root>
      <PopoverP.Trigger asChild>{trigger}</PopoverP.Trigger>
      <PopoverP.Portal>
        <PopoverP.Content align={align} sideOffset={6} className={cn("z-[70] rounded-xl border border-line bg-surface shadow-pop data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", className)}>{children}</PopoverP.Content>
      </PopoverP.Portal>
    </PopoverP.Root>
  );
}

/* ---------------------------------------------------------------- Select */
export function Select<T extends string>({ value, onChange, options, placeholder, className, size = "md", "aria-label": ariaLabel }: { value: T | ""; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; placeholder?: string; className?: string; size?: "sm" | "md"; "aria-label"?: string }) {
  return (
    <SelectP.Root value={value || undefined} onValueChange={(v) => onChange(v as T)}>
      <SelectP.Trigger aria-label={ariaLabel} className={cn("inline-flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 text-left text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary/30 data-[placeholder]:text-subtle", size === "sm" ? "h-8" : "h-9", className)}>
        <span className="truncate"><SelectP.Value placeholder={placeholder} /></span>
        <SelectP.Icon><ChevronDown className="size-4 text-subtle" /></SelectP.Icon>
      </SelectP.Trigger>
      <SelectP.Portal>
        <SelectP.Content position="popper" sideOffset={4} className="z-[75] max-h-[320px] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-line bg-surface shadow-pop data-[state=open]:animate-in data-[state=open]:fade-in-0">
          <SelectP.Viewport className="p-1">
            {options.map((o) => (
              <SelectP.Item key={o.value} value={o.value} className="relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-[13px] text-fg outline-none data-[highlighted]:bg-surface-2">
                <SelectP.ItemIndicator className="absolute left-2.5"><Check className="size-3.5 text-primary" /></SelectP.ItemIndicator>
                <SelectP.ItemText>{o.label}</SelectP.ItemText>
              </SelectP.Item>
            ))}
          </SelectP.Viewport>
        </SelectP.Content>
      </SelectP.Portal>
    </SelectP.Root>
  );
}

/* ---------------------------------------------------------------- Tabs */
export function Tabs({ value, onValueChange, tabs, children, className, sticky }: { value: string; onValueChange: (v: string) => void; tabs: { value: string; label: React.ReactNode; count?: number }[]; children?: React.ReactNode; className?: string; sticky?: boolean }) {
  return (
    <TabsP.Root value={value} onValueChange={onValueChange} className={className}>
      <TabsP.List className={cn("flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]", sticky && "sticky top-[var(--topbar-h)] z-20 bg-bg/95 backdrop-blur")}>
        {tabs.map((t) => (
          <TabsP.Trigger key={t.value} value={t.value}
            className="relative -mb-px flex h-10 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-[13px] font-medium text-muted transition-colors hover:text-fg data-[state=active]:border-primary data-[state=active]:text-fg">
            {t.label}{t.count != null && <span className="rounded bg-surface-2 px-1.5 text-2xs text-muted num">{t.count}</span>}
          </TabsP.Trigger>
        ))}
      </TabsP.List>
      {children}
    </TabsP.Root>
  );
}
export const TabPanel = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => (
  <TabsP.Content value={value} className={cn("pt-5 focus:outline-none", className)}>{children}</TabsP.Content>
);
