import {
  Activity, BarChart3, Bell, BookmarkCheck, Boxes, Building2, Calculator, ChartCandlestick, ClipboardList, Compass, Database,
  FileCheck2, FileText, GitCompareArrows, Globe2, Hash, LayoutDashboard, LineChart, ListChecks, Megaphone, MessageSquareQuote,
  PackageSearch, Percent, Radar, Receipt, ScanSearch, Search, ShieldCheck, Sparkles, Star, Target, TrendingUp, Truck, Users, Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; description: string };
export type NavSection = { title: string; items: NavItem[] };

export const NAV: NavSection[] = [
  { title: "Overview", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Your workspace at a glance" },
    { href: "/market", label: "Market Overview", icon: Globe2, description: "Categories, demand and competition across your research" },
  ] },
  { title: "Product intelligence", items: [
    { href: "/research", label: "Product Research", icon: Search, description: "Search by keyword, ASIN, EAN, brand or URL" },
    { href: "/opportunities", label: "Opportunity Finder", icon: Compass, description: "Ranked opportunities with explanations" },
    { href: "/products", label: "Product Database", icon: Database, description: "Every product you've researched, with 30+ filters" },
    { href: "/tracker", label: "Product Tracker", icon: Activity, description: "Daily price, rank, review and offer tracking" },
    { href: "/history", label: "Keepa Intelligence", icon: ChartCandlestick, description: "Historical price, rank, buy box and offers" },
    { href: "/compare", label: "Product Comparison", icon: GitCompareArrows, description: "Compare up to 10 products" },
  ] },
  { title: "Keyword intelligence", items: [
    { href: "/keywords", label: "Keyword Research", icon: Hash, description: "Search volume, related terms and difficulty" },
    { href: "/reverse-asin", label: "Reverse ASIN", icon: ScanSearch, description: "Keywords competitor products rank for" },
    { href: "/keyword-tracker", label: "Keyword Tracker", icon: ListChecks, description: "Keyword-by-keyword positions over time" },
    { href: "/ranks", label: "Rank Tracker", icon: TrendingUp, description: "Organic and sponsored rank by product" },
    { href: "/listing", label: "Listing Optimizer", icon: FileText, description: "Analyse and build keyword-rich listings" },
  ] },
  { title: "Competitor intelligence", items: [
    { href: "/competitors", label: "Competitor Analysis", icon: Target, description: "Competitor sets and changes" },
    { href: "/reviews", label: "Review Intelligence", icon: MessageSquareQuote, description: "Complaints, praise and improvement reports" },
    { href: "/market-tracker", label: "Market Tracker", icon: Radar, description: "Track a market segment's share and demand" },
  ] },
  { title: "Supplier intelligence", items: [
    { href: "/suppliers", label: "Supplier Finder", icon: Building2, description: "Find and evaluate suppliers" },
    { href: "/brands", label: "Brand Verification", icon: ShieldCheck, description: "Brand owners, websites and restrictions" },
    { href: "/distributors", label: "Authorised Distributors", icon: Truck, description: "Distributor research with cited evidence" },
    { href: "/invoices", label: "Invoice Compliance", icon: FileCheck2, description: "Documentation assessment for supplier invoices" },
    { href: "/suppliers/compare", label: "Supplier Comparison", icon: Users, description: "Side-by-side supplier scoring" },
    { href: "/rfq", label: "RFQ Manager", icon: ClipboardList, description: "Quotations, samples and purchase orders" },
  ] },
  { title: "Financial tools", items: [
    { href: "/profit", label: "Profit Calculator", icon: Calculator, description: "Landed cost to net profit, scenarios" },
    { href: "/fba", label: "FBA Calculator", icon: PackageSearch, description: "Size tier and fulfilment fees" },
    { href: "/vat", label: "VAT Calculator", icon: Percent, description: "VAT-inclusive and exclusive figures" },
    { href: "/inventory", label: "Inventory Manager", icon: Boxes, description: "Days of cover, reorder points, stockout risk" },
    { href: "/ppc", label: "PPC Analytics", icon: Megaphone, description: "ACoS, TACoS, ROAS and search terms" },
  ] },
  { title: "Workspace", items: [
    { href: "/saved/products", label: "Saved Products", icon: Star, description: "Products you've saved" },
    { href: "/saved/suppliers", label: "Saved Suppliers", icon: BookmarkCheck, description: "Suppliers you've saved" },
    { href: "/reports", label: "Reports", icon: BarChart3, description: "Exports in CSV, Excel and PDF" },
    { href: "/alerts", label: "Alerts", icon: Bell, description: "Rules and notifications" },
  ] },
];

export const EXTRA_NAV: NavItem[] = [
  { href: "/assistant", label: "AI Research Assistant", icon: Sparkles, description: "Ask questions about products, markets and suppliers" },
  { href: "/sales", label: "Sales Analytics", icon: LineChart, description: "Revenue, units, profit from your reports" },
  { href: "/reimbursements", label: "Reimbursements", icon: Receipt, description: "Possible reimbursement discrepancies" },
  { href: "/settings", label: "Settings", icon: Wallet, description: "Organisation, team, integrations, fee database" },
];

export const ALL_NAV: NavItem[] = [...NAV.flatMap((s) => s.items), ...EXTRA_NAV];
export const findNav = (path: string) =>
  ALL_NAV.filter((n) => path === n.href || path.startsWith(n.href + "/")).sort((a, b) => b.href.length - a.href.length)[0];
