(() => {
  'use strict';

  const BUILD_ID = '20260806-27';
  const TTS_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts';
  const TTS_MARKER = '/functions/v1/dokohilf-tts';
  const AI_MARKER = '/functions/v1/dokohilf-ai';
  const AUDIO_MANIFEST_URL = './assets/guide-audio-manifest.json?v=20260806-27';
  const FAST_FALLBACK_MS = 2400;
  const MANIFEST_TIMEOUT_MS = 1200;
  const MEMORY_LIMIT = 24;
  const GREETING = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.';
  const previousFetch = window.fetch.bind(window);
  const memory = new Map();
  const inflight = new Map();
  const prebuiltByKey = new Map();
  let manifestPromise = null;
  let statusObserver = null;
  let messageObserver = null;

  const exercisePhrases = [
    /\s*In Übungen ausschließlich Fantasiedaten verwenden\.?/gi,
    /\s*In Übungen nur Fantasiedaten verwenden\.?/gi,
    /\s*In Übungen nur Fantasiewerte verwenden\.?/gi,
    /\s*Im öffentlichen Test ausschließlich Fantasiedaten verwenden\.?/gi,
    /\s*Verwende in Übungen ausschließlich Fantasiedaten\.?/gi,
    /\s*Verwende dabei nur Fantasiedaten\.?/gi,
    /\s*In Übungen ausschließlich mit Fantasiedaten arbeiten\.?/gi,
  ];

  function compact(value) {
    return String(value || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  }

  function removeRepeatedExerciseNotice(value) {
    let text = String(value || '');
    for (const pattern of exercisePhrases) text = text.replace(pattern, '');
    return text.replace(/\s+([,.!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  }

  function firstInstruction(value) {
    const clean = removeRepeatedExerciseNotice(String(value || '').replace(/\*\*/g, '').trim());
    return compact(clean.split(/\n\s*\n/)[0] || clean);
  }

  function optimizeSpokenText(value) {
    const text = firstInstruction(value);
    if (!text || text.length <= 185) return text;
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(part => part.trim()).filter(Boolean) || [text];
    const short = sentences.slice(0, 2).join(' ').trim();
    if (short.length <= 220) return short;
    const clipped = short.slice(0, 215).replace(/\s+\S*$/, '').trim();
    return clipped ? `${clipped}.` : short.slice(0, 215);
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

  function extractText(init) {
    try {
      const payload = JSON.parse(String(init?.body || '{}'));
      return optimizeSpokenText(payload.text);
    } catch {
      return '';
    }
  }

  function responseFrom(entry) {
    return new Response(entry.bytes.slice(0), { status: 200, headers: entry.headers });
  }

  function remember(text, bytes, headers) {
    const entry = { bytes, headers, createdAt: Date.now() };
    memory.delete(text);
    memory.set(text, entry);
    while (memory.size > MEMORY_LIMIT) memory.delete(memory.keys().next().value);
    return entry;
  }

  function fetchJsonWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return previousFetch(url, { cache: 'force-cache', signal: controller.signal })
      .finally(() => clearTimeout(timer));
  }

  function loadPrebuiltManifest() {
    if (prebuiltByKey.size) return Promise.resolve(prebuiltByKey);
    if (manifestPromise) return manifestPromise;

    manifestPromise = fetchJsonWithTimeout(AUDIO_MANIFEST_URL, MANIFEST_TIMEOUT_MS)
      .then(async response => {
        if (!response.ok) throw new Error(`guide_audio_manifest_${response.status}`);
        const manifest = await response.json();
        if (manifest?.voice !== 'Gacrux' || !Array.isArray(manifest?.entries)) {
          throw new Error('invalid_guide_audio_manifest');
        }
        for (const entry of manifest.entries) {
          if (!entry || typeof entry.key !== 'string' || typeof entry.file !== 'string') continue;
          prebuiltByKey.set(entry.key, entry);
        }
        return prebuiltByKey;
      })
      .catch(() => {
        manifestPromise = null;
        return prebuiltByKey;
      });

    return manifestPromise;
  }

  async function loadPrebuiltVoice(text) {
    const optimized = optimizeSpokenText(text);
    if (!optimized) return null;
    if (memory.has(optimized)) return responseFrom(memory.get(optimized));

    const manifest = await loadPrebuiltManifest();
    const entry = manifest.get(normalizeAudioKey(optimized));
    if (!entry) return null;

    const response = await previousFetch(entry.file, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`prebuilt_audio_${response.status}`);
    const bytes = await response.arrayBuffer();
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'audio/wav');
    headers.set('X-DokoHilf-Voice', 'Gacrux');
    headers.set('X-DokoHilf-TTS-Model', 'prebuilt-approved-guide');
    headers.set('X-DokoHilf-Voice-Mode', 'static-approved-guide');
    headers.set('X-DokoHilf-Voice-Style', 'approved-guide-static-v1');
    headers.set('X-DokoHilf-TTS-Cache', 'static-file');
    headers.set('X-DokoHilf-Client-Cache', 'prebuilt-v27');
    return responseFrom(remember(optimized, bytes, headers));
  }

  async function loadNaturalVoice(text, init = {}) {
    const optimized = optimizeSpokenText(text);
    if (!optimized) throw new Error('empty_tts_text');
    if (memory.has(optimized)) return responseFrom(memory.get(optimized));

    if (!inflight.has(optimized)) {
      const request = previousFetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: optimized }),
        signal: init.signal,
      }).then(async response => {
        if (!response.ok) throw new Error(`tts_${response.status}`);
        const bytes = await response.arrayBuffer();
        const headers = new Headers(response.headers);
        headers.set('X-DokoHilf-Client-Cache', 'memory-v27');
        return remember(optimized, bytes, headers);
      }).finally(() => inflight.delete(optimized));
      inflight.set(optimized, request);
    }

    return responseFrom(await inflight.get(optimized));
  }

  async function loadPreferredVoice(text, init = {}) {
    try {
      const prebuilt = await loadPrebuiltVoice(text);
      if (prebuilt) return prebuilt;
    } catch {
      // Eine beschädigte oder vorübergehend nicht erreichbare statische Datei blockiert die Live-Stimme nicht.
    }
    return loadNaturalVoice(text, init);
  }

  function prefetchText(value) {
    const text = optimizeSpokenText(value);
    if (!text || memory.has(text) || inflight.has(text)) return Promise.resolve(false);
    return loadPreferredVoice(text).then(() => true).catch(() => false);
  }

  function fastRace(cloudPromise) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('dokohilf_fast_voice_fallback')), FAST_FALLBACK_MS);
    });
    cloudPromise.catch(() => {});
    return Promise.race([cloudPromise, timeout]).finally(() => clearTimeout(timer));
  }

  function inspectAiResponse(response) {
    response.clone().json().then(payload => {
      if (!payload || typeof payload !== 'object') return;
      if (typeof payload.spokenText === 'string') prefetchText(payload.spokenText);
      if (typeof payload.nextSpokenText === 'string') prefetchText(payload.nextSpokenText);
    }).catch(() => {});
  }

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();

    // v28 owns the complete speech path. Keep this historical v27 wrapper inert so
    // it cannot reintroduce Gacrux, Cloud-TTS or a second voice if requests pass
    // through it underneath the v28 gate.
    if (window.__DOKOHILF_LOCAL_VOICE_V28__ === true) return previousFetch(input, init);

    if (typeof url === 'string' && url.includes(TTS_MARKER) && method === 'POST') {
      const text = extractText(init);
      if (!text) return previousFetch(input, init);
      if (memory.has(text)) return responseFrom(memory.get(text));

      try {
        const prebuilt = await loadPrebuiltVoice(text);
        if (prebuilt) return prebuilt;
      } catch {
        // Fällt eine statische Datei aus, greift direkt der begrenzte Live-TTS-Weg.
      }
      return fastRace(loadNaturalVoice(text, init));
    }

    const response = await previousFetch(input, init);
    if (typeof url === 'string' && url.includes(AI_MARKER) && method === 'POST' && response.ok) inspectAiResponse(response);
    return response;
  };

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function v29OwnsPresentation() {
    const examples = document.querySelector('.examples');
    return window.__DOKOHILF_UI_V29__ === true
      || document.documentElement.dataset.dokohilfUi === 'v29'
      || examples?.dataset.v29GuideLibrary === 'true'
      || window.__DOKOHILF_GUIDE_LIBRARY_V29__ === true
      || window.__DOKOHILF_GUIDE_LIBRARY_V29__ === 'initializing';
  }

  function ensureWorkflowButtons() {
    const examples = document.querySelector('.examples');
    if (!examples || v29OwnsPresentation() || examples.dataset.v27Ready === 'direct-guides-cross-platform' || examples.dataset.v27Ready === 'true') return;
    examples.dataset.v27Ready = 'true';
    examples.innerHTML = `
      <span>Häufige Abläufe</span>
      <button type="button" data-prompt="Ich möchte einen Bericht schreiben">Bericht anlegen</button>
      <button type="button" data-prompt="Wie lege ich eine Visite an?">Visite anlegen</button>
      <button type="button" data-prompt="Ich möchte Vitalwerte eingeben">Vitalwerte erfassen</button>
      <button type="button" data-prompt="Wie erfasse ich eine An- oder Abwesenheit?">An-/Abwesenheit</button>
      <button type="button" data-prompt="Wie kann ich die Medikation ansehen?">Medikation ansehen</button>
      <button type="button" data-prompt="Wie lege ich ein Formular an?">Formular anlegen</button>
      <button type="button" data-prompt="Wie komme ich zur Übergabe?">Übergabe anzeigen</button>
    `;
  }

  function polishStaticCopy() {
    document.documentElement.dataset.dokohilfExperience = 'dark-premium-v27';
    if (v29OwnsPresentation()) return;
    setText('#startTitle', 'Was möchtest du erledigen?');
    const intro = document.querySelector('#startTitle + p');
    if (intro) intro.textContent = 'Wähle einen Ablauf oder starte ein Sprachgespräch.';
    const voiceTitle = document.querySelector('[data-select-mode="voice"] .mode-text strong');
    const voiceText = document.querySelector('[data-select-mode="voice"] .mode-text small');
    const chatTitle = document.querySelector('[data-select-mode="chat"] .mode-text strong');
    const chatText = document.querySelector('[data-select-mode="chat"] .mode-text small');
    if (voiceTitle) voiceTitle.textContent = 'Sprechen';
    if (voiceText) voiceText.textContent = 'DokoHilf hört zu und führt dich Schritt für Schritt.';
    if (chatTitle) chatTitle.textContent = 'Schreiben';
    if (chatText) chatText.textContent = 'Schreibe oder diktiere. Alles bleibt übersichtlich zum Nachlesen.';
    setText('.chat-head h1', 'Was möchtest du machen?');
    setText('.chat-head p', 'Schreib kurz, was du erledigen möchtest. DokoHilf führt dich Schritt für Schritt.');

    const note = document.querySelector('.safety-note');
    if (note) note.innerHTML = '<strong>Keine persönlichen Daten eingeben.</strong><span>Nutze DokoHilf nur für allgemeine Bedienfragen.</span>';
    const brandSmall = document.querySelector('.brand small');
    if (brandSmall) brandSmall.textContent = 'Bedienhilfe';
    ensureWorkflowButtons();
  }

  function cleanAssistantMessages() {
    for (const paragraph of document.querySelectorAll('#messages .message.assistant .bubble p, #voiceFocusText')) {
      const current = paragraph.textContent || '';
      const cleaned = removeRepeatedExerciseNotice(current);
      if (cleaned && cleaned !== current) paragraph.textContent = cleaned;
    }
  }

  function polishVoiceStatus() {
    const status = document.getElementById('voiceStatus');
    const hint = document.getElementById('voiceHint');
    const badge = document.querySelector('.voice-engine-badge');
    if (!status || !hint) return;
    const normalized = compact(status.textContent).toLowerCase();

    if (normalized.includes('natürliche stimme wird vorbereitet') || normalized.includes('stimme lädt')) {
      status.textContent = 'Stimme startet';
      hint.textContent = 'Bekannte Schritte starten direkt. Freie Antworten wechseln nach kurzer Zeit zur Sofortstimme.';
    }
    if (badge && /gerätestimme als ersatz/i.test(badge.textContent || '')) badge.textContent = 'Sofortstimme';
  }

  function prefetchForPrompt(button) {
    const prompt = button?.dataset?.prompt || '';
    const normalized = compact(prompt).toLowerCase();
    const common = [
      ['bericht', 'Öffne beim gewünschten Bewohner den Bereich „Berichte“.'],
      ['visite', 'Öffne „Doku-Erweitert“ und wähle „Visiten“.'],
      ['vital', 'Wähle zuerst den gewünschten Bewohner aus.'],
      ['übergabe', 'Öffne oben den Reiter „Analyse“.'],
      ['medikation', 'Wähle zuerst den gewünschten Bewohner aus.'],
      ['formular', 'Wähle zuerst den gewünschten Bewohner aus.'],
      ['abwesenheit', 'Wähle zuerst den gewünschten Bewohner aus.'],
    ];
    const match = common.find(([needle]) => normalized.includes(needle));
    if (match) prefetchText(match[1]);
  }

  function installObservers() {
    if (!statusObserver) {
      const target = document.getElementById('voiceStatus') || document.body;
      statusObserver = new MutationObserver(polishVoiceStatus);
      statusObserver.observe(target, { childList: true, characterData: true, subtree: true });
    }
    if (!messageObserver) {
      const messages = document.getElementById('messages') || document.body;
      messageObserver = new MutationObserver(cleanAssistantMessages);
      messageObserver.observe(messages, { childList: true, characterData: true, subtree: true });
    }
  }

  function warmGreeting() {
    return prefetchText(GREETING);
  }

  function initialize() {
    polishStaticCopy();
    installObservers();
    polishVoiceStatus();
    cleanAssistantMessages();

    // v29 uses only the static/local Supertonic path. The legacy v27 prefetch is
    // kept for compatibility tests, but must not make manifest or cloud requests
    // when the local voice runtime owns speech.
    if (window.__DOKOHILF_LOCAL_VOICE_V28__ !== true) {
      loadPrebuiltManifest().then(() => warmGreeting()).catch(() => {});

      const voiceCard = document.querySelector('[data-select-mode="voice"]');
      voiceCard?.addEventListener('pointerdown', warmGreeting, { passive: true });
      voiceCard?.addEventListener('touchstart', warmGreeting, { passive: true });
      document.addEventListener('pointerdown', event => {
        const promptButton = event.target.closest('[data-prompt]');
        if (promptButton) prefetchForPrompt(promptButton);
      }, { passive: true });

      if ('requestIdleCallback' in window) requestIdleCallback(warmGreeting, { timeout: 850 });
      else setTimeout(warmGreeting, 250);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
  window.addEventListener('pageshow', initialize);

  window.DokoHilfExperienceV27 = {
    buildId: BUILD_ID,
    fastFallbackMs: FAST_FALLBACK_MS,
    prefetchText,
    warmGreeting,
    optimizeSpokenText,
    removeRepeatedExerciseNotice,
    normalizeAudioKey,
    prebuiltEntries: () => prebuiltByKey.size,
    memoryEntries: () => memory.size,
    inflightEntries: () => inflight.size,
  };
  window.__DOKOHILF_DARK_PREMIUM_V27__ = true;
  window.__DOKOHILF_PREBUILT_GUIDE_AUDIO_V1__ = true;
})();
