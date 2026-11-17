/* Response shapes for the product-intelligence routes (mirrors api/app/routers/products.py and history.py). */
import type { ProductBrief } from "@/components/app/product";

export type Filters = Record<string, string | number | boolean | string[] | undefined>;

export type ScoreFactor = { label: string; score: number | null; weight: number; reason: string; missing?: boolean };
export type ScoreComponents = {
  score: number | null; coverage: number; confidence: "high" | "medium" | "low"; factors: Record<string, ScoreFactor>; summary: string; disclaimer: string;
};

export type StatBlock = { avg?: number; min?: number; max?: number; points?: number; cv?: number | null; first?: number; last?: number };
export type HistoryWindow = { price: StatBlock; rank: StatBlock; complete: boolean };
export type BuyBoxShare = { seller_id: string; share: number; is_amazon: boolean };
export type Analytics = {
  available: boolean; reason?: string; source?: "keepa" | "tracking" | null; period_from?: string; period_to?: string;
  windows?: Record<string, HistoryWindow>; price_stability?: number | null; sales_consistency?: number | null; rank_volatility?: number;
  bsr_movement_pct?: number; seasonality?: number | null; best_months?: number[];
  buybox?: { distribution: BuyBoxShare[]; changes_90d: number; amazon_share: number; stability: number | null };
};

export type KeepaStats = Partial<{
  avg30: number[]; avg90: number[]; avg180: number[]; avg365: number[]; min: unknown; max: unknown;
  salesRankDrops30: number; salesRankDrops90: number; salesRankDrops180: number; salesRankDrops365: number;
  buyBoxSellerId: string; outOfStockPercentage30: number[] | number; outOfStockPercentage90: number[] | number;
  buyBoxIsAmazon: boolean; buyBoxIsFBA: boolean; offerCountFBA: number; offerCountFBM: number;
}>;

export type EligibilityReason = string | { code?: string; message?: string; links?: string[] };
export type EligibilityRow = { result: "eligible" | "approval_required" | "restricted" | string; source: string; checked_at: string; reasons: EligibilityReason[] };

export type ProductDetail = ProductBrief & {
  subcategory: string; ean: string; upc: string; isbn: string; manufacturer: string; parent_asin: string; fba_offers: number | null; fbm_offers: number | null;
  weight_g: number | null; length_cm: number | null; width_cm: number | null; height_cm: number | null; variations: number | null; images: number | null;
  has_aplus: boolean | null; has_video: boolean | null; listed_at: string | null; est_method: string; referral_fee: number | null;
  price_stability: number | null; sales_consistency: number | null; seasonality: number | null; listing_quality: number | null;
  score_components: ScoreComponents | null; data_quality: { score?: number; issues?: string[]; cost_assumed?: boolean; fba_fee_known?: boolean } | null;
  keepa_stats: KeepaStats | null; tracked: boolean; eligibility: EligibilityRow[];
  sources: { provider: string; classification: string; retrieved_at: string; period_from: string | null; period_to: string | null }[];
  history_summary: Analytics;
};

export type Point = [number, number | null];
export type HistoryResponse = {
  product: ProductBrief; currency: string; labels: Record<string, string>; series: Record<string, Point[]>;
  tracking: { price: Point[]; rank: Point[]; offers: Point[] };
  buybox_sellers: [number, string][];
  offers: { seller_id: string; is_fba: boolean; is_amazon: boolean; price: number | null; condition: string; is_buybox: boolean }[];
  offers_at: string | null; analytics: Analytics;
  source: { provider: string | null; classification: string; period_from: string | null; period_to: string | null };
  available: boolean; keepa_stats: KeepaStats | null;
};

export type QueryResponse = {
  total: number; page: number; page_size: number;
  summary: { count: number; avg_score: number | null; total_revenue: number | null; avg_price: number | null; avg_reviews: number | null };
  items: ProductBrief[];
};
export type Facets = { categories: { value: string; count: number }[]; brands: { value: string; count: number }[]; size_tiers: { value: string; count: number }[] };
export type SavedSearch = { id: number; name: string; filters: Filters; is_template: boolean; created_at: string };

export type ResearchResponse = { query: { type: string; value: string; marketplace?: string | null }; marketplace: string; results: ProductBrief[]; notes: { provider: string | null; error: string }[] };

export type TrackedItem = ProductBrief & {
  group_id: number | null; target_price: number | null; notes: string; tracked_since: string; spark_price: (number | null)[]; spark_bsr: (number | null)[];
  spark_units: (number | null)[]; price_change: number | null; bsr_change: number | null; reviews_change: number | null; snapshots: number;
};
export type TrackingGroup = { id: number; name: string; colour: string; kind: string; count: number };
export type TrackerResponse = { items: TrackedItem[]; groups: TrackingGroup[] };

export type CompareRow = ProductDetail & {
  history: { available: boolean; avg_price_90: number | null; avg_bsr_90: number | null; buybox_stability: number | null; bsr_movement_pct: number | null };
  supplier_count: number;
};

export type OpportunityItem = ProductBrief & { why: string };
export type OpportunityResponse = Record<string, { label: string; items: OpportunityItem[] }>;

/** Group colours are stored as token names so the UI stays on theme tokens. */
export const GROUP_TONES = ["primary", "cyan", "violet", "success", "warning", "danger"] as const;
export const groupTone = (c: string) => (GROUP_TONES as readonly string[]).includes(c) ? c : "subtle";
