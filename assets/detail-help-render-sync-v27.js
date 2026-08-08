(() => {
  'use strict';

  const LABELS = Object.freeze({
    'area-open': 'Doku-Erweitert offen',
    'other-page': 'Anderer Reiter / andere Seite',
    'entry-missing': 'Doku-Erweitert fehlt',
    lost: 'Ich weiß nicht, wo ich bin',
    'target-found': 'Vitalwerte sehe ich',
    'batch-seen': 'Nur Sammelerfassung sichtbar',
    'retry-entry': 'Einstieg noch einmal prüfen',
    'human-help': 'Kollegin / Kollegen fragen',
    renamed: 'Bei mir heißt es anders',
  });

  function currentGuideSlug() {
    return window.DokoHilfDetailHelpV27?.getState?.().guideSlug
      || window.DokoHilfGuideProgress?.getCurrentGuide?.()?.guideSlug
      || '';
  }

  function labelFor(value, guideSlug) {
    if (value === 'target-missing') {
      return String(guideSlug || '').startsWith('vitalwerte')
        ? 'Vitalwerte fehlt'
        : 'Der Menüpunkt fehlt';
    }
    return LABELS[value] || '';
  }

  function compactPanel(panel) {
    if (!panel || panel.hidden) return;
    const guideSlug = currentGuideSlug();
    for (const button of panel.querySelectorAll('[data-detail-help-value]')) {
      const value = String(button.dataset.detailHelpValue || '');
      const label = labelFor(value, guideSlug);
      const span = button.querySelector('span');
      if (label && span && span.textContent !== label) span.textContent = label;
      if (label && button.dataset.detailHelpLabel !== label) button.dataset.detailHelpLabel = label;
      const small = button.querySelector('small');
      if (small) small.remove();
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

  window.DokoHilfDetailHelpRenderSyncV27 = { sync, labelFor, currentGuideSlug };
  window.__DOKOHILF_DETAIL_HELP_RENDER_SYNC_V27__ = true;
})();
