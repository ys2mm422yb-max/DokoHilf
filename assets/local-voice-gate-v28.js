(() => {
  'use strict';

  const TTS_MARKER = '/functions/v1/dokohilf-tts';
  const APPROVED_AUDIO_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-guide-audio';
  const APPROVED_AUDIO_BUILD = '20260806-27';
  const APPROVED_AUDIO_MANIFEST = `${APPROVED_AUDIO_ENDPOINT}?manifest=1&build=${APPROVED_AUDIO_BUILD}`;
  const APPROVED_AUDIO_CACHE = 'dokohilf-approved-guide-audio-v28-1';
  const MANIFEST_TIMEOUT_MS = 2500;
  const AUDIO_TIMEOUT_MS = 6500;
  const IOS_LOCAL_TIMEOUT_MS = 20000;
  const OTHER_LOCAL_TIMEOUT_MS = 35000;
  const previousFetch = window.fetch.bind(window);

  let manifestPromise = null;
  let approvedByText = new Map();
  let lastStaticHit = '';
  let lastStaticError = '';
  let localTimeouts = 0;

  function isTtsRequest(input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return typeof url === 'string' && url.includes(TTS_MARKER) && method === 'POST';
  }

  function extractText(init) {
    try {
      return String(JSON.parse(String(init?.body || '{}')).text || '')
        .replace(/\*\*/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    } catch {
      return '';
    }
  }

  function normalizeAudioKey(value) {
    return String(value || '')
      .toLocaleLowerCase('de-DE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/[„“”"']/g, '')
      .replace(/[^a-z0-9äöü\s./-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isIOS() {
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function updateVoiceStatus(title, hint = '') {
    if (document.getElementById('appShell')?.dataset.mode !== 'voice') return;
    const status = document.getElementById('voiceStatus');
    const hintNode = document.getElementById('voiceHint');
    if (status) status.textContent = title;
    if (hintNode) hintNode.textContent = hint;
  }

  function timed(promise, timeoutMs, code) {
    let timer = null;
    const timeout = new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(new Error(code)), timeoutMs);
    });
    return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
  }

  async function openApprovedCache() {
    if (!('caches' in window)) return null;
    try { return await caches.open(APPROVED_AUDIO_CACHE); }
    catch { return null; }
  }

  async function fetchWithTimeout(url, timeoutMs, init = {}) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await previousFetch(url, { ...init, signal: controller.signal });
    } finally {
      window.clearTimeout(timer);
    }
  }

  function indexApprovedEntries(payload) {
    const map = new Map();
    for (const entry of Array.isArray(payload?.entries) ? payload.entries : []) {
      if (!entry || typeof entry.text !== 'string' || typeof entry.file !== 'string') continue;
      const key = normalizeAudioKey(entry.text);
      if (key) map.set(key, entry);
    }
    approvedByText = map;
    return map;
  }

  async function loadApprovedManifest() {
    if (approvedByText.size) return approvedByText;
    if (manifestPromise) return manifestPromise;

    manifestPromise = (async () => {
      const cache = await openApprovedCache();
      const cacheKey = new Request(APPROVED_AUDIO_MANIFEST, { method: 'GET' });
      try {
        const response = await fetchWithTimeout(APPROVED_AUDIO_MANIFEST, MANIFEST_TIMEOUT_MS, { cache: 'no-store' });
        if (!response.ok) throw new Error(`approved_manifest_${response.status}`);
        const payload = await response.clone().json();
        if (payload?.voice !== 'Gacrux' || !Array.isArray(payload?.entries)) throw new Error('approved_manifest_invalid');
        await cache?.put(cacheKey, response.clone()).catch(() => {});
        lastStaticError = '';
        return indexApprovedEntries(payload);
      } catch (error) {
        const cached = await cache?.match(cacheKey).catch(() => null);
        if (cached) {
          const payload = await cached.json().catch(() => null);
          if (payload?.voice === 'Gacrux' && Array.isArray(payload?.entries)) return indexApprovedEntries(payload);
        }
        lastStaticError = error instanceof Error ? error.message : String(error || 'approved_manifest_failed');
        manifestPromise = null;
        return approvedByText;
      }
    })();

    return manifestPromise;
  }

  function findApprovedEntry(text, manifest) {
    const key = normalizeAudioKey(text);
    if (!key) return null;
    const exact = manifest.get(key);
    if (exact) return exact;

    let candidate = null;
    let candidateLength = 0;
    for (const [approvedText, entry] of manifest.entries()) {
      if (approvedText.length < 32 || !key.includes(approvedText)) continue;
      if (approvedText.length > candidateLength) {
        candidate = entry;
        candidateLength = approvedText.length;
      }
    }
    return candidate;
  }

  async function loadApprovedStaticVoice(text) {
    const manifest = await loadApprovedManifest();
    const entry = findApprovedEntry(text, manifest);
    if (!entry) return null;

    const cache = await openApprovedCache();
    const cached = await cache?.match(entry.file).catch(() => null);
    let response = cached;
    if (!response) {
      response = await fetchWithTimeout(entry.file, AUDIO_TIMEOUT_MS, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`approved_audio_${response.status}`);
      if (!/audio\/wav/i.test(response.headers.get('content-type') || '')) throw new Error('approved_audio_invalid');
      await cache?.put(entry.file, response.clone()).catch(() => {});
    }

    const bytes = await response.arrayBuffer();
    lastStaticHit = String(entry.index ?? entry.file);
    lastStaticError = '';
    updateVoiceStatus('DokoHilf spricht …', 'Bestätigte Anweisung wird direkt abgespielt.');
    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store',
        'X-DokoHilf-Voice': 'Gacrux',
        'X-DokoHilf-TTS-Model': 'prebuilt-approved-guide',
        'X-DokoHilf-Voice-Mode': 'static-approved-guide-v28',
        'X-DokoHilf-TTS-Cache': 'approved-static-cache-v28',
      },
    });
  }

  function localResponse(result) {
    const state = window.DokoHilfLocalVoiceV28?.getState?.() || {};
    return new Response(result.wav, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store',
        'X-DokoHilf-Voice': 'Supertonic-F1',
        'X-DokoHilf-Voice-Mode': 'local-on-device-v28',
        'X-DokoHilf-Voice-Backend': String(state.backend || 'local'),
        'X-DokoHilf-TTS-Latency': String(result.latencyMs || 0),
        'X-DokoHilf-TTS-Cache': 'no-generated-audio-storage',
      },
    });
  }

  function localError(error) {
    const message = error instanceof Error ? error.message : String(error || 'local_voice_failed');
    if (message === 'local_voice_timeout') localTimeouts += 1;
    return new Response(JSON.stringify({ error: 'Die lokale Stimme ist noch nicht bereit.', detail: message }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-DokoHilf-Voice-Mode': 'local-on-device-v28',
        'X-DokoHilf-Local-Voice-Error': '1',
      },
    });
  }

  async function localFallback(text) {
    if (!window.DokoHilfLocalVoiceV28) throw new Error('local_voice_runtime_missing');
    window.DokoHilfLocalVoiceV28.arm?.();
    updateVoiceStatus('Lokale Stimme erzeugt Antwort …', 'Freie Antwort wird direkt auf diesem Gerät erzeugt.');
    return timed(
      window.DokoHilfLocalVoiceV28.synthesize(text),
      isIOS() ? IOS_LOCAL_TIMEOUT_MS : OTHER_LOCAL_TIMEOUT_MS,
      'local_voice_timeout',
    );
  }

  window.fetch = async (input, init = {}) => {
    if (!isTtsRequest(input, init)) return previousFetch(input, init);
    const text = extractText(init);
    if (!text) return localError(new Error('empty_local_voice_text'));

    try {
      const approved = await loadApprovedStaticVoice(text);
      if (approved) return approved;
    } catch (error) {
      lastStaticError = error instanceof Error ? error.message : String(error || 'approved_audio_failed');
    }

    try {
      return localResponse(await localFallback(text));
    } catch (error) {
      updateVoiceStatus('Lokale Stimme nicht bereit', 'Die Anfrage wurde beendet. Tippe auf das Mikrofon, um es erneut zu versuchen.');
      return localError(error);
    }
  };

  function blockSystemSpeech() {
    const synth = window.speechSynthesis;
    if (!synth || typeof synth.speak !== 'function' || window.__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__) return;
    synth.speak = utterance => {
      queueMicrotask(() => {
        try { utterance?.onerror?.({ error: 'local-voice-only' }); } catch { /* no-op */ }
        try { utterance?.dispatchEvent?.(new Event('error')); } catch { /* no-op */ }
      });
    };
    window.__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__ = true;
  }

  blockSystemSpeech();
  window.DokoHilfStaticFirstVoiceV28 = {
    manifestUrl: APPROVED_AUDIO_MANIFEST,
    cacheName: APPROVED_AUDIO_CACHE,
    getState: () => ({ approvedEntries: approvedByText.size, lastStaticHit, lastStaticError, localTimeouts }),
  };
  window.__DOKOHILF_STATIC_FIRST_VOICE_V28__ = true;
  window.__DOKOHILF_LOCAL_VOICE_GATE_V28__ = true;
})();
