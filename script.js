/**
 * Retrocanopy - Core Application Scripts
 * Lightweight, modular client script with zero console errors on minimal pages.
 */

/**
 * Creator Profit Calculator (creators.html)
 */
function updateEarnings(val) {
    const items = parseInt(val, 10) || 0;
    const countElem = document.getElementById('sales-count');
    const retroProfitElem = document.getElementById('retrocanopy-profit');
    const genericProfitElem = document.getElementById('generic-profit');

    if (countElem) {
        countElem.textContent = `${items} items / month`;
    }

    const retroProfit = items * 16;
    const genericProfit = items * 6;

    if (retroProfitElem) {
        retroProfitElem.textContent = `$${retroProfit.toLocaleString()} / mo`;
    }
    if (genericProfitElem) {
        genericProfitElem.textContent = `$${genericProfit.toLocaleString()} / mo`;
    }
}

/**
 * Creator Application Submission Handler (creators.html)
 */
async function handleCreatorSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : 'SUBMIT';

    const creatorName = document.getElementById('creator-name')?.value || '';
    const channelUrl = document.getElementById('creator-link')?.value || '';
    const audienceSize = document.getElementById('creator-audience')?.value || '';
    const desiredProducts = document.getElementById('creator-products')?.value || '';
    const businessEmail = document.getElementById('creator-email')?.value || '';
    const notes = document.getElementById('creator-notes')?.value || '';

    if (submitBtn) submitBtn.innerHTML = 'SUBMITTING APPLICATION...';

    const client = window.db || (typeof db !== 'undefined' ? db : null);
    if (client) {
        try {
            const { error } = await client.from('creator_applications').insert([{
                creator_name: creatorName,
                channel_url: channelUrl,
                audience_size: audienceSize,
                desired_products: desiredProducts,
                business_email: businessEmail,
                notes: notes || null
            }]);
            if (error) console.warn('Supabase creator insert notice:', error);
        } catch (err) {
            console.error('Supabase connection error:', err);
        }
    }

    alert('CREATOR APPLICATION RECEIVED!\n\nThank you for reaching out. Our team will review your channel and reply within 24 hours with your sample kit details.');
    if (submitBtn) submitBtn.innerHTML = originalText;
    form.reset();
}

/**
 * Organization Bulk Order Submission Handler (organizations.html)
 */
async function handleOrgSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : 'SUBMIT';

    const orgName = document.getElementById('org-name')?.value || '';
    const orgType = document.getElementById('org-type')?.value || '';
    const contactName = document.getElementById('org-contact')?.value || '';
    const phone = document.getElementById('org-phone')?.value || '';
    const email = document.getElementById('org-email')?.value || '';
    const deadline = document.getElementById('org-date')?.value || '';
    const quantityTier = document.getElementById('org-qty')?.value || '';
    const taxExempt = document.getElementById('org-tax')?.value || 'No';
    const artworkLink = document.getElementById('org-artwork')?.value || '';
    const notes = document.getElementById('org-notes')?.value || '';

    const productCheckboxes = form.querySelectorAll('input[name="products[]"]:checked');
    const productsNeeded = Array.from(productCheckboxes).map(cb => cb.value);

    if (submitBtn) submitBtn.innerHTML = 'TRANSMITTING QUOTE REQUEST...';

    const client = window.db || (typeof db !== 'undefined' ? db : null);
    if (client) {
        try {
            const { error } = await client.from('organization_orders').insert([{
                organization_name: orgName,
                organization_type: orgType,
                contact_name: contactName,
                phone: phone,
                email: email,
                deadline: deadline || null,
                products_needed: productsNeeded,
                quantity_tier: quantityTier,
                tax_exempt: taxExempt,
                artwork_link: artworkLink || null,
                notes: notes || null
            }]);
            if (error) console.warn('Supabase org insert notice:', error);
        } catch (err) {
            console.error('Supabase connection error:', err);
        }
    }

    alert('BULK QUOTE REQUEST RECEIVED!\n\nThank you for reaching out. A dedicated account manager will prepare your itemized quote, volume discounts, and digital mockups within 24 business hours.');
    if (submitBtn) submitBtn.innerHTML = originalText;
    form.reset();
}

/**
 * 16-Bit Retrocanopy Crew Interactive Tutorial Intro (index.html)
 * 1) James and his friends walk onto the stage from the left
 * 2) James sips his drink and introduces the website and all of his friends by name
 * 3) After introducing them, James throws his drink cup spinning off-screen
 * 4) Each friend (Chloe, CAB-84, Akari, Grizz, and Dark James & Raven) introduces themselves
 *    and what they do, and then the respective link to their page appears above them!
 */
