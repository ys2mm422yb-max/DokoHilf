(() => {
  'use strict';

  const BUILD_ID = document.querySelector('meta[name="dokohilf-build"]')?.content || 'unknown';
  const GUIDE_LIBRARY_REVISION = 'library1';
  let scheduled = false;
  let libraryOwnershipScheduled = false;
  let guideLibrarySnapshot = '';

  function guideLibraryAsset(name) {
    return `assets/${name}?v=${encodeURIComponent(BUILD_ID)}-${GUIDE_LIBRARY_REVISION}`;
  }

  function ensureGuideLibraryAssets() {
    if (!document.querySelector('link[data-dokohilf-guide-library-v29]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = guideLibraryAsset('guide-library-v29.css');
      link.dataset.dokohilfGuideLibraryV29 = 'true';
      document.head.append(link);
    }
    if (!document.querySelector('script[data-dokohilf-guide-library-v29]')) {
      const script = document.createElement('script');
      script.src = guideLibraryAsset('guide-library-v29.js');
      script.dataset.dokohilfGuideLibraryV29 = 'true';
      document.body.append(script);
    }
  }

  function ensureGuideLibraryOwnershipStyle() {
    if (document.getElementById('v29GuideLibraryOwnershipStyle')) return;
    const style = document.createElement('style');
    style.id = 'v29GuideLibraryOwnershipStyle';
    style.textContent = `
html[data-dokohilf-ui="v29"] .examples .v29-frequent-guide,
html[data-dokohilf-ui="v29"] .examples .v29-all-guides-trigger{padding:12px 13px!important}
html[data-dokohilf-ui="v29"] .examples .v29-frequent-guide:before,
html[data-dokohilf-ui="v29"] .examples .v29-frequent-guide:after,
html[data-dokohilf-ui="v29"] .examples .v29-all-guides-trigger:before,
html[data-dokohilf-ui="v29"] .examples .v29-all-guides-trigger:after{content:none!important;display:none!important}
@media(max-width:700px){
  html[data-dokohilf-ui="v29"] .examples .v29-frequent-guide{min-height:68px!important;padding:9px 11px!important;font-size:13px!important}
  html[data-dokohilf-ui="v29"] .examples .v29-all-guides-trigger{min-height:50px!important;padding:10px 12px!important;font-size:12.5px!important}
}
`;
    document.head.append(style);
  }

  function guideLibraryHomeValid(examples) {
    if (!examples) return false;
    const label = examples.querySelector(':scope > span')?.textContent?.trim();
    const legacy = [...examples.querySelectorAll('button[data-direct-guide]')];
    return examples.dataset.v29GuideLibrary === 'true'
      && label === 'Häufig genutzt'
      && examples.querySelectorAll('.v29-frequent-guide').length === 6
      && Boolean(examples.querySelector('.v29-all-guides-trigger'))
      && legacy.length === 7
      && legacy.every(button => button.hidden);
  }

  function syncGuideLibraryOwnership() {
    libraryOwnershipScheduled = false;
    const examples = document.querySelector('.examples');
    if (!examples) return;
    if (guideLibraryHomeValid(examples)) {
      guideLibrarySnapshot = examples.innerHTML;
      return;
    }
    if (!guideLibrarySnapshot) return;
    if (window.__DOKOHILF_GUIDE_LIBRARY_V29__ !== true && examples.dataset.v29GuideLibrary !== 'true') return;
    examples.dataset.v29GuideLibrary = 'true';
    examples.innerHTML = guideLibrarySnapshot;
  }

  function scheduleGuideLibraryOwnership() {
    if (libraryOwnershipScheduled) return;
    libraryOwnershipScheduled = true;
    requestAnimationFrame(syncGuideLibraryOwnership);
  }

  function ensureLegacyCloseContract(view) {
    for (const button of view.querySelectorAll('[data-v29-guide-back], [data-v29-guide-home]')) {
      if (!button.hasAttribute('data-direct-guide-close')) button.setAttribute('data-direct-guide-close', '');
    }
  }

  function stepParagraphs(view) {
    return [...view.querySelectorAll('.direct-guide-step')].map(step => step.querySelector('p'));
  }

  function polishPresence(view) {
    if (view.querySelector('.direct-guide-heading h1')?.textContent?.trim() !== 'An-/Abwesenheit') return false;
    const paragraphs = stepParagraphs(view);
    if (paragraphs.length < 10) return false;
    const copy = [
      'Bei „Von“ immer Datum und Uhrzeit eintragen.',
      'Bei „Bis“ nur dann Datum und Uhrzeit eintragen, wenn der Endzeitpunkt sicher feststeht.',
      'Wenn der Endzeitpunkt noch nicht sicher feststeht, „Bis“ einfach leer lassen. Bitte nicht schätzen.',
      'Nur die Angaben ergänzen, die du wirklich brauchst, zum Beispiel Ziel, Begleitung, Grund oder Bemerkung.',
      'Speichern und kurz prüfen, ob der Eintrag in der Übersicht erscheint.',
    ];
    copy.forEach((text, index) => {
      const paragraph = paragraphs[index + 5];
      if (paragraph && paragraph.textContent !== text) paragraph.textContent = text;
    });
    const warning = view.querySelector('.direct-guide-callout.warning p');
    const warningText = '„Von“ gehört immer dazu. „Bis“ lässt du leer, solange der genaue Endzeitpunkt noch nicht sicher feststeht.';
    if (warning && warning.textContent !== warningText) warning.textContent = warningText;
    view.dataset.v29NaturalPresence = 'true';
    return true;
  }

  function polishForm(view) {
    if (view.querySelector('.direct-guide-heading h1')?.textContent?.trim() !== 'Formular erstellen') return false;
    const list = view.querySelector('.direct-guide-steps');
    const steps = [...view.querySelectorAll('.direct-guide-step')];
    if (!list || steps.length < 7) return false;
    const lastParagraph = steps[6].querySelector('p');
    const naturalLast = 'Das geöffnete Formular wie gewohnt ausfüllen.';
    if (lastParagraph && lastParagraph.textContent !== naturalLast) lastParagraph.textContent = naturalLast;
    if (!view.querySelector('[data-v29-form-save-step]')) {
      const item = document.createElement('li');
      item.className = 'direct-guide-step';
      item.dataset.v29FormSaveStep = 'true';
      item.innerHTML = '<span class="direct-guide-number" aria-hidden="true">8</span><div><p>Wenn du das Formular fertig bearbeitet hast, speicherst du es oben links in der Leiste.</p></div>';
      list.append(item);
      const count = view.querySelector('.direct-guide-count');
      if (count) count.textContent = '8 Schritte';
    }
    view.dataset.v29FormSave = 'true';
    return true;
  }

  function polishMedication(view) {
    if (view.querySelector('.direct-guide-heading h1')?.textContent?.trim() !== 'Medikation ansehen') return false;
    const warning = view.querySelector('.direct-guide-callout.warning p');
    const natural = 'Hier geht es nur ums Ansehen. Nichts ändern, pausieren, fortsetzen, absetzen, korrigieren, ergänzen oder löschen.';
    if (warning && warning.textContent !== natural) warning.textContent = natural;
    view.dataset.v29NaturalMedication = 'true';
    return true;
  }

  function polishReport(view) {
    if (view.querySelector('.direct-guide-heading h1')?.textContent?.trim() !== 'Bericht anlegen') return false;
    const note = view.querySelector('.direct-guide-callout:not(.warning) p');
    const natural = 'Bei „Kontakt – alles außer Arzt“ ist das verknüpfte Protokoll ein Fallgespräch. Bei „Sturzereignis“ ist es das Sturzprotokoll.';
    if (note && note.textContent !== natural) note.textContent = natural;
    view.dataset.v29NaturalReport = 'true';
    return true;
  }

  function insertSpecialAfter(step, marker, title, text) {
    if (!step || step.nextElementSibling?.dataset?.[marker]) return;
    const item = document.createElement('li');
    item.className = 'v29-guide-special';
    item.dataset[marker] = 'true';
    item.innerHTML = `<div class="v29-guide-special-icon">!</div><div><strong>${title}</strong><p>${text}</p></div>`;
    step.after(item);
  }

  function polishVisit(view) {
    if (view.querySelector('.direct-guide-heading h1')?.textContent?.trim() !== 'Visite anlegen') return false;
    const steps = [...view.querySelectorAll('.direct-guide-step')];
    const paragraphs = steps.map(step => step.querySelector('p'));
    if (paragraphs.length < 14) return false;
    const doctor = 'Den beim Bewohner hinterlegten durchführenden Arzt auswählen.';
    const place = 'Den Ort auswählen: Einrichtung, beim Arzt, telefonisch oder per Mail.';
    if (paragraphs[7] && paragraphs[7].textContent !== doctor) paragraphs[7].textContent = doctor;
    if (paragraphs[11] && paragraphs[11].textContent !== place) paragraphs[11].textContent = place;
    insertSpecialAfter(
      steps[7],
      'v29VisitDoctorSpecial',
      'Sonderfall · Arzt nicht beim Bewohner hinterlegt?',
      'Nur dann rechts neben der Arztauswahl das kleine Filtersymbol aktivieren. Danach stehen alle im System hinterlegten Ärzte zur Auswahl. Im Normalfall bleibt das Filtersymbol aus.',
    );
    view.dataset.v29VisitDoctorFilter = 'special-case';
    view.dataset.v29VisitMailLocation = 'true';
    return true;
  }

  function polishVital(view) {
    if (view.querySelector('.direct-guide-heading h1')?.textContent?.trim() !== 'Einzelnen Vitalwert erfassen') return false;
    const steps = [...view.querySelectorAll('.direct-guide-step')];
    const paragraphs = steps.map(step => step.querySelector('p'));
    if (paragraphs.length < 9) return false;
    const selection = 'Im Pop-up den gewünschten Vitalwert auswählen, zum Beispiel Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz oder Atemalkohol.';
    const value = 'Den gemessenen Wert eintragen. Je nach ausgewähltem Vitalwert erscheinen die dazu passenden Eingabefelder.';
    if (paragraphs[4] && paragraphs[4].textContent !== selection) paragraphs[4].textContent = selection;
    if (paragraphs[6] && paragraphs[6].textContent !== value) paragraphs[6].textContent = value;
    insertSpecialAfter(
      steps[6],
      'v29VitalExamples',
      'Beispiele',
      'Blutdruck: Systole und Diastole. Außerdem können bei euch Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz und Atemalkohol erfasst werden. Zusätzliche Felder oder Einheiten so übernehmen, wie sie in der geöffneten Maske angezeigt werden.',
    );
    view.dataset.v29VitalExamples = 'true';
    return true;
  }

  function polishChatHead() {
    const copy = document.querySelector('.chat-head p');
    const natural = 'Beschreibe kurz dein Ziel. DokoHilf führt dich Schritt für Schritt.';
    if (copy && copy.textContent !== natural) copy.textContent = natural;
  }

  function sync() {
    scheduled = false;
    polishChatHead();
    const view = document.getElementById('directGuideView');
    if (!view || view.hidden) return;
    ensureLegacyCloseContract(view);
    polishPresence(view);
    polishForm(view);
    polishMedication(view);
    polishReport(view);
    polishVisit(view);
    polishVital(view);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  function initialize() {
    ensureGuideLibraryAssets();
    ensureGuideLibraryOwnershipStyle();
    schedule();
    scheduleGuideLibraryOwnership();
    new MutationObserver(() => {
      schedule();
      scheduleGuideLibraryOwnership();
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();

  window.DokoHilfGuideLibraryOwnershipV29 = {
    sync: syncGuideLibraryOwnership,
    getState: () => ({ hasSnapshot: Boolean(guideLibrarySnapshot), snapshotLength: guideLibrarySnapshot.length }),
  };
  window.__DOKOHILF_DIRECT_GUIDE_COPY_V29__ = true;
})();