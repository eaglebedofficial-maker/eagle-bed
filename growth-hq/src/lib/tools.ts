// Tools the app gives Claude, on top of the customer's MCP servers and web search.
// Write actions never touch live systems here: they land on the approval Board.
import type Anthropic from "@anthropic-ai/sdk";
import type { Proposal, Workspace } from "./types";
import { newId } from "./crypto";
import { updateWorkspace } from "./store";
import { isConnected, oauthToken } from "./connections";

type Tool = Anthropic.Beta.Messages.BetaTool;

const str = { type: "string" } as const;

const T = (name: string, description: string, properties: Record<string, unknown>, required: string[]): Tool => ({
  name,
  description,
  input_schema: { type: "object", properties, required, additionalProperties: false },
  eager_input_streaming: true,
});

const BOARD_TOOLS: Tool[] = [
  T("propose_change", "Put one change on the owner's approval Board. Use this for EVERY change to anything live (SEO fields, product text, new drafts, posts, ads, website code). Include the current value so it can be undone.", {
    agent: { ...str, description: "Your agent id, e.g. onpage" },
    priority: { type: "string", enum: ["P0", "P1", "P2", "P3", "P4"] },
    title: { ...str, description: "Short, plain title of the change" },
    target: { ...str, description: "Exactly what changes: URL, product handle, campaign name, post date…" },
    system: { ...str, description: "Connection that applies it, e.g. shopify, meta, google_ads, github, gbp" },
    before: { ...str, description: "Current value (or 'new')" },
    after: { ...str, description: "Proposed value, complete and ready to apply" },
    why: { ...str, description: "Evidence with source and date" },
    kpi: { ...str, description: "The one KPI it moves and the review date" },
  }, ["agent", "priority", "title", "target", "system", "before", "after", "why", "kpi"]),
  T("save_report", "Save a finished report for the owner's Reports tab (markdown).", { agent: str, title: str, body: str }, ["agent", "title", "body"]),
  T("remember_fact", "Save an important business fact the owner told you or a baseline you measured, so every agent knows it next time.", { text: str }, ["text"]),
  T("save_lesson", "After finishing, save one lesson that will make the named agent better next time.", { agent: str, text: str }, ["agent", "text"]),
];

const GOOGLE_TOOLS: Record<string, Tool> = {
  search_console: T("search_console_query", "Google Search Console search analytics: clicks, impressions, CTR and position.", {
    siteUrl: { ...str, description: "e.g. sc-domain:example.com" }, startDate: str, endDate: str,
    dimensions: { type: "array", items: { type: "string", enum: ["query", "page", "date", "device", "country"] } },
    rowLimit: { type: "integer" },
  }, ["siteUrl", "startDate", "endDate", "dimensions"]),
  ga4: T("ga4_report", "Google Analytics 4 report (Data API runReport).", {
    propertyId: str, startDate: str, endDate: str,
    dimensions: { type: "array", items: str }, metrics: { type: "array", items: str }, limit: { type: "integer" },
  }, ["propertyId", "startDate", "endDate", "metrics"]),
  google_ads: T("google_ads_query", "Read Google Ads with a GAQL query (read-only). Never changes anything.", {
    customerId: { ...str, description: "10 digits, no dashes" }, query: str,
  }, ["customerId", "query"]),
  meta: T("meta_graph_get", "Read from the Meta Graph API (pages, Instagram media and insights, ad insights). GET only.", {
    path: { ...str, description: "e.g. me/accounts or <ig-user-id>/media" }, fields: str,
  }, ["path"]),
};

export function toolsFor(ws: Workspace): Anthropic.Beta.Messages.BetaToolUnion[] {
  const tools: Anthropic.Beta.Messages.BetaToolUnion[] = [...BOARD_TOOLS];
  for (const [conn, tool] of Object.entries(GOOGLE_TOOLS)) if (isConnected(ws, conn)) tools.push(tool);
  tools.push({ type: "web_search_20260209", name: "web_search", max_uses: 8 });
  tools.push({ type: "web_fetch_20260209", name: "web_fetch", max_uses: 8 });
  return tools;
}

function need(input: Record<string, unknown>, keys: string[]) {
  for (const k of keys) if (input[k] === undefined || input[k] === null || input[k] === "") throw new Error(`Missing field: ${k}`);
}

