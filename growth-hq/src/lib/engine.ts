// The engine: turns a button press (or a chat message, or the daily autopilot) into a Claude run
// with the customer's own API key, their connected services and the team's rules.
import Anthropic from "@anthropic-ai/sdk";
import { actionById } from "@/catalog/actions";
import { agentById, agentsFor, AGENTS, MANAGER, DEPARTMENTS } from "@/catalog/agents";
import { CORE_RULES, CEO_PLAYBOOK } from "@/catalog/rules";
import { CONNECTIONS } from "@/catalog/connections";
import playbooks from "@/catalog/playbooks.json";
import { briefText, fill, memoryText } from "./brief";
import { capabilities, isConnected, mcpServers, secretOf } from "./connections";
import { applyToolsFor, runTool, toolsFor } from "./tools";
import { newId } from "./crypto";
import { access } from "./billing";
import { getWorkspace, updateWorkspace } from "./store";
import type { Proposal, Run, RunLog, Workspace } from "./types";

export const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";
const BETAS = ["mcp-client-2025-11-20", "server-side-fallback-2026-07-01"];

type Effort = "low" | "medium" | "high" | "xhigh" | "max";

function clientFor(ws: Workspace): Anthropic {
  const key = secretOf(ws, "anthropic");
  if (!key) throw new Error("Connect your Claude API key first (Connections → Claude).");
  return new Anthropic({ apiKey: key, maxRetries: 3 });
}

const SEO_RULES = playbooks.seoSkillRules as Record<string, string>;
const ECC_RULES = playbooks.eccRules as Record<string, string>;
const AGENCY = playbooks.agencyPlaybooks as Record<string, string[]>;
const AGENT_ECC = playbooks.agentEcc as Record<string, string[]>;
const AGENT_SEO = playbooks.agentSeoSkills as Record<string, string[]>;

/** Playbooks for the agents taking part (kept short: only the involved agents). */
function playbooksFor(ids: string[], ws: Workspace): string {
  const out: string[] = [];
  for (const id of ids) {
    const a = agentById(id);
    if (!a) continue;
    const bits: string[] = [`@${a.id} — ${a.name} (${a.dept}): ${a.role}`];
    for (const s of AGENT_SEO[id] || []) if (SEO_RULES[s]) bits.push("  · " + SEO_RULES[s]);
    for (const s of AGENT_ECC[id] || []) if (ECC_RULES[s]) bits.push("  · " + ECC_RULES[s]);
    if (AGENCY[id]) bits.push("  · " + AGENCY[id].join(" "));
    out.push(bits.join("\n"));
  }
  return fill(out.join("\n\n"), ws.brief);
}

function systemPrompt(ws: Workspace, agentIds: string[]): Anthropic.Beta.Messages.BetaTextBlockParam[] {
  const caps = capabilities(ws);
  const roster = agentsFor(ws.brief?.category || "other")
    .filter((a) => !ws.agentsOff.includes(a.id))
    .map((a) => `@${a.id} ${a.name} [${a.dept}]`)
    .join(", ");
  const conns = CONNECTIONS.filter((c) => c.id !== "anthropic")
    .map((c) => `${c.name}: ${isConnected(ws, c.id) ? "CONNECTED" : "not connected"}`)
    .join("; ");
  // Stable part first (cached), workspace-specific part after.
  const stable = [
    `You are the AI growth team for a small business, working inside the Growth HQ app. The Manager (CEO) leads ${AGENTS.length} specialist agents in ${DEPARTMENTS.length} departments. You play the Manager and every agent named in the task: plan, do the work with the tools, check it like QA, then report.`,
    CORE_RULES,
    "CEO PLAYBOOK:\n" + CEO_PLAYBOOK.map((x) => "- " + x).join("\n"),
    `HOW TO WORK: Use connected tools for real data. If a capability is not connected, say DATA NOT AVAILABLE — connect <service> and continue with what you can verify. Put every change on the Board with propose_change (never apply anything yourself). Finish every task with save_report (a clear report: summary first, then findings with evidence, then the Board items you proposed), and save_lesson once. Write for a busy owner: short sentences, plain words, numbers with sources.`,
  ].join("\n\n");
  const dynamic = [
    briefText(ws),
    memoryText(ws),
    `CONNECTIONS: ${conns}\nCapabilities available: ${[...caps].join(", ") || "none yet"}.`,
    `TEAM ON DUTY: ${roster}`,
    "AGENTS ON THIS TASK AND THEIR PLAYBOOKS:\n" + playbooksFor(agentIds, ws),
    `Today is ${new Date().toISOString().slice(0, 10)}.`,
  ].filter(Boolean).join("\n\n");
  return [
    { type: "text", text: stable, cache_control: { type: "ephemeral" } },
    { type: "text", text: dynamic },
  ];
}

