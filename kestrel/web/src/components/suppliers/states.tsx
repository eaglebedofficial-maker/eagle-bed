"use client";
import * as React from "react";
import { ErrorState, NotConfigured } from "@/components/ui/data";
import { Tooltip } from "@/components/ui/overlay";
import { Button, type ButtonProps } from "@/components/ui/primitives";
import { ApiError } from "@/lib/api";
import { useSession } from "@/lib/session";

export const PROVIDER_NAMES: Record<string, string> = {
  brave_search: "Brave Search", anthropic: "Claude", companies_house: "Companies House", hmrc_vat: "HMRC VAT check", vies: "EU VIES", fx: "exchange rates",
};
export const providerName = (p?: string) => (p ? PROVIDER_NAMES[p] ?? p.replace(/_/g, " ") : undefined);

/** Error view for a query or mutation: 424 → NotConfigured (links to integrations), else ErrorState with retry. */
export function AsyncError({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  if (error instanceof ApiError && error.notConfigured) return <NotConfigured className={className} provider={providerName(error.body.provider)} message={error.body.message} />;
  return <ErrorState className={className} error={error} onRetry={onRetry} />;
}

/** A Button that is disabled, with a tooltip explaining why, when the user's role is below `need`. */
export const GatedButton = React.forwardRef<HTMLButtonElement, ButtonProps & { need?: "analyst" | "admin"; reason?: string | null }>(
  ({ need = "analyst", reason, disabled, ...props }, ref) => {
    const { can } = useSession();
    const allowed = can(need);
    const tip = !allowed ? (need === "admin" ? "Admin only" : "Analyst role or above") : reason && disabled ? reason : null;
    const btn = <Button ref={ref} disabled={disabled || !allowed} {...props} />;
    if (!tip) return btn;
    return <Tooltip content={tip}><span className="inline-flex">{btn}</span></Tooltip>;
  });
GatedButton.displayName = "GatedButton";
