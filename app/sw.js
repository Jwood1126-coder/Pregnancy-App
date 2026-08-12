/**
 * Little One service worker.
 *
 * Explicit precache of every app asset under a versioned cache name, so the app
 * opens instantly and works fully offline.
 *
 * Freshness: the files that change between deploys (the page itself, JS, CSS,
 * the manifest) are served **stale-while-revalidate** — the cached copy answers
 * immediately, a background fetch updates the cache, and the next launch is
 * current. Without that, a corrected line of medical guidance would never reach
 * an installed user unless somebody remembered to edit a string in this file.
 * Immutable assets (icons) stay pure cache-first.
 */

/* eslint-env serviceworker */

/**
 * Cache generation. Tied to the app version rather than a free-floating
 * literal, and asserted against `APP_VERSION` in `js/screens/settings.js` by
 * test/content.test.mjs — so shipping a new version cannot silently reuse the
 * old cache.
 */
const CACHE_VERSION = '0.1.0';

const CACHE_NAME = `little-one-v${CACHE_VERSION}`;

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
  './js/lib/sheetDrag.js',
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

/**
 * True for the things a deploy changes: the document itself, modules, styles,
 * the manifest. Icons and other static assets are treated as immutable.
 * @param {Request} request
 * @param {URL} url
 * @returns {boolean}
 */
function isVolatile(request, url) {
  if (request.mode === 'navigate') return true;
  if (url.pathname.endsWith('/')) return true;
  return /\.(?:html|js|mjs|css|webmanifest|json)$/i.test(url.pathname);
}

/**
 * Fetch, store, and report whether the stored copy actually changed.
 * @param {Request} request
 * @returns {Promise<Response|null>} The fresh response, or null when offline.
 */
async function revalidate(request) {
  let response;
  try {
    response = await fetch(request);
  } catch {
    return null;
  }
  if (!response || !response.ok || response.type !== 'basic') return response ?? null;

  const cache = await caches.open(CACHE_NAME);
  const previous = await cache.match(request, { ignoreSearch: true });
  await cache.put(request, response.clone());

  const changed =
    previous &&
    (previous.headers.get('etag') !== response.headers.get('etag') ||
      previous.headers.get('last-modified') !== response.headers.get('last-modified'));
  if (changed) {
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      client.postMessage({ type: 'little-one:asset-updated', url: request.url });
    }
  }
  return response;
}

/**
 * Cache-first for immutable assets, stale-while-revalidate for everything a
 * deploy can change, and the shell as the offline fallback for navigations.
 * @param {FetchEvent} event
 * @param {Request} request
 * @param {URL} url
 * @returns {Promise<Response>}
 */
async function respond(event, request, url) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) {
    if (isVolatile(request, url)) event.waitUntil(revalidate(request));
    return cached;
  }

  const fresh = await revalidate(request);
  if (fresh) return fresh;

  const fallback = await caches.match('./index.html');
  if (request.mode === 'navigate' && fallback) return fallback;
  return new Response('Offline', {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(respond(event, request, url));
});
