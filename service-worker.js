const CACHE_NAME = 'dokohilf-shell-v20260805-13';
const CORE_FILES = [
  './',
  './index.html',
  './assets/styles.css?v=20260805-12',
  './assets/mobile-audio-fix.js?v=20260805-12',
  './assets/routing-fix.js?v=20260805-block1',
  './assets/app.js?v=20260805-12',
  './manifest.webmanifest',
  './icon.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request, { cache: 'no-store' });
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      return (await caches.match(request))
        || (request.mode === 'navigate' ? await caches.match('./index.html') : Response.error());
    }
  })());
});
