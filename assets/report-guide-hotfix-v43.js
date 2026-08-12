(() => {
  'use strict';

  const WRONG = 'Danach öffnet sich die Eingabemaske für den Bericht.';
  const CORRECT = 'Das große Textfeld für den Bericht ist in dieser Maske bereits unten sichtbar. Es öffnet sich durch die Kategorieauswahl nicht erst neu.';
  const OLD_RANGE = 'Schritte 6–9';
  const NEW_RANGE = 'Schritte 5–8';
  const OLD_TARGET = 'Schritt 10';
  const NEW_TARGET = 'Schritt 9';

  function patchReportGuide() {
    const view = document.getElementById('directGuideView');
    if (!view || view.hidden) return;
    const title = view.querySelector('.direct-guide-heading h1')?.textContent?.trim();
    if (title !== 'Bericht anlegen') return;

    for (const paragraph of view.querySelectorAll('.direct-guide-step p')) {
      if (paragraph.textContent?.trim() !== WRONG) continue;
      paragraph.textContent = CORRECT;
      paragraph.dataset.dokohilfReportMaskV43 = 'corrected';
    }

    const condition = view.querySelector('.report-protocol-condition');
    if (condition) {
      const current = condition.innerHTML;
      const corrected = current.replaceAll(OLD_RANGE, NEW_RANGE).replaceAll(OLD_TARGET, NEW_TARGET);
      if (corrected !== current) condition.innerHTML = corrected;
      condition.dataset.dokohilfReportRangeV44 = '5-8-to-9';
    }
  }

  const run = () => window.requestAnimationFrame(patchReportGuide);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();

  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true });

  window.DokoHilfReportGuideHotfixV43 = Object.freeze({
    revision: 'report-textfield-visible-v44-2',
    correctText: CORRECT,
    conditionalRange: '5-8',
    continuationStep: 9,
  });
})();
