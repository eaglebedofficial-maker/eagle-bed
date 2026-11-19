// usage: node t.js <live|preview> <pix|iph|dsk>
const {chromium,devices}=require('/opt/node-tools/node_modules/playwright');const fs=require('fs');
const [MODE,DK]=process.argv.slice(2);const TID='213270004043';const BASE='https://www.eaglebed.co.uk';
const SH='/home/user/eagle-bed/ops/theme-cro-2026-11-19/shots/';
const DEV=DK==='pix'?devices['Pixel 7']:DK==='iph'?devices['iPhone 13']:{viewport:{width:1366,height:800}};
const MOB=DK!=='dsk';
const U=path=>{const u=new URL(BASE+path);if(MODE==='preview')u.searchParams.set('preview_theme_id',TID);return u.toString()};
const INIT=`window.__m={cls:0};try{new PerformanceObserver(l=>{for(const e of l.getEntries()){if(!e.hadRecentInput)window.__m.cls+=e.value}}).observe({type:'layout-shift',buffered:true})}catch(e){}`;
const PDPS=[['divan','ottoman-gas-lift-divan-base'],['sidelift','side-lift-open-ottoman-bed'],['savoy','savoy-channel-tufted-bed-frame'],['ambassador','line-ambassador-upholstered-bed-frame']];
const out={mode:MODE,dev:DK,pages:{}};let b,c,p,errs=[];
async function fresh(){const st=c?await c.storageState():undefined;if(b)await b.close();b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY}});c=await b.newContext({...DEV,locale:'en-GB',timezoneId:'Europe/London',storageState:st});await c.addInitScript(INIT);p=await c.newPage();
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160))});p.on('pageerror',e=>errs.push('PAGEERROR '+String(e.message).slice(0,160)));}
async function clean(){await p.evaluate(()=>{const w=document.getElementById('PBarNextFrameWrapper');w&&w.remove();}).catch(()=>{});
 // cookie banner: press Decline if shown (it covers the lower screen); else remove
 const d=p.locator('#shopify-pc__banner button',{hasText:/decline|reject/i}).first();if(await d.count().catch(()=>0)){await d.click({timeout:3000}).catch(()=>{})}
 await p.evaluate(()=>{const x=document.getElementById('shopify-pc__banner');x&&x.remove()}).catch(()=>{});await p.waitForTimeout(800);}
async function go(path,wait=8000){errs=[];await fresh();try{await p.goto(U(path),{waitUntil:'load',timeout:90000})}catch(e){errs.push('GOTO '+e.message.slice(0,80))}await p.waitForTimeout(wait);await clean();}
const shot=async n=>{try{await p.screenshot({path:`${SH}${MODE==='live'?'before':'after'}-${DK}-${n}.jpg`,type:'jpeg',quality:45,scale:'css'})}catch(e){}};
const common=()=>p.evaluate(()=>{const lum=c=>{const m=c.match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])};
 const bgOf=e=>{while(e){const s=getComputedStyle(e);const c=s.backgroundColor;const m=c.match(/[\d.]+/g);if(m&&(m.length<4||+m[3]>0.5))return c;e=e.parentElement}return 'rgb(255,255,255)'};
 const con=e=>{if(!e)return null;const c=getComputedStyle(e).color,bg=bgOf(e);const a=lum(c),b2=lum(bg);return {t:e.innerText.trim().slice(0,40),color:c,bg,ratio:+((Math.max(a,b2)+.05)/(Math.min(a,b2)+.05)).toFixed(2)}};
 const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 const cards=[...document.querySelectorAll('.eb3d-card__title')].filter(vis).map(con);
 const ch=document.querySelector('shopify-chat');let act=null;try{const a=ch.shadowRoot.querySelector('shopify-agent-runtime').shadowRoot.querySelector('[part=activator]');const r=a.getBoundingClientRect();act={top:Math.round(r.top),bottom:Math.round(r.bottom),left:Math.round(r.left),right:Math.round(r.right),tf:getComputedStyle(a).transform}}catch(e){}
 const W=document.documentElement.clientWidth;const wide=document.documentElement.scrollWidth>W+1?[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();if(!(r.right>W+1&&r.width>0))return false;let a=e.parentElement;while(a&&a!==document.body){if(/(auto|scroll|hidden|clip)/.test(getComputedStyle(a).overflowX))return false;a=a.parentElement}return true}).filter((e,i,arr)=>!arr.includes(e.parentElement)).slice(0,4).map(e=>e.tagName+'.'+String(e.className).slice(0,50)+' R'+Math.round(e.getBoundingClientRect().right)):[];
 return {wide,theme:(window.Shopify&&Shopify.theme&&Shopify.theme.id)||0,sw:document.documentElement.scrollWidth,vw:innerWidth,vh:innerHeight,cls:+window.__m.cls.toFixed(4),
  h1:con(document.querySelector('h1')),cardMin:cards.length?Math.min(...cards.map(x=>x.ratio)):null,cardN:cards.length,cardWorst:cards.sort((a,b)=>a.ratio-b.ratio)[0]||null,chat:act}});
