const BUILD_ID = '20260806-27';
const HOTFIX_REVISION = '20260807-direct-guides-chat-2';
const CACHE_NAME = `dokohilf-shell-${BUILD_ID}`;
const AUDIO_CACHE_NAME = `dokohilf-approved-guide-audio-${BUILD_ID}`;
const AUDIO_MANIFEST = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-guide-audio?manifest=1&build=20260806-27';
const GUIDE_AUDIO_MARKER = '/functions/v1/dokohilf-guide-audio';
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
  './assets/direct-guides-v27.js?v=20260806-27',
  './assets/app.js?v=20260806-27',
  './manifest.webmanifest',
  './icon.svg',
];

async function cacheApprovedGuideAudio() {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const response = await fetch(AUDIO_MANIFEST, { cache: 'no-store', mode: 'cors' });
  if (!response.ok) return { cached: 0, total: 0, complete: false };
  const manifest = await response.clone().json();
  if (manifest?.voice !== 'Gacrux' || !Array.isArray(manifest?.entries)) {
    return { cached: 0, total: 0, complete: false };
  }
  await cache.put(AUDIO_MANIFEST, response.clone());
  const files = [...new Set(manifest.entries
    .map(entry => entry?.file)
    .filter(file => typeof file === 'string' && file.includes(GUIDE_AUDIO_MARKER)))];

  let cached = 0;
  for (let index = 0; index < files.length; index += 4) {
    const batch = files.slice(index, index + 4);
    const results = await Promise.allSettled(batch.map(async file => {
      const existing = await cache.match(file);
      if (existing) return true;
      const audio = await fetch(file, { cache: 'force-cache', mode: 'cors' });
      if (!audio.ok || !/audio\/wav/i.test(audio.headers.get('content-type') || '')) return false;
      await cache.put(file, audio.clone());
      return true;
    }));
    cached += results.filter(result => result.status === 'fulfilled' && result.value === true).length;
  }
  return { cached, total: files.length, complete: manifest.complete === true && files.length === 93 };
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
    await Promise.all(keys
      .filter(key => key.startsWith('dokohilf-') && key !== CACHE_NAME && key !== AUDIO_CACHE_NAME)
      .map(key => caches.delete(key)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => {});
    await cacheApprovedGuideAudio().catch(() => ({ cached: 0, total: 0, complete: false }));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) client.postMessage({ type: 'DOKOHILF_UPDATED', buildId: BUILD_ID, hotfixRevision: HOTFIX_REVISION, hardRefresh: true });
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') return void self.skipWaiting();
  if (event.data?.type === 'GET_BUILD_ID') event.ports?.[0]?.postMessage({ buildId: BUILD_ID, hotfixRevision: HOTFIX_REVISION });
  if (event.data?.type === 'CACHE_APPROVED_GUIDE_AUDIO') {
    event.waitUntil(cacheApprovedGuideAudio().then(result => event.ports?.[0]?.postMessage(result)));
  }
  if (event.data?.type === 'CLEAR_DOKOHILF_CACHES') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(key => key.startsWith('dokohilf-')).map(key => caches.delete(key)));
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

async function cacheFirstApprovedAudio(request) {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request, { cache: 'force-cache', mode: 'cors' });
    if (response.ok && /audio\/wav/i.test(response.headers.get('content-type') || '')) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.href === AUDIO_MANIFEST) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-store', mode: 'cors' });
        if (response.ok) {
          const cache = await caches.open(AUDIO_CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request)) || Response.error();
      }
    })());
    return;
  }

  if (url.pathname.includes(GUIDE_AUDIO_MARKER) && url.searchParams.has('index')) {
    event.respondWith(cacheFirstApprovedAudio(request));
    return;
  }

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
    return (await networkFirst(request)) || Response.error();
  })());
});
