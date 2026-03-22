/**
 * 🛰️ Institutional Service Worker: Offline Presence Node
 * Minimal PWA support - NO CACHING. Network-first always.
 */
const CACHE_VERSION = 'lab-intel-v3-nocache';

self.addEventListener('install', (event) => {
  // Immediately activate - don't wait for old tabs
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Purge ALL old caches on activation
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always fetch from network - never serve cached content
  event.respondWith(fetch(event.request));
});
