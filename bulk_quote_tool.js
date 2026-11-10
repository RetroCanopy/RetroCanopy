/**
 * RetroCanopy Owner's Hub — Bulk Order Quoting, Branded Receipt & Live Gangsheet Studio (v3)
 *
 * Features:
 *  - Auto Print Placement Sizes:
 *      • Front Right Breast Pocket: Adult 4" × 4" (Youth auto-scales to 3" × 3")
 *      • Full Back:                 Adult 10.5" × 11.5" (Youth auto-scales to 8" × 9")
 *  - Youth + Adult S&S Activewear Dri-Fit Catalog:
 *      • Youth Sizes: YXS, YS, YM, YL, YXL (Team 365 TT11Y #683D9 & CORE365 CE10LY #007A7)
 *      • Adult Sizes: XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL, 6XL (TT11 #671D9 & CE10L #267A7)
 *      • Direct S&S size pricing (no extra larger-size upcharge column — S&S handles size pricing automatically)
 *  - Official Branded Visual Itemized Receipt (On-Screen + Printable/Saveable PDF):
 *      • Features Official RetroCanopy Crest Logo (assets/logo.png)
 *      • Overall Breakdown Per Item (Order-wide per-item averages + Per-Garment/Color summary)
 *      • Complete Line-by-Line Size Itemization
 *      • Discount (% Off + custom label) displayed on receipt & PDF
 *      • Interactive Tax Toggle Button (Include Tax ON / Exclude Tax OFF) + configurable Sales Tax %
 *      • Official S&S Available Color Swatches on Quote PDF
 *  - Customer Info CRM Panel with Real-Time Auto-Save & Saved Directory
 */
