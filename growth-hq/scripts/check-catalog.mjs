// Proves the app covers everything in Eagle Bed HQ: every agent, SEO command, order chip,
// ECC job and funnel stage must map to something in the app catalogue.
import { readFileSync } from "node:fs";
const src = JSON.parse(readFileSync(new URL("../catalog/eaglebed-hq-source.json", import.meta.url)));
const agentsTs = readFileSync(new URL("../src/catalog/agents.ts", import.meta.url), "utf8");
const actionsTs = readFileSync(new URL("../src/catalog/actions.ts", import.meta.url), "utf8");
const ids = new Set([...agentsTs.matchAll(/id: "([a-z]+)"/g)].map((m) => m[1]));
const titles = [...actionsTs.matchAll(/title: "([^"]+)"/g)].map((m) => m[1].toLowerCase());
let bad = 0;
const miss = (what, x) => { bad++; console.log("MISSING", what, x); };
for (const a of src.AGENTS) if (!ids.has(a.id)) miss("agent", a.id);
// Map each HQ button to the app action that covers it.
const COVER = {
  "Full SEO audit": "full seo audit", "E-commerce SEO": "e-commerce seo", "Schema check": "schema check", "AI search (GEO)": "ai search (geo)",
  "AI agent readiness": "ai agent readiness", "Technical SEO": "technical seo", "Local SEO": "local seo", "Content & E-E-A-T": "content & e-e-a-t",
  "Search experience": "search experience", "Topic clusters": "topic clusters", "Images & speed": "images & speed", "Backlinks": "backlinks",
  "Drift check": "drift check", "90-day SEO plan": "90-day seo plan",
  "Brand voice profile": "write our brand voice profile", "Plan the workshop week": "plan the production week & reorders", "Delivery & returns check": "why do orders come back?",
  "UK market map": "market map", "Council: big decision": "decision council: a big decision", "Site health check": "check the live site is healthy",
  "Black Friday & Christmas": "get black friday & christmas ready", "Profit per bed": "which products make real profit?", "Aftercare pack": "write the aftercare pack", "Campaign in one go": "campaign in one go",
};
for (const [t] of src.SEO_CMDS) if (!titles.includes(COVER[t] || "")) miss("SEO command", t);
for (const [t] of src.ECC_CMDS) if (!titles.includes(COVER[t] || "")) miss("ECC job", t);
const CHIP = [
  "plan this week's ai films & images", "weekly ceo review", "get black friday & christmas ready", "which products make real profit?", "write the aftercare pack",
  "plan the production week & reorders", "why do orders come back?", "decision council: a big decision", "write our brand voice profile", "check the live site is healthy",
  "fix tracking", "cut google ads waste", "walk the store as 3 real buyers", "grow tiktok, pinterest and reddit reach", "study top sites, pick 3 features",
  "full seo audit", "find new products or services", "30-day growth sprint", "get found in chatgpt, gemini and copilot", "run the full master audit",
  "why are visitors not buying? fix it", "find profitable keywords", "get a category onto page 1", "show up in google ai overviews", "find the top 20 competitor gaps",
];
src.CHIPS.forEach((c, i) => { if (!titles.includes(CHIP[i])) miss("order chip", c); });
for (const st of src.STAGES) if (!titles.some((t) => t.startsWith("fix: " + st.name.toLowerCase().split(" → ")[0]))) miss("funnel stage", st.name);
console.log(`HQ agents ${src.AGENTS.length} → app agents ${ids.size - 1} (+Manager). Actions in app: ${titles.length}.`);
console.log(bad ? `${bad} gaps found` : "Everything in Eagle Bed HQ is covered.");
process.exit(bad ? 1 : 0);
