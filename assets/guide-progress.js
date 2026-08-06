(() => {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;

  function formatProgress(step, count) {
    const safeStep = Number.isFinite(Number(step)) ? Math.max(1, Number(step)) : 1;
    const safeCount = Number.isFinite(Number(count)) ? Math.max(safeStep, Number(count)) : safeStep;
    return `Schritt ${safeStep} von ${safeCount}`;
  }

  function addGuideStateToBody(body, guide) {
    if (typeof body !== 'string' || !body || !guide?.guideSlug) return body;
    try {
      const parsed = JSON.parse(body);
      return JSON.stringify({
        ...parsed,
        guideStep: guide.guideStep,
        guideStepCount: guide.guideStepCount,
        guideStateVersion: 2,
      });
    } catch {
      return body;
    }
  }

  root.DokoHilfGuideProgress = { formatProgress, addGuideStateToBody };
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let currentGuide = null;
  let requestSequence = 0;

  function isAiRequest(input) {
    const url = typeof input === 'string' ? input : input?.url;
    return typeof url === 'string'
      && url.includes('/functions/v1/dokohilf-ai')
      && !url.includes('dokohilf-guide-state');
  }

  function installStyles() {
    if (document.getElementById('guideProgressStyles')) return;
    const style = document.createElement('style');
    style.id = 'guideProgressStyles';
    style.textContent = `
      .guide-progress{position:sticky;top:78px;z-index:18;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;margin:4px 0 18px;padding:14px 15px;border:1px solid rgba(11,107,82,.16);border-radius:20px;background:rgba(255,255,255,.94);box-shadow:0 14px 38px rgba(8,67,50,.13);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
      .guide-progress[hidden]{display:none!important}
      .guide-progress-copy{min-width:0;display:grid;grid-template-columns:auto 1fr;column-gap:10px;row-gap:2px;align-items:center}
      .guide-progress-index{grid-row:1/3;width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(145deg,#159a79,#08664f);color:#fff;font-size:14px;font-weight:900;box-shadow:0 8px 20px rgba(6,77,59,.22)}
      .guide-progress-copy strong{overflow:hidden;color:#123c31;font-size:16px;line-height:1.22;text-overflow:ellipsis;white-space:nowrap}
      .guide-progress-copy small{color:#557269;font-size:12px;font-weight:750}
      .guide-progress-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}
      .guide-progress-actions button{min-height:40px;padding:0 12px;border:1px solid rgba(11,107,82,.18);border-radius:12px;background:#fff;color:#174f40;font-size:12px;font-weight:800}
      .guide-progress-actions button:active{transform:scale(.97)}
      .guide-progress-actions button:disabled{cursor:not-allowed;opacity:.42;transform:none}
      .app-shell[data-mode="voice"] .guide-progress{display:none!important}
      @media(max-width:700px){
        .guide-progress{top:68px;grid-template-columns:1fr;padding:12px;margin-left:-2px;margin-right:-2px}
        .guide-progress-actions{display:grid;grid-template-columns:1fr 1fr 1fr;justify-content:stretch}
        .guide-progress-actions button{padding:0 7px;font-size:11px}
      }
      @media(max-width:390px){.guide-progress-actions{grid-template-columns:1fr 1fr}.guide-progress-actions button:last-child{grid-column:1/-1}}
    `;
    document.head.append(style);
  }

  function ensureProgressBar() {
    let bar = document.getElementById('guideProgress');
    if (bar) return bar;
    installStyles();
    bar = document.createElement('section');
    bar.id = 'guideProgress';
    bar.className = 'guide-progress';
    bar.hidden = true;
    bar.setAttribute('aria-live', 'polite');
    bar.innerHTML = `
      <div class="guide-progress-copy">
        <span class="guide-progress-index" id="guideProgressIndex">1</span>
        <strong id="guideProgressTitle"></strong>
        <small id="guideProgressStep"></small>
      </div>
      <div class="guide-progress-actions">
        <button type="button" data-guide-action="back">Zurück</button>
        <button type="button" data-guide-action="restart">Neu starten</button>
        <button type="button" data-guide-action="change">Anderer Ablauf</button>
      </div>
    `;
    const conversation = document.querySelector('.conversation');
    if (conversation?.parentElement) conversation.parentElement.insertBefore(bar, conversation);
    return bar;
  }

  function syncCommandRow() {
    const row = document.getElementById('commandRow');
    if (row) row.hidden = !currentGuide;
  }

  function dispatchGuideChange() {
    window.dispatchEvent(new CustomEvent('dokohilf:guide-state', {
      detail: currentGuide ? { ...currentGuide } : null,
    }));
  }

  function clearGuide() {
    currentGuide = null;
    const bar = ensureProgressBar();
    bar.hidden = true;
    syncCommandRow();
    dispatchGuideChange();
  }

  function normalizeGuide(payload) {
    if (!payload?.guideSlug) return null;
    const step = Number(payload.guideStep);
    const count = Number(payload.guideStepCount);
    return {
      guideSlug: String(payload.guideSlug),
      guideTitle: String(payload.guideTitle || payload.guideSlug),
      guideStep: Number.isInteger(step) && step >= 1 ? step : 1,
      guideStepCount: Number.isInteger(count) && count >= 1 ? count : Math.max(1, step || 1),
    };
  }

  function renderGuide(guide) {
    currentGuide = guide;
    const bar = ensureProgressBar();
    const title = document.getElementById('guideProgressTitle');
    const step = document.getElementById('guideProgressStep');
    const index = document.getElementById('guideProgressIndex');
    const back = bar.querySelector('[data-guide-action="back"]');
    if (title) title.textContent = guide.guideTitle;
    if (step) step.textContent = formatProgress(guide.guideStep, guide.guideStepCount);
    if (index) index.textContent = String(guide.guideStep);
    if (back instanceof HTMLButtonElement) back.disabled = guide.guideStep <= 1;
    bar.hidden = false;
    syncCommandRow();
    dispatchGuideChange();
  }

  function installResponseObserver() {
    if (window.__DOKOHILF_GUIDE_PROGRESS_PATCH_V2__) return;
    const previousFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      if (!isAiRequest(input)) return previousFetch(input, init);
      const sequence = ++requestSequence;
      const body = addGuideStateToBody(init.body, currentGuide);
      const response = await previousFetch(input, { ...init, body });
      response.clone().json()
        .then(payload => {
          if (sequence !== requestSequence) return;
          const guide = normalizeGuide(payload);
          if (guide) renderGuide(guide);
          else clearGuide();
        })
        .catch(() => {
          if (sequence === requestSequence) clearGuide();
        });
      return response;
    };
    window.__DOKOHILF_GUIDE_PROGRESS_PATCH__ = true;
    window.__DOKOHILF_GUIDE_PROGRESS_PATCH_V2__ = true;
  }

  function goToMainMenu() {
    const api = window.DokoHilf;
    if (!api) return;
    api.resetConversation({ keepMode: false });
    clearGuide();
  }

  function handleGuideAction(action) {
    const api = window.DokoHilf;
    if (!api || !currentGuide) return;
    if (action === 'back') {
      if (currentGuide.guideStep > 1) api.sendMessage('zurück');
      return;
    }
    if (action === 'restart') {
      currentGuide = { ...currentGuide, guideStep: 1 };
      api.sendMessage(currentGuide.guideTitle || currentGuide.guideSlug);
      return;
    }
    if (action === 'change') goToMainMenu();
  }

  function installUiObservers() {
    ensureProgressBar();
    document.addEventListener('click', event => {
      const actionButton = event.target.closest('[data-guide-action]');
      if (actionButton) {
        event.preventDefault();
        handleGuideAction(actionButton.dataset.guideAction);
        return;
      }
      if (event.target.closest('#resetButton, #homeButton, [data-select-mode]')) {
        window.setTimeout(clearGuide, 0);
      }
    });
  }

  installResponseObserver();
  installUiObservers();

  window.DokoHilfGuideProgress = {
    formatProgress,
    addGuideStateToBody,
    clearGuide,
    getCurrentGuide: () => currentGuide ? { ...currentGuide } : null,
  };
})();
