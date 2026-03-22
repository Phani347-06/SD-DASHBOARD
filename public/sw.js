/**
 * 🛰️ Institutional Service Worker: Offline Presence Node
 * Manifests minimal PWA support for standalone home-screen installation.
 */
const CACHE_NAME = 'lab-intel-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through strategy for Institutional Matrix Synchronization
  event.respondWith(fetch(event.request));
});
