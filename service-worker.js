const BUILD_ID = '20260806-27';
const CACHE_NAME = `dokohilf-shell-${BUILD_ID}`;
const AUDIO_MANIFEST = './assets/guide-audio-manifest.json?v=20260806-27';
const CORE_FILES = [
  './',
  './index.html',
  './version.json',
  './assets/styles.css?v=20260806-27',
  './assets/premium-ui-v25.css?v=20260806-27',
  './assets/premium-ui-v26.css?v=20260806-27',
  './assets/premium-ui-v27.css?v=20260806-27',
  './assets/ux-v27.css?v=20260806-27',
  './assets/guide-audio-catalog.json?v=20260806-27',
  AUDIO_MANIFEST,
  './assets/update-manager.js?v=20260806-27',
  './assets/mobile-audio-fix.js?v=20260806-27',
  './assets/voice-diagnostics.js?v=20260806-27',
  './assets/routing-fix.js?v=20260806-27',
  './assets/conversation-intelligence.js?v=20260806-27',
  './assets/clarification-ui.js?v=20260806-27',
  './assets/guide-progress.js?v=20260806-27',
  './assets/voice-focus-mode.js?v=20260806-27',
  './assets/experience-v27.js?v=20260806-27',
  './assets/ux-v27.js?v=20260806-27',
  './assets/app.js?v=20260806-27',
  './manifest.webmanifest',
  './icon.svg',
];

async function cacheApprovedGuideAudio() {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch(AUDIO_MANIFEST, { cache: 'reload' });
  if (!response.ok) return { cached: 0, total: 0 };
  await cache.put(AUDIO_MANIFEST, response.clone());
  const manifest = await response.json();
  const files = Array.isArray(manifest?.entries)
    ? [...new Set(manifest.entries.map(entry => entry?.file).filter(file => typeof file === 'string'))]
    : [];

  let cached = 0;
  for (let index = 0; index < files.length; index += 8) {
    const batch = files.slice(index, index + 8);
    const results = await Promise.allSettled(batch.map(async file => {
      const existing = await cache.match(file, { ignoreSearch: true });
      if (existing) return true;
      const audio = await fetch(file, { cache: 'reload' });
      if (!audio.ok || !/audio\/wav/i.test(audio.headers.get('content-type') || '')) return false;
      await cache.put(file, audio.clone());
      return true;
    }));
    cached += results.filter(result => result.status === 'fulfilled' && result.value === true).length;
  }
  return { cached, total: files.length };
}

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
    await Promise.all(keys.filter(key => key.startsWith('dokohilf-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => {});
    await cacheApprovedGuideAudio().catch(() => ({ cached: 0, total: 0 }));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) client.postMessage({ type: 'DOKOHILF_UPDATED', buildId: BUILD_ID, hardRefresh: true });
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') return void self.skipWaiting();
  if (event.data?.type === 'GET_BUILD_ID') event.ports?.[0]?.postMessage({ buildId: BUILD_ID });
  if (event.data?.type === 'CACHE_APPROVED_GUIDE_AUDIO') {
    event.waitUntil(cacheApprovedGuideAudio().then(result => event.ports?.[0]?.postMessage(result)));
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

async function cacheFirstAudio(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  try {
    const response = await fetch(request, { cache: 'reload' });
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return Response.error();
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
  if (url.pathname.includes('/assets/audio/guides/') && url.pathname.endsWith('.wav')) {
    event.respondWith(cacheFirstAudio(request));
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
    return (await networkFirst(request)) || Response.error();
  })());
});
