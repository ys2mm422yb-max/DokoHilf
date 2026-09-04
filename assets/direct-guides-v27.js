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
        'In der geöffneten Eingabemaske die Berichtskategorie wählen. Das große Textfeld für den Bericht ist unten bereits sichtbar.',
        'Nur bei „Kontakt – alles außer Arzt“ und „Sturzereignis“ prüfen, ob ein zusätzliches Protokoll automatisch verknüpft ist.',
        'Wird das Protokoll benötigt, bleibt es verknüpft.',
        'Wird es nicht benötigt, den angezeigten Protokollnamen anklicken und anschließend oben rechts auf das kleine rote X klicken.',
        'Das rote X entfernt nur die Protokollverknüpfung, nicht den Bericht.',
        'Datum und Uhrzeit prüfen.',
        'Wenn der Bericht für die nächste Schicht wichtig ist, „Wichtig für Schichtübergabe“ anhaken. Den Berichtstext in das große Textfeld darunter eintragen.',
        'Mit „OK“ bestätigen und den neuen Eintrag kontrollieren.',
      ],
      note: 'Bei „Kontakt – alles außer Arzt“ ist automatisch ein Fallgespräch verknüpft. Bei „Sturzereignis“ ist automatisch ein Sturzprotokoll verknüpft.',
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
        'Den beim Bewohner hinterlegten durchführenden Arzt auswählen.',
        '„Mitarbeiter“ bleibt auf „ohne Mitarbeiter“ beziehungsweise leer.',
        'Bei „Anforderung“ eintragen, wer die Sprechstunde angefordert hat.',
        'Den Grund eintragen, zum Beispiel „Kontrollbesuch“.',
        'Den Ort auswählen: Einrichtung, beim Arzt, telefonisch oder per Mail.',
        'Rechts in „Bemerkung“ Inhalt und Ergebnis der Visite eintragen.',
        'Speichern und prüfen, dass die Visite unter den durchgeführten Visiten erscheint.',
      ],
      warning: 'Visiten werden hier immer als „durchgeführt“ dokumentiert – niemals als „abgeschlossen“.',
      note: 'Nur wenn der durchführende Arzt beim Bewohner nicht hinterlegt ist, rechts neben der Arztauswahl das kleine Filtersymbol aktivieren. Im Normalfall bleibt das Filtersymbol aus.',
    },
    vitalEinzel: {
      title: 'Einzelnen Vitalwert erfassen',
      subtitle: 'Zum Beispiel Blutdruck, Puls oder Temperatur',
      steps: [
        'Bewohner auswählen.',
        '„Doku-Erweitert“ öffnen.',
        '„Vitalwerte“ wählen.',
        'Oben links auf das grüne Plus beziehungsweise „Neu“ klicken.',
        'Im Pop-up den gewünschten Vitalwert auswählen, zum Beispiel Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz oder Atemalkohol.',
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
        'Das geöffnete Formular wie gewohnt ausfüllen.',
        'Wenn das Formular fertig bearbeitet ist, oben links in der Leiste speichern.',
      ],
    },
    uebergabe: {
      title: 'Übergabe anzeigen',
      subtitle: 'Relevante Einträge für die Übergabe öffnen',
      steps: [
        'Oben den Reiter „Analyse“ öffnen.',
        'Dort „Was war los?“ wählen.',
        'Oben links „Alle anzeigen“ anklicken.',
        'Danach „Alle ausklappen“ wählen, damit die Einträge vollständig sichtbar sind.',
        'Den Zeitraum nur bei Bedarf ändern und anschließend die Anzeige aktualisieren.',
      ],
    },
  });

  const WORKFLOW_BUTTONS = Object.freeze([
    ['bericht', 'Bericht anlegen'],
    ['visite', 'Visite anlegen'],
    ['vitalwerte', 'Vitalwerte erfassen'],
    ['anwesenheit', 'An-/Abwesenheit'],
    ['medikation', 'Medikation ansehen'],
    ['formular', 'Formular anlegen'],
    ['uebergabe', 'Übergabe anzeigen'],
  ]);

  const state = { open: false, key: null };
  let view = null;
  let syncScheduled = false;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[character]));
  }

  function desiredButtonsPresent(examples) {
    const buttons = [...examples.querySelectorAll('button[data-direct-guide]')];
    return examples.dataset.v27Ready === 'direct-guides-cross-platform'
      && buttons.length === WORKFLOW_BUTTONS.length
      && !examples.querySelector('button[data-prompt]')
      && WORKFLOW_BUTTONS.every(([key, label], index) => buttons[index]?.dataset.directGuide === key && buttons[index]?.textContent?.trim() === label);
  }

  function v29OwnsGuideLibrary(examples) {
    const owner = window.__DOKOHILF_GUIDE_LIBRARY_V29__;
    return examples?.dataset.v29GuideLibrary === 'true' || owner === true || owner === 'initializing';
  }

  function v29OwnsChatCopy() {
    return document.documentElement.dataset.dokohilfUi === 'v29' || window.__DOKOHILF_UI_V29__ === true;
  }

  function ensureDirectWorkflowButtons() {
    const examples = document.querySelector('.examples');
    if (!examples || v29OwnsGuideLibrary(examples) || desiredButtonsPresent(examples)) return false;
    examples.dataset.v27Ready = 'direct-guides-cross-platform';
    examples.innerHTML = `<span>Häufige Abläufe · direkt öffnen</span>${WORKFLOW_BUTTONS
      .map(([key, label]) => `<button type="button" data-direct-guide="${key}">${label}</button>`)
      .join('')}`;
    return true;
  }

  function ensureCompactChatCopy() {
    if (v29OwnsChatCopy()) return false;
    const head = document.querySelector('.chat-head');
    if (!head) return false;
    let changed = false;
    let eyebrow = head.querySelector('.chat-eyebrow');
    const heading = head.querySelector('h1');
    const copy = head.querySelector('p');
    if (!eyebrow && heading) {
      eyebrow = document.createElement('span');
      eyebrow.className = 'chat-eyebrow';
      heading.before(eyebrow);
      changed = true;
    }
    if (eyebrow && eyebrow.textContent !== 'DokoHilf Chat') { eyebrow.textContent = 'DokoHilf Chat'; changed = true; }
    if (heading && heading.textContent !== 'Schreib deine Frage.') { heading.textContent = 'Schreib deine Frage.'; changed = true; }
    const copyText = 'Schreib kurz, was du erledigen möchtest. DokoHilf führt dich Schritt für Schritt.';
    if (copy && copy.textContent !== copyText) { copy.textContent = copyText; changed = true; }
    head.querySelector('.quick-prompts')?.setAttribute('aria-label', 'Schnelle Fragen');
    return changed;
  }

  function syncPresentation() {
    syncScheduled = false;
    ensureDirectWorkflowButtons();
    ensureCompactChatCopy();
  }

  function scheduleSync() {
    if (syncScheduled) return;
    syncScheduled = true;
    requestAnimationFrame(syncPresentation);
  }

  function ensureView() {
    if (view?.isConnected) return view;
    const main = document.querySelector('.main-content');
    if (!main) return null;
    view = document.getElementById('directGuideView') || document.createElement('section');
    view.id = 'directGuideView';
    view.className = 'direct-guide-view';
    view.hidden = true;
    view.setAttribute('aria-live', 'polite');
    if (!view.isConnected) main.insertBefore(view, main.querySelector('.legal-note'));
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
    if (!elements.shell || !elements.start || !elements.workspace || !elements.composer) return null;
    state.open = true;
    elements.shell.dataset.mode = 'direct-guide';
    elements.start.hidden = true;
    elements.workspace.hidden = true;
    elements.composer.hidden = true;
    if (elements.legal) elements.legal.hidden = true;
    if (elements.home) elements.home.hidden = false;
    if (elements.reset) elements.reset.hidden = true;
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
    if (elements.shell) elements.shell.dataset.mode = 'start';
    if (elements.start) elements.start.hidden = false;
    if (elements.workspace) elements.workspace.hidden = true;
    if (elements.composer) elements.composer.hidden = true;
    if (elements.legal) elements.legal.hidden = false;
    if (elements.home) elements.home.hidden = true;
    if (elements.reset) elements.reset.hidden = true;
    scheduleSync();
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
      <div class="direct-guide-footer"><button type="button" data-direct-guide-close>Zurück zum Hauptmenü</button></div>
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
        <button type="button" data-direct-guide-variant="vitalEinzel"><strong>Einzelnen Vitalwert</strong><span>Zum Beispiel Blutdruck, Puls oder Temperatur.</span><i aria-hidden="true">›</i></button>
        <button type="button" data-direct-guide-variant="vitalSammel"><strong>Mehrere Vitalwerte</strong><span>Direkt über „Vitalwerte Sammelerf.“.</span><i aria-hidden="true">›</i></button>
      </div>
      <div class="direct-guide-callout"><strong>Hinweis</strong><p>„Vitalwerte“ und „Vitalwerte Sammelerf.“ sind zwei getrennte Menüeinträge.</p></div>
    `;
  }

  function openGuide(key) {
    if (key === 'vitalwerte') return renderVitalChoice();
    return renderGuide(key);
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

  const observer = new MutationObserver(() => scheduleSync());
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', scheduleSync, { once: true });
  window.addEventListener('pageshow', scheduleSync);
  scheduleSync();
  setTimeout(scheduleSync, 0);
  setTimeout(scheduleSync, 120);

  window.DokoHilfDirectGuidesV27 = {
    openGuide,
    closeGuide,
    syncPresentation,
    getState: () => ({ ...state }),
    guideKeys: () => Object.keys(GUIDES),
  };
  window.__DOKOHILF_DIRECT_GUIDES_V27__ = 'cross-platform-2';
})();