export interface StartOpts {
  actionId?: string;
  focus?: string;
  weeks?: string;
  chat?: string;
  trigger: Run["trigger"];
  /** Free-text order (chat "Send as an order"). */
  order?: string;
}

/** Start a run in the background; returns its id immediately. */
export async function startRun(wsId: string, o: StartOpts): Promise<string> {
  const ws = await getWorkspace(wsId);
  if (!ws) throw new Error("Workspace missing");
  const acc = access(ws);
  if (!acc.ok) throw new Error(acc.why);
  clientFor(ws); // fail fast without a key
  const action = o.actionId ? actionById(o.actionId) : undefined;
  if (o.actionId && !action) throw new Error("Unknown action");
  const title = action?.title || (o.chat ? "Chat with the Manager" : o.order ? "Order: " + o.order.slice(0, 60) : "Task");
  const run: Run = { id: newId("run"), createdAt: new Date().toISOString(), actionId: o.actionId, title, status: "running", log: [], trigger: o.trigger };
  await updateWorkspace(wsId, (w) => void w.runs.push(run));
  void execute(wsId, run.id, o).catch(async (e) => {
    await finish(wsId, run.id, "failed", { t: now(), kind: "error", text: errText(e) });
  });
  return run.id;
}

const now = () => new Date().toISOString();

function errText(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return "Your Claude API key was rejected. Check it in Connections → Claude.";
  if (e instanceof Anthropic.RateLimitError) return "Claude usage limit reached for your API key. The run will work again once your limit resets.";
  if (e instanceof Anthropic.APIError) return `Claude API error ${e.status ?? ""}: ${e.message}`;
  return e instanceof Error ? e.message : String(e);
}

async function finish(wsId: string, runId: string, status: Run["status"], last?: RunLog, usage?: Run["usage"]) {
  await updateWorkspace(wsId, (w) => {
    const r = w.runs.find((x) => x.id === runId);
    if (!r) return;
    if (last) r.log.push(last);
    r.status = status;
    r.finishedAt = now();
    if (usage) r.usage = usage;
  });
}

