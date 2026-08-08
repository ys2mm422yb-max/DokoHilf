const BUILD_ID = '20260808-29';
const HOTFIX_REVISION = '20260808-smart-help-voice-ui-v29-1';
const CACHE_NAME = `dokohilf-shell-${BUILD_ID}`;
const LOCAL_VOICE_MODEL_CACHE = 'dokohilf-local-voice-model-v28-1';
const STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v29-1';
const CORE_FILES = [
  './',
  './index.html',
  './version.json',
  './assets/guide-audio-catalog.json?v=20260808-29',
  './assets/styles.css?v=20260808-29',
  './assets/premium-ui-v25.css?v=20260808-29',
  './assets/premium-ui-v26.css?v=20260808-29',
  './assets/premium-ui-v27.css?v=20260808-29',
  './assets/ux-v27.css?v=20260808-29',
  './assets/voice-stage-balance-v27.css?v=20260808-29',
  './assets/direct-guides-chat-v27.css?v=20260808-29',
  './assets/v29-ui.css?v=20260808-29',
  './assets/update-manager.js?v=20260808-29',
  './assets/mobile-audio-fix.js?v=20260808-29',
  './assets/voice-diagnostics.js?v=20260808-29',
  './assets/routing-fix.js?v=20260808-29',
  './assets/conversation-intelligence.js?v=20260808-29',
  './assets/clarification-ui.js?v=20260808-29',
  './assets/smart-help-v29.js?v=20260808-29',
  './assets/guide-progress.js?v=20260808-29',
  './assets/voice-focus-mode.js?v=20260808-29',
  './assets/local-voice-v28.js?v=20260808-29',
  './assets/vendor/supertonic-web-v28.mjs?v=20260808-29',
  './assets/experience-v27.js?v=20260808-29',
  './assets/ux-v27.js?v=20260808-29',
  './assets/v29-ui.js?v=20260808-29',
  './assets/local-voice-gate-v28.js?v=20260808-29',
  './assets/direct-guides-v27.js?v=20260808-29',
  './assets/direct-guide-copy-v29.js?v=20260808-29',
  './assets/app.js?v=20260808-29',
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
      .filter(key => key.startsWith('dokohilf-') && key !== CACHE_NAME && key !== LOCAL_VOICE_MODEL_CACHE && key !== STATIC_AUDIO_CACHE)
      .map(key => caches.delete(key)));
    await caches.delete('dokohilf-static-supertonic-audio-v28-1');
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => {});
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) client.postMessage({ type: 'DOKOHILF_UPDATED', buildId: BUILD_ID, hotfixRevision: HOTFIX_REVISION, hardRefresh: true });
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') return void self.skipWaiting();
  if (event.data?.type === 'GET_BUILD_ID') event.ports?.[0]?.postMessage({ buildId: BUILD_ID, hotfixRevision: HOTFIX_REVISION });
  if (event.data?.type === 'CLEAR_DOKOHILF_CACHES') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(key => key.startsWith('dokohilf-') && key !== LOCAL_VOICE_MODEL_CACHE).map(key => caches.delete(key)));
      event.ports?.[0]?.postMessage({ cleared: true, buildId: BUILD_ID, hotfixRevision: HOTFIX_REVISION });
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
  if (url.pathname.includes('/assets/audio/guides/')) {
    event.respondWith(fetch(request, { cache: 'force-cache' }).catch(() => caches.match(request)));
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
