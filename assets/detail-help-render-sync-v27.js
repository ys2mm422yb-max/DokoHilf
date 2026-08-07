(() => {
  'use strict';

  const LABELS = Object.freeze({
    'area-open': 'Doku-Erweitert offen',
    'other-page': 'Anderer Reiter / andere Seite',
    'entry-missing': 'Doku-Erweitert fehlt',
    lost: 'Ich weiß nicht, wo ich bin',
    'target-found': 'Vitalwerte sehe ich',
    'batch-seen': 'Nur Sammelerfassung sichtbar',
    'target-missing': 'Vitalwerte fehlt',
    'retry-entry': 'Einstieg noch einmal prüfen',
    'human-help': 'Kollegin / Kollegen fragen',
    renamed: 'Bei mir heißt es anders',
  });

  function compactPanel(panel) {
    if (!panel || panel.hidden) return;
    for (const button of panel.querySelectorAll('[data-detail-help-value]')) {
      const value = String(button.dataset.detailHelpValue || '');
      const label = LABELS[value];
      const span = button.querySelector('span');
      if (label && span) {
        span.textContent = label;
        button.dataset.detailHelpLabel = label;
      }
      button.querySelector('small')?.remove();
    }
  }

  function sync() {
    compactPanel(document.getElementById('detailHelpOptionsV27'));
    compactPanel(document.getElementById('voiceDetailHelpOptionsV27'));
  }

  function install() {
    sync();
    const target = document.getElementById('appShell') || document.body;
    if (!target || window.__DOKOHILF_DETAIL_HELP_RENDER_SYNC_OBSERVER__) return;
    const observer = new MutationObserver(sync);
    observer.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'data-detail-help'] });
    window.__DOKOHILF_DETAIL_HELP_RENDER_SYNC_OBSERVER__ = observer;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();

  window.DokoHilfDetailHelpRenderSyncV27 = { sync };
  window.__DOKOHILF_DETAIL_HELP_RENDER_SYNC_V27__ = true;
})();