(function () {
  'use strict';

  const EDGE_LOOKUP_URL = 'https://axavvrqyzpwsczpiwmua.supabase.co/functions/v1/retrocanopy-bulk-quote-lookup';
  const SAVED_QUOTES_KEY = 'rc_owner_bulk_quotes_v3';
  const LEGACY_QUOTES_KEY = 'rc_owner_bulk_quotes_v2';
  const CUSTOMERS_CRM_KEY = 'rc_owner_bulk_customers_crm_v1';
  const ACTIVE_CUSTOMER_DRAFT_KEY = 'rc_owner_bulk_active_customer_v1';
  const OWNER_RATES_PREF_KEY = 'rc_owner_bulk_rate_prefs_v2';
  const SS_CREDS_KEY = 'rc_owner_ss_api_creds_v1';

  const YOUTH_SIZES = ['YXS', 'YS', 'YM', 'YL', 'YXL'];
  const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];
  const ALL_SIZES = [...YOUTH_SIZES, ...ADULT_SIZES];

  const YOUTH_API_SIZE_MAP = { YXS: 'XS', YS: 'S', YM: 'M', YL: 'L', YXL: 'XL' };

  function getOfficialLogoUrl() {
    try {
      return new URL('assets/logo.png', window.location.href).href;
    } catch (_) {
      return 'assets/logo.png';
    }
  }

  // Official S&S Activewear Verified Catalog (Direct S&S Size Pricing — S&S already prices 2XL-6XL directly)
  const SS_CATALOG = {
    TT11: {
      styleCode: 'TT11',
      youthStyleCode: 'TT11Y',
      itemNumber: '671D9',
      youthItemNumber: '683D9',
      brand: 'Team 365',
      shortLabel: 'Dri-Fit Short Sleeve (Adult TT11 #671D9 / Youth TT11Y #683D9)',
      fullName: 'Team 365 Zone Performance Short Sleeve T-Shirt',
      youthFullName: 'Team 365 Youth Zone Performance Short Sleeve T-Shirt',
      specs: '3.5 oz./yd², 100% Polyester Interlock • Moisture-Wicking • UPF 40+ • Cationic Dyes',
      productUrl: 'https://www.ssactivewear.com/p/team_365/tt11',
      youthProductUrl: 'https://www.ssactivewear.com/p/team_365/tt11y',
      standardAdultBase: 8.30,
      basePrices: {
        YXS: 8.30,
        YS: 8.30,
        YM: 8.30,
        YL: 8.30,
        YXL: 8.30,
        XS: 8.30,
        S: 8.30,
        M: 8.30,
        L: 8.30,
        XL: 8.30,
        '2XL': 10.30,
        '3XL': 14.30,
        '4XL': 16.30,
        '5XL': 18.30,
        '6XL': 20.30
      },
      colors: [
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Black', hex: '#151619' },
        { name: 'Sport Dark Navy', hex: '#132038' },
        { name: 'Sport Royal', hex: '#0046AD' },
        { name: 'Sport Graphite', hex: '#4B4F54' },
        { name: 'Sport Silver', hex: '#B4B7BA' },
        { name: 'Sport Red', hex: '#CE1126' },
        { name: 'Sport Scarlet Red', hex: '#B71234' },
        { name: 'Sport Athletic Gold', hex: '#FFB81C' },
        { name: 'Sport Vegas Gold', hex: '#C5B358' },
        { name: 'Sport Forest', hex: '#1E4D2B' },
        { name: 'Sport Dark Green', hex: '#154734' },
        { name: 'Sport Kelly', hex: '#00843D' },
        { name: 'Sport Purple', hex: '#4E2A84' },
        { name: 'Sport Maroon', hex: '#6F263D' },
        { name: 'Sport Dark Maroon', hex: '#581524' },
        { name: 'Sport Orange', hex: '#F36C21' },
        { name: 'Sport Burnt Orange', hex: '#BF5700' },
        { name: 'Sport Light Blue', hex: '#6CACE4' },
        { name: 'Electric Blue', hex: '#0076CE' },
        { name: 'Clear Teal', hex: '#0099A8' },
        { name: 'Sport Charity Pink', hex: '#F49AC1' },
        { name: 'Bright Magenta', hex: '#D81B7A' },
        { name: 'Melon', hex: '#FF7F6B' },
        { name: 'Acid Green', hex: '#B5E61D' },
        { name: 'Safety Yellow', hex: '#DFFF00' },
        { name: 'Desert Khaki', hex: '#C7B595' },
        { name: 'Coyote Brown', hex: '#7B5E3F' },
        { name: 'Sport Dark Brown', hex: '#4A3525' },
        { name: 'Olive', hex: '#555D3E' }
      ]
    },
    CE10L: {
      styleCode: 'CE10L',
      youthStyleCode: 'CE10LY',
      itemNumber: '267A7',
      youthItemNumber: '007A7',
      brand: 'CORE365',
      shortLabel: 'Dri-Fit Long Sleeve (Adult CE10L #267A7 / Youth CE10LY #007A7)',
      fullName: 'CORE365 Capital Performance Long Sleeve T-Shirt',
      youthFullName: 'CORE365 Youth Capital Performance Long Sleeve T-Shirt',
      specs: '4.0 oz./yd² (140 gsm), 100% Polyester Interlock • Moisture-Wicking • Tear-Away Label',
      productUrl: 'https://www.ssactivewear.com/p/core365/ce10l',
      youthProductUrl: 'https://www.ssactivewear.com/p/core365/ce10ly',
      standardAdultBase: 7.70,
      basePrices: {
        YXS: 7.10,
        YS: 7.10,
        YM: 7.10,
        YL: 7.10,
        YXL: 7.10,
        XS: 7.70,
        S: 7.70,
        M: 7.70,
        L: 7.70,
        XL: 7.70,
        '2XL': 9.70,
        '3XL': 11.70,
        '4XL': 13.70,
        '5XL': 17.70,
        '6XL': 19.70
      },
      colors: [
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Black', hex: '#151619' },
        { name: 'Classic Navy', hex: '#18253B' },
        { name: 'True Royal', hex: '#0047BB' },
        { name: 'Carbon', hex: '#3B3E42' },
        { name: 'Platinum', hex: '#C8CACD' },
        { name: 'Classic Red', hex: '#C8102E' },
        { name: 'Burgundy', hex: '#641C2B' },
        { name: 'Forest', hex: '#1B4332' },
        { name: 'Military Green', hex: '#4B5320' },
        { name: 'Columbia Blue', hex: '#75AADB' },
        { name: 'Clear Teal', hex: '#0099A8' },
        { name: 'Bright Magenta', hex: '#D81B7A' },
        { name: 'Acid Green', hex: '#B5E61D' },
        { name: 'Safety Orange', hex: '#FF6700' },
        { name: 'Safety Yellow', hex: '#DFFF00' }
      ]
    }
  };

  let dpwSheets = [
    { id: 'dpw_27x15_auto', label: '27" × 15" Auto-Builder Sheet', widthIn: 27, lengthIn: 15, priceUsd: 7.00, productUrl: 'https://digitalprintworx.com/products/auto-builder-22x15-22x96', builderType: 'auto', liveVerified: false },
    { id: 'dpw_27x24', label: '27" × 24" Gang Sheet', widthIn: 27, lengthIn: 24, priceUsd: 12.00, productUrl: 'https://digitalprintworx.com/products/upload-your-own-gang-sheet-22x24', builderType: 'upload', liveVerified: false },
    { id: 'dpw_27x36', label: '27" × 36" Gang Sheet', widthIn: 27, lengthIn: 36, priceUsd: 18.00, productUrl: 'https://digitalprintworx.com/products/upload-your-own-gang-sheet-22x36', builderType: 'upload', liveVerified: false },
    { id: 'dpw_27x48', label: '27" × 48" Gang Sheet', widthIn: 27, lengthIn: 48, priceUsd: 23.00, productUrl: 'https://digitalprintworx.com/products/upload-your-own-gang-sheet-22x48', builderType: 'upload', liveVerified: false },
    { id: 'dpw_27x60', label: '27" × 60" Gang Sheet', widthIn: 27, lengthIn: 60, priceUsd: 27.00, productUrl: 'https://digitalprintworx.com/products/upload-your-own-gang-sheet-22x60', builderType: 'upload', liveVerified: false },
    { id: 'dpw_27x96', label: '27" × 96" Gang Sheet', widthIn: 27, lengthIn: 96, priceUsd: 40.50, productUrl: 'https://digitalprintworx.com/products/upload-your-own-gang-sheet-22x96', builderType: 'upload', liveVerified: false },
    { id: 'dpw_22x60_std', label: '22" × 60" Standard DTF Sheet', widthIn: 22, lengthIn: 60, priceUsd: 27.00, productUrl: 'https://digitalprintworx.com/products/22-x-60-dtf-gang-sheet-print', builderType: 'standard22', liveVerified: false }
  ];

  let liveSSData = null;
  let customerSaveTimer = null;

  function makeEmptyQtyMap() {
    const m = {};
    ALL_SIZES.forEach((s) => { m[s] = 0; });
    return m;
  }

  const state = {
    customer: {
      customerId: '',
      fullName: '',
      companyOrTeam: '',
      email: '',
      phone: '',
      address: '',
      projectName: '',
      notes: ''
    },
    ssDiscountPct: 0,
    rollWidthMode: '27',
    includeAutoBuilder15: true,
    gutterIn: 0.25,
    extraSpoilagePrints: 1,
    pressLaborPerShirt: 1.50,
    builtInUpchargePerShirt: 8.00,
    ssShippingOverride: '',
    dpwShippingUsd: 9.95,
    discountPct: 0,
    discountLabel: '',
    includeTax: true,
    taxRatePct: 7.00,
    includeAvailableColorsOnPdf: true,
    garmentLines: [
      {
        id: 'line_1',
        styleCode: 'TT11',
        colorName: 'Black',
        quantities: Object.assign(makeEmptyQtyMap(), { YS: 2, YM: 4, YL: 2, S: 4, M: 8, L: 8, XL: 4, '2XL': 2 })
      }
    ],
    dtfPlacements: [
      {
        id: 'dtf_1',
        enabled: true,
        locationLabel: 'Front Right Breast Pocket',
        adultWidthIn: 4.0,
        adultHeightIn: 4.0,
        youthWidthIn: 3.0,
        youthHeightIn: 3.0,
        lockToPresetBox: true,
        autoTrimTransparent: true,
        fileName: '',
        dataUrl: '',
        trimmedDataUrl: '',
        imgElement: null,
        origPxW: 0,
        origPxH: 0,
        trimPxW: 0,
        trimPxH: 0,
        checkerboardBg: false
      },
      {
        id: 'dtf_2',
        enabled: true,
        locationLabel: 'Full Back',
        adultWidthIn: 10.5,
        adultHeightIn: 11.5,
        youthWidthIn: 8.0,
        youthHeightIn: 9.0,
        lockToPresetBox: true,
        autoTrimTransparent: true,
        fileName: '',
        dataUrl: '',
        trimmedDataUrl: '',
        imgElement: null,
        origPxW: 0,
        origPxH: 0,
        trimPxW: 0,
        trimPxH: 0,
        checkerboardBg: false
      }
    ],
    lastCalculation: null
  };

  let lineCounter = 2;
  let dtfCounter = 3;

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function money(val) {
    const n = Number(val) || 0;
    return '$' + n.toFixed(2);
  }

  function isYouthSize(sz) {
    return YOUTH_SIZES.includes(sz);
  }

  function getBlankUnitPrice(styleCode, colorName, sizeName) {
    const discMultiplier = Math.max(0, 1 - (Number(state.ssDiscountPct) || 0) / 100);
    const cat = SS_CATALOG[styleCode] || SS_CATALOG.TT11;
    const youth = isYouthSize(sizeName);
    const apiStyleKey = youth ? cat.youthStyleCode : cat.styleCode;
    const apiSizeKey = youth ? (YOUTH_API_SIZE_MAP[sizeName] || 'M') : sizeName;

    if (liveSSData && liveSSData[apiStyleKey] && liveSSData[apiStyleKey].colors && liveSSData[apiStyleKey].colors[colorName]) {
      const szObj = liveSSData[apiStyleKey].colors[colorName].sizes[apiSizeKey];
      if (szObj && szObj.price > 0) {
        return +(szObj.price * discMultiplier).toFixed(2);
      }
    }
    const base = cat.basePrices[sizeName] != null ? cat.basePrices[sizeName] : cat.standardAdultBase;
    return +(base * discMultiplier).toFixed(2);
  }

  function getLiveStockBadge(styleCode, colorName, sizeName) {
    const cat = SS_CATALOG[styleCode] || SS_CATALOG.TT11;
    const youth = isYouthSize(sizeName);
    const apiStyleKey = youth ? cat.youthStyleCode : cat.styleCode;
    const apiSizeKey = youth ? (YOUTH_API_SIZE_MAP[sizeName] || 'M') : sizeName;
    if (liveSSData && liveSSData[apiStyleKey] && liveSSData[apiStyleKey].colors && liveSSData[apiStyleKey].colors[colorName]) {
      const szObj = liveSSData[apiStyleKey].colors[colorName].sizes[apiSizeKey];
      if (szObj && typeof szObj.qty === 'number') {
        return szObj.qty;
      }
    }
    return null;
  }

  function getColorsForStyle(styleCode) {
    if (liveSSData && liveSSData[styleCode] && liveSSData[styleCode].colors) {
      const list = Object.values(liveSSData[styleCode].colors).map((c) => ({
        name: c.name,
        hex: c.hex.startsWith('#') ? c.hex : ('#' + c.hex)
      }));
      if (list.length > 0) return list;
    }
    return (SS_CATALOG[styleCode] || SS_CATALOG.TT11).colors;
  }

  function getColorHex(styleCode, colorName) {
    const found = getColorsForStyle(styleCode).find((c) => c.name === colorName);
    return found ? found.hex : '#151619';
  }

  // =========================================================================
  // AUTOMATIC CUSTOMER INFO CRM SAVE & DIRECTORY
  // =========================================================================
  function getSavedCustomersList() {
    try {
      const raw = JSON.parse(localStorage.getItem(CUSTOMERS_CRM_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (_) {
      return [];
    }
  }

  function loadInitialCustomerAndRatePrefs() {
    try {
      const draft = JSON.parse(localStorage.getItem(ACTIVE_CUSTOMER_DRAFT_KEY) || 'null');
      if (draft && typeof draft === 'object') {
        Object.assign(state.customer, draft);
      }
    } catch (_) {}

    try {
      const prefs = JSON.parse(localStorage.getItem(OWNER_RATES_PREF_KEY) || 'null');
      if (prefs && typeof prefs === 'object') {
        if (prefs.pressLaborPerShirt != null) state.pressLaborPerShirt = Number(prefs.pressLaborPerShirt);
        if (prefs.builtInUpchargePerShirt != null) state.builtInUpchargePerShirt = Number(prefs.builtInUpchargePerShirt);
        if (prefs.dpwShippingUsd != null) state.dpwShippingUsd = Number(prefs.dpwShippingUsd);
        if (prefs.ssDiscountPct != null) state.ssDiscountPct = Number(prefs.ssDiscountPct);
        if (prefs.taxRatePct != null) state.taxRatePct = Number(prefs.taxRatePct);
        if (typeof prefs.includeTax === 'boolean') state.includeTax = prefs.includeTax;
      }
    } catch (_) {}
  }

  function saveOwnerRatePrefs() {
    try {
      localStorage.setItem(OWNER_RATES_PREF_KEY, JSON.stringify({
        pressLaborPerShirt: state.pressLaborPerShirt,
        builtInUpchargePerShirt: state.builtInUpchargePerShirt,
        dpwShippingUsd: state.dpwShippingUsd,
        ssDiscountPct: state.ssDiscountPct,
        taxRatePct: state.taxRatePct,
        includeTax: state.includeTax
      }));
    } catch (_) {}
  }

  function triggerAutoSaveCustomer() {
    const badge = document.getElementById('bqCustomerAutoSaveBadge');
    if (badge) {
      badge.textContent = 'Saving customer info...';
      badge.style.color = '#ffe89e';
    }
    if (customerSaveTimer) clearTimeout(customerSaveTimer);
    customerSaveTimer = setTimeout(() => {
      try {
        localStorage.setItem(ACTIVE_CUSTOMER_DRAFT_KEY, JSON.stringify(state.customer));
      } catch (_) {}

      const hasIdentity = Boolean(
        (state.customer.fullName && state.customer.fullName.trim()) ||
        (state.customer.companyOrTeam && state.customer.companyOrTeam.trim()) ||
        (state.customer.email && state.customer.email.trim()) ||
        (state.customer.phone && state.customer.phone.trim())
      );

      if (hasIdentity) {
        const list = getSavedCustomersList();
        if (!state.customer.customerId) {
          state.customer.customerId = 'CUST-' + Date.now();
          try {
            localStorage.setItem(ACTIVE_CUSTOMER_DRAFT_KEY, JSON.stringify(state.customer));
          } catch (_) {}
        }

        const emailClean = (state.customer.email || '').trim().toLowerCase();
        const idx = list.findIndex((c) =>
          c.customerId === state.customer.customerId ||
          (emailClean && (c.email || '').trim().toLowerCase() === emailClean)
        );

        const record = {
          ...state.customer,
          updatedAt: new Date().toISOString(),
          updatedLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (idx >= 0) {
          record.customerId = list[idx].customerId;
          state.customer.customerId = record.customerId;
          list[idx] = record;
        } else {
          list.unshift(record);
        }

        try {
          localStorage.setItem(CUSTOMERS_CRM_KEY, JSON.stringify(list.slice(0, 100)));
        } catch (_) {}

        renderSavedCustomersDropdown();
      }

      if (badge) {
        const tStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        badge.innerHTML = `&#10003; Customer Info Auto-Saved (${tStr})`;
        badge.style.color = '#22f59b';
      }
      recalculateEverything();
    }, 300);
  }

  function renderSavedCustomersDropdown() {
    const sel = document.getElementById('bqSavedCustomerSelect');
    if (!sel) return;
    const list = getSavedCustomersList();
    const opts = [`<option value="">&#128199; Saved Customers (${list.length}) — Select to Auto-Fill...</option>`];
    list.forEach((c) => {
      const labelParts = [c.fullName, c.companyOrTeam, c.phone || c.email].filter(Boolean);
      const selAttr = c.customerId === state.customer.customerId ? 'selected' : '';
      opts.push(`<option value="${esc(c.customerId)}" ${selAttr}>${esc(labelParts.join(' • '))}</option>`);
    });
    sel.innerHTML = opts.join('');
  }

  function syncCustomerInputsFromState() {
    const map = {
      bqCustFullName: state.customer.fullName || '',
      bqCustCompany: state.customer.companyOrTeam || '',
      bqCustEmail: state.customer.email || '',
      bqCustPhone: state.customer.phone || '',
      bqCustAddress: state.customer.address || '',
      bqCustProject: state.customer.projectName || '',
      bqCustNotes: state.customer.notes || ''
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && document.activeElement !== el) el.value = val;
    });
    renderSavedCustomersDropdown();
  }

  // =========================================================================
  // 2D SHELF GANGSHEET PACKER (MIXED ADULT + YOUTH PRINT SIZES)
  // =========================================================================
  function packRectanglesOnRoll(rollWidthIn, gutterIn, itemsToPack) {
    const edgeMargin = 0.25;
    const usableWidth = Math.max(4, rollWidthIn - edgeMargin * 2);

    const instances = [];
    itemsToPack.forEach((p) => {
      if (p.count <= 0) return;
      const w0 = Math.max(0.5, Number(p.widthIn) || 1);
      const h0 = Math.max(0.5, Number(p.heightIn) || 1);

      let bestW = w0;
      let bestH = h0;
      let rotated = false;

      const fitsNormal = w0 <= usableWidth;
      const fitsRot = h0 <= usableWidth;

      if (!fitsNormal && fitsRot) {
        bestW = h0;
        bestH = w0;
        rotated = true;
      } else if (fitsNormal && fitsRot) {
        const colsNormal = Math.max(1, Math.floor((usableWidth + gutterIn) / (w0 + gutterIn)));
        const linearPerItemNormal = (h0 + gutterIn) / colsNormal;
        const colsRot = Math.max(1, Math.floor((usableWidth + gutterIn) / (h0 + gutterIn)));
        const linearPerItemRot = (w0 + gutterIn) / colsRot;
        if (linearPerItemRot < linearPerItemNormal - 0.001) {
          bestW = h0;
          bestH = w0;
          rotated = true;
        }
      }

      const clampedW = Math.min(usableWidth, bestW);
      const clampedH = bestH;

      for (let i = 0; i < p.count; i++) {
        instances.push({
          placementId: p.id,
          placementIdx: p.placementIdx,
          sizeGroup: p.sizeGroup,
          label: p.locationLabel,
          w: clampedW,
          h: clampedH,
          origW: w0,
          origH: h0,
          rotated,
          imgElement: p.imgElement
        });
      }
    });

    instances.sort((a, b) => b.h - a.h || b.w - a.w);

    const shelves = [];
    instances.forEach((inst) => {
      let placed = false;
      for (let s = 0; s < shelves.length; s++) {
        const shelf = shelves[s];
        const nextX = shelf.boxes.length === 0 ? 0 : shelf.usedX + gutterIn;
        if (nextX + inst.w <= usableWidth + 1e-6 && inst.h <= shelf.height + 1e-6) {
          shelf.boxes.push({
            ...inst,
            x: edgeMargin + nextX,
            y: shelf.y
          });
          shelf.usedX = nextX + inst.w;
          placed = true;
          break;
        }
      }

      if (!placed) {
        const newY = shelves.length === 0
          ? edgeMargin
          : shelves[shelves.length - 1].y + shelves[shelves.length - 1].height + gutterIn;
        shelves.push({
          y: newY,
          height: inst.h,
          usedX: inst.w,
          boxes: [{
            ...inst,
            x: edgeMargin,
            y: newY
          }]
        });
      }
    });

    const totalLinearIn = shelves.length === 0
      ? 0
      : shelves[shelves.length - 1].y + shelves[shelves.length - 1].height + edgeMargin;

    const allBoxes = shelves.flatMap((s) => s.boxes);
    const totalInkAreaSqIn = allBoxes.reduce((acc, b) => acc + b.w * b.h, 0);

    return {
      rollWidthIn,
      usableWidth,
      totalLinearIn,
      shelves,
      boxes: allBoxes,
      totalInkAreaSqIn
    };
  }

  function solveOptimalGangSheets(shelves, rollWidthMode, includeAutoBuilder15) {
    if (!shelves || shelves.length === 0) {
      return {
        chosenSheets: [],
        totalDtfCost: 0,
        totalCapacityLinearIn: 0,
        utilizationPct: 0,
        freeRemainingLinearIn: 0,
        sheetAssignments: []
      };
    }

    let candidates = dpwSheets.filter((s) => {
      if (rollWidthMode === '22') return s.widthIn === 22;
      if (s.widthIn !== 27) return false;
      if (!includeAutoBuilder15 && s.builderType === 'auto') return false;
      return true;
    });

    if (candidates.length === 0) candidates = [dpwSheets[4]];

    const N = shelves.length;
    const edgeMargin = 0.25;
    const gutter = Number(state.gutterIn) || 0.25;

    const dp = new Array(N + 1).fill(Infinity);
    const choice = new Array(N + 1).fill(null);
    dp[0] = 0;

    for (let i = 0; i < N; i++) {
      if (dp[i] === Infinity) continue;

      for (const sheet of candidates) {
        const usableLen = sheet.lengthIn - edgeMargin * 2;
        let usedLen = 0;
        let j = i;

        while (j < N) {
          const addLen = (j === i ? 0 : gutter) + shelves[j].height;
          if (usedLen + addLen <= usableLen + 1e-6 || (j === i && shelves[j].height > usableLen)) {
            usedLen += addLen;
            j++;
            const candCost = dp[i] + sheet.priceUsd;
            if (candCost < dp[j] - 1e-6) {
              dp[j] = candCost;
              choice[j] = { prevIdx: i, sheet, usedLen };
            }
            if (j - 1 === i && shelves[i].height > usableLen) break;
          } else {
            break;
          }
        }
      }
    }

    const sheetAssignments = [];
    let cur = N;
    while (cur > 0 && choice[cur]) {
      const step = choice[cur];
      const sliceShelves = shelves.slice(step.prevIdx, cur);
      let localY = edgeMargin;
      const localBoxes = [];
      sliceShelves.forEach((sh, idx) => {
        if (idx > 0) localY += gutter;
        sh.boxes.forEach((b) => {
          localBoxes.push({
            ...b,
            localY
          });
        });
        localY += sh.height;
      });

      sheetAssignments.unshift({
        sheet: step.sheet,
        usedLinearIn: Math.min(step.sheet.lengthIn, localY + edgeMargin),
        boxes: localBoxes
      });
      cur = step.prevIdx;
    }

    const groupedMap = new Map();
    sheetAssignments.forEach((sa) => {
      const prev = groupedMap.get(sa.sheet.id) || { sheet: sa.sheet, qty: 0, subtotal: 0 };
      prev.qty += 1;
      prev.subtotal = +(prev.qty * sa.sheet.priceUsd).toFixed(2);
      groupedMap.set(sa.sheet.id, prev);
    });

    const chosenSheets = Array.from(groupedMap.values()).sort((a, b) => b.sheet.lengthIn - a.sheet.lengthIn);
    const totalDtfCost = +chosenSheets.reduce((s, x) => s + x.subtotal, 0).toFixed(2);
    const totalCapacityLinearIn = sheetAssignments.reduce((s, x) => s + x.sheet.lengthIn, 0);
    const totalUsedLinearIn = sheetAssignments.reduce((s, x) => s + x.usedLinearIn, 0);
    const freeRemainingLinearIn = Math.max(0, totalCapacityLinearIn - totalUsedLinearIn);
    const utilizationPct = totalCapacityLinearIn > 0
      ? Math.min(100, (totalUsedLinearIn / totalCapacityLinearIn) * 100)
      : 0;

    return {
      chosenSheets,
      totalDtfCost,
      totalCapacityLinearIn,
      totalUsedLinearIn,
      utilizationPct,
      freeRemainingLinearIn,
      sheetAssignments
    };
  }

  // =========================================================================
  // UPLOADED ARTWORK ANALYZER
  // =========================================================================
  function analyzeUploadedArtwork(file, placement) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = String(ev.target.result || '');
      const img = new Image();
      img.onload = () => {
        const origW = img.naturalWidth || img.width || 1200;
        const origH = img.naturalHeight || img.height || 1200;

        const maxScan = 1200;
        const scale = Math.min(1, maxScan / Math.max(origW, origH));
        const sw = Math.max(1, Math.round(origW * scale));
        const sh = Math.max(1, Math.round(origH * scale));
        const c = document.createElement('canvas');
        c.width = sw;
        c.height = sh;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, sw, sh);

        let trimX0 = 0, trimY0 = 0, trimX1 = sw - 1, trimY1 = sh - 1;
        let foundInk = false;
        try {
          const imgData = ctx.getImageData(0, 0, sw, sh).data;
          let minX = sw, minY = sh, maxX = 0, maxY = 0;
          for (let y = 0; y < sh; y++) {
            for (let x = 0; x < sw; x++) {
              if (imgData[(y * sw + x) * 4 + 3] > 12) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                foundInk = true;
              }
            }
          }
          if (foundInk && maxX >= minX && maxY >= minY) {
            trimX0 = minX;
            trimY0 = minY;
            trimX1 = maxX;
            trimY1 = maxY;
          }
        } catch (_) {}

        const trimPxW = Math.max(1, Math.round((trimX1 - trimX0 + 1) / scale));
        const trimPxH = Math.max(1, Math.round((trimY1 - trimY0 + 1) / scale));

        let trimmedDataUrl = dataUrl;
        let trimmedImgEl = img;
        if (foundInk) {
          try {
            const cropCanvas = document.createElement('canvas');
            const fullX0 = Math.max(0, Math.floor(trimX0 / scale));
            const fullY0 = Math.max(0, Math.floor(trimY0 / scale));
            const fullW = Math.min(origW - fullX0, trimPxW);
            const fullH = Math.min(origH - fullY0, trimPxH);
            cropCanvas.width = Math.max(1, fullW);
            cropCanvas.height = Math.max(1, fullH);
            cropCanvas.getContext('2d').drawImage(img, fullX0, fullY0, fullW, fullH, 0, 0, fullW, fullH);
            trimmedDataUrl = cropCanvas.toDataURL('image/png');
            const tImg = new Image();
            tImg.src = trimmedDataUrl;
            trimmedImgEl = tImg;
          } catch (_) {}
        }

        placement.fileName = file.name;
        placement.dataUrl = dataUrl;
        placement.trimmedDataUrl = trimmedDataUrl;
        placement.origImgElement = img;
        placement.trimmedImgElement = trimmedImgEl;
        placement.imgElement = placement.autoTrimTransparent ? trimmedImgEl : img;
        placement.origPxW = origW;
        placement.origPxH = origH;
        placement.trimPxW = trimPxW;
        placement.trimPxH = trimPxH;
        placement.enabled = true;

        if (!placement.lockToPresetBox) {
          const useW = placement.autoTrimTransparent ? trimPxW : origW;
          const useH = placement.autoTrimTransparent ? trimPxH : origH;
          placement.adultWidthIn = Math.min(26, Math.max(1, +(useW / 300).toFixed(2)));
          placement.adultHeightIn = Math.min(90, Math.max(1, +(useH / 300).toFixed(2)));
          placement.youthWidthIn = +(placement.adultWidthIn * 0.76).toFixed(2);
          placement.youthHeightIn = +(placement.adultHeightIn * 0.78).toFixed(2);
        }

        renderDtfPlacementsList();
        recalculateEverything();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function drawContainImage(ctx, img, x, y, boxW, boxH) {
    const iw = img.naturalWidth || img.width || 1;
    const ih = img.naturalHeight || img.height || 1;
    const scale = Math.min(boxW / iw, boxH / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = x + (boxW - dw) / 2;
    const dy = y + (boxH - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // =========================================================================
  // FULL CALCULATION: DIRECT S&S PRICING, PER-ITEM OVERALL BREAKDOWN, DISCOUNT & TAX
  // =========================================================================
  function recalculateEverything() {
    let totalAdultShirts = 0;
    let totalYouthShirts = 0;
    let blanksSubtotal = 0;

    const rawItems = [];

    state.garmentLines.forEach((line) => {
      const cat = SS_CATALOG[line.styleCode] || SS_CATALOG.TT11;
      const colorHex = getColorHex(line.styleCode, line.colorName);
      let lineQty = 0;
      let lineBlankSub = 0;

      ALL_SIZES.forEach((sz) => {
        const q = Math.max(0, parseInt(line.quantities[sz], 10) || 0);
        if (q <= 0) return;

        const youth = isYouthSize(sz);
        if (youth) totalYouthShirts += q;
        else totalAdultShirts += q;

        // Direct S&S Blank Cost (S&S already prices 2XL-6XL directly)
        const unitBlankCost = getBlankUnitPrice(line.styleCode, line.colorName, sz);
        const subBlank = +(q * unitBlankCost).toFixed(2);

        lineQty += q;
        lineBlankSub += subBlank;

        rawItems.push({
          lineId: line.id,
          styleCode: youth ? cat.youthStyleCode : cat.styleCode,
          parentStyleCode: line.styleCode,
          itemNumber: youth ? cat.youthItemNumber : cat.itemNumber,
          brand: cat.brand,
          garmentTitle: youth ? cat.youthFullName : cat.fullName,
          productUrl: youth ? cat.youthProductUrl : cat.productUrl,
          colorName: line.colorName,
          colorHex,
          sizeName: sz,
          isYouth: youth,
          qty: q,
          unitBlankCost,
          subBlank
        });
      });

      blanksSubtotal += lineBlankSub;

      const rowQtyEl = document.getElementById(`bqLineQty_${line.id}`);
      const rowSubEl = document.getElementById(`bqLineSub_${line.id}`);
      if (rowQtyEl) rowQtyEl.textContent = `${lineQty} pcs`;
      if (rowSubEl) rowSubEl.textContent = `Blanks: ${money(lineBlankSub)}`;
    });

    blanksSubtotal = +blanksSubtotal.toFixed(2);
    const totalShirts = totalAdultShirts + totalYouthShirts;

    // 2. Build Adult + Youth DTF Packing List
    const activePlacements = state.dtfPlacements.filter((p) => p.enabled !== false);
    const extraSpoilage = Math.max(0, parseInt(state.extraSpoilagePrints, 10) || 0);
    const extraYouth = totalYouthShirts > 0 ? Math.min(extraSpoilage, Math.max(1, Math.round(extraSpoilage * (totalYouthShirts / Math.max(1, totalShirts))))) : 0;
    const extraAdult = totalAdultShirts > 0 ? extraSpoilage : 0;

    const itemsToPack = [];
    activePlacements.forEach((p, pIdx) => {
      if (totalAdultShirts > 0) {
        itemsToPack.push({
          id: p.id + '_adult',
          placementIdx: pIdx,
          sizeGroup: 'ADULT',
          locationLabel: `${p.locationLabel} (Adult)`,
          widthIn: Math.max(0.5, Number(p.adultWidthIn) || 4),
          heightIn: Math.max(0.5, Number(p.adultHeightIn) || 4),
          count: totalAdultShirts + extraAdult,
          imgElement: p.imgElement
        });
      }
      if (totalYouthShirts > 0) {
        itemsToPack.push({
          id: p.id + '_youth',
          placementIdx: pIdx,
          sizeGroup: 'YOUTH',
          locationLabel: `${p.locationLabel} (Youth)`,
          widthIn: Math.max(0.5, Number(p.youthWidthIn) || 3),
          heightIn: Math.max(0.5, Number(p.youthHeightIn) || 3),
          count: totalYouthShirts + extraYouth,
          imgElement: p.imgElement
        });
      }
    });

    const rollWidthNum = state.rollWidthMode === '22' ? 22 : 27;
    const packRes = packRectanglesOnRoll(rollWidthNum, Math.max(0, Number(state.gutterIn) || 0.25), itemsToPack);
    const sheetSolution = solveOptimalGangSheets(packRes.shelves, state.rollWidthMode, state.includeAutoBuilder15);

    // 3. Freight, Pressing & Built-In Per-Shirt Base Upcharge
    let ssShippingUsd = 0;
    if (totalShirts > 0) {
      if (String(state.ssShippingOverride).trim() !== '') {
        ssShippingUsd = Math.max(0, Number(state.ssShippingOverride) || 0);
      } else {
        ssShippingUsd = blanksSubtotal >= 200 ? 0 : 14.95;
      }
    }

    const dpwShippingUsd = (totalShirts > 0 && sheetSolution.totalDtfCost > 0)
      ? Math.max(0, Number(state.dpwShippingUsd) || 0)
      : 0;

    const pressPerShirt = Math.max(0, Number(state.pressLaborPerShirt) || 0);
    const totalPressLaborUsd = +(totalShirts * pressPerShirt).toFixed(2);

    const totalHardCostUsd = +(
      blanksSubtotal +
      ssShippingUsd +
      sheetSolution.totalDtfCost +
      dpwShippingUsd +
      totalPressLaborUsd
    ).toFixed(2);

    const avgHardCostPerShirt = totalShirts > 0 ? totalHardCostUsd / totalShirts : 0;
    const dtfCostPerShirt = totalShirts > 0 ? sheetSolution.totalDtfCost / totalShirts : 0;

    const builtInUpcharge = Math.max(0, Number(state.builtInUpchargePerShirt) || 0);
    const sharedProductionAndBuiltInPerShirt = totalShirts > 0
      ? ((ssShippingUsd + sheetSolution.totalDtfCost + dpwShippingUsd + totalPressLaborUsd) / totalShirts) + builtInUpcharge
      : 0;

    // 4. Build Clean Itemized Line-by-Line Rows (Direct S&S Size Cost + Built-In Production/Upcharge)
    let subtotalBeforeDiscount = 0;
    const itemizedLines = rawItems.map((item, idx) => {
      const printSpecSummary = activePlacements.length > 0
        ? activePlacements.map((p) => {
            const w = item.isYouth ? p.youthWidthIn : p.adultWidthIn;
            const h = item.isYouth ? p.youthHeightIn : p.adultHeightIn;
            return `${p.locationLabel} (${w}"×${h}")`;
          }).join(' + ')
        : 'Blank Garment Only';

      const unitPriceQuoted = +(item.unitBlankCost + sharedProductionAndBuiltInPerShirt).toFixed(2);
      const lineTotalQuoted = +(unitPriceQuoted * item.qty).toFixed(2);
      subtotalBeforeDiscount += lineTotalQuoted;

      return {
        lineNumber: idx + 1,
        ...item,
        printSpecSummary,
        unitPriceQuoted,
        lineTotalQuoted
      };
    });

    subtotalBeforeDiscount = +subtotalBeforeDiscount.toFixed(2);

    // 5. Discount (% Off) & Sales Tax Toggle Calculations
    const discountPct = Math.min(100, Math.max(0, Number(state.discountPct) || 0));
    const discountLabel = (state.discountLabel || '').trim() || 'Promotional Discount';
    const discountAmountUsd = +(subtotalBeforeDiscount * (discountPct / 100)).toFixed(2);
    const subtotalAfterDiscount = Math.max(0, +(subtotalBeforeDiscount - discountAmountUsd).toFixed(2));

    const includeTax = Boolean(state.includeTax);
    const taxRatePct = Math.min(25, Math.max(0, Number(state.taxRatePct) || 0));
    const taxAmountUsd = includeTax ? +(subtotalAfterDiscount * (taxRatePct / 100)).toFixed(2) : 0;
    const customerQuoteTotal = +(subtotalAfterDiscount + taxAmountUsd).toFixed(2);

    // True net profit is pre-tax net revenue minus hard costs (tax collected is remitted to state)
    const netProfitUsd = +(subtotalAfterDiscount - totalHardCostUsd).toFixed(2);

    // 6. Overall Per-Item Breakdown (Order-Wide + Grouped by Garment/Color Item)
    const avgItemPreDiscount = totalShirts > 0 ? +(subtotalBeforeDiscount / totalShirts).toFixed(2) : 0;
    const avgItemAfterDiscount = totalShirts > 0 ? +(subtotalAfterDiscount / totalShirts).toFixed(2) : 0;
    const avgItemAllInFinal = totalShirts > 0 ? +(customerQuoteTotal / totalShirts).toFixed(2) : 0;

    const groupMap = new Map();
    itemizedLines.forEach((row) => {
      const gKey = row.lineId;
      if (!groupMap.has(gKey)) {
        const cat = SS_CATALOG[row.parentStyleCode] || SS_CATALOG.TT11;
        groupMap.set(gKey, {
          lineId: row.lineId,
          brand: cat.brand,
          adultStyleCode: cat.styleCode,
          youthStyleCode: cat.youthStyleCode,
          fullName: cat.fullName,
          colorName: row.colorName,
          colorHex: row.colorHex,
          hasAdult: false,
          hasYouth: false,
          totalQty: 0,
          sizePairs: [],
          groupSubtotalPreDiscount: 0
        });
      }
      const g = groupMap.get(gKey);
      if (row.isYouth) g.hasYouth = true;
      else g.hasAdult = true;
      g.totalQty += row.qty;
      g.sizePairs.push(`${row.sizeName}×${row.qty}`);
      g.groupSubtotalPreDiscount = +(g.groupSubtotalPreDiscount + row.lineTotalQuoted).toFixed(2);
    });

    const itemOverallGroups = Array.from(groupMap.values()).map((g) => {
      const styleBadge = g.hasAdult && g.hasYouth
        ? `${g.adultStyleCode} / ${g.youthStyleCode}`
        : (g.hasYouth ? g.youthStyleCode : g.adultStyleCode);
      const groupAfterDisc = +(g.groupSubtotalPreDiscount * (1 - discountPct / 100)).toFixed(2);
      const avgPre = g.totalQty > 0 ? +(g.groupSubtotalPreDiscount / g.totalQty).toFixed(2) : 0;
      const avgAfter = g.totalQty > 0 ? +(groupAfterDisc / g.totalQty).toFixed(2) : 0;
      const groupWithTax = includeTax ? +(groupAfterDisc * (1 + taxRatePct / 100)).toFixed(2) : groupAfterDisc;
      const avgAllIn = g.totalQty > 0 ? +(groupWithTax / g.totalQty).toFixed(2) : 0;

      return {
        ...g,
        styleBadge,
        sizeBreakdownStr: g.sizePairs.join(', '),
        avgPerItemPreDiscount: avgPre,
        groupSubtotalAfterDiscount: groupAfterDisc,
        avgPerItemAfterDiscount: avgAfter,
        avgPerItemAllIn: avgAllIn
      };
    });

    state.lastCalculation = {
      totalShirts,
      totalAdultShirts,
      totalYouthShirts,
      blanksSubtotal,
      ssShippingUsd,
      dpwShippingUsd,
      totalPressLaborUsd,
      dtfCostPerShirt,
      totalHardCostUsd,
      avgHardCostPerShirt,
      subtotalBeforeDiscount,
      discountPct,
      discountLabel,
      discountAmountUsd,
      subtotalAfterDiscount,
      includeTax,
      taxRatePct,
      taxAmountUsd,
      customerQuoteTotal,
      avgItemPreDiscount,
      avgItemAfterDiscount,
      avgItemAllInFinal,
      netProfitUsd,
      builtInUpcharge,
      packRes,
      sheetSolution,
      activePlacements,
      itemizedLines,
      itemOverallGroups
    };

    renderSummaryAndCanvas();
  }

  // =========================================================================
  // RENDER BRANDED ITEMIZED RECEIPT, PER-ITEM BREAKDOWN & GANGSHEET CANVAS
  // =========================================================================
  function syncTaxToggleUi() {
    const btn = document.getElementById('bqTaxToggleBtn');
    const lbl = document.getElementById('bqTaxToggleLabel');
    const rateInput = document.getElementById('bqTaxRateInput');
    if (btn) {
      btn.classList.toggle('is-off', !state.includeTax);
      btn.setAttribute('aria-pressed', state.includeTax ? 'true' : 'false');
    }
    if (lbl) {
      lbl.textContent = state.includeTax
        ? `SALES TAX: INCLUDED (${Number(state.taxRatePct || 0).toFixed(2)}%)`
        : 'SALES TAX: EXCLUDED / EXEMPT';
    }
    if (rateInput) {
      rateInput.style.opacity = state.includeTax ? '1' : '0.45';
    }

    document.querySelectorAll('[data-disc-preset]').forEach((chip) => {
      const pVal = parseFloat(chip.getAttribute('data-disc-preset')) || 0;
      chip.classList.toggle('active', Math.abs((Number(state.discountPct) || 0) - pVal) < 0.01);
    });
  }

  function renderSummaryAndCanvas() {
    const calc = state.lastCalculation;
    if (!calc) return;

    syncTaxToggleUi();

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('bqKpiTotalShirts', `${calc.totalShirts} (${calc.totalAdultShirts}A / ${calc.totalYouthShirts}Y)`);
    setTxt('bqKpiBlanksCost', money(calc.blanksSubtotal));
    setTxt('bqKpiDtfCost', money(calc.sheetSolution.totalDtfCost));
    setTxt('bqKpiHardCostPerShirt', `${money(calc.avgHardCostPerShirt)} / ea`);
    setTxt('bqKpiQuoteTotal', money(calc.customerQuoteTotal));
    setTxt('bqKpiNetProfit', `${calc.netProfitUsd >= 0 ? '+' : ''}${money(calc.netProfitUsd)}`);

    setTxt(
      'bqGangsheetStatsLine',
      calc.totalShirts > 0 && calc.activePlacements.length > 0
        ? `${calc.packRes.boxes.length} total transfers (${calc.totalAdultShirts} Adult + ${calc.totalYouthShirts} Youth + spares) • ${calc.packRes.totalLinearIn.toFixed(1)}" linear film on ${calc.packRes.rollWidthIn}" roll • ${calc.sheetSolution.utilizationPct.toFixed(1)}% sheet fill (${calc.sheetSolution.freeRemainingLinearIn.toFixed(1)}" free film left)`
        : 'Add shirt quantities & active placements to pack Adult (4"×4" / 10.5"×11.5") & Youth (3"×3" / 8"×9") transfers.'
    );

    const recEl = document.getElementById('bqRecommendedSheetsBox');
    if (recEl) {
      if (calc.sheetSolution.chosenSheets.length === 0) {
        recEl.innerHTML = `<div style="font-size:0.78rem;color:rgba(255,255,255,0.62);">Add shirts above to compute exact DigitalPrintWorx gangsheet sizes &amp; live pricing.</div>`;
      } else {
        const rowsHtml = calc.sheetSolution.chosenSheets.map((cs) => `
          <div class="bq-sheet-order-row">
            <div>
              <strong style="color:#ffe89e;">${cs.qty} &times; ${esc(cs.sheet.label)}</strong>
              <span style="font-size:0.72rem;color:rgba(255,255,255,0.68);margin-left:6px;">(${money(cs.sheet.priceUsd)} each${cs.sheet.liveVerified ? ' &bull; <span style="color:#22f59b;">LIVE</span>' : ''})</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <strong style="color:#22f59b;">${money(cs.subtotal)}</strong>
              <a href="${esc(cs.sheet.productUrl)}" target="_blank" rel="noopener noreferrer" class="mini-btn" style="padding:4px 10px;font-size:0.68rem;text-decoration:none;color:#2ce6ff;">Order on DigitalPrintWorx &nearr;</a>
            </div>
          </div>
        `).join('');

        recEl.innerHTML = `
          ${rowsHtml}
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;margin-top:6px;border-top:1px solid rgba(255,255,255,0.14);font-size:0.78rem;">
            <span style="color:rgba(255,255,255,0.78);">Optimal DTF Gangsheet Total (${money(calc.dtfCostPerShirt)} / shirt):</span>
            <strong style="font-size:0.95rem;color:#2ce6ff;">${money(calc.sheetSolution.totalDtfCost)}</strong>
          </div>
        `;
      }
    }

    // Visually Appealing Official Branded Receipt Card + Per-Item Overall Breakdown + Private Owner Ledger
    const finEl = document.getElementById('bqFinancialBreakdownBody');
    if (finEl) {
      const logoUrl = getOfficialLogoUrl();
      const c = state.customer;
      const clientHeadline = [c.fullName, c.companyOrTeam].filter(Boolean).join(' • ') || 'Valued RetroCanopy Client';
      const projectHeadline = c.projectName || 'Custom Performance Apparel Order';
      const ssShipNote = calc.blanksSubtotal >= 200 && String(state.ssShippingOverride).trim() === ''
        ? 'FREE ($200+ S&S Order)'
        : money(calc.ssShippingUsd);

      const overallGroupRowsHtml = calc.itemOverallGroups.map((g) => `
        <tr>
          <td style="padding:7px 8px;border-bottom:1px solid rgba(255,255,255,0.08);">
            <div style="display:flex;align-items:center;gap:7px;">
              <span style="width:12px;height:12px;border-radius:50%;background:${esc(g.colorHex)};border:1px solid rgba(255,255,255,0.55);display:inline-block;flex-shrink:0;"></span>
              <strong style="color:#ffffff;">${esc(g.brand)} ${esc(g.styleBadge)}</strong>
              <span style="color:#ffe89e;font-size:0.72rem;">&bull; ${esc(g.colorName)}</span>
            </div>
            <div style="font-size:0.67rem;color:rgba(255,255,255,0.62);margin-top:2px;">Sizes: ${esc(g.sizeBreakdownStr)}</div>
          </td>
          <td style="padding:7px 6px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center;font-weight:800;color:#2ce6ff;">${g.totalQty} pcs</td>
          <td style="padding:7px 6px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:right;font-weight:700;color:#ffe89e;">${money(calc.discountPct > 0 ? g.avgPerItemAfterDiscount : g.avgPerItemPreDiscount)} / ea</td>
          <td style="padding:7px 8px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:right;font-weight:800;color:#22f59b;">${money(calc.discountPct > 0 ? g.groupSubtotalAfterDiscount : g.groupSubtotalPreDiscount)}</td>
        </tr>
      `).join('');

      const itemizedTableRows = calc.itemizedLines.map((row) => `
        <tr>
          <td style="padding:7px 8px;border-bottom:1px solid rgba(255,255,255,0.08);">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="width:10px;height:10px;border-radius:50%;background:${esc(row.colorHex)};border:1px solid rgba(255,255,255,0.5);display:inline-block;flex-shrink:0;"></span>
              <strong style="color:#ffffff;">${esc(row.brand)} ${esc(row.styleCode)}</strong>
              <span style="font-size:0.67rem;color:#2ce6ff;">#${esc(row.itemNumber)}</span>
              <span style="font-size:0.7rem;color:#ffe89e;">&bull; ${esc(row.colorName)}</span>
            </div>
            <div style="font-size:0.66rem;color:rgba(255,255,255,0.62);margin-top:1px;">${esc(row.printSpecSummary)}</div>
          </td>
          <td style="padding:7px 6px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center;font-weight:800;color:${row.isYouth ? '#2ce6ff' : '#ffe89e'};">${esc(row.sizeName)}</td>
          <td style="padding:7px 6px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center;font-weight:700;">${row.qty}</td>
          <td style="padding:7px 6px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:right;font-weight:700;color:#22f59b;">${money(row.unitPriceQuoted)}</td>
          <td style="padding:7px 8px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:right;font-weight:800;color:#ffffff;">${money(row.lineTotalQuoted)}</td>
        </tr>
      `).join('');

      const discountRowHtml = calc.discountPct > 0 ? `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:rgba(34,245,155,0.12);border:1px solid rgba(34,245,155,0.38);border-radius:9px;color:#6bffc3;font-size:0.78rem;margin:4px 0;">
          <span>&#127991;&#65039; <strong>${esc(calc.discountLabel)} (${calc.discountPct}% OFF)</strong></span>
          <strong>&minus;${money(calc.discountAmountUsd)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.76rem;color:rgba(255,255,255,0.84);padding:2px 0;">
          <span>Discounted Subtotal (${money(calc.avgItemAfterDiscount)} avg / item):</span>
          <strong>${money(calc.subtotalAfterDiscount)}</strong>
        </div>
      ` : '';

      const taxRowHtml = calc.includeTax ? `
        <div style="display:flex;justify-content:space-between;font-size:0.76rem;color:rgba(255,255,255,0.82);padding:3px 0;">
          <span>Estimated Sales Tax (${calc.taxRatePct.toFixed(2)}%):</span>
          <strong>${money(calc.taxAmountUsd)}</strong>
        </div>
      ` : `
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#ffb8dc;padding:3px 0;">
          <span>Sales Tax (Excluded / Tax-Exempt):</span>
          <strong>$0.00</strong>
        </div>
      `;

      finEl.innerHTML = `
        <div class="bq-branded-receipt">
          <!-- OFFICIAL RETROCANOPY LOGO & RECEIPT HEADER -->
          <div class="bq-receipt-banner">
            <div class="bq-receipt-logo-wrap">
              <img src="${esc(logoUrl)}" alt="RetroCanopy Official Logo" class="bq-receipt-logo">
              <div>
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.95rem;letter-spacing:0.08em;color:#ffe89e;">RETROCANOPY</div>
                <div style="font-size:0.68rem;color:#2ce6ff;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Official Custom Apparel Quote &amp; Itemized Receipt</div>
                <div style="font-size:0.68rem;color:rgba(255,255,255,0.72);margin-top:2px;">${esc(projectHeadline)} &bull; ${esc(clientHeadline)}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.64rem;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.6);">Grand Total</div>
              <div style="font-family:'Orbitron',sans-serif;font-size:1.22rem;font-weight:900;color:#22f59b;">${money(calc.customerQuoteTotal)}</div>
              <div style="font-size:0.67rem;color:#ffe89e;font-weight:700;">${money(calc.avgItemAllInFinal)} / item overall</div>
            </div>
          </div>

          <div style="padding:13px 15px;">
            <!-- OVERALL BREAKDOWN PER ITEM KPI STRIP -->
            <div style="font-size:0.68rem;font-weight:800;color:#2ce6ff;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">
              &#128202; Overall Breakdown Per Item
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(115px,1fr));gap:7px;margin-bottom:12px;">
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.13);border-radius:10px;padding:7px 9px;">
                <div style="font-size:0.62rem;color:rgba(255,255,255,0.6);text-transform:uppercase;">Total Quantity</div>
                <div style="font-size:0.86rem;font-weight:800;color:#ffffff;">${calc.totalShirts} Items</div>
                <div style="font-size:0.62rem;color:#2ce6ff;">${calc.totalAdultShirts} Adult &bull; ${calc.totalYouthShirts} Youth</div>
              </div>
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.13);border-radius:10px;padding:7px 9px;">
                <div style="font-size:0.62rem;color:rgba(255,255,255,0.6);text-transform:uppercase;">Avg / Item (Base)</div>
                <div style="font-size:0.86rem;font-weight:800;color:#ffe89e;">${money(calc.avgItemPreDiscount)}</div>
                <div style="font-size:0.62rem;color:rgba(255,255,255,0.55);">Before discount/tax</div>
              </div>
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.13);border-radius:10px;padding:7px 9px;">
                <div style="font-size:0.62rem;color:rgba(255,255,255,0.6);text-transform:uppercase;">After ${calc.discountPct}% Off</div>
                <div style="font-size:0.86rem;font-weight:800;color:#6bffc3;">${money(calc.avgItemAfterDiscount)}</div>
                <div style="font-size:0.62rem;color:rgba(255,255,255,0.55);">Net per shirt</div>
              </div>
              <div style="background:rgba(34,245,155,0.09);border:1px solid rgba(34,245,155,0.35);border-radius:10px;padding:7px 9px;">
                <div style="font-size:0.62rem;color:#6bffc3;text-transform:uppercase;font-weight:700;">All-In / Item</div>
                <div style="font-size:0.88rem;font-weight:900;color:#22f59b;">${money(calc.avgItemAllInFinal)}</div>
                <div style="font-size:0.62rem;color:rgba(255,255,255,0.68);">${calc.includeTax ? `Incl. ${calc.taxRatePct.toFixed(2)}% tax` : 'Tax excluded'}</div>
              </div>
            </div>

            <!-- PER-GARMENT / COLOR OVERALL SUMMARY -->
            ${calc.itemOverallGroups.length > 0 ? `
              <div style="overflow-x:auto;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.12);border-radius:11px;margin-bottom:12px;">
                <table style="width:100%;border-collapse:collapse;font-size:0.73rem;">
                  <thead>
                    <tr style="background:rgba(44,230,255,0.1);color:#9ef3ff;text-transform:uppercase;font-size:0.62rem;letter-spacing:0.05em;">
                      <th style="padding:6px 8px;text-align:left;">Per-Garment Overall Summary</th>
                      <th style="padding:6px;text-align:center;">Total Qty</th>
                      <th style="padding:6px;text-align:right;">Overall Avg / Item</th>
                      <th style="padding:6px 8px;text-align:right;">Item Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>${overallGroupRowsHtml}</tbody>
                </table>
              </div>
            ` : ''}

            <!-- LINE-BY-LINE ITEMIZED RECEIPT TABLE -->
            <div style="font-size:0.68rem;font-weight:800;color:#ffe89e;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">
              &#129534; Line-by-Line Size Itemization
            </div>
            <div style="overflow-x:auto;background:rgba(6,5,14,0.72);border:1px solid rgba(255,255,255,0.16);border-radius:11px;margin-bottom:12px;">
              <table style="width:100%;border-collapse:collapse;font-size:0.74rem;">
                <thead>
                  <tr style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.82);text-transform:uppercase;font-size:0.63rem;letter-spacing:0.05em;">
                    <th style="padding:7px 8px;text-align:left;">Garment / Color / Print Spec</th>
                    <th style="padding:7px 6px;text-align:center;">Size</th>
                    <th style="padding:7px 6px;text-align:center;">Qty</th>
                    <th style="padding:7px 6px;text-align:right;">Unit Price</th>
                    <th style="padding:7px 8px;text-align:right;">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemizedTableRows || '<tr><td colspan="5" style="padding:14px;text-align:center;color:rgba(255,255,255,0.55);">Enter shirt quantities in Step 1 to generate itemized receipt lines.</td></tr>'}
                </tbody>
              </table>
            </div>

            <!-- RECEIPT SUBTOTAL, DISCOUNT % OFF, SALES TAX & GRAND TOTAL -->
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(245,196,81,0.32);border-radius:12px;padding:10px 13px;">
              <div style="display:flex;justify-content:space-between;font-size:0.77rem;color:rgba(255,255,255,0.86);padding:2px 0;">
                <span>Items Subtotal (${calc.totalShirts} pcs @ ${money(calc.avgItemPreDiscount)} avg):</span>
                <strong>${money(calc.subtotalBeforeDiscount)}</strong>
              </div>
              ${discountRowHtml}
              ${taxRowHtml}
              <div style="display:flex;justify-content:space-between;align-items:center;border-top:1.5px solid rgba(245,196,81,0.48);margin-top:7px;padding-top:8px;">
                <div>
                  <strong style="font-family:'Orbitron',sans-serif;font-size:0.86rem;color:#ffe89e;">TOTAL QUOTE / RECEIPT</strong>
                  <div style="font-size:0.66rem;color:#2ce6ff;">Overall Final Per-Item Cost: <strong>${money(calc.avgItemAllInFinal)} / shirt</strong></div>
                </div>
                <strong style="font-family:'Orbitron',sans-serif;font-size:1.15rem;color:#22f59b;">${money(calc.customerQuoteTotal)}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- PRIVATE OWNER INTERNAL COST & PROFIT LEDGER (NEVER SHOWN TO CLIENT) -->
        <div class="bq-cost-ledger">
          <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.06em;color:#2ce6ff;font-weight:700;margin-bottom:2px;">
            &#128274; Owner Internal Cost &amp; Profit Breakdown (Hidden on Client PDF)
          </div>
          <div class="bq-ledger-row">
            <span>S&amp;S Blank Shirts (${calc.totalAdultShirts} Adult + ${calc.totalYouthShirts} Youth)</span>
            <strong>${money(calc.blanksSubtotal)}</strong>
          </div>
          <div class="bq-ledger-row">
            <span>S&amp;S Blank Freight / Shipping</span>
            <strong>${ssShipNote}</strong>
          </div>
          <div class="bq-ledger-row">
            <span>DigitalPrintWorx DTF Gangsheets (${calc.sheetSolution.sheetAssignments.length} sheet${calc.sheetSolution.sheetAssignments.length === 1 ? '' : 's'})</span>
            <strong>${money(calc.sheetSolution.totalDtfCost)}</strong>
          </div>
          <div class="bq-ledger-row">
            <span>DigitalPrintWorx DTF Shipping + Pressing/Handling (${calc.totalShirts} &times; ${money(state.pressLaborPerShirt)})</span>
            <strong>${money(calc.dpwShippingUsd + calc.totalPressLaborUsd)}</strong>
          </div>
          <div class="bq-ledger-row total-cost">
            <span>YOUR TRUE HARD COST (${money(calc.avgHardCostPerShirt)} avg / shirt)</span>
            <strong>${money(calc.totalHardCostUsd)}</strong>
          </div>
          <div class="bq-ledger-row quote-price">
            <span>NET PRE-TAX REVENUE${calc.discountPct > 0 ? ` (After ${calc.discountPct}% Discount)` : ''}</span>
            <strong>${money(calc.subtotalAfterDiscount)}</strong>
          </div>
          <div class="bq-ledger-row">
            <span>Sales Tax Collected (${calc.includeTax ? `${calc.taxRatePct.toFixed(2)}% Remitted` : 'Excluded / Exempt'})</span>
            <strong>${money(calc.taxAmountUsd)}</strong>
          </div>
          <div class="bq-ledger-row net-profit">
            <span>YOUR NET PROFIT ON THIS ORDER</span>
            <strong>${calc.netProfitUsd >= 0 ? '+' : ''}${money(calc.netProfitUsd)}</strong>
          </div>
        </div>
      `;
    }

    drawGangsheetPreviewCanvas(calc);
  }

  function drawGangsheetPreviewCanvas(calc) {
    const canvas = document.getElementById('bqGangsheetCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const sheets = calc.sheetSolution.sheetAssignments;

    if (!sheets || sheets.length === 0) {
      canvas.width = 560;
      canvas.height = 190;
      ctx.fillStyle = '#0c0a18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '600 13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Live 27" Gangsheet Blueprint Appears Here', canvas.width / 2, canvas.height / 2);
      return;
    }

    const maxPreviewSheets = Math.min(sheets.length, 3);
    const pxPerIn = 13;
    const pad = 22;
    const headerH = 26;
    const gapBetweenSheets = 20;

    const sheetWpx = Math.round(calc.packRes.rollWidthIn * pxPerIn);
    const maxHpx = Math.max(...sheets.slice(0, maxPreviewSheets).map((s) => Math.round(s.sheet.lengthIn * pxPerIn)));

    canvas.width = pad * 2 + maxPreviewSheets * sheetWpx + (maxPreviewSheets - 1) * gapBetweenSheets;
    canvas.height = pad * 2 + headerH + maxHpx + (sheets.length > maxPreviewSheets ? 26 : 6);

    ctx.fillStyle = '#0a0814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let sIdx = 0; sIdx < maxPreviewSheets; sIdx++) {
      const sa = sheets[sIdx];
      const ox = pad + sIdx * (sheetWpx + gapBetweenSheets);
      const oy = pad + headerH;
      const shW = Math.round(sa.sheet.widthIn * pxPerIn);
      const shH = Math.round(sa.sheet.lengthIn * pxPerIn);

      ctx.fillStyle = '#ffe89e';
      ctx.font = '700 11px Orbitron, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`SHEET #${sIdx + 1}: ${sa.sheet.widthIn}"×${sa.sheet.lengthIn}" ($${sa.sheet.priceUsd.toFixed(2)})`, ox, oy - 8);

      ctx.fillStyle = '#151226';
      ctx.fillRect(ox, oy, shW, shH);
      const sq = 10;
      ctx.fillStyle = '#1d1933';
      for (let cy = 0; cy < shH; cy += sq) {
        for (let cx = 0; cx < shW; cx += sq) {
          if (((cx / sq + cy / sq) | 0) % 2 === 0) {
            ctx.fillRect(ox + cx, oy + cy, Math.min(sq, shW - cx), Math.min(sq, shH - cy));
          }
        }
      }

      const usedPx = Math.round(sa.usedLinearIn * pxPerIn);
      if (usedPx < shH - 4) {
        ctx.fillStyle = 'rgba(34, 245, 155, 0.06)';
        ctx.fillRect(ox, oy + usedPx, shW, shH - usedPx);
        ctx.strokeStyle = 'rgba(34, 245, 155, 0.45)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ox, oy + usedPx);
        ctx.lineTo(ox + shW, oy + usedPx);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      sa.boxes.forEach((b) => {
        const bx = ox + Math.round(b.x * pxPerIn);
        const by = oy + Math.round(b.localY * pxPerIn);
        const bw = Math.max(4, Math.round(b.w * pxPerIn));
        const bh = Math.max(4, Math.round(b.h * pxPerIn));

        const isYouthBox = b.sizeGroup === 'YOUTH';
        const strokeCol = isYouthBox ? 'rgba(44, 230, 255, 0.92)' : 'rgba(245, 196, 81, 0.92)';
        const fillCol = isYouthBox ? 'rgba(44, 230, 255, 0.14)' : 'rgba(245, 196, 81, 0.14)';

        ctx.fillStyle = fillCol;
        ctx.fillRect(bx, by, bw, bh);

        if (b.imgElement) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(bx + 1, by + 1, Math.max(1, bw - 2), Math.max(1, bh - 2));
          ctx.clip();
          if (b.rotated) {
            ctx.translate(bx + bw / 2, by + bh / 2);
            ctx.rotate(Math.PI / 2);
            drawContainImage(ctx, b.imgElement, -bh / 2 + 1, -bw / 2 + 1, bh - 2, bw - 2);
          } else {
            drawContainImage(ctx, b.imgElement, bx + 1, by + 1, bw - 2, bh - 2);
          }
          ctx.restore();
        } else if (bw > 28 && bh > 14) {
          ctx.fillStyle = isYouthBox ? '#9ef3ff' : '#ffe89e';
          ctx.font = '700 8.5px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${isYouthBox ? 'Y ' : ''}${b.origW}"×${b.origH}"`, bx + bw / 2, by + bh / 2 + 3);
        }

        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);
      });

      ctx.strokeStyle = 'rgba(245, 196, 81, 0.78)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ox, oy, shW, shH);
    }

    if (sheets.length > maxPreviewSheets) {
      ctx.fillStyle = '#2ce6ff';
      ctx.font = '600 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`+ ${sheets.length - maxPreviewSheets} additional packed sheet(s) included in total above`, canvas.width / 2, canvas.height - 8);
    }
  }

  function exportPackedGangsheet300DpiPng() {
    const calc = state.lastCalculation;
    if (!calc || !calc.sheetSolution.sheetAssignments.length) {
      alert('Add shirt quantities and upload your DTF file first to generate a 300 DPI gangsheet.');
      return;
    }
    const hasUploadedArt = state.dtfPlacements.some((p) => p.enabled !== false && p.imgElement);
    if (!hasUploadedArt) {
      alert('Please upload your project DTF artwork file (.PNG or .SVG) in Step 2 first so we can tile your 300 DPI graphic onto the gangsheet!');
      return;
    }

    const sa = calc.sheetSolution.sheetAssignments[0];
    let dpi = 300;
    if (sa.sheet.lengthIn * dpi > 15800) {
      dpi = Math.floor(15800 / sa.sheet.lengthIn);
    }

    const outCanvas = document.createElement('canvas');
    outCanvas.width = Math.round(sa.sheet.widthIn * dpi);
    outCanvas.height = Math.round(sa.sheet.lengthIn * dpi);
    const octx = outCanvas.getContext('2d');
    octx.clearRect(0, 0, outCanvas.width, outCanvas.height);

    sa.boxes.forEach((b) => {
      if (!b.imgElement) return;
      const bx = Math.round(b.x * dpi);
      const by = Math.round(b.localY * dpi);
      const bw = Math.round(b.w * dpi);
      const bh = Math.round(b.h * dpi);
      octx.save();
      if (b.rotated) {
        octx.translate(bx + bw / 2, by + bh / 2);
        octx.rotate(Math.PI / 2);
        drawContainImage(octx, b.imgElement, -bh / 2, -bw / 2, bh, bw);
      } else {
        drawContainImage(octx, b.imgElement, bx, by, bw, bh);
      }
      octx.restore();
    });

    outCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanName = (state.customer.projectName || state.customer.companyOrTeam || 'RetroCanopy_BulkProject').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.href = url;
      a.download = `${cleanName}_${sa.sheet.widthIn}x${sa.sheet.lengthIn}_GangSheet_${dpi}DPI.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    }, 'image/png');
  }

  // =========================================================================
  // RENDER GARMENT LINES (DIRECT S&S SIZE PRICING — NO EXTRA UPCHARGE BADGES)
  // =========================================================================
  function renderGarmentLinesList() {
    const container = document.getElementById('bqGarmentLinesContainer');
    if (!container) return;

    container.innerHTML = state.garmentLines.map((line, idx) => {
      const cat = SS_CATALOG[line.styleCode] || SS_CATALOG.TT11;
      const colors = getColorsForStyle(line.styleCode);
      if (!colors.some((c) => c.name === line.colorName)) {
        line.colorName = colors[0].name;
      }
      const activeColor = colors.find((c) => c.name === line.colorName) || colors[0];

      const swatchesHtml = colors.map((c) => {
        const isSel = c.name === line.colorName;
        return `<button type="button" class="bq-color-swatch ${isSel ? 'selected' : ''}" data-line-id="${line.id}" data-pick-color="${esc(c.name)}" title="${esc(c.name)}" style="background:${esc(c.hex)};"></button>`;
      }).join('');

      const colorOptionsHtml = colors.map((c) =>
        `<option value="${esc(c.name)}" ${c.name === line.colorName ? 'selected' : ''}>${esc(c.name)}</option>`
      ).join('');

      const buildSizeCell = (sz) => {
        const unitP = getBlankUnitPrice(line.styleCode, line.colorName, sz);
        const qtyVal = line.quantities[sz] || 0;
        const liveStock = getLiveStockBadge(line.styleCode, line.colorName, sz);
        const stockTag = liveStock !== null
          ? `<span class="bq-stock-micro">${liveStock} stk</span>`
          : '';
        return `
          <div class="bq-size-cell ${qtyVal > 0 ? 'has-qty' : ''} ${isYouthSize(sz) ? 'youth-cell' : ''}">
            <label class="bq-size-label" style="${isYouthSize(sz) ? 'color:#2ce6ff;' : ''}">${sz}</label>
            <input type="number" min="0" max="9999" step="1" class="bq-size-input" data-line-id="${line.id}" data-size-key="${sz}" value="${qtyVal || ''}" placeholder="0">
            <span class="bq-size-price">${money(unitP)}</span>
            ${stockTag}
          </div>
        `;
      };

      const youthGridHtml = YOUTH_SIZES.map(buildSizeCell).join('');
      const adultGridHtml = ADULT_SIZES.map(buildSizeCell).join('');

      return `
        <div class="bq-garment-line-card" data-line-card="${line.id}">
          <div class="bq-line-top-bar">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex:1;">
              <span class="bq-step-badge">#${idx + 1}</span>
              <select class="bq-select" data-line-style="${line.id}" style="min-width:290px;font-weight:700;">
                <option value="TT11" ${line.styleCode === 'TT11' ? 'selected' : ''}>Dri-Fit Short Sleeve — TT11 (#671D9) &amp; Youth TT11Y (#683D9)</option>
                <option value="CE10L" ${line.styleCode === 'CE10L' ? 'selected' : ''}>Dri-Fit Long Sleeve — CE10L (#267A7) &amp; Youth CE10LY (#007A7)</option>
              </select>

              <div style="display:flex;align-items:center;gap:7px;">
                <span class="bq-active-swatch-dot" style="background:${esc(activeColor.hex)};"></span>
                <select class="bq-select" data-line-color-select="${line.id}" style="min-width:175px;">
                  ${colorOptionsHtml}
                </select>
              </div>

              <a href="${esc(cat.productUrl)}" target="_blank" rel="noopener noreferrer" class="mini-btn" style="padding:5px 9px;font-size:0.67rem;text-decoration:none;color:#2ce6ff;">
                Adult #${esc(cat.itemNumber)} &nearr;
              </a>
              <a href="${esc(cat.youthProductUrl)}" target="_blank" rel="noopener noreferrer" class="mini-btn" style="padding:5px 9px;font-size:0.67rem;text-decoration:none;color:#9ef3ff;">
                Youth #${esc(cat.youthItemNumber)} &nearr;
              </a>
            </div>

            <div style="display:flex;align-items:center;gap:10px;">
              <span class="tag-pill" id="bqLineQty_${line.id}" style="background:rgba(44,230,255,0.16);color:#2ce6ff;border:1px solid rgba(44,230,255,0.4);">0 pcs</span>
              <strong id="bqLineSub_${line.id}" style="color:#ffe89e;font-size:0.86rem;">Blanks: $0.00</strong>
              ${state.garmentLines.length > 1 ? `<button type="button" class="mini-btn" data-remove-line="${line.id}" style="padding:4px 9px;color:#ff85b3;border-color:rgba(255,79,163,0.45) !important;" title="Remove this shirt row">&times;</button>` : ''}
            </div>
          </div>

          <div style="font-size:0.72rem;color:rgba(255,255,255,0.68);margin:6px 0 8px;">
            <strong>${esc(cat.fullName)}</strong> &bull; ${esc(cat.specs)} (${colors.length} Official Colors)
          </div>

          <div class="bq-swatch-strip" title="Click any official S&amp;S color swatch to select">
            ${swatchesHtml}
          </div>

          <!-- YOUTH SIZES STRIP -->
          <div style="font-size:0.68rem;font-weight:700;color:#2ce6ff;text-transform:uppercase;letter-spacing:0.05em;margin:6px 0 4px;">
            Youth Sizes (${esc(cat.youthStyleCode)} &bull; Item #${esc(cat.youthItemNumber)}) — Auto-Scales DTF Prints to Youth Dimensions:
          </div>
          <div class="bq-sizes-grid" style="grid-template-columns:repeat(5,minmax(62px,1fr));max-width:520px;margin-bottom:10px;">
            ${youthGridHtml}
          </div>

          <!-- ADULT SIZES STRIP -->
          <div style="font-size:0.68rem;font-weight:700;color:#ffe89e;text-transform:uppercase;letter-spacing:0.05em;margin:4px 0;">
            Adult Sizes (${esc(cat.styleCode)} &bull; Item #${esc(cat.itemNumber)}) — Direct S&amp;S Website Size Pricing:
          </div>
          <div class="bq-sizes-grid">
            ${adultGridHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // RENDER DTF PLACEMENTS
  // =========================================================================
  function renderDtfPlacementsList() {
    const container = document.getElementById('bqDtfPlacementsContainer');
    if (!container) return;

    const presets = [
      { label: 'Front Right Breast Pocket (4"×4" | Youth 3"×3")', loc: 'Front Right Breast Pocket', aw: 4.0, ah: 4.0, yw: 3.0, yh: 3.0 },
      { label: 'Full Back (10.5"×11.5" | Youth 8"×9")', loc: 'Full Back', aw: 10.5, ah: 11.5, yw: 8.0, yh: 9.0 },
      { label: 'Full Front (10.5"×11.5" | Youth 8"×9")', loc: 'Full Front', aw: 10.5, ah: 11.5, yw: 8.0, yh: 9.0 },
      { label: 'Sleeve / Neck (3"×3" | Youth 2.25"×2.25")', loc: 'Sleeve / Back Neck', aw: 3.0, ah: 3.0, yw: 2.25, yh: 2.25 }
    ];

    container.innerHTML = state.dtfPlacements.map((p, idx) => {
      const previewUrl = p.autoTrimTransparent && p.trimmedDataUrl ? p.trimmedDataUrl : p.dataUrl;
      const metaInfo = p.fileName
        ? `<div style="font-size:0.71rem;color:#22f59b;margin-top:4px;">&#10003; <strong>${esc(p.fileName)}</strong> &bull; Fitted cleanly to Adult <strong>${p.adultWidthIn}"&times;${p.adultHeightIn}"</strong> &amp; Youth <strong>${p.youthWidthIn}"&times;${p.youthHeightIn}"</strong></div>`
        : `<div style="font-size:0.71rem;color:rgba(255,255,255,0.62);margin-top:4px;">Upload your transparent <code>.PNG</code> or <code>.SVG</code> file — auto-sized to <strong>${p.adultWidthIn}"&times;${p.adultHeightIn}"</strong> (Adult) &amp; <strong>${p.youthWidthIn}"&times;${p.youthHeightIn}"</strong> (Youth).</div>`;

      const presetButtons = presets.map((pr) =>
        `<button type="button" class="bq-preset-chip" data-dtf-preset="${p.id}" data-ploc="${esc(pr.loc)}" data-aw="${pr.aw}" data-ah="${pr.ah}" data-yw="${pr.yw}" data-yh="${pr.yh}">${pr.label}</button>`
      ).join('');

      return `
        <div class="bq-dtf-card" style="${p.enabled === false ? 'opacity:0.52;' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:10px;flex:1;flex-wrap:wrap;">
              <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:0.76rem;font-weight:700;color:#22f59b;">
                <input type="checkbox" data-dtf-enabled="${p.id}" ${p.enabled !== false ? 'checked' : ''}>
                Include Placement #${idx + 1}
              </label>
              <input type="text" class="bq-input" data-dtf-label="${p.id}" value="${esc(p.locationLabel)}" placeholder="Placement Location" style="min-width:230px;font-weight:700;color:#ffe89e;">
            </div>
            ${state.dtfPlacements.length > 1 ? `<button type="button" class="mini-btn" data-remove-dtf="${p.id}" style="padding:4px 9px;color:#ff85b3;">&times; Delete</button>` : ''}
          </div>

          <div class="bq-dtf-split">
            <label class="bq-upload-dropzone ${p.checkerboardBg ? 'checker-bg' : ''}" data-dropzone-id="${p.id}">
              <input type="file" accept=".png,.svg,.webp,.jpg,.jpeg,image/*" data-dtf-file="${p.id}" style="display:none;">
              ${previewUrl
                ? `<img src="${previewUrl}" alt="Uploaded DTF Artwork" class="bq-uploaded-art-img">
                   <span class="bq-reupload-pill">&#128194; Replace DTF File</span>`
                : `<div style="text-align:center;padding:12px;">
                     <div style="font-size:1.45rem;margin-bottom:3px;">&#128228;</div>
                     <div style="font-size:0.76rem;font-weight:700;color:#ffe89e;">Upload ${esc(p.locationLabel)} File</div>
                     <div style="font-size:0.67rem;color:rgba(255,255,255,0.62);margin-top:2px;">Drag &amp; Drop or Click (.PNG / .SVG)</div>
                   </div>`
              }
            </label>

            <div style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
              <div style="display:flex;gap:14px;align-items:flex-end;flex-wrap:wrap;">
                <div style="background:rgba(245,196,81,0.08);border:1px solid rgba(245,196,81,0.35);border-radius:10px;padding:7px 10px;">
                  <div class="bq-field-lbl" style="color:#ffe89e;">Adult Print Size (XS–6XL Inches)</div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <input type="number" min="0.5" max="26.5" step="0.1" class="bq-input" data-dtf-aw="${p.id}" value="${p.adultWidthIn}" style="width:82px;font-weight:700;color:#ffe89e;">
                    <span>&times;</span>
                    <input type="number" min="0.5" max="95" step="0.1" class="bq-input" data-dtf-ah="${p.id}" value="${p.adultHeightIn}" style="width:82px;font-weight:700;color:#ffe89e;">
                    <span style="font-size:0.72rem;color:rgba(255,255,255,0.65);">in</span>
                  </div>
                </div>

                <div style="background:rgba(44,230,255,0.08);border:1px solid rgba(44,230,255,0.35);border-radius:10px;padding:7px 10px;">
                  <div class="bq-field-lbl" style="color:#2ce6ff;">Youth Print Size (YXS–YXL Inches)</div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <input type="number" min="0.5" max="26.5" step="0.1" class="bq-input" data-dtf-yw="${p.id}" value="${p.youthWidthIn}" style="width:82px;font-weight:700;color:#2ce6ff;">
                    <span>&times;</span>
                    <input type="number" min="0.5" max="95" step="0.1" class="bq-input" data-dtf-yh="${p.id}" value="${p.youthHeightIn}" style="width:82px;font-weight:700;color:#2ce6ff;">
                    <span style="font-size:0.72rem;color:rgba(255,255,255,0.65);">in</span>
                  </div>
                </div>

                <label style="display:inline-flex;align-items:center;gap:5px;font-size:0.72rem;color:rgba(255,255,255,0.85);padding-bottom:6px;cursor:pointer;">
                  <input type="checkbox" data-dtf-lockbox="${p.id}" ${p.lockToPresetBox !== false ? 'checked' : ''}>
                  Keep Auto Box Size on Upload
                </label>

                <label style="display:inline-flex;align-items:center;gap:5px;font-size:0.72rem;color:rgba(255,255,255,0.85);padding-bottom:6px;cursor:pointer;">
                  <input type="checkbox" data-dtf-trim="${p.id}" ${p.autoTrimTransparent !== false ? 'checked' : ''}>
                  Auto-Trim Empty Margin
                </label>
              </div>

              <div>
                <div class="bq-field-lbl" style="margin-bottom:4px;">Quick Placement Presets (Updates Adult &amp; Youth Print Sizes Together):</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  ${presetButtons}
                </div>
              </div>

              ${metaInfo}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // LIVE SUPPLIER PRICING SYNC
  // =========================================================================
  async function syncLiveSupplierPricing(forceRefresh = false) {
    const statusBadge = document.getElementById('bqLiveSyncStatus');
    const syncBtn = document.getElementById('bqRefreshLivePricesBtn');
    if (statusBadge) {
      statusBadge.textContent = 'Syncing live DigitalPrintWorx & S&S prices...';
      statusBadge.style.color = '#ffe89e';
    }
    if (syncBtn) syncBtn.disabled = true;

    let savedCreds = {};
    try {
      savedCreds = JSON.parse(localStorage.getItem(SS_CREDS_KEY) || '{}') || {};
    } catch (_) {}

    try {
      const resp = await fetch(EDGE_LOOKUP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forceRefresh,
          ssAccountNumber: savedCreds.accountNumber || '',
          ssApiKey: savedCreds.apiKey || '',
          styles: 'TT11,TT11Y,CE10L,CE10LY'
        })
      });

      const data = await resp.json();
      if (data && data.ok) {
        if (data.digitalPrintWorx && Array.isArray(data.digitalPrintWorx.sheets)) {
          dpwSheets = data.digitalPrintWorx.sheets;
        }
        let ssStatusText = 'S&S #671D9 / #683D9 / #267A7 / #007A7 Verified';
        if (data.ssActivewear && data.ssActivewear.connectedAccount && data.ssActivewear.products) {
          liveSSData = data.ssActivewear.products;
          ssStatusText = 'S&S Live Account API Connected (Live Stock + Account Tier)';
          renderGarmentLinesList();
        }
        const liveCnt = (data.digitalPrintWorx && data.digitalPrintWorx.liveCount) || 0;
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (statusBadge) {
          statusBadge.innerHTML = `&#9679; DigitalPrintWorx Live (${liveCnt}/${dpwSheets.length} sheets verified @ ${timeStr}) &bull; ${esc(ssStatusText)}`;
          statusBadge.style.color = '#22f59b';
        }
        renderLiveDpwRateStrip();
        recalculateEverything();
      }
    } catch (_) {
      if (statusBadge) {
        statusBadge.textContent = 'Using verified S&S + DigitalPrintWorx rates (offline fallback)';
        statusBadge.style.color = '#f5c451';
      }
    } finally {
      if (syncBtn) syncBtn.disabled = false;
    }
  }

  function renderLiveDpwRateStrip() {
    const strip = document.getElementById('bqLiveDpwRatesStrip');
    if (!strip) return;
    strip.innerHTML = dpwSheets.map((s) => `
      <a href="${esc(s.productUrl)}" target="_blank" rel="noopener noreferrer" class="bq-rate-pill" title="Click to view on DigitalPrintWorx.com">
        <span>${esc(s.widthIn)}"&times;${esc(s.lengthIn)}"${s.builderType === 'auto' ? ' Auto' : ''}</span>
        <strong>${money(s.priceUsd)}</strong>
        ${s.liveVerified ? '<i class="bq-live-dot"></i>' : ''}
      </a>
    `).join('');
  }

  // =========================================================================
  // SAVED QUOTES, CLIENT TEXT COPY & OFFICIAL BRANDED QUOTE / RECEIPT PDF
  // =========================================================================
  function getSavedQuotes() {
    try {
      const v3 = JSON.parse(localStorage.getItem(SAVED_QUOTES_KEY) || 'null');
      if (Array.isArray(v3)) return v3;
      const v2 = JSON.parse(localStorage.getItem(LEGACY_QUOTES_KEY) || '[]');
      return Array.isArray(v2) ? v2 : [];
    } catch (_) {
      return [];
    }
  }

  function renderSavedQuotesList() {
    const el = document.getElementById('bqSavedQuotesList');
    if (!el) return;
    const list = getSavedQuotes();
    if (list.length === 0) {
      el.innerHTML = `<div style="font-size:0.75rem;color:rgba(255,255,255,0.58);">No saved bulk quotes yet. Click <strong>"Save Quote"</strong> above to store a project quote.</div>`;
      return;
    }

    el.innerHTML = list.map((q) => `
      <div class="bq-saved-quote-row">
        <div>
          <strong style="color:#ffe89e;">${esc(q.projectName || 'Custom Dri-Fit Order')}</strong>
          <span style="font-size:0.73rem;color:#2ce6ff;margin-left:6px;">${esc(q.clientLabel || '')}</span>
          <div style="font-size:0.7rem;color:rgba(255,255,255,0.68);margin-top:2px;">
            ${q.totalShirts} shirts &bull; Total: <strong style="color:#22f59b;">${money(q.customerQuoteTotal)}</strong> (Profit: ${q.netProfitUsd >= 0 ? '+' : ''}${money(q.netProfitUsd)}) &bull; ${esc(q.savedAtFormatted)}
          </div>
        </div>
        <div style="display:flex;gap:6px;">
          <button type="button" class="mini-btn" data-load-quote="${esc(q.quoteId)}" style="padding:5px 10px;font-size:0.7rem;color:#2ce6ff;">Load</button>
          <button type="button" class="mini-btn" data-delete-quote="${esc(q.quoteId)}" style="padding:5px 9px;font-size:0.7rem;color:#ff85b3;">&times;</button>
        </div>
      </div>
    `).join('');
  }

  function saveCurrentQuote() {
    const calc = state.lastCalculation;
    if (!calc || calc.totalShirts === 0) {
      alert('Enter at least 1 shirt before saving a quote.');
      return;
    }
    triggerAutoSaveCustomer();
    const list = getSavedQuotes();
    const entry = {
      quoteId: 'BQ-' + Math.floor(100000 + Math.random() * 900000),
      savedAtFormatted: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      projectName: state.customer.projectName || state.customer.companyOrTeam || 'Custom Dri-Fit Bulk Order',
      clientLabel: [state.customer.fullName, state.customer.companyOrTeam].filter(Boolean).join(' • '),
      totalShirts: calc.totalShirts,
      totalHardCostUsd: calc.totalHardCostUsd,
      customerQuoteTotal: calc.customerQuoteTotal,
      netProfitUsd: calc.netProfitUsd,
      snapshot: {
        customer: JSON.parse(JSON.stringify(state.customer)),
        ssDiscountPct: state.ssDiscountPct,
        rollWidthMode: state.rollWidthMode,
        includeAutoBuilder15: state.includeAutoBuilder15,
        gutterIn: state.gutterIn,
        extraSpoilagePrints: state.extraSpoilagePrints,
        pressLaborPerShirt: state.pressLaborPerShirt,
        builtInUpchargePerShirt: state.builtInUpchargePerShirt,
        ssShippingOverride: state.ssShippingOverride,
        dpwShippingUsd: state.dpwShippingUsd,
        discountPct: state.discountPct,
        discountLabel: state.discountLabel,
        includeTax: state.includeTax,
        taxRatePct: state.taxRatePct,
        includeAvailableColorsOnPdf: state.includeAvailableColorsOnPdf,
        garmentLines: JSON.parse(JSON.stringify(state.garmentLines)),
        dtfPlacements: state.dtfPlacements.map((p) => ({
          id: p.id,
          enabled: p.enabled,
          locationLabel: p.locationLabel,
          adultWidthIn: p.adultWidthIn,
          adultHeightIn: p.adultHeightIn,
          youthWidthIn: p.youthWidthIn,
          youthHeightIn: p.youthHeightIn,
          lockToPresetBox: p.lockToPresetBox,
          autoTrimTransparent: p.autoTrimTransparent,
          fileName: p.fileName
        }))
      }
    };
    list.unshift(entry);
    try {
      localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(list.slice(0, 40)));
    } catch (_) {}
    renderSavedQuotesList();
  }

  function buildCleanCustomerQuoteText() {
    const calc = state.lastCalculation;
    if (!calc || calc.totalShirts === 0) return 'No items in quote yet.';
    const c = state.customer;
    const proj = c.projectName || c.companyOrTeam || 'Custom Performance Apparel Order';
    const out = [
      `======================================================================`,
      `RETROCANOPY — OFFICIAL ITEMIZED APPAREL QUOTE & RECEIPT`,
      `Website: https://www.retrocanopy.com`,
      `Project: ${proj}`,
      `Date:    ${new Date().toLocaleDateString()}`
    ];
    if (c.fullName || c.companyOrTeam) out.push(`Client:  ${[c.fullName, c.companyOrTeam].filter(Boolean).join(' — ')}`);
    if (c.phone || c.email) out.push(`Contact: ${[c.phone, c.email].filter(Boolean).join(' • ')}`);
    if (c.address) out.push(`Address: ${c.address}`);

    out.push(`----------------------------------------------------------------------`);
    out.push(`OVERALL BREAKDOWN PER ITEM:`);
    calc.itemOverallGroups.forEach((g) => {
      const avgUsed = calc.discountPct > 0 ? g.avgPerItemAfterDiscount : g.avgPerItemPreDiscount;
      const subUsed = calc.discountPct > 0 ? g.groupSubtotalAfterDiscount : g.groupSubtotalPreDiscount;
      out.push(`• ${g.brand} ${g.styleBadge} (${g.colorName}) — ${g.totalQty} pcs [${g.sizeBreakdownStr}] | Overall Avg: ${money(avgUsed)}/item | Group Total: ${money(subUsed)}`);
    });

    out.push(`----------------------------------------------------------------------`);
    out.push(`LINE-BY-LINE ITEMIZATION:`);
    calc.itemizedLines.forEach((r) => {
      out.push(`Line ${r.lineNumber}: ${r.brand} ${r.styleCode} — ${r.colorName} — Size ${r.sizeName} | ${r.printSpecSummary} | Qty: ${r.qty} × ${money(r.unitPriceQuoted)} = ${money(r.lineTotalQuoted)}`);
    });

    out.push(`----------------------------------------------------------------------`);
    out.push(`Items Subtotal (${calc.totalShirts} pcs @ ${money(calc.avgItemPreDiscount)}/item): ${money(calc.subtotalBeforeDiscount)}`);
    if (calc.discountPct > 0) {
      out.push(`Discount (${calc.discountLabel} — ${calc.discountPct}% OFF): -${money(calc.discountAmountUsd)}`);
      out.push(`Discounted Subtotal (${money(calc.avgItemAfterDiscount)}/item): ${money(calc.subtotalAfterDiscount)}`);
    }
    if (calc.includeTax) {
      out.push(`Sales Tax (${calc.taxRatePct.toFixed(2)}%): ${money(calc.taxAmountUsd)}`);
    } else {
      out.push(`Sales Tax: $0.00 (Tax Excluded / Exempt)`);
    }
    out.push(`GRAND TOTAL: ${money(calc.customerQuoteTotal)} (${money(calc.avgItemAllInFinal)} all-in avg / item)`);
    out.push(`======================================================================`);
    return out.join('\n');
  }

  function printCustomerQuoteSheet() {
    const calc = state.lastCalculation;
    if (!calc || calc.totalShirts === 0) {
      alert('Enter shirt quantities in Step 1 before generating the Official Quote / Receipt PDF.');
      return;
    }

    const logoUrl = getOfficialLogoUrl();
    const c = state.customer;
    const quoteNumber = 'RC-Q' + String(Date.now()).slice(-6);
    const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const validUntilDate = new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const proj = c.projectName || c.companyOrTeam || 'Custom Performance Apparel Order';

    const placementsHtml = calc.activePlacements.map((p) => `
      <div style="display:flex;align-items:center;gap:10px;border:1px solid #e2e8f0;border-radius:10px;padding:8px 11px;background:#f8fafc;margin-bottom:6px;">
        ${p.dataUrl ? `<img src="${p.trimmedDataUrl || p.dataUrl}" style="width:46px;height:46px;object-fit:contain;background:#0f172a;border-radius:8px;padding:4px;border:1px solid #cbd5e1;">` : ''}
        <div>
          <div style="font-weight:800;font-size:12.5px;color:#0f172a;">${esc(p.locationLabel)}</div>
          <div style="font-size:11.5px;color:#475569;margin-top:1px;">
            Adult (XS–6XL): <strong>${p.adultWidthIn}" &times; ${p.adultHeightIn}"</strong>
            &nbsp;&bull;&nbsp;
            Youth (YXS–YXL): <strong>${p.youthWidthIn}" &times; ${p.youthHeightIn}"</strong>
          </div>
        </div>
      </div>
    `).join('');

    const overallGroupPdfRows = calc.itemOverallGroups.map((g) => `
      <tr>
        <td style="padding:9px 11px;border-bottom:1px solid #e2e8f0;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="width:13px;height:13px;border-radius:50%;background:${esc(g.colorHex)};border:1px solid #94a3b8;display:inline-block;flex-shrink:0;"></span>
            <strong style="color:#0f172a;">${esc(g.brand)} ${esc(g.styleBadge)}</strong>
            <span style="color:#475569;">&mdash; ${esc(g.colorName)}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:2px;">Size Mix: ${esc(g.sizeBreakdownStr)}</div>
        </td>
        <td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:800;color:#0f172a;">${g.totalQty} pcs</td>
        <td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;color:#0f172a;">${money(calc.discountPct > 0 ? g.avgPerItemAfterDiscount : g.avgPerItemPreDiscount)} / item</td>
        <td style="padding:9px 11px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:800;color:#0f172a;">${money(calc.discountPct > 0 ? g.groupSubtotalAfterDiscount : g.groupSubtotalPreDiscount)}</td>
      </tr>
    `).join('');

    const rowsHtml = calc.itemizedLines.map((r, idx) => `
      <tr style="background:${idx % 2 === 1 ? '#f8fafc' : '#ffffff'};">
        <td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;color:#64748b;">${r.lineNumber}</td>
        <td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;">
          <div style="display:flex;align-items:center;gap:7px;">
            <span style="width:12px;height:12px;border-radius:50%;background:${esc(r.colorHex)};border:1px solid #94a3b8;display:inline-block;flex-shrink:0;"></span>
            <strong style="color:#0f172a;">${esc(r.brand)} ${esc(r.styleCode)}</strong>
            <span style="font-size:11.5px;color:#475569;">&mdash; ${esc(r.garmentTitle)}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:2px;">
            Color: <strong style="color:#334155;">${esc(r.colorName)}</strong> &bull; Custom Print: ${esc(r.printSpecSummary)}
          </div>
        </td>
        <td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:800;color:#0f172a;">
          <span style="display:inline-block;padding:2px 8px;border-radius:6px;background:${r.isYouth ? '#e0f2fe' : '#fef3c7'};color:${r.isYouth ? '#0369a1' : '#92400e'};font-size:11.5px;">${esc(r.sizeName)}</span>
        </td>
        <td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:800;color:#0f172a;">${r.qty}</td>
        <td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;color:#0f172a;">${money(r.unitPriceQuoted)}</td>
        <td style="padding:9px 11px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:800;color:#0f172a;">${money(r.lineTotalQuoted)}</td>
      </tr>
    `).join('');

    const usedParentStyles = Array.from(new Set(state.garmentLines.map((l) => l.styleCode)));
    if (usedParentStyles.length === 0) usedParentStyles.push('TT11');

    const colorsSectionHtml = state.includeAvailableColorsOnPdf ? usedParentStyles.map((stCode) => {
      const cat = SS_CATALOG[stCode] || SS_CATALOG.TT11;
      const colors = getColorsForStyle(stCode);
      const swatchesGrid = colors.map((col) => `
        <div style="display:inline-flex;align-items:center;gap:6px;border:1px solid #e2e8f0;border-radius:7px;padding:4px 8px;background:#ffffff;font-size:11px;color:#1e293b;">
          <span style="width:13px;height:13px;border-radius:50%;background:${esc(col.hex)};border:1px solid #94a3b8;display:inline-block;flex-shrink:0;"></span>
          <span>${esc(col.name)}</span>
        </div>
      `).join('');

      return `
        <div style="margin-top:20px;page-break-inside:avoid;border:1px solid #cbd5e1;border-radius:12px;padding:14px 16px;background:#f8fafc;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
            <div style="font-size:12.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#0f172a;">
              &#127912; ${esc(cat.brand)} ${esc(cat.styleCode)} (Adult) / ${esc(cat.youthStyleCode)} (Youth) — Official Available Colors
            </div>
            <span style="font-size:11px;color:#475569;font-weight:600;">${colors.length} Colors Available (YXS–6XL)</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${swatchesGrid}
          </div>
        </div>
      `;
    }).join('') : '';

    const pdfDiscountRows = calc.discountPct > 0 ? `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;margin:6px 0;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;color:#065f46;font-size:13px;">
        <span><strong>Discount (${esc(calc.discountLabel)} &bull; ${calc.discountPct}% OFF):</strong></span>
        <strong>&minus;${money(calc.discountAmountUsd)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#334155;">
        <span>Discounted Subtotal (${money(calc.avgItemAfterDiscount)} / item):</span>
        <strong>${money(calc.subtotalAfterDiscount)}</strong>
      </div>
    ` : '';

    const pdfTaxRow = calc.includeTax ? `
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#334155;">
        <span>Sales Tax (${calc.taxRatePct.toFixed(2)}%):</span>
        <strong>${money(calc.taxAmountUsd)}</strong>
      </div>
    ` : `
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#64748b;">
        <span>Sales Tax (Excluded / Tax-Exempt):</span>
        <strong>$0.00</strong>
      </div>
    `;

    const w = window.open('', '_blank', 'width=1020,height=880');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>RetroCanopy Official Quote ${quoteNumber} — ${esc(proj)}</title>
      <style>
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #0f172a; background: #f1f5f9; padding: 24px; margin: 0; line-height: 1.42; }
        .sheet { max-width: 920px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(15,23,42,0.12); border: 1px solid #cbd5e1; }
        table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        th { background: #0f172a; color: #f8fafc; padding: 9px 10px; text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; }
        @media print {
          body { background: #ffffff; padding: 0; }
          .sheet { box-shadow: none; border: none; border-radius: 0; max-width: 100%; }
          .no-print { display: none !important; }
        }
      </style>
    </head><body>
      <div class="no-print" style="max-width:920px;margin:0 auto 14px;display:flex;justify-content:space-between;align-items:center;background:#0f172a;color:#f8fafc;padding:10px 16px;border-radius:12px;">
        <span style="font-size:13px;">&#10024; Official Branded Quote &amp; Itemized Receipt Ready &mdash; Choose <strong>"Save as PDF"</strong> or Print for your customer.</span>
        <button onclick="window.print()" style="padding:8px 18px;background:linear-gradient(135deg,#f5c451,#f59e0b);color:#0f172a;border:none;border-radius:8px;font-weight:800;cursor:pointer;font-size:13px;">&#128424; Print / Save Official PDF</button>
      </div>

      <div class="sheet">
        <!-- LUXURY BRANDED HEADER BANNER WITH OFFICIAL RETROCANOPY LOGO -->
        <div style="background:linear-gradient(135deg,#0b0919 0%,#1a1333 55%,#0f172a 100%);color:#ffffff;padding:24px 28px;border-bottom:4px solid #f5c451;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:74px;height:74px;border-radius:16px;background:#090714;border:1.5px solid rgba(245,196,81,0.65);padding:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <img src="${esc(logoUrl)}" alt="RetroCanopy Logo" style="max-width:100%;max-height:100%;object-fit:contain;">
            </div>
            <div>
              <div style="font-size:24px;font-weight:900;letter-spacing:0.1em;color:#ffe89e;">RETROCANOPY</div>
              <div style="font-size:11.5px;font-weight:700;letter-spacing:0.08em;color:#2ce6ff;text-transform:uppercase;margin-top:2px;">Official Custom Apparel &amp; Print Studio</div>
              <div style="font-size:12px;color:#cbd5e1;margin-top:3px;">www.retrocanopy.com &bull; Premium Performance Team &amp; Brand Merch</div>
            </div>
          </div>

          <div style="text-align:right;background:rgba(255,255,255,0.06);border:1px solid rgba(245,196,81,0.4);border-radius:12px;padding:11px 16px;">
            <div style="font-size:10.5px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#ffe89e;">Official Itemized Quote &amp; Receipt</div>
            <div style="font-size:17px;font-weight:900;color:#ffffff;margin-top:2px;">#${quoteNumber}</div>
            <div style="font-size:11.5px;color:#cbd5e1;margin-top:2px;">Issued: ${issueDate} &bull; Valid Until: ${validUntilDate}</div>
          </div>
        </div>

        <div style="padding:24px 28px;">
          <!-- TWO-COLUMN CLIENT DETAILS + CUSTOM PRINT PLACEMENTS -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:20px;">
            <div style="border:1px solid #cbd5e1;border-radius:12px;padding:14px 16px;background:#f8fafc;">
              <div style="font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#64748b;margin-bottom:6px;">Prepared For</div>
              <div style="font-size:15px;font-weight:800;color:#0f172a;">${esc(c.fullName || c.companyOrTeam || 'Valued Customer')}</div>
              ${c.companyOrTeam && c.fullName ? `<div style="font-size:13px;font-weight:700;color:#334155;">${esc(c.companyOrTeam)}</div>` : ''}
              <div style="font-size:12.5px;color:#334155;margin-top:4px;"><strong>Project:</strong> ${esc(proj)}</div>
              ${(c.phone || c.email) ? `<div style="font-size:12px;color:#475569;margin-top:3px;">${esc([c.phone, c.email].filter(Boolean).join(' • '))}</div>` : ''}
              ${c.address ? `<div style="font-size:12px;color:#475569;margin-top:3px;">${esc(c.address)}</div>` : ''}
              ${c.notes ? `<div style="margin-top:8px;padding:6px 9px;background:#fffbeb;border:1px solid #fde68a;border-radius:7px;font-size:11.5px;color:#92400e;"><strong>Notes:</strong> ${esc(c.notes)}</div>` : ''}
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:12px;padding:14px 16px;background:#ffffff;">
              <div style="font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#64748b;margin-bottom:6px;">Custom Print Locations &amp; Artwork Specs</div>
              ${placementsHtml || '<div style="font-size:12.5px;color:#64748b;">Blank Garments Only (No Print Locations Active)</div>'}
            </div>
          </div>

          <!-- SECTION 1: OVERALL BREAKDOWN PER ITEM -->
          <div style="margin-bottom:20px;">
            <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#0f172a;margin-bottom:8px;">
              1. Overall Breakdown Per Item
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px;">
              <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:10px 12px;">
                <div style="font-size:10.5px;text-transform:uppercase;color:#64748b;font-weight:700;">Total Garments</div>
                <div style="font-size:17px;font-weight:900;color:#0f172a;margin-top:2px;">${calc.totalShirts} Items</div>
                <div style="font-size:11px;color:#475569;">${calc.totalAdultShirts} Adult &bull; ${calc.totalYouthShirts} Youth</div>
              </div>
              <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:10px 12px;">
                <div style="font-size:10.5px;text-transform:uppercase;color:#64748b;font-weight:700;">Standard Avg / Item</div>
                <div style="font-size:17px;font-weight:900;color:#0f172a;margin-top:2px;">${money(calc.avgItemPreDiscount)}</div>
                <div style="font-size:11px;color:#475569;">Pre-discount average</div>
              </div>
              <div style="background:${calc.discountPct > 0 ? '#ecfdf5' : '#f8fafc'};border:1px solid ${calc.discountPct > 0 ? '#6ee7b7' : '#cbd5e1'};border-radius:10px;padding:10px 12px;">
                <div style="font-size:10.5px;text-transform:uppercase;color:${calc.discountPct > 0 ? '#047857' : '#64748b'};font-weight:700;">${calc.discountPct > 0 ? `Discounted (${calc.discountPct}% Off)` : 'Net Per Item'}</div>
                <div style="font-size:17px;font-weight:900;color:${calc.discountPct > 0 ? '#065f46' : '#0f172a'};margin-top:2px;">${money(calc.avgItemAfterDiscount)}</div>
                <div style="font-size:11px;color:#475569;">${calc.discountPct > 0 ? `You save ${money(calc.discountAmountUsd)}` : 'No promo applied'}</div>
              </div>
              <div style="background:#0f172a;color:#ffffff;border-radius:10px;padding:10px 12px;border:1px solid #0f172a;">
                <div style="font-size:10.5px;text-transform:uppercase;color:#ffe89e;font-weight:700;">All-In Final / Item</div>
                <div style="font-size:17px;font-weight:900;color:#22f59b;margin-top:2px;">${money(calc.avgItemAllInFinal)}</div>
                <div style="font-size:11px;color:#cbd5e1;">${calc.includeTax ? `Includes ${calc.taxRatePct.toFixed(2)}% tax` : 'Tax excluded'}</div>
              </div>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;">
              <table>
                <thead>
                  <tr>
                    <th>Garment Style &amp; Color Summary</th>
                    <th style="text-align:center;width:105px;">Total Qty</th>
                    <th style="text-align:right;width:145px;">Overall Avg / Item</th>
                    <th style="text-align:right;width:135px;">Item Group Total</th>
                  </tr>
                </thead>
                <tbody>${overallGroupPdfRows}</tbody>
              </table>
            </div>
          </div>

          <!-- SECTION 2: COMPLETE LINE-BY-LINE ITEMIZED RECEIPT -->
          <div>
            <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#0f172a;margin-bottom:8px;">
              2. Complete Line-by-Line Size Itemization
            </div>
            <div style="border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;">
              <table>
                <thead>
                  <tr>
                    <th style="width:42px;text-align:center;">#</th>
                    <th>Itemized Garment, Official Color &amp; Custom Print Spec</th>
                    <th style="text-align:center;width:78px;">Size</th>
                    <th style="text-align:center;width:68px;">Qty</th>
                    <th style="text-align:right;width:110px;">Unit Price</th>
                    <th style="text-align:right;width:120px;">Line Total</th>
                  </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            </div>
          </div>

          <!-- TOTALS SUMMARY CARD -->
          <div style="margin-top:18px;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;">
            <div style="flex:1;min-width:250px;font-size:11.5px;color:#475569;">
              <strong style="color:#0f172a;">Included with Your RetroCanopy Custom Order:</strong><br>
              &bull; Authentic moisture-wicking performance garments in official S&amp;S colors<br>
              &bull; Commercial 300 DPI full-color custom transfers pressed &amp; cured in-house<br>
              &bull; Youth artwork proportionally scaled for crisp, balanced garment fit
            </div>

            <div style="min-width:345px;background:#f8fafc;border:1.5px solid #0f172a;border-radius:12px;padding:15px 18px;">
              <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;color:#334155;">
                <span>Items Subtotal (${calc.totalShirts} pcs):</span>
                <strong>${money(calc.subtotalBeforeDiscount)}</strong>
              </div>
              ${pdfDiscountRows}
              ${pdfTaxRow}
              <div style="display:flex;justify-content:space-between;align-items:center;border-top:2px solid #0f172a;padding-top:10px;margin-top:8px;">
                <div>
                  <div style="font-size:15px;font-weight:900;color:#0f172a;">GRAND TOTAL</div>
                  <div style="font-size:11px;color:#475569;font-weight:700;">Overall: ${money(calc.avgItemAllInFinal)} per item</div>
                </div>
                <div style="font-size:21px;font-weight:900;color:#0f172a;">${money(calc.customerQuoteTotal)}</div>
              </div>
            </div>
          </div>

          ${colorsSectionHtml}

          <!-- APPROVAL SIGNATURE & THANK YOU FOOTER -->
          <div style="margin-top:24px;padding-top:14px;border-top:1px dashed #cbd5e1;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;font-size:11.5px;color:#64748b;">
            <div>
              <strong style="color:#0f172a;">Thank you for choosing RetroCanopy!</strong><br>
              Questions or ready to lock in production? Reply directly to approve your sizes &amp; artwork.
            </div>
            <div style="min-width:260px;border-top:1px solid #94a3b8;padding-top:5px;text-align:center;color:#475569;">
              Client Approval Signature &amp; Date
            </div>
          </div>
        </div>
      </div>
    </body></html>`);
    w.document.close();
  }

  // =========================================================================
  // INITIALIZATION & EVENT LISTENERS
  // =========================================================================
  function initBulkQuoteTool() {
    const root = document.getElementById('bulkQuoteStudioSection');
    if (!root) return;

    loadInitialCustomerAndRatePrefs();

    try {
      const savedCreds = JSON.parse(localStorage.getItem(SS_CREDS_KEY) || '{}') || {};
      const acctEl = document.getElementById('bqSsAccountInput');
      const keyEl = document.getElementById('bqSsApiKeyInput');
      if (acctEl && savedCreds.accountNumber) acctEl.value = savedCreds.accountNumber;
      if (keyEl && savedCreds.apiKey) keyEl.value = savedCreds.apiKey;
    } catch (_) {}

    syncTopControlsFromState();
    syncCustomerInputsFromState();
    renderLiveDpwRateStrip();
    renderGarmentLinesList();
    renderDtfPlacementsList();
    renderSavedQuotesList();
    recalculateEverything();

    syncLiveSupplierPricing(false);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tab') === 'bulkquote' || window.location.hash === '#bulkquote') {
        const focusBtn = document.querySelector('[data-focus-target="bulkquote"]');
        if (focusBtn) focusBtn.click();
      }
    } catch (_) {}

    const custSel = document.getElementById('bqSavedCustomerSelect');
    if (custSel) {
      custSel.addEventListener('change', () => {
        const id = custSel.value;
        if (!id) return;
        const found = getSavedCustomersList().find((c) => c.customerId === id);
        if (found) {
          state.customer = {
            customerId: found.customerId,
            fullName: found.fullName || '',
            companyOrTeam: found.companyOrTeam || '',
            email: found.email || '',
            phone: found.phone || '',
            address: found.address || '',
            projectName: found.projectName || '',
            notes: found.notes || ''
          };
          localStorage.setItem(ACTIVE_CUSTOMER_DRAFT_KEY, JSON.stringify(state.customer));
          syncCustomerInputsFromState();
          recalculateEverything();
        }
      });
    }

    const newCustBtn = document.getElementById('bqNewCustomerBtn');
    if (newCustBtn) {
      newCustBtn.addEventListener('click', () => {
        state.customer = {
          customerId: '',
          fullName: '',
          companyOrTeam: '',
          email: '',
          phone: '',
          address: '',
          projectName: '',
          notes: ''
        };
        localStorage.setItem(ACTIVE_CUSTOMER_DRAFT_KEY, JSON.stringify(state.customer));
        syncCustomerInputsFromState();
        const badge = document.getElementById('bqCustomerAutoSaveBadge');
        if (badge) badge.textContent = 'Ready — New Customer (Auto-Saves as You Type)';
        recalculateEverything();
      });
    }

    const delCustBtn = document.getElementById('bqDeleteCustomerBtn');
    if (delCustBtn) {
      delCustBtn.addEventListener('click', () => {
        if (!state.customer.customerId) return;
        const filtered = getSavedCustomersList().filter((c) => c.customerId !== state.customer.customerId);
        localStorage.setItem(CUSTOMERS_CRM_KEY, JSON.stringify(filtered));
        state.customer.customerId = '';
        renderSavedCustomersDropdown();
      });
    }

    // Tax Toggle Button
    const taxToggleBtn = document.getElementById('bqTaxToggleBtn');
    if (taxToggleBtn) {
      taxToggleBtn.addEventListener('click', () => {
        state.includeTax = !state.includeTax;
        saveOwnerRatePrefs();
        recalculateEverything();
      });
    }

    const addLineBtn = document.getElementById('bqAddGarmentLineBtn');
    if (addLineBtn) {
      addLineBtn.addEventListener('click', () => {
        state.garmentLines.push({
          id: 'line_' + (lineCounter++),
          styleCode: 'TT11',
          colorName: 'White',
          quantities: makeEmptyQtyMap()
        });
        renderGarmentLinesList();
        recalculateEverything();
      });
    }

    const addDtfBtn = document.getElementById('bqAddDtfPlacementBtn');
    if (addDtfBtn) {
      addDtfBtn.addEventListener('click', () => {
        state.dtfPlacements.push({
          id: 'dtf_' + (dtfCounter++),
          enabled: true,
          locationLabel: `Sleeve / Extra Location #${state.dtfPlacements.length + 1}`,
          adultWidthIn: 3.0,
          adultHeightIn: 3.0,
          youthWidthIn: 2.25,
          youthHeightIn: 2.25,
          lockToPresetBox: true,
          autoTrimTransparent: true,
          fileName: '',
          dataUrl: '',
          trimmedDataUrl: '',
          imgElement: null,
          origPxW: 0,
          origPxH: 0,
          trimPxW: 0,
          trimPxH: 0,
          checkerboardBg: false
        });
        renderDtfPlacementsList();
        recalculateEverything();
      });
    }

    const refreshBtn = document.getElementById('bqRefreshLivePricesBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => syncLiveSupplierPricing(true));

    const saveSsCredsBtn = document.getElementById('bqSaveSsApiBtn');
    if (saveSsCredsBtn) {
      saveSsCredsBtn.addEventListener('click', () => {
        const accountNumber = (document.getElementById('bqSsAccountInput')?.value || '').trim();
        const apiKey = (document.getElementById('bqSsApiKeyInput')?.value || '').trim();
        localStorage.setItem(SS_CREDS_KEY, JSON.stringify({ accountNumber, apiKey }));
        syncLiveSupplierPricing(true);
      });
    }

    const expPngBtn = document.getElementById('bqExportGangsheetPngBtn');
    if (expPngBtn) expPngBtn.addEventListener('click', exportPackedGangsheet300DpiPng);

    const saveQBtn = document.getElementById('bqSaveQuoteBtn');
    if (saveQBtn) saveQBtn.addEventListener('click', saveCurrentQuote);

    const copyQBtn = document.getElementById('bqCopyCustomerQuoteBtn');
    if (copyQBtn) {
      copyQBtn.addEventListener('click', () => {
        const txt = buildCleanCustomerQuoteText();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).catch(() => {});
        }
        const orig = copyQBtn.innerHTML;
        copyQBtn.innerHTML = '&#10003; Copied Quote!';
        setTimeout(() => { copyQBtn.innerHTML = orig; }, 2000);
      });
    }

    const printQBtn = document.getElementById('bqPrintQuoteBtn');
    if (printQBtn) printQBtn.addEventListener('click', printCustomerQuoteSheet);

    // Delegated Clicks
    root.addEventListener('click', (e) => {
      const discChip = e.target.closest('[data-disc-preset]');
      if (discChip) {
        const val = Math.min(100, Math.max(0, parseFloat(discChip.getAttribute('data-disc-preset')) || 0));
        state.discountPct = val;
        const inp = document.getElementById('bqDiscountPctInput');
        if (inp) inp.value = val;
        recalculateEverything();
        return;
      }

      const swatchBtn = e.target.closest('[data-pick-color]');
      if (swatchBtn) {
        const lineId = swatchBtn.getAttribute('data-line-id');
        const cName = swatchBtn.getAttribute('data-pick-color');
        const line = state.garmentLines.find((l) => l.id === lineId);
        if (line && cName) {
          line.colorName = cName;
          renderGarmentLinesList();
          recalculateEverything();
        }
        return;
      }

      const rmLineBtn = e.target.closest('[data-remove-line]');
      if (rmLineBtn) {
        const id = rmLineBtn.getAttribute('data-remove-line');
        if (state.garmentLines.length > 1) {
          state.garmentLines = state.garmentLines.filter((l) => l.id !== id);
          renderGarmentLinesList();
          recalculateEverything();
        }
        return;
      }

      const rmDtfBtn = e.target.closest('[data-remove-dtf]');
      if (rmDtfBtn) {
        const id = rmDtfBtn.getAttribute('data-remove-dtf');
        if (state.dtfPlacements.length > 1) {
          state.dtfPlacements = state.dtfPlacements.filter((p) => p.id !== id);
          renderDtfPlacementsList();
          recalculateEverything();
        }
        return;
      }

      const presetBtn = e.target.closest('[data-dtf-preset]');
      if (presetBtn) {
        const id = presetBtn.getAttribute('data-dtf-preset');
        const p = state.dtfPlacements.find((x) => x.id === id);
        if (p) {
          p.locationLabel = presetBtn.getAttribute('data-ploc') || p.locationLabel;
          p.adultWidthIn = parseFloat(presetBtn.getAttribute('data-aw')) || p.adultWidthIn;
          p.adultHeightIn = parseFloat(presetBtn.getAttribute('data-ah')) || p.adultHeightIn;
          p.youthWidthIn = parseFloat(presetBtn.getAttribute('data-yw')) || p.youthWidthIn;
          p.youthHeightIn = parseFloat(presetBtn.getAttribute('data-yh')) || p.youthHeightIn;
          p.enabled = true;
          renderDtfPlacementsList();
          recalculateEverything();
        }
        return;
      }

      const loadQ = e.target.closest('[data-load-quote]');
      if (loadQ) {
        const qId = loadQ.getAttribute('data-load-quote');
        const found = getSavedQuotes().find((q) => q.quoteId === qId);
        if (found && found.snapshot) {
          const snap = JSON.parse(JSON.stringify(found.snapshot));
          if (snap.customer) state.customer = snap.customer;
          state.ssDiscountPct = snap.ssDiscountPct || 0;
          state.rollWidthMode = snap.rollWidthMode || '27';
          state.includeAutoBuilder15 = snap.includeAutoBuilder15 !== false;
          state.gutterIn = snap.gutterIn != null ? snap.gutterIn : 0.25;
          state.extraSpoilagePrints = snap.extraSpoilagePrints != null ? snap.extraSpoilagePrints : 1;
          state.pressLaborPerShirt = snap.pressLaborPerShirt != null ? snap.pressLaborPerShirt : 1.50;
          state.builtInUpchargePerShirt = snap.builtInUpchargePerShirt != null ? snap.builtInUpchargePerShirt : 8.00;
          state.ssShippingOverride = snap.ssShippingOverride || '';
          state.dpwShippingUsd = snap.dpwShippingUsd != null ? snap.dpwShippingUsd : 9.95;
          state.discountPct = snap.discountPct || 0;
          state.discountLabel = snap.discountLabel || '';
          state.includeTax = snap.includeTax !== false;
          state.taxRatePct = snap.taxRatePct != null ? snap.taxRatePct : 7.00;
          state.includeAvailableColorsOnPdf = snap.includeAvailableColorsOnPdf !== false;
          if (Array.isArray(snap.garmentLines)) {
            state.garmentLines = snap.garmentLines.map((gl) => ({
              ...gl,
              quantities: Object.assign(makeEmptyQtyMap(), gl.quantities || {})
            }));
          }
          if (Array.isArray(snap.dtfPlacements)) {
            state.dtfPlacements = snap.dtfPlacements.map((dp) => ({
              ...dp,
              dataUrl: '',
              trimmedDataUrl: '',
              imgElement: null
            }));
          }
          syncTopControlsFromState();
          syncCustomerInputsFromState();
          renderGarmentLinesList();
          renderDtfPlacementsList();
          recalculateEverything();
        }
        return;
      }

      const delQ = e.target.closest('[data-delete-quote]');
      if (delQ) {
        const qId = delQ.getAttribute('data-delete-quote');
        const filtered = getSavedQuotes().filter((q) => q.quoteId !== qId);
        localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(filtered));
        renderSavedQuotesList();
      }
    });

    // Delegated Inputs
    root.addEventListener('input', (e) => {
      const t = e.target;

      if (t.id === 'bqCustFullName') { state.customer.fullName = t.value; triggerAutoSaveCustomer(); return; }
      if (t.id === 'bqCustCompany') { state.customer.companyOrTeam = t.value; triggerAutoSaveCustomer(); return; }
      if (t.id === 'bqCustEmail') { state.customer.email = t.value; triggerAutoSaveCustomer(); return; }
      if (t.id === 'bqCustPhone') { state.customer.phone = t.value; triggerAutoSaveCustomer(); return; }
      if (t.id === 'bqCustAddress') { state.customer.address = t.value; triggerAutoSaveCustomer(); return; }
      if (t.id === 'bqCustProject') { state.customer.projectName = t.value; triggerAutoSaveCustomer(); return; }
      if (t.id === 'bqCustNotes') { state.customer.notes = t.value; triggerAutoSaveCustomer(); return; }

      if (t.hasAttribute('data-size-key')) {
        const lineId = t.getAttribute('data-line-id');
        const sz = t.getAttribute('data-size-key');
        const line = state.garmentLines.find((l) => l.id === lineId);
        if (line && sz) {
          const v = Math.max(0, parseInt(t.value, 10) || 0);
          line.quantities[sz] = v;
          const cell = t.closest('.bq-size-cell');
          if (cell) cell.classList.toggle('has-qty', v > 0);
          recalculateEverything();
        }
        return;
      }

      if (t.id === 'bqSsDiscountInput') {
        state.ssDiscountPct = Math.min(80, Math.max(0, parseFloat(t.value) || 0));
        saveOwnerRatePrefs();
        renderGarmentLinesList();
        recalculateEverything();
      } else if (t.id === 'bqGutterInput') {
        state.gutterIn = Math.min(2, Math.max(0, parseFloat(t.value) || 0));
        recalculateEverything();
      } else if (t.id === 'bqExtraPrintsInput') {
        state.extraSpoilagePrints = Math.max(0, parseInt(t.value, 10) || 0);
        recalculateEverything();
      } else if (t.id === 'bqPressLaborInput') {
        state.pressLaborPerShirt = Math.max(0, parseFloat(t.value) || 0);
        saveOwnerRatePrefs();
        recalculateEverything();
      } else if (t.id === 'bqBuiltInUpchargeInput') {
        state.builtInUpchargePerShirt = Math.max(0, parseFloat(t.value) || 0);
        saveOwnerRatePrefs();
        recalculateEverything();
      } else if (t.id === 'bqSsShippingInput') {
        state.ssShippingOverride = t.value;
        recalculateEverything();
      } else if (t.id === 'bqDpwShippingInput') {
        state.dpwShippingUsd = Math.max(0, parseFloat(t.value) || 0);
        saveOwnerRatePrefs();
        recalculateEverything();
      } else if (t.id === 'bqDiscountPctInput') {
        state.discountPct = Math.min(100, Math.max(0, parseFloat(t.value) || 0));
        recalculateEverything();
      } else if (t.id === 'bqDiscountLabelInput') {
        state.discountLabel = t.value;
        recalculateEverything();
      } else if (t.id === 'bqTaxRateInput') {
        state.taxRatePct = Math.min(25, Math.max(0, parseFloat(t.value) || 0));
        saveOwnerRatePrefs();
        recalculateEverything();
      }

      if (t.hasAttribute('data-dtf-label')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-label'));
        if (p) { p.locationLabel = t.value; recalculateEverything(); }
      } else if (t.hasAttribute('data-dtf-aw')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-aw'));
        if (p) { p.adultWidthIn = Math.max(0.5, parseFloat(t.value) || 0.5); recalculateEverything(); }
      } else if (t.hasAttribute('data-dtf-ah')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-ah'));
        if (p) { p.adultHeightIn = Math.max(0.5, parseFloat(t.value) || 0.5); recalculateEverything(); }
      } else if (t.hasAttribute('data-dtf-yw')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-yw'));
        if (p) { p.youthWidthIn = Math.max(0.5, parseFloat(t.value) || 0.5); recalculateEverything(); }
      } else if (t.hasAttribute('data-dtf-yh')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-yh'));
        if (p) { p.youthHeightIn = Math.max(0.5, parseFloat(t.value) || 0.5); recalculateEverything(); }
      }
    });

    // Delegated Changes
    root.addEventListener('change', (e) => {
      const t = e.target;

      if (t.hasAttribute('data-line-style')) {
        const line = state.garmentLines.find((l) => l.id === t.getAttribute('data-line-style'));
        if (line) {
          line.styleCode = t.value;
          const validColors = getColorsForStyle(line.styleCode);
          if (!validColors.some((c) => c.name === line.colorName)) {
            line.colorName = validColors[0].name;
          }
          renderGarmentLinesList();
          recalculateEverything();
        }
        return;
      }

      if (t.hasAttribute('data-line-color-select')) {
        const line = state.garmentLines.find((l) => l.id === t.getAttribute('data-line-color-select'));
        if (line) {
          line.colorName = t.value;
          renderGarmentLinesList();
          recalculateEverything();
        }
        return;
      }

      if (t.hasAttribute('data-dtf-file')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-file'));
        const file = t.files && t.files[0];
        if (p && file) analyzeUploadedArtwork(file, p);
        return;
      }

      if (t.hasAttribute('data-dtf-enabled')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-enabled'));
        if (p) {
          p.enabled = t.checked;
          renderDtfPlacementsList();
          recalculateEverything();
        }
        return;
      }

      if (t.hasAttribute('data-dtf-lockbox')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-lockbox'));
        if (p) p.lockToPresetBox = t.checked;
        return;
      }

      if (t.hasAttribute('data-dtf-trim')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-trim'));
        if (p) {
          p.autoTrimTransparent = t.checked;
          if (p.origImgElement) {
            p.imgElement = p.autoTrimTransparent ? (p.trimmedImgElement || p.origImgElement) : p.origImgElement;
          }
          renderDtfPlacementsList();
          recalculateEverything();
        }
        return;
      }

      if (t.id === 'bqRollWidthSelect') {
        state.rollWidthMode = t.value;
        recalculateEverything();
      } else if (t.id === 'bqIncludeAuto15Check') {
        state.includeAutoBuilder15 = t.checked;
        recalculateEverything();
      } else if (t.id === 'bqIncludeColorsPdfCheck') {
        state.includeAvailableColorsOnPdf = t.checked;
      }
    });

    root.addEventListener('dragover', (e) => {
      const dz = e.target.closest('[data-dropzone-id]');
      if (dz) { e.preventDefault(); dz.classList.add('drag-hover'); }
    });
    root.addEventListener('dragleave', (e) => {
      const dz = e.target.closest('[data-dropzone-id]');
      if (dz) dz.classList.remove('drag-hover');
    });
    root.addEventListener('drop', (e) => {
      const dz = e.target.closest('[data-dropzone-id]');
      if (!dz) return;
      e.preventDefault();
      dz.classList.remove('drag-hover');
      const pId = dz.getAttribute('data-dropzone-id');
      const p = state.dtfPlacements.find((x) => x.id === pId);
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (p && file) analyzeUploadedArtwork(file, p);
    });
  }

  function syncTopControlsFromState() {
    const setV = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };
    setV('bqSsDiscountInput', state.ssDiscountPct || 0);
    setV('bqRollWidthSelect', state.rollWidthMode || '27');
    setV('bqGutterInput', state.gutterIn);
    setV('bqExtraPrintsInput', state.extraSpoilagePrints);
    setV('bqPressLaborInput', state.pressLaborPerShirt);
    setV('bqBuiltInUpchargeInput', state.builtInUpchargePerShirt);
    setV('bqSsShippingInput', state.ssShippingOverride);
    setV('bqDpwShippingInput', state.dpwShippingUsd);
    setV('bqDiscountPctInput', state.discountPct || 0);
    setV('bqDiscountLabelInput', state.discountLabel || '');
    setV('bqTaxRateInput', Number(state.taxRatePct || 0).toFixed(2));
    const chk = document.getElementById('bqIncludeAuto15Check');
    if (chk) chk.checked = Boolean(state.includeAutoBuilder15);
    const pdfChk = document.getElementById('bqIncludeColorsPdfCheck');
    if (pdfChk) pdfChk.checked = Boolean(state.includeAvailableColorsOnPdf);
    syncTaxToggleUi();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBulkQuoteTool);
  } else {
    initBulkQuoteTool();
  }
})();
