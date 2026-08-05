(() => {
  'use strict';

  const TTS_TIMEOUT_MS = 8500;
  const nativeFetch = window.fetch.bind(window);

  function isTtsRequest(input) {
    const url = typeof input === 'string' ? input : input?.url;
    return typeof url === 'string' && url.includes('/functions/v1/dokohilf-tts');
  }

  // Die natürliche Gemini-Stimme bleibt der Standard. Nur wenn der Dienst
  // wirklich zu lange braucht, darf die Haupt-App auf eine Gerätestimme
  // zurückfallen. Abbrüche durch einen Moduswechsel bleiben echte Abbrüche.
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
    style.textContent = `
      @media (max-width:640px){
        .app-shell[data-mode="voice"]{
          padding-bottom:calc(116px + env(safe-area-inset-bottom));
        }
        .app-shell[data-mode="voice"] .voice-console{
          position:fixed;
          left:max(8px,env(safe-area-inset-left));
          right:max(8px,env(safe-area-inset-right));
          bottom:calc(8px + env(safe-area-inset-bottom));
          z-index:45;
          display:grid!important;
          grid-template-columns:64px minmax(0,1fr) auto;
          align-items:center;
          gap:11px;
          width:auto;
          margin:0;
          padding:10px 11px;
          border:1px solid rgba(11,107,82,.16);
          border-radius:20px;
          background:rgba(255,255,255,.96);
          box-shadow:0 16px 42px rgba(8,67,50,.20);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          text-align:left;
        }
        .app-shell[data-mode="voice"] .voice-orb{
          width:64px;
          height:64px;
          min-width:64px;
          margin:0;
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
          margin:0;
          text-align:left;
        }
        .app-shell[data-mode="voice"] .voice-copy strong{
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
          max-width:88px;
          margin:0;
          padding:0 9px;
          border-radius:12px;
          font-size:11px;
          line-height:1.15;
        }
      }
    `;
    document.head.append(style);
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
    installPersistentVoiceControl();
    addNotfallblattShortcut();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancements, { once: true });
  } else {
    initializeEnhancements();
  }

  window.__DOKOHILF_NATURAL_VOICE__ = true;
  window.__DOKOHILF_PERSISTENT_VOICE_CONTROL__ = true;
})();
