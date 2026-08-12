// Fondasi PWA — service worker minimal. Sengaja BELUM melakukan caching
// agresif/offline-first (supaya data dashboard selalu fresh); ini cuma
// prasyarat teknis supaya browser menganggap app installable. Strategi
// caching/offline penuh + push notification menyusul di fase berikutnya.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No-op passthrough — biarkan browser handle fetch seperti biasa.
});
