// Every button. This is the list of everything done for Eagle Bed, from the first message to
// today (HQ buttons, SEO toolkit, ECC jobs, order chips, and the work Claude Code did in the
// repository), turned into one-tap actions any business can run.
// Placeholders are filled from the business brief: {{name}} {{domain}} {{city}} {{country}}
// {{products}} {{adCap}} {{weeks}} and {{focus}} (optional text the customer types).

import type { Capability } from "./agents";

export type ActionGroup =
  | "Start here"
  | "SEO toolkit"
  | "Product & content pages"
  | "Sales & conversion"
  | "Ads"
  | "Social & video"
  | "Local & AI search"
  | "Offer, operations & money"
  | "Decisions & reviews"
  | "Website & code";

export interface Action {
  id: string;
  title: string;
  group: ActionGroup;
  /** Lead agent first; the Manager coordinates multi-agent actions. */
  agents: string[];
  prompt: string;
  needs: Capability[];
  /** Produces proposals for the approval Board (nothing goes live without the owner). */
  proposes?: boolean;
  /** Suggested schedule for the autopilot. */
  every?: "day" | "week" | "month";
  /** Where this came from in Eagle Bed's history. */
  origin: string;
  focus?: string; // placeholder for the optional focus box
}

const A = (a: Action) => a;

