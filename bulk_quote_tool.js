/**
 * RetroCanopy Owner's Hub — Bulk Order Quoting, Liquid Glass Receipt & Multi-Sheet Gangsheet Studio (v4)
 *
 * Upgrades in v4:
 *  1. Synchronous Offscreen Canvas Logo Bitmaps — 100% of uploaded logos (PNG/SVG/WEBP/JPG) appear
 *     immediately on EVERY gangsheet preview and EVERY 300 DPI download (fixes Image decode race condition).
 *  2. Multi-Sheet 300 DPI Downloader + Bottom Collapsible Gangsheets Tab — displays ALL gangsheets needed
 *     for the order and downloads ALL needed 300 DPI .PNG gangsheets in one click (plus per-sheet download).
 *  3. Projected Finished Item Picture — dynamically renders Front & Back photorealistic garment preview
 *     (or DTF Print Proof for Print-Only orders) tinted to the exact S&S color with uploaded logos composited
 *     directly onto the shirt, embedded on both the live receipt and Printable Quote PDF.
 *  4. PRINT ONLY ($0.00) Size Option — dedicated $0 blank cost cell for DTF-transfer-only orders.
 *  5. Black & Molten Orange Liquid Glass Receipt & PDF Aesthetic + Top Header Capabilities Strip:
 *     (Apparel • Websites • Marketing • Apps • Games • Custom 3D Prints).
 */
