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
        // Gerätestimmen-Fallback bleibt optional.
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
    return target instanceof Element && Boolean(target.closest(
      '[data-select-mode="voice"], [data-switch-mode="voice"], #voiceButton, #smallMicButton, #pauseVoiceButton',
    ));
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

  // Die natürliche Cloud-Stimme bleibt der Standard. Erst nach einer echten,
  // langen Zeitüberschreitung darf die Haupt-App auf eine Gerätestimme fallen.
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

  function installPersistentVoiceControl() {
    if (document.getElementById('persistentVoiceControlStyles')) return;

    const style = document.createElement('style');
    style.id = 'persistentVoiceControlStyles';
    style.dataset.version = '20260806-19';
    style.textContent = `
      html{scroll-padding-top:82px}
      .message{scroll-margin-top:88px}
      @media (max-width:900px){
        .app-shell[data-mode="voice"]{
          padding-bottom:calc(126px + env(safe-area-inset-bottom));
        }
        .app-shell[data-mode="voice"] .main-content{
          padding-bottom:calc(126px + env(safe-area-inset-bottom));
        }
        .app-shell[data-mode="voice"] .voice-console{
          position:fixed!important;
          left:max(8px,env(safe-area-inset-left))!important;
          right:max(8px,env(safe-area-inset-right))!important;
          bottom:calc(8px + env(safe-area-inset-bottom))!important;
          top:auto!important;
          z-index:100!important;
          display:grid!important;
          visibility:visible!important;
          opacity:1!important;
          grid-template-columns:64px minmax(0,1fr) auto;
          align-items:center;
          gap:11px;
          width:auto!important;
          min-height:84px;
          margin:0!important;
          padding:10px 11px!important;
          border:1px solid rgba(11,107,82,.18);
          border-radius:20px;
          background:rgba(255,255,255,.97);
          box-shadow:0 16px 42px rgba(8,67,50,.24);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          transform:translateZ(0);
          text-align:left;
        }
        .app-shell[data-mode="voice"] .voice-orb{
          width:64px!important;
          height:64px!important;
          min-width:64px;
          margin:0!important;
          box-shadow:0 10px 26px rgba(6,77,59,.24),inset 0 1px 0 rgba(255,255,255,.35);
        }
        .app-shell[data-mode="voice"] .orb-rings,
        .app-shell[data-mode="voice"] .orb-rings:before,
        .app-shell[data-mode="voice"] .orb-rings:after{
          inset:-3px;
          border-width:1px;
        }
        .app-shell[data-mode="voice"] .orb-rings:before{inset:-5px}
        .app-shell[data-mode="voice"] .orb-rings:after{inset:-8px}
        .app-shell[data-mode="voice"] .mic-symbol svg{
          width:34px;
          height:34px;
        }
        .app-shell[data-mode="voice"] .mic-symbol path{stroke-width:4}
        .app-shell[data-mode="voice"] .voice-wave{gap:3px}
        .app-shell[data-mode="voice"] .voice-wave i{
          width:4px;
          height:18px;
        }
        .app-shell[data-mode="voice"] .voice-copy{
          min-width:0;
          margin:0!important;
          text-align:left;
        }
        .app-shell[data-mode="voice"] .voice-copy strong{
          display:block;
          overflow:hidden;
          font-size:16px;
          line-height:1.2;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .app-shell[data-mode="voice"] .voice-copy span{
          display:-webkit-box;
          overflow:hidden;
          margin-top:3px;
          font-size:12px;
          line-height:1.25;
          -webkit-box-orient:vertical;
          -webkit-line-clamp:2;
        }
        .app-shell[data-mode="voice"] .pause-button{
          min-height:42px;
          max-width:92px;
          margin:0!important;
          padding:0 9px;
          border-radius:12px;
          font-size:11px;
          line-height:1.15;
        }
      }
      @media (max-width:380px){
        .app-shell[data-mode="voice"] .voice-console{
          grid-template-columns:56px minmax(0,1fr) 76px;
          gap:8px;
          min-height:76px;
          padding:9px!important;
        }
        .app-shell[data-mode="voice"] .voice-orb{
          width:56px!important;
          height:56px!important;
          min-width:56px;
        }
        .app-shell[data-mode="voice"] .mic-symbol svg{width:30px;height:30px}
        .app-shell[data-mode="voice"] .voice-copy strong{font-size:15px}
        .app-shell[data-mode="voice"] .voice-copy span{font-size:11px}
      }
    `;
    document.head.append(style);
  }

  function syncVoiceControl() {
    const shell = document.getElementById('appShell');
    const voiceConsole = document.getElementById('voiceConsole');
    if (!shell || !voiceConsole) return;

    if (shell.dataset.mode === 'voice') {
      voiceConsole.hidden = false;
      voiceConsole.dataset.persistent = 'true';
    } else {
      delete voiceConsole.dataset.persistent;
    }
  }

  function observeModeChanges() {
    const shell = document.getElementById('appShell');
    if (!shell || shell.dataset.voiceObserver === 'active') return;
    shell.dataset.voiceObserver = 'active';
    const observer = new MutationObserver(syncVoiceControl);
    observer.observe(shell, { attributes: true, attributeFilter: ['data-mode'] });
    syncVoiceControl();
  }

  function submitNotfallblattQuestion() {
    const workspace = document.getElementById('workspace');
    const modeButton = workspace?.hidden
      ? document.querySelector('[data-select-mode="chat"]')
      : document.querySelector('[data-switch-mode="chat"]');

    modeButton?.click();

    window.setTimeout(() => {
      const input = document.getElementById('chatInput');
      const form = document.getElementById('chatForm');
      if (!(input instanceof HTMLTextAreaElement) || !(form instanceof HTMLFormElement)) return;

      input.value = 'Wie öffne ich das Notfallblatt?';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }, 120);
  }

  function addNotfallblattShortcut() {
    const actions = document.querySelector('.top-actions');
    if (!actions || document.getElementById('notfallblattButton')) return;

    const style = document.createElement('style');
    style.textContent = `
      .emergency-button{
        width:40px;height:40px;min-width:40px;border:0;border-radius:13px;
        display:inline-grid;place-items:center;background:#c62828;color:#fff;
        font-size:26px;font-weight:900;line-height:1;box-shadow:0 7px 16px rgba(150,20,20,.22)
      }
      .emergency-button:active{transform:scale(.96);background:#a91f1f}
      .emergency-button:focus-visible{outline:3px solid rgba(198,40,40,.28);outline-offset:2px}
      @media(max-width:390px){.emergency-button{width:38px;height:38px;min-width:38px;border-radius:12px;font-size:24px}}
    `;
    document.head.append(style);

    const button = document.createElement('button');
    button.id = 'notfallblattButton';
    button.className = 'emergency-button';
    button.type = 'button';
    button.textContent = '+';
    button.setAttribute('aria-label', 'Anleitung zum Notfallblatt öffnen');
    button.setAttribute('title', 'Notfallblatt');
    button.addEventListener('click', submitNotfallblattQuestion);
    actions.append(button);
  }

  function initializeEnhancements() {
    installSharedAudioContext();
    installAudioUnlockListeners();
    installPersistentVoiceControl();
    addNotfallblattShortcut();
    observeModeChanges();
    syncVoiceControl();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancements, { once: true });
  } else {
    initializeEnhancements();
  }
  window.addEventListener('pageshow', initializeEnhancements);

  window.DokoHilfAudioUnlock = {
    unlock: unlockAudioPlayback,
    getContext: () => sharedAudioContext,
    isReady: () => audioPrimed && (!sharedAudioContext || sharedAudioContext.state === 'running'),
  };
  window.__DOKOHILF_NATURAL_VOICE__ = true;
  window.__DOKOHILF_PERSISTENT_VOICE_CONTROL__ = true;
  window.__DOKOHILF_MOBILE_VOICE_V2__ = true;
  window.__DOKOHILF_AUDIO_UNLOCK_V3__ = true;
})();
