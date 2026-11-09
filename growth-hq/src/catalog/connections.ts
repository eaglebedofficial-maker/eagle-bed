// NOTE: MCP URLs below are defaults to confirm against each vendor's current docs before launch;
// every one can be overridden with env CONN_<ID>_MCP_URL (see src/lib/connections.ts).
// Every service Eagle Bed HQ is connected to, plus the ones it needed but could not reach.
// kind "mcp": a remote MCP server Claude calls directly through the MCP connector.
// kind "oauth": the app holds an OAuth token and exposes the API to Claude as tools.
// kind "key": the customer pastes an API key (stored encrypted).

import type { Capability } from "./agents";

export type ConnectionKind = "mcp" | "oauth" | "key";

export interface ConnectionDef {
  id: string;
  name: string;
  group: "AI brain" | "Store & website" | "Search & SEO" | "Ads" | "Social" | "Email & customers" | "Creative" | "Automation & data";
  kind: ConnectionKind;
  provides: Capability[];
  /** Remote MCP server URL (kind "mcp"). Override with env CONN_<ID>_MCP_URL. */
  mcpUrl?: string;
  /** OAuth details (kind "oauth"); client id/secret come from env. */
  oauth?: { authorizeUrl: string; tokenUrl: string; scopes: string[]; envPrefix: string };
  what: string;
  required?: boolean;
  /** OAuth connections that also accept a pasted long-lived token (for testing or self-serve). */
  pasteToken?: string;
  /** Used by Eagle Bed HQ today. */
  inEagleBed: boolean;
}

