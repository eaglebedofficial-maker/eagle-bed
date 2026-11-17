// End-to-end smoke test: signs in to the demo workspace and opens every route, failing on
// JavaScript errors, error screens or API 5xx responses. Needs API (:8000, demo seeded) + web (:3000).
// Run: node e2e/smoke.mjs [baseUrl]
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:3000";
const ROUTES = ["/dashboard", "/market", "/research", "/opportunities", "/products", "/tracker", "/history", "/compare", "/keywords", "/reverse-asin",
  "/keyword-tracker", "/ranks", "/listing", "/competitors", "/reviews", "/market-tracker", "/suppliers", "/suppliers/compare", "/brands", "/distributors",
  "/invoices", "/rfq", "/profit", "/fba", "/vat", "/inventory", "/ppc", "/sales", "/reimbursements", "/saved/products", "/saved/suppliers", "/reports",
  "/alerts", "/assistant", "/settings"];

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const failures = [];
let route = "login";
page.on("pageerror", (e) => failures.push(`${route}: JS ${e.message}`));
page.on("response", (r) => { if (r.url().includes("/api/") && r.status() >= 500) failures.push(`${route}: HTTP ${r.status()} ${r.url()}`); });

await page.goto(`${BASE}/login`);
await page.getByRole("button", { name: /demo workspace/i }).click();
await page.waitForURL("**/dashboard");
// open the first product and supplier detail pages too
const prod = await page.evaluate(() => fetch("/api/products/query", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }).then((r) => r.json()));
const sup = await page.evaluate(() => fetch("/api/suppliers").then((r) => r.json()));
if (prod.items?.[0]) ROUTES.push(`/products/${prod.items[0].id}`, `/products/${prod.items[0].id}?tab=history`);
const firstSupplier = (sup.items || sup)?.[0];
if (firstSupplier) ROUTES.push(`/suppliers/${firstSupplier.id}`);

for (route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 120000 });
  const text = await page.evaluate(() => document.body.innerText.slice(0, 4000));
  if (/Application error|Unhandled Runtime Error|This page could not be found/i.test(text)) failures.push(`${route}: error screen`);
  if (!/Demo workspace/.test(text)) failures.push(`${route}: demo banner missing`);
  process.stdout.write(".");
}
await browser.close();
console.log(`\n${ROUTES.length} routes checked`);
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("All routes passed");
