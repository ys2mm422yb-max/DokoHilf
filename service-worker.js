const BUILD_ID = '20260805-18';
const CACHE_NAME = `dokohilf-shell-${BUILD_ID}`;
const CORE_FILES = [
  './',
  './index.html',
  './version.json',
  './assets/styles.css?v=20260805-18',
  './assets/update-manager.js?v=20260805-18',
  './assets/mobile-audio-fix.js?v=20260805-18',
  './assets/voice-diagnostics.js?v=20260805-18',
  './assets/routing-fix.js?v=20260805-18',
  './assets/clarification-ui.js?v=20260805-18',
  './assets/guide-progress.js?v=20260805-18',
  './assets/app.js?v=20260805-18',
  './manifest.webmanifest',
  './icon.svg',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_FILES);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key !== CACHE_NAME)
      .map(key => caches.delete(key)));

    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({ type: 'DOKOHILF_UPDATED', buildId: BUILD_ID });
      if (typeof client.navigate === 'function' && client.url.startsWith(self.location.origin)) {
        client.navigate(client.url).catch(() => {});
      }
    }
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data?.type === 'GET_BUILD_ID') {
    event.ports?.[0]?.postMessage({ buildId: BUILD_ID });
  }
});

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) || null;
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .catch(() => new Response(JSON.stringify({ buildId: BUILD_ID, offline: true }), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        })),
    );
    return;
  }

  event.respondWith((async () => {
    const response = await networkFirst(request);
    if (response) return response;
    if (request.mode === 'navigate') {
      return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
    }
    return Response.error();
  })());
});
