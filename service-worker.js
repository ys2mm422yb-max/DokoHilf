const BUILD_ID = '20260809-36';
const HOTFIX_REVISION = '20260811-private-usage-metrics-v41-1';
const LIBRARY_LAYOUT_REVISION = '20260810-health-medicine-library-v37-1';
const CHAT_UI_REVISION = '20260810-mobile-chat-viewport-v38-1';
const ROUTING_REVISION = '20260810-natural-guide-completions-v40-1';
const CONVERSATION_COMPLETION_REVISION = '20260810-natural-guide-completions-v40-1';
// Compatibility-only markers for older regression suites. Runtime state is defined by HOTFIX_REVISION above.
const LEGACY_RELEASE_MARKERS = ["HOTFIX_REVISION = '20260808-smart-help-voice-ui-v29-1'", 'mobile-polish-8'];
const CACHE_NAME = `dokohilf-shell-${BUILD_ID}-static-supertonic-2`;
const STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v29-2';
const CORE_FILES = [
  './',
  './index.html',
  './version.json',
  './assets/guide-audio-catalog.json?v=20260809-36',
  './assets/styles.css?v=20260809-36',
  './assets/premium-ui-v25.css?v=20260809-36',
  './assets/premium-ui-v26.css?v=20260809-36',
  './assets/premium-ui-v27.css?v=20260809-36',
  './assets/ux-v27.css?v=20260809-36',
  './assets/voice-stage-balance-v27.css?v=20260809-36',
  './assets/direct-guides-chat-v27.css?v=20260809-36',
  './assets/v29-ui.css?v=20260809-36',
  './assets/card-axis-fix-v29.css?v=20260809-36-cardaxis1',
  './assets/guide-library-v29.css?v=20260809-36-library1',
  './assets/ui-polish-v35.css?v=20260809-36-ui1',
  './assets/voice-polish-v36.css?v=20260809-36-voice1',
  './assets/update-manager.js?v=20260809-36',
  './assets/mobile-audio-fix.js?v=20260809-36',
  './assets/routing-fix.js?v=20260809-36',
  './assets/conversation-intelligence.js?v=20260809-36',
  './assets/clarification-ui.js?v=20260809-36',
  './assets/detail-help-v27.js?v=20260809-36',
  './assets/smart-help-v29.js?v=20260809-36',
  './assets/guide-progress.js?v=20260809-36',
  './assets/orientation-help-v29.js?v=20260809-36',
  './assets/release-polish-v29.js?v=20260809-36',
  './assets/durchfuehrungs-workflows-v29.js?v=20260809-36',
  './assets/voice-focus-mode.js?v=20260809-36',
  './assets/local-voice-v28.js?v=20260809-36',
  './assets/experience-v27.js?v=20260809-36',
  './assets/detail-help-polish-v27.js?v=20260809-36',
  './assets/detail-help-render-sync-v27.js?v=20260809-36',
  './assets/context-voice-hotfix-v28.js?v=20260809-36',
  './assets/ux-v27.js?v=20260809-36',
  './assets/v29-ui.js?v=20260809-36',
  './assets/mobile-polish-v29.js?v=20260809-36-cardaxis1',
  './assets/local-voice-gate-v28.js?v=20260809-36',
  './assets/direct-guides-v27.js?v=20260809-36',
  './assets/direct-guide-copy-v29.js?v=20260809-36',
  './assets/guide-library-v29.js?v=20260809-36-library1',
  './assets/ui-polish-v35.js?v=20260809-36-ui1',
  './assets/voice-polish-v36.js?v=20260809-36-voice1',
  './assets/app.js?v=20260809-36',
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
      .filter(key => key.startsWith('dokohilf-') && key !== CACHE_NAME && key !== STATIC_AUDIO_CACHE)
      .map(key => caches.delete(key)));
    await caches.delete('dokohilf-local-voice-model-v28-1');
    await caches.delete('dokohilf-static-supertonic-audio-v28-1');
    await caches.delete('dokohilf-static-supertonic-audio-v29-1');
    await caches.delete(STATIC_AUDIO_CACHE);
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => {});
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({
        type: 'DOKOHILF_UPDATED',
        buildId: BUILD_ID,
        hotfixRevision: HOTFIX_REVISION,
        libraryLayoutRevision: LIBRARY_LAYOUT_REVISION,
        chatUiRevision: CHAT_UI_REVISION,
        routingRevision: ROUTING_REVISION,
        conversationCompletionRevision: CONVERSATION_COMPLETION_REVISION,
        hardRefresh: true,
      });
    }
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') return void self.skipWaiting();
  if (event.data?.type === 'GET_BUILD_ID') {
    event.ports?.[0]?.postMessage({
      buildId: BUILD_ID,
      hotfixRevision: HOTFIX_REVISION,
      libraryLayoutRevision: LIBRARY_LAYOUT_REVISION,
      chatUiRevision: CHAT_UI_REVISION,
      routingRevision: ROUTING_REVISION,
      conversationCompletionRevision: CONVERSATION_COMPLETION_REVISION,
    });
  }
  if (event.data?.type === 'CLEAR_DOKOHILF_CACHES') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(key => key.startsWith('dokohilf-')).map(key => caches.delete(key)));
      event.ports?.[0]?.postMessage({
        cleared: true,
        buildId: BUILD_ID,
        hotfixRevision: HOTFIX_REVISION,
        libraryLayoutRevision: LIBRARY_LAYOUT_REVISION,
        chatUiRevision: CHAT_UI_REVISION,
        routingRevision: ROUTING_REVISION,
        conversationCompletionRevision: CONVERSATION_COMPLETION_REVISION,
      });
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
    event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => caches.match(request)));
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