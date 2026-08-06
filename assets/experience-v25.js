(() => {
  'use strict';

  const BUILD_ID = '20260806-25';
  const TTS_ENDPOINT_MARKER = '/functions/v1/dokohilf-tts';
  const GREETING = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.';
  const memory = new Map();
  const inflight = new Map();
  const nativeFetch = window.fetch.bind(window);

  function cleanText(value) {
    return String(value || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  }

  function extractText(init) {
    try {
      const parsed = JSON.parse(String(init?.body || '{}'));
      return cleanText(parsed.text);
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
    if (memory.has(text)) return responseFrom(memory.get(text));
    if (!inflight.has(text)) {
      const request = nativeFetch('https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: init.signal,
      }).then(async response => {
        if (!response.ok) throw new Error(`tts_${response.status}`);
        const bytes = await response.arrayBuffer();
        const headers = new Headers(response.headers);
        headers.set('X-DokoHilf-Client-Cache', 'memory');
        const entry = { bytes, headers };
        memory.set(text, entry);
        if (memory.size > 8) memory.delete(memory.keys().next().value);
        return entry;
      }).finally(() => inflight.delete(text));
      inflight.set(text, request);
    }
    return responseFrom(await inflight.get(text));
  }

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (typeof url !== 'string' || !url.includes(TTS_ENDPOINT_MARKER) || String(init?.method || 'GET').toUpperCase() !== 'POST') {
      return nativeFetch(input, init);
    }
    const text = extractText(init);
    if (!text) return nativeFetch(input, init);
    return loadNaturalVoice(text, init);
  };

  function warmGreeting() {
    if (memory.has(GREETING) || inflight.has(GREETING)) return;
    loadNaturalVoice(GREETING).catch(() => {});
  }

  function installPremiumStylesLast() {
    const existing = document.querySelector('link[data-dokohilf-premium-v25]');
    if (existing) {
      existing.remove();
      document.head.append(existing);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `assets/premium-ui-v25.css?v=${BUILD_ID}`;
    link.dataset.dokohilfPremiumV25 = 'true';
    document.head.append(link);
  }

  function polishCopy() {
    const title = document.getElementById('startTitle');
    const intro = title?.nextElementSibling;
    if (title) title.textContent = 'Wobei brauchst du Hilfe?';
    if (intro) intro.textContent = 'Sprich mit DokoHilf oder nutze den übersichtlichen Chat.';
    document.documentElement.dataset.dokohilfExperience = 'premium-v25';
  }

  function initialize() {
    installPremiumStylesLast();
    polishCopy();
    const voiceCard = document.querySelector('[data-select-mode="voice"]');
    voiceCard?.addEventListener('pointerdown', warmGreeting, { passive: true });
    voiceCard?.addEventListener('touchstart', warmGreeting, { passive: true });
    if ('requestIdleCallback' in window) requestIdleCallback(warmGreeting, { timeout: 900 });
    else setTimeout(warmGreeting, 220);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();

  window.DokoHilfExperience = {
    buildId: BUILD_ID,
    warmGreeting,
    memoryEntries: () => memory.size,
  };
  window.__DOKOHILF_PREMIUM_EXPERIENCE_V25__ = true;
})();
