/**
 * 🛰️ Institutional Service Worker: Offline Presence Node
 * Manifests minimal PWA support for standalone home-screen installation.
 */
const CACHE_NAME = 'lab-intel-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Pass-through strategy for Institutional Matrix Synchronization
  event.respondWith(fetch(event.request));
});
