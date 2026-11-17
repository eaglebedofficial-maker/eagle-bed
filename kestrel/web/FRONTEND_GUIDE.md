# Kestrel web — page-building guide

Kestrel is an Amazon product-intelligence and supplier-discovery SaaS (Next 15 App Router, React 19, TanStack Query 5, Tailwind tokens, Recharts). The backend is FastAPI under `../api` and is proxied at `/api/*`. **Read the router file for every endpoint you call** (`../api/app/routers/*.py`, and the services in `../api/app/services/`) so request and response shapes match exactly. Do not guess field names.

## Reference implementations: read these first
- `src/app/(app)/dashboard/page.tsx`: page layout, MetricCard row, cards, charts, tables, empty states.
- `src/app/(app)/settings/page.tsx`: tabs, forms, dialogs, mutations with toasts, admin gating, DataTable.
- `src/components/app/product.tsx`: product types, `productColumns()`, `ProductCell`, `useTrack`, `AmazonLink`.
- `src/components/app/fee-database.tsx`: small CRUD table with an edit dialog.
- UI kit:
  - `src/components/ui/primitives.tsx`: Button, Card, CardHeader, CardBody, Badge, Input, Textarea, Field, SearchInput, Checkbox, Switch, Segmented, Skeleton, Progress.
  - `src/components/ui/overlay.tsx`: Tooltip, InfoTip, Dialog, Sheet, ConfirmDialog, Menu, Popover, Select, Tabs, TabPanel.
  - `src/components/ui/data.tsx`: PageHeader, SourceBadge, EmptyState, NotConfigured, ErrorState, LoadingRows, Sparkline, ScoreRing, ScorePill, BarList, MetricCard, Stat, KeyValue.
  - `src/components/ui/data-table.tsx`: DataTable with sorting, server paging, selection and column visibility.
  - `src/components/ui/charts.tsx`: TimeChart, CategoryChart, TrendArea, Donut, Waterfall, RangeButtons, SeriesToggle.
- Lib:
  - `src/lib/api.ts`: get, post, put, patch, del, errorMessage, ApiError (`.notConfigured` and `.isProvider` flags).
  - `src/lib/session.tsx`: useSession provides me, marketplace, marketplaces, currency and `can(role)`.
  - `src/lib/utils.ts`: cn, money, num, pct, dateShort, ago, download.
  - `src/lib/nav.ts`: route list.

## Page conventions
- Every page file starts with `"use client";` and lives at `src/app/(app)/<route>/page.tsx`, default export.
- If you use `useSearchParams`, wrap the content in `<Suspense>` (see settings).
- Top of every page is `<PageHeader eyebrow="<nav section>" title=… description=… actions=…/>`, then content in a `space-y-6` stack.
- Grid gaps are 4 for cards and 3 for KPI rows. Cards use CardHeader with eyebrow, title, description and action.
- Use the `useQuery` key pattern `["<thing>", marketplace, …params]`. Mutations show a sonner `toast.success` or `toast.error(errorMessage(e))` and invalidate the relevant keys.
- **Every async view has all four states**: loading (Skeleton or LoadingRows), empty (EmptyState with a real next action), error (ErrorState with retry), and provider-not-configured.
  - For the provider-not-configured state, when `err instanceof ApiError && err.notConfigured` (HTTP 424), render `<NotConfigured provider=… message={err.message}/>`. It links to Settings → Integrations.
- No dead buttons. Every button does something real against the API, or is disabled with a tooltip explaining why (for example, "Admin only").
- Mobile: grids collapse (`grid-cols-1 md:… xl:…`), tables scroll inside DataTable, and toolbars wrap (`flex flex-wrap gap-2`).
- Tokens only. No hex colours. Use the classes bg-surface, bg-surface-2, border-line, text-fg, text-muted, text-subtle, text-primary, success, warning, danger, cyan and violet, and the `text-2xs` size for small labels.
- Numbers use `money()`, `num()` and `pct()`, plus the `num` class for tabular figures.
- CSV/XLSX/PDF downloads: call `fetch('/api/…', {credentials:'include', headers})`, then `download(name, blob)`. Or use `api()` if it returns a blob. Check `src/lib/api.ts`.

## Non-negotiable honesty rules (the product's legal constraints)
- Every metric shows its data classification with `SourceBadge`: official_api, licensed, estimated, ai, user, public_registry, demo. Estimated sales must say "estimate", never "sales".
- Never fabricate data, charts, or fallback numbers. With no data, show an empty state that explains how to get it.
- Supplier status:
  - Never say "authorised" or "verified" unless the backend status says so (`official_brand_owner` or `verified_authorised_distributor`).
  - Use the green success tone only for those statuses.
  - Use the `SUPPLIER_STATUS` map exported from the dashboard page, or copy it into a shared file `src/components/app/supplier.tsx` if you own suppliers.
- Invoice checks are a **"Documentation assessment"**. Never use "approval", "guaranteed" or "accepted by Amazon". Always show the policy reference and review date the backend returns.
- Never label a product "guaranteed profitable". Profit is "estimated". Show assumptions such as an assumed unit cost.
- AI output always shows evidence, assumptions, confidence, missing info and risks, plus the `ai` SourceBadge.
- Review intelligence analyses reviews the user imports. Never generate reviews.

## Ownership while agents work in parallel
- Only create or edit files for your own routes. Put any helper components in `src/components/<your-group>/…`.
- Do **not** edit the shared files: `ui/*`, `app/shell.tsx`, `app/product.tsx`, `lib/*`, `tailwind.config.ts`, `globals.css`.
  - If you need something there, build it locally in your group folder.
- Typecheck with `cd /home/user/eagle-bed/kestrel/web && npx tsc --noEmit`. Fix errors in **your** files only, and ignore errors in files you don't own.
- Do not run `next build` or `next dev`, and do not commit. The lead integrates, runs and commits.
