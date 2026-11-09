const fs=require('fs'),vm=require('vm'),acorn=require('acorn');
// Usage: node scripts/extract-hq-catalog.cjs <HQ artifact .html>  (needs: npm i --no-save acorn)
const html=fs.readFileSync(process.argv[2],'utf8');
const src=html.slice(html.indexOf('<script>')+8, html.indexOf('</script>', html.indexOf('<script>')));
const ast=acorn.parse(src,{ecmaVersion:2022});
const body=ast.body[0].expression.callee.body.body; // inside IIFE
let keep=[];
for(const s of body){
  if(s.type==='VariableDeclaration'||s.type==='FunctionDeclaration') keep.push(src.slice(s.start,s.end));
  else if(s.type==='ExpressionStatement'&&s.expression.type==='AssignmentExpression'&&s.expression.left.type==='Identifier') keep.push(src.slice(s.start,s.end));
  else if(s.type==='ExpressionStatement'&&s.expression.type==='CallExpression'&&/AGENTS\.forEach|\.forEach\(function\(a\)\{AG/.test(src.slice(s.start,s.end))) keep.push(src.slice(s.start,s.end));
}
const want=['MANAGER','AGENTS','DEPTS','CORE_RULES','CEO_PLAYBOOK','SKILL_RULES','AGENT_SKILLS','AGENT_PLAYBOOK','ECC_RULES','ECC_CATALOG','MANAGER_RULES','MANAGER_SKILL_NAMES','AGENT_ECC','SEO_CMDS','REPORT_GROUPS','TOOLS','TOOL_LABEL','CHIPS','SKILLS','ECC_CMDS','STAGES','CEO_REVIEW','CINE_PLATFORMS','CINE_STYLES','IMG_TYPES','MUSIC_META','RANGES','NEWPROD_RULES','CINE_RULES','CINE_FACTS','SLOTS','HF_MODELS','VM_FACTS','WT','ST_LABEL','SUP_LABEL','CQ_STATUS'];
const noop=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?(()=>0):(k==='length'?0:noop),apply:()=>noop,construct:()=>noop,set:()=>true});
const ctx={innerWidth:400,window:noop,document:noop,localStorage:{getItem:()=>null,setItem(){}},navigator:noop,console,location:noop,matchMedia:()=>({matches:false})};
vm.createContext(ctx);
let ok=0,bad=0;
for(const k of keep){try{vm.runInContext(k.replace(/^(var|let|const) /,'var '),ctx);ok++}catch(e){bad++}}
const out={};for(const w of want){out[w]=ctx[w]===undefined?'MISSING':ctx[w]}
fs.writeFileSync(__dirname+'/../catalog/eaglebed-hq-source.json',JSON.stringify(out,null,1));
console.log('stmts ok',ok,'bad',bad);
for(const k in out){const v=out[k];console.log(k,Array.isArray(v)?'array '+v.length:typeof v,typeof v==='string'?v.length:'')}
