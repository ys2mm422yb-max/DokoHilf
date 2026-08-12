(() => {
  'use strict';

  const WRONG = 'Danach öffnet sich die Eingabemaske für den Bericht.';
  const CORRECT = 'Das große Textfeld für den Bericht ist in dieser Maske bereits unten sichtbar. Es öffnet sich durch die Kategorieauswahl nicht erst neu.';

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
  }

  const run = () => window.requestAnimationFrame(patchReportGuide);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();

  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true });

  window.DokoHilfReportGuideHotfixV43 = Object.freeze({
    revision: 'report-textfield-visible-v43-1',
    correctText: CORRECT,
  });
})();