export interface ToolCtx {
  ws: Workspace;
  runId: string;
  onBoard: (p: Proposal) => void;
}

/** Run one custom tool. Returns text for the tool_result. Throws → is_error result. */
export async function runTool(name: string, input: Record<string, unknown>, ctx: ToolCtx): Promise<string> {
  const def = BOARD_TOOLS.find((t) => t.name === name) || Object.values(GOOGLE_TOOLS).find((t) => t.name === name);
  if (!def) throw new Error(`Unknown tool ${name}`);
  need(input, (def.input_schema.required as string[]) || []);
  const s = (k: string) => String(input[k] ?? "");
  const wsId = ctx.ws.id;

  switch (name) {
    case "propose_change": {
      const p: Proposal = {
        id: newId("chg"), createdAt: new Date().toISOString(), agent: s("agent") || "team", runId: ctx.runId,
        priority: s("priority") as Proposal["priority"], title: s("title"), target: s("target"), system: s("system"),
        before: s("before"), after: s("after"), why: s("why"), kpi: s("kpi"), status: "pending",
      };
      await updateWorkspace(wsId, (w) => void w.board.push(p));
      ctx.onBoard(p);
      return `On the Board for owner approval as ${p.id}. Do not apply it yourself.`;
    }
    case "save_report": {
      await updateWorkspace(wsId, (w) => void w.reports.push({ id: newId("rep"), createdAt: new Date().toISOString(), runId: ctx.runId, agent: s("agent"), title: s("title"), body: s("body") }));
      return "Report saved.";
    }
    case "remember_fact": {
      await updateWorkspace(wsId, (w) => void w.memory.facts.push({ t: new Date().toISOString(), text: s("text") }));
      return "Remembered.";
    }
    case "save_lesson": {
      await updateWorkspace(wsId, (w) => void w.memory.lessons.push({ t: new Date().toISOString(), agent: s("agent"), text: s("text") }));
      return "Lesson saved.";
    }
    case "search_console_query": {
      const tok = await oauthToken(ctx.ws, "search_console");
      return api(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(s("siteUrl"))}/searchAnalytics/query`, tok, {
        startDate: s("startDate"), endDate: s("endDate"), dimensions: input.dimensions, rowLimit: Number(input.rowLimit || 250),
      });
    }
    case "ga4_report": {
      const tok = await oauthToken(ctx.ws, "ga4");
      const arr = (k: string) => ((input[k] as string[]) || []).map((n) => ({ name: n }));
      return api(`https://analyticsdata.googleapis.com/v1beta/properties/${s("propertyId")}:runReport`, tok, {
        dateRanges: [{ startDate: s("startDate"), endDate: s("endDate") }], dimensions: arr("dimensions"), metrics: arr("metrics"), limit: Number(input.limit || 250),
      });
    }
    case "google_ads_query": {
      const tok = await oauthToken(ctx.ws, "google_ads");
      const v = process.env.GOOGLE_ADS_API_VERSION || "v22";
      const extra: Record<string, string> = { "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "" };
      const login = ctx.ws.connections.google_ads?.meta?.loginCustomerId;
      if (login) extra["login-customer-id"] = login;
      return api(`https://googleads.googleapis.com/${v}/customers/${s("customerId").replace(/-/g, "")}/googleAds:search`, tok, { query: s("query") }, extra);
    }
    case "meta_graph_get": {
      const tok = await oauthToken(ctx.ws, "meta");
      const u = new URL(`https://graph.facebook.com/v21.0/${s("path").replace(/^\//, "")}`);
      if (input.fields) u.searchParams.set("fields", s("fields"));
      const r = await fetch(u, { headers: { authorization: `Bearer ${tok}` } });
      return clip(await r.text(), r.ok);
    }
  }
  throw new Error(`Tool ${name} has no handler`);
}

async function api(url: string, token: string, body: unknown, headers: Record<string, string> = {}) {
  const r = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
  return clip(await r.text(), r.ok);
}

function clip(text: string, ok: boolean) {
  if (!ok) throw new Error(text.slice(0, 1500));
  return text.length > 60_000 ? text.slice(0, 60_000) + "\n…(cut: ask for fewer rows)" : text;
}
