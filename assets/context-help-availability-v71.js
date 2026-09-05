(() => {
  'use strict';

  if (window.__DOKOHILF_CONTEXT_HELP_AVAILABILITY_V71__) return;
  window.__DOKOHILF_CONTEXT_HELP_AVAILABILITY_V71__ = true;

  const REVISION = '20260905-context-help-availability-v71-1';
  const HELP_STEPS = Object.freeze({
    'analyse-finden': [1],
    anwesenheit: [2],
    'anwesenheiten-finden': [1],
    'bedarfsmedikation-finden': [1, 2],
    'bedarfsmedikation-gabe': [1, 2, 3, 4, 7, 9, 10],
    'bedarfsmedikation-wirksamkeitskontrolle': [1, 2, 3],
    'bedarfsmedikation-wirksamkeitskontrolle-finden': [3],
    'bericht-durchstreichen': [1],
    'bericht-folgebericht': [1],
    'bericht-neu': [1, 2, 4],
    'berichte-finden': [1],
    dateiablage: [1, 2, 3, 4, 5],
    'doku-erweitert-finden': [1],
    'doku-finden': [1],
    'durchfuehrung-storno': [1, 2],
    'durchfuehrungsnachweis-finden': [2],
    'durchfuehrungsnachweis-oeffnen': [1, 2],
    'formulare-anlegen': [2],
    'formulare-finden': [1],
    'massnahmen-ohne-zeitangabe': [1, 2, 3],
    'massnahmen-ohne-zeitangabe-finden': [3],
    'medikation-ansehen': [2],
    'medikation-finden': [1],
    notfallblatt: [2, 3],
    'notfallblatt-finden': [1],
    'planung-finden': [1],
    stammdaten: [1, 2, 3],
    'stammdaten-finden': [1],
    'uebergabe-finden': [1],
    uebergabeformular: [1, 2, 4, 5],
    'visite-anlegen': [1, 3, 6],
    'visite-status-durchgefuehrt': [1],
    'visiten-finden': [1],
    'visiten-oeffnen': [1, 2],
    vitalwerte: [1, 2],
    'vitalwerte-einzelwert': [2],
    'vitalwerte-erfassen': [1, 2],
    'vitalwerte-finden': [1],
    'vitalwerte-sammelerfassung': [2],
    'vitalwerte-sammelerfassung-fortsetzen': [1],
  });

  function currentGuide() {
    try { return window.DokoHilfGuideProgress?.getCurrentGuide?.() || null; }
    catch { return null; }
  }

  function hasConfirmedHelp(guide = currentGuide()) {
    const slug = String(guide?.guideSlug || '').trim();
    const step = Number(guide?.guideStep || 0);
    return Boolean(slug && Number.isInteger(step) && HELP_STEPS[slug]?.includes(step));
  }

  function helpButton() {
    return document.querySelector('#commandRow [data-command="ich finde das nicht"]');
  }

  function installStyles() {
    if (document.getElementById('contextHelpAvailabilityStylesV71')) return;
    const style = document.createElement('style');
    style.id = 'contextHelpAvailabilityStylesV71';
    style.textContent = `
      #commandRow [data-command="ich finde das nicht"][data-v71-context-help="true"]{
        --v71-help-font-size:12px;
        font-size:0!important;
      }
      #commandRow [data-command="ich finde das nicht"][data-v71-context-help="true"]::after{
        content:'Ich finde es nicht';
        font-size:var(--v71-help-font-size)!important;
        font-weight:inherit;
        line-height:1.15;
      }
      #commandRow [data-command="ich finde das nicht"][data-v71-context-help="true"]:disabled{
        cursor:not-allowed!important;
        opacity:.42!important;
        transform:none!important;
      }
      @media(max-width:700px){
        #commandRow [data-command="ich finde das nicht"][data-v71-context-help="true"]{--v71-help-font-size:11.5px}
      }
    `;
    document.head.append(style);
  }

  function sync() {
    const button = helpButton();
    if (!button) return;
    const available = hasConfirmedHelp();
    button.dataset.v71ContextHelp = 'true';
    button.disabled = !available;
    button.setAttribute('aria-disabled', available ? 'false' : 'true');
    button.setAttribute(
      'aria-label',
      available
        ? 'Ich finde es nicht. Zusätzliche Erklärung zu diesem Schritt anzeigen.'
        : 'Ich finde es nicht. Für diesen Schritt ist keine zusätzliche bestätigte Erklärung verfügbar.',
    );
    button.title = available
      ? 'Zusätzliche bestätigte Erklärung zu diesem Schritt anzeigen'
      : 'Für diesen Schritt ist keine zusätzliche bestätigte Erklärung verfügbar.';
  }

  function init() {
    installStyles();
    sync();
    window.addEventListener('dokohilf:guide-state', sync);
    window.addEventListener('pageshow', sync);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.DokoHilfContextHelpAvailabilityV71 = {
    revision: REVISION,
    hasConfirmedHelp,
    sync,
    helpSteps: () => Object.fromEntries(Object.entries(HELP_STEPS).map(([slug, steps]) => [slug, [...steps]])),
  };
})();
