(() => {
  'use strict';

  const TTS_MARKER = '/functions/v1/dokohilf-tts';
  const MANIFEST_URL = './assets/guide-audio-manifest.json?v=20260806-27';
  const MANIFEST_WAIT_MS = 320;
  const STATIC_AUDIO_WAIT_MS = 700;
  const manifestByKey = new Map();
  const staticMemory = new Map();
  const previousFetch = window.fetch.bind(window);
  let manifestPromise = null;

  function compact(value) {
    return String(value || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  }

  function optimizeSpokenText(value) {
    const text = compact(value);
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
    return new Response(entry.bytes.slice(0), { status: 200, headers: new Headers(entry.headers) });
  }

  function withTimeout(promise, timeoutMs, label) {
    let timer = 0;
    const timeout = new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(new Error(label)), timeoutMs);
    });
    return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
  }

  function loadManifest() {
    if (manifestByKey.size) return Promise.resolve(manifestByKey);
    if (manifestPromise) return manifestPromise;
    manifestPromise = previousFetch(MANIFEST_URL, { cache: 'force-cache' })
      .then(async response => {
        if (!response.ok) throw new Error(`guide_audio_manifest_${response.status}`);
        const payload = await response.json();
        if (payload?.voice !== 'Gacrux' || !Array.isArray(payload?.entries)) throw new Error('guide_audio_manifest_invalid');
        manifestByKey.clear();
        for (const entry of payload.entries) {
          if (!entry || typeof entry.key !== 'string' || typeof entry.file !== 'string') continue;
          manifestByKey.set(entry.key, entry);
        }
        return manifestByKey;
      })
      .catch(error => {
        manifestPromise = null;
        throw error;
      });
    return manifestPromise;
  }

  async function findStaticEntry(text) {
    const key = normalizeAudioKey(text);
    if (!key) return null;
    if (!manifestByKey.size) {
      try { await withTimeout(loadManifest(), MANIFEST_WAIT_MS, 'guide_audio_manifest_wait'); }
      catch { return null; }
    }
    return manifestByKey.get(key) || null;
  }

  async function loadStaticVoice(text) {
    const optimized = optimizeSpokenText(text);
    if (!optimized) return null;
    if (staticMemory.has(optimized)) return responseFrom(staticMemory.get(optimized));
    const entry = await findStaticEntry(optimized);
    if (!entry) return null;

    const response = await withTimeout(
      previousFetch(entry.file, { cache: 'force-cache' }),
      STATIC_AUDIO_WAIT_MS,
      'guide_audio_file_wait',
    );
    if (!response.ok || !/audio\/wav/i.test(response.headers.get('content-type') || '')) return null;
    const bytes = await response.arrayBuffer();
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'audio/wav');
    headers.set('X-DokoHilf-Voice', 'Gacrux');
    headers.set('X-DokoHilf-Voice-Mode', 'static-approved-guide');
    headers.set('X-DokoHilf-Client-Cache', 'fluid-static-v27');
    const remembered = { bytes, headers };
    staticMemory.set(optimized, remembered);
    return responseFrom(remembered);
  }

  function activateInstantDeviceVoice(reason = 'Kein sofort verfügbares freigegebenes Gacrux-Audio') {
    window.DokoHilfVoiceDiagnostics?.setEngine?.('device', 'Sofortstimme', reason);
    window.dispatchEvent(new CustomEvent('dokohilf:instant-device-voice', { detail: { reason } }));
  }

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    if (typeof url !== 'string' || !url.includes(TTS_MARKER) || method !== 'POST') return previousFetch(input, init);

    const text = extractText(init);
    if (!text) return previousFetch(input, init);

    try {
      const staticVoice = await loadStaticVoice(text);
      if (staticVoice) return staticVoice;
    } catch {
      // Statisches Audio darf niemals den sofortigen Sprachstart blockieren.
    }

    activateInstantDeviceVoice();
    throw new Error('dokohilf_instant_device_voice');
  };

  function installSpeechSynthesisWatchdog() {
    const synth = window.speechSynthesis;
    if (!synth || window.__DOKOHILF_SPEECH_SYNTHESIS_WATCHDOG__) return;
    try {
      const nativeSpeak = synth.speak.bind(synth);
      synth.speak = utterance => {
        nativeSpeak(utterance);
        try { synth.resume(); } catch { /* no-op */ }
        for (const delay of [80, 240, 520]) {
          window.setTimeout(() => {
            try {
              if ((synth.pending || synth.paused) && !synth.speaking) synth.resume();
            } catch { /* no-op */ }
          }, delay);
        }
      };
      window.__DOKOHILF_SPEECH_SYNTHESIS_WATCHDOG__ = true;
    } catch {
      // Safari kann native Methoden schreibgeschützt exponieren. Der bestehende Audio-Unlock bleibt dann aktiv.
    }
  }

  function warmStaticManifest() {
    loadManifest().catch(() => {});
  }

  installSpeechSynthesisWatchdog();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', warmStaticManifest, { once: true });
  else warmStaticManifest();
  window.addEventListener('pageshow', warmStaticManifest);

  window.DokoHilfFluidVoiceV27 = {
    mode: 'static-gacrux-or-instant-device',
    manifestWaitMs: MANIFEST_WAIT_MS,
    staticAudioWaitMs: STATIC_AUDIO_WAIT_MS,
    staticEntries: () => manifestByKey.size,
  };
  window.__DOKOHILF_FLUID_VOICE_V27__ = true;
})();