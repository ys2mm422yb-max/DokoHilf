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
    const naturalLast = 'Das geöffnete Formular nach der bei euch gültigen fachlichen Vorgabe bearbeiten. Nicht bestätigte Formularfelder werden von DokoHilf nicht erfunden.';
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

  function sync() {
    scheduled = false;
    const view = document.getElementById('directGuideView');
    if (!view || view.hidden) return;
    polishPresence(view);
    polishForm(view);
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
