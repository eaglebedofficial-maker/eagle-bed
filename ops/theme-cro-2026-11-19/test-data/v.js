// all 5 variants of Ottoman Gas Lift Divan Base, desktop: node v.js <live|preview>
const {chromium}=require('/opt/node-tools/node_modules/playwright');const fs=require('fs');
const MODE=process.argv[2];const TID='213270004043';
const U=path=>{const u=new URL('https://www.eaglebed.co.uk'+path);if(MODE==='preview')u.searchParams.set('preview_theme_id',TID);return u.toString()};
(async()=>{const b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY}});const c=await b.newContext({viewport:{width:1366,height:800},locale:'en-GB'});const p=await c.newPage();const res=[];
const sizes=['Single (3FT)','Small Double (4FT)','Standard Double (4FT6)','King (5FT)','Super-King (6FT)'];
for(const sz of sizes){
 try{await p.goto(U('/products/ottoman-gas-lift-divan-base'),{waitUntil:'load',timeout:90000})}catch(e){}
 await p.waitForTimeout(8000);await p.evaluate(()=>{const x=document.getElementById('shopify-pc__banner');x&&x.remove();const w=document.getElementById('PBarNextFrameWrapper');w&&w.remove()});
 const id=await p.evaluate(sz=>{const i=[...document.querySelectorAll('[data-option-index] input')].find(i=>i.value===sz);return i&&i.id},sz);
 if(id){await p.locator(`label[for="${id}"]`).first().click({force:true});await p.waitForTimeout(1200)}
 for(let it=0;it<8;it++){
  const g=await p.evaluate(()=>{const gs=[...document.querySelectorAll('.po-option-root')].filter(g=>g.offsetParent);for(let i=0;i<gs.length;i++){const g=gs[i];const lab=((g.querySelector('.po-label-label')||{}).innerText||'');if(!/\*/.test(lab))continue;const chosen=[...g.querySelectorAll('input[type=hidden]')].some(x=>x.value)||!!g.querySelector('input:checked');if(chosen)continue;return {i,items:g.querySelectorAll('.po-optionItem-item').length,inputs:g.querySelectorAll('input[type=checkbox],input[type=radio]').length}}return null});
  if(!g)break;const loc=p.locator('.po-option-root:visible').nth(g.i);
  if(g.inputs){// delivery: choose the 3rd service (Room of Choice Assembly) to include a paid add-on
    const n=await loc.locator('input[type=checkbox],input[type=radio]').count();await loc.locator('input[type=checkbox],input[type=radio]').nth(Math.min(2,n-1)).check({force:true}).catch(()=>{})}
  else {await loc.locator('.po-optionItem-item').first().click({force:true}).catch(()=>{})}
  await p.waitForTimeout(1100)}
 const shown=await p.evaluate(()=>({price:(document.querySelector('.eb3d-info [data-price]')||{}).innerText,addon:(document.body.innerText.match(/additional charge of [^\n]*/i)||[''])[0].slice(0,50)}));
 await p.locator('[data-add-main] button[name=add]').click({timeout:8000}).catch(()=>{});await p.waitForTimeout(5000);try{await p.waitForLoadState('load',{timeout:15000})}catch(e){}
 res.push({sz,...shown,url:p.url().replace(/https:\/\/www.eaglebed.co.uk/,'').slice(0,30)});console.log(MODE,sz,JSON.stringify(shown));}
const cj=await p.evaluate(async()=>(await fetch('/cart.js')).json());
const lines=cj.items.map(i=>({t:i.product_title.slice(0,32),v:i.variant_title,unit:i.price/100,line:i.final_line_price/100,props:Object.fromEntries(Object.entries(i.properties||{}).filter(([k])=>!k.startsWith('_')))}));
fs.writeFileSync(`var-${MODE}.json`,JSON.stringify({res,lines,total:cj.total_price/100,count:cj.item_count},null,1));console.log(MODE,'TOTAL',cj.total_price/100,'items',cj.item_count);await b.close()})();
