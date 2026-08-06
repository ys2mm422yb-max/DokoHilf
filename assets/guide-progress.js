(() => {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const STATE_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-guide-state';
  function formatProgress(step, count) { const safeStep = Number.isFinite(Number(step)) ? Math.max(1, Number(step)) : 1; const safeCount = Number.isFinite(Number(count)) ? Math.max(safeStep, Number(count)) : safeStep; return `Schritt ${safeStep} von ${safeCount}`; }
  root.DokoHilfGuideProgress = { formatProgress }; if (typeof window === 'undefined' || typeof document === 'undefined') return;
  let currentGuide = null; let requestSequence = 0;
  function isAiRequest(input) { const url = typeof input === 'string' ? input : input?.url; return typeof url === 'string' && url.includes('/functions/v1/dokohilf-ai'); }
  function parseMessages(body) { if (typeof body !== 'string' || !body) return []; try { const parsed = JSON.parse(body); return Array.isArray(parsed.messages) ? parsed.messages : []; } catch { return []; } }
  function installStyles() {
    if (document.getElementById('guideProgressStyles')) return; const style = document.createElement('style'); style.id = 'guideProgressStyles'; style.textContent = `
      .guide-progress{position:sticky;top:76px;z-index:22;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;margin:0 0 16px;padding:13px 15px;border:1px solid rgba(11,107,82,.14);border-radius:19px;background:rgba(255,255,255,.96);box-shadow:0 12px 30px rgba(8,67,50,.09);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}.guide-progress[hidden]{display:none!important}
      .guide-progress-copy{min-width:0;display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-areas:"badge title" "badge step";column-gap:11px;align-items:center}.guide-progress-copy:before{content:"✓";grid-area:badge;width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(145deg,#159a79,#0b6b52);color:#fff;font-size:17px;font-weight:900;box-shadow:0 8px 18px rgba(11,107,82,.18)}
      .guide-progress-copy span{grid-area:title;color:#5d756d;font-size:10px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.guide-progress-copy strong{grid-area:title;align-self:end;margin-top:13px;overflow:hidden;color:#113f34;font-size:16px;line-height:1.2;text-overflow:ellipsis;white-space:nowrap}.guide-progress-copy small{grid-area:step;align-self:start;margin-top:3px;color:#507066;font-size:12px;font-weight:750}
      .guide-progress-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.guide-progress-actions button{min-height:38px;padding:0 11px;border:1px solid rgba(11,107,82,.16);border-radius:11px;background:#f7fbfa;color:#174f40;font-size:12px;font-weight:780}.guide-progress-actions button:active{transform:scale(.97)}.guide-progress-actions button:disabled{cursor:not-allowed;opacity:.42;transform:none}
      @media(max-width:700px){.guide-progress{top:68px;grid-template-columns:1fr;padding:12px 13px;border-radius:17px}.guide-progress-actions{display:grid;grid-template-columns:repeat(3,1fr)}.guide-progress-actions button{min-height:42px;padding:0 7px;font-size:11px}}
    `; document.head.append(style);
  }
  function ensureProgressBar() {
    let bar = document.getElementById('guideProgress'); if (bar) return bar; installStyles(); bar = document.createElement('section'); bar.id = 'guideProgress'; bar.className = 'guide-progress'; bar.hidden = true; bar.setAttribute('aria-live', 'polite');
    bar.innerHTML = '<div class="guide-progress-copy"><span>Aktueller Ablauf</span><strong id="guideProgressTitle"></strong><small id="guideProgressStep"></small></div><div class="guide-progress-actions"><button type="button" data-guide-action="back">Zurück</button><button type="button" data-guide-action="restart">Neu starten</button><button type="button" data-guide-action="change">Ablauf wechseln</button></div>';
    const conversation = document.querySelector('.conversation'); if (conversation?.parentElement) conversation.parentElement.insertBefore(bar, conversation); return bar;
  }
  function syncCommandRow() { const row = document.getElementById('commandRow'); if (row) row.hidden = !currentGuide; }
  function clearGuide() { currentGuide = null; ensureProgressBar().hidden = true; syncCommandRow(); document.getElementById('appShell')?.removeAttribute('data-guide-active'); }
  function renderGuide(guide) {
    currentGuide = { guideSlug: guide.guideSlug, guideTitle: guide.guideTitle || guide.guideSlug, guideStep: Number(guide.guideStep) || 1, guideStepCount: Number(guide.guideStepCount) || 1 };
    const bar = ensureProgressBar(); const title = document.getElementById('guideProgressTitle'); const step = document.getElementById('guideProgressStep'); const back = bar.querySelector('[data-guide-action="back"]');
    if (title) title.textContent = currentGuide.guideTitle; if (step) step.textContent = formatProgress(currentGuide.guideStep, currentGuide.guideStepCount); if (back instanceof HTMLButtonElement) back.disabled = currentGuide.guideStep <= 1;
    bar.hidden = false; syncCommandRow(); document.getElementById('appShell')?.setAttribute('data-guide-active', currentGuide.guideSlug);
  }
  function payloadHasProgress(payload) { return Boolean(payload?.guideSlug && Number.isFinite(Number(payload.guideStep)) && Number.isFinite(Number(payload.guideStepCount))); }
  async function loadGuideState(payload, messages, sequence, fetchImpl) {
    if (!payload?.guideSlug) { if (sequence === requestSequence) clearGuide(); return; }
    if (payloadHasProgress(payload)) { if (sequence === requestSequence) renderGuide(payload); return; }
    try {
      const response = await fetchImpl(STATE_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guideSlug: payload.guideSlug, messages }) }); const state = await response.json().catch(() => ({})); if (sequence !== requestSequence) return;
      if (!response.ok || !state.guideSlug) { payload.guideTitle ? renderGuide({ guideSlug: payload.guideSlug, guideTitle: payload.guideTitle, guideStep: 1, guideStepCount: 1 }) : clearGuide(); return; } renderGuide(state);
    } catch { if (sequence === requestSequence && payload.guideTitle) renderGuide({ guideSlug: payload.guideSlug, guideTitle: payload.guideTitle, guideStep: 1, guideStepCount: 1 }); }
  }
  function installResponseObserver() {
    if (window.__DOKOHILF_GUIDE_PROGRESS_PATCH__) return; const previousFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => { const response = await previousFetch(input, init); if (!isAiRequest(input)) return response; const sequence = ++requestSequence; const list = parseMessages(init.body); response.clone().json().then(payload => loadGuideState(payload, list, sequence, previousFetch)).catch(() => { if (sequence === requestSequence) clearGuide(); }); return response; };
    window.__DOKOHILF_GUIDE_PROGRESS_PATCH__ = true;
  }
  function goToMainMenu() { const api = window.DokoHilf; if (!api) return; api.resetConversation({ keepMode: false }); clearGuide(); }
  function handleGuideAction(action) { const api = window.DokoHilf; if (!api || !currentGuide) return; if (action === 'back') { if (currentGuide.guideStep > 1) api.sendMessage('zurück'); return; } if (action === 'restart') { api.sendMessage(currentGuide.guideTitle || currentGuide.guideSlug); return; } if (action === 'change') goToMainMenu(); }
  function installUiObservers() {
    ensureProgressBar(); const row = document.getElementById('commandRow'); const messageBox = document.getElementById('messages'); const observer = new MutationObserver(syncCommandRow); if (row) observer.observe(row, { attributes: true, attributeFilter: ['hidden'] }); if (messageBox) observer.observe(messageBox, { childList: true }); syncCommandRow();
    document.addEventListener('click', event => { const actionButton = event.target.closest('[data-guide-action]'); if (actionButton) { event.preventDefault(); handleGuideAction(actionButton.dataset.guideAction); return; } if (event.target.closest('#resetButton, #homeButton')) window.setTimeout(clearGuide, 0); });
  }
  installResponseObserver(); installUiObservers(); window.DokoHilfGuideProgress = { formatProgress, clearGuide, getCurrentGuide: () => currentGuide ? { ...currentGuide } : null };
})();
