const {chromium,devices}=require('/opt/node-tools/node_modules/playwright');const fs=require('fs');
const d=JSON.parse(fs.readFileSync('../site3/products.json'));const hs=(d.products||d).map(p=>p.handle);
const [W,part,parts]=process.argv.slice(2).map(Number);const mine=hs.filter((h,i)=>i%parts===part);
(async()=>{const b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY}});const c=await b.newContext({...devices['iPhone 13'],viewport:{width:W,height:700}});
await c.route(/(judge\.me|shop\.app|omnisend|dondy|facebook|tiktok|googletagmanager|clarity)/,r=>r.abort());
for(const h of mine){const p=await c.newPage();let r={h};try{await p.goto('https://www.eaglebed.co.uk/products/'+h+'?preview_theme_id=213270004043',{waitUntil:'load',timeout:60000});await p.waitForTimeout(5000);
 r={h,...await p.evaluate(()=>({sw:document.documentElement.scrollWidth,vw:innerWidth,wide:(()=>{const W=innerWidth;return [...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();if(!(r.right>W+1&&r.width>0))return false;let a=e.parentElement;while(a&&a!==document.body){if(/(auto|scroll|hidden|clip)/.test(getComputedStyle(a).overflowX))return false;a=a.parentElement}return true}).slice(0,3).map(e=>e.className.toString().slice(0,50)+' R'+Math.round(e.getBoundingClientRect().right))})(),theme:Shopify.theme.id,h1:getComputedStyle(document.querySelector('h1')||document.body).color}))}}catch(e){r.err=e.message.slice(0,60)}
 console.log(JSON.stringify(r));await p.close()}
await b.close()})();
