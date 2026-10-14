document.addEventListener('DOMContentLoaded', () => {
    // Size Selector Toggle Logic
    const sizeContainers = document.querySelectorAll('.size-selector');
    sizeContainers.forEach(container => {
        const buttons = container.querySelectorAll('.size-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    });

    // Countdown Timer logic
    startCountdown();

    // Close order modal on backdrop click
    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
        orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) closeOrderModal();
        });
    }

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeOrderModal();
            closeCreatorModal();
        }
    });
});

// Real-time Countdown Timer
function startCountdown() {
    const timerElement = document.getElementById('countdown-timer');
    if (!timerElement) return;

    // Set countdown 4 days, 18 hours from now
    let totalSeconds = (4 * 86400) + (18 * 3600) + (32 * 60) + 14;

    setInterval(() => {
        if (totalSeconds <= 0) return;
        totalSeconds--;

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (n) => String(n).padStart(2, '0');
        timerElement.textContent = `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }, 1000);
}

// Modal Handlers
function openOrderModal(productName, price, cardEl) {
    const modal = document.getElementById('order-modal');
    const titleElem = document.getElementById('modal-item-title');
    const priceElem = document.getElementById('modal-item-price');
    const sizeSelect = document.getElementById('order-size');

    if (modal && titleElem && priceElem) {
        titleElem.textContent = productName;
        priceElem.textContent = `$${price.toFixed(2)}`;

        // Pass the active size from the card into the modal dropdown
        if (cardEl && sizeSelect) {
            const activeBtn = cardEl.closest('.vault-card')?.querySelector('.size-btn.active');
            if (activeBtn) {
                const activeSize = activeBtn.textContent.trim();
                for (let opt of sizeSelect.options) {
                    if (opt.value === activeSize || opt.text.includes(activeSize)) {
                        opt.selected = true;
                        break;
                    }
                }
            }
        }

        modal.classList.remove('hidden');
    }
}

function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function handleOrderSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('modal-item-title').textContent;
    const size = document.getElementById('order-size').value;
    alert(`PRE-ORDER SECURED!\n\nItem: ${title}\nSize: ${size}\n\nWe will email your print & tracking confirmation shortly!`);
    closeOrderModal();
}

// Interactive Creator Profit Calculator
function updateEarnings(val) {
    const items = parseInt(val, 10);
    const countElem = document.getElementById('sales-count');
    const retroProfitElem = document.getElementById('retrocanopy-profit');
    const genericProfitElem = document.getElementById('generic-profit');

    if (countElem) {
        countElem.textContent = `${items} items / month`;
    }

    // Calculation: Retrocanopy avg profit ~$16/item vs generic ~$6/item
    const retroProfit = items * 16;
    const genericProfit = items * 6;

    if (retroProfitElem) {
        retroProfitElem.textContent = `$${retroProfit.toLocaleString()} / mo`;
    }
    if (genericProfitElem) {
        genericProfitElem.textContent = `$${genericProfit.toLocaleString()} / mo`;
    }
}

// Creator Modal Handlers
function closeCreatorModal() {
    const modal = document.getElementById('creator-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function handleCreatorSubmit(event) {
    event.preventDefault();
    alert('CREATOR APPLICATION RECEIVED!\n\nThank you for reaching out. Our team will review your channel and reply within 24 hours with your sample kit details.');
    closeCreatorModal();
}

function handleOrgSubmit(event) {
    event.preventDefault();
    alert('BULK QUOTE REQUEST RECEIVED!\n\nThank you for reaching out. A dedicated account manager will prepare your itemized quote, volume discounts, and digital mockups within 24 business hours.');
}