async function execute(wsId: string, runId: string, o: StartOpts) {
  const ws = (await getWorkspace(wsId))!;
  const client = clientFor(ws);
  const action = o.actionId ? actionById(o.actionId) : undefined;
  const agentIds = action ? action.agents : ["manager", "qa"];
  let effort: Effort = action ? "high" : "medium";

  let task: string;
  if (action) {
    task = fill(action.prompt, ws.brief, {
      ...(o.focus ? { focus: o.focus } : {}),
      ...(o.weeks ? { weeks: o.weeks } : {}),
    });
    if (o.focus && !action.prompt.includes("{{focus}}")) task += `\n\nOwner's note: ${o.focus}`;
    const missing = action.needs.filter((n) => !capabilities(ws).has(n));
    if (missing.length) task += `\n\nNot connected for this task: ${missing.join(", ")}. Work with what is available and say what the owner should connect.`;
  } else if (o.order) {
    task = `ORDER FROM THE OWNER: ${o.order}\nAs Manager, choose the right agents, do the work, propose changes on the Board and save a report.`;
    effort = "high";
  } else {
    // Chat: include the last messages for context.
    const hist = ws.chat.slice(-12).map((m) => `${m.role === "user" ? "Owner" : "Manager"}: ${m.text}`).join("\n");
    task = `${hist}\n\nReply to the owner's last message as the Manager. Be brief and practical. If they tell you a business fact, save it with remember_fact. If the request needs real work, do it with the tools (proposals go to the Board).`;
  }

  const messages: Anthropic.Beta.Messages.BetaMessageParam[] = [{ role: "user", content: task }];
  const servers = mcpServers(ws);
  const tools: Anthropic.Beta.Messages.BetaToolUnion[] = [
    ...toolsFor(ws),
    ...servers.map((s) => ({ type: "mcp_toolset" as const, mcp_server_name: s.name })),
  ];
  const system = systemPrompt(ws, agentIds);

  // Batch log writes so the UI can poll without hammering the disk.
  let pending: RunLog[] = [];
  let textBuf = "";
  const flush = async () => {
    if (textBuf) { pending.push({ t: now(), kind: "text", text: textBuf }); textBuf = ""; }
    if (!pending.length) return;
    const batch = pending; pending = [];
    await updateWorkspace(wsId, (w) => void w.runs.find((r) => r.id === runId)?.log.push(...batch));
  };
  const timer = setInterval(() => void flush(), 1200);
  const usage = { input: 0, output: 0 };
  let finalText = "";
  let jsonRetries = 0;

  try {
    for (let turn = 0; turn < 40; turn++) {
      const stream = client.beta.messages.stream({
        model: MODEL,
        max_tokens: 64000,
        betas: BETAS,
        fallbacks: "default",
        thinking: { type: "adaptive" },
        output_config: { effort },
        system,
        tools,
        ...(servers.length ? { mcp_servers: servers } : {}),
        messages,
      });
      stream.on("text", (d) => { textBuf += d; finalText += d; });

      let msg: Anthropic.Beta.Messages.BetaMessage;
      try {
        msg = await stream.finalMessage();
        jsonRetries = 0;
      } catch (err) {
        if (err instanceof Anthropic.APIError || jsonRetries++ >= 2) throw err;
        continue; // unparseable streamed tool input: re-issue the turn
      }
      usage.input += msg.usage.input_tokens + (msg.usage.cache_read_input_tokens || 0);
      usage.output += msg.usage.output_tokens;

      for (const b of msg.content) {
        if (b.type === "mcp_tool_use") pending.push({ t: now(), kind: "tool", text: `${b.server_name}: ${b.name}` });
        if (b.type === "server_tool_use") pending.push({ t: now(), kind: "tool", text: `${b.name}` });
      }

      if (msg.stop_reason === "refusal") {
        pending.push({ t: now(), kind: "error", text: "Claude declined part of this task. Rephrase the request or ask the Manager in Chat." });
        break;
      }
      if (msg.stop_reason === "pause_turn") { messages.push({ role: "assistant", content: msg.content }); continue; }
      if (msg.stop_reason === "max_tokens" && msg.content.some((b) => b.type === "tool_use")) {
        pending.push({ t: now(), kind: "error", text: "The answer got too long; stopped safely. Try a narrower focus." });
        break;
      }
      const uses = msg.content.filter((b): b is Anthropic.Beta.Messages.BetaToolUseBlock => b.type === "tool_use");
      if (msg.stop_reason !== "tool_use" || !uses.length) break;

      messages.push({ role: "assistant", content: msg.content });
      const results = await Promise.all(
        uses.map(async (u): Promise<Anthropic.Beta.Messages.BetaToolResultBlockParam> => {
          pending.push({ t: now(), kind: "tool", text: u.name });
          try {
            const out = await runTool(u.name, (u.input || {}) as Record<string, unknown>, { ws, runId, onBoard: (p: Proposal) => pending.push({ t: now(), kind: "tool", text: `Board ← ${p.title}` }) });
            return { type: "tool_result", tool_use_id: u.id, content: out };
          } catch (e) {
            return { type: "tool_result", tool_use_id: u.id, content: errText(e), is_error: true };
          }
        }),
      );
      messages.push({ role: "user", content: results });
    }
  } finally {
    clearInterval(timer);
    await flush();
  }

  if (o.chat !== undefined) {
    await updateWorkspace(wsId, (w) => void w.chat.push({ id: newId("msg"), role: "assistant", text: finalText.trim() || "Done — see Reports and the Board.", t: now(), runId }));
  }
  await finish(wsId, runId, "done", { t: now(), kind: "done", text: "Finished." }, usage);
}

