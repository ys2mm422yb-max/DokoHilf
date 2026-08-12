(() => {
  'use strict';

  const TTS_TIMEOUT_MS = 20000;
  const nativeFetch = window.fetch.bind(window);
  const NativeAudioContext = window.AudioContext || window.webkitAudioContext || null;
  let sharedAudioContext = null;
  let audioPrimed = false;

  function getSharedAudioContext(...args) {
    if (!NativeAudioContext) return null;
    if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
      sharedAudioContext = new NativeAudioContext(...args);
    }
    return sharedAudioContext;
  }

  function installSharedAudioContext() {
    if (!NativeAudioContext || window.__DOKOHILF_SHARED_AUDIO_CONTEXT__) return;

    function SharedAudioContext(...args) {
      return getSharedAudioContext(...args);
    }

    try {
      Object.setPrototypeOf(SharedAudioContext, NativeAudioContext);
      SharedAudioContext.prototype = NativeAudioContext.prototype;
      if (window.AudioContext) window.AudioContext = SharedAudioContext;
      if (window.webkitAudioContext) window.webkitAudioContext = SharedAudioContext;
      window.__DOKOHILF_SHARED_AUDIO_CONTEXT__ = true;
    } catch {
      // Einige Browser erlauben kein Ersetzen des Konstruktors. Das direkte
      // Entsperren im Nutzerereignis funktioniert dort trotzdem.
    }
  }

  async function unlockAudioPlayback() {
    if (audioPrimed && (!sharedAudioContext || sharedAudioContext.state === 'running')) return true;

    let context = null;
    try {
      context = getSharedAudioContext();
      if (context?.state === 'suspended') await context.resume();
      if (context?.state === 'running') {
        const buffer = context.createBuffer(1, 1, context.sampleRate || 24000);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
      }
    } catch {
      context = null;
    }

    if (!audioPrimed && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      try {
        const silent = new SpeechSynthesisUtterance(' ');
        silent.lang = 'de-DE';
        silent.volume = 0;
        window.speechSynthesis.speak(silent);
        window.speechSynthesis.resume();
      } catch {
        // Die natürliche Stimme bleibt der Standard; die Gerätestimme ist nur Ersatz.
      }
    }

    audioPrimed = Boolean(context?.state === 'running') || ('speechSynthesis' in window);
    document.documentElement.dataset.dokohilfAudio = context?.state || (audioPrimed ? 'device-ready' : 'blocked');
    window.dispatchEvent(new CustomEvent('dokohilf:audio-unlock', {
      detail: { ready: audioPrimed, contextState: context?.state || 'unavailable' },
    }));
    return audioPrimed;
  }

  function isVoiceControl(target) {
    if (!(target instanceof Element)) return false;
    if (target.closest(
      '[data-select-mode="voice"], [data-switch-mode="voice"], #voiceButton, #smallMicButton, #pauseVoiceButton',
    )) return true;
    return document.getElementById('appShell')?.dataset.mode === 'voice'
      && Boolean(target.closest('#resetButton'));
  }

  function primeFromTrustedGesture(event) {
    if (!event.isTrusted || !isVoiceControl(event.target)) return;
    void unlockAudioPlayback();
  }

  function installAudioUnlockListeners() {
    if (document.documentElement.dataset.dokohilfAudioListeners === 'active') return;
    document.documentElement.dataset.dokohilfAudioListeners = 'active';
    document.addEventListener('pointerdown', primeFromTrustedGesture, true);
    document.addEventListener('touchend', primeFromTrustedGesture, true);
    document.addEventListener('click', primeFromTrustedGesture, true);
  }

  function isTtsRequest(input) {
    const url = typeof input === 'string' ? input : input?.url;
    return typeof url === 'string' && url.includes('/functions/v1/dokohilf-tts');
  }

  window.fetch = function patchedFetch(input, init = {}) {
    if (!isTtsRequest(input)) return nativeFetch(input, init);

    const controller = new AbortController();
    const originalSignal = init.signal;
    let timedOut = false;

    const abortFromOriginal = () => controller.abort();
    if (originalSignal) {
      if (originalSignal.aborted) abortFromOriginal();
      else originalSignal.addEventListener('abort', abortFromOriginal, { once: true });
    }

    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TTS_TIMEOUT_MS);

    return nativeFetch(input, { ...init, signal: controller.signal })
      .catch(error => {
        if (timedOut && error?.name === 'AbortError') throw new Error('tts_timeout');
        throw error;
      })
      .finally(() => {
        window.clearTimeout(timer);
        originalSignal?.removeEventListener?.('abort', abortFromOriginal);
      });
  };

  function removeLegacyVoiceUi() {
    document.getElementById('persistentVoiceControlStyles')?.remove();
    document.getElementById('notfallblattButton')?.remove();
    const voiceConsole = document.getElementById('voiceConsole');
    if (voiceConsole) delete voiceConsole.dataset.persistent;
  }

  function initializeAudio() {
    removeLegacyVoiceUi();
    installSharedAudioContext();
    installAudioUnlockListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAudio, { once: true });
  } else {
    initializeAudio();
  }
  window.addEventListener('pageshow', initializeAudio);

  window.DokoHilfAudioUnlock = {
    unlock: unlockAudioPlayback,
    getContext: () => sharedAudioContext,
    isReady: () => audioPrimed && (!sharedAudioContext || sharedAudioContext.state === 'running'),
  };
  window.__DOKOHILF_NATURAL_VOICE__ = true;
  window.__DOKOHILF_MOBILE_VOICE_V2__ = true;
  window.__DOKOHILF_AUDIO_UNLOCK_V3__ = true;
  window.__DOKOHILF_AUDIO_ONLY_V4__ = true;
})();
