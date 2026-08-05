(() => {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const CORE_MARKER = '/functions/v1/dokohilf-ai';
  const ROUTER_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai-router';
  let pendingGuideSlug = null;

  function normalizeOptions(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    return value
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        label: String(item.label || '').trim().slice(0, 80),
        guideSlug: String(item.guideSlug || '').trim().slice(0, 100),
      }))
      .filter(item => item.label && /^[a-z0-9-]+$/.test(item.guideSlug))
      .filter(item => {
        if (seen.has(item.guideSlug)) return false;
        seen.add(item.guideSlug);
        return true;
      })
      .slice(0, 3);
  }

  function rewriteRequestBody(body, selectedGuideSlug = pendingGuideSlug) {
    if (typeof body !== 'string' || !body || !selectedGuideSlug) return body;
    try {
      const parsed = JSON.parse(body);
      pendingGuideSlug = null;
      return JSON.stringify({ ...parsed, selectedGuideSlug });
    } catch {
      return body;
    }
  }

  root.DokoHilfClarification = { normalizeOptions, rewriteRequestBody };
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  function isCoreRequest(input) {
    const url = typeof input === 'string' ? input : input?.url;
    return typeof url === 'string' && url.includes(CORE_MARKER) && !url.includes('dokohilf-ai-router');
  }

  function installStyles() {
    if (document.getElementById('clarificationStyles')) return;
    const style = document.createElement('style');
    style.id = 'clarificationStyles';
    style.textContent = `
      .clarification-options{display:grid;gap:9px;margin:12px 0 4px;padding:12px;border:1px solid rgba(11,107,82,.17);border-radius:18px;background:rgba(237,248,244,.96)}
      .clarification-options[hidden]{display:none!important}
      .clarification-options strong{color:#174f40;font-size:14px;line-height:1.35}
      .clarification-option-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:9px}
      .clarification-option{min-height:52px;padding:10px 13px;border:1px solid rgba(11,107,82,.22);border-radius:14px;background:#fff;color:#0b5d49;font:inherit;font-size:15px;font-weight:780;line-height:1.25;text-align:left;box-shadow:0 5px 14px rgba(8,67,50,.08)}
      .clarification-option:active{transform:scale(.98)}
      .clarification-option:focus-visible{outline:3px solid rgba(11,107,82,.24);outline-offset:2px}
      @media(max-width:520px){.clarification-option-list{grid-template-columns:1fr}.clarification-option{min-height:56px;font-size:16px}}
    `;
    document.head.append(style);
  }

  function ensurePanel() {
    let panel = document.getElementById('clarificationOptions');
    if (panel) return panel;
    installStyles();
    panel = document.createElement('section');
    panel.id = 'clarificationOptions';
    panel.className = 'clarification-options';
    panel.hidden = true;
    panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = '<strong>Bitte wähle, was du meinst:</strong><div class="clarification-option-list"></div>';
    const commandRow = document.getElementById('commandRow');
    if (commandRow?.parentElement) commandRow.parentElement.insertBefore(panel, commandRow);
    return panel;
  }

  function clearOptions() {
    const panel = ensurePanel();
    panel.hidden = true;
    const list = panel.querySelector('.clarification-option-list');
    if (list) list.innerHTML = '';
  }

  function renderOptions(value) {
    const options = normalizeOptions(value);
    if (!options.length) return clearOptions();
    const panel = ensurePanel();
    const list = panel.querySelector('.clarification-option-list');
    if (!list) return;
    list.innerHTML = '';
    for (const option of options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'clarification-option';
      button.textContent = option.label;
      button.dataset.guideSlug = option.guideSlug;
      button.dataset.guideLabel = option.label;
      list.append(button);
    }
    panel.hidden = false;
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function installFetchRouter() {
    if (window.__DOKOHILF_STRUCTURED_CLARIFICATION__) return;
    const previousFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      if (!isCoreRequest(input)) return previousFetch(input, init);
      const response = await previousFetch(ROUTER_ENDPOINT, {
        ...init,
        body: rewriteRequestBody(init.body),
      });
      response.clone().json()
        .then(payload => renderOptions(payload?.options))
        .catch(clearOptions);
      return response;
    };
    window.__DOKOHILF_STRUCTURED_CLARIFICATION__ = true;
  }

  function installOptionClicks() {
    document.addEventListener('click', event => {
      const button = event.target.closest('.clarification-option');
      if (!button) return;
      const guideSlug = button.dataset.guideSlug;
      const label = button.dataset.guideLabel;
      if (!guideSlug || !label || !window.DokoHilf?.sendMessage) return;
      pendingGuideSlug = guideSlug;
      clearOptions();
      window.DokoHilf.sendMessage(label, { fromVoice: document.getElementById('appShell')?.dataset.mode === 'voice' });
    });

    document.addEventListener('click', event => {
      if (event.target.closest('#resetButton, #homeButton, [data-select-mode]')) clearOptions();
    });
  }

  installFetchRouter();
  installOptionClicks();
  ensurePanel();

  window.DokoHilfClarification = {
    normalizeOptions,
    rewriteRequestBody,
    clearOptions,
    renderOptions,
  };
})();
