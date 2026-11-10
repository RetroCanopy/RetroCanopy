/**
 * RetroCanopy Owner's Hub — Bulk Order Quoting & Live Gangsheet Nesting Studio
 * Suppliers:
 *   1. S&S Activewear (ssactivewear.com)
 *      - Short Sleeve Dri-Fit: Team 365 Style # TT11 (Item # 671D9) — 30 Official Colors, XS–6XL
 *      - Long Sleeve Dri-Fit:  CORE365 Style # CE10L (Item # 267A7) — 16 Official Colors, XS–6XL
 *   2. DigitalPrintWorx (digitalprintworx.com)
 *      - Live real-time gang sheet pricing via Supabase Edge Function `retrocanopy-bulk-quote-lookup`
 *      - 2D Gangsheet Packing + Dynamic Programming Minimum-Cost Sheet Combination Optimizer
 *      - Project DTF Artwork Upload (auto-reads px, 300 DPI inches, & transparent trim bounds) + 300 DPI Gangsheet Export
 */
(function () {
  'use strict';

  const EDGE_LOOKUP_URL = 'https://axavvrqyzpwsczpiwmua.supabase.co/functions/v1/retrocanopy-bulk-quote-lookup';
  const SAVED_QUOTES_KEY = 'rc_owner_bulk_quotes_v1';
  const SS_CREDS_KEY = 'rc_owner_ss_api_creds_v1';

  const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];

  // Official S&S Activewear Verified Catalog (Styles TT11 / 671D9 & CE10L / 267A7)
  const SS_CATALOG = {
    TT11: {
      styleCode: 'TT11',
      itemNumber: '671D9',
      brand: 'Team 365',
      shortLabel: 'Dri-Fit Short Sleeve (TT11 • #671D9)',
      fullName: "Team 365 Men's Zone Performance Short Sleeve T-Shirt",
      specs: '3.5 oz./yd², 100% Polyester Interlock • Moisture-Wicking • UPF 40+ • Cationic Dyes',
      productUrl: 'https://www.ssactivewear.com/p/team_365/tt11',
      basePrices: {
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
      itemNumber: '267A7',
      brand: 'CORE365',
      shortLabel: 'Dri-Fit Long Sleeve (CE10L • #267A7)',
      fullName: 'CORE365 Unisex Capital Performance Long Sleeve T-Shirt',
      specs: '4.0 oz./yd² (140 gsm), 100% Polyester Interlock • Moisture-Wicking • UPF 50+ • Tear-Away Label',
      productUrl: 'https://www.ssactivewear.com/p/core365/ce10l',
      basePrices: {
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

  // DigitalPrintWorx.com Default Gang Sheet Tiers (Updated Live via Edge Function)
  let dpwSheets = [
    { id: 'dpw_27x15_auto', label: '27" × 15" Auto-Builder Sheet', widthIn: 27, lengthIn: 15, priceUsd: 7.00, productUrl: 'https://digitalprintworx.com/products/auto-builder-22x15-22x96', builderType: 'auto', liveVerified: false },
    { id: 'dpw_27x24', label: '27" × 24" Gang Sheet', widthIn: 27, lengthIn: 24, priceUsd: 12.00, productUrl: 'https://digitalprintworx.com/products/upload-your-own-gang-sheet-22x24', builderType: 'upload', liveVerified: false },
    { id: 'dpw_27x36', label: '27" × 36" Gang Sheet', widthIn: 27, lengthIn: 36, priceUsd: 18.00, productUrl: 'https://digitalprintworx.com/products/upload-your-own-gang-sheet-22x36', builderType: 'upload', liveVerified: false },
    { id: 'dpw_27x48', label: '27" × 48" Gang Sheet', widthIn: 27, lengthIn: 48, priceUsd: 23.00, productUrl: 'https://digitalprintworx.com/products/upload-your-own-gang-sheet-22x48', builderType: 'upload', liveVerified: false },
    { id: 'dpw_27x60', label: '27" × 60" Gang Sheet', widthIn: 27, lengthIn: 60, priceUsd: 27.00, productUrl: 'https://digitalprintworx.com/products/upload-your-own-gang-sheet-22x60', builderType: 'upload', liveVerified: false },
    { id: 'dpw_27x96', label: '27" × 96" Gang Sheet', widthIn: 27, lengthIn: 96, priceUsd: 40.50, productUrl: 'https://digitalprintworx.com/products/upload-your-own-gang-sheet-22x96', builderType: 'upload', liveVerified: false },
    { id: 'dpw_22x60_std', label: '22" × 60" Standard DTF Sheet', widthIn: 22, lengthIn: 60, priceUsd: 27.00, productUrl: 'https://digitalprintworx.com/products/22-x-60-dtf-gang-sheet-print', builderType: 'standard22', liveVerified: false }
  ];

  // Live S&S API data (when owner connects Account # + API Key)
  let liveSSData = null;

  // State for Current Bulk Quote
  const state = {
    projectName: '',
    clientName: '',
    clientContact: '',
    ssDiscountPct: 0, // Optional wholesale account % discount off public S&S piece price
    rollWidthMode: '27', // '27' (DigitalPrintWorx 27" wide-format) or '22' (22" standard)
    includeAutoBuilder15: true, // Include 27"x15" ($7) in optimizer
    gutterIn: 0.25, // 0.25" spacing between transfers
    extraSpoilagePrints: 1, // Extra spare transfers per placement
    pressLaborPerShirt: 1.50, // Pressing/handling cost per garment
    ssShippingOverride: '', // Blank = auto ($0 if >= $200 else $14.95)
    dpwShippingUsd: 9.95, // Estimated DTF shipping ($0 if local pickup)
    pricingMode: 'margin', // 'margin' (Target Margin %) or 'fixed' (Fixed Base Retail Price XS-XL)
    targetMarginPct: 50, // 50% gross margin (2.0x markup)
    fixedRetailBasePrice: 22.00, // Used when pricingMode === 'fixed'
    garmentLines: [
      {
        id: 'line_1',
        styleCode: 'TT11',
        colorName: 'Black',
        quantities: { XS: 0, S: 4, M: 8, L: 8, XL: 4, '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0, '6XL': 0 }
      }
    ],
    dtfPlacements: [
      {
        id: 'dtf_1',
        locationLabel: 'Front Chest / Full Front',
        widthIn: 10.5,
        heightIn: 11.5,
        lockAspect: true,
        aspectRatio: 10.5 / 11.5,
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
  let dtfCounter = 2;

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

  // Get effective unit blank cost for a style, color, and size
  function getBlankUnitPrice(styleCode, colorName, sizeName) {
    const discMultiplier = Math.max(0, 1 - (Number(state.ssDiscountPct) || 0) / 100);
    if (liveSSData && liveSSData[styleCode] && liveSSData[styleCode].colors && liveSSData[styleCode].colors[colorName]) {
      const szObj = liveSSData[styleCode].colors[colorName].sizes[sizeName];
      if (szObj && szObj.price > 0) {
        return +(szObj.price * discMultiplier).toFixed(2);
      }
    }
    const cat = SS_CATALOG[styleCode] || SS_CATALOG.TT11;
    const base = cat.basePrices[sizeName] != null ? cat.basePrices[sizeName] : 8.30;
    return +(base * discMultiplier).toFixed(2);
  }

  function getLiveStockBadge(styleCode, colorName, sizeName) {
    if (liveSSData && liveSSData[styleCode] && liveSSData[styleCode].colors && liveSSData[styleCode].colors[colorName]) {
      const szObj = liveSSData[styleCode].colors[colorName].sizes[sizeName];
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

  // =========================================================================
  // 2D SHELF GANGSHEET PACKER + DYNAMIC PROGRAMMING OPTIMAL SHEET SOLVER
  // =========================================================================
  function packRectanglesOnRoll(rollWidthIn, gutterIn, itemsToPack) {
    // Usable printable width leaving 0.25" safe margin on left/right edges
    const edgeMargin = 0.25;
    const usableWidth = Math.max(4, rollWidthIn - edgeMargin * 2);

    // Expand individual print instances and orient each for tightest height/packing
    const instances = [];
    itemsToPack.forEach((p, pIdx) => {
      const w0 = Math.max(0.5, Number(p.widthIn) || 1);
      const h0 = Math.max(0.5, Number(p.heightIn) || 1);

      // Evaluate 0° vs 90° orientation to maximize items per row (minimize linear inches per item)
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

      // Clamp if user entered width wider than roll
      const clampedW = Math.min(usableWidth, bestW);
      const clampedH = bestH;

      for (let i = 0; i < p.count; i++) {
        instances.push({
          placementId: p.id,
          placementIdx: pIdx,
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

    // Sort by height descending (First-Fit Decreasing Height / FFDH 2D strip packing)
    instances.sort((a, b) => b.h - a.h || b.w - a.w);

    // Shelves: { y, height, usedX, boxes: [] }
    const shelves = [];
    instances.forEach((inst) => {
      let placed = false;
      // Try existing shelves where inst fits width-wise and height <= shelf.height
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

    // Filter candidate sheets from DigitalPrintWorx
    let candidates = dpwSheets.filter((s) => {
      if (rollWidthMode === '22') return s.widthIn === 22;
      if (s.widthIn !== 27) return false;
      if (!includeAutoBuilder15 && s.builderType === 'auto') return false;
      return true;
    });

    if (candidates.length === 0) {
      candidates = [dpwSheets[4]];
    }

    // Because physical sheets cannot cut a print shelf in half across two separate sheets,
    // we assign whole shelves sequentially to sheets using exact DP over shelf index!
    const N = shelves.length;
    const edgeMargin = 0.25;
    const gutter = Number(state.gutterIn) || 0.25;

    // dp[i] = min cost to pack shelves[i..N-1]
    const dp = new Array(N + 1).fill(Infinity);
    const choice = new Array(N + 1).fill(null);
    dp[N] = 0;

    for (let i = N - 1; i >= 0; i--) {
      for (const sheet of candidates) {
        // How many consecutive shelves starting at i fit onto `sheet.lengthIn`?
        let usedLen = edgeMargin * 2;
        let j = i;
        while (j < N) {
          const addH = (j === i ? 0 : gutter) + shelves[j].height;
          if (usedLen + addH <= sheet.lengthIn + 1e-6) {
            usedLen += addH;
            j++;
          } else {
            break;
          }
        }
        // Even if a single print is taller than the smallest sheet, allow at least 1 shelf on the largest sheet
        if (j === i) {
          const maxSheetLen = Math.max(...candidates.map((c) => c.lengthIn));
          if (sheet.lengthIn === maxSheetLen && shelves[i].height > sheet.lengthIn - edgeMargin * 2) {
            usedLen = shelves[i].height + edgeMargin * 2;
            j = i + 1;
          } else {
            continue;
          }
        }

        const candCost = sheet.priceUsd + dp[j];
        if (candCost < dp[i] - 1e-6) {
          dp[i] = candCost;
          choice[i] = { sheet, nextIdx: j, usedLinearIn: usedLen };
        }
      }
    }

    // Reconstruct optimal sheet list & group identical sheets for clean ordering summary
    const sheetAssignments = [];
    let cur = 0;
    while (cur < N && choice[cur]) {
      const step = choice[cur];
      const sliceShelves = shelves.slice(cur, step.nextIdx);
      // Re-anchor Y coordinates inside this individual physical sheet
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

      sheetAssignments.push({
        sheet: step.sheet,
        usedLinearIn: step.usedLinearIn,
        freeLinearIn: Math.max(0, step.sheet.lengthIn - step.usedLinearIn),
        boxes: localBoxes
      });
      cur = step.nextIdx;
    }

    // Aggregate counts by sheet ID
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
  // IMAGE / TRANSPARENT BOUNDING BOX ANALYZER FOR UPLOADED DTF ARTWORK
  // =========================================================================
  function analyzeUploadedArtwork(file, placement) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = String(ev.target.result || '');
      const img = new Image();
      img.onload = () => {
        const origW = img.naturalWidth || img.width || 1200;
        const origH = img.naturalHeight || img.height || 1200;

        // Scan alpha channel to find non-transparent ink bounding box
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
              const alpha = imgData[(y * sw + x) * 4 + 3];
              if (alpha > 12) {
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

        // Create cropped preview dataUrl for tight gangsheet rendering
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

        const useW = placement.autoTrimTransparent ? trimPxW : origW;
        const useH = placement.autoTrimTransparent ? trimPxH : origH;

        // Calculate physical inches assuming 300 DPI (clamped to sensible range 1.5" - 22")
        let inW = +(useW / 300).toFixed(2);
        let inH = +(useH / 300).toFixed(2);
        if (inW < 1.0 || inW > 26.5) {
          // Normalize to 10.5" wide if SVG or non-300DPI web graphic
          const ratio = useW / Math.max(1, useH);
          inW = 10.5;
          inH = +(10.5 / ratio).toFixed(2);
        }

        placement.widthIn = inW;
        placement.heightIn = inH;
        placement.aspectRatio = useW / Math.max(1, useH);

        renderDtfPlacementsList();
        recalculateEverything();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  // =========================================================================
  // FULL QUOTE FINANCIAL & GANGSHEET CALCULATION
  // =========================================================================
  function recalculateEverything() {
    // 1. Calculate Blank Garment Totals from S&S Activewear Matrix
    let totalShirts = 0;
    let blanksSubtotal = 0;
    const lineSummaries = [];

    state.garmentLines.forEach((line) => {
      const cat = SS_CATALOG[line.styleCode] || SS_CATALOG.TT11;
      let lineQty = 0;
      let lineCost = 0;
      const sizeBreakdowns = [];

      ALL_SIZES.forEach((sz) => {
        const q = Math.max(0, parseInt(line.quantities[sz], 10) || 0);
        const unitCost = getBlankUnitPrice(line.styleCode, line.colorName, sz);
        if (q > 0) {
          const sub = +(q * unitCost).toFixed(2);
          lineQty += q;
          lineCost += sub;
          sizeBreakdowns.push({ size: sz, qty: q, unitCost, subtotal: sub });
        }
      });

      lineCost = +lineCost.toFixed(2);
      totalShirts += lineQty;
      blanksSubtotal += lineCost;

      // Update row badge DOM directly so typing in size inputs never loses focus
      const rowQtyEl = document.getElementById(`bqLineQty_${line.id}`);
      const rowSubEl = document.getElementById(`bqLineSub_${line.id}`);
      if (rowQtyEl) rowQtyEl.textContent = `${lineQty} pcs`;
      if (rowSubEl) rowSubEl.textContent = money(lineCost);

      lineSummaries.push({
        lineId: line.id,
        styleCode: line.styleCode,
        itemNumber: cat.itemNumber,
        brand: cat.brand,
        styleTitle: cat.fullName,
        productUrl: cat.productUrl,
        colorName: line.colorName,
        lineQty,
        lineCost,
        sizeBreakdowns
      });
    });

    blanksSubtotal = +blanksSubtotal.toFixed(2);

    // 2. Pack DTF Transfers onto Gangsheet
    const printCountPerPlacement = totalShirts > 0
      ? totalShirts + Math.max(0, parseInt(state.extraSpoilagePrints, 10) || 0)
      : 0;

    const rollWidthNum = state.rollWidthMode === '22' ? 22 : 27;
    const itemsToPack = printCountPerPlacement > 0
      ? state.dtfPlacements.map((p) => ({
          id: p.id,
          locationLabel: p.locationLabel,
          widthIn: Math.max(0.5, Number(p.widthIn) || 1),
          heightIn: Math.max(0.5, Number(p.heightIn) || 1),
          count: printCountPerPlacement,
          imgElement: p.imgElement
        }))
      : [];

    const packRes = packRectanglesOnRoll(rollWidthNum, Math.max(0, Number(state.gutterIn) || 0.25), itemsToPack);
    const sheetSolution = solveOptimalGangSheets(packRes.shelves, state.rollWidthMode, state.includeAutoBuilder15);

    // 3. Shipping & Labor Costs
    let ssShippingUsd = 0;
    if (totalShirts > 0) {
      if (String(state.ssShippingOverride).trim() !== '') {
        ssShippingUsd = Math.max(0, Number(state.ssShippingOverride) || 0);
      } else {
        // S&S Activewear standard $200+ free freight threshold
        ssShippingUsd = blanksSubtotal >= 200 ? 0 : 14.95;
      }
    }

    const dpwShippingUsd = (totalShirts > 0 && sheetSolution.totalDtfCost > 0)
      ? Math.max(0, Number(state.dpwShippingUsd) || 0)
      : 0;

    const totalPressLaborUsd = +(totalShirts * Math.max(0, Number(state.pressLaborPerShirt) || 0)).toFixed(2);

    const totalHardCostUsd = +(
      blanksSubtotal +
      ssShippingUsd +
      sheetSolution.totalDtfCost +
      dpwShippingUsd +
      totalPressLaborUsd
    ).toFixed(2);

    const avgCostPerShirt = totalShirts > 0 ? totalHardCostUsd / totalShirts : 0;
    const dtfCostPerShirt = totalShirts > 0 ? sheetSolution.totalDtfCost / totalShirts : 0;
    const blankAvgPerShirt = totalShirts > 0 ? blanksSubtotal / totalShirts : 0;

    // 4. Customer Quoted Price & Net Profit Calculation
    const marginFrac = Math.min(0.92, Math.max(0.0, (Number(state.targetMarginPct) || 0) / 100));
    let customerQuoteTotal = 0;
    const customerLineQuotes = [];

    // Distribute non-blank costs (DTF + shipping + labor) evenly per shirt so extended sizes accurately pass through their exact blank upcharge!
    const nonBlankPerShirtCost = totalShirts > 0
      ? (ssShippingUsd + sheetSolution.totalDtfCost + dpwShippingUsd + totalPressLaborUsd) / totalShirts
      : 0;

    lineSummaries.forEach((ls) => {
      if (ls.lineQty === 0) return;
      const quotedSizes = ls.sizeBreakdowns.map((sb) => {
        const unitTrueCost = sb.unitCost + nonBlankPerShirtCost;
        let unitCustomerPrice = 0;
        if (state.pricingMode === 'fixed') {
          // Base price for XS-XL + S&S extended-size differential
          const cat = SS_CATALOG[ls.styleCode] || SS_CATALOG.TT11;
          const sizeUpcharge = Math.max(0, (cat.basePrices[sb.size] || cat.basePrices.L) - cat.basePrices.L);
          unitCustomerPrice = +(Math.max(0, Number(state.fixedRetailBasePrice) || 0) + sizeUpcharge).toFixed(2);
        } else {
          unitCustomerPrice = +(unitTrueCost / Math.max(0.08, 1 - marginFrac)).toFixed(2);
        }
        const subQuote = +(unitCustomerPrice * sb.qty).toFixed(2);
        customerQuoteTotal += subQuote;
        return {
          ...sb,
          unitTrueCost: +unitTrueCost.toFixed(2),
          unitCustomerPrice,
          subQuote
        };
      });
      customerLineQuotes.push({
        ...ls,
        quotedSizes
      });
    });

    customerQuoteTotal = +customerQuoteTotal.toFixed(2);
    const netProfitUsd = +(customerQuoteTotal - totalHardCostUsd).toFixed(2);
    const actualMarginPct = customerQuoteTotal > 0 ? (netProfitUsd / customerQuoteTotal) * 100 : 0;
    const avgQuotePerShirt = totalShirts > 0 ? customerQuoteTotal / totalShirts : 0;

    state.lastCalculation = {
      totalShirts,
      printCountPerPlacement,
      blanksSubtotal,
      blankAvgPerShirt,
      ssShippingUsd,
      dpwShippingUsd,
      totalPressLaborUsd,
      dtfCostPerShirt,
      totalHardCostUsd,
      avgCostPerShirt,
      customerQuoteTotal,
      avgQuotePerShirt,
      netProfitUsd,
      actualMarginPct,
      packRes,
      sheetSolution,
      lineSummaries,
      customerLineQuotes
    };

    renderSummaryAndCanvas();
  }

  // =========================================================================
  // RENDER GANGSHEET BLUEPRINT CANVAS + SUMMARY DOM
  // =========================================================================
  function renderSummaryAndCanvas() {
    const calc = state.lastCalculation;
    if (!calc) return;

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    // Top KPI Pills
    setTxt('bqKpiTotalShirts', String(calc.totalShirts));
    setTxt('bqKpiBlanksCost', money(calc.blanksSubtotal));
    setTxt('bqKpiDtfCost', money(calc.sheetSolution.totalDtfCost));
    setTxt('bqKpiHardCostPerShirt', `${money(calc.avgCostPerShirt)} / ea`);
    setTxt('bqKpiQuoteTotal', money(calc.customerQuoteTotal));
    setTxt('bqKpiNetProfit', `${money(calc.netProfitUsd)} (${calc.actualMarginPct.toFixed(1)}%)`);

    // Gangsheet Telemetry Badges
    setTxt(
      'bqGangsheetStatsLine',
      calc.totalShirts > 0
        ? `${calc.packRes.boxes.length} total transfers (${calc.printCountPerPlacement}/placement) • ${calc.packRes.totalLinearIn.toFixed(1)}" linear film needed on ${calc.packRes.rollWidthIn}" roll • ${calc.sheetSolution.utilizationPct.toFixed(1)}% sheet fill (${calc.sheetSolution.freeRemainingLinearIn.toFixed(1)}" spare length left)`
        : 'Enter shirt quantities to pack your DTF transfers onto DigitalPrintWorx gangsheets.'
    );

    // Recommended DigitalPrintWorx Gang Sheets List
    const recEl = document.getElementById('bqRecommendedSheetsBox');
    if (recEl) {
      if (calc.sheetSolution.chosenSheets.length === 0) {
        recEl.innerHTML = `<div style="font-size:0.78rem;color:rgba(255,255,255,0.62);">Add at least 1 shirt above to calculate exact DigitalPrintWorx gangsheet sizes &amp; live pricing.</div>`;
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

    // Financial Breakdown Table
    const finEl = document.getElementById('bqFinancialBreakdownBody');
    if (finEl) {
      const ssShipNote = calc.blanksSubtotal >= 200 && String(state.ssShippingOverride).trim() === ''
        ? 'FREE ($200+ S&S Order)'
        : money(calc.ssShippingUsd);

      const lineRowsHtml = calc.customerLineQuotes.map((lq) => {
        const szSummary = lq.quotedSizes
          .map((s) => `${s.size}: ${s.qty} × ${money(s.unitCustomerPrice)} <span style="color:rgba(255,255,255,0.5);">(blank ${money(s.unitCost)})</span>`)
          .join(' &bull; ');
        const lineCustTotal = lq.quotedSizes.reduce((a, b) => a + b.subQuote, 0);
        return `
          <div class="bq-quote-item-card">
            <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;">
              <div>
                <strong style="color:#ffe89e;">${esc(lq.brand)} ${esc(lq.styleCode)} (Item #${esc(lq.itemNumber)}) — ${esc(lq.colorName)}</strong>
                <span style="font-size:0.74rem;color:#2ce6ff;margin-left:6px;">(${lq.lineQty} shirts)</span>
              </div>
              <div style="display:flex;gap:10px;align-items:center;">
                <a href="${esc(lq.productUrl)}" target="_blank" rel="noopener noreferrer" style="font-size:0.7rem;color:#2ce6ff;text-decoration:underline;">Open S&amp;S #${esc(lq.itemNumber)} &nearr;</a>
                <strong style="color:#22f59b;">Quote: ${money(lineCustTotal)}</strong>
              </div>
            </div>
            <div style="font-size:0.73rem;color:rgba(255,255,255,0.82);margin-top:4px;line-height:1.5;">${szSummary}</div>
          </div>
        `;
      }).join('');

      finEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;">
          ${lineRowsHtml || '<div style="font-size:0.78rem;color:rgba(255,255,255,0.6);">No shirt quantities entered yet.</div>'}
        </div>

        <div class="bq-cost-ledger">
          <div class="bq-ledger-row">
            <span>1. S&amp;S Activewear Blank Shirts (${calc.totalShirts} pcs avg ${money(calc.blankAvgPerShirt)}/ea)</span>
            <strong>${money(calc.blanksSubtotal)}</strong>
          </div>
          <div class="bq-ledger-row">
            <span>2. S&amp;S Blank Freight / Shipping</span>
            <strong>${ssShipNote}</strong>
          </div>
          <div class="bq-ledger-row">
            <span>3. DigitalPrintWorx DTF Gangsheets (${calc.sheetSolution.sheetAssignments.length} sheet${calc.sheetSolution.sheetAssignments.length === 1 ? '' : 's'} &bull; ${money(calc.dtfCostPerShirt)}/shirt)</span>
            <strong>${money(calc.sheetSolution.totalDtfCost)}</strong>
          </div>
          <div class="bq-ledger-row">
            <span>4. DigitalPrintWorx DTF Shipping</span>
            <strong>${money(calc.dpwShippingUsd)}</strong>
          </div>
          <div class="bq-ledger-row">
            <span>5. Heat Press / Labor / Folding (${calc.totalShirts} &times; ${money(state.pressLaborPerShirt)})</span>
            <strong>${money(calc.totalPressLaborUsd)}</strong>
          </div>
          <div class="bq-ledger-row total-cost">
            <span>YOUR TOTAL WHOLESALE COST (${money(calc.avgCostPerShirt)} / shirt)</span>
            <strong>${money(calc.totalHardCostUsd)}</strong>
          </div>
          <div class="bq-ledger-row quote-price">
            <span>RECOMMENDED CUSTOMER QUOTE (${money(calc.avgQuotePerShirt)} avg / shirt)</span>
            <strong>${money(calc.customerQuoteTotal)}</strong>
          </div>
          <div class="bq-ledger-row net-profit">
            <span>YOUR ESTIMATED NET PROFIT (${calc.actualMarginPct.toFixed(1)}% Margin)</span>
            <strong>+${money(calc.netProfitUsd)}</strong>
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
      canvas.height = 200;
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

    // Render up to first 3 sheets side-by-side (or stacked cleanly) so even 200-shirt orders render crisply
    const maxPreviewSheets = Math.min(sheets.length, 3);
    const pxPerIn = 14; // 27" * 14 = 378px wide per sheet
    const pad = 26;
    const headerH = 28;
    const gapBetweenSheets = 22;

    const sheetWpx = Math.round(calc.packRes.rollWidthIn * pxPerIn);
    const maxHpx = Math.max(...sheets.slice(0, maxPreviewSheets).map((s) => Math.round(s.sheet.lengthIn * pxPerIn)));

    canvas.width = pad * 2 + maxPreviewSheets * sheetWpx + (maxPreviewSheets - 1) * gapBetweenSheets;
    canvas.height = pad * 2 + headerH + maxHpx + (sheets.length > maxPreviewSheets ? 26 : 6);

    ctx.fillStyle = '#0a0814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const paletteColors = [
      { stroke: '#f5c451', fill: 'rgba(245, 196, 81, 0.16)' },
      { stroke: '#2ce6ff', fill: 'rgba(44, 230, 255, 0.16)' },
      { stroke: '#ff4fa3', fill: 'rgba(255, 79, 163, 0.16)' },
      { stroke: '#22f59b', fill: 'rgba(34, 245, 155, 0.16)' }
    ];

    for (let sIdx = 0; sIdx < maxPreviewSheets; sIdx++) {
      const sa = sheets[sIdx];
      const ox = pad + sIdx * (sheetWpx + gapBetweenSheets);
      const oy = pad + headerH;
      const shW = Math.round(sa.sheet.widthIn * pxPerIn);
      const shH = Math.round(sa.sheet.lengthIn * pxPerIn);

      // Sheet Title Label
      ctx.fillStyle = '#ffe89e';
      ctx.font = '700 12px Orbitron, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`SHEET #${sIdx + 1}: ${sa.sheet.widthIn}" × ${sa.sheet.lengthIn}" ($${sa.sheet.priceUsd.toFixed(2)})`, ox, oy - 9);

      // Transparent Film Checkerboard Base
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

      // Free space highlight at bottom of sheet
      const usedPx = Math.min(shH, Math.round(sa.usedLinearIn * pxPerIn));
      if (shH - usedPx > 6) {
        ctx.fillStyle = 'rgba(34, 245, 155, 0.07)';
        ctx.fillRect(ox, oy + usedPx, shW, shH - usedPx);
        ctx.strokeStyle = 'rgba(34, 245, 155, 0.45)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ox, oy + usedPx);
        ctx.lineTo(ox + shW, oy + usedPx);
        ctx.stroke();
        ctx.setLineDash([]);
        if (shH - usedPx > 22) {
          ctx.fillStyle = '#22f59b';
          ctx.font = '600 11px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`+${sa.freeLinearIn.toFixed(1)}" Free Film Space Left`, ox + shW / 2, oy + usedPx + (shH - usedPx) / 2 + 4);
        }
      }

      // Draw each packed DTF graphic box
      sa.boxes.forEach((b) => {
        const bx = ox + b.x * pxPerIn;
        const by = oy + b.localY * pxPerIn;
        const bw = b.w * pxPerIn;
        const bh = b.h * pxPerIn;
        const pal = paletteColors[b.placementIdx % paletteColors.length];

        ctx.fillStyle = pal.fill;
        ctx.fillRect(bx, by, bw, bh);

        if (b.imgElement && b.imgElement.complete && b.imgElement.naturalWidth > 0) {
          ctx.save();
          if (b.rotated) {
            ctx.translate(bx + bw / 2, by + bh / 2);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(b.imgElement, -bh / 2 + 1, -bw / 2 + 1, Math.max(2, bh - 2), Math.max(2, bw - 2));
          } else {
            ctx.drawImage(b.imgElement, bx + 1, by + 1, Math.max(2, bw - 2), Math.max(2, bh - 2));
          }
          ctx.restore();
        } else if (bw > 28 && bh > 16) {
          ctx.fillStyle = 'rgba(255,255,255,0.82)';
          ctx.font = '600 9px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${b.origW}"×${b.origH}"`, bx + bw / 2, by + bh / 2 + 3);
        }

        ctx.strokeStyle = pal.stroke;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);
      });

      // Outer Roll Border
      ctx.strokeStyle = 'rgba(245, 196, 81, 0.78)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ox, oy, shW, shH);
    }

    if (sheets.length > maxPreviewSheets) {
      ctx.fillStyle = '#2ce6ff';
      ctx.font = '600 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`+ ${sheets.length - maxPreviewSheets} additional packed sheet(s) included in total above`, canvas.width / 2, canvas.height - 10);
    }
  }

  // Export Sheet #1 (or selected sheet) as an actual 300 DPI Transparent Gangsheet PNG!
  function exportPackedGangsheet300DpiPng() {
    const calc = state.lastCalculation;
    if (!calc || !calc.sheetSolution.sheetAssignments.length) {
      alert('Add shirt quantities and upload your DTF file first to generate a 300 DPI gangsheet.');
      return;
    }
    const hasUploadedArt = state.dtfPlacements.some((p) => p.imgElement);
    if (!hasUploadedArt) {
      alert('Please upload your project DTF artwork file (.PNG or .SVG) in Step 2 first so we can tile the actual 300 DPI graphic onto your gangsheet!');
      return;
    }

    const sa = calc.sheetSolution.sheetAssignments[0];
    // 300 DPI: e.g. 27" x 24" = 8100 x 7200 px (cap at 150-300 DPI safely inside browser canvas max 16384px)
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
        octx.drawImage(b.imgElement, -bh / 2, -bw / 2, bh, bw);
      } else {
        octx.drawImage(b.imgElement, bx, by, bw, bh);
      }
      octx.restore();
    });

    outCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanName = (state.projectName || 'RetroCanopy_BulkProject').replace(/[^a-zA-Z0-9_-]/g, '_');
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
  // RENDER GARMENT LINES (S&S ACTIVEWEAR TT11 / 671D9 & CE10L / 267A7)
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

      const sizesGridHtml = ALL_SIZES.map((sz) => {
        const unitP = getBlankUnitPrice(line.styleCode, line.colorName, sz);
        const qtyVal = line.quantities[sz] || 0;
        const liveStock = getLiveStockBadge(line.styleCode, line.colorName, sz);
        const stockTag = liveStock !== null
          ? `<span class="bq-stock-micro">${liveStock > 0 ? liveStock + ' stk' : '0 stk'}</span>`
          : '';
        return `
          <div class="bq-size-cell ${qtyVal > 0 ? 'has-qty' : ''}">
            <label class="bq-size-label">${sz}</label>
            <input type="number" min="0" max="9999" step="1" class="bq-size-input" data-line-id="${line.id}" data-size-key="${sz}" value="${qtyVal || ''}" placeholder="0">
            <span class="bq-size-price">${money(unitP)}</span>
            ${stockTag}
          </div>
        `;
      }).join('');

      return `
        <div class="bq-garment-line-card" data-line-card="${line.id}">
          <div class="bq-line-top-bar">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex:1;">
              <span class="bq-step-badge">#${idx + 1}</span>
              <select class="bq-select" data-line-style="${line.id}" style="min-width:270px;font-weight:700;">
                <option value="TT11" ${line.styleCode === 'TT11' ? 'selected' : ''}>Dri-Fit Short Sleeve — Style # TT11 (Item # 671D9)</option>
                <option value="CE10L" ${line.styleCode === 'CE10L' ? 'selected' : ''}>Dri-Fit Long Sleeve — Style # CE10L (Item # 267A7)</option>
              </select>

              <div style="display:flex;align-items:center;gap:7px;">
                <span class="bq-active-swatch-dot" style="background:${esc(activeColor.hex)};"></span>
                <select class="bq-select" data-line-color-select="${line.id}" style="min-width:175px;">
                  ${colorOptionsHtml}
                </select>
              </div>

              <a href="${esc(cat.productUrl)}" target="_blank" rel="noopener noreferrer" class="mini-btn" style="padding:5px 10px;font-size:0.68rem;text-decoration:none;color:#2ce6ff;">
                S&amp;S #${esc(cat.itemNumber)} &nearr;
              </a>
            </div>

            <div style="display:flex;align-items:center;gap:10px;">
              <span class="tag-pill" id="bqLineQty_${line.id}" style="background:rgba(44,230,255,0.16);color:#2ce6ff;border:1px solid rgba(44,230,255,0.4);">0 pcs</span>
              <strong id="bqLineSub_${line.id}" style="color:#ffe89e;font-size:0.92rem;">$0.00</strong>
              ${state.garmentLines.length > 1 ? `<button type="button" class="mini-btn" data-remove-line="${line.id}" style="padding:4px 9px;color:#ff85b3;border-color:rgba(255,79,163,0.45) !important;" title="Remove this shirt row">&times;</button>` : ''}
            </div>
          </div>

          <div style="font-size:0.72rem;color:rgba(255,255,255,0.68);margin:6px 0 8px;">
            <strong>${esc(cat.fullName)}</strong> &bull; ${esc(cat.specs)}
          </div>

          <div class="bq-swatch-strip" title="Click any official S&amp;S color swatch to select">
            ${swatchesHtml}
          </div>

          <div class="bq-sizes-grid">
            ${sizesGridHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // RENDER DTF UPLOAD & PLACEMENTS LIST
  // =========================================================================
  function renderDtfPlacementsList() {
    const container = document.getElementById('bqDtfPlacementsContainer');
    if (!container) return;

    const presets = [
      { label: 'Left Chest (3.5"×3.5")', w: 3.5, h: 3.5 },
      { label: 'Sleeve / Neck (3"×3")', w: 3.0, h: 3.0 },
      { label: 'Youth Front (8.5"×9.5")', w: 8.5, h: 9.5 },
      { label: 'Adult Front (10.5"×11.5")', w: 10.5, h: 11.5 },
      { label: 'Oversized Back (12"×14")', w: 12.0, h: 14.0 }
    ];

    container.innerHTML = state.dtfPlacements.map((p, idx) => {
      const previewUrl = p.autoTrimTransparent && p.trimmedDataUrl ? p.trimmedDataUrl : p.dataUrl;
      const metaInfo = p.fileName
        ? `<div style="font-size:0.71rem;color:#22f59b;margin-top:4px;">&#10003; <strong>${esc(p.fileName)}</strong> &bull; Raw: ${p.origPxW}&times;${p.origPxH}px${p.autoTrimTransparent ? ` &rarr; Trimmed Ink: ${p.trimPxW}&times;${p.trimPxH}px` : ''}</div>`
        : `<div style="font-size:0.71rem;color:rgba(255,255,255,0.6);margin-top:4px;">Upload your transparent 300 DPI <code>.PNG</code> or <code>.SVG</code> file to auto-detect exact print dimensions &amp; preview on gangsheet.</div>`;

      const presetButtons = presets.map((pr) =>
        `<button type="button" class="bq-preset-chip" data-dtf-preset="${p.id}" data-pw="${pr.w}" data-ph="${pr.h}">${pr.label}</button>`
      ).join('');

      return `
        <div class="bq-dtf-card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:8px;flex:1;">
              <span class="bq-step-badge" style="background:rgba(245,196,81,0.24);color:#ffe89e;border-color:rgba(245,196,81,0.6);">DTF #${idx + 1}</span>
              <input type="text" class="bq-input" data-dtf-label="${p.id}" value="${esc(p.locationLabel)}" placeholder="Placement (e.g. Front Chest, Full Back)" style="max-width:240px;font-weight:600;">
            </div>
            ${state.dtfPlacements.length > 1 ? `<button type="button" class="mini-btn" data-remove-dtf="${p.id}" style="padding:4px 9px;color:#ff85b3;">&times; Remove Placement</button>` : ''}
          </div>

          <div class="bq-dtf-split">
            <!-- Upload & Preview Box -->
            <label class="bq-upload-dropzone ${p.checkerboardBg ? 'checker-bg' : ''}" data-dropzone-id="${p.id}">
              <input type="file" accept=".png,.svg,.webp,.jpg,.jpeg,image/*" data-dtf-file="${p.id}" style="display:none;">
              ${previewUrl
                ? `<img src="${previewUrl}" alt="Uploaded DTF Artwork" class="bq-uploaded-art-img">
                   <span class="bq-reupload-pill">&#128194; Replace DTF File</span>`
                : `<div style="text-align:center;padding:12px;">
                     <div style="font-size:1.5rem;margin-bottom:4px;">&#128228;</div>
                     <div style="font-size:0.78rem;font-weight:700;color:#ffe89e;">Upload Project DTF File</div>
                     <div style="font-size:0.68rem;color:rgba(255,255,255,0.62);margin-top:2px;">Drag &amp; Drop or Click (.PNG / .SVG)</div>
                   </div>`
              }
            </label>

            <!-- Dimensions & Presets -->
            <div style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
              <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
                <div>
                  <label class="bq-field-lbl">Print Width (Inches)</label>
                  <input type="number" min="0.5" max="26.5" step="0.1" class="bq-input" data-dtf-w="${p.id}" value="${p.widthIn}" style="width:110px;font-weight:700;color:#ffe89e;">
                </div>
                <div style="padding-bottom:8px;color:rgba(255,255,255,0.5);font-weight:700;">&times;</div>
                <div>
                  <label class="bq-field-lbl">Print Height (Inches)</label>
                  <input type="number" min="0.5" max="95" step="0.1" class="bq-input" data-dtf-h="${p.id}" value="${p.heightIn}" style="width:110px;font-weight:700;color:#ffe89e;">
                </div>
                <label style="display:inline-flex;align-items:center;gap:5px;font-size:0.72rem;color:rgba(255,255,255,0.82);padding-bottom:8px;cursor:pointer;">
                  <input type="checkbox" data-dtf-lock="${p.id}" ${p.lockAspect ? 'checked' : ''}>
                  Lock Ratio
                </label>
                <label style="display:inline-flex;align-items:center;gap:5px;font-size:0.72rem;color:rgba(255,255,255,0.82);padding-bottom:8px;cursor:pointer;" title="Automatically crops empty transparent border around your PNG so you fit more logos per gangsheet!">
                  <input type="checkbox" data-dtf-trim="${p.id}" ${p.autoTrimTransparent ? 'checked' : ''}>
                  Auto-Trim Empty Margin
                </label>
                ${previewUrl ? `
                <label style="display:inline-flex;align-items:center;gap:5px;font-size:0.72rem;color:#2ce6ff;padding-bottom:8px;cursor:pointer;">
                  <input type="checkbox" data-dtf-checker="${p.id}" ${p.checkerboardBg ? 'checked' : ''}>
                  Transparency Grid
                </label>` : ''}
              </div>

              <div>
                <div class="bq-field-lbl" style="margin-bottom:4px;">Quick Standard Print Size Presets:</div>
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
  // LIVE SUPPLIER LOOKUP (DIGITALPRINTWORX.COM + S&S ACTIVEWEAR)
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
          styles: 'TT11,CE10L'
        })
      });

      const data = await resp.json();
      if (data && data.ok) {
        if (data.digitalPrintWorx && Array.isArray(data.digitalPrintWorx.sheets)) {
          dpwSheets = data.digitalPrintWorx.sheets;
        }
        let ssStatusText = 'S&S #671D9 / #267A7 Catalog Verified';
        if (data.ssActivewear && data.ssActivewear.connectedAccount && data.ssActivewear.products) {
          liveSSData = data.ssActivewear.products;
          ssStatusText = 'S&S Live Account API Connected (Stock + Account Tier)';
          renderGarmentLinesList();
        } else if (data.ssActivewear && data.ssActivewear.error && savedCreds.apiKey) {
          ssStatusText = `S&S API Warning: ${data.ssActivewear.error}`;
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
    } catch (err) {
      if (statusBadge) {
        statusBadge.textContent = 'Using verified cached S&S + DigitalPrintWorx rates (offline fallback)';
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
        ${s.liveVerified ? '<i class="bq-live-dot" title="Live verified from DigitalPrintWorx.com"></i>' : ''}
      </a>
    `).join('');
  }

  // =========================================================================
  // SAVED QUOTES HISTORY, COPY CLIENT QUOTE & PRINTABLE PROPOSAL
  // =========================================================================
  function getSavedQuotes() {
    try {
      const list = JSON.parse(localStorage.getItem(SAVED_QUOTES_KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }

  function renderSavedQuotesList() {
    const el = document.getElementById('bqSavedQuotesList');
    if (!el) return;
    const list = getSavedQuotes();
    if (list.length === 0) {
      el.innerHTML = `<div style="font-size:0.75rem;color:rgba(255,255,255,0.58);">No saved bulk quotes yet. Click <strong>"Save Quote"</strong> above to store a project quote for quick recall.</div>`;
      return;
    }

    el.innerHTML = list.map((q) => `
      <div class="bq-saved-quote-row">
        <div>
          <strong style="color:#ffe89e;">${esc(q.projectName || 'Untitled Bulk Quote')}</strong>
          <span style="font-size:0.73rem;color:#2ce6ff;margin-left:6px;">${esc(q.clientName || 'Walk-in / Custom Client')}</span>
          <div style="font-size:0.7rem;color:rgba(255,255,255,0.68);margin-top:2px;">
            ${q.totalShirts} shirts &bull; Cost: ${money(q.totalHardCostUsd)} &bull; Quoted: <strong style="color:#22f59b;">${money(q.customerQuoteTotal)}</strong> (Profit: +${money(q.netProfitUsd)}) &bull; ${esc(q.savedAtFormatted)}
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
    const list = getSavedQuotes();
    const entry = {
      quoteId: 'BQ-' + Math.floor(100000 + Math.random() * 900000),
      savedAtFormatted: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      projectName: state.projectName || 'Custom Dri-Fit Bulk Order',
      clientName: state.clientName || '',
      clientContact: state.clientContact || '',
      totalShirts: calc.totalShirts,
      totalHardCostUsd: calc.totalHardCostUsd,
      customerQuoteTotal: calc.customerQuoteTotal,
      netProfitUsd: calc.netProfitUsd,
      snapshot: {
        projectName: state.projectName,
        clientName: state.clientName,
        clientContact: state.clientContact,
        ssDiscountPct: state.ssDiscountPct,
        rollWidthMode: state.rollWidthMode,
        includeAutoBuilder15: state.includeAutoBuilder15,
        gutterIn: state.gutterIn,
        extraSpoilagePrints: state.extraSpoilagePrints,
        pressLaborPerShirt: state.pressLaborPerShirt,
        ssShippingOverride: state.ssShippingOverride,
        dpwShippingUsd: state.dpwShippingUsd,
        pricingMode: state.pricingMode,
        targetMarginPct: state.targetMarginPct,
        fixedRetailBasePrice: state.fixedRetailBasePrice,
        garmentLines: JSON.parse(JSON.stringify(state.garmentLines)),
        dtfPlacements: state.dtfPlacements.map((p) => ({
          id: p.id,
          locationLabel: p.locationLabel,
          widthIn: p.widthIn,
          heightIn: p.heightIn,
          lockAspect: p.lockAspect,
          aspectRatio: p.aspectRatio,
          autoTrimTransparent: p.autoTrimTransparent,
          fileName: p.fileName,
          origPxW: p.origPxW,
          origPxH: p.origPxH,
          trimPxW: p.trimPxW,
          trimPxH: p.trimPxH
        }))
      }
    };
    list.unshift(entry);
    try {
      localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(list.slice(0, 30)));
    } catch (_) {}
    renderSavedQuotesList();
  }

  function buildCleanCustomerQuoteText() {
    const calc = state.lastCalculation;
    if (!calc || calc.totalShirts === 0) return 'No items in quote yet.';
    const proj = state.projectName || 'Custom Dri-Fit Apparel Order';
    const client = state.clientName ? `Prepared For: ${state.clientName}${state.clientContact ? ' (' + state.clientContact + ')' : ''}\n` : '';
    const placementsDesc = state.dtfPlacements.map((p) => `${p.locationLabel} (${p.widthIn}" × ${p.heightIn}" Full-Color DTF)`).join(' + ');

    const linesTxt = calc.customerLineQuotes.map((lq, i) => {
      const szBreak = lq.quotedSizes.map((s) => `${s.size}: ${s.qty} @ ${money(s.unitCustomerPrice)}`).join(', ');
      const sub = lq.quotedSizes.reduce((a, b) => a + b.subQuote, 0);
      return `${i + 1}. ${lq.brand} ${lq.styleCode} (${lq.styleTitle}) — Color: ${lq.colorName}\n   Sizes (${lq.lineQty} pcs): ${szBreak}\n   Line Subtotal: ${money(sub)}`;
    }).join('\n\n');

    return [
      `RETROCANOPY CUSTOM APPAREL QUOTE — ${proj.toUpperCase()}`,
      `Date: ${new Date().toLocaleDateString()}`,
      client ? client.trim() : null,
      `Print Specs: ${placementsDesc}`,
      `--------------------------------------------------`,
      linesTxt,
      `--------------------------------------------------`,
      `TOTAL QUANTITY: ${calc.totalShirts} Custom Performance Shirts`,
      `QUOTED TOTAL:   ${money(calc.customerQuoteTotal)} (${money(calc.avgQuotePerShirt)} avg / shirt)`
    ].filter(Boolean).join('\n');
  }

  function printCustomerQuoteSheet() {
    const calc = state.lastCalculation;
    if (!calc || calc.totalShirts === 0) {
      alert('Add shirt quantities before printing a client quote.');
      return;
    }
    const proj = state.projectName || 'Custom Performance Apparel Quote';
    const placementsHtml = state.dtfPlacements.map((p) => `
      <div style="display:flex;align-items:center;gap:12px;border:1px solid #ddd;border-radius:8px;padding:8px 12px;">
        ${p.dataUrl ? `<img src="${p.trimmedDataUrl || p.dataUrl}" style="width:54px;height:54px;object-fit:contain;background:#111;border-radius:6px;padding:4px;">` : ''}
        <div>
          <strong>${esc(p.locationLabel)}</strong>
          <div style="font-size:12px;color:#555;">${p.widthIn}" W &times; ${p.heightIn}" H &bull; Stretchable Full-Color DTF Transfer</div>
        </div>
      </div>
    `).join('');

    const rowsHtml = calc.customerLineQuotes.map((lq) => {
      const sub = lq.quotedSizes.reduce((a, b) => a + b.subQuote, 0);
      const szList = lq.quotedSizes.map((s) => `${s.size} (${s.qty} &times; ${money(s.unitCustomerPrice)})`).join(', ');
      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
            <strong>${esc(lq.brand)} ${esc(lq.styleCode)}</strong> — ${esc(lq.styleTitle)}<br>
            <span style="font-size:12px;color:#555;">Color: <strong>${esc(lq.colorName)}</strong> &bull; S&amp;S Item #${esc(lq.itemNumber)}</span>
          </td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:13px;">${szList}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;">${lq.lineQty}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;">${money(sub)}</td>
        </tr>
      `;
    }).join('');

    const w = window.open('', '_blank', 'width=900,height=780');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>RetroCanopy Quote — ${esc(proj)}</title>
      <style>body{font-family:system-ui,-apple-system,sans-serif;color:#111;padding:36px;max-width:860px;margin:0 auto;} table{width:100%;border-collapse:collapse;margin-top:18px;} th{background:#111827;color:#fff;padding:10px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.06em;} @media print{.no-print{display:none;}}</style>
    </head><body>
      <div class="no-print" style="margin-bottom:18px;text-align:right;">
        <button onclick="window.print()" style="padding:8px 18px;background:#111827;color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Print / Save as PDF</button>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111827;padding-bottom:16px;">
        <div>
          <h1 style="margin:0;font-size:24px;letter-spacing:.04em;">RETROCANOPY CUSTOM APPAREL</h1>
          <div style="font-size:14px;color:#4b5563;margin-top:4px;">Official Bulk Order Proposal &bull; ${new Date().toLocaleDateString()}</div>
        </div>
        <div style="text-align:right;font-size:14px;">
          <strong>Project:</strong> ${esc(proj)}<br>
          ${state.clientName ? `<strong>Client:</strong> ${esc(state.clientName)}<br>` : ''}
          ${state.clientContact ? `<span>${esc(state.clientContact)}</span>` : ''}
        </div>
      </div>
      <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap;">${placementsHtml}</div>
      <table>
        <thead><tr><th>Garment &amp; Color</th><th>Sizes &amp; Unit Pricing</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Subtotal</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div style="margin-top:22px;display:flex;justify-content:flex-end;">
        <div style="min-width:290px;background:#f9fafb;border:1px solid #d1d5db;border-radius:10px;padding:16px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>Total Shirts:</span><strong>${calc.totalShirts} pcs</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>Avg Price / Shirt:</span><strong>${money(calc.avgQuotePerShirt)}</strong></div>
          <div style="display:flex;justify-content:space-between;font-size:18px;border-top:2px solid #111827;padding-top:8px;margin-top:8px;"><strong>QUOTE TOTAL:</strong><strong>${money(calc.customerQuoteTotal)}</strong></div>
        </div>
      </div>
    </body></html>`);
    w.document.close();
  }

  // =========================================================================
  // INITIALIZE UI & EVENT DELEGATION INSIDE #bulkQuoteStudioSection
  // =========================================================================
  function initBulkQuoteTool() {
    const root = document.getElementById('bulkQuoteStudioSection');
    if (!root) return;

    // Load saved S&S API credentials into drawer inputs if present
    try {
      const savedCreds = JSON.parse(localStorage.getItem(SS_CREDS_KEY) || '{}') || {};
      const acctEl = document.getElementById('bqSsAccountInput');
      const keyEl = document.getElementById('bqSsApiKeyInput');
      if (acctEl && savedCreds.accountNumber) acctEl.value = savedCreds.accountNumber;
      if (keyEl && savedCreds.apiKey) keyEl.value = savedCreds.apiKey;
    } catch (_) {}

    renderLiveDpwRateStrip();
    renderGarmentLinesList();
    renderDtfPlacementsList();
    renderSavedQuotesList();
    recalculateEverything();

    // Trigger live real-time price lookup from DigitalPrintWorx.com & S&S
    syncLiveSupplierPricing(false);

    // Support direct URL deep-link (?tab=bulkquote or #bulkquote)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tab') === 'bulkquote' || window.location.hash === '#bulkquote') {
        const focusBtn = document.querySelector('[data-focus-target="bulkquote"]');
        if (focusBtn) focusBtn.click();
      }
    } catch (_) {}

    // Add Shirt Row
    const addLineBtn = document.getElementById('bqAddGarmentLineBtn');
    if (addLineBtn) {
      addLineBtn.addEventListener('click', () => {
        state.garmentLines.push({
          id: 'line_' + (lineCounter++),
          styleCode: 'TT11',
          colorName: 'White',
          quantities: { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0, '6XL': 0 }
        });
        renderGarmentLinesList();
        recalculateEverything();
      });
    }

    // Add DTF Placement
    const addDtfBtn = document.getElementById('bqAddDtfPlacementBtn');
    if (addDtfBtn) {
      addDtfBtn.addEventListener('click', () => {
        state.dtfPlacements.push({
          id: 'dtf_' + (dtfCounter++),
          locationLabel: state.dtfPlacements.length === 1 ? 'Full Back / Second Location' : `Location #${state.dtfPlacements.length + 1}`,
          widthIn: 3.5,
          heightIn: 3.5,
          lockAspect: false,
          aspectRatio: 1,
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

    // Refresh Live Supplier Prices Button
    const refreshBtn = document.getElementById('bqRefreshLivePricesBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => syncLiveSupplierPricing(true));
    }

    // Connect S&S Wholesale Account API Button
    const saveSsCredsBtn = document.getElementById('bqSaveSsApiBtn');
    if (saveSsCredsBtn) {
      saveSsCredsBtn.addEventListener('click', () => {
        const accountNumber = (document.getElementById('bqSsAccountInput')?.value || '').trim();
        const apiKey = (document.getElementById('bqSsApiKeyInput')?.value || '').trim();
        localStorage.setItem(SS_CREDS_KEY, JSON.stringify({ accountNumber, apiKey }));
        syncLiveSupplierPricing(true);
      });
    }

    // Export 300 DPI Gangsheet PNG
    const expPngBtn = document.getElementById('bqExportGangsheetPngBtn');
    if (expPngBtn) {
      expPngBtn.addEventListener('click', exportPackedGangsheet300DpiPng);
    }

    // Save / Copy / Print Quote Buttons
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
        copyQBtn.innerHTML = '&#10003; Copied Client Quote!';
        setTimeout(() => { copyQBtn.innerHTML = orig; }, 2000);
      });
    }

    const printQBtn = document.getElementById('bqPrintQuoteBtn');
    if (printQBtn) printQBtn.addEventListener('click', printCustomerQuoteSheet);

    // Delegated Click Events inside Studio
    root.addEventListener('click', (e) => {
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
        const pw = parseFloat(presetBtn.getAttribute('data-pw'));
        const ph = parseFloat(presetBtn.getAttribute('data-ph'));
        const p = state.dtfPlacements.find((x) => x.id === id);
        if (p && !isNaN(pw) && !isNaN(ph)) {
          if (p.lockAspect && p.imgElement && p.aspectRatio > 0) {
            p.widthIn = pw;
            p.heightIn = +(pw / p.aspectRatio).toFixed(2);
          } else {
            p.widthIn = pw;
            p.heightIn = ph;
          }
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
          Object.assign(state, JSON.parse(JSON.stringify(found.snapshot)));
          syncTopControlsFromState();
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

    // Delegated Input & Change Events
    root.addEventListener('input', (e) => {
      const t = e.target;

      // Size Qty Input
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

      // Project & Pricing Settings
      if (t.id === 'bqProjectNameInput') state.projectName = t.value;
      else if (t.id === 'bqClientNameInput') state.clientName = t.value;
      else if (t.id === 'bqClientContactInput') state.clientContact = t.value;
      else if (t.id === 'bqSsDiscountInput') {
        state.ssDiscountPct = Math.min(80, Math.max(0, parseFloat(t.value) || 0));
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
        recalculateEverything();
      } else if (t.id === 'bqSsShippingInput') {
        state.ssShippingOverride = t.value;
        recalculateEverything();
      } else if (t.id === 'bqDpwShippingInput') {
        state.dpwShippingUsd = Math.max(0, parseFloat(t.value) || 0);
        recalculateEverything();
      } else if (t.id === 'bqMarginPctInput') {
        state.targetMarginPct = Math.min(90, Math.max(0, parseFloat(t.value) || 0));
        recalculateEverything();
      } else if (t.id === 'bqFixedRetailInput') {
        state.fixedRetailBasePrice = Math.max(0, parseFloat(t.value) || 0);
        recalculateEverything();
      }

      // DTF Placement Width / Height / Label
      if (t.hasAttribute('data-dtf-label')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-label'));
        if (p) {
          p.locationLabel = t.value;
          recalculateEverything();
        }
      } else if (t.hasAttribute('data-dtf-w')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-w'));
        if (p) {
          const nw = Math.max(0.5, parseFloat(t.value) || 0.5);
          p.widthIn = nw;
          if (p.lockAspect && p.aspectRatio > 0) {
            p.heightIn = +(nw / p.aspectRatio).toFixed(2);
            const hEl = root.querySelector(`[data-dtf-h="${p.id}"]`);
            if (hEl) hEl.value = p.heightIn;
          }
          recalculateEverything();
        }
      } else if (t.hasAttribute('data-dtf-h')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-h'));
        if (p) {
          const nh = Math.max(0.5, parseFloat(t.value) || 0.5);
          p.heightIn = nh;
          if (p.lockAspect && p.aspectRatio > 0) {
            p.widthIn = +(nh * p.aspectRatio).toFixed(2);
            const wEl = root.querySelector(`[data-dtf-w="${p.id}"]`);
            if (wEl) wEl.value = p.widthIn;
          }
          recalculateEverything();
        }
      }
    });

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
        if (p && file) {
          analyzeUploadedArtwork(file, p);
        }
        return;
      }

      if (t.hasAttribute('data-dtf-lock')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-lock'));
        if (p) {
          p.lockAspect = t.checked;
          if (p.lockAspect && p.heightIn > 0) p.aspectRatio = p.widthIn / p.heightIn;
        }
        return;
      }

      if (t.hasAttribute('data-dtf-trim')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-trim'));
        if (p) {
          p.autoTrimTransparent = t.checked;
          if (p.origImgElement) {
            p.imgElement = p.autoTrimTransparent ? (p.trimmedImgElement || p.origImgElement) : p.origImgElement;
            const useW = p.autoTrimTransparent ? p.trimPxW : p.origPxW;
            const useH = p.autoTrimTransparent ? p.trimPxH : p.origPxH;
            if (useW > 0 && useH > 0) {
              p.aspectRatio = useW / useH;
              p.widthIn = +(useW / 300).toFixed(2);
              p.heightIn = +(useH / 300).toFixed(2);
            }
          }
          renderDtfPlacementsList();
          recalculateEverything();
        }
        return;
      }

      if (t.hasAttribute('data-dtf-checker')) {
        const p = state.dtfPlacements.find((x) => x.id === t.getAttribute('data-dtf-checker'));
        if (p) {
          p.checkerboardBg = t.checked;
          renderDtfPlacementsList();
        }
        return;
      }

      if (t.id === 'bqRollWidthSelect') {
        state.rollWidthMode = t.value;
        recalculateEverything();
      } else if (t.id === 'bqIncludeAuto15Check') {
        state.includeAutoBuilder15 = t.checked;
        recalculateEverything();
      } else if (t.id === 'bqPricingModeSelect') {
        state.pricingMode = t.value;
        const mWrap = document.getElementById('bqMarginControlWrap');
        const fWrap = document.getElementById('bqFixedRetailControlWrap');
        if (mWrap) mWrap.style.display = state.pricingMode === 'margin' ? 'block' : 'none';
        if (fWrap) fWrap.style.display = state.pricingMode === 'fixed' ? 'block' : 'none';
        recalculateEverything();
      }
    });

    // Drag & Drop Artwork onto Dropzones
    root.addEventListener('dragover', (e) => {
      const dz = e.target.closest('[data-dropzone-id]');
      if (dz) {
        e.preventDefault();
        dz.classList.add('drag-hover');
      }
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
      if (p && file) {
        analyzeUploadedArtwork(file, p);
      }
    });
  }

  function syncTopControlsFromState() {
    const setV = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };
    setV('bqProjectNameInput', state.projectName || '');
    setV('bqClientNameInput', state.clientName || '');
    setV('bqClientContactInput', state.clientContact || '');
    setV('bqSsDiscountInput', state.ssDiscountPct || 0);
    setV('bqRollWidthSelect', state.rollWidthMode || '27');
    setV('bqGutterInput', state.gutterIn);
    setV('bqExtraPrintsInput', state.extraSpoilagePrints);
    setV('bqPressLaborInput', state.pressLaborPerShirt);
    setV('bqSsShippingInput', state.ssShippingOverride);
    setV('bqDpwShippingInput', state.dpwShippingUsd);
    setV('bqPricingModeSelect', state.pricingMode);
    setV('bqMarginPctInput', state.targetMarginPct);
    setV('bqFixedRetailInput', state.fixedRetailBasePrice);
    const chk = document.getElementById('bqIncludeAuto15Check');
    if (chk) chk.checked = Boolean(state.includeAutoBuilder15);
    const mWrap = document.getElementById('bqMarginControlWrap');
    const fWrap = document.getElementById('bqFixedRetailControlWrap');
    if (mWrap) mWrap.style.display = state.pricingMode === 'margin' ? 'block' : 'none';
    if (fWrap) fWrap.style.display = state.pricingMode === 'fixed' ? 'block' : 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBulkQuoteTool);
  } else {
    initBulkQuoteTool();
  }
})();
