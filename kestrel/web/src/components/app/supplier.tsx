/* Supplier status labels. Green (success) only for evidence-backed authorisation statuses. */
export const SUPPLIER_STATUS: Record<string, { label: string; tone: "success" | "primary" | "cyan" | "neutral" | "danger" | "warning" }> = {
  official_brand_owner: { label: "Official brand owner", tone: "success" }, verified_authorised_distributor: { label: "Verified authorised distributor", tone: "success" },
  manufacturer: { label: "Manufacturer", tone: "cyan" }, established_wholesaler: { label: "Established wholesaler", tone: "primary" },
  unverified: { label: "Unverified", tone: "neutral" }, high_risk: { label: "High risk", tone: "danger" },
};
