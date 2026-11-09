// Simple file store so the app runs with zero infrastructure. One JSON file per workspace.
// For production, swap this module for Postgres (same function signatures).
import { promises as fs } from "node:fs";
import path from "node:path";
import type { User, Workspace } from "./types";
import { newId } from "./crypto";

const DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const locks = new Map<string, Promise<unknown>>();

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DIR, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(DIR, { recursive: true });
  const p = path.join(DIR, file);
  await fs.writeFile(p + ".tmp", JSON.stringify(data, null, 1));
  await fs.rename(p + ".tmp", p);
}

/** Serialise writes per file so concurrent agent runs don't overwrite each other. */
function locked<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(file) || Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(file, next.catch(() => undefined));
  return next;
}

export async function listUsers(): Promise<User[]> {
  return readJson<User[]>("users.json", []);
}

export async function addUser(u: User) {
  return locked("users.json", async () => {
    const all = await listUsers();
    if (all.some((x) => x.email === u.email)) throw new Error("That email already has an account.");
    all.push(u);
    await writeJson("users.json", all);
  });
}

export function emptyWorkspace(): Workspace {
  return {
    id: newId("ws"),
    createdAt: new Date().toISOString(),
    brief: null,
    connections: {},
    agentsOff: [],
    autopilot: "running",
    autopilotActions: ["daily-autopilot"],
    memory: { facts: [], lessons: [] },
    board: [],
    reports: [],
    runs: [],
    chat: [],
  };
}

const wsFile = (id: string) => `ws-${id.replace(/[^a-z0-9_]/gi, "")}.json`;

export async function getWorkspace(id: string): Promise<Workspace | null> {
  return readJson<Workspace | null>(wsFile(id), null);
}

export async function saveWorkspace(ws: Workspace) {
  await writeJson(wsFile(ws.id), ws);
}

/** Read-modify-write a workspace safely. */
export function updateWorkspace<T>(id: string, fn: (ws: Workspace) => T | Promise<T>): Promise<T> {
  return locked(wsFile(id), async () => {
    const ws = await getWorkspace(id);
    if (!ws) throw new Error("Workspace not found");
    const out = await fn(ws);
    // keep files small: last 200 runs, 500 reports
    ws.runs = ws.runs.slice(-200);
    ws.reports = ws.reports.slice(-500);
    await saveWorkspace(ws);
    return out;
  });
}

export async function listWorkspaceIds(): Promise<string[]> {
  try {
    return (await fs.readdir(DIR)).filter((f) => f.startsWith("ws-")).map((f) => f.slice(3, -5));
  } catch {
    return [];
  }
}
