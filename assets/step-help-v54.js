(() => {
  'use strict';

  if (window.__DOKOHILF_STEP_HELP_V54__) return;
  const REVISION = '20260823-step-help-v54-1';

  function installStyles() {
    if (document.getElementById('stepHelpV54Styles')) return;
    const style = document.createElement('style');
    style.id = 'stepHelpV54Styles';
    style.textContent = `
      .guide-progress-actions [data-v54-step-help]{border-color:rgba(11,107,82,.30);background:#eefaf6;color:#0a654e}
      .guide-progress-actions [data-v54-step-help]::before{content:'?';display:inline-grid;place-items:center;width:18px;height:18px;margin-right:6px;border-radius:999px;background:#0b7a5e;color:#fff;font-size:11px;font-weight:900;vertical-align:-1px}
      @media(max-width:700px){.guide-progress-actions[data-v54-help-ready="true"]{grid-template-columns:1fr 1fr}.guide-progress-actions [data-v54-step-help]{grid-column:1/-1}}
    `;
    document.head.append(style);
  }

  function ensureHelpButton() {
    const bar = document.getElementById('guideProgress');
    const actions = bar?.querySelector('.guide-progress-actions');
    if (!bar || !actions) return null;
    let button = actions.querySelector('[data-v54-step-help]');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.dataset.v54StepHelp = 'true';
      button.textContent = 'Hilfe zum Schritt';
      button.setAttribute('aria-label', 'Hilfe zum aktuellen Schritt anzeigen');
      actions.prepend(button);
    }
    actions.dataset.v54HelpReady = 'true';
    return button;
  }

  function sync() {
    const button = ensureHelpButton();
    if (!button) return;
    const guide = window.DokoHilfGuideProgress?.getCurrentGuide?.();
    button.disabled = !guide;
    button.hidden = !guide;
    button.title = guide
      ? `Bestätigte Hilfe zu Schritt ${guide.guideStep} von ${guide.guideStepCount}`
      : '';
  }

  function requestStepHelp() {
    const guide = window.DokoHilfGuideProgress?.getCurrentGuide?.();
    const api = window.DokoHilf;
    if (!guide || !api?.sendMessage) return false;
    // Der bestehende Chat-Router erhält den aktiven Guide + Schritt über guide-progress.
    // „ich finde das nicht“ aktiviert ausschließlich die bereits bestätigte stuck-Hilfe;
    // fehlt dort eine spezielle Hilfe, wird nur der bestätigte Schritt wiederholt.
    api.sendMessage('ich finde das nicht');
    return true;
  }

  document.addEventListener('click', event => {
    const button = event.target?.closest?.('[data-v54-step-help]');
    if (!button) return;
    event.preventDefault();
    requestStepHelp();
  });
  window.addEventListener('dokohilf:guide-state', sync);

  const observer = new MutationObserver(sync);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  installStyles();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync, { once: true });
  else sync();

  window.DokoHilfStepHelpV54 = { revision: REVISION, sync, requestStepHelp };
  window.__DOKOHILF_STEP_HELP_V54__ = true;
})();
