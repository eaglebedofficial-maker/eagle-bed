/*
 * Product Pilot engine — shared by the Chrome extension and the Product Pilot artifact.
 * Pure functions: marketplaces, category sales models, FBA + referral fees, profit,
 * opportunity / niche / listing scores, text analysis and the Amazon page parsers.
 * Everything is an estimate unless it was read straight off Amazon or Keepa.
 */
(function (root) {
  "use strict";
  var PP = {};

  // ------------------------------------------------------------------ marketplaces
  var MARKETS = {
    US: { id: "US", host: "www.amazon.com", cur: "$", ccy: "USD", keepa: 1, mid: "ATVPDKIKX0DER", completion: "completion.amazon.com", factor: 1, metric: false, camel: "us", lang: "en_US" },
    UK: { id: "UK", host: "www.amazon.co.uk", cur: "£", ccy: "GBP", keepa: 2, mid: "A1F83G8C2ARO7P", completion: "completion.amazon.co.uk", factor: 0.32, metric: true, camel: "uk", lang: "en_GB" },
    DE: { id: "DE", host: "www.amazon.de", cur: "€", ccy: "EUR", keepa: 3, mid: "A1PA6795UKMFR9", completion: "completion.amazon.co.uk", factor: 0.36, metric: true, camel: "de", lang: "de_DE" },
    FR: { id: "FR", host: "www.amazon.fr", cur: "€", ccy: "EUR", keepa: 4, mid: "A13V1IB3VIYZZH", completion: "completion.amazon.co.uk", factor: 0.18, metric: true, camel: "fr", lang: "fr_FR" },
    IT: { id: "IT", host: "www.amazon.it", cur: "€", ccy: "EUR", keepa: 8, mid: "APJ6JRA9NG5V4", completion: "completion.amazon.co.uk", factor: 0.15, metric: true, camel: "it", lang: "it_IT" },
    ES: { id: "ES", host: "www.amazon.es", cur: "€", ccy: "EUR", keepa: 9, mid: "A1RKKUPIHCS9HS", completion: "completion.amazon.co.uk", factor: 0.13, metric: true, camel: "es", lang: "es_ES" },
    CA: { id: "CA", host: "www.amazon.ca", cur: "C$", ccy: "CAD", keepa: 6, mid: "A2EUQ1WTGCTBG2", completion: "completion.amazon.com", factor: 0.14, metric: true, camel: "ca", lang: "en_CA" }
  };
  PP.MARKETS = MARKETS;
  PP.marketFromHost = function (host) {
    host = String(host || "").toLowerCase();
    if (/amazon\.co\.uk$/.test(host)) return "UK";
    if (/amazon\.de$/.test(host)) return "DE";
    if (/amazon\.fr$/.test(host)) return "FR";
    if (/amazon\.it$/.test(host)) return "IT";
    if (/amazon\.es$/.test(host)) return "ES";
    if (/amazon\.ca$/.test(host)) return "CA";
    if (/amazon\.com$/.test(host)) return "US";
    return null;
  };
  PP.urls = function (mkt, asin) {
    var m = MARKETS[mkt] || MARKETS.US;
    return {
      amazon: "https://" + m.host + "/dp/" + asin,
      keepa: "https://keepa.com/#!product/" + m.keepa + "-" + asin,
      camel: "https://" + (m.camel === "us" ? "" : m.camel + ".") + "camelcamelcamel.com/product/" + asin,
      camelChart: "https://charts.camelcamelcamel.com/" + m.camel + "/" + asin + "/amazon-new-used.png?force=1&zero=0&w=720&h=380&desired=false&legend=1&ilt=1&tp=all&fo=0&lang=en",
      reviews: "https://" + m.host + "/product-reviews/" + asin + "?sortBy=recent",
      offers: "https://" + m.host + "/gp/offer-listing/" + asin,
      search: function (q) { return "https://" + m.host + "/s?k=" + encodeURIComponent(q); }
    };
  };

  // ------------------------------------------------------------------ categories
  // k = US monthly units at BSR #1,000 in that top-level category (calibrated to public
  // rank/sales tables). ref = referral fee rule. Aliases match the category names that
  // appear in Best Sellers Rank text in each marketplace.
  var CATS = [
    { name: "Home & Kitchen", k: 1800, ref: "std", al: ["home & kitchen", "home and kitchen", "küche, haushalt", "cuisine & maison", "casa e cucina", "hogar y cocina", "kitchen & home", "home"] },
    { name: "Furniture", k: 700, ref: "furniture", al: ["furniture", "möbel", "meubles", "mobili", "muebles"] },
    { name: "Kitchen & Dining", k: 900, ref: "std", al: ["kitchen & dining"] },
    { name: "Garden & Outdoors", k: 800, ref: "std", al: ["garden", "patio, lawn", "garten", "jardin", "giardino", "jardín"] },
    { name: "Tools & Home Improvement", k: 900, ref: "tools", al: ["tools & home improvement", "diy & tools", "baumarkt", "bricolage", "fai da te", "bricolaje", "tools"] },
    { name: "Health & Household", k: 1700, ref: "health", al: ["health & household", "health & personal care", "drogerie", "hygiène et santé", "salute e cura", "salud y cuidado", "health"] },
    { name: "Beauty & Personal Care", k: 1500, ref: "health", al: ["beauty", "kosmetik", "beauté", "bellezza", "belleza"] },
    { name: "Baby", k: 700, ref: "health", al: ["baby", "bébé", "prima infanzia", "bebé"] },
    { name: "Toys & Games", k: 1300, ref: "std", al: ["toys", "spielzeug", "jeux et jouets", "giochi e giocattoli", "juguetes"] },
    { name: "Sports & Outdoors", k: 900, ref: "std", al: ["sports", "sport & freizeit", "sports et loisirs", "sport e tempo libero", "deportes"] },
    { name: "Pet Supplies", k: 1000, ref: "std", al: ["pet", "haustier", "animalerie", "prodotti per animali", "productos para mascotas"] },
    { name: "Office Products", k: 800, ref: "std", al: ["office", "stationery", "bürobedarf", "fournitures de bureau", "cancelleria", "oficina"] },
    { name: "Clothing, Shoes & Jewelry", k: 1100, ref: "clothing", al: ["clothing", "fashion", "bekleidung", "mode", "moda", "shoes"] },
    { name: "Electronics", k: 600, ref: "electronics", al: ["electronics", "elektronik", "high-tech", "elettronica", "electrónica"] },
    { name: "Computers", k: 500, ref: "electronics", al: ["computers", "computer & zubehör", "informatique", "informatica", "informática"] },
    { name: "Cell Phones & Accessories", k: 700, ref: "std", al: ["cell phones", "mobile phones"] },
    { name: "Automotive", k: 600, ref: "auto", al: ["automotive", "auto & motorrad", "auto et moto", "auto e moto", "coche y moto", "car & motorbike"] },
    { name: "Arts, Crafts & Sewing", k: 600, ref: "std", al: ["arts, crafts", "arts & crafts", "bastel", "loisirs créatifs", "arte"] },
    { name: "Grocery", k: 1600, ref: "grocery", al: ["grocery", "lebensmittel", "epicerie", "alimentari", "alimentación"] },
    { name: "Industrial & Scientific", k: 300, ref: "auto", al: ["industrial", "business, industry", "gewerbe", "industrie"] },
    { name: "Appliances", k: 250, ref: "appliances", al: ["appliances", "large appliances", "elektro-großgeräte", "gros électroménager"] },
    { name: "Musical Instruments", k: 250, ref: "std", al: ["musical instruments", "musikinstrumente", "instruments de musique"] },
    { name: "Video Games", k: 400, ref: "std", al: ["video games", "games", "games"] },
    { name: "Books", k: 900, ref: "media", al: ["books", "bücher", "livres", "libri", "libros"] },
    { name: "Other", k: 600, ref: "std", al: [] }
  ];
  PP.CATS = CATS;
  PP.catNames = CATS.map(function (c) { return c.name; });
  PP.matchCategory = function (s) {
    s = String(s || "").toLowerCase();
    if (!s) return "Other";
    // bed/mattress specific words map to Furniture when Amazon reports a home category
    for (var i = 0; i < CATS.length; i++) {
      var c = CATS[i];
      if (c.name.toLowerCase() === s) return c.name;
    }
    for (i = 0; i < CATS.length; i++) {
      for (var j = 0; j < CATS[i].al.length; j++) if (s.indexOf(CATS[i].al[j]) > -1) return CATS[i].name;
    }
    return "Other";
  };
  function cat(name) { for (var i = 0; i < CATS.length; i++) if (CATS[i].name === name) return CATS[i]; return CATS[CATS.length - 1]; }
  PP.cat = cat;

  // ------------------------------------------------------------------ helpers
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  PP.clamp = clamp;
  PP.num = function (s) {
    // parse "1,234.56", "1.234,56", "£12.99", "1.2K", "12 345", "(1,234)"
    if (typeof s === "number") return s;
    s = String(s == null ? "" : s).replace(/[\u00a0\u202f]/g, " ").trim();
    var m = s.match(/(\d[\d.,\s]*\d|\d)(\s*[kKmM](?![a-z]))?/);
    if (!m) return NaN;
    var t = m[1].replace(/\s/g, "");
    var lastC = t.lastIndexOf(","), lastD = t.lastIndexOf(".");
    if (lastC > -1 && lastD > -1) {
      t = lastC > lastD ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
    } else if (lastC > -1) {
      t = /^\d{1,3}(,\d{3})+$/.test(t) ? t.replace(/,/g, "") : t.replace(",", ".");
    } else if (lastD > -1 && /^\d{1,3}(\.\d{3})+$/.test(t) && !m[2]) {
      t = t.replace(/\./g, "");
    }
    var v = parseFloat(t);
    if (m[2]) { var u = m[2].trim().toLowerCase(); v *= u === "k" ? 1000 : 1e6; }
    return v;
  };
  PP.int = function (s) { var t = String(s == null ? "" : s).replace(/[^\d]/g, ""); return t ? parseInt(t, 10) : NaN; };
  PP.money = function (n, mkt) { var c = (MARKETS[mkt] || MARKETS.US).cur; if (!isFinite(n)) return "—"; return (n < 0 ? "-" : "") + c + Math.abs(n).toFixed(2); };
  PP.kmoney = function (n, mkt) {
    var c = (MARKETS[mkt] || MARKETS.US).cur; if (!isFinite(n)) return "—";
    var a = Math.abs(n), s = n < 0 ? "-" : "";
    if (a >= 1e6) return s + c + (a / 1e6).toFixed(2) + "M";
    if (a >= 1e4) return s + c + Math.round(a / 1000) + "k";
    if (a >= 1000) return s + c + (a / 1000).toFixed(1) + "k";
    return s + c + Math.round(a);
  };
  PP.knum = function (n) { if (!isFinite(n)) return "—"; var a = Math.abs(n); if (a >= 1e6) return (n / 1e6).toFixed(1) + "M"; if (a >= 1e4) return Math.round(n / 1000) + "k"; if (a >= 1000) return (n / 1000).toFixed(1) + "k"; return String(Math.round(n)); };
  PP.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  PP.extractAsin = function (s) {
    s = String(s || "").trim();
    var m = s.match(/\/(?:dp|gp\/product|gp\/aw\/d|product-reviews|product)\/([A-Z0-9]{10})(?:[/?#]|$)/i);
    if (m) return m[1].toUpperCase();
    m = s.match(/\b(B0[A-Z0-9]{8})\b/i); if (m) return m[1].toUpperCase();
    m = s.match(/^\s*([0-9]{9}[0-9X])\s*$/i); if (m) return m[1].toUpperCase();
    return "";
  };

  // ------------------------------------------------------------------ sales model
  // monthly units = k * (bsr/1000)^-b, scaled by marketplace size. Below rank 100 the
  // curve flattens so top sellers are not wildly over-estimated.
  PP.salesFromBsr = function (bsr, catName, mkt) {
    bsr = +bsr; if (!(bsr > 0)) return 0;
    var c = cat(catName), f = (MARKETS[mkt] || MARKETS.US).factor;
    var b = 0.87, v;
    if (bsr >= 100) v = c.k * Math.pow(bsr / 1000, -b);
    else v = c.k * Math.pow(0.1, -b) * Math.pow(bsr / 100, -0.45);
    return Math.max(0, v * f);
  };
  // Amazon's "1K+ bought in past month" badge, any language.
  PP.parseBought = function (s) {
    s = String(s || "");
    var m = s.match(/(\d[\d.,]*)\s*([kK]|tsd\.?|mil)?\s*\+?\s*(?:bought|gekauft|achet|acquist|comprad|vendu|mal\s)/i) ||
            s.match(/(?:mehr als|plus de|più di|más de)\s*(\d[\d.,]*)\s*([kK]|tsd\.?|mil)?/i);
    if (!m) return 0;
    var n = parseFloat(m[1].replace(/[.,](?=\d{3}\b)/g, "").replace(",", "."));
    if (m[2]) n *= 1000;
    return isFinite(n) ? Math.round(n) : 0;
  };
  function nextBucket(n) {
    if (n < 100) return n + 50;
    if (n < 1000) return n + 100;
    if (n < 10000) return n + 1000;
    if (n < 100000) return n + 10000;
    return n * 2;
  }
  // Blend the rank model with Amazon's own sales badge (a hard lower bound).
  PP.estimateSales = function (o) {
    var model = PP.salesFromBsr(o.bsr, o.category, o.mkt);
    var badge = o.bought || 0;
    if (badge > 0) {
      var hi = nextBucket(badge);
      var units = model > 0 ? clamp(model, badge, hi) : (badge + hi) / 2;
      return { units: Math.round(units), low: badge, high: hi, source: model > 0 ? "badge+rank" : "badge" };
    }
    if (model > 0) return { units: Math.round(model), low: Math.round(model * 0.7), high: Math.round(model * 1.35), source: "rank" };
    return { units: 0, low: 0, high: 0, source: "none" };
  };

  // ------------------------------------------------------------------ dimensions
  PP.parseWeightKg = function (s) {
    s = String(s || "").toLowerCase().replace(/,(?=\d)/g, ".");
    var m = s.match(/(\d+(?:\.\d+)?)\s*(kilograms|kilogramm|kg|grams|gramm|g\b|grammes|pounds|pound|lbs|lb|ounces|ounce|oz)/);
    if (!m) return NaN;
    var v = parseFloat(m[1]), u = m[2];
    if (/^k/.test(u)) return v;
    if (/^g/.test(u)) return v / 1000;
    if (/^(p|lb)/.test(u)) return v * 0.453592;
    if (/^o/.test(u)) return v * 0.0283495;
    return NaN;
  };
  PP.parseDimsCm = function (s) {
    s = String(s || "").toLowerCase().replace(/,(?=\d)/g, ".");
    var m = s.match(/(\d+(?:\.\d+)?)\s*(?:[a-z"]+\s*)?[x×]\s*(\d+(?:\.\d+)?)\s*(?:[a-z"]+\s*)?[x×]\s*(\d+(?:\.\d+)?)\s*(millimetres|millimeters|mm|centimetres|centimeters|cm|metres|meters|m\b|inches|inch|in\b|")?/);
    if (!m) return null;
    var u = m[4] || (/inch|"/.test(s) ? "in" : "cm"), f = 1;
    if (/^mm|^milli/.test(u)) f = 0.1; else if (/^in|"/.test(u)) f = 2.54; else if (/^m(etre|eter)?s?$/.test(u)) f = 100;
    var d = [parseFloat(m[1]) * f, parseFloat(m[2]) * f, parseFloat(m[3]) * f].sort(function (a, b) { return b - a; });
    return { l: d[0], w: d[1], h: d[2] };
  };

  // ------------------------------------------------------------------ fees
  PP.referralFee = function (price, catName, mkt) {
    var r = cat(catName).ref, p = +price || 0, fee;
    var eu = mkt !== "US" && mkt !== "CA";
    switch (r) {
      case "electronics": fee = p * (eu ? 0.07 : 0.08); break;
      case "clothing": fee = eu ? p * 0.15 : (p <= 15 ? p * 0.05 : p <= 20 ? p * 0.10 : p * 0.17); break;
      case "health": fee = (p <= 10 && !eu) ? p * 0.08 : p * 0.15; break;
      case "grocery": fee = (p <= 15 && !eu) ? p * 0.08 : p * 0.15; break;
      case "auto": fee = p * 0.12; break;
      case "tools": fee = p * (eu ? 0.13 : 0.15); break;
      case "appliances": fee = p * (eu ? 0.07 : 0.08); break;
      case "furniture": fee = eu ? p * 0.15 : (p <= 200 ? p * 0.15 : 200 * 0.15 + (p - 200) * 0.10); break;
      case "media": fee = p * 0.15 + 1.8; break;
      default: fee = p * 0.15;
    }
    return p > 0 ? Math.max(fee, 0.3) : 0;
  };

  // FBA fulfilment fee. Input: weightKg, dims {l,w,h} cm, price, mkt. Returns {fee, tier, shipKg}
  PP.fbaFee = function (o) {
    var mkt = o.mkt || "US", kg = +o.weightKg || 0, d = o.dims || null, price = +o.price || 0;
    if (!(kg > 0) && !d) return { fee: NaN, tier: "unknown", shipKg: 0 };
    if (!d) d = { l: 30, w: 20, h: 8 };
    if (mkt === "US" || mkt === "CA") {
      var li = d.l / 2.54, wi = d.w / 2.54, hi = d.h / 2.54, lb = kg / 0.453592, oz = lb * 16;
      var dimLb = li * wi * hi / 139, fee, tier;
      var girth = li + 2 * (wi + hi);
      if (li <= 15 && wi <= 12 && hi <= 0.75 && oz <= 16) {
        tier = "Small standard";
        var t = [[2, 3.06], [4, 3.15], [6, 3.24], [8, 3.33], [10, 3.43], [12, 3.53], [14, 3.60], [16, 3.65]];
        for (var i = 0; i < t.length; i++) if (oz <= t[i][0]) { fee = t[i][1]; break; }
      } else if (li <= 18 && wi <= 14 && hi <= 8 && Math.max(lb, dimLb) <= 20) {
        tier = "Large standard";
        var s = Math.max(lb, dimLb), so = s * 16;
        var t2 = [[4, 3.68], [8, 3.90], [12, 4.15], [16, 4.55], [20, 4.99], [24, 5.37], [28, 5.52], [32, 5.77], [36, 5.87], [40, 6.05], [44, 6.21], [48, 6.62]];
        fee = null;
        for (var j = 0; j < t2.length; j++) if (so <= t2[j][0]) { fee = t2[j][1]; break; }
        if (fee == null) fee = 6.92 + Math.ceil((so - 48) / 4) * 0.08;
      } else if (li <= 59 && wi <= 33 && hi <= 33 && girth <= 130 && Math.max(lb, dimLb) <= 50) {
        tier = "Large bulky"; var s2 = Math.max(lb, dimLb); fee = 9.61 + Math.max(0, Math.ceil(s2 - 1)) * 0.38;
      } else {
        var s3 = Math.max(lb, dimLb);
        if (s3 <= 50) { tier = "Extra-large 0–50 lb"; fee = 26.33 + Math.max(0, Math.ceil(s3 - 1)) * 0.38; }
        else if (s3 <= 70) { tier = "Extra-large 50–70 lb"; fee = 40.12 + Math.max(0, Math.ceil(s3 - 51)) * 0.75; }
        else if (s3 <= 150) { tier = "Extra-large 70–150 lb"; fee = 54.81 + Math.max(0, Math.ceil(s3 - 71)) * 0.75; }
        else { tier = "Extra-large 150+ lb"; fee = 194.95 + Math.max(0, Math.ceil(s3 - 151)) * 0.19; }
      }
      if (price > 0 && price < 10) fee -= 0.77;
      if (mkt === "CA") fee *= 1.38;
      return { fee: Math.max(0, fee), tier: tier, shipKg: Math.max(kg, dimLb * 0.453592) };
    }
    // UK / EU (pan-EU local fees, GBP for UK, EUR ≈ ×1.12)
    var L = d.l, W = d.w, H = d.h, g = kg * 1000, dimKg = L * W * H / 5000, sg = Math.max(g, dimKg * 1000);
    var f, tr;
    function band(val, rows, extraPerKg) { for (var k = 0; k < rows.length; k++) if (val <= rows[k][0]) return rows[k][1]; var last = rows[rows.length - 1]; return last[1] + Math.ceil((val - last[0]) / 1000) * (extraPerKg || 0.25); }
    if (L <= 20 && W <= 15 && H <= 1 && g <= 80) { tr = "Small envelope"; f = 1.83; }
    else if (L <= 33 && W <= 23 && H <= 2.5 && g <= 460) { tr = "Standard envelope"; f = band(g, [[60, 1.97], [210, 2.15], [460, 2.32]]); }
    else if (L <= 33 && W <= 23 && H <= 4 && g <= 960) { tr = "Large envelope"; f = 2.83; }
    else if (L <= 33 && W <= 23 && H <= 6 && g <= 960) { tr = "Extra-large envelope"; f = 3.08; }
    else if (L <= 35 && W <= 25 && H <= 12 && sg <= 3900) { tr = "Small parcel"; f = band(sg, [[150, 3.06], [400, 3.25], [900, 3.53], [1400, 3.83], [1900, 4.04], [3900, 5.65]]); }
    else if (L <= 45 && W <= 34 && H <= 26 && sg <= 11900) { tr = "Standard parcel"; f = band(sg, [[150, 3.08], [400, 3.33], [900, 3.73], [1400, 4.04], [1900, 4.28], [2900, 5.23], [3900, 5.72], [5900, 6.38], [8900, 7.36], [11900, 7.91]]); }
    else if (L <= 61 && W <= 46 && H <= 46 && sg <= 25820) { tr = "Small oversize"; f = band(sg, [[760, 5.89], [1260, 6.38], [1760, 6.73], [25820, 6.73]], 0.25); if (sg > 1760) f = 6.73 + Math.ceil((sg - 1760) / 1000) * 0.25; }
    else if (L <= 101 && W <= 60 && H <= 60 && sg <= 29760) { tr = "Standard oversize"; f = 7.40 + Math.max(0, Math.ceil((sg - 760) / 1000)) * 0.28; }
    else if (L <= 120 && sg <= 31500) { tr = "Large oversize"; f = 11.31 + Math.max(0, Math.ceil((sg - 1000) / 1000)) * 0.29; }
    else { tr = "Special oversize"; sg = g; f = 16.81 + Math.max(0, Math.ceil((g - 1000) / 1000)) * 0.40; }
    if (mkt !== "UK") f *= 1.12;
    return { fee: f, tier: tr, shipKg: sg / 1000 };
  };
  // monthly storage per unit (off-peak / peak averaged by month)
  PP.storageFee = function (o) {
    var d = o.dims; if (!d) return 0;
    var cuft = d.l * d.w * d.h / 28316.8, month = (o.month != null ? o.month : new Date().getMonth());
    var peak = month >= 9;
    var big = d.l > 45 || (d.w > 34) || (d.h > 26);
    var rate = o.mkt === "US" || o.mkt === "CA" ? (big ? (peak ? 1.40 : 0.56) : (peak ? 2.40 : 0.78)) : (big ? (peak ? 1.17 : 0.83) : (peak ? 1.53 : 0.78));
    if (o.mkt !== "US" && o.mkt !== "UK") rate *= 1.12;
    return cuft * rate;
  };

  // Full unit economics. o: {price, cost, freight, prep, catName, mkt, weightKg, dims, acos, returns, storageMonths, fbm, shipFbm, vat}
  PP.profit = function (o) {
    var price = +o.price || 0, mkt = o.mkt || "US";
    var vatRate = o.vat != null ? +o.vat : (mkt === "UK" ? 20 : mkt === "DE" ? 19 : mkt === "FR" ? 20 : mkt === "IT" ? 22 : mkt === "ES" ? 21 : 0);
    var vatOn = !!o.vatRegistered;
    var netPrice = vatOn ? price / (1 + vatRate / 100) : price;
    var vat = price - netPrice;
    var ref = PP.referralFee(price, o.catName, mkt);
    var fba = o.fbm ? { fee: +o.shipFbm || 0, tier: "Merchant fulfilled" } : PP.fbaFee({ weightKg: o.weightKg, dims: o.dims, price: price, mkt: mkt });
    var fbaFee = isFinite(fba.fee) ? fba.fee : 0;
    var storage = o.fbm ? 0 : PP.storageFee({ dims: o.dims, mkt: mkt }) * (o.storageMonths != null ? +o.storageMonths : 1.5);
    var landed = (+o.cost || 0) + (+o.freight || 0) + (+o.prep || 0);
    var ads = price * (+o.acos || 0) / 100;
    var returns = price * (+o.returns || 0) / 100 * 0.5;
    var net = netPrice - ref - fbaFee - storage - landed - ads - returns;
    var k = 1 - (ref / (price || 1)) - (+o.acos || 0) / 100 - (+o.returns || 0) / 200;
    var be = k > 0 ? (fbaFee + storage + landed) / k : NaN;
    var beAcos = price > 0 ? ((netPrice - ref - fbaFee - storage - landed - returns) / price) * 100 : NaN;
    return {
      price: price, vat: vat, referral: ref, fba: fbaFee, tier: fba.tier, storage: storage, landed: landed, ads: ads, returns: returns,
      net: net, margin: price > 0 ? net / price * 100 : 0, roi: landed > 0 ? net / landed * 100 : 0,
      breakEvenPrice: be, breakEvenAcos: beAcos, feesTotal: ref + fbaFee + storage
    };
  };

  // ------------------------------------------------------------------ scoring
  // Opportunity score for one product (0-100) — demand, competition, economics, listing gap.
  PP.productScore = function (p) {
    var sales = +p.sales || 0, rev = +p.reviews || 0, rating = +p.rating || 0, price = +p.price || 0;
    var demand = clamp(Math.log10(Math.max(sales, 1)) / Math.log10(3000), 0, 1) * 35;
    var comp = clamp(1 - Math.log10(Math.max(rev, 1)) / Math.log10(5000), 0, 1) * 25;
    var priceS = price >= 20 && price <= 80 ? 15 : price >= 12 && price <= 150 ? 10 : price > 0 ? 5 : 0;
    var marginS = p.margin != null ? clamp(p.margin / 35, 0, 1) * 15 : 8;
    var gap = rating > 0 ? (rating < 4.0 ? 10 : rating < 4.3 ? 7 : rating < 4.6 ? 4 : 2) : 4;
    return Math.round(demand + comp + priceS + marginS + gap);
  };
  PP.scoreLabel = function (s) { return s >= 70 ? "Strong" : s >= 50 ? "Promising" : s >= 35 ? "Weak" : "Avoid"; };

  // Niche / search-page summary (Xray / Opportunity Finder style).
  PP.marketSummary = function (items, mkt) {
    var org = items.filter(function (x) { return !x.sponsored; });
    var all = items.filter(function (x) { return x.price > 0 || x.sales > 0; });
    var base = all.length ? all : items;
    function avg(f, arr) { arr = arr || base; var v = arr.map(f).filter(function (n) { return isFinite(n) && n > 0; }); return v.length ? v.reduce(function (a, b) { return a + b; }, 0) / v.length : 0; }
    function med(f, arr) { arr = arr || base; var v = arr.map(f).filter(function (n) { return isFinite(n) && n > 0; }).sort(function (a, b) { return a - b; }); return v.length ? v[Math.floor(v.length / 2)] : 0; }
    var uniq = {}; base.forEach(function (x) { if (!uniq[x.asin]) uniq[x.asin] = x; });
    var u = Object.keys(uniq).map(function (k) { return uniq[k]; });
    var totalRev = u.reduce(function (a, x) { return a + (x.revenue || 0); }, 0);
    var totalSales = u.reduce(function (a, x) { return a + (x.sales || 0); }, 0);
    var sorted = u.slice().sort(function (a, b) { return (b.revenue || 0) - (a.revenue || 0); });
    var top3 = sorted.slice(0, 3).reduce(function (a, x) { return a + (x.revenue || 0); }, 0);
    var brands = {}; u.forEach(function (x) { var b = (x.brand || "").trim().toLowerCase(); if (b) brands[b] = (brands[b] || 0) + (x.revenue || 0); });
    var topBrand = Object.keys(brands).sort(function (a, b) { return brands[b] - brands[a]; })[0] || "";
    var newcomers = u.filter(function (x) { return (x.reviews || 0) < 100 && (x.sales || 0) >= 150; }).length;
    var lowRated = u.filter(function (x) { return x.rating > 0 && x.rating < 4.2; }).length;
    var amz = u.filter(function (x) { return x.sellerType === "AMZ"; }).length;
    var fba = u.filter(function (x) { return x.sellerType === "FBA"; }).length;
    var fbm = u.filter(function (x) { return x.sellerType === "FBM"; }).length;
    var avgSales = avg(function (x) { return x.sales; }, u), avgRev = avg(function (x) { return x.reviews; }, u);
    // niche score: demand vs competition (0-100)
    var demand = clamp(Math.log10(Math.max(avgSales, 1)) / Math.log10(1500), 0, 1);
    var competition = clamp(Math.log10(Math.max(avgRev, 1)) / Math.log10(4000), 0, 1);
    var concentration = totalRev > 0 ? top3 / totalRev : 0;
    var score = Math.round(clamp(demand * 45 + (1 - competition) * 30 + (1 - concentration) * 15 + clamp(newcomers / 5, 0, 1) * 10, 0, 100));
    return {
      count: u.length, sponsored: items.length - org.length,
      totalRevenue: totalRev, totalSales: totalSales,
      avgPrice: avg(function (x) { return x.price; }, u), medianPrice: med(function (x) { return x.price; }, u),
      avgSales: avgSales, avgRevenue: avg(function (x) { return x.revenue; }, u),
      avgBsr: avg(function (x) { return x.bsr; }, u), avgReviews: avgRev, medianReviews: med(function (x) { return x.reviews; }, u),
      avgRating: avg(function (x) { return x.rating; }, u),
      top3Share: concentration, topBrand: topBrand, topBrandShare: totalRev > 0 && topBrand ? brands[topBrand] / totalRev : 0,
      brandCount: Object.keys(brands).length,
      newcomers: newcomers, lowRated: lowRated, amazonSells: amz, fba: fba, fbm: fbm,
      score: score, verdict: score >= 65 ? "Enter — strong demand, beatable competition" : score >= 45 ? "Possible — needs a clear edge" : "Avoid — crowded or thin",
      demand: demand, competition: competition
    };
  };

  // ------------------------------------------------------------------ text
  var STOP = ("a an and or but of to in on for with is are was were it this that i you we they my our your so very just really also too not no as at be been being have has had will would can could its it's im i'm dont don't one get got from by up out if than then them there their these those what which who when where how all any each more most other some such only own same so very s t can will just should now new set pcs pack x cm mm inch inches uk us size").split(/\s+/);
  var STOPSET = {}; STOP.forEach(function (w) { STOPSET[w] = 1; });
  PP.STOP = STOPSET;
  PP.tokens = function (s) { return String(s || "").toLowerCase().replace(/[^a-z0-9äöüßàâçéèêëîïôûùüÿñæœ'\s-]/g, " ").replace(/\s-\s/g, " ").split(/\s+/).filter(function (w) { return w.length > 1 && !STOPSET[w] && !/^\d+$/.test(w); }); };
  // n-gram frequency across a list of texts (e.g. page-1 titles = keywords competitors target)
  PP.ngrams = function (texts, maxN) {
    maxN = maxN || 3; var freq = {}, docs = {};
    texts.forEach(function (t, di) {
      var w = PP.tokens(t), seen = {};
      for (var n = 1; n <= maxN; n++) for (var i = 0; i + n <= w.length; i++) {
        var g = w.slice(i, i + n).join(" ");
        freq[g] = (freq[g] || 0) + 1;
        if (!seen[g]) { seen[g] = 1; docs[g] = (docs[g] || 0) + 1; }
      }
    });
    return Object.keys(freq).map(function (g) { return { term: g, count: freq[g], docs: docs[g], words: g.split(" ").length }; })
      .filter(function (x) { return x.words === 1 ? x.docs >= 2 : x.docs >= 2; })
      .sort(function (a, b) { return (b.docs * b.words) - (a.docs * a.words) || b.count - a.count; });
  };
  // Candidate search phrases from one listing: contiguous 2–4 word runs of the title
  // (earlier = more important) plus repeated phrases from the bullets.
  PP.titlePhrases = function (title, bullets, max) {
    var w = PP.tokens(title), out = [], seen = {};
    for (var n = 2; n <= 4; n++) for (var i = 0; i + n <= Math.min(w.length, 12); i++) {
      var g = w.slice(i, i + n).join(" "); if (!seen[g]) { seen[g] = 1; out.push({ term: g, w: (n === 2 ? 3 : n === 3 ? 2.5 : 1.5) - i * 0.12 }); }
    }
    PP.ngrams(bullets || [], 3).filter(function (g) { return g.words >= 2; }).slice(0, 10).forEach(function (g) { if (!seen[g.term]) { seen[g.term] = 1; out.push({ term: g.term, w: 0.8 + g.docs * 0.2 }); } });
    return out.sort(function (a, b) { return b.w - a.w; }).slice(0, max || 15).map(function (x) { return x.term; });
  };
  var NEG = ["broke", "broken", "breaks", "cheap", "flimsy", "return", "returned", "refund", "poor", "disappoint", "waste", "stopped", "faulty", "defective", "smell", "thin", "weak", "uncomfortable", "difficult", "hard to", "tore", "ripped", "leak", "rust", "wobbl", "squeak", "creak", "noisy", "loud", "missing", "damaged", "terrible", "awful", "worst", "useless", "sagging", "sag", "lumpy", "too small", "too big", "doesn't fit", "not as described", "instructions", "screws", "assembly", "delivery", "late", "scratch", "stain", "peel", "crack", "collapsed", "hurt", "pain", "hot", "sweat"];
  var POS = ["love", "great", "excellent", "perfect", "comfortable", "comfy", "sturdy", "easy", "beautiful", "soft", "quality", "amazing", "recommend", "happy", "worth", "solid", "durable", "gorgeous", "brilliant", "fantastic", "spacious", "quick", "value", "stylish", "looks", "supportive", "firm", "well made", "good sleep", "quiet"];
  PP.reviewThemes = function (text) {
    var t = String(text || "").toLowerCase();
    function count(list) { return list.map(function (w) { var re = new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"); var m = t.match(re); return [w, m ? m.length : 0]; }).filter(function (x) { return x[1] > 0; }).sort(function (a, b) { return b[1] - a[1]; }); }
    return { negative: count(NEG), positive: count(POS), terms: PP.ngrams(t.split(/[.!?\n]+/), 2).slice(0, 30) };
  };

  // Listing quality grade (0-100) — the checks the paid listing analysers run.
  PP.gradeListing = function (l) {
    var tips = [], s = {};
    var title = String(l.title || ""), bullets = (l.bullets || []).filter(Boolean), desc = String(l.description || "");
    var tl = title.length;
    s.title = tl === 0 ? 0 : tl < 80 ? 8 : tl <= 200 ? 15 : 10;
    if (tl === 0) tips.push(["b", "No title", "The title is the biggest ranking factor."]);
    else if (tl < 80) tips.push(["w", "Short title (" + tl + " chars)", "Use 120–200 characters with the main keyword first."]);
    else if (tl > 200) tips.push(["w", "Title over 200 characters", "Amazon may suppress titles over 200 characters."]);
    var bl = bullets.length, good = bullets.filter(function (b) { return b.length >= 120; }).length;
    s.bullets = Math.round(Math.min(bl, 5) / 5 * 10 + Math.min(good, 5) / 5 * 5);
    if (bl < 5) tips.push(["w", "Only " + bl + " bullet points", "Use all 5 — benefit first, then the proof."]);
    else if (good < 4) tips.push(["w", "Thin bullets", "Aim for 150–250 characters per bullet."]);
    var imgs = +l.images || 0;
    s.images = imgs >= 7 ? 15 : imgs >= 5 ? 11 : imgs >= 3 ? 6 : imgs > 0 ? 3 : 0;
    if (l.images != null && imgs < 7) tips.push(["w", imgs + " images", "Use 7+ images incl. lifestyle, infographic and size shots."]);
    s.video = l.video ? 5 : 0; if (l.video === false) tips.push(["w", "No video", "Listings with video convert noticeably better."]);
    s.aplus = l.aplus ? 10 : 0; if (l.aplus === false) tips.push(["w", "No A+ content", "A+ content lifts conversion and helps brand trust."]);
    s.desc = desc.length >= 500 || l.aplus ? 5 : desc.length >= 150 ? 3 : 0;
    var r = +l.rating || 0, n = +l.reviews || 0;
    s.reviews = (r >= 4.5 ? 10 : r >= 4.2 ? 7 : r >= 3.8 ? 4 : r > 0 ? 1 : 0) + (n >= 500 ? 5 : n >= 100 ? 4 : n >= 20 ? 2 : 0);
    if (r > 0 && r < 4.2) tips.push(["b", "Rating " + r.toFixed(1) + "★", "Below 4.2★ hurts conversion — fix the top complaints."]);
    var kws = (l.keywords || []).map(function (k) { return String(k).toLowerCase().trim(); }).filter(Boolean);
    var full = (title + " " + bullets.join(" ") + " " + desc).toLowerCase();
    if (kws.length) {
      var hit = kws.filter(function (k) { return full.indexOf(k) > -1; });
      s.keywords = Math.round(hit.length / kws.length * 15);
      var miss = kws.filter(function (k) { return full.indexOf(k) < 0; });
      if (miss.length) tips.push(["b", miss.length + " keyword" + (miss.length > 1 ? "s" : "") + " missing", miss.slice(0, 8).join(", ")]);
      var tl2 = title.toLowerCase(); if (kws[0] && tl2.indexOf(kws[0]) < 0) tips.push(["w", "Main keyword not in title", "Put “" + kws[0] + "” in the first 80 characters."]);
    } else s.keywords = 10;
    if (!/\d/.test(title + bullets.join(" "))) tips.push(["w", "No numbers", "Dimensions, capacity and counts build trust."]);
    var total = 0; for (var k in s) total += s[k];
    return { score: clamp(Math.round(total), 0, 100), parts: s, tips: tips };
  };

  // ------------------------------------------------------------------ Amazon parsers (DOM)
  function txt(el) { return el ? String(el.textContent || "").replace(/\s+/g, " ").trim() : ""; }
  function q(root, sels) { for (var i = 0; i < sels.length; i++) { var e = root.querySelector(sels[i]); if (e && txt(e)) return e; } return null; }
  PP.isCaptcha = function (doc) { return !!(doc.querySelector('form[action*="validateCaptcha"]') || /Enter the characters you see below|api-services-support@amazon\.com/i.test((doc.body && doc.body.textContent || "").slice(0, 4000))); };

  PP.parseRating = function (s) { s = String(s || ""); var m = s.match(/(\d(?:[.,]\d)?)\s*(?:out of|von|sur|su|de)\s*5/i) || s.match(/^(\d[.,]\d)/); return m ? parseFloat(m[1].replace(",", ".")) : 0; };
  PP.parsePrice = function (s) { s = String(s || ""); var v = PP.num(s); return isFinite(v) ? v : 0; };

  PP.parseSearch = function (doc, mkt) {
    var out = [], seen = {};
    var nodes = doc.querySelectorAll('div[data-component-type="s-search-result"][data-asin], div.s-result-item[data-asin]');
    var orgPos = 0, pos = 0;
    Array.prototype.forEach.call(nodes, function (n) {
      var asin = (n.getAttribute("data-asin") || "").trim();
      if (!/^[A-Z0-9]{10}$/.test(asin)) return;
      if (n.closest && n.closest('[data-component-type="s-search-result"]') !== n && n.getAttribute("data-component-type") !== "s-search-result" && n.querySelector('[data-component-type="s-search-result"]')) return;
      pos++;
      var full = txt(n);
      var sponsored = !!(n.querySelector(".puis-sponsored-label-text, .s-sponsored-label-info-icon, [data-component-type='sp-sponsored-result']") || /AdHolder/.test(n.className) || /^Sponsored\b|\bSponsored\b(?! Products)/.test(full.slice(0, 400)) || /\b(Gesponsert|Sponsorisé|Sponsorizzato|Patrocinado)\b/.test(full.slice(0, 400)));
      if (seen[asin] && sponsored) return;
      // Amazon now shows the brand in its own small h2 above the title: take the h2 with an
      // aria-label, else the longest h2, and treat a separate short h2 as the brand.
      var h2s = Array.prototype.slice.call(n.querySelectorAll("h2"));
      var h2 = h2s.filter(function (e) { return e.getAttribute("aria-label"); })[0] || h2s.sort(function (a, b) { return txt(b).length - txt(a).length; })[0];
      var title = (h2 && (h2.getAttribute("aria-label") || txt(h2))) || txt(n.querySelector("[data-cy='title-recipe'] a span"));
      var brandH2 = h2s.filter(function (e) { return e !== h2 && txt(e).length > 0 && txt(e).length < 40; })[0];
      title = title.replace(/^Sponsored Ad\s*[-–]\s*/i, "");
      var priceEl = n.querySelector(".a-price:not(.a-text-price) .a-offscreen") || n.querySelector(".a-price .a-offscreen") || n.querySelector('[data-cy="secondary-offer-recipe"] .a-color-base');
      var price = priceEl ? PP.parsePrice(txt(priceEl)) : 0;
      var listEl = n.querySelector(".a-price.a-text-price .a-offscreen");
      var ratingEl = n.querySelector("i[class*='a-star'] .a-icon-alt, span[aria-label*=' 5 ']") || n.querySelector("[aria-label*='out of 5']");
      var rating = ratingEl ? PP.parseRating(ratingEl.getAttribute("aria-label") || txt(ratingEl)) : 0;
      var revEl = n.querySelector("a[href*='customerReviews'] span.a-size-base, a[href*='#customerReviews'] span, span.s-underline-text, [data-csa-c-content-id*='ratings-count'] span, [aria-label$='ratings'], [aria-label*='ratings']");
      var reviews = 0;
      if (revEl) { var rt = revEl.getAttribute("aria-label") || txt(revEl); reviews = PP.num(rt.replace(/[()]/g, "")); if (!isFinite(reviews)) reviews = 0; }
      var bm = full.match(/(\d[\d.,]*\s*[Kk]?\+?\s*bought in past month|(?:mehr als|plus de|più di|más de)\s*\d[\d.,]*\s*[Kk]?[^.]{0,40}?(?:gekauft|achet|acquist|comprad)\w*)/i);
      var bought = bm ? PP.parseBought(bm[1]) : 0;
      var img = n.querySelector("img.s-image");
      var a = n.querySelector("h2 a, a.a-link-normal[href*='/dp/'], a[href*='/dp/']");
      var brandEl = n.querySelector("[data-cy='title-recipe'] .a-row .a-size-base-plus.a-color-base, h2 + div .a-size-base-plus, .s-line-clamp-1 > span.a-size-base-plus, .a-row.a-size-base.a-color-secondary > h2 + span");
      var badge = txt(n.querySelector(".a-badge-text")) || (/(Amazon'?s Choice|Best Seller|Overall Pick)/i.exec(full) || [])[1] || "";
      var prime = !!n.querySelector("i.a-icon-prime, [aria-label='Amazon Prime'], .s-prime");
      var coupon = (/Save\s+[^\s]+\s+with coupon|coupon/i.exec(full) || [""])[0];
      if (!sponsored) orgPos++;
      seen[asin] = 1;
      out.push({
        asin: asin, title: title, price: price, listPrice: listEl ? PP.parsePrice(txt(listEl)) : 0,
        rating: rating, reviews: reviews || 0, bought: bought, image: img ? img.getAttribute("src") : "",
        url: a ? a.getAttribute("href") : "/dp/" + asin, brand: brandH2 ? txt(brandH2) : txt(brandEl).length < 40 ? txt(brandEl) : "", sponsored: sponsored,
        position: pos, organicPosition: sponsored ? null : orgPos, badge: badge, prime: prime, coupon: !!coupon
      });
    });
    var info = q(doc, ['[data-component-type="s-result-info-bar"] h1 .a-section span', '[data-component-type="s-result-info-bar"] span', ".s-desktop-toolbar span", "#search .s-breadcrumb span"]);
    var it = info ? txt(info) : "";
    var rc = it.match(/(?:of|von|sur|su|de)\s+(?:over|über|plus de|oltre|más de)?\s*([\d.,\s]+)\s+(?:results|Ergebnis|résultats|risultati|resultados)/i);
    return { items: out, resultCount: rc ? PP.int(rc[1]) : (/(?:over|über|plus de|oltre|más de)?\s*([\d.,]+)\s+(?:results|Ergebnisse)/i.exec(it) ? PP.int(/([\d.,]+)\s+(?:results|Ergebnisse)/i.exec(it)[1]) : null), resultText: it };
  };

  // Product detail key/values from every table/bullet layout Amazon uses.
  PP.detailMap = function (doc) {
    var map = {};
    function put(k, v) { k = String(k || "").replace(/[‎‏:]/g, "").replace(/\s+/g, " ").trim().toLowerCase(); v = String(v || "").replace(/[‎‏]/g, "").replace(/\s+/g, " ").trim(); if (k && v && !map[k]) map[k] = v; }
    Array.prototype.forEach.call(doc.querySelectorAll("#productDetails_techSpec_section_1 tr, #productDetails_techSpec_section_2 tr, #productDetails_detailBullets_sections1 tr, #prodDetails tr, #technicalSpecifications_section_1 tr, #productOverview_feature_div tr, #tech tr, .prodDetTable tr, #poExpander tr"), function (tr) {
      var th = tr.querySelector("th, td.a-span3, td:first-child"), td = tr.querySelector("td:last-child");
      if (th && td && th !== td) put(txt(th), txt(td));
    });
    Array.prototype.forEach.call(doc.querySelectorAll("#detailBullets_feature_div li, #detailBulletsWrapper_feature_div li, #detail-bullets li"), function (li) {
      var b = li.querySelector(".a-text-bold"); if (!b) return;
      var k = txt(b), all = txt(li); put(k, all.slice(all.indexOf(k) + k.length));
    });
    return map;
  };
  function pick(map, keys) { for (var i = 0; i < keys.length; i++) { for (var k in map) if (k.indexOf(keys[i]) === 0 || k === keys[i]) return map[k]; } return ""; }

  PP.parseRanks = function (s) {
    s = String(s || "").replace(/\(.*?\)/g, " ");
    var out = [], re = /(?:#|Nr\.?\s*|n\.?\s*°?\s*|nº\s*)?(\d[\d., \s]*)\s+(?:in|en|dans|di|em)\s+([^#\n]+?)(?=\s*(?:#|Nr\.|n\.\s*°|nº|$|\s\d[\d.,]*\s+(?:in|en|dans|di)\s))/gi, m;
    while ((m = re.exec(s))) { var r = PP.int(m[1]); var c = m[2].replace(/\s+/g, " ").trim(); if (r > 0 && c) out.push({ rank: r, category: c }); }
    return out;
  };

  PP.parseProduct = function (doc, mkt, url) {
    var html = doc.documentElement ? doc.documentElement.innerHTML : "";
    var p = { mkt: mkt };
    var canon = doc.querySelector("link[rel='canonical']");
    p.asin = (doc.querySelector("#ASIN, input[name='ASIN']") || {}).value || PP.extractAsin(url || "") || PP.extractAsin(canon ? canon.getAttribute("href") : "") || "";
    p.title = txt(doc.querySelector("#productTitle, #title"));
    var pe = q(doc, ["#corePrice_feature_div .a-price .a-offscreen", "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen", "#apex_desktop .a-price .a-offscreen", "#price_inside_buybox", "#priceblock_ourprice", "#priceblock_dealprice", "#tp_price_block_total_price_ww .a-offscreen", "#buybox .a-price .a-offscreen", "#centerCol .a-price .a-offscreen"]);
    p.price = pe ? PP.parsePrice(txt(pe)) : 0;
    if (!p.price) { var w = txt(doc.querySelector("#corePriceDisplay_desktop_feature_div .a-price-whole")), f = txt(doc.querySelector("#corePriceDisplay_desktop_feature_div .a-price-fraction")); if (w) p.price = PP.parsePrice(w.replace(/[.,]$/, "") + "." + (f || "00")); }
    var lp = doc.querySelector("#corePriceDisplay_desktop_feature_div .a-text-price .a-offscreen, .basisPrice .a-offscreen");
    p.listPrice = lp ? PP.parsePrice(txt(lp)) : 0;
    var by = txt(doc.querySelector("#bylineInfo"));
    var map = PP.detailMap(doc);
    p.details = map;
    p.brand = pick(map, ["brand", "marke", "marque", "marca", "brand name"]) || by.replace(/^(Visit the|Brand:|Marke:|Besuche den|Visitez la boutique|Visita lo Store di|Visita la tienda de)\s*/i, "").replace(/\s*(Store|-Store|Shop)$/i, "").trim();
    var rEl = doc.querySelector("#acrPopover");
    p.rating = PP.parseRating((rEl && (rEl.getAttribute("title") || txt(rEl))) || txt(doc.querySelector("#averageCustomerReviews .a-icon-alt, [data-hook='rating-out-of-text']")));
    p.reviews = PP.int(txt(doc.querySelector("#acrCustomerReviewText, [data-hook='total-review-count']")).replace(/\(.*\)/, "")) || 0;
    // rank
    var bsrText = pick(map, ["best sellers rank", "best-sellers rank", "amazon bestseller-rang", "classement des meilleures ventes", "posizione nella classifica bestseller", "clasificación en los más vendidos"]);
    if (!bsrText) { var sr = doc.querySelector("#SalesRank, #detailBulletsWrapper_feature_div"); var st = txt(sr); var mm = st.match(/(Best Sellers Rank|Bestseller-Rang|meilleures ventes|classifica Bestseller|más vendidos)[:\s]*(.*)/i); if (mm) bsrText = mm[2]; }
    p.ranks = PP.parseRanks(bsrText);
    p.bsr = p.ranks.length ? p.ranks[0].rank : 0;
    p.rankCategory = p.ranks.length ? p.ranks[0].category : "";
    p.subRanks = p.ranks.slice(1);
    var crumbs = Array.prototype.map.call(doc.querySelectorAll("#wayfinding-breadcrumbs_feature_div li a, #wayfinding-breadcrumbs_container a"), txt).filter(Boolean);
    p.breadcrumbs = crumbs;
    p.category = PP.matchCategory(p.rankCategory || crumbs[0] || "");
    // logistics
    var dimS = pick(map, ["package dimensions", "product dimensions", "item dimensions", "verpackungsabmessungen", "produktabmessungen", "dimensions du colis", "dimensions du produit", "dimensioni del collo", "dimensioni prodotto", "dimensiones del paquete", "dimensiones del producto", "size"]);
    p.dimsText = dimS; p.dims = PP.parseDimsCm(dimS);
    var wS = pick(map, ["item weight", "package weight", "artikelgewicht", "poids de l'article", "peso articolo", "peso del producto", "weight"]) || dimS;
    p.weightText = wS; p.weightKg = PP.parseWeightKg(wS);
    p.dateFirstAvailable = pick(map, ["date first available", "im angebot von amazon.de seit", "date de mise en ligne", "disponibile su amazon.it a partire dal", "producto en amazon.es desde"]);
    p.model = pick(map, ["item model number", "modellnummer", "numéro du modèle", "numero modello", "número de modelo"]);
    p.manufacturer = pick(map, ["manufacturer", "hersteller", "fabricant", "produttore", "fabricante"]);
    // seller / fulfilment
    var soldBy = txt(q(doc, ["#merchantInfoFeature_feature_div .offer-display-feature-text-message", "#sellerProfileTriggerId", "#merchant-info", "#tabular-buybox .tabular-buybox-text[tabular-attribute-name='Sold by']"]));
    var shipsFrom = txt(q(doc, ["#fulfillerInfoFeature_feature_div .offer-display-feature-text-message", "#tabular-buybox .tabular-buybox-text[tabular-attribute-name='Ships from']"]));
    p.soldBy = soldBy; p.shipsFrom = shipsFrom;
    var amazonSells = /^amazon(\.| |$)/i.test(soldBy) || /sold by amazon|verkauf durch amazon|vendu par amazon|venduto da amazon|vendido por amazon/i.test(txt(doc.querySelector("#merchant-info")));
    var fbaShip = /amazon/i.test(shipsFrom) || /fulfilled by amazon|versand durch amazon|expédié par amazon|spedito da amazon|enviado por amazon/i.test(txt(doc.querySelector("#merchant-info")));
    p.sellerType = amazonSells ? "AMZ" : fbaShip ? "FBA" : (soldBy ? "FBM" : "");
    var olp = txt(q(doc, ["#olpLinkWidget_feature_div", "#buybox-see-all-buying-choices", ".olp-text-box", "#aod-ingress-link"]));
    var om = olp.match(/\((\d+)\)/) || olp.match(/(\d+)\s+(?:new|neu|neuf|nuovo|nuevo|offers|Angebote|offres|offerte|ofertas)/i);
    p.offers = om ? parseInt(om[1], 10) + 0 : (soldBy ? 1 : 0);
    p.availability = txt(doc.querySelector("#availability"));
    // listing assets
    p.bullets = Array.prototype.map.call(doc.querySelectorAll("#feature-bullets li span.a-list-item, #featurebullets_feature_div li span.a-list-item"), txt).filter(function (b) { return b && !/^(Make sure this fits|›)/i.test(b); });
    p.description = txt(doc.querySelector("#productDescription"));
    var aplus = doc.querySelector("#aplus .aplus-v2, #aplus_feature_div .aplus-module, #aplusBrandStory_feature_div .aplus-module, #aplus3p_feature_div .aplus-module");
    p.aplus = !!aplus;
    var thumbs = doc.querySelectorAll("#altImages li.imageThumbnail, #altImages li.item:not(.videoThumbnail):not(.videoBlockIngress)");
    p.images = thumbs.length || (html.match(/"hiRes":"https/g) || []).length || (doc.querySelector("#landingImage") ? 1 : 0);
    p.video = !!doc.querySelector("#altImages .videoThumbnail, #altImages .videoBlockIngress, [data-csa-c-content-id*='video']") || /"videos":\[\{/.test(html);
    var li = doc.querySelector("#landingImage, #imgBlkFront");
    p.image = li ? (li.getAttribute("data-old-hires") || li.getAttribute("src") || "") : "";
    // variations
    var dm = html.match(/"dimensionToAsinMap"\s*:\s*\{([^}]*)\}/);
    p.variations = dm ? (dm[1].match(/:/g) || []).length : doc.querySelectorAll("#twister li[data-defaultasin], #twister li[data-asin], [id^='inline-twister'] li[data-asin]").length;
    var pm = html.match(/"parentAsin"\s*:\s*"([A-Z0-9]{10})"/); p.parentAsin = pm ? pm[1] : "";
    // social proof
    p.bought = PP.parseBought(txt(doc.querySelector("#social-proofing-faceout-title-tk_bought, #socialProofingAsinFaceout_feature_div")));
    p.badges = [];
    if (doc.querySelector("#acBadge_feature_div .ac-badge-wrapper, .ac-badge-rectangle")) p.badges.push("Amazon's Choice");
    if (/Best Seller|Bestseller|Meilleure vente|Più venduto|Más vendido/i.test(txt(doc.querySelector("#zeitgeistBadge_feature_div")))) p.badges.push("Best Seller");
    if (/coupon|Gutschein|bon de réduction/i.test(txt(doc.querySelector("#promoPriceBlockMessage_feature_div, #couponBadgeRegularVpc, #vpcButton")))) p.badges.push("Coupon");
    if (doc.querySelector("#dealBadge_feature_div .a-badge, #dealBadgeSupportingText")) p.badges.push("Deal");
    // rating histogram
    var hist = {};
    Array.prototype.forEach.call(doc.querySelectorAll("#histogramTable a[aria-label], #histogramTable li [aria-label], [data-hook='histogram-row'] [aria-label], #histogramTable tr"), function (e) {
      var s = e.getAttribute("aria-label") || txt(e);
      var mm = s.match(/(\d+)\s*(?:percent|%|Prozent|pour cent|per cento|por ciento)[^0-9]*(\d)\s*(?:stars?|Sterne|étoiles|stelle|estrellas)/i) || s.match(/(\d)\s*(?:stars?|Sterne|étoiles|stelle|estrellas)\D+(\d+)\s*%/i);
      if (!mm) return;
      var pct, st;
      if (/percent|%|Prozent|pour cent|per cento|por ciento/i.test(s.split(mm[2])[0] || "") && /^\d+$/.test(mm[1]) && +mm[2] <= 5 && s.indexOf(mm[1]) < s.indexOf(mm[2] + " ")) { pct = +mm[1]; st = +mm[2]; } else { st = +mm[1]; pct = +mm[2]; }
      if (st >= 1 && st <= 5 && hist[st] == null) hist[st] = pct;
    });
    p.histogram = hist;
    // on-page reviews + Amazon AI summary
    p.topReviews = Array.prototype.map.call(doc.querySelectorAll("[data-hook='review']"), function (r) {
      return { rating: PP.parseRating(txt(r.querySelector("[data-hook='review-star-rating'], [data-hook='cmps-review-star-rating'], .review-rating"))), title: txt(r.querySelector("[data-hook='review-title'] span:not(.a-icon-alt):not(.a-letter-space), [data-hook='review-title']")).replace(/^\d[.,]\d out of 5 stars\s*/i, ""), body: txt(r.querySelector("[data-hook='review-body']")), date: txt(r.querySelector("[data-hook='review-date']")), verified: !!r.querySelector("[data-hook='avp-badge']") };
    }).slice(0, 20);
    p.customersSay = txt(doc.querySelector("#product-summary p, [data-hook='cr-product-insights-summary'], #cr-product-insights-cards p"));
    p.aspects = Array.prototype.map.call(doc.querySelectorAll("[data-hook='cr-insights-widget-aspects'] button, #cr-product-insights-cards [aria-label]"), function (b) { return b.getAttribute("aria-label") || txt(b); }).filter(Boolean).slice(0, 12);
    return p;
  };

  // Best Sellers / New Releases / Movers & Shakers pages.
  PP.parseBestsellers = function (doc) {
    var out = [], seen = {};
    var nodes = doc.querySelectorAll("#gridItemRoot, div[id^='p13n-asin-index-'], .zg-grid-general-faceout, li.zg-item-immersion");
    Array.prototype.forEach.call(nodes, function (n) {
      var holder = n.querySelector("[data-asin]") || n;
      var asin = (holder.getAttribute && holder.getAttribute("data-asin")) || "";
      var a = n.querySelector("a[href*='/dp/']");
      if (!/^[A-Z0-9]{10}$/.test(asin) && a) asin = PP.extractAsin(a.getAttribute("href"));
      if (!asin || seen[asin]) return; seen[asin] = 1;
      var rank = PP.int(txt(n.querySelector(".zg-bdg-text, .zg-badge-text")));
      var titleEl = n.querySelector("div[class*='line-clamp'], .p13n-sc-truncate, ._cDEzb_p13n-sc-css-line-clamp-3_g3dy1, a.a-link-normal span div") || (a && a.querySelector("span, div"));
      var img = n.querySelector("img");
      var title = txt(titleEl) || (img ? img.getAttribute("alt") : "");
      var priceEl = n.querySelector("span[class*='p13n-sc-price'], .a-price .a-offscreen, span._cDEzb_p13n-sc-price_3mJ9Z, .p13n-sc-price");
      var rEl = n.querySelector(".a-icon-alt"), revEl = n.querySelector("a[href*='product-reviews'] span.a-size-small, .a-icon-row .a-size-small");
      out.push({ asin: asin, rank: rank || out.length + 1, title: title, price: priceEl ? PP.parsePrice(txt(priceEl)) : 0, rating: rEl ? PP.parseRating(txt(rEl)) : 0, reviews: revEl ? (PP.int(txt(revEl)) || 0) : 0, image: img ? img.getAttribute("src") : "", url: a ? a.getAttribute("href") : "/dp/" + asin });
    });
    var h = txt(doc.querySelector("h1, #zg_banner_text"));
    return { items: out, title: h };
  };

  // Enrich a scraped item with sales, revenue, fees and score.
  PP.enrich = function (x, mkt, opts) {
    opts = opts || {};
    x.mkt = mkt;
    x.category = x.category || PP.matchCategory(x.rankCategory || "");
    var est = PP.estimateSales({ bsr: x.bsr, category: x.category, mkt: mkt, bought: x.bought });
    x.sales = est.units; x.salesLow = est.low; x.salesHigh = est.high; x.salesSource = est.source;
    x.revenue = x.sales * (x.price || 0);
    var fee = PP.fbaFee({ weightKg: x.weightKg, dims: x.dims, price: x.price, mkt: mkt });
    x.fbaFee = isFinite(fee.fee) ? fee.fee : null; x.sizeTier = fee.tier;
    x.referral = PP.referralFee(x.price, x.category, mkt);
    var costPct = opts.costPct != null ? opts.costPct : 25;
    if (x.price > 0) {
      var cost = x.price * costPct / 100;
      var pr = PP.profit({ price: x.price, cost: cost, catName: x.category, mkt: mkt, weightKg: x.weightKg, dims: x.dims, acos: opts.acos || 10, returns: 3 });
      x.netEst = pr.net; x.margin = pr.margin;
    }
    x.score = PP.productScore(x);
    return x;
  };

  // ------------------------------------------------------------------ Keepa
  // Keepa time = minutes since 2011-01-01. Price arrays are [t, v, t, v...] in cents; -1 = none.
  PP.keepaTime = function (km) { return new Date((km + 21564000) * 60000); };
  PP.keepaSeries = function (csv, isPrice) {
    if (!csv || !csv.length) return [];
    var out = [];
    for (var i = 0; i + 1 < csv.length; i += 2) { var v = csv[i + 1]; out.push({ t: PP.keepaTime(csv[i]).getTime(), v: v < 0 ? null : (isPrice ? v / 100 : v) }); }
    return out;
  };
  PP.fromKeepa = function (kp, mkt) {
    // kp = one element of Keepa /product response "products"
    var csv = kp.csv || [], st = kp.stats || {};
    var cur = st.current || [];
    function c(i, price) { var v = cur[i]; return v == null || v < 0 ? 0 : price ? v / 100 : v; }
    var price = c(18, true) || c(1, true) || c(0, true) || c(10, true);
    var x = {
      asin: kp.asin, title: kp.title || "", brand: kp.brand || "", price: price, bsr: c(3, false),
      rating: c(16, false) / 10, reviews: c(17, false), offers: c(11, false),
      bought: kp.monthlySold || 0, image: kp.imagesCSV ? "https://m.media-amazon.com/images/I/" + kp.imagesCSV.split(",")[0] : "",
      rankCategory: (kp.categoryTree && kp.categoryTree[0] && kp.categoryTree[0].name) || "",
      weightKg: kp.packageWeight ? kp.packageWeight / 1000 : (kp.itemWeight ? kp.itemWeight / 1000 : NaN),
      dims: kp.packageLength ? (function () { var d = [kp.packageLength / 10, kp.packageWidth / 10, kp.packageHeight / 10].sort(function (a, b) { return b - a; }); return { l: d[0], w: d[1], h: d[2] }; })() : null,
      sellerType: kp.availabilityAmazon === 0 ? "AMZ" : "",
      history: { amazon: PP.keepaSeries(csv[0], true), new: PP.keepaSeries(csv[1], true), rank: PP.keepaSeries(csv[3], false), buybox: PP.keepaSeries(csv[18] && csv[18].length ? (function () { var a = []; for (var i = 0; i + 2 < csv[18].length; i += 3) { a.push(csv[18][i], csv[18][i + 1]); } return a; })() : [], true), reviews: PP.keepaSeries(csv[17], false), rating: PP.keepaSeries(csv[16], false).map(function (p) { return { t: p.t, v: p.v == null ? null : p.v / 10 }; }), offers: PP.keepaSeries(csv[11], false) },
      monthlySoldHistory: kp.monthlySoldHistory ? (function () { var a = []; for (var i = 0; i + 1 < kp.monthlySoldHistory.length; i += 2) a.push({ t: PP.keepaTime(kp.monthlySoldHistory[i]).getTime(), v: kp.monthlySoldHistory[i + 1] }); return a; })() : [],
      stats: { avg30: st.avg30, avg90: st.avg90, avg180: st.avg180, min: st.min, max: st.max, salesRankDrops30: st.salesRankDrops30, salesRankDrops90: st.salesRankDrops90, salesRankDrops180: st.salesRankDrops180, buyBoxSellerId: st.buyBoxSellerId, outOfStock30: st.outOfStockPercentage30 },
      listedSince: kp.listedSince ? PP.keepaTime(kp.listedSince).toISOString().slice(0, 10) : "",
      variations: kp.variations ? kp.variations.length : 0, fbaFees: kp.fbaFees || null, referralFeePercent: kp.referralFeePercent || null,
      source: "keepa"
    };
    if (kp.fbaFees && kp.fbaFees.pickAndPackFee) x.keepaFbaFee = kp.fbaFees.pickAndPackFee / 100;
    return x;
  };

  // ------------------------------------------------------------------ CSV
  PP.toCSV = function (rows, cols) {
    function cell(v) { v = v == null ? "" : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    return [cols.map(function (c) { return cell(c.label); }).join(",")].concat(rows.map(function (r) { return cols.map(function (c) { return cell(typeof c.get === "function" ? c.get(r) : r[c.key]); }).join(","); })).join("\n");
  };
  PP.XRAY_COLS = [
    { label: "#", key: "position" }, { label: "ASIN", key: "asin" }, { label: "Title", key: "title" }, { label: "Brand", key: "brand" },
    { label: "Price", get: function (r) { return r.price ? r.price.toFixed(2) : ""; } }, { label: "BSR", key: "bsr" }, { label: "Category", key: "rankCategory" },
    { label: "Est. monthly sales", key: "sales" }, { label: "Sales source", key: "salesSource" }, { label: "Bought past month badge", key: "bought" },
    { label: "Est. monthly revenue", get: function (r) { return Math.round(r.revenue || 0); } }, { label: "Reviews", key: "reviews" }, { label: "Rating", key: "rating" },
    { label: "Seller type", key: "sellerType" }, { label: "Offers", key: "offers" }, { label: "Size tier", key: "sizeTier" }, { label: "FBA fee", get: function (r) { return r.fbaFee != null ? r.fbaFee.toFixed(2) : ""; } },
    { label: "Weight kg", get: function (r) { return isFinite(r.weightKg) ? r.weightKg.toFixed(2) : ""; } }, { label: "Variations", key: "variations" }, { label: "Images", key: "images" },
    { label: "Date first available", key: "dateFirstAvailable" }, { label: "Sponsored", get: function (r) { return r.sponsored ? "yes" : ""; } }, { label: "Opportunity score", key: "score" }, { label: "URL", get: function (r) { return PP.urls(r.mkt, r.asin).amazon; } }
  ];

  root.PP = PP;
  if (typeof module !== "undefined" && module.exports) module.exports = PP;
})(typeof globalThis !== "undefined" ? globalThis : this);
