(() => {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const TTS_MARKER = '/functions/v1/dokohilf-tts';
  const LOCAL_MANIFEST_MARKER = '/assets/guide-audio-manifest.json';
  const GUIDE_AUDIO_MARKER = '/functions/v1/dokohilf-guide-audio';
  const GUIDE_AUDIO_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-guide-audio';
  const GUIDE_AUDIO_MANIFEST = `${GUIDE_AUDIO_ENDPOINT}?manifest=1&build=20260806-27`;
  const GUIDE_AUDIO_CACHE = 'dokohilf-approved-guide-audio-20260806-27';
  let lastNaturalResponse = null;
  let lastFallbackReason = '';
  let lastManifestCount = 0;

  function fallbackReason(error) {
    const message = String(error?.message || error || '').toLowerCase();
    if (message.includes('tts_timeout')) return 'Zeitüberschreitung der natürlichen Stimme';
    if (message.includes('abort')) return 'Sprachanfrage wurde abgebrochen';
    if (message.includes('audio_context')) return 'Audiowiedergabe wurde vom Gerät blockiert';
    if (message.includes('decode')) return 'Audiodatei konnte nicht abgespielt werden';
    if (message.includes('tts_unavailable')) return 'Natürliche Stimme ist gerade nicht erreichbar';
    return 'Natürliche Stimme ist gerade nicht verfügbar';
  }

  function calculateKeyboardOffset(viewportHeight, viewportOffsetTop, windowHeight) {
    const height = Number(viewportHeight) || Number(windowHeight) || 0;
    const offsetTop = Number(viewportOffsetTop) || 0;
    const fullHeight = Number(windowHeight) || height;
    return Math.max(0, Math.round(fullHeight - height - offsetTop));
  }

  root.DokoHilfVoiceDiagnostics = { fallbackReason, calculateKeyboardOffset };
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  function requestUrl(input) {
    return typeof input === 'string' ? input : input?.url || '';
  }

  function isTtsRequest(input) {
    return requestUrl(input).includes(TTS_MARKER);
  }

  function isLocalManifestRequest(input) {
    return requestUrl(input).includes(LOCAL_MANIFEST_MARKER);
  }

  function isRemoteGuideAudioRequest(input) {
    const url = requestUrl(input);
    return url.includes(GUIDE_AUDIO_MARKER) && !url.includes('manifest=1');
  }

  async function openGuideAudioCache() {
    if (!('caches' in window)) return null;
    try { return await caches.open(GUIDE_AUDIO_CACHE); }
    catch { return null; }
  }

  async function fetchGuideManifest(previousFetch, init = {}) {
    const cache = await openGuideAudioCache();
    const cacheKey = new Request(GUIDE_AUDIO_MANIFEST, { method: 'GET' });
    try {
      const response = await previousFetch(GUIDE_AUDIO_MANIFEST, {
        ...init,
        method: 'GET',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`guide_audio_manifest_${response.status}`);
      const payload = await response.clone().json();
      if (payload?.voice !== 'Gacrux' || !Array.isArray(payload?.entries)) {
        throw new Error('guide_audio_manifest_invalid');
      }
      lastManifestCount = payload.entries.length;
      await cache?.put(cacheKey, response.clone());
      return response;
    } catch (error) {
      const cached = await cache?.match(cacheKey);
      if (cached) {
        cached.clone().json().then(payload => {
          lastManifestCount = Array.isArray(payload?.entries) ? payload.entries.length : 0;
        }).catch(() => {});
        return cached;
      }
      throw error;
    }
  }

  async function fetchCachedGuideAudio(previousFetch, input, init = {}) {
    const url = requestUrl(input);
    if (!url) return previousFetch(input, init);
    const cache = await openGuideAudioCache();
    const cached = await cache?.match(url);
    if (cached) return cached;

    const response = await previousFetch(input, { ...init, cache: 'force-cache' });
    if (response.ok && /audio\/wav/i.test(response.headers.get('content-type') || '')) {
      await cache?.put(url, response.clone());
    }
    return response;
  }

  function installStyles() {
    if (document.getElementById('voiceDiagnosticsStyles')) return;
    const style = document.createElement('style');
    style.id = 'voiceDiagnosticsStyles';
    style.textContent = `
      .voice-engine-badge{display:inline-flex;align-items:center;gap:6px;width:max-content;max-width:100%;margin-top:5px;padding:4px 8px;border:1px solid rgba(11,107,82,.18);border-radius:999px;background:#edf8f4;color:#175b49;font-size:11px;font-weight:780;line-height:1.2;white-space:nowrap}
      .voice-engine-badge::before{content:'';width:7px;height:7px;border-radius:50%;background:#16845f;box-shadow:0 0 0 3px rgba(22,132,95,.12)}
      .voice-engine-badge[data-engine="loading"]{color:#795b12;background:#fff7dd;border-color:#e8cf7b}
      .voice-engine-badge[data-engine="loading"]::before{background:#d09a11;animation:dokohilfVoicePulse 1.1s infinite}
      .voice-engine-badge[data-engine="device"]{color:#7c4b13;background:#fff3e5;border-color:#e2b779}
      .voice-engine-badge[data-engine="device"]::before{background:#c77818;box-shadow:0 0 0 3px rgba(199,120,24,.12)}
      .voice-engine-badge[data-engine="error"]{color:#922d2d;background:#fff0f0;border-color:#e4a4a4}
      .voice-engine-badge[data-engine="error"]::before{background:#c63d3d;box-shadow:0 0 0 3px rgba(198,61,61,.12)}
      @keyframes dokohilfVoicePulse{50%{opacity:.45;transform:scale(.82)}}
      @media(max-width:900px){
        .app-shell[data-mode="voice"] .voice-console{bottom:calc(8px + env(safe-area-inset-bottom) + var(--dokohilf-keyboard-offset,0px))!important}
        .app-shell[data-mode="voice"] .main-content{padding-bottom:calc(142px + env(safe-area-inset-bottom) + var(--dokohilf-keyboard-offset,0px))!important}
        .app-shell[data-mode="voice"]{padding-bottom:calc(142px + env(safe-area-inset-bottom) + var(--dokohilf-keyboard-offset,0px))!important}
      }
      @media(max-width:390px){.voice-engine-badge{font-size:10px;padding:3px 7px}}
    `;
    document.head.append(style);
  }

  function ensureBadge() {
    let badge = document.getElementById('voiceEngineBadge');
    if (badge) return badge;
    installStyles();
    const copy = document.querySelector('.voice-copy');
    if (!copy) return null;
    badge = document.createElement('span');
    badge.id = 'voiceEngineBadge';
    badge.className = 'voice-engine-badge';
    badge.dataset.engine = 'loading';
    badge.textContent = 'Natürliche Stimme wird vorbereitet';
    badge.setAttribute('role', 'status');
    badge.setAttribute('aria-live', 'polite');
    copy.append(badge);
    return badge;
  }

  function setEngine(engine, label, reason = '') {
    const badge = ensureBadge();
    const consoleElement = document.getElementById('voiceConsole');
    if (!badge || !consoleElement) return;
    badge.dataset.engine = engine;
    badge.textContent = label;
    badge.title = reason || label;
    consoleElement.dataset.voiceEngine = engine;
    if (reason) consoleElement.dataset.fallbackReason = reason;
    else delete consoleElement.dataset.fallbackReason;
    window.dispatchEvent(new CustomEvent('dokohilf:voice-engine', {
      detail: { engine, label, reason },
    }));
  }

  function syncKeyboardOffset() {
    const shell = document.getElementById('appShell');
    if (!shell) return;
    const viewport = window.visualViewport;
    const offset = viewport
      ? calculateKeyboardOffset(viewport.height, viewport.offsetTop, window.innerHeight)
      : 0;
    shell.style.setProperty('--dokohilf-keyboard-offset', `${offset}px`);
  }

  function syncVoiceConsole() {
    const shell = document.getElementById('appShell');
    const voiceConsole = document.getElementById('voiceConsole');
    if (!shell || !voiceConsole) return;
    if (shell.dataset.mode === 'voice') {
      voiceConsole.hidden = false;
      voiceConsole.style.removeProperty('display');
      voiceConsole.setAttribute('aria-hidden', 'false');
    }
    syncKeyboardOffset();
  }

  function observeVoiceStatus() {
    const status = document.getElementById('voiceStatus');
    if (!status || status.dataset.diagnosticsObserver === 'active') return;
    status.dataset.diagnosticsObserver = 'active';

    const update = () => {
      const text = status.textContent || '';
      if (/natürliche stimme wird vorbereitet/i.test(text)) {
        setEngine('loading', 'Natürliche Stimme wird vorbereitet');
      } else if (/spricht natürlich/i.test(text)) {
        const voice = lastNaturalResponse?.voice;
        setEngine('natural', voice ? `Natürliche Stimme · ${voice}` : 'Natürliche Stimme');
        lastFallbackReason = '';
      } else if (/dokoHilf spricht/i.test(text) && !/natürlich/i.test(text)) {
        const reason = lastFallbackReason
          || (lastNaturalResponse ? 'Audio-Wiedergabe der natürlichen Stimme nicht möglich' : 'Natürliche Stimme nicht verfügbar');
        setEngine('device', 'Gerätestimme als Ersatz', reason);
      } else if (/mikrofon nicht freigegeben|nicht verstanden|kurz nicht erreichbar|eingabe geschützt/i.test(text)) {
        setEngine('error', 'Sprachfunktion benötigt Aufmerksamkeit', text);
      }
    };

    new MutationObserver(update).observe(status, { childList: true, characterData: true, subtree: true });
    update();
  }

  function installFetchObserver() {
    if (window.__DOKOHILF_VOICE_DIAGNOSTICS_FETCH__) return;
    const previousFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
      if (method === 'GET' && isLocalManifestRequest(input)) {
        return fetchGuideManifest(previousFetch, init);
      }
      if (method === 'GET' && isRemoteGuideAudioRequest(input)) {
        return fetchCachedGuideAudio(previousFetch, input, init);
      }
      if (!isTtsRequest(input)) return previousFetch(input, init);

      lastNaturalResponse = null;
      lastFallbackReason = '';
      setEngine('loading', 'Natürliche Stimme wird vorbereitet');
      try {
        const response = await previousFetch(input, init);
        if (!response.ok) {
          lastFallbackReason = `Sprachdienst antwortet mit Status ${response.status}`;
          setEngine('device', 'Gerätestimme als Ersatz', lastFallbackReason);
          return response;
        }
        lastNaturalResponse = {
          voice: response.headers.get('X-DokoHilf-Voice') || '',
          model: response.headers.get('X-DokoHilf-TTS-Model') || '',
          mode: response.headers.get('X-DokoHilf-Voice-Mode') || 'natural-cloud',
          parser: response.headers.get('X-DokoHilf-TTS-Parser') || '',
        };
        return response;
      } catch (error) {
        lastFallbackReason = fallbackReason(error);
        setEngine('device', 'Gerätestimme als Ersatz', lastFallbackReason);
        throw error;
      }
    };
    window.__DOKOHILF_VOICE_DIAGNOSTICS_FETCH__ = true;
    window.__DOKOHILF_REMOTE_GUIDE_AUDIO_V27__ = true;
  }

  function installLifecycleObservers() {
    const shell = document.getElementById('appShell');
    if (shell && shell.dataset.voiceDiagnosticsObserver !== 'active') {
      shell.dataset.voiceDiagnosticsObserver = 'active';
      new MutationObserver(syncVoiceConsole).observe(shell, {
        attributes: true,
        attributeFilter: ['data-mode', 'data-voice-state'],
      });
    }

    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', syncVoiceConsole);
    viewport?.addEventListener('scroll', syncVoiceConsole);
    window.addEventListener('resize', syncVoiceConsole);
    window.addEventListener('orientationchange', () => window.setTimeout(syncVoiceConsole, 120));
    window.addEventListener('pageshow', syncVoiceConsole);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') syncVoiceConsole();
    });
  }

  function initialize() {
    installStyles();
    ensureBadge();
    observeVoiceStatus();
    installLifecycleObservers();
    syncVoiceConsole();
  }

  installFetchObserver();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }

  window.DokoHilfVoiceDiagnostics = {
    fallbackReason,
    calculateKeyboardOffset,
    setEngine,
    syncVoiceConsole,
    getState: () => ({
      naturalResponse: lastNaturalResponse ? { ...lastNaturalResponse } : null,
      fallbackReason: lastFallbackReason,
      staticGuideAudio: {
        endpoint: GUIDE_AUDIO_ENDPOINT,
        manifestEntries: lastManifestCount,
        cacheName: GUIDE_AUDIO_CACHE,
      },
    }),
  };
})();
