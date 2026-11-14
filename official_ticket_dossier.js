/**
 * RetroCanopy Official Ticket Dossier & Congratulations Modal + Email Dispatcher
 * Concept #1 Molten Obsidian & 24K Gold Executive Design
 * Official Studio Sender: JosephCole@retrocanopy.com
 */
(function () {
  const EDGE_URL = 'https://axavvrqyzpwsczpiwmua.supabase.co/functions/v1/retrocanopy-stripe-checkout';

  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function ensureCongratsStylesInjected() {
    if (document.getElementById('rcOfficialCongratsStyles')) return;
    const style = document.createElement('style');
    style.id = 'rcOfficialCongratsStyles';
    style.textContent = `
      .rc-congrats-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2147483600;
        background: radial-gradient(circle at 50% 35%, rgba(18, 14, 28, 0.86), rgba(5, 4, 9, 0.96));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        overflow-y: auto;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .rc-congrats-backdrop.is-open {
        display: flex;
      }
      .rc-congrats-sheet {
        width: min(760px, 96vw);
        background:
          radial-gradient(rgba(255, 255, 255, 0.036) 1px, transparent 1px) 0 0 / 6px 6px,
          linear-gradient(180deg, #15131c 0%, #0b0a10 55%, #07060a 100%);
        border: 2px solid #ff8a26;
        border-radius: 28px;
        padding: 24px 26px;
        box-shadow:
          0 36px 95px rgba(0, 0, 0, 0.95),
          0 0 60px rgba(255, 118, 20, 0.36),
          inset 0 2px 1px rgba(255, 255, 255, 0.45);
        color: #ffffff;
        animation: rcCongratsPopIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes rcCongratsPopIn {
        from { opacity: 0; transform: scale(0.94) translateY(12px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .rc-congrats-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        background: linear-gradient(135deg, rgba(68, 64, 84, 0.85) 0%, rgba(22, 20, 30, 0.95) 55%, rgba(42, 24, 14, 0.9) 100%);
        border: 1px solid rgba(255, 255, 255, 0.32);
        border-radius: 20px;
        padding: 14px 20px;
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.55), inset 0 1.5px 1px rgba(255, 255, 255, 0.5);
      }
      .rc-congrats-brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .rc-congrats-brand img {
        width: 52px;
        height: 52px;
        border-radius: 13px;
        border: 1.5px solid rgba(255, 168, 76, 0.75);
        object-fit: contain;
        background: #08070c;
      }
      .rc-congrats-wordmark {
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(1.25rem, 3vw, 1.6rem);
        font-weight: 900;
        letter-spacing: 0.06em;
        background: linear-gradient(180deg, #ffe8a3 0%, #ff9828 55%, #ff5500 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .rc-congrats-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 13px;
        border-radius: 999px;
        background: rgba(34, 245, 155, 0.18);
        border: 1.5px solid #22f59b;
        color: #22f59b;
        font-family: 'Orbitron', sans-serif;
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.06em;
      }
      .rc-congrats-cap-pill {
        margin-top: 12px;
        text-align: center;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1.5px solid #ff8c28;
        background: linear-gradient(90deg, rgba(255, 118, 18, 0.22), rgba(32, 18, 10, 0.95), rgba(255, 118, 18, 0.22));
        font-size: 0.78rem;
        font-weight: 600;
        color: #ffe6c2;
        letter-spacing: 0.03em;
      }
      .rc-congrats-hero {
        text-align: center;
        margin-top: 16px;
        padding: 20px 22px;
        border-radius: 22px;
        background:
          radial-gradient(circle at 50% 0%, rgba(255, 138, 38, 0.22), transparent 65%),
          linear-gradient(165deg, rgba(46, 42, 60, 0.82) 0%, rgba(16, 15, 22, 0.96) 100%);
        border: 1px solid rgba(255, 255, 255, 0.28);
        box-shadow: inset 0 1.5px 1px rgba(255, 255, 255, 0.45);
      }
      .rc-congrats-title {
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(1.2rem, 3.2vw, 1.65rem);
        font-weight: 900;
        color: #ffffff;
        letter-spacing: 0.05em;
        text-shadow: 0 0 24px rgba(255, 138, 38, 0.55);
      }
      .rc-congrats-sub {
        font-size: 0.94rem;
        color: #e2e8f0;
        margin-top: 6px;
      }
      .rc-congrats-ticket-box {
        margin: 16px auto 14px;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        padding: 13px 32px;
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(255, 138, 38, 0.24), rgba(28, 16, 8, 0.96));
        border: 2px solid #ffa03a;
        box-shadow: 0 0 32px rgba(255, 122, 20, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.45);
      }
      .rc-congrats-ticket-lbl {
        font-family: 'Orbitron', sans-serif;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.14em;
        color: #ffd296;
      }
      .rc-congrats-ticket-num {
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(1.4rem, 4vw, 1.95rem);
        font-weight: 900;
        color: #ffffff;
        letter-spacing: 0.08em;
        margin-top: 3px;
        text-shadow: 0 0 18px rgba(255, 152, 48, 0.75);
      }
      .rc-congrats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 10px;
        margin-top: 12px;
        text-align: left;
      }
      .rc-congrats-detail {
        background: rgba(10, 9, 15, 0.84);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-left: 3.5px solid #ff8c28;
        border-radius: 12px;
        padding: 9px 13px;
      }
      .rc-congrats-detail-lbl {
        font-size: 0.68rem;
        color: #ffb870;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .rc-congrats-detail-val {
        font-size: 0.88rem;
        color: #ffffff;
        font-weight: 700;
        margin-top: 2px;
        word-break: break-word;
      }
      .rc-congrats-email-bar {
        margin-top: 14px;
        padding: 12px 16px;
        border-radius: 16px;
        background: linear-gradient(90deg, rgba(34, 245, 155, 0.12), rgba(14, 28, 24, 0.92));
        border: 1px solid rgba(34, 245, 155, 0.55);
        display: flex;
        align-items: center;
        gap: 12px;
        text-align: left;
        font-size: 0.84rem;
        color: #e6fff5;
        line-height: 1.45;
      }
      .rc-congrats-return-btn {
        margin-top: 16px;
        width: 100%;
        padding: 14px 22px;
        border-radius: 999px;
        border: 1.5px solid #ffc994;
        background: linear-gradient(135deg, #ffa036 0%, #ff5500 100%);
        color: #ffffff;
        font-family: 'Orbitron', sans-serif;
        font-size: 0.86rem;
        font-weight: 900;
        letter-spacing: 0.07em;
        text-align: center;
        cursor: pointer;
        box-shadow: 0 0 30px rgba(255, 102, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.5);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .rc-congrats-return-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 0 38px rgba(255, 118, 20, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.65);
      }
      .rc-congrats-countdown {
        font-size: 0.75rem;
        color: rgba(255, 214, 174, 0.82);
        margin-top: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  let activeRedirectTimer = null;

  function returnToRetroCanopyMainPage() {
    if (activeRedirectTimer) {
      clearInterval(activeRedirectTimer);
      activeRedirectTimer = null;
    }
    const modal = document.getElementById('rcOfficialTicketCongratsModal');
    if (modal) modal.classList.remove('is-open');

    // Close any open studio modals or merch drawers on index.html
    const studioModal = document.getElementById('studioModal');
    if (studioModal) studioModal.classList.remove('is-open');
    const rcStudioModal = document.getElementById('rc-studio-modal');
    if (rcStudioModal) rcStudioModal.classList.remove('active', 'is-open');
    const studioOverlay = document.getElementById('rc-studio-overlay');
    if (studioOverlay) studioOverlay.classList.remove('active');
    const merchDrawer = document.getElementById('rc-merch-showroom-overlay');
    if (merchDrawer) merchDrawer.classList.remove('is-open', 'active');
    const checkoutOverlay = document.getElementById('rcStoreCheckoutModal');
    if (checkoutOverlay) checkoutOverlay.classList.remove('open', 'is-open', 'active');

    const path = (window.location.pathname || '').toLowerCase();
    const isMainIndex = path === '/' || path.endsWith('/index.html') || path.endsWith('/website/') || path === '';
    if (!isMainIndex || window.location.search.includes('stripe_')) {
      window.location.href = 'index.html';
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  window.returnToRetroCanopyMainPage = returnToRetroCanopyMainPage;

  window.sendRetroCanopyOfficialEmail = async function (payload) {
    try {
      const res = await fetch(EDGE_URL, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_official_email',
          ...payload
        })
      });
      return await res.json();
    } catch (err) {
      console.warn('Official email dispatch notice:', err);
      return { ok: false };
    }
  };

  window.showRetroCanopyTicketCongrats = function (opts) {
    ensureCongratsStylesInjected();
    const o = opts || {};
    const isOrder = Boolean(o.isOrder);
    const ticketId = String(o.ticketId || o.orderId || o.requestId || ('RC-TKT-' + String(Date.now()).slice(-6))).replace(/^#+/, '');
    const customerName = String(o.customerName || o.name || 'Valued Client').trim();
    const contact = String(o.customerEmail || o.email || o.contact || o.customerPhone || 'Verified Client').trim();
    const serviceOrItems = String(o.service || o.itemsSummary || 'Custom Studio Project').trim();
    const totalPaidUsd = Number(o.totalPaidUsd || o.amountTotalUsd || 0);
    const countdownSec = typeof o.countdownSeconds === 'number' ? o.countdownSeconds : 8;

    // Close the studio modal if open so the Congratulations Dossier takes center stage
    const studioModal = document.getElementById('studioModal');
    if (studioModal) studioModal.classList.remove('is-open');

    let modal = document.getElementById('rcOfficialTicketCongratsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rcOfficialTicketCongratsModal';
      modal.className = 'rc-congrats-backdrop';
      document.body.appendChild(modal);
    }

    const badgeText = isOrder ? '&#10003; ORDER PAID &amp; VERIFIED' : '&#10003; REQUEST LOGGED &amp; VERIFIED';
    const subTitleText = isOrder
      ? `Your official order (${totalPaidUsd > 0 ? '$' + totalPaidUsd.toFixed(2) + ' USD' : 'Verified'}) is now in our production queue.`
      : 'Your project request has been officially registered with RetroCanopy Studio.';
    const ticketLabel = isOrder ? 'YOUR OFFICIAL ORDER TICKET NUMBER' : 'YOUR OFFICIAL PROJECT TICKET NUMBER';
    const secondCardLbl = isOrder ? 'Ordered Items / Package' : 'Service Requested';
    const emailMsg = isOrder
      ? `We just sent your official Paid Order Receipt &amp; Ticket Dossier from <strong>JosephCole@retrocanopy.com</strong>. We will contact you shortly with your tracking update!`
      : `We just sent your official Project Ticket Dossier from <strong>JosephCole@retrocanopy.com</strong>. Joseph has received your request on his phone and will get in contact with you shortly!`;

    modal.innerHTML = `
      <div class="rc-congrats-sheet" role="dialog" aria-modal="true" aria-labelledby="rcCongratsHeading">
        <div class="rc-congrats-header">
          <div class="rc-congrats-brand">
            <img src="assets/logo.png" alt="RetroCanopy Official Logo">
            <div class="rc-congrats-wordmark">RETROCANOPY</div>
          </div>
          <div style="text-align:right;">
            <div class="rc-congrats-status-pill">${badgeText}</div>
            <div style="font-size:0.72rem;color:#ffd099;margin-top:4px;font-weight:600;">SANCTUARY STUDIO DISPATCH</div>
          </div>
        </div>

        <div class="rc-congrats-cap-pill">
          Apparel &bull; Websites &bull; Marketing &bull; Apps &bull; Games &bull; Custom 3D Prints
        </div>

        <div class="rc-congrats-hero">
          <div class="rc-congrats-title" id="rcCongratsHeading">&#127881; CONGRATULATIONS, ${escHtml(customerName.toUpperCase())}!</div>
          <div class="rc-congrats-sub">${subTitleText}</div>

          <div class="rc-congrats-ticket-box">
            <div class="rc-congrats-ticket-lbl">${ticketLabel}</div>
            <div class="rc-congrats-ticket-num">#${escHtml(ticketId)}</div>
          </div>

          <div class="rc-congrats-grid">
            <div class="rc-congrats-detail">
              <div class="rc-congrats-detail-lbl">Client / Brand</div>
              <div class="rc-congrats-detail-val">${escHtml(customerName)}</div>
            </div>
            <div class="rc-congrats-detail">
              <div class="rc-congrats-detail-lbl">${secondCardLbl}</div>
              <div class="rc-congrats-detail-val">${escHtml(serviceOrItems)}</div>
            </div>
            <div class="rc-congrats-detail">
              <div class="rc-congrats-detail-lbl">Confirmation Sent To</div>
              <div class="rc-congrats-detail-val">${escHtml(contact)}</div>
            </div>
            <div class="rc-congrats-detail">
              <div class="rc-congrats-detail-lbl">Assigned Studio Lead</div>
              <div class="rc-congrats-detail-val">Joseph Cole (Founder)</div>
            </div>
          </div>

          <div class="rc-congrats-email-bar">
            <div style="font-size:1.45rem;flex-shrink:0;">&#9993;&#65039;</div>
            <div>
              <strong style="color:#6bffc3;">Official Confirmation Email Dispatched!</strong><br>
              ${emailMsg}
            </div>
          </div>

          <button type="button" class="rc-congrats-return-btn" id="rcCongratsReturnMainBtn">
            &larr; RETURN TO RETROCANOPY MAIN PAGE
          </button>
          <div class="rc-congrats-countdown" id="rcCongratsCountdownText">
            Automatically returning you to the RetroCanopy Sanctuary in <strong>${countdownSec} seconds</strong>...
          </div>
        </div>
      </div>
    `;

    modal.classList.add('is-open');

    const returnBtn = document.getElementById('rcCongratsReturnMainBtn');
    if (returnBtn) {
      returnBtn.addEventListener('click', () => returnToRetroCanopyMainPage());
    }

    if (activeRedirectTimer) clearInterval(activeRedirectTimer);
    if (countdownSec > 0) {
      let remaining = countdownSec;
      activeRedirectTimer = setInterval(() => {
        remaining -= 1;
        const cdEl = document.getElementById('rcCongratsCountdownText');
        if (remaining <= 0) {
          clearInterval(activeRedirectTimer);
          activeRedirectTimer = null;
          returnToRetroCanopyMainPage();
        } else if (cdEl) {
          cdEl.innerHTML = `Automatically returning you to the RetroCanopy Sanctuary in <strong>${remaining} second${remaining === 1 ? '' : 's'}</strong>...`;
        }
      }, 1000);
    }
  };
})();
