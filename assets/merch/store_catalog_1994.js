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
  const BASELINE_SHIPPING_USD = 6.99;   // Dynamic USPS Ground Advantage starting baseline (Origin: North Port, FL 34286)

  // ========================================================================
  // NERDY MISFITS / RETROCANOPY DYNAMIC USPS GROUND ADVANTAGE CALCULATOR
  // Origin: North Port, FL 34286 (Zones 1..8 by 3-digit ZIP / State + Weight)
  // ========================================================================
  const STATE_TO_USPS_ZONE = {
    FL: 2, GA: 3, SC: 3, AL: 3,
    NC: 4, TN: 4, MS: 4, LA: 4, VA: 4, KY: 4, WV: 4, MD: 4, DC: 4, DE: 4,
    PA: 5, NJ: 5, NY: 5, CT: 5, RI: 5, MA: 5, VT: 5, NH: 5, ME: 5,
    OH: 5, IN: 5, MI: 5, IL: 5, MO: 5, AR: 5, TX: 5,
    WI: 6, MN: 6, IA: 6, KS: 6, NE: 6, SD: 6, ND: 6, OK: 6, NM: 6, CO: 6,
    WY: 7, MT: 7, UT: 7, AZ: 7, ID: 7, NV: 7,
    CA: 8, OR: 8, WA: 8, AK: 8, HI: 8, PR: 8, VI: 8
  };

  // USPS Ground Advantage Commercial Rate Table by Zone (1..8) and Weight Tier (+$2.00 packaging/handling buffer included):
  // Tiers: [<=4.5oz, <=8.5oz, <=12.5oz, <=16oz (1lb), <=32oz (2lb), >32oz base]
  const USPS_GROUND_RATES_BY_ZONE = {
    1: [6.25, 6.65, 7.15, 7.65, 8.45, 9.45],   // Local SWFL (North Port / Sarasota / Fort Myers / Port Charlotte)
    2: [6.49, 6.95, 7.45, 7.99, 8.85, 9.95],   // Rest of Florida
    3: [6.75, 7.25, 7.79, 8.39, 9.35, 10.55],  // Southeast (GA, SC, AL, North FL)
    4: [6.99, 7.55, 8.15, 8.85, 9.95, 11.25],  // Mid-South & Mid-Atlantic
    5: [7.29, 7.89, 8.55, 9.35, 10.65, 12.15], // Northeast, Midwest & East/Central TX
    6: [7.59, 8.25, 8.95, 9.85, 11.35, 13.10], // Plains & Rockies
    7: [7.89, 8.59, 9.39, 10.35, 11.95, 13.95], // Mountain / Inland West
    8: [8.25, 8.99, 9.85, 10.95, 12.75, 14.95]  // West Coast (CA, OR, WA, AK, HI)
  };

  const ITEM_WEIGHT_OZ = {
    hats: 4.5,
    shirts: 6.0,
    hoodies: 16.0,
    joggers: 14.0
  };

  function resolveUspsZoneFromZipOrState(zip5, stateCode) {
    const cleanZip = String(zip5 || '').replace(/\D/g, '').slice(0, 5);
    if (cleanZip.length === 5) {
      const p3 = parseInt(cleanZip.slice(0, 3), 10);
      if (p3 === 342 || p3 === 339 || p3 === 341 || p3 === 335 || p3 === 336 || p3 === 337 || p3 === 338) {
        return { zone: 1, region: 'SWFL Local Zone 1' };
      }
      if (p3 >= 320 && p3 <= 349) {
        return { zone: 2, region: 'Florida Zone 2' };
      }
      if ((p3 >= 290 && p3 <= 319) || (p3 >= 350 && p3 <= 369) || p3 === 398 || p3 === 399) {
        return { zone: 3, region: 'Southeast Zone 3' };
      }
      if ((p3 >= 200 && p3 <= 289) || (p3 >= 370 && p3 <= 427) || (p3 >= 700 && p3 <= 714)) {
        return { zone: 4, region: 'Mid-Atlantic / South Zone 4' };
      }
      if ((p3 >= 10 && p3 <= 199) || (p3 >= 430 && p3 <= 516) || (p3 >= 600 && p3 <= 658) || (p3 >= 716 && p3 <= 779)) {
        return { zone: 5, region: 'Northeast / Midwest Zone 5' };
      }
      if ((p3 >= 520 && p3 <= 599) || (p3 >= 660 && p3 <= 693) || (p3 >= 780 && p3 <= 816) || (p3 >= 870 && p3 <= 884)) {
        return { zone: 6, region: 'Central / Rockies Zone 6' };
      }
      if ((p3 >= 820 && p3 <= 865) || (p3 >= 889 && p3 <= 898) || (p3 >= 970 && p3 <= 994)) {
        return { zone: 7, region: 'Mountain West Zone 7' };
      }
      if ((p3 >= 900 && p3 <= 969) || (p3 >= 995 && p3 <= 999) || (p3 >= 5 && p3 <= 9)) {
        return { zone: 8, region: 'West Coast Zone 8' };
      }
    }
    const st = String(stateCode || '').trim().toUpperCase();
    if (STATE_TO_USPS_ZONE[st]) {
      const z = STATE_TO_USPS_ZONE[st];
      return { zone: z, region: `${st} (Zone ${z})` };
    }
    return null;
  }

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
    STATE_TO_USPS_ZONE,
    USPS_GROUND_RATES_BY_ZONE,
    ITEM_WEIGHT_OZ,
    resolveUspsZoneFromZipOrState,
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
