# Project Rocket Sales, Stage 1: common rules for every audit agent (19 Nov 2026)

Business: Eagle Bed, family-run maker of handmade upholstered beds, Dewsbury. Store www.eaglebed.co.uk (Shopify 0whctf-mu), GBP, UK only.
Facts file: /home/user/eagle-bed/ops/BRIEF.md. History: ops/HQ-OVERVIEW.md, ops/CHANGELOG.md, ops/ceo/AUDIT-2026-11-19.md, ops/ceo/ROADMAP-2026-11-19.md, docs/01-showroom-blueprint.md.
HQ artifact (database): https://claude.ai/artifact/H8ECqvxQbUQSABuMUK1iki (read with the ArtifactData tool; collections include leads, outreach, inbox, usage, seo, aivis, settings, runs, memory, worklog).

STAGE 1 IS READ-ONLY. Do NOT: edit Shopify (no mutations), change prices/ads/budgets, send or draft emails, post to social, change orders, enable automations, write to the HQ database, or push to git. Reading is allowed. Write your report only to the file named in your task (in /home/user/eagle-bed/ops/rocket/stage1/). The Manager commits.

Tools: load with ToolSearch, e.g. "select:mcp__Shopify__run-analytics-query,mcp__Shopify__graphql_query". Shopify GraphQL rejects deprecated fields (use defaultEmailAddress etc.). ShopifyQL via run-analytics-query.

OpenRush credits: 2,001/month, 31 used so far, 400 reserve never touched. Only spend what your task allows; list every OpenRush call and its cost at the end of your report. Costs: get_search_performance 3, get_ad_campaigns/get_ad_performance 3, inspect_serp 3, research_keywords 4, inspect_page 4, audit_site 9, discover_competitors 9. Prefer cached/previous data already in HQ (seo/gsc-latest) or repo files.

Evidence labels on every finding: VERIFIED (you pulled it now, say from where), HISTORICAL (from files/screenshot), ESTIMATE (show the maths and assumptions), UNKNOWN (not available, say why). If two sources disagree, show both and explain. Never invent numbers, competitor prices or claims. Product costs are not known: profit = UNKNOWN.
Customer privacy: no customer names, emails or phone numbers in your report (order numbers are fine).
Plain English, short sentences. End with: "Limitations" and "Credits used".