(function () {
  'use strict';

  const EDGE_LOOKUP_URL = 'https://axavvrqyzpwsczpiwmua.supabase.co/functions/v1/retrocanopy-bulk-quote-lookup';
  const SAVED_QUOTES_KEY = 'rc_owner_bulk_quotes_v4';
  const LEGACY_QUOTES_KEYS = ['rc_owner_bulk_quotes_v3', 'rc_owner_bulk_quotes_v2'];
  const CUSTOMERS_CRM_KEY = 'rc_owner_bulk_customers_crm_v1';
  const ACTIVE_CUSTOMER_DRAFT_KEY = 'rc_owner_bulk_active_customer_v1';
  const OWNER_RATES_PREF_KEY = 'rc_owner_bulk_rate_prefs_v2';
  const SS_CREDS_KEY = 'rc_owner_ss_api_creds_v1';

  const PRINT_ONLY_KEY = 'PRINT ONLY';
  const YOUTH_SIZES = ['YXS', 'YS', 'YM', 'YL', 'YXL'];
  const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];
  const ALL_SIZES = [PRINT_ONLY_KEY, ...YOUTH_SIZES, ...ADULT_SIZES];

  const STUDIO_CAPABILITIES = [
    'Apparel',
    'Websites',
    'Marketing',
    'Apps',
    'Games',
    'Custom 3D Prints'
  ];

  const YOUTH_API_SIZE_MAP = { YXS: 'XS', YS: 'S', YM: 'M', YL: 'L', YXL: 'XL' };

  function getAssetUrl(relPath) {
    try {
      return new URL(relPath, window.location.href).href;
    } catch (_) {
      return relPath;
    }
  }

  // Preload photorealistic TT11 & CE10L Dri-Fit studio cutouts + Official Logo
  const blankMockupAssets = {
    tt11WhiteFront: null,
    tt11WhiteBack: null,
    tt11BlackFront: null,
    tt11BlackBack: null,
    ce10lWhiteFront: null,
    ce10lWhiteBack: null,
    ce10lBlackFront: null,
    ce10lBlackBack: null,
    officialLogo: null,
    officialLogoTrimmed: null
  };

  function trimImageTransparentBoundsToCanvas(img, alphaThreshold = 26) {
    try {
      const iw = img.naturalWidth || img.width || 0;
      const ih = img.naturalHeight || img.height || 0;
      if (iw < 2 || ih < 2) return img;
      const cv = document.createElement('canvas');
      cv.width = iw;
      cv.height = ih;
      const cctx = cv.getContext('2d');
      cctx.drawImage(img, 0, 0, iw, ih);
      const data = cctx.getImageData(0, 0, iw, ih).data;
      let minX = iw, minY = ih, maxX = -1, maxY = -1;
      for (let y = 0; y < ih; y++) {
        for (let x = 0; x < iw; x++) {
          if (data[(y * iw + x) * 4 + 3] >= alphaThreshold) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX >= minX && maxY >= minY) {
        const cw = Math.max(1, maxX - minX + 1);
        const ch = Math.max(1, maxY - minY + 1);
        const out = document.createElement('canvas');
        out.width = cw;
        out.height = ch;
        out.getContext('2d').drawImage(cv, minX, minY, cw, ch, 0, 0, cw, ch);
        return out;
      }
      return cv;
    } catch (_) {
      return img;
    }
  }

  function preloadBlankShirtAssets() {
    const pairs = [
      ['tt11WhiteFront', 'assets/blanks/ss_tt11_white_front.png'],
      ['tt11WhiteBack', 'assets/blanks/ss_tt11_white_back.png'],
      ['tt11BlackFront', 'assets/blanks/ss_tt11_black_front.png'],
      ['tt11BlackBack', 'assets/blanks/ss_tt11_black_back.png'],
      ['ce10lWhiteFront', 'assets/blanks/ss_ce10l_white_front.png'],
      ['ce10lWhiteBack', 'assets/blanks/ss_ce10l_white_back.png'],
      ['ce10lBlackFront', 'assets/blanks/ss_ce10l_black_front.png'],
      ['ce10lBlackBack', 'assets/blanks/ss_ce10l_black_back.png'],
      ['officialLogo', 'assets/logo.png']
    ];
    pairs.forEach(([key, rel]) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => {
        blankMockupAssets[key] = im;
        if (key === 'officialLogo') {
          blankMockupAssets.officialLogoTrimmed = trimImageTransparentBoundsToCanvas(im, 28);
        }
        if (state.lastCalculation) {
          renderSummaryAndCanvas();
        }
      };
      im.src = getAssetUrl(rel);
    });
  }

  const PRINT_ONLY_DESCRIPTION = 'Commercial 300-DPI Direct-to-Film (DTF) Gangsheet Transfer Only — stretchable soft-hand polyurethane hot-peel adhesive, vibrant CMYK+W ink, press-ready at 300°F for 12s ($0.00 garment blank).';

  // Official S&S Activewear Verified Catalog (Direct S&S Size Pricing + PRINT ONLY $0.00)
  const SS_CATALOG = {
    TT11: {
      styleCode: 'TT11',
      youthStyleCode: 'TT11Y',
      itemNumber: '671D9',
      youthItemNumber: '683D9',
      brand: 'Team 365',
      isLongSleeve: false,
      shortLabel: 'Dri-Fit Short Sleeve (Adult TT11 #671D9 / Youth TT11Y #683D9)',
      fullName: 'Team 365 Zone Performance Short Sleeve T-Shirt',
      youthFullName: 'Team 365 Youth Zone Performance Short Sleeve T-Shirt',
      specs: '3.5 oz./yd² (130 gsm), 100% Polyester Sonic Heather / Interlock Dri-Fit • Moisture-Wicking • UV 40+ UPF Sun Protection • Cationic Dyes for Superior Brightness',
      itemDescription: 'Team 365 Zone Performance Short-Sleeve Dri-Fit Crewneck (S&S Style #TT11 / Item #671D9): Lightweight 3.5 oz./yd² (130 gsm) 100% polyester interlock athletic weave with rapid moisture-wicking performance, UV 40+ UPF sun protection, athletic fit with heat-sealed neck label, and cationic dyes for fade-resistant color brilliance.',
      youthItemDescription: 'Team 365 Youth Zone Performance Short-Sleeve Dri-Fit Crewneck (S&S Style #TT11Y / Item #683D9): Youth-proportioned 3.5 oz./yd² 100% polyester interlock moisture-wicking athletic jersey with UV 40+ UPF sun protection, tear-away/heat-sealed comfort tag, and auto-scaled youth DTF transfer sizing.',
      productUrl: 'https://www.ssactivewear.com/p/team_365/tt11',
      youthProductUrl: 'https://www.ssactivewear.com/p/team_365/tt11y',
      standardAdultBase: 8.30,
      basePrices: {
        'PRINT ONLY': 0.00,
        YXS: 8.30, YS: 8.30, YM: 8.30, YL: 8.30, YXL: 8.30,
        XS: 8.30, S: 8.30, M: 8.30, L: 8.30, XL: 8.30,
        '2XL': 10.30, '3XL': 14.30, '4XL': 16.30, '5XL': 18.30, '6XL': 20.30
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
      isLongSleeve: true,
      shortLabel: 'Dri-Fit Long Sleeve (Adult CE10L #267A7 / Youth CE10LY #007A7)',
      fullName: 'CORE365 Capital Performance Long Sleeve T-Shirt',
      youthFullName: 'CORE365 Youth Capital Performance Long Sleeve T-Shirt',
      specs: '4.0 oz./yd² (135–140 gsm), 100% Polyester Interlock Dri-Fit • Moisture-Wicking & Antimicrobial • UV Protection • Tear-Away Label',
      itemDescription: 'CORE365 Capital Performance Long-Sleeve Dri-Fit Crewneck (S&S Style #CE10L / Item #267A7): 4.0 oz./yd² (140 gsm) 100% polyester interlock performance knit with moisture-wicking & antimicrobial finish, UV protection, double-needle hemmed long sleeves, and clean tear-away neck label.',
      youthItemDescription: 'CORE365 Youth Capital Performance Long-Sleeve Dri-Fit Crewneck (S&S Style #CE10LY / Item #007A7): Youth-sized 4.0 oz./yd² 100% polyester interlock moisture-wicking long-sleeve athletic shirt with antimicrobial finish, UV protection, and auto-scaled youth DTF transfer sizing.',
      productUrl: 'https://www.ssactivewear.com/p/core365/ce10l',
      youthProductUrl: 'https://www.ssactivewear.com/p/core365/ce10ly',
      standardAdultBase: 7.70,
      basePrices: {
        'PRINT ONLY': 0.00,
        YXS: 7.10, YS: 7.10, YM: 7.10, YL: 7.10, YXL: 7.10,
        XS: 7.70, S: 7.70, M: 7.70, L: 7.70, XL: 7.70,
        '2XL': 9.70, '3XL': 11.70, '4XL': 13.70, '5XL': 17.70, '6XL': 19.70
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
        origCanvas: null,
        trimmedCanvas: null,
        renderCanvas: null,
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
        origCanvas: null,
        trimmedCanvas: null,
        renderCanvas: null,
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

  const STRIPE_EDGE_URL = 'https://axavvrqyzpwsczpiwmua.supabase.co/functions/v1/retrocanopy-stripe-checkout';
  const ACTIVE_QUOTE_ID_KEY = 'rc_active_bulk_ticket_id_v6';

  function mintFreshQuoteId() {
    const id = 'RC-TKT-' + Math.floor(100000 + Math.random() * 900000);
    try { sessionStorage.setItem(ACTIVE_QUOTE_ID_KEY, id); } catch (_) {}
    state.activeQuotePaidInfo = null;
    return id;
  }

  function getOrInitActiveQuoteId() {
    try {
      const existing = sessionStorage.getItem(ACTIVE_QUOTE_ID_KEY);
      if (existing && /^(RC-TKT-\d+|RC-Q\d+)/i.test(existing)) return existing;
    } catch (_) {}
    return mintFreshQuoteId();
  }

  state.activeQuoteId = getOrInitActiveQuoteId();
  state.activeQuotePaidInfo = null;
  state.stripeSyncStatus = 'ready';
  state.cloudSavedQuotes = [];
  state.sqVaultFilter = 'all';
  state.sqVaultSearch = '';
  let stripeSyncTimer = null;

  function getClientQuoteDossierUrl(ticketOverride) {
    const tid = ticketOverride || state.activeQuoteId || getOrInitActiveQuoteId();
    return `${window.location.origin}/quote.html?ticket=${encodeURIComponent(tid)}`;
  }

  function getPublicClientQuoteUrl(ticketOverride) {
    const tid = ticketOverride || state.activeQuoteId || getOrInitActiveQuoteId();
    const base = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? window.location.origin
      : 'https://www.retrocanopy.com';
    return `${base}/quote.html?ticket=${encodeURIComponent(tid)}`;
  }

  function getProjectStudioTicketUrl(ticketOverride) {
    const tid = ticketOverride || state.activeQuoteId || getOrInitActiveQuoteId();
    const base = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? window.location.origin
      : 'https://www.retrocanopy.com';
    return `${base}/admin.html?tab=bulkquote&ticket=${encodeURIComponent(tid)}`;
  }

  function getQuoteStripePortalUrl(calc) {
    const tid = state.activeQuoteId || getOrInitActiveQuoteId();
    const amt = calc && calc.customerQuoteTotal > 0 ? calc.customerQuoteTotal.toFixed(2) : '0.00';
    return `${STRIPE_EDGE_URL}?q=${encodeURIComponent(tid)}&amt=${amt}`;
  }

  function buildCompactPlacementThumbDataUrl(p) {
    const src = p.renderCanvas || p.trimmedCanvas || p.origCanvas;
    if (!src) return p.thumbDataUrl || '';
    try {
      const iw = src.naturalWidth || src.width || 1;
      const ih = src.naturalHeight || src.height || 1;
      const maxDim = 240;
      const sc = Math.min(1, maxDim / Math.max(iw, ih));
      const tw = Math.max(1, Math.round(iw * sc));
      const th = Math.max(1, Math.round(ih * sc));
      const cv = document.createElement('canvas');
      cv.width = tw;
      cv.height = th;
      cv.getContext('2d').drawImage(src, 0, 0, tw, th);
      return cv.toDataURL('image/png');
    } catch (_) {
      return p.thumbDataUrl || '';
    }
  }

  function buildCurrentProjectSnapshot() {
    return {
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
      dtfPlacements: state.dtfPlacements.map((p) => {
        const thumbDataUrl = buildCompactPlacementThumbDataUrl(p);
        p.thumbDataUrl = thumbDataUrl;
        return {
          id: p.id,
          enabled: p.enabled,
          locationLabel: p.locationLabel,
          adultWidthIn: p.adultWidthIn,
          adultHeightIn: p.adultHeightIn,
          youthWidthIn: p.youthWidthIn,
          youthHeightIn: p.youthHeightIn,
          lockToPresetBox: p.lockToPresetBox,
          autoTrimTransparent: p.autoTrimTransparent,
          fileName: p.fileName,
          thumbDataUrl
        };
      })
    };
  }

  // =========================================================================
  // VERIFIED ISO/IEC 18004 QR CODE ENCODER (VERSIONS 1..10, ECC LEVEL M)
  // =========================================================================
  function encodeQrMatrix(text) {
    const bytes = Array.from(new TextEncoder().encode(String(text || '')));
    const VERSIONS_M = [
      null,
      { v: 1,  dcw: 16,  ecPerBlock: 10, b1: 1, c1: 16, b2: 0, c2: 0,  align: [] },
      { v: 2,  dcw: 28,  ecPerBlock: 16, b1: 1, c1: 28, b2: 0, c2: 0,  align: [6, 18] },
      { v: 3,  dcw: 44,  ecPerBlock: 26, b1: 1, c1: 44, b2: 0, c2: 0,  align: [6, 22] },
      { v: 4,  dcw: 64,  ecPerBlock: 18, b1: 2, c1: 32, b2: 0, c2: 0,  align: [6, 26] },
      { v: 5,  dcw: 86,  ecPerBlock: 24, b1: 2, c1: 43, b2: 0, c2: 0,  align: [6, 30] },
      { v: 6,  dcw: 108, ecPerBlock: 16, b1: 4, c1: 27, b2: 0, c2: 0,  align: [6, 34] },
      { v: 7,  dcw: 124, ecPerBlock: 18, b1: 4, c1: 31, b2: 0, c2: 0,  align: [6, 22, 38] },
      { v: 8,  dcw: 154, ecPerBlock: 22, b1: 2, c1: 38, b2: 2, c2: 39, align: [6, 24, 42] },
      { v: 9,  dcw: 182, ecPerBlock: 22, b1: 3, c1: 36, b2: 2, c2: 37, align: [6, 26, 46] },
      { v: 10, dcw: 216, ecPerBlock: 26, b1: 4, c1: 43, b2: 1, c2: 44, align: [6, 28, 50] }
    ];

    let spec = VERSIONS_M[10];
    for (let v = 1; v <= 10; v++) {
      const lenBits = v <= 9 ? 8 : 16;
      const maxBytes = Math.floor((VERSIONS_M[v].dcw * 8 - 4 - lenBits) / 8);
      if (bytes.length <= maxBytes) {
        spec = VERSIONS_M[v];
        break;
      }
    }

    const safeBytes = bytes.slice(0, 210);
    const bits = [];
    const pushBits = (val, n) => {
      for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1);
    };
    pushBits(0b0100, 4);
    pushBits(safeBytes.length, spec.v <= 9 ? 8 : 16);
    for (let i = 0; i < safeBytes.length; i++) pushBits(safeBytes[i], 8);

    const totalDataBits = spec.dcw * 8;
    pushBits(0, Math.min(4, totalDataBits - bits.length));
    while (bits.length % 8 !== 0) bits.push(0);

    const dataCw = [];
    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
      dataCw.push(byte);
    }
    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (dataCw.length < spec.dcw) {
      dataCw.push(padBytes[padIdx % 2]);
      padIdx++;
    }

    const gfExp = new Uint8Array(512);
    const gfLog = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      gfExp[i] = x;
      gfLog[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) gfExp[i] = gfExp[i - 255];
    const gfMul = (a, b) => (a === 0 || b === 0) ? 0 : gfExp[gfLog[a] + gfLog[b]];

    let poly = [1];
    for (let i = 0; i < spec.ecPerBlock; i++) {
      const next = new Array(poly.length + 1).fill(0);
      const root = gfExp[i];
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], root);
      }
      poly = next;
    }

    const rsEncodeBlock = (dataBlock) => {
      const ecLen = poly.length - 1;
      const rem = new Uint8Array(ecLen);
      for (let i = 0; i < dataBlock.length; i++) {
        const factor = dataBlock[i] ^ rem[0];
        for (let j = 0; j < ecLen - 1; j++) rem[j] = rem[j + 1];
        rem[ecLen - 1] = 0;
        if (factor !== 0) {
          for (let j = 0; j < ecLen; j++) rem[j] ^= gfMul(poly[j + 1], factor);
        }
      }
      return Array.from(rem);
    };

    const dataBlocks = [];
    const ecBlocks = [];
    let offset = 0;
    for (let i = 0; i < spec.b1; i++) {
      const blk = dataCw.slice(offset, offset + spec.c1);
      offset += spec.c1;
      dataBlocks.push(blk);
      ecBlocks.push(rsEncodeBlock(blk));
    }
    for (let i = 0; i < spec.b2; i++) {
      const blk = dataCw.slice(offset, offset + spec.c2);
      offset += spec.c2;
      dataBlocks.push(blk);
      ecBlocks.push(rsEncodeBlock(blk));
    }

    const finalCw = [];
    const maxDataLen = Math.max(spec.c1, spec.c2);
    for (let c = 0; c < maxDataLen; c++) {
      for (let b = 0; b < dataBlocks.length; b++) {
        if (c < dataBlocks[b].length) finalCw.push(dataBlocks[b][c]);
      }
    }
    for (let c = 0; c < spec.ecPerBlock; c++) {
      for (let b = 0; b < ecBlocks.length; b++) finalCw.push(ecBlocks[b][c]);
    }

    const size = spec.v * 4 + 17;
    const mod = Array.from({ length: size }, () => new Uint8Array(size));
    const isFunc = Array.from({ length: size }, () => new Uint8Array(size));
    const setFunc = (r, c, dark) => {
      if (r < 0 || r >= size || c < 0 || c >= size) return;
      mod[r][c] = dark ? 1 : 0;
      isFunc[r][c] = 1;
    };

    const placeFinder = (topR, leftC) => {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const r = topR + dr, c = leftC + dc;
          if (r < 0 || r >= size || c < 0 || c >= size) continue;
          const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
          const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
          const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          setFunc(r, c, inOuter && (onBorder || inCore));
        }
      }
    };
    placeFinder(0, 0);
    placeFinder(0, size - 7);
    placeFinder(size - 7, 0);

    for (let i = 8; i < size - 8; i++) {
      setFunc(6, i, i % 2 === 0);
      setFunc(i, 6, i % 2 === 0);
    }

    const ac = spec.align;
    for (let i = 0; i < ac.length; i++) {
      for (let j = 0; j < ac.length; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === ac.length - 1) || (i === ac.length - 1 && j === 0)) continue;
        const cr = ac[i], cc = ac[j];
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            setFunc(cr + dr, cc + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
          }
        }
      }
    }

    setFunc(size - 8, 8, true);
    for (let i = 0; i <= 8; i++) {
      if (!isFunc[8][i]) setFunc(8, i, false);
      if (!isFunc[i][8]) setFunc(i, 8, false);
    }
    for (let i = 0; i < 8; i++) {
      if (!isFunc[8][size - 1 - i]) setFunc(8, size - 1 - i, false);
      if (!isFunc[size - 1 - i][8]) setFunc(size - 1 - i, 8, false);
    }
    if (spec.v >= 7) {
      let rem = spec.v << 12;
      for (let i = 17; i >= 12; i--) {
        if ((rem >>> i) & 1) rem ^= 0x1f25 << (i - 12);
      }
      const verBits = (spec.v << 12) | rem;
      for (let i = 0; i < 18; i++) {
        const bit = ((verBits >>> i) & 1) === 1;
        const a = size - 11 + (i % 3);
        const b = Math.floor(i / 3);
        setFunc(a, b, bit);
        setFunc(b, a, bit);
      }
    }

    let bitIdx = 0;
    const totalBits = finalCw.length * 8;
    let upward = true;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        const r = upward ? (size - 1 - vert) : vert;
        for (let j = 0; j < 2; j++) {
          const c = right - j;
          if (!isFunc[r][c]) {
            let dark = false;
            if (bitIdx < totalBits) {
              dark = ((finalCw[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) === 1;
              bitIdx++;
            }
            mod[r][c] = dark ? 1 : 0;
          }
        }
      }
      upward = !upward;
    }

    const writeFormatBits = (mat, mask) => {
      const data = (0b00 << 3) | mask;
      let rem = data << 10;
      for (let i = 14; i >= 10; i--) {
        if ((rem >>> i) & 1) rem ^= 0x537 << (i - 10);
      }
      const bits15 = ((data << 10) | rem) ^ 0x5412;
      for (let i = 0; i <= 5; i++) mat[i][8] = (bits15 >>> i) & 1;
      mat[7][8] = (bits15 >>> 6) & 1;
      mat[8][8] = (bits15 >>> 7) & 1;
      mat[8][7] = (bits15 >>> 8) & 1;
      for (let i = 9; i < 15; i++) mat[8][14 - i] = (bits15 >>> i) & 1;
      for (let i = 0; i < 8; i++) mat[8][size - 1 - i] = (bits15 >>> i) & 1;
      for (let i = 8; i < 15; i++) mat[size - 15 + i][8] = (bits15 >>> i) & 1;
      mat[size - 8][8] = 1;
    };

    const maskFns = [
      (r, c) => (r + c) % 2 === 0,
      (r) => r % 2 === 0,
      (_, c) => c % 3 === 0,
      (r, c) => (r + c) % 3 === 0,
      (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
      (r, c) => ((r * c) % 2 + (r * c) % 3) === 0,
      (r, c) => (((r * c) % 2 + (r * c) % 3) % 2) === 0,
      (r, c) => (((r + c) % 2 + (r * c) % 3) % 2) === 0
    ];

    const scorePenalty = (mat) => {
      let p = 0;
      for (let r = 0; r < size; r++) {
        let run = 1;
        for (let c = 1; c < size; c++) {
          if (mat[r][c] === mat[r][c - 1]) {
            run++;
            if (run === 5) p += 3;
            else if (run > 5) p += 1;
          } else run = 1;
        }
      }
      for (let c = 0; c < size; c++) {
        let run = 1;
        for (let r = 1; r < size; r++) {
          if (mat[r][c] === mat[r - 1][c]) {
            run++;
            if (run === 5) p += 3;
            else if (run > 5) p += 1;
          } else run = 1;
        }
      }
      return p;
    };

    let bestMat = null;
    let bestScore = Infinity;
    for (let m = 0; m < 8; m++) {
      const candidate = mod.map((row) => Uint8Array.from(row));
      const fn = maskFns[m];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!isFunc[r][c] && fn(r, c)) candidate[r][c] ^= 1;
        }
      }
      writeFormatBits(candidate, m);
      const sc = scorePenalty(candidate);
      if (sc < bestScore) {
        bestScore = sc;
        bestMat = candidate;
      }
    }
    return { size, modules: bestMat };
  }

  function renderStripeQrDataUrl(url, targetPx) {
    const qr = encodeQrMatrix(url);
    const quiet = 4;
    const totalModules = qr.size + quiet * 2;
    const scale = Math.max(4, Math.floor((targetPx || 260) / totalModules));
    const px = totalModules * scale;
    const cv = document.createElement('canvas');
    cv.width = px;
    cv.height = px;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, px, px);
    ctx.fillStyle = '#09080e';
    for (let r = 0; r < qr.size; r++) {
      const row = qr.modules[r];
      for (let c = 0; c < qr.size; c++) {
        if (row[c]) {
          ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
        }
      }
    }
    return cv.toDataURL('image/png');
  }

  async function syncQuoteToStripeCloudNow(calcOverride, opts = {}) {
    const calc = calcOverride || state.lastCalculation;
    if (!calc || calc.totalShirts === 0) return null;
    const ticketId = state.activeQuoteId || getOrInitActiveQuoteId();
    const c = state.customer;
    const primaryStyleCode = state.garmentLines[0]?.styleCode || 'TT11';
    const ssColors = getColorsForStyle(primaryStyleCode);
    const activeColorNames = Array.from(new Set(state.garmentLines.map((l) => l.colorName)));

    const payload = {
      action: 'save_quote_for_stripe',
      ticketId,
      quoteId: ticketId,
      isExplicitSave: Boolean(opts.isExplicitSave),
      projectName: c.projectName || c.companyOrTeam || 'Custom Performance Apparel & Print Order',
      customerName: [c.fullName, c.companyOrTeam].filter(Boolean).join(' — '),
      customerCompany: c.companyOrTeam || '',
      customerEmail: c.email || '',
      customerPhone: c.phone || '',
      shippingAddress: c.address || '',
      customerNotes: c.notes || '',
      itemizedLines: calc.itemizedLines,
      itemOverallGroups: calc.itemOverallGroups,
      itemDescriptions: calc.itemDescriptions,
      availableColors: {
        styleCode: primaryStyleCode,
        brand: (SS_CATALOG[primaryStyleCode] || SS_CATALOG.TT11).brand,
        selectedColors: activeColorNames,
        colors: ssColors
      },
      projectedPreviewJpeg: calc.projectedPreviewJpeg || '',
      projectSnapshot: buildCurrentProjectSnapshot(),
      subtotalBeforeDiscount: calc.subtotalBeforeDiscount,
      discountPct: calc.discountPct,
      discountLabel: calc.discountLabel,
      discountAmountUsd: calc.discountAmountUsd,
      subtotalAfterDiscount: calc.subtotalAfterDiscount,
      includeTax: calc.includeTax,
      taxRatePct: calc.taxRatePct,
      taxAmountUsd: calc.taxAmountUsd,
      grandTotalUsd: calc.customerQuoteTotal,
      avgItemPreDiscount: calc.avgItemPreDiscount,
      avgItemAllInFinal: calc.avgItemAllInFinal,
      totalHardCostUsd: calc.totalHardCostUsd,
      netProfitUsd: calc.netProfitUsd,
      totalShirts: calc.totalShirts
    };
    try {
      const res = await fetch(STRIPE_EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        state.stripeSyncStatus = 'synced';
        if (data.alreadyPaid) {
          state.activeQuotePaidInfo = {
            isPaid: true,
            paidAt: state.activeQuotePaidInfo?.paidAt || new Date().toISOString(),
            totalPaidUsd: calc.customerQuoteTotal
          };
        }
        const dotEl = document.getElementById('bqStripeQrSyncBadge');
        if (dotEl) {
          dotEl.innerHTML = data.alreadyPaid
            ? '&#10003; PAID IN FULL VIA STRIPE'
            : '&#9679; Live Ticket &amp; Stripe Synced';
          dotEl.style.color = '#22f59b';
        }
        if (opts.isExplicitSave) {
          fetchAndRenderSavedQuotesVault(true);
        }
        return data;
      }
    } catch (_) {
      state.stripeSyncStatus = 'fallback';
    }
    return null;
  }

  function scheduleStripeQuoteCloudSync() {
    clearTimeout(stripeSyncTimer);
    stripeSyncTimer = setTimeout(() => {
      syncQuoteToStripeCloudNow();
    }, 650);
  }

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

  function isPrintOnlySize(sz) {
    return sz === PRINT_ONLY_KEY;
  }

  function getBlankUnitPrice(styleCode, colorName, sizeName) {
    if (isPrintOnlySize(sizeName)) return 0.00;
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
    if (isPrintOnlySize(sizeName)) return null;
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
  // 2D SHELF GANGSHEET PACKER (GUARANTEES EVERY PLACEMENT LOGO IS PACKED)
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
          placementId: p.parentPlacementId,
          packGroupId: p.id,
          placementIdx: p.placementIdx,
          sizeGroup: p.sizeGroup,
          label: p.locationLabel,
          shortLoc: p.shortLoc,
          w: clampedW,
          h: clampedH,
          origW: w0,
          origH: h0,
          rotated,
          renderSource: p.renderSource
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
  // SYNCHRONOUS CANVAS BITMAP ARTWORK ANALYZER (ZERO IMAGE DECODE RACE!)
  // =========================================================================
  function analyzeUploadedArtwork(file, placement) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = String(ev.target.result || '');
      const img = new Image();
      img.onload = () => {
        // Handle SVGs that may report 0 naturalWidth by rasterizing at high-res 2000px
        let origW = img.naturalWidth || img.width || 0;
        let origH = img.naturalHeight || img.height || 0;
        if (origW < 4 || origH < 4) {
          origW = 2000;
          origH = 2000;
        }
        // Cap internal bitmap at 3600px max edge for crisp 300 DPI without excessive RAM
        const maxSide = 3600;
        const hiScale = Math.min(1, maxSide / Math.max(origW, origH));
        const hiW = Math.max(1, Math.round(origW * hiScale));
        const hiH = Math.max(1, Math.round(origH * hiScale));

        const origCanvas = document.createElement('canvas');
        origCanvas.width = hiW;
        origCanvas.height = hiH;
        const origCtx = origCanvas.getContext('2d');
        origCtx.drawImage(img, 0, 0, hiW, hiH);

        // Scan alpha channel to find tight ink bounding box
        const maxScan = 1000;
        const scanScale = Math.min(1, maxScan / Math.max(hiW, hiH));
        const sw = Math.max(1, Math.round(hiW * scanScale));
        const sh = Math.max(1, Math.round(hiH * scanScale));
        const scanCanvas = document.createElement('canvas');
        scanCanvas.width = sw;
        scanCanvas.height = sh;
        const scanCtx = scanCanvas.getContext('2d');
        scanCtx.drawImage(origCanvas, 0, 0, sw, sh);

        let trimX0 = 0, trimY0 = 0, trimX1 = sw - 1, trimY1 = sh - 1;
        let foundInk = false;
        try {
          const imgData = scanCtx.getImageData(0, 0, sw, sh).data;
          let minX = sw, minY = sh, maxX = 0, maxY = 0;
          for (let y = 0; y < sh; y++) {
            for (let x = 0; x < sw; x++) {
              if (imgData[(y * sw + x) * 4 + 3] > 24) {
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

        let trimmedCanvas = origCanvas;
        let trimmedDataUrl = origCanvas.toDataURL('image/png');
        const trimHiX = Math.max(0, Math.floor(trimX0 / scanScale));
        const trimHiY = Math.max(0, Math.floor(trimY0 / scanScale));
        const trimHiW = Math.max(1, Math.min(hiW - trimHiX, Math.ceil((trimX1 - trimX0 + 1) / scanScale)));
        const trimHiH = Math.max(1, Math.min(hiH - trimHiY, Math.ceil((trimY1 - trimY0 + 1) / scanScale)));

        if (foundInk) {
          const cropC = document.createElement('canvas');
          cropC.width = trimHiW;
          cropC.height = trimHiH;
          cropC.getContext('2d').drawImage(origCanvas, trimHiX, trimHiY, trimHiW, trimHiH, 0, 0, trimHiW, trimHiH);
          trimmedCanvas = cropC;
          try {
            trimmedDataUrl = cropC.toDataURL('image/png');
          } catch (_) {}
        }

        placement.fileName = file.name;
        placement.dataUrl = origCanvas.toDataURL('image/png');
        placement.trimmedDataUrl = trimmedDataUrl;
        placement.origCanvas = origCanvas;
        placement.trimmedCanvas = trimmedCanvas;
        placement.renderCanvas = placement.autoTrimTransparent ? trimmedCanvas : origCanvas;
        placement.origPxW = origW;
        placement.origPxH = origH;
        placement.trimPxW = Math.round(trimHiW / hiScale);
        placement.trimPxH = Math.round(trimHiH / hiScale);
        placement.enabled = true;

        if (!placement.lockToPresetBox) {
          const useW = placement.autoTrimTransparent ? placement.trimPxW : origW;
          const useH = placement.autoTrimTransparent ? placement.trimPxH : origH;
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

  // Works synchronously for <canvas> AND <img> sources without stretching
  function drawContainSource(ctx, src, x, y, boxW, boxH) {
    if (!src) return;
    const iw = src.naturalWidth || src.width || 1;
    const ih = src.naturalHeight || src.height || 1;
    if (iw <= 0 || ih <= 0) return;
    const scale = Math.min(boxW / iw, boxH / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = x + (boxW - dw) / 2;
    const dy = y + (boxH - dh) / 2;
    ctx.drawImage(src, dx, dy, dw, dh);
  }

  // =========================================================================
  // PROJECTED FINISHED ITEM MOCKUP COMPOSITOR (FRONT & BACK OR PRINT PROOF)
  // =========================================================================
  function drawProceduralShirtSilhouette(ctx, cx, topY, scaleW, scaleH, hexColor, isLongSleeve, isBack) {
    ctx.save();
    ctx.translate(cx, topY);

    // Subtle drop shadow
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;

    ctx.beginPath();
    // Neckline top-left
    ctx.moveTo(-36 * scaleW, 8 * scaleH);
    // Left shoulder
    ctx.lineTo(-92 * scaleW, 24 * scaleH);
    if (isLongSleeve) {
      // Long left sleeve down to wrist cuff
      ctx.lineTo(-142 * scaleW, 195 * scaleH);
      ctx.lineTo(-112 * scaleW, 204 * scaleH);
      ctx.lineTo(-78 * scaleW, 86 * scaleH);
    } else {
      // Short left sleeve
      ctx.lineTo(-132 * scaleW, 88 * scaleH);
      ctx.lineTo(-96 * scaleW, 108 * scaleH);
      ctx.lineTo(-78 * scaleW, 82 * scaleH);
    }
    // Left torso down to hem
    ctx.lineTo(-76 * scaleW, 252 * scaleH);
    ctx.quadraticCurveTo(0, 262 * scaleH, 76 * scaleW, 252 * scaleH);
    // Right torso up to armpit
    ctx.lineTo(78 * scaleW, (isLongSleeve ? 86 : 82) * scaleH);
    if (isLongSleeve) {
      ctx.lineTo(112 * scaleW, 204 * scaleH);
      ctx.lineTo(142 * scaleW, 195 * scaleH);
    } else {
      ctx.lineTo(96 * scaleW, 108 * scaleH);
      ctx.lineTo(132 * scaleW, 88 * scaleH);
    }
    // Right shoulder back to neck
    ctx.lineTo(92 * scaleW, 24 * scaleH);
    ctx.lineTo(36 * scaleW, 8 * scaleH);
    // Collar dip (deeper in front, shallower in back)
    ctx.quadraticCurveTo(0, (isBack ? 18 : 34) * scaleH, -36 * scaleW, 8 * scaleH);
    ctx.closePath();

    ctx.fillStyle = hexColor;
    ctx.fill();

    // Remove shadow for internal shading
    ctx.shadowColor = 'transparent';
    ctx.clip();

    // Realistic cylindrical fabric lighting gradient
    const grad = ctx.createLinearGradient(-130 * scaleW, 0, 130 * scaleW, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0.28)');
    grad.addColorStop(0.28, 'rgba(255,255,255,0.08)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.14)');
    grad.addColorStop(0.72, 'rgba(255,255,255,0.05)');
    grad.addColorStop(1, 'rgba(0,0,0,0.32)');
    ctx.fillStyle = grad;
    ctx.fillRect(-160 * scaleW, 0, 320 * scaleW, 280 * scaleH);

    // Collar rib trim
    ctx.strokeStyle = 'rgba(128,128,128,0.38)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-38 * scaleW, 9 * scaleH);
    ctx.quadraticCurveTo(0, (isBack ? 21 : 38) * scaleH, 38 * scaleW, 9 * scaleH);
    ctx.stroke();

    ctx.restore();
  }

  function hexLuminance(hexColor) {
    const h = String(hexColor || '#151619').replace('#', '');
    if (h.length !== 6) return 0.1;
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function drawTintedPhotoCutout(ctx, whiteImg, blackImg, hexColor, x, y, w, h) {
    const cleanHex = (hexColor || '#151619').toUpperCase();
    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.round(w));
    off.height = Math.max(1, Math.round(h));
    const octx = off.getContext('2d');

    if ((cleanHex === '#151619' || cleanHex === '#000000') && blackImg) {
      drawContainSource(octx, blackImg, 0, 0, w, h);
    } else if (whiteImg) {
      // 1. Draw authentic Dri-Fit white ghost-mannequin studio photo
      drawContainSource(octx, whiteImg, 0, 0, w, h);
      if (cleanHex !== '#FFFFFF') {
        // 2. Multiply color dye pass
        const tintC = document.createElement('canvas');
        tintC.width = off.width;
        tintC.height = off.height;
        const tctx = tintC.getContext('2d');
        drawContainSource(tctx, whiteImg, 0, 0, w, h);
        tctx.globalCompositeOperation = 'source-in';
        tctx.fillStyle = hexColor;
        tctx.fillRect(0, 0, off.width, off.height);

        octx.globalCompositeOperation = 'multiply';
        octx.drawImage(tintC, 0, 0);

        // 3. Athletic Dri-Fit sheen & seam highlight recovery on darker colors
        const lum = hexLuminance(cleanHex);
        const sheenAlpha = lum < 0.18 ? 0.22 : (lum < 0.42 ? 0.13 : 0.06);
        octx.globalCompositeOperation = 'screen';
        octx.globalAlpha = sheenAlpha;
        drawContainSource(octx, whiteImg, 0, 0, w, h);
        octx.globalAlpha = 1.0;

        // 4. Restore crisp studio alpha mask
        octx.globalCompositeOperation = 'destination-in';
        drawContainSource(octx, whiteImg, 0, 0, w, h);
        octx.globalCompositeOperation = 'source-over';
      }
    }

    // Studio ground contact shadow + elevation drop shadow
    ctx.save();
    const groundGrad = ctx.createRadialGradient(
      x + w / 2, y + h - 8, 6,
      x + w / 2, y + h - 8, w * 0.36
    );
    groundGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    groundGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = groundGrad;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 6, w * 0.35, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'rgba(0,0,0,0.62)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
    ctx.drawImage(off, x, y);
    ctx.restore();
  }

  function drawRoundedRectPath(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  // Procedural Multi-Layer Poured Liquid-Glass Panel Shader (Dynamic Curved Specular Reflection + 3D Crystal Rim)
  function drawLiquidGlassPanel(ctx, x, y, w, h, r, opts = {}) {
    ctx.save();

    // 1. Deep elevation shadow + optional molten rim aura
    ctx.shadowColor = opts.moltenGlow ? 'rgba(255, 114, 16, 0.42)' : 'rgba(0, 0, 0, 0.68)';
    ctx.shadowBlur = opts.moltenGlow ? 30 : 22;
    ctx.shadowOffsetY = opts.moltenGlow ? 5 : 10;

    drawRoundedRectPath(ctx, x, y, w, h, r);
    const bodyGrad = ctx.createLinearGradient(x, y, x + w * 0.32, y + h);
    bodyGrad.addColorStop(0, opts.topFill || 'rgba(64, 60, 78, 0.88)');
    bodyGrad.addColorStop(0.42, opts.midFill || 'rgba(21, 20, 29, 0.93)');
    bodyGrad.addColorStop(1, opts.botFill || 'rgba(11, 10, 16, 0.97)');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Clip internal optical caustics & wet-glass reflections
    drawRoundedRectPath(ctx, x, y, w, h, r);
    ctx.clip();

    // 2. Subsurface warm molten-orange bottom caustic refraction + corner flare
    const bottomGlow = ctx.createRadialGradient(
      x + w * 0.52, y + h * 1.06, 6,
      x + w * 0.52, y + h * 1.02, Math.max(w, h) * 0.72
    );
    bottomGlow.addColorStop(0, opts.warmCore || 'rgba(255, 132, 28, 0.24)');
    bottomGlow.addColorStop(0.50, 'rgba(255, 98, 10, 0.07)');
    bottomGlow.addColorStop(1, 'rgba(255, 98, 10, 0)');
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(x, y, w, h);

    // Subtle top-left cool crystal catchlight bloom
    const cornerGlint = ctx.createRadialGradient(x + w * 0.14, y + 6, 2, x + w * 0.14, y + 6, Math.min(w, 320));
    cornerGlint.addColorStop(0, 'rgba(255, 248, 238, 0.20)');
    cornerGlint.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = cornerGlint;
    ctx.fillRect(x, y, w, h * 0.55);

    // 3. Curved Poured-Resin Upper Wet-Glass Meniscus Sweep (Dynamic S-curve reflection!)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h * 0.25);
    ctx.bezierCurveTo(
      x + w * 0.68, y + h * 0.14,
      x + w * 0.34, y + h * 0.52,
      x, y + h * 0.41
    );
    ctx.closePath();
    const glossGrad = ctx.createLinearGradient(x, y, x, y + h * 0.52);
    glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.27)');
    glossGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0.085)');
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0.008)');
    ctx.fillStyle = glossGrad;
    ctx.fill();

    // 4. Crisp Diagonal Liquid-Crystal Shimmer Band
    const streakGrad = ctx.createLinearGradient(x + w * 0.06, y, x + w * 0.64, y + h);
    streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    streakGrad.addColorStop(0.43, 'rgba(255, 255, 255, 0)');
    streakGrad.addColorStop(0.485, 'rgba(255, 244, 230, 0.11)');
    streakGrad.addColorStop(0.515, 'rgba(255, 198, 140, 0.06)');
    streakGrad.addColorStop(0.56, 'rgba(255, 255, 255, 0)');
    streakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = streakGrad;
    ctx.fillRect(x, y, w, h);

    // 5. Top Wet Meniscus Specular Lip + Left Vertical Crystal Thickness Edge
    const topLip = ctx.createLinearGradient(x, y, x + w, y);
    topLip.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    topLip.addColorStop(0.24, 'rgba(255, 255, 255, 0.76)');
    topLip.addColorStop(0.62, 'rgba(255, 226, 192, 0.44)');
    topLip.addColorStop(1, 'rgba(255, 152, 56, 0.24)');
    ctx.strokeStyle = topLip;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x + r * 0.55, y + 1.2);
    ctx.lineTo(x + w - r * 0.55, y + 1.2);
    ctx.stroke();

    const leftLip = ctx.createLinearGradient(x, y, x, y + h);
    leftLip.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    leftLip.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    leftLip.addColorStop(1, 'rgba(255, 138, 36, 0.20)');
    ctx.strokeStyle = leftLip;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x + 1.2, y + r * 0.65);
    ctx.lineTo(x + 1.2, y + h - r * 0.65);
    ctx.stroke();

    ctx.restore();

    // 6. Outer Refractive Rim Border
    ctx.save();
    drawRoundedRectPath(ctx, x, y, w, h, r);
    if (opts.orangeBorder) {
      const bGrad = ctx.createLinearGradient(x, y, x + w, y + h);
      bGrad.addColorStop(0, '#ffd296');
      bGrad.addColorStop(0.32, '#ff9228');
      bGrad.addColorStop(0.72, '#ff5e00');
      bGrad.addColorStop(1, '#ffb45c');
      ctx.strokeStyle = bGrad;
      ctx.lineWidth = opts.borderWidth || 1.9;
    } else {
      const bGrad = ctx.createLinearGradient(x, y, x, y + h);
      bGrad.addColorStop(0, 'rgba(255, 255, 255, 0.52)');
      bGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.18)');
      bGrad.addColorStop(1, 'rgba(255, 144, 42, 0.42)');
      ctx.strokeStyle = bGrad;
      ctx.lineWidth = opts.borderWidth || 1.4;
    }
    ctx.stroke();
    ctx.restore();
  }

  // Draws DTF artwork at exact 1:1 physical garment scale AND blends subtle 3D shirt contour shading onto the ink!
  function drawHeatPressedGraphic(ctx, artSource, x, y, boxW, boxH, isSampleFallback) {
    if (!artSource || boxW < 2 || boxH < 2) return;
    const iw = artSource.naturalWidth || artSource.width || 1;
    const ih = artSource.naturalHeight || artSource.height || 1;
    const sc = Math.min(boxW / iw, boxH / ih);
    const dw = Math.max(2, Math.round(iw * sc));
    const dh = Math.max(2, Math.round(ih * sc));
    const dx = Math.round(x + (boxW - dw) / 2);
    const dy = Math.round(y + (boxH - dh) / 2);

    const artC = document.createElement('canvas');
    artC.width = dw;
    artC.height = dh;
    const actx = artC.getContext('2d');
    actx.drawImage(artSource, 0, 0, dw, dh);

    // Blend subtle underlying Dri-Fit 3D chest/back drape luminance into the transfer so it sits naturally on the fabric
    try {
      const shirtPatch = ctx.getImageData(dx, dy, dw, dh);
      const sp = shirtPatch.data;
      const shadeC = document.createElement('canvas');
      shadeC.width = dw;
      shadeC.height = dh;
      const sctx = shadeC.getContext('2d');
      const shadeData = sctx.createImageData(dw, dh);
      const sd = shadeData.data;

      let sumLum = 0, cnt = 0;
      for (let i = 0; i < sp.length; i += 16) {
        sumLum += 0.299 * sp[i] + 0.587 * sp[i + 1] + 0.114 * sp[i + 2];
        cnt++;
      }
      const meanLum = cnt > 0 ? sumLum / cnt : 40;

      for (let i = 0; i < sp.length; i += 4) {
        const lum = 0.299 * sp[i] + 0.587 * sp[i + 1] + 0.114 * sp[i + 2];
        const delta = lum - meanLum;
        if (delta < 0) {
          sd[i] = 0; sd[i + 1] = 0; sd[i + 2] = 0;
          sd[i + 3] = Math.min(56, Math.round(-delta * 1.12));
        } else {
          sd[i] = 255; sd[i + 1] = 250; sd[i + 2] = 242;
          sd[i + 3] = Math.min(28, Math.round(delta * 0.62));
        }
      }
      sctx.putImageData(shadeData, 0, 0);

      actx.globalCompositeOperation = 'source-atop';
      actx.drawImage(shadeC, 0, 0);
      actx.globalCompositeOperation = 'source-over';
    } catch (_) {}

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 2.2;
    ctx.shadowOffsetY = 1;
    if (isSampleFallback) ctx.globalAlpha = 0.95;
    ctx.drawImage(artC, dx, dy, dw, dh);
    ctx.restore();
  }

  function renderProjectedFinishedItemDataUrl(calc) {
    const W = 960;
    const H = 456;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');

    // Dynamic Glossy Smoked-Crystal Studio Stage
    drawLiquidGlassPanel(ctx, 2, 2, W - 4, H - 4, 22, {
      topFill: '#2c2939',
      midFill: '#15141e',
      botFill: '#0a090f',
      warmCore: 'rgba(255, 134, 32, 0.28)',
      borderWidth: 1.6
    });

    const frontCx = 248;
    const backCx = 712;

    // Twin Dynamic Volumetric Molten-Amber Studio Rim Spotlights Behind Each Shirt
    [frontCx, backCx].forEach((cx) => {
      const spot = ctx.createRadialGradient(cx, 196, 14, cx, 196, 218);
      spot.addColorStop(0, 'rgba(255, 156, 56, 0.28)');
      spot.addColorStop(0.48, 'rgba(255, 112, 20, 0.10)');
      spot.addColorStop(1, 'rgba(255, 112, 20, 0)');
      ctx.fillStyle = spot;
      ctx.fillRect(8, 8, W - 16, H - 16);
    });

    // Glossy Smoked-Obsidian Studio Floor Reflection Horizon
    const floorY = H - 76;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, H - 4);
    floorGrad.addColorStop(0, 'rgba(255, 152, 58, 0.12)');
    floorGrad.addColorStop(0.18, 'rgba(255, 255, 255, 0.045)');
    floorGrad.addColorStop(1, 'rgba(5, 4, 9, 0.86)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(6, floorY, W - 12, H - floorY - 6);

    const horizonGlow = ctx.createLinearGradient(36, floorY, W - 36, floorY);
    horizonGlow.addColorStop(0, 'rgba(255, 136, 36, 0)');
    horizonGlow.addColorStop(0.26, 'rgba(255, 158, 66, 0.46)');
    horizonGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.26)');
    horizonGlow.addColorStop(0.74, 'rgba(255, 158, 66, 0.46)');
    horizonGlow.addColorStop(1, 'rgba(255, 136, 36, 0)');
    ctx.strokeStyle = horizonGlow;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(32, floorY);
    ctx.lineTo(W - 32, floorY);
    ctx.stroke();

    const firstPhysicalRow = calc.itemizedLines.find((r) => !r.isPrintOnly);
    const activePlacements = calc.activePlacements || [];
    const anyCustomerArtUploaded = activePlacements.some((p) => Boolean(p.renderCanvas));
    const fallbackLogo = blankMockupAssets.officialLogoTrimmed || blankMockupAssets.officialLogo;

    if (!firstPhysicalRow && calc.totalPrintOnlyItems > 0) {
      ctx.fillStyle = '#ffd099';
      ctx.font = '800 14.5px Outfit, Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CUSTOM 300-DPI DTF TRANSFERS ONLY ($0.00 BLANK GARMENT)', W / 2, 32);

      const count = Math.max(1, activePlacements.length);
      const cardW = Math.min(370, Math.floor((W - 88 - (count - 1) * 24) / count));
      const cardH = 348;
      const startX = Math.round((W - (count * cardW + (count - 1) * 24)) / 2);

      activePlacements.forEach((p, idx) => {
        const x = startX + idx * (cardW + 24);
        const y = 50;
        drawLiquidGlassPanel(ctx, x, y, cardW, cardH, 16, { orangeBorder: true, moltenGlow: false });
        const src = p.renderCanvas || fallbackLogo;
        if (src) {
          drawContainSource(ctx, src, x + 28, y + 24, cardW - 56, cardH - 74);
        }
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 13px Outfit, Segoe UI, sans-serif';
        ctx.fillText(`${p.locationLabel} (${p.adultWidthIn}" × ${p.adultHeightIn}" Actual Size)`, x + cardW / 2, y + cardH - 18);
      });

      try { calc.projectedPreviewJpeg = c.toDataURL('image/jpeg', 0.90); } catch (_) {}
      return c.toDataURL('image/png');
    }

    const primaryLine = firstPhysicalRow || {
      parentStyleCode: state.garmentLines[0]?.styleCode || 'TT11',
      brand: (SS_CATALOG[state.garmentLines[0]?.styleCode] || SS_CATALOG.TT11).brand,
      styleCode: state.garmentLines[0]?.styleCode || 'TT11',
      colorName: state.garmentLines[0]?.colorName || 'Black',
      colorHex: getColorHex(state.garmentLines[0]?.styleCode || 'TT11', state.garmentLines[0]?.colorName || 'Black')
    };
    const cat = SS_CATALOG[primaryLine.parentStyleCode] || SS_CATALOG.TT11;
    const hex = primaryLine.colorHex || '#151619';
    const isLong = Boolean(cat.isLongSleeve);
    const isYouthOnlyOrder = calc.totalAdultShirts === 0 && calc.totalYouthShirts > 0;

    // Exact 840x840 Studio Blank Geometry Calibration:
    // Shirt HPS top y0 = 29px, bottom hem y1 = 809px (780px height = 28.5" Adult / 22.0" Youth)
    // Visible 3D chest width across front/back = 381px (TT11) / 370px (CE10L) = ~14.8" Adult / ~11.6" Youth
    // Exact physical garment scale: 25.8 px/inch in 840px space for Adult, 32.6 px/inch in 840px space for Youth!
    const shirtBox = 374;
    const shirtTop = 14;
    const imgScale = shirtBox / 840.0;
    const hpsTopY = shirtTop + 29 * imgScale;
    const pxPerIn = (isYouthOnlyOrder ? 32.6 : 25.8) * imgScale;
    const maxTorsoPrintW = (isLong ? 344 : 356) * imgScale;
    const maxTorsoPrintH = 560 * imgScale;

    const whiteFrontImg = isLong ? blankMockupAssets.ce10lWhiteFront : blankMockupAssets.tt11WhiteFront;
    const blackFrontImg = isLong ? blankMockupAssets.ce10lBlackFront : blankMockupAssets.tt11BlackFront;
    const whiteBackImg = isLong ? blankMockupAssets.ce10lWhiteBack : blankMockupAssets.tt11WhiteBack;
    const blackBackImg = isLong ? blankMockupAssets.ce10lBlackBack : blankMockupAssets.tt11BlackBack;

    if (whiteFrontImg && whiteBackImg) {
      drawTintedPhotoCutout(ctx, whiteFrontImg, blackFrontImg, hex, frontCx - shirtBox / 2, shirtTop, shirtBox, shirtBox);
      drawTintedPhotoCutout(ctx, whiteBackImg, blackBackImg, hex, backCx - shirtBox / 2, shirtTop, shirtBox, shirtBox);
    } else {
      drawProceduralShirtSilhouette(ctx, frontCx, shirtTop + 12, 1.24, 1.24, hex, isLong, false);
      drawProceduralShirtSilhouette(ctx, backCx, shirtTop + 12, 1.24, 1.24, hex, isLong, true);
    }

    const frontPlacements = [];
    const backPlacements = [];
    activePlacements.forEach((p, idx) => {
      const lbl = (p.locationLabel || '').toLowerCase();
      if (lbl.includes('back') || lbl.includes('yoke') || lbl.includes('shoulder')) {
        backPlacements.push(p);
      } else if (lbl.includes('front') || lbl.includes('pocket') || lbl.includes('breast') || lbl.includes('chest') || lbl.includes('across')) {
        frontPlacements.push(p);
      } else if (idx === 0) {
        frontPlacements.push(p);
      } else {
        backPlacements.push(p);
      }
    });

    const frontScaleTags = [];
    frontPlacements.forEach((fp) => {
      const wIn = Math.max(0.5, Number(isYouthOnlyOrder ? fp.youthWidthIn : fp.adultWidthIn) || 4.0);
      const hIn = Math.max(0.5, Number(isYouthOnlyOrder ? fp.youthHeightIn : fp.adultHeightIn) || 4.0);
      frontScaleTags.push(`${wIn}"×${hIn}"`);

      const lbl = (fp.locationLabel || '').toLowerCase();
      const isAcrossChest = lbl.includes('across') || lbl.includes('center chest') || lbl.includes('chest banner');
      const isWearerRight = lbl.includes('wearer right') || lbl.includes('viewer left');
      const isPocketOrCrest = !isAcrossChest && (
        lbl.includes('pocket') ||
        lbl.includes('breast') ||
        lbl.includes('left chest') ||
        lbl.includes('right chest') ||
        (wIn <= 5.5 && hIn <= 5.5 && !lbl.includes('center') && !lbl.includes('full'))
      );

      // True 1:1 physical proportion in pixels (clamped ONLY to physical torso seam boundaries)
      const boxW = Math.min(maxTorsoPrintW, wIn * pxPerIn);
      const boxH = Math.min(maxTorsoPrintH, hIn * pxPerIn);

      // Standard pocket center is 2.95" off sternal centerline; Across the Chest is dead-center at 4.80" below HPS
      const pocketOffsetIn = isYouthOnlyOrder ? 2.35 : 2.95;
      const topDownIn = isPocketOrCrest
        ? (isYouthOnlyOrder ? 4.75 : 5.95)
        : (isAcrossChest ? (isYouthOnlyOrder ? 3.85 : 4.80) : (isYouthOnlyOrder ? 4.4 : 5.4));
      const centerX = isPocketOrCrest
        ? (frontCx + (isWearerRight ? -1 : 1) * pocketOffsetIn * pxPerIn)
        : frontCx;
      const drawX = centerX - boxW / 2;
      const drawY = hpsTopY + topDownIn * pxPerIn;

      const src = fp.renderCanvas || fallbackLogo;
      if (src) {
        drawHeatPressedGraphic(ctx, src, drawX, drawY, boxW, boxH, !fp.renderCanvas);
      }
    });

    // Sort back placements so "Top of the Back" renders first (upper back yoke), and Full Back stacks cleanly below if both are active
    const isTopOfBackPlacement = (bp) => {
      const lbl = (bp.locationLabel || '').toLowerCase();
      return lbl.includes('top') || lbl.includes('upper') || lbl.includes('yoke') || lbl.includes('neck') || lbl.includes('shoulder');
    };
    const sortedBackPlacements = backPlacements.slice().sort((a, b) => (isTopOfBackPlacement(b) ? 1 : 0) - (isTopOfBackPlacement(a) ? 1 : 0));

    const backScaleTags = [];
    let topBackBottomY = 0;
    sortedBackPlacements.forEach((bp) => {
      const isTopBack = isTopOfBackPlacement(bp);
      const wIn = Math.max(0.5, Number(isYouthOnlyOrder ? bp.youthWidthIn : bp.adultWidthIn) || (isTopBack ? 10.5 : 10.5));
      const hIn = Math.max(0.5, Number(isYouthOnlyOrder ? bp.youthHeightIn : bp.adultHeightIn) || (isTopBack ? 4.0 : 11.5));
      backScaleTags.push(`${wIn}"×${hIn}"`);

      const boxW = Math.min(maxTorsoPrintW, wIn * pxPerIn);
      const boxH = Math.min(maxTorsoPrintH, hIn * pxPerIn);
      // Top of the Back sits high across upper back shoulders (2.45" Adult / 1.95" Youth below HPS); Full Back sits at 5.20" Adult / 4.15" Youth
      const defaultTopDownIn = isTopBack
        ? (isYouthOnlyOrder ? 1.95 : 2.45)
        : (isYouthOnlyOrder ? 4.15 : 5.20);
      const drawX = backCx - boxW / 2;
      let drawY = hpsTopY + defaultTopDownIn * pxPerIn;
      if (!isTopBack && topBackBottomY > 0) {
        drawY = Math.max(drawY, topBackBottomY + 0.55 * pxPerIn);
      }
      if (isTopBack) {
        topBackBottomY = Math.max(topBackBottomY, drawY + boxH);
      }

      const src = bp.renderCanvas || fallbackLogo;
      if (src) {
        drawHeatPressedGraphic(ctx, src, drawX, drawY, boxW, boxH, !bp.renderCanvas);
      }
    });

    // Glossy Studio View Labels + True Physical Scale Callouts
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 15px Outfit, Segoe UI, sans-serif';
    const fTag = frontScaleTags.length ? ` (${frontScaleTags.join(' + ')})` : '';
    const bTag = backScaleTags.length ? ` (${backScaleTags.join(' + ')})` : '';
    ctx.fillText(`Front${fTag}`, frontCx, H - 36);
    ctx.fillText(`Back${bTag}`, backCx, H - 36);

    const sleeveType = isLong ? 'Long-Sleeve Dri-Fit' : 'Short-Sleeve Dri-Fit';
    const scaleLabel = isYouthOnlyOrder ? 'True Youth Garment Scale' : 'True Adult Garment Scale';
    const artNote = anyCustomerArtUploaded ? 'Project Artwork Applied' : 'Sample Crest Shown at Exact Size';
    ctx.fillStyle = '#ffd099';
    ctx.font = '600 12px Outfit, Segoe UI, sans-serif';
    ctx.fillText(`${cat.brand} ${cat.styleCode} (#${cat.itemNumber}) ${sleeveType} • ${primaryLine.colorName} • ${scaleLabel} (${artNote})`, W / 2, H - 14);

    try {
      calc.projectedPreviewJpeg = c.toDataURL('image/jpeg', 0.90);
    } catch (_) {
      calc.projectedPreviewJpeg = '';
    }
    return c.toDataURL('image/png');
  }

  // =========================================================================
  // FULL DYNAMIC GLOSSY LIQUID-GLASS QUOTE .JPG GENERATOR (1520px HI-DPI)
  // =========================================================================
  function wrapCanvasTextLines(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    if (words.length === 0) return [''];
    const lines = [];
    let cur = words[0];
    for (let i = 1; i < words.length; i++) {
      const test = cur + ' ' + words[i];
      if (ctx.measureText(test).width <= maxWidth) {
        cur = test;
      } else {
        lines.push(cur);
        cur = words[i];
      }
    }
    lines.push(cur);
    return lines;
  }

  async function renderFullGlossyQuoteJpgBlob() {
    const calc = state.lastCalculation;
    if (!calc || calc.totalShirts === 0) return null;

    const W = 1520;
    const padX = 52;
    const sheetW = W - padX * 2;
    const innerPad = 32;
    const contentW = sheetW - innerPad * 2;

    const measureC = document.createElement('canvas');
    const mctx = measureC.getContext('2d');
    mctx.font = '400 17px Outfit, Segoe UI, sans-serif';

    const descItems = calc.itemDescriptions || [];
    const descHeights = descItems.map((d) => {
      const lines = wrapCanvasTextLines(mctx, d.description || '', contentW - 56);
      return 44 + lines.length * 22 + 12;
    });
    const descSectionH = descItems.length > 0
      ? 54 + descHeights.reduce((a, b) => a + b, 0) + (descItems.length - 1) * 10 + 18
      : 0;

    const rows = calc.itemizedLines || [];
    const tableRowH = 66;
    const tableCardH = 108 + Math.max(1, rows.length) * tableRowH + 18;

    const headerH = 134;
    const capH = 54;
    const clientH = 56;
    const midH = 432;
    const bottomH = 298;

    const sheetH =
      innerPad +
      headerH + 18 +
      capH + 14 +
      clientH + 22 +
      midH +
      (descSectionH > 0 ? 20 + descSectionH : 0) +
      20 + tableCardH +
      20 + bottomH +
      innerPad;

    const H = sheetH + 96;
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext('2d');

    // 1. Deep Obsidian Outer Atmosphere + Dynamic Molten Caustic Blooms & Bokeh Embers
    ctx.fillStyle = '#040307';
    ctx.fillRect(0, 0, W, H);

    const blooms = [
      { cx: W * 0.5, cy: 110, r: 720, col: 'rgba(255, 122, 22, 0.32)' },
      { cx: W * 0.12, cy: H * 0.42, r: 560, col: 'rgba(255, 94, 0, 0.22)' },
      { cx: W * 0.88, cy: H * 0.76, r: 590, col: 'rgba(255, 142, 38, 0.26)' },
      { cx: W * 0.5, cy: H - 90, r: 620, col: 'rgba(255, 108, 14, 0.22)' }
    ];
    blooms.forEach((b) => {
      const g = ctx.createRadialGradient(b.cx, b.cy, 18, b.cx, b.cy, b.r);
      g.addColorStop(0, b.col);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    // Subtle glowing molten bokeh orbs around perimeter for dynamic energy
    [
      [78, 128, 22, 0.18], [1442, 168, 28, 0.16], [64, H * 0.54, 18, 0.20],
      [1456, H * 0.62, 24, 0.17], [190, H - 42, 16, 0.22], [1320, H - 36, 20, 0.19]
    ].forEach(([bx, by, br, ba]) => {
      const eg = ctx.createRadialGradient(bx, by, 1, bx, by, br);
      eg.addColorStop(0, `rgba(255, 196, 120, ${ba})`);
      eg.addColorStop(0.5, `rgba(255, 112, 16, ${ba * 0.55})`);
      eg.addColorStop(1, 'rgba(255, 112, 16, 0)');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Main Molten Obsidian Carbon-Weave Executive Sheet
    const sheetX = padX;
    const sheetY = 48;
    ctx.save();
    ctx.shadowColor = 'rgba(255, 110, 12, 0.58)';
    ctx.shadowBlur = 52;
    drawRoundedRectPath(ctx, sheetX, sheetY, sheetW, sheetH, 34);
    const sheetBg = ctx.createLinearGradient(sheetX, sheetY, sheetX, sheetY + sheetH);
    sheetBg.addColorStop(0, '#191724');
    sheetBg.addColorStop(0.5, '#0d0c14');
    sheetBg.addColorStop(1, '#08070c');
    ctx.fillStyle = sheetBg;
    ctx.fill();
    ctx.restore();

    // Carbon Micro-Dot Texture + Subsurface Caustic Flares Inside Main Sheet (visible behind smoked glass panels!)
    ctx.save();
    drawRoundedRectPath(ctx, sheetX, sheetY, sheetW, sheetH, 34);
    ctx.clip();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    for (let py = sheetY; py < sheetY + sheetH; py += 10) {
      for (let px = sheetX + ((py / 10) % 2) * 5; px < sheetX + sheetW; px += 10) {
        ctx.fillRect(px, py, 2, 2);
      }
    }

    // Internal molten caustic light pools behind the smoked glass panels so they refract dynamically
    [
      { cx: sheetX + sheetW * 0.25, cy: sheetY + 260, r: 380, a: 0.14 },
      { cx: sheetX + sheetW * 0.78, cy: sheetY + 520, r: 420, a: 0.16 },
      { cx: sheetX + sheetW * 0.65, cy: sheetY + sheetH - 180, r: 400, a: 0.16 }
    ].forEach((pl) => {
      const pg = ctx.createRadialGradient(pl.cx, pl.cy, 10, pl.cx, pl.cy, pl.r);
      pg.addColorStop(0, `rgba(255, 124, 24, ${pl.a})`);
      pg.addColorStop(1, 'rgba(255, 124, 24, 0)');
      ctx.fillStyle = pg;
      ctx.fillRect(sheetX, sheetY, sheetW, sheetH);
    });

    // Full-sheet poured-crystal diagonal reflection
    ctx.beginPath();
    ctx.moveTo(sheetX, sheetY);
    ctx.lineTo(sheetX + sheetW, sheetY);
    ctx.lineTo(sheetX + sheetW, sheetY + 350);
    ctx.bezierCurveTo(sheetX + sheetW * 0.62, sheetY + 230, sheetX + sheetW * 0.32, sheetY + 540, sheetX, sheetY + 420);
    ctx.closePath();
    const bigSweep = ctx.createLinearGradient(sheetX, sheetY, sheetX, sheetY + 540);
    bigSweep.addColorStop(0, 'rgba(255, 255, 255, 0.11)');
    bigSweep.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
    bigSweep.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = bigSweep;
    ctx.fill();
    ctx.restore();

    // Glowing Molten Outer Frame Rim + Top Crystal Meniscus Highlight
    ctx.save();
    drawRoundedRectPath(ctx, sheetX, sheetY, sheetW, sheetH, 34);
    const frameRim = ctx.createLinearGradient(sheetX, sheetY, sheetX + sheetW, sheetY + sheetH);
    frameRim.addColorStop(0, '#ffd89e');
    frameRim.addColorStop(0.28, '#ff8e24');
    frameRim.addColorStop(0.70, '#ff5a00');
    frameRim.addColorStop(1, '#ffba6a');
    ctx.strokeStyle = frameRim;
    ctx.lineWidth = 2.8;
    ctx.stroke();
    ctx.restore();

    let curY = sheetY + innerPad;
    const leftX = sheetX + innerPad;
    const quoteId = state.activeQuoteId || getOrInitActiveQuoteId();
    const issueDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const c = state.customer;
    const clientHeadline = [c.fullName, c.companyOrTeam].filter(Boolean).join(' — ') || 'Valued Client';
    const projectHeadline = c.projectName || 'Custom Performance Apparel & DTF Order';

    // 3. TIER 1: Glossy Liquid-Glass Header Card
    drawLiquidGlassPanel(ctx, leftX, curY, contentW, headerH, 24, {
      topFill: 'rgba(82, 76, 98, 0.90)',
      midFill: 'rgba(24, 22, 33, 0.95)',
      botFill: 'rgba(30, 19, 19, 0.97)',
      warmCore: 'rgba(255, 142, 38, 0.28)',
      borderWidth: 1.7
    });

    // Official Logo inside Glowing Molten Crystal Ring
    const logoRingCx = leftX + 74;
    const logoRingCy = curY + headerH / 2;
    ctx.save();
    ctx.shadowColor = 'rgba(255, 128, 24, 0.72)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(logoRingCx, logoRingCy, 47, 0, Math.PI * 2);
    ctx.fillStyle = '#0d0b12';
    ctx.fill();
    ctx.strokeStyle = '#ffa040';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    if (blankMockupAssets.officialLogo) {
      drawContainSource(ctx, blankMockupAssets.officialLogo, logoRingCx - 39, logoRingCy - 39, 78, 78);
    }

    // Metallic Molten Gold-Orange RETROCANOPY Wordmark
    ctx.save();
    ctx.font = '900 44px Orbitron, Segoe UI, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const wmGrad = ctx.createLinearGradient(0, curY + 38, 0, curY + 96);
    wmGrad.addColorStop(0, '#ffe6a3');
    wmGrad.addColorStop(0.50, '#ff9428');
    wmGrad.addColorStop(1, '#ff5500');
    ctx.shadowColor = 'rgba(255, 112, 12, 0.52)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = wmGrad;
    ctx.fillText('RETROCANOPY', leftX + 142, logoRingCy + 2);
    ctx.restore();

    const isPaidNow = Boolean(state.activeQuotePaidInfo && state.activeQuotePaidInfo.isPaid);
    ctx.textAlign = 'right';
    ctx.fillStyle = isPaidNow ? '#6bffc3' : '#ffffff';
    ctx.font = '800 32px Orbitron, Segoe UI, sans-serif';
    ctx.fillText(isPaidNow ? 'PAID PROJECT RECEIPT' : 'OFFICIAL QUOTE', leftX + contentW - 28, curY + 53);

    ctx.fillStyle = '#ffd29e';
    ctx.font = '700 19px Outfit, Segoe UI, sans-serif';
    ctx.fillText(`TICKET #${quoteId}  •  Issued ${issueDate}`, leftX + contentW - 28, curY + 92);

    curY += headerH + 18;

    // 4. TIER 2: Poured-Resin Capabilities Stadium Capsule
    drawLiquidGlassPanel(ctx, leftX, curY, contentW, capH, 27, {
      topFill: 'rgba(78, 42, 18, 0.90)',
      midFill: 'rgba(24, 18, 22, 0.95)',
      botFill: 'rgba(46, 23, 10, 0.96)',
      orangeBorder: true,
      moltenGlow: true,
      borderWidth: 2.1
    });
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 20px Outfit, Segoe UI, sans-serif';
    ctx.fillText(STUDIO_CAPABILITIES.join('   •   '), leftX + contentW / 2, curY + 34);

    curY += capH + 14;

    // 5. TIER 3: Client & Project Capsule Bar
    drawLiquidGlassPanel(ctx, leftX, curY, contentW, clientH, 18, {
      topFill: 'rgba(52, 38, 30, 0.88)',
      midFill: 'rgba(18, 17, 24, 0.95)',
      botFill: 'rgba(26, 18, 15, 0.97)',
      orangeBorder: true,
      borderWidth: 1.7
    });
    ctx.fillStyle = '#fff5ea';
    ctx.font = '600 19px Outfit, Segoe UI, sans-serif';
    const clientBarStr = `PREPARED FOR: ${clientHeadline}   |   PROJECT: ${projectHeadline}`;
    ctx.fillText(clientBarStr.slice(0, 118), leftX + contentW / 2, curY + 35);

    curY += clientH + 22;

    // 6. TIER 4: 50/50 Projected Finished Item + 2x2 Glossy KPI Breakdown
    const halfGap = 20;
    const leftCardW = Math.floor((contentW - halfGap) * 0.52);
    const rightCardW = contentW - halfGap - leftCardW;

    drawLiquidGlassPanel(ctx, leftX, curY, leftCardW, midH, 24, {
      topFill: 'rgba(58, 54, 72, 0.88)',
      midFill: 'rgba(19, 18, 26, 0.94)',
      botFill: 'rgba(12, 11, 17, 0.98)'
    });
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 19px Outfit, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PROJECTED FINISHED ITEM (TRUE SCALE)', leftX + leftCardW / 2, curY + 34);

    const mockupDataUrl = calc.projectedMockupUrl || renderProjectedFinishedItemDataUrl(calc);
    await new Promise((resolve) => {
      const mImg = new Image();
      mImg.onload = () => {
        drawContainSource(ctx, mImg, leftX + 18, curY + 48, leftCardW - 36, midH - 64);
        resolve();
      };
      mImg.onerror = () => resolve();
      mImg.src = mockupDataUrl;
    });

    const rightX = leftX + leftCardW + halfGap;
    drawLiquidGlassPanel(ctx, rightX, curY, rightCardW, midH, 24, {
      topFill: 'rgba(58, 54, 72, 0.88)',
      midFill: 'rgba(19, 18, 26, 0.94)',
      botFill: 'rgba(12, 11, 17, 0.98)'
    });
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 19px Outfit, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OVERALL BREAKDOWN PER ITEM', rightX + rightCardW / 2, curY + 34);

    const kpis = [
      { val: String(calc.totalShirts), lbl: 'Total Items' },
      { val: money(calc.avgItemPreDiscount), lbl: 'Base/Item' },
      { val: `${calc.discountPct}%`, lbl: calc.discountPct > 0 ? (calc.discountLabel || 'Discount') : 'Discount' },
      { val: money(calc.avgItemAllInFinal), lbl: 'Final/Item' }
    ];
    const tileGap = 16;
    const tileW = Math.floor((rightCardW - 44 - tileGap) / 2);
    const tileH = 122;
    kpis.forEach((k, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const tx = rightX + 22 + col * (tileW + tileGap);
      const ty = curY + 54 + row * (tileH + tileGap);
      drawLiquidGlassPanel(ctx, tx, ty, tileW, tileH, 18, {
        topFill: 'rgba(84, 46, 22, 0.92)',
        midFill: 'rgba(34, 21, 14, 0.95)',
        botFill: 'rgba(20, 13, 11, 0.98)',
        orangeBorder: true,
        moltenGlow: true,
        borderWidth: 2.0
      });
      ctx.fillStyle = '#ffaa4c';
      ctx.font = '800 40px Outfit, Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(k.val, tx + tileW / 2, ty + 62);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '500 17px Outfit, Segoe UI, sans-serif';
      ctx.fillText(String(k.lbl).slice(0, 22), tx + tileW / 2, ty + 96);
    });

    const grpYStart = curY + 54 + tileH * 2 + tileGap + 18;
    (calc.itemOverallGroups || []).slice(0, 2).forEach((g, gIdx) => {
      const gy = grpYStart + gIdx * 34;
      if (gy + 26 < curY + midH - 8) {
        const avgUsed = calc.discountPct > 0 ? g.avgPerItemAfterDiscount : g.avgPerItemPreDiscount;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '600 15.5px Outfit, Segoe UI, sans-serif';
        ctx.fillText(`${g.brand} ${g.styleBadge} (${g.colorName})`, rightX + 26, gy + 18);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffb36b';
        ctx.font = '700 15.5px Outfit, Segoe UI, sans-serif';
        ctx.fillText(`${g.totalQty} pcs • ${money(avgUsed)}/ea`, rightX + rightCardW - 26, gy + 18);
      }
    });

    curY += midH;

    // 7. TIER 4.5: Item Description & Garment Specifications Glass Panel
    if (descSectionH > 0) {
      curY += 20;
      drawLiquidGlassPanel(ctx, leftX, curY, contentW, descSectionH, 22, {
        topFill: 'rgba(56, 52, 68, 0.88)',
        midFill: 'rgba(19, 18, 26, 0.95)',
        botFill: 'rgba(12, 11, 17, 0.98)'
      });
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 18px Outfit, Segoe UI, sans-serif';
      ctx.fillText('ITEM DESCRIPTION & GARMENT SPECIFICATIONS', leftX + contentW / 2, curY + 34);

      let dy = curY + 50;
      descItems.forEach((d, idx) => {
        const boxH = descHeights[idx];
        drawRoundedRectPath(ctx, leftX + 20, dy, contentW - 40, boxH, 13);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 152, 56, 0.40)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffd099';
        ctx.font = '800 17.5px Outfit, Segoe UI, sans-serif';
        ctx.fillText(`${d.brand} ${d.styleCode} (Item #${d.itemNumber}) — ${d.colorName}`, leftX + 36, dy + 27);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#9ef3ff';
        ctx.font = '700 15.5px Outfit, Segoe UI, sans-serif';
        ctx.fillText(`Prints: ${String(d.printSpecs || 'Blank').slice(0, 48)}`, leftX + contentW - 36, dy + 27);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '400 16.5px Outfit, Segoe UI, sans-serif';
        const wrapped = wrapCanvasTextLines(ctx, d.description || '', contentW - 72);
        wrapped.forEach((ln, lIdx) => {
          ctx.fillText(ln, leftX + 36, dy + 52 + lIdx * 22);
        });
        dy += boxH + 10;
      });

      curY += descSectionH;
    }

    // 8. TIER 5: Line-by-Line Itemized Table Glass Card
    curY += 20;
    drawLiquidGlassPanel(ctx, leftX, curY, contentW, tableCardH, 24, {
      topFill: 'rgba(56, 52, 68, 0.88)',
      midFill: 'rgba(18, 17, 25, 0.95)',
      botFill: 'rgba(12, 11, 17, 0.98)'
    });
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 19px Outfit, Segoe UI, sans-serif';
    ctx.fillText('ITEMIZED QUOTE BREAKDOWN (LINE BY LINE)', leftX + contentW / 2, curY + 36);

    const colX = {
      line: leftX + 46,
      garment: leftX + 98,
      specs: leftX + 545,
      size: leftX + 925,
      qty: leftX + 1060,
      unit: leftX + 1215,
      total: leftX + contentW - 28
    };

    const thY = curY + 76;
    ctx.font = '700 16.5px Outfit, Segoe UI, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Line', colX.line, thY);
    ctx.textAlign = 'left';
    ctx.fillText('Garment & Color', colX.garment, thY);
    ctx.fillText('Print Specs', colX.specs, thY);
    ctx.textAlign = 'center';
    ctx.fillText('Size', colX.size, thY);
    ctx.fillText('Qty', colX.qty, thY);
    ctx.textAlign = 'right';
    ctx.fillText('Unit Price', colX.unit, thY);
    ctx.fillText('Line Total', colX.total, thY);

    ctx.save();
    ctx.shadowColor = 'rgba(255, 128, 24, 0.88)';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#ff8e28';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(leftX + 16, curY + 92);
    ctx.lineTo(leftX + contentW - 16, curY + 92);
    ctx.stroke();
    ctx.restore();

    const getTierKey = (r) => r.isPrintOnly ? 'print' : (r.isYouth ? 'youth' : 'adult');
    rows.forEach((row, idx) => {
      const ry = curY + 96 + idx * tableRowH;
      const prev = idx > 0 ? rows[idx - 1] : null;
      const needsOrange = prev && (getTierKey(prev) !== getTierKey(row) || prev.lineId !== row.lineId);

      if (needsOrange) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 128, 24, 0.78)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#ff8e28';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(leftX + 16, ry);
        ctx.lineTo(leftX + contentW - 16, ry);
        ctx.stroke();
        ctx.restore();
      } else if (idx > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftX + 18, ry);
        ctx.lineTo(leftX + contentW - 18, ry);
        ctx.stroke();
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 17px Outfit, Segoe UI, sans-serif';
      ctx.fillText(String(row.lineNumber), colX.line, ry + 32);

      ctx.beginPath();
      ctx.arc(colX.garment + 8, ry + 22, 7, 0, Math.PI * 2);
      ctx.fillStyle = row.colorHex || '#151619';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.68)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const gLabel = row.isPrintOnly
        ? 'Custom DTF Transfer Only'
        : `${row.brand} ${row.styleCode} (#${row.itemNumber}) — ${row.colorName}`;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 17px Outfit, Segoe UI, sans-serif';
      ctx.fillText(gLabel.slice(0, 44), colX.garment + 24, ry + 27);

      ctx.fillStyle = 'rgba(255, 214, 176, 0.80)';
      ctx.font = '400 13.5px Outfit, Segoe UI, sans-serif';
      ctx.fillText(String(row.garmentTitle || '').slice(0, 56), colX.garment + 24, ry + 48);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '500 15.5px Outfit, Segoe UI, sans-serif';
      ctx.fillText(String(row.printSpecSummary || 'Blank Garment').slice(0, 40), colX.specs, ry + 34);

      const szDisp = row.isPrintOnly
        ? 'PRINT ONLY'
        : (row.isYouth ? row.sizeName.replace(/^Y/, 'Youth ') : (row.sizeName === 'S' ? 'Adult S' : row.sizeName));
      ctx.textAlign = 'center';
      ctx.fillStyle = row.isPrintOnly ? '#ff9d3b' : '#ffffff';
      ctx.font = '700 17px Outfit, Segoe UI, sans-serif';
      ctx.fillText(szDisp, colX.size, ry + 34);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(String(row.qty), colX.qty, ry + 34);

      ctx.textAlign = 'right';
      ctx.font = '600 17px Outfit, Segoe UI, sans-serif';
      ctx.fillText(money(row.unitPriceQuoted), colX.unit, ry + 34);

      ctx.font = '800 18px Outfit, Segoe UI, sans-serif';
      ctx.fillStyle = '#ffd8a8';
      ctx.fillText(money(row.lineTotalQuoted), colX.total, ry + 34);
    });

    curY += tableCardH + 20;

    // 9. TIER 6: Bottom Available S&S 3D Glossy Color Orbs + Live Stripe QR & Grand Total Capsule
    const botLeftW = Math.floor((contentW - halfGap) * 0.46);
    const botRightW = contentW - halfGap - botLeftW;

    drawLiquidGlassPanel(ctx, leftX, curY, botLeftW, bottomH, 24, {
      topFill: 'rgba(58, 54, 72, 0.88)',
      midFill: 'rgba(19, 18, 26, 0.94)',
      botFill: 'rgba(12, 11, 17, 0.98)'
    });
    const primaryStyleCode = state.garmentLines[0]?.styleCode || 'TT11';
    const ssColors = getColorsForStyle(primaryStyleCode);
    const activeColorSet = new Set(state.garmentLines.map((l) => l.colorName));

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 18px Outfit, Segoe UI, sans-serif';
    ctx.fillText('AVAILABLE S&S COLORS', leftX + botLeftW / 2, curY + 34);
    ctx.fillStyle = '#ffd099';
    ctx.font = '500 14px Outfit, Segoe UI, sans-serif';
    ctx.fillText(`${(SS_CATALOG[primaryStyleCode] || SS_CATALOG.TT11).brand} ${primaryStyleCode} • ${ssColors.length} Official Colors`, leftX + botLeftW / 2, curY + 56);

    const orbCols = 10;
    const orbR = 16;
    const orbSpacingX = 48;
    const orbSpacingY = 50;
    const gridStartX = leftX + (botLeftW - (orbCols - 1) * orbSpacingX) / 2;
    const gridStartY = curY + 94;

    ssColors.slice(0, 30).forEach((col, i) => {
      const ocx = gridStartX + (i % orbCols) * orbSpacingX;
      const ocy = gridStartY + Math.floor(i / orbCols) * orbSpacingY;
      const isSel = activeColorSet.has(col.name);

      ctx.save();
      if (isSel) {
        ctx.shadowColor = 'rgba(255, 142, 36, 0.95)';
        ctx.shadowBlur = 15;
      }
      ctx.beginPath();
      ctx.arc(ocx, ocy, orbR, 0, Math.PI * 2);
      const og = ctx.createRadialGradient(ocx - 5, ocy - 6, 2, ocx, ocy, orbR);
      og.addColorStop(0, '#ffffff');
      og.addColorStop(0.28, col.hex);
      og.addColorStop(0.82, col.hex);
      og.addColorStop(1, '#07060b');
      ctx.fillStyle = og;
      ctx.fill();
      ctx.lineWidth = isSel ? 2.8 : 1.2;
      ctx.strokeStyle = isSel ? '#ffa03c' : 'rgba(255,255,255,0.45)';
      ctx.stroke();
      ctx.restore();
    });

    const botRightX = leftX + botLeftW + halfGap;
    drawLiquidGlassPanel(ctx, botRightX, curY, botRightW, bottomH, 24, {
      topFill: 'rgba(58, 54, 72, 0.88)',
      midFill: 'rgba(19, 18, 26, 0.94)',
      botFill: 'rgba(12, 11, 17, 0.98)'
    });

    const qrBoxX = botRightX + 24;
    const qrBoxY = curY + 28;
    const qrBoxW = 204;
    const qrBoxH = bottomH - 56;
    drawLiquidGlassPanel(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 18, {
      topFill: 'rgba(56, 34, 20, 0.94)',
      midFill: 'rgba(18, 14, 18, 0.97)',
      botFill: 'rgba(12, 10, 14, 0.98)',
      orangeBorder: true,
      borderWidth: 1.9
    });

    const stripePayUrl = calc.stripePayUrl || getQuoteStripePortalUrl(calc);
    const qrUrl = calc.stripeQrDataUrl || renderStripeQrDataUrl(stripePayUrl, 300);
    await new Promise((resolve) => {
      const qImg = new Image();
      qImg.onload = () => {
        ctx.fillStyle = '#ffffff';
        drawRoundedRectPath(ctx, qrBoxX + 22, qrBoxY + 16, 160, 160, 10);
        ctx.fill();
        ctx.drawImage(qImg, qrBoxX + 26, qrBoxY + 20, 152, 152);
        resolve();
      };
      qImg.onerror = () => resolve();
      qImg.src = qrUrl;
    });
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffb36b';
    ctx.font = '800 13px Orbitron, Segoe UI, sans-serif';
    ctx.fillText('SCAN TO PAY', qrBoxX + qrBoxW / 2, qrBoxY + 198);
    ctx.fillStyle = '#22f59b';
    ctx.font = '700 13px Outfit, Segoe UI, sans-serif';
    ctx.fillText('Live Stripe Checkout', qrBoxX + qrBoxW / 2, qrBoxY + 219);

    const totX = qrBoxX + qrBoxW + 26;
    const totW = botRightW - (qrBoxW + 74);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '600 21px Outfit, Segoe UI, sans-serif';
    ctx.fillText('Subtotal:', totX + 12, curY + 62);
    ctx.textAlign = 'right';
    ctx.font = '800 22px Outfit, Segoe UI, sans-serif';
    ctx.fillText(money(calc.subtotalBeforeDiscount), totX + totW - 12, curY + 62);

    drawLiquidGlassPanel(ctx, totX, curY + 82, totW, 50, 25, {
      topFill: 'rgba(80, 42, 18, 0.90)',
      midFill: 'rgba(32, 18, 12, 0.96)',
      botFill: 'rgba(22, 13, 10, 0.98)',
      orangeBorder: true,
      borderWidth: 1.9
    });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 18.5px Outfit, Segoe UI, sans-serif';
    ctx.fillText(`${calc.discountPct}% OFF ${(calc.discountLabel || 'Discount').slice(0, 18)}:`, totX + 18, curY + 113);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffa440';
    ctx.font = '800 20px Outfit, Segoe UI, sans-serif';
    ctx.fillText(calc.discountAmountUsd > 0 ? `-${money(calc.discountAmountUsd)}` : '$0.00', totX + totW - 18, curY + 113);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '600 20px Outfit, Segoe UI, sans-serif';
    ctx.fillText(calc.includeTax ? `Tax Included (${calc.taxRatePct.toFixed(2)}%):` : 'Tax Excluded:', totX + 12, curY + 168);
    ctx.textAlign = 'right';
    ctx.font = '700 20px Outfit, Segoe UI, sans-serif';
    ctx.fillText(money(calc.taxAmountUsd), totX + totW - 12, curY + 168);

    drawLiquidGlassPanel(ctx, totX, curY + 190, totW, 68, 34, {
      topFill: 'rgba(124, 58, 16, 0.94)',
      midFill: 'rgba(48, 22, 8, 0.98)',
      botFill: 'rgba(84, 36, 10, 0.96)',
      orangeBorder: true,
      moltenGlow: true,
      borderWidth: 2.5
    });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 22px Orbitron, Segoe UI, sans-serif';
    ctx.fillText('GRAND TOTAL:', totX + 22, curY + 232);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffb454';
    ctx.font = '900 29px Orbitron, Segoe UI, sans-serif';
    ctx.fillText(money(calc.customerQuoteTotal), totX + totW - 22, curY + 233);

    return new Promise((resolve) => {
      cv.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
    });
  }

  async function downloadGlossyQuoteJpg() {
    const calc = state.lastCalculation;
    if (!calc || calc.totalShirts === 0) {
      alert('Enter item quantities in Step 1 before downloading the Glossy Liquid-Glass Quote .JPG.');
      return;
    }
    const btn = document.getElementById('bqDownloadQuoteJpgBtn');
    const prev = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '&#9203; Rendering Glossy .JPG...';
    }
    syncQuoteToStripeCloudNow(calc);
    const blob = await renderFullGlossyQuoteJpgBlob();
    const tid = state.activeQuoteId || getOrInitActiveQuoteId();
    const cleanProj = (state.customer.projectName || state.customer.companyOrTeam || 'Quote').replace(/[^a-zA-Z0-9_-]/g, '_');
    if (blob) {
      triggerBlobDownload(blob, `RetroCanopy_${tid}_${cleanProj}_LiquidGlass.jpg`);
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '&#10003; Downloaded .JPG!';
      setTimeout(() => { btn.innerHTML = prev; }, 2200);
    }
  }

  // =========================================================================
  // FULL CALCULATION: PRINT ONLY ($0), YOUTH + ADULT, DISCOUNT % OFF & TAX
  // =========================================================================
  function recalculateEverything() {
    let totalAdultShirts = 0;
    let totalYouthShirts = 0;
    let totalPrintOnlyItems = 0;
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

        const printOnly = isPrintOnlySize(sz);
        const youth = isYouthSize(sz);

        if (printOnly) totalPrintOnlyItems += q;
        else if (youth) totalYouthShirts += q;
        else totalAdultShirts += q;

        const unitBlankCost = printOnly ? 0.00 : getBlankUnitPrice(line.styleCode, line.colorName, sz);
        const subBlank = +(q * unitBlankCost).toFixed(2);

        lineQty += q;
        lineBlankSub += subBlank;

        const baseItemDesc = printOnly
          ? PRINT_ONLY_DESCRIPTION
          : (youth ? (cat.youthItemDescription || cat.specs) : (cat.itemDescription || cat.specs));

        rawItems.push({
          lineId: line.id,
          styleCode: printOnly ? 'DTF-PRINT' : (youth ? cat.youthStyleCode : cat.styleCode),
          parentStyleCode: line.styleCode,
          itemNumber: printOnly ? 'PRINT-ONLY' : (youth ? cat.youthItemNumber : cat.itemNumber),
          brand: printOnly ? 'RetroCanopy DTF' : cat.brand,
          garmentTitle: printOnly
            ? 'Custom DTF Transfer Print Only (No Garment Blank — $0.00 Blank)'
            : (youth ? cat.youthFullName : cat.fullName),
          itemDescription: baseItemDesc,
          specs: printOnly ? '300-DPI Commercial Hot-Peel DTF Gangsheet Transfer' : cat.specs,
          productUrl: youth ? cat.youthProductUrl : cat.productUrl,
          colorName: printOnly ? 'Transfer Print Only' : line.colorName,
          colorHex: printOnly ? '#ff7a18' : colorHex,
          sizeName: sz,
          isYouth: youth,
          isPrintOnly: printOnly,
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
    const totalPhysicalShirts = totalAdultShirts + totalYouthShirts;
    const totalAdultFormatPrints = totalAdultShirts + totalPrintOnlyItems;
    const totalShirts = totalPhysicalShirts + totalPrintOnlyItems;

    // 2. Pack EVERY Active Placement Logo Across Adult (+ Print Only) & Youth Quantities
    const activePlacements = state.dtfPlacements.filter((p) => p.enabled !== false);
    const extraSpoilage = Math.max(0, parseInt(state.extraSpoilagePrints, 10) || 0);
    const extraYouth = totalYouthShirts > 0 ? Math.min(extraSpoilage, Math.max(1, Math.round(extraSpoilage * (totalYouthShirts / Math.max(1, totalShirts))))) : 0;
    const extraAdult = totalAdultFormatPrints > 0 ? extraSpoilage : 0;

    const itemsToPack = [];
    const expectedPlacementCounts = [];

    activePlacements.forEach((p, pIdx) => {
      const renderSrc = p.autoTrimTransparent ? (p.trimmedCanvas || p.origCanvas) : (p.origCanvas || p.trimmedCanvas);
      let expectedForThisPlacement = 0;

      if (totalAdultFormatPrints > 0) {
        const cntA = totalAdultFormatPrints + extraAdult;
        expectedForThisPlacement += cntA;
        itemsToPack.push({
          id: p.id + '_adult',
          parentPlacementId: p.id,
          placementIdx: pIdx,
          sizeGroup: 'ADULT',
          shortLoc: p.locationLabel,
          locationLabel: `${p.locationLabel} (Adult)`,
          widthIn: Math.max(0.5, Number(p.adultWidthIn) || 4),
          heightIn: Math.max(0.5, Number(p.adultHeightIn) || 4),
          count: cntA,
          renderSource: renderSrc
        });
      }
      if (totalYouthShirts > 0) {
        const cntY = totalYouthShirts + extraYouth;
        expectedForThisPlacement += cntY;
        itemsToPack.push({
          id: p.id + '_youth',
          parentPlacementId: p.id,
          placementIdx: pIdx,
          sizeGroup: 'YOUTH',
          shortLoc: p.locationLabel,
          locationLabel: `${p.locationLabel} (Youth)`,
          widthIn: Math.max(0.5, Number(p.youthWidthIn) || 3),
          heightIn: Math.max(0.5, Number(p.youthHeightIn) || 3),
          count: cntY,
          renderSource: renderSrc
        });
      }

      expectedPlacementCounts.push({
        placementId: p.id,
        locationLabel: p.locationLabel,
        fileName: p.fileName,
        hasUploadedLogo: Boolean(renderSrc),
        expectedCount: expectedForThisPlacement
      });
    });

    const rollWidthNum = state.rollWidthMode === '22' ? 22 : 27;
    const packRes = packRectanglesOnRoll(rollWidthNum, Math.max(0, Number(state.gutterIn) || 0.25), itemsToPack);
    const sheetSolution = solveOptimalGangSheets(packRes.shelves, state.rollWidthMode, state.includeAutoBuilder15);

    // Count actual packed boxes per placement across all sheets to verify 100% presence
    const packedCountByPlacement = {};
    sheetSolution.sheetAssignments.forEach((sa) => {
      sa.boxes.forEach((b) => {
        packedCountByPlacement[b.placementId] = (packedCountByPlacement[b.placementId] || 0) + 1;
      });
    });
    expectedPlacementCounts.forEach((ep) => {
      ep.packedCount = packedCountByPlacement[ep.placementId] || 0;
    });

    // 3. Freight, Pressing (Physical Shirts Only) & Built-In Per-Item Base Upcharge
    let ssShippingUsd = 0;
    if (totalPhysicalShirts > 0) {
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
    // Pressing labor applies to physical shirts being heat-pressed ($0 if Print-Only transfer order)
    const totalPressLaborUsd = +(totalPhysicalShirts * pressPerShirt).toFixed(2);

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
    const sharedDtfAndDpwShipPerItem = totalShirts > 0
      ? (sheetSolution.totalDtfCost + dpwShippingUsd) / totalShirts
      : 0;
    const sharedSsShipAndPressPerPhysicalShirt = totalPhysicalShirts > 0
      ? ((ssShippingUsd / totalPhysicalShirts) + pressPerShirt)
      : 0;

    // 4. Build Itemized Line-by-Line Quote Rows
    let subtotalBeforeDiscount = 0;
    const itemizedLines = rawItems.map((item, idx) => {
      const printSpecSummary = activePlacements.length > 0
        ? activePlacements.map((p) => {
            const w = item.isYouth ? p.youthWidthIn : p.adultWidthIn;
            const h = item.isYouth ? p.youthHeightIn : p.adultHeightIn;
            return `${p.locationLabel} (${w}"×${h}")`;
          }).join(' + ')
        : 'Blank Garment Only';

      const perItemOverhead = item.isPrintOnly
        ? (sharedDtfAndDpwShipPerItem + builtInUpcharge)
        : (sharedDtfAndDpwShipPerItem + sharedSsShipAndPressPerPhysicalShirt + builtInUpcharge);

      const unitPriceQuoted = +(item.unitBlankCost + perItemOverhead).toFixed(2);
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

    const netProfitUsd = +(subtotalAfterDiscount - totalHardCostUsd).toFixed(2);

    // 6. Overall Per-Item Breakdown
    const avgItemPreDiscount = totalShirts > 0 ? +(subtotalBeforeDiscount / totalShirts).toFixed(2) : 0;
    const avgItemAfterDiscount = totalShirts > 0 ? +(subtotalAfterDiscount / totalShirts).toFixed(2) : 0;
    const avgItemAllInFinal = totalShirts > 0 ? +(customerQuoteTotal / totalShirts).toFixed(2) : 0;

    const groupMap = new Map();
    itemizedLines.forEach((row) => {
      const gKey = row.isPrintOnly ? `${row.lineId}_printonly` : row.lineId;
      if (!groupMap.has(gKey)) {
        const cat = SS_CATALOG[row.parentStyleCode] || SS_CATALOG.TT11;
        groupMap.set(gKey, {
          lineId: gKey,
          isPrintOnly: row.isPrintOnly,
          brand: row.isPrintOnly ? 'RetroCanopy DTF' : cat.brand,
          adultStyleCode: row.isPrintOnly ? 'PRINT ONLY ($0 Blank)' : cat.styleCode,
          youthStyleCode: row.isPrintOnly ? 'PRINT ONLY' : cat.youthStyleCode,
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
      const styleBadge = g.isPrintOnly
        ? 'PRINT ONLY'
        : (g.hasAdult && g.hasYouth
            ? `${g.adultStyleCode} / ${g.youthStyleCode}`
            : (g.hasYouth ? g.youthStyleCode : g.adultStyleCode));
      const groupAfterDisc = +(g.groupSubtotalPreDiscount * (1 - discountPct / 100)).toFixed(2);
      const avgPre = g.totalQty > 0 ? +(g.groupSubtotalPreDiscount / g.totalQty).toFixed(2) : 0;
      const avgAfter = g.totalQty > 0 ? +(groupAfterDisc / g.totalQty).toFixed(2) : 0;

      return {
        ...g,
        styleBadge,
        sizeBreakdownStr: g.sizePairs.join(', '),
        avgPerItemPreDiscount: avgPre,
        groupSubtotalAfterDiscount: groupAfterDisc,
        avgPerItemAfterDiscount: avgAfter
      };
    });

    state.lastCalculation = {
      totalShirts,
      totalPhysicalShirts,
      totalAdultShirts,
      totalYouthShirts,
      totalPrintOnlyItems,
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
      expectedPlacementCounts,
      itemizedLines,
      itemOverallGroups,
      itemDescriptions: (() => {
        const descMap = new Map();
        itemizedLines.forEach((r) => {
          const dKey = r.isPrintOnly ? 'PRINT_ONLY' : `${r.styleCode}_${r.colorName}`;
          if (!descMap.has(dKey)) {
            descMap.set(dKey, {
              styleCode: r.styleCode,
              itemNumber: r.itemNumber,
              brand: r.brand,
              title: r.garmentTitle,
              colorName: r.colorName,
              colorHex: r.colorHex,
              printSpecs: r.printSpecSummary,
              description: r.itemDescription
            });
          }
        });
        return Array.from(descMap.values());
      })()
    };

    renderSummaryAndCanvas();
  }

  // =========================================================================
  // RENDER BLACK & ORANGE LIQUID GLASS RECEIPT + ALL GANGSHEETS GALLERY
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

    const qtySummaryParts = [];
    if (calc.totalAdultShirts > 0) qtySummaryParts.push(`${calc.totalAdultShirts}A`);
    if (calc.totalYouthShirts > 0) qtySummaryParts.push(`${calc.totalYouthShirts}Y`);
    if (calc.totalPrintOnlyItems > 0) qtySummaryParts.push(`${calc.totalPrintOnlyItems}P`);
    setTxt('bqKpiTotalShirts', `${calc.totalShirts}${qtySummaryParts.length ? ` (${qtySummaryParts.join(' / ')})` : ''}`);
    setTxt('bqKpiBlanksCost', money(calc.blanksSubtotal));
    setTxt('bqKpiDtfCost', money(calc.sheetSolution.totalDtfCost));
    setTxt('bqKpiHardCostPerShirt', `${money(calc.avgHardCostPerShirt)} / ea`);
    setTxt('bqKpiQuoteTotal', money(calc.customerQuoteTotal));
    setTxt('bqKpiNetProfit', `${calc.netProfitUsd >= 0 ? '+' : ''}${money(calc.netProfitUsd)}`);

    const sheetCount = calc.sheetSolution.sheetAssignments.length;
    setTxt('bqDrawerSummaryBadge', `${sheetCount} Sheet${sheetCount === 1 ? '' : 's'} Needed • ${calc.packRes.boxes.length} Total Transfers`);

    const dlAllBtn = document.getElementById('bqExportGangsheetPngBtn');
    if (dlAllBtn && !dlAllBtn.dataset.downloading) {
      dlAllBtn.innerHTML = `&#11015;&#65039; Download ALL Needed Gangsheets (${sheetCount} Sheet${sheetCount === 1 ? '' : 's'} &bull; 300 DPI .PNG)`;
    }

    setTxt(
      'bqGangsheetStatsLine',
      calc.totalShirts > 0 && calc.activePlacements.length > 0
        ? `${calc.packRes.boxes.length} total transfers packed across ${sheetCount} DigitalPrintWorx sheet${sheetCount === 1 ? '' : 's'} • ${calc.packRes.totalLinearIn.toFixed(1)}" linear film on ${calc.packRes.rollWidthIn}" roll • ${calc.sheetSolution.utilizationPct.toFixed(1)}% sheet fill (${calc.sheetSolution.freeRemainingLinearIn.toFixed(1)}" free film left)`
        : 'Add item quantities & active placements to pack all Adult, Youth & Print-Only transfers.'
    );

    // Live Logo Verification Bar (Confirms every single placement's logos are on the gangsheets!)
    const verifyBar = document.getElementById('bqLogoVerificationBar');
    if (verifyBar) {
      if (calc.expectedPlacementCounts.length === 0 || calc.totalShirts === 0) {
        verifyBar.innerHTML = '';
      } else {
        const pills = calc.expectedPlacementCounts.map((ep) => {
          const allPacked = ep.packedCount === ep.expectedCount && ep.expectedCount > 0;
          const artBadge = ep.hasUploadedLogo
            ? `<span style="color:#22f59b;font-weight:800;">&#10003; Logo Artwork Loaded (${esc(ep.fileName)})</span>`
            : `<span style="color:#ffb36b;font-weight:700;">&#9888; Upload file in Step 2 to render artwork</span>`;
          return `
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid ${allPacked && ep.hasUploadedLogo ? 'rgba(34,245,155,0.45)' : 'rgba(255,148,54,0.45)'};font-size:0.73rem;">
              <strong style="color:#ffffff;">${esc(ep.locationLabel)}:</strong>
              <span style="color:#2ce6ff;font-weight:800;">${ep.packedCount}/${ep.expectedCount} on sheets</span>
              <span>&bull;</span>
              ${artBadge}
            </div>
          `;
        }).join('');
        verifyBar.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;">${pills}</div>`;
      }
    }

    // Recommended DigitalPrintWorx Gang Sheets Box
    const recEl = document.getElementById('bqRecommendedSheetsBox');
    if (recEl) {
      if (calc.sheetSolution.chosenSheets.length === 0) {
        recEl.innerHTML = `<div style="font-size:0.78rem;color:rgba(255,255,255,0.62);">Add items above to compute exact DigitalPrintWorx gangsheet sizes &amp; live pricing.</div>`;
      } else {
        const rowsHtml = calc.sheetSolution.chosenSheets.map((cs) => `
          <div class="bq-sheet-order-row">
            <div>
              <strong style="color:#ffb36b;">${cs.qty} &times; ${esc(cs.sheet.label)}</strong>
              <span style="font-size:0.72rem;color:rgba(255,255,255,0.68);margin-left:6px;">(${money(cs.sheet.priceUsd)} each${cs.sheet.liveVerified ? ' &bull; <span style="color:#22f59b;">LIVE</span>' : ''})</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <strong style="color:#22f59b;">${money(cs.subtotal)}</strong>
              <a href="${esc(cs.sheet.productUrl)}" target="_blank" rel="noopener noreferrer" class="mini-btn" style="padding:4px 10px;font-size:0.68rem;text-decoration:none;color:#ffb36b;">Order on DigitalPrintWorx &nearr;</a>
            </div>
          </div>
        `).join('');

        recEl.innerHTML = `
          ${rowsHtml}
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;margin-top:6px;border-top:1px solid rgba(255,255,255,0.14);font-size:0.78rem;">
            <span style="color:rgba(255,255,255,0.78);">Optimal DTF Gangsheet Total (${money(calc.dtfCostPerShirt)} / item):</span>
            <strong style="font-size:0.95rem;color:#ff9e44;">${money(calc.sheetSolution.totalDtfCost)}</strong>
          </div>
        `;
      }
    }

    // Generate Projected Finished Item Picture + Live Stripe Checkout QR
    const projectedMockupUrl = renderProjectedFinishedItemDataUrl(calc);
    calc.projectedMockupUrl = projectedMockupUrl;

    const quoteId = state.activeQuoteId || getOrInitActiveQuoteId();
    const stripePayUrl = getQuoteStripePortalUrl(calc);
    const stripeQrDataUrl = renderStripeQrDataUrl(stripePayUrl, 260);
    calc.stripePayUrl = stripePayUrl;
    calc.stripeQrDataUrl = stripeQrDataUrl;

    if (calc.totalShirts > 0) {
      scheduleStripeQuoteCloudSync();
    }

    // Render EXACT Concept #1 ("Molten Obsidian Executive Sheet") + Private Owner Ledger
    const finEl = document.getElementById('bqFinancialBreakdownBody');
    if (finEl) {
      const logoUrl = getAssetUrl('assets/logo.png');
      const c = state.customer;
      const issueDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const clientHeadline = [c.fullName, c.companyOrTeam].filter(Boolean).join(' — ') || 'Valued Client';
      const projectHeadline = c.projectName || 'Custom Performance Apparel & DTF Order';
      const contactSnippet = [c.phone, c.email, c.address].filter(Boolean).join(' • ');

      const ssShipNote = calc.totalPhysicalShirts === 0
        ? '$0.00 (Print-Only Order)'
        : (calc.blanksSubtotal >= 200 && String(state.ssShippingOverride).trim() === ''
            ? 'FREE ($200+ S&S Order)'
            : money(calc.ssShippingUsd));

      // Group summary mini-rows under the 2x2 KPI tiles
      const miniGroupLines = calc.itemOverallGroups.map((g) => {
        const avgUsed = calc.discountPct > 0 ? g.avgPerItemAfterDiscount : g.avgPerItemPreDiscount;
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:0.72rem;padding:4px 8px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);">
            <span style="display:inline-flex;align-items:center;gap:6px;color:#f1f5f9;">
              <i style="width:10px;height:10px;border-radius:50%;background:${esc(g.colorHex)};border:1px solid rgba(255,255,255,0.5);display:inline-block;"></i>
              <strong>${esc(g.brand)} ${esc(g.styleBadge)}</strong> (${esc(g.colorName)})
            </span>
            <span style="color:#ffb36b;font-weight:700;">${g.totalQty} pcs &bull; ${money(avgUsed)}/ea</span>
          </div>
        `;
      }).join('');

      // Itemized table rows with Concept #1 glowing orange group dividers + Item Descriptions
      const getTierKey = (r) => r.isPrintOnly ? 'print' : (r.isYouth ? 'youth' : 'adult');
      const itemizedTableRows = calc.itemizedLines.map((row, idx) => {
        const prev = idx > 0 ? calc.itemizedLines[idx - 1] : null;
        const needsOrangeRule = prev && (getTierKey(prev) !== getTierKey(row) || prev.lineId !== row.lineId);
        const garmentLabel = row.isPrintOnly
          ? 'Custom DTF Transfer Only'
          : `${row.brand} ${row.styleCode} (#${row.itemNumber}) — ${row.colorName}`;
        const sizeDisplay = row.isPrintOnly
          ? 'PRINT ONLY'
          : (row.isYouth ? row.sizeName.replace(/^Y/, 'Youth ') : (row.sizeName === 'S' ? 'Adult S' : row.sizeName));

        return `
          <tr class="${needsOrangeRule ? 'c1-orange-divider' : ''}">
            <td style="text-align:center;color:rgba(255,255,255,0.78);font-weight:600;">${row.lineNumber}</td>
            <td>
              <div style="display:inline-flex;align-items:center;gap:7px;">
                <span style="width:11px;height:11px;border-radius:50%;background:${esc(row.colorHex)};border:1px solid rgba(255,255,255,0.55);display:inline-block;flex-shrink:0;"></span>
                <strong style="color:#ffffff;">${esc(garmentLabel)}</strong>
              </div>
              <div style="font-size:0.69rem;color:rgba(255,214,176,0.76);margin-top:2px;line-height:1.32;">
                ${esc(row.garmentTitle)} &bull; ${esc(row.specs || '')}
              </div>
            </td>
            <td style="color:rgba(255,255,255,0.82);font-size:0.75rem;">${esc(row.printSpecSummary || 'Blank Garment')}</td>
            <td style="text-align:center;font-weight:700;color:${row.isPrintOnly ? '#ff9d3b' : '#ffffff'};">${esc(sizeDisplay)}</td>
            <td style="text-align:center;font-weight:700;">${row.qty}</td>
            <td style="text-align:right;font-weight:600;">${money(row.unitPriceQuoted)}</td>
            <td style="text-align:right;font-weight:700;color:#ffffff;">${money(row.lineTotalQuoted)}</td>
          </tr>
        `;
      }).join('');

      // Item Description & Garment Specifications Cards
      const itemDescRowsHtml = (calc.itemDescriptions || []).map((d) => `
        <div style="padding:9px 12px;border-radius:11px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,148,54,0.32);">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="display:inline-flex;align-items:center;gap:7px;font-weight:800;color:#ffd099;font-size:0.82rem;">
              <i style="width:11px;height:11px;border-radius:50%;background:${esc(d.colorHex)};border:1px solid rgba(255,255,255,0.6);display:inline-block;"></i>
              ${esc(d.brand)} ${esc(d.styleCode)} (Item #${esc(d.itemNumber)}) &mdash; ${esc(d.colorName)}
            </span>
            <span style="font-size:0.72rem;color:#9ef3ff;font-weight:700;">Prints: ${esc(d.printSpecs || 'Blank Garment')}</span>
          </div>
          <div style="font-size:0.75rem;color:rgba(255,255,255,0.84);margin-top:4px;line-height:1.42;">
            ${esc(d.description)}
          </div>
        </div>
      `).join('');

      // Official Available S&S Colors (3D glossy orbs matching Concept #1)
      const primaryStyleCode = state.garmentLines[0]?.styleCode || 'TT11';
      const activeColorSet = new Set(state.garmentLines.map((l) => l.colorName));
      const ssColors = getColorsForStyle(primaryStyleCode);
      const colorOrbsHtml = ssColors.map((col) => `
        <span
          class="c1-color-orb ${activeColorSet.has(col.name) ? 'is-selected' : ''}"
          style="background:radial-gradient(circle at 32% 28%, rgba(255,255,255,0.52) 0%, ${esc(col.hex)} 44%, #09080c 100%);"
          title="${esc(col.name)}"
        ></span>
      `).join('');

      const clientQuoteUrl = getClientQuoteDossierUrl(quoteId);
      const studioTicketUrl = getProjectStudioTicketUrl(quoteId);
      const isPaidNow = Boolean(state.activeQuotePaidInfo && state.activeQuotePaidInfo.isPaid);
      const paidBannerHtml = isPaidNow ? `
        <div style="margin-bottom:12px;padding:12px 16px;border-radius:14px;background:linear-gradient(135deg,rgba(14,72,48,0.88),rgba(8,32,22,0.94));border:1.5px solid #22f59b;box-shadow:0 0 24px rgba(34,245,155,0.28);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span style="padding:4px 11px;border-radius:999px;background:rgba(34,245,155,0.22);border:1px solid #22f59b;color:#6bffc3;font-family:'Orbitron',sans-serif;font-size:0.72rem;font-weight:900;">&#10003; QUOTE PAID IN FULL</span>
            <strong style="color:#ffffff;font-size:0.86rem;">Stripe Payment Verified for Ticket #${esc(quoteId)}</strong>
          </div>
          <a href="${esc(clientQuoteUrl)}" target="_blank" style="color:#6bffc3;font-weight:800;font-size:0.78rem;text-decoration:underline;">Open Verified Client Receipt &nearr;</a>
        </div>
      ` : '';

      finEl.innerHTML = `
        ${paidBannerHtml}
        <div class="c1-quote-sheet">
          <!-- TIER 1: SMOKED LIQUID GLASS HEADER WITH ACTUAL LOGO & CLICKABLE TICKET # -->
          <div class="c1-header-banner">
            <div class="c1-brand-lockup">
              <img src="${esc(logoUrl)}" alt="RetroCanopy Official Logo" class="c1-brand-logo">
              <div class="c1-brand-wordmark">RETROCANOPY</div>
            </div>
            <div class="c1-quote-meta-right">
              <div class="c1-quote-title">${isPaidNow ? 'PAID PROJECT RECEIPT' : 'OFFICIAL QUOTE'}</div>
              <div class="c1-quote-sub" style="display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:4px;">
                <a href="${esc(clientQuoteUrl)}" target="_blank" rel="noopener noreferrer" title="Click to open the Concept #1 Sent Client Quote Dossier for this Project Ticket" style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:999px;background:rgba(255,138,38,0.2);border:1px solid #ff9436;color:#ffd099;font-family:'Orbitron',sans-serif;font-size:0.7rem;font-weight:800;text-decoration:none;">
                  &#127915; TICKET #${esc(quoteId)} &nearr;
                </a>
                <span>&bull; Issued ${esc(issueDate)}</span>
              </div>
            </div>
          </div>

          <!-- TIER 2: FULL-WIDTH GLOWING ORANGE CAPABILITIES PILL -->
          <div class="c1-cap-pill-bar">
            ${STUDIO_CAPABILITIES.map((cap) => esc(cap)).join(' &bull; ')}
          </div>

          <!-- TIER 3: FULL-WIDTH PREPARED FOR, PROJECT & DIRECT TICKET LINK BAR -->
          <div class="c1-client-bar">
            <span><strong style="color:#ffd089;">PREPARED FOR:</strong> ${esc(clientHeadline)}</span>
            <span style="color:rgba(255,138,38,0.75);">|</span>
            <span><strong style="color:#ffd089;">PROJECT:</strong> ${esc(projectHeadline)}</span>
            <span style="color:rgba(255,138,38,0.75);">|</span>
            <a href="${esc(studioTicketUrl)}" style="color:#9ef3ff;font-size:0.74rem;font-weight:700;text-decoration:underline;" title="Direct Project Studio Link">Project Link: #${esc(quoteId)}</a>
            ${contactSnippet ? `<span style="color:rgba(255,138,38,0.75);">|</span><span style="font-size:0.75rem;color:rgba(255,255,255,0.8);">${esc(contactSnippet)}</span>` : ''}
          </div>

          <!-- TIER 4: 50/50 PROJECTED FINISHED ITEM + 2x2 OVERALL BREAKDOWN PER ITEM -->
          <div class="c1-mid-grid">
            <div class="c1-glass-card">
              <div class="c1-section-heading">PROJECTED FINISHED ITEM (DRI-FIT STUDIO PREVIEW)</div>
              <div style="flex:1;display:flex;align-items:center;justify-content:center;">
                <img src="${projectedMockupUrl}" alt="Projected Finished Item Preview" style="width:100%;max-height:285px;object-fit:contain;border-radius:12px;display:block;">
              </div>
            </div>

            <div class="c1-glass-card">
              <div>
                <div class="c1-section-heading">OVERALL BREAKDOWN PER ITEM</div>
                <div class="c1-kpi-grid">
                  <div class="c1-kpi-tile">
                    <div class="c1-kpi-val">${calc.totalShirts}</div>
                    <div class="c1-kpi-lbl">Total Items</div>
                  </div>
                  <div class="c1-kpi-tile">
                    <div class="c1-kpi-val">${money(calc.avgItemPreDiscount)}</div>
                    <div class="c1-kpi-lbl">Base/Item</div>
                  </div>
                  <div class="c1-kpi-tile">
                    <div class="c1-kpi-val">${calc.discountPct}%</div>
                    <div class="c1-kpi-lbl">${calc.discountPct > 0 ? esc(calc.discountLabel || 'Discount') : 'Discount'}</div>
                  </div>
                  <div class="c1-kpi-tile">
                    <div class="c1-kpi-val">${money(calc.avgItemAllInFinal)}</div>
                    <div class="c1-kpi-lbl">Final/Item</div>
                  </div>
                </div>
              </div>
              ${miniGroupLines ? `<div style="display:flex;flex-direction:column;gap:5px;margin-top:10px;">${miniGroupLines}</div>` : ''}
            </div>
          </div>

          <!-- TIER 4.5: ITEM DESCRIPTION & GARMENT SPECIFICATIONS -->
          ${itemDescRowsHtml ? `
            <div class="c1-item-desc-panel" style="margin-top:14px;padding:13px 16px;border-radius:16px;background:linear-gradient(165deg,rgba(32,30,40,0.88),rgba(17,16,22,0.95));border:1px solid rgba(255,148,54,0.42);">
              <div class="c1-section-heading" style="margin-bottom:8px;">ITEM DESCRIPTION &amp; GARMENT SPECIFICATIONS</div>
              <div style="display:flex;flex-direction:column;gap:8px;">
                ${itemDescRowsHtml}
              </div>
            </div>
          ` : ''}

          <!-- TIER 5: FULL LINE-BY-LINE ITEMIZED QUOTE BREAKDOWN TABLE -->
          <div class="c1-table-card">
            <div class="c1-section-heading" style="margin-bottom:8px;">ITEMIZED QUOTE BREAKDOWN (LINE BY LINE)</div>
            <div style="overflow-x:auto;">
              <table class="c1-table">
                <thead>
                  <tr>
                    <th style="width:52px;text-align:center;">Line</th>
                    <th>Garment &amp; Color</th>
                    <th>Print Specs</th>
                    <th style="text-align:center;">Size</th>
                    <th style="text-align:center;">Qty</th>
                    <th style="text-align:right;">Unit Price</th>
                    <th style="text-align:right;">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemizedTableRows || '<tr><td colspan="7" style="padding:16px;text-align:center;color:rgba(255,255,255,0.58);">Enter quantities in Step 1 (Youth, Adult, or Print Only) to populate itemized quote lines.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <!-- TIER 6: BOTTOM AVAILABLE S&S COLORS + LIVE STRIPE QR & TOTALS -->
          <div class="c1-bottom-grid">
            <div class="c1-glass-card">
              <div>
                <div class="c1-section-heading" style="margin-bottom:4px;">AVAILABLE S&amp;S COLORS</div>
                <div style="text-align:center;font-size:0.69rem;color:rgba(255,208,158,0.78);margin-bottom:10px;">
                  ${esc((SS_CATALOG[primaryStyleCode] || SS_CATALOG.TT11).brand)} ${esc(primaryStyleCode)} &bull; ${ssColors.length} Official Colors (Hover to Inspect)
                </div>
                <div class="c1-orbs-wrap">
                  ${colorOrbsHtml}
                </div>
              </div>
              <div style="text-align:center;font-size:0.68rem;color:rgba(255,255,255,0.56);margin-top:8px;">
                Selected order color(s) highlighted in molten orange
              </div>
            </div>

            <div class="c1-glass-card">
              <div class="c1-totals-And-qr">
                <div class="c1-qr-box">
                  <a href="${esc(stripePayUrl)}" target="_blank" rel="noopener noreferrer" title="Scan or click to open Live Stripe Checkout for Quote #${esc(quoteId)}">
                    <img src="${stripeQrDataUrl}" alt="Scan for Live Stripe Checkout">
                  </a>
                  <div style="font-family:'Orbitron',sans-serif;font-size:0.62rem;font-weight:800;color:#ffb36b;margin-top:6px;letter-spacing:0.05em;">
                    SCAN TO PAY (STRIPE)
                  </div>
                  <div id="bqStripeQrSyncBadge" style="font-size:0.6rem;color:#22f59b;margin-top:2px;font-weight:600;">
                    &#9679; Live Checkout Ready
                  </div>
                </div>

                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;font-size:0.86rem;color:#f1f5f9;">
                    <span>Subtotal:</span>
                    <strong>${money(calc.subtotalBeforeDiscount)}</strong>
                  </div>

                  <div class="c1-discount-pill">
                    <span>${calc.discountPct}% OFF ${esc(calc.discountLabel || 'Discount')}:</span>
                    <strong style="color:#ff9d3b;">${calc.discountAmountUsd > 0 ? '&minus;' + money(calc.discountAmountUsd) : '$0.00'}</strong>
                  </div>

                  <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;font-size:0.85rem;color:#f1f5f9;">
                    <span>${calc.includeTax ? `Tax Included (${calc.taxRatePct.toFixed(2)}%):` : 'Tax Excluded:'}</span>
                    <strong>${money(calc.taxAmountUsd)}</strong>
                  </div>

                  <div class="c1-grand-pill">
                    <span style="color:#ffffff;font-family:'Orbitron',sans-serif;font-size:0.86rem;letter-spacing:0.04em;">GRAND TOTAL:</span>
                    <span style="color:#ff9d3b;font-family:'Orbitron',sans-serif;font-size:1.12rem;">${money(calc.customerQuoteTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PRIVATE OWNER INTERNAL COST & PROFIT LEDGER -->
        <div class="bq-cost-ledger">
          <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.06em;color:#2ce6ff;font-weight:700;margin-bottom:2px;">
            &#128274; Owner Internal Cost &amp; Profit Breakdown (Hidden on Client PDF)
          </div>
          <div class="bq-ledger-row">
            <span>S&amp;S Blank Shirts (${calc.totalAdultShirts} Adult + ${calc.totalYouthShirts} Youth${calc.totalPrintOnlyItems > 0 ? ` • ${calc.totalPrintOnlyItems} Print-Only @ $0` : ''})</span>
            <strong>${money(calc.blanksSubtotal)}</strong>
          </div>
          <div class="bq-ledger-row">
            <span>S&amp;S Blank Freight / Shipping</span>
            <strong>${ssShipNote}</strong>
          </div>
          <div class="bq-ledger-row">
            <span>DigitalPrintWorx DTF Gangsheets (${sheetCount} sheet${sheetCount === 1 ? '' : 's'})</span>
            <strong>${money(calc.sheetSolution.totalDtfCost)}</strong>
          </div>
          <div class="bq-ledger-row">
            <span>DigitalPrintWorx DTF Shipping + Pressing/Handling (${calc.totalPhysicalShirts} physical shirts &times; ${money(state.pressLaborPerShirt)})</span>
            <strong>${money(calc.dpwShippingUsd + calc.totalPressLaborUsd)}</strong>
          </div>
          <div class="bq-ledger-row total-cost">
            <span>YOUR TRUE HARD COST (${money(calc.avgHardCostPerShirt)} avg / item)</span>
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

    renderAllGangsheetsGallery(calc);
  }

  // =========================================================================
  // RENDER EVERY SINGLE NEEDED GANGSHEET + DOWNLOAD ALL 300 DPI SHEETS
  // =========================================================================
  function renderAllGangsheetsGallery(calc) {
    const gallery = document.getElementById('bqAllGangsheetsGallery');
    if (!gallery) return;

    const sheets = calc.sheetSolution.sheetAssignments || [];
    if (sheets.length === 0) {
      gallery.innerHTML = `<div style="padding:18px;text-align:center;color:rgba(255,255,255,0.6);font-size:0.8rem;border:1px dashed rgba(255,140,42,0.35);border-radius:12px;">Enter quantities in Step 1 to generate your packed gangsheet previews.</div>`;
      return;
    }

    // Build cards for ALL sheets (1 .. N, never truncated!)
    gallery.innerHTML = sheets.map((sa, sIdx) => {
      const byLoc = {};
      sa.boxes.forEach((b) => {
        const key = `${b.shortLoc} (${b.sizeGroup === 'YOUTH' ? 'Youth' : 'Adult'})`;
        byLoc[key] = (byLoc[key] || 0) + 1;
      });
      const summaryStr = Object.entries(byLoc).map(([k, cnt]) => `${cnt}&times; ${esc(k)}`).join(' &bull; ');

      return `
        <div class="bq-single-sheet-card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <div>
              <strong style="font-family:'Orbitron',sans-serif;font-size:0.78rem;color:#ffb36b;">
                SHEET #${sIdx + 1} OF ${sheets.length} &mdash; ${sa.sheet.widthIn}" &times; ${sa.sheet.lengthIn}" (${money(sa.sheet.priceUsd)})
              </strong>
              <div style="font-size:0.68rem;color:rgba(255,255,255,0.72);margin-top:2px;">
                ${sa.boxes.length} logos on this sheet: ${summaryStr}
              </div>
            </div>
            <button type="button" class="mini-btn" data-download-single-sheet="${sIdx}" style="padding:5px 10px;font-size:0.69rem;color:#ff9e44;border-color:rgba(255,140,42,0.55) !important;">
              &#11015; Sheet #${sIdx + 1} (.PNG)
            </button>
          </div>
          <div style="background:#07060d;border:1px solid rgba(255,255,255,0.16);border-radius:10px;padding:8px;text-align:center;overflow-x:auto;">
            <canvas id="bqSheetCanvas_${sIdx}" style="max-width:100%;height:auto;border-radius:6px;"></canvas>
          </div>
        </div>
      `;
    }).join('');

    // Draw EVERY sheet's boxes & uploaded logos synchronously onto its canvas
    const pxPerIn = 11.5;
    sheets.forEach((sa, sIdx) => {
      const canvas = document.getElementById(`bqSheetCanvas_${sIdx}`);
      if (!canvas) return;
      const shW = Math.round(sa.sheet.widthIn * pxPerIn);
      const shH = Math.round(sa.sheet.lengthIn * pxPerIn);
      canvas.width = shW;
      canvas.height = shH;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#14111f';
      ctx.fillRect(0, 0, shW, shH);
      const sq = 9;
      ctx.fillStyle = '#1c182b';
      for (let cy = 0; cy < shH; cy += sq) {
        for (let cx = 0; cx < shW; cx += sq) {
          if (((cx / sq + cy / sq) | 0) % 2 === 0) {
            ctx.fillRect(cx, cy, Math.min(sq, shW - cx), Math.min(sq, shH - cy));
          }
        }
      }

      const usedPx = Math.round(sa.usedLinearIn * pxPerIn);
      if (usedPx < shH - 4) {
        ctx.fillStyle = 'rgba(34, 245, 155, 0.05)';
        ctx.fillRect(0, usedPx, shW, shH - usedPx);
        ctx.strokeStyle = 'rgba(34, 245, 155, 0.42)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, usedPx);
        ctx.lineTo(shW, usedPx);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      sa.boxes.forEach((b) => {
        const bx = Math.round(b.x * pxPerIn);
        const by = Math.round(b.localY * pxPerIn);
        const bw = Math.max(4, Math.round(b.w * pxPerIn));
        const bh = Math.max(4, Math.round(b.h * pxPerIn));

        const isYouthBox = b.sizeGroup === 'YOUTH';
        const strokeCol = isYouthBox ? 'rgba(44, 230, 255, 0.92)' : 'rgba(255, 140, 42, 0.92)';
        const fillCol = isYouthBox ? 'rgba(44, 230, 255, 0.12)' : 'rgba(255, 122, 24, 0.14)';

        ctx.fillStyle = fillCol;
        ctx.fillRect(bx, by, bw, bh);

        if (b.renderSource) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(bx + 1, by + 1, Math.max(1, bw - 2), Math.max(1, bh - 2));
          ctx.clip();
          if (b.rotated) {
            ctx.translate(bx + bw / 2, by + bh / 2);
            ctx.rotate(Math.PI / 2);
            drawContainSource(ctx, b.renderSource, -bh / 2 + 1, -bw / 2 + 1, bh - 2, bw - 2);
          } else {
            drawContainSource(ctx, b.renderSource, bx + 1, by + 1, bw - 2, bh - 2);
          }
          ctx.restore();
        } else if (bw > 26 && bh > 13) {
          ctx.fillStyle = isYouthBox ? '#9ef3ff' : '#ffd5b0';
          ctx.font = '700 8px Segoe UI, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${isYouthBox ? 'Y ' : ''}${b.origW}"×${b.origH}"`, bx + bw / 2, by + bh / 2 + 3);
        }

        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);
      });
    });
  }

  function renderSingleGangsheetBlob(sa) {
    return new Promise((resolve) => {
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
        if (!b.renderSource) return;
        const bx = Math.round(b.x * dpi);
        const by = Math.round(b.localY * dpi);
        const bw = Math.round(b.w * dpi);
        const bh = Math.round(b.h * dpi);
        octx.save();
        if (b.rotated) {
          octx.translate(bx + bw / 2, by + bh / 2);
          octx.rotate(Math.PI / 2);
          drawContainSource(octx, b.renderSource, -bh / 2, -bw / 2, bh, bw);
        } else {
          drawContainSource(octx, b.renderSource, bx, by, bw, bh);
        }
        octx.restore();
      });

      outCanvas.toBlob((blob) => resolve({ blob, dpi }), 'image/png');
    });
  }

  function triggerBlobDownload(blob, filename) {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
  }

  async function downloadSingleSheetByIndex(sheetIndex) {
    const calc = state.lastCalculation;
    if (!calc || !calc.sheetSolution.sheetAssignments[sheetIndex]) return;
    const anyArt = state.dtfPlacements.some((p) => p.enabled !== false && (p.origCanvas || p.trimmedCanvas));
    if (!anyArt) {
      alert('Please upload at least one DTF artwork file (.PNG or .SVG) in Step 2 first so your logos can be rendered onto the 300 DPI gangsheet!');
      return;
    }
    const sheets = calc.sheetSolution.sheetAssignments;
    const sa = sheets[sheetIndex];
    const cleanName = (state.customer.projectName || state.customer.companyOrTeam || 'RetroCanopy_BulkOrder').replace(/[^a-zA-Z0-9_-]/g, '_');
    const { blob, dpi } = await renderSingleGangsheetBlob(sa);
    triggerBlobDownload(blob, `${cleanName}_Sheet_${sheetIndex + 1}_of_${sheets.length}_${sa.sheet.widthIn}x${sa.sheet.lengthIn}_${dpi}DPI.png`);
  }

  async function exportAllPackedGangsheets300DpiPng() {
    const calc = state.lastCalculation;
    if (!calc || !calc.sheetSolution.sheetAssignments.length) {
      alert('Add item quantities and upload your DTF file(s) first to generate 300 DPI gangsheets.');
      return;
    }
    const missingArtPlacements = calc.activePlacements.filter((p) => !p.origCanvas && !p.trimmedCanvas);
    const hasAnyArt = calc.activePlacements.some((p) => p.origCanvas || p.trimmedCanvas);
    if (!hasAnyArt) {
      alert('Please upload your project DTF artwork file(s) (.PNG or .SVG) in Step 2 first so we can tile all your logos onto the 300 DPI gangsheets!');
      return;
    }
    if (missingArtPlacements.length > 0) {
      const names = missingArtPlacements.map((p) => p.locationLabel).join(', ');
      const ok = confirm(`Heads up: Placement "${names}" has no uploaded file yet (its slots will be left transparent). Download all gangsheets with your uploaded logo(s) now?`);
      if (!ok) return;
    }

    const sheets = calc.sheetSolution.sheetAssignments;
    const btn = document.getElementById('bqExportGangsheetPngBtn');
    const cleanName = (state.customer.projectName || state.customer.companyOrTeam || 'RetroCanopy_BulkOrder').replace(/[^a-zA-Z0-9_-]/g, '_');

    if (btn) btn.dataset.downloading = '1';

    for (let i = 0; i < sheets.length; i++) {
      const sa = sheets[i];
      if (btn) {
        btn.innerHTML = `&#9203; Rendering Sheet ${i + 1} of ${sheets.length} (${sa.sheet.widthIn}"&times;${sa.sheet.lengthIn}")...`;
      }
      const { blob, dpi } = await renderSingleGangsheetBlob(sa);
      triggerBlobDownload(blob, `${cleanName}_Sheet_${i + 1}_of_${sheets.length}_${sa.sheet.widthIn}x${sa.sheet.lengthIn}_${dpi}DPI.png`);
      if (i < sheets.length - 1) {
        await new Promise((r) => setTimeout(r, 420));
      }
    }

    if (btn) {
      btn.innerHTML = `&#10003; Downloaded All ${sheets.length} Gangsheet${sheets.length === 1 ? '' : 's'}!`;
      setTimeout(() => {
        delete btn.dataset.downloading;
        renderSummaryAndCanvas();
      }, 2600);
    }
  }

  // =========================================================================
  // RENDER GARMENT LINES (INCLUDES PRINT ONLY $0.00 + YOUTH + ADULT SIZES)
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
        const printOnly = isPrintOnlySize(sz);
        const youth = isYouthSize(sz);
        const unitP = getBlankUnitPrice(line.styleCode, line.colorName, sz);
        const qtyVal = line.quantities[sz] || 0;
        const liveStock = getLiveStockBadge(line.styleCode, line.colorName, sz);
        const stockTag = liveStock !== null
          ? `<span class="bq-stock-micro">${liveStock} stk</span>`
          : '';
        const extraCls = printOnly ? 'print-only-cell' : (youth ? 'youth-cell' : '');
        const lblColor = printOnly ? 'color:#ff9e44;' : (youth ? 'color:#2ce6ff;' : '');
        return `
          <div class="bq-size-cell ${qtyVal > 0 ? 'has-qty' : ''} ${extraCls}">
            <label class="bq-size-label" style="${lblColor}">${esc(sz)}</label>
            <input type="number" min="0" max="9999" step="1" class="bq-size-input" data-line-id="${line.id}" data-size-key="${esc(sz)}" value="${qtyVal || ''}" placeholder="0">
            <span class="bq-size-price" style="${printOnly ? 'color:#ffb36b;font-weight:800;' : ''}">${printOnly ? '$0.00 Blank' : money(unitP)}</span>
            ${stockTag}
          </div>
        `;
      };

      const printOnlyHtml = buildSizeCell(PRINT_ONLY_KEY);
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
              <span class="tag-pill" id="bqLineQty_${line.id}" style="background:rgba(255,122,24,0.18);color:#ffb36b;border:1px solid rgba(255,140,42,0.5);">0 pcs</span>
              <strong id="bqLineSub_${line.id}" style="color:#ffe89e;font-size:0.86rem;">Blanks: $0.00</strong>
              ${state.garmentLines.length > 1 ? `<button type="button" class="mini-btn" data-remove-line="${line.id}" style="padding:4px 9px;color:#ff85b3;border-color:rgba(255,79,163,0.45) !important;" title="Remove this row">&times;</button>` : ''}
            </div>
          </div>

          <div style="font-size:0.72rem;color:rgba(255,255,255,0.68);margin:6px 0 8px;">
            <strong>${esc(cat.fullName)}</strong> &bull; ${esc(cat.specs)} (${colors.length} Official Colors)
          </div>

          <div class="bq-swatch-strip" title="Click any official S&amp;S color swatch to select">
            ${swatchesHtml}
          </div>

          <!-- PRINT ONLY ($0 BLANK) + YOUTH SIZES ROW -->
          <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end;margin:8px 0 10px;">
            <div style="min-width:145px;">
              <div style="font-size:0.68rem;font-weight:800;color:#ff9e44;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">
                Print-Only Orders ($0 Blank):
              </div>
              <div style="max-width:165px;">
                ${printOnlyHtml}
              </div>
            </div>

            <div style="flex:1;min-width:290px;">
              <div style="font-size:0.68rem;font-weight:700;color:#2ce6ff;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">
                Youth Sizes (${esc(cat.youthStyleCode)} &bull; Item #${esc(cat.youthItemNumber)}) — Auto-Scales DTF Prints:
              </div>
              <div class="bq-sizes-grid" style="grid-template-columns:repeat(5,minmax(62px,1fr));max-width:520px;">
                ${youthGridHtml}
              </div>
            </div>
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
  const DTF_PLACEMENT_PRESETS = [
    { label: 'Front Right Breast Pocket (4"×4" | Youth 3"×3")', loc: 'Front Right Breast Pocket', aw: 4.0, ah: 4.0, yw: 3.0, yh: 3.0 },
    { label: 'Across the Chest (10.5"×4.5" | Youth 8"×3.5")', loc: 'Across the Chest', aw: 10.5, ah: 4.5, yw: 8.0, yh: 3.5 },
    { label: 'Top of the Back (10.5"×4" | Youth 8"×3")', loc: 'Top of the Back', aw: 10.5, ah: 4.0, yw: 8.0, yh: 3.0 },
    { label: 'Full Back (10.5"×11.5" | Youth 8"×9")', loc: 'Full Back', aw: 10.5, ah: 11.5, yw: 8.0, yh: 9.0 },
    { label: 'Full Front (10.5"×11.5" | Youth 8"×9")', loc: 'Full Front', aw: 10.5, ah: 11.5, yw: 8.0, yh: 9.0 },
    { label: 'Sleeve / Neck (3"×3" | Youth 2.25"×2.25")', loc: 'Sleeve / Back Neck', aw: 3.0, ah: 3.0, yw: 2.25, yh: 2.25 }
  ];

  function renderDtfPlacementsList() {
    const container = document.getElementById('bqDtfPlacementsContainer');
    if (!container) return;

    const presets = DTF_PLACEMENT_PRESETS;

    container.innerHTML = state.dtfPlacements.map((p, idx) => {
      const previewUrl = p.autoTrimTransparent && p.trimmedDataUrl ? p.trimmedDataUrl : p.dataUrl;
      const metaInfo = p.fileName
        ? `<div style="font-size:0.71rem;color:#22f59b;margin-top:4px;">&#10003; <strong>${esc(p.fileName)}</strong> &bull; Active on Garment Mockup &amp; Gangsheets (Adult <strong>${p.adultWidthIn}"&times;${p.adultHeightIn}"</strong> | Youth <strong>${p.youthWidthIn}"&times;${p.youthHeightIn}"</strong>)</div>`
        : `<div style="font-size:0.71rem;color:rgba(255,255,255,0.65);margin-top:4px;">Upload your transparent <code>.PNG</code> or <code>.SVG</code> file — auto-sized to <strong>${p.adultWidthIn}"&times;${p.adultHeightIn}"</strong> (Adult) &amp; <strong>${p.youthWidthIn}"&times;${p.youthHeightIn}"</strong> (Youth).</div>`;

      const presetButtons = presets.map((pr) => {
        const isCurrent = (p.locationLabel || '').toLowerCase() === pr.loc.toLowerCase();
        const activeStyle = isCurrent
          ? 'background:rgba(255,136,32,0.28);border-color:#ff9e3d;color:#ffffff;box-shadow:0 0 12px rgba(255,122,20,0.35);'
          : '';
        return `<button type="button" class="bq-preset-chip" style="${activeStyle}" data-dtf-preset="${p.id}" data-ploc="${esc(pr.loc)}" data-aw="${pr.aw}" data-ah="${pr.ah}" data-yw="${pr.yw}" data-yh="${pr.yh}">${pr.label}</button>`;
      }).join('');

      const selectOptions = presets.map((pr) => {
        const sel = (p.locationLabel || '').toLowerCase() === pr.loc.toLowerCase() ? 'selected' : '';
        return `<option value="${esc(pr.loc)}" ${sel}>${esc(pr.loc)} (${pr.aw}"×${pr.ah}" | Youth ${pr.yw}"×${pr.yh}")</option>`;
      }).join('');
      const hasPresetMatch = presets.some((pr) => pr.loc.toLowerCase() === (p.locationLabel || '').toLowerCase());

      return `
        <div class="bq-dtf-card" style="${p.enabled === false ? 'opacity:0.52;' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:10px;flex:1;flex-wrap:wrap;">
              <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:0.76rem;font-weight:700;color:#22f59b;">
                <input type="checkbox" data-dtf-enabled="${p.id}" ${p.enabled !== false ? 'checked' : ''}>
                Include Placement #${idx + 1}
              </label>
              <select class="bq-select" data-dtf-preset-select="${p.id}" style="min-width:250px;font-weight:700;color:#ffd099;" title="Choose Shirt Print Placement Option">
                ${selectOptions}
                ${!hasPresetMatch ? `<option value="__custom__" selected>Custom: ${esc(p.locationLabel)}</option>` : `<option value="__custom__">Custom Placement Label...</option>`}
              </select>
              <input type="text" class="bq-input" data-dtf-label="${p.id}" value="${esc(p.locationLabel)}" placeholder="Placement Location" style="min-width:210px;font-weight:700;color:#ffb36b;">
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
                     <div style="font-size:0.76rem;font-weight:700;color:#ffb36b;">Upload ${esc(p.locationLabel)} Logo</div>
                     <div style="font-size:0.67rem;color:rgba(255,255,255,0.62);margin-top:2px;">Appears on Shirt Mockup + All Gangsheets</div>
                   </div>`
              }
            </label>

            <div style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
              <div style="display:flex;gap:14px;align-items:flex-end;flex-wrap:wrap;">
                <div style="background:rgba(255,122,24,0.1);border:1px solid rgba(255,140,42,0.42);border-radius:10px;padding:7px 10px;">
                  <div class="bq-field-lbl" style="color:#ffb36b;">Adult / Print-Only Size (Inches)</div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <input type="number" min="0.5" max="26.5" step="0.1" class="bq-input" data-dtf-aw="${p.id}" value="${p.adultWidthIn}" style="width:82px;font-weight:700;color:#ffb36b;">
                    <span>&times;</span>
                    <input type="number" min="0.5" max="95" step="0.1" class="bq-input" data-dtf-ah="${p.id}" value="${p.adultHeightIn}" style="width:82px;font-weight:700;color:#ffb36b;">
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
                <div class="bq-field-lbl" style="margin-bottom:4px;">Quick Placement Presets:</div>
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
  // SAVED QUOTES, CLIENT TEXT COPY & BLACK/ORANGE LIQUID GLASS QUOTE PDF
  // =========================================================================
  function getSavedQuotes() {
    try {
      const v4 = JSON.parse(localStorage.getItem(SAVED_QUOTES_KEY) || 'null');
      if (Array.isArray(v4)) return v4;
      for (const k of LEGACY_QUOTES_KEYS) {
        const leg = JSON.parse(localStorage.getItem(k) || 'null');
        if (Array.isArray(leg)) return leg;
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  function getMergedVaultQuotes() {
    const localList = getSavedQuotes();
    const byId = new Map();

    // 1. Seed from Supabase Cloud quotes (authoritative for live isPaid status!)
    (state.cloudSavedQuotes || []).forEach((cq) => {
      const id = cq.ticketId || cq.quoteId;
      if (!id) return;
      byId.set(id, {
        quoteId: id,
        ticketId: id,
        projectName: cq.projectName || 'Custom Apparel & DTF Order',
        clientLabel: [cq.customerName, cq.customerEmail].filter(Boolean).join(' • '),
        customerName: cq.customerName || '',
        customerEmail: cq.customerEmail || '',
        customerPhone: cq.customerPhone || '',
        totalShirts: Number(cq.totalShirts) || 0,
        customerQuoteTotal: Number(cq.grandTotalUsd) || 0,
        netProfitUsd: cq.netProfitUsd != null ? Number(cq.netProfitUsd) : null,
        isPaid: Boolean(cq.isPaid),
        paidAt: cq.paidAt || null,
        totalPaidUsd: Number(cq.totalPaidUsd) || 0,
        fulfilled: Boolean(cq.fulfilled),
        projectedPreviewJpeg: cq.projectedPreviewJpeg || '',
        savedAtIso: cq.paidAt || cq.savedAt || cq.createdAt || '',
        savedAtFormatted: (cq.paidAt || cq.savedAt || cq.createdAt)
          ? new Date(cq.paidAt || cq.savedAt || cq.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : 'Saved in Cloud',
        snapshot: null
      });
    });

    // 2. Merge local saved quotes (adds full local snapshot & any offline drafts)
    localList.forEach((lq) => {
      const id = lq.quoteId || lq.ticketId;
      if (!id) return;
      if (byId.has(id)) {
        const existing = byId.get(id);
        existing.snapshot = lq.snapshot || existing.snapshot;
        if (existing.netProfitUsd == null && lq.netProfitUsd != null) existing.netProfitUsd = lq.netProfitUsd;
        if (!existing.projectedPreviewJpeg && lq.projectedPreviewJpeg) existing.projectedPreviewJpeg = lq.projectedPreviewJpeg;
      } else {
        byId.set(id, {
          ...lq,
          ticketId: id,
          isPaid: Boolean(lq.isPaid),
          projectedPreviewJpeg: lq.projectedPreviewJpeg || ''
        });
      }
    });

    return Array.from(byId.values());
  }

  async function fetchAndRenderSavedQuotesVault(silent = false) {
    const refreshBtn = document.getElementById('sqRefreshCloudQuotesBtn');
    if (refreshBtn && !silent) {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Syncing...';
    }
    try {
      const res = await fetch(STRIPE_EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_saved_quotes' })
      });
      const data = await res.json();
      if (res.ok && data && data.ok && Array.isArray(data.quotes)) {
        state.cloudSavedQuotes = data.quotes;
        const activeMatch = data.quotes.find((q) => (q.ticketId || q.quoteId) === state.activeQuoteId);
        if (activeMatch && activeMatch.isPaid) {
          const wasPaid = Boolean(state.activeQuotePaidInfo && state.activeQuotePaidInfo.isPaid);
          state.activeQuotePaidInfo = {
            isPaid: true,
            paidAt: activeMatch.paidAt,
            totalPaidUsd: activeMatch.totalPaidUsd || activeMatch.grandTotalUsd
          };
          if (!wasPaid && state.lastCalculation) {
            renderSummaryAndCanvas();
          }
        }
      }
    } catch (_) {}
    if (refreshBtn && !silent) {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '&#8635; Sync Live Paid Status';
    }
    renderSavedQuotesList();
    renderSavedQuotesVaultGrid();
  }

  function renderSavedQuotesVaultGrid() {
    const grid = document.getElementById('savedQuotesVaultGrid');
    const allQuotes = getMergedVaultQuotes();

    const paidQuotes = allQuotes.filter((q) => q.isPaid);
    const pendingQuotes = allQuotes.filter((q) => !q.isPaid);
    const paidRev = paidQuotes.reduce((s, q) => s + (Number(q.totalPaidUsd || q.customerQuoteTotal) || 0), 0);

    const setTxt = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    setTxt('savedQuotesNavCountBadge', paidQuotes.length > 0 ? `${allQuotes.length} • ${paidQuotes.length} PAID` : String(allQuotes.length));
    setTxt('sqKpiTotalCount', String(allQuotes.length));
    setTxt('sqKpiPaidCount', String(paidQuotes.length));
    setTxt('sqKpiPendingCount', String(pendingQuotes.length));
    setTxt('sqKpiPaidRevenue', money(paidRev));

    if (!grid) return;

    const qSearch = (state.sqVaultSearch || '').trim().toLowerCase();
    const filtered = allQuotes.filter((q) => {
      if (state.sqVaultFilter === 'paid' && !q.isPaid) return false;
      if (state.sqVaultFilter === 'pending' && q.isPaid) return false;
      if (qSearch) {
        const hay = `${q.quoteId} ${q.projectName} ${q.clientLabel} ${q.customerName} ${q.customerEmail} ${q.customerPhone}`.toLowerCase();
        if (!hay.includes(qSearch)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          No saved quotes match the current filter.<br>
          <span style="font-size:0.75rem;color:rgba(255,255,255,0.65);">Build a quote in the <strong>Bulk Order Quoter</strong> and click <strong>"Save Quote to Vault"</strong> or <strong>"Copy Client Quote Link"</strong> — every quote is stored here with live Stripe paid tracking!</span>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((q) => {
      const tid = q.ticketId || q.quoteId;
      const clientDossierUrl = getClientQuoteDossierUrl(tid);
      const stripePortalUrl = `${STRIPE_EDGE_URL}?q=${encodeURIComponent(tid)}&amt=${(Number(q.customerQuoteTotal) || 0).toFixed(2)}`;
      const statusBadge = q.isPaid
        ? `<span style="padding:4px 10px;border-radius:999px;background:rgba(34,245,155,0.2);border:1px solid #22f59b;color:#6bffc3;font-family:'Orbitron',sans-serif;font-size:0.66rem;font-weight:900;">&#10003; PAID &amp; CONFIRMED</span>`
        : `<span style="padding:4px 10px;border-radius:999px;background:rgba(255,148,54,0.18);border:1px solid rgba(255,148,54,0.68);color:#ffd099;font-family:'Orbitron',sans-serif;font-size:0.66rem;font-weight:800;">&#9203; SENT / AWAITING PAYMENT</span>`;

      const thumbHtml = q.projectedPreviewJpeg
        ? `<a href="${esc(clientDossierUrl)}" target="_blank" style="display:block;background:#121118;border-radius:12px;border:1px solid rgba(255,148,54,0.35);padding:6px;margin-bottom:8px;">
             <img src="${esc(q.projectedPreviewJpeg)}" alt="Projected Finished Item" style="width:100%;height:142px;object-fit:contain;display:block;border-radius:8px;">
           </a>`
        : '';

      return `
        <div class="sq-quote-card ${q.isPaid ? 'is-paid' : ''}" style="background:rgba(12,11,18,0.9);border:1.5px solid ${q.isPaid ? 'rgba(34,245,155,0.72)' : 'rgba(255,148,54,0.45)'};border-radius:18px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;gap:10px;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
              <button type="button" class="mini-btn" data-vault-open-ticket="${esc(tid)}" title="Click to open this Project Ticket in the Bulk Quote Studio" style="padding:4px 10px;font-family:'Orbitron',sans-serif;font-size:0.68rem;font-weight:800;color:#ffd099;border-color:rgba(255,148,54,0.72) !important;">
                &#127915; #${esc(tid)}
              </button>
              ${statusBadge}
            </div>

            ${thumbHtml}

            <div style="font-size:0.94rem;font-weight:800;color:#ffffff;line-height:1.25;">
              ${esc(q.projectName || 'Custom Apparel Order')}
            </div>
            <div style="font-size:0.76rem;color:#9ef3ff;margin-top:3px;">
              ${esc(q.clientLabel || 'Valued Client')}
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);">
              <div>
                <div style="font-size:0.66rem;color:rgba(255,255,255,0.62);text-transform:uppercase;">${q.totalShirts} Items &bull; ${esc(q.savedAtFormatted || '')}</div>
                <div style="font-family:'Orbitron',sans-serif;font-size:0.98rem;font-weight:900;color:${q.isPaid ? '#22f59b' : '#ff9d3b'};margin-top:2px;">
                  ${money(q.isPaid && q.totalPaidUsd ? q.totalPaidUsd : q.customerQuoteTotal)}
                </div>
              </div>
              ${q.netProfitUsd != null ? `
                <div style="text-align:right;">
                  <div style="font-size:0.64rem;color:rgba(255,255,255,0.6);text-transform:uppercase;">Your Net Profit</div>
                  <div style="font-size:0.86rem;font-weight:800;color:#22f59b;">${q.netProfitUsd >= 0 ? '+' : ''}${money(q.netProfitUsd)}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:4px;border-top:1px solid rgba(255,255,255,0.1);">
            <button type="button" class="mini-btn" data-vault-open-ticket="${esc(tid)}" style="flex:1;padding:6px 10px;font-size:0.71rem;color:#ffd099;border-color:rgba(255,148,54,0.7) !important;font-weight:700;">
              &#128194; Open Project
            </button>
            <a href="${esc(clientDossierUrl)}" target="_blank" rel="noopener noreferrer" class="mini-btn" style="padding:6px 10px;font-size:0.71rem;color:#6bffc3;text-decoration:none;border-color:rgba(34,245,155,0.5) !important;">
              &#128065;&#65039; Sent Quote &nearr;
            </a>
            <button type="button" class="mini-btn" data-vault-copy-link="${esc(tid)}" style="padding:6px 10px;font-size:0.71rem;color:#9ef3ff;">
              &#128279; Copy Link
            </button>
            ${!q.isPaid ? `
              <a href="${esc(stripePortalUrl)}" target="_blank" rel="noopener noreferrer" class="mini-btn" style="padding:6px 9px;font-size:0.71rem;color:#ffe89e;text-decoration:none;" title="Open Stripe Checkout">&#128179;</a>
              <button type="button" class="mini-btn" data-vault-delete-ticket="${esc(tid)}" style="padding:6px 9px;font-size:0.71rem;color:#ff85b3;" title="Delete Saved Quote">&times;</button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderSavedQuotesList() {
    const el = document.getElementById('bqSavedQuotesList');
    if (!el) return;
    const list = getMergedVaultQuotes();
    if (list.length === 0) {
      el.innerHTML = `<div style="font-size:0.75rem;color:rgba(255,255,255,0.58);">No saved bulk quotes yet. Click <strong>"Save Quote to Vault"</strong> above to store a project ticket.</div>`;
      return;
    }

    el.innerHTML = list.slice(0, 12).map((q) => {
      const tid = q.ticketId || q.quoteId;
      const badge = q.isPaid
        ? `<span style="padding:2px 8px;border-radius:999px;background:rgba(34,245,155,0.2);border:1px solid #22f59b;color:#6bffc3;font-size:0.65rem;font-weight:800;margin-left:6px;">&#10003; PAID</span>`
        : `<span style="padding:2px 8px;border-radius:999px;background:rgba(255,148,54,0.16);border:1px solid rgba(255,148,54,0.55);color:#ffd099;font-size:0.65rem;font-weight:700;margin-left:6px;">AWAITING PAYMENT</span>`;
      return `
        <div class="bq-saved-quote-row">
          <div>
            <strong style="color:#ffd099;font-family:'Orbitron',sans-serif;font-size:0.73rem;">#${esc(tid)}</strong>
            <strong style="color:#ffb36b;margin-left:6px;">${esc(q.projectName || 'Custom Apparel Order')}</strong>
            <span style="font-size:0.73rem;color:#2ce6ff;margin-left:6px;">${esc(q.clientLabel || '')}</span>
            ${badge}
            <div style="font-size:0.7rem;color:rgba(255,255,255,0.68);margin-top:2px;">
              ${q.totalShirts} items &bull; Total: <strong style="color:#22f59b;">${money(q.customerQuoteTotal)}</strong>${q.netProfitUsd != null ? ` (Profit: ${q.netProfitUsd >= 0 ? '+' : ''}${money(q.netProfitUsd)})` : ''} &bull; ${esc(q.savedAtFormatted || '')}
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button type="button" class="mini-btn" data-load-quote="${esc(tid)}" style="padding:5px 10px;font-size:0.7rem;color:#ffb36b;">&#128194; Load Ticket</button>
            <a href="${esc(getClientQuoteDossierUrl(tid))}" target="_blank" class="mini-btn" style="padding:5px 10px;font-size:0.7rem;color:#6bffc3;text-decoration:none;">&#128065;&#65039; Quote &nearr;</a>
            ${!q.isPaid ? `<button type="button" class="mini-btn" data-delete-quote="${esc(tid)}" style="padding:5px 9px;font-size:0.7rem;color:#ff85b3;">&times;</button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  async function saveCurrentQuote() {
    const calc = state.lastCalculation;
    if (!calc || calc.totalShirts === 0) {
      alert('Enter at least 1 item before saving a quote.');
      return;
    }
    triggerAutoSaveCustomer();
    const tid = state.activeQuoteId || mintFreshQuoteId();
    const list = getSavedQuotes().filter((q) => (q.quoteId || q.ticketId) !== tid);
    const entry = {
      quoteId: tid,
      ticketId: tid,
      savedAtFormatted: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      projectName: state.customer.projectName || state.customer.companyOrTeam || 'Custom Bulk Order',
      clientLabel: [state.customer.fullName, state.customer.companyOrTeam].filter(Boolean).join(' • '),
      totalShirts: calc.totalShirts,
      totalHardCostUsd: calc.totalHardCostUsd,
      customerQuoteTotal: calc.customerQuoteTotal,
      netProfitUsd: calc.netProfitUsd,
      projectedPreviewJpeg: calc.projectedPreviewJpeg || '',
      snapshot: buildCurrentProjectSnapshot()
    };
    list.unshift(entry);
    try {
      localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(list.slice(0, 50)));
    } catch (_) {}

    const saveBtn = document.getElementById('bqSaveQuoteBtn');
    const prevLbl = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) saveBtn.innerHTML = '&#9203; Saving to Vault...';
    await syncQuoteToStripeCloudNow(calc, { isExplicitSave: true });
    if (saveBtn) {
      saveBtn.innerHTML = `&#10003; Saved #${esc(tid)}!`;
      setTimeout(() => { saveBtn.innerHTML = prevLbl; }, 2200);
    }
    renderSavedQuotesList();
    renderSavedQuotesVaultGrid();
  }

  function applyProjectSnapshotToStudio(ticketId, snap, paidInfo = null) {
    if (!snap) return;
    if (ticketId) {
      state.activeQuoteId = ticketId;
      try { sessionStorage.setItem(ACTIVE_QUOTE_ID_KEY, ticketId); } catch (_) {}
    }
    state.activeQuotePaidInfo = paidInfo;

    if (snap.customer) state.customer = JSON.parse(JSON.stringify(snap.customer));
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

    if (Array.isArray(snap.garmentLines) && snap.garmentLines.length > 0) {
      state.garmentLines = snap.garmentLines.map((gl) => ({
        ...gl,
        quantities: Object.assign(makeEmptyQtyMap(), gl.quantities || {})
      }));
    }
    if (Array.isArray(snap.dtfPlacements) && snap.dtfPlacements.length > 0) {
      state.dtfPlacements = snap.dtfPlacements.map((dp) => ({
        ...dp,
        dataUrl: dp.thumbDataUrl || '',
        trimmedDataUrl: dp.thumbDataUrl || '',
        origCanvas: null,
        trimmedCanvas: null,
        renderCanvas: null
      }));
      // Rehydrate saved placement artwork thumbnails onto canvases asynchronously!
      state.dtfPlacements.forEach((p) => {
        if (p.thumbDataUrl) {
          const im = new Image();
          im.onload = () => {
            const trimmedCv = trimImageTransparentBoundsToCanvas(im, 24);
            p.origCanvas = trimmedCv;
            p.trimmedCanvas = trimmedCv;
            p.renderCanvas = trimmedCv;
            renderDtfPlacementsList();
            recalculateEverything();
          };
          im.src = p.thumbDataUrl;
        }
      });
    }

    syncTopControlsFromState();
    syncCustomerInputsFromState();
    renderGarmentLinesList();
    renderDtfPlacementsList();
    recalculateEverything();
  }

  async function openTicketInStudio(ticketId) {
    const cleanId = String(ticketId || '').trim();
    if (!cleanId) return;

    // Switch focus tab to Bulk Order Quoter Studio
    const focusBtn = document.querySelector('[data-focus-target="bulkquote"]');
    if (focusBtn) focusBtn.click();
    const studioSec = document.getElementById('bulkQuoteStudioSection');
    if (studioSec) studioSec.scrollIntoView({ behavior: 'smooth' });

    const localFound = getSavedQuotes().find((q) => (q.quoteId || q.ticketId) === cleanId);

    // Always check cloud as well so live paid status & cloud-saved snapshots load from any device!
    try {
      const res = await fetch(STRIPE_EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_quote_by_ticket',
          ticketId: cleanId,
          includeOwnerPrivate: true
        })
      });
      const data = await res.json();
      if (res.ok && data && data.ok) {
        const paidInfo = data.isPaid ? {
          isPaid: true,
          paidAt: data.paidAt,
          totalPaidUsd: data.totalPaidUsd
        } : null;
        const snap = (localFound && localFound.snapshot) || (data.quoteMeta && data.quoteMeta.projectSnapshot);
        if (snap) {
          applyProjectSnapshotToStudio(cleanId, snap, paidInfo);
          return;
        }
      }
    } catch (_) {}

    if (localFound && localFound.snapshot) {
      applyProjectSnapshotToStudio(cleanId, localFound.snapshot, null);
    }
  }

  async function deleteSavedTicketEverywhere(ticketId) {
    const cleanId = String(ticketId || '').trim();
    if (!cleanId) return;
    const filtered = getSavedQuotes().filter((q) => (q.quoteId || q.ticketId) !== cleanId);
    try { localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(filtered)); } catch (_) {}
    state.cloudSavedQuotes = (state.cloudSavedQuotes || []).filter((q) => (q.ticketId || q.quoteId) !== cleanId);
    renderSavedQuotesList();
    renderSavedQuotesVaultGrid();

    try {
      await fetch(STRIPE_EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_saved_quote', ticketId: cleanId })
      });
    } catch (_) {}
  }

  // Expose Public Studio Controller for Owner's Hub Paid Banners & Merch Queue Deep-Links
  window.RetroBulkQuoteStudio = {
    openTicketInStudio,
    refreshSavedQuotesVault: fetchAndRenderSavedQuotesVault,
    downloadGlossyQuoteJpg,
    getActiveTicketId: () => state.activeQuoteId
  };

  function buildCleanCustomerQuoteText() {
    const calc = state.lastCalculation;
    if (!calc || calc.totalShirts === 0) return 'No items in quote yet.';
    const tid = state.activeQuoteId || getOrInitActiveQuoteId();
    const c = state.customer;
    const proj = c.projectName || c.companyOrTeam || 'Custom Performance Apparel & Print Order';
    const out = [
      `======================================================================`,
      `RETROCANOPY — OFFICIAL ITEMIZED QUOTE & PROJECT DOSSIER`,
      `Project Ticket: #${tid}`,
      `Official Visual Quote & Stripe Approval Link: ${getPublicClientQuoteUrl(tid)}`,
      `Apparel • Websites • Marketing • Apps • Games • Custom 3D Prints`,
      `Project: ${proj}`,
      `Date:    ${new Date().toLocaleDateString()}`
    ];
    if (c.fullName || c.companyOrTeam) out.push(`Client:  ${[c.fullName, c.companyOrTeam].filter(Boolean).join(' — ')}`);
    if (c.phone || c.email) out.push(`Contact: ${[c.phone, c.email].filter(Boolean).join(' • ')}`);
    if (c.address) out.push(`Address: ${c.address}`);

    if (calc.itemDescriptions && calc.itemDescriptions.length > 0) {
      out.push(`----------------------------------------------------------------------`);
      out.push(`ITEM DESCRIPTIONS & SPECIFICATIONS:`);
      calc.itemDescriptions.forEach((d) => {
        out.push(`• ${d.brand} ${d.styleCode} (#${d.itemNumber}) — ${d.colorName}: ${d.description}`);
      });
    }

    out.push(`----------------------------------------------------------------------`);
    out.push(`OVERALL BREAKDOWN PER ITEM:`);
    calc.itemOverallGroups.forEach((g) => {
      const avgUsed = calc.discountPct > 0 ? g.avgPerItemAfterDiscount : g.avgPerItemPreDiscount;
      const subUsed = calc.discountPct > 0 ? g.groupSubtotalAfterDiscount : g.groupSubtotalPreDiscount;
      out.push(`• ${g.brand} ${g.styleBadge} (${g.colorName}) — ${g.totalQty} pcs [${g.sizeBreakdownStr}] | Avg: ${money(avgUsed)}/item | Group Total: ${money(subUsed)}`);
    });

    out.push(`----------------------------------------------------------------------`);
    out.push(`LINE-BY-LINE ITEMIZATION:`);
    calc.itemizedLines.forEach((r) => {
      out.push(`Line ${r.lineNumber}: ${r.brand} ${r.styleCode} — ${r.colorName} — Size ${r.sizeName} | ${r.printSpecSummary} | Qty: ${r.qty} × ${money(r.unitPriceQuoted)} = ${money(r.lineTotalQuoted)}`);
    });

    out.push(`----------------------------------------------------------------------`);
    out.push(`Items Subtotal (${calc.totalShirts} items @ ${money(calc.avgItemPreDiscount)}/item): ${money(calc.subtotalBeforeDiscount)}`);
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
    out.push(`View Full Quote & Pay Online (Stripe): ${getPublicClientQuoteUrl(tid)}`);
    out.push(`======================================================================`);
    return out.join('\n');
  }

  function printCustomerQuoteSheet() {
    const calc = state.lastCalculation;
    if (!calc || calc.totalShirts === 0) {
      alert('Enter item quantities in Step 1 before generating the Official Quote / Receipt PDF.');
      return;
    }

    // Immediately sync the quote to Supabase so the QR code opens Live Stripe Checkout for the exact penny amount
    syncQuoteToStripeCloudNow(calc);

    const logoUrl = getAssetUrl('assets/logo.png');
    const projectedMockupUrl = calc.projectedMockupUrl || renderProjectedFinishedItemDataUrl(calc);
    const quoteNumber = state.activeQuoteId || getOrInitActiveQuoteId();
    const stripePayUrl = getQuoteStripePortalUrl(calc);
    const stripeQrDataUrl = calc.stripeQrDataUrl || renderStripeQrDataUrl(stripePayUrl, 280);

    const c = state.customer;
    const issueDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const validUntilDate = new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const clientHeadline = [c.fullName, c.companyOrTeam].filter(Boolean).join(' — ') || 'Valued Client';
    const proj = c.projectName || c.companyOrTeam || 'Custom Performance Apparel & Print Order';
    const contactLine = [c.phone, c.email, c.address].filter(Boolean).join(' • ');

    const getTierKey = (r) => r.isPrintOnly ? 'print' : (r.isYouth ? 'youth' : 'adult');
    const rowsHtml = calc.itemizedLines.map((row, idx) => {
      const prev = idx > 0 ? calc.itemizedLines[idx - 1] : null;
      const needsOrangeRule = prev && (getTierKey(prev) !== getTierKey(row) || prev.lineId !== row.lineId);
      const topBorderCss = needsOrangeRule ? 'border-top: 1.5px solid #ff8824;' : '';
      const garmentLabel = row.isPrintOnly
        ? 'Custom DTF Transfer Only ($0 Blank)'
        : `${row.brand} ${row.styleCode} — ${row.colorName}`;
      const sizeDisplay = row.isPrintOnly
        ? 'PRINT ONLY'
        : (row.isYouth ? row.sizeName.replace(/^Y/, 'Youth ') : (row.sizeName === 'S' ? 'Adult S' : row.sizeName));

      return `
        <tr>
          <td style="${topBorderCss}padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.09);text-align:center;color:#cbd5e1;font-weight:600;">${row.lineNumber}</td>
          <td style="${topBorderCss}padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.09);">
            <span style="display:inline-flex;align-items:center;gap:7px;">
              <i style="width:10px;height:10px;border-radius:50%;background:${esc(row.colorHex)};border:1px solid rgba(255,255,255,0.55);display:inline-block;"></i>
              <strong style="color:#ffffff;">${esc(garmentLabel)}</strong>
            </span>
            <div style="font-size:10px;color:#ffd8b0;margin-top:2px;">${esc(row.garmentTitle)} &bull; ${esc(row.specs || '')}</div>
          </td>
          <td style="${topBorderCss}padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.09);color:#e2e8f0;font-size:11.5px;">${esc(row.printSpecSummary || 'Blank Garment')}</td>
          <td style="${topBorderCss}padding:8px 8px;border-bottom:1px solid rgba(255,255,255,0.09);text-align:center;font-weight:700;color:${row.isPrintOnly ? '#ff9d3b' : '#ffffff'};">${esc(sizeDisplay)}</td>
          <td style="${topBorderCss}padding:8px 8px;border-bottom:1px solid rgba(255,255,255,0.09);text-align:center;font-weight:700;color:#ffffff;">${row.qty}</td>
          <td style="${topBorderCss}padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.09);text-align:right;font-weight:600;color:#f8fafc;">${money(row.unitPriceQuoted)}</td>
          <td style="${topBorderCss}padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.09);text-align:right;font-weight:800;color:#ffffff;">${money(row.lineTotalQuoted)}</td>
        </tr>
      `;
    }).join('');

    const miniGroupPdfHtml = calc.itemOverallGroups.map((g) => {
      const avgUsed = calc.discountPct > 0 ? g.avgPerItemAfterDiscount : g.avgPerItemPreDiscount;
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:4px 8px;border-radius:7px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);margin-top:4px;">
          <span style="color:#f1f5f9;"><strong>${esc(g.brand)} ${esc(g.styleBadge)}</strong> (${esc(g.colorName)})</span>
          <span style="color:#ffb36b;font-weight:700;">${g.totalQty} pcs &bull; ${money(avgUsed)}/ea</span>
        </div>
      `;
    }).join('');

    const primaryStyleCode = state.garmentLines[0]?.styleCode || 'TT11';
    const activeColorSet = new Set(state.garmentLines.map((l) => l.colorName));
    const ssColors = getColorsForStyle(primaryStyleCode);
    const orbsPdfHtml = ssColors.map((col) => `
      <span title="${esc(col.name)}" style="display:inline-block;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55) 0%, ${esc(col.hex)} 45%, #09080c 100%);border:${activeColorSet.has(col.name) ? '2px solid #ff9436' : '1px solid rgba(255,255,255,0.38)'};box-shadow:inset -2px -3px 5px rgba(0,0,0,0.5);margin:2px;"></span>
    `).join('');

    const colorNamesLegend = ssColors.map((col) => col.name).join(' • ');

    const w = window.open('', '_blank', 'width=1020,height=940');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>RetroCanopy Official Quote #${esc(quoteNumber)} — ${esc(proj)}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        @page { size: letter portrait; margin: 0.28in; }
        body {
          font-family: 'Outfit', 'Segoe UI', system-ui, sans-serif;
          color: #ffffff;
          background: #07060a;
          padding: 18px;
          margin: 0;
          line-height: 1.38;
        }
        .sheet {
          max-width: 880px;
          margin: 0 auto;
          background:
            radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px) 0 0 / 7px 7px,
            linear-gradient(180deg, #121118 0%, #09080c 100%);
          border: 1.5px solid #ff8624;
          border-radius: 22px;
          padding: 18px 20px;
          box-shadow: 0 0 32px rgba(255, 106, 0, 0.22);
        }
        .header-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          background: linear-gradient(135deg, #34323d 0%, #15141c 52%, #1d1618 100%);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 16px;
          padding: 14px 20px;
        }
        .brand-wordmark {
          font-family: 'Orbitron', sans-serif;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 0.06em;
          color: #ff9432;
        }
        .cap-pill {
          margin-top: 10px;
          padding: 8px 16px;
          border-radius: 999px;
          border: 1.5px solid #ff8624;
          background: linear-gradient(90deg, rgba(255,112,16,0.16), #141219 50%, rgba(255,112,16,0.16));
          text-align: center;
          font-size: 12.5px;
          font-weight: 600;
          color: #ffffff;
        }
        .client-pill {
          margin-top: 8px;
          padding: 8px 16px;
          border-radius: 12px;
          border: 1.5px solid rgba(255,134,36,0.78);
          background: #131218;
          text-align: center;
          font-size: 12px;
          color: #f8fafc;
        }
        .mid-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
        }
        .glass-box {
          background: linear-gradient(165deg, #22212a 0%, #131218 100%);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 16px;
          padding: 13px 14px;
        }
        .sec-title {
          text-align: center;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #ffffff;
          margin-bottom: 9px;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }
        .kpi-tile {
          background: linear-gradient(180deg, #271a12 0%, #141010 100%);
          border: 1.5px solid #ff8824;
          border-radius: 12px;
          padding: 11px 8px;
          text-align: center;
        }
        .kpi-val {
          font-size: 22px;
          font-weight: 800;
          color: #ff9d3b;
          line-height: 1.1;
        }
        .kpi-lbl {
          font-size: 11px;
          color: #e2e8f0;
          margin-top: 3px;
        }
        .table-card {
          margin-top: 12px;
          background: linear-gradient(180deg, #201f28 0%, #111016 100%);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 16px;
          padding: 12px 0 4px;
          overflow: hidden;
        }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead th {
          padding: 8px 10px;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          border-top: 1px solid rgba(255,255,255,0.14);
          border-bottom: 2px solid #ff8824;
          text-align: left;
        }
        .bottom-grid {
          display: grid;
          grid-template-columns: ${state.includeAvailableColorsOnPdf ? '1fr 1.18fr' : '1fr'};
          gap: 12px;
          margin-top: 12px;
          page-break-inside: avoid;
        }
        .totals-qr-split {
          display: grid;
          grid-template-columns: 132px 1fr;
          gap: 12px;
          align-items: center;
        }
        .qr-frame {
          background: #17110e;
          border: 1.5px solid #ff8824;
          border-radius: 12px;
          padding: 8px;
          text-align: center;
        }
        .disc-pill {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1.5px solid #ff8824;
          background: #23160e;
          font-size: 12px;
          font-weight: 600;
          margin: 5px 0;
        }
        .grand-pill {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1.5px solid #ff9436;
          background: linear-gradient(90deg, #3a1d0a 0%, #241207 50%, #3a1d0a 100%);
          margin-top: 7px;
        }
        @media print {
          body { padding: 0; background: #09080c; }
          .no-print { display: none !important; }
          .sheet { max-width: 100%; box-shadow: none; }
        }
      </style>
    </head><body>
      <div class="no-print" style="max-width:880px;margin:0 auto 12px;display:flex;justify-content:space-between;align-items:center;gap:12px;background:#17110e;color:#f8fafc;padding:10px 16px;border-radius:12px;border:1px solid #ff8824;">
        <span style="font-size:12.5px;">&#128293; <strong>Official Quote #${esc(quoteNumber)} Ready</strong> (Enable <em>Background Graphics</em> when saving to PDF) &bull; Live Stripe QR Embedded!</span>
        <div style="display:flex;gap:8px;">
          <a href="${esc(stripePayUrl)}" target="_blank" style="padding:8px 14px;background:#1f2937;color:#67e8f9;border:1px solid #2ce6ff;border-radius:8px;font-weight:700;text-decoration:none;font-size:12px;">&#128179; Test Stripe Link</a>
          <button onclick="window.print()" style="padding:8px 18px;background:linear-gradient(135deg,#ff8c24,#ff5e00);color:#ffffff;border:none;border-radius:8px;font-weight:800;cursor:pointer;font-size:12.5px;">&#128424; Print / Save Official PDF</button>
        </div>
      </div>

      <div class="sheet">
        <!-- TIER 1: HEADER -->
        <div class="header-card">
          <div style="display:flex;align-items:center;gap:14px;">
            <img src="${esc(logoUrl)}" alt="RetroCanopy Logo" style="width:62px;height:62px;object-fit:contain;">
            <div class="brand-wordmark">RETROCANOPY</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:'Orbitron',sans-serif;font-size:19px;font-weight:800;letter-spacing:0.05em;">OFFICIAL QUOTE</div>
            <div style="font-size:12px;color:#e2e8f0;margin-top:3px;">
              <a href="${esc(getPublicClientQuoteUrl(quoteNumber))}" target="_blank" style="color:#ffd099;font-weight:800;text-decoration:underline;">TICKET #${esc(quoteNumber)}</a>
              &bull; Issued ${esc(issueDate)} &bull; Valid Until ${esc(validUntilDate)}
            </div>
          </div>
        </div>

        <!-- TIER 2: 6 CAPABILITIES BAR -->
        <div class="cap-pill">
          ${STUDIO_CAPABILITIES.map((cap) => esc(cap)).join(' &bull; ')}
        </div>

        <!-- TIER 3: CLIENT & PROJECT BAR -->
        <div class="client-pill">
          <strong style="color:#ffd089;">PREPARED FOR:</strong> ${esc(clientHeadline)}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong style="color:#ffd089;">PROJECT:</strong> ${esc(proj)}
          ${contactLine ? `&nbsp;&nbsp;|&nbsp;&nbsp;<span style="color:#cbd5e1;">${esc(contactLine)}</span>` : ''}
          ${c.notes ? `<div style="margin-top:4px;font-size:11px;color:#ffd089;"><strong>Notes:</strong> ${esc(c.notes)}</div>` : ''}
        </div>

        <!-- TIER 4: PROJECTED FINISHED ITEM + OVERALL BREAKDOWN PER ITEM -->
        <div class="mid-grid">
          <div class="glass-box" style="display:flex;flex-direction:column;justify-content:space-between;">
            <div class="sec-title">PROJECTED FINISHED ITEM</div>
            <img src="${projectedMockupUrl}" alt="Projected Finished Item" style="width:100%;max-height:235px;object-fit:contain;border-radius:10px;display:block;margin:0 auto;">
          </div>

          <div class="glass-box" style="display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div class="sec-title">OVERALL BREAKDOWN PER ITEM</div>
              <div class="kpi-grid">
                <div class="kpi-tile">
                  <div class="kpi-val">${calc.totalShirts}</div>
                  <div class="kpi-lbl">Total Items</div>
                </div>
                <div class="kpi-tile">
                  <div class="kpi-val">${money(calc.avgItemPreDiscount)}</div>
                  <div class="kpi-lbl">Base/Item</div>
                </div>
                <div class="kpi-tile">
                  <div class="kpi-val">${calc.discountPct}%</div>
                  <div class="kpi-lbl">${calc.discountPct > 0 ? esc(calc.discountLabel || 'Discount') : 'Discount'}</div>
                </div>
                <div class="kpi-tile">
                  <div class="kpi-val">${money(calc.avgItemAllInFinal)}</div>
                  <div class="kpi-lbl">Final/Item</div>
                </div>
              </div>
            </div>
            ${miniGroupPdfHtml ? `<div style="margin-top:6px;">${miniGroupPdfHtml}</div>` : ''}
          </div>
        </div>

        <!-- TIER 4.5: ITEM DESCRIPTION & SPECIFICATIONS -->
        ${(calc.itemDescriptions && calc.itemDescriptions.length > 0) ? `
          <div class="glass-box" style="margin-top:10px;">
            <div class="sec-title" style="margin-bottom:6px;">ITEM DESCRIPTION &amp; GARMENT SPECIFICATIONS</div>
            ${calc.itemDescriptions.map((d) => `
              <div style="padding:7px 10px;border-radius:9px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,136,36,0.35);margin-top:5px;">
                <div style="font-size:11.5px;font-weight:800;color:#ffd099;">${esc(d.brand)} ${esc(d.styleCode)} (Item #${esc(d.itemNumber)}) — ${esc(d.colorName)}</div>
                <div style="font-size:10.8px;color:#e2e8f0;margin-top:2px;line-height:1.38;">${esc(d.description)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- TIER 5: LINE-BY-LINE ITEMIZED BREAKDOWN -->
        <div class="table-card">
          <div class="sec-title" style="margin-bottom:7px;">ITEMIZED QUOTE BREAKDOWN (LINE BY LINE)</div>
          <table>
            <thead>
              <tr>
                <th style="width:44px;text-align:center;">Line</th>
                <th>Garment &amp; Color</th>
                <th>Print Specs</th>
                <th style="text-align:center;width:86px;">Size</th>
                <th style="text-align:center;width:54px;">Qty</th>
                <th style="text-align:right;width:88px;">Unit Price</th>
                <th style="text-align:right;width:96px;">Line Total</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>

        <!-- TIER 6: AVAILABLE S&S COLORS + LIVE STRIPE QR & GRAND TOTAL -->
        <div class="bottom-grid">
          ${state.includeAvailableColorsOnPdf ? `
            <div class="glass-box">
              <div class="sec-title" style="margin-bottom:4px;">AVAILABLE S&amp;S COLORS</div>
              <div style="text-align:center;font-size:10.5px;color:#ffd089;margin-bottom:6px;">
                ${esc((SS_CATALOG[primaryStyleCode] || SS_CATALOG.TT11).brand)} ${esc(primaryStyleCode)} (${ssColors.length} Official Colors)
              </div>
              <div style="text-align:center;line-height:1.1;">${orbsPdfHtml}</div>
              <div style="margin-top:6px;font-size:9px;color:#94a3b8;text-align:center;line-height:1.3;">${esc(colorNamesLegend)}</div>
            </div>
          ` : ''}

          <div class="glass-box">
            <div class="totals-qr-split">
              <div class="qr-frame">
                <a href="${esc(stripePayUrl)}" target="_blank" style="text-decoration:none;">
                  <img src="${stripeQrDataUrl}" alt="Stripe Checkout QR" style="width:104px;height:104px;border-radius:6px;display:block;margin:0 auto;background:#fff;">
                </a>
                <div style="font-family:'Orbitron',sans-serif;font-size:9px;font-weight:800;color:#ffb36b;margin-top:5px;letter-spacing:0.04em;">SCAN TO PAY</div>
                <a href="${esc(stripePayUrl)}" target="_blank" style="font-size:9px;color:#67e8f9;text-decoration:underline;">Stripe Checkout &nearr;</a>
              </div>

              <div>
                <div style="display:flex;justify-content:space-between;padding:3px 6px;font-size:13px;color:#f1f5f9;">
                  <span>Subtotal:</span>
                  <strong>${money(calc.subtotalBeforeDiscount)}</strong>
                </div>
                <div class="disc-pill">
                  <span>${calc.discountPct}% OFF ${esc(calc.discountLabel || 'Discount')}:</span>
                  <strong style="color:#ff9d3b;">${calc.discountAmountUsd > 0 ? '&minus;' + money(calc.discountAmountUsd) : '$0.00'}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;padding:3px 6px;font-size:12.5px;color:#f1f5f9;">
                  <span>${calc.includeTax ? `Tax Included (${calc.taxRatePct.toFixed(2)}%):` : 'Tax Excluded:'}</span>
                  <strong>${money(calc.taxAmountUsd)}</strong>
                </div>
                <div class="grand-pill">
                  <span style="font-family:'Orbitron',sans-serif;font-size:13px;font-weight:800;color:#ffffff;">GRAND TOTAL:</span>
                  <span style="font-family:'Orbitron',sans-serif;font-size:17px;font-weight:900;color:#ff9d3b;">${money(calc.customerQuoteTotal)}</span>
                </div>
              </div>
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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => {
          if (r && ((r.active && String(r.active.scriptURL).includes('botpit_sw')) || String(r.scope).endsWith('/'))) {
            r.unregister().catch(() => {});
          }
        });
      }).catch(() => {});
    }
    const root = document.getElementById('bulkQuoteStudioSection');
    if (!root) return;

    preloadBlankShirtAssets();
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
    renderSavedQuotesVaultGrid();
    recalculateEverything();

    syncLiveSupplierPricing(false);
    fetchAndRenderSavedQuotesVault(true);

    // Poll live paid quote confirmations every 12 seconds while Owner's Hub is open
    setInterval(() => {
      fetchAndRenderSavedQuotesVault(true);
    }, 12000);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTab = urlParams.get('tab');
      const urlTicket = (urlParams.get('ticket') || urlParams.get('q') || '').trim();
      if (urlTicket) {
        setTimeout(() => { openTicketInStudio(urlTicket); }, 120);
      } else if (urlTab === 'savedquotes' || window.location.hash === '#savedquotes') {
        const sqBtn = document.querySelector('[data-focus-target="savedquotes"]');
        if (sqBtn) sqBtn.click();
      } else if (urlTab === 'bulkquote' || window.location.hash === '#bulkquote') {
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
        const existingLocs = new Set(state.dtfPlacements.map((x) => (x.locationLabel || '').toLowerCase()));
        const nextPreset = !existingLocs.has('top of the back')
          ? { loc: 'Top of the Back', aw: 10.5, ah: 4.0, yw: 8.0, yh: 3.0 }
          : (!existingLocs.has('across the chest')
            ? { loc: 'Across the Chest', aw: 10.5, ah: 4.5, yw: 8.0, yh: 3.5 }
            : { loc: `Sleeve / Extra Location #${state.dtfPlacements.length + 1}`, aw: 3.0, ah: 3.0, yw: 2.25, yh: 2.25 });
        state.dtfPlacements.push({
          id: 'dtf_' + (dtfCounter++),
          enabled: true,
          locationLabel: nextPreset.loc,
          adultWidthIn: nextPreset.aw,
          adultHeightIn: nextPreset.ah,
          youthWidthIn: nextPreset.yw,
          youthHeightIn: nextPreset.yh,
          lockToPresetBox: true,
          autoTrimTransparent: true,
          fileName: '',
          dataUrl: '',
          trimmedDataUrl: '',
          origCanvas: null,
          trimmedCanvas: null,
          renderCanvas: null,
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
    if (expPngBtn) expPngBtn.addEventListener('click', exportAllPackedGangsheets300DpiPng);

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

    const newQIdBtn = document.getElementById('bqNewQuoteIdBtn');
    if (newQIdBtn) {
      newQIdBtn.addEventListener('click', () => {
        state.activeQuoteId = mintFreshQuoteId();
        recalculateEverything();
      });
    }

    const openVaultFromStudioBtn = document.getElementById('bqOpenSavedVaultFromStudioBtn');
    if (openVaultFromStudioBtn) {
      openVaultFromStudioBtn.addEventListener('click', () => {
        const sqTab = document.querySelector('[data-focus-target="savedquotes"]');
        if (sqTab) sqTab.click();
        const sqSec = document.getElementById('savedQuotesVaultSection');
        if (sqSec) sqSec.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const sendClientLinkBtn = document.getElementById('bqSendClientQuoteLinkBtn');
    if (sendClientLinkBtn) {
      sendClientLinkBtn.addEventListener('click', async () => {
        const calc = state.lastCalculation;
        if (!calc || calc.totalShirts === 0) {
          alert('Enter at least 1 item in Step 1 before generating a Client Quote Link.');
          return;
        }
        const orig = sendClientLinkBtn.innerHTML;
        sendClientLinkBtn.disabled = true;
        sendClientLinkBtn.innerHTML = '&#9203; Syncing Ticket...';
        await saveCurrentQuote();
        const link = getPublicClientQuoteUrl(state.activeQuoteId);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(link).catch(() => {});
        }
        sendClientLinkBtn.disabled = false;
        sendClientLinkBtn.innerHTML = '&#10003; Client Quote Link Copied!';
        setTimeout(() => { sendClientLinkBtn.innerHTML = orig; }, 2500);
      });
    }

    const previewClientQuoteBtn = document.getElementById('bqPreviewClientQuoteBtn');
    if (previewClientQuoteBtn) {
      previewClientQuoteBtn.addEventListener('click', async () => {
        const calc = state.lastCalculation;
        if (!calc || calc.totalShirts === 0) {
          alert('Enter at least 1 item in Step 1 before previewing the Sent Client Quote.');
          return;
        }
        const orig = previewClientQuoteBtn.innerHTML;
        previewClientQuoteBtn.disabled = true;
        previewClientQuoteBtn.innerHTML = '&#9203; Opening...';
        await syncQuoteToStripeCloudNow(calc, { isExplicitSave: true });
        previewClientQuoteBtn.disabled = false;
        previewClientQuoteBtn.innerHTML = orig;
        window.open(getClientQuoteDossierUrl(state.activeQuoteId), '_blank', 'noopener');
      });
    }

    // Wire Dedicated Saved Quotes Vault Section Controls
    const vaultSection = document.getElementById('savedQuotesVaultSection');
    if (vaultSection) {
      vaultSection.addEventListener('click', async (ev) => {
        const filterBtn = ev.target.closest('[data-sq-filter]');
        if (filterBtn) {
          state.sqVaultFilter = filterBtn.getAttribute('data-sq-filter') || 'all';
          vaultSection.querySelectorAll('[data-sq-filter]').forEach((b) => b.classList.toggle('active', b === filterBtn));
          renderSavedQuotesVaultGrid();
          return;
        }

        const openTktBtn = ev.target.closest('[data-vault-open-ticket]');
        if (openTktBtn) {
          await openTicketInStudio(openTktBtn.getAttribute('data-vault-open-ticket'));
          return;
        }

        const copyLinkBtn = ev.target.closest('[data-vault-copy-link]');
        if (copyLinkBtn) {
          const tid = copyLinkBtn.getAttribute('data-vault-copy-link');
          const url = getPublicClientQuoteUrl(tid);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).catch(() => {});
          }
          const prev = copyLinkBtn.innerHTML;
          copyLinkBtn.innerHTML = '&#10003; Copied!';
          setTimeout(() => { copyLinkBtn.innerHTML = prev; }, 1800);
          return;
        }

        const delTktBtn = ev.target.closest('[data-vault-delete-ticket]');
        if (delTktBtn) {
          const tid = delTktBtn.getAttribute('data-vault-delete-ticket');
          if (confirm(`Delete saved quote Ticket #${tid}?`)) {
            await deleteSavedTicketEverywhere(tid);
          }
          return;
        }
      });

      const sqSearch = document.getElementById('sqVaultSearchInput');
      if (sqSearch) {
        sqSearch.addEventListener('input', () => {
          state.sqVaultSearch = sqSearch.value || '';
          renderSavedQuotesVaultGrid();
        });
      }

      const sqRefreshBtn = document.getElementById('sqRefreshCloudQuotesBtn');
      if (sqRefreshBtn) {
        sqRefreshBtn.addEventListener('click', () => fetchAndRenderSavedQuotesVault(false));
      }

      const sqNewBtn = document.getElementById('sqCreateNewQuoteBtn');
      if (sqNewBtn) {
        sqNewBtn.addEventListener('click', () => {
          state.activeQuoteId = mintFreshQuoteId();
          recalculateEverything();
          const bqTab = document.querySelector('[data-focus-target="bulkquote"]');
          if (bqTab) bqTab.click();
          const bqSec = document.getElementById('bulkQuoteStudioSection');
          if (bqSec) bqSec.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }

    const openStripeBtn = document.getElementById('bqOpenStripeQuoteBtn');
    if (openStripeBtn) {
      openStripeBtn.addEventListener('click', async () => {
        const calc = state.lastCalculation;
        if (!calc || calc.totalShirts === 0) {
          alert('Enter at least 1 item in Step 1 before opening Live Stripe Checkout.');
          return;
        }
        const origHtml = openStripeBtn.innerHTML;
        openStripeBtn.disabled = true;
        openStripeBtn.innerHTML = '&#9203; Syncing Stripe...';
        await syncQuoteToStripeCloudNow(calc);
        openStripeBtn.disabled = false;
        openStripeBtn.innerHTML = origHtml;
        window.open(getQuoteStripePortalUrl(calc), '_blank', 'noopener');
      });
    }

    const dlJpgBtn = document.getElementById('bqDownloadQuoteJpgBtn');
    if (dlJpgBtn) dlJpgBtn.addEventListener('click', downloadGlossyQuoteJpg);

    // Delegated 60fps pointer-tracking wet-glass reflection for on-screen Concept #1 Quote Sheet
    document.addEventListener('pointermove', (ev) => {
      const sheetEl = document.querySelector('#bqFinancialSummaryBox .c1-quote-sheet');
      if (!sheetEl) return;
      const r = sheetEl.getBoundingClientRect();
      if (ev.clientY < r.top - 120 || ev.clientY > r.bottom + 120) return;
      const mx = ((ev.clientX - r.left) / Math.max(1, r.width)) * 100;
      const my = ((ev.clientY - r.top) / Math.max(1, r.height)) * 100;
      sheetEl.style.setProperty('--mx', `${mx.toFixed(1)}%`);
      sheetEl.style.setProperty('--my', `${my.toFixed(1)}%`);
    }, { passive: true });

    const printQBtn = document.getElementById('bqPrintQuoteBtn');
    if (printQBtn) printQBtn.addEventListener('click', printCustomerQuoteSheet);

    // Delegated Clicks
    root.addEventListener('click', (e) => {
      const singleDlBtn = e.target.closest('[data-download-single-sheet]');
      if (singleDlBtn) {
        const idx = parseInt(singleDlBtn.getAttribute('data-download-single-sheet'), 10);
        if (!Number.isNaN(idx)) downloadSingleSheetByIndex(idx);
        return;
      }

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
        openTicketInStudio(loadQ.getAttribute('data-load-quote'));
        return;
      }

      const delQ = e.target.closest('[data-delete-quote]');
      if (delQ) {
        const qId = delQ.getAttribute('data-delete-quote');
        deleteSavedTicketEverywhere(qId);
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

      if (t.hasAttribute('data-dtf-preset-select')) {
        const id = t.getAttribute('data-dtf-preset-select');
        const p = state.dtfPlacements.find((x) => x.id === id);
        const found = DTF_PLACEMENT_PRESETS.find((pr) => pr.loc === t.value);
        if (p && found) {
          p.locationLabel = found.loc;
          p.adultWidthIn = found.aw;
          p.adultHeightIn = found.ah;
          p.youthWidthIn = found.yw;
          p.youthHeightIn = found.yh;
          p.enabled = true;
          renderDtfPlacementsList();
          recalculateEverything();
        }
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
          p.renderCanvas = p.autoTrimTransparent ? (p.trimmedCanvas || p.origCanvas) : (p.origCanvas || p.trimmedCanvas);
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
