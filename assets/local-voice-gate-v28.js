(() => {
  'use strict';

  const TTS_MARKER = '/functions/v1/dokohilf-tts';
  const AI_MARKERS = ['/functions/v1/dokohilf-ai-router', '/functions/v1/dokohilf-ai'];
  const APPROVED_AUDIO_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-guide-audio';
  const APPROVED_AUDIO_BUILD = '20260806-27';
  const APPROVED_AUDIO_MANIFEST = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-guide-audio?manifest=1&build=20260806-27';
  const APPROVED_AUDIO_CACHE = 'dokohilf-approved-guide-audio-v28-1';
  const MANIFEST_TIMEOUT_MS = 2500;
  const AUDIO_TIMEOUT_MS = 6500;
  const IOS_LOCAL_TIMEOUT_MS = 20000;
  const OTHER_LOCAL_TIMEOUT_MS = 35000;
  const previousFetch = window.fetch.bind(window);

  let manifestPromise = null;
  let approvedByText = new Map();
  let spokenByReply = new Map();
  let lastStaticHit = '';
  let lastStaticError = '';
  let lastSpokenMapping = '';
  let localTimeouts = 0;

  function requestUrl(input) {
    return typeof input === 'string' ? input : input?.url;
  }

  function requestMethod(input, init = {}) {
    return String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  }

  function isTtsRequest(input, init = {}) {
    const url = requestUrl(input);
    return typeof url === 'string' && url.includes(TTS_MARKER) && requestMethod(input, init) === 'POST';
  }

  function isAiRequest(input, init = {}) {
    const url = requestUrl(input);
    return typeof url === 'string'
      && AI_MARKERS.some(marker => url.includes(marker))
      && requestMethod(input, init) === 'POST';
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

  function rememberSpokenPayload(payload) {
    if (!payload || typeof payload.reply !== 'string' || typeof payload.spokenText !== 'string') return;
    const replyKey = normalizeAudioKey(payload.reply);
    const spoken = String(payload.spokenText || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    if (!replyKey || !spoken) return;
    spokenByReply.set(replyKey, spoken);
    if (spokenByReply.size > 24) spokenByReply.delete(spokenByReply.keys().next().value);
  }

  function mappedSpokenText(text) {
    const mapped = spokenByReply.get(normalizeAudioKey(text));
    if (!mapped) return text;
    lastSpokenMapping = mapped;
    return mapped;
  }

  function replaceTtsBody(init, text) {
    try {
      const body = JSON.parse(String(init?.body || '{}'));
      return { ...init, body: JSON.stringify({ ...body, text }) };
    } catch {
      return init;
    }
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
      if (approvedText.length < 16 || !key.includes(approvedText)) continue;
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
    if (isAiRequest(input, init)) {
      const response = await previousFetch(input, init);
      try { rememberSpokenPayload(await response.clone().json()); } catch { /* not a guide payload */ }
      return response;
    }

    if (!isTtsRequest(input, init)) return previousFetch(input, init);
    const requestedText = extractText(init);
    if (!requestedText) return localError(new Error('empty_local_voice_text'));
    const text = mappedSpokenText(requestedText);
    const voiceInit = text === requestedText ? init : replaceTtsBody(init, text);

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

  function ensureReportConditionStyle() {
    if (document.getElementById('reportProtocolConditionStyleV28')) return;
    const style = document.createElement('style');
    style.id = 'reportProtocolConditionStyleV28';
    style.textContent = `
      .report-protocol-condition{margin:3px 0 0;padding:13px 14px;border:1px solid rgba(241,204,106,.34);border-radius:17px;background:rgba(86,63,11,.28)}
      .report-protocol-condition strong{display:block;color:#ffe59a;font-size:12px;font-weight:950;letter-spacing:.08em;text-transform:uppercase}
      .report-protocol-condition p{margin:6px 0 0;color:#f1e5bd;font-size:14px;line-height:1.45}
      .direct-guide-step.report-protocol-step{border-color:rgba(241,204,106,.28)!important;background:linear-gradient(145deg,rgba(54,43,14,.82),rgba(18,25,27,.94))!important}
      .direct-guide-step.report-protocol-step .direct-guide-number{border-color:rgba(241,204,106,.34)!important;background:linear-gradient(145deg,#80631f,#58440f)!important;color:#fff2ba!important}
      @media(max-width:680px){.report-protocol-condition{padding:12px}.report-protocol-condition p{font-size:13px}}
    `;
    document.head.append(style);
  }

  function polishReportGuide() {
    const view = document.getElementById('directGuideView');
    if (!view || view.hidden || view.querySelector('.report-protocol-condition')) return;
    const title = view.querySelector('.direct-guide-heading h1')?.textContent?.trim();
    if (title !== 'Bericht anlegen') return;
    const steps = [...view.querySelectorAll('.direct-guide-step')];
    if (steps.length < 12) return;

    const texts = [
      'Nur bei diesen zwei Kategorien: „Kontakt – alles außer Arzt“ → Fallgespräch; „Sturzereignis“ → Sturzprotokoll. Bei allen anderen Kategorien direkt mit Schritt 10 weitermachen.',
      'Nur in diesem Sonderfall: Wird das automatisch verknüpfte Protokoll benötigt, bleibt es verknüpft.',
      'Nur in diesem Sonderfall: Wird das Protokoll nicht benötigt, den Protokollnamen anklicken und danach oben rechts das kleine rote X wählen.',
      'Das rote X entfernt nur die Protokollverknüpfung, nicht den Bericht.',
    ];

    steps.slice(5, 9).forEach((step, index) => {
      step.classList.add('report-protocol-step');
      const paragraph = step.querySelector('p');
      if (paragraph && paragraph.textContent !== texts[index]) paragraph.textContent = texts[index];
    });

    const header = document.createElement('li');
    header.className = 'report-protocol-condition';
    header.innerHTML = '<strong>Sonderfall · nur bei 2 Kategorien</strong><p>Kontakt – alles außer Arzt: <b>Fallgespräch</b> · Sturzereignis: <b>Sturzprotokoll</b>. Andere Kategorie gewählt? Dann die Schritte 6–9 überspringen und direkt bei Schritt 10 weitermachen.</p>';
    steps[5].before(header);
  }

  function installReportGuidePolish() {
    ensureReportConditionStyle();
    const run = () => requestAnimationFrame(polishReportGuide);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
    else run();
    new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true });
  }

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
  installReportGuidePolish();
  window.DokoHilfStaticFirstVoiceV28 = {
    manifestUrl: APPROVED_AUDIO_MANIFEST,
    endpoint: APPROVED_AUDIO_ENDPOINT,
    buildId: APPROVED_AUDIO_BUILD,
    cacheName: APPROVED_AUDIO_CACHE,
    getState: () => ({ approvedEntries: approvedByText.size, lastStaticHit, lastStaticError, lastSpokenMapping, spokenMappings: spokenByReply.size, localTimeouts }),
  };
  window.__DOKOHILF_STATIC_FIRST_VOICE_V28__ = true;
  window.__DOKOHILF_LOCAL_VOICE_GATE_V28__ = true;
})();