const hits=sel=>p.evaluate(sel=>{const e=[...document.querySelectorAll(sel)].find(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0});if(!e)return null;const r=e.getBoundingClientRect();
 const pts={left:[r.left+12,r.top+r.height/2],centre:[r.left+r.width/2,r.top+r.height/2],right:[r.right-12,r.top+r.height/2]};const o={rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],inView:r.top>=0&&r.bottom<=innerHeight};
 for(const k in pts){const [x,y]=pts[k];const h=document.elementFromPoint(x,y);o[k]=!h?'none':(e.contains(h)?'BUTTON(self)':h.tagName.toLowerCase()+(h.className?'.'+String(h.className).split(' ')[0]:''))}return o},sel);
const cartJs=async()=>{for(let i=0;i<3;i++){try{return await p.evaluate(async()=>(await fetch('/cart.js')).json())}catch(e){await p.waitForTimeout(1500)}}return {item_count:-1,items:[]}};
const grp=re=>p.locator('.po-option-root:visible',{has:p.locator('.po-label-label',{hasText:re})});
async function chooseOptions(){
 // size King on theme pills
 await p.evaluate(()=>window.scrollTo(0,0));
 const kid=await p.evaluate(()=>{const i=[...document.querySelectorAll('[data-option-index] input')].find(i=>/^King/i.test(i.value));return i&&i.id});
 if(kid){await p.evaluate(id=>document.querySelector(`label[for="${id}"]`).click(),kid).catch(()=>{});await p.waitForTimeout(1200)}
 const picked=[];
 for(let it=0;it<8;it++){
  const g=await p.evaluate(()=>{const gs=[...document.querySelectorAll('.po-option-root')].filter(g=>g.offsetParent);for(let i=0;i<gs.length;i++){const g=gs[i];const lab=((g.querySelector('.po-label-label')||{}).innerText||'').replace(/\s+/g,' ').trim();if(!/\*/.test(lab))continue;
    const chosen=[...g.querySelectorAll('input[type=hidden]')].some(x=>x.value)||!!g.querySelector('input:checked');if(chosen)continue;
    return {i,label:lab,items:g.querySelectorAll('.po-optionItem-item').length,inputs:g.querySelectorAll('input[type=checkbox],input[type=radio]').length}}return null});
  if(!g)break;const loc=p.locator('.po-option-root:visible').nth(g.i);
  if(g.inputs){await loc.locator('input[type=checkbox],input[type=radio]').first().check({force:true}).catch(()=>{})}
  else if(g.items){await p.evaluate(i=>{const gs=[...document.querySelectorAll('.po-option-root')].filter(g=>g.offsetParent);const it=gs[i].querySelector('.po-optionItem-item');it.scrollIntoView({block:'center'});it.click()},g.i).catch(()=>{})}
  picked.push(g.label);await p.waitForTimeout(1100);}
 const errsReq=await p.evaluate(()=>[...document.querySelectorAll('.po-option-root')].filter(g=>g.offsetParent&&/required field/i.test(g.innerText)).length);
 const price=await p.evaluate(()=>({main:(document.querySelector('.eb3d-info [data-price]')||{}).innerText,addon:(document.body.innerText.match(/additional charge of [^\n]*/i)||[''])[0].slice(0,60)}));
 return {picked,errsReq,price};}
async function stickyScan(){const res={firstOnY:null,firstOnBarInView:null,mainTop:null};
 res.mainTop=await p.evaluate(()=>Math.round(document.querySelector('[data-add-main]').getBoundingClientRect().top+scrollY));
 res.priceBottom=await p.evaluate(()=>{const e=document.querySelector('.eb3d-info [data-price]');return e?Math.round(e.getBoundingClientRect().bottom+scrollY):null});
 for(let y=0;y<=7000;y+=150){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(220);
  const s=await p.evaluate(()=>{const e=document.querySelector('.eb3d-sticky');const r=e.getBoundingClientRect();return {on:e.classList.contains('is-on'),inView:r.top>=0&&r.bottom<=innerHeight&&getComputedStyle(e).display!=='none'}});
  if(s.on&&res.firstOnY===null){res.firstOnY=y;res.firstOnBarInView=s.inView;break}}
 return res;}
