// Lao Calendar PWA Service Worker (Offline-First)
const CACHE_NAME = 'lao-calendar-pwa-v14';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './holidays.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
];

// Install: precache critical assets with resilient individual caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (asset) => {
          try {
            await cache.add(asset);
          } catch (err) {
            console.warn('Could not precache:', asset, err);
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches & take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: robustly find index.html from cache regardless of scope/relative path
async function getCachedIndexHtml() {
  const cache = await caches.open(CACHE_NAME);
  const keysToTry = [
    './index.html',
    'index.html',
    './',
    '/index.html',
    '/'
  ];
  for (const k of keysToTry) {
    const res = await cache.match(k, { ignoreSearch: true });
    if (res) return res;
  }
  
  // Search across all cache entries for an index.html or root page
  const cachedKeys = await cache.keys();
  for (const request of cachedKeys) {
    if (request.url.endsWith('index.html') || request.url.endsWith('/')) {
      const res = await cache.match(request);
      if (res) return res;
    }
  }
  return null;
}

// Fetch: Stale-While-Revalidate & Cache-First strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // 1. Navigation requests (HTML page loads, pull-down refresh, reloads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Attempt network fetch
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, copy);
            cache.put('./index.html', copy.clone());
            return networkResponse;
          }
        } catch (err) {
          // Offline or network unavailable
        }

        // Return cached HTML app shell
        const cachedHtml = await getCachedIndexHtml();
        if (cachedHtml) {
          return cachedHtml;
        }

        // Ultimate fallback response
        return new Response(
          '<!doctype html><html lang="lo"><head><meta charset="utf-8"/><title>ປະຕິທິນລາວ</title></head><body style="font-family:sans-serif;text-align:center;padding:40px;"><h2>ກະລຸນາເປີດແອັບປະຕິທິນລາວ 2026</h2><p>ແອັບຮອງຮັບການໃຊ້ງານອອບລາຍ 100%</p></body></html>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })()
    );
    return;
  }

  // 2. All other assets (JS, CSS, fonts, holidays.json, icons, images)
  event.respondWith(
    (async () => {
      // Check cache first
      const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache for offline use
      try {
        const networkResponse = await fetch(event.request);
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === 'basic' || networkResponse.type === 'cors')
        ) {
          const responseToCache = networkResponse.clone();
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, responseToCache);
        }
        return networkResponse;
      } catch (err) {
        // Return empty response on network failure
        return new Response('', { status: 408, statusText: 'Offline Request' });
      }
    })()
  );
});
