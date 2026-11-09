// Compiles the app catalogue (TypeScript) to plain JSON for the demo page.
const ts = require("typescript"), fs = require("fs"), path = require("path"), Module = require("module");
const root = path.join(__dirname, "../src/catalog");
const load = (name, cache = {}) => {
  if (cache[name]) return cache[name].exports;
  const src = fs.readFileSync(path.join(root, name + ".ts"), "utf8");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const m = new Module(name); cache[name] = m;
  m.require = (p) => load(p.replace(/^\.\//, ""), cache);
  m._compile(js, path.join(root, name + ".js"));
  return m.exports;
};
const { AGENTS, MANAGER, DEPARTMENTS } = load("agents");
const { ACTIONS, ACTION_GROUPS } = load("actions");
const { CONNECTIONS } = load("connections");
const { CATEGORIES } = load("categories");
const out = {
  agents: [MANAGER, ...AGENTS].map(({ id, name, dept, color, role, only }) => ({ id, name, dept, color, role, only })),
  departments: DEPARTMENTS,
  actions: ACTIONS.map(({ id, title, group, agents, prompt, proposes, every, origin, focus, needs }) => ({ id, title, group, agents, prompt, proposes: !!proposes, every, origin, focus, needs })),
  groups: ACTION_GROUPS,
  connections: CONNECTIONS.map(({ id, name, group, kind, what, inEagleBed, required, provides, pasteToken }) => ({ id, name, group, kind, what, inEagleBed, required: !!required, provides, pasteToken })),
  categories: CATEGORIES,
};
process.stdout.write(JSON.stringify(out));