async function tapSticky(){await p.waitForTimeout(700);const h=await hits('.eb3d-sticky [data-add]');if(!h)return {h:null};const [x,y,w,hh]=h.rect;const before=(await cartJs()).item_count;const url0=p.url();
 try{await p.touchscreen.tap(x+w/2,y+hh/2)}catch(e){}
 await p.waitForTimeout(3500);try{await p.waitForLoadState('load',{timeout:15000})}catch(e){}await p.waitForTimeout(2000);
 const after=(await cartJs()).item_count;return {h,before,after,navigated:p.url()!==url0,url:p.url().replace(BASE,'').slice(0,50),scrollY:await p.evaluate(()=>Math.round(scrollY)).catch(()=>-1),reqMsgs:await p.evaluate(()=>[...document.querySelectorAll('.po-option-root')].filter(g=>g.offsetParent&&/required field/i.test(g.innerText)).length).catch(()=>-1)};}
(async()=>{
 // home + collection
 for(const [k,path] of [['home','/'],['collection','/collections/ottoman-beds']]){await go(path);out.pages[k]={...await common(),errs:[...errs]};await shot(k);console.log(DK,MODE,k,JSON.stringify(out.pages[k]).slice(0,400));}
 for(const [k,h] of PDPS){await go('/products/'+h,9000);const o={...await common()};await shot(k+'-fold');
  if(MOB){o.sticky=await stickyScan();
   if(k==='savoy'){o.blankTap=await tapSticky();} // required options empty
   await p.evaluate(()=>window.scrollTo(0,0));}
  o.opts=await chooseOptions();
  if(MOB){// scroll so sticky shows: half way between price and main button
   const y=Math.round(((o.sticky.priceBottom||900)+(o.sticky.mainTop||3000))/2);await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(1200);
   o.stickyOn=await p.evaluate(()=>document.querySelector('.eb3d-sticky').classList.contains('is-on'));o.chatAtSticky=(await common()).chat;await shot(k+'-sticky');
   o.tap=await tapSticky();
   if(!(o.tap.after>o.tap.before)){ // fallback: main button so the basket still gets the item
     if(!/\/cart/.test(p.url())){await p.locator('[data-add-main] button[name=add]').click({force:true}).catch(()=>{});await p.waitForTimeout(6000)}
   }
  } else {const before=(await cartJs()).item_count;await p.locator('[data-add-main] button[name=add]').click({timeout:8000}).catch(e=>o.mainErr=e.message.slice(0,80));await p.waitForTimeout(4000);try{await p.waitForLoadState('load',{timeout:15000})}catch(e){};await p.waitForTimeout(1500);o.mainAdd={before,after:(await cartJs()).item_count,url:p.url().replace(BASE,'').slice(0,40)}}
  o.errs=[...errs];out.pages[k]=o;console.log(DK,MODE,k,JSON.stringify(o).slice(0,1500));}
 // cart
 await go('/cart',7000);const cj=await cartJs();const o={...await common(),errs:[...errs]};o.lines=cj.items.map(i=>({t:i.product_title.slice(0,30),v:i.variant_title,price:i.price/100,line:i.final_line_price/100,props:Object.keys(i.properties||{}).filter(x=>!x.startsWith('_')).length}));o.total=cj.total_price/100;
 if(MOB){await p.evaluate(()=>window.scrollTo(0,300));await p.waitForTimeout(900);o.chat=(await common()).chat;o.bar=await hits('.ebc-bar button[name=checkout]');}
 await shot('cart');
 // checkout: tap right side of the checkout button (mobile bar) / click (desktop); observe only
 try{ if(MOB&&o.bar){const [x,y,w,h]=o.bar.rect;await p.touchscreen.tap(x+w-14,y+h/2)} else {await p.locator('.eb3d-summary button[name=checkout]').click({timeout:8000})}
  await p.waitForTimeout(12000);o.checkoutUrl=p.url().replace(/\?.*/,'').replace(/[a-f0-9]{20,}/g,'…').slice(0,70);o.checkoutTitle=await p.title().catch(()=>'');o.checkoutPay=await p.evaluate(()=>(document.body.innerText.match(/(Klarna|PayPal|Shop Pay|Credit card|Clearpay)/gi)||[]).filter((v,i,a)=>a.indexOf(v)===i)).catch(()=>[]);await shot('checkout');}catch(e){o.checkoutErr=e.message.slice(0,100)}
 out.pages.cart=o;console.log(DK,MODE,'cart',JSON.stringify(o).slice(0,1500));
 fs.writeFileSync(`res-${MODE}-${DK}.json`,JSON.stringify(out,null,1));await b.close();console.log('DONE',MODE,DK)})().catch(async e=>{console.log('FATAL',MODE,DK,e.message.slice(0,300));fs.writeFileSync(`res-${MODE}-${DK}.json`,JSON.stringify(out,null,1));try{await b.close()}catch(x){}process.exit(1)});
