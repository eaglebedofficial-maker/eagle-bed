const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const OUT = process.argv[2];
(async () => {
  const html = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px sans-serif}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync(path.join(__dirname, '../artifact/product-pilot.html'), 'utf8') + '</body></html>';
  fs.writeFileSync('/tmp/pp-art.html', html);
  const b = await chromium.launch(); const errs = [];
  for (const vp of [{ width: 1400, height: 900, n: 'd' }, { width: 400, height: 860, n: 'm' }]) {
    const p = await b.newPage({ viewport: vp }); p.on('pageerror', e => errs.push(vp.n + ': ' + e.message));
    await p.route(/fonts\.|media-amazon/, r => r.fulfill({ status: 404, body: '' }));
    await p.goto('file:///tmp/pp-art.html');
    await p.waitForTimeout(600);
    for (const v of ['search', 'product', 'analyst', 'keywords', 'reviews', 'profit', 'sales', 'ppc', 'launch', 'listing', 'suppliers', 'risk', 'saved', 'store', 'extension', 'map']) {
      await p.evaluate(v => location.hash = v, v); await p.waitForTimeout(250);
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (ov > 2) errs.push(vp.n + ' overflow ' + v + ' ' + ov);
      if (vp.n === 'd' && ['search', 'product', 'sales', 'launch', 'map', 'listing'].includes(v)) await p.screenshot({ path: `${OUT}/a-${v}.png` });
      if (vp.n === 'm' && ['search', 'product'].includes(v)) await p.screenshot({ path: `${OUT}/am-${v}.png` });
    }
    if (vp.n === 'd') {
      // search with no capabilities -> help + paste extension JSON
      await p.evaluate(() => location.hash = 'search'); await p.fill('#q', 'divan bed'); await p.click('#qgo'); await p.waitForTimeout(300);
      const ext = { source: 'product-pilot-extension', v: 2, kind: 'search', mkt: 'UK', query: 'ottoman bed', t: Date.now(), items: [{ asin: 'B0AAAAAAA1', title: 'Ottoman Bed Double Grey', price: 299, bsr: 3000, rankCategory: 'Home & Kitchen', reviews: 120, rating: 4.4, bought: 100, weightKg: 50, dims: { l: 200, w: 140, h: 35 }, sellerType: 'FBA', enriched: true }, { asin: 'B0AAAAAAA2', title: 'Ottoman Bed King Velvet', price: 399, bsr: 8000, rankCategory: 'Home & Kitchen', reviews: 40, rating: 4.0 }] };
      await p.fill('#s-paste', JSON.stringify(ext)); await p.click('#s-import'); await p.waitForTimeout(400);
      console.log('after ext import:', await p.evaluate(() => document.querySelector('#main h2')?.textContent), await p.locator('#xtbl tbody tr').count());
      // HTML paste of fixture search page
      await p.fill('#q', 'divan bed'); await p.click('#qgo'); await p.waitForTimeout(300);
      const fx = fs.readFileSync(path.join(__dirname, 'fixtures/search-uk.html'), 'utf8');
      await p.evaluate((fx) => { const ta = document.getElementById('s-paste'); const dt = new DataTransfer(); dt.setData('text/html', fx); dt.setData('text/plain', 'x'); ta.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true })); ta.value = 'pasted'; }, fx);
      await p.click('#s-import'); await p.waitForTimeout(400);
      console.log('after html paste:', await p.evaluate(() => document.querySelector('#main h2')?.textContent), await p.locator('#xtbl tbody tr').count());
      await p.click('#xt [data-t=market]'); await p.waitForTimeout(200); await p.screenshot({ path: `${OUT}/a-market.png` }); await p.click('#xt [data-t=compare]'); await p.waitForTimeout(200); await p.screenshot({ path: `${OUT}/a-compare.png` });
      // product page paste
      await p.evaluate(() => location.hash = 'product'); await p.fill('#p-asin', 'B0TEST0001'); await p.click('#p-go'); await p.waitForTimeout(300);
      const dp = fs.readFileSync(path.join(__dirname, 'fixtures/dp-B0TEST0001.html'), 'utf8');
      await p.evaluate((fx) => { const ta = document.getElementById('p-paste'); const dt = new DataTransfer(); dt.setData('text/html', fx); ta.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true })); ta.value = 'pasted'; }, dp);
      await p.click('#p-import'); await p.waitForTimeout(400);
      console.log('product:', await p.evaluate(() => [...document.querySelectorAll('#main .kpi')].slice(0, 6).map(k => k.textContent).join(' | ')));
      await p.click('#pt [data-t=profit]'); await p.waitForTimeout(200); await p.screenshot({ path: `${OUT}/a-product-profit.png` });
      await p.click('#pt [data-t=reviews]'); await p.waitForTimeout(200);
    }
    await p.close();
  }
  console.log('ERRORS', JSON.stringify(errs, null, 1)); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
