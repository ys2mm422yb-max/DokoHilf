(() => {
  'use strict';

  const BUILD_ID = '20260806-27';
  const TTS_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts';
  const TTS_MARKER = '/functions/v1/dokohilf-tts';
  const AI_MARKER = '/functions/v1/dokohilf-ai';
  const FAST_FALLBACK_MS = 2400;
  const MEMORY_LIMIT = 18;
  const GREETING = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.';
  const previousFetch = window.fetch.bind(window);
  const memory = new Map();
  const inflight = new Map();
  let statusObserver = null;
  let messageObserver = null;

  const exercisePhrases = [
    /\s*In Übungen ausschließlich Fantasiedaten verwenden\.?/gi,
    /\s*In Übungen nur Fantasiedaten verwenden\.?/gi,
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
        const entry = { bytes, headers, createdAt: Date.now() };
        memory.delete(optimized);
        memory.set(optimized, entry);
        while (memory.size > MEMORY_LIMIT) memory.delete(memory.keys().next().value);
        return entry;
      }).finally(() => inflight.delete(optimized));
      inflight.set(optimized, request);
    }

    return responseFrom(await inflight.get(optimized));
  }

  function prefetchText(value) {
    const text = optimizeSpokenText(value);
    if (!text || memory.has(text) || inflight.has(text)) return Promise.resolve(false);
    return loadNaturalVoice(text).then(() => true).catch(() => false);
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

    if (typeof url === 'string' && url.includes(TTS_MARKER) && method === 'POST') {
      const text = extractText(init);
      if (!text) return previousFetch(input, init);
      if (memory.has(text)) return responseFrom(memory.get(text));
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

  function ensureWorkflowButtons() {
    const examples = document.querySelector('.examples');
    if (!examples || examples.dataset.v27Ready === 'true') return;
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
    setText('.chat-head p', 'Schreib einfach dein Ziel. DokoHilf führt dich nur durch bestätigte Abläufe.');

    const note = document.querySelector('.safety-note');
    if (note) note.innerHTML = '<strong>Keine persönlichen Daten eingeben.</strong><span>Nutze DokoHilf nur für allgemeine Bedienfragen.</span>';
    const brandSmall = document.querySelector('.brand small');
    if (brandSmall) brandSmall.textContent = 'Bedienhilfe';
    document.documentElement.dataset.dokohilfExperience = 'dark-premium-v27';
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
      hint.textContent = 'Nach kurzer Zeit startet automatisch die schnelle Gerätestimme.';
    }
    if (badge && /gerätestimme als ersatz/i.test(badge.textContent || '')) badge.textContent = 'Schnellmodus';
  }

  function prefetchForPrompt(button) {
    const prompt = button?.dataset?.prompt || '';
    const normalized = compact(prompt).toLowerCase();
    const common = [
      ['bericht', 'Öffne beim gewünschten Bewohner den Bereich „Berichte“.'],
      ['visite', 'Öffne „Doku-Erweitert“ und wähle „Visiten“.'],
      ['vital', 'Wähle zuerst den gewünschten Bewohner aus.'],
      ['übergabe', 'Öffne „Analyse“ und wähle „Was war los?“.'],
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
    prefetchText(GREETING);
  }

  function initialize() {
    polishStaticCopy();
    installObservers();
    polishVoiceStatus();
    cleanAssistantMessages();

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
    memoryEntries: () => memory.size,
    inflightEntries: () => inflight.size,
  };
  window.__DOKOHILF_DARK_PREMIUM_V27__ = true;
})();
