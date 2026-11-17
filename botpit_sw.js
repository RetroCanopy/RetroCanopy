self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-first pass-through fetch handler scoped to Shibuya Bot Pit so Chrome/Android/Edge
// enables native WebAPK / PWA installation without caching or intercepting other site pages.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url || '';
  if (!url.includes('shibuya_bot_pit')) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
