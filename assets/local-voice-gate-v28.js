(() => {
  'use strict';

  const TTS_MARKER = '/functions/v1/dokohilf-tts';
  const previousFetch = window.fetch.bind(window);

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

  window.fetch = async (input, init = {}) => {
    if (!isTtsRequest(input, init)) return previousFetch(input, init);
    const text = extractText(init);
    if (!text || !window.DokoHilfLocalVoiceV28) return localError(new Error('local_voice_runtime_missing'));
    try {
      const result = await window.DokoHilfLocalVoiceV28.synthesize(text);
      return localResponse(result);
    } catch (error) {
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
  window.__DOKOHILF_LOCAL_VOICE_GATE_V28__ = true;
})();
