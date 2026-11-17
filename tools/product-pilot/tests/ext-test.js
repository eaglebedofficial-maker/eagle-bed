const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const EXT = path.resolve(__dirname, '../extension'), FX = path.resolve(__dirname, 'fixtures');
const OUT = process.argv[2] || '/tmp';
(async () => {
  const ctx = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true, viewport: { width: 1440, height: 900 },
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`]
  });
  const errors = [];
  await ctx.route(/amazon\.co\.uk|media-amazon|camelcamelcamel|completion\.amazon/, (route) => {
    const u = route.request().url();
    let m = u.match(/\/dp\/(B0TEST\d{4})/);
    if (m) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: fs.readFileSync(`${FX}/dp-${m[1]}.html`, 'utf8') });
    if (/\/s\?k=/.test(u)) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: fs.readFileSync(`${FX}/search-uk.html`, 'utf8') });
    if (/completion/.test(u)) { const p = new URL(u).searchParams.get('prefix'); return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ suggestions: [1,2,3].map(i => ({ value: p.trim() + ' suggestion ' + i })) }) }); }
    return route.fulfill({ status: 404, body: '' });
  });
  let sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
  const extId = sw.url().split('/')[2];
  console.log('extension id', extId);
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('https://www.amazon.co.uk/s?k=divan+bed');
  await page.waitForSelector('#product-pilot-host', { state: 'attached', timeout: 10000 });
  await page.evaluate(() => document.querySelector('#product-pilot-host').shadowRoot.querySelector('.launch').click());
  await page.waitForTimeout(9000);
  const info = await page.evaluate(() => { const r = document.querySelector('#product-pilot-host').shadowRoot; return { rows: r.querySelectorAll('#xtbl tbody tr').length, status: r.querySelector('#pp-status')?.textContent, kpis: [...r.querySelectorAll('.kpi')].map(k => k.textContent).slice(0, 6), first: r.querySelector('#xtbl tbody tr')?.textContent }; });
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: OUT + '/xray.png' });
  // market tab
  await page.evaluate(() => document.querySelector('#product-pilot-host').shadowRoot.querySelector('#xt [data-t=market]').click());
  await page.waitForTimeout(400); await page.screenshot({ path: OUT + '/xray-market.png' });
  await page.evaluate(() => document.querySelector('#product-pilot-host').shadowRoot.querySelector('#xt [data-t=keywords]').click());
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('#product-pilot-host').shadowRoot.querySelector('#x-sugg').click());
  await page.waitForTimeout(4000); await page.screenshot({ path: OUT + '/xray-kw.png' });
  const exp = await page.evaluate(() => new Promise(r => chrome.runtime ? r('n/a') : r('n/a')));
  // product page
  const p2 = await ctx.newPage();
  p2.on('pageerror', e => errors.push('p2 pageerror: ' + e.message));
  await p2.goto('https://www.amazon.co.uk/x/dp/B0TEST0001');
  await p2.waitForSelector('#pp-inline-host', { state: 'attached', timeout: 10000 });
  await p2.waitForTimeout(600);
  console.log('card:', await p2.evaluate(() => document.querySelector('#pp-inline-host').shadowRoot.textContent.slice(0, 600)));
  await p2.screenshot({ path: OUT + '/card.png' });
  for (const t of ['overview', 'profit', 'reviews', 'listing', 'keywords', 'history']) {
    await p2.evaluate((t) => { const r = document.querySelector('#product-pilot-host').shadowRoot; if (!r.querySelector('.panel')) r.querySelector('.launch').click(); r.querySelector('#pt [data-t=' + t + ']').click(); }, t);
    await p2.waitForTimeout(t === 'history' ? 2500 : 500);
    if (t === 'keywords') { await p2.evaluate(() => document.querySelector('#product-pilot-host').shadowRoot.querySelector('#k-run').click()); await p2.waitForTimeout(12000); }
    await p2.screenshot({ path: `${OUT}/p-${t}.png` });
  }
  // studio
  const s = await ctx.newPage();
  s.on('pageerror', e => errors.push('studio pageerror: ' + e.message));
  for (const v of ['dashboard', 'research', 'keywords', 'reverse', 'tracker', 'ranks', 'profit', 'listing', 'reviews', 'settings']) {
    await s.goto(`chrome-extension://${extId}/studio.html#${v}`); await s.waitForTimeout(700);
    await s.screenshot({ path: `${OUT}/s-${v}.png` });
  }
  // studio flows
  await s.goto(`chrome-extension://${extId}/studio.html#research`); await s.waitForTimeout(500);
  await s.fill('#r-kw', 'divan bed'); await s.click('#r-clear'); await s.waitForTimeout(300); await s.fill('#r-kw', 'divan bed'); await s.click('#r-go'); await s.waitForTimeout(12000);
  console.log('research:', await s.textContent('#r-st'), await s.locator('#rtbl tbody tr').count());
  await s.screenshot({ path: OUT + '/s-research-run.png' });
  await s.goto(`chrome-extension://${extId}/studio.html#keywords?q=divan%20bed&m=UK`); await s.waitForTimeout(6000);
  await s.click('#k-an'); await s.waitForTimeout(15000);
  console.log('keywords:', await s.textContent('#k-st'), await s.locator('#ktbl tbody tr').count());
  await s.screenshot({ path: OUT + '/s-keywords-run.png' });
  await s.goto(`chrome-extension://${extId}/studio.html#reverse`); await s.waitForTimeout(500);
  await s.fill('#ra-a', 'B0TEST0001'); await s.fill('#ra-c', 'B0TEST0004'); await s.selectOption('#ra-n', '25'); await s.click('#ra-go'); await s.waitForTimeout(40000);
  console.log('reverse:', await s.textContent('#ra-st'));
  await s.screenshot({ path: OUT + '/s-reverse-run.png' });
  await s.goto(`chrome-extension://${extId}/studio.html#tracker`); await s.waitForTimeout(500);
  await s.fill('#t-add', 'B0TEST0003'); await s.click('#t-addb'); await s.waitForTimeout(4000);
  await s.screenshot({ path: OUT + '/s-tracker-run.png' });
  console.log('ERRORS', JSON.stringify(errors, null, 1));
  await ctx.close();
})().catch(e => { console.error(e); process.exit(1); });