function initGamerIntro() {
    const stage = document.getElementById('crew-stage');
    const jamesActor = document.getElementById('arcade-character');
    if (!stage) return;

    const heroContainer = document.getElementById('hero-container') || document.querySelector('.hero-container');
    const brandNameEl = document.querySelector('.brand-name');
    const dialogue = document.getElementById('character-dialogue');
    const dialogueSpeaker = document.getElementById('dialogue-speaker');
    const dialogueText = document.getElementById('dialogue-text');
    const dialogueHint = document.getElementById('dialogue-hint');
    const skipIntroBtn = document.getElementById('skip-intro-btn');
    const thrownCup = document.getElementById('thrown-drink-cup');
    const flickerO = document.getElementById('flicker-o') || document.querySelector('.flicker-letter');
    const oHitSpark = document.getElementById('o-hit-spark');
    const oShockwaveRing = document.getElementById('o-shockwave-ring');
    const sabotageScreenFlash = document.getElementById('sabotage-screen-flash');
    const villainProjectile = document.getElementById('villain-projectile');
    const lofiMusicBtn = document.getElementById('lofi-music-btn');
    const lofiMusicLabel = document.getElementById('lofi-music-label');

    const jamesFrames = {
        walk1: document.getElementById('frame-walk1'),
        walk2: document.getElementById('frame-walk2'),
        sip: document.getElementById('frame-sip'),
        talk1Drink: document.getElementById('frame-talk1-drink'),
        talk2Drink: document.getElementById('frame-talk2-drink'),
        throwCup: document.getElementById('frame-throw'),
        talk1: document.getElementById('frame-talk1'),
        talk2: document.getElementById('frame-talk2'),
        idle: document.getElementById('frame-idle'),
        exit: document.getElementById('frame-exit')
    };

    const villainOrder = [];
    const crewOrder = ['cab84', 'chloe', 'akari', 'grizz'];
    const friendsOnlyOrder = ['cab84', 'chloe', 'akari', 'grizz'];
    const synthIntroOrder = ['chloe', 'cab84', 'akari', 'grizz'];
    const allActorsOrder = [...crewOrder];
    const crewActors = {};
    allActorsOrder.forEach((id) => {
        const el = id === 'james' ? jamesActor : document.getElementById(`actor-${id}`);
        const linkSlot = document.getElementById(`link-slot-${id}`);
        if (el) {
            crewActors[id] = {
                id,
                el,
                linkSlot,
                posX: -450,
                posY: 0,
                currentScale: 1,
                targetX: 0,
                targetY: 0,
                walkInSpeed: 220,
                width: 150,
                arrived: false,
                isHovered: false,
                walkFrame: 0
            };
        }
    });

    // Hologram Owl Butler ("SYN") Cinematic Gaming Culture Shift Journey Stage
    const holoStage = document.getElementById('holo-butler-journey-stage');
    const holoEraCanvas = document.getElementById('holo-era-canvas');
    const shutteredArcadeStaticCanvas = document.getElementById('shuttered-arcade-static-canvas');
    const tvPileStaticCanvas = document.getElementById('tv-pile-static-canvas');
    const synthOpeningGreetingEl = document.getElementById('synth-opening-greeting');
    const synthGreetingTextEl = document.getElementById('synth-greeting-text');
    const crewActionBackdropFlashEl = document.getElementById('crew-action-backdrop-flash');
    const actionFlashLayers = document.querySelectorAll('.action-flash-layer');
    const holoEraSlides = document.querySelectorAll('.holo-era-slide');
    const holoDialogueCard = document.getElementById('holo-dialogue-card');
    const holoDialogueText = document.getElementById('holo-dialogue-text');
    const holoEraTag = document.getElementById('holo-era-tag');
    const holoNextBtn = document.getElementById('holo-next-btn');
    const holoTimelinePills = document.querySelectorAll('.holo-era-pill');
    const owlActorEl = document.getElementById('actor-owl-butler');
    const synthSteampunkComingSoonEl = document.getElementById('synth-steampunk-coming-soon');
    const holoDramaticFlash = document.getElementById('holo-dramatic-flash');

    // When true, after the 8 era cutscenes finish (Scene 8), instead of introducing the crew,
    // Synth walks to the center of the stage and says "Coming soon... 11/14" with the fancy Steampunk sign above him.
    // Set to false on 11/14 launch to restore the full 4-character crew introductions!
    const TEASER_COMING_SOON_MODE = true;

    const fullPrologueSteps = [
        {
            eraIndex: 0,
            mood: 'nostalgia',
            eraTag: 'SYNTH  \u2022  1980s \u2014 WHERE IT ALL BEGAN',
            talkPose: 'idle',
            audioStartSec: 14.40,
            holdMs: 8140,
            text: "Do you remember the first time, when a glowing screen felt like a doorway to another world?"
        },
        {
            eraIndex: 1,
            mood: 'nostalgia',
            eraTag: 'SYNTH  \u2022  1990s \u2014 FRIDAY NIGHTS',
            talkPose: 'idle',
            audioStartSec: 22.54,
            holdMs: 10640,
            text: "No phones. No algorithms. Just your best friends on the living room floor, wishing the weekend would never end."
        },
        {
            eraIndex: 2,
            mood: 'youth',
            eraTag: 'SYNTH  \u2022  EARLY 2000s \u2014 GROWING UP TOGETHER',
            talkPose: 'idle',
            audioStartSec: 33.18,
            holdMs: 10790,
            text: "We grew up in those late night rooms. Tangled controller cords, open binders, and laughter at two in the morning."
        },
        {
            eraIndex: 3,
            mood: 'youth',
            eraTag: 'SYNTH  \u2022  2000s \u2014 MORE THAN A GAME',
            talkPose: 'idle',
            audioStartSec: 43.97,
            holdMs: 10660,
            text: "It was never just pixels on glass. It was where we found our people, our music, and a place we truly belonged."
        },
        {
            eraIndex: 4,
            mood: 'heartbreak',
            eraTag: 'SYNTH  \u2022  THE SHIFT \u2014 WHEN THE LIGHTS WENT OUT',
            talkPose: 'idle',
            audioStartSec: 54.63,
            holdMs: 12810,
            text: "And then, almost without noticing, we grew up. Our favorite hangouts went dark in the rain, and the room fell quiet."
        },
        {
            eraIndex: 5,
            mood: 'heartbreak',
            eraTag: 'SYNTH  \u2022  THE SHIFT \u2014 LOST IN THE STATIC',
            talkPose: 'idle',
            audioStartSec: 67.44,
            holdMs: 10530,
            text: "What used to be built on love, was buried beneath paywalls, timers, and cold, lonely static."
        },
        {
            eraIndex: 6,
            mood: 'rebirth',
            eraTag: 'SYNTH  \u2022  THE SPARK \u2014 REFUSING TO FORGET',
            talkPose: 'idle',
            audioStartSec: 77.97,
            holdMs: 10050,
            text: "Because that feeling, that warmth of sitting shoulder to shoulder, was never meant to be sold back to us in pieces."
        },
        {
            eraIndex: 7,
            mood: 'rebirth',
            eraTag: 'SYNTH  \u2022  HOME \u2014 THE RETROCANOPY SANCTUARY',
            talkPose: 'talk2',
            audioStartSec: 88.02,
            holdMs: 10750,
            text: "So we built a sanctuary to keep the soul of it alive. Welcome home to Retrocanopy. You are never alone here."
        },
        {
            eraIndex: 8,
            mood: 'rebirth',
            eraTag: TEASER_COMING_SOON_MODE ? 'SYNTH  \u2022  COMING SOON 11/14' : 'SYNTH  \u2022  OUTRO \u2014 WELCOMING THE CREW',
            talkPose: 'idle',
            audioStartSec: 98.77,
            holdMs: TEASER_COMING_SOON_MODE ? 5500 : 11180,
            text: TEASER_COMING_SOON_MODE
                ? "Coming soon... 11/14."
                : "Now dry your eyes, old friend. Allow me to welcome in the crew who built this home for you. Everyone, come on out."
        },
        {
            eraIndex: 9,
            mood: 'rebirth',
            crewId: 'chloe',
            eraTag: 'SYNTH  \u2022  MEET CHLOE \u2014 THE SHOP',
            talkPose: 'idle',
            audioStartSec: 109.95,
            holdMs: 9810,
            text: "First is Chloe, who runs the Shop, crafting our retro streetwear, custom hats, and limited community drops."
        },
        {
            eraIndex: 10,
            mood: 'rebirth',
            crewId: 'cab84',
            eraTag: 'SYNTH  \u2022  MEET CAB-84 \u2014 THE ARCADE',
            talkPose: 'idle',
            audioStartSec: 119.76,
            holdMs: 9560,
            text: "Beside her is CAB-84, who powers the Arcade, keeping our free retro games and high score battles alive."
        },
        {
            eraIndex: 11,
            mood: 'rebirth',
            crewId: 'akari',
            eraTag: 'SYNTH  \u2022  MEET AKARI \u2014 CULTURE HUB',
            talkPose: 'idle',
            audioStartSec: 129.32,
            holdMs: 10730,
            text: "Next is Akari, curator of our Culture Hub, a home for community chat, pixel art, music, and trading cards."
        },
        {
            eraIndex: 12,
            mood: 'rebirth',
            crewId: 'grizz',
            eraTag: 'SYNTH  \u2022  MEET GRIZZ \u2014 CREATORS & BULK',
            talkPose: 'idle',
            audioStartSec: 140.05,
            holdMs: 14330,
            text: "And finally, Grizz, who leads Creator Collabs and custom Bulk Orders, printing and shipping everything in-house with care. Take a look around, old friend. You are home."
        }
    ];

    const prologueSteps = TEASER_COMING_SOON_MODE ? fullPrologueSteps.slice(0, 9) : fullPrologueSteps;

    const scriptSteps = [
        {
            id: 'chloe',
            speaker: 'CHLOE \u2022 THE SHOP',
            text: "I'm Chloe! I run the Shop \u2014 grab our retro streetwear, hats, and limited merch drops.",
            holdMs: 2100
        },
        {
            id: 'cab84',
            speaker: 'CAB-84 \u2022 THE ARCADE',
            text: "I'm CAB-84! I power the Arcade \u2014 jump into our free retro games and beat the high score!",
            holdMs: 2100
        },
        {
            id: 'akari',
            speaker: 'AKARI \u2022 CULTURE HUB',
            text: "Hmmm...",
            holdMs: 2100
        },
        {
            id: 'grizz',
            speaker: 'GRIZZ \u2022 CREATORS & BULK',
            text: "I'm Grizz! I run Creator Collabs and custom Bulk Orders \u2014 we print and ship everything in-house.",
            holdMs: 2200
        }
    ];

    let talkAnimTimer = null;
    let typeTimer = null;
    let advanceTimer = null;
    let isTyping = false;
    let inPrologue = false;
    let currentPrologueIndex = -1;
    let isThrowingAtO = false;
    let hasSabotagedO = false;
    let currentStepIndex = -1;
    let sequenceComplete = false;
    let jamesHasExited = true;
    let isTransitioningExit = false;

    function triggerOSabotageEffect(playFlash = true) {
        if (!hasSabotagedO) {
            hasSabotagedO = true;
            if (flickerO) {
                flickerO.classList.add('sabotaged');
            }
        }
        if (playFlash) {
            playSabotageBoomSound();
            if (brandNameEl) {
                brandNameEl.classList.remove('sabotage-camera-shake');
                void brandNameEl.offsetWidth;
                brandNameEl.classList.add('sabotage-camera-shake');
            }
            if (oHitSpark) {
                oHitSpark.classList.remove('burst');
                void oHitSpark.offsetWidth;
                oHitSpark.classList.add('burst');
            }
            if (oShockwaveRing) {
                oShockwaveRing.classList.remove('burst');
                void oShockwaveRing.offsetWidth;
                oShockwaveRing.classList.add('burst');
            }
            if (sabotageScreenFlash) {
                sabotageScreenFlash.classList.remove('active');
                void sabotageScreenFlash.offsetWidth;
                sabotageScreenFlash.classList.add('active');
            }
        }
    }

    const stage3dDioramaReflectionEl = document.getElementById('stage-3d-diorama-reflection');

    /**
     * Concept 1 & Concept 3A Final:
     * 1) Multi-Slice Thick 3D Voxel Extrusion Stack (.voxel-3d-extrusion-stack) behind every Crew Member & Synth
     *    so the 2D sprites look thick and pop out in 3D space
     * 2) Real-Time Inverted Floor Mirror Reflections (.crew-floor-mirror / .owl-floor-mirror) on the 3D Neon-Grid Floor
     * 3) Smooth 3D Stage Camera Mouse-Tilt Parallax (--stage-tilt-x, --stage-tilt-y)
     */
    function syncContainer3DVoxelAndMirror(spriteContainerEl, actorRootEl, activeFrameImg) {
        // Single clean 3D-shaded sprite per character (no stacked duplicate slices)
    }

    function triggerIntro360Spin() {
        // Characters stay front-facing in their spots
    }

    function init3DVoxelStageAndActors() {
        // Remove any legacy stacked slices, canvases, or duplicate mirror images
        allActorsOrder.forEach((id) => {
            const actor = crewActors[id];
            if (!actor || !actor.el) return;
            const container = actor.el.querySelector('.gamer-frame-container');
            if (container) {
                container.classList.remove('figurine-3d-ready');
                const oldCanvas = container.querySelector('.char-3d-statue-canvas');
                if (oldCanvas) oldCanvas.remove();
                const oldStack = container.querySelector('.voxel-3d-extrusion-stack');
                if (oldStack) oldStack.remove();
            }
            const oldMirror = actor.el.querySelector('.crew-floor-mirror');
            if (oldMirror) oldMirror.remove();
        });

        if (owlActorEl) {
            const owlWrap = owlActorEl.querySelector('.holo-owl-sprite-wrap');
            if (owlWrap) {
                const oldStack = owlWrap.querySelector('.voxel-3d-extrusion-stack');
                if (oldStack) oldStack.remove();
            }
            const oldMirror = owlActorEl.querySelector('.owl-floor-mirror');
            if (oldMirror) oldMirror.remove();
        }
    }

    function showJamesFrame(name) {
        for (const [key, el] of Object.entries(jamesFrames)) {
            if (el) {
                el.classList.toggle('active', key === name);
            }
        }
    }

    function setActorFacing(id, faceLeft) {
        const actor = crewActors[id];
        if (!actor || !actor.el) return;
        const containers = actor.el.querySelectorAll('.gamer-frame-container');
        containers.forEach((container) => {
            container.style.transform = faceLeft ? 'scaleX(-1)' : '';
        });
    }

    function setActorPose(id, poseName) {
        if (id === 'james') {
            showJamesFrame(poseName);
            return;
        }
        const actor = crewActors[id];
        if (!actor || !actor.el) return;
        const containers = actor.el.querySelectorAll('.gamer-frame-container');
        containers.forEach((container) => {
            const w1 = container.querySelector('.frame-walk1');
            const w2 = container.querySelector('.frame-walk2');
            const w3 = container.querySelector('.frame-walk3');
            const idle = container.querySelector('.frame-idle');
            const t1 = container.querySelector('.frame-talk1');
            const t2 = container.querySelector('.frame-talk2');
            const th = container.querySelector('.frame-throw');
            const bk = container.querySelector('.frame-back');
            const bkw = container.querySelector('.frame-back-windup');
            const bkt = container.querySelector('.frame-back-throw');
            if (w1) w1.classList.toggle('active', poseName === 'walk1');
            if (w2) w2.classList.toggle('active', poseName === 'walk2');
            if (w3) w3.classList.toggle('active', poseName === 'walk3');
            if (idle) idle.classList.toggle('active', poseName === 'idle');
            if (t1) t1.classList.toggle('active', poseName === 'talk1');
            if (t2) t2.classList.toggle('active', poseName === 'talk2');
            if (th) th.classList.toggle('active', poseName === 'throw');
            if (bk) bk.classList.toggle('active', poseName === 'back');
            if (bkw) bkw.classList.toggle('active', poseName === 'backWindup');
            if (bkt) bkt.classList.toggle('active', poseName === 'backThrow');

            const activeImg = container.querySelector('.g-frame.active') || idle;
            syncContainer3DVoxelAndMirror(container, actor.el, activeImg);
        });
    }

    init3DVoxelStageAndActors();

    function computeVillainPositions() {
        const vw = window.innerWidth;
        const raven = crewActors.raven;
        const dj = crewActors.darkjames;
        const ravenW = raven ? (raven.el.getBoundingClientRect().width || 180) : 180;
        const djW = dj ? (dj.el.getBoundingClientRect().width || 165) : 165;
        const pairGap = Math.max(18, Math.min(48, vw * 0.03));
        const totalPairW = ravenW + pairGap + djW;
        const startX = Math.round((vw - totalPairW) / 2);

        if (raven) {
            raven.width = ravenW;
            raven.targetX = startX;
        }
        if (dj) {
            dj.width = djW;
            dj.targetX = startX + ravenW + pairGap;
        }
    }

    function computeTargetPositions(excludeJames = jamesHasExited, reserveLeftForSyn = false) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const activeOrder = excludeJames ? friendsOnlyOrder : crewOrder;
        const isMobile = vw <= 768;

        // Measure each character's base unscaled width
        const baseWidths = {};
        activeOrder.forEach((id) => {
            const actor = crewActors[id];
            if (!actor) return;
            const spriteEl = actor.el.querySelector('.gamer-frame-container');
            baseWidths[id] = actor.el.offsetWidth || (spriteEl ? spriteEl.offsetWidth : 0) || 185;
            actor.width = baseWidths[id];
        });

        // Reserve left space only while Synth is actively introducing the crew on the left
        const leftZoneStart = reserveLeftForSyn
            ? (isMobile ? Math.round(vw * 0.16) : Math.max(230, Math.min(355, Math.round(vw * 0.21))))
            : 0;
        const availW = Math.max(260, vw - leftZoneStart);
        const sidePad = Math.max(10, Math.round(vw * (isMobile ? 0.025 : 0.04)));
        const maxAllowedSpan = Math.max(240, availW - sidePad * 2);

        // V-Formation horizontal step ratio (< 1.0 pulls characters closer together toward the center
        // because adjacent characters sit at different Y depths on the 3D floor!)
        const stepRatio = isMobile ? 0.72 : 0.78;
        let rawSpan = 0;
        activeOrder.forEach((id, idx) => {
            const w = baseWidths[id] || 185;
            if (idx < activeOrder.length - 1) {
                rawSpan += w * stepRatio;
            } else {
                rawSpan += w;
            }
        });

        // Guarantee 100% of characters fit inside the viewport on mobile & narrow screens without ever clipping!
        const fitScale = rawSpan > maxAllowedSpan
            ? Math.max(0.46, Math.min(1.0, maxAllowedSpan / rawSpan))
            : 1.0;

        const actualSpan = rawSpan * fitScale;
        let cursorX = leftZoneStart + Math.max(sidePad, Math.round((availW - actualSpan) * 0.5));

        // V-Formation Depth Tiers:
        // Outer wings (Chloe & Grizz) sit higher/deeper on the 3D perspective stage floor,
        // while the center pair (CAB-84 & Akari) step forward to the front apex of the V!
        const wingDepthY = Math.round((isMobile ? -32 : -46) * Math.max(0.75, fitScale));
        const apexFrontY = Math.round((isMobile ? 4 : 8) * Math.max(0.75, fitScale));

        activeOrder.forEach((id, idx) => {
            const actor = crewActors[id];
            if (!actor) return;
            const isOuterWing = (idx === 0 || idx === activeOrder.length - 1);
            const roleScale = isOuterWing ? 0.95 : 1.0;
            const finalScale = Number((roleScale * fitScale).toFixed(3));
            const baseW = baseWidths[id] || 185;

            // Since transform-origin is bottom center, compensate X for scale so visual left edge aligns with cursorX
            const scaleOffsetX = (baseW * (1 - finalScale)) * 0.5;
            actor.targetX = Math.round(cursorX - scaleOffsetX);
            actor.targetY = isOuterWing ? wingDepthY : apexFrontY;
            actor.targetScale = finalScale;
            actor.targetZIndex = isOuterWing ? 996 : 1005;
            actor.width = Math.round(baseW * finalScale);
            if (actor.el) {
                actor.el.style.transformOrigin = 'bottom center';
                actor.el.style.zIndex = String(actor.targetZIndex);
            }

            cursorX += Math.round(baseW * fitScale * stepRatio);
        });

        if (excludeJames && crewActors.james) {
            crewActors.james.targetX = vw + 220;
            crewActors.james.targetY = 0;
            crewActors.james.targetScale = 1;
        }
    }

    function positionDialogueAbove(id) {
        const actor = crewActors[id];
        if (!actor || !dialogue) return;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const bubbleW = Math.min(vw * 0.9, 430);
        const actorCenterX = actor.targetX + actor.width / 2;

        // Clamp bubble horizontal center so it never clips off left/right screen edge
        const minCenter = bubbleW / 2 + 12;
        const maxCenter = vw - bubbleW / 2 - 12;
        const clampedCenter = Math.max(minCenter, Math.min(maxCenter, actorCenterX));

        dialogue.style.left = `${clampedCenter.toFixed(1)}px`;

        // Dynamically set bottom above the speaking character's height, while guaranteeing it never covers RETROCANOPY!
        const actorH = actor.el.offsetHeight || 240;
        const bubbleH = dialogue.offsetHeight || 115;
        let maxAllowedBottom = vh - 165;
        if (brandNameEl) {
            const brandRect = brandNameEl.getBoundingClientRect();
            const safeTopY = brandRect.bottom + 24;
            maxAllowedBottom = Math.max(195, vh - safeTopY - bubbleH);
        }
        const targetBottom = Math.max(195, Math.min(maxAllowedBottom, actorH + 10));
        dialogue.style.bottom = `${Math.round(targetBottom)}px`;

        // Point speech bubble tail directly at the speaking character
        const tailOffsetPx = Math.max(24, Math.min(bubbleW - 24, bubbleW / 2 + (actorCenterX - clampedCenter)));
        dialogue.style.setProperty('--tail-left', `${tailOffsetPx.toFixed(1)}px`);
    }

    function setSpeakingHighlight(activeId) {
        allActorsOrder.forEach((id) => {
            const actor = crewActors[id];
            if (actor && actor.el) {
                actor.el.classList.toggle('speaking', id === activeId);
            }
        });
        if (dialogue) {
            dialogue.classList.toggle('villain-speaking', activeId === 'darkjames' || activeId === 'raven');
        }
    }

    function shiftLogoOutOfWay() {
        if (!heroContainer) return;
        const vh = window.innerHeight;
        const shiftPx = Math.max(-28, Math.min(-10, -Math.round(vh * 0.02)));
        const scaleVal = vh < 760 ? 0.76 : 0.82;
        heroContainer.style.setProperty('--logo-shift-y', `${shiftPx}px`);
        heroContainer.style.setProperty('--logo-shift-scale', `${scaleVal}`);
        heroContainer.classList.add('shifted-up');
    }

    /**
     * After James introduces the website & his friends:
     * 1) James sips his drink
     * 2) James walks off-screen to the right while the 4 friends walk to fill the space he left proportionately
     * 3) Once they are standing proportionately in their 4-character spots, they introduce themselves!
     */
    function sipAndWalkAwayThenRepositionFriends(onComplete) {
        if (jamesHasExited || isTransitioningExit) return;
        isTransitioningExit = true;

        // 1. James takes a sip of his drink first!
        showJamesFrame('sip');

        setTimeout(() => {
            jamesHasExited = true;
            computeTargetPositions(true);

            const james = crewActors.james;
            if (james) {
                james.arrived = false;
            }
            friendsOnlyOrder.forEach((id) => {
                const actor = crewActors[id];
                if (!actor) return;
                if (Math.abs(actor.targetX - actor.posX) > 4) {
                    actor.arrived = false;
                    setActorFacing(id, actor.targetX < actor.posX);
                } else {
                    actor.arrived = true;
                    setActorFacing(id, false);
                    setActorPose(id, 'idle');
                }
            });

            let lastExitTime = performance.now();
            let exitStepTimer = 0;
            const exitSpeed = Math.max(195, Math.min(245, window.innerWidth * 0.16));
            const repositionSpeed = Math.max(135, Math.min(175, window.innerWidth * 0.11));

            function stepExitAndFill(now) {
                if (sequenceComplete && !isTransitioningExit) return;
                const dt = Math.min((now - lastExitTime) / 1000, 0.08);
                lastExitTime = now;
                exitStepTimer += dt * 1000;
                const advanceWalkFrame = exitStepTimer >= STEP_DURATION;
                if (advanceWalkFrame) exitStepTimer = 0;

                let allDone = true;

                // Walk James off-screen to the right
                if (james && !james.arrived) {
                    james.posX += exitSpeed * dt;
                    if (advanceWalkFrame) {
                        james.walkFrame++;
                        showJamesFrame(jamesWalkCycle[james.walkFrame % jamesWalkCycle.length]);
                    }
                    james.el.style.transform = `translate3d(${james.posX.toFixed(1)}px, 0, 0)`;
                    if (james.posX >= window.innerWidth + 80) {
                        james.arrived = true;
                        james.el.style.opacity = '0';
                        james.el.style.pointerEvents = 'none';
                    } else {
                        allDone = false;
                    }
                }

                // Walk the 4 friends to fill the space James left so they stand proportionately
                friendsOnlyOrder.forEach((id) => {
                    const actor = crewActors[id];
                    if (!actor || actor.arrived) return;
                    const diff = actor.targetX - actor.posX;
                    const stepDist = repositionSpeed * dt;
                    if (Math.abs(diff) <= stepDist) {
                        actor.posX = actor.targetX;
                        actor.arrived = true;
                        setActorFacing(id, false);
                        setActorPose(id, 'idle');
                    } else {
                        allDone = false;
                        actor.posX += Math.sign(diff) * stepDist;
                        if (advanceWalkFrame) {
                            actor.walkFrame++;
                            setActorPose(id, friendWalkCycle[actor.walkFrame % friendWalkCycle.length]);
                        }
                    }
                    actor.el.style.transform = `translate3d(${actor.posX.toFixed(1)}px, 0, 0)`;
                });

                if (allDone) {
                    isTransitioningExit = false;
                    if (onComplete) onComplete();
                } else {
                    requestAnimationFrame(stepExitAndFill);
                }
            }

            requestAnimationFrame(stepExitAndFill);
        }, 850);
    }

    /**
     * Shared AudioContext + Audible 16-Bit Sabotage BOOM Sound + Soft Lofi Study Beats Engine
     * Persists Lofi state in sessionStorage so music continues across pages.
     */
    let lofiCtx = null;
    let lofiMasterGain = null;
    let lofiLoopTimer = null;
    let lofiStarted = false;
    let lofiMuted = sessionStorage.getItem('rc_lofi_muted') === '1';

    let introStartPerfNow = performance.now();
    let state = 'LOGO_ZOOM_OUT';
    let cinemaSwellPlayed = false;
    let introHtmlAudioStarted = false;
    let nativeIntroAudioActive = false;
    let nativeLofiAudioActive = false;
    let introTransitionScheduled = false;
    let introTransitionTimer = null;
    let introCraneTimer = null;
    const introTitleAudioEl = document.getElementById('intro-title-audio');
    const synJourneyAudioEl = document.getElementById('syn-journey-audio');
    const cupBoomAudioEl = document.getElementById('cup-boom-audio');
    const lofiLoopAudioEl = document.getElementById('lofi-loop-audio');
    const typeTickAudioEl = document.getElementById('type-tick-audio');

    function triggerNativeServerAudio(cmd) {
        try {
            fetch('/api/audio?cmd=' + encodeURIComponent(cmd) + '&t=' + Date.now(), {
                method: 'GET',
                cache: 'no-store',
                keepalive: true
            }).catch(() => {});
        } catch (_) {}
    }

    window.addEventListener('pagehide', () => {
        if (nativeIntroAudioActive || nativeLofiAudioActive) {
            try {
                if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/audio?cmd=stop');
                } else {
                    triggerNativeServerAudio('stop');
                }
            } catch (_) {}
        }
    });

    // Pre-allocated 4-voice HTML5 Audio pool for instant character typing ticks
    const typeTickPool = [];
    let typeTickPoolIdx = 0;
    for (let i = 0; i < 4; i++) {
        try {
            const tickAudio = (i === 0 && typeTickAudioEl) ? typeTickAudioEl : new Audio('assets/type_tick.wav?v=36');
            tickAudio.preload = 'auto';
            tickAudio.volume = 0.72;
            typeTickPool.push(tickAudio);
        } catch (_) {}
    }

    // Preloaded 13-Scene British Gentleman Butler Neural Voice Pool for Syn (assets/voice/syn_0.wav .. syn_12.wav)
    const synVoicePool = [];
    let activeSynVoiceAudio = null;
    let holoJourneyStartPerfNow = 0;
    let holoGlitchTimer = null;
    let crewWalkInOutroTimer = null;
    let crewWalkedInForSyn = false;
    let crewWalkAlongsideRaf = null;
    let turntableActive = false;
    let turntableSlideProg = 0;
    let turntableAngle = Math.PI * 2;
    let turntableTargetAngle = 0;
    let turntableFinaleSpinTimer = null;
    let tvStaticCtx = null;
    let tvStaticImgData = null;
    let shutteredStaticCtx = null;
    let owlPoseCueTimer = null;
    for (let i = 0; i < 13; i++) {
        try {
            const vAudio = new Audio(`assets/voice/syn_${i}.wav?v=85`);
            vAudio.preload = 'auto';
            vAudio.volume = 1.0;
            synVoicePool.push(vAudio);
        } catch (_) {}
    }

    function playSynVoiceLine(sceneIdx, isManualSkip = false) {
        if (!isManualSkip) {
            // During normal continuous playback, Syn's spoken British Gentleman Butler voice is already mixed
            // directly into assets/syn_journey.wav (played by synJourneyAudioEl or server $synPlayer)!
            if (synJourneyAudioEl && !synJourneyAudioEl.paused) return;
            if (nativeIntroAudioActive) return;
        }
        stopSynVoiceLine(false);
        const stepObj = prologueSteps[sceneIdx];
        if (isManualSkip && synJourneyAudioEl && stepObj && typeof stepObj.audioStartSec === 'number') {
            try {
                synJourneyAudioEl.muted = false;
                synJourneyAudioEl.volume = 0.95;
                synJourneyAudioEl.currentTime = stepObj.audioStartSec;
                const p = synJourneyAudioEl.play();
                if (p && typeof p.then === 'function') {
                    p.then(() => {
                        if (nativeIntroAudioActive) {
                            nativeIntroAudioActive = false;
                            triggerNativeServerAudio('stop');
                        }
                    }).catch(() => {
                        nativeIntroAudioActive = true;
                        triggerNativeServerAudio(`synvoice${sceneIdx}`);
                    });
                    return;
                }
            } catch (_) {}
        }
        const voiceEl = synVoicePool[sceneIdx];
        if (voiceEl) {
            try {
                activeSynVoiceAudio = voiceEl;
                voiceEl.muted = false;
                voiceEl.volume = 1.0;
                voiceEl.currentTime = 0;
                const p = voiceEl.play();
                if (p && typeof p.catch === 'function') {
                    p.catch(() => {
                        nativeIntroAudioActive = true;
                        triggerNativeServerAudio(`synvoice${sceneIdx}`);
                    });
                }
                return;
            } catch (_) {}
        }
        nativeIntroAudioActive = true;
        triggerNativeServerAudio(`synvoice${sceneIdx}`);
    }

    function stopSynVoiceLine(stopServer = true) {
        if (activeSynVoiceAudio) {
            try {
                activeSynVoiceAudio.pause();
                activeSynVoiceAudio.currentTime = 0;
            } catch (_) {}
            activeSynVoiceAudio = null;
        }
        synVoicePool.forEach((v) => {
            try {
                if (!v.paused) {
                    v.pause();
                    v.currentTime = 0;
                }
            } catch (_) {}
        });
        if (stopServer && nativeIntroAudioActive) {
            triggerNativeServerAudio('stop');
        }
    }

    const khTracks = [
        { title: 'DEARLY BELOVED', src: 'assets/dearly_beloved.mp3?v=79', serverCmd: 'kh_track0' },
        { title: 'SANCTUARY', src: 'assets/kh_sanctuary.mp3?v=79', serverCmd: 'kh_track1' },
        { title: 'SUNSET', src: 'assets/kh_sunset.mp3?v=79', serverCmd: 'kh_track2' }
    ];
    let currentKhTrackIdx = parseInt(sessionStorage.getItem('rc_kh_track') || '0', 10);
    if (isNaN(currentKhTrackIdx) || currentKhTrackIdx < 0 || currentKhTrackIdx >= khTracks.length) {
        currentKhTrackIdx = 0;
    }
    const khMusicWidget = document.getElementById('kh-music-widget');
    const khTrackOptionBtns = document.querySelectorAll('.kh-track-option');

    function updateLofiButtonUI() {
        if (!lofiMusicBtn) return;
        const isPlaying = lofiStarted && !lofiMuted;
        lofiMusicBtn.classList.toggle('playing', isPlaying);
        lofiMusicBtn.classList.toggle('muted', lofiMuted);
        const curTrack = khTracks[currentKhTrackIdx] || khTracks[0];
        if (lofiMusicLabel) {
            lofiMusicLabel.textContent = lofiMuted ? 'MUSIC: OFF' : curTrack.title;
        }
        khTrackOptionBtns.forEach((optBtn) => {
            const val = optBtn.getAttribute('data-kh-track');
            const isActive = lofiMuted ? (val === 'off') : (String(currentKhTrackIdx) === val);
            optBtn.classList.toggle('active', isActive);
        });
    }

    let isAudioUnlocked = false;
    const audioUnlockVectors = [
        'pointermove', 'mousemove', 'pointerover', 'wheel', 'focus',
        'click', 'keydown', 'pointerdown', 'mousedown', 'touchstart'
    ];

    function removeAudioUnlockListeners() {
        audioUnlockVectors.forEach((evt) => {
            window.removeEventListener(evt, unlockAudioOnce, true);
            window.removeEventListener(evt, unlockAudioOnce, false);
        });
    }

    function primeHtmlAudioElementsOnGesture() {
        if (cupBoomAudioEl) {
            try {
                cupBoomAudioEl.muted = false;
                cupBoomAudioEl.volume = 0.82;
            } catch (_) {}
        }
        if (synJourneyAudioEl) {
            try {
                synJourneyAudioEl.muted = false;
                synJourneyAudioEl.volume = 0.95;
            } catch (_) {}
        }
        if (lofiLoopAudioEl) {
            try {
                lofiLoopAudioEl.muted = lofiMuted;
                lofiLoopAudioEl.volume = lofiMuted ? 0 : 0.16;
            } catch (_) {}
        }
    }

    function ensureLofiAudioContext() {
        if (!lofiCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            lofiCtx = new AudioCtx();
            lofiMasterGain = lofiCtx.createGain();
            lofiMasterGain.gain.setValueAtTime(0.0001, lofiCtx.currentTime);
            lofiMasterGain.connect(lofiCtx.destination);

            lofiCtx.onstatechange = () => {
                if (lofiCtx.state === 'running') {
                    isAudioUnlocked = true;
                    if (nativeLofiAudioActive) {
                        nativeLofiAudioActive = false;
                        triggerNativeServerAudio('stop');
                    }
                    if (!nativeIntroAudioActive && typeof playIntroAudio === 'function') {
                        playIntroAudio();
                    }
                    if (lofiStarted && lofiMasterGain && !lofiMuted) {
                        lofiMasterGain.gain.cancelScheduledValues(lofiCtx.currentTime);
                        lofiMasterGain.gain.linearRampToValueAtTime(0.14, lofiCtx.currentTime + 0.6);
                    }
                    if (introHtmlAudioStarted || nativeIntroAudioActive || state !== 'LOGO_ZOOM_OUT') {
                        removeAudioUnlockListeners();
                    }
                }
            };
        }
        if (lofiCtx.state === 'suspended') {
            lofiCtx.resume().catch(() => {});
        }
        return lofiCtx;
    }

    // Automatically trigger & unlock AudioContext + HTML5 <audio> on any user interaction
    const unlockAudioOnce = () => {
        primeHtmlAudioElementsOnGesture();
        if (inPrologue && !sequenceComplete && synJourneyAudioEl && synJourneyAudioEl.paused) {
            try {
                const elapsedPrologueSec = Math.max(0, (performance.now() - holoJourneyStartPerfNow) / 1000);
                synJourneyAudioEl.muted = false;
                synJourneyAudioEl.volume = 0.95;
                if (Math.abs(synJourneyAudioEl.currentTime - elapsedPrologueSec) > 0.35) {
                    try { synJourneyAudioEl.currentTime = elapsedPrologueSec; } catch (_) {}
                }
                const p = synJourneyAudioEl.play();
                if (p && typeof p.then === 'function') {
                    p.then(() => {
                        if (nativeIntroAudioActive) {
                            nativeIntroAudioActive = false;
                            triggerNativeServerAudio('stop');
                        }
                    }).catch(() => {});
                }
            } catch (_) {}
        }
        if (state === 'LOGO_ZOOM_OUT' && !sequenceComplete && prebuiltIntroAudio && !nativeIntroAudioActive) {
            try {
                const elapsedSec = Math.min(9.0, Math.max(0, (performance.now() - introStartPerfNow) / 1000));
                prebuiltIntroAudio.muted = false;
                prebuiltIntroAudio.volume = 0.88;
                if (prebuiltIntroAudio.paused) {
                    if (Math.abs(prebuiltIntroAudio.currentTime - elapsedSec) > 0.35) {
                        try { prebuiltIntroAudio.currentTime = elapsedSec; } catch (_) {}
                    }
                    const p = prebuiltIntroAudio.play();
                    if (p && typeof p.then === 'function') {
                        p.then(() => {
                            introHtmlAudioStarted = true;
                            if (lofiCtx && lofiCtx.state === 'running') {
                                removeAudioUnlockListeners();
                            }
                        }).catch(() => {});
                    }
                } else {
                    introHtmlAudioStarted = true;
                }
            } catch (_) {}
        }
        const ctx = ensureLofiAudioContext();
        if (ctx) {
            if (ctx.state === 'running') {
                isAudioUnlocked = true;
                if (nativeLofiAudioActive) {
                    nativeLofiAudioActive = false;
                    triggerNativeServerAudio('stop');
                }
                if (!nativeIntroAudioActive && typeof playIntroAudio === 'function') {
                    playIntroAudio();
                }
                if (lofiStarted && lofiMasterGain && !lofiMuted) {
                    lofiMasterGain.gain.cancelScheduledValues(ctx.currentTime);
                    lofiMasterGain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.6);
                }
                if (introHtmlAudioStarted || nativeIntroAudioActive || state !== 'LOGO_ZOOM_OUT') {
                    removeAudioUnlockListeners();
                }
            } else if (ctx.state === 'suspended') {
                ctx.resume().then(() => {
                    isAudioUnlocked = true;
                    if (nativeLofiAudioActive) {
                        nativeLofiAudioActive = false;
                        triggerNativeServerAudio('stop');
                    }
                    if (!nativeIntroAudioActive && typeof playIntroAudio === 'function') {
                        playIntroAudio();
                    }
                    if (lofiStarted && lofiMasterGain && !lofiMuted) {
                        lofiMasterGain.gain.cancelScheduledValues(ctx.currentTime);
                        lofiMasterGain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.6);
                    }
                    if (introHtmlAudioStarted || nativeIntroAudioActive || state !== 'LOGO_ZOOM_OUT') {
                        removeAudioUnlockListeners();
                    }
                }).catch(() => {});
            }
        }
    };
    audioUnlockVectors.forEach((evt) => {
        window.addEventListener(evt, unlockAudioOnce, { capture: true, passive: true });
    });

    /**
     * Bind directly to pre-rendered disk WAV assets so zero main-thread blocking occurs at startup
     */
    let prebuiltIntroAudio = null;
    let prebuiltBoomAudio = null;
    let prebuiltBoomBuffer = null;
    let lofiFallbackAudio = null;
    let introGain = null;

    function buildIntroAssets() {
        if (introTitleAudioEl) {
            prebuiltIntroAudio = introTitleAudioEl;
            prebuiltIntroAudio.muted = false;
            prebuiltIntroAudio.volume = 0.88;
        } else {
            try {
                prebuiltIntroAudio = new Audio('assets/intro_theme.wav?v=36');
                prebuiltIntroAudio.muted = false;
                prebuiltIntroAudio.volume = 0.88;
                prebuiltIntroAudio.preload = 'auto';
            } catch (_) {}
        }
    }

    function buildBoomAssets() {
        if (cupBoomAudioEl) {
            prebuiltBoomAudio = cupBoomAudioEl;
            prebuiltBoomAudio.muted = false;
            prebuiltBoomAudio.volume = 0.82;
        } else {
            try {
                prebuiltBoomAudio = new Audio('assets/cup_boom.wav?v=36');
                prebuiltBoomAudio.muted = false;
                prebuiltBoomAudio.volume = 0.82;
                prebuiltBoomAudio.preload = 'auto';
            } catch (_) {}
        }
    }

    function buildLofiFallbackAssets() {
        if (lofiLoopAudioEl) {
            lofiFallbackAudio = lofiLoopAudioEl;
            lofiFallbackAudio.loop = true;
            lofiFallbackAudio.volume = lofiMuted ? 0 : 0.16;
        } else {
            try {
                lofiFallbackAudio = new Audio('assets/lofi_loop.wav?v=36');
                lofiFallbackAudio.loop = true;
                lofiFallbackAudio.volume = lofiMuted ? 0 : 0.16;
                lofiFallbackAudio.preload = 'auto';
            } catch (_) {}
        }
    }

    buildIntroAssets();
    buildBoomAssets();
    buildLofiFallbackAssets();
    ensureLofiAudioContext();

    /**
     * Crisp upward wind-whoosh right as Dark James releases the Glitch cup
     */
    function playCupThrowWhoosh() {
        const ctx = ensureLofiAudioContext();
        if (!ctx || ctx.state !== 'running') return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.28);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    /**
     * Audible, calibrated BOOM aligned to the exact frame the Glitch cup hits the 'O' (p >= 0.96)
     * Plays BOTH the preloaded HTML5 WAV (assets/cup_boom.wav) AND Web Audio multi-band impact synthesis
     */
    function playSabotageBoomSound() {
        let htmlBoomAttempted = false;
        // 1. Always trigger the HTML5 <audio> boom track (assets/cup_boom.wav) for guaranteed output
        if (prebuiltBoomAudio) {
            try {
                htmlBoomAttempted = true;
                prebuiltBoomAudio.muted = false;
                prebuiltBoomAudio.volume = 0.82;
                prebuiltBoomAudio.currentTime = 0;
                const playPromise = prebuiltBoomAudio.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {
                        triggerNativeServerAudio('boom');
                    });
                }
            } catch (_) {
                triggerNativeServerAudio('boom');
            }
        }
        if (!htmlBoomAttempted && !isAudioUnlocked) {
            triggerNativeServerAudio('boom');
        }

        // 2. Simultaneously fire live Web Audio multi-oscillator impact punch + noise burst
        const ctx = ensureLofiAudioContext();
        if (ctx && ctx.state === 'running') {
            try {
                const now = ctx.currentTime;

                // Live mid-bass & neon-arc impact oscillators for unmistakable speaker punch
                const subOsc = ctx.createOscillator();
                const subGain = ctx.createGain();
                subOsc.type = 'sine';
                subOsc.frequency.setValueAtTime(185, now);
                subOsc.frequency.exponentialRampToValueAtTime(34, now + 0.48);
                subGain.gain.setValueAtTime(0.52, now);
                subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
                subOsc.connect(subGain);
                subGain.connect(ctx.destination);
                subOsc.start(now);
                subOsc.stop(now + 0.56);

                const punchOsc = ctx.createOscillator();
                const punchGain = ctx.createGain();
                punchOsc.type = 'sawtooth';
                punchOsc.frequency.setValueAtTime(320, now);
                punchOsc.frequency.exponentialRampToValueAtTime(58, now + 0.36);
                punchGain.gain.setValueAtTime(0.38, now);
                punchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.40);
                punchOsc.connect(punchGain);
                punchGain.connect(ctx.destination);
                punchOsc.start(now);
                punchOsc.stop(now + 0.42);
            } catch (_) {}
        }
    }

    /**
     * Faint Character Dialogue Typing Sound Engine
     * Uses HTML5 4-voice Audio pool (assets/type_tick.wav), Web Audio buffer click, and native server fallback
     */
    let typingClickBuffer = null;
    function getTypingClickBuffer(ctx) {
        if (typingClickBuffer) return typingClickBuffer;
        const sampleRate = ctx.sampleRate || 44100;
        const duration = 0.016; // 16ms soft mechanical click
        const numSamples = Math.floor(sampleRate * duration);
        typingClickBuffer = ctx.createBuffer(1, numSamples, sampleRate);
        const channel = typingClickBuffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / numSamples;
            const env = Math.exp(-t * 6.5) * Math.sin(t * Math.PI);
            const noise = (Math.random() * 2 - 1) * 0.35;
            const tone = Math.sin(2 * Math.PI * 1800 * (i / sampleRate));
            channel[i] = (tone * 0.65 + noise) * env;
        }
        return typingClickBuffer;
    }

    function playDialogueCharTick(char, charIndex) {
        if (char === ' ') return;
        if (!char || char.trim() === '') return;

        // 1. Trigger 4-voice HTML5 <audio> tick pool (assets/type_tick.wav) + native fallback if browser audio is locked
        if (typeTickPool.length > 0 && (typeof charIndex !== 'number' || charIndex % 2 === 0)) {
            try {
                const tickVoice = typeTickPool[typeTickPoolIdx % typeTickPool.length];
                typeTickPoolIdx++;
                tickVoice.muted = false;
                tickVoice.volume = 0.72;
                tickVoice.playbackRate = 0.94 + (char.charCodeAt(0) % 7) * 0.02;
                tickVoice.currentTime = 0;
                const p = tickVoice.play();
                if (p && typeof p.catch === 'function') {
                    p.catch(() => {
                        if (!inPrologue && !nativeIntroAudioActive && (typeof charIndex !== 'number' || charIndex % 4 === 0)) {
                            triggerNativeServerAudio('tick');
                        }
                    });
                }
            } catch (_) {}
        }

        // 2. Also trigger Web Audio micro-click when AudioContext is running
        const ctx = ensureLofiAudioContext();
        if (!ctx || ctx.state !== 'running') return;
        try {
            const buf = getTypingClickBuffer(ctx);
            const src = ctx.createBufferSource();
            src.buffer = buf;

            // Micro-pitch jitter + Math.random() subtle variation to prevent audio fatigue
            const basePitch = 0.94 + (char.charCodeAt(0) % 7) * 0.02;
            const randomJitter = (Math.random() * 0.06 - 0.03);
            src.playbackRate.setValueAtTime(basePitch + randomJitter, ctx.currentTime);

            const tickFilter = ctx.createBiquadFilter();
            tickFilter.type = 'lowpass';
            tickFilter.frequency.setValueAtTime(2600, ctx.currentTime);

            const tickGain = ctx.createGain();
            tickGain.gain.setValueAtTime(0.032, ctx.currentTime);
            tickGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.016);

            src.connect(tickFilter);
            tickFilter.connect(tickGain);
            // Connect directly to ctx.destination so typing ticks are audible BEFORE Lofi starts!
            tickGain.connect(ctx.destination);

            src.start(ctx.currentTime);
            src.stop(ctx.currentTime + 0.018);
            src.onended = () => {
                try {
                    src.disconnect();
                    tickFilter.disconnect();
                    tickGain.disconnect();
                } catch (_) {}
            };
        } catch (_) {}
    }

    let isLofiPlaying = false;
    let khVolumeFadeTimer = null;

    function rampDearlyBelovedVolume(targetVol, durationMs = 1800) {
        if (!lofiFallbackAudio) return;
        if (khVolumeFadeTimer) {
            clearInterval(khVolumeFadeTimer);
            khVolumeFadeTimer = null;
        }
        const startVol = typeof lofiFallbackAudio.volume === 'number' ? lofiFallbackAudio.volume : 0.22;
        const steps = Math.max(1, Math.round(durationMs / 60));
        let stepIdx = 0;
        khVolumeFadeTimer = setInterval(() => {
            stepIdx++;
            const prog = Math.min(1, stepIdx / steps);
            const nextVol = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * prog));
            try {
                if (!lofiMuted) {
                    lofiFallbackAudio.volume = nextVol;
                }
            } catch (_) {}
            if (prog >= 1) {
                clearInterval(khVolumeFadeTimer);
                khVolumeFadeTimer = null;
            }
        }, 60);
    }

    /**
     * Starts Kingdom Hearts' "Dearly Beloved" softly right at the moment Synth says "Hello, friend." (2.80s),
     * serving as the continuous background music throughout the entire cutscene intro with zero cuts!
     */
    function startDearlyBelovedCutsceneBed() {
        if (lofiMuted) return;
        if (lofiFallbackAudio) {
            try {
                lofiFallbackAudio.muted = false;
                lofiFallbackAudio.loop = true;
                if (lofiFallbackAudio.paused) {
                    lofiFallbackAudio.currentTime = 0;
                    lofiFallbackAudio.volume = 0.01;
                    const p = lofiFallbackAudio.play();
                    if (p && typeof p.then === 'function') {
                        p.then(() => {
                            rampDearlyBelovedVolume(0.24, 2400);
                        }).catch(() => {
                            nativeLofiAudioActive = true;
                            triggerNativeServerAudio('kh_soft');
                        });
                    } else {
                        rampDearlyBelovedVolume(0.24, 2400);
                    }
                } else {
                    rampDearlyBelovedVolume(0.24, 1200);
                }
            } catch (_) {
                nativeLofiAudioActive = true;
                triggerNativeServerAudio('kh_soft');
            }
        } else {
            nativeLofiAudioActive = true;
            triggerNativeServerAudio('kh_soft');
        }
    }

    function startSoftLofiMusic() {
        sessionStorage.setItem('rc_lofi_active', '1');
        if (lofiMusicBtn) {
            lofiMusicBtn.classList.add('visible');
            lofiMusicBtn.style.zIndex = '650';
        }
        ensureLofiAudioContext();
        lofiStarted = true;
        isLofiPlaying = true;
        updateLofiButtonUI();

        if (lofiMuted) return;

        // If "Dearly Beloved" is already playing from Synth's cutscene intro, DO NOT reset currentTime —
        // smoothly swell it to full volume (0.88) without any cuts!
        if (lofiFallbackAudio) {
            try {
                lofiFallbackAudio.muted = false;
                lofiFallbackAudio.loop = true;
                if (!lofiFallbackAudio.paused) {
                    rampDearlyBelovedVolume(0.88, 1800);
                } else {
                    // Only start from current position (or 0 if never started) and swell to full volume
                    lofiFallbackAudio.volume = Math.max(0.18, lofiFallbackAudio.volume || 0.24);
                    const p = lofiFallbackAudio.play();
                    if (p && typeof p.then === 'function') {
                        p.then(() => {
                            rampDearlyBelovedVolume(0.88, 1600);
                        }).catch(() => {
                            nativeLofiAudioActive = true;
                            triggerNativeServerAudio('kh_full');
                        });
                    } else {
                        rampDearlyBelovedVolume(0.88, 1600);
                    }
                }
            } catch (_) {
                nativeLofiAudioActive = true;
                triggerNativeServerAudio('kh_full');
            }
        }
        if (nativeLofiAudioActive) {
            triggerNativeServerAudio('kh_full');
        }
    }

    function selectKhTrack(trackIndexOrOff) {
        if (khVolumeFadeTimer) {
            clearInterval(khVolumeFadeTimer);
            khVolumeFadeTimer = null;
        }
        if (trackIndexOrOff === 'off') {
            lofiMuted = true;
            sessionStorage.setItem('rc_lofi_muted', '1');
            if (lofiFallbackAudio) {
                lofiFallbackAudio.muted = true;
                lofiFallbackAudio.pause();
            }
            if (nativeLofiAudioActive) {
                triggerNativeServerAudio('stop');
            }
            updateLofiButtonUI();
            return;
        }

        const nextIdx = Math.max(0, Math.min(khTracks.length - 1, Number(trackIndexOrOff) || 0));
        const trackChanged = (nextIdx !== currentKhTrackIdx);
        currentKhTrackIdx = nextIdx;
        sessionStorage.setItem('rc_kh_track', String(currentKhTrackIdx));
        lofiMuted = false;
        lofiStarted = true;
        isLofiPlaying = true;
        sessionStorage.setItem('rc_lofi_muted', '0');

        const trackObj = khTracks[currentKhTrackIdx];
        if (lofiFallbackAudio) {
            try {
                const currentSrcAttr = lofiFallbackAudio.getAttribute('src') || '';
                if (trackChanged || currentSrcAttr !== trackObj.src) {
                    lofiFallbackAudio.pause();
                    lofiFallbackAudio.setAttribute('src', trackObj.src);
                    lofiFallbackAudio.load();
                    lofiFallbackAudio.currentTime = 0;
                }
                lofiFallbackAudio.muted = false;
                lofiFallbackAudio.loop = true;
                lofiFallbackAudio.volume = 0.88;
                const p = lofiFallbackAudio.play();
                if (p && typeof p.catch === 'function') {
                    p.catch(() => {
                        nativeLofiAudioActive = true;
                        triggerNativeServerAudio(trackObj.serverCmd);
                    });
                }
            } catch (_) {
                nativeLofiAudioActive = true;
                triggerNativeServerAudio(trackObj.serverCmd);
            }
        }
        if (nativeLofiAudioActive) {
            triggerNativeServerAudio(trackObj.serverCmd);
        }
        updateLofiButtonUI();
    }

    if (lofiMusicBtn) {
        lofiMusicBtn.addEventListener('click', () => {
            if (!lofiStarted) {
                selectKhTrack(currentKhTrackIdx);
                return;
            }
            // Cycle: Dearly Beloved (0) -> Sanctuary (1) -> Sunset (2) -> Music: Off -> Dearly Beloved (0)
            if (lofiMuted) {
                selectKhTrack(0);
            } else if (currentKhTrackIdx + 1 < khTracks.length) {
                selectKhTrack(currentKhTrackIdx + 1);
            } else {
                selectKhTrack('off');
            }
        });
    }

    khTrackOptionBtns.forEach((optBtn) => {
        optBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const val = optBtn.getAttribute('data-kh-track');
            if (val === 'off') {
                selectKhTrack('off');
            } else {
                selectKhTrack(parseInt(val, 10));
            }
            if (khMusicWidget) {
                khMusicWidget.classList.remove('menu-open');
            }
        });
    });

    // =========================================================================
    // FULL-SCREEN HOLOGRAM OWL BUTLER GAMING CULTURE SHIFT JOURNEY ENGINE
    // =========================================================================
    let holoCanvasActive = false;
    let holoCanvasRaf = null;
    let currentHoloEra = 0;
    let targetHoloEra = 0;
    let holoEraBlend = 0;
    let owlPosX = -260;
    let owlWalkRaf = null;
    let owlTalkTimer = null;
    let isOwlWalking = false;

    // 4-Act Emotional Cinematic Synth-Piano & Warm Analog Pad Score State
    let holoScoreNodes = null;

    const holoParticles = Array.from({ length: 48 }, (_, i) => ({
        x: Math.random(),
        y: Math.random(),
        speed: 0.06 + Math.random() * 0.16,
        size: 1.8 + (i % 4) * 0.85,
        phase: Math.random() * Math.PI * 2
    }));

    const holoRainDrops = Array.from({ length: 220 }, () => ({
        x: Math.random(),
        y: Math.random(),
        len: 22 + Math.random() * 34,
        speed: 0.72 + Math.random() * 0.68,
        alpha: 0.18 + Math.random() * 0.28
    }));

    function startHoloEmotionalScore() {
        // Play the pre-rendered Synth Journey WAV (assets/syn_journey.wav?v=77), which mixes Synth's voiceover
        // with Kingdom Hearts' Title Screen Theme ("Dearly Beloved") gently ducked underneath!
        if (synJourneyAudioEl) {
            try {
                synJourneyAudioEl.muted = false;
                synJourneyAudioEl.volume = 0.95;
                synJourneyAudioEl.currentTime = 0;
                const p = synJourneyAudioEl.play();
                if (p && typeof p.catch === 'function') {
                    p.catch(() => {
                        nativeIntroAudioActive = true;
                        triggerNativeServerAudio('syn');
                    });
                }
            } catch (_) {
                nativeIntroAudioActive = true;
                triggerNativeServerAudio('syn');
            }
        } else {
            nativeIntroAudioActive = true;
            triggerNativeServerAudio('syn');
        }
    }

    function triggerHoloSceneChord(eraIdx) {
        // Kingdom Hearts "Dearly Beloved" is mixed directly into syn_journey.wav?v=77 with automatic voice ducking
        void eraIdx;
    }

    function stopHoloEmotionalScore(fadeSec = 1.2, stopWav = true) {
        if (stopWav) {
            if (synJourneyAudioEl && !synJourneyAudioEl.paused) {
                let vol = synJourneyAudioEl.volume;
                const fadeTimer = setInterval(() => {
                    vol = Math.max(0, vol - 0.08);
                    try { synJourneyAudioEl.volume = vol; } catch (_) {}
                    if (vol <= 0) {
                        clearInterval(fadeTimer);
                        try {
                            synJourneyAudioEl.pause();
                            synJourneyAudioEl.currentTime = 0;
                        } catch (_) {}
                    }
                }, 70);
            }
            if (nativeIntroAudioActive) {
                nativeIntroAudioActive = false;
                triggerNativeServerAudio('stop_syn');
            }
        }
        if (!holoScoreNodes) return;
        const nodes = holoScoreNodes;
        holoScoreNodes = null;
        try {
            const now = nodes.ctx.currentTime;
            nodes.masterGain.gain.cancelScheduledValues(now);
            nodes.masterGain.gain.setValueAtTime(nodes.masterGain.gain.value, now);
            nodes.masterGain.gain.linearRampToValueAtTime(0.0001, now + fadeSec);
            setTimeout(() => {
                try {
                    nodes.padOscs.forEach((o) => o.stop());
                    nodes.rainSrc.stop();
                    nodes.masterGain.disconnect();
                } catch (_) {}
            }, Math.ceil(fadeSec * 1000) + 120);
        } catch (_) {}
    }

    function setOwlButlerPose(poseName) {
        if (!owlActorEl) return;
        const frames = owlActorEl.querySelectorAll('.owl-frame');
        let activeOwlImg = null;
        frames.forEach((img) => {
            const isAct = img.classList.contains(`frame-${poseName}`);
            img.classList.toggle('active', isAct);
            if (isAct) activeOwlImg = img;
        });
        const owlWrap = owlActorEl.querySelector('.holo-owl-sprite-wrap');
        if (owlWrap && activeOwlImg) {
            syncContainer3DVoxelAndMirror(owlWrap, owlActorEl, activeOwlImg);
        }
    }

    function startOwlTalkAnim(primaryPose = 'talk1') {
        stopOwlTalkAnim();
        setOwlButlerPose(primaryPose);
    }

    function stopOwlTalkAnim() {
        if (owlTalkTimer) {
            clearInterval(owlTalkTimer);
            owlTalkTimer = null;
        }
        setOwlButlerPose('idle');
    }

    function updateHoloEraPills(eraIdx) {
        const visualSlideIdx = Math.min(7, Math.max(0, eraIdx));
        if (holoTimelinePills) {
            holoTimelinePills.forEach((pill, idx) => {
                pill.classList.toggle('active', idx === visualSlideIdx);
                pill.classList.toggle('completed', idx < visualSlideIdx);
            });
        }
        if (holoEraSlides) {
            holoEraSlides.forEach((slide, idx) => {
                const isAct = idx === visualSlideIdx;
                slide.classList.toggle('active', isAct);
                if (isAct && stage3dDioramaReflectionEl) {
                    const bgImg = slide.style.backgroundImage;
                    if (bgImg) {
                        stage3dDioramaReflectionEl.style.backgroundImage = bgImg;
                    }
                }
            });
        }
    }

    function triggerHoloDramaticFlash(flashClass) {
        if (!holoDramaticFlash) return;
        holoDramaticFlash.classList.remove('flash-projector-ignite', 'flash-thunder-blackout', 'flash-golden-sunrise');
        void holoDramaticFlash.offsetWidth;
        if (flashClass) {
            holoDramaticFlash.classList.add(flashClass);
        }
    }

    function playHoloButlerSfx(mode) {
        const ctx = ensureLofiAudioContext();
        if (!ctx) return;
        try {
            if (ctx.state === 'suspended') ctx.resume().catch(() => {});
            const now = ctx.currentTime;
            if (mode === 'beam_in') {
                // Stage 1: Sub-bass emitter capacitor charge (0.04s .. 0.65s)
                const subOsc = ctx.createOscillator();
                const subGain = ctx.createGain();
                subOsc.type = 'sine';
                subOsc.frequency.setValueAtTime(42, now + 0.04);
                subOsc.frequency.exponentialRampToValueAtTime(118, now + 0.68);
                subGain.gain.setValueAtTime(0.0001, now);
                subGain.gain.linearRampToValueAtTime(0.08, now + 0.25);
                subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
                subOsc.connect(subGain);
                subGain.connect(ctx.destination);
                subOsc.start(now + 0.04);
                subOsc.stop(now + 0.75);

                // Stage 2: Stepped vector laser scanline sweep (0.55s .. 1.75s)
                [220, 329.63, 440, 587.33, 659.25, 880].forEach((freq, idx) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    const t0 = now + 0.55 + idx * 0.19;
                    o.type = 'sawtooth';
                    o.frequency.setValueAtTime(freq, t0);
                    g.gain.setValueAtTime(0.032, t0);
                    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.start(t0);
                    o.stop(t0 + 0.17);
                });

                // Stage 3: Signal Lock-In Chime & Sub-Drop at 1.82s
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    const t0 = now + 1.82 + idx * 0.035;
                    o.type = 'triangle';
                    o.frequency.setValueAtTime(freq, t0);
                    g.gain.setValueAtTime(0.055, t0);
                    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.start(t0);
                    o.stop(t0 + 0.48);
                });
            } else if (mode === 'thunder_shift') {
                // Deep cinematic sub-drop when The Shift hits
                const dropOsc = ctx.createOscillator();
                const dropGain = ctx.createGain();
                dropOsc.type = 'sine';
                dropOsc.frequency.setValueAtTime(98, now);
                dropOsc.frequency.exponentialRampToValueAtTime(29, now + 1.25);
                dropGain.gain.setValueAtTime(0.18, now);
                dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);
                dropOsc.connect(dropGain);
                dropGain.connect(ctx.destination);
                dropOsc.start(now);
                dropOsc.stop(now + 1.5);
            } else if (mode === 'sanctuary_chime') {
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    const t0 = now + idx * 0.075;
                    o.type = 'triangle';
                    o.frequency.setValueAtTime(freq, t0);
                    g.gain.setValueAtTime(0.055, t0);
                    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.start(t0);
                    o.stop(t0 + 0.35);
                });
            } else if (mode === 'turntable_rotate') {
                // Soft futuristic holographic turntable rotation servo chime
                const servoOsc = ctx.createOscillator();
                const servoGain = ctx.createGain();
                servoOsc.type = 'sine';
                servoOsc.frequency.setValueAtTime(165, now);
                servoOsc.frequency.exponentialRampToValueAtTime(330, now + 0.45);
                servoGain.gain.setValueAtTime(0.0001, now);
                servoGain.gain.linearRampToValueAtTime(0.038, now + 0.12);
                servoGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
                servoOsc.connect(servoGain);
                servoGain.connect(ctx.destination);
                servoOsc.start(now);
                servoOsc.stop(now + 0.58);
            } else if (mode === 'glitch_out') {
                // Crisp reverse static slice-glitch sound when Syn glitches away
                [880, 659.25, 440, 293.66, 146.83].forEach((freq, idx) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    const t0 = now + idx * 0.09;
                    o.type = 'sawtooth';
                    o.frequency.setValueAtTime(freq, t0);
                    g.gain.setValueAtTime(0.035, t0);
                    g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.11);
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.start(t0);
                    o.stop(t0 + 0.12);
                });
            }
        } catch (_) {}
    }

    /**
     * Live 60fps Moving Television Static Snow Engine for Scene 5 (The TV Pile Scene)
     * Renders boiling CRT snow, rolling horizontal sync bars, and scanline tear streaks
     * directly into #tv-pile-static-canvas (masked to all 58 static TV screens in the pile!)
     */
    function renderTvPileStaticCanvas(now) {
        const sw = 344; // 1/4 of 1376 -> crisp 4x4 pixel CRT snow grains
        const sh = 192; // 1/4 of 768
        if (tvPileStaticCanvas && (tvPileStaticCanvas.width !== sw || tvPileStaticCanvas.height !== sh)) {
            tvPileStaticCanvas.width = sw;
            tvPileStaticCanvas.height = sh;
            tvStaticCtx = tvPileStaticCanvas.getContext('2d');
            if (tvStaticCtx && !tvStaticImgData) {
                tvStaticImgData = tvStaticCtx.createImageData(sw, sh);
            }
        }
        if (shutteredArcadeStaticCanvas && (shutteredArcadeStaticCanvas.width !== sw || shutteredArcadeStaticCanvas.height !== sh)) {
            shutteredArcadeStaticCanvas.width = sw;
            shutteredArcadeStaticCanvas.height = sh;
            shutteredStaticCtx = shutteredArcadeStaticCanvas.getContext('2d');
            if (shutteredStaticCtx && !tvStaticImgData) {
                tvStaticImgData = shutteredStaticCtx.createImageData(sw, sh);
            }
        }
        if ((!tvStaticCtx && !shutteredStaticCtx) || !tvStaticImgData) return;

        const data = tvStaticImgData.data;
        const t = (now || performance.now()) * 0.001;
        const bar1Y = Math.floor(((t * 68) % sh + sh) % sh);
        const bar2Y = Math.floor((((t * 115) + sh * 0.48) % sh + sh) % sh);
        const tearRow = Math.random() < 0.65 ? Math.floor(Math.random() * sh) : -10;

        let p = 0;
        for (let y = 0; y < sh; y++) {
            const scanShade = (y & 1) === 1 ? 0.78 : 1.0;
            const d1 = Math.abs(y - bar1Y);
            const d2 = Math.abs(y - bar2Y);
            const syncBoost = (d1 < 7 ? (7 - d1) * 14 : 0) + (d2 < 4 ? (4 - d2) * 18 : 0);
            const isTear = Math.abs(y - tearRow) <= 1;

            for (let x = 0; x < sw; x++) {
                // High-contrast boiling television snow static
                const r = Math.random();
                let luma;
                if (isTear) {
                    luma = r > 0.25 ? 250 : 45;
                } else if (r > 0.72) {
                    luma = 215 + Math.random() * 40;
                } else if (r < 0.24) {
                    luma = 32 + Math.random() * 48;
                } else {
                    luma = 95 + Math.random() * 115;
                }
                luma = Math.min(255, (luma + syncBoost) * scanShade);

                // Authentic cool-white CRT television phosphor tint
                data[p] = Math.floor(luma * 0.90);
                data[p + 1] = Math.floor(luma * 0.96);
                data[p + 2] = Math.min(255, Math.floor(luma * 1.06));
                data[p + 3] = 255;
                p += 4;
            }
        }
        if (tvStaticCtx) tvStaticCtx.putImageData(tvStaticImgData, 0, 0);
        if (shutteredStaticCtx) shutteredStaticCtx.putImageData(tvStaticImgData, 0, 0);
    }

    /**
     * Live Moving Retro Gameplay & CRT Monitor Engine for Scenes 1, 2, 3, 4, 7, 8
     * + Magical Bioluminescent Blue Tree Sap & Mana Shimmer Engine for Scene 8!
     */
    const eraCrtCanvases = {};
    let treeMagicCanvasEl = null;

    function renderEraCrtGameplayAndTreeMagic(now, era) {
        const sceneNum = (era === 0) ? 1 : (era === 1) ? 2 : (era === 2) ? 3 : (era === 3) ? 4 : (era === 6) ? 7 : (era === 7) ? 8 : 0;
        if (!sceneNum) return;

        if (!eraCrtCanvases[sceneNum]) {
            eraCrtCanvases[sceneNum] = document.querySelector(`[data-era-crt-canvas="${sceneNum}"]`);
        }
        const crtCanvas = eraCrtCanvases[sceneNum];
        const t = (now || performance.now()) * 0.001;

        if (crtCanvas) {
            const cw = 344;
            const ch = 192;
            if (crtCanvas.width !== cw || crtCanvas.height !== ch) {
                crtCanvas.width = cw;
                crtCanvas.height = ch;
            }
            const gctx = crtCanvas.getContext('2d');
            if (gctx) {
                gctx.clearRect(0, 0, cw, ch);

                // Base CRT phosphor glow + scrolling retro starfield / synth-grid background across all masked screen zones
                const pulse = 0.24 + 0.12 * Math.sin(t * 4.5);
                gctx.fillStyle = (sceneNum === 1 || sceneNum === 4)
                    ? `rgba(0, 225, 255, ${pulse})`
                    : (sceneNum === 2)
                        ? `rgba(60, 245, 190, ${pulse})`
                        : `rgba(0, 200, 255, ${pulse})`;
                gctx.fillRect(0, 0, cw, ch);

                // Moving retro arcade sprites (spaceships, laser bolts, bouncing platformer blocks, scrolling road lines)
                for (let i = 0; i < 28; i++) {
                    const seed = i * 37.3;
                    const sx = ((seed * 19 + t * (34 + (i % 5) * 14) * (i % 2 === 0 ? 1 : -1)) % cw + cw) % cw;
                    const sy = ((seed * 11 + Math.sin(t * 3.8 + i) * 18) % ch + ch) % ch;
                    const isLaser = (i % 3 === 0);
                    if (isLaser) {
                        gctx.fillStyle = (i % 2 === 0) ? 'rgba(255, 255, 120, 0.95)' : 'rgba(255, 65, 175, 0.95)';
                        gctx.fillRect(Math.floor(sx), Math.floor(sy), 8, 2);
                    } else {
                        gctx.fillStyle = (i % 4 === 0)
                            ? 'rgba(0, 255, 235, 0.95)'
                            : (i % 4 === 1)
                                ? 'rgba(255, 215, 65, 0.95)'
                                : 'rgba(135, 255, 120, 0.92)';
                        gctx.fillRect(Math.floor(sx), Math.floor(sy), 4, 4);
                        gctx.fillStyle = '#ffffff';
                        gctx.fillRect(Math.floor(sx) + 1, Math.floor(sy) + 1, 2, 2);
                    }
                }

                // Rolling horizontal CRT refresh scanbars inside the TVs
                const scanY1 = ((t * 48) % ch + ch) % ch;
                const scanY2 = (((t * 76) + ch * 0.5) % ch + ch) % ch;
                gctx.fillStyle = 'rgba(200, 250, 255, 0.38)';
                gctx.fillRect(0, Math.floor(scanY1), cw, 3);
                gctx.fillStyle = 'rgba(255, 120, 220, 0.28)';
                gctx.fillRect(0, Math.floor(scanY2), cw, 2);
            }
        }

        // Scene 8 (era === 7): Magical Bioluminescent Blue Tree Sap Waves & Shimmering Cyan Mana Particles!
        if (era === 7) {
            if (!treeMagicCanvasEl) {
                treeMagicCanvasEl = document.querySelector('[data-era-tree-canvas="8"]');
            }
            if (treeMagicCanvasEl) {
                const tw = 344;
                const th = 192;
                if (treeMagicCanvasEl.width !== tw || treeMagicCanvasEl.height !== th) {
                    treeMagicCanvasEl.width = tw;
                    treeMagicCanvasEl.height = th;
                }
                const tctx = treeMagicCanvasEl.getContext('2d');
                if (tctx) {
                    tctx.clearRect(0, 0, tw, th);

                    // Rising bioluminescent blue/cyan sap energy wave traveling up the tree trunk veins into the canopy
                    const waveY = th - (((t * 36) % (th + 60)));
                    const waveGrad = tctx.createLinearGradient(0, waveY - 38, 0, waveY + 38);
                    waveGrad.addColorStop(0, 'rgba(0, 210, 255, 0)');
                    waveGrad.addColorStop(0.5, 'rgba(110, 252, 255, 0.85)');
                    waveGrad.addColorStop(1, 'rgba(0, 160, 255, 0)');
                    tctx.fillStyle = waveGrad;
                    tctx.fillRect(0, 0, tw, th);

                    // Second harmonic shimmer pulse across the cyan leaves & stream
                    const waveY2 = ((t * 24) % (th + 50)) - 25;
                    const waveGrad2 = tctx.createLinearGradient(0, waveY2 - 28, 0, waveY2 + 28);
                    waveGrad2.addColorStop(0, 'rgba(0, 245, 212, 0)');
                    waveGrad2.addColorStop(0.5, 'rgba(0, 235, 255, 0.65)');
                    waveGrad2.addColorStop(1, 'rgba(0, 245, 212, 0)');
                    tctx.fillStyle = waveGrad2;
                    tctx.fillRect(0, 0, tw, th);

                    // Sparkling electric-blue mana nodes pulsing inside the blue tree accents
                    for (let i = 0; i < 36; i++) {
                        const px = ((i * 53.7 + Math.sin(t * 1.8 + i) * 14) % tw + tw) % tw;
                        const py = ((i * 29.1 - t * (12 + (i % 4) * 5)) % th + th) % th;
                        const sparkAlpha = 0.45 + 0.55 * Math.sin(t * 4.2 + i * 1.7);
                        tctx.fillStyle = `rgba(175, 252, 255, ${sparkAlpha})`;
                        tctx.beginPath();
                        tctx.arc(px, py, 2.2 + (i % 3) * 0.9, 0, Math.PI * 2);
                        tctx.fill();
                    }
                }
            }
        }
    }

    function renderHoloEraCanvas(now) {
        if (!holoCanvasActive || !holoEraCanvas) return;
        const ctx = holoEraCanvas.getContext('2d');
        if (!ctx) return;

        const w = window.innerWidth;
        const h = window.innerHeight;
        if (holoEraCanvas.width !== w || holoEraCanvas.height !== h) {
            holoEraCanvas.width = w;
            holoEraCanvas.height = h;
        }

        const t = (now || performance.now()) * 0.001;
        // Keep canvas 100% transparent so the full-screen 16-bit scene artwork shines unobstructed!
        ctx.clearRect(0, 0, w, h);

        const era = targetHoloEra;
        if (era >= 0 && era <= 7 && era !== 4 && era !== 5) {
            renderEraCrtGameplayAndTreeMagic(now, era);
        }

        if (era === -2) {
            // 0.00s .. 12.00s: Pure Pitch-Black Screen for 2.40s, then 3 Separate Lines Typing & Disappearing One by One:
            // 1) "Hello My Old Friend..." -> disappears
            // 2) "Its Been Awhile...." (+ Music Fades In!) -> disappears
            // 3) "I Am Synth..." -> disappears
        } else if (era === -1) {
            // 12.00s .. 14.40s: Synth Glitches onto the Screen with Rapidly Flickering Floor Light + Live Scanline Glitch Sparks!
            const elapsedGlitch = Math.max(0, ((now || performance.now()) - holoJourneyStartPerfNow) * 0.001 - 12.00);
            const leftZoneW = Math.min(w * 0.40, 440);
            const owlCenterX = Math.min(w * 0.16, 220);
            const owlBottomY = h - 32;
            const owlTopY = Math.max(h * 0.44, h - 450);

            // Rapidly flickering floor projector pool directly underneath Syn
            const flickerOn = (Math.sin(t * 58.0) * Math.cos(t * 23.0)) > -0.15 || elapsedGlitch > 1.80;
            if (flickerOn) {
                const flGrad = ctx.createRadialGradient(owlCenterX, owlBottomY - 6, 4, owlCenterX, owlBottomY - 6, 175);
                const flAlpha = elapsedGlitch > 1.80 ? 0.42 : (0.18 + Math.random() * 0.46);
                flGrad.addColorStop(0, `rgba(255, 255, 255, ${flAlpha})`);
                flGrad.addColorStop(0.35, `rgba(0, 240, 255, ${flAlpha * 0.85})`);
                flGrad.addColorStop(0.70, `rgba(255, 45, 149, ${flAlpha * 0.45})`);
                flGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
                ctx.fillStyle = flGrad;
                ctx.beginPath();
                ctx.ellipse(owlCenterX, owlBottomY - 6, 175, 28, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // Horizontal hologram interference bars snapping across Syn's projection zone
            const numSlices = elapsedGlitch < 1.85 ? 16 : 5;
            for (let i = 0; i < numSlices; i++) {
                if (Math.random() > 0.52) continue;
                const sy = owlTopY + Math.random() * (owlBottomY - owlTopY);
                const sh = 1.5 + Math.random() * 5;
                const sx = Math.max(12, owlCenterX - 160 + (Math.random() - 0.5) * 80);
                const sw = 60 + Math.random() * 220;
                ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 240, 255, 0.42)' : 'rgba(255, 45, 149, 0.36)';
                ctx.fillRect(sx, sy, sw, sh);
            }

            // Rising vector hologram sparks from the floor emitter ring
            holoParticles.forEach((pt, idx) => {
                if (idx > 28) return;
                const py = ((pt.y - t * (pt.speed * 1.85)) % 1 + 1) % 1;
                const px = 22 + (pt.x * leftZoneW * 0.82) + Math.sin(t * 6.0 + pt.phase) * 14;
                const y = owlTopY + py * (owlBottomY - owlTopY);
                ctx.fillStyle = idx % 2 === 0 ? 'rgba(0, 240, 255, 0.78)' : 'rgba(255, 45, 149, 0.72)';
                ctx.fillRect(px, y, pt.size * 1.4, pt.size * 1.4);
            });
        } else if (era <= 1) {
            // Warm nostalgic projector dust motes & golden/cyan sparkles drifting over 80s/90s scenes
            holoParticles.forEach((pt, idx) => {
                const py = ((pt.y - t * (pt.speed * 0.38)) % 1 + 1) % 1;
                const px = pt.x * w + Math.sin(t * 1.1 + pt.phase) * 18;
                const y = py * h * 0.86;
                const pulse = 0.35 + 0.35 * Math.sin(t * 2.2 + pt.phase);
                ctx.fillStyle = idx % 2 === 0 ? `rgba(255, 215, 110, ${pulse})` : `rgba(0, 240, 255, ${pulse * 0.85})`;
                ctx.beginPath();
                ctx.arc(px, y, pt.size, 0, Math.PI * 2);
                ctx.fill();
            });
        } else if (era === 2 || era === 3) {
            // Warm Y2K cyber-emerald & golden friendship bokeh motes over 2000s scenes
            holoParticles.forEach((pt, idx) => {
                const py = ((pt.y - t * (pt.speed * 0.38)) % 1 + 1) % 1;
                const px = pt.x * w + Math.cos(t * 1.1 + pt.phase) * 16;
                const pulse = 0.35 + 0.35 * Math.cos(t * 2.0 + pt.phase);
                ctx.fillStyle = idx % 2 === 0 ? `rgba(0, 245, 212, ${pulse})` : `rgba(255, 223, 120, ${pulse})`;
                ctx.beginPath();
                ctx.arc(px, py * h * 0.86, pt.size, 0, Math.PI * 2);
                ctx.fill();
            });
        } else if (era === 4 || era === 5) {
            // Periodic atmospheric sheet-lightning flashes in the storm sky
            const lightningCycle = (t * 0.42) % 1;
            if ((lightningCycle > 0.18 && lightningCycle < 0.205) || (lightningCycle > 0.22 && lightningCycle < 0.235)) {
                ctx.fillStyle = 'rgba(175, 220, 255, 0.14)';
                ctx.fillRect(0, 0, w, h);
            }

            // Full-Screen Diagonal Pouring Rain Streaks & Splash Ripples across 100% of the viewport width & height
            ctx.lineWidth = 1.45;
            holoRainDrops.forEach((drop, idx) => {
                const prog = (drop.y + t * drop.speed) % 1;
                const rx = ((((drop.x - prog * 0.15) % 1) + 1) % 1) * w;
                const ry = prog * (h + 60) - 30;
                ctx.strokeStyle = `rgba(185, 225, 255, ${drop.alpha * 1.12})`;
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(rx - drop.len * 0.22, ry + drop.len);
                ctx.stroke();

                // Subtle rain splash ripples across the entire width of the screen
                if (idx % 4 === 0 && prog > 0.86) {
                    const splashProg = (prog - 0.86) / 0.14;
                    const splashR = 2 + splashProg * 14;
                    const splashAlpha = (1 - splashProg) * 0.28;
                    ctx.strokeStyle = `rgba(190, 228, 255, ${splashAlpha})`;
                    ctx.beginPath();
                    ctx.ellipse(rx, (0.86 + (idx % 12) * 0.011) * h, splashR, splashR * 0.28, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            if (era === 4 || era === 5) {
                // Render live moving television static inside all static TV screens in Scene 4 (Shutdown Arcade) & Scene 5 (TV Pile)!
                renderTvPileStaticCanvas(now);
            }
            if (era === 5) {
                // Full-screen CRT snow flicker & rolling vertical sync bar on the Corporate Static scene
                for (let i = 0; i < 56; i++) {
                    const sx = Math.random() * w;
                    const sy = Math.random() * h;
                    const sw = 8 + Math.random() * 32;
                    const luma = Math.floor(160 + Math.random() * 95);
                    ctx.fillStyle = `rgba(${luma}, ${luma}, ${luma}, 0.14)`;
                    ctx.fillRect(sx, sy, sw, 2);
                }
                const barY = ((t * 130) % (h + 100)) - 50;
                const barGrad = ctx.createLinearGradient(0, barY, 0, barY + 36);
                barGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
                barGrad.addColorStop(0.5, 'rgba(190, 225, 255, 0.12)');
                barGrad.addColorStop(1, 'rgba(255, 0, 85, 0.06)');
                ctx.fillStyle = barGrad;
                ctx.fillRect(0, barY, w, 36);
            }
        } else if (era === 6 || era === 7) {
            // Soaring golden canopy fireflies, sakura blossom petals & magical starlight rain over Rebirth & Sanctuary Finale across the full screen
            holoParticles.forEach((pt, idx) => {
                const isFallingStarlight = era === 7 && idx % 3 === 0;
                const py = isFallingStarlight
                    ? ((pt.y + t * (pt.speed * 0.32)) % 1 + 1) % 1
                    : ((pt.y - t * (pt.speed * 0.44)) % 1 + 1) % 1;
                const px = pt.x * w + Math.sin(t * 1.4 + pt.phase) * 22;
                const y = py * h;
                const glow = 0.48 + 0.48 * Math.sin(t * 2.8 + pt.phase);
                if (idx % 3 === 0) {
                    ctx.fillStyle = `rgba(0, 245, 255, ${glow * 0.9})`;
                } else if (idx % 3 === 1) {
                    ctx.fillStyle = `rgba(255, 165, 230, ${glow * 0.88})`;
                } else {
                    ctx.fillStyle = `rgba(255, 222, 105, ${glow})`;
                }
                ctx.beginPath();
                ctx.arc(px, y, pt.size * (era === 7 ? 1.45 : 1.25), 0, Math.PI * 2);
                ctx.fill();
            });
        } else if (era >= 9 && activeFlashCrewId && crewActors[activeFlashCrewId]) {
            // Scenes 9..12: Flickering Floor Light & Hologram Scan Sparks at the Spot of the Crew Member Glitching In!
            const elapsedCrewGlitch = Math.max(0, ((now || performance.now()) - activeCrewGlitchStartPerfNow) * 0.001);
            if (elapsedCrewGlitch < 2.25) {
                const cActor = crewActors[activeFlashCrewId];
                const crewCenterX = (cActor.targetX || cActor.posX || w * 0.5) + (cActor.width || 170) * 0.5;
                const crewBottomY = h - 28;
                const crewTopY = Math.max(h * 0.48, h - 380);

                // Rapidly flickering floor projector pool directly underneath the crew member glitching in
                const flickerOn = (Math.sin(t * 62.0) * Math.cos(t * 27.0)) > -0.18 || elapsedCrewGlitch > 1.60;
                if (flickerOn) {
                    const flGrad = ctx.createRadialGradient(crewCenterX, crewBottomY - 4, 4, crewCenterX, crewBottomY - 4, 145);
                    const flAlpha = elapsedCrewGlitch > 1.60 ? 0.36 : (0.20 + Math.random() * 0.48);
                    flGrad.addColorStop(0, `rgba(255, 255, 255, ${flAlpha})`);
                    flGrad.addColorStop(0.35, `rgba(0, 240, 255, ${flAlpha * 0.85})`);
                    flGrad.addColorStop(0.70, `rgba(255, 45, 149, ${flAlpha * 0.48})`);
                    flGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
                    ctx.fillStyle = flGrad;
                    ctx.beginPath();
                    ctx.ellipse(crewCenterX, crewBottomY - 4, 145, 24, 0, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Horizontal hologram interference bars snapping across the crew member's spot
                const numSlices = elapsedCrewGlitch < 1.60 ? 12 : 4;
                for (let i = 0; i < numSlices; i++) {
                    if (Math.random() > 0.52) continue;
                    const sy = crewTopY + Math.random() * (crewBottomY - crewTopY);
                    const sh = 1.5 + Math.random() * 4;
                    const sx = crewCenterX - 110 + (Math.random() - 0.5) * 60;
                    const sw = 50 + Math.random() * 160;
                    ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 240, 255, 0.44)' : 'rgba(255, 45, 149, 0.38)';
                    ctx.fillRect(sx, sy, sw, sh);
                }

                // Rising vector hologram sparks from the floor light
                holoParticles.forEach((pt, idx) => {
                    if (idx > 22) return;
                    const py = ((pt.y - t * (pt.speed * 1.9)) % 1 + 1) % 1;
                    const px = crewCenterX - 85 + pt.x * 170 + Math.sin(t * 6.0 + pt.phase) * 10;
                    const y = crewTopY + py * (crewBottomY - crewTopY);
                    ctx.fillStyle = idx % 2 === 0 ? 'rgba(0, 240, 255, 0.80)' : 'rgba(255, 45, 149, 0.74)';
                    ctx.fillRect(px, y, pt.size * 1.35, pt.size * 1.35);
                });
            }
        }

        holoCanvasRaf = requestAnimationFrame(renderHoloEraCanvas);
    }

    function anchorStationaryOwlSpot() {
        if (!owlActorEl) return;
        if (owlWalkRaf) {
            cancelAnimationFrame(owlWalkRaf);
            owlWalkRaf = null;
        }
        isOwlWalking = false;
        owlActorEl.style.transform = '';
    }

    let synthHelloTimers = [];
    function clearSynthHelloTimers() {
        synthHelloTimers.forEach((id) => clearTimeout(id));
        synthHelloTimers = [];
        if (synthOpeningGreetingEl) {
            synthOpeningGreetingEl.classList.remove('active', 'glitch-fade-out', 'line-fade-out');
        }
        if (synthGreetingTextEl) {
            synthGreetingTextEl.textContent = '';
        }
    }

    function startHoloButlerJourney() {
        if (sequenceComplete) return;
        inPrologue = true;
        currentPrologueIndex = -1;
        state = 'VILLAIN_BANTER';
        holoJourneyStartPerfNow = performance.now();
        clearSynthHelloTimers();

        if (stage) {
            stage.classList.remove('syn-exited');
        }
        if (document.body) {
            document.body.classList.remove('diorama-reveal-active', 'syn-in-background', 'coming-soon-finale-active');
            document.body.classList.add('holo-journey-active', 'holo-pitch-black');
        }
        if (holoEraSlides) {
            holoEraSlides.forEach((slide) => slide.classList.remove('active'));
        }
        if (holoStage) {
            holoStage.setAttribute('data-mood', 'nostalgia');
            holoStage.classList.remove('dematerialize', 'outro-welcome-crew', 'holo-stage-thunder-shake', 'sanctuary-living-backdrop');
            holoStage.classList.add('active', 'pitch-black-opening');
        }
        if (synthSteampunkComingSoonEl) {
            synthSteampunkComingSoonEl.classList.remove('visible');
        }

        anchorStationaryOwlSpot();
        setOwlButlerPose('idle');
        if (owlActorEl) {
            // Keep Synth completely hidden during the black pause & while the 3 greeting lines type and disappear
            owlActorEl.classList.remove('holo-beam-out', 'holo-beam-in', 'holo-glitch-in', 'center-stage-coming-soon', 'walking-to-center');
            owlActorEl.classList.add('pre-glitch-hidden');
        }

        holoCanvasActive = true;
        targetHoloEra = -2;
        if (holoCanvasRaf) cancelAnimationFrame(holoCanvasRaf);
        holoCanvasRaf = requestAnimationFrame(renderHoloEraCanvas);

        // Start the master WAV (assets/syn_journey.wav?v=80):
        // - 0.00s .. 2.40s: Pure pitch-black dramatic silence
        // - 2.40s .. 5.48s: Line 1 ("Hello My Old Friend...") types out, holds, and disappears completely
        // - 5.80s .. 8.85s: Line 2 ("Its Been Awhile....") types out as Kingdom Hearts music softly fades in, holds, and disappears completely
        // - 9.20s .. 11.95s: Line 3 ("I Am Synth...") types out, holds, and disappears completely
        // - 12.00s .. 14.40s: Synth glitches onto the screen with flickering floor light
        // - 14.40s onwards: Scenes 0..12
        startHoloEmotionalScore();

        const line1 = 'Hello My Old Friend...';
        const line2 = 'Its Been Awhile....';
        const line3 = 'I Am Synth...';

        // LINE 1 (2.40s): Type "Hello My Old Friend..." -> hold -> disappear before Line 2!
        synthHelloTimers.push(setTimeout(() => {
            if (!inPrologue || sequenceComplete) return;
            if (synthGreetingTextEl) synthGreetingTextEl.textContent = '';
            if (synthOpeningGreetingEl) {
                synthOpeningGreetingEl.classList.remove('glitch-fade-out', 'line-fade-out');
                synthOpeningGreetingEl.classList.add('active');
            }
            for (let i = 1; i <= line1.length; i++) {
                const idx = i;
                synthHelloTimers.push(setTimeout(() => {
                    if (!inPrologue || sequenceComplete) return;
                    if (synthGreetingTextEl) synthGreetingTextEl.textContent = line1.slice(0, idx);
                }, (idx - 1) * 76));
            }
        }, 2400));

        // Fade out & clear Line 1 (5.05s .. 5.48s) so it completely disappears before Line 2 starts
        synthHelloTimers.push(setTimeout(() => {
            if (!inPrologue || sequenceComplete) return;
            if (synthOpeningGreetingEl) {
                synthOpeningGreetingEl.classList.add('line-fade-out');
            }
        }, 5050));
        synthHelloTimers.push(setTimeout(() => {
            if (!inPrologue || sequenceComplete) return;
            if (synthGreetingTextEl) synthGreetingTextEl.textContent = '';
        }, 5480));

        // LINE 2 (5.80s): Type "Its Been Awhile...." AND bring in the music softly -> hold -> disappear before Line 3!
        synthHelloTimers.push(setTimeout(() => {
            if (!inPrologue || sequenceComplete) return;
            startDearlyBelovedCutsceneBed();
            if (synthGreetingTextEl) synthGreetingTextEl.textContent = '';
            if (synthOpeningGreetingEl) {
                synthOpeningGreetingEl.classList.remove('glitch-fade-out', 'line-fade-out');
                synthOpeningGreetingEl.classList.add('active');
            }
            for (let i = 1; i <= line2.length; i++) {
                const idx = i;
                synthHelloTimers.push(setTimeout(() => {
                    if (!inPrologue || sequenceComplete) return;
                    if (synthGreetingTextEl) synthGreetingTextEl.textContent = line2.slice(0, idx);
                }, (idx - 1) * 78));
            }
        }, 5800));

        // Fade out & clear Line 2 (8.40s .. 8.85s) so it completely disappears before Line 3 starts
        synthHelloTimers.push(setTimeout(() => {
            if (!inPrologue || sequenceComplete) return;
            if (synthOpeningGreetingEl) {
                synthOpeningGreetingEl.classList.add('line-fade-out');
            }
        }, 8400));
        synthHelloTimers.push(setTimeout(() => {
            if (!inPrologue || sequenceComplete) return;
            if (synthGreetingTextEl) synthGreetingTextEl.textContent = '';
        }, 8850));

        // LINE 3 (9.20s): Type "I Am Synth..." -> hold -> disappear before Synth glitches in!
        synthHelloTimers.push(setTimeout(() => {
            if (!inPrologue || sequenceComplete) return;
            if (synthGreetingTextEl) synthGreetingTextEl.textContent = '';
            if (synthOpeningGreetingEl) {
                synthOpeningGreetingEl.classList.remove('glitch-fade-out', 'line-fade-out');
                synthOpeningGreetingEl.classList.add('active');
            }
            for (let i = 1; i <= line3.length; i++) {
                const idx = i;
                synthHelloTimers.push(setTimeout(() => {
                    if (!inPrologue || sequenceComplete) return;
                    if (synthGreetingTextEl) synthGreetingTextEl.textContent = line3.slice(0, idx);
                }, (idx - 1) * 84));
            }
        }, 9200));

        // Fade out & clear Line 3 (11.55s .. 11.95s) right before Synth glitches in at 12.00s
        synthHelloTimers.push(setTimeout(() => {
            if (!inPrologue || sequenceComplete) return;
            if (synthOpeningGreetingEl) {
                synthOpeningGreetingEl.classList.add('glitch-fade-out');
            }
        }, 11550));
        synthHelloTimers.push(setTimeout(() => {
            if (!inPrologue || sequenceComplete) return;
            if (synthGreetingTextEl) synthGreetingTextEl.textContent = '';
        }, 11950));

        // At 12.00s: Glitch Synth onto the left side of the screen with his flickering floor light!
        synthHelloTimers.push(setTimeout(() => {
            if (!inPrologue || sequenceComplete) return;
            targetHoloEra = -1;
            if (owlActorEl) {
                owlActorEl.classList.remove('pre-glitch-hidden', 'holo-beam-out', 'holo-beam-in', 'holo-glitch-in');
                void owlActorEl.offsetWidth;
                owlActorEl.classList.add('holo-glitch-in');
            }
            playHoloButlerSfx('beam_in');
        }, 12000));

        if (holoGlitchTimer) clearTimeout(holoGlitchTimer);
        holoGlitchTimer = setTimeout(() => {
            if (!inPrologue || sequenceComplete) return;
            clearSynthHelloTimers();
            if (document.body) {
                document.body.classList.remove('holo-pitch-black');
            }
            if (holoStage) {
                holoStage.classList.remove('pitch-black-opening');
            }
            if (owlActorEl) {
                owlActorEl.classList.remove('pre-glitch-hidden', 'holo-glitch-in');
            }
            holoCanvasActive = true;
            targetHoloEra = 0;
            playPrologueStep(0, false);
        }, 14400);
    }

    /**
     * Pure-Black Stage One-by-One Hologram Glitch-In & Flickering Floor Light Intro + Proportional Final Lineup
     * - During Scene 8: Era slides fade out to a 100% pure pitch-black (#000000) main page while Synth invites the crew out.
     * - During Scenes 9, 10, 11, 12: As Synth calls Chloe -> CAB-84 -> Akari -> Grizz one by one on the black screen,
     *   a flickering floor light ignites at their spot and they glitch/beam in one by one (just like Synth!) with their link button above them.
     * - After Synth glitches away: All 4 crew members step smoothly into their 100% proportional full-screen positions.
     */
    let activeFlashCrewId = null;
    let activeCrewGlitchStartPerfNow = 0;
    let crewGlitchClearTimer = null;

    function hideActionBackdropFlash() {
        activeFlashCrewId = null;
        if (crewGlitchClearTimer) {
            clearTimeout(crewGlitchClearTimer);
            crewGlitchClearTimer = null;
        }
        friendsOnlyOrder.forEach((id) => {
            const actor = crewActors[id];
            if (actor && actor.el) {
                actor.el.classList.remove('crew-glitch-in');
            }
        });
    }

    function updateSpotlightFramePosition() {
        // No background flash card — main screen stays 100% pure black (#000000)
    }

    function ensureStationDropLoopRunning() {
        if (crewWalkAlongsideRaf) return;
        let lastTime = performance.now();
        let walkStepTimer = 0;

        function tickStationDrop(now) {
            const dt = Math.min((now - lastTime) / 1000, 0.08);
            lastTime = now;
            walkStepTimer += dt * 1000;
            const adv = walkStepTimer >= STEP_DURATION;
            if (adv) walkStepTimer = 0;

            let anyMoving = false;
            friendsOnlyOrder.forEach((id) => {
                const actor = crewActors[id];
                if (!actor || !actor.movingToStation) return;
                anyMoving = true;

                const targetX = actor.targetX;
                const targetY = typeof actor.targetY === 'number' ? actor.targetY : 0;
                const targetScale = typeof actor.targetScale === 'number' ? actor.targetScale : 1.0;
                const dx = targetX - actor.posX;
                const dy = targetY - (actor.posY || 0);
                const ds = targetScale - (actor.currentScale || 1.0);

                actor.posX += dx * Math.min(1, dt * 5.4);
                actor.posY = (actor.posY || 0) + dy * Math.min(1, dt * 5.4);
                actor.currentScale = (actor.currentScale || 1.0) + ds * Math.min(1, dt * 5.4);

                if (adv && Math.abs(dx) > 12) {
                    actor.walkFrame++;
                    setActorPose(id, friendWalkCycle[actor.walkFrame % friendWalkCycle.length]);
                }

                if (Math.abs(dx) < 2.0 && Math.abs(dy) < 1.5 && Math.abs(ds) < 0.01) {
                    actor.posX = targetX;
                    actor.posY = targetY;
                    actor.currentScale = targetScale;
                    actor.movingToStation = false;
                    actor.arrived = true;
                    actor.el.style.zIndex = String(actor.targetZIndex || '');
                    actor.el.style.filter = '';
                    setActorFacing(id, false);
                    setActorPose(id, actor.isHovered ? 'talk2' : 'idle');
                }
                actor.el.style.transform = `translate3d(${actor.posX.toFixed(1)}px, ${(actor.posY || 0).toFixed(1)}px, 0) scale(${(actor.currentScale || 1).toFixed(3)})`;
            });

            if (anyMoving) {
                crewWalkAlongsideRaf = requestAnimationFrame(tickStationDrop);
            } else {
                crewWalkAlongsideRaf = null;
            }
        }

        crewWalkAlongsideRaf = requestAnimationFrame(tickStationDrop);
    }

    function rotateTurntableToCrewMember(crewId) {
        computeTargetPositions(true, true);
        if (crewGlitchClearTimer) {
            clearTimeout(crewGlitchClearTimer);
            crewGlitchClearTimer = null;
        }

        // Lock in any previously glitched-in crew members at their proportional spot on the black stage
        const curIntroIdx = synthIntroOrder.indexOf(crewId);
        friendsOnlyOrder.forEach((id) => {
            const prevActor = crewActors[id];
            if (!prevActor || !prevActor.el) return;
            prevActor.el.classList.remove('crew-glitch-in');
            const idIntroIdx = synthIntroOrder.indexOf(id);
            if (idIntroIdx !== -1 && idIntroIdx < curIntroIdx) {
                prevActor.movingToStation = false;
                prevActor.arrived = true;
                prevActor.posX = prevActor.targetX;
                prevActor.posY = prevActor.targetY || 0;
                prevActor.currentScale = prevActor.targetScale || 1;
                prevActor.el.style.opacity = '1';
                prevActor.el.style.pointerEvents = 'auto';
                prevActor.el.style.zIndex = String(prevActor.targetZIndex || '');
                prevActor.el.style.filter = '';
                prevActor.el.style.transform = `translate3d(${prevActor.posX.toFixed(1)}px, ${(prevActor.posY || 0).toFixed(1)}px, 0) scale(${(prevActor.currentScale || 1).toFixed(3)})`;
                setActorFacing(id, false);
                setActorPose(id, prevActor.isHovered ? 'talk2' : 'idle');
                revealLinkFor(id);
            } else if (idIntroIdx > curIntroIdx) {
                // Keep not-yet-introduced crew members hidden in the dark until Synth calls their name!
                prevActor.arrived = false;
                prevActor.el.style.opacity = '0';
                prevActor.el.style.pointerEvents = 'none';
            }
        });

        activeFlashCrewId = crewId;
        activeCrewGlitchStartPerfNow = performance.now();

        const actor = crewActors[crewId];
        if (actor && actor.el) {
            // Glitch / Beam the introduced character directly into their V-Formation spot with a flickering floor light!
            actor.posX = actor.targetX;
            actor.posY = actor.targetY || 0;
            actor.currentScale = actor.targetScale || 1;
            actor.movingToStation = false;
            actor.arrived = true;
            actor.el.style.opacity = '1';
            actor.el.style.pointerEvents = 'auto';
            actor.el.style.transformOrigin = 'bottom center';
            actor.el.style.zIndex = '1040';
            actor.el.style.filter = '';
            actor.el.style.transform = `translate3d(${actor.posX.toFixed(1)}px, ${(actor.posY || 0).toFixed(1)}px, 0) scale(${(actor.currentScale || 1).toFixed(3)})`;
            setActorFacing(crewId, false);
            setActorPose(crewId, 'talk2');
            triggerIntro360Spin(crewId);

            actor.el.classList.remove('crew-glitch-in');
            void actor.el.offsetWidth;
            actor.el.classList.add('crew-glitch-in');

            crewGlitchClearTimer = setTimeout(() => {
                if (actor && actor.el) {
                    actor.el.classList.remove('crew-glitch-in');
                    actor.el.style.zIndex = String(actor.targetZIndex || '');
                }
            }, 2000);
        }

        playHoloButlerSfx('beam_in');
    }

    function walkInCrewAlongsideSyn(snapToTargets = false) {
        if (!snapToTargets) {
            // During Scene 8 ("Everyone, come on out"), keep the black stage clear until Synth introduces each friend in Scenes 9..12!
            hideActionBackdropFlash();
            friendsOnlyOrder.forEach((id) => {
                const actor = crewActors[id];
                if (!actor || !actor.el) return;
                actor.arrived = false;
                actor.el.style.opacity = '0';
                actor.el.style.pointerEvents = 'none';
            });
        }
        if (!snapToTargets && !crewWalkedInForSyn) {
            crewWalkedInForSyn = true;
            playHoloButlerSfx('turntable_rotate');
        }
    }

    function repositionFriendsAfterSynExit() {
        if (turntableFinaleSpinTimer) {
            clearTimeout(turntableFinaleSpinTimer);
            turntableFinaleSpinTimer = null;
        }
        hideActionBackdropFlash();
        if (stage) {
            stage.classList.add('syn-exited');
        }
        if (document.body) {
            document.body.classList.add('syn-in-background');
        }

        computeTargetPositions(true, false);
        if (stage) {
            stage.classList.add('syn-exited');
        }
        if (document.body) {
            document.body.classList.add('syn-in-background');
        }
        friendsOnlyOrder.forEach((id) => {
            const actor = crewActors[id];
            if (!actor) return;
            revealLinkFor(id);
            actor.el.style.opacity = '1';
            actor.el.style.pointerEvents = 'auto';
            actor.el.style.zIndex = String(actor.targetZIndex || '');
            actor.el.style.filter = '';
            const targetY = typeof actor.targetY === 'number' ? actor.targetY : 0;
            const targetScale = typeof actor.targetScale === 'number' ? actor.targetScale : 1;
            if (typeof actor.posY !== 'number') actor.posY = targetY;
            if (typeof actor.currentScale !== 'number') actor.currentScale = targetScale;
            if (actor.posX < -80) {
                actor.posX = actor.targetX + 60;
                actor.posY = targetY;
                actor.currentScale = targetScale;
            }
            if (Math.abs(actor.targetX - actor.posX) > 3 || Math.abs(targetY - actor.posY) > 2 || Math.abs(actor.currentScale - targetScale) > 0.02) {
                actor.movingToStation = true;
                actor.arrived = false;
                setActorFacing(id, actor.targetX < actor.posX);
                setActorPose(id, 'walk1');
            } else {
                actor.movingToStation = false;
                actor.arrived = true;
                actor.posX = actor.targetX;
                actor.posY = targetY;
                actor.currentScale = targetScale;
                setActorFacing(id, false);
                setActorPose(id, actor.isHovered ? 'talk2' : 'idle');
                actor.el.style.transform = `translate3d(${actor.posX.toFixed(1)}px, ${actor.posY.toFixed(1)}px, 0) scale(${actor.currentScale.toFixed(3)})`;
            }
        });

        ensureStationDropLoopRunning();
    }

    function finishHoloButlerJourney() {
        if (!inPrologue) return;
        clearSynthHelloTimers();
        if (holoGlitchTimer) {
            clearTimeout(holoGlitchTimer);
            holoGlitchTimer = null;
        }
        if (crewWalkInOutroTimer) {
            clearTimeout(crewWalkInOutroTimer);
            crewWalkInOutroTimer = null;
        }
        if (crewWalkAlongsideRaf) {
            cancelAnimationFrame(crewWalkAlongsideRaf);
            crewWalkAlongsideRaf = null;
        }
        if (typeTimer) clearInterval(typeTimer);
        if (advanceTimer) clearTimeout(advanceTimer);
        if (owlWalkRaf) cancelAnimationFrame(owlWalkRaf);
        isTyping = false;
        isOwlWalking = false;
        stopOwlTalkAnim();
        stopCharacterTalkAnim();
        setSpeakingHighlight(null);

        if (TEASER_COMING_SOON_MODE) {
            // Keep Synth standing proudly in the center of the 3D Stage Diorama with "Coming Soon 11/14" above him!
            setOwlButlerPose('idle');
            stopHoloEmotionalScore(1.5);
            holoCanvasActive = false;
            if (holoCanvasRaf) {
                cancelAnimationFrame(holoCanvasRaf);
                holoCanvasRaf = null;
            }
            if (holoStage) {
                holoStage.classList.remove('dematerialize', 'pitch-black-opening', 'holo-stage-thunder-shake');
                holoStage.classList.add('active', 'outro-welcome-crew');
            }
            if (owlActorEl) {
                owlActorEl.classList.remove('pre-glitch-hidden', 'holo-beam-in', 'holo-beam-out', 'holo-glitch-in', 'walking-to-center');
                owlActorEl.classList.add('center-stage-coming-soon');
            }
            if (synthSteampunkComingSoonEl) {
                synthSteampunkComingSoonEl.classList.add('visible');
            }
            if (document.body) {
                document.body.classList.remove('holo-journey-active', 'holo-pitch-black', 'cinema-intro-active', 'syn-in-background');
                document.body.classList.add('diorama-reveal-active', 'coming-soon-finale-active');
            }
            if (heroContainer) {
                heroContainer.classList.remove('cinematic-center', 'cinema-reveal-stage');
            }
            shiftLogoOutOfWay();
            inPrologue = false;
            state = 'GREETING';
            sequenceComplete = true;
            sessionStorage.setItem('rc_intro_seen', '1');
            sessionStorage.setItem('rc_lofi_active', '1');
            if (skipIntroBtn) skipIntroBtn.classList.add('hidden');
            startSoftLofiMusic();
            return;
        }

        setOwlButlerPose('talk2');
        stopSynVoiceLine(false);
        playHoloButlerSfx('glitch_out');
        playHoloButlerSfx('sanctuary_chime');
        stopHoloEmotionalScore(1.5);

        if (owlActorEl) {
            owlActorEl.classList.remove('pre-glitch-hidden', 'holo-beam-in', 'holo-glitch-in');
            owlActorEl.classList.add('holo-beam-out');
        }
        if (holoStage) {
            holoStage.classList.remove('pitch-black-opening');
            holoStage.classList.add('dematerialize');
        }
        // Bring the RETROCANOPY logo & emblem right back to 100% brightness as Syn glitches away!
        if (document.body) {
            document.body.classList.remove('holo-journey-active', 'holo-pitch-black');
        }

        // Settle all 4 crew members into their Dynamic V-Formation Hero Stance on the pure black stage!
        repositionFriendsAfterSynExit();

        setTimeout(() => {
            holoCanvasActive = false;
            if (holoCanvasRaf) {
                cancelAnimationFrame(holoCanvasRaf);
                holoCanvasRaf = null;
            }
            if (holoStage) {
                holoStage.classList.remove('active', 'dematerialize', 'pitch-black-opening', 'outro-welcome-crew', 'sanctuary-living-backdrop');
            }
            inPrologue = false;
            state = 'GREETING';
            sequenceComplete = true;
            sessionStorage.setItem('rc_intro_seen', '1');
            sessionStorage.setItem('rc_lofi_active', '1');
            shiftLogoOutOfWay();
            if (skipIntroBtn) skipIntroBtn.classList.add('hidden');
            startSoftLofiMusic();
        }, 720);
    }

    function startCharacterTalkAnim(id, isPostThrow = false) {
        stopCharacterTalkAnim();
        if (id === 'james') {
            const jamesCycle = ['talk1Drink', 'talk2Drink', 'sip', 'talk1Drink'];
            let idx = 0;
            showJamesFrame(jamesCycle[0]);
            talkAnimTimer = setInterval(() => {
                idx = (idx + 1) % jamesCycle.length;
                showJamesFrame(jamesCycle[idx]);
            }, 390);
        } else if (isPostThrow) {
            const ravenPostCycle = ['talk2', 'talk1', 'talk2', 'idle'];
            let idx = 0;
            setActorPose('raven', ravenPostCycle[0]);
            setActorPose('darkjames', 'throw');
            talkAnimTimer = setInterval(() => {
                idx = (idx + 1) % ravenPostCycle.length;
                setActorPose('raven', ravenPostCycle[idx]);
                setActorPose('darkjames', idx % 2 === 0 ? 'throw' : 'talk2');
            }, 390);
        } else {
            // Use talk1 + idle for speaking so talk2 is reserved as each crew member's signature Mouse Hover Pose!
            const friendTalkCycle = ['talk1', 'idle', 'talk1', 'idle'];
            let idx = 0;
            const actor = crewActors[id];
            setActorPose(id, actor && actor.isHovered ? 'talk2' : friendTalkCycle[0]);
            talkAnimTimer = setInterval(() => {
                idx = (idx + 1) % friendTalkCycle.length;
                if (actor && actor.isHovered) {
                    setActorPose(id, 'talk2');
                } else {
                    setActorPose(id, friendTalkCycle[idx]);
                }
            }, 390);
        }
    }

    function stopCharacterTalkAnim() {
        if (talkAnimTimer) {
            clearInterval(talkAnimTimer);
            talkAnimTimer = null;
        }
        allActorsOrder.forEach((id) => {
            const actor = crewActors[id];
            if (id === 'james') {
                if (!jamesHasExited) showJamesFrame('sip');
            } else if (actor && actor.isHovered) {
                setActorPose(id, 'talk2');
            } else {
                setActorPose(id, 'idle');
            }
        });
    }

    function revealLinkFor(id) {
        if (id === 'james' || id === 'darkjames' || id === 'raven') return;
        const actor = crewActors[id];
        if (actor && actor.linkSlot) {
            actor.linkSlot.classList.add('revealed');
        }
    }

    function finishCurrentStepTyping() {
        if (typeTimer) {
            clearInterval(typeTimer);
            typeTimer = null;
        }
        isTyping = false;
        stopCharacterTalkAnim();
        stopOwlTalkAnim();

        const stepObj = inPrologue ? prologueSteps[currentPrologueIndex] : scriptSteps[currentStepIndex];
        if (!stepObj) return;

        if (inPrologue) {
            if (holoDialogueText) {
                holoDialogueText.textContent = stepObj.text;
            }
            setOwlButlerPose(stepObj.talkPose === 'talk2' ? 'talk2' : 'idle');
        } else if (dialogueText) {
            dialogueText.textContent = stepObj.text;
        }

        if (!inPrologue) {
            // Reveal this friend's link button right as they finish introducing themselves!
            revealLinkFor(stepObj.id);
        }

        if (sequenceComplete) {
            if (dialogueHint) dialogueHint.textContent = 'CLICK ANY GUIDE TO CHAT';
            return;
        }

        if (advanceTimer) clearTimeout(advanceTimer);
        advanceTimer = setTimeout(() => {
            advanceToNextStep();
        }, stepObj.holdMs || 1800);
    }

    function advanceToNextStep(isManualSkip = false) {
        if (advanceTimer) {
            clearTimeout(advanceTimer);
            advanceTimer = null;
        }

        if (inPrologue) {
            const nextPrologueIdx = currentPrologueIndex + 1;
            if (nextPrologueIdx < prologueSteps.length) {
                playPrologueStep(nextPrologueIdx, isManualSkip);
            } else {
                finishHoloButlerJourney();
            }
            return;
        }

        const nextIdx = currentStepIndex + 1;
        if (nextIdx < scriptSteps.length) {
            playScriptStep(nextIdx);
        } else {
            // All introductions finished — mark intro seen & start soft Lofi study music in the background!
            sequenceComplete = true;
            sessionStorage.setItem('rc_intro_seen', '1');
            sessionStorage.setItem('rc_lofi_active', '1');
            setSpeakingHighlight(null);
            if (skipIntroBtn) skipIntroBtn.classList.add('hidden');
            if (dialogueHint) dialogueHint.textContent = 'CLICK ANY GUIDE TO CHAT';
            startSoftLofiMusic();
            setTimeout(() => {
                if (sequenceComplete && dialogue) {
                    dialogue.classList.remove('show');
                }
            }, 3200);
        }
    }

    function playPrologueStep(index, isManualSkip = false) {
        clearSynthHelloTimers();
        if (holoGlitchTimer) {
            clearTimeout(holoGlitchTimer);
            holoGlitchTimer = null;
        }
        if (document.body) {
            document.body.classList.remove('holo-pitch-black');
        }
        if (holoStage) {
            holoStage.classList.remove('pitch-black-opening');
        }
        if (!holoCanvasActive) {
            holoCanvasActive = true;
            if (holoCanvasRaf) cancelAnimationFrame(holoCanvasRaf);
            holoCanvasRaf = requestAnimationFrame(renderHoloEraCanvas);
        }
        if (typeTimer) clearInterval(typeTimer);
        if (advanceTimer) clearTimeout(advanceTimer);

        currentPrologueIndex = index;
        const stepObj = prologueSteps[index];
        if (!stepObj) return;

        targetHoloEra = stepObj.eraIndex;
        if (holoStage) {
            holoStage.setAttribute('data-mood', stepObj.mood || 'nostalgia');
        }
        updateHoloEraPills(stepObj.eraIndex);
        triggerHoloSceneChord(stepObj.eraIndex);

        if (owlPoseCueTimer) {
            clearTimeout(owlPoseCueTimer);
            owlPoseCueTimer = null;
        }

        // Keep Syn stationary in his fixed spot with expressive front-facing pose for each act
        anchorStationaryOwlSpot();
        setOwlButlerPose(stepObj.talkPose || 'idle');

        if (owlActorEl) {
            owlActorEl.classList.remove('pre-glitch-hidden', 'holo-glitch-in');
        }

        // Dramatic visual & audio punctuation for each Act transition
        if (stepObj.eraIndex === 0) {
            triggerHoloDramaticFlash('flash-projector-ignite');
        } else if (stepObj.eraIndex === 4) {
            // Scene 4: The Shift — Thunderclap, power-grid blackout flash & camera shake into the pouring rain!
            triggerHoloDramaticFlash('flash-thunder-blackout');
            playHoloButlerSfx('thunder_shift');
            if (holoStage) {
                holoStage.classList.remove('holo-stage-thunder-shake');
                void holoStage.offsetWidth;
                holoStage.classList.add('holo-stage-thunder-shake');
            }
            if (sabotageScreenFlash) {
                sabotageScreenFlash.classList.remove('active');
                void sabotageScreenFlash.offsetWidth;
                sabotageScreenFlash.classList.add('active');
            }
        } else if (stepObj.eraIndex === 6) {
            // Scene 6: The Spark — Warm golden sunrise shockwave banishing the rain & static!
            triggerHoloDramaticFlash('flash-golden-sunrise');
            playHoloButlerSfx('sanctuary_chime');
        } else if (stepObj.eraIndex === 7) {
            // Scene 7 ("So we built a sanctuary to keep the soul of it alive. Welcome home to Retrocanopy. You are never alone here."):
            // Start with arm down, then right as Synth says "Welcome home to Retrocanopy" (3.40s into Scene 7), extend his arm out to welcome people!
            triggerHoloDramaticFlash('flash-golden-sunrise');
            playHoloButlerSfx('sanctuary_chime');
            setOwlButlerPose('idle');
            owlPoseCueTimer = setTimeout(() => {
                if (inPrologue && currentPrologueIndex === 7) {
                    setOwlButlerPose('talk2');
                }
            }, 3400);
        } else if (stepObj.eraIndex === 8) {
            hideActionBackdropFlash();
            if (holoStage) {
                holoStage.classList.add('outro-welcome-crew');
            }
            if (document.body) {
                document.body.classList.remove('holo-journey-active', 'cinema-intro-active', 'holo-pitch-black');
                document.body.classList.add('diorama-reveal-active');
            }
            stopCharacterTalkAnim();
            setSpeakingHighlight(null);
            playHoloButlerSfx('sanctuary_chime');

            if (TEASER_COMING_SOON_MODE) {
                // TEASER COMING SOON 11/14 FINALE:
                // 1) Fade in the 3D Stage Diorama & brighten the top RETROCANOPY logo
                // 2) Walk Synth smoothly from the left side to the dead center of the stage (0.00s .. 1.15s)
                // 3) At 1.15s (when he reaches center & says "Coming soon... 11/14"), open his welcoming arm
                //    and reveal the Fancy Steampunk "Coming Soon 11/14" sign above him!
                if (document.body) {
                    document.body.classList.add('coming-soon-finale-active');
                }
                if (heroContainer) {
                    heroContainer.classList.remove('cinematic-center', 'cinema-reveal-stage');
                }
                shiftLogoOutOfWay();
                setOwlButlerPose('idle');
                if (owlActorEl) {
                    owlActorEl.classList.add('center-stage-coming-soon', 'walking-to-center');
                }
                owlPoseCueTimer = setTimeout(() => {
                    if (owlActorEl) {
                        owlActorEl.classList.remove('walking-to-center');
                    }
                    setOwlButlerPose('talk2');
                    if (synthSteampunkComingSoonEl) {
                        synthSteampunkComingSoonEl.classList.add('visible');
                    }
                    playHoloButlerSfx('sanctuary_chime');
                    setTimeout(() => {
                        setOwlButlerPose('idle');
                    }, 3200);
                }, 1150);
            } else {
                // Full Crew Intro Mode (Scene 8):
                // Keep his welcoming arm out during the first two sentences, then put his arm down right when he tells everyone to come on out (6.60s)!
                setOwlButlerPose('talk2');
                owlPoseCueTimer = setTimeout(() => {
                    if (inPrologue && currentPrologueIndex === 8) {
                        setOwlButlerPose('idle');
                    }
                }, 6600);

                if (crewWalkInOutroTimer) clearTimeout(crewWalkInOutroTimer);
                crewWalkInOutroTimer = setTimeout(() => {
                    if (inPrologue && !sequenceComplete) {
                        walkInCrewAlongsideSyn(false);
                    }
                }, 1800);
            }
        } else if (stepObj.eraIndex >= 9) {
            // Scenes 9..12: Arm stays down on his cane while he introduces Chloe, CAB-84, Akari, and Grizz!
            setOwlButlerPose('idle');
            if (crewWalkInOutroTimer) {
                clearTimeout(crewWalkInOutroTimer);
                crewWalkInOutroTimer = null;
            }
            if (turntableFinaleSpinTimer) {
                clearTimeout(turntableFinaleSpinTimer);
                turntableFinaleSpinTimer = null;
            }
            walkInCrewAlongsideSyn(true);
            if (holoStage) {
                holoStage.classList.add('outro-welcome-crew');
            }
            if (document.body) {
                document.body.classList.remove('holo-journey-active', 'cinema-intro-active', 'holo-pitch-black');
                document.body.classList.add('diorama-reveal-active');
            }
            if (stepObj.crewId) {
                rotateTurntableToCrewMember(stepObj.crewId, false);
                setSpeakingHighlight(stepObj.crewId);
                startCharacterTalkAnim(stepObj.crewId);
                revealLinkFor(stepObj.crewId);
            }
            if (stepObj.eraIndex === 12) {
                // Fade out Grizz's Action Backdrop Flash during Syn's closing farewell
                turntableFinaleSpinTimer = setTimeout(() => {
                    if (inPrologue) {
                        hideActionBackdropFlash();
                        playHoloButlerSfx('turntable_rotate');
                    }
                }, 9600);
            }
        }

        if (stepObj.eraIndex < 8) {
            hideActionBackdropFlash();
            if (holoStage) {
                holoStage.classList.remove('outro-welcome-crew');
            }
            if (document.body) {
                document.body.classList.remove('diorama-reveal-active');
                document.body.classList.add('holo-journey-active');
            }
        }

        playSynVoiceLine(index, isManualSkip);

        if (advanceTimer) clearTimeout(advanceTimer);
        advanceTimer = setTimeout(() => {
            advanceToNextStep(false);
        }, stepObj.holdMs || 8000);
    }

    if (holoStage) {
        holoStage.addEventListener('click', (e) => {
            if (!inPrologue) return;
            if (e.target && e.target.closest('#skip-intro-btn')) return;
            advanceToNextStep(true);
        });
    }

    function playScriptStep(index) {
        if (typeTimer) clearInterval(typeTimer);
        if (advanceTimer) clearTimeout(advanceTimer);

        currentStepIndex = index;
        const stepObj = scriptSteps[index];
        if (!stepObj) return;

        positionDialogueAbove(stepObj.id);
        setSpeakingHighlight(stepObj.id);

        if (dialogueSpeaker) dialogueSpeaker.textContent = stepObj.speaker;
        if (dialogueText) dialogueText.textContent = '';
        if (dialogueHint) {
            dialogueHint.textContent = sequenceComplete ? 'CLICK ANY GUIDE TO CHAT' : 'NEXT \u25B6';
        }
        if (dialogue) dialogue.classList.add('show');

        let charIdx = 0;
        isTyping = true;
        startCharacterTalkAnim(stepObj.id);

        typeTimer = setInterval(() => {
            charIdx++;
            if (dialogueText) {
                dialogueText.textContent = stepObj.text.slice(0, charIdx);
            }
            const curChar = stepObj.text[charIdx - 1];
            playDialogueCharTick(curChar, charIdx);
            if (charIdx >= stepObj.text.length) {
                finishCurrentStepTyping();
            }
        }, 35);
    }

    function skipEntireIntro() {
        clearSynthHelloTimers();
        if (typeTimer) clearInterval(typeTimer);
        if (advanceTimer) clearTimeout(advanceTimer);
        if (introTransitionTimer) {
            clearTimeout(introTransitionTimer);
            introTransitionTimer = null;
        }
        if (introCraneTimer) {
            clearTimeout(introCraneTimer);
            introCraneTimer = null;
        }
        isTyping = false;
        inPrologue = false;
        isThrowingAtO = false;
        sequenceComplete = true;
        jamesHasExited = true;
        isTransitioningExit = false;

        if (prebuiltIntroAudio) {
            try {
                prebuiltIntroAudio.pause();
                prebuiltIntroAudio.currentTime = 0;
            } catch (_) {}
        }
        if (nativeIntroAudioActive) {
            nativeIntroAudioActive = false;
            triggerNativeServerAudio('stop_syn');
        }
        if (introGain && lofiCtx && lofiCtx.state === 'running') {
            try {
                introGain.gain.cancelScheduledValues(lofiCtx.currentTime);
                introGain.gain.setValueAtTime(0.0001, lofiCtx.currentTime);
            } catch (_) {}
        }

        sessionStorage.setItem('rc_intro_seen', '1');
        sessionStorage.setItem('rc_lofi_active', '1');

        triggerOSabotageEffect(false);
        if (holoGlitchTimer) {
            clearTimeout(holoGlitchTimer);
            holoGlitchTimer = null;
        }
        if (crewWalkInOutroTimer) {
            clearTimeout(crewWalkInOutroTimer);
            crewWalkInOutroTimer = null;
        }
        if (crewWalkAlongsideRaf) {
            cancelAnimationFrame(crewWalkAlongsideRaf);
            crewWalkAlongsideRaf = null;
        }
        if (turntableFinaleSpinTimer) {
            clearTimeout(turntableFinaleSpinTimer);
            turntableFinaleSpinTimer = null;
        }
        turntableActive = false;
        hideActionBackdropFlash();
        stopOwlTalkAnim();
        stopCharacterTalkAnim();
        stopSynVoiceLine(false);
        stopHoloEmotionalScore(0.15);
        if (document.body) {
            document.body.classList.remove('holo-journey-active', 'holo-pitch-black');
        }
        if (owlWalkRaf) {
            cancelAnimationFrame(owlWalkRaf);
            owlWalkRaf = null;
        }
        holoCanvasActive = false;
        if (holoCanvasRaf) {
            cancelAnimationFrame(holoCanvasRaf);
            holoCanvasRaf = null;
        }
        if (villainProjectile) {
            villainProjectile.style.opacity = '0';
        }

        if (TEASER_COMING_SOON_MODE) {
            // Jump directly to the Center-Stage Synth "Coming Soon 11/14" Finale on the 3D Stage Diorama!
            if (holoStage) {
                holoStage.classList.remove('dematerialize', 'pitch-black-opening', 'holo-stage-thunder-shake');
                holoStage.classList.add('active', 'outro-welcome-crew');
            }
            if (owlActorEl) {
                owlActorEl.classList.remove('pre-glitch-hidden', 'holo-beam-in', 'holo-beam-out', 'holo-glitch-in', 'walking-to-center');
                owlActorEl.classList.add('center-stage-coming-soon');
            }
            setOwlButlerPose('talk2');
            if (synthSteampunkComingSoonEl) {
                synthSteampunkComingSoonEl.classList.add('visible');
            }
            if (document.body) {
                document.body.classList.remove('cinema-intro-active', 'holo-journey-active', 'holo-pitch-black', 'syn-in-background');
                document.body.classList.add('diorama-reveal-active', 'coming-soon-finale-active');
            }
            if (heroContainer) {
                heroContainer.classList.remove('cinematic-center', 'cinema-reveal-stage');
            }
            shiftLogoOutOfWay();
            setSpeakingHighlight(null);
            if (dialogue) dialogue.classList.remove('show');
            if (skipIntroBtn) skipIntroBtn.classList.add('hidden');
            startSoftLofiMusic();
            // Play Synth's "Coming soon... 11/14" voice line when skipping straight to the finale
            if (synVoicePool[8]) {
                try {
                    synVoicePool[8].currentTime = 0;
                    synVoicePool[8].volume = 1.0;
                    synVoicePool[8].play().catch(() => {});
                } catch (_) {}
            }
            setTimeout(() => {
                setOwlButlerPose('idle');
            }, 3200);
            return;
        }

        if (holoStage) {
            holoStage.classList.remove('active', 'dematerialize', 'pitch-black-opening', 'outro-welcome-crew', 'sanctuary-living-backdrop');
        }
        if (owlActorEl) {
            owlActorEl.classList.remove('pre-glitch-hidden', 'holo-beam-in', 'holo-beam-out', 'holo-glitch-in');
        }

        computeTargetPositions(true, false);
        if (stage) {
            stage.classList.add('syn-exited');
        }
        if (document.body) {
            document.body.classList.add('syn-in-background');
        }
        if (crewActors.james) {
            crewActors.james.arrived = true;
            crewActors.james.posX = window.innerWidth + 220;
            crewActors.james.el.style.transform = `translate3d(${crewActors.james.posX}px, 0, 0)`;
            crewActors.james.el.style.opacity = '0';
            crewActors.james.el.style.pointerEvents = 'none';
        }
        friendsOnlyOrder.forEach((id) => {
            const actor = crewActors[id];
            if (!actor) return;
            actor.movingToStation = false;
            actor.arrived = true;
            actor.posX = actor.targetX;
            actor.posY = actor.targetY || 0;
            actor.currentScale = actor.targetScale || 1;
            actor.el.style.opacity = '1';
            actor.el.style.pointerEvents = 'auto';
            actor.el.style.zIndex = String(actor.targetZIndex || '');
            actor.el.style.filter = '';
            actor.el.style.transform = `translate3d(${actor.posX}px, ${actor.posY}px, 0) scale(${actor.currentScale})`;
            setActorFacing(id, false);
            setActorPose(id, 'idle');
            revealLinkFor(id);
        });

        if (document.body) {
            document.body.classList.remove('cinema-intro-active', 'holo-journey-active');
            document.body.classList.add('syn-in-background');
        }
        if (heroContainer) {
            heroContainer.classList.remove('cinematic-center', 'cinema-reveal-stage');
        }
        shiftLogoOutOfWay();
        setSpeakingHighlight(null);
        if (dialogue) dialogue.classList.remove('show');
        if (skipIntroBtn) skipIntroBtn.classList.add('hidden');
        startSoftLofiMusic();
    }

    if (skipIntroBtn) {
        skipIntroBtn.addEventListener('click', skipEntireIntro);
    }

    if (owlActorEl) {
        owlActorEl.addEventListener('click', (e) => {
            if (!sequenceComplete || !TEASER_COMING_SOON_MODE) return;
            e.stopPropagation();
            setOwlButlerPose('talk2');
            if (synVoicePool[8]) {
                try {
                    synVoicePool[8].currentTime = 0;
                    synVoicePool[8].volume = 1.0;
                    synVoicePool[8].play().catch(() => {});
                } catch (_) {}
            }
            setTimeout(() => {
                setOwlButlerPose('idle');
            }, 3200);
        });
    }

    // Seamless Subpage Viewport so Lofi music NEVER stops when navigating to Shop, Arcade, Culture, Creators, or back Home!
    window.__rcLofiHostActive = true;
    let subpageFrame = null;

    function openSeamlessSubpage(url, pushHistory = true) {
        sessionStorage.setItem('rc_intro_seen', '1');
        sessionStorage.setItem('rc_from_internal', '1');
        sessionStorage.setItem('rc_lofi_active', '1');
        sessionStorage.removeItem('rc_shop_bag_count');
        if (!sequenceComplete) {
            if (heroContainer) heroContainer.classList.add('no-transition');
            skipEntireIntro();
        } else {
            startSoftLofiMusic();
        }

        if (document.body) {
            document.body.classList.add('subpage-open');
        }

        if (!subpageFrame) {
            subpageFrame = document.createElement('iframe');
            subpageFrame.id = 'rc-subpage-frame';
            subpageFrame.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;border:none;z-index:1180;background:#000000;opacity:0;transition:opacity 0.22s ease;';
            document.body.appendChild(subpageFrame);
        }
        subpageFrame.style.display = 'block';
        subpageFrame.style.pointerEvents = 'auto';
        subpageFrame.src = url;
        requestAnimationFrame(() => {
            if (subpageFrame) subpageFrame.style.opacity = '1';
        });
        if (pushHistory && window.history && window.history.pushState) {
            window.history.pushState({ subpage: url }, '', url);
        }
    }

    window.__rcCloseSubpage = function (pushHistory = true) {
        sessionStorage.setItem('rc_from_internal', '1');
        if (document.body) {
            document.body.classList.remove('subpage-open');
        }
        if (subpageFrame) {
            subpageFrame.style.opacity = '0';
            subpageFrame.style.pointerEvents = 'none';
            setTimeout(() => {
                if (subpageFrame && subpageFrame.style.opacity === '0') {
                    subpageFrame.style.display = 'none';
                }
            }, 220);
        }
        if (pushHistory && window.history && window.history.pushState) {
            window.history.pushState({ subpage: null }, '', 'index.html');
        }
        // Recalculate crew positions in case window resized while inside Shop
        computeTargetPositions(true);
        friendsOnlyOrder.forEach((id) => {
            const actor = crewActors[id];
            if (actor) {
                actor.posX = actor.targetX;
                actor.posY = actor.targetY || 0;
                actor.currentScale = actor.targetScale || 1;
                actor.el.style.transform = `translate3d(${actor.posX}px, ${actor.posY}px, 0) scale(${actor.currentScale})`;
            }
        });
    };

    window.addEventListener('popstate', (e) => {
        if (subpageFrame && subpageFrame.style.display !== 'none') {
            try {
                if (
                    subpageFrame.contentWindow &&
                    typeof subpageFrame.contentWindow.__rcShouldInterceptExitToHome === 'function' &&
                    subpageFrame.contentWindow.__rcShouldInterceptExitToHome()
                ) {
                    const activeSubUrl = (subpageFrame.contentWindow.location.pathname || '').split('/').pop() || 'hat_preview.html';
                    if (window.history && window.history.pushState) {
                        window.history.pushState({ subpage: activeSubUrl }, '', activeSubUrl);
                    }
                    subpageFrame.contentWindow.__rcTriggerUpsetCutscene(() => {
                        window.__rcCloseSubpage(true);
                    });
                    return;
                }
            } catch (_) {}
            window.__rcCloseSubpage(false);
            return;
        }
        if (e.state && e.state.subpage) {
            openSeamlessSubpage(e.state.subpage, false);
        }
    });

    // Intercept clicks on the 4 character guide links so Lofi music plays continuously without page-unload interruption
    document.querySelectorAll('.tutorial-choice-btn').forEach((linkEl) => {
        linkEl.addEventListener('click', (e) => {
            const href = linkEl.getAttribute('href');
            if (!href) return;
            e.preventDefault();
            openSeamlessSubpage(href, true);
        });
    });

    if (dialogue) {
        dialogue.addEventListener('click', () => {
            if (isTyping) {
                finishCurrentStepTyping();
            } else if (!sequenceComplete) {
                advanceToNextStep();
            } else {
                dialogue.classList.remove('show');
                setSpeakingHighlight(null);
            }
        });
    }

    // Allow clicking any character after intro to hear their line, and switch to their signature role pose on mouse hover!
    crewOrder.forEach((id) => {
        const actor = crewActors[id];
        if (!actor || !actor.el) return;

        actor.el.addEventListener('mouseenter', () => {
            if (!actor.arrived || isTransitioningExit) return;
            actor.isHovered = true;
            actor.el.classList.add('hovered');
            if (id !== 'james') {
                setActorPose(id, 'talk2');
                triggerJiggleImpulse(id, (Math.random() - 0.5) * 65, -110);
            }
        });

        actor.el.addEventListener('mouseleave', () => {
            actor.isHovered = false;
            actor.el.classList.remove('hovered');
            if (!actor.arrived || isTransitioningExit) return;
            const activeStep = !inPrologue && isTyping ? scriptSteps[currentStepIndex] : null;
            if (!activeStep || activeStep.id !== id) {
                setActorPose(id, id === 'james' ? 'sip' : 'idle');
                triggerJiggleImpulse(id, (Math.random() - 0.5) * 35, -55);
            }
        });

        actor.el.addEventListener('click', (e) => {
            if (e.target.closest('a')) return; // let link clicks navigate naturally
            triggerJiggleImpulse(id, (Math.random() - 0.5) * 85, -145);
            if (!sequenceComplete) return;
            const stepIndex = scriptSteps.findIndex((s) => s.id === id);
            if (stepIndex !== -1) {
                playScriptStep(stepIndex);
            }
        });
    });

    const jamesWalkCycle = ['walk1', 'walk2', 'exit', 'walk2'];
    const friendWalkCycle = ['walk1', 'walk2', 'walk3', 'walk2'];
    let stepTimer = 0;
    const STEP_DURATION = 165;
    const WALK_SPEED = Math.max(175, Math.min(225, window.innerWidth * 0.145));
    const VILLAIN_WALK_SPEED = Math.max(210, Math.min(275, window.innerWidth * 0.18));
    let lastTime = null;
    state = 'LOGO_ZOOM_OUT';

    // Detect browser Reload vs. Returning to Home from another internal page:
    // - Reloading the site (F5 / Ctrl+R) ALWAYS triggers the full intro animation!
    // - Going back to the Home page from inside the site skips the intro!
    const navEntries = (window.performance && performance.getEntriesByType) ? performance.getEntriesByType('navigation') : [];
    const navType = navEntries.length > 0 ? navEntries[0].type : ((window.performance && performance.navigation && performance.navigation.type === 1) ? 'reload' : 'navigate');
    const isReload = navType === 'reload';
    const isBackForward = navType === 'back_forward';
    const cameFromInternalPage = !isReload && (
        sessionStorage.getItem('rc_from_internal') === '1' ||
        isBackForward ||
        (document.referrer && document.referrer.indexOf(window.location.host) !== -1 && document.referrer.indexOf('index.html') === -1)
    );

    if (isReload) {
        sessionStorage.removeItem('rc_from_internal');
    } else if (cameFromInternalPage) {
        sessionStorage.removeItem('rc_from_internal');
        if (heroContainer) {
            heroContainer.classList.add('no-transition');
        }
        state = 'GREETING';
        skipEntireIntro();
        return;
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (heroContainer) {
            heroContainer.classList.add('no-transition');
        }
        state = 'GREETING';
        skipEntireIntro();
        return;
    }

    // Fresh Movie Studio Intro: Start with widescreen cinema letterbox + 3D emblem & RETROCANOPY title reveal in center,
    // then crane/zoom out to top of screen before the character story arc begins!
    if (document.body) {
        document.body.classList.add('cinema-intro-active');
    }
    if (heroContainer) {
        heroContainer.classList.remove('shifted-up');
        heroContainer.classList.add('cinematic-center', 'cinema-reveal-stage');
    }

    computeTargetPositions();
    crewOrder.forEach((id, idx) => {
        const actor = crewActors[id];
        if (!actor) return;
        actor.arrived = false;
        // Guarantee every single crew member starts 100% off-screen to the left (posX < -actor.width)
        actor.posX = -actor.width - 35 - (crewOrder.length - 1 - idx) * 95;
        actor.el.style.opacity = '0';
        actor.el.style.pointerEvents = 'none';
        actor.el.style.transform = `translate3d(${actor.posX}px, 0, 0)`;
        setActorPose(id, 'walk1');
    });

    window.addEventListener('resize', () => {
        if (inPrologue) {
            anchorStationaryOwlSpot();
            if (currentPrologueIndex >= 9) {
                computeTargetPositions(true, true);
                friendsOnlyOrder.forEach((id) => {
                    const actor = crewActors[id];
                    if (actor && actor.arrived) {
                        actor.posX = actor.targetX;
                        actor.posY = actor.targetY || 0;
                        actor.currentScale = actor.targetScale || 1;
                        actor.el.style.zIndex = String(actor.targetZIndex || '');
                        actor.el.style.transform = `translate3d(${actor.posX}px, ${actor.posY}px, 0) scale(${actor.currentScale})`;
                    }
                });
            }
            return;
        }
        computeTargetPositions(true);
        crewOrder.forEach((id) => {
            const actor = crewActors[id];
            if (actor && actor.arrived) {
                actor.posX = actor.targetX;
                actor.posY = actor.targetY || 0;
                actor.currentScale = actor.targetScale || 1;
                actor.el.style.zIndex = String(actor.targetZIndex || '');
                actor.el.style.transform = `translate3d(${actor.posX}px, ${actor.posY}px, 0) scale(${actor.currentScale})`;
            }
        });
        if (state === 'GREETING') {
            shiftLogoOutOfWay();
            const activeStep = scriptSteps[currentStepIndex];
            if (activeStep) positionDialogueAbove(activeStep.id);
        }
    });

    function startCrewWalkIn() {
        computeTargetPositions(false);
        const targetWalkSeconds = 2.65;
        crewOrder.forEach((id, idx) => {
            const actor = crewActors[id];
            if (!actor) return;
            actor.arrived = false;
            // Every single character starts completely off-screen left (posX <= -actor.width - 30) so nobody pops onto the stage!
            actor.posX = -actor.width - 30 - (crewOrder.length - 1 - idx) * 90;
            const dist = Math.max(180, actor.targetX - actor.posX);
            actor.walkInSpeed = dist / (targetWalkSeconds + idx * 0.06);
            actor.el.style.opacity = '1';
            actor.el.style.pointerEvents = 'auto';
            actor.el.style.transform = `translate3d(${actor.posX}px, 0, 0)`;
            setActorPose(id, 'walk1');
        });
        state = 'WALK_IN';
        stepTimer = 0;
        lastTime = performance.now();
        requestAnimationFrame(stepWalkIn);
    }

    function stepWalkIn(now) {
        if (!lastTime) lastTime = now;
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (state === 'WALK_IN') {
            stepTimer += dt * 1000;
            const advanceFrame = stepTimer >= STEP_DURATION;
            if (advanceFrame) stepTimer = 0;

            let allArrived = true;
            crewOrder.forEach((id) => {
                const actor = crewActors[id];
                if (!actor) return;
                if (!actor.arrived) {
                    const spd = actor.walkInSpeed || WALK_SPEED;
                    actor.posX += spd * dt;
                    if (actor.posX >= actor.targetX) {
                        actor.posX = actor.targetX;
                        actor.arrived = true;
                        if (id === 'james') {
                            showJamesFrame('sip');
                        } else {
                            setActorPose(id, actor.isHovered ? 'talk2' : 'idle');
                        }
                    } else {
                        allArrived = false;
                        if (advanceFrame) {
                            actor.walkFrame++;
                            if (id === 'james') {
                                showJamesFrame(jamesWalkCycle[actor.walkFrame % jamesWalkCycle.length]);
                            } else {
                                setActorPose(id, friendWalkCycle[actor.walkFrame % friendWalkCycle.length]);
                            }
                        }
                    }
                    actor.el.style.transform = `translate3d(${actor.posX.toFixed(1)}px, 0, 0)`;
                }
            });

            if (allArrived) {
                state = 'GREETING';
                shiftLogoOutOfWay();
                // James sips his drink and starts Step 0 (introducing the website & his friends!)
                setTimeout(() => {
                    playScriptStep(0);
                }, 350);
                return;
            }
            requestAnimationFrame(stepWalkIn);
        }
    }

    /**
     * Multi-Act Synthwave Cinema Studio Logo Score locked to the visual intro clock
     */
    function fadeIntroAudio() {
        if (introGain && lofiCtx && lofiCtx.state === 'running') {
            try {
                introGain.gain.cancelScheduledValues(lofiCtx.currentTime);
                introGain.gain.linearRampToValueAtTime(0.0001, lofiCtx.currentTime + 2.2);
            } catch (_) {}
        }
        if (prebuiltIntroAudio && !prebuiltIntroAudio.paused) {
            let fadeVol = prebuiltIntroAudio.volume;
            const fadeInterval = setInterval(() => {
                fadeVol = Math.max(0, fadeVol - 0.06);
                try {
                    prebuiltIntroAudio.volume = fadeVol;
                } catch (_) {}
                if (fadeVol <= 0) {
                    clearInterval(fadeInterval);
                    try { prebuiltIntroAudio.pause(); } catch (_) {}
                }
            }, 90);
        }
    }

    function scheduleIntroTransition(holdMs = 9800) {
        if (introTransitionScheduled || sequenceComplete) return;
        introTransitionScheduled = true;
        if (introTransitionTimer) clearTimeout(introTransitionTimer);
        if (introCraneTimer) clearTimeout(introCraneTimer);
        introTransitionTimer = setTimeout(() => {
            if (sequenceComplete) return;
            // Keep the title screen at the exact same full size on the exact same pure black background,
            // and simply fade it straight to black without shrinking or bringing the diorama background in!
            if (document.body) {
                document.body.classList.remove('intro-awaiting-audio');
                document.body.classList.add('holo-pitch-black', 'holo-journey-active');
            }
            if (heroContainer) {
                heroContainer.classList.add('title-fade-to-black');
            }
            fadeIntroAudio();

            // Once faded to pure black, launch Synth's cutscene and silently prepare the top logo position while hidden
            introCraneTimer = setTimeout(() => {
                if (sequenceComplete) return;
                if (document.body) {
                    document.body.classList.remove('cinema-intro-active');
                }
                if (heroContainer) {
                    heroContainer.classList.add('no-transition');
                    heroContainer.classList.remove('cinematic-center', 'title-fade-to-black');
                    shiftLogoOutOfWay();
                    requestAnimationFrame(() => {
                        if (heroContainer) heroContainer.classList.remove('no-transition');
                    });
                }
                triggerOSabotageEffect(false);
                startHoloButlerJourney();
            }, 1500);
        }, holdMs);
    }

    // Schedule the title screen progression immediately — no click required
    scheduleIntroTransition(9800);

    function playIntroAudio() {
        playCinemaStudioLogoSwell();
    }

    function playCinemaStudioLogoSwell() {
        if (sequenceComplete || state !== 'LOGO_ZOOM_OUT') return;

        // 1. Trigger HTML5 <audio> (assets/intro_theme.wav?v=36) automatically, with instant native Windows Audio fallback if browser reload policy blocks autoplay
        if (prebuiltIntroAudio && !introHtmlAudioStarted && !nativeIntroAudioActive) {
            try {
                prebuiltIntroAudio.muted = false;
                prebuiltIntroAudio.volume = 0.88;
                if (!prebuiltIntroAudio.paused && !prebuiltIntroAudio.muted) {
                    introHtmlAudioStarted = true;
                } else {
                    const elapsed = Math.min(9.0, Math.max(0, (performance.now() - introStartPerfNow) / 1000));
                    if (Math.abs(prebuiltIntroAudio.currentTime - elapsed) > 0.35) {
                        try { prebuiltIntroAudio.currentTime = elapsed; } catch (_) {}
                    }
                    const p = prebuiltIntroAudio.play();
                    if (p && typeof p.then === 'function') {
                        p.then(() => {
                            prebuiltIntroAudio.muted = false;
                            prebuiltIntroAudio.volume = 0.88;
                            introHtmlAudioStarted = true;
                        }).catch(() => {
                            // Browser blocked autoplay on reload -> immediately play assets/intro_theme.wav via native Windows Audio bridge with zero click needed!
                            if (!introHtmlAudioStarted && !nativeIntroAudioActive) {
                                nativeIntroAudioActive = true;
                                introHtmlAudioStarted = true;
                                triggerNativeServerAudio('intro');
                            }
                        });
                    }
                }
            } catch (_) {
                if (!nativeIntroAudioActive) {
                    nativeIntroAudioActive = true;
                    introHtmlAudioStarted = true;
                    triggerNativeServerAudio('intro');
                }
            }
        }

        // 2. Layer live Web Audio 4-Era Console Evolution Fanfare when AudioContext is running (and native fallback isn't already playing)
        const ctx = ensureLofiAudioContext();
        if (!ctx || ctx.state !== 'running') {
            if (ctx && ctx.state === 'suspended') {
                ctx.resume().then(() => {
                    if (!nativeIntroAudioActive) {
                        playIntroAudio();
                    }
                }).catch(() => {});
            }
            return;
        }

        if (nativeIntroAudioActive) return;
        if (cinemaSwellPlayed) return;
        cinemaSwellPlayed = true;

        const now = ctx.currentTime;
        const elapsedSec = Math.min(9.0, Math.max(0, (performance.now() - introStartPerfNow) / 1000));

        introGain = ctx.createGain();
        introGain.gain.setValueAtTime(0.72, now);
        introGain.connect(ctx.destination);

        // Era 1 (0.0s – 1.65s): 8-Bit NES Chiptune Square Arpeggio
        const arp8Notes = [220.0, 277.18, 329.63, 440.0, 329.63, 440.0, 554.37, 659.25, 440.0, 554.37, 659.25, 880.0];
        arp8Notes.forEach((freq, idx) => {
            const noteStartAbs = idx * 0.13;
            if (noteStartAbs + 0.12 <= elapsedSec) return;
            const st = now + Math.max(0, noteStartAbs - elapsedSec);
            const dur = 0.12;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, st);
            g.gain.setValueAtTime(0.0001, st);
            g.gain.linearRampToValueAtTime(0.085, st + 0.015);
            g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
            osc.connect(g);
            g.connect(introGain);
            osc.start(st);
            osc.stop(st + dur + 0.02);
        });

        // Era 2 (1.50s – 3.15s): 16-Bit SNES/Genesis Warm FM Synth Chord & Lead
        if (elapsedSec < 3.1) {
            const st16 = now + Math.max(0, 1.50 - elapsedSec);
            const dur16 = Math.max(0.3, 3.15 - Math.max(1.50, elapsedSec));
            [110.0, 220.0, 329.63, 415.30, 554.37].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const flt = ctx.createBiquadFilter();
                const g = ctx.createGain();
                osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
                osc.frequency.setValueAtTime(freq, st16);
                flt.type = 'lowpass';
                flt.frequency.setValueAtTime(1400, st16);
                g.gain.setValueAtTime(0.0001, st16);
                g.gain.linearRampToValueAtTime(0.065 / (1 + idx * 0.15), st16 + 0.18);
                g.gain.exponentialRampToValueAtTime(0.0001, st16 + dur16);
                osc.connect(flt);
                flt.connect(g);
                g.connect(introGain);
                osc.start(st16);
                osc.stop(st16 + dur16 + 0.04);
            });
        }

        // Era 3 (2.95s – 4.80s): 32-Bit / 64-Bit Arcade Poly-Synth Filter Sweep
        if (elapsedSec < 4.75) {
            const st32 = now + Math.max(0, 2.95 - elapsedSec);
            const dur32 = Math.max(0.3, 4.80 - Math.max(2.95, elapsedSec));
            [146.83, 220.0, 277.18, 369.99, 440.0, 659.25].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const flt = ctx.createBiquadFilter();
                const g = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq * 0.994, st32);
                osc.frequency.exponentialRampToValueAtTime(freq, st32 + dur32 * 0.6);
                flt.type = 'lowpass';
                flt.frequency.setValueAtTime(480, st32);
                flt.frequency.exponentialRampToValueAtTime(2800, st32 + dur32 * 0.85);
                g.gain.setValueAtTime(0.0001, st32);
                g.gain.linearRampToValueAtTime(0.075 / (1 + idx * 0.16), st32 + 0.25);
                g.gain.exponentialRampToValueAtTime(0.0001, st32 + dur32);
                osc.connect(flt);
                flt.connect(g);
                g.connect(introGain);
                osc.start(st32);
                osc.stop(st32 + dur32 + 0.05);
            });
        }

        // Era 4 (4.60s – 9.60s): Full HD Final Tree & RETROCANOPY Cinema Fanfare + Bell Cascade
        const stHD = now + Math.max(0, 4.60 - elapsedSec);
        const durHD = Math.max(1.2, 9.60 - Math.max(4.60, elapsedSec));

        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(55, stHD);
        subOsc.frequency.exponentialRampToValueAtTime(55, stHD + durHD);
        subGain.gain.setValueAtTime(0.0001, stHD);
        subGain.gain.linearRampToValueAtTime(0.26, stHD + 0.35);
        subGain.gain.exponentialRampToValueAtTime(0.0001, stHD + durHD);
        subOsc.connect(subGain);
        subGain.connect(introGain);
        subOsc.start(stHD);
        subOsc.stop(stHD + durHD + 0.05);

        [110, 164.81, 220, 277.18, 329.63, 440, 554.37, 659.25].forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            osc.type = idx < 4 ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(f * 0.992, stHD);
            osc.frequency.exponentialRampToValueAtTime(f, stHD + 0.6);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(520, stHD);
            filter.frequency.exponentialRampToValueAtTime(3200, stHD + 1.2);
            filter.frequency.exponentialRampToValueAtTime(680, stHD + durHD);
            gain.gain.setValueAtTime(0.0001, stHD);
            gain.gain.linearRampToValueAtTime(0.095 / (1 + idx * 0.18), stHD + 0.55);
            gain.gain.exponentialRampToValueAtTime(0.0001, stHD + durHD);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(introGain);
            osc.start(stHD);
            osc.stop(stHD + durHD + 0.08);
        });

        // Crystalline Bell Cascade as the final HD tree locks in and RETROCANOPY + Tagline appear
        [554.37, 659.25, 880, 1108.73, 1318.51].forEach((hiFreq, idx) => {
            const bellAbs = 4.75 + idx * 0.18;
            if (bellAbs + 1.5 <= elapsedSec) return;
            const bst = now + Math.max(0, bellAbs - elapsedSec);
            const sOsc = ctx.createOscillator();
            const sGain = ctx.createGain();
            sOsc.type = 'sine';
            sOsc.frequency.setValueAtTime(hiFreq, bst);
            sGain.gain.setValueAtTime(0.0001, bst);
            sGain.gain.linearRampToValueAtTime(0.065 / (1 + idx * 0.18), bst + 0.04);
            sGain.gain.exponentialRampToValueAtTime(0.0001, bst + 2.4);
            sOsc.connect(sGain);
            sGain.connect(introGain);
            sOsc.start(bst);
            sOsc.stop(bst + 2.45);
        });
    }

    /**
     * In-Page Title Screen Replay on F5 / Ctrl+R:
     * Since the keydown event is a trusted user gesture inside the live document,
     * replaying the Title Screen in-page guarantees 100% immediate unmuted audio on every refresh!
     */
    function replayTitleScreenFromStart() {
        try {
            if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
            if (introTransitionTimer) { clearTimeout(introTransitionTimer); introTransitionTimer = null; }
            if (introCraneTimer) { clearTimeout(introCraneTimer); introCraneTimer = null; }
            stopCharacterTalkAnim();

            sequenceComplete = false;
            isThrowingAtO = false;
            isRepairingO = false;
            isTyping = false;
            if (nativeIntroAudioActive || nativeLofiAudioActive) {
                nativeIntroAudioActive = false;
                nativeLofiAudioActive = false;
                triggerNativeServerAudio('stop');
            }
            cinemaSwellPlayed = false;
            introHtmlAudioStarted = false;
            introTransitionScheduled = false;
            state = 'LOGO_ZOOM_OUT';
            introStartPerfNow = performance.now();

            // Silence Lofi while Title Screen plays from the beginning
            if (lofiFallbackAudio && !lofiFallbackAudio.paused) {
                try { lofiFallbackAudio.pause(); lofiFallbackAudio.currentTime = 0; } catch (_) {}
            }
            if (lofiMasterGain && lofiCtx && lofiCtx.state === 'running') {
                try {
                    lofiMasterGain.gain.cancelScheduledValues(lofiCtx.currentTime);
                    lofiMasterGain.gain.setValueAtTime(0.0001, lofiCtx.currentTime);
                } catch (_) {}
            }
            isLofiPlaying = false;
            lofiStarted = false;
            if (lofiLoopTimer) { clearInterval(lofiLoopTimer); lofiLoopTimer = null; }
            if (lofiMusicBtn) lofiMusicBtn.classList.remove('visible', 'playing');

            // Reset dialogue & actors back off-stage left
            if (dialogue) dialogue.classList.remove('show');
            if (skipBtn) skipBtn.classList.remove('hidden');
            if (flickerO) {
                flickerO.classList.remove('sabotaged', 'impact-flash', 'repair-flash');
                flickerO.classList.add('repaired-solid');
            }
            Object.keys(actors).forEach((id) => {
                const a = actors[id];
                if (!a || !a.el) return;
                a.x = -520;
                a.el.style.left = '-520px';
                a.el.style.opacity = '0';
                a.el.classList.remove('visible', 'speaking-focus', 'speaking-dim', 'walking', 'facing-left');
            });

            // Restart CSS Title Screen animations from 0.0s
            if (document.body) {
                document.body.classList.remove('intro-awaiting-audio', 'syn-in-background', 'holo-pitch-black', 'holo-journey-active');
                document.body.classList.add('cinema-intro-active');
            }
            if (heroContainer) {
                heroContainer.classList.remove('logo-shifted-up', 'post-intro-layout', 'shifted-up', 'title-fade-to-black');
                heroContainer.classList.add('intro-anim-reset', 'cinematic-center', 'cinema-reveal-stage');
                void heroContainer.offsetWidth; // Force reflow so CSS keyframe animations restart cleanly at 0.0s
                heroContainer.classList.remove('intro-anim-reset');
            }

            // Immediately start Title Screen audio from 0.0s inside the trusted keydown gesture!
            if (prebuiltIntroAudio) {
                try {
                    prebuiltIntroAudio.pause();
                    prebuiltIntroAudio.muted = false;
                    prebuiltIntroAudio.volume = 0.88;
                    prebuiltIntroAudio.currentTime = 0;
                } catch (_) {}
            }
            const ctx = ensureLofiAudioContext();
            if (ctx && ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }
            scheduleIntroTransition(9800);
            playCinemaStudioLogoSwell();
        } catch (_) {}
    }

    window.addEventListener('keydown', (e) => {
        const isF5 = (e.key === 'F5' || e.code === 'F5');
        const isCtrlR = ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'r' || e.key === 'R'));
        if (isF5 || isCtrlR) {
            e.preventDefault();
            replayTitleScreenFromStart();
        }
    }, { capture: true });

    playCinemaStudioLogoSwell();
}

