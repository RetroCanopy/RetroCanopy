/**
 * RETROCANOPY UNIFIED AUTHENTICATION, SITE STATS, SHOP ORDERS & OWNER PAGE ADMIN APPROVAL (auth_hub.js)
 * - Sign-In button positioned on the RIGHT side of the screen
 * - Spacious Email & Password inputs (500px modal, tall inputs, 128-char capacity)
 * - Master Owner Login: Josephcole001.a1@gmail.com / Admin001!
 * - Admin Accounts:
 *     1. Create Admin Account (sets up Name, Email & Password -> goes directly to the Owner's Page for approval)
 *     2. Owner logs in (Josephcole001.a1@gmail.com / Admin001!) and hits Approve or Deny on the Owner's Page
 *     3. Approved Admins log in with the Email & Password they set up
 *     4. Owner can Remove Access (Revoke or Delete) at any time in the future from the Owner's Page
 */
(function () {
  const OWNER_ADMIN_EMAIL = 'josephcole001.ai@gmail.com';
  const OWNER_EMAIL_ALIASES = [
    'josephcole001.ai@gmail.com',
    'josephcole001.a1@gmail.com'
  ];
  const OWNER_ADMIN_PASS = 'Admin001!';
  const ACCOUNTS_KEY = 'rc_accounts_db_v2';
  const ADMIN_ACCOUNTS_KEY = 'rc_admin_accounts_v2';
  const CURRENT_USER_KEY = 'rc_current_user_v1';
  const CURRENT_ADMIN_EMAIL_KEY = 'rc_current_admin_email_v1';
  const IS_ADMIN_KEY = 'rc_is_admin_v1';
  const SESSION_LAST_ACTIVE_KEY = 'rc_session_last_active_v1';
  const SESSION_LOGGED_OUT_KEY = 'rc_session_logged_out_v1';
  const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds
  const LEADERBOARD_KEY = 'rc_leaderboard_v1';
  const ORDERS_KEY = 'rc_shop_orders_v2';
  const STATS_KEY = 'rc_site_stats_v2';

  // Clean up legacy v1 keys so old test accounts never reappear
  try {
    localStorage.removeItem('rc_accounts_db_v1');
    localStorage.removeItem('rc_admin_accounts_v1');
  } catch (_) {}

  function touchSessionActivity() {
    try {
      localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(Date.now()));
      localStorage.removeItem(SESSION_LOGGED_OUT_KEY);
    } catch (_) {}
  }

  function checkAndMaintain15DaySession() {
    try {
      const hasSession = localStorage.getItem(IS_ADMIN_KEY) === 'true' || Boolean(localStorage.getItem(CURRENT_USER_KEY));
      if (!hasSession) return false;

      const lastActive = parseInt(localStorage.getItem(SESSION_LAST_ACTIVE_KEY) || '0', 10);
      const now = Date.now();
      if (lastActive > 0 && (now - lastActive) > FIFTEEN_DAYS_MS) {
        // Account was inactive for more than 15 days -> expire session
        localStorage.removeItem(IS_ADMIN_KEY);
        localStorage.removeItem(CURRENT_ADMIN_EMAIL_KEY);
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(SESSION_LAST_ACTIVE_KEY);
        return false;
      }

      // Active within 15 days -> roll forward the 15-day inactivity timer
      localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(now));
      return true;
    } catch (_) {
      return false;
    }
  }

  async function logoutActiveSession() {
    try {
      localStorage.removeItem(IS_ADMIN_KEY);
      localStorage.removeItem(CURRENT_ADMIN_EMAIL_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(SESSION_LAST_ACTIVE_KEY);
      localStorage.setItem(SESSION_LOGGED_OUT_KEY, '1');
      await syncWithServerDb(true);
    } catch (_) {}
  }

  function isOwnerEmail(emailStr) {
    const clean = (emailStr || '').trim().toLowerCase();
    return OWNER_EMAIL_ALIASES.includes(clean);
  }

  const DEFAULT_ORDERS = [];

  function getAccountsDb() {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function getAdminAccountsDb() {
    let db = {};
    try {
      db = JSON.parse(localStorage.getItem(ADMIN_ACCOUNTS_KEY) || '{}') || {};
    } catch (_) {
      db = {};
    }
    // Remove legacy/duplicate owner keys so ONLY 1 Owner entry exists
    delete db['josephdanielcole1994@gmail.com'];
    delete db['josephcole001.a1@gmail.com'];

    const ownerKey = OWNER_ADMIN_EMAIL.toLowerCase();
    db[ownerKey] = {
      name: 'Joseph Cole (Owner)',
      email: OWNER_ADMIN_EMAIL,
      password: OWNER_ADMIN_PASS,
      status: 'Approved',
      isOwner: true,
      createdAt: db[ownerKey]?.createdAt || '2026-10-29',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(db));
    return db;
  }

  function saveAdminAccountsDb(db) {
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(db));
    syncWithServerDb(true);
  }

  function getLeaderboardDb() {
    try {
      return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]') || [];
    } catch (_) {
      return [];
    }
  }

  function getOrdersDb() {
    try {
      const parsed = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    localStorage.setItem(ORDERS_KEY, JSON.stringify(DEFAULT_ORDERS));
    return DEFAULT_ORDERS;
  }

  function getSiteStats() {
    const fallback = {
      totalVisits: 0,
      homeViews: 0,
      arcadeViews: 0,
      shopViews: 0,
      cultureViews: 0,
      creatorsViews: 0,
      totalGamesPlayed: 0,
      liveFeed: [],
      lastVisitAt: ''
    };
    try {
      const parsed = JSON.parse(localStorage.getItem(STATS_KEY) || 'null');
      if (parsed && typeof parsed === 'object') {
        return {
          ...fallback,
          ...parsed,
          liveFeed: Array.isArray(parsed.liveFeed) ? parsed.liveFeed : []
        };
      }
    } catch (_) {}
    localStorage.setItem(STATS_KEY, JSON.stringify(fallback));
    return fallback;
  }

  function saveSiteStats(stats) {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }

  function detectTrafficSource() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const refParam = params.get('ref') || params.get('utm_campaign') || params.get('utm_source');
      if (refParam) return `Campaign (${refParam})`;
      const ref = (document.referrer || '').toLowerCase();
      if (ref.includes('tiktok')) return 'TikTok';
      if (ref.includes('instagram')) return 'Instagram';
      if (ref.includes('youtube') || ref.includes('twitch')) return 'Twitch / YouTube';
      if (ref && !ref.includes(window.location.host.toLowerCase())) return 'Referral';
    } catch (_) {}
    return 'Direct';
  }

  function trackCurrentPageView() {
    const path = (window.location.pathname || '').toLowerCase();
    // Don't count Owner's Page refreshes as customer site visits
    if (path.includes('admin')) return;

    const stats = getSiteStats();
    stats.totalVisits = (stats.totalVisits || 0) + 1;

    let section = 'Home Stage';
    let action = 'Visited Home Stage';

    if (path.includes('games') || path.includes('arcade')) {
      stats.arcadeViews = (stats.arcadeViews || 0) + 1;
      section = 'Arcade';
      action = 'Entered Arcade (Synth\'s Midnight Flight)';
    } else if (path.includes('hat_') || path.includes('hoodie') || path.includes('tee') || path.includes('joggers') || path.includes('longsleeve') || path.includes('deskmat') || path.includes('gearbag') || path.includes('merch')) {
      stats.shopViews = (stats.shopViews || 0) + 1;
      section = 'Merch Shop';
      action = 'Browsing Merch Shop';
    } else if (path.includes('culture')) {
      stats.cultureViews = (stats.cultureViews || 0) + 1;
      section = 'Culture';
      action = 'Visited Culture Hub';
    } else if (path.includes('creators')) {
      stats.creatorsViews = (stats.creatorsViews || 0) + 1;
      section = 'Creators';
      action = 'Visited Creators Studio';
    } else {
      stats.homeViews = (stats.homeViews || 0) + 1;
    }

    const now = new Date();
    const user = (localStorage.getItem(CURRENT_USER_KEY) || '').trim();
    const isAdmin = localStorage.getItem(IS_ADMIN_KEY) === 'true';
    const visitorLabel = user ? `@${user}` : (isAdmin ? 'Owner' : 'Guest Visitor');

    const ev = {
      id: 'ev_' + now.getTime() + '_' + Math.floor(Math.random() * 1000),
      user: visitorLabel,
      section,
      action,
      source: detectTrafficSource(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ts: now.getTime()
    };

    const feed = Array.isArray(stats.liveFeed) ? stats.liveFeed : [];
    feed.unshift(ev);
    stats.liveFeed = feed.slice(0, 1000);
    stats.lastVisitAt = now.toISOString();
    saveSiteStats(stats);
  }

  async function clearTrafficStats() {
    const fresh = {
      totalVisits: 0,
      homeViews: 0,
      arcadeViews: 0,
      shopViews: 0,
      cultureViews: 0,
      creatorsViews: 0,
      totalGamesPlayed: 0,
      liveFeed: [],
      lastVisitAt: ''
    };
    saveSiteStats(fresh);
    await syncWithServerDb(true);
  }

  const IS_LOCAL_API_HOST = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  async function syncWithServerDb(pushFirst = false) {
    if (!IS_LOCAL_API_HOST || !window.location.protocol.startsWith('http')) {
      checkAndMaintain15DaySession();
      verifyActiveAdminSessionStillValid();
      return;
    }
    try {
      if (!pushFirst) {
        const res = await fetch('/api/arcade-db', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            if (data.accounts && typeof data.accounts === 'object') {
              const locAcc = getAccountsDb();
              Object.keys(data.accounts).forEach((k) => {
                const srv = data.accounts[k];
                const loc = locAcc[k];
                if (!loc) {
                  locAcc[k] = srv;
                } else {
                  locAcc[k] = {
                    ...srv,
                    ...loc,
                    xp: Math.max(loc.xp || 0, srv.xp || 0),
                    bestScore: Math.max(loc.bestScore || 0, srv.bestScore || 0),
                    usedCoupons: { ...(srv.usedCoupons || {}), ...(loc.usedCoupons || {}) }
                  };
                }
              });
              localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(locAcc));
            }
            if (data.adminAccounts && typeof data.adminAccounts === 'object') {
              const locAdm = getAdminAccountsDb();
              Object.keys(data.adminAccounts).forEach((k) => {
                const lowerK = k.toLowerCase();
                if (lowerK === 'josephdanielcole1994@gmail.com' || isOwnerEmail(lowerK)) return;
                const srvA = data.adminAccounts[k];
                const locA = locAdm[lowerK];
                if (!locA) {
                  locAdm[lowerK] = srvA;
                } else {
                  const srvTime = srvA.updatedAt ? new Date(srvA.updatedAt).getTime() : 0;
                  const locTime = locA.updatedAt ? new Date(locA.updatedAt).getTime() : 0;
                  locAdm[lowerK] = srvTime >= locTime ? { ...locA, ...srvA } : { ...srvA, ...locA };
                }
              });
              // Always keep ONLY 1 Master Owner record
              delete locAdm['josephcole001.a1@gmail.com'];
              const ownerKey = OWNER_ADMIN_EMAIL.toLowerCase();
              locAdm[ownerKey] = {
                name: 'Joseph Cole (Owner)',
                email: OWNER_ADMIN_EMAIL,
                password: OWNER_ADMIN_PASS,
                status: 'Approved',
                isOwner: true,
                createdAt: locAdm[ownerKey]?.createdAt || '2026-10-29',
                updatedAt: new Date().toISOString()
              };
              localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(locAdm));
            }
            if (Array.isArray(data.orders) && data.orders.length > 0) {
              const locOrd = getOrdersDb();
              const map = new Map();
              [...data.orders, ...locOrd].forEach((o) => {
                if (o && o.orderId) map.set(o.orderId, o);
              });
              localStorage.setItem(ORDERS_KEY, JSON.stringify(Array.from(map.values())));
            }
            if (data.stats && typeof data.stats === 'object') {
              const locSt = getSiteStats();
              const srvFeed = Array.isArray(data.stats.liveFeed) ? data.stats.liveFeed : [];
              const locFeed = Array.isArray(locSt.liveFeed) ? locSt.liveFeed : [];
              const feedMap = new Map();
              [...srvFeed, ...locFeed].forEach((ev) => {
                if (ev && ev.id) feedMap.set(ev.id, ev);
              });
              const mergedFeed = Array.from(feedMap.values())
                .sort((a, b) => (b.ts || 0) - (a.ts || 0))
                .slice(0, 1000);

              const mergedStats = {
                totalVisits: Math.max(locSt.totalVisits || 0, data.stats.totalVisits || 0),
                homeViews: Math.max(locSt.homeViews || 0, data.stats.homeViews || 0),
                arcadeViews: Math.max(locSt.arcadeViews || 0, data.stats.arcadeViews || 0),
                shopViews: Math.max(locSt.shopViews || 0, data.stats.shopViews || 0),
                cultureViews: Math.max(locSt.cultureViews || 0, data.stats.cultureViews || 0),
                creatorsViews: Math.max(locSt.creatorsViews || 0, data.stats.creatorsViews || 0),
                totalGamesPlayed: Math.max(locSt.totalGamesPlayed || 0, data.stats.totalGamesPlayed || 0),
                liveFeed: mergedFeed,
                lastVisitAt: locSt.lastVisitAt || data.stats.lastVisitAt || ''
              };
              saveSiteStats(mergedStats);
            }
            if (data.activeSession && typeof data.activeSession === 'object') {
              const srvSess = data.activeSession;
              const explicitlyLoggedOut = localStorage.getItem(SESSION_LOGGED_OUT_KEY) === '1';
              const localHasSession = localStorage.getItem(IS_ADMIN_KEY) === 'true' || Boolean(localStorage.getItem(CURRENT_USER_KEY));
              if (!explicitlyLoggedOut && !localHasSession && !srvSess.loggedOut && srvSess.lastActiveAt) {
                const ageMs = Date.now() - Number(srvSess.lastActiveAt);
                if (ageMs >= 0 && ageMs <= FIFTEEN_DAYS_MS) {
                  if (srvSess.isAdmin && srvSess.adminEmail) {
                    localStorage.setItem(IS_ADMIN_KEY, 'true');
                    localStorage.setItem(CURRENT_ADMIN_EMAIL_KEY, srvSess.adminEmail);
                  }
                  if (srvSess.username) {
                    localStorage.setItem(CURRENT_USER_KEY, srvSess.username);
                  }
                  localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(Date.now()));
                }
              }
            }
          }
        }
      }

      checkAndMaintain15DaySession();
      verifyActiveAdminSessionStillValid();

      const activeSession = {
        isAdmin: localStorage.getItem(IS_ADMIN_KEY) === 'true',
        adminEmail: localStorage.getItem(CURRENT_ADMIN_EMAIL_KEY) || '',
        username: localStorage.getItem(CURRENT_USER_KEY) || '',
        lastActiveAt: parseInt(localStorage.getItem(SESSION_LAST_ACTIVE_KEY) || String(Date.now()), 10),
        loggedOut: localStorage.getItem(SESSION_LOGGED_OUT_KEY) === '1'
      };

      const payload = {
        accounts: getAccountsDb(),
        adminAccounts: getAdminAccountsDb(),
        activeSession,
        leaderboard: getLeaderboardDb(),
        orders: getOrdersDb(),
        stats: getSiteStats(),
        updatedAt: new Date().toISOString()
      };
      await fetch('/api/arcade-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (_) {}
  }

  function verifyActiveAdminSessionStillValid() {
    if (localStorage.getItem(IS_ADMIN_KEY) !== 'true') return false;
    const activeEmail = (localStorage.getItem(CURRENT_ADMIN_EMAIL_KEY) || '').trim().toLowerCase();
    if (!activeEmail) return true;
    const adminDb = getAdminAccountsDb();
    const rec = adminDb[activeEmail];
    if (!rec || rec.status !== 'Approved') {
      localStorage.removeItem(IS_ADMIN_KEY);
      localStorage.removeItem(CURRENT_ADMIN_EMAIL_KEY);
      return false;
    }
    return true;
  }

  function getCurrentUser() {
    return (localStorage.getItem(CURRENT_USER_KEY) || '').trim();
  }

  function getCurrentAdminEmail() {
    return (localStorage.getItem(CURRENT_ADMIN_EMAIL_KEY) || '').trim();
  }

  function isOwnerLoggedIn() {
    return isAdminLoggedIn() && isOwnerEmail(getCurrentAdminEmail());
  }

  function isAdminLoggedIn() {
    return verifyActiveAdminSessionStillValid();
  }

  // =========================================================================
  // ADMIN ACCOUNT CREATION -> SENT DIRECTLY TO OWNER'S PAGE FOR APPROVAL
  // =========================================================================
  async function registerAdminAccount(rawName, rawEmail, rawPassword) {
    const name = (rawName || '').trim() || (rawEmail || '').split('@')[0] || 'Admin';
    const email = (rawEmail || '').trim();
    const password = (rawPassword || '').trim();

    if (!email || !email.includes('@')) {
      return { ok: false, msg: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 4) {
      return { ok: false, msg: 'Please set a password (at least 4 characters).' };
    }

    const db = getAdminAccountsDb();
    const key = email.toLowerCase();

    // If the Master Owner submits their own email in Create Admin, auto-approve & log them right in as Owner!
    if (isOwnerEmail(key)) {
      const ownerKey = OWNER_ADMIN_EMAIL.toLowerCase();
      delete db['josephcole001.a1@gmail.com'];
      db[ownerKey] = {
        name: 'Joseph Cole (Owner)',
        email: OWNER_ADMIN_EMAIL,
        password: OWNER_ADMIN_PASS,
        status: 'Approved',
        isOwner: true,
        createdAt: '2026-10-29',
        updatedAt: new Date().toISOString()
      };
      saveAdminAccountsDb(db);
      localStorage.setItem(IS_ADMIN_KEY, 'true');
      localStorage.setItem(CURRENT_ADMIN_EMAIL_KEY, ownerKey);
      if (!getCurrentUser()) {
        localStorage.setItem(CURRENT_USER_KEY, 'Joseph');
      }
      touchSessionActivity();
      return { ok: true, isOwnerAutoLogin: true, account: db[ownerKey] };
    }

    if (db[key] && db[key].status === 'Approved') {
      return { ok: false, msg: 'This email is already an Approved Admin! Click Admin Log In to sign in.' };
    }

    const record = {
      name,
      email,
      password,
      status: 'Pending',
      isOwner: false,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toISOString()
    };

    db[key] = record;
    saveAdminAccountsDb(db);

    return { ok: true, account: record };
  }

  function loginAdminAccount(rawEmail, rawPassword) {
    const email = (rawEmail || '').trim();
    const password = (rawPassword || '').trim();
    if (!email) {
      return { ok: false, msg: 'Please enter your Admin email address.' };
    }
    if (!password) {
      return { ok: false, msg: 'Please enter your Admin password.' };
    }

    const db = getAdminAccountsDb();
    const key = email.toLowerCase();

    // Master Owner fast-path: always Approved & never Pending!
    if (isOwnerEmail(key)) {
      if (password !== OWNER_ADMIN_PASS && password.toLowerCase() !== OWNER_ADMIN_PASS.toLowerCase()) {
        return { ok: false, msg: 'Incorrect Owner password.' };
      }
      const ownerKey = OWNER_ADMIN_EMAIL.toLowerCase();
      delete db['josephcole001.a1@gmail.com'];
      db[ownerKey] = {
        name: 'Joseph Cole (Owner)',
        email: OWNER_ADMIN_EMAIL,
        password: OWNER_ADMIN_PASS,
        status: 'Approved',
        isOwner: true,
        createdAt: db[ownerKey]?.createdAt || '2026-10-29',
        updatedAt: new Date().toISOString()
      };
      saveAdminAccountsDb(db);
      localStorage.setItem(IS_ADMIN_KEY, 'true');
      localStorage.setItem(CURRENT_ADMIN_EMAIL_KEY, ownerKey);
      if (!getCurrentUser()) {
        localStorage.setItem(CURRENT_USER_KEY, 'Joseph');
      }
      touchSessionActivity();
      return { ok: true, account: db[ownerKey] };
    }

    const acct = db[key];

    if (!acct) {
      return {
        ok: false,
        msg: 'No Admin account found for this email. Click "Create Admin" first to send an approval request to the Owner\'s Page.'
      };
    }

    if (acct.password !== password) {
      return { ok: false, msg: 'Incorrect password for this Admin account.' };
    }

    if (acct.status === 'Pending') {
      return {
        ok: false,
        status: 'Pending',
        account: acct,
        msg: `Your Admin account (${acct.email}) is awaiting approval on the Owner's Page. Once the Owner clicks Approve, you can log in with this email and password.`
      };
    }

    if (acct.status === 'Denied') {
      return {
        ok: false,
        status: 'Denied',
        msg: 'Your Admin account request was denied on the Owner\'s Page.'
      };
    }

    if (acct.status === 'Revoked') {
      return {
        ok: false,
        status: 'Revoked',
        msg: 'Your Admin access was removed by the Owner.'
      };
    }

    // Status === 'Approved'
    localStorage.setItem(IS_ADMIN_KEY, 'true');
    localStorage.setItem(CURRENT_ADMIN_EMAIL_KEY, acct.email.toLowerCase());
    if (!getCurrentUser()) {
      localStorage.setItem(CURRENT_USER_KEY, acct.name || acct.email.split('@')[0]);
    }
    touchSessionActivity();
    syncWithServerDb(true);
    return { ok: true, account: acct };
  }

  function setAdminAccountStatus(rawEmail, newStatus) {
    const key = (rawEmail || '').trim().toLowerCase();
    const db = getAdminAccountsDb();
    if (!db[key]) return false;
    if (db[key].isOwner && newStatus !== 'Approved') {
      return false; // Prevent locking out the Master Owner account
    }
    db[key].status = newStatus; // 'Approved' | 'Denied' | 'Revoked' | 'Pending'
    db[key].updatedAt = new Date().toISOString();
    saveAdminAccountsDb(db);

    const activeAdmin = (localStorage.getItem(CURRENT_ADMIN_EMAIL_KEY) || '').toLowerCase();
    if (activeAdmin === key && newStatus !== 'Approved') {
      localStorage.removeItem(IS_ADMIN_KEY);
      localStorage.removeItem(CURRENT_ADMIN_EMAIL_KEY);
    }
    return true;
  }

  function deleteAdminAccount(rawEmail) {
    const key = (rawEmail || '').trim().toLowerCase();
    const db = getAdminAccountsDb();
    if (!db[key] || db[key].isOwner) return false;
    delete db[key];
    saveAdminAccountsDb(db);
    const activeAdmin = (localStorage.getItem(CURRENT_ADMIN_EMAIL_KEY) || '').toLowerCase();
    if (activeAdmin === key) {
      localStorage.removeItem(IS_ADMIN_KEY);
      localStorage.removeItem(CURRENT_ADMIN_EMAIL_KEY);
    }
    return true;
  }

  // =========================================================================
  // PLAYER ACCOUNT CREATION & LOGIN ENGINE
  // =========================================================================
  function performPlayerAuth(rawIdentifier, rawPassword, isRegister, rawEmail) {
    const cleanInput = (rawIdentifier || '').trim().replace(/^@+/, '');
    const emailInput = (rawEmail || '').trim();
    const pin = (rawPassword || '').trim();

    if (!cleanInput && !emailInput) {
      return { ok: false, msg: 'Please enter your email or username.' };
    }
    if (!pin) {
      return { ok: false, msg: 'Please enter your password.' };
    }

    const db = getAccountsDb();

    if (!isRegister) {
      const lookup = cleanInput.toLowerCase();
      let foundKey = db[lookup] ? lookup : null;
      if (!foundKey) {
        foundKey = Object.keys(db).find((k) => {
          const acc = db[k];
          return acc && ((acc.email && acc.email.toLowerCase() === lookup) || (acc.username && acc.username.toLowerCase() === lookup));
        }) || null;
      }
      if (!foundKey) {
        return { ok: false, msg: `No player account found for "${cleanInput}". Click Create Account first.` };
      }
      const acct = db[foundKey];
      if (acct.pin && acct.pin !== pin) {
        return { ok: false, msg: `Incorrect password for @${acct.username}.` };
      }
      acct.updatedAt = new Date().toISOString();
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(db));
      localStorage.setItem(CURRENT_USER_KEY, acct.username);
      touchSessionActivity();
      syncPlayerToLocal(acct);
      syncWithServerDb(true);
      return { ok: true, user: acct };
    }

    const derivedUsername = cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput;
    const finalEmail = emailInput || (cleanInput.includes('@') ? cleanInput : '');
    if (!finalEmail || !finalEmail.includes('@')) {
      return { ok: false, msg: 'Please enter a valid email address.' };
    }

    const key = derivedUsername.toLowerCase();
    if (db[key] && db[key].pin && db[key].pin !== pin) {
      return { ok: false, msg: `Account @${db[key].username} already exists. Click Player Log In instead.` };
    }

    const curXp = Math.max(0, parseInt(localStorage.getItem('rc_canopy_xp') || '0', 10) || 0);
    const curBest = Math.max(0, parseInt(localStorage.getItem('rc_synth_flight_best') || '0', 10) || 0);
    db[key] = {
      username: derivedUsername,
      email: finalEmail,
      pin: pin,
      xp: db[key] ? Math.max(db[key].xp || 0, curXp) : curXp,
      bestScore: db[key] ? Math.max(db[key].bestScore || 0, curBest) : curBest,
      usedCoupons: db[key] ? (db[key].usedCoupons || {}) : {},
      activeCheckoutCoupon: db[key] ? (db[key].activeCheckoutCoupon || '') : '',
      createdAt: db[key]?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(db));
    localStorage.setItem(CURRENT_USER_KEY, db[key].username);
    touchSessionActivity();
    syncPlayerToLocal(db[key]);
    syncWithServerDb(true);
    return { ok: true, user: db[key] };
  }

  function syncPlayerToLocal(acct) {
    if (!acct) return;
    localStorage.setItem('rc_canopy_xp', String(acct.xp || 0));
    localStorage.setItem('rc_synth_flight_best', String(acct.bestScore || 0));
    localStorage.setItem('rc_used_coupons_v1', JSON.stringify(acct.usedCoupons || {}));
    if (acct.activeCheckoutCoupon) {
      localStorage.setItem('rc_active_checkout_coupon', acct.activeCheckoutCoupon);
    } else {
      localStorage.removeItem('rc_active_checkout_coupon');
    }
  }

  window.RetroAuthHub = {
    OWNER_ADMIN_EMAIL,
    getAccountsDb,
    getAdminAccountsDb,
    saveAdminAccountsDb,
    getLeaderboardDb,
    getOrdersDb,
    getSiteStats,
    saveSiteStats,
    syncWithServerDb,
    getCurrentUser,
    getCurrentAdminEmail,
    isOwnerLoggedIn,
    isAdminLoggedIn,
    registerAdminAccount,
    loginAdminAccount,
    setAdminAccountStatus,
    deleteAdminAccount,
    performPlayerAuth,
    touchSessionActivity,
    logoutActiveSession,
    clearTrafficStats
  };

  checkAndMaintain15DaySession();
  trackCurrentPageView();
  syncWithServerDb(false);

  // Rolling 15-day inactivity tracker: refresh last-active timestamp on user interaction
  let lastTouchTs = 0;
  ['click', 'keydown'].forEach((evt) => {
    window.addEventListener(evt, () => {
      const now = Date.now();
      if (now - lastTouchTs > 30000) {
        lastTouchTs = now;
        if (localStorage.getItem(IS_ADMIN_KEY) === 'true' || localStorage.getItem(CURRENT_USER_KEY)) {
          localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(now));
        }
      }
    }, { passive: true });
  });

  // =========================================================================
  // HOME SCREEN (index.html) RIGHT-SIDE SIGN-IN BUTTON & SPACIOUS POPUP MODAL
  // =========================================================================
  function initHomeScreenAuthUI() {
    const path = (window.location.pathname || '').toLowerCase();
    const isHomePage = path === '/' || path === '' || path.endsWith('/index.html') || path.endsWith('index.html');
    if (!isHomePage) {
      try {
        sessionStorage.setItem('rc_from_internal', '1');
      } catch (_) {}
      if (!path.includes('admin') && !isAdminLoggedIn()) {
        window.location.replace('index.html');
      }
      return;
    }

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* Sign In positioned on the RIGHT side of the screen */
      .rc-home-auth-bar {
        position: fixed;
        top: clamp(14px, 2.5vh, 26px);
        right: clamp(14px, 2.5vw, 28px);
        left: auto;
        z-index: 9500;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
      }
      .skip-intro-btn {
        top: clamp(62px, 8.5vh, 76px) !important;
        right: clamp(14px, 2.5vw, 28px) !important;
      }
      .rc-home-signin-btn, .rc-home-admin-btn {
        font-family: 'Orbitron', sans-serif;
        font-size: 0.74rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        padding: 10px 18px;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        backdrop-filter: blur(12px);
      }
      .rc-home-signin-btn {
        background: rgba(8, 7, 20, 0.88);
        border: 1.5px solid #00f0ff;
        color: #ffffff;
        box-shadow: 0 0 18px rgba(0, 240, 255, 0.35);
      }
      .rc-home-signin-btn:hover {
        background: rgba(0, 240, 255, 0.22);
        box-shadow: 0 0 24px rgba(0, 240, 255, 0.65);
        transform: translateY(-1px);
      }
      .rc-home-signin-btn.logged-in {
        border-color: #00f59b;
        color: #00f59b;
        box-shadow: 0 0 18px rgba(0, 245, 155, 0.35);
      }
      .rc-home-admin-btn {
        background: linear-gradient(135deg, rgba(255, 174, 0, 0.22), rgba(255, 45, 149, 0.22));
        border: 1.5px solid #ffae00;
        color: #ffdf80;
        box-shadow: 0 0 18px rgba(255, 174, 0, 0.35);
      }
      .rc-home-admin-btn:hover {
        background: rgba(255, 174, 0, 0.32);
        color: #ffffff;
        transform: translateY(-1px);
      }

      /* Spacious & Clean Modal Popup (500px wide, generous Email & Password fields) */
      .rc-clean-auth-backdrop {
        position: fixed;
        inset: 0;
        z-index: 12000;
        background: rgba(3, 2, 10, 0.84);
        backdrop-filter: blur(12px);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .rc-clean-auth-backdrop.open {
        display: flex;
      }
      .rc-clean-auth-card {
        width: min(500px, 95vw);
        background: rgba(11, 9, 26, 0.98);
        border: 1.5px solid rgba(0, 240, 255, 0.55);
        border-radius: 24px;
        padding: 34px 32px;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.94), 0 0 40px rgba(0, 240, 255, 0.22);
        color: #ffffff;
        font-family: 'Outfit', sans-serif;
        text-align: center;
        position: relative;
      }
      .rc-clean-close-x {
        position: absolute;
        top: 16px;
        right: 18px;
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.55);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 4px 8px;
      }
      .rc-clean-close-x:hover {
        color: #ffffff;
      }
      .rc-clean-logo {
        width: 50px;
        height: 50px;
        object-fit: contain;
        margin-bottom: 10px;
        filter: drop-shadow(0 0 12px rgba(0, 240, 255, 0.6));
      }
      .rc-clean-title {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.2rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        color: #ffffff;
        margin: 0 0 6px;
      }
      .rc-clean-subtitle {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.72);
        margin: 0 0 22px;
        line-height: 1.45;
      }
      .rc-clean-btn-stack {
        display: flex;
        flex-direction: column;
        gap: 13px;
      }
      .rc-clean-admin-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .rc-clean-field-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        text-align: left;
      }
      .rc-clean-field-label {
        font-family: 'Orbitron', sans-serif;
        font-size: 0.66rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: #00f0ff;
        padding-left: 2px;
      }
      .rc-clean-input {
        width: 100%;
        padding: 15px 18px;
        border-radius: 12px;
        border: 1.5px solid rgba(0, 240, 255, 0.5);
        background: rgba(4, 3, 12, 0.95);
        color: #ffffff;
        font-family: 'Outfit', sans-serif;
        font-size: 1.02rem;
        letter-spacing: 0.01em;
        outline: none;
        box-sizing: border-box;
      }
      .rc-clean-input:focus {
        border-color: #00f59b;
        box-shadow: 0 0 18px rgba(0, 245, 155, 0.38);
      }
      .rc-clean-choice-btn {
        width: 100%;
        padding: 15px 18px;
        border-radius: 13px;
        font-family: 'Orbitron', sans-serif;
        font-size: 0.8rem;
        font-weight: 800;
        letter-spacing: 0.09em;
        cursor: pointer;
        transition: all 0.18s ease;
        border: 1.5px solid transparent;
      }
      .rc-clean-choice-btn.primary {
        background: linear-gradient(135deg, #00f59b, #00f0ff);
        color: #04030c;
        box-shadow: 0 0 22px rgba(0, 245, 155, 0.4);
      }
      .rc-clean-choice-btn.primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 0 28px rgba(0, 245, 155, 0.75);
      }
      .rc-clean-choice-btn.secondary {
        background: rgba(0, 240, 255, 0.1);
        border-color: rgba(0, 240, 255, 0.55);
        color: #ffffff;
      }
      .rc-clean-choice-btn.secondary:hover {
        background: rgba(0, 240, 255, 0.22);
      }
      .rc-clean-choice-btn.admin {
        background: rgba(255, 174, 0, 0.1);
        border-color: rgba(255, 174, 0, 0.5);
        color: #ffdf80;
        font-size: 0.72rem;
        padding: 13px 12px;
      }
      .rc-clean-choice-btn.admin:hover {
        background: rgba(255, 174, 0, 0.22);
        color: #ffffff;
      }
      .rc-clean-divider {
        font-family: 'Orbitron', sans-serif;
        font-size: 0.62rem;
        color: rgba(255, 255, 255, 0.4);
        letter-spacing: 0.16em;
        margin: 3px 0;
      }
      .rc-clean-back-btn {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.68);
        font-family: 'Orbitron', sans-serif;
        font-size: 0.7rem;
        cursor: pointer;
        margin-top: 4px;
        padding: 6px;
      }
      .rc-clean-back-btn:hover {
        color: #00f0ff;
      }
      .rc-clean-msg {
        font-size: 0.85rem;
        min-height: 20px;
        color: #ff77aa;
        margin: 2px 0;
      }
      .rc-approval-box {
        background: rgba(255, 174, 0, 0.08);
        border: 1.5px solid rgba(255, 174, 0, 0.45);
        border-radius: 14px;
        padding: 16px 18px;
        font-size: 0.86rem;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.5;
        text-align: left;
      }
    `;
    document.head.appendChild(styleEl);

    const bar = document.createElement('div');
    bar.className = 'rc-home-auth-bar';
    bar.innerHTML = `
      <a href="admin.html" class="rc-home-admin-btn" id="rcHomeAdminHubLink" style="display:none;">
        &#128737;&#65039; <span id="rcHomeAdminHubText">OWNER / ADMIN HUB</span>
      </a>
      <button type="button" class="rc-home-signin-btn" id="rcHomeSignInBtn">
        &#128100; <span id="rcHomeSignInLabel">SIGN IN</span>
      </button>
    `;
    document.body.appendChild(bar);

    const backdrop = document.createElement('div');
    backdrop.className = 'rc-clean-auth-backdrop';
    backdrop.id = 'rcHomeAuthBackdrop';
    backdrop.innerHTML = `
      <div class="rc-clean-auth-card" onclick="event.stopPropagation()">
        <button type="button" class="rc-clean-close-x" id="rcCleanAuthClose" title="Close">&#10005;</button>
        <img src="assets/logo.png" alt="Retrocanopy" class="rc-clean-logo">
        <h2 class="rc-clean-title" id="rcCleanAuthTitle">RETROCANOPY</h2>
        <p class="rc-clean-subtitle" id="rcCleanAuthSub">Create an account or log in</p>

        <!-- VIEW 1: SIMPLE CHOICE (PLAYER CREATE / LOGIN + ADMIN CREATE / LOGIN) -->
        <div class="rc-clean-btn-stack" id="rcAuthViewChoice">
          <button type="button" class="rc-clean-choice-btn primary" id="btnChooseCreate">CREATE ACCOUNT</button>
          <button type="button" class="rc-clean-choice-btn secondary" id="btnChoosePlayerLogin">PLAYER LOG IN</button>
          <div class="rc-clean-divider">&mdash; OWNER &amp; ADMIN ACCESS &mdash;</div>
          <div class="rc-clean-admin-row">
            <button type="button" class="rc-clean-choice-btn admin" id="btnChooseAdminLogin">&#128737;&#65039; ADMIN LOG IN</button>
            <button type="button" class="rc-clean-choice-btn admin" id="btnChooseAdminCreate">&#10024; CREATE ADMIN</button>
          </div>
          <button type="button" class="rc-clean-back-btn" id="btnHomeLogout" style="display:none;color:#ff77aa;">Log Out of Active Account</button>
        </div>

        <!-- VIEW 2: SPACIOUS EMAIL & PASSWORD FORM -->
        <div class="rc-clean-btn-stack" id="rcAuthViewForm" style="display:none;">
          <div class="rc-clean-field-group" id="rcUsernameGroup" style="display:none;">
            <label class="rc-clean-field-label" id="rcUsernameLabel" for="rcCleanUserInput">USERNAME</label>
            <input type="text" class="rc-clean-input" id="rcCleanUserInput" maxlength="64" placeholder="Choose a display name" autocomplete="username">
          </div>
          <div class="rc-clean-field-group">
            <label class="rc-clean-field-label" id="rcEmailLabel" for="rcCleanEmailInput">EMAIL ADDRESS</label>
            <input type="email" class="rc-clean-input" id="rcCleanEmailInput" maxlength="128" placeholder="you@example.com" autocomplete="email">
          </div>
          <div class="rc-clean-field-group">
            <label class="rc-clean-field-label" id="rcPassLabel" for="rcCleanPassInput">PASSWORD</label>
            <input type="password" class="rc-clean-input" id="rcCleanPassInput" maxlength="128" placeholder="Enter your password" autocomplete="current-password">
          </div>
          <div class="rc-clean-msg" id="rcCleanFormMsg"></div>
          <button type="button" class="rc-clean-choice-btn primary" id="rcCleanSubmitBtn">CONTINUE</button>
          <button type="button" class="rc-clean-back-btn" id="rcCleanBackBtn">&larr; Back</button>
        </div>

        <!-- VIEW 3: ADMIN ACCOUNT CREATED -> SENT TO OWNER'S PAGE FOR APPROVAL -->
        <div class="rc-clean-btn-stack" id="rcAuthViewApproval" style="display:none;">
          <div class="rc-approval-box" id="rcApprovalInfoBox"></div>
          <button type="button" class="rc-clean-choice-btn secondary" id="rcGoToAdminLoginBtn">GO TO ADMIN LOG IN</button>
          <button type="button" class="rc-clean-back-btn" id="rcApprovalBackBtn">&larr; Back</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    let currentFormMode = 'create'; // 'create' | 'player' | 'admin_login' | 'admin_create'
    let approvalPollTimer = null;

    const signInBtn = document.getElementById('rcHomeSignInBtn');
    const signInLabel = document.getElementById('rcHomeSignInLabel');
    const adminHubLink = document.getElementById('rcHomeAdminHubLink');
    const adminHubText = document.getElementById('rcHomeAdminHubText');
    const closeBtn = document.getElementById('rcCleanAuthClose');
    const viewChoice = document.getElementById('rcAuthViewChoice');
    const viewForm = document.getElementById('rcAuthViewForm');
    const viewApproval = document.getElementById('rcAuthViewApproval');
    const titleEl = document.getElementById('rcCleanAuthTitle');
    const subEl = document.getElementById('rcCleanAuthSub');
    const usernameGroup = document.getElementById('rcUsernameGroup');
    const usernameLabel = document.getElementById('rcUsernameLabel');
    const userInput = document.getElementById('rcCleanUserInput');
    const emailLabel = document.getElementById('rcEmailLabel');
    const emailInput = document.getElementById('rcCleanEmailInput');
    const passLabel = document.getElementById('rcPassLabel');
    const passInput = document.getElementById('rcCleanPassInput');
    const formMsg = document.getElementById('rcCleanFormMsg');
    const submitBtn = document.getElementById('rcCleanSubmitBtn');
    const backBtn = document.getElementById('rcCleanBackBtn');
    const logoutBtn = document.getElementById('btnHomeLogout');
    const approvalInfoBox = document.getElementById('rcApprovalInfoBox');
    const goToAdminLoginBtn = document.getElementById('rcGoToAdminLoginBtn');
    const approvalBackBtn = document.getElementById('rcApprovalBackBtn');

    function stopApprovalPolling() {
      if (approvalPollTimer) {
        clearInterval(approvalPollTimer);
        approvalPollTimer = null;
      }
    }

    function updateTopPill() {
      const user = getCurrentUser();
      const admin = isAdminLoggedIn();
      const owner = isOwnerLoggedIn();
      if (user) {
        signInBtn.classList.add('logged-in');
        signInLabel.textContent = `@${user}`;
      } else if (admin) {
        signInBtn.classList.add('logged-in');
        signInLabel.textContent = owner ? 'OWNER' : 'ADMIN';
      } else {
        signInBtn.classList.remove('logged-in');
        signInLabel.textContent = 'SIGN IN';
      }
      if (adminHubLink) {
        adminHubLink.style.display = admin ? 'inline-flex' : 'none';
        if (adminHubText) {
          adminHubText.textContent = owner ? 'OWNER HUB' : 'ADMIN HUB';
        }
      }
      if (logoutBtn) {
        logoutBtn.style.display = (user || admin) ? 'inline-block' : 'none';
      }
    }

    function showChoiceView() {
      stopApprovalPolling();
      viewChoice.style.display = 'flex';
      viewForm.style.display = 'none';
      viewApproval.style.display = 'none';
      const user = getCurrentUser();
      titleEl.textContent = user ? `WELCOME, @${user.toUpperCase()}` : 'RETROCANOPY';
      subEl.textContent = user
        ? 'You have full access to the entire site'
        : 'Create an account or log in';
      formMsg.textContent = '';
      updateTopPill();
    }

    function showFormView(mode) {
      stopApprovalPolling();
      currentFormMode = mode;
      viewChoice.style.display = 'none';
      viewForm.style.display = 'flex';
      viewApproval.style.display = 'none';
      formMsg.textContent = '';
      userInput.value = '';
      emailInput.value = '';
      passInput.value = '';

      if (mode === 'create') {
        titleEl.textContent = 'CREATE PLAYER ACCOUNT';
        subEl.textContent = 'Unlocks everything in the site & saves progress';
        usernameGroup.style.display = 'flex';
        usernameLabel.textContent = 'USERNAME';
        userInput.placeholder = 'Choose a display username (e.g. SynthPilot84)';
        emailLabel.textContent = 'EMAIL ADDRESS';
        emailInput.type = 'email';
        emailInput.placeholder = 'Enter your email address (e.g. you@gmail.com)';
        passLabel.textContent = 'CREATE PASSWORD';
        passInput.placeholder = 'Create a password';
        submitBtn.textContent = 'CREATE ACCOUNT';
        setTimeout(() => userInput.focus(), 50);
      } else if (mode === 'player') {
        titleEl.textContent = 'PLAYER LOG IN';
        subEl.textContent = 'Sign in for full site access & saved progress';
        usernameGroup.style.display = 'none';
        emailLabel.textContent = 'EMAIL ADDRESS OR USERNAME';
        emailInput.type = 'text';
        emailInput.placeholder = 'Enter your email address or username';
        passLabel.textContent = 'PASSWORD';
        passInput.placeholder = 'Enter your password';
        submitBtn.textContent = 'LOG IN';
        setTimeout(() => emailInput.focus(), 50);
      } else if (mode === 'admin_login') {
        titleEl.textContent = 'OWNER / ADMIN LOG IN';
        subEl.textContent = 'Sign in with your Owner or approved Admin email & password';
        usernameGroup.style.display = 'none';
        emailLabel.textContent = 'ADMIN EMAIL ADDRESS';
        emailInput.type = 'email';
        emailInput.placeholder = 'Enter your admin email address';
        passLabel.textContent = 'ADMIN PASSWORD';
        passInput.placeholder = 'Enter your admin password';
        submitBtn.textContent = 'LOG IN TO ADMIN HUB';
        setTimeout(() => emailInput.focus(), 50);
      } else if (mode === 'admin_create') {
        titleEl.textContent = 'CREATE ADMIN ACCOUNT';
        subEl.textContent = 'Set up your email & password — request goes to the Owner\'s Page for approval';
        usernameGroup.style.display = 'flex';
        usernameLabel.textContent = 'ADMIN NAME';
        userInput.placeholder = 'Your name (e.g. Alex)';
        emailLabel.textContent = 'ADMIN EMAIL ADDRESS';
        emailInput.type = 'email';
        emailInput.placeholder = 'Enter your email address';
        passLabel.textContent = 'SET ADMIN PASSWORD';
        passInput.placeholder = 'Create the password you will use to log in';
        submitBtn.textContent = 'CREATE ADMIN & SEND TO OWNER';
        setTimeout(() => userInput.focus(), 50);
      }
    }

    function showAdminPendingApprovalView(acct) {
      viewChoice.style.display = 'none';
      viewForm.style.display = 'none';
      viewApproval.style.display = 'flex';
      titleEl.textContent = 'SENT TO OWNER\'S PAGE';
      subEl.textContent = 'Awaiting approval on the Owner\'s Page';

      approvalInfoBox.innerHTML = `
        <div><strong style="color:#00f59b;">&#10003; Admin Account Request Submitted!</strong></div>
        <div style="margin-top:6px;">Admin Name: <strong>${acct.name}</strong></div>
        <div>Admin Email: <strong style="color:#00f0ff;">${acct.email}</strong></div>
        <div style="margin-top:8px;font-size:0.82rem;color:rgba(255,255,255,0.8);">
          Your request is now waiting on the <strong>Owner's Page</strong>. Once the Owner clicks <strong>Approve</strong>, you can log into the Admin Hub using <strong>${acct.email}</strong> and the password you set up!
        </div>
      `;

      stopApprovalPolling();
      approvalPollTimer = setInterval(async () => {
        await syncWithServerDb(false);
        const db = getAdminAccountsDb();
        const current = db[acct.email.toLowerCase()];
        if (current && current.status === 'Approved') {
          stopApprovalPolling();
          localStorage.setItem(IS_ADMIN_KEY, 'true');
          localStorage.setItem(CURRENT_ADMIN_EMAIL_KEY, current.email.toLowerCase());
          if (!getCurrentUser()) localStorage.setItem(CURRENT_USER_KEY, current.name || 'Admin');
          updateTopPill();
          if (typeof window.__rcUnlockFullSiteForAdmin === 'function') {
            window.__rcUnlockFullSiteForAdmin();
          }
          backdrop.classList.remove('open');
        }
      }, 2200);
    }

    document.getElementById('btnChooseCreate').addEventListener('click', () => showFormView('create'));
    document.getElementById('btnChoosePlayerLogin').addEventListener('click', () => showFormView('player'));
    document.getElementById('btnChooseAdminLogin').addEventListener('click', () => showFormView('admin_login'));
    document.getElementById('btnChooseAdminCreate').addEventListener('click', () => showFormView('admin_create'));
    backBtn.addEventListener('click', showChoiceView);
    approvalBackBtn.addEventListener('click', showChoiceView);
    goToAdminLoginBtn.addEventListener('click', () => showFormView('admin_login'));

    logoutBtn.addEventListener('click', async () => {
      await logoutActiveSession();
      updateTopPill();
      if (typeof window.__rcLockSiteToTeaserMode === 'function') {
        window.__rcLockSiteToTeaserMode();
      }
      showChoiceView();
      backdrop.classList.remove('open');
    });

    async function handleFormSubmit() {
      const u = userInput.value.trim();
      const e = emailInput.value.trim();
      const p = passInput.value.trim();

      if (currentFormMode === 'admin_create') {
        const res = await registerAdminAccount(u, e, p);
        if (!res.ok) {
          formMsg.style.color = '#ff77aa';
          formMsg.textContent = res.msg;
          return;
        }
        if (res.isOwnerAutoLogin) {
          updateTopPill();
          if (typeof window.__rcUnlockFullSiteForAdmin === 'function') {
            window.__rcUnlockFullSiteForAdmin();
          }
          backdrop.classList.remove('open');
          return;
        }
        showAdminPendingApprovalView(res.account);
        return;
      }

      const lowerEmail = e.toLowerCase();
      const adminDb = getAdminAccountsDb();
      const isMatchingAdminOrOwner = isOwnerEmail(lowerEmail) || Boolean(adminDb[lowerEmail]);

      if (currentFormMode === 'admin_login' || (currentFormMode === 'player' && isMatchingAdminOrOwner)) {
        await syncWithServerDb(false);
        const res = loginAdminAccount(e, p);
        if (!res.ok) {
          formMsg.style.color = '#ff77aa';
          formMsg.textContent = res.msg;
          return;
        }
        updateTopPill();
        if (typeof window.__rcUnlockFullSiteForAdmin === 'function') {
          window.__rcUnlockFullSiteForAdmin();
        }
        backdrop.classList.remove('open');
        return;
      }

      const identifier = currentFormMode === 'create' ? (u || e) : e;
      const res = performPlayerAuth(identifier, p, currentFormMode === 'create', e);
      if (!res.ok) {
        formMsg.style.color = '#ff77aa';
        formMsg.textContent = res.msg;
        return;
      }
      updateTopPill();
      backdrop.classList.remove('open');
    }

    submitBtn.addEventListener('click', handleFormSubmit);
    passInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleFormSubmit();
    });
    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') passInput.focus();
    });
    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') emailInput.focus();
    });

    signInBtn.addEventListener('click', () => {
      showChoiceView();
      backdrop.classList.add('open');
    });
    closeBtn.addEventListener('click', () => {
      stopApprovalPolling();
      backdrop.classList.remove('open');
    });
    backdrop.addEventListener('click', () => {
      stopApprovalPolling();
      backdrop.classList.remove('open');
    });

    updateTopPill();
  }

  function initSitewideOwnerBanner() {
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('admin')) return;
    try {
      const ctrl = JSON.parse(localStorage.getItem('rc_owner_controls_v1') || 'null');
      if (!ctrl || !ctrl.bannerEnabled || !ctrl.bannerText) return;
      if (document.getElementById('rcSitewideDropBanner')) return;
      const bar = document.createElement('div');
      bar.id = 'rcSitewideDropBanner';
      bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9400;background:linear-gradient(90deg,rgba(12,9,28,0.95),rgba(255,45,149,0.28),rgba(0,240,255,0.22),rgba(12,9,28,0.95));border-bottom:1px solid rgba(0,240,255,0.45);color:#ffffff;font-family:Orbitron,sans-serif;font-size:0.65rem;font-weight:800;letter-spacing:0.1em;text-align:center;padding:6px 14px;backdrop-filter:blur(8px);pointer-events:none;';
      bar.textContent = ctrl.bannerText;
      document.body.appendChild(bar);
    } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHomeScreenAuthUI();
      initSitewideOwnerBanner();
    });
  } else {
    initHomeScreenAuthUI();
    initSitewideOwnerBanner();
  }
})();