export const ACTIONS: Action[] = [
  // ---------------- Start here
  A({ id: "master-audit", title: "Run the full Master Audit", group: "Start here", agents: ["manager", "qa"], needs: ["store", "seo_data", "search_console", "web_analytics", "google_ads"], origin: "HQ Master Command (Oct 2026)",
    prompt: "Run the full Master Audit of {{name}} ({{domain}}). Every department reports, QA checks the evidence, then write the report in these sections: {{auditSections}}. Put every action on the task board with priority, owner agent, KPI and evidence." }),
  A({ id: "growth-plan", title: "Organic growth plan", group: "Start here", agents: ["manager", "analytics", "keyword", "content"], needs: ["store", "web_analytics", "search_console", "seo_data"], origin: "docs/02-organic-growth-plan.md",
    prompt: "Diagnose {{name}}'s traffic from real data (sessions by source, landing pages, device funnel, junk referrers, orders) and write a prioritised organic growth plan: week 1 foundations, weeks 1–4 consolidation, months 1–3 making category pages rank, with a keyword-to-page table and a checklist of what the owner must check by hand." }),
  A({ id: "daily-autopilot", title: "Daily autopilot check", group: "Start here", agents: ["manager", "analytics", "sitewatch", "social"], needs: ["store", "web_analytics"], every: "day", origin: "Daily Autopilot 07:47 (Nov 2026)",
    prompt: "Daily autopilot for {{name}}: yesterday's sales and traffic vs the 7-day average with alerts, check yesterday's scheduled posts went out, make sure the next 7 days of posts are planned, list approved Board items to apply, and do the next item that is due. Short report: what changed, what needs the owner." }),
  A({ id: "ceo-review", title: "Weekly CEO review", group: "Start here", agents: ["manager", "analytics", "profit"], needs: ["store", "web_analytics", "google_ads"], every: "week", origin: "HQ CEO operating system",
    prompt: "Weekly CEO review: read the scoreboard and the sales funnel, name the single biggest leak in money terms, kill or scale last week's experiments, and choose 3–5 low-cost experiments for this week with ICE scores, owner agent, KPI and review date." }),
  A({ id: "why-not-buying", title: "Why are visitors not buying? Fix it", group: "Start here", agents: ["checkout", "persona", "cro", "product"], needs: ["store", "web_analytics"], proposes: true, origin: "HQ order chip",
    prompt: "Find why visitors to {{domain}} are not buying. Break down the funnel (visit → basket → checkout → paid) by device, find the biggest leak and propose the top 3 fixes as Board proposals." }),
  A({ id: "sprint-30", title: "30-day growth sprint", group: "Start here", agents: ["manager", "ads", "social", "email", "onpage"], needs: ["store", "google_ads", "web_analytics"], origin: "HQ order chip",
    prompt: "Plan and start a 30-day sprint for the most profitable sales within {{adCap}} a day of ads: week-by-week plan, owners, KPIs and the first proposals." }),

  // ---------------- SEO toolkit (Claude SEO skills)
  A({ id: "seo-full", title: "Full SEO audit", group: "SEO toolkit", agents: ["technical", "onpage", "content", "schema", "perf", "ai"], needs: ["seo_data", "search_console", "store"], proposes: true, origin: "Claude SEO toolkit",
    prompt: "Run a full SEO audit of {{domain}} (seo-audit): technical, content and E-E-A-T, schema, sitemap, speed, AI search (GEO), agent readiness, e-commerce, local and search experience. Score each area, bucket findings Critical/High/Medium/Low, and propose fixes." }),
  A({ id: "seo-ecommerce", title: "E-commerce SEO", group: "SEO toolkit", agents: ["product", "shopping", "schema"], needs: ["seo_data", "store"], proposes: true, origin: "Claude SEO toolkit",
    prompt: "E-commerce SEO review (seo-ecommerce): product and category pages, Product schema, Google Shopping visibility against competitors in {{country}}, and the 10 product pages most likely to add sales if improved." }),
  A({ id: "seo-schema", title: "Schema check", group: "SEO toolkit", agents: ["schema"], needs: ["store", "seo_data"], proposes: true, origin: "Claude SEO toolkit",
    prompt: "Validate the JSON-LD on the home page, the 5 top categories and the 10 best sellers; list missing or wrong fields and propose exact fixes." }),
  A({ id: "seo-geo", title: "AI search (GEO)", group: "SEO toolkit", agents: ["ai", "content"], needs: ["seo_data"], proposes: true, origin: "Claude SEO toolkit",
    prompt: "How ready is {{domain}} to be cited in Google AI Overviews, ChatGPT, Perplexity, Gemini and Copilot? Rewrite 5 key passages as self-contained answers and list brand-fact gaps." }),
  A({ id: "seo-agentic", title: "AI agent readiness", group: "SEO toolkit", agents: ["agentseo"], needs: ["seo_data", "store"], proposes: true, origin: "Claude SEO toolkit",
    prompt: "Can AI shopping agents read our pages, products, prices, delivery and returns? Check robots.txt, llms.txt, agents.md, schema and accessible forms; propose fixes." }),
  A({ id: "seo-technical", title: "Technical SEO", group: "SEO toolkit", agents: ["technical", "perf"], needs: ["seo_data", "search_console"], origin: "Claude SEO toolkit",
    prompt: "Technical audit: crawlability, indexation, canonicals, redirects, noindex rules, sitemap, mobile and Core Web Vitals (INP). Protect what already works." }),
  A({ id: "seo-local", title: "Local SEO", group: "SEO toolkit", agents: ["local", "reviews"], needs: ["business_profile", "seo_data"], proposes: true, origin: "Claude SEO toolkit",
    prompt: "Local SEO review for {{name}} in {{city}}: Google Business Profile plan, name/address/phone consistency, citations (Bing Places, Apple Business Connect, local directories) and a genuine review plan." }),
  A({ id: "seo-content", title: "Content & E-E-A-T", group: "SEO toolkit", agents: ["content", "brand"], needs: ["seo_data", "store"], proposes: true, origin: "Claude SEO toolkit",
    prompt: "E-E-A-T and usefulness review of the top guides and category intros; remove unverifiable claims; plan real first-hand proof (photos, people, process, measurements)." }),
  A({ id: "seo-sxo", title: "Search experience", group: "SEO toolkit", agents: ["sxo"], needs: ["seo_data", "search_console"], origin: "Claude SEO toolkit", focus: "Money keywords, e.g. 'plumber leeds', 'oak dining table'",
    prompt: "SXO review for our money keywords ({{focus}}): does our page type match what Google shows, and what would make each page win the click and the sale?" }),
  A({ id: "seo-cluster", title: "Topic clusters", group: "SEO toolkit", agents: ["cluster", "keyword"], needs: ["seo_data", "store"], origin: "Claude SEO toolkit",
    prompt: "Cluster plan for our main {{products}} themes: hub-and-spoke map onto existing categories and guides, with the internal links to add." }),
  A({ id: "seo-images", title: "Images & speed", group: "SEO toolkit", agents: ["media", "perf"], needs: ["seo_data", "store"], proposes: true, origin: "Claude SEO toolkit",
    prompt: "Image and speed review: alt text, file sizes, formats, lazy loading and the LCP image on mobile for the home page, top categories and best sellers." }),
  A({ id: "seo-backlinks", title: "Backlinks", group: "SEO toolkit", agents: ["offpage", "links"], needs: ["seo_data"], origin: "Claude SEO toolkit",
    prompt: "Backlink review: referring domains, spam patterns for human review (never disavow), and 10 real link opportunities (local press, bloggers, directories)." }),
  A({ id: "seo-drift", title: "Drift check", group: "SEO toolkit", agents: ["drift"], needs: ["store", "seo_data"], every: "week", origin: "Claude SEO toolkit",
    prompt: "Compare the home page, top categories and best sellers with the last saved SEO baseline (in memory) and flag anything an update broke. Save a new baseline to memory." }),
  A({ id: "seo-plan", title: "90-day SEO plan", group: "SEO toolkit", agents: ["manager", "keyword", "content"], needs: ["seo_data", "search_console"], origin: "Claude SEO toolkit",
    prompt: "A 90-day organic growth plan built on the latest SEO audit, with weekly targets for non-brand Google clicks to category pages and guides." }),
  A({ id: "page-one", title: "Get a category onto page 1", group: "SEO toolkit", agents: ["keyword", "onpage", "content", "offpage"], needs: ["seo_data", "search_console", "store"], proposes: true, origin: "HQ order chip", focus: "Which category or service?",
    prompt: "Get our {{focus}} page onto page 1 of Google: current position and gap, on-page fixes, content to add, internal links and link opportunities, as proposals." }),
  A({ id: "competitor-gaps", title: "Find the top 20 competitor gaps", group: "SEO toolkit", agents: ["spy", "keyword"], needs: ["seo_data"], origin: "HQ order chip",
    prompt: "Find the top 20 keyword and content gaps against our real search competitors, with volumes, who ranks, and the page we should build or improve." }),

  // ---------------- Product & content pages (Claude Code work for Eagle Bed, Oct 2026)
  A({ id: "rewrite-products", title: "Rewrite every product page", group: "Product & content pages", agents: ["product", "onpage", "brand", "qa"], needs: ["store", "seo_data"], proposes: true, origin: "19–20 Oct: 175/188 product pages rewritten",
    prompt: "Rewrite product pages in batches of 10: SEO title (≤60 chars), meta description (≤155), a unique description in our brand voice with real specs only, and 3–5 FAQs from real buyer questions. Each page is one Board proposal with the old text kept for undo. Start with best sellers." }),
  A({ id: "upgrade-collections", title: "Upgrade category pages & guides", group: "Product & content pages", agents: ["content", "onpage", "cluster"], needs: ["store", "seo_data"], proposes: true, origin: "Oct: 12 collections + 8 guides upgraded",
    prompt: "Give each category page a unique buying-advice intro and FAQs, and upgrade the buying guides; propose each page separately." }),
  A({ id: "merge-duplicates", title: "Merge duplicate articles with redirects", group: "Product & content pages", agents: ["content", "technical"], needs: ["store", "search_console"], proposes: true, origin: "Oct: duplicate guides merged with 301s",
    prompt: "Find duplicate or near-duplicate articles and pages, choose the stronger URL from Search Console data, and propose the merge plus 301 redirects." }),
  A({ id: "alt-text", title: "Image alt text pass", group: "Product & content pages", agents: ["media"], needs: ["store"], proposes: true, origin: "20 Oct: ORG-ALT pass",
    prompt: "Write descriptive, honest alt text for every product image that is missing it or has a filename as alt text; propose in batches." }),
  A({ id: "compliance-scan", title: "Compliance scan of live text", group: "Product & content pages", agents: ["qa", "brand"], needs: ["store"], proposes: true, origin: "20 Oct: compliance re-scan (8 fixes)",
    prompt: "Scan every published page, product and SEO field for claims on the NEVER SAY list and any unprovable claim (awards, 'best', medical, safety, fake urgency, invented was-prices). Propose a fix for each." }),
  A({ id: "unpublished-clean", title: "Clean up unpublished pages", group: "Product & content pages", agents: ["content", "technical"], needs: ["store"], proposes: true, origin: "20 Oct: 59 unpublished pages cleaned",
    prompt: "List unpublished or thin pages and articles, and propose for each: publish after improvement, merge, or delete." }),
  A({ id: "new-category-pages", title: "Create new category pages from demand", group: "Product & content pages", agents: ["keyword", "content"], needs: ["seo_data", "store", "search_console"], proposes: true, origin: "29 Oct: two new size collections",
    prompt: "Find product-type or size searches with real demand where we have products but no dedicated page, and propose new category pages (title, handle, intro, FAQs, which products)." }),
  A({ id: "seasonal-article", title: "Write and schedule a seasonal article", group: "Product & content pages", agents: ["content", "seasons"], needs: ["seo_data", "store"], proposes: true, origin: "20 Oct: new-year article scheduled", focus: "Season or topic",
    prompt: "Write a helpful seasonal article about {{focus}} linking to our products, and propose it scheduled for the right date." }),
  A({ id: "seo-experiment", title: "Measure an SEO change", group: "Product & content pages", agents: ["analytics"], needs: ["search_console"], origin: "Autopilot: measure snippet experiment", focus: "Which page or change?",
    prompt: "Measure the change on {{focus}} against its baseline (clicks, impressions, CTR, position, before vs after with the same day count). Verdict: keep, revert or wait." }),

  // ---------------- Sales & conversion
  A({ id: "leak-visit-basket", title: "Fix: visit → basket leak", group: "Sales & conversion", agents: ["product", "cro", "offer"], needs: ["store", "web_analytics"], proposes: true, origin: "HQ funnel stage",
    prompt: "Fix the visit-to-basket leak: product pages, photos, prices, trust and offer. Find why visitors look but don't add to basket, and propose the top 3 fixes." }),
  A({ id: "leak-basket-checkout", title: "Fix: basket → checkout leak", group: "Sales & conversion", agents: ["checkout", "cro"], needs: ["store", "web_analytics"], proposes: true, origin: "HQ funnel stage",
    prompt: "Fix the basket-to-checkout leak: check that option and add-on prices match the basket, delivery costs and dates are clear, and trust is shown. Propose the top 3 fixes." }),
  A({ id: "leak-checkout-paid", title: "Fix: checkout → paid leak", group: "Sales & conversion", agents: ["checkout"], needs: ["store", "web_analytics"], proposes: true, origin: "HQ funnel stage",
    prompt: "Fix the checkout-to-paid leak: payment methods, delivery surprises, forms and errors on mobile. Propose the top 3 fixes." }),
  A({ id: "buyer-walkthrough", title: "Walk the store as 3 real buyers", group: "Sales & conversion", agents: ["persona", "cro", "access"], needs: ["store"], origin: "HQ order chip",
    prompt: "Walk the home page, a top category, a best seller and checkout as three realistic buyers for {{products}}. Record what reassures, confuses and stops each one, then list fixes." }),
  A({ id: "sales-replies", title: "Sales reply playbook", group: "Sales & conversion", agents: ["closer", "brand"], needs: ["store"], origin: "HQ Sales Closer",
    prompt: "Write the reply playbook for chat, WhatsApp, email and phone: fast honest answers to the top 15 buyer questions using only brief facts." }),
  A({ id: "site-health", title: "Check the live site is healthy", group: "Sales & conversion", agents: ["sitewatch"], needs: ["seo_data", "web_analytics"], every: "week", origin: "HQ order chip",
    prompt: "Check home, a top category, a best seller, basket and checkout on phone and computer: pages load, key parts present (H1, price, add to basket, delivery message), no sudden drop in visits or basket adds." }),

  // ---------------- Ads
  A({ id: "ads-waste", title: "Cut Google Ads waste", group: "Ads", agents: ["searchterms", "ads", "adcreative"], needs: ["google_ads"], proposes: true, every: "week", origin: "26 Oct: Ads copy rewritten, negatives added",
    prompt: "Read the last 30 days of search terms, list wasted spend by theme, propose negative keyword lists, and propose new ad copy (headlines ≤30, descriptions ≤90) from real facts. Never raise budgets; stay within {{adCap}} a day." }),
  A({ id: "ads-profitable", title: "Find profitable keywords", group: "Ads", agents: ["ads", "keyword", "profit"], needs: ["google_ads", "seo_data"], origin: "HQ order chip",
    prompt: "Find keywords with buying intent and a cost per sale below the profit per order; separate which to win with ads and which with SEO." }),
  A({ id: "ads-pause-check", title: "Pause campaigns that don't sell", group: "Ads", agents: ["ads", "profit"], needs: ["google_ads"], proposes: true, origin: "28 Oct: Search campaign paused (0 sales in 30 days)",
    prompt: "For every campaign, compare spend with sales in the last 30 days. Propose pausing any campaign whose spend passed one order's profit with no sale." }),
  A({ id: "shopping-feed", title: "Google Shopping feed health", group: "Ads", agents: ["shopping"], needs: ["google_ads", "store"], origin: "HQ Google Shopping agent",
    prompt: "Check product feed and Merchant Center health (price mismatch, misrepresentation, missing GTIN/brand) and Shopping performance; propose title patterns." }),
  A({ id: "tracking-fix", title: "Fix tracking", group: "Ads", agents: ["tracking"], needs: ["web_analytics", "google_ads", "store"], origin: "HQ order chip",
    prompt: "Make every ad, social and email sale countable: ad auto-tagging, conversion actions with value, GA4 purchase events, pixels, and UTMs on every link. List what is broken and how to fix it." }),
  A({ id: "meta-ads", title: "Meta Ads review", group: "Ads", agents: ["metaads", "profit"], needs: ["meta_ads"], origin: "New for all businesses",
    prompt: "Review Facebook and Instagram ads: cost per sale by audience and creative, what to stop, what to test next. Recommendations only." }),

  // ---------------- Social & video
  A({ id: "social-plan", title: "Write posts for the next weeks", group: "Social & video", agents: ["social", "brand", "instagram"], needs: ["store"], proposes: true, origin: "HQ Social calendar (posts at 09:00, 13:00, 18:00)", focus: "Number of weeks (1–4)",
    prompt: "Write {{weeks}} weeks of posts for Facebook, Instagram, TikTok, YouTube and Google profile at our posting times ({{slots}}): one real product per post, caption with hook, call to action and product link, hashtags. Each post is a proposal with date, time and platforms." }),
  A({ id: "video-films", title: "Plan this week's AI films & images", group: "Social & video", agents: ["higgsfield", "cinema"], needs: ["store", "video_ai"], origin: "HQ Cinema Studio (6 Nov)", focus: "Optional focus, e.g. a product or an offer",
    prompt: "Pick our best sellers and plan this week's cinematic films (TikTok, Reels, Shorts, Facebook, YouTube) and image sets: for each, the model, aspect, seconds, shot list with first-second hook, and which real product photos to use as references. Focus: {{focus}}." }),
  A({ id: "daily-video", title: "Daily video timetable", group: "Social & video", agents: ["studio", "youtube", "tiktok"], needs: ["store"], every: "week", origin: "HQ daily video timetable",
    prompt: "Fill the next 7 days of the daily video timetable (one short vertical video a day at 18:00): which product, which photos to pick, the music mood, caption and hashtags per platform." }),
  A({ id: "grow-reach", title: "Grow TikTok, Pinterest and Reddit reach", group: "Social & video", agents: ["tiktok", "pinterest", "reddit"], needs: ["store", "seo_data"], origin: "HQ order chip",
    prompt: "Plan reach for our best products on TikTok (hooks, searchable captions), Pinterest (boards, pins) and Reddit/forums (threads where we can genuinely help, disclosed openly)." }),
  A({ id: "brand-voice", title: "Write our brand voice profile", group: "Social & video", agents: ["brand"], needs: ["store"], origin: "ECC job",
    prompt: "Build our voice profile from our own best pages, the posts that did best and the owner's customer replies, then audit the home page and top 5 pages and propose rewrites where the copy breaks it. Save the profile to memory." }),
  A({ id: "campaign", title: "Campaign in one go", group: "Social & video", agents: ["brand", "email", "adcreative", "social"], needs: ["store"], origin: "ECC job", focus: "Which product or offer?",
    prompt: "Full campaign for {{focus}}: positioning line, landing-page copy, a 4-email sequence, 3 ad variations and a week of posts — all from brief facts." }),
  A({ id: "ai-photos", title: "Plan AI product photos", group: "Social & video", agents: ["cgi"], needs: ["store", "image_ai"], origin: "CGI studio (Nov)",
    prompt: "Find products that need more photos or colour images, list the exact shots per product (front, three-quarter, detail, in use, styled scene) and write image prompts that keep the real product exact." }),

  // ---------------- Local & AI search
  A({ id: "gbp-setup", title: "Google Business Profile makeover", group: "Local & AI search", agents: ["local"], needs: ["business_profile"], proposes: true, origin: "22–27 Oct: GBP description, categories, 9 services, 4 posts",
    prompt: "Propose the Google Business Profile description, primary and secondary categories, services list and 4 posts. No phone numbers inside posts." }),
  A({ id: "review-link", title: "Genuine review request plan", group: "Local & AI search", agents: ["reviews", "care"], needs: ["business_profile", "store"], origin: "Prepared for owner (Nov)",
    prompt: "Make the Google review link and the post-delivery review request message, timing and channel. Never incentivise or filter reviews." }),
  A({ id: "ai-overviews", title: "Show up in Google AI Overviews", group: "Local & AI search", agents: ["ai", "content"], needs: ["seo_data"], origin: "HQ order chip",
    prompt: "Find the AI Overview questions in our market, check who is cited, and propose the passages and pages that would get us cited." }),
  A({ id: "ai-platforms", title: "Get found in ChatGPT, Gemini and Copilot", group: "Local & AI search", agents: ["aiplat"], needs: ["seo_data", "store"], origin: "HQ order chip",
    prompt: "Plan Bing Webmaster Tools + IndexNow, free product listings, llms.txt, and consistent brand facts so AI assistants find and recommend us." }),

  // ---------------- Offer, operations & money
  A({ id: "new-products", title: "Find new products or services", group: "Offer, operations & money", agents: ["newproducts"], needs: ["store", "seo_data"], proposes: true, origin: "HQ New Products agent (6 Oct)", focus: "Optional focus",
    prompt: "{{newProductRules}} Focus: {{focus}}." }),
  A({ id: "profit-per-product", title: "Which products make real profit?", group: "Offer, operations & money", agents: ["profit"], needs: ["store", "google_ads"], origin: "ECC job",
    prompt: "Work out the real profit on our 15 best sellers after costs, delivery, payment fees, refunds and ad spend per order; break-even return on ad spend; what to push and what to stop. Ask for costs the brief doesn't give." }),
  A({ id: "seasonal-ready", title: "Get Black Friday & Christmas ready", group: "Offer, operations & money", agents: ["seasons", "offer", "workshop", "stock"], needs: ["store", "google_ads"], origin: "HQ order chip",
    prompt: "Plan the next big trading dates: honest offers (only if the owner confirms a real offer), last order dates worked back from make and delivery time, stock, ads and posts." }),
  A({ id: "workshop-week", title: "Plan the production week & reorders", group: "Offer, operations & money", agents: ["workshop", "stock"], needs: ["store"], every: "week", origin: "ECC job",
    prompt: "From the last 8 weeks of orders, plan this week's make or fulfilment order (due dates first, batched work), name the bottleneck and list what to reorder." }),
  A({ id: "returns-root-cause", title: "Why do orders come back?", group: "Offer, operations & money", agents: ["quality", "delivery"], needs: ["store"], origin: "ECC job",
    prompt: "Review the last 90 days of refunds, returns and complaints, sort by type and cost, and find root causes with evidence-checked 5 Whys. Corrective action for anything seen 3+ times." }),
  A({ id: "aftercare", title: "Write the aftercare pack", group: "Offer, operations & money", agents: ["care"], needs: ["store"], origin: "ECC job",
    prompt: "Ready-to-send messages for every stage after payment (confirmed, in progress, dispatch, delivery, help, review request) and replies to the 10 most common questions." }),
  A({ id: "marketplaces", title: "Pick the best extra sales channel", group: "Offer, operations & money", agents: ["marketplaces"], needs: ["store", "seo_data"], origin: "HQ Marketplaces agent",
    prompt: "Compare marketplaces for our products (fees, delivery rules, margin) and recommend the best one or two with the first five listings written." }),
  A({ id: "abandoned", title: "Recover abandoned baskets", group: "Offer, operations & money", agents: ["email", "customers"], needs: ["store", "email_sms"], origin: "HQ Email & SMS agent",
    prompt: "Write the abandoned-basket, browse and post-purchase flows (timing, subject lines, copy) and list past customers worth a genuine repeat or referral message." }),

  // ---------------- Decisions & reviews
  A({ id: "council", title: "Decision Council: a big decision", group: "Decisions & reviews", agents: ["council"], needs: ["store"], origin: "ECC job", focus: "What are you deciding?",
    prompt: "Decision on: {{focus}}. Write your own position first, then Strategist, Skeptic, Pragmatist and Customer argue; finish with one go/no-go recommendation, the risk, and how we would know it was wrong." }),
  A({ id: "market-map", title: "Market map", group: "Decisions & reviews", agents: ["research"], needs: ["seo_data"], origin: "ECC job",
    prompt: "Map our market: tier competitors direct, adjacent and aspirational; score each on the same evidence; show where we can win." }),
  A({ id: "teardown", title: "Study top sites, pick 3 features", group: "Decisions & reviews", agents: ["teardown"], needs: ["seo_data"], origin: "HQ order chip",
    prompt: "Study how the top sites in our category sell and pick the 3 features most worth building for us, with effort and expected impact." }),

  // ---------------- Website & code
  A({ id: "site-redesign", title: "Website redesign blueprint", group: "Website & code", agents: ["cro", "theme", "technical"], needs: ["store", "seo_data"], origin: "docs/01-showroom-blueprint.md (ABBAS 3D theme)",
    prompt: "Write a redesign blueprint: sitemap, page wireframes, design system, mobile layout, SEO and CRO plan, speed budget — ready for the Website Engineer." }),
  A({ id: "theme-change", title: "Make a website code change", group: "Website & code", agents: ["theme"], needs: ["code_repo"], proposes: true, origin: "ABBAS 3D theme work", focus: "What should change?",
    prompt: "Make this change in the website code on a new branch: {{focus}}. Propose the diff and how to test it on a phone. Never publish a live theme." }),
  A({ id: "accessibility", title: "Accessibility check", group: "Website & code", agents: ["access"], needs: ["seo_data"], origin: "HQ Accessibility agent",
    prompt: "Check key pages against WCAG 2.2 AA where it costs sales and list fixes in order of impact." }),
];

export function actionById(id: string) {
  return ACTIONS.find((a) => a.id === id);
}

export const ACTION_GROUPS: ActionGroup[] = [
  "Start here", "SEO toolkit", "Product & content pages", "Sales & conversion", "Ads", "Social & video",
  "Local & AI search", "Offer, operations & money", "Decisions & reviews", "Website & code",
];
