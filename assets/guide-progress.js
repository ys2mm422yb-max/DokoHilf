(() => {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const STATE_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-guide-state';

  function formatProgress(step, count) {
    const safeStep = Number.isFinite(Number(step)) ? Math.max(1, Number(step)) : 1;
    const safeCount = Number.isFinite(Number(count)) ? Math.max(safeStep, Number(count)) : safeStep;
    return `Schritt ${safeStep} von ${safeCount}`;
  }

  root.DokoHilfGuideProgress = { formatProgress };
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let currentGuide = null;
  let requestSequence = 0;

  function isAiRequest(input) {
    const url = typeof input === 'string' ? input : input?.url;
    return typeof url === 'string' && url.includes('/functions/v1/dokohilf-ai');
  }

  function parseMessages(body) {
    if (typeof body !== 'string' || !body) return [];
    try {
      const parsed = JSON.parse(body);
      return Array.isArray(parsed.messages) ? parsed.messages : [];
    } catch {
      return [];
    }
  }

  function installStyles() {
    if (document.getElementById('guideProgressStyles')) return;
    const style = document.createElement('style');
    style.id = 'guideProgressStyles';
    style.textContent = `
      .guide-progress{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;margin:12px 0 14px;padding:13px 14px;border:1px solid rgba(11,107,82,.18);border-radius:18px;background:linear-gradient(135deg,rgba(230,246,240,.96),rgba(255,255,255,.98));box-shadow:0 10px 26px rgba(8,67,50,.09)}
      .guide-progress[hidden]{display:none!important}
      .guide-progress-copy{min-width:0;display:grid;gap:2px}
      .guide-progress-copy span{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#5d7e73}
      .guide-progress-copy strong{overflow:hidden;color:#0b5d49;font-size:16px;line-height:1.25;text-overflow:ellipsis;white-space:nowrap}
      .guide-progress-copy small{color:#42665b;font-size:13px;font-weight:700}
      .guide-progress-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}
      .guide-progress-actions button{min-height:38px;padding:0 11px;border:1px solid rgba(11,107,82,.2);border-radius:11px;background:#fff;color:#174f40;font-size:12px;font-weight:750}
      .guide-progress-actions button:active{transform:scale(.97)}
      @media(max-width:700px){.guide-progress{grid-template-columns:1fr}.guide-progress-actions{justify-content:stretch}.guide-progress-actions button{flex:1 1 30%;padding:0 8px;font-size:11px}}
      @media(max-width:390px){.guide-progress-actions{display:grid;grid-template-columns:1fr 1fr}.guide-progress-actions button:last-child{grid-column:1/-1}}
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
        <span>Aktiver Ablauf</span>
        <strong id="guideProgressTitle"></strong>
        <small id="guideProgressStep"></small>
      </div>
      <div class="guide-progress-actions">
        <button type="button" data-guide-action="back">Schritt zurück</button>
        <button type="button" data-guide-action="restart">Ablauf neu starten</button>
        <button type="button" data-guide-action="change">Anderen Ablauf wählen</button>
      </div>
    `;

    const conversation = document.querySelector('.conversation');
    if (conversation?.parentElement) conversation.parentElement.insertBefore(bar, conversation);
    return bar;
  }

  function syncCommandRow() {
    const row = document.getElementById('commandRow');
    if (!row) return;
    row.hidden = !currentGuide;
  }

  function clearGuide() {
    currentGuide = null;
    const bar = ensureProgressBar();
    bar.hidden = true;
    syncCommandRow();
  }

  function renderGuide(guide) {
    currentGuide = guide;
    const bar = ensureProgressBar();
    const title = document.getElementById('guideProgressTitle');
    const step = document.getElementById('guideProgressStep');
    if (title) title.textContent = guide.guideTitle || guide.guideSlug;
    if (step) step.textContent = formatProgress(guide.guideStep, guide.guideStepCount);
    bar.hidden = false;
    syncCommandRow();
  }

  async function loadGuideState(payload, messages, sequence, fetchImpl) {
    if (!payload?.guideSlug) {
      if (sequence === requestSequence) clearGuide();
      return;
    }

    try {
      const response = await fetchImpl(STATE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideSlug: payload.guideSlug, messages }),
      });
      const state = await response.json().catch(() => ({}));
      if (sequence !== requestSequence) return;
      if (!response.ok || !state.guideSlug) {
        if (payload.guideTitle) {
          renderGuide({
            guideSlug: payload.guideSlug,
            guideTitle: payload.guideTitle,
            guideStep: 1,
            guideStepCount: 1,
          });
        } else {
          clearGuide();
        }
        return;
      }
      renderGuide(state);
    } catch {
      if (sequence === requestSequence && payload.guideTitle) {
        renderGuide({
          guideSlug: payload.guideSlug,
          guideTitle: payload.guideTitle,
          guideStep: 1,
          guideStepCount: 1,
        });
      }
    }
  }

  function installResponseObserver() {
    if (window.__DOKOHILF_GUIDE_PROGRESS_PATCH__) return;
    const previousFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      const response = await previousFetch(input, init);
      if (!isAiRequest(input)) return response;

      const sequence = ++requestSequence;
      const messages = parseMessages(init.body);
      response.clone().json()
        .then(payload => loadGuideState(payload, messages, sequence, previousFetch))
        .catch(() => {
          if (sequence === requestSequence) clearGuide();
        });
      return response;
    };
    window.__DOKOHILF_GUIDE_PROGRESS_PATCH__ = true;
  }

  function resetWithoutGreeting({ keepMode }) {
    const api = window.DokoHilf;
    if (!api) return;
    api.resetConversation({ keepMode });
    const messages = document.getElementById('messages');
    if (messages) messages.innerHTML = '';
    clearGuide();
  }

  function handleGuideAction(action) {
    const api = window.DokoHilf;
    if (!api || !currentGuide) return;

    if (action === 'back') {
      api.sendMessage('zurück');
      return;
    }
    if (action === 'restart') {
      const title = currentGuide.guideTitle;
      resetWithoutGreeting({ keepMode: true });
      window.setTimeout(() => api.sendMessage(title), 80);
      return;
    }
    if (action === 'change') {
      resetWithoutGreeting({ keepMode: false });
    }
  }

  function installUiObservers() {
    ensureProgressBar();
    const row = document.getElementById('commandRow');
    const messages = document.getElementById('messages');
    const observer = new MutationObserver(syncCommandRow);
    if (row) observer.observe(row, { attributes: true, attributeFilter: ['hidden'] });
    if (messages) observer.observe(messages, { childList: true });
    syncCommandRow();

    document.addEventListener('click', event => {
      const actionButton = event.target.closest('[data-guide-action]');
      if (actionButton) {
        event.preventDefault();
        handleGuideAction(actionButton.dataset.guideAction);
        return;
      }
      if (event.target.closest('#resetButton, #homeButton')) {
        window.setTimeout(clearGuide, 0);
      }
    });
  }

  installResponseObserver();
  installUiObservers();

  window.DokoHilfGuideProgress = {
    formatProgress,
    clearGuide,
    getCurrentGuide: () => currentGuide ? { ...currentGuide } : null,
  };
})();
