(() => {
  'use strict';

  const GUIDES = Object.freeze({
    bericht: {
      title: 'Bericht anlegen',
      subtitle: 'Neuen Berichtseintrag erfassen',
      steps: [
        'Richtigen Bewohner öffnen.',
        'Bereich „Berichte“ öffnen.',
        'Oben links auf das grüne Plus klicken.',
        'In der geöffneten Auswahl die Berichtskategorie wählen.',
        'Danach öffnet sich die Eingabemaske für den Bericht.',
        'Nur bei „Kontakt – alles außer Arzt“ und „Sturzereignis“ prüfen, ob ein zusätzliches Protokoll automatisch verknüpft ist.',
        'Wird das Protokoll benötigt, bleibt es verknüpft.',
        'Wird es nicht benötigt, den angezeigten Protokollnamen anklicken und anschließend oben rechts auf das kleine rote X klicken.',
        'Das rote X entfernt nur die Protokollverknüpfung, nicht den Bericht.',
        'Datum und Uhrzeit prüfen.',
        'Berichtstext eintragen.',
        'Mit „OK“ bestätigen und den neuen Eintrag kontrollieren.',
      ],
      note: 'Bei „Kontakt – alles außer Arzt“ ist das automatisch verknüpfte Protokoll ein Fallgespräch. Beim Sturzereignis bleibt die Bezeichnung des automatisch zugeordneten Protokolls bewusst neutral.',
    },
    visite: {
      title: 'Visite anlegen',
      subtitle: 'Visite beziehungsweise Sprechstunde dokumentieren',
      steps: [
        '„Doku-Erweitert“ öffnen.',
        '„Visiten“ wählen.',
        'Oben links auf das grüne Plus beziehungsweise „Neu“ klicken.',
        'Im Fenster „Klienten auswählen“ den Bewohner auswählen.',
        'Danach öffnet sich „Neue Visite“.',
        'Oben auf „Durchführen“ klicken. Dadurch wird die Visite als durchgeführt erfasst.',
        'Datum, Beginn und gegebenenfalls Ende prüfen.',
        'Den durchführenden Arzt auswählen.',
        '„Mitarbeiter“ bleibt auf „ohne Mitarbeiter“ beziehungsweise leer.',
        'Bei „Anforderung“ eintragen, wer die Sprechstunde angefordert hat.',
        'Den Grund eintragen, zum Beispiel „Kontrollbesuch“.',
        'Den Ort auswählen: Einrichtung, beim Arzt oder telefonisch.',
        'Rechts in „Bemerkung“ Inhalt und Ergebnis der Visite eintragen.',
        'Speichern und prüfen, dass die Visite unter den durchgeführten Visiten erscheint.',
      ],
      warning: 'Visiten werden hier immer als „durchgeführt“ dokumentiert – niemals als „abgeschlossen“.',
    },
    vitalEinzel: {
      title: 'Einzelnen Vitalwert erfassen',
      subtitle: 'Zum Beispiel Blutdruck, Puls oder Temperatur',
      steps: [
        'Bewohner auswählen.',
        '„Doku-Erweitert“ öffnen.',
        '„Vitalwerte“ wählen.',
        'Oben links auf das grüne Plus beziehungsweise „Neu“ klicken.',
        'Im Pop-up den gewünschten Vitalwert auswählen.',
        'Datum und Uhrzeit prüfen.',
        'Den gemessenen Wert eintragen; bei Blutdruck zum Beispiel Systole und Diastole.',
        'Nur bei Bedarf Messart, Qualität oder Bemerkung ergänzen.',
        'Mit „OK“ bestätigen und den neuen Wert in der Übersicht kontrollieren.',
      ],
    },
    vitalSammel: {
      title: 'Mehrere Vitalwerte erfassen',
      subtitle: 'Vitalwerte Sammelerf.',
      steps: [
        'Bewohner auswählen.',
        '„Doku-Erweitert“ öffnen.',
        'Direkt „Vitalwerte Sammelerf.“ wählen.',
        'Die benötigten Vitalwerte auswählen.',
        'Datum, Uhrzeit und Werte eintragen.',
        'Speichern und die Werte in der Übersicht kontrollieren.',
      ],
      note: '„Vitalwerte“ und „Vitalwerte Sammelerf.“ sind zwei getrennte Menüeinträge.',
    },
    anwesenheit: {
      title: 'An-/Abwesenheit',
      subtitle: 'An- oder Abwesenheit erfassen',
      steps: [
        'Bewohner auswählen.',
        '„Doku-Erweitert“ öffnen.',
        '„An-/Abwesenheiten“ wählen.',
        'Oben links „Neu“ wählen.',
        'Den passenden Status auswählen.',
        '„Von“ immer mit Datum und Uhrzeit eintragen.',
        '„Bis“ nur eintragen, wenn der genaue Endzeitpunkt zu 100 Prozent sicher bekannt ist.',
        'Ist das Ende unsicher, „Bis“ leer lassen und niemals schätzen.',
        'Nur benötigte weitere Angaben wie Ziel, Begleitung oder Grund/Bemerkung ergänzen.',
        'Speichern und den neuen Eintrag kontrollieren.',
      ],
      warning: '„Von“ wird immer eingetragen. „Bis“ nur bei sicher bekanntem Endzeitpunkt – niemals schätzen.',
    },
    medikation: {
      title: 'Medikation ansehen',
      subtitle: 'Ausschließlich ansehen',
      steps: [
        'Bewohner auswählen.',
        '„Doku-Erweitert“ öffnen.',
        '„Medikation“ wählen.',
        'Die Medikamentenübersicht ausschließlich ansehen.',
      ],
      warning: 'DokoHilf leitet hier zu keiner Änderung an: nichts ändern, pausieren, fortsetzen, absetzen, korrigieren, ergänzen oder löschen.',
    },
    formular: {
      title: 'Formular erstellen',
      subtitle: 'Formular anlegen',
      steps: [
        'Bewohner auswählen.',
        '„Doku-Erweitert“ öffnen.',
        '„Formulare“ wählen.',
        'Oben links „Neu“ klicken.',
        'Im Fenster „Formular anlegen“ das benötigte Formular auswählen, zum Beispiel Anfallsprotokoll, Fallgespräch, Gesprächsprotokoll oder Sturzprotokoll.',
        'Mit „OK“ bestätigen.',
        'Das geöffnete Formular nach der bei euch gültigen fachlichen Vorgabe bearbeiten. Nicht bestätigte Formularfelder werden von DokoHilf nicht erfunden.',
      ],
    },
    uebergabe: {
      title: 'Übergabe anzeigen',
      subtitle: 'Relevante Einträge für die Übergabe öffnen',
      steps: [
        'Oben den Reiter „Analyse“ öffnen.',
        'Dort „Was war los?“ wählen.',
        'Oben links „Alle anzeigen“ anklicken.',
        'Danach „Alles ausklappen“ wählen, damit die Einträge vollständig sichtbar sind.',
      ],
    },
  });

  const state = { open: false, key: null };
  let view = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[character]));
  }

  function ensureDirectWorkflowButtons() {
    const examples = document.querySelector('.examples');
    if (!examples) return;
    examples.dataset.v27Ready = 'direct-guides';
    examples.innerHTML = `
      <span>Häufige Abläufe · direkt öffnen</span>
      <button type="button" data-direct-guide="bericht">Bericht anlegen</button>
      <button type="button" data-direct-guide="visite">Visite anlegen</button>
      <button type="button" data-direct-guide="vitalwerte">Vitalwerte erfassen</button>
      <button type="button" data-direct-guide="anwesenheit">An-/Abwesenheit</button>
      <button type="button" data-direct-guide="medikation">Medikation ansehen</button>
      <button type="button" data-direct-guide="formular">Formular anlegen</button>
      <button type="button" data-direct-guide="uebergabe">Übergabe anzeigen</button>
    `;
  }

  function ensureCompactChatCopy() {
    const heading = document.querySelector('.chat-head h1');
    const copy = document.querySelector('.chat-head p');
    if (heading) heading.textContent = 'Schreib deine Frage.';
    if (copy) copy.textContent = 'Beschreibe kurz dein Ziel. DokoHilf führt dich nur durch bestätigte Abläufe.';
  }

  function ensureView() {
    if (view) return view;
    const main = document.querySelector('.main-content');
    if (!main) return null;
    view = document.createElement('section');
    view.id = 'directGuideView';
    view.className = 'direct-guide-view';
    view.hidden = true;
    view.setAttribute('aria-live', 'polite');
    main.insertBefore(view, main.querySelector('.legal-note'));
    return view;
  }

  function shellElements() {
    return {
      shell: document.getElementById('appShell'),
      start: document.getElementById('startScreen'),
      workspace: document.getElementById('workspace'),
      composer: document.getElementById('composerWrap'),
      legal: document.querySelector('.legal-note'),
      home: document.getElementById('homeButton'),
      reset: document.getElementById('resetButton'),
    };
  }

  function openFrame() {
    const target = ensureView();
    if (!target) return null;
    const elements = shellElements();
    state.open = true;
    elements.shell.dataset.mode = 'direct-guide';
    elements.start.hidden = true;
    elements.workspace.hidden = true;
    elements.composer.hidden = true;
    if (elements.legal) elements.legal.hidden = true;
    elements.home.hidden = false;
    elements.reset.hidden = true;
    target.hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    return target;
  }

  function closeGuide() {
    if (!state.open) return;
    const elements = shellElements();
    state.open = false;
    state.key = null;
    if (view) view.hidden = true;
    elements.shell.dataset.mode = 'start';
    elements.start.hidden = false;
    elements.workspace.hidden = true;
    elements.composer.hidden = true;
    if (elements.legal) elements.legal.hidden = false;
    elements.home.hidden = true;
    elements.reset.hidden = true;
    ensureDirectWorkflowButtons();
    ensureCompactChatCopy();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderSteps(guide) {
    return guide.steps.map((step, index) => `
      <li class="direct-guide-step">
        <span class="direct-guide-number" aria-hidden="true">${index + 1}</span>
        <div><p>${escapeHtml(step)}</p></div>
      </li>
    `).join('');
  }

  function renderGuide(key) {
    const guide = GUIDES[key];
    if (!guide) return;
    const target = openFrame();
    if (!target) return;
    state.key = key;
    target.innerHTML = `
      <div class="direct-guide-head">
        <button class="direct-guide-back" type="button" data-direct-guide-close aria-label="Zurück zum Hauptmenü">‹</button>
        <div class="direct-guide-heading">
          <span>Komplette Anleitung</span>
          <h1>${escapeHtml(guide.title)}</h1>
          <p>${escapeHtml(guide.subtitle)}</p>
        </div>
        <span class="direct-guide-count">${guide.steps.length} Schritte</span>
      </div>
      ${guide.warning ? `<div class="direct-guide-callout warning"><strong>Wichtig</strong><p>${escapeHtml(guide.warning)}</p></div>` : ''}
      ${guide.note ? `<div class="direct-guide-callout"><strong>Hinweis</strong><p>${escapeHtml(guide.note)}</p></div>` : ''}
      <ol class="direct-guide-steps">${renderSteps(guide)}</ol>
      <div class="direct-guide-footer">
        <button type="button" data-direct-guide-close>Zurück zum Hauptmenü</button>
      </div>
    `;
  }

  function renderVitalChoice() {
    const target = openFrame();
    if (!target) return;
    state.key = 'vitalwerte';
    target.innerHTML = `
      <div class="direct-guide-head">
        <button class="direct-guide-back" type="button" data-direct-guide-close aria-label="Zurück zum Hauptmenü">‹</button>
        <div class="direct-guide-heading">
          <span>Komplette Anleitung</span>
          <h1>Vitalwerte erfassen</h1>
          <p>Welche Erfassung brauchst du?</p>
        </div>
      </div>
      <div class="direct-guide-choices" role="group" aria-label="Art der Vitalwerterfassung auswählen">
        <button type="button" data-direct-guide-variant="vitalEinzel">
          <strong>Einzelnen Vitalwert</strong>
          <span>Zum Beispiel Blutdruck, Puls oder Temperatur.</span>
          <i aria-hidden="true">›</i>
        </button>
        <button type="button" data-direct-guide-variant="vitalSammel">
          <strong>Mehrere Vitalwerte</strong>
          <span>Direkt über „Vitalwerte Sammelerf.“.</span>
          <i aria-hidden="true">›</i>
        </button>
      </div>
      <div class="direct-guide-callout"><strong>Hinweis</strong><p>„Vitalwerte“ und „Vitalwerte Sammelerf.“ sind zwei getrennte Menüeinträge.</p></div>
    `;
  }

  function openGuide(key) {
    if (key === 'vitalwerte') return renderVitalChoice();
    renderGuide(key);
  }

  document.addEventListener('click', event => {
    const direct = event.target.closest('[data-direct-guide]');
    if (direct) {
      event.preventDefault();
      return openGuide(direct.dataset.directGuide);
    }
    const variant = event.target.closest('[data-direct-guide-variant]');
    if (variant) {
      event.preventDefault();
      return renderGuide(variant.dataset.directGuideVariant);
    }
    const close = event.target.closest('[data-direct-guide-close]');
    if (close) {
      event.preventDefault();
      return closeGuide();
    }
    if (state.open && event.target.closest('#homeButton')) closeGuide();
  });

  ensureDirectWorkflowButtons();
  ensureCompactChatCopy();

  window.DokoHilfDirectGuidesV27 = {
    openGuide,
    closeGuide,
    getState: () => ({ ...state }),
    guideKeys: () => Object.keys(GUIDES),
  };
  window.__DOKOHILF_DIRECT_GUIDES_V27__ = true;
})();