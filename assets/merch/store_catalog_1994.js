/* ==========================================================================
   RETROCANOPY (EST. 1994) — CURATED BLACK EDITION STORE & PRODUCTION CATALOG
   Selected Capsule: Concepts #01, #12, #18, #19 — Strictly in Black
   Shared across: hat_preview.html, hoodie_preview.html, merch_zoom.js, admin.html
   Pricing Formula: 100% Return (Retail Price = 2.0x Landed Make Cost)
   Checkout Tax & Shipping: 7% Sales Tax + $19.99 Baseline Shipping (if selected)
   ========================================================================== */
(function () {
  const MAKE_COST_STORAGE_KEY = 'rc_owner_make_costs_v1';

  const DEFAULT_MAKE_COSTS = {
    hats: 18.00,    // S&S YP #6006 Black ($8 landed) + 3D Puff Embroidery ($10) = $18 -> $36 Retail
    shirts: 15.00,  // S&S Gildan #5000 Black ($6 landed) + DPW 15x27 DTF ($9 landed) = $15 -> $30 Retail
    hoodies: 25.00, // S&S Gildan #18500 Black ($16 landed) + DPW 15x27 DTF ($9 landed) = $25 -> $50 Retail
    joggers: 26.00  // S&S Lane Seven #LS16006 Black ($20 landed) + DPW Leg DTF ($6 landed) = $26 -> $52 Retail
  };

  const SALES_TAX_RATE = 0.07;          // 7.0% Sales Tax
  const BASELINE_SHIPPING_USD = 19.99;  // $19.99 Baseline Shipping when shipping is wanted

  const DPW_GANG_BUILDER_URL = 'https://digitalprintworx.com/collections/gang-sheet-builders';

  // Strictly curated to the 4 approved Black Edition concepts: #01, #12, #18, #19
  const THEMES_1994 = [
    { num: 1,  title: 'Sovereign 24K Gold Sanctuary' },
    { num: 12, title: 'Royal Rope-Diamond 19 | 94 Dusk Horizon' },
    { num: 18, title: 'Worldwide Meridian Orbital Studio' },
    { num: 19, title: 'Swiss-Grid Architectural Edition 1994' }
  ];

  const SS_BLANKS = {
    hats: {
      black: { label: '🛒 Order Blank Black Hat: YP Classics #6006 (Black, S&S Color #35926)', url: 'https://www.ssactivewear.com/p/yp_classics/6006', itemSpec: 'YP Classics #6006 (Black #35926)' }
    },
    shirts: {
      black: { label: '🛒 Order Blank Black Shirt: Gildan #5000 Heavy Cotton (Black, S&S Color #16787)', url: 'https://www.ssactivewear.com/p/gildan/5000', itemSpec: 'Gildan #5000 5.3 oz. Tee (Black #16787)' }
    },
    hoodies: {
      black: { label: '🛒 Order Blank Black Hoodie: Gildan #18500 Heavy Blend (Black, S&S Color #19728)', url: 'https://www.ssactivewear.com/p/gildan/18500', itemSpec: 'Gildan #18500 8.0 oz. Hoodie (Black #19728)' }
    },
    joggers: {
      black: { label: '🛒 Order Blank Black Joggers: Lane Seven #LS16006 10 oz. Fleece (Black, S&S Color #120451)', url: 'https://www.ssactivewear.com/p/lane_seven/ls16006', itemSpec: 'Lane Seven #LS16006 10 oz. Joggers (Black #120451)' }
    }
  };

  function getMakeCosts() {
    try {
      const saved = JSON.parse(localStorage.getItem(MAKE_COST_STORAGE_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        return {
          hats: Math.max(1, Number(saved.hats) || DEFAULT_MAKE_COSTS.hats),
          shirts: Math.max(1, Number(saved.shirts) || DEFAULT_MAKE_COSTS.shirts),
          hoodies: Math.max(1, Number(saved.hoodies) || DEFAULT_MAKE_COSTS.hoodies),
          joggers: Math.max(1, Number(saved.joggers) || DEFAULT_MAKE_COSTS.joggers)
        };
      }
    } catch (_) {}
    return { ...DEFAULT_MAKE_COSTS };
  }

  function getRetailPrices() {
    const mc = getMakeCosts();
    return {
      hats: Math.round(mc.hats * 200) / 100,
      shirts: Math.round(mc.shirts * 200) / 100,
      hoodies: Math.round(mc.hoodies * 200) / 100,
      joggers: Math.round(mc.joggers * 200) / 100
    };
  }

  function saveMakeCosts(newCosts) {
    const clean = {
      hats: Math.max(1, Number(newCosts.hats) || DEFAULT_MAKE_COSTS.hats),
      shirts: Math.max(1, Number(newCosts.shirts) || DEFAULT_MAKE_COSTS.shirts),
      hoodies: Math.max(1, Number(newCosts.hoodies) || DEFAULT_MAKE_COSTS.hoodies),
      joggers: Math.max(1, Number(newCosts.joggers) || DEFAULT_MAKE_COSTS.joggers)
    };
    try {
      localStorage.setItem(MAKE_COST_STORAGE_KEY, JSON.stringify(clean));
    } catch (_) {}
    rebuildCatalogPrices();
    return clean;
  }

  const CATALOG = {};
  const ORDERED_SKUS = [];
  const V_TAG = '?v=247';

  THEMES_1994.forEach((th) => {
    const pad = String(th.num).padStart(2, '0');
    const col = 'black';
    const colCode = 'BLK';
    const colLabel = 'Black';

    // 1. SNAPBACK HAT (3D Puff & Satin Embroidery on YP #6006 Black)
    const hatSku = `RC-HAT-${pad}-${colCode}`;
    const hatBlank = SS_BLANKS.hats.black;
    CATALOG[hatSku] = {
      model: hatSku,
      category: 'hats',
      setNum: th.num,
      color: col,
      colorLabel: colLabel,
      themeTitle: th.title,
      title: `Black Hat #${pad} — ${th.title}`,
      makeCost: DEFAULT_MAKE_COSTS.hats,
      price: DEFAULT_MAKE_COSTS.hats * 2,
      img: `assets/merch/store_1994/hat_${pad}_black.webp${V_TAG}`,
      heroPhotoUrl: `assets/merch/store_1994/hat_${pad}_black.webp${V_TAG}`,
      frontPhotoUrl: `assets/merch/store_1994/hat_${pad}_black.webp${V_TAG}`,
      backPhotoUrl: '',
      logo300DpiUrl: `assets/production/sets_1994/RC_HAT_${pad}_Embroidery_300DPI.png${V_TAG}`,
      ssBlankLabel: hatBlank.label,
      ssBlankUrl: hatBlank.url,
      dpwBuilderUrl: '',
      productionType: 'EMBROIDERY_DST',
      productionNotes: `Base Blank: ${hatBlank.itemSpec} • 3D Foam Puff & Satin Stitch Embroidery (4.0" Crown Spec • EST. 1994)`,
      productionFiles: [
        { label: `⬇️ Tajima 3D Puff Stitch File (.DST)`, url: `assets/production/sets_1994/RC_HAT_${pad}_3D_Puff.dst${V_TAG}`, filename: `RC_HAT_${pad}_3D_Puff.dst` },
        { label: `⬇️ Vector Embroidery Thread Spec (.SVG)`, url: `assets/production/sets_1994/RC_HAT_${pad}_Embroidery_Spec.svg${V_TAG}`, filename: `RC_HAT_${pad}_Embroidery_Spec.svg` },
        { label: `⬇️ 300-DPI Transparent Crest (.PNG)`, url: `assets/production/sets_1994/RC_HAT_${pad}_Embroidery_300DPI.png${V_TAG}`, filename: `RC_HAT_${pad}_Embroidery_300DPI.png` },
        { label: hatBlank.label, url: hatBlank.url, externalBlank: true }
      ]
    };
    ORDERED_SKUS.push(hatSku);

    // 2. HEAVY COTTON T-SHIRT (Front Left-Chest + Full-Back Knock-Out-Black DTF on Gildan #5000 Black)
    const teeSku = `RC-TEE-${pad}-${colCode}`;
    const teeBlank = SS_BLANKS.shirts.black;
    CATALOG[teeSku] = {
      model: teeSku,
      category: 'shirts',
      setNum: th.num,
      color: col,
      colorLabel: colLabel,
      themeTitle: th.title,
      title: `Black Tee #${pad} — ${th.title}`,
      makeCost: DEFAULT_MAKE_COSTS.shirts,
      price: DEFAULT_MAKE_COSTS.shirts * 2,
      img: `assets/merch/store_1994/shirt_${pad}_black_back.webp${V_TAG}`,
      heroPhotoUrl: `assets/merch/store_1994/shirt_${pad}_black_back.webp${V_TAG}`,
      frontPhotoUrl: `assets/merch/store_1994/shirt_${pad}_black_front.webp${V_TAG}`,
      backPhotoUrl: `assets/merch/store_1994/shirt_${pad}_black_back.webp${V_TAG}`,
      logo300DpiUrl: `assets/production/sets_1994/RC_SET_${pad}_Back_Emblem_DTF_300DPI.png${V_TAG}`,
      ssBlankLabel: teeBlank.label,
      ssBlankUrl: teeBlank.url,
      dpwBuilderUrl: DPW_GANG_BUILDER_URL,
      productionType: 'DTF_PRINT',
      productionNotes: `Base Blank: ${teeBlank.itemSpec} • 4.0" Left-Chest Crest + 12.5"x16" Full-Back DTF • Digital Print Worx 15"x27" ($7.00) Gang Sheet`,
      productionFiles: [
        { label: `⬇️ Front Left-Chest Crest DTF (300 DPI PNG)`, url: `assets/production/sets_1994/RC_SET_${pad}_Front_Crest_DTF_300DPI.png${V_TAG}`, filename: `RC_SET_${pad}_Front_Crest_DTF_300DPI.png` },
        { label: `⬇️ Full-Back Statement DTF (300 DPI PNG)`, url: `assets/production/sets_1994/RC_SET_${pad}_Back_Emblem_DTF_300DPI.png${V_TAG}`, filename: `RC_SET_${pad}_Back_Emblem_DTF_300DPI.png` },
        { label: `⬇️ Digital Print Worx 27"x15" Gang Sheet (PNG)`, url: `assets/production/sets_1994/RC_SET_${pad}_DPW_GangSheet_27x15_DTF.png${V_TAG}`, filename: `RC_SET_${pad}_DPW_GangSheet_27x15_DTF.png` },
        { label: teeBlank.label, url: teeBlank.url, externalBlank: true },
        { label: `🖨️ Order 15"x27" ($7.00) DTF Sheet — Digital Print Worx`, url: DPW_GANG_BUILDER_URL, externalBlank: true }
      ]
    };
    ORDERED_SKUS.push(teeSku);

    // 3. PULLOVER HOODIE (Front Left-Chest + Full-Back Knock-Out-Black DTF on Gildan #18500 Black)
    const hodSku = `RC-HOD-${pad}-${colCode}`;
    const hodBlank = SS_BLANKS.hoodies.black;
    CATALOG[hodSku] = {
      model: hodSku,
      category: 'hoodies',
      setNum: th.num,
      color: col,
      colorLabel: colLabel,
      themeTitle: th.title,
      title: `Black Hoodie #${pad} — ${th.title}`,
      makeCost: DEFAULT_MAKE_COSTS.hoodies,
      price: DEFAULT_MAKE_COSTS.hoodies * 2,
      img: `assets/merch/store_1994/hoodie_${pad}_black_back.webp${V_TAG}`,
      heroPhotoUrl: `assets/merch/store_1994/hoodie_${pad}_black_back.webp${V_TAG}`,
      frontPhotoUrl: `assets/merch/store_1994/hoodie_${pad}_black_front.webp${V_TAG}`,
      backPhotoUrl: `assets/merch/store_1994/hoodie_${pad}_black_back.webp${V_TAG}`,
      logo300DpiUrl: `assets/production/sets_1994/RC_SET_${pad}_Back_Emblem_DTF_300DPI.png${V_TAG}`,
      ssBlankLabel: hodBlank.label,
      ssBlankUrl: hodBlank.url,
      dpwBuilderUrl: DPW_GANG_BUILDER_URL,
      productionType: 'DTF_PRINT',
      productionNotes: `Base Blank: ${hodBlank.itemSpec} • 4.0" Left-Chest Crest + 12.5"x16" Full-Back DTF • Digital Print Worx 15"x27" ($7.00) Gang Sheet`,
      productionFiles: [
        { label: `⬇️ Front Left-Chest Crest DTF (300 DPI PNG)`, url: `assets/production/sets_1994/RC_SET_${pad}_Front_Crest_DTF_300DPI.png${V_TAG}`, filename: `RC_SET_${pad}_Front_Crest_DTF_300DPI.png` },
        { label: `⬇️ Full-Back Statement DTF (300 DPI PNG)`, url: `assets/production/sets_1994/RC_SET_${pad}_Back_Emblem_DTF_300DPI.png${V_TAG}`, filename: `RC_SET_${pad}_Back_Emblem_DTF_300DPI.png` },
        { label: `⬇️ Digital Print Worx 27"x15" Gang Sheet (PNG)`, url: `assets/production/sets_1994/RC_SET_${pad}_DPW_GangSheet_27x15_DTF.png${V_TAG}`, filename: `RC_SET_${pad}_DPW_GangSheet_27x15_DTF.png` },
        { label: hodBlank.label, url: hodBlank.url, externalBlank: true },
        { label: `🖨️ Order 15"x27" ($7.00) DTF Sheet — Digital Print Worx`, url: DPW_GANG_BUILDER_URL, externalBlank: true }
      ]
    };
    ORDERED_SKUS.push(hodSku);
  });

  function rebuildCatalogPrices() {
    const mc = getMakeCosts();
    const rp = getRetailPrices();
    Object.values(CATALOG).forEach((entry) => {
      if (mc[entry.category] !== undefined) {
        entry.makeCost = mc[entry.category];
        entry.price = rp[entry.category];
      }
    });
  }
  rebuildCatalogPrices();

  function getSkuFor(category, setNum) {
    const validNums = [1, 12, 18, 19];
    const n = validNums.includes(parseInt(setNum, 10)) ? parseInt(setNum, 10) : 1;
    const pad = String(n).padStart(2, '0');
    const prefixMap = { hats: 'RC-HAT', shirts: 'RC-TEE', hoodies: 'RC-HOD' };
    const pref = prefixMap[category] || 'RC-HOD';
    return `${pref}-${pad}-BLK`;
  }

  window.RC_STORE_1994 = {
    THEMES: THEMES_1994,
    SS_BLANKS,
    DPW_GANG_BUILDER_URL,
    SALES_TAX_RATE,
    BASELINE_SHIPPING_USD,
    DEFAULT_MAKE_COSTS,
    CATALOG,
    ORDERED_SKUS,
    getMakeCosts,
    getRetailPrices,
    saveMakeCosts,
    rebuildCatalogPrices,
    getSkuFor
  };
})();
