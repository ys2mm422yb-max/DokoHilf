const BUILD_ID = '20260806-24';
const CACHE_NAME = `dokohilf-shell-${BUILD_ID}`;
const CORE_FILES = [
  './',
  './index.html',
  './version.json',
  './assets/styles.css?v=20260806-24',
  './assets/update-manager.js?v=20260806-24',
  './assets/mobile-audio-fix.js?v=20260806-24',
  './assets/voice-diagnostics.js?v=20260806-24',
  './assets/routing-fix.js?v=20260806-24',
  './assets/conversation-intelligence.js?v=20260806-24',
  './assets/clarification-ui.js?v=20260806-24',
  './assets/guide-progress.js?v=20260806-24',
  './assets/voice-focus-mode.js?v=20260806-24',
  './assets/app.js?v=20260806-24',
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
      .filter(key => key.startsWith('dokohilf-') && key !== CACHE_NAME)
      .map(key => caches.delete(key)));

    if (self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable().catch(() => {});
    }

    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({ type: 'DOKOHILF_UPDATED', buildId: BUILD_ID, hardRefresh: true });
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
  if (event.data?.type === 'CLEAR_DOKOHILF_CACHES') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(key => key.startsWith('dokohilf-')).map(key => caches.delete(key)));
      event.ports?.[0]?.postMessage({ cleared: true, buildId: BUILD_ID });
    })());
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
    return (await caches.match(request, { ignoreSearch: false })) || null;
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('/version.json') || url.pathname.endsWith('/service-worker.js')) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  event.respondWith((async () => {
    if (request.mode === 'navigate') {
      try {
        const preload = await event.preloadResponse;
        const response = preload || await fetch(request, { cache: 'reload' });
        if (response?.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put('./index.html', response.clone());
        }
        return response;
      } catch {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    }

    const response = await networkFirst(request);
    return response || Response.error();
  })());
});
