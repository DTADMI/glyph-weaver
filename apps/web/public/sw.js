/**
 * Glyph Weaver service worker.
 *
 * Scope: make the studio openable offline and keep the static shell fast. It is
 * deliberately small and manual (no next-pwa) because the app is a single
 * client-rendered studio: the only things worth caching are the static assets
 * and an offline fallback page.
 *
 * Strategy:
 *  - navigations: network first, `/offline` when the network is unavailable;
 *  - hashed static assets (`/_next/static`, fonts, images): cache first;
 *  - everything else (RSC payloads, API, cross-origin): untouched.
 */
const CACHE = 'glyph-weaver-shell-v1';
const OFFLINE_URL = '/offline';
const PRECACHE = [OFFLINE_URL];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Next.js RSC payloads are content-addressed to a build; caching them across
  // deploys would serve stale UI. Leave them to the network.
  if (url.searchParams.has('_rsc')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    /\.(?:css|js|mjs|woff2?|png|svg|ico|webp)$/.test(url.pathname);
  if (!isStatic) return;

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
