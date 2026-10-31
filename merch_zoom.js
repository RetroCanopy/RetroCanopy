/* ==========================================================================
   RETROCANOPY — 2K HD INTERACTIVE ZOOM & LOUPE INSPECTOR
   Smoothly enlarges any clicked product item to 2048px 2K HD resolution
   with interactive cursor/drag panning, mouse-wheel zoom, and side switching.
   ========================================================================== */

(function () {
  let zoomScale = 1.45;
  let activeSide = 'front'; // 'front' | 'back' | 'single'
  let isDualViewPage = false;
  let isOpen = false;
  let panX = 0;
  let panY = 0;

  let sharedShopCtx = null;
  function ensureShopAudioContext() {
    if (!sharedShopCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      sharedShopCtx = new AudioCtx();
    }
    if (sharedShopCtx.state === 'suspended') {
      sharedShopCtx.resume().catch(() => {});
    }
    return sharedShopCtx;
  }

  // Build Overlay DOM once
  const overlay = document.createElement('div');
  overlay.className = 'rc-zoom-overlay';
  overlay.id = 'rcZoomOverlay';
  overlay.innerHTML = `
    <div class="rc-zoom-topbar" onclick="event.stopPropagation()">
      <div class="rc-zoom-meta">
        <span class="rc-zoom-kicker" id="rcZoomKicker">RC-000</span>
        <span class="rc-zoom-title" id="rcZoomTitle">Product View</span>
      </div>

      <div class="rc-zoom-controls">
        <div class="rc-zoom-pill-group" id="rcSideGroup" style="display:none;">
          <button class="rc-zoom-btn active" id="rcBtnFront" type="button">Front</button>
          <button class="rc-zoom-btn" id="rcBtnBack" type="button">Back</button>
        </div>

        <div class="rc-zoom-pill-group">
          <button class="rc-zoom-btn active" data-scale="1.45" type="button">1.5×</button>
          <button class="rc-zoom-btn" data-scale="2.25" type="button">2.2×</button>
          <button class="rc-zoom-btn" data-scale="3.2" type="button">3.2×</button>
        </div>

        <button class="rc-zoom-close" id="rcZoomClose" type="button">Close</button>
      </div>
    </div>

    <button class="rc-zoom-nav rc-zoom-prev" id="rcZoomPrev" title="Previous" type="button">&#8592;</button>

    <div class="rc-zoom-stage" id="rcZoomStage">
      <img class="rc-zoom-img" id="rcZoomImg" src="" alt="2K HD Zoomed View">
    </div>

    <button class="rc-zoom-nav rc-zoom-next" id="rcZoomNext" title="Next" type="button">&#8594;</button>

    <div class="rc-zoom-footer-hint">
      <span>Move cursor</span> to pan &nbsp;·&nbsp; <span>Scroll or click</span> to zoom &nbsp;·&nbsp; <span>Esc</span> to close
    </div>
  `;

  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(overlay);

    const zoomImg = document.getElementById('rcZoomImg');
    const zoomStage = document.getElementById('rcZoomStage');
    const zoomKicker = document.getElementById('rcZoomKicker');
    const zoomTitle = document.getElementById('rcZoomTitle');
    const sideGroup = document.getElementById('rcSideGroup');
    const btnFront = document.getElementById('rcBtnFront');
    const btnBack = document.getElementById('rcBtnBack');
    const btnClose = document.getElementById('rcZoomClose');
    const btnPrev = document.getElementById('rcZoomPrev');
    const btnNext = document.getElementById('rcZoomNext');
    const scaleBtns = overlay.querySelectorAll('[data-scale]');

    // Detect page type and attach click-to-enlarge handlers + hover hint badges
    const frontUnit = document.getElementById('frontUnit');
    const backUnit = document.getElementById('backUnit');
    const frontImg = document.getElementById('frontImg');
    const backImg = document.getElementById('backImg');

    const singleTargets = [
      document.querySelector('.hat-levitate-wrapper'),
      document.querySelector('.mat-levitate-wrapper'),
      document.querySelector('.item-levitate-wrapper'),
      document.querySelector('.bag-levitate-wrapper')
    ].filter(Boolean);

    function addZoomHint(el, label) {
      if (!el || el.querySelector('.rc-zoom-hint')) return;
      const badge = document.createElement('div');
      badge.className = 'rc-zoom-hint';
      badge.textContent = label || 'Click to zoom';
      el.appendChild(badge);
    }

    if (frontUnit && backUnit && frontImg && backImg) {
      isDualViewPage = true;
      addZoomHint(frontUnit, 'Click to zoom');
      addZoomHint(backUnit, 'Click to zoom');

      // Override inline onclick so clicking a garment smoothly opens the 2K Zoom Inspector
      frontUnit.removeAttribute('onclick');
      backUnit.removeAttribute('onclick');

      frontUnit.addEventListener('click', (e) => {
        e.stopPropagation();
        openZoom('front');
      });
      backUnit.addEventListener('click', (e) => {
        e.stopPropagation();
        openZoom('back');
      });
    } else if (singleTargets.length > 0) {
      isDualViewPage = false;
      singleTargets.forEach((wrapper) => {
        addZoomHint(wrapper, 'Click to zoom');
        wrapper.addEventListener('click', (e) => {
          e.stopPropagation();
          openZoom('single');
        });
      });
    }

    // Hide prev/next arrows inside zoom modal if page is a single-item page (Hat / Gear Bag)
    const hasStepFn = typeof window.stepHoodie === 'function' ||
                      typeof window.stepItem === 'function' ||
                      typeof window.stepMat === 'function';
    if (!hasStepFn) {
      btnPrev.style.display = 'none';
      btnNext.style.display = 'none';
    }

    function syncZoomContent() {
      const hudKickerEl = document.getElementById('hudKicker') || document.querySelector('.hud-kicker');
      const hudTitleEl = document.getElementById('hudTitle') || document.querySelector('.hud-title');

      if (hudKickerEl) {
        zoomKicker.textContent = hudKickerEl.textContent;
      }
      if (hudTitleEl) {
        zoomTitle.textContent = hudTitleEl.textContent;
      }

      function to2kUrl(url) {
        if (!url) return '';
        return url.indexOf('?') !== -1 ? url + '&hd=2k' : url + '?hd=2k';
      }

      if (isDualViewPage) {
        sideGroup.style.display = 'flex';
        btnFront.classList.toggle('active', activeSide === 'front');
        btnBack.classList.toggle('active', activeSide === 'back');
        const srcImg = activeSide === 'back' ? backImg : frontImg;
        if (srcImg) zoomImg.src = to2kUrl(srcImg.src);
      } else {
        sideGroup.style.display = 'none';
        const singleImg = document.getElementById('hatImg') ||
                          document.getElementById('centerMatImg') ||
                          document.getElementById('centerImg') ||
                          document.getElementById('bagImg');
        if (singleImg) zoomImg.src = to2kUrl(singleImg.src);
      }
    }

    function applyTransform(smooth) {
      zoomImg.classList.toggle('panning', !smooth);
      zoomImg.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoomScale})`;
      scaleBtns.forEach((b) => {
        const s = parseFloat(b.getAttribute('data-scale'));
        b.classList.toggle('active', Math.abs(s - zoomScale) < 0.25);
      });
    }

    function setScale(newScale, smooth) {
      zoomScale = Math.max(1.1, Math.min(4.0, newScale));
      if (zoomScale <= 1.55) {
        panX = panX * 0.4;
        panY = panY * 0.4;
      }
      applyTransform(smooth !== false);
    }

    function openZoom(side) {
      activeSide = side || 'front';
      zoomScale = 1.45;
      panX = 0;
      panY = 0;
      syncZoomContent();
      isOpen = true;
      overlay.classList.add('open');
      applyTransform(true);
    }

    function closeZoom() {
      isOpen = false;
      zoomImg.classList.remove('panning');
      zoomImg.style.transform = 'scale(0.84)';
      overlay.classList.remove('open');
    }

    // Side Switchers inside Zoom Modal
    btnFront.addEventListener('click', () => {
      activeSide = 'front';
      panX = 0;
      panY = 0;
      syncZoomContent();
      applyTransform(true);
    });

    btnBack.addEventListener('click', () => {
      activeSide = 'back';
      panX = 0;
      panY = 0;
      syncZoomContent();
      applyTransform(true);
    });

    // Zoom Level Pill Buttons
    scaleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetScale = parseFloat(btn.getAttribute('data-scale'));
        setScale(targetScale, true);
      });
    });

    // Clicking the zoomed image cycles zoom depth smoothly; clicking backdrop closes
    zoomImg.addEventListener('click', (e) => {
      e.stopPropagation();
      if (zoomScale < 2.0) {
        setScale(2.25, true);
      } else if (zoomScale < 2.9) {
        setScale(3.2, true);
      } else {
        panX = 0;
        panY = 0;
        setScale(1.45, true);
      }
    });

    zoomStage.addEventListener('click', () => {
      closeZoom();
    });

    btnClose.addEventListener('click', () => {
      closeZoom();
    });

    // Interactive Cursor Panning across the 2K HD image
    zoomStage.addEventListener('mousemove', (e) => {
      if (!isOpen) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 to +1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to +1
      const maxPanX = Math.max(40, (zoomScale - 1.0) * 320);
      const maxPanY = Math.max(40, (zoomScale - 1.0) * 290);
      panX = -nx * maxPanX;
      panY = -ny * maxPanY;
      applyTransform(false);
    });

    // Mouse Wheel Smooth Zoom
    overlay.addEventListener('wheel', (e) => {
      if (!isOpen) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setScale(zoomScale + delta, true);
    }, { passive: false });

    // Prev / Next Item Stepping while inside Zoom Inspector
    function stepInsideZoom(dir) {
      if (typeof window.stepHoodie === 'function') window.stepHoodie(dir);
      else if (typeof window.stepItem === 'function') window.stepItem(dir);
      else if (typeof window.stepMat === 'function') window.stepMat(dir);
      syncZoomContent();
    }

    btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      stepInsideZoom(-1);
    });

    btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      stepInsideZoom(1);
    });

    // Keyboard shortcuts (ESC to close, + / - to zoom, ArrowLeft / ArrowRight synced)
    window.addEventListener('keydown', (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        closeZoom();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        setTimeout(syncZoomContent, 20);
      }
    });

    // Mark intro as seen & mark that we are inside an internal page so returning Home never replays the intro
    try {
      sessionStorage.setItem('rc_intro_seen', '1');
      sessionStorage.setItem('rc_from_internal', '1');
      sessionStorage.setItem('rc_lofi_active', '1');
      if (localStorage.getItem('rc_is_admin_v1') !== 'true') {
        window.location.replace('index.html');
        return;
      }
      if (!window.RetroAuthHub && !document.querySelector('script[src*="auth_hub.js"]')) {
        const authScript = document.createElement('script');
        authScript.src = 'auth_hub.js?v=109';
        document.head.appendChild(authScript);
      }
    } catch (_) {}

    // Initialize Enlarged Chloe Product Guide & Continuous Soft Lofi Music
    initShopChloeGuide();
    initShopLofiMusic();
  });

  /**
   * ENLARGED CHLOE SHOP CURATOR
   * Stands in the bottom-left of every Shop showroom and describes the active product in real time.
   */
  function initShopChloeGuide() {
    if (document.getElementById('shop-chloe-stage')) return;

    const masterCatalog = {
      'RC-101': { model: 'RC-101', title: 'Classic Sunset Grid Snapback', role: 'Headwear', price: 32, img: 'assets/merch/hat_front_floating.png?v=75' },
      'RC-102': { model: 'RC-102', title: 'Dual Cyan & Magenta Grid Snapback', role: 'Headwear', price: 32, img: 'assets/merch/hat_opt2.png?v=75' },
      'RC-103': { model: 'RC-103', title: 'Outrun Wireframe Mountains Trucker Cap', role: 'Headwear', price: 32, img: 'assets/merch/hat_opt3.png?v=75' },
      'RC-104': { model: 'RC-104', title: 'Starry Synthwave Cosmos Dad Cap', role: 'Headwear', price: 32, img: 'assets/merch/hat_opt4.png?v=75' },
      'RC-105': { model: 'RC-105', title: 'Valkyrie Gold & Crimson Samurai Snapback', role: 'Headwear', price: 34, img: 'assets/merch/hat_opt5.png?v=75' },
      'RC-106': { model: 'RC-106', title: '1984 Arcade Champion Corduroy Rope Cap', role: 'Headwear', price: 34, img: 'assets/merch/hat_opt6.png?v=75' },
      'RC-201': { model: 'RC-201', title: 'Classic Sunset Grid XXL', role: 'Desk Setup', price: 38, img: 'assets/merch/deskmat_topdown_1.png?v=3' },
      'RC-202': { model: 'RC-202', title: 'Signature Type XXL', role: 'Desk Setup', price: 38, img: 'assets/merch/deskmat_topdown_2.png?v=3' },
      'RC-203': { model: 'RC-203', title: 'Outrun Wireframe XXL', role: 'Desk Setup', price: 38, img: 'assets/merch/deskmat_topdown_3.png?v=3' },
      'RC-204': { model: 'RC-204', title: 'Pro-Esports Stealth XXL', role: 'Desk Setup', price: 38, img: 'assets/merch/deskmat_topdown_4.png?v=3' },
      'RC-205': { model: 'RC-205', title: 'Starry Cosmos XXL', role: 'Desk Setup', price: 38, img: 'assets/merch/deskmat_topdown_5.png?v=3' },
      'RC-211': { model: 'RC-211', title: 'Classic Emblem Pad', role: 'Mousepad', price: 22, img: 'assets/merch/mousepad_small_1.png?v=3' },
      'RC-212': { model: 'RC-212', title: 'Minimalist Stealth Pad', role: 'Mousepad', price: 22, img: 'assets/merch/mousepad_small_2.png?v=3' },
      'RC-213': { model: 'RC-213', title: 'Dual Cyan/Magenta Pad', role: 'Mousepad', price: 22, img: 'assets/merch/mousepad_small_3.png?v=3' },
      'RC-214': { model: 'RC-214', title: 'Corner-Badge Aim Pad', role: 'Mousepad', price: 22, img: 'assets/merch/mousepad_small_4.png?v=3' },
      'RC-215': { model: 'RC-215', title: 'Starry Outrun Pad', role: 'Mousepad', price: 22, img: 'assets/merch/mousepad_small_5.png?v=3' },
      'RC-301': { model: 'RC-301', title: 'Classic Sunset Hoodie', role: 'Outerwear', price: 68, img: 'assets/merch/hoodie_opt1_back.png?v=75' },
      'RC-302': { model: 'RC-302', title: 'Dual Grid Hoodie', role: 'Outerwear', price: 68, img: 'assets/merch/hoodie_opt2_back.png?v=75' },
      'RC-303': { model: 'RC-303', title: 'Midnight Grinder Hoodie', role: 'Outerwear', price: 68, img: 'assets/merch/hoodie_opt3_back.png?v=75' },
      'RC-304': { model: 'RC-304', title: 'Outrun Wireframe Hoodie', role: 'Outerwear', price: 68, img: 'assets/merch/hoodie_opt4_back.png?v=75' },
      'RC-305': { model: 'RC-305', title: 'Starry Cosmos Hoodie', role: 'Outerwear', price: 68, img: 'assets/merch/hoodie_opt5_back.png?v=75' },
      'RC-306': { model: 'RC-306', title: 'Cyber-Dragon Hoodie', role: 'Outerwear', price: 68, img: 'assets/merch/hoodie_opt6_back.png?v=75' },
      'RC-307': { model: 'RC-307', title: 'Superbike Drift Hoodie', role: 'Outerwear', price: 68, img: 'assets/merch/hoodie_opt7_back.png?v=75' },
      'RC-308': { model: 'RC-308', title: 'Pinball Wizard Hoodie', role: 'Outerwear', price: 68, img: 'assets/merch/hoodie_opt9_back.png?v=75' },
      'RC-401': { model: 'RC-401', title: 'Outrun Gullwing Tee', role: 'Base Layer', price: 36, img: 'assets/merch/tee_opt1_back.png?v=6' },
      'RC-402': { model: 'RC-402', title: 'Arcade Blueprint Tee', role: 'Base Layer', price: 36, img: 'assets/merch/tee_opt2_back.png?v=6' },
      'RC-403': { model: 'RC-403', title: 'Shibuya Shrine Tee', role: 'Base Layer', price: 36, img: 'assets/merch/tee_opt3_back.png?v=6' },
      'RC-404': { model: 'RC-404', title: 'Cassette Mixtape Tee', role: 'Base Layer', price: 36, img: 'assets/merch/tee_opt4_back.png?v=11' },
      'RC-405': { model: 'RC-405', title: 'Mecha-Valkyrie Tee', role: 'Base Layer', price: 36, img: 'assets/merch/tee_opt5_back.png?v=6' },
      'RC-501': { model: 'RC-501', title: 'Classic Sunset Joggers', role: 'Bottoms', price: 58, img: 'assets/merch/joggers_opt1.png?v=1' },
      'RC-502': { model: 'RC-502', title: 'Dual Grid Leg Joggers', role: 'Bottoms', price: 58, img: 'assets/merch/joggers_opt2.png?v=1' },
      'RC-503': { model: 'RC-503', title: 'Midnight Tech Joggers', role: 'Bottoms', price: 58, img: 'assets/merch/joggers_opt3.png?v=1' },
      'RC-504': { model: 'RC-504', title: 'Outrun Mountains Joggers', role: 'Bottoms', price: 58, img: 'assets/merch/joggers_opt4.png?v=1' },
      'RC-505': { model: 'RC-505', title: 'Starry Cosmos Joggers', role: 'Bottoms', price: 58, img: 'assets/merch/joggers_opt5.png?v=1' },
      'RC-601': { model: 'RC-601', title: 'Golden ROM Crewneck', role: 'Crewneck', price: 54, img: 'assets/merch/longsleeve_opt1_back.png?v=6' },
      'RC-602': { model: 'RC-602', title: 'Cyber Ronin Crewneck', role: 'Crewneck', price: 54, img: 'assets/merch/longsleeve_opt2_back.png?v=6' },
      'RC-603': { model: 'RC-603', title: 'Power-Glove 1989 Crewneck', role: 'Crewneck', price: 54, img: 'assets/merch/longsleeve_opt3_back.png?v=6' },
      'RC-604': { model: 'RC-604', title: 'Saturn Eclipse Crewneck', role: 'Crewneck', price: 54, img: 'assets/merch/longsleeve_opt4_back.png?v=6' },
      'RC-605': { model: 'RC-605', title: 'Hi-Fi 60Hz VHS Crewneck', role: 'Crewneck', price: 54, img: 'assets/merch/longsleeve_opt5_back.png?v=6' },
      'RC-701': { model: 'RC-701', title: '20oz LAN Gear Bag', role: 'Carry Gear', price: 28, img: 'assets/merch/gearbag_opt1.png?v=5' },
      'RC-702': { model: 'RC-702', title: 'Sunset Grid 30oz Tumbler', role: 'Drinkware', price: 34, img: 'assets/merch/tumbler_opt1.png?v=2' },
      'RC-703': { model: 'RC-703', title: 'Outrun Horizon 30oz Tumbler', role: 'Drinkware', price: 34, img: 'assets/merch/tumbler_opt2.png?v=2' },
      'RC-704': { model: 'RC-704', title: 'Starry Cosmos 30oz Tumbler', role: 'Drinkware', price: 34, img: 'assets/merch/tumbler_opt3.png?v=2' },
      'RC-705': { model: 'RC-705', title: 'Midnight Laser 30oz Tumbler', role: 'Drinkware', price: 36, img: 'assets/merch/tumbler_opt4.png?v=2' }
    };

    const productCatalogNotes = {
      'RC-101': {
        desc: "Our flagship RC-101 Classic Sunset Grid Snapback! High-crown 6-panel silhouette with a raised 3D-puff sunset crest that's going to look really sharp on you. Want to see the optional paired items I picked to make this a full outfit?",
        tip: "Styling Tip: Pair this with the RC-301 hoodie and RC-501 joggers for that clean black-on-black streetwear look.",
        outfitTitle: "Signature Sunset Streetwear Outfit",
        paired: ['RC-301', 'RC-401', 'RC-501']
      },
      'RC-102': {
        desc: "Electric split-neon energy! The RC-102 Dual Cyan & Magenta Grid Snapback features raised two-tone 3D puff embroidery and a cyan underbrim accent. Want to see the matching Dual-Grid outfit I paired with it?",
        tip: "Styling Tip: Matches the RC-302 Dual Grid Hoodie and RC-502 Joggers down to the exact thread color.",
        outfitTitle: "Dual Cyan & Magenta Streetwear Outfit",
        paired: ['RC-302', 'RC-402', 'RC-502']
      },
      'RC-103': {
        desc: "Built for midnight drives — the RC-103 Outrun Wireframe Mountains Trucker Cap pairs breathable black mesh panels with a beveled woven Outrun horizon patch. Want to see the matching Outrun outfit?",
        tip: "Styling Tip: Throw this on with the RC-304 Outrun Hoodie and RC-401 Gullwing Tee for pure 1984 highway vibes.",
        outfitTitle: "Outrun Wireframe Horizon Outfit",
        paired: ['RC-304', 'RC-401', 'RC-504']
      },
      'RC-104': {
        desc: "Relaxed, broken-in comfort from day one! The RC-104 Starry Synthwave Cosmos Dad Cap features 3D nebula ring and golden crescent moon embroidery on washed charcoal twill. Want to see the matching Starry outfit?",
        tip: "Styling Tip: The curved brim and vintage wash pair effortlessly with the RC-305 Starry Cosmos Hoodie and RC-505 Joggers.",
        outfitTitle: "Starry Synthwave Cosmos Complete Outfit",
        paired: ['RC-305', 'RC-604', 'RC-505']
      },
      'RC-105': {
        desc: "Channel your inner Akari! The RC-105 Valkyrie Gold & Crimson Samurai Snapback rocks metallic-gold eyelet stitching and a raised 3D Samurai Kabuto crest. Want to see the Cyber-Samurai outfit I paired with it?",
        tip: "Styling Tip: Pair with the RC-602 Cyber Ronin Crewneck and RC-403 Shibuya Shrine Tee for boss-level presence.",
        outfitTitle: "Valkyrie Samurai Streetwear Outfit",
        paired: ['RC-602', 'RC-403', 'RC-503']
      },
      'RC-106': {
        desc: "Vintage tournament royalty! The RC-106 1984 Arcade Champion Cap is crafted from midnight fine-wale corduroy with a braided gold crown rope and 3D golden laurels. Want to see the matching Arcade Champion outfit?",
        tip: "Styling Tip: The plush corduroy texture and gold rope look incredible paired with the RC-601 Golden ROM Crewneck.",
        outfitTitle: "1984 Arcade Champion Collector Outfit",
        paired: ['RC-601', 'RC-308', 'RC-501']
      },
      'RC-201': {
        desc: "The Classic Sunset Grid XXL Desk Mat! 900x400mm of micro-woven cloth on 4mm plush rubber. Want to see the matching Sunset Grid streetwear outfit I paired to match your desk setup?",
        tip: "Curator Note: Ultra-smooth glide for your mouse with anti-fray stitched borders. Makes late-night sessions way more comfortable.",
        outfitTitle: "Sunset Grid Battlestation & Streetwear Set",
        paired: ['RC-301', 'RC-501', 'RC-101']
      },
      'RC-202': {
        desc: "Bold and iconic — the Signature Type XXL Desk Mat puts our glowing sunset wordmark front and center. Want to see the optional paired streetwear outfit I put together to go with it?",
        tip: "Curator Note: Water-resistant weave wipes clean in seconds and looks amazing paired with a minimal mechanical keyboard.",
        outfitTitle: "Signature Type Creator Outfit",
        paired: ['RC-605', 'RC-502', 'RC-701']
      },
      'RC-203': {
        desc: "Pure 1984 arcade energy! The Outrun Wireframe Horizon XXL Mat stretches glowing vector mountains across 900x400mm. Want to see the matching Outrun outfit pieces I paired with it?",
        tip: "Curator Note: 4mm dense natural rubber dampens keystroke noise and stays locked in place during clutch rounds.",
        outfitTitle: "Outrun Horizon Complete Set",
        paired: ['RC-304', 'RC-401', 'RC-504']
      },
      'RC-204': {
        desc: "Going for the sleek, mysterious look? The Pro-Esports Stealth XXL Mat keeps your desk pitch-black with a subtle corner crest. Want to see the matching Midnight Stealth outfit I paired with it?",
        tip: "Curator Note: Micro-textured weave balances rapid glide with pinpoint stopping power. Tournament-grade perfection.",
        outfitTitle: "Pro-Esports Midnight Stealth Outfit",
        paired: ['RC-303', 'RC-503', 'RC-701']
      },
      'RC-205': {
        desc: "Okay, this one is secretly my favorite — the Starry Synthwave Cosmos XXL Mat wraps your desk in nebula glow. Want to see the matching Starry Cosmos outfit I paired with it?",
        tip: "Curator Note: 900x400mm of plush 4mm comfort. Turn the lights down low and let the synthwave colors set the mood.",
        outfitTitle: "Starry Synthwave Cosmos Full Outfit",
        paired: ['RC-305', 'RC-505', 'RC-101']
      },
      'RC-211': {
        desc: "Compact space, maximum charm! The Classic Full Emblem Compact Pad packs our sunset tree into a nimble 350x300mm surface. Want to see the optional paired outfit I styled around it?",
        tip: "Curator Note: 4mm high-density rubber stays planted on any desk. Easy to slip into our RC-701 Gear Bag on the go.",
        outfitTitle: "Classic Emblem On-The-Go Outfit",
        paired: ['RC-401', 'RC-501', 'RC-701']
      },
      'RC-212': {
        desc: "Understated and refined — the Minimalist Stealth Icon Pad gives you 350x300mm of silky glide. Want to see the optional paired streetwear outfit I matched with this piece?",
        tip: "Curator Note: Smooth micro-weave surface ensures pixel-accurate tracking for both creative work and gaming.",
        outfitTitle: "Minimalist Stealth Streetwear Outfit",
        paired: ['RC-602', 'RC-503', 'RC-101']
      },
      'RC-213': {
        desc: "Electric contrast! The Dual Cyan & Magenta Grid Compact Pad brings split-neon arcade energy to your desk. Want to see the matching Dual-Grid outfit I paired with it?",
        tip: "Curator Note: High-precision edge stitching that never frays. Cyan and pink honestly make the coolest combo.",
        outfitTitle: "Dual Cyan & Magenta Full Outfit",
        paired: ['RC-302', 'RC-502', 'RC-101']
      },
      'RC-214': {
        desc: "Zero distractions, pure aim — the Corner-Badge Pro Aim Pad provides an unbroken 350x300mm matte-black tracking zone. Want to see the LAN tournament outfit I paired with it?",
        tip: "Curator Note: Balanced friction profile gives your mouse sensor consistent feedback in high-pressure matches.",
        outfitTitle: "Tournament Clutch LAN Outfit",
        paired: ['RC-303', 'RC-405', 'RC-701']
      },
      'RC-215': {
        desc: "Cosmic vibes in a compact size! The Starry Outrun Horizon Pad pairs wireframe peaks with a starlit sky. Want to see the optional paired outfit I picked to complete the look?",
        tip: "Curator Note: Click the mat to inspect the fabric weave in 2K HD zoom — the starlight gradient is gorgeous up close.",
        outfitTitle: "Starry Outrun Night Cruiser Outfit",
        paired: ['RC-604', 'RC-505', 'RC-101']
      },
      'RC-301': {
        desc: "Our crown jewel — the RC-301 Classic Sunset Grid Hoodie! 450GSM heavyweight fleece with a drop-shoulder cut that's going to look so good on you. Want to see the optional paired items to make it a full outfit?",
        tip: "Styling Tip: Super soft brushed fleece inside — the exact kind of cozy hoodie someone's definitely going to try borrowing from you.",
        outfitTitle: "Classic Sunset Grid Complete Outfit",
        paired: ['RC-501', 'RC-401', 'RC-101']
      },
      'RC-302': {
        desc: "Electric dual-tone heat! The RC-302 Dual Grid Hoodie splits neon cyan and magenta across ultra-soft 450GSM fleece. Want to see the optional paired items I picked to complete this outfit?",
        tip: "Styling Tip: Layer this over a crisp tee so the collar pop highlights the two-tone chest badge.",
        outfitTitle: "Dual Cyan & Magenta Streetwear Outfit",
        paired: ['RC-502', 'RC-402', 'RC-101']
      },
      'RC-303': {
        desc: "Made for late-night drives and 2 AM sessions — the RC-303 Midnight Grinder Vault Hoodie rocks a stealth chest badge and full back vault print. Want to see the optional paired outfit pieces?",
        tip: "Styling Tip: Pair with the RC-503 techwear joggers for a head-to-toe midnight streetwear fit that always gets a second look.",
        outfitTitle: "Midnight Grinder Vault Complete Outfit",
        paired: ['RC-503', 'RC-404', 'RC-701']
      },
      'RC-304': {
        desc: "Sharp, clean, and totally your vibe — the RC-304 Outrun Wireframe Hoodie frames our sunset tree in glowing vector peaks. Want to see the optional paired items for the full Outrun outfit?",
        tip: "Styling Tip: That boxy drop-shoulder silhouette pairs naturally with high-top sneakers and the RC-101 snapback.",
        outfitTitle: "Outrun Wireframe Horizon Outfit",
        paired: ['RC-504', 'RC-401', 'RC-101']
      },
      'RC-305': {
        desc: "Look at that starfield on the back! The RC-305 Starry Cosmos Hoodie wraps 450GSM plush fleece in deep-space synthwave glow. Want to see the optional paired items to complete the outfit?",
        tip: "Styling Tip: Go slightly oversized for that relaxed streetwear drape — the brushed cotton interior is pure comfort.",
        outfitTitle: "Starry Synthwave Cosmos Complete Outfit",
        paired: ['RC-505', 'RC-403', 'RC-101']
      },
      'RC-306': {
        desc: "Feeling bold today? The RC-306 Cyber-Dragon Hoodie coils a chrome dragon around our sunset tree on the back. Want to see the optional paired pieces I styled with this hoodie?",
        tip: "Styling Tip: The metallic ink shimmer catches neon light beautifully. Pair with dark joggers for maximum edge.",
        outfitTitle: "Cyber-Dragon Arcade Boss Outfit",
        paired: ['RC-503', 'RC-403', 'RC-101']
      },
      'RC-307': {
        desc: "High-octane 1987 anime energy! The RC-307 Superbike Cyber Drift Hoodie features a racing visor badge and drifting superbike back print. Want to see the optional paired outfit pieces?",
        tip: "Styling Tip: The vivid red taillight trail pops against pitch-black fleece. Pair with sleek sneakers for midnight ride vibes.",
        outfitTitle: "1987 Superbike Cyber Drift Outfit",
        paired: ['RC-504', 'RC-401', 'RC-701']
      },
      'RC-308': {
        desc: "High score unlocked! The RC-308 Pinball Wizard Hoodie rocks a 1000-PTS pop-bumper badge and neon pinball playfield back print. Want to see the optional paired items for the full arcade outfit?",
        tip: "Styling Tip: High-density print captures every playfield ramp. Wear this to the Arcade room and you'll fit right in.",
        outfitTitle: "Pinball Wizard High-Score Outfit",
        paired: ['RC-502', 'RC-402', 'RC-101']
      },
      'RC-401': {
        desc: "The RC-401 Outrun Turbo Gullwing Tee! Heavyweight 240GSM combed cotton with a boxy cut that flatters the shoulders nicely. Want to see the optional paired items to build the full outfit?",
        tip: "Styling Tip: Thick 1-inch ribbed collar that stays crisp all night. Pair with the RC-101 cap for effortless weekend style.",
        outfitTitle: "86 Outrun Turbo Cruiser Outfit",
        paired: ['RC-304', 'RC-504', 'RC-101']
      },
      'RC-402': {
        desc: "'Insert Coin 25¢' right on the chest! The RC-402 Blueprint Tee pairs vintage soft-hand cotton with an isometric cabinet schematic. Want to see the optional paired items for the complete outfit?",
        tip: "Styling Tip: The blueprint line work is razor-sharp. Pair with our RC-502 joggers for a relaxed weekend hangout fit.",
        outfitTitle: "16-Bit Arcade Architect Outfit",
        paired: ['RC-601', 'RC-502', 'RC-701']
      },
      'RC-403': {
        desc: "Neo-Tokyo streetwear meets synthwave — the RC-403 Cyber-Shrine Tee pairs a crimson Torii seal with a glowing Shibuya shrine back print. Want to see the optional paired items for the full outfit?",
        tip: "Styling Tip: Click the tee to inspect the fine architectural linework in 2K zoom! Looks incredible under neon lights.",
        outfitTitle: "Shibuya Cyber-Shrine Streetwear Outfit",
        paired: ['RC-602', 'RC-503', 'RC-101']
      },
      'RC-404': {
        desc: "Pure analog nostalgia! The RC-404 Mixtape Vol. 01 Tee rocks a C-90 cassette badge up front and chrome tape ribbons across the back. Want to see the optional paired items I styled with it?",
        tip: "Styling Tip: Easy, relaxed streetwear drape — ideal for late-night Lofi listening sessions and night walks.",
        outfitTitle: "Lofi Cassette Mixtape Complete Outfit",
        paired: ['RC-605', 'RC-501', 'RC-701']
      },
      'RC-405': {
        desc: "Main-character energy! The RC-405 Mecha-Valkyrie Tee frames your shoulders with a winged mecha guardian on back. Want to see the optional paired items to complete the boss-level outfit?",
        tip: "Styling Tip: Strong, structured drape in 240GSM cotton. Pair with dark streetwear joggers and high-top sneakers.",
        outfitTitle: "Mecha-Valkyrie Final Boss Outfit",
        paired: ['RC-306', 'RC-503', 'RC-101']
      },
      'RC-501': {
        desc: "Cozy enough for lounging, sharp enough for going out — the RC-501 Classic Sunset Grid Joggers in 450GSM heavyweight fleece! Want to see the optional paired top and accessories for the full outfit?",
        tip: "Styling Tip: Deep zippered pockets and ultra-soft brushed fleece. Pair with the RC-301 hoodie for the full matching set.",
        outfitTitle: "Classic Sunset Grid Matched Set",
        paired: ['RC-301', 'RC-401', 'RC-101']
      },
      'RC-502': {
        desc: "Now that's a statement fit! The RC-502 Dual Grid Joggers pair an embroidered thigh crest with vertical Retrocanopy leg typography. Want to see the optional paired items for the full outfit?",
        tip: "Styling Tip: Ribbed ankle cuffs show off your sneaker rotation perfectly. Pair with the RC-302 hoodie and RC-402 tee.",
        outfitTitle: "Dual Cyan & Magenta Matched Outfit",
        paired: ['RC-302', 'RC-402', 'RC-101']
      },
      'RC-503': {
        desc: "Sleek, tactical, and super flattering — the RC-503 Midnight Grinder Techwear Joggers feature lower-calf synthwave grid accents. Want to see the optional paired items to complete this outfit?",
        tip: "Styling Tip: Metal-tipped drawcords and a tailored silhouette. Matches the RC-303 hoodie seamlessly.",
        outfitTitle: "Midnight Grinder Techwear Full Outfit",
        paired: ['RC-303', 'RC-405', 'RC-701']
      },
      'RC-504': {
        desc: "The RC-504 Outrun Wireframe Joggers bring glowing cyan mountain peaks to plush 450GSM black fleece. Want to see the optional paired items I picked to make this a complete outfit?",
        tip: "Styling Tip: Super soft inside with a structured streetwear taper. Pair with the RC-304 hoodie if you want my stamp of approval.",
        outfitTitle: "Outrun Wireframe Mountains Full Outfit",
        paired: ['RC-304', 'RC-401', 'RC-101']
      },
      'RC-505': {
        desc: "Soft, dreamy, and ridiculously comfortable — the RC-505 Starry Synthwave Joggers feature our nebula halo crest on 450GSM fleece. Want to see the optional paired items for the full Starry outfit?",
        tip: "Styling Tip: High-density ankle cuffs keep them sitting right above your kicks. Pair with the RC-305 Starry Cosmos hoodie.",
        outfitTitle: "Starry Synthwave Cosmos Matched Outfit",
        paired: ['RC-305', 'RC-604', 'RC-101']
      },
      'RC-601': {
        desc: "Rare collector energy! The RC-601 Golden ROM Cartridge Crewneck rocks a 16-bit gold cartridge badge and lightning ROM back print. Want to see the optional paired items for the full collector outfit?",
        tip: "Styling Tip: The warm gold highlights against black fleece look so rich in person. Pair with relaxed joggers and high-tops.",
        outfitTitle: "Golden ROM Collector Complete Outfit",
        paired: ['RC-501', 'RC-402', 'RC-101']
      },
      'RC-602': {
        desc: "Sharp as a laser katana — the RC-602 Cyber Ronin Crewneck pairs a neon Kabuto chest badge with a Cyber Samurai mask on back. Want to see the optional paired items to complete the outfit?",
        tip: "Styling Tip: Heavyweight ribbed cuffs and collar that hold their shape all night. Definitely a standout piece.",
        outfitTitle: "Cyber Ronin Samurai Streetwear Outfit",
        paired: ['RC-503', 'RC-403', 'RC-101']
      },
      'RC-603': {
        desc: "1989 arcade nostalgia! The RC-603 Power-Glove Crewneck pairs a wireframe cyber-hand crest with a full sunset back print. Want to see the optional paired items I styled with it?",
        tip: "Styling Tip: Zero-itch interior cotton that feels heavenly. Layer it over the RC-401 tee — an easy 10/10 in my lookbook.",
        outfitTitle: "1989 Power-Glove Virtual Reality Outfit",
        paired: ['RC-504', 'RC-401', 'RC-701']
      },
      'RC-604': {
        desc: "Deep-space arcade style — the RC-604 Saturn Eclipse Crewneck features a ringed planet crest and starfighters orbiting Saturn on back. Want to see the optional paired items for the full outfit?",
        tip: "Styling Tip: Click either side to inspect the starfighters in 2K zoom! Pair with the RC-505 joggers and RC-101 snapback.",
        outfitTitle: "Orbital Saturn Eclipse Complete Outfit",
        paired: ['RC-505', 'RC-403', 'RC-101']
      },
      'RC-605': {
        desc: "Ooh, an analog video fan? The RC-605 VHS Crewneck features a globe chest stamp and a 60Hz VHS spec-sheet poster on back. Want to see the optional paired items to make it a full outfit?",
        tip: "Styling Tip: Crisp technical typography that retro heads adore. Pair with the RC-404 cassette tee and RC-502 joggers.",
        outfitTitle: "90s Hi-Fi Analog Brutalist Outfit",
        paired: ['RC-502', 'RC-404', 'RC-701']
      },
      'RC-701': {
        desc: "Heading to a LAN tournament or weekend trip? The RC-701 Gear Bag is cut from rugged 20oz duck canvas. Want to see the optional paired streetwear & tumbler set I packed to go with it?",
        tip: "Curator Note: Heavy-duty gusseted base stands upright beside your setup. Click 'Tumblers' above the bar to see our new 30oz insulated tumblers too!",
        outfitTitle: "Weekend LAN Tournament Complete Outfit",
        paired: ['RC-301', 'RC-501', 'RC-702']
      },
      'RC-702': {
        desc: "Stay hydrated through every late-night session! The RC-702 Classic Sunset Grid 30oz Tumbler keeps drinks ice-cold for 24 hours in double-wall vacuum steel. Want to see the matching Sunset Grid outfit I paired with it?",
        tip: "Curator Note: Sweat-proof matte powder coat so it never leaves rings on your XXL desk mat, plus a smoked press-in lid and reusable straw.",
        outfitTitle: "Classic Sunset Grid & Hydration Set",
        paired: ['RC-301', 'RC-501', 'RC-701']
      },
      'RC-703': {
        desc: "Pure 1984 synthwave refreshment! The RC-703 Outrun Wireframe 30oz Tumbler wraps glowing cyan vector peaks around vacuum-insulated stainless steel. Want to see the optional paired Outrun outfit?",
        tip: "Curator Note: Tapered lower base fits standard car and gaming-chair cup holders while holding a full 30oz.",
        outfitTitle: "Outrun Wireframe Horizon Complete Set",
        paired: ['RC-304', 'RC-504', 'RC-101']
      },
      'RC-704': {
        desc: "Look at that nebula glow! The RC-704 Starry Synthwave Cosmos 30oz Tumbler brings deep-space starlight right to your desk setup. Want to see the matching Starry Cosmos outfit I paired with it?",
        tip: "Curator Note: Pairs with our RC-205 Starry Cosmos XXL Desk Mat and RC-305 Hoodie for a head-to-toe cosmic vibe.",
        outfitTitle: "Starry Synthwave Cosmos Complete Set",
        paired: ['RC-305', 'RC-505', 'RC-205']
      },
      'RC-705': {
        desc: "Sleek, understated, and built for tournament nights — the RC-705 Midnight Stealth 30oz Tumbler features a precision laser-etched brushed-silver Retrocanopy crest. Want to see the matching Stealth outfit?",
        tip: "Curator Note: The laser-engraved stainless steel crest never fades or peels. Bundle it with any paired item for 20% off!",
        outfitTitle: "Midnight Stealth Pro-Esports Set",
        paired: ['RC-303', 'RC-503', 'RC-701']
      }
    };

    const flirtyWhispers = [];
    let whisperIdx = 0;

    const chloeStage = document.createElement('div');
    chloeStage.className = 'shop-chloe-stage';
    chloeStage.id = 'shop-chloe-stage';
    chloeStage.innerHTML = `
      <div class="shop-chloe-dialogue" id="shop-chloe-dialogue" role="region" aria-live="polite">
        <div class="shop-chloe-header">
          <div class="shop-chloe-speaker-wrap">
            <span class="shop-chloe-led" aria-hidden="true"></span>
            <span class="shop-chloe-speaker">CHLOE &bull; CURATOR</span>
          </div>
          <div style="display:inline-flex;align-items:center;gap:5px;">
            <span class="shop-chloe-item-tag" id="chloe-item-tag">RC-101</span>
            <button type="button" class="shop-chloe-min-btn" id="chloe-min-btn" title="Minimize / Expand Chloe's Note" aria-label="Minimize or Expand Chloe Dialogue">&ndash;</button>
          </div>
        </div>
        <div class="shop-chloe-item-title" id="chloe-item-title">Structured Snapback</div>
        <p class="shop-chloe-text" id="chloe-dialogue-text"></p>
        <div class="shop-chloe-upsell-bar" id="chloe-upsell-bar">
          <button type="button" class="chloe-upsell-btn btn-yes" id="chloe-btn-yes-outfit">YES, SHOW OUTFIT &#10022;</button>
          <button type="button" class="chloe-upsell-btn btn-no" id="chloe-btn-tip">STYLING TIP &#9654;</button>
        </div>
      </div>

      <div class="shop-chloe-sprite-wrap" id="shop-chloe-sprite" title="Chloe — Retrocanopy Shop Curator">
        <img src="assets/friends/chloe_shop_flirt1.png?v=70" alt="Chloe Idle" class="shop-chloe-frame frame-flirt1 frame-idle active">
        <img src="assets/friends/chloe_shop_talk.png?v=70" alt="Chloe Talking" class="shop-chloe-frame frame-talk frame-talk1">
        <img src="assets/friends/chloe_shop_flirt2.png?v=70" alt="Chloe Flirt Micro-Wink" class="shop-chloe-frame frame-flirt2 frame-talk2">
      </div>
      <div class="shop-chloe-nameplate"><span>CHLOE &bull; THE SHOP</span></div>
    `;
    document.body.appendChild(chloeStage);

    // Build the Complete Outfit Showcase DOM
    const outfitShowcase = document.createElement('section');
    outfitShowcase.className = 'rc-outfit-showcase';
    outfitShowcase.id = 'rc-outfit-showcase';
    outfitShowcase.setAttribute('aria-label', 'Chloe Curated Complete Outfit');
    outfitShowcase.innerHTML = `
      <div class="rc-outfit-header">
        <div class="rc-outfit-title-wrap">
          <span class="rc-outfit-kicker">CHLOE'S CURATED LOOKBOOK &bull; 20% OFF BUNDLE DISCOUNT</span>
          <h2 class="rc-outfit-title" id="rc-outfit-title">Signature Sunset Streetwear Outfit</h2>
        </div>
        <button type="button" class="rc-outfit-close-btn" id="rc-outfit-close">&#8592; Back to Solo Item</button>
      </div>
      <div class="rc-outfit-grid" id="rc-outfit-grid"></div>
      <div class="rc-outfit-footer">
        <div class="rc-outfit-summary">
          <div class="rc-outfit-formula" id="rc-outfit-formula">4 items selected</div>
          <div class="rc-outfit-total-row">
            <span class="rc-outfit-total-label" id="rc-outfit-total-label">BUNDLE TOTAL (20% OFF):</span>
            <span class="rc-outfit-orig-price" id="rc-outfit-orig-price">$194</span>
            <span class="rc-outfit-total-price" id="rc-outfit-total-price">$155.20</span>
            <span class="rc-outfit-discount-pill" id="rc-outfit-discount-pill">20% BUNDLE DISCOUNT &bull; SAVE $38.80</span>
          </div>
        </div>
        <button type="button" class="rc-outfit-buy-btn" id="rc-outfit-buy-btn">Add Bundle to Bag ($155.20 &bull; Save $38.80)</button>
      </div>
    `;
    document.body.appendChild(outfitShowcase);

    const spriteWrap = document.getElementById('shop-chloe-sprite');
    const dialogueBox = document.getElementById('shop-chloe-dialogue');
    const flirtPillEl = document.getElementById('shop-chloe-flirt-pill');
    const flirtTextEl = document.getElementById('shop-chloe-flirt-text');
    const itemTagEl = document.getElementById('chloe-item-tag');
    const itemTitleEl = document.getElementById('chloe-item-title');
    const textEl = document.getElementById('chloe-dialogue-text');
    const hintEl = document.getElementById('chloe-dialogue-hint');
    const btnYesOutfit = document.getElementById('chloe-btn-yes-outfit');
    const btnTip = document.getElementById('chloe-btn-tip');
    const outfitTitleEl = document.getElementById('rc-outfit-title');
    const outfitGridEl = document.getElementById('rc-outfit-grid');
    const outfitFormulaEl = document.getElementById('rc-outfit-formula');
    const outfitTotalLabelEl = document.getElementById('rc-outfit-total-label');
    const outfitOrigPriceEl = document.getElementById('rc-outfit-orig-price');
    const outfitTotalPriceEl = document.getElementById('rc-outfit-total-price');
    const outfitDiscountPillEl = document.getElementById('rc-outfit-discount-pill');
    const outfitBuyBtn = document.getElementById('rc-outfit-buy-btn');
    const outfitCloseBtn = document.getElementById('rc-outfit-close');

    let isHovered = false;
    let isTyping = false;
    let showingTip = false;
    let isOutfitOpen = false;
    let selectedOutfitCodes = new Set();
    let typeTimer = null;
    let talkTimer = null;
    let idleWinkInterval = null;
    let idleWinkTimeout = null;
    let currentFullText = '';
    let lastModelCode = '';

    // Remove any legacy stacked duplicate slices
    if (spriteWrap) {
      const oldStack = spriteWrap.querySelector('.voxel-3d-extrusion-stack');
      if (oldStack) oldStack.remove();
    }

    function showFlirtWhisper(show) {
      if (!flirtPillEl) return;
      if (show) {
        if (flirtTextEl) {
          flirtTextEl.textContent = flirtyWhispers[whisperIdx % flirtyWhispers.length];
          whisperIdx++;
        }
        flirtPillEl.classList.add('visible');
      } else {
        flirtPillEl.classList.remove('visible');
      }
    }

    function setChloePose(poseName) {
      if (!spriteWrap) return;
      const frames = spriteWrap.querySelectorAll('.shop-chloe-frame');
      let activeSrc = null;
      frames.forEach((img) => {
        const isAct = img.classList.contains(`frame-${poseName}`);
        img.classList.toggle('active', isAct);
        if (isAct) activeSrc = img.getAttribute('src');
      });
      if (activeSrc) {
        spriteWrap.querySelectorAll('.voxel-3d-slice').forEach((s) => {
          if (s.getAttribute('src') !== activeSrc) s.setAttribute('src', activeSrc);
        });
      }
    }

    function startTalkAnim() {
      stopTalkAnim();
      let toggle = false;
      setChloePose('talk');
      talkTimer = setInterval(() => {
        toggle = !toggle;
        setChloePose(toggle ? 'flirt1' : 'talk');
      }, 380);
    }

    function stopTalkAnim() {
      if (talkTimer) {
        clearInterval(talkTimer);
        talkTimer = null;
      }
      setChloePose('flirt1');
    }

    function resetIdleWinkCycle() {
      if (idleWinkInterval) {
        clearInterval(idleWinkInterval);
        idleWinkInterval = null;
      }
      if (idleWinkTimeout) {
        clearTimeout(idleWinkTimeout);
        idleWinkTimeout = null;
      }
    }

    let chloeClickBuffer = null;
    function getChloeClickBuffer(audioCtx) {
      if (chloeClickBuffer) return chloeClickBuffer;
      const sampleRate = audioCtx.sampleRate || 44100;
      const duration = 0.016; // 16ms soft click
      const numSamples = Math.floor(sampleRate * duration);
      chloeClickBuffer = audioCtx.createBuffer(1, numSamples, sampleRate);
      const data = chloeClickBuffer.getChannelData(0);
      for (let i = 0; i < numSamples; i++) {
        const t = i / numSamples;
        const env = Math.exp(-t * 6.5) * Math.sin(t * Math.PI);
        const noise = (Math.random() * 2 - 1) * 0.35;
        const tone = Math.sin(2 * Math.PI * 1800 * (i / sampleRate));
        data[i] = (tone * 0.65 + noise) * env;
      }
      return chloeClickBuffer;
    }

    function playDialogueCharTick(char, charIndex) {
      if (char === ' ') return;
      if (!char || char.trim() === '') return;
      const audioCtx = ensureShopAudioContext();
      if (!audioCtx || audioCtx.state !== 'running') return;
      try {
        const buf = getChloeClickBuffer(audioCtx);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const basePitch = 0.94 + (char.charCodeAt(0) % 7) * 0.02;
        const randomJitter = (Math.random() * 0.06 - 0.03);
        src.playbackRate.setValueAtTime(basePitch + randomJitter, audioCtx.currentTime);

        const tickFilter = audioCtx.createBiquadFilter();
        tickFilter.type = 'lowpass';
        tickFilter.frequency.setValueAtTime(2600, audioCtx.currentTime);

        const tickGain = audioCtx.createGain();
        tickGain.gain.setValueAtTime(0.026, audioCtx.currentTime);
        tickGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.016);

        src.connect(tickFilter);
        tickFilter.connect(tickGain);
        tickGain.connect(audioCtx.destination);

        src.start(audioCtx.currentTime);
        src.stop(audioCtx.currentTime + 0.018);
        src.onended = () => {
          try {
            src.disconnect();
            tickFilter.disconnect();
            tickGain.disconnect();
          } catch (_) {}
        };
      } catch (_) {}
    }

    function typeChloeLine(lineText, nextHintText) {
      if (typeTimer) clearInterval(typeTimer);
      currentFullText = lineText;
      isTyping = true;
      if (textEl) textEl.textContent = '';
      if (hintEl) hintEl.textContent = 'SKIP \u25B6';
      startTalkAnim();

      let charIdx = 0;
      typeTimer = setInterval(() => {
        charIdx++;
        if (textEl) {
          textEl.textContent = currentFullText.slice(0, charIdx);
        }
        const curChar = currentFullText[charIdx - 1];
        playDialogueCharTick(curChar, charIdx);
        if (charIdx >= currentFullText.length) {
          finishTyping(nextHintText);
        }
      }, 24);
    }
    const typeDialogue = typeChloeLine;

    function finishTyping(nextHintText) {
      if (typeTimer) {
        clearInterval(typeTimer);
        typeTimer = null;
      }
      isTyping = false;
      stopTalkAnim();
      if (textEl) textEl.textContent = currentFullText;
      if (hintEl) {
        hintEl.textContent = nextHintText || (showingTip ? 'CLICK FOR DESCRIPTION \u25B6' : 'CLICK FOR STYLING TIP \u25B6');
      }
    }

    function getOutfitItemsForCode(baseCode) {
      const entry = productCatalogNotes[baseCode];
      const pairedCodes = (entry && Array.isArray(entry.paired)) ? entry.paired : ['RC-301', 'RC-501', 'RC-101'];
      const allCodes = [baseCode];
      pairedCodes.forEach((c) => {
        if (c !== baseCode && masterCatalog[c] && !allCodes.includes(c)) {
          allCodes.push(c);
        }
      });
      return allCodes;
    }

    function formatMoney(num) {
      const rounded = Math.round(num * 100) / 100;
      return Number.isInteger(rounded) ? `$${rounded}` : `$${rounded.toFixed(2)}`;
    }

    function getWheelDiscountPct() {
      const saved = parseInt(sessionStorage.getItem('rc_wheel_discount') || '0', 10);
      return isNaN(saved) || saved <= 0 ? 0 : Math.min(50, saved);
    }

    function setWheelDiscountPct(pct) {
      const clean = Math.max(0, Math.min(50, parseInt(pct, 10) || 0));
      if (clean > 0) {
        sessionStorage.setItem('rc_wheel_discount', String(clean));
      } else {
        sessionStorage.removeItem('rc_wheel_discount');
      }
      localStorage.removeItem('rc_wheel_coupon_pct');
    }

    function applyWheelDiscountToHudPrice(modelCode) {
      // Keep showroom shelf prices clean — all coupons and wheel discounts are 1-time use applied at checkout after clicking the coupon icon!
      const priceEl = document.getElementById('hudPrice') || document.querySelector('.hud-price');
      if (!priceEl) return '';
      const code = modelCode || lastModelCode || 'RC-101';
      const catEntry = masterCatalog[code];
      let basePrice = catEntry ? catEntry.price : null;
      if (!basePrice) {
        const rawAttr = priceEl.getAttribute('data-orig-price');
        if (rawAttr) {
          basePrice = parseFloat(rawAttr);
        } else {
          const m = (priceEl.textContent || '').match(/\$\s*(\d+(?:\.\d+)?)/);
          if (m) {
            basePrice = parseFloat(m[1]);
            priceEl.setAttribute('data-orig-price', String(basePrice));
          }
        }
      } else {
        priceEl.setAttribute('data-orig-price', String(basePrice));
      }
      if (!basePrice) return priceEl.textContent.trim();
      const origStr = formatMoney(basePrice);
      priceEl.textContent = origStr;
      return origStr;
    }

    function computeBundlePricing(items) {
      const subtotal = items.reduce((sum, it) => sum + it.price, 0);
      const wheelPct = getWheelDiscountPct();
      const isBundled = items.length >= 2 || wheelPct > 0;
      const effectivePct = items.length >= 2 ? Math.max(20, wheelPct) : wheelPct;
      const discount = isBundled ? Math.round(subtotal * (effectivePct / 100) * 100) / 100 : 0;
      const total = Math.round((subtotal - discount) * 100) / 100;
      return {
        subtotal,
        discount,
        total,
        isBundled,
        effectivePct,
        subtotalStr: formatMoney(subtotal),
        discountStr: formatMoney(discount),
        totalStr: formatMoney(total)
      };
    }

    function updateOutfitSummaryUI(baseCode) {
      const allCodes = getOutfitItemsForCode(baseCode);
      const activeItems = allCodes
        .filter((c) => selectedOutfitCodes.has(c) && masterCatalog[c])
        .map((c) => masterCatalog[c]);

      const pricing = computeBundlePricing(activeItems);
      const itemBreakdown = activeItems.map((it) => `${it.model} ($${it.price})`).join(' + ');

      if (outfitFormulaEl) {
        if (pricing.isBundled) {
          outfitFormulaEl.textContent = `${itemBreakdown} = ${pricing.subtotalStr} \u2212 20% Bundle Discount (-${pricing.discountStr})`;
        } else {
          outfitFormulaEl.textContent = itemBreakdown || 'Select items to build outfit';
        }
      }
      if (outfitTotalLabelEl) {
        outfitTotalLabelEl.textContent = pricing.isBundled ? 'BUNDLE TOTAL (20% OFF):' : 'SOLO ITEM TOTAL:';
      }
      if (outfitOrigPriceEl) {
        outfitOrigPriceEl.textContent = pricing.subtotalStr;
        outfitOrigPriceEl.style.display = pricing.isBundled ? 'inline-block' : 'none';
      }
      if (outfitTotalPriceEl) {
        outfitTotalPriceEl.textContent = pricing.totalStr;
      }
      if (outfitDiscountPillEl) {
        if (pricing.isBundled) {
          outfitDiscountPillEl.classList.remove('inactive');
          outfitDiscountPillEl.innerHTML = `20% BUNDLE DISCOUNT &bull; SAVE ${pricing.discountStr}`;
        } else {
          outfitDiscountPillEl.classList.add('inactive');
          outfitDiscountPillEl.textContent = 'SELECT 1+ PAIRED ITEM FOR 20% OFF BUNDLE';
        }
      }
      if (outfitBuyBtn) {
        if (pricing.isBundled) {
          outfitBuyBtn.textContent = `Add Bundle to Bag (${pricing.totalStr} \u2022 Save ${pricing.discountStr})`;
        } else {
          outfitBuyBtn.textContent = `Add Item to Bag (${pricing.totalStr})`;
        }
      }
      if (isOutfitOpen && btnYesOutfit) {
        btnYesOutfit.textContent = pricing.isBundled
          ? `ADD BUNDLE (20% OFF \u2022 ${pricing.totalStr}) \u2726`
          : `ADD ITEM (${pricing.totalStr}) \u2726`;
      }
      return {
        ...pricing,
        count: activeItems.length,
        activeItems
      };
    }

    function renderOutfitShowcase(baseCode) {
      if (!outfitGridEl) return;
      const entry = productCatalogNotes[baseCode] || {};
      const allCodes = getOutfitItemsForCode(baseCode);

      if (outfitTitleEl) {
        outfitTitleEl.textContent = entry.outfitTitle || `${baseCode} Curated Complete Outfit`;
      }

      outfitGridEl.innerHTML = '';
      allCodes.forEach((code, idx) => {
        const item = masterCatalog[code];
        if (!item) return;
        const isBase = (idx === 0);
        const isSelected = selectedOutfitCodes.has(code);

        const card = document.createElement('div');
        card.className = 'rc-outfit-card' +
          (isBase ? ' is-base' : '') +
          (isSelected ? ' selected' : ' deselected');
        card.innerHTML = `
          <div class="rc-outfit-card-top">
            <span class="rc-outfit-role-tag">${isBase ? 'FEATURED ITEM' : ('PAIRED \u2022 ' + item.role)}</span>
            <span class="rc-outfit-check">${isSelected ? '&#10003;' : ''}</span>
          </div>
          <div class="rc-outfit-img-wrap">
            <img class="rc-outfit-img" src="${item.img}" alt="${item.title}">
          </div>
          <div class="rc-outfit-card-info">
            <div class="rc-outfit-card-code">${item.model}</div>
            <div class="rc-outfit-card-name">${item.title}</div>
            <div class="rc-outfit-card-price">$${item.price}</div>
          </div>
        `;
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isBase) return; // Keep the featured item anchored in its outfit
          if (selectedOutfitCodes.has(code)) {
            selectedOutfitCodes.delete(code);
          } else {
            selectedOutfitCodes.add(code);
          }
          renderOutfitShowcase(baseCode);
        });
        outfitGridEl.appendChild(card);
      });

      return updateOutfitSummaryUI(baseCode);
    }

    function openOutfitShowcase() {
      const kickerEl = document.getElementById('hudKicker') || document.querySelector('.hud-kicker');
      const baseCode = (kickerEl ? kickerEl.textContent.trim() : lastModelCode) || 'RC-101';
      const allCodes = getOutfitItemsForCode(baseCode);
      selectedOutfitCodes = new Set(allCodes);

      const summary = renderOutfitShowcase(baseCode);
      isOutfitOpen = true;
      document.body.classList.add('outfit-view-active');
      if (outfitShowcase) outfitShowcase.classList.add('open');

      if (btnYesOutfit) {
        btnYesOutfit.textContent = `ADD BUNDLE (20% OFF \u2022 ${summary.totalStr}) \u2726`;
      }
      if (btnTip) {
        btnTip.textContent = 'HIDE OUTFIT \u2715';
      }

      const pairedNames = summary.activeItems
        .slice(1)
        .map((it) => `${it.title} ($${it.price})`)
        .join(', ');
      const baseItem = masterCatalog[baseCode];
      const basePriceStr = baseItem ? ` ($${baseItem.price})` : '';
      const outfitSpeech = `Here's the complete outfit! I paired your ${baseCode}${basePriceStr} with ${pairedNames}. Normally ${summary.subtotalStr}, your 20% bundle discount saves you ${summary.discountStr} — bringing all ${summary.count} pieces to ${summary.totalStr}!`;
      typeChloeLine(outfitSpeech);
    }

    function closeOutfitShowcase(silent) {
      isOutfitOpen = false;
      document.body.classList.remove('outfit-view-active');
      if (outfitShowcase) outfitShowcase.classList.remove('open');

      const kickerEl = document.getElementById('hudKicker') || document.querySelector('.hud-kicker');
      const baseCode = (kickerEl ? kickerEl.textContent.trim() : lastModelCode) || 'RC-101';
      const allItems = getOutfitItemsForCode(baseCode).map((c) => masterCatalog[c]).filter(Boolean);
      const pricing = computeBundlePricing(allItems);

      if (btnYesOutfit) {
        btnYesOutfit.textContent = `YES, SHOW OUTFIT (20% OFF \u2022 ${pricing.totalStr}) \u2726`;
      }
      if (btnTip) {
        btnTip.textContent = showingTip ? 'DESCRIPTION \u25B6' : 'STYLING TIP \u25B6';
      }

      if (!silent) {
        const entry = productCatalogNotes[baseCode];
        if (entry) {
          typeChloeLine(entry.desc);
        }
      }
    }

    // Clear stale bag count and any saved coupons on reload or when not coming straight from Shop/Arcade
    try {
      localStorage.removeItem('rc_active_checkout_coupon');
      localStorage.removeItem('rc_used_coupons_v1');
      localStorage.removeItem('rc_outfit_coupon_unlocked');
      localStorage.removeItem('rc_wheel_coupon_pct');

      const navEntries = (window.performance && window.performance.getEntriesByType)
        ? window.performance.getEntriesByType('navigation')
        : [];
      const isReload = navEntries.length > 0 && navEntries[0].type === 'reload';
      const ref = document.referrer || '';
      const isFromShopOrArcade = /(hat|deskmat|hoodie|tee|joggers|longsleeve|gearbag)_preview\.html|games\.html|arcade\.html/i.test(ref);
      if (isReload || !isFromShopOrArcade) {
        sessionStorage.removeItem('rc_moment_coupon_v1');
        sessionStorage.removeItem('rc_wheel_discount');
      }
      if (isReload && !isFromShopOrArcade) {
        sessionStorage.removeItem('rc_shop_bag_count');
        sessionStorage.removeItem('rc_shop_cart_items_v1');
      }
    } catch (_) {}

    // =========================================================================
    // STORE CART, CUSTOMER LOGIN SYNC & IN-THE-MOMENT 1-TIME COUPON SYSTEM
    // =========================================================================
    function getAccountsDb() {
      try {
        return JSON.parse(localStorage.getItem('rc_accounts_db_v1') || '{}') || {};
      } catch (_) {
        return {};
      }
    }

    const IS_LOCAL_API_HOST = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    function saveAccountsDb(db) {
      localStorage.setItem('rc_accounts_db_v1', JSON.stringify(db));
      if (!IS_LOCAL_API_HOST) return;
      try {
        const leaderboard = JSON.parse(localStorage.getItem('rc_leaderboard_v1') || '[]') || [];
        const orders = JSON.parse(localStorage.getItem('rc_shop_orders_v1') || '[]') || [];
        const stats = JSON.parse(localStorage.getItem('rc_site_stats_v1') || '{}') || {};
        fetch('/api/arcade-db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accounts: db, leaderboard, orders, stats, updatedAt: new Date().toISOString() })
        }).catch(() => {});
      } catch (_) {}
    }

    async function loadStoreAccountsFromServer() {
      if (!IS_LOCAL_API_HOST) return;
      try {
        const res = await fetch('/api/arcade-db', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.accounts && typeof data.accounts === 'object') {
            const localDb = getAccountsDb();
            Object.entries(data.accounts).forEach(([k, srv]) => {
              const loc = localDb[k];
              if (!loc) {
                localDb[k] = srv;
              } else {
                localDb[k] = {
                  ...srv,
                  ...loc,
                  xp: Math.max(loc.xp || 0, srv.xp || 0),
                  bestScore: Math.max(loc.bestScore || 0, srv.bestScore || 0)
                };
              }
            });
            localStorage.setItem('rc_accounts_db_v1', JSON.stringify(localDb));
            syncActiveAccountToGlobalStorage();
            if (typeof renderStoreCouponDockAndCheckout === 'function') {
              renderStoreCouponDockAndCheckout();
            }
          }
        }
      } catch (_) {}
    }

    function getCurrentUsername() {
      return (localStorage.getItem('rc_current_user_v1') || '').trim();
    }

    function syncActiveAccountToGlobalStorage() {
      const uname = getCurrentUsername();
      if (!uname) return;
      const db = getAccountsDb();
      const acct = db[uname.toLowerCase()];
      if (!acct) return;
      localStorage.setItem('rc_canopy_xp', String(acct.xp || 0));
      localStorage.setItem('rc_synth_flight_best', String(acct.bestScore || 0));
    }

    function syncGlobalStorageToActiveAccount() {
      const uname = getCurrentUsername();
      if (!uname) return;
      const db = getAccountsDb();
      const key = uname.toLowerCase();
      const existing = db[key] || { username: uname, pin: '', xp: 0, bestScore: 0 };
      existing.username = uname;
      existing.xp = Math.max(existing.xp || 0, getCanopyXp());
      existing.updatedAt = new Date().toISOString();
      db[key] = existing;
      saveAccountsDb(db);
      localStorage.setItem('rc_canopy_xp', String(existing.xp));
    }

    function loginCustomerInStore(rawUsername, rawPin) {
      const cleanName = (rawUsername || '').trim().replace(/^@+/, '');
      if (!cleanName) return { ok: false, msg: 'Enter a username to log in!' };
      const db = getAccountsDb();
      const key = cleanName.toLowerCase();
      const pin = (rawPin || '').trim();
      const prevUser = getCurrentUsername();

      if (db[key]) {
        if (db[key].pin && pin && db[key].pin !== pin) {
          return { ok: false, msg: 'Incorrect PIN for @' + db[key].username };
        }
        if (!prevUser) {
          db[key].xp = Math.max(db[key].xp || 0, getCanopyXp());
        }
      } else {
        db[key] = {
          username: cleanName,
          pin: pin,
          xp: getCanopyXp(),
          bestScore: parseInt(localStorage.getItem('rc_synth_flight_best') || '0', 10) || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      localStorage.setItem('rc_current_user_v1', db[key].username);
      saveAccountsDb(db);
      syncActiveAccountToGlobalStorage();
      renderStoreCouponDockAndCheckout();
      return { ok: true, account: db[key] };
    }

    syncActiveAccountToGlobalStorage();

    function getCanopyXp() {
      return Math.max(0, parseInt(localStorage.getItem('rc_canopy_xp') || '0', 10) || 0);
    }

    function getUsedCouponsMap() {
      return {};
    }

    function getMomentCoupon() {
      try {
        const raw = sessionStorage.getItem('rc_moment_coupon_v1');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return (parsed && parsed.code) ? parsed : null;
      } catch (_) {
        return null;
      }
    }

    function setMomentCoupon(couponObj) {
      if (!couponObj || !couponObj.code) {
        sessionStorage.removeItem('rc_moment_coupon_v1');
        return;
      }
      sessionStorage.setItem('rc_moment_coupon_v1', JSON.stringify(couponObj));
    }

    function clearMomentCoupon() {
      sessionStorage.removeItem('rc_moment_coupon_v1');
      sessionStorage.removeItem('rc_wheel_discount');
      localStorage.removeItem('rc_active_checkout_coupon');
      localStorage.removeItem('rc_wheel_coupon_pct');
    }

    function markCouponAsUsedOneTime(code) {
      if (!code) return;
      clearMomentCoupon();
    }

    function getActiveCheckoutCoupon() {
      const c = getMomentCoupon();
      return c ? c.code : '';
    }

    function setActiveCheckoutCoupon(code) {
      if (!code) {
        clearMomentCoupon();
      }
    }

    function getAllStoreCoupons() {
      const c = getMomentCoupon();
      if (!c) return [];
      return [{
        ...c,
        unlocked: true,
        redeemed: false
      }];
    }

    function getCartItems() {
      try {
        const parsed = JSON.parse(sessionStorage.getItem('rc_shop_cart_items_v1') || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    }

    function saveCartItems(items) {
      sessionStorage.setItem('rc_shop_cart_items_v1', JSON.stringify(items));
      const totalQty = items.reduce((sum, it) => sum + (it.qty || 1), 0);
      setShopBagCount(totalQty);
    }

    function addItemToCartByCode(code, qtyDelta = 1) {
      const entry = masterCatalog[code] || {
        model: code,
        title: (document.getElementById('hudTitle')?.textContent || 'Retrocanopy Vault Piece').trim(),
        price: 32,
        img: 'assets/merch/hat_front_floating.png?v=94'
      };
      if (entry.tier6Only || entry.model === 'RC-309') {
        const curXp = Math.max(
          getCanopyXp(),
          parseInt(localStorage.getItem('rc_synth_flight_best') || '0', 10) || 0
        );
        if (curXp < 25000) {
          playCutsceneBonkSfx('bonk');
          typeChloeLine(
            `Hold up! The Limited Edition White & 24K Gold Hoodie (RC-309) is strictly reserved for Stage 6: 👑 Eternal Sanctuary Tree members (25,000+ Growth). You're at ${curXp.toLocaleString()} Growth — keep growing your Tree to earn yours!`
          );
          return false;
        }
      }
      const items = getCartItems();
      const existing = items.find((it) => it.model === entry.model);
      if (existing) {
        existing.qty = Math.max(1, (existing.qty || 1) + qtyDelta);
      } else {
        items.push({
          model: entry.model,
          title: entry.title,
          price: entry.price,
          img: entry.img,
          qty: Math.max(1, qtyDelta)
        });
      }
      saveCartItems(items);
      renderStoreCouponDockAndCheckout();
    }

    function getShopBagCount() {
      const items = getCartItems();
      if (items.length > 0) {
        return items.reduce((sum, it) => sum + (it.qty || 1), 0);
      }
      const saved = parseInt(sessionStorage.getItem('rc_shop_bag_count') || '0', 10);
      return (!isNaN(saved) && saved > 0) ? saved : 0;
    }

    function setShopBagCount(count) {
      const safeCount = Math.max(0, parseInt(count, 10) || 0);
      if (safeCount > 0) {
        sessionStorage.setItem('rc_shop_bag_count', String(safeCount));
      } else {
        sessionStorage.removeItem('rc_shop_bag_count');
      }
      const bagBtnEl = document.getElementById('bagBtn');
      if (bagBtnEl) {
        bagBtnEl.textContent = `Bag (${safeCount})`;
      }
    }

    // Restore persisted bag count when switching between Shop category tabs
    const initialBagCount = getShopBagCount();
    setShopBagCount(initialBagCount);

    // Listen to solo "Add to Bag" button clicks so actual product items are stored for Checkout
    document.querySelectorAll('.hud-buy-btn').forEach((buyBtn) => {
      buyBtn.addEventListener('click', () => {
        const kickerEl = document.getElementById('hudKicker') || document.querySelector('.hud-kicker');
        const activeCode = (kickerEl ? kickerEl.textContent.trim() : lastModelCode) || 'RC-101';
        setTimeout(() => {
          addItemToCartByCode(activeCode, 1);
        }, 10);
      });
    });

    function addCurrentOutfitToBag() {
      const kickerEl = document.getElementById('hudKicker') || document.querySelector('.hud-kicker');
      const baseCode = (kickerEl ? kickerEl.textContent.trim() : lastModelCode) || 'RC-101';
      const summary = updateOutfitSummaryUI(baseCode);

      summary.activeItems.forEach((it) => {
        addItemToCartByCode(it.model, 1);
      });

      renderStoreCouponDockAndCheckout();

      if (outfitBuyBtn) {
        outfitBuyBtn.textContent = summary.isBundled
          ? `Outfit Added (${summary.count} Items) \u2713`
          : `Item Added (${summary.totalStr}) \u2713`;
        setTimeout(() => {
          updateOutfitSummaryUI(baseCode);
        }, 1400);
      }
      if (summary.isBundled) {
        typeChloeLine(`Awesome choice! I added all ${summary.count} pieces of your outfit straight to the bag!`);
      } else {
        typeChloeLine(`Added your ${baseCode} (${summary.totalStr}) straight to the bag!`);
      }
    }

    // =========================================================================
    // HEADER CUSTOMER LOGIN, ARCADE LINK, FLOATING COUPON ICON DOCK & CHECKOUT
    // =========================================================================
    const CANOPY_TREE_TIERS = [
      { stage: 1, min: 0,     next: 500,   icon: '🌱', name: 'Neon Sprout' },
      { stage: 2, min: 500,   next: 1500,  icon: '🌿', name: 'Cyber Sapling' },
      { stage: 3, min: 1500,  next: 4000,  icon: '🌳', name: 'Sunset Willow' },
      { stage: 4, min: 4000,  next: 10000, icon: '✨', name: 'Astral Canopy' },
      { stage: 5, min: 10000, next: 25000, icon: '🔥', name: 'Solar Valkyrie Tree' },
      { stage: 6, min: 25000, next: null,  icon: '👑', name: 'Eternal Sanctuary Tree' }
    ];

    function getCanopyTreeTier(score) {
      const s = Math.max(0, parseInt(score || 0, 10) || 0);
      let match = CANOPY_TREE_TIERS[0];
      CANOPY_TREE_TIERS.forEach((t) => {
        if (s >= t.min) match = t;
      });
      return match;
    }

    function addCanopyGrowth(delta) {
      const cur = Math.max(
        getCanopyXp(),
        parseInt(localStorage.getItem('rc_synth_flight_best') || '0', 10) || 0
      );
      const next = Math.max(0, cur + Math.round(delta || 0));
      localStorage.setItem('rc_canopy_xp', String(next));
      syncGlobalStorageToActiveAccount();
      return next;
    }

    const navRightEl = document.querySelector('.nav-right');
    let headerUserBtn = null;
    let headerArcadeBtn = null;
    let headerCouponsBtn = null;
    function formatCompactHandle(u) {
      if (!u) return '';
      const cleaned = String(u).replace(/\s*\(owner\)\s*/i, '').trim();
      const firstToken = cleaned.split(/\s+/)[0] || cleaned;
      return firstToken.length > 12 ? firstToken.slice(0, 12) : firstToken;
    }
    if (navRightEl) {
      headerUserBtn = document.createElement('button');
      headerUserBtn.type = 'button';
      headerUserBtn.className = 'rc-arcade-xp-pill';
      headerUserBtn.id = 'rcHeaderUserBtn';
      headerUserBtn.style.borderColor = 'rgba(0, 245, 155, 0.55)';
      headerUserBtn.style.background = 'rgba(0, 245, 155, 0.14)';
      headerUserBtn.style.color = '#b8ffdf';
      headerUserBtn.title = getCurrentUsername()
        ? `Logged in as @${getCurrentUsername()}`
        : 'Customer Login & Personal Canopy Tree';
      headerUserBtn.innerHTML = getCurrentUsername()
        ? `&#128100; @${formatCompactHandle(getCurrentUsername())}`
        : `&#128100; Login`;

      const initTree = getCanopyTreeTier(getCanopyXp());
      headerArcadeBtn = document.createElement('a');
      headerArcadeBtn.href = 'games.html';
      headerArcadeBtn.className = 'rc-arcade-xp-pill';
      headerArcadeBtn.id = 'rcHeaderArcadeBtn';
      headerArcadeBtn.title = `Stage ${initTree.stage}: ${initTree.name} • Play Synth's Flight to Grow Your Canopy Tree`;
      headerArcadeBtn.innerHTML = `<span id="rcHeaderTreeIcon">${initTree.icon}</span> Tree: <span id="rcHeaderXpVal">${getCanopyXp().toLocaleString()}</span>`;

      headerCouponsBtn = document.createElement('button');
      headerCouponsBtn.type = 'button';
      headerCouponsBtn.className = 'rc-coupon-vault-pill';
      headerCouponsBtn.id = 'rcHeaderCouponsBtn';
      headerCouponsBtn.title = 'Active 1-Time Coupon Won Just Now';
      headerCouponsBtn.innerHTML = `&#127915; Coupon`;

      const bagBtnRef = document.getElementById('bagBtn');
      if (bagBtnRef) {
        navRightEl.insertBefore(headerUserBtn, bagBtnRef);
        navRightEl.insertBefore(headerArcadeBtn, bagBtnRef);
        navRightEl.insertBefore(headerCouponsBtn, bagBtnRef);
      } else {
        navRightEl.appendChild(headerUserBtn);
        navRightEl.appendChild(headerArcadeBtn);
        navRightEl.appendChild(headerCouponsBtn);
      }
    }

    // Floating Clickable Coupon Icon Dock (Only shows when a coupon was just won in that moment!)
    const couponDockEl = document.createElement('div');
    couponDockEl.className = 'rc-store-coupon-dock';
    couponDockEl.id = 'rcStoreCouponDock';
    document.body.appendChild(couponDockEl);

    // Checkout Modal
    const checkoutBackdropEl = document.createElement('div');
    checkoutBackdropEl.className = 'rc-checkout-modal-backdrop';
    checkoutBackdropEl.id = 'rcCheckoutModalBackdrop';
    checkoutBackdropEl.innerHTML = `
      <div class="rc-checkout-modal" onclick="event.stopPropagation()">
        <div class="rc-checkout-top">
          <div>
            <div class="rc-checkout-title">&#128717;&#65039; RETROCANOPY CHECKOUT</div>
            <div class="rc-checkout-sub">1-Time Coupons apply <strong>only in the moment you win them</strong> from the Wheel or Synth's Flight (we don't save coupons).</div>
          </div>
          <button type="button" class="rc-checkout-close-btn" id="rcCheckoutCloseBtn">Close &#10005;</button>
        </div>

        <!-- CUSTOMER LOGIN & PERSONAL CANOPY TREE STAGE BAR INSIDE STORE MODAL -->
        <div style="background:rgba(0,240,255,0.07);border:1.5px solid rgba(0,240,255,0.38);border-radius:14px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div style="display:flex;flex-direction:column;gap:2px;">
            <span style="font-family:'Orbitron',sans-serif;font-size:0.6rem;font-weight:800;letter-spacing:0.12em;color:#00f0ff;">PERSONAL CANOPY TREE EVOLUTION &bull; +250 GROWTH PER MERCH ITEM</span>
            <span id="rcModalAccountStatus" style="font-size:0.8rem;color:#ffffff;">Sign in with your Arcade Username to grow your Personal Canopy Tree!</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <input type="text" id="rcStoreUsernameInput" maxlength="18" placeholder="Username (e.g. Joseph)" style="background:rgba(5,4,14,0.9);border:1.5px solid rgba(0,240,255,0.5);color:#fff;font-family:'Orbitron',sans-serif;font-size:0.7rem;padding:7px 12px;border-radius:999px;outline:none;width:155px;">
            <input type="password" id="rcStorePinInput" maxlength="8" placeholder="PIN (Opt)" style="background:rgba(5,4,14,0.9);border:1.5px solid rgba(0,240,255,0.5);color:#fff;font-family:'Orbitron',sans-serif;font-size:0.7rem;padding:7px 10px;border-radius:999px;outline:none;width:88px;">
            <button type="button" id="rcStoreLoginBtn" style="background:linear-gradient(135deg,#00f59b,#00f0ff);color:#04030a;border:none;font-family:'Orbitron',sans-serif;font-size:0.66rem;font-weight:900;padding:8px 14px;border-radius:999px;cursor:pointer;">&#128100; LOGIN</button>
          </div>
        </div>

        <div class="rc-checkout-grid">
          <!-- LEFT: ACTIVE IN-THE-MOMENT 1-TIME COUPON -->
          <div class="rc-checkout-section-box">
            <div class="rc-section-heading">
              <span>&#127915; CURRENT 1-TIME COUPON (NOT SAVED)</span>
              <a href="games.html" style="color:#ffae00;text-decoration:none;font-size:0.65rem;">&#129417; Play Synth's Flight &rarr;</a>
            </div>
            <div class="rc-checkout-coupons-grid" id="rcCheckoutCouponsGrid"></div>
          </div>

          <!-- RIGHT: BAG ITEMS & CHECKOUT ORDER SUMMARY -->
          <div class="rc-checkout-section-box">
            <div class="rc-section-heading">
              <span>&#128717;&#65039; YOUR BAG &amp; CHECKOUT TOTAL</span>
              <span id="rcCheckoutBagCountTag" style="color:rgba(255,255,255,0.65);font-size:0.65rem;">0 Items</span>
            </div>
            <div class="rc-bag-items-list" id="rcBagItemsList"></div>
            <div class="rc-summary-lines" id="rcSummaryLines"></div>
            <button type="button" class="rc-complete-checkout-btn" id="rcCompleteCheckoutBtn">
              COMPLETE CHECKOUT
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(checkoutBackdropEl);

    const rcStoreLoginBtn = document.getElementById('rcStoreLoginBtn');
    const rcStoreUsernameInput = document.getElementById('rcStoreUsernameInput');
    const rcStorePinInput = document.getElementById('rcStorePinInput');
    if (rcStoreLoginBtn) {
      rcStoreLoginBtn.addEventListener('click', () => {
        const res = loginCustomerInStore(
          rcStoreUsernameInput ? rcStoreUsernameInput.value : '',
          rcStorePinInput ? rcStorePinInput.value : ''
        );
        if (!res.ok) {
          playCutsceneBonkSfx('bonk');
          typeChloeLine(res.msg);
          return;
        }
        playCutsceneBonkSfx('jackpot_fanfare');
        const t = getCanopyTreeTier(res.account.xp || 0);
        typeChloeLine(`Welcome back @${res.account.username}! Your Canopy Tree is at Stage ${t.stage}: ${t.icon} ${t.name} (${(res.account.xp || 0).toLocaleString()} Growth)!`);
      });
    }
    if (headerUserBtn) {
      headerUserBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openStoreCheckoutModal();
      });
    }

    function handleCouponIconClick(couponObj) {
      if (!couponObj) return;
      openStoreCheckoutModal();
    }

    function openStoreCheckoutModal() {
      renderStoreCouponDockAndCheckout();
      checkoutBackdropEl.classList.add('open');
    }

    function closeStoreCheckoutModal() {
      checkoutBackdropEl.classList.remove('open');
    }

    const bagBtnMain = document.getElementById('bagBtn');
    if (bagBtnMain) {
      bagBtnMain.addEventListener('click', (e) => {
        e.stopPropagation();
        openStoreCheckoutModal();
      });
    }
    if (headerCouponsBtn) {
      headerCouponsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openStoreCheckoutModal();
      });
    }
    const rcCheckoutCloseBtn = document.getElementById('rcCheckoutCloseBtn');
    if (rcCheckoutCloseBtn) {
      rcCheckoutCloseBtn.addEventListener('click', closeStoreCheckoutModal);
    }
    checkoutBackdropEl.addEventListener('click', closeStoreCheckoutModal);

    function renderStoreCouponDockAndCheckout() {
      const xp = Math.max(
        getCanopyXp(),
        parseInt(localStorage.getItem('rc_synth_flight_best') || '0', 10) || 0
      );
      const treeTier = getCanopyTreeTier(xp);
      const curUser = getCurrentUsername();
      const activeCouponObj = getMomentCoupon();

      if (headerUserBtn) {
        headerUserBtn.title = curUser
          ? `Logged in as @${curUser} • ${treeTier.icon} ${treeTier.name} (${xp.toLocaleString()} Growth)`
          : 'Customer Login & Personal Canopy Tree';
        headerUserBtn.innerHTML = curUser
          ? `&#128100; @${formatCompactHandle(curUser)}`
          : `&#128100; Login`;
      }
      const nextStepText = treeTier.next
        ? `Next Stage at <strong>${treeTier.next.toLocaleString()}</strong>`
        : `<strong>MAX ETERNAL STAGE</strong>`;
      const modalAcctStatusEl = document.getElementById('rcModalAccountStatus');
      if (modalAcctStatusEl) {
        modalAcctStatusEl.innerHTML = curUser
          ? `<span style="color:#00f59b;">&#10003; <strong>@${curUser}</strong> &bull; ${treeTier.icon} Stage ${treeTier.stage}: <strong>${treeTier.name}</strong> (${xp.toLocaleString()} Growth &bull; ${nextStepText})</span>`
          : `${treeTier.icon} Stage ${treeTier.stage}: <strong>${treeTier.name}</strong> (${xp.toLocaleString()} Growth &bull; ${nextStepText}) &mdash; Sign in to save your Tree!`;
      }
      if (rcStoreUsernameInput && curUser && !rcStoreUsernameInput.value) {
        rcStoreUsernameInput.value = curUser;
      }

      const treeIconHeaderEl = document.getElementById('rcHeaderTreeIcon');
      if (treeIconHeaderEl) treeIconHeaderEl.textContent = treeTier.icon;
      const xpHeaderEl = document.getElementById('rcHeaderXpVal');
      if (xpHeaderEl) xpHeaderEl.textContent = xp.toLocaleString();
      if (headerArcadeBtn) {
        headerArcadeBtn.title = `Stage ${treeTier.stage}: ${treeTier.name} (${xp.toLocaleString()} Growth) • Play Synth's Flight to Grow Your Canopy Tree`;
      }

      // Only show header coupon pill when they have an active in-the-moment coupon from the wheel or game!
      if (headerCouponsBtn) {
        if (activeCouponObj) {
          headerCouponsBtn.style.display = 'inline-flex';
          headerCouponsBtn.classList.add('has-active-coupon');
          headerCouponsBtn.innerHTML = `&#127915; ${activeCouponObj.code} (${activeCouponObj.shortLabel}) &#10003;`;
        } else {
          headerCouponsBtn.style.display = 'none';
          headerCouponsBtn.classList.remove('has-active-coupon');
        }
      }

      // 1. Top-Right Coupon Banner: ONLY shown if they just won a coupon from the wheel or game in this moment!
      if (couponDockEl) {
        couponDockEl.innerHTML = '';
        if (activeCouponObj) {
          couponDockEl.style.display = 'flex';
          const banner = document.createElement('div');
          banner.className = 'rc-active-coupon-banner';
          banner.innerHTML = `&#10003; ${activeCouponObj.icon} ${activeCouponObj.code} (${activeCouponObj.shortLabel}) &bull; WON JUST NOW (1-TIME USE) &rarr;`;
          banner.addEventListener('click', openStoreCheckoutModal);
          couponDockEl.appendChild(banner);
        } else {
          couponDockEl.style.display = 'none';
        }
      }

      // 2. Render Modal Coupon Section (Only the single coupon won in that moment, or empty state)
      const modalGrid = document.getElementById('rcCheckoutCouponsGrid');
      if (modalGrid) {
        modalGrid.innerHTML = '';
        if (activeCouponObj) {
          const card = document.createElement('div');
          card.className = 'rc-modal-coupon-btn active-checkout';
          card.innerHTML = `
            <div style="font-size:1.35rem;">${activeCouponObj.icon}</div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-family:'Orbitron',sans-serif;font-size:0.74rem;font-weight:900;color:#ffae00;">${activeCouponObj.code} &bull; ${activeCouponObj.title}</span>
              </div>
              <div style="font-size:0.74rem;color:rgba(255,255,255,0.82);margin-top:2px;">${activeCouponObj.desc || 'Won just now • 1-Time Use in This Moment (Not Saved)'}</div>
              <div style="font-family:'Orbitron',sans-serif;font-size:0.58rem;font-weight:800;margin-top:4px;color:#00f59b;">&#10003; ACTIVE FOR THIS CHECKOUT ONLY (EXPIRES AFTER USE)</div>
            </div>
          `;
          modalGrid.appendChild(card);
        } else {
          const emptyCouponBox = document.createElement('div');
          emptyCouponBox.style.cssText = 'padding:18px 14px;border-radius:12px;border:1px dashed rgba(255,255,255,0.18);background:rgba(0,0,0,0.35);text-align:center;color:rgba(255,255,255,0.72);font-size:0.8rem;line-height:1.5;';
          emptyCouponBox.innerHTML = `
            <div style="font-family:'Orbitron',sans-serif;font-size:0.72rem;font-weight:800;color:#ffae00;margin-bottom:6px;">NO ACTIVE COUPON IN THIS MOMENT</div>
            1-Time Coupons are <strong>not saved</strong>.<br>
            You only get a coupon from what you <strong>just won right now</strong> on the <strong>Prize Wheel</strong> or in <strong>Synth's Flight</strong>!
          `;
          modalGrid.appendChild(emptyCouponBox);
        }
      }

      // 3. Render Bag Items & Checkout Calculation
      const bagListEl = document.getElementById('rcBagItemsList');
      const summaryLinesEl = document.getElementById('rcSummaryLines');
      const bagCountTagEl = document.getElementById('rcCheckoutBagCountTag');
      const checkoutBtnEl = document.getElementById('rcCompleteCheckoutBtn');
      const items = getCartItems();
      const totalQty = items.reduce((s, it) => s + (it.qty || 1), 0);

      if (bagCountTagEl) {
        bagCountTagEl.textContent = `${totalQty} ${totalQty === 1 ? 'Item' : 'Items'}`;
      }

      if (bagListEl) {
        bagListEl.innerHTML = '';
        if (items.length === 0) {
          const kickerEl = document.getElementById('hudKicker') || document.querySelector('.hud-kicker');
          const curCode = (kickerEl ? kickerEl.textContent.trim() : lastModelCode) || 'RC-101';
          const curEntry = masterCatalog[curCode] || masterCatalog['RC-101'];
          const emptyDiv = document.createElement('div');
          emptyDiv.style.cssText = 'padding:16px;text-align:center;color:rgba(255,255,255,0.68);font-size:0.82rem;';
          emptyDiv.innerHTML = `
            Your bag is currently empty.<br>
            <button type="button" id="rcQuickAddCurrentBtn" style="margin-top:10px;padding:8px 16px;border-radius:999px;border:1px solid #00f0ff;background:rgba(0,240,255,0.15);color:#fff;font-family:'Orbitron',sans-serif;font-size:0.68rem;font-weight:800;cursor:pointer;">
              + Add Current Item (${curEntry.model} &bull; $${curEntry.price}) to Bag
            </button>
          `;
          bagListEl.appendChild(emptyDiv);
          setTimeout(() => {
            const qBtn = document.getElementById('rcQuickAddCurrentBtn');
            if (qBtn) {
              qBtn.addEventListener('click', () => addItemToCartByCode(curEntry.model, 1));
            }
          }, 0);
        } else {
          items.forEach((it) => {
            const row = document.createElement('div');
            row.className = 'rc-bag-item-row';
            row.innerHTML = `
              <img class="rc-bag-item-img" src="${it.img}" alt="${it.title}">
              <div class="rc-bag-item-info">
                <div class="rc-bag-item-code">${it.model} &bull; $${it.price} each</div>
                <div class="rc-bag-item-title">${it.title}</div>
              </div>
              <div class="rc-bag-item-controls">
                <button type="button" class="rc-qty-btn" data-act="dec" data-code="${it.model}">&minus;</button>
                <span style="font-family:'Orbitron',sans-serif;font-size:0.75rem;font-weight:800;min-width:18px;text-align:center;">${it.qty}</span>
                <button type="button" class="rc-qty-btn" data-act="inc" data-code="${it.model}">+</button>
              </div>
            `;
            row.querySelectorAll('.rc-qty-btn').forEach((b) => {
              b.addEventListener('click', () => {
                const act = b.getAttribute('data-act');
                const code = b.getAttribute('data-code');
                const curItems = getCartItems();
                const idx = curItems.findIndex((x) => x.model === code);
                if (idx !== -1) {
                  if (act === 'inc') curItems[idx].qty++;
                  else curItems[idx].qty--;
                  if (curItems[idx].qty <= 0) curItems.splice(idx, 1);
                  saveCartItems(curItems);
                  renderStoreCouponDockAndCheckout();
                }
              });
            });
            bagListEl.appendChild(row);
          });
        }
      }

      const subtotal = items.reduce((sum, it) => sum + it.price * (it.qty || 1), 0);
      let discountAmt = 0;
      if (subtotal > 0 && activeCouponObj) {
        if (activeCouponObj.type === 'percent') {
          discountAmt = Math.round(subtotal * (activeCouponObj.pct / 100) * 100) / 100;
        } else if (activeCouponObj.type === 'fixed') {
          discountAmt = Math.min(subtotal, activeCouponObj.amountOff || 32);
        }
      }
      const afterDisc = Math.max(0, Math.round((subtotal - discountAmt) * 100) / 100);
      const shipping = (subtotal === 0 || afterDisc >= 50 || (activeCouponObj && activeCouponObj.freeShip)) ? 0 : 4.99;
      const finalTotal = Math.round((afterDisc + shipping) * 100) / 100;

      if (summaryLinesEl) {
        summaryLinesEl.innerHTML = `
          <div class="rc-summary-row">
            <span>Merchandise Subtotal:</span>
            <span>${formatMoney(subtotal)}</span>
          </div>
          ${activeCouponObj ? `
            <div class="rc-summary-row discount-row">
              <span>${activeCouponObj.icon} ${activeCouponObj.code} (1-Time Use Applied at Checkout):</span>
              <span>&minus;${formatMoney(discountAmt)}</span>
            </div>
          ` : `
            <div class="rc-summary-row" style="color:rgba(255,255,255,0.52);font-size:0.76rem;">
              <span>1-Time Use Coupon:</span>
              <span>None Selected (Click an Icon on Left)</span>
            </div>
          `}
          <div class="rc-summary-row">
            <span>Shipping:</span>
            <span>${shipping === 0 ? 'FREE' : formatMoney(shipping)}</span>
          </div>
          <div class="rc-summary-row total-row">
            <span>CHECKOUT TOTAL:</span>
            <span>${formatMoney(finalTotal)}</span>
          </div>
        `;
      }

      if (checkoutBtnEl) {
        checkoutBtnEl.disabled = items.length === 0;
        checkoutBtnEl.style.opacity = items.length === 0 ? '0.45' : '1';
        checkoutBtnEl.textContent = activeCouponObj
          ? `COMPLETE CHECKOUT (${formatMoney(finalTotal)}) • REDEEM 1-TIME [${activeCouponObj.code}]`
          : `COMPLETE CHECKOUT (${formatMoney(finalTotal)})`;

        checkoutBtnEl.onclick = () => {
          if (items.length === 0) return;
          const usedCode = activeCouponObj ? activeCouponObj.code : '';

          // Record Shop Order for the Admin Hub (rc_shop_orders_v1 + /api/arcade-db)
          try {
            let ordersList = [];
            try {
              ordersList = JSON.parse(localStorage.getItem('rc_shop_orders_v1') || '[]') || [];
            } catch (_) {}
            const now = new Date();
            const stamp = now.getFullYear() + '-' +
              String(now.getMonth() + 1).padStart(2, '0') + '-' +
              String(now.getDate()).padStart(2, '0') + ' ' +
              String(now.getHours()).padStart(2, '0') + ':' +
              String(now.getMinutes()).padStart(2, '0');
            const newOrder = {
              orderId: 'RC-ORD-' + (1000 + ordersList.length + 1),
              username: getCurrentUsername() || 'Guest',
              items: items.map((it) => ({
                model: it.model,
                title: it.title,
                price: it.price,
                qty: it.qty || 1
              })),
              subtotal: subtotal,
              couponCode: usedCode || '',
              discountAmt: discountAmt,
              shipping: shipping,
              totalPaid: finalTotal,
              status: 'Processing',
              createdAt: stamp
            };
            ordersList.unshift(newOrder);
            localStorage.setItem('rc_shop_orders_v1', JSON.stringify(ordersList));
          } catch (_) {}

          const orderGrowthEarned = Math.max(1, totalQty) * 250;
          const updatedTreeGrowth = addCanopyGrowth(orderGrowthEarned);
          const newTreeTier = getCanopyTreeTier(updatedTreeGrowth);
          if (usedCode) {
            markCouponAsUsedOneTime(usedCode);
          } else {
            saveAccountsDb(getAccountsDb());
          }
          saveCartItems([]);
          playCutsceneBonkSfx('jackpot_fanfare');
          renderStoreCouponDockAndCheckout();

          if (bagListEl) {
            bagListEl.innerHTML = `
              <div style="padding:18px;background:rgba(0,245,155,0.12);border:1.5px solid #00f59b;border-radius:14px;text-align:center;">
                <div style="font-family:'Orbitron',sans-serif;font-size:0.9rem;font-weight:900;color:#00f59b;">&#10003; ORDER CONFIRMED!</div>
                <div style="font-size:0.8rem;margin-top:6px;color:#ffffff;">
                  Paid <strong>${formatMoney(finalTotal)}</strong>
                  ${usedCode ? ` with 1-time coupon <strong>${usedCode} (&minus;${formatMoney(discountAmt)})</strong>!` : '!'}
                </div>
                <div style="font-family:'Orbitron',sans-serif;font-size:0.64rem;color:#00f0ff;margin-top:6px;">
                  +${orderGrowthEarned.toLocaleString()} CANOPY TREE GROWTH &bull; ${newTreeTier.icon} STAGE ${newTreeTier.stage}: ${newTreeTier.name.toUpperCase()} (${updatedTreeGrowth.toLocaleString()})
                </div>
                ${usedCode ? `<div style="font-family:'Orbitron',sans-serif;font-size:0.62rem;color:#ff99cc;margin-top:6px;">&#128683; COUPON [${usedCode}] USED &amp; CLEARED (1-TIME USE)</div>` : ''}
              </div>
            `;
          }
          if (usedCode) {
            typeChloeLine(`Order complete! Your ${usedCode} coupon saved you ${formatMoney(discountAmt)}, and your Personal Canopy Tree gained +${orderGrowthEarned} Growth (${newTreeTier.icon} ${newTreeTier.name})!`);
          } else {
            typeChloeLine(`Order complete! Your Personal Canopy Tree gained +${orderGrowthEarned} Growth (${newTreeTier.icon} ${newTreeTier.name})!`);
          }
        };
      }
    }

    renderStoreCouponDockAndCheckout();
    loadStoreAccountsFromServer();

    function syncChloeWithActiveProduct(forceRetype) {
      if (typeTimer) clearInterval(typeTimer);
      const kickerEl = document.getElementById('hudKicker') || document.querySelector('.hud-kicker');
      const titleEl = document.getElementById('hudTitle') || document.querySelector('.hud-title');
      const priceEl = document.getElementById('hudPrice') || document.querySelector('.hud-price');
      const specsEl = document.getElementById('hudSpecs') || document.querySelector('.hud-specs');

      const modelCode = (kickerEl ? kickerEl.textContent.trim() : 'RC-101');
      const titleText = (titleEl ? titleEl.textContent.trim() : 'Retrocanopy Vault Drop');
      const priceText = applyWheelDiscountToHudPrice(modelCode) || (priceEl ? priceEl.textContent.trim() : '');
      requestAnimationFrame(() => applyWheelDiscountToHudPrice(modelCode));

      if (!forceRetype && modelCode === lastModelCode) return;
      lastModelCode = modelCode;
      showingTip = false;

      if (itemTagEl) {
        itemTagEl.textContent = priceText ? `${modelCode} \u2022 ${priceText}` : modelCode;
      }
      if (itemTitleEl) {
        itemTitleEl.textContent = titleText;
      }

      const allCodes = getOutfitItemsForCode(modelCode);
      const allItems = allCodes.map((c) => masterCatalog[c]).filter(Boolean);
      const pricing = computeBundlePricing(allItems);

      if (isOutfitOpen) {
        selectedOutfitCodes = new Set(allCodes);
        const summary = renderOutfitShowcase(modelCode);
        if (btnYesOutfit) btnYesOutfit.textContent = `ADD BUNDLE (20% OFF \u2022 ${summary.totalStr}) \u2726`;
        if (btnTip) btnTip.textContent = 'HIDE OUTFIT \u2715';
        const pairedNames = summary.activeItems
          .slice(1)
          .map((it) => `${it.title} ($${it.price})`)
          .join(', ');
        typeChloeLine(`Switched to the ${modelCode} outfit! Paired with ${pairedNames} — normally ${summary.subtotalStr}, your 20% bundle discount saves ${summary.discountStr} for a ${summary.totalStr} total!`);
        return;
      }

      if (btnYesOutfit) {
        btnYesOutfit.textContent = `YES, SHOW OUTFIT (20% OFF \u2022 ${pricing.totalStr}) \u2726`;
      }
      if (btnTip) {
        btnTip.textContent = 'STYLING TIP \u25B6';
      }

      const entry = productCatalogNotes[modelCode] || {
        desc: `Check out the ${modelCode} ${titleText}! Want to see the optional paired items I picked to bundle this into a complete outfit with 20% off?`,
        tip: "Styling Tip: Authentic streetwear limited edition piece from the Retrocanopy collection."
      };
      typeChloeLine(entry.desc);
    }

    function handleChloeInteraction() {
      const kickerEl = document.getElementById('hudKicker') || document.querySelector('.hud-kicker');
      const modelCode = kickerEl ? kickerEl.textContent.trim() : lastModelCode;
      const entry = productCatalogNotes[modelCode] || null;

      if (isTyping) {
        finishTyping();
        return;
      }

      if (isOutfitOpen) {
        closeOutfitShowcase(false);
        return;
      }

      if (entry && entry.tip) {
        showingTip = !showingTip;
        if (showingTip) {
          if (btnTip) btnTip.textContent = 'DESCRIPTION \u25B6';
          typeChloeLine(entry.tip);
        } else {
          if (btnTip) btnTip.textContent = 'STYLING TIP \u25B6';
          typeChloeLine(entry.desc);
        }
      } else {
        syncChloeWithActiveProduct(true);
      }
    }

    const btnMin = document.getElementById('chloe-min-btn');
    if (btnMin && dialogueBox) {
      btnMin.addEventListener('click', (e) => {
        e.stopPropagation();
        const isMin = dialogueBox.classList.toggle('chloe-minimized');
        btnMin.innerHTML = isMin ? '+' : '&ndash;';
      });
    }

    if (btnYesOutfit) {
      btnYesOutfit.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isOutfitOpen) {
          addCurrentOutfitToBag();
        } else {
          openOutfitShowcase();
        }
      });
    }

    if (btnTip) {
      btnTip.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isOutfitOpen) {
          closeOutfitShowcase(false);
        } else {
          handleChloeInteraction();
        }
      });
    }

    if (outfitCloseBtn) {
      outfitCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeOutfitShowcase(false);
      });
    }

    if (outfitBuyBtn) {
      outfitBuyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addCurrentOutfitToBag();
      });
    }

    if (spriteWrap) {
      spriteWrap.addEventListener('mouseenter', () => {
        isHovered = true;
        if (idleWinkTimeout) clearTimeout(idleWinkTimeout);
        setChloePose('flirt2');
      });
      spriteWrap.addEventListener('mouseleave', () => {
        isHovered = false;
        if (idleWinkTimeout) clearTimeout(idleWinkTimeout);
        if (!isTyping) setChloePose('flirt1');
        resetIdleWinkCycle();
      });
      spriteWrap.addEventListener('click', handleChloeInteraction);
    }

    if (dialogueBox) {
      dialogueBox.addEventListener('click', () => {
        if (dialogueBox.classList.contains('chloe-minimized')) {
          dialogueBox.classList.remove('chloe-minimized');
          if (btnMin) btnMin.innerHTML = '&ndash;';
          return;
        }
        setChloePose('talk');
        handleChloeInteraction();
      });
    }

    // Observe changes to #hudKicker and #hudTitle so Chloe reacts immediately when browsing products
    const kickerTarget = document.getElementById('hudKicker') || document.querySelector('.hud-kicker');
    const titleTarget = document.getElementById('hudTitle') || document.querySelector('.hud-title');
    const observer = new MutationObserver(() => {
      syncChloeWithActiveProduct(false);
    });
    if (kickerTarget) observer.observe(kickerTarget, { childList: true, characterData: true, subtree: true });
    if (titleTarget) observer.observe(titleTarget, { childList: true, characterData: true, subtree: true });

    // Initial product introduction & idle micro-wink scheduler
    resetIdleWinkCycle();
    setTimeout(() => {
      syncChloeWithActiveProduct(true);
    }, 120);

    // =========================================================================
    // 10-SLICE NEON SYNTHWAVE DISCOUNT WHEEL ("WHEEL OF CANOPY"):
    // - 5 GLITCH spaces (0% OFF)
    // - 2 spaces: 5% OFF
    // - 1 space:  20% OFF
    // - 1 space:  25% OFF
    // - 1 space:  50% OFF
    // Kept 100% truly random on every spin!
    // =========================================================================
    const WHEEL_SLICES = [
      { pct: 50, label: '50% OFF', sub: 'JACKPOT', c1: '#ff2d95', c2: '#ffae00', textFill: '#ffffff' },
      { pct: 0,  label: 'GLITCH',  sub: '0% OFF',  c1: '#260b42', c2: '#5a189a', textFill: '#e0b3ff' },
      { pct: 5,  label: '5% OFF',  sub: 'BONUS',   c1: '#7209b7', c2: '#f72585', textFill: '#ffffff' },
      { pct: 0,  label: 'GLITCH',  sub: '0% OFF',  c1: '#260b42', c2: '#5a189a', textFill: '#e0b3ff' },
      { pct: 20, label: '20% OFF', sub: 'CANOPY',  c1: '#0077b6', c2: '#00f5d4', textFill: '#05030a' },
      { pct: 0,  label: 'GLITCH',  sub: '0% OFF',  c1: '#260b42', c2: '#5a189a', textFill: '#e0b3ff' },
      { pct: 5,  label: '5% OFF',  sub: 'BONUS',   c1: '#7209b7', c2: '#f72585', textFill: '#ffffff' },
      { pct: 0,  label: 'GLITCH',  sub: '0% OFF',  c1: '#260b42', c2: '#5a189a', textFill: '#e0b3ff' },
      { pct: 25, label: '25% OFF', sub: 'VAULT',   c1: '#ff6b00', c2: '#ffbe0b', textFill: '#05030a' },
      { pct: 0,  label: 'GLITCH',  sub: '0% OFF',  c1: '#260b42', c2: '#5a189a', textFill: '#e0b3ff' }
    ];

    function buildPrizeWheelSvgMarkup() {
      const sliceCount = WHEEL_SLICES.length; // 10 slices
      const sliceAngle = 360 / sliceCount;    // 36 deg per slice
      const halfSlice = sliceAngle / 2;       // 18 deg
      const cx = 120;
      const cy = 120;
      const r = 112;
      let defs = '';
      let paths = '';
      let pegs = '';

      WHEEL_SLICES.forEach((s, i) => {
        const centerDeg = i * sliceAngle;
        const startDeg = centerDeg - halfSlice - 90;
        const endDeg = centerDeg + halfSlice - 90;
        const rad1 = (startDeg * Math.PI) / 180;
        const rad2 = (endDeg * Math.PI) / 180;
        const x1 = (cx + r * Math.cos(rad1)).toFixed(2);
        const y1 = (cy + r * Math.sin(rad1)).toFixed(2);
        const x2 = (cx + r * Math.cos(rad2)).toFixed(2);
        const y2 = (cy + r * Math.sin(rad2)).toFixed(2);

        defs += `
          <linearGradient id="rcWheelGrad${i}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${s.c1}"/>
            <stop offset="100%" stop-color="${s.c2}"/>
          </linearGradient>
        `;

        paths += `
          <path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z"
                fill="url(#rcWheelGrad${i})"
                stroke="rgba(255,255,255,0.45)"
                stroke-width="1.5"/>
          <g transform="rotate(${centerDeg} ${cx} ${cy})">
            <text x="${cx}" y="38" text-anchor="middle" fill="${s.textFill}" font-family="Orbitron, sans-serif" font-size="9.6" font-weight="900" letter-spacing="0.3">${s.label}</text>
            <text x="${cx}" y="50" text-anchor="middle" fill="${s.textFill}" opacity="0.88" font-family="Orbitron, sans-serif" font-size="6.8" font-weight="800" letter-spacing="0.6">${s.sub}</text>
          </g>
        `;

        const pegDeg = centerDeg - halfSlice - 90;
        const pegRad = (pegDeg * Math.PI) / 180;
        const px = (cx + (r - 4) * Math.cos(pegRad)).toFixed(2);
        const py = (cy + (r - 4) * Math.sin(pegRad)).toFixed(2);
        pegs += `<circle cx="${px}" cy="${py}" r="3.8" fill="#ffdf6b" stroke="#090414" stroke-width="1.4"/>`;
      });

      return `
        <svg class="rc-prize-wheel-svg" viewBox="0 0 240 240" aria-hidden="true">
          <defs>${defs}</defs>
          <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="#090414" stroke="#ff2d95" stroke-width="3"/>
          ${paths}
          ${pegs}
          <circle cx="${cx}" cy="${cy}" r="34" fill="#090414" stroke="#ffae00" stroke-width="2.5"/>
        </svg>
      `;
    }

    const upsetCutscene = document.createElement('div');
    upsetCutscene.className = 'rc-chloe-upset-cutscene';
    upsetCutscene.id = 'rc-chloe-upset-cutscene';
    upsetCutscene.setAttribute('role', 'dialog');
    upsetCutscene.setAttribute('aria-modal', 'true');
    upsetCutscene.setAttribute('aria-label', 'Chloe Shop Exit Cutscene: Price vs Design');
    upsetCutscene.innerHTML = `
      <!-- TOP ROW: Bigger, slower dialogue across the top of the screen -->
      <div class="rc-upset-dialogue-card" id="rc-upset-dialogue-card">
        <div class="rc-rpg-dialogue-body">
          <div class="rc-rpg-dialogue-main">
            <div class="rc-upset-dialogue-header">
              <span class="rc-upset-speaker" id="rc-upset-speaker">CHLOE &bull; SHOP CURATOR</span>
              <span class="rc-upset-beat-tag" id="rc-upset-beat-tag">ACT 1/4</span>
              <button type="button" class="rc-upset-next-pill" id="rc-upset-next-pill">NEXT &#9654;</button>
            </div>
            <p class="rc-upset-dialogue-text" id="rc-upset-dialogue-text" title="Click to advance dialogue"></p>
          </div>
        </div>
      </div>

      <!-- LEFT COLUMN (ROW 2): Bigger Chloe at Bottom-Left -->
      <div class="rc-cutscene-left-col">
        <div class="rc-arena-side chloe-stage-side speaking-focus" id="rc-chloe-stage-side">
          <div class="rc-upset-sprite-box" id="rc-upset-sprite-box">
            <!-- Seated Criss-Cross LOOKING DOWN Really Sad & Upset Poses (8, 9) -->
            <img src="assets/friends/chloe_sit_down_1.png?v=51" alt="Chloe Sitting Criss-Cross Looking Down Sad" class="rc-upset-frame frame-down-1 active">
            <img src="assets/friends/chloe_sit_down_2.png?v=51" alt="Chloe Sitting Criss-Cross Looking Down Clutching Lookbook" class="rc-upset-frame frame-down-2">
            <!-- Seated Criss-Cross Looking Up Asking What Was Wrong Poses (1, 2, 3) -->
            <img src="assets/friends/chloe_sit_upset_1.png?v=51" alt="Chloe Sitting Criss-Cross Looking Up Pout" class="rc-upset-frame frame-upset-1">
            <img src="assets/friends/chloe_sit_upset_2.png?v=51" alt="Chloe Sitting Criss-Cross Sigh" class="rc-upset-frame frame-upset-2">
            <img src="assets/friends/chloe_sit_upset_3.png?v=51" alt="Chloe Sitting Criss-Cross Hugging Lookbook" class="rc-upset-frame frame-upset-3">
            <!-- Standing Cheerful & Wheel Reaction Poses (Pixel-Aligned Unified Shop Look) -->
            <img src="assets/friends/chloe_shop_flirt1.png?v=51" alt="Chloe Standing Cheerful" class="rc-upset-frame standing-frame frame-stand-talk1">
            <img src="assets/friends/chloe_wheel_kiss.png?v=51" alt="Chloe Blowing a Kiss for Good Luck" class="rc-upset-frame standing-frame frame-stand-talk2">
            <img src="assets/friends/chloe_wheel_celebrate.png?v=51" alt="Chloe Celebrating Winning Spin" class="rc-upset-frame standing-frame frame-stand-flirt2">
            <img src="assets/friends/chloe_wheel_encourage.png?v=51" alt="Chloe Encouraging Customer to Spin Again" class="rc-upset-frame standing-frame frame-stand-flirt3">
            <div class="rc-luck-kiss-fx" id="rc-luck-kiss-fx" aria-hidden="true">&#10084; &#10022; &#10084;</div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN (ROW 2): Fades in really large with the 2 choices after asking what was wrong, then fades in the chosen option -->
      <div class="rc-cutscene-right-stage" id="rc-cutscene-right-stage">
        <!-- PANE 0: REALLY LARGE 2 CHOICES ON THE RIGHT -->
        <div class="rc-right-option-pane" id="rc-pane-choices">
          <div class="rc-upset-actions" id="rc-upset-actions">
            <button type="button" class="rc-upset-btn-stay" id="rc-upset-btn-stay">
              <span>&#9654; &#128184; IT'S THE PRICE</span>
              <span class="rc-choice-subtext">Spin the $1 Discount Wheel or Earn Arcade XP</span>
            </button>
            <button type="button" class="rc-upset-btn-secondary" id="rc-upset-btn-secondary">
              <span>&#9654; &#127912; IT'S THE DESIGN</span>
              <span class="rc-choice-subtext">Submit a Custom Design to Chloe &amp; Bring It to Life</span>
            </button>
            <button type="button" class="rc-upset-btn-leave" id="rc-upset-btn-leave">Leave Shop anyway &rarr;</button>
          </div>
        </div>

        <!-- PANE 1: PRICE ($1 DISCOUNT WHEEL + ARCADE XP) -->
        <div class="rc-right-option-pane centered-pane" id="rc-pane-wheel">
          <div class="rc-wheel-cabinet-frame" id="rc-wheel-cabinet-frame">
            <svg class="rc-wheel-pointer" id="rc-wheel-pointer" viewBox="0 0 36 42" aria-hidden="true">
              <polygon points="18,40 3,6 33,6" fill="#00f5d4" stroke="#ffffff" stroke-width="2.5"/>
              <circle cx="18" cy="11" r="4" fill="#090414"/>
            </svg>
            <div class="rc-wheel-rotor" id="rc-wheel-rotor">
              ${buildPrizeWheelSvgMarkup()}
            </div>
            <button type="button" class="rc-wheel-hub-btn" id="rc-wheel-hub-btn" aria-label="Spin Discount Wheel for $1">$1<br>SPIN!</button>
          </div>
          <div class="rc-wheel-status-pill" id="rc-wheel-status-pill">&#127918; SPIN FOR $1 OR GRIND ARCADE XP!</div>
          <div class="rc-right-action-links">
            <button type="button" class="rc-right-cta-btn" id="rc-right-spin-btn">&#127920; SPIN WHEEL FOR $1 (UP TO 50% OFF)</button>
            <button type="button" class="rc-right-sub-btn" id="rc-right-arcade-btn">&#128377;&#65039; Head to the Arcade to Earn XP &rarr;</button>
            <button type="button" class="rc-right-sub-btn" id="rc-wheel-back-choices">&larr; Back to 2 Choices</button>
          </div>
        </div>

        <!-- PANE 2: DESIGN (CUSTOM DESIGN SUBMISSION) -->
        <div class="rc-right-option-pane centered-pane" id="rc-pane-design">
          <div class="rc-custom-inline-bar active">
            <label class="rc-custom-field-label">
              <span>1. PIECE TO CUSTOMIZE</span>
              <select class="rc-custom-select" id="rc-custom-item-select">
                <option value="Custom Snapback Hat">Snapback Hat</option>
                <option value="Custom XL RGB Desk Mat">XL RGB Desk Mat</option>
                <option value="Custom Heavyweight Hoodie">Heavyweight Hoodie</option>
                <option value="Custom Graphic Tee">Heavyweight Graphic Tee</option>
                <option value="Custom Tech Joggers">Tapered Tech Joggers</option>
                <option value="Custom Long Sleeve">Cyber-Grid Long Sleeve</option>
                <option value="Custom 30oz Tumbler">30oz Insulated Tumbler</option>
                <option value="Custom Duffle Gear Bag">Tech Duffle Gear Bag</option>
                <option value="Complete Custom Outfit / Other">Complete Custom Outfit / Other</option>
              </select>
            </label>
            <label class="rc-custom-field-label">
              <span>2. DESCRIBE YOUR CUSTOM DESIGN / COLORS / VIBE</span>
              <input type="text" class="rc-custom-input" id="rc-custom-idea-input" placeholder="Tell Chloe your graphic idea, colors, or text — we'll bring it to life!">
            </label>
            <label class="rc-custom-field-label">
              <span>3. EMAIL / DISCORD / @HANDLE</span>
              <input type="text" class="rc-custom-input" id="rc-custom-contact-input" placeholder="you@email.com or @handle">
            </label>
            <div class="rc-right-action-links" style="margin-top: 6px;">
              <button type="button" class="rc-right-cta-btn" id="rc-custom-submit-btn">&#10024; SEND CUSTOM DESIGN TO CHLOE</button>
              <button type="button" class="rc-right-sub-btn" id="rc-design-back-choices">&larr; Back to 2 Choices</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(upsetCutscene);

    const rightStageEl = document.getElementById('rc-cutscene-right-stage');
    const paneChoices = document.getElementById('rc-pane-choices');
    const paneWheel = document.getElementById('rc-pane-wheel');
    const paneDesign = document.getElementById('rc-pane-design');
    const customItemSelect = document.getElementById('rc-custom-item-select');
    const customIdeaInput = document.getElementById('rc-custom-idea-input');
    const customContactInput = document.getElementById('rc-custom-contact-input');
    const customSubmitBtn = document.getElementById('rc-custom-submit-btn');
    const rightSpinBtn = document.getElementById('rc-right-spin-btn');
    const rightArcadeBtn = document.getElementById('rc-right-arcade-btn');
    const wheelBackChoicesBtn = document.getElementById('rc-wheel-back-choices');
    const designBackChoicesBtn = document.getElementById('rc-design-back-choices');

    const wheelCabinetFrame = document.getElementById('rc-wheel-cabinet-frame');
    const wheelPointerEl = document.getElementById('rc-wheel-pointer');
    const wheelRotorEl = document.getElementById('rc-wheel-rotor');
    const wheelHubBtn = document.getElementById('rc-wheel-hub-btn');
    const wheelStatusPill = document.getElementById('rc-wheel-status-pill');
    const upsetSpriteBox = document.getElementById('rc-upset-sprite-box');
    const luckKissFx = document.getElementById('rc-luck-kiss-fx');

    const downFrame1 = upsetCutscene.querySelector('.frame-down-1');
    const downFrame2 = upsetCutscene.querySelector('.frame-down-2');
    const upsetFrame1 = upsetCutscene.querySelector('.frame-upset-1');
    const upsetFrame2 = upsetCutscene.querySelector('.frame-upset-2');
    const upsetFrame3 = upsetCutscene.querySelector('.frame-upset-3');
    const standTalk1 = upsetCutscene.querySelector('.frame-stand-talk1');
    const standTalk2 = upsetCutscene.querySelector('.frame-stand-talk2');
    const standFlirt2 = upsetCutscene.querySelector('.frame-stand-flirt2');
    const standFlirt3 = upsetCutscene.querySelector('.frame-stand-flirt3');

    const upsetSpeakerEl = document.getElementById('rc-upset-speaker');
    const upsetBeatTag = document.getElementById('rc-upset-beat-tag');
    const upsetNextPill = document.getElementById('rc-upset-next-pill');
    const upsetTextEl = document.getElementById('rc-upset-dialogue-text');
    const upsetBtnStay = document.getElementById('rc-upset-btn-stay');
    const upsetBtnSecondary = document.getElementById('rc-upset-btn-secondary');
    const upsetBtnLeave = document.getElementById('rc-upset-btn-leave');

    let isUpsetCutscenePlaying = false;
    let upsetBypassExit = false;
    let upsetTimers = [];
    let pendingExitCallback = null;
    let cutsceneIsTyping = false;
    let cutsceneFullLine = '';
    let cutsceneTypeInterval = null;
    let onCutsceneLineFinished = null;
    let activeBranch = 'QUESTION'; // 'QUESTION' | 'CONFIRM_LEAVE' | 'PRICE' | 'DESIGN' | 'CUSTOM_DONE'
    let currentStoryBeatIdx = 0;
    let wheelState = 'READY'; // 'READY' | 'SPINNING' | 'WON'
    let currentWheelDeg = 0;
    let wonDiscountPct = 25;

    function clearUpsetTimers() {
      if (cutsceneTypeInterval) {
        clearInterval(cutsceneTypeInterval);
        cutsceneTypeInterval = null;
      }
      upsetTimers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      upsetTimers = [];
    }

    function setRightStagePane(mode) {
      const showRight = mode === 'CHOICES' || mode === 'PRICE' || mode === 'DESIGN' || mode === 'CUSTOM_DONE';
      if (rightStageEl) {
        rightStageEl.classList.toggle('visible', showRight);
      }
      if (paneChoices) {
        paneChoices.classList.toggle('active', mode === 'CHOICES');
      }
      if (paneWheel) {
        paneWheel.classList.toggle('active', mode === 'PRICE');
      }
      if (paneDesign) {
        paneDesign.classList.toggle('active', mode === 'DESIGN' || mode === 'CUSTOM_DONE');
      }
    }

    // Pose numbers:
    // Seated criss-cross looking DOWN sad & upset (before asking what was wrong): 8 = down1, 9 = down2
    // Seated criss-cross looking UP asking what was wrong: 1 = teary pout, 2 = sigh, 3 = hugging lookbook
    // Standing cheerful/happy to help: 4 = talk1, 5 = talk2, 6 = flirt2 wink, 7 = flirt3 open lookbook smile
    function setUpsetPose(poseNum) {
      const isStanding = poseNum >= 4 && poseNum <= 7;
      upsetCutscene.classList.toggle('chloe-standing-mode', isStanding);
      if (downFrame1) downFrame1.classList.toggle('active', poseNum === 8);
      if (downFrame2) downFrame2.classList.toggle('active', poseNum === 9);
      if (upsetFrame1) upsetFrame1.classList.toggle('active', poseNum === 1);
      if (upsetFrame2) upsetFrame2.classList.toggle('active', poseNum === 2);
      if (upsetFrame3) upsetFrame3.classList.toggle('active', poseNum === 3);
      if (standTalk1) standTalk1.classList.toggle('active', poseNum === 4);
      if (standTalk2) standTalk2.classList.toggle('active', poseNum === 5);
      if (standFlirt2) standFlirt2.classList.toggle('active', poseNum === 6);
      if (standFlirt3) standFlirt3.classList.toggle('active', poseNum === 7);
    }

    function setVillainPoses() {}
    function setStageSpotlight() {}

    function playCutsceneBonkSfx(type) {
      const ctx = ensureShopAudioContext();
      if (!ctx) return;
      try {
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        if (type === 'wheel_tick') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(690, now);
          osc.frequency.exponentialRampToValueAtTime(240, now + 0.032);
          g.gain.setValueAtTime(0.065, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.038);
        } else if (type === 'glitch_buzzer') {
          [165.0, 130.81].forEach((freq, idx) => {
            const o = ctx.createOscillator();
            const ng = ctx.createGain();
            const t0 = now + idx * 0.14;
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(freq, t0);
            ng.gain.setValueAtTime(0.10, t0);
            ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
            o.connect(ng);
            ng.connect(ctx.destination);
            o.start(t0);
            o.stop(t0 + 0.19);
          });
        } else if (type === 'bonk') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(175, now);
          osc.frequency.exponentialRampToValueAtTime(52, now + 0.15);
          g.gain.setValueAtTime(0.16, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.17);
        } else if (type === 'blow_kiss') {
          [587.33, 783.99, 987.77, 1174.66].forEach((freq, idx) => {
            const o = ctx.createOscillator();
            const ng = ctx.createGain();
            const t0 = now + idx * 0.065;
            o.type = 'sine';
            o.frequency.setValueAtTime(freq, t0);
            ng.gain.setValueAtTime(0.09, t0);
            ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
            o.connect(ng);
            ng.connect(ctx.destination);
            o.start(t0);
            o.stop(t0 + 0.18);
          });
        } else if (type === 'jackpot_fanfare') {
          [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
            const o = ctx.createOscillator();
            const ng = ctx.createGain();
            const t0 = now + idx * 0.095;
            o.type = 'square';
            o.frequency.setValueAtTime(freq, t0);
            const dur = idx === 4 ? 0.42 : 0.11;
            ng.gain.setValueAtTime(0.11, t0);
            ng.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
            o.connect(ng);
            ng.connect(ctx.destination);
            o.start(t0);
            o.stop(t0 + dur + 0.02);
          });
        }
      } catch (_) {}
    }

    // Slower typing speed (48ms per character) so the big top dialogue reads at a comfortable pace
    function typeCutsceneLineSlow(str, onComplete) {
      if (cutsceneTypeInterval) {
        clearInterval(cutsceneTypeInterval);
        cutsceneTypeInterval = null;
      }
      cutsceneFullLine = str;
      cutsceneIsTyping = true;
      onCutsceneLineFinished = onComplete || null;
      if (upsetTextEl) upsetTextEl.textContent = '';

      let idx = 0;
      cutsceneTypeInterval = setInterval(() => {
        idx++;
        if (upsetTextEl) upsetTextEl.textContent = cutsceneFullLine.slice(0, idx);
        const ch = cutsceneFullLine[idx - 1];
        if (ch && ch !== ' ' && idx % 2 === 1) {
          playShopTypingTick();
        }
        if (idx >= cutsceneFullLine.length) {
          clearInterval(cutsceneTypeInterval);
          cutsceneTypeInterval = null;
          cutsceneIsTyping = false;
          if (typeof onCutsceneLineFinished === 'function') {
            const fn = onCutsceneLineFinished;
            onCutsceneLineFinished = null;
            fn();
          }
        }
      }, 48);
    }

    function triggerPointerTickBounce() {
      if (!wheelPointerEl) return;
      wheelPointerEl.classList.add('tick-bounce');
      playCutsceneBonkSfx('wheel_tick');
      setTimeout(() => {
        if (wheelPointerEl) wheelPointerEl.classList.remove('tick-bounce');
      }, 65);
    }

    // -------------------------------------------------------------------------
    // 2-BEAT SEATED CRISS-CROSS UPSET CHLOE DIALOGUE
    // Beat 1: Chloe sits looking down really sad and upset (pose 8) for 1 short statement.
    // Beat 2: Chloe looks up to ask what was wrong (pose 1), and the 2
    // large choices fade in on the right!
    // -------------------------------------------------------------------------
    const STORY_BEATS = [
      {
        act: '1/2',
        speaker: 'CHLOE',
        beatTag: 'ACT 1/2',
        chloePose: 8, // Looking down sad at her lap
        bonkShake: false,
        sfx: 'bonk',
        text: '"You\'re really leaving empty-handed? I knew I talked way too much and totally ruined it..."'
      },
      {
        act: '2/2',
        speaker: 'CHLOE',
        beatTag: 'ACT 2/2',
        chloePose: 1, // Raises her head once and looks up at you with teary puppy eyes!
        bonkShake: false,
        sfx: 'bonk',
        text: '"Before you go, just be honest with me so I can make it right—was it the price, or are you not feeling the design?"'
      }
    ];

    function setStandingHappyCycle(primaryPose) {
      // Hold a single steady standing cheerful pose without flipping back and forth
      setUpsetPose(primaryPose);
    }

    function populatePrimaryChoicesMarkup() {
      if (upsetBtnStay) {
        upsetBtnStay.disabled = false;
        upsetBtnStay.innerHTML = `
          <span>&#9654; &#128184; IT'S THE PRICE</span>
          <span class="rc-choice-subtext">Spin the $1 Discount Wheel or Earn Arcade XP</span>
        `;
      }
      if (upsetBtnSecondary) {
        upsetBtnSecondary.style.display = 'flex';
        upsetBtnSecondary.disabled = false;
        upsetBtnSecondary.innerHTML = `
          <span>&#9654; &#127912; IT'S THE DESIGN</span>
          <span class="rc-choice-subtext">Submit a Custom Design to Chloe &amp; Bring It to Life</span>
        `;
      }
      if (upsetBtnLeave) {
        upsetBtnLeave.style.display = 'inline-block';
        upsetBtnLeave.innerHTML = 'Leave Shop anyway &rarr;';
      }
    }

    function playStoryBeat(beatIdx) {
      clearUpsetTimers();
      activeBranch = 'QUESTION';
      wheelState = 'READY';
      currentStoryBeatIdx = Math.max(0, Math.min(STORY_BEATS.length - 1, beatIdx));
      const beat = STORY_BEATS[currentStoryBeatIdx];
      const isFinalQuestionBeat = currentStoryBeatIdx === STORY_BEATS.length - 1;

      populatePrimaryChoicesMarkup();
      setRightStagePane(isFinalQuestionBeat ? 'CHOICES' : 'NONE');
      setUpsetPose(beat.chloePose);

      if (upsetSpriteBox) {
        upsetSpriteBox.classList.remove('bonk-shake');
      }

      if (upsetNextPill) {
        upsetNextPill.style.display = 'inline-flex';
        if (!isFinalQuestionBeat) {
          upsetNextPill.innerHTML = `SKIP &#9654; (${currentStoryBeatIdx + 1}/${STORY_BEATS.length})`;
        } else {
          upsetNextPill.innerHTML = `&#8634; REPLAY`;
        }
      }

      if (upsetSpeakerEl) upsetSpeakerEl.textContent = beat.speaker;
      if (upsetBeatTag) upsetBeatTag.textContent = beat.beatTag;

      if (beat.sfx) playCutsceneBonkSfx(beat.sfx);

      typeCutsceneLineSlow(beat.text, () => {
        if (activeBranch === 'QUESTION' && !isFinalQuestionBeat) {
          const nextBeatTimer = setTimeout(() => {
            if (activeBranch === 'QUESTION') {
              playStoryBeat(currentStoryBeatIdx + 1);
            }
          }, 1800);
          upsetTimers.push(nextBeatTimer);
        }
      });
    }

    function showPriceOrDesignQuestion(startAtLastBeat) {
      playStoryBeat(startAtLastBeat ? STORY_BEATS.length - 1 : 0);
    }

    // -------------------------------------------------------------------------
    // LEAVE CONFIRMATION ("ARE YOU SURE?"):
    // If the customer chooses to leave, Chloe asks if they are sure before exiting.
    // -------------------------------------------------------------------------
    function promptConfirmLeave() {
      clearUpsetTimers();
      activeBranch = 'CONFIRM_LEAVE';
      setRightStagePane('CHOICES');
      setUpsetPose(1); // Seated criss-cross teary puppy eyes looking at you (held steady)
      if (upsetSpriteBox) upsetSpriteBox.classList.remove('bonk-shake');

      if (upsetSpeakerEl) upsetSpeakerEl.textContent = 'CHLOE';
      if (upsetBeatTag) upsetBeatTag.textContent = 'ARE YOU SURE?';
      if (upsetNextPill) upsetNextPill.style.display = 'none';

      if (upsetBtnStay) {
        upsetBtnStay.disabled = false;
        upsetBtnStay.innerHTML = `
          <span>&#9654; WAIT, LET CHLOE HELP &hearts;</span>
          <span class="rc-choice-subtext">Stay and check out the $1 Wheel or Custom Design Studio</span>
        `;
      }
      if (upsetBtnSecondary) {
        upsetBtnSecondary.style.display = 'flex';
        upsetBtnSecondary.disabled = false;
        upsetBtnSecondary.innerHTML = `
          <span>&#9654; YES, I'M SURE</span>
          <span class="rc-choice-subtext">Leave the Shop empty-handed</span>
        `;
      }
      if (upsetBtnLeave) {
        upsetBtnLeave.style.display = 'none';
      }

      typeCutsceneLineSlow(
        '"Wait, are you sure you want to walk out empty-handed? Give me one chance to hook you up with a discount spin or a custom design before you go."'
      );
    }

    // -------------------------------------------------------------------------
    // OPTION 1 ("IT'S THE PRICE"):
    // Chloe stands up cheerful & happy to help on the left while the $1 Wheel
    // and Arcade XP panel fades in on the right!
    // -------------------------------------------------------------------------
    function openPriceBranch() {
      clearUpsetTimers();
      activeBranch = 'PRICE';
      wheelState = 'READY';
      setRightStagePane('PRICE');
      if (upsetSpriteBox) {
        upsetSpriteBox.classList.remove('bonk-shake');
        upsetSpriteBox.classList.remove('chloe-celebrate-bounce');
      }
      if (luckKissFx) luckKissFx.classList.remove('kiss-active');
      if (wheelCabinetFrame) wheelCabinetFrame.classList.remove('wheel-jackpot-glow');

      // Chloe stands up cheerful and happy to help! (Pose 4: chloe_shop_flirt1.png)
      setStandingHappyCycle(4);

      if (upsetNextPill) {
        upsetNextPill.style.display = 'inline-flex';
        upsetNextPill.textContent = '\u2190 BACK TO CHOICES';
      }

      if (wheelHubBtn) {
        wheelHubBtn.disabled = false;
        wheelHubBtn.innerHTML = '$1<br>SPIN!';
      }
      if (rightSpinBtn) {
        rightSpinBtn.disabled = false;
        rightSpinBtn.innerHTML = '&#127920; SPIN WHEEL FOR $1 (UP TO 50% OFF)';
      }
      if (wheelStatusPill) {
        wheelStatusPill.className = 'rc-wheel-status-pill';
        wheelStatusPill.textContent = '\uD83D\uDD79\uFE0F SPIN FOR $1 OR GRIND ARCADE XP!';
      }

      if (upsetSpeakerEl) upsetSpeakerEl.textContent = 'CHLOE';
      if (upsetBeatTag) upsetBeatTag.textContent = '$1 WHEEL OR ARCADE XP';

      typeCutsceneLineSlow(
        '"Oh thank goodness—so you DO like my taste! Tell you what, take a $1 spin on the wheel right here for up to 50% off, or go rack up Arcade XP toward free gear."'
      );
    }

    function goToArcadeForXp() {
      clearUpsetTimers();
      sessionStorage.setItem('rc_arcade_xp_quest', '1');
      isUpsetCutscenePlaying = false;
      upsetBypassExit = true;
      upsetCutscene.classList.remove('active');
      window.location.href = 'games.html';
    }

    // -------------------------------------------------------------------------
    // $1 RANDOM 10-SLICE WHEEL SPIN:
    // Randomly selects 1 of the 10 slices (5 Glitch, 2x 5% OFF, 1x 20% OFF,
    // 1x 25% OFF, 1x 50% OFF) and lands on that exact slice!
    // - Blows a kiss for good luck when the wheel starts spinning!
    // - Celebrates if good (5%, 20%, 25%, or 50% OFF)!
    // - Re-offers the wheel & encourages the customer to keep trying if bad!
    // -------------------------------------------------------------------------
    function spinWheelOfCanopyForDollar() {
      if (wheelState === 'SPINNING') return;
      if (wheelState === 'WON') {
        claimWheelDiscountAndStay();
        return;
      }

      clearUpsetTimers();
      wheelState = 'SPINNING';
      sessionStorage.setItem('rc_wheel_dollar_spin', '1');

      if (wheelCabinetFrame) wheelCabinetFrame.classList.remove('wheel-jackpot-glow');
      if (upsetSpriteBox) upsetSpriteBox.classList.remove('chloe-celebrate-bounce');

      // Blowing-a-kiss animation when the wheel starts spinning for good luck:
      // Briefly show her wind-up pose (Pose 4), then transition cleanly into her
      // blowing-a-kiss pose (Pose 5: chloe_wheel_kiss.png) with a floating heart!
      setUpsetPose(4);
      if (luckKissFx) {
        luckKissFx.classList.remove('kiss-active');
        void luckKissFx.offsetWidth;
      }
      const kissAnimTimer = setTimeout(() => {
        setUpsetPose(5); // Pose 5: Chloe winking & blowing a good-luck kiss!
        playCutsceneBonkSfx('blow_kiss');
        if (luckKissFx) {
          luckKissFx.classList.remove('kiss-active');
          void luckKissFx.offsetWidth;
          luckKissFx.classList.add('kiss-active');
        }
      }, 140);
      upsetTimers.push(kissAnimTimer);

      if (wheelHubBtn) {
        wheelHubBtn.disabled = true;
        wheelHubBtn.textContent = '...';
      }
      if (rightSpinBtn) {
        rightSpinBtn.disabled = true;
        rightSpinBtn.textContent = '\uD83C\uDFB0 SPINNING FOR $1...';
      }

      const sliceCount = WHEEL_SLICES.length; // 10
      const sliceAngle = 360 / sliceCount;    // 36 deg
      const chosenIdx = Math.floor(Math.random() * sliceCount);
      const chosenSlice = WHEEL_SLICES[chosenIdx];
      const sliceCenterDeg = chosenIdx * sliceAngle;
      const jitterDeg = Math.round((Math.random() - 0.5) * 18);
      const targetMod = (360 - sliceCenterDeg + jitterDeg + 360) % 360;
      const baseTurns = Math.ceil(currentWheelDeg / 360) * 360 + 360 * 5;
      const stopDeg = baseTurns + targetMod;
      currentWheelDeg = stopDeg;

      if (wheelRotorEl) {
        wheelRotorEl.style.transition = 'transform 3.6s cubic-bezier(0.12, 0.82, 0.18, 1)';
        wheelRotorEl.style.transform = `rotate(${stopDeg}deg)`;
      }
      if (wheelStatusPill) {
        wheelStatusPill.className = 'rc-wheel-status-pill';
        wheelStatusPill.textContent = '\uD83D\uDC8B GOOD-LUCK KISS SENT \u2022 SPINNING...';
      }

      const tickDelays = [
        85, 170, 255, 345, 440, 540, 645, 755, 875, 1005,
        1145, 1300, 1470, 1660, 1875, 2120, 2400, 2725, 3105, 3510
      ];
      tickDelays.forEach((ms) => {
        const t = setTimeout(() => triggerPointerTickBounce(), ms);
        upsetTimers.push(t);
      });

      if (upsetSpeakerEl) upsetSpeakerEl.textContent = 'CHLOE';
      if (upsetBeatTag) upsetBeatTag.textContent = 'GOOD-LUCK KISS \u2022 100% RANDOM';
      typeCutsceneLineSlow(
        '"There\'s a little good luck for you! Come on wheel, be nice to my favorite customer and land on that 50% off jackpot!"'
      );

      const landTimer = setTimeout(() => {
        if (luckKissFx) luckKissFx.classList.remove('kiss-active');

        if (chosenSlice.pct === 0) {
          // BAD SPIN (Glitch 0%): Re-offer the wheel & encourage the customer to keep trying!
          wheelState = 'READY';
          playCutsceneBonkSfx('glitch_buzzer');
          setUpsetPose(7); // Pose 7: chloe_wheel_encourage.png (smiling warmly & gesturing back to the wheel)

          if (wheelHubBtn) {
            wheelHubBtn.disabled = false;
            wheelHubBtn.innerHTML = '$1<br>AGAIN!';
          }
          if (rightSpinBtn) {
            rightSpinBtn.disabled = false;
            rightSpinBtn.innerHTML = '&#127920; SPIN AGAIN FOR $1 &mdash; KEEP TRYING FOR 50% OFF!';
          }
          if (wheelStatusPill) {
            wheelStatusPill.className = 'rc-wheel-status-pill glitch-landed';
            wheelStatusPill.textContent = '\uD83D\uDC80 GLITCH (0% OFF) \u2014 SPIN AGAIN & KEEP TRYING!';
          }
          if (upsetSpeakerEl) upsetSpeakerEl.textContent = 'CHLOE';
          if (upsetBeatTag) upsetBeatTag.textContent = 'RE-OFFERING WHEEL \u2022 KEEP TRYING!';

          typeCutsceneLineSlow(
            '"No way, it barely missed the discount! Don\'t stop now—give the wheel another $1 spin! I know your next one is going to hit."'
          );
          return;
        }

        // GOOD SPIN (5%, 20%, 25%, or 50% OFF): Chloe celebrates!
        wonDiscountPct = Math.max(getWheelDiscountPct(), chosenSlice.pct);
        wheelState = 'WON';
        setWheelDiscountPct(wonDiscountPct);
        applyWheelDiscountToHudPrice(lastModelCode);
        playCutsceneBonkSfx('jackpot_fanfare');

        if (wheelCabinetFrame) wheelCabinetFrame.classList.add('wheel-jackpot-glow');
        if (wheelHubBtn) {
          wheelHubBtn.disabled = false;
          wheelHubBtn.textContent = `${chosenSlice.pct}% OFF!`;
        }
        if (rightSpinBtn) {
          rightSpinBtn.disabled = false;
          rightSpinBtn.innerHTML = `&#10024; CLAIM ${wonDiscountPct}% OFF &amp; SHOP WITH CHLOE &hearts;`;
        }
        if (wheelStatusPill) {
          wheelStatusPill.className = 'rc-wheel-status-pill jackpot-won';
          wheelStatusPill.textContent = `\uD83C\uDF89 WINNER: ${chosenSlice.label} (${chosenSlice.sub})!`;
        }

        setUpsetPose(6); // Pose 6: chloe_wheel_celebrate.png (celebrating with arm raised high!)
        if (upsetSpriteBox) {
          upsetSpriteBox.classList.remove('chloe-celebrate-bounce');
          void upsetSpriteBox.offsetWidth;
          upsetSpriteBox.classList.add('chloe-celebrate-bounce');
        }
        if (upsetSpeakerEl) upsetSpeakerEl.textContent = 'CHLOE';
        if (upsetBeatTag) upsetBeatTag.textContent = `${wonDiscountPct}% OFF UNLOCKED!`;

        typeCutsceneLineSlow(
          `"YES! Look at that, my lucky kiss actually worked! You just locked in ${chosenSlice.label}—tap below to claim your ${wonDiscountPct}% off!"`
        );
      }, 3700);
      upsetTimers.push(landTimer);
    }

    function claimWheelDiscountAndStay() {
      clearUpsetTimers();
      setWheelDiscountPct(wonDiscountPct);
      const wheelCode = `WHEEL${wonDiscountPct}`;
      setMomentCoupon({
        code: wheelCode,
        icon: '🎰',
        shortLabel: `${wonDiscountPct}% OFF`,
        title: `${wonDiscountPct}% OFF Wheel Spin Coupon`,
        type: 'percent',
        pct: wonDiscountPct,
        freeShip: false,
        source: 'wheel',
        desc: `Won just now on Chloe's $1 Wheel • 1-Time Use in This Moment (Not Saved)`
      });
      renderStoreCouponDockAndCheckout();
      const kickerEl = document.getElementById('hudKicker') || document.querySelector('.hud-kicker');
      const code = kickerEl ? kickerEl.textContent.trim() : lastModelCode;
      const updatedPriceStr = applyWheelDiscountToHudPrice(code);
      if (itemTagEl && updatedPriceStr) {
        itemTagEl.textContent = `${code} \u2022 ${updatedPriceStr}`;
      }

      isUpsetCutscenePlaying = false;
      pendingExitCallback = null;
      upsetCutscene.classList.remove('active');
      setChloePose('flirt2');
      typeChloeLine(
        `See? I knew staying was the right move! Your ${wheelCode} (${wonDiscountPct}% OFF) coupon is active right now—use it at checkout before leaving (coupons are not saved)!`
      );
    }

    // -------------------------------------------------------------------------
    // OPTION 2 ("IT'S THE DESIGN"):
    // Chloe stands up cheerful & happy to help on the left while the Custom
    // Design submission form fades in on the right!
    // -------------------------------------------------------------------------
    function openDesignBranch() {
      clearUpsetTimers();
      activeBranch = 'DESIGN';
      setRightStagePane('DESIGN');
      if (upsetSpriteBox) upsetSpriteBox.classList.remove('bonk-shake');

      // Chloe stands up cheerful presenting her lookbook!
      setStandingHappyCycle(4);

      if (upsetNextPill) {
        upsetNextPill.style.display = 'inline-flex';
        upsetNextPill.textContent = '\u2190 BACK TO CHOICES';
      }
      if (customSubmitBtn) {
        customSubmitBtn.disabled = false;
        customSubmitBtn.innerHTML = '&#10024; SEND CUSTOM DESIGN TO CHLOE';
      }

      if (upsetSpeakerEl) upsetSpeakerEl.textContent = 'CHLOE';
      if (upsetBeatTag) upsetBeatTag.textContent = '1-ON-1 CUSTOM MERCH';

      typeCutsceneLineSlow(
        '"Okay, I respect that—you want something nobody else has! Tell me what piece, colors, or graphic you\'re picturing and I\'ll sketch it up for you myself."'
      );
    }

    function submitCustomDesignToChloe() {
      if (activeBranch === 'CUSTOM_DONE') {
        closeCustomDesignAndStay();
        return;
      }
      const piece = customItemSelect ? customItemSelect.value : 'Custom Retrocanopy Piece';
      const idea = (customIdeaInput && customIdeaInput.value.trim())
        ? customIdeaInput.value.trim()
        : 'Custom 1-of-1 Retrocanopy colorway & graphic concept';
      const contact = (customContactInput && customContactInput.value.trim())
        ? customContactInput.value.trim()
        : 'VIP Shopper';

      try {
        const savedList = JSON.parse(localStorage.getItem('rc_chloe_custom_designs') || '[]');
        savedList.push({
          piece,
          idea,
          contact,
          submittedAt: new Date().toISOString()
        });
        localStorage.setItem('rc_chloe_custom_designs', JSON.stringify(savedList));
      } catch (_) {}

      const updatedGrowth = addCanopyGrowth(100);
      const customTier = getCanopyTreeTier(updatedGrowth);
      renderStoreCouponDockAndCheckout();

      clearUpsetTimers();
      activeBranch = 'CUSTOM_DONE';
      setRightStagePane('CUSTOM_DONE');
      playCutsceneBonkSfx('jackpot_fanfare');

      setStandingHappyCycle(6);
      if (customSubmitBtn) {
        customSubmitBtn.innerHTML = '&#10024; RETURN TO SHOP WITH CHLOE (SAVED!) &hearts;';
      }
      if (upsetSpeakerEl) upsetSpeakerEl.textContent = 'CHLOE';
      if (upsetBeatTag) upsetBeatTag.textContent = '1-OF-1 LOCKED IN (+100 GROWTH)';

      typeCutsceneLineSlow(
        `"Wait, that idea is actually fire. I've got your ${piece} concept ('${idea.slice(0, 60)}') locked in—plus +100 Growth for your ${customTier.name} (${updatedGrowth.toLocaleString()} Total Growth)!"`
      );
    }

    function closeCustomDesignAndStay() {
      const piece = customItemSelect ? customItemSelect.value : 'Custom Piece';
      clearUpsetTimers();
      isUpsetCutscenePlaying = false;
      pendingExitCallback = null;
      upsetCutscene.classList.remove('active');
      setChloePose('flirt2');
      typeChloeLine(
        `Your custom ${piece} idea is saved on my list! Our studio will get your mockup ready—take your time looking around while you wait.`
      );
    }

    function triggerUpsetChloeCutscene(proceedFn) {
      if (isUpsetCutscenePlaying) return;
      isUpsetCutscenePlaying = true;
      pendingExitCallback = proceedFn;
      clearUpsetTimers();
      if (typeTimer) clearInterval(typeTimer);
      if (customSubmitBtn) {
        customSubmitBtn.innerHTML = '&#10024; SEND CUSTOM DESIGN TO CHLOE';
      }

      upsetCutscene.classList.add('active');
      showPriceOrDesignQuestion(false);
    }

    function finishCutsceneAndLeave() {
      clearUpsetTimers();
      isUpsetCutscenePlaying = false;
      upsetBypassExit = true;
      upsetCutscene.classList.remove('active');
      const cb = pendingExitCallback;
      pendingExitCallback = null;
      if (typeof cb === 'function') {
        cb();
      } else {
        window.location.href = 'index.html';
      }
    }

    function advanceOrReplayStoryline() {
      if (activeBranch !== 'QUESTION') {
        showPriceOrDesignQuestion(true);
        return;
      }
      if (cutsceneIsTyping) {
        if (cutsceneTypeInterval) {
          clearInterval(cutsceneTypeInterval);
          cutsceneTypeInterval = null;
        }
        cutsceneIsTyping = false;
        if (upsetTextEl) upsetTextEl.textContent = cutsceneFullLine;
        return;
      }
      // Clicking NEXT while in Acts 1-3 jumps straight to Act 4 (where she asks what was wrong and the 2 large choices fade in!)
      if (currentStoryBeatIdx < STORY_BEATS.length - 1) {
        playStoryBeat(STORY_BEATS.length - 1);
      } else {
        playStoryBeat(0);
      }
    }

    if (wheelHubBtn) {
      wheelHubBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (wheelState === 'WON') wheelState = 'READY';
        spinWheelOfCanopyForDollar();
      });
    }
    if (rightSpinBtn) {
      rightSpinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        spinWheelOfCanopyForDollar();
      });
    }
    if (rightArcadeBtn) {
      rightArcadeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToArcadeForXp();
      });
    }
    if (wheelBackChoicesBtn) {
      wheelBackChoicesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPriceOrDesignQuestion(true);
      });
    }
    if (designBackChoicesBtn) {
      designBackChoicesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPriceOrDesignQuestion(true);
      });
    }
    if (customSubmitBtn) {
      customSubmitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        submitCustomDesignToChloe();
      });
    }
    if (upsetBtnStay) {
      upsetBtnStay.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeBranch === 'CONFIRM_LEAVE') {
          showPriceOrDesignQuestion(true);
        } else {
          openPriceBranch();
        }
      });
    }
    if (upsetBtnSecondary) {
      upsetBtnSecondary.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeBranch === 'CONFIRM_LEAVE') {
          finishCutsceneAndLeave();
        } else {
          openDesignBranch();
        }
      });
    }
    if (upsetNextPill) {
      upsetNextPill.addEventListener('click', (e) => {
        e.stopPropagation();
        advanceOrReplayStoryline();
      });
    }
    if (upsetTextEl) {
      upsetTextEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeBranch === 'QUESTION') {
          advanceOrReplayStoryline();
        }
      });
    }
    if (upsetBtnLeave) {
      upsetBtnLeave.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeBranch === 'CONFIRM_LEAVE') {
          finishCutsceneAndLeave();
        } else {
          promptConfirmLeave();
        }
      });
    }

    // Expose hooks for parent iframe host (index.html) and standalone browser navigation
    window.__rcShouldInterceptExitToHome = function () {
      return !upsetBypassExit && getShopBagCount() === 0 && !isUpsetCutscenePlaying;
    };
    window.__rcTriggerUpsetCutscene = function (proceedFn) {
      triggerUpsetChloeCutscene(proceedFn);
    };

    // Intercept clicking ANY link back to index.html (e.g. RETROCANOPY brand link) AND keep Shop category tabs on a single Back-button entry
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      if (href === 'index.html' || href.endsWith('/index.html')) {
        if (!upsetBypassExit && getShopBagCount() === 0) {
          e.preventDefault();
          e.stopImmediatePropagation();
          triggerUpsetChloeCutscene(() => {
            try {
              if (window.parent && window.parent !== window && window.parent.__rcLofiHostActive) {
                window.parent.__rcCloseSubpage(true);
                return;
              }
            } catch (_) {}
            window.location.href = href;
          });
        }
        return;
      }

      if (/(hat|deskmat|hoodie|tee|joggers|longsleeve|gearbag)_preview\.html/i.test(href)) {
        e.preventDefault();
        window.location.replace(href);
      }
    }, true);

    let isInsideSeamlessHost = false;
    try {
      isInsideSeamlessHost = Boolean(window.parent && window.parent !== window && window.parent.__rcLofiHostActive);
    } catch (_) {}

    if (!isInsideSeamlessHost && window.history && window.history.pushState) {
      let historyGuardPushed = false;
      const pushBackGuardOnce = () => {
        if (historyGuardPushed) return;
        historyGuardPushed = true;
        try {
          window.history.pushState({ rcShopGuard: true }, '', window.location.href);
        } catch (_) {}
      };
      pushBackGuardOnce();
      window.addEventListener('pointerdown', pushBackGuardOnce, { once: true, passive: true });
      window.addEventListener('keydown', pushBackGuardOnce, { once: true, passive: true });

      window.addEventListener('popstate', () => {
        if (!upsetBypassExit && getShopBagCount() === 0) {
          try {
            window.history.pushState({ rcShopGuard: true }, '', window.location.href);
          } catch (_) {}
          if (isUpsetCutscenePlaying && activeBranch !== 'CONFIRM_LEAVE') {
            promptConfirmLeave();
          } else if (isUpsetCutscenePlaying && activeBranch === 'CONFIRM_LEAVE') {
            finishCutsceneAndLeave();
          } else {
            triggerUpsetChloeCutscene(() => {
              window.location.href = 'index.html';
            });
          }
        } else {
          window.location.href = 'index.html';
        }
      });
    }
  }

  /**
   * CONTINUOUS SOFT LOFI STUDY BEATS IN THE SHOP
   * If opened from the Home page, the parent window's AudioContext continues playing without a 1ms break.
   * If opened directly in a standalone tab, runs the continuous lookahead Lofi scheduler.
   */
  function initShopLofiMusic() {
    try {
      if (window.parent && window.parent !== window && window.parent.__rcLofiHostActive) {
        // Sync parent URL bar with current shop category page
        const currentFile = window.location.pathname.split('/').pop() || 'hat_preview.html';
        if (window.parent.history && window.parent.history.replaceState) {
          window.parent.history.replaceState({ subpage: currentFile }, '', currentFile);
        }
        // Intercept clicking RETROCANOPY (Home) so we return to the lobby instantly without reloading or stopping Lofi!
        document.addEventListener('click', (e) => {
          const link = e.target.closest('a[href]');
          if (!link) return;
          const href = link.getAttribute('href') || '';
          if (href === 'index.html' || href.endsWith('/index.html')) {
            e.preventDefault();
            if (window.__rcShouldInterceptExitToHome && window.__rcShouldInterceptExitToHome()) {
              window.__rcTriggerUpsetCutscene(() => {
                window.parent.__rcCloseSubpage(true);
              });
            } else {
              window.parent.__rcCloseSubpage(true);
            }
          }
        });
        return;
      }
    } catch (_) {}

    let btn = document.getElementById('lofi-music-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lofi-music-btn';
      btn.id = 'lofi-music-btn';
      btn.setAttribute('aria-label', 'Toggle Lofi Background Music');
      btn.innerHTML = '<span class="lofi-eq" aria-hidden="true"><i></i><i></i><i></i></span><span id="lofi-music-label">LOFI: ON</span>';
      document.body.appendChild(btn);
    }
    const labelEl = document.getElementById('lofi-music-label');

    let ctx = null;
    let masterGain = null;
    let started = false;
    let muted = sessionStorage.getItem('rc_lofi_muted') === '1';

    function updateUI() {
      const playing = started && !muted;
      btn.classList.toggle('playing', playing);
      btn.classList.toggle('muted', muted);
      if (labelEl) {
        labelEl.textContent = muted ? 'LOFI: OFF' : 'LOFI: ON';
      }
    }

    function ensureCtx() {
      if (!ctx) {
        ctx = ensureShopAudioContext();
        if (!ctx) return null;
        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        masterGain.connect(ctx.destination);

        ctx.onstatechange = () => {
          if (ctx.state === 'running') {
            isShopAudioUnlocked = true;
            removeShopUnlockListeners();
            if (!started) {
              startLoop();
            } else if (!muted && masterGain) {
              masterGain.gain.setTargetAtTime(0.14, ctx.currentTime, 0.4);
            }
          }
        };
      }
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }

    function startLoop() {
      if (started) return;
      const audioCtx = ensureCtx();
      if (!audioCtx) return;
      started = true;
      sessionStorage.setItem('rc_lofi_active', '1');
      updateUI();

      if (!muted && masterGain) {
        masterGain.gain.setTargetAtTime(0.12, audioCtx.currentTime + 0.05, 0.8);
      }

      // 1. Continuous Warm Analog Tape Pad (zero silence between bars)
      try {
        const padFilter = audioCtx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.value = 420;
        const padGain = audioCtx.createGain();
        padGain.gain.value = 0.032;
        padFilter.connect(padGain);
        padGain.connect(masterGain);
        [174.61, 220.00, 261.63, 329.63].forEach((freq, i) => {
          const padOsc = audioCtx.createOscillator();
          padOsc.type = i % 2 === 0 ? 'sine' : 'triangle';
          padOsc.frequency.value = freq;
          padOsc.detune.value = (i - 1.5) * 4;
          padOsc.connect(padFilter);
          padOsc.start();
        });
      } catch (_) {}

      // 2. Subtle warm vinyl crackle
      try {
        const bufferSize = audioCtx.sampleRate * 4;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const r = Math.random();
          output[i] = r > 0.996 ? (Math.random() * 2 - 1) * 0.35 : (Math.random() * 2 - 1) * 0.015;
        }
        const vinylSource = audioCtx.createBufferSource();
        vinylSource.buffer = noiseBuffer;
        vinylSource.loop = true;
        const vinylFilter = audioCtx.createBiquadFilter();
        vinylFilter.type = 'bandpass';
        vinylFilter.frequency.value = 1650;
        vinylFilter.Q.value = 0.9;
        const vinylGain = audioCtx.createGain();
        vinylGain.gain.value = 0.065;
        vinylSource.connect(vinylFilter);
        vinylFilter.connect(vinylGain);
        vinylGain.connect(masterGain);
        vinylSource.start();
      } catch (_) {}

      const chords = [
        { bass: 87.31, notes: [174.61, 220.00, 261.63, 329.63, 392.00], melody: [523.25, 440.00, 392.00, 329.63] },
        { bass: 82.41, notes: [164.81, 196.00, 246.94, 293.66, 392.00], melody: [493.88, 392.00, 329.63, 293.66] },
        { bass: 73.42, notes: [146.83, 174.61, 220.00, 261.63, 329.63], melody: [440.00, 392.00, 329.63, 261.63] },
        { bass: 65.41, notes: [130.81, 164.81, 196.00, 246.94, 293.66], melody: [392.00, 329.63, 293.66, 329.63] }
      ];

      const beatSec = 60 / 72;
      const barSec = beatSec * 4;
      let barIndex = parseInt(sessionStorage.getItem('rc_lofi_bar') || '0', 10) || 0;
      let nextBarTime = audioCtx.currentTime + 0.04;

      function scheduleBarAt(barStartTime) {
        if (!ctx) return;
        const chord = chords[barIndex % chords.length];
        barIndex++;
        sessionStorage.setItem('rc_lofi_bar', String(barIndex));

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(940, barStartTime);
        filter.frequency.exponentialRampToValueAtTime(560, barStartTime + barSec * 1.08);
        filter.connect(masterGain);

        const sustainDur = barSec * 1.12;
        chord.notes.forEach((freq, idx) => {
          const ns = barStartTime + idx * 0.03;
          const osc = ctx.createOscillator();
          const oscWarm = ctx.createOscillator();
          const ng = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ns);
          oscWarm.type = 'triangle';
          oscWarm.frequency.setValueAtTime(freq, ns);
          oscWarm.detune.setValueAtTime(5, ns);
          ng.gain.setValueAtTime(0.0001, ns);
          ng.gain.linearRampToValueAtTime(0.11, ns + 0.06);
          ng.gain.exponentialRampToValueAtTime(0.055, ns + barSec * 0.85);
          ng.gain.exponentialRampToValueAtTime(0.001, ns + sustainDur);
          osc.connect(ng);
          oscWarm.connect(ng);
          ng.connect(filter);
          osc.start(ns);
          oscWarm.start(ns);
          osc.stop(ns + sustainDur + 0.02);
          oscWarm.stop(ns + sustainDur + 0.02);
        });

        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(chord.bass, barStartTime);
        bassGain.gain.setValueAtTime(0.0001, barStartTime);
        bassGain.gain.linearRampToValueAtTime(0.22, barStartTime + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.001, barStartTime + barSec * 1.05);
        bassOsc.connect(bassGain);
        bassGain.connect(masterGain);
        bassOsc.start(barStartTime);
        bassOsc.stop(barStartTime + barSec * 1.06);

        if (chord.melody) {
          chord.melody.forEach((mFreq, mIdx) => {
            const mTime = barStartTime + beatSec * (0.75 + mIdx * 0.85);
            const mOsc = ctx.createOscillator();
            const mGain = ctx.createGain();
            mOsc.type = 'sine';
            mOsc.frequency.setValueAtTime(mFreq, mTime);
            mGain.gain.setValueAtTime(0.0001, mTime);
            mGain.gain.linearRampToValueAtTime(0.05, mTime + 0.03);
            mGain.gain.exponentialRampToValueAtTime(0.001, mTime + beatSec * 1.1);
            mOsc.connect(mGain);
            mGain.connect(filter);
            mOsc.start(mTime);
            mOsc.stop(mTime + beatSec * 1.12);
          });
        }

        // Soft Kick on beats 1 and 2.55
        [0, beatSec * 2.55].forEach((offset) => {
          const kt = barStartTime + offset;
          const kOsc = ctx.createOscillator();
          const kGain = ctx.createGain();
          kOsc.type = 'sine';
          kOsc.frequency.setValueAtTime(118, kt);
          kOsc.frequency.exponentialRampToValueAtTime(42, kt + 0.11);
          kGain.gain.setValueAtTime(0.32, kt);
          kGain.gain.exponentialRampToValueAtTime(0.001, kt + 0.22);
          kOsc.connect(kGain);
          kGain.connect(masterGain);
          kOsc.start(kt);
          kOsc.stop(kt + 0.24);
        });

        // Soft Snare on beats 2 and 4
        [beatSec * 1, beatSec * 3].forEach((offset) => {
          const st = barStartTime + offset;
          const bufSize = Math.floor(ctx.sampleRate * 0.14);
          const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.035));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buf;
          const sFilter = ctx.createBiquadFilter();
          sFilter.type = 'lowpass';
          sFilter.frequency.setValueAtTime(1350, st);
          const sGain = ctx.createGain();
          sGain.gain.setValueAtTime(0.14, st);
          sGain.gain.exponentialRampToValueAtTime(0.001, st + 0.13);
          noise.connect(sFilter);
          sFilter.connect(sGain);
          sGain.connect(masterGain);
          noise.start(st);
        });
      }

      function lookaheadTick() {
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
          return;
        }
        if (nextBarTime < ctx.currentTime - 0.1) {
          nextBarTime = ctx.currentTime + 0.04;
        }
        while (nextBarTime < ctx.currentTime + 0.85) {
          scheduleBarAt(nextBarTime);
          nextBarTime += barSec;
        }
      }

      lookaheadTick();
      setInterval(lookaheadTick, 200);
    }

    let isShopAudioUnlocked = false;
    const shopUnlockVectors = ['click', 'keydown', 'pointerdown', 'touchstart', 'mousemove', 'pointermove'];
    function removeShopUnlockListeners() {
      shopUnlockVectors.forEach((evt) => {
        window.removeEventListener(evt, resumeAudioOnInteraction);
      });
    }

    const resumeAudioOnInteraction = () => {
      if (isShopAudioUnlocked && started) return;
      const audioCtx = ensureCtx();
      if (!audioCtx) return;
      if (audioCtx.state === 'running') {
        isShopAudioUnlocked = true;
        removeShopUnlockListeners();
        if (!started) {
          startLoop();
        } else if (!muted && masterGain) {
          masterGain.gain.setTargetAtTime(0.14, audioCtx.currentTime, 0.4);
        }
      } else if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
          isShopAudioUnlocked = true;
          removeShopUnlockListeners();
          if (!started) {
            startLoop();
          } else if (!muted && masterGain) {
            masterGain.gain.setTargetAtTime(0.14, audioCtx.currentTime, 0.4);
          }
        }).catch(() => {});
      }
    };

    shopUnlockVectors.forEach((evt) => {
      window.addEventListener(evt, resumeAudioOnInteraction, { passive: true });
    });

    btn.addEventListener('click', () => {
      if (!started) {
        muted = false;
        sessionStorage.setItem('rc_lofi_muted', '0');
        startLoop();
        return;
      }
      muted = !muted;
      sessionStorage.setItem('rc_lofi_muted', muted ? '1' : '0');
      const audioCtx = ensureCtx();
      if (audioCtx && masterGain) {
        masterGain.gain.setTargetAtTime(muted ? 0.0001 : 0.12, audioCtx.currentTime, 0.25);
      }
      updateUI();
    });

    startLoop();
  }
})();
