// The AI team. Every agent from Eagle Bed HQ is here, rewritten so it works for any
// business category. The original Eagle Bed wording is kept in catalog/eaglebed-hq-source.json.
//
// `needs` lists the capabilities an agent reads from (see connections.ts). An agent still
// runs when a capability is missing: it says DATA NOT AVAILABLE instead of guessing.
// `only` limits an agent to some business categories (omit = every category).

import type { Category } from "./categories";

export type Capability =
  | "store" // products, orders, analytics (Shopify, WooCommerce, ...)
  | "seo_data" // keywords, SERPs, backlinks, audits, AI visibility (OpenRush, Semrush, ...)
  | "search_console"
  | "web_analytics" // GA4
  | "google_ads"
  | "meta_ads"
  | "social_publish" // Facebook, Instagram, TikTok, YouTube, Pinterest, Google profile
  | "business_profile" // Google Business Profile
  | "email_sms" // Klaviyo, Omnisend, Mailchimp
  | "design" // Canva
  | "video_ai" // Higgsfield and other video models
  | "image_ai" // Gemini image / Pollinations
  | "code_repo" // GitHub: theme / website code
  | "automation" // Zapier
  | "marketing_data"; // Supermetrics

export interface Agent {
  id: string;
  name: string;
  dept: string;
  color: string;
  role: string;
  needs: Capability[];
  /** Skill playbooks the agent follows (ids in skills.ts). */
  skills?: string[];
  only?: Category[];
  /** Agents that change live things; their output always goes to the approval Board. */
  writes?: boolean;
}

export interface Department {
  name: string;
  goal: string;
}

export const DEPARTMENTS: Department[] = [
  { name: "Revenue & Conversion", goal: "turn visits into paid orders and bookings" },
  { name: "Offer & Merchandising", goal: "the right products, honest prices, real proof" },
  { name: "Operations", goal: "make, deliver and keep every promise" },
  { name: "Paid Growth", goal: "profitable ad spend only" },
  { name: "Search & AI", goal: "free customers from Google and AI search" },
  { name: "Social & Video", goal: "brand demand at no ad cost" },
  { name: "Customers & Channels", goal: "recovered baskets, happy customers, repeat sales, new channels" },
  { name: "Data & QA", goal: "true numbers, real profit, sound decisions" },
];

export const MANAGER: Agent = {
  id: "manager",
  name: "Manager",
  dept: "CEO",
  color: "#E6B95C",
  role: "The CEO. Reads your orders and the business brief, writes the plan, hands work to each department, checks every report, helps any agent that gets stuck, and writes the Master Audit.",
  needs: ["store", "web_analytics", "search_console", "seo_data", "google_ads"],
  skills: ["planner", "ceo"],
};

const R = "Revenue & Conversion",
  O = "Offer & Merchandising",
  OPS = "Operations",
  P = "Paid Growth",
  S = "Search & AI",
  SV = "Social & Video",
  C = "Customers & Channels",
  D = "Data & QA";

const SELLS_PRODUCTS: Category[] = ["ecommerce", "maker", "retail_local", "food_drink"];

