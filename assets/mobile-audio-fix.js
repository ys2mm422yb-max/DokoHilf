(() => {
  'use strict';

  const TTS_TIMEOUT_MS = 6500;
  const DECODE_TIMEOUT_MS = 2500;
  const nativeFetch = window.fetch.bind(window);

  function isTtsRequest(input) {
    const url = typeof input === 'string' ? input : input?.url;
    return typeof url === 'string' && url.includes('/functions/v1/dokohilf-tts');
  }

  window.fetch = function patchedFetch(input, init = {}) {
    if (!isTtsRequest(input)) return nativeFetch(input, init);

    const controller = new AbortController();
    const originalSignal = init.signal;
    const abortFromOriginal = () => controller.abort(originalSignal?.reason);

    if (originalSignal) {
      if (originalSignal.aborted) abortFromOriginal();
      else originalSignal.addEventListener('abort', abortFromOriginal, { once: true });
    }

    const timer = window.setTimeout(() => controller.abort('tts_timeout'), TTS_TIMEOUT_MS);
    return nativeFetch(input, { ...init, signal: controller.signal }).finally(() => {
      window.clearTimeout(timer);
      originalSignal?.removeEventListener?.('abort', abortFromOriginal);
    });
  };

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (AudioContextClass?.prototype?.decodeAudioData) {
    const nativeDecode = AudioContextClass.prototype.decodeAudioData;

    AudioContextClass.prototype.decodeAudioData = function patchedDecodeAudioData(audioData) {
      return new Promise((resolve, reject) => {
        let settled = false;
        const finish = callback => value => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          callback(value);
        };
        const succeed = finish(resolve);
        const fail = finish(reject);
        const timer = window.setTimeout(
          () => fail(new DOMException('Audio-Dekodierung dauerte zu lange.', 'TimeoutError')),
          DECODE_TIMEOUT_MS,
        );

        try {
          const result = nativeDecode.call(this, audioData, succeed, fail);
          if (result?.then) result.then(succeed, fail);
        } catch (error) {
          fail(error);
        }
      });
    };
  }

  window.__DOKOHILF_MOBILE_AUDIO_FIX__ = true;
})();
