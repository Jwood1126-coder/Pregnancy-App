/**
 * Little One service worker.
 *
 * Explicit precache of every app asset under a versioned cache name, then
 * cache-first for same-origin GETs so the app opens instantly and works fully
 * offline. Bump CACHE_NAME whenever assets change.
 */

/* eslint-env serviceworker */

const CACHE_NAME = 'little-one-v1';

/**
 * Every file the app needs to run offline. Missing entries (icons that a later
 * agent generates) are tolerated — install never fails on one bad asset.
 */
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/main.js',
  './js/lib/types.js',
  './js/lib/dom.js',
  './js/lib/weekMath.js',
  './js/lib/scale.js',
  './js/lib/units.js',
  './js/lib/storage.js',
  './js/data/sizes.js',
  './js/data/weeks/index.js',
  './js/data/weeks/weeks04to12.js',
  './js/data/weeks/weeks13to20.js',
  './js/data/weeks/weeks21to28.js',
  './js/data/weeks/weeks29to35.js',
  './js/data/weeks/weeks36to42.js',
  './js/components/card.js',
  './js/components/tabbar.js',
  './js/components/disclaimer.js',
  './js/components/today/edge.js',
  './js/components/today/header.js',
  './js/components/today/icons.js',
  './js/components/today/nutrition.js',
  './js/components/today/prose.js',
  './js/components/today/redFlags.js',
  './js/components/today/sizeCard.js',
  './js/components/today/styles.js',
  './js/components/today/swipe.js',
  './js/components/today/todos.js',
  './js/components/today/weekNav.js',
  './js/screens/welcome.js',
  './js/screens/today.js',
  './js/screens/size.js',
  './js/screens/settings.js',
  './js/features/size/silhouettes.js',
  './js/features/size/calibration.js',
  './js/features/size/scrubber.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' }))));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok && response.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      } catch (err) {
        const fallback = await caches.match('./index.html');
        if (request.mode === 'navigate' && fallback) return fallback;
        throw err;
      }
    })()
  );
});
