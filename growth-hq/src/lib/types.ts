import type { Category } from "@/catalog/categories";

export interface BusinessBrief {
  name: string;
  domain: string;
  category: Category;
  /** e.g. "beds", "plumbing jobs", "cakes" (plural) and "bed" (singular). */
  products: string;
  product: string;
  city: string;
  country: string;
  language: string;
  currency: string;
  timezone: string;
  phone?: string;
  hours?: string;
  delivery?: string;
  returns?: string;
  warranty?: string;
  payments?: string;
  /** Facts the agents may state. One per line. */
  facts: string;
  /** Claims the agents must never make. One per line. */
  never: string;
  adCapPerDay: number;
  postSlots: string[];
  competitors?: string;
  goals?: string;
}

export type ConnStatus = "connected" | "error" | "missing";

export interface StoredConnection {
  status: ConnStatus;
  /** AES-GCM encrypted token / key. Never sent to the browser. */
  secret?: string;
  /** Extra non-secret settings: shop domain, account id, MCP URL override… */
  meta?: Record<string, string>;
  checkedAt?: string;
  note?: string;
}

export type ProposalStatus = "pending" | "approved" | "applied" | "rejected" | "undone" | "failed";

export interface Proposal {
  id: string;
  createdAt: string;
  agent: string;
  runId: string;
  priority: "P0" | "P1" | "P2" | "P3" | "P4";
  title: string;
  target: string; // what is changed: a URL, product handle, campaign…
  system: string; // connection id that will apply it
  before: string;
  after: string;
  why: string;
  kpi: string;
  status: ProposalStatus;
  result?: string;
}

export interface Report {
  id: string;
  createdAt: string;
  runId: string;
  agent: string;
  title: string;
  body: string; // markdown
}

export interface RunLog {
  t: string;
  kind: "text" | "tool" | "error" | "done";
  agent?: string;
  text: string;
}

export interface Run {
  id: string;
  createdAt: string;
  finishedAt?: string;
  actionId?: string;
  title: string;
  status: "running" | "done" | "failed";
  log: RunLog[];
  usage?: { input: number; output: number };
  trigger: "button" | "chat" | "autopilot";
}

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text: string;
  t: string;
  runId?: string;
}

export interface Billing {
  status: "none" | "active" | "trialing" | "past_due" | "canceled";
  plan?: "monthly" | "yearly";
  customerId?: string;
  subscriptionId?: string;
  currentPeriodEnd?: string;
}

export interface Workspace {
  id: string;
  billing?: Billing;
  createdAt: string;
  brief: BusinessBrief | null;
  connections: Record<string, StoredConnection>;
  agentsOff: string[];
  autopilot: "running" | "paused" | "closed";
  autopilotActions: string[];
  lastAutopilot?: string;
  memory: { facts: { t: string; text: string }[]; lessons: { t: string; agent: string; text: string }[] };
  board: Proposal[];
  reports: Report[];
  runs: Run[];
  chat: ChatMsg[];
}

export interface User {
  id: string;
  email: string;
  pass: string; // scrypt hash
  workspaceId: string;
  createdAt: string;
}