export const CONNECTIONS: ConnectionDef[] = [
  {
    id: "anthropic", name: "Claude (Anthropic API key)", group: "AI brain", kind: "key", provides: [], required: true, inEagleBed: true,
    what: "Your own Claude account runs every agent, so usage is billed to you, not to anyone else. Create a key at console.anthropic.com → API keys. (A Claude Pro/Max chat subscription cannot be connected to other apps; an API key is the official way.)",
  },
  {
    id: "shopify", name: "Shopify", group: "Store & website", kind: "key", provides: ["store"], inEagleBed: true,
    what: "Products, collections, orders, customers, SEO fields, drafts. In Shopify admin: Settings → Apps and sales channels → Develop apps → Create an app → Admin API scopes (read/write products, content, orders read) → Install → copy the Admin API access token (shpat_…). Put your store address (yourstore.myshopify.com) in the second box.",
  },
  {
    id: "woocommerce", name: "WooCommerce", group: "Store & website", kind: "key", provides: ["store"], inEagleBed: false,
    what: "For WordPress shops: consumer key and secret from WooCommerce → Settings → Advanced → REST API.",
  },
  {
    id: "github", name: "GitHub (website / theme code)", group: "Store & website", kind: "oauth", provides: ["code_repo"], inEagleBed: true,
    oauth: { authorizeUrl: "https://github.com/login/oauth/authorize", tokenUrl: "https://github.com/login/oauth/access_token", scopes: ["repo"], envPrefix: "GITHUB" },
    what: "Theme and website code. The Website Engineer opens changes on a branch; nothing is published without you.",
  },
  {
    id: "openrush", name: "OpenRush (SEO data)", group: "Search & SEO", kind: "mcp", provides: ["seo_data"], inEagleBed: true,
    mcpUrl: "https://mcp.openrush.ai/mcp",
    what: "Keywords, Google results, competitors, backlinks, site audits and AI Overview citations.",
  },
  {
    id: "search_console", name: "Google Search Console", group: "Search & SEO", kind: "oauth", provides: ["search_console"], inEagleBed: true,
    oauth: { authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth", tokenUrl: "https://oauth2.googleapis.com/token", scopes: ["https://www.googleapis.com/auth/webmasters.readonly"], envPrefix: "GOOGLE" },
    what: "Real Google clicks, impressions, positions and indexing problems.",
  },
  {
    id: "ga4", name: "Google Analytics 4", group: "Search & SEO", kind: "oauth", provides: ["web_analytics"], inEagleBed: true,
    oauth: { authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth", tokenUrl: "https://oauth2.googleapis.com/token", scopes: ["https://www.googleapis.com/auth/analytics.readonly"], envPrefix: "GOOGLE" },
    what: "Visits, sources, funnels and conversions.",
  },
  {
    id: "gbp", name: "Google Business Profile", group: "Search & SEO", kind: "oauth", provides: ["business_profile"], inEagleBed: true,
    oauth: { authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth", tokenUrl: "https://oauth2.googleapis.com/token", scopes: ["https://www.googleapis.com/auth/business.manage"], envPrefix: "GOOGLE" },
    what: "Description, categories, services, posts and reviews on Google Maps.",
  },
  {
    id: "google_ads", name: "Google Ads", group: "Ads", kind: "oauth", provides: ["google_ads"], inEagleBed: true,
    oauth: { authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth", tokenUrl: "https://oauth2.googleapis.com/token", scopes: ["https://www.googleapis.com/auth/adwords"], envPrefix: "GOOGLE" },
    what: "Campaigns, search terms, negatives and ad copy. Budget and bid changes always need your approval and never exceed your daily cap.",
  },
  {
    id: "meta", name: "Facebook & Instagram (Meta)", group: "Social", kind: "oauth", provides: ["social_publish", "meta_ads"], inEagleBed: true,
    oauth: { authorizeUrl: "https://www.facebook.com/v21.0/dialog/oauth", tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token", scopes: ["pages_show_list", "pages_manage_posts", "pages_read_engagement", "instagram_basic", "instagram_content_publish", "ads_read"], envPrefix: "META" },
    what: "Post to your Facebook Page and Instagram business account; read Meta Ads results.",
    pasteToken: "Or paste a long-lived Page access token (Meta Graph API Explorer → your Page → generate, then extend it).",
  },
  {
    id: "publer", name: "Publer (TikTok, YouTube, Google posts)", group: "Social", kind: "key", provides: ["social_publish"], inEagleBed: true,
    what: "Eagle Bed schedules TikTok, YouTube Shorts and Google profile posts through Publer. Paste a Publer API key, or connect it through Zapier.",
  },
  {
    id: "tiktok", name: "TikTok", group: "Social", kind: "oauth", provides: ["social_publish"], inEagleBed: true,
    oauth: { authorizeUrl: "https://www.tiktok.com/v2/auth/authorize/", tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/", scopes: ["user.info.basic", "video.publish"], envPrefix: "TIKTOK" },
    what: "Publish videos directly (needs TikTok's Content Posting API approval for your app).",
  },
  {
    id: "youtube", name: "YouTube", group: "Social", kind: "oauth", provides: ["social_publish"], inEagleBed: true,
    oauth: { authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth", tokenUrl: "https://oauth2.googleapis.com/token", scopes: ["https://www.googleapis.com/auth/youtube.upload"], envPrefix: "GOOGLE" },
    what: "Upload Shorts and videos.",
  },
  {
    id: "pinterest", name: "Pinterest", group: "Social", kind: "oauth", provides: ["social_publish"], inEagleBed: false,
    oauth: { authorizeUrl: "https://www.pinterest.com/oauth/", tokenUrl: "https://api.pinterest.com/v5/oauth/token", scopes: ["boards:read", "pins:write"], envPrefix: "PINTEREST" },
    what: "Pins and boards.",
  },
  {
    id: "omnisend", name: "Email & SMS (Omnisend / Klaviyo / Mailchimp)", group: "Email & customers", kind: "key", provides: ["email_sms"], inEagleBed: true,
    what: "Abandoned-basket flows, campaigns and review requests.",
  },
  {
    id: "canva", name: "Canva", group: "Creative", kind: "mcp", provides: ["design"], inEagleBed: true,
    mcpUrl: "https://mcp.canva.com/mcp",
    what: "Designs, brand templates, resizing and exports for posts and ads.",
  },
  {
    id: "higgsfield", name: "Higgsfield (AI video)", group: "Creative", kind: "key", provides: ["video_ai", "image_ai"], inEagleBed: true,
    what: "30 video models (Kling, Seedance, Wan, Hailuo, LTX, PixVerse) and 8 image models, up to 4K.",
  },
  {
    id: "gemini", name: "Google Gemini image (Nano Banana)", group: "Creative", kind: "key", provides: ["image_ai"], inEagleBed: true,
    what: "Product photos and colour variants that match the real product.",
  },
  {
    id: "zapier", name: "Zapier", group: "Automation & data", kind: "mcp", provides: ["automation", "social_publish", "email_sms"], inEagleBed: true,
    mcpUrl: "https://mcp.zapier.com/api/mcp/mcp",
    what: "Reach 9,000+ apps (Publer, Sheets, Slack, WhatsApp…) when there is no direct connection.",
  },
  {
    id: "supermetrics", name: "Supermetrics", group: "Automation & data", kind: "mcp", provides: ["marketing_data", "google_ads", "meta_ads", "web_analytics", "search_console"], inEagleBed: true,
    mcpUrl: "https://mcp.supermetrics.com/mcp",
    what: "One login for Google Ads, Meta Ads, GA4 and Search Console data (paid plan).",
  },
];

export function connectionById(id: string) {
  return CONNECTIONS.find((c) => c.id === id);
}
