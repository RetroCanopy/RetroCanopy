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
 * 16-Bit Retro Gamer Intro Animation Controller
 * Silky-smooth 60+ FPS hardware-accelerated movement with synchronized retro walk cycle.
 */
function initGamerIntro() {
    const actor = document.getElementById('arcade-character');
    if (!actor) return;

    // Check accessibility reduced-motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        actor.remove();
        return;
    }

    const dialogue = document.getElementById('character-dialogue');
    const frames = {
        walk1: document.getElementById('frame-walk1'),
        walk2: document.getElementById('frame-walk2'),
        front: document.getElementById('frame-front'),
        exit: document.getElementById('frame-exit')
    };

    function showFrame(name) {
        for (const [key, el] of Object.entries(frames)) {
            if (el) {
                if (key === name) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            }
        }
    }

    const actorRect = actor.getBoundingClientRect();
    const actorWidth = actorRect.width || 110;

    let posX = -actorWidth - 60;
    const centerTarget = (window.innerWidth / 2) - (actorWidth / 2);
    const exitTarget = window.innerWidth + actorWidth + 60;

    let state = 'WALK_IN'; // 'WALK_IN' | 'GREETING' | 'WALK_OUT' | 'DONE'
    const walkCycle = ['walk1', 'walk2', 'exit', 'walk2'];
    let walkCycleIndex = 0;
    let stepTimer = 0;
    const STEP_DURATION = 150; // ms per step for authentic 16-bit arcade cadence
    const WALK_SPEED = 145; // px per second

    let lastTime = null;
    let animationFrameId = null;

    function step(now) {
        if (!lastTime) lastTime = now;
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (state === 'WALK_IN') {
            posX += WALK_SPEED * dt;
            stepTimer += dt * 1000;
            if (stepTimer >= STEP_DURATION) {
                stepTimer = 0;
                walkCycleIndex = (walkCycleIndex + 1) % walkCycle.length;
                showFrame(walkCycle[walkCycleIndex]);
            }

            actor.style.transform = `translate3d(${posX.toFixed(1)}px, 0, 0)`;

            if (posX >= centerTarget) {
                posX = centerTarget;
                actor.style.transform = `translate3d(${posX.toFixed(1)}px, 0, 0)`;
                state = 'GREETING';
                showFrame('front');

                // Pop dialogue bubble smoothly
                setTimeout(() => {
                    if (dialogue) dialogue.classList.add('show');
                }, 200);

                // Hold greeting pose for 3.4 seconds, then cleanly exit
                setTimeout(() => {
                    startWalkOut();
                }, 3500);

                return;
            }
            animationFrameId = requestAnimationFrame(step);
        } else if (state === 'WALK_OUT') {
            posX += (WALK_SPEED * 1.15) * dt;
            stepTimer += dt * 1000;
            if (stepTimer >= STEP_DURATION) {
                stepTimer = 0;
                walkCycleIndex = (walkCycleIndex + 1) % walkCycle.length;
                showFrame(walkCycle[walkCycleIndex]);
            }

            actor.style.transform = `translate3d(${posX.toFixed(1)}px, 0, 0)`;

            if (posX >= exitTarget) {
                state = 'DONE';
                actor.remove();
                return;
            }
            animationFrameId = requestAnimationFrame(step);
        }
    }

    function startWalkOut() {
        if (state !== 'GREETING') return;
        if (dialogue) dialogue.classList.remove('show');
        setTimeout(() => {
            state = 'WALK_OUT';
            walkCycleIndex = 0;
            stepTimer = 0;
            showFrame('walk1');
            lastTime = performance.now();
            animationFrameId = requestAnimationFrame(step);
        }, 280);
    }

    // Allow user to click actor to immediately advance
    actor.addEventListener('click', () => {
        if (state === 'GREETING') {
            startWalkOut();
        }
    });

    // Initial position
    showFrame('walk1');
    actor.style.transform = `translate3d(${posX}px, 0, 0)`;

    // Start walking after brief 250ms page load breather
    setTimeout(() => {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(step);
    }, 250);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGamerIntro);
} else {
    initGamerIntro();
}
