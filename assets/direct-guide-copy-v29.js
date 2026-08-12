(() => {
  'use strict';

  let scheduled = false;

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
}`;
    document.head.append(style);
  }

  function ensureLegacyCloseContract(view) {
    for (const button of view.querySelectorAll('[data-v29-guide-back], [data-v29-guide-home]')) {
      if (!button.hasAttribute('data-direct-guide-close')) button.setAttribute('data-direct-guide-close', '');
    }
  }

  function stepParagraphs(view) {
    return [...view.querySelectorAll('.direct-guide-step')].map(step => step.querySelector('p'));
  }

  function normalizeCopy(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function renumberSteps(view) {
    const steps = [...view.querySelectorAll('.direct-guide-step')];
    steps.forEach((step, index) => {
      const number = step.querySelector('.direct-guide-number');
      if (number) number.textContent = String(index + 1);
    });
    const count = view.querySelector('.direct-guide-count');
    if (count) count.textContent = `${steps.length} Schritte`;
  }

  function dedupeSpecialCallouts(view) {
    const seen = new Set();
    let removed = 0;
    for (const item of [...view.querySelectorAll('.v29-guide-special')]) {
      const title = normalizeCopy(item.querySelector('strong')?.textContent);
      const text = normalizeCopy(item.querySelector('p')?.textContent);
      const key = `${title}\n${text}`;
      if (!title && !text) continue;
      if (seen.has(key)) {
        item.remove();
        removed += 1;
      } else {
        seen.add(key);
      }
    }
    if (removed) view.dataset.v44DeduplicatedSpecials = String(removed);
    return removed;
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
    const title = view.querySelector('.direct-guide-heading h1')?.textContent?.trim();
    if (title !== 'Formular anlegen' && title !== 'Formular erstellen') return false;
    const list = view.querySelector('.direct-guide-steps');
    const steps = [...view.querySelectorAll('.direct-guide-step')];
    if (!list || steps.length < 7) return false;
    const lastParagraph = steps[6].querySelector('p');
    const naturalLast = 'Das geöffnete Formular wie gewohnt ausfüllen.';
    if (lastParagraph && lastParagraph.textContent !== naturalLast) lastParagraph.textContent = naturalLast;
    if (!view.querySelector('[data-v29-form-save-step]') && steps.length === 7) {
      const item = document.createElement('li');
      item.className = 'direct-guide-step';
      item.dataset.v29FormSaveStep = 'true';
      item.innerHTML = '<span class="direct-guide-number" aria-hidden="true">8</span><div><p>Wenn du mit dem Formular fertig bist, oben links in der Leiste speichern.</p></div>';
      list.append(item);
      renumberSteps(view);
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

    const redundantTexts = new Set([
      normalizeCopy('Danach öffnet sich die Eingabemaske für den Bericht.'),
      normalizeCopy('Das große Textfeld für den Bericht ist in dieser Maske bereits unten sichtbar. Es öffnet sich durch die Kategorieauswahl nicht erst neu.'),
    ]);
    for (const step of [...view.querySelectorAll('.direct-guide-step')]) {
      const paragraph = step.querySelector('p');
      if (redundantTexts.has(normalizeCopy(paragraph?.textContent))) step.remove();
    }

    const paragraphs = stepParagraphs(view);
    const category = paragraphs.find(paragraph => /berichtskategorie/i.test(paragraph?.textContent || ''));
    const categoryText = 'In der geöffneten Auswahl die passende Berichtskategorie wählen. Das große Textfeld für den Bericht ist unten in derselben Maske bereits sichtbar.';
    if (category && category.textContent !== categoryText) category.textContent = categoryText;

    const reportText = paragraphs.find(paragraph => normalizeCopy(paragraph?.textContent) === normalizeCopy('Berichtstext eintragen.'));
    const entryText = 'Wenn der Bericht für die nächste Schicht wichtig ist, „Wichtig für Schichtübergabe“ anhaken. In das große Textfeld darunter den Bericht eintragen.';
    if (reportText && reportText.textContent !== entryText) reportText.textContent = entryText;

    const note = view.querySelector('.direct-guide-callout:not(.warning) p');
    const natural = 'Nur bei „Kontakt – alles außer Arzt“ und „Sturzereignis“ gibt es den zusätzlichen Protokoll-Schritt. Bei allen anderen Kategorien kannst du direkt mit dem Bericht weitermachen.';
    if (note && note.textContent !== natural) note.textContent = natural;
    renumberSteps(view);
    view.dataset.v29NaturalReport = 'true';
    view.dataset.v44ReportMaskConsolidated = 'true';
    return true;
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
    view.dataset.v29VisitDoctorFilter = 'canonical-special';
    view.dataset.v29VisitMailLocation = 'true';
    return true;
  }

  function polishVital(view) {
    if (view.querySelector('.direct-guide-heading h1')?.textContent?.trim() !== 'Einzelnen Vitalwert erfassen') return false;
    const steps = [...view.querySelectorAll('.direct-guide-step')];
    const paragraphs = steps.map(step => step.querySelector('p'));
    if (paragraphs.length < 9) return false;
    const selection = 'Im Pop-up-Fenster den gewünschten Vitalwert auswählen, zum Beispiel Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz oder Atemalkohol.';
    const value = 'Den gemessenen Wert eintragen. Je nach ausgewähltem Vitalwert erscheinen die passenden Eingabefelder.';
    if (paragraphs[4] && paragraphs[4].textContent !== selection) paragraphs[4].textContent = selection;
    if (paragraphs[6] && paragraphs[6].textContent !== value) paragraphs[6].textContent = value;
    view.dataset.v29VitalExamples = 'canonical-special';
    return true;
  }

  function sync() {
    scheduled = false;
    const view = document.getElementById('directGuideView');
    if (!view || view.hidden) return;
    ensureLegacyCloseContract(view);
    polishPresence(view);
    polishForm(view);
    polishMedication(view);
    polishReport(view);
    polishVisit(view);
    polishVital(view);
    dedupeSpecialCallouts(view);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  function initialize() {
    ensureGuideLibraryOwnershipStyle();
    schedule();
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();

  window.DokoHilfDirectGuideAuditV44 = Object.freeze({ normalizeCopy, dedupeSpecialCallouts, renumberSteps });
  window.__DOKOHILF_DIRECT_GUIDE_COPY_V29__ = true;
})();