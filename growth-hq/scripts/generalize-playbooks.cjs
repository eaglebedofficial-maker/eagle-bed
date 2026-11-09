// Turns Eagle Bed's playbooks into business-neutral ones. Placeholders are filled from the
// customer's business brief at run time: {{name}}, {{domain}}, {{city}}, {{product}}, {{products}}.
const fs = require("fs");
const src = require("../catalog/eaglebed-hq-source.json");
const R = [
  [/www\.eaglebed\.co\.uk|eaglebed\.co\.uk/gi, "{{domain}}"],
  [/Eagle Bed's/g, "{{name}}'s"], [/Eagle Bed/g, "{{name}}"],
  [/the Dewsbury workshop|our Dewsbury workshop/gi, "our workshop"], [/Dewsbury\/Kirklees\/West Yorkshire|Dewsbury, Yorkshire/g, "{{city}}"], [/Dewsbury/g, "{{city}}"],
  [/beds and mattresses|bed and mattress/g, "{{products}}"], [/bed buyers/g, "buyers"],
  [/\bbeds\b/g, "{{products}}"], [/\bBeds\b/g, "{{Products}}"], [/\ba bed\b/g, "a {{product}}"], [/\bbed\b/g, "{{product}}"],
  [/\(ottoman lifting, the finished headboard\)/g, "(the product in use, the finished result)"],
  [/UK makers of upholstered and ottoman \{\{products\}\} selling online/g, "businesses selling the same {{products}} online"],
  [/\(shape, headboard, buttons, (stitching, )?fabric,( colour,)? (hidden )?feet\)/g, "(shape, details, materials, colour)"],
  [/headboard detail, storage open/g, "detail close-up, product in use"],
  [/Klarna,? (and )?Clearpay,? ?/g, "buy-now-pay-later options, "], [/Omnisend/g, "the email platform"],
  [/UK DMCC Act( and CMA guidance)?/g, "consumer law, e.g. the UK DMCC Act"], [/British English/g, "{{language}}"],
  [/\bUK buyers\b/g, "buyers in {{country}}"], [/\bUK\b(?! DMCC)/g, "{{country}}"],
  [/, free fabric swatches/g, ""], [/5-year frame warranty/g, "{{warranty}}"],
  [/ is a service-area business \(a workshop, not a showroom\)/g, " may be a service-area business or have a public address (follow the brief)"],
  [/our workshop/g, "where the work is done"], [/real workshop footage/g, "real behind-the-scenes footage"], [/fabric roll/g, "material batch"],
  [/£30 a day|£30\/day/g, "{{adCap}} a day"], [/07417 439197/g, "{{phone}}"],
];
const gen = (v) => typeof v === "string" ? R.reduce((s, [a, b]) => s.replace(a, b), v)
  : Array.isArray(v) ? v.map(gen) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, gen(x)])) : v;
const out = {
  seoSkillRules: gen(src.SKILL_RULES),
  eccRules: gen(src.ECC_RULES),
  agencyPlaybooks: gen(src.AGENT_PLAYBOOK),
  agentEcc: src.AGENT_ECC,
  agentSeoSkills: src.AGENT_SKILLS,
  ceoPlaybook: gen(src.CEO_PLAYBOOK),
  managerRules: gen(src.MANAGER_RULES),
  managerSkills: src.MANAGER_SKILL_NAMES,
  funnelStages: gen(src.STAGES),
  reportGroups: src.REPORT_GROUPS,
  ceoReview: gen(src.CEO_REVIEW),
  cinemaPlatforms: src.CINE_PLATFORMS,
  musicMoods: src.MUSIC_META, videoModels: src.HF_MODELS,
};
fs.writeFileSync(__dirname + "/../src/catalog/playbooks.json", JSON.stringify(out, null, 1));
const txt = JSON.stringify(out);
for (const w of ["ottoman", "mattress", "headboard", "Shopify", "Omnisend", "Klarna", "upholster", "velvet", "UK", "British"]) console.log(w, (txt.match(new RegExp(w, "gi")) || []).length);
