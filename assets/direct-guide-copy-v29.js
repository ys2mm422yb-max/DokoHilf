(() => {
  'use strict';

  let scheduled = false;

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

  function polishVisit(view) {
    if (view.querySelector('.direct-guide-heading h1')?.textContent?.trim() !== 'Visite anlegen') return false;
    const paragraphs = stepParagraphs(view);
    if (paragraphs.length < 14) return false;
    const doctor = 'Den durchführenden Arzt auswählen. Nur wenn er beim Bewohner fehlt, rechts daneben das kleine Filtersymbol aktivieren und aus allen systemweit hinterlegten Ärzten wählen.';
    const place = 'Den Ort auswählen: Einrichtung, beim Arzt, telefonisch oder per Mail.';
    if (paragraphs[7] && paragraphs[7].textContent !== doctor) paragraphs[7].textContent = doctor;
    if (paragraphs[11] && paragraphs[11].textContent !== place) paragraphs[11].textContent = place;
    view.dataset.v29VisitDoctorFilter = 'true';
    view.dataset.v29VisitMailLocation = 'true';
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
    polishPresence(view);
    polishForm(view);
    polishMedication(view);
    polishReport(view);
    polishVisit(view);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  function initialize() {
    schedule();
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();

  window.__DOKOHILF_DIRECT_GUIDE_COPY_V29__ = true;
})();
