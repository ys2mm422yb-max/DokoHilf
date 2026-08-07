(() => {
  'use strict';

  const BUILD_ID = '20260807-28';
  const TTS_MARKER = '/functions/v1/dokohilf-tts';
  const MODEL_ROOT = 'https://huggingface.co/Supertone/supertonic-3/resolve/main';
  const ONNX_DIR = `${MODEL_ROOT}/onnx`;
  const VOICE_STYLE_URL = `${MODEL_ROOT}/voice_styles/F1.json`;
  const ORT_WASM_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/';
  const MODEL_CACHE = 'dokohilf-local-voice-model-v28-1';
  const LANGUAGE = 'de';
  const TOTAL_STEPS = 5;
  const SPEED = 1.06;
  const SILENCE_SECONDS = 0.2;
  const previousFetch = window.fetch.bind(window);

  let enginePromise = null;
  let engineState = 'idle';
  let backend = 'pending';
  let lastError = '';
  let armed = false;

  window.__DOKOHILF_LOCAL_VOICE_V28__ = true;

  function isTtsRequest(input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return typeof url === 'string' && url.includes(TTS_MARKER) && method === 'POST';
  }

  function isModelRequest(input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return method === 'GET' && typeof url === 'string' && url.startsWith(MODEL_ROOT);
  }

  function compactText(value) {
    const text = String(value || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(part => part.trim()).filter(Boolean) || [text];
    const short = sentences.join(' ').trim();
    if (short.length <= 240) return short;
    const clipped = short.slice(0, 235).replace(/\s+\S*$/, '').trim();
    return `${clipped || short.slice(0, 235)}.`;
  }

  function extractText(init) {
    try {
      return compactText(JSON.parse(String(init?.body || '{}')).text);
    } catch {
      return '';
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

  function markBackend(value) {
    backend = value;
    const shell = document.getElementById('appShell');
    if (shell) {
      shell.dataset.localVoice = 'supertonic-3';
      shell.dataset.localVoiceBackend = value;
    }
  }

  async function cachedModelFetch(input, init = {}) {
    if (!('caches' in window)) return previousFetch(input, { ...init, cache: 'force-cache' });
    const request = input instanceof Request ? input : new Request(input, init);
    try {
      const cache = await caches.open(MODEL_CACHE);
      const hit = await cache.match(request.url);
      if (hit) return hit;
      const response = await previousFetch(request, { cache: 'force-cache' });
      if (response.ok) cache.put(request.url, response.clone()).catch(() => {});
      return response;
    } catch {
      return previousFetch(request, { cache: 'force-cache' });
    }
  }

  async function loadProductionEngine() {
    engineState = 'loading';
    lastError = '';
    updateVoiceStatus('Stimme wird eingerichtet …', 'Beim ersten Mal wird das Sprachmodell geladen.');

    const helperUrl = new URL('assets/vendor/supertonic-web-v28.mjs', document.baseURI).href;
    const helper = await import(helperUrl);
    helper.configureRuntime({ wasmBaseUrl: ORT_WASM_BASE, wasmThreads: 1 });

    const load = async executionProvider => helper.loadTextToSpeech(
      ONNX_DIR,
      { executionProviders: [executionProvider], graphOptimizationLevel: 'all' },
      (_name, current, total) => updateVoiceStatus('Stimme wird eingerichtet …', `Sprachmodell ${current} von ${total}`),
    );

    let loaded;
    if (!isIOS() && navigator.gpu) {
      try {
        loaded = await load('webgpu');
        markBackend('webgpu');
      } catch (error) {
        console.warn('DokoHilf: WebGPU local voice unavailable, using WASM.', error);
      }
    }
    if (!loaded) {
      loaded = await load('wasm');
      markBackend('wasm');
    }

    const style = await helper.loadVoiceStyle(VOICE_STYLE_URL);
    engineState = 'ready';
    updateVoiceStatus('Lokale Stimme bereit', 'Läuft direkt auf diesem Gerät.');

    return {
      sampleRate: loaded.cfgs.ae.sample_rate,
      async synthesize(text) {
        const startedAt = performance.now();
        const result = await loaded.textToSpeech.call(
          compactText(text),
          LANGUAGE,
          style,
          TOTAL_STEPS,
          SPEED,
          SILENCE_SECONDS,
        );
        return {
          wav: helper.writeWavFile(result.wav, loaded.cfgs.ae.sample_rate),
          latencyMs: Math.round(performance.now() - startedAt),
        };
      },
    };
  }

  async function prepare() {
    if (!armed) throw new Error('local_voice_not_armed');
    if (enginePromise) return enginePromise;
    const testAdapter = window.__DOKOHILF_LOCAL_VOICE_TEST_ADAPTER__;
    enginePromise = testAdapter?.prepare
      ? Promise.resolve(testAdapter.prepare()).then(engine => {
          engineState = 'ready';
          markBackend(engine?.backend || 'test');
          return engine;
        })
      : loadProductionEngine();
    enginePromise = enginePromise.catch(error => {
      engineState = 'error';
      lastError = error instanceof Error ? error.message : String(error || 'local_voice_failed');
      enginePromise = null;
      updateVoiceStatus('Lokale Stimme konnte nicht starten', 'Tippe auf das Mikrofon, um es erneut zu versuchen.');
      throw error;
    });
    return enginePromise;
  }

  async function synthesize(text) {
    const clean = compactText(text);
    if (!clean) throw new Error('empty_local_voice_text');
    const engine = await prepare();
    if (typeof engine?.synthesize !== 'function') throw new Error('local_voice_engine_missing');
    return engine.synthesize(clean);
  }

  function audioResponse(result) {
    return new Response(result.wav, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store',
        'X-DokoHilf-Voice': 'Supertonic-F1',
        'X-DokoHilf-Voice-Mode': 'local-on-device-v28',
        'X-DokoHilf-Voice-Backend': backend,
        'X-DokoHilf-TTS-Latency': String(result.latencyMs || 0),
        'X-DokoHilf-TTS-Cache': 'no-generated-audio-storage',
      },
    });
  }

  function errorResponse(error) {
    lastError = error instanceof Error ? error.message : String(error || 'local_voice_failed');
    return new Response(JSON.stringify({ error: 'Die lokale Stimme konnte nicht gestartet werden.' }), {
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
    if (isTtsRequest(input, init)) {
      const text = extractText(init);
      if (!text) return errorResponse(new Error('empty_local_voice_text'));
      if (!armed) return errorResponse(new Error('local_voice_not_armed'));
      try {
        updateVoiceStatus(engineState === 'ready' ? 'Stimme wird erzeugt …' : 'Stimme wird eingerichtet …');
        return audioResponse(await synthesize(text));
      } catch (error) {
        return errorResponse(error);
      }
    }
    if (isModelRequest(input, init)) return cachedModelFetch(input, init);
    return previousFetch(input, init);
  };

  function armAndPrepare() {
    armed = true;
    return prepare();
  }

  document.addEventListener('click', event => {
    const voiceEntry = event.target.closest?.('[data-select-mode="voice"], [data-switch-mode="voice"], #voiceButton, #pauseVoiceButton');
    if (voiceEntry) armAndPrepare().catch(() => {});
  }, { capture: true });

  window.DokoHilfLocalVoiceV28 = {
    armAndPrepare,
    prepare,
    synthesize,
    getState: () => ({ buildId: BUILD_ID, state: engineState, backend, lastError, armed, model: 'Supertonic 3', voice: 'F1', language: LANGUAGE }),
  };
})();
