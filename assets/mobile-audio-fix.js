(() => {
  'use strict';

  const nativeFetch = window.fetch.bind(window);

  function isTtsRequest(input) {
    const url = typeof input === 'string' ? input : input?.url;
    return typeof url === 'string' && url.includes('/functions/v1/dokohilf-tts');
  }

  // Ein flüssiges Gespräch ist wichtiger als eine mehrere Sekunden verspätete
  // Cloud-Stimme. Die Haupt-App fällt bei diesem gezielten Fehler sofort auf
  // die beste verfügbare deutsche Gerätestimme zurück.
  window.fetch = function patchedFetch(input, init = {}) {
    if (isTtsRequest(input)) {
      return Promise.reject(new Error('instant_system_voice'));
    }
    return nativeFetch(input, init);
  };

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addNotfallblattShortcut, { once: true });
  } else {
    addNotfallblattShortcut();
  }

  window.__DOKOHILF_INSTANT_VOICE__ = true;
})();
