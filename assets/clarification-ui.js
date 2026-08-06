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
      .map(item => {
        const label = String(item.label || '').trim().slice(0, 80);
        const guideSlug = String(item.guideSlug || '').trim().slice(0, 100);
        const description = String(item.description || '').trim().slice(0, 140);
        return { label, guideSlug, ...(description ? { description } : {}) };
      })
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
      .clarification-options{display:grid;gap:10px;margin:14px 0 5px;padding:14px;border:1px solid rgba(11,107,82,.16);border-radius:20px;background:linear-gradient(145deg,rgba(237,248,244,.98),rgba(255,255,255,.98));box-shadow:0 10px 28px rgba(8,67,50,.08)}
      .clarification-options[hidden],.voice-focus-choices[hidden]{display:none!important}
      .clarification-options>strong,.voice-focus-choices>strong{color:#174f40;font-size:15px;line-height:1.35}
      .clarification-option-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
      .clarification-option{min-height:64px;padding:12px 14px;border:1px solid rgba(11,107,82,.19);border-radius:16px;background:#fff;color:#0b5d49;font:inherit;text-align:left;box-shadow:0 7px 18px rgba(8,67,50,.08);transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
      .clarification-option span{display:block;font-size:15px;font-weight:840;line-height:1.25}
      .clarification-option small{display:block;margin-top:4px;color:#60766f;font-size:12px;font-weight:650;line-height:1.35}
      .clarification-option:active{transform:scale(.98)}
      .clarification-option:focus-visible{outline:3px solid rgba(11,107,82,.24);outline-offset:2px}
      .voice-focus-choices{width:min(680px,100%);display:grid;gap:9px;padding:12px;border:1px solid rgba(11,107,82,.14);border-radius:20px;background:rgba(255,255,255,.88);box-shadow:0 14px 36px rgba(8,67,50,.1);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
      .voice-focus-choices .clarification-option-list{grid-template-columns:1fr 1fr}
      .voice-focus-choices .clarification-option{min-height:66px}
      @media(max-width:520px){
        .clarification-option-list,.voice-focus-choices .clarification-option-list{grid-template-columns:1fr}
        .clarification-option{min-height:62px}
        .voice-focus-choices{padding:9px;gap:7px}
        .voice-focus-choices>strong{font-size:13px}
        .voice-focus-choices .clarification-option{min-height:56px;padding:9px 12px}
      }
      @media(max-height:720px){.voice-focus-choices .clarification-option small{display:none}.voice-focus-choices .clarification-option{min-height:46px}}
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

  function ensureVoicePanel() {
    let panel = document.getElementById('voiceFocusChoices');
    if (panel) return panel;
    const main = document.querySelector('.voice-focus-main');
    if (!main) return null;
    panel = document.createElement('section');
    panel.id = 'voiceFocusChoices';
    panel.className = 'voice-focus-choices';
    panel.hidden = true;
    panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = '<strong>Bitte wähle:</strong><div class="clarification-option-list"></div>';
    const instruction = main.querySelector('.voice-focus-instruction');
    instruction?.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function createOptionButton(option) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'clarification-option';
    button.dataset.guideSlug = option.guideSlug;
    button.dataset.guideLabel = option.label;
    const label = document.createElement('span');
    label.textContent = option.label;
    button.append(label);
    if (option.description) {
      const description = document.createElement('small');
      description.textContent = option.description;
      button.append(description);
    }
    return button;
  }

  function fillPanel(panel, options, title) {
    if (!panel) return;
    const heading = panel.querySelector(':scope > strong');
    const list = panel.querySelector('.clarification-option-list');
    if (heading) heading.textContent = title;
    if (!list) return;
    list.innerHTML = '';
    for (const option of options) list.append(createOptionButton(option));
    panel.hidden = false;
  }

  function clearOptions() {
    for (const panel of [ensurePanel(), ensureVoicePanel()]) {
      if (!panel) continue;
      panel.hidden = true;
      const list = panel.querySelector('.clarification-option-list');
      if (list) list.innerHTML = '';
    }
  }

  function renderOptions(value, title = 'Bitte wähle, was du meinst:') {
    const options = normalizeOptions(value);
    if (!options.length) return clearOptions();
    const safeTitle = String(title || 'Bitte wähle:').trim().slice(0, 100);
    const chatPanel = ensurePanel();
    const voicePanel = ensureVoicePanel();
    fillPanel(chatPanel, options, safeTitle);
    fillPanel(voicePanel, options, safeTitle);
    if (document.getElementById('appShell')?.dataset.mode !== 'voice') {
      chatPanel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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
        .then(payload => renderOptions(payload?.options, payload?.choiceTitle))
        .catch(clearOptions);
      return response;
    };
    window.__DOKOHILF_STRUCTURED_CLARIFICATION__ = true;
  }

  function installOptionClicks() {
    if (window.__DOKOHILF_CLARIFICATION_CLICKS__) return;
    window.__DOKOHILF_CLARIFICATION_CLICKS__ = true;
    document.addEventListener('click', event => {
      const button = event.target.closest('.clarification-option');
      if (!button) return;
      const guideSlug = button.dataset.guideSlug;
      const label = button.dataset.guideLabel;
      if (!guideSlug || !label || !window.DokoHilf?.sendMessage) return;
      pendingGuideSlug = guideSlug;
      clearOptions();
      window.DokoHilf.sendMessage(label, {
        fromVoice: document.getElementById('appShell')?.dataset.mode === 'voice',
      });
    });

    document.addEventListener('click', event => {
      if (event.target.closest('#resetButton, #homeButton, [data-select-mode]')) clearOptions();
    });
  }

  installStyles();
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
