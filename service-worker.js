const BUILD_ID = '20260905-45';
const HOTFIX_REVISION = '20260809-static-supertonic-orientation-ui-v29-3';
const LIBRARY_LAYOUT_REVISION = '20260812-dateiablage-organisation-v46-1';
const CHAT_UI_REVISION = '20260810-mobile-chat-viewport-v38-1';
const ROUTING_REVISION = '20260822-signoff-durchfuehrungsnachweis-v52-1';
const CONVERSATION_COMPLETION_REVISION = '20260812-guide-progress-completion-v44-1';
const USAGE_METRICS_REVISION = '20260811-private-usage-metrics-v41-1';
const UX_POLISH_REVISION = '20260823-search-flicker-hotfix-v55-1';
const REPORT_GUIDE_VOICE_RESET_REVISION = '20260812-report-textfield-voice-reset-v43-1';
const GUIDE_AUDIT_REVISION = '20260812-full-guide-audit-v44-1';
const VOICE_REPLY_MATCH_REVISION = '20260812-static-voice-reply-match-v45-2';
const FILE_STORAGE_REVISION = '20260812-file-storage-guide-v46-1';
const USER_FACING_HOTFIX_REVISION = '20260812-voice-copy-progress-report-v48-1';
const FEEDBACK_REVISION = '20260813-feedback-home-only-v50-1';
const HANDOVER_DETAIL_REVISION = '20260813-uebergabe-alle-ausklappen-v51-1';
const GUIDE_DISCOVERY_REVISION = '20260823-guide-discovery-v53-1';
const SPATIAL_ORIENTATION_REVISION = '20260902-spatial-orientation-v60-1';
const INPUT_ROBUSTNESS_REVISION = '20260902-confirmed-term-input-v61-1';
const PROGRESSIVE_NAVIGATION_REVISION = '20260903-progressive-navigation-v68-1';
const PWA_INSTALL_REVISION = '20260904-pwa-install-v69-1';
const FULL_QA_REVISION = '20260904-full-qa-v69-1';
const CHAT_GUIDE_UX_REVISION = '20260905-chat-guide-back-dictation-v70-1';
const CONTEXT_HELP_AVAILABILITY_REVISION = '20260905-context-help-availability-v71-1';
// Compatibility-only markers for older regression suites. Runtime state is defined by HOTFIX_REVISION above.
const LEGACY_RELEASE_MARKERS = [
  "HOTFIX_REVISION = '20260808-smart-help-voice-ui-v29-1'",
  "HOTFIX_REVISION = '20260809-massnahmen-arrow-v29-3'",
  'mobile-polish-8',
];
const CACHE_NAME = `dokohilf-shell-${BUILD_ID}-static-supertonic-2-search-v55-dnf-orientation-v57-report-navigation-v58-spatial-orientation-v60-confirmed-term-input-v61-progressive-navigation-v68-pwa-install-full-qa-v69-chat-guide-back-dictation-v70-context-help-availability-v71`;
const STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v29-2';
const CORE_FILES = [
  './',
  './index.html',
  './version.json',
  './assets/guide-audio-catalog.json?v=20260905-45',
  './assets/styles.css?v=20260905-45',
  './assets/premium-ui-v25.css?v=20260905-45',
  './assets/premium-ui-v26.css?v=20260905-45',
  './assets/premium-ui-v27.css?v=20260905-45',
  './assets/ux-v27.css?v=20260905-45',
  './assets/voice-stage-balance-v27.css?v=20260905-45',
  './assets/direct-guides-chat-v27.css?v=20260905-45',
  './assets/v29-ui.css?v=20260905-45',
  './assets/card-axis-fix-v29.css?v=20260905-45-cardaxis1',
  './assets/guide-library-v29.css?v=20260905-45-library1',
  './assets/ui-polish-v35.css?v=20260905-45-ui1',
  './assets/voice-polish-v36.css?v=20260905-45-voice1',
  './assets/ux-polish-v42.css?v=20260905-45-ux42',
  './assets/pwa-install-v69.css?v=20260905-45',
  './assets/update-manager.js?v=20260905-45',
  './assets/mobile-audio-fix.js?v=20260905-45',
  './assets/routing-fix.js?v=20260905-45',
  './assets/conversation-intelligence.js?v=20260905-45',
  './assets/clarification-ui.js?v=20260905-45',
  './assets/detail-help-v27.js?v=20260905-45',
  './assets/smart-help-v29.js?v=20260905-45',
  './assets/file-storage-guide-v46.js?v=20260812-file-storage-v46-1',
  './assets/guide-progress.js?v=20260905-45',
  './assets/orientation-help-v29.js?v=20260905-45',
  './assets/release-polish-v29.js?v=20260905-45',
  './assets/durchfuehrungs-workflows-v29.js?v=20260905-45',
  './assets/voice-focus-mode.js?v=20260905-45',
  './assets/local-voice-v28.js?v=20260905-45',
  './assets/experience-v27.js?v=20260905-45',
  './assets/detail-help-polish-v27.js?v=20260905-45',
  './assets/detail-help-render-sync-v27.js?v=20260905-45',
  './assets/context-voice-hotfix-v28.js?v=20260905-45',
  './assets/ux-v27.js?v=20260905-45',
  './assets/v29-ui.js?v=20260905-45',
  './assets/mobile-polish-v29.js?v=20260905-45-cardaxis1',
  './assets/local-voice-gate-v28.js?v=20260905-45',
  './assets/direct-guides-v27.js?v=20260905-45',
  './assets/direct-guide-copy-v29.js?v=20260905-45',
  './assets/guide-library-v29.js?v=20260905-45-library1',
  './assets/report-guide-hotfix-v43.js?v=20260905-45',
  './assets/ui-polish-v35.js?v=20260905-45-ui1',
  './assets/feedback-report-v49.js?v=20260813-feedback-home-only-v50-1',
  './assets/voice-polish-v36.js?v=20260905-45-voice1',
  './assets/ux-polish-v42.js?v=20260905-45-ux42',
  './assets/pwa-install-v69.js?v=20260905-45',
  './assets/app.js?v=20260905-45',
  './assets/guide-discovery-v53.js?v=20260823-guide-discovery-v53-1',
  './assets/intent-registry-v54.js?v=20260904-confirmed-intent-parity-v69-1',
  './assets/step-help-v54.js?v=20260823-step-help-v54-1',
  './assets/self-test-v54.js?v=20260823-self-test-v54-1',
  './assets/chat-guide-ux-v70.js?v=20260905-chat-guide-back-dictation-v70-1',
  './assets/context-help-availability-v71.js?v=20260905-context-help-availability-v71-1',
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
        usageMetricsRevision: USAGE_METRICS_REVISION,
        uxPolishRevision: UX_POLISH_REVISION,
        reportGuideVoiceResetRevision: REPORT_GUIDE_VOICE_RESET_REVISION,
        guideAuditRevision: GUIDE_AUDIT_REVISION,
        voiceReplyMatchRevision: VOICE_REPLY_MATCH_REVISION,
        fileStorageRevision: FILE_STORAGE_REVISION,
        userFacingHotfixRevision: USER_FACING_HOTFIX_REVISION,
        feedbackRevision: FEEDBACK_REVISION,
        handoverDetailRevision: HANDOVER_DETAIL_REVISION,
        guideDiscoveryRevision: GUIDE_DISCOVERY_REVISION,
        spatialOrientationRevision: SPATIAL_ORIENTATION_REVISION,
        inputRobustnessRevision: INPUT_ROBUSTNESS_REVISION,
        progressiveNavigationRevision: PROGRESSIVE_NAVIGATION_REVISION,
        pwaInstallRevision: PWA_INSTALL_REVISION,
        fullQaRevision: FULL_QA_REVISION,
        chatGuideUxRevision: CHAT_GUIDE_UX_REVISION,
        contextHelpAvailabilityRevision: CONTEXT_HELP_AVAILABILITY_REVISION,
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
      usageMetricsRevision: USAGE_METRICS_REVISION,
      uxPolishRevision: UX_POLISH_REVISION,
      reportGuideVoiceResetRevision: REPORT_GUIDE_VOICE_RESET_REVISION,
      guideAuditRevision: GUIDE_AUDIT_REVISION,
      voiceReplyMatchRevision: VOICE_REPLY_MATCH_REVISION,
      fileStorageRevision: FILE_STORAGE_REVISION,
      userFacingHotfixRevision: USER_FACING_HOTFIX_REVISION,
      feedbackRevision: FEEDBACK_REVISION,
      handoverDetailRevision: HANDOVER_DETAIL_REVISION,
      guideDiscoveryRevision: GUIDE_DISCOVERY_REVISION,
      spatialOrientationRevision: SPATIAL_ORIENTATION_REVISION,
      inputRobustnessRevision: INPUT_ROBUSTNESS_REVISION,
      progressiveNavigationRevision: PROGRESSIVE_NAVIGATION_REVISION,
      pwaInstallRevision: PWA_INSTALL_REVISION,
      fullQaRevision: FULL_QA_REVISION,
      chatGuideUxRevision: CHAT_GUIDE_UX_REVISION,
      contextHelpAvailabilityRevision: CONTEXT_HELP_AVAILABILITY_REVISION,
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
        usageMetricsRevision: USAGE_METRICS_REVISION,
        uxPolishRevision: UX_POLISH_REVISION,
        reportGuideVoiceResetRevision: REPORT_GUIDE_VOICE_RESET_REVISION,
        guideAuditRevision: GUIDE_AUDIT_REVISION,
        voiceReplyMatchRevision: VOICE_REPLY_MATCH_REVISION,
        fileStorageRevision: FILE_STORAGE_REVISION,
        userFacingHotfixRevision: USER_FACING_HOTFIX_REVISION,
        feedbackRevision: FEEDBACK_REVISION,
        handoverDetailRevision: HANDOVER_DETAIL_REVISION,
        guideDiscoveryRevision: GUIDE_DISCOVERY_REVISION,
        spatialOrientationRevision: SPATIAL_ORIENTATION_REVISION,
        inputRobustnessRevision: INPUT_ROBUSTNESS_REVISION,
        progressiveNavigationRevision: PROGRESSIVE_NAVIGATION_REVISION,
        pwaInstallRevision: PWA_INSTALL_REVISION,
        fullQaRevision: FULL_QA_REVISION,
        chatGuideUxRevision: CHAT_GUIDE_UX_REVISION,
        contextHelpAvailabilityRevision: CONTEXT_HELP_AVAILABILITY_REVISION,
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