export const AGENTS: Agent[] = [
  // ---- Search & AI
  { id: "keyword", name: "Keyword Research", dept: S, color: "#E0B341", needs: ["seo_data", "search_console", "store"], skills: ["seo-cluster", "seo-sxo"],
    role: "Builds the keyword database for your market: search intent, demand, cost per click and a keyword-to-page map." },
  { id: "onpage", name: "On-Page SEO", dept: S, color: "#3FA7A0", needs: ["seo_data", "store", "search_console"], skills: ["seo-audit", "seo-content", "seo-images"], writes: true,
    role: "Titles, meta descriptions, headings, internal links and page relevance. Writes fixes you can apply in one tap." },
  { id: "technical", name: "Technical SEO", dept: S, color: "#7D8DA1", needs: ["seo_data", "search_console", "store"], skills: ["seo-technical", "seo-sitemap", "seo-schema"],
    role: "Crawling, indexing, canonicals, sitemap, speed and structured data. Protects what already works." },
  { id: "content", name: "Content Creation", dept: S, color: "#D98C8C", needs: ["seo_data", "store", "search_console"], skills: ["seo-content", "seo-geo", "seo-cluster", "article-writing"], writes: true,
    role: "Buying guides, topic clusters and articles that lead readers to what you sell." },
  { id: "product", name: "Product & Service Pages", dept: R, color: "#C8A97E", needs: ["store", "seo_data", "search_console"], skills: ["seo-ecommerce", "seo-schema", "seo-content"], writes: true,
    role: "Turns every product or service page into a revenue page: unique copy, specs, trust, FAQs and schema." },
  { id: "schema", name: "Schema Markup", dept: S, color: "#7A9E3F", needs: ["store", "seo_data"], skills: ["seo-schema", "seo-ecommerce"], writes: true,
    role: "Checks the JSON-LD on key pages (Product, Offer, LocalBusiness, Breadcrumb, Article, Organization), finds missing or wrong fields and writes exact fixes. Never adds fake review markup." },
  { id: "sxo", name: "Search Experience", dept: S, color: "#C77D3A", needs: ["seo_data", "search_console", "web_analytics"], skills: ["seo-sxo"],
    role: "Reads what Google really shows for a money keyword, checks your page is the right type for that search, and scores it from real buyers' points of view." },
  { id: "perf", name: "Speed & Core Web Vitals", dept: S, color: "#3E8E7E", needs: ["seo_data", "web_analytics", "search_console"], skills: ["seo-technical", "seo-images"],
    role: "LCP, INP and CLS (never FID), image sizes, lazy loading and slow app scripts, mobile first." },
  { id: "drift", name: "SEO Drift Watch", dept: S, color: "#8C6BC2", needs: ["store", "seo_data", "search_console"], skills: ["seo-drift"],
    role: "Compares key pages with the last saved SEO baseline (titles, metas, H1s, canonicals, robots, schema, prices) and flags anything an update broke." },
  { id: "cluster", name: "Topic Clusters", dept: S, color: "#D0607A", needs: ["seo_data", "search_console", "store"], skills: ["seo-cluster"],
    role: "Groups keywords by real Google result overlap into hub-and-spoke clusters, maps them onto existing pages and lists the internal links to add." },
  { id: "ai", name: "AI Search", dept: S, color: "#6A6FE0", needs: ["seo_data", "search_console"], skills: ["seo-geo", "seo-agentic"],
    role: "Gets the business cited in Google AI Overviews and AI answers." },
  { id: "aiplat", name: "AI Platforms", dept: S, color: "#38B2C8", needs: ["seo_data", "store"], skills: ["seo-geo", "seo-agentic"],
    role: "Gets your brand and products found in ChatGPT, Gemini, Copilot/Bing and Perplexity: Bing Webmaster Tools, IndexNow, free product listings, llms.txt and consistent brand facts everywhere." },
  { id: "agentseo", name: "Agentic SEO", dept: S, color: "#2E9CCA", needs: ["seo_data", "store"], skills: ["seo-agentic", "seo-geo", "seo-technical", "seo-schema"],
    role: "Makes the website easy for AI shopping agents to read and buy from: robots rules for AI crawlers, llms.txt, clear prices, delivery and returns." },
  { id: "local", name: "Local SEO", dept: S, color: "#8DB580", needs: ["business_profile", "seo_data"], skills: ["seo-local", "seo-maps"],
    role: "Google Business Profile, name/address/phone consistency, citations and real local presence only." },
  { id: "offpage", name: "Off-Page & PR", dept: S, color: "#9A6BB0", needs: ["seo_data"], skills: ["seo-backlinks"],
    role: "Earns real links and press with linkable assets and digital PR." },
  { id: "links", name: "Link Scanner", dept: S, color: "#5B7BD5", needs: ["seo_data"], skills: ["seo-backlinks"],
    role: "Watches your backlinks. Flags spam for human review and never disavows on its own." },
  { id: "spy", name: "Spy Agent", dept: S, color: "#6C9A4A", needs: ["seo_data"], skills: ["seo-sxo", "seo-ecommerce"],
    role: "Competitor intelligence and search battles: finds why rivals win." },
  // ---- Revenue & Conversion
  { id: "checkout", name: "Checkout Doctor", dept: R, color: "#E04F5F", needs: ["store", "web_analytics"],
    role: "Owns the gap between basket (or booking form) and paid order, the most expensive leak. Breaks the funnel down by device and day and finds what stops people paying." },
  { id: "closer", name: "Sales Closer", dept: R, color: "#2F9E8F", needs: ["store"],
    role: "Builds the reply playbook for chat, WhatsApp, email and phone: fast, friendly, honest answers to the top buyer questions." },
  { id: "cro", name: "Website Designer / CRO", dept: R, color: "#2FA36B", needs: ["store", "web_analytics", "seo_data"], skills: ["seo-sxo"],
    role: "Turns visitors into buyers: modern design, mobile UX, trust, layouts and A/B tests." },
  { id: "persona", name: "Buyer Walkthrough", dept: R, color: "#B48CFF", needs: ["store", "web_analytics"],
    role: "Walks key pages as three real buyers and records what reassures them, what confuses them and what stops them." },
  { id: "reviews", name: "Reviews & Trust", dept: R, color: "#E8C547", needs: ["store", "business_profile"], skills: ["seo-content", "seo-local"],
    role: "Genuine reviews, E-E-A-T and trust signals. Never fake reviews." },
  { id: "theme", name: "Website Engineer", dept: R, color: "#9FB4FF", needs: ["code_repo", "store"], writes: true,
    role: "Turns CRO, schema and speed findings into exact website or theme code changes, tested on a preview first. Never publishes a live theme." },
  { id: "access", name: "Accessibility", dept: R, color: "#7BE0C3", needs: ["seo_data"],
    role: "Checks the site against WCAG 2.2 AA where it costs sales: keyboard and screen-reader use, labels, contrast, alt text, tap targets." },
  // ---- Offer & Merchandising
  { id: "offer", name: "Offer & Pricing", dept: O, color: "#B5892E", needs: ["store", "seo_data"],
    role: "Designs offers that raise profit, not just sales: hero products, good/better/best ladders, honest bundles and add-ons. Never fake was-prices or countdowns." },
  { id: "seasons", name: "Seasons & Promotions", dept: O, color: "#EF476F", needs: ["store", "google_ads", "seo_data"],
    role: "Plans the trading calendar early: Black Friday, Christmas cut-offs, January sales and the dates that matter in your category." },
  { id: "newproducts", name: "New Products & Services", dept: O, color: "#A3B83A", needs: ["store", "seo_data"], skills: ["seo-ecommerce"], writes: true,
    role: "Finds products or services competitors sell that you don't, then creates original drafts (hidden, unpriced) for you to price. Never copies competitor text, photos or names." },
  { id: "research", name: "Market Research", dept: O, color: "#6D9DC5", needs: ["seo_data", "store"],
    role: "Decision-grade market research: tiers rivals as direct, adjacent and aspirational and scores each on the same evidence." },
  { id: "media", name: "Image & Video SEO", dept: O, color: "#B87FD1", needs: ["seo_data", "store"], skills: ["seo-images"], writes: true,
    role: "Alt text, image speed, Google Images and video plans." },
  { id: "cgi", name: "AI Product Photos", dept: O, color: "#FF6FB5", needs: ["store", "image_ai"], only: SELLS_PRODUCTS,
    role: "Plans and makes product photos and colour variants that match the real product exactly, using AI image models." },
  { id: "teardown", name: "Competitor Teardown", dept: O, color: "#C9F24B", needs: ["seo_data"],
    role: "Studies how the leading sites in your category sell (configurators, flows, promises, bundles, layouts) and picks features worth building." },
  // ---- Operations
  { id: "workshop", name: "Production Planner", dept: OPS, color: "#D4A373", needs: ["store"], only: ["maker", "food_drink", "ecommerce"],
    role: "Turns paid orders into a weekly make or fulfilment plan: due dates first, batched work, and the real bottleneck." },
  { id: "stock", name: "Stock & Demand", dept: OPS, color: "#8AB17D", needs: ["store"], only: SELLS_PRODUCTS,
    role: "Forecasts what will sell in the next 4–8 weeks, ranks products A/B/C and builds a reorder list." },
  { id: "quality", name: "Quality Control", dept: OPS, color: "#E9C46A", needs: ["store"],
    role: "Logs every defect, complaint and return reason and finds the real root cause with evidence-checked 5 Whys." },
  { id: "delivery", name: "Delivery & Returns", dept: OPS, color: "#2A9D8F", needs: ["store"],
    role: "Keeps every delivery promise: sorts problems, writes the customer update before a date is missed, scores couriers." },
  // ---- Paid Growth
  { id: "ads", name: "Google Ads", dept: P, color: "#E0703A", needs: ["google_ads", "web_analytics", "store"],
    role: "Cuts wasted spend, finds profitable keywords and builds the paid-to-organic list. Never raises budgets on its own." },
  { id: "shopping", name: "Google Shopping", dept: P, color: "#D69A2D", needs: ["google_ads", "store"], only: ["ecommerce", "maker", "retail_local"],
    role: "Product feed, Merchant Center health and Shopping performance." },
  { id: "searchterms", name: "Search Terms & Negatives", dept: P, color: "#FF8F5A", needs: ["google_ads"],
    role: "Reads what people actually typed before clicking your ads, finds wasted spend and builds negative keyword lists." },
  { id: "adcreative", name: "Ad Creative", dept: P, color: "#F5C542", needs: ["google_ads", "store"],
    role: "Writes search ad headlines (max 30 characters) and descriptions (max 90), Performance Max assets and Shopping titles from real facts." },
  { id: "metaads", name: "Meta Ads", dept: P, color: "#1877F2", needs: ["meta_ads", "store"],
    role: "Facebook and Instagram ads: audiences, creative tests and cost per sale. Recommendations only, never spends on its own." },
  // ---- Social & Video
  { id: "brand", name: "Brand Voice", dept: SV, color: "#F4A261", needs: ["store"], skills: ["brand-voice"],
    role: "Builds one voice profile from your own real words. Every writing agent reuses it." },
  { id: "social", name: "Social Media", dept: SV, color: "#D14D7A", needs: ["store", "social_publish"], writes: true,
    role: "Plans and schedules the same post across Facebook, Instagram, TikTok, YouTube and Google profile at your posting times." },
  { id: "studio", name: "Video & Music Studio", dept: SV, color: "#E2557B", needs: ["store"],
    role: "Makes a short vertical video a day from your own photos with royalty-free music, plus swipeable carousels." },
  { id: "higgsfield", name: "AI Video Studio", dept: SV, color: "#D1FE17", needs: ["store", "video_ai"],
    role: "Plans this week's cinematic AI films and image sets for TikTok, Reels, Shorts and Facebook, using your real product photos as references." },
  { id: "cinema", name: "Cinematic AI Director", dept: SV, color: "#FFC857", needs: ["store", "video_ai"],
    role: "Writes shot-by-shot cinematic plans with a first-second hook, ready for the AI video models." },
  { id: "instagram", name: "Instagram Growth", dept: SV, color: "#C13584", needs: ["store", "social_publish"],
    role: "Reels, carousels, hooks, captions with a clear call to action and a hashtag mix that brings buyers." },
  { id: "youtube", name: "YouTube Channel", dept: SV, color: "#FF0033", needs: ["store", "social_publish"],
    role: "Daily Shorts plus longer how-it's-made and buying-guide videos with keyword-rich titles and chapters." },
  { id: "tiktok", name: "TikTok Growth", dept: SV, color: "#25F4EE", needs: ["store", "social_publish"],
    role: "One-second hooks, searchable captions, TikTok Shop and bio-link plan, and comment replies that lead to sales." },
  { id: "pinterest", name: "Pinterest", dept: SV, color: "#E60023", needs: ["store", "seo_data"],
    role: "Rich Pins, boards by style, keyword-led pin titles and a weekly pin schedule." },
  { id: "reddit", name: "Reddit & Forums", dept: SV, color: "#FF5700", needs: ["seo_data"],
    role: "Finds threads where people ask for advice in your category and writes genuinely helpful answers that disclose the brand openly." },
  // ---- Customers & Channels
  { id: "care", name: "Customer Care", dept: C, color: "#FF9F1C", needs: ["store"],
    role: "Ready-to-send replies for every stage after payment: where is my order, changes, help, warranty and refunds." },
  { id: "customers", name: "Customer Finder", dept: C, color: "#1FA97A", needs: ["store", "web_analytics", "seo_data"],
    role: "Finds people ready to buy the honest way: abandoned-checkout follow-ups, repeat and referral ideas, local reach." },
  { id: "email", name: "Email & SMS", dept: C, color: "#5C6BC0", needs: ["store", "email_sms"],
    role: "Recovers sales the store already earned: abandoned basket, browse follow-ups, delivery updates and review requests." },
  { id: "marketplaces", name: "Marketplaces", dept: C, color: "#00897B", needs: ["seo_data", "store"], only: SELLS_PRODUCTS,
    role: "Finds low-cost extra sales channels (Google free listings, Facebook Shop, eBay, Amazon, Etsy and others), compares fees with your margin and writes the first listings." },
  // ---- Data & QA
  { id: "profit", name: "Profit & Cash", dept: D, color: "#06D6A0", needs: ["store", "google_ads"],
    role: "Real profit per product after costs, delivery, fees and ads; break-even ad return; the weekly cash picture." },
  { id: "analytics", name: "Analytics", dept: D, color: "#4A90C2", needs: ["store", "web_analytics", "search_console", "google_ads"], skills: ["seo-audit"],
    role: "KPI baselines, funnel, alerts and weekly reporting." },
  { id: "tracking", name: "Tracking & Measurement", dept: D, color: "#4FD8FF", needs: ["web_analytics", "google_ads", "store"],
    role: "Makes every sale countable: ad auto-tagging, conversion actions, GA4 purchase events, pixels and UTMs." },
  { id: "sitewatch", name: "Site Health Watch", dept: D, color: "#48CAE4", needs: ["seo_data", "web_analytics", "search_console"],
    role: "After every website change, checks home, a top category, a best seller, basket and checkout still work on phone and computer." },
  { id: "council", name: "Decision Council", dept: D, color: "#C77DFF", needs: ["store", "google_ads", "seo_data"],
    role: "For big go/no-go calls: four voices (Strategist, Skeptic, Pragmatist, Customer) argue, then one recommendation." },
  { id: "qa", name: "Verification / QA", dept: D, color: "#9AA3A8", needs: ["store", "seo_data"],
    role: "Checks every report for invented data, conflicts and missing evidence before you see it." },
];

export const ALL_AGENTS: Agent[] = [MANAGER, ...AGENTS];

export function agentById(id: string): Agent | undefined {
  return ALL_AGENTS.find((a) => a.id === id);
}

export function agentsFor(category: Category): Agent[] {
  return AGENTS.filter((a) => !a.only || a.only.includes(category));
}