/** Apply (or undo) an approved Board item: Claude makes exactly that change through the connected service. */
export async function applyProposal(wsId: string, id: string, mode: "apply" | "undo"): Promise<string> {
  const ws = await getWorkspace(wsId);
  const p = ws?.board.find((x) => x.id === id);
  if (!ws || !p) throw new Error("Board item not found");
  const from = mode === "apply" ? p.before : p.after;
  const to = mode === "apply" ? p.after : p.before;
  const order = `The owner APPROVED this exact change. ${mode === "undo" ? "This is an UNDO." : ""}
System: ${p.system}
Target: ${p.target}
Expected current value:\n${from}\n
New value:\n${to}\n
Steps: 1) Read the current value with the ${p.system} tools. 2) If it clearly differs from the expected current value, change nothing and report CONFLICT. 3) Otherwise make exactly this change and nothing else. Never publish a theme, never change a price or a budget unless that is exactly this change. 4) Reply with one line starting APPLIED or CONFLICT or FAILED, then the evidence.`;
  const client = clientFor(ws);
  const servers = mcpServers(ws).filter((x) => x.name === p.system);
  const direct = applyToolsFor(ws, p.system);
  if (!servers.length && !direct.length) {
    await setStatus(wsId, id, "failed", `${p.system} is not connected in a way the team can write to, so it can't be applied automatically. Apply it by hand, then press "I applied it myself".`);
    return "failed";
  }
  const messages: Anthropic.Beta.Messages.BetaMessageParam[] = [{ role: "user", content: order }];
  let text = "";
  for (let turn = 0; turn < 12; turn++) {
    const msg = await client.beta.messages.stream({
      model: MODEL, max_tokens: 16000, betas: BETAS, fallbacks: "default",
      thinking: { type: "adaptive" }, output_config: { effort: "medium" },
      system: [{ type: "text", text: CORE_RULES.replace(/7\. APPROVAL POLICY[^\n]*\n/, "") + "\n\nYou are applying one owner-approved change. Be exact." }],
      ...(servers.length ? { mcp_servers: servers } : {}),
      tools: [...direct, ...servers.map((x) => ({ type: "mcp_toolset" as const, mcp_server_name: x.name }))],
      messages,
    }).finalMessage();
    text = msg.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("\n").trim() || text;
    if (msg.stop_reason === "pause_turn") { messages.push({ role: "assistant", content: msg.content }); continue; }
    const uses = msg.content.filter((b): b is Anthropic.Beta.Messages.BetaToolUseBlock => b.type === "tool_use");
    if (msg.stop_reason !== "tool_use" || !uses.length) break;
    messages.push({ role: "assistant", content: msg.content });
    const results = await Promise.all(uses.map(async (u): Promise<Anthropic.Beta.Messages.BetaToolResultBlockParam> => {
      try {
        return { type: "tool_result", tool_use_id: u.id, content: await runTool(u.name, (u.input || {}) as Record<string, unknown>, { ws, runId: "apply", onBoard: () => undefined, allowWrites: true }) };
      } catch (e) {
        return { type: "tool_result", tool_use_id: u.id, content: errText(e), is_error: true };
      }
    }));
    messages.push({ role: "user", content: results });
  }
  const status = /^APPLIED/m.test(text) ? (mode === "apply" ? "applied" : "undone") : "failed";
  await setStatus(wsId, id, status, text.slice(0, 2000));
  return status;
}

async function setStatus(wsId: string, id: string, status: Proposal["status"], result: string) {
  await updateWorkspace(wsId, (w) => {
    const p = w.board.find((x) => x.id === id);
    if (p) { p.status = status; p.result = result; }
  });
}

export { MANAGER };
