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
