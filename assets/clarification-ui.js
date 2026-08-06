(() => {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const CORE_MARKER = '/functions/v1/dokohilf-ai';
  const ROUTER_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai-router';
  let pendingGuideSlug = null;
  function normalizeOptions(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    return value.filter(item => item && typeof item === 'object').map(item => {
      const label = String(item.label || '').trim().slice(0, 80);
      const guideSlug = String(item.guideSlug || '').trim().slice(0, 100);
      const description = String(item.description || '').trim().slice(0, 150);
      return { label, guideSlug, ...(description ? { description } : {}) };
    }).filter(item => item.label && /^[a-z0-9-]+$/.test(item.guideSlug)).filter(item => {
      if (seen.has(item.guideSlug)) return false; seen.add(item.guideSlug); return true;
    }).slice(0, 3);
  }
  function rewriteRequestBody(body, selectedGuideSlug = pendingGuideSlug) {
    if (typeof body !== 'string' || !body || !selectedGuideSlug) return body;
    try { const parsed = JSON.parse(body); pendingGuideSlug = null; return JSON.stringify({ ...parsed, selectedGuideSlug }); }
    catch { return body; }
  }
  root.DokoHilfClarification = { normalizeOptions, rewriteRequestBody };
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  function isCoreRequest(input) { const url = typeof input === 'string' ? input : input?.url; return typeof url === 'string' && url.includes(CORE_MARKER) && !url.includes('dokohilf-ai-router'); }
  function installStyles() {
    if (document.getElementById('clarificationStyles')) return;
    const style = document.createElement('style'); style.id = 'clarificationStyles'; style.textContent = `
      .clarification-options{display:grid;gap:12px;margin:16px 0 6px;padding:16px;border:1px solid rgba(11,107,82,.14);border-radius:22px;background:linear-gradient(145deg,rgba(240,250,247,.98),rgba(255,255,255,.98));box-shadow:0 16px 38px rgba(8,67,50,.10)}
      .clarification-options[hidden]{display:none!important}.clarification-heading{display:grid;gap:3px}.clarification-heading span{color:#5b776e;font-size:11px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.clarification-heading strong{color:#113f34;font-size:18px;line-height:1.3}
      .clarification-option-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.clarification-option{position:relative;min-height:82px;padding:14px 46px 14px 15px;border:1px solid rgba(11,107,82,.18);border-radius:17px;background:#fff;color:#123c32;font:inherit;text-align:left;box-shadow:0 7px 18px rgba(8,67,50,.07)}
      .clarification-option:hover,.clarification-option:active{transform:translateY(-1px);border-color:rgba(11,107,82,.38);box-shadow:0 12px 25px rgba(8,67,50,.12)}.clarification-option:focus-visible{outline:3px solid rgba(37,111,208,.24);outline-offset:2px}
      .clarification-option-title{display:block;font-size:16px;font-weight:850;line-height:1.25}.clarification-option-description{display:block;margin-top:5px;color:#61736d;font-size:13px;font-weight:620;line-height:1.35}.clarification-option-arrow{position:absolute;right:15px;top:50%;transform:translateY(-50%);width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:#eaf6f2;color:#0b6b52;font-size:19px;font-weight:800}
      @media(max-width:520px){.clarification-options{padding:13px;border-radius:19px}.clarification-option-list{grid-template-columns:1fr}.clarification-option{min-height:76px;padding:13px 44px 13px 14px}.clarification-heading strong{font-size:17px}}
      .app-shell[data-mode="voice"] .clarification-options{position:fixed;z-index:145;left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));bottom:calc(126px + env(safe-area-inset-bottom));width:min(720px,calc(100% - 20px));max-height:38vh;overflow:auto;margin:0 auto;padding:12px;border-radius:18px;background:rgba(255,255,255,.97);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
      .app-shell[data-mode="voice"] .clarification-option-list{grid-template-columns:1fr 1fr}.app-shell[data-mode="voice"] .clarification-option{min-height:64px}@media(max-width:600px){.app-shell[data-mode="voice"] .clarification-option-list{grid-template-columns:1fr}.app-shell[data-mode="voice"] .clarification-options{max-height:42vh}}
    `; document.head.append(style);
  }
  function ensurePanel() {
    let panel = document.getElementById('clarificationOptions'); if (panel) return panel; installStyles();
    panel = document.createElement('section'); panel.id = 'clarificationOptions'; panel.className = 'clarification-options'; panel.hidden = true; panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = '<div class="clarification-heading"><span>Eine Entscheidung fehlt noch</span><strong id="clarificationTitle">Wähle den passenden Weg</strong></div><div class="clarification-option-list"></div>';
    const commandRow = document.getElementById('commandRow'); if (commandRow?.parentElement) commandRow.parentElement.insertBefore(panel, commandRow); return panel;
  }
  function clearOptions() { const panel = ensurePanel(); panel.hidden = true; const list = panel.querySelector('.clarification-option-list'); if (list) list.innerHTML = ''; document.getElementById('appShell')?.removeAttribute('data-choice-active'); }
  function renderOptions(value, heading = '') {
    const options = normalizeOptions(value); if (!options.length) return clearOptions();
    const panel = ensurePanel(); const list = panel.querySelector('.clarification-option-list'); const title = panel.querySelector('#clarificationTitle'); if (!list) return;
    if (title) title.textContent = String(heading || 'Wähle den passenden Weg').trim().slice(0, 120); list.innerHTML = '';
    for (const option of options) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'clarification-option'; button.dataset.guideSlug = option.guideSlug; button.dataset.guideLabel = option.label;
      const titleNode = document.createElement('span'); titleNode.className = 'clarification-option-title'; titleNode.textContent = option.label; button.append(titleNode);
      if (option.description) { const descriptionNode = document.createElement('span'); descriptionNode.className = 'clarification-option-description'; descriptionNode.textContent = option.description; button.append(descriptionNode); }
      const arrow = document.createElement('span'); arrow.className = 'clarification-option-arrow'; arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '›'; button.append(arrow); list.append(button);
    }
    panel.hidden = false; document.getElementById('appShell')?.setAttribute('data-choice-active', 'true'); panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function installFetchRouter() {
    if (window.__DOKOHILF_STRUCTURED_CLARIFICATION__) return; const previousFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => { if (!isCoreRequest(input)) return previousFetch(input, init); const response = await previousFetch(ROUTER_ENDPOINT, { ...init, body: rewriteRequestBody(init.body) }); response.clone().json().then(payload => renderOptions(payload?.options, payload?.choiceTitle)).catch(clearOptions); return response; };
    window.__DOKOHILF_STRUCTURED_CLARIFICATION__ = true;
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('.clarification-option'); if (button) { const guideSlug = button.dataset.guideSlug; const label = button.dataset.guideLabel; if (guideSlug && label && window.DokoHilf?.sendMessage) { pendingGuideSlug = guideSlug; clearOptions(); window.DokoHilf.sendMessage(label, { fromVoice: document.getElementById('appShell')?.dataset.mode === 'voice' }); } }
    if (event.target.closest('#resetButton, #homeButton, [data-select-mode]')) clearOptions();
  });
  installFetchRouter(); ensurePanel(); window.DokoHilfClarification = { normalizeOptions, rewriteRequestBody, clearOptions, renderOptions };
})();