/**
 * Persistent Lofi Background Music on Subpages (Arcade, Culture, Creators, Organizations)
 */
function initSubpageLofiMusic() {
    if (document.getElementById('crew-stage')) return; // Handled by initGamerIntro on index.html

    sessionStorage.setItem('rc_from_internal', '1');
    sessionStorage.setItem('rc_intro_seen', '1');

    // If running inside the seamless parent Lofi host on index.html, parent audio is already playing continuously!
    try {
        if (window.parent && window.parent !== window && window.parent.__rcLofiHostActive) {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href]');
                if (!link) return;
                const href = link.getAttribute('href') || '';
                if (href === 'index.html' || href.endsWith('/index.html')) {
                    e.preventDefault();
                    window.parent.__rcCloseSubpage(true);
                }
            });
            return;
        }
    } catch (_) {}

    const subKhTracks = [
        { title: 'DEARLY BELOVED', src: 'assets/dearly_beloved.mp3?v=79' },
        { title: 'SANCTUARY', src: 'assets/kh_sanctuary.mp3?v=79' },
        { title: 'SUNSET', src: 'assets/kh_sunset.mp3?v=79' }
    ];
    let subTrackIdx = parseInt(sessionStorage.getItem('rc_kh_track') || '0', 10);
    if (isNaN(subTrackIdx) || subTrackIdx < 0 || subTrackIdx >= subKhTracks.length) subTrackIdx = 0;

    let btn = document.getElementById('lofi-music-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lofi-music-btn visible';
        btn.id = 'lofi-music-btn';
        btn.setAttribute('aria-label', 'Toggle Kingdom Hearts Background Music');
        btn.innerHTML = '<span class="lofi-eq" aria-hidden="true"><i></i><i></i><i></i></span><span id="lofi-music-label">DEARLY BELOVED</span>';
        document.body.appendChild(btn);
    }
    const labelEl = document.getElementById('lofi-music-label');

    let subpageAudio = null;
    let started = false;
    let muted = sessionStorage.getItem('rc_lofi_muted') === '1';

    function updateUI() {
        const playing = started && !muted;
        btn.classList.toggle('playing', playing);
        btn.classList.toggle('muted', muted);
        const curTrack = subKhTracks[subTrackIdx] || subKhTracks[0];
        if (labelEl) labelEl.textContent = muted ? 'MUSIC: OFF' : curTrack.title;
    }

    function startSubpageLoop(forceReload = false) {
        const curTrack = subKhTracks[subTrackIdx] || subKhTracks[0];
        if (!subpageAudio) {
            subpageAudio = new Audio(curTrack.src);
            subpageAudio.loop = true;
            subpageAudio.volume = 0.88;
        } else if (forceReload) {
            subpageAudio.pause();
            subpageAudio.src = curTrack.src;
            subpageAudio.load();
            subpageAudio.currentTime = 0;
        }
        started = true;
        sessionStorage.setItem('rc_lofi_active', '1');
        updateUI();
        if (!muted) {
            subpageAudio.muted = false;
            subpageAudio.volume = 0.88;
            subpageAudio.play().catch(() => {
                started = false;
                updateUI();
            });
        }
    }

    const resumeOnGesture = () => {
        if (!started || (subpageAudio && subpageAudio.paused && !muted)) {
            startSubpageLoop(false);
        }
    };

    window.addEventListener('pointerdown', resumeOnGesture, { passive: true });
    window.addEventListener('pointermove', resumeOnGesture, { once: true, passive: true });
    window.addEventListener('keydown', resumeOnGesture, { passive: true });

    btn.addEventListener('click', () => {
        if (!started) {
            muted = false;
            sessionStorage.setItem('rc_lofi_muted', '0');
            startSubpageLoop(true);
            return;
        }
        if (muted) {
            muted = false;
            subTrackIdx = 0;
            sessionStorage.setItem('rc_lofi_muted', '0');
            sessionStorage.setItem('rc_kh_track', '0');
            startSubpageLoop(true);
        } else if (subTrackIdx + 1 < subKhTracks.length) {
            subTrackIdx++;
            sessionStorage.setItem('rc_kh_track', String(subTrackIdx));
            startSubpageLoop(true);
        } else {
            muted = true;
            sessionStorage.setItem('rc_lofi_muted', '1');
            if (subpageAudio) {
                subpageAudio.muted = true;
                subpageAudio.pause();
            }
            updateUI();
        }
    });

    startSubpageLoop();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initGamerIntro();
        initSubpageLofiMusic();
    });
} else {
    initGamerIntro();
    initSubpageLofiMusic();
}
