(() => {
  'use strict';

  const BUILD_ID = '20260806-26';
  const TTS_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts';
  const TTS_ENDPOINT_MARKER = '/functions/v1/dokohilf-tts';
  const AI_ENDPOINT_MARKER = '/functions/v1/dokohilf-ai';
  const GREETING = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.';
  const memory = new Map();
  const inflight = new Map();
  const nativeFetch = window.fetch.bind(window);
  let statusObserver = null;

  function cleanText(value) {
    return String(value || '')
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function firstInstruction(value) {
    const raw = String(value || '').replace(/\*\*/g, '').trim();
    const instruction = raw.split(/\n\s*\n/)[0] || raw;
    return cleanText(instruction);
  }

  function optimizeSpokenText(value) {
    const text = firstInstruction(value);
    if (!text || text === GREETING || text.length <= 175) return text;
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(part => part.trim()).filter(Boolean) || [text];
    const compact = sentences.slice(0, 2).join(' ').trim();
    if (compact.length <= 210) return compact;
    const clipped = compact.slice(0, 205).replace(/\s+\S*$/, '').trim();
    return clipped ? `${clipped}.` : text.slice(0, 205);
  }

  function extractTtsText(init) {
    try {
      const parsed = JSON.parse(String(init?.body || '{}'));
      return optimizeSpokenText(parsed.text);
    } catch {
      return '';
    }
  }

  function responseFrom(entry) {
    return new Response(entry.bytes.slice(0), {
      status: 200,
      headers: entry.headers,
    });
  }

  async function loadNaturalVoice(text, init = {}) {
    const optimized = optimizeSpokenText(text);
    if (!optimized) throw new Error('empty_tts_text');
    if (memory.has(optimized)) return responseFrom(memory.get(optimized));
    if (!inflight.has(optimized)) {
      const request = nativeFetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: optimized }),
        signal: init.signal,
      }).then(async response => {
        if (!response.ok) throw new Error(`tts_${response.status}`);
        const bytes = await response.arrayBuffer();
        const headers = new Headers(response.headers);
        headers.set('X-DokoHilf-Client-Cache', 'memory');
        const entry = { bytes, headers, createdAt: Date.now() };
        memory.set(optimized, entry);
        while (memory.size > 12) memory.delete(memory.keys().next().value);
        return entry;
      }).finally(() => inflight.delete(optimized));
      inflight.set(optimized, request);
    }
    return responseFrom(await inflight.get(optimized));
  }

  function prefetchText(value) {
    const text = optimizeSpokenText(value);
    if (!text || memory.has(text) || inflight.has(text)) return;
    loadNaturalVoice(text).catch(() => {});
  }

  function inspectAiResponse(response) {
    response.clone().json().then(payload => {
      if (!payload || typeof payload !== 'object') return;
      if (typeof payload.nextSpokenText === 'string') prefetchText(payload.nextSpokenText);
    }).catch(() => {});
  }

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();

    if (typeof url === 'string' && url.includes(TTS_ENDPOINT_MARKER) && method === 'POST') {
      const text = extractTtsText(init);
      if (!text) return nativeFetch(input, init);
      return loadNaturalVoice(text, init);
    }

    const response = await nativeFetch(input, init);
    if (typeof url === 'string' && url.includes(AI_ENDPOINT_MARKER) && method === 'POST' && response.ok) {
      inspectAiResponse(response);
    }
    return response;
  };

  function warmGreeting() {
    prefetchText(GREETING);
  }

  function polishVoiceStatus() {
    const status = document.getElementById('voiceStatus');
    const hint = document.getElementById('voiceHint');
    if (!status || !hint) return;
    const normalized = cleanText(status.textContent).toLowerCase();
    if (normalized.includes('natürliche stimme wird vorbereitet')) {
      status.textContent = 'Stimme lädt';
      hint.textContent = 'Die Anweisung ist schon vollständig sichtbar.';
    }
  }

  function installStatusObserver() {
    if (statusObserver) return;
    const status = document.getElementById('voiceStatus');
    if (!status) return;
    statusObserver = new MutationObserver(polishVoiceStatus);
    statusObserver.observe(status, { childList: true, characterData: true, subtree: true });
    polishVoiceStatus();
  }

  function polishCopy() {
    const title = document.getElementById('startTitle');
    const intro = title?.nextElementSibling;
    if (title) title.textContent = 'Wobei brauchst du Hilfe?';
    if (intro) intro.textContent = 'Sprich mit DokoHilf oder nutze den übersichtlichen Chat.';
    document.documentElement.dataset.dokohilfExperience = 'premium-v26';
  }

  function initialize() {
    polishCopy();
    installStatusObserver();
    const voiceCard = document.querySelector('[data-select-mode="voice"]');
    voiceCard?.addEventListener('pointerdown', warmGreeting, { passive: true });
    voiceCard?.addEventListener('touchstart', warmGreeting, { passive: true });
    if ('requestIdleCallback' in window) requestIdleCallback(warmGreeting, { timeout: 700 });
    else setTimeout(warmGreeting, 180);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
  window.addEventListener('pageshow', initialize);

  window.DokoHilfExperience = {
    buildId: BUILD_ID,
    warmGreeting,
    prefetchText,
    optimizeSpokenText,
    memoryEntries: () => memory.size,
    inflightEntries: () => inflight.size,
  };
  window.__DOKOHILF_PREMIUM_EXPERIENCE_V26__ = true;
})();
