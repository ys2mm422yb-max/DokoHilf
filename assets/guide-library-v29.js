(() => {
  'use strict';

  const STORAGE_KEY = 'dokohilf-guide-usage-v29';
  const DEFAULT_FREQUENT = ['bericht-neu', 'visite-anlegen', 'vitalwerte', 'anwesenheit', 'medikation-ansehen', 'formulare-anlegen'];

  const META = Object.freeze({
    'bericht-neu': { label: 'Bericht anlegen', subtitle: 'Neuen Bericht dokumentieren', icon: 'report' },
    'bericht-durchstreichen': { label: 'Bericht korrigieren', subtitle: 'Falschen Bericht durchstreichen', icon: 'reportEdit' },
    'bericht-folgebericht': { label: 'Folgebericht erstellen', subtitle: 'Bestehendes Geschehen ergänzen', icon: 'followup' },
    'visite-anlegen': { label: 'Visite anlegen', subtitle: 'Sprechstunde dokumentieren', icon: 'doctor' },
    vitalwerte: { label: 'Vitalwerte erfassen', subtitle: 'Einzelwert oder Sammelerfassung', icon: 'pulse' },
    anwesenheit: { label: 'An-/Abwesenheit', subtitle: 'Status mit Von/Bis erfassen', icon: 'presence' },
    'medikation-ansehen': { label: 'Medikation ansehen', subtitle: 'Medikationsübersicht öffnen', icon: 'medication' },
    'formulare-anlegen': { label: 'Formular anlegen', subtitle: 'Formular auswählen und öffnen', icon: 'form' },
    uebergabeformular: { label: 'Übergabe anzeigen', subtitle: '„Was war los?“ vollständig öffnen', icon: 'handover' },
    notfallblatt: { label: 'Notfallblatt öffnen', subtitle: 'Notfallblatt in Word erzeugen', icon: 'emergency' },
    'durchfuehrung-storno': { label: 'Durchführung stornieren', subtitle: 'Falsch abgezeichnete Durchführung', icon: 'undo' },
    'durchfuehrungsnachweis-oeffnen': { label: 'Durchführungsnachweis', subtitle: 'Nachweis öffnen', icon: 'checklist' },
    'aufgaben-aktuelles': { label: 'Aufgaben · Aktuelles', subtitle: 'Aktuelle Aufgaben öffnen', icon: 'tasks' },
    easyplan: { label: 'Easy-Plan öffnen', subtitle: 'Planung · Easy-Plan', icon: 'plan' },
    stammdaten: { label: 'Stammdaten öffnen', subtitle: 'Bewohner-Stammdaten aufrufen', icon: 'person' },
    'visiten-oeffnen': { label: 'Visiten öffnen', subtitle: 'Zum Bereich Visiten wechseln', icon: 'doctor' },
    'visite-status-durchgefuehrt': { label: 'Visitenstatus', subtitle: 'Status „durchgeführt“ verwenden', icon: 'status' },
  });

  const GUIDES = Object.freeze({
    'bericht-neu': {
      title: 'Bericht anlegen', subtitle: 'Neuen Berichtseintrag erfassen', icon: 'report',
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
      note: 'Der Protokoll-Sonderfall gilt nur für „Kontakt – alles außer Arzt“ und „Sturzereignis“. Bei anderen Kategorien direkt mit Datum und Uhrzeit weitermachen.',
    },
    'bericht-durchstreichen': {
      title: 'Bericht korrigieren', subtitle: 'Falschen Bericht durchstreichen', icon: 'reportEdit',
      steps: [
        'Beim gewünschten Bewohner den Bereich „Berichte“ öffnen.',
        'Den falschen Berichtseintrag suchen und mit der rechten Maustaste anklicken.',
        '„Eintrag bearbeiten“ wählen.',
        '„Durchstreichen“ wählen.',
        'Im Feld „Bemerkung zur Bearbeitung“ den Grund eintragen.',
        'Mit „OK“ bestätigen.',
        'Kontrollieren, ob der Bericht sichtbar durchgestrichen ist.',
      ],
      warning: 'Ein Folgebericht korrigiert den ursprünglichen Bericht nicht.',
      note: 'Wenn der Inhalt anschließend korrekt neu dokumentiert werden soll, danach einen neuen Bericht anlegen. Ein Folgebericht dient dagegen dazu, ein bestehendes Geschehen später zu ergänzen oder fortzuführen.',
    },
    'bericht-folgebericht': {
      title: 'Folgebericht erstellen', subtitle: 'Ein bestehendes Geschehen ergänzen oder fortführen', icon: 'followup',
      steps: [
        'Beim gewünschten Bewohner den Bereich „Berichte“ öffnen.',
        'Den Bericht suchen, auf dessen Geschehen sich der neue Folgebericht beziehen soll.',
        'Den ursprünglichen Bericht mit der rechten Maustaste anklicken.',
        '„Folgebericht erstellen“ wählen.',
        'Datum und Uhrzeit prüfen und den neuen ergänzenden beziehungsweise fortführenden Inhalt eintragen.',
        'Mit „OK“ bestätigen und kontrollieren, ob der Folgebericht sichtbar ist.',
      ],
      note: 'Ein Folgebericht ist ein neuer Bericht mit Bezug zu einem bereits dokumentierten Geschehen. Er verändert oder korrigiert den ursprünglichen Bericht nicht.',
    },
    'visite-anlegen': {
      title: 'Visite anlegen', subtitle: 'Visite beziehungsweise Sprechstunde dokumentieren', icon: 'doctor',
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
      specialAfter: 8,
      specialTitle: 'Sonderfall · Arzt nicht beim Bewohner hinterlegt?',
      specialText: 'Nur dann rechts neben der Arztauswahl das kleine Filtersymbol aktivieren. Danach stehen alle im System hinterlegten Ärzte zur Auswahl. Im Normalfall bleibt das Filtersymbol aus.',
    },
    'vitalwerte-einzelwert': {
      title: 'Einzelnen Vitalwert erfassen', subtitle: 'Zum Beispiel Blutdruck, Puls oder Temperatur', icon: 'pulse',
      steps: [
        'Bewohner auswählen.',
        '„Doku-Erweitert“ öffnen.',
        '„Vitalwerte“ wählen.',
        'Oben links auf das grüne Plus beziehungsweise „Neu“ klicken.',
        'Im Pop-up den gewünschten Vitalwert auswählen, zum Beispiel Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz oder Atemalkohol.',
        'Datum und Uhrzeit prüfen.',
        'Den gemessenen Wert eintragen. Je nach ausgewähltem Vitalwert erscheinen die dazu passenden Eingabefelder.',
        'Zusätzliche Angaben wie Messart, Qualität oder Bemerkung nur ergänzen, wenn sie benötigt werden.',
        'Mit „OK“ bestätigen und den neuen Wert in der Übersicht kontrollieren.',
      ],
      specialAfter: 7,
      specialTitle: 'Beispiele',
      specialText: 'Blutdruck: Systole und Diastole. Außerdem können bei euch Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz und Atemalkohol erfasst werden. Die Einheit oder zusätzliche Felder immer so übernehmen, wie sie in der geöffneten Vivendi-Maske angezeigt werden.',
    },
    'vitalwerte-sammelerfassung': {
      title: 'Mehrere Vitalwerte erfassen', subtitle: 'Vitalwerte Sammelerf.', icon: 'pulse',
      steps: [
        'Bewohner auswählen.',
        '„Doku-Erweitert“ öffnen.',
        'Direkt „Vitalwerte Sammelerf.“ wählen.',
        'Die benötigten Vitalwerte für die gemeinsame Erfassung auswählen.',
        'Datum, Uhrzeit und die gemessenen Werte eintragen.',
        'Mit „OK“ beziehungsweise „Speichern“ bestätigen und die Werte in der Übersicht kontrollieren.',
      ],
      note: '„Vitalwerte“ und „Vitalwerte Sammelerf.“ sind zwei getrennte Menüeinträge.',
    },
    anwesenheit: {
      title: 'An-/Abwesenheit', subtitle: 'An- oder Abwesenheit erfassen', icon: 'presence',
      steps: [
        'Bewohner auswählen.', '„Doku-Erweitert“ öffnen.', '„An-/Abwesenheiten“ wählen.', 'Oben links „Neu“ wählen.',
        'Den passenden Status auswählen.', 'Bei „Von“ immer Datum und Uhrzeit eintragen.',
        'Bei „Bis“ nur dann Datum und Uhrzeit eintragen, wenn der Endzeitpunkt sicher feststeht.',
        'Wenn der Endzeitpunkt noch nicht sicher feststeht, „Bis“ einfach leer lassen. Bitte nicht schätzen.',
        'Nur die Angaben ergänzen, die du wirklich brauchst, zum Beispiel Ziel, Begleitung, Grund oder Bemerkung.',
        'Speichern und kurz prüfen, ob der Eintrag in der Übersicht erscheint.',
      ],
      warning: '„Von“ gehört immer dazu. „Bis“ bleibt leer, solange der genaue Endzeitpunkt noch nicht sicher feststeht.',
    },
    'medikation-ansehen': {
      title: 'Medikation ansehen', subtitle: 'Ausschließlich ansehen', icon: 'medication',
      steps: ['Bewohner auswählen.', '„Doku-Erweitert“ öffnen.', '„Medikation“ wählen.', 'Die Medikamentenübersicht ausschließlich ansehen.'],
      warning: 'Hier geht es nur ums Ansehen. Nichts ändern, pausieren, fortsetzen, absetzen, korrigieren, ergänzen oder löschen.',
    },
    'formulare-anlegen': {
      title: 'Formular anlegen', subtitle: 'Formular auswählen und bearbeiten', icon: 'form',
      steps: [
        'Bewohner auswählen.', '„Doku-Erweitert“ öffnen.', '„Formulare“ wählen.', 'Oben links „Neu“ klicken.',
        'Im Fenster „Formular anlegen“ das benötigte Formular auswählen, zum Beispiel Anfallsprotokoll, Fallgespräch, Gesprächsprotokoll oder Sturzprotokoll.',
        'Mit „OK“ bestätigen.', 'Das geöffnete Formular wie gewohnt ausfüllen.',
        'Wenn du das Formular fertig bearbeitet hast, speicherst du es oben links in der Leiste.',
      ],
    },
    uebergabeformular: {
      title: 'Übergabe anzeigen', subtitle: 'Relevante Einträge über „Was war los?“ öffnen', icon: 'handover',
      steps: ['Oben den Reiter „Analyse“ öffnen.', '„Was war los?“ wählen.', 'Oben links „Alle anzeigen“ anklicken.', '„Alles ausklappen“ wählen, damit sämtliche Einträge vollständig sichtbar werden.', 'Den Zeitraum nur bei Bedarf ändern und anschließend die Anzeige aktualisieren.'],
    },
    notfallblatt: {
      title: 'Notfallblatt öffnen', subtitle: 'Notfallblatt in Word öffnen', icon: 'emergency',
      steps: ['Bewohner auswählen.', 'Ganz oben links auf das kleine rote Kreuz beziehungsweise den zugehörigen Pfeil klicken.', '„Notfallblatt aufrufen“ wählen.', '„Notfallblatt_Allgemein“ ist normalerweise bereits ausgewählt.', 'Einen Grund der Einweisung nur bei Bedarf eintragen.', 'Mit „OK“ bestätigen.', 'Bis zu etwa drei Minuten warten, bis sich Word öffnet.', 'Standby verhindern und den Vorgang nicht mehrfach starten.'],
    },
    'durchfuehrung-storno': {
      title: 'Durchführung stornieren', subtitle: 'Falsch abgezeichnete Durchführung korrigieren', icon: 'undo',
      steps: ['„Doku“ öffnen.', '„Durchführungsnachweis“ öffnen.', 'Die falsch abgezeichnete Durchführung suchen.', 'Den Eintrag mit der rechten Maustaste anklicken.', '„Durchführung stornieren“ wählen.', 'Einen nachvollziehbaren Stornogrund eintragen und mit „OK“ bestätigen.', 'Kontrollieren, ob die Durchführung als storniert beziehungsweise ungültig gekennzeichnet ist.'],
      note: 'Ein Bericht wird durchgestrichen. Eine falsch abgezeichnete Durchführung wird im Durchführungsnachweis storniert.',
    },
    'durchfuehrungsnachweis-oeffnen': {
      title: 'Durchführungsnachweis öffnen', subtitle: 'Zum Durchführungsnachweis wechseln', icon: 'checklist',
      steps: ['„Doku“ öffnen.', '„Durchführungsnachweis“ wählen.', 'Dort den gewünschten Eintrag beziehungsweise die gewünschte Funktion auswählen.'],
    },
    'aufgaben-aktuelles': {
      title: 'Aufgaben · Aktuelles', subtitle: 'Aktuelle Aufgaben öffnen', icon: 'tasks',
      steps: ['Oben den Reiter „Aufgaben“ öffnen.', 'Darunter „Aktuelles“ wählen.'],
    },
    easyplan: {
      title: 'Easy-Plan öffnen', subtitle: 'Easy-Plan in der Planung öffnen', icon: 'plan',
      steps: ['Oben den Reiter „Planung“ öffnen.', '„Easy-Plan“ wählen.'],
    },
    stammdaten: {
      title: 'Stammdaten öffnen', subtitle: 'Stammdaten eines Bewohners aufrufen', icon: 'person',
      steps: ['Zur Bewohnerübersicht gehen.', 'Die gewünschte Person mit einem Doppelklick öffnen.'],
    },
    'visiten-oeffnen': {
      title: 'Visiten öffnen', subtitle: 'Zum Bereich Visiten wechseln', icon: 'doctor',
      steps: ['„Doku-Erweitert“ öffnen.', '„Visiten“ wählen.'],
    },
    'visite-status-durchgefuehrt': {
      title: 'Visitenstatus richtig setzen', subtitle: 'Status „durchgeführt“ verwenden', icon: 'status',
      steps: ['In der geöffneten Visite den Status auf „durchgeführt“ setzen. Niemals „abgeschlossen“ verwenden.'],
      warning: 'In eurer Arbeitsweise wird eine bearbeitete Visite immer als „durchgeführt“ dokumentiert.',
    },
  });

  const LIBRARY_ORDER = [
    'bericht-neu', 'bericht-durchstreichen', 'bericht-folgebericht', 'visite-anlegen', 'visiten-oeffnen', 'visite-status-durchgefuehrt',
    'vitalwerte', 'anwesenheit', 'medikation-ansehen', 'formulare-anlegen', 'uebergabeformular', 'notfallblatt',
    'durchfuehrung-storno', 'durchfuehrungsnachweis-oeffnen', 'aufgaben-aktuelles', 'easyplan', 'stammdaten',
  ];

  const LEGACY_KEY_TO_SLUG = Object.freeze({
    bericht: 'bericht-neu', visite: 'visite-anlegen', vitalwerte: 'vitalwerte', anwesenheit: 'anwesenheit',
    medikation: 'medikation-ansehen', formular: 'formulare-anlegen', uebergabe: 'uebergabeformular',
  });

  const ICONS = Object.freeze({
    report: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h5M10 12h6M10 16h6"/>',
    reportEdit: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/><path d="m5 20 5-5"/>',
    followup: '<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v5h5M8 13h6"/><path d="m11 18 2 2 4-4"/>',
    doctor: '<path d="M9 3v5a3 3 0 0 0 6 0V3M7 4h2M15 4h2"/><path d="M12 11v2a6 6 0 0 0 6 6h1"/><circle cx="19" cy="19" r="2"/>',
    pulse: '<path d="M3 12h4l2-5 3 10 2-6 2 3h5"/>',
    presence: '<circle cx="9" cy="8" r="3"/><path d="M4 20v-2a5 5 0 0 1 10 0v2M16 8h5M18.5 5.5v5"/>',
    medication: '<path d="m7 17 10-10a4 4 0 0 1 0 6L11 19a4 4 0 0 1-6-6l2-2"/><path d="m9 15 6 6"/>',
    form: '<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4"/><path d="M4 6h2"/>',
    handover: '<path d="M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4"/>',
    emergency: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
    undo: '<path d="M9 7H4v-5"/><path d="M4 7a8 8 0 1 1 2 9"/><path d="M10 11h6M13 8v6"/>',
    checklist: '<path d="M7 3h10v18H7z"/><path d="m9 8 1.5 1.5L13 7M14 9h1M9 14l1.5 1.5L13 13M14 15h1"/>',
    tasks: '<path d="M6 4h12v16H6z"/><path d="m9 9 1.5 1.5L13 8M14 10h2M9 15h7"/>',
    plan: '<path d="M4 5h16v14H4zM8 3v4M16 3v4M4 9h16"/><path d="M8 13h3M13 13h3M8 16h3"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>',
    status: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  });

  let view = null;
  let state = { source: 'home', current: null };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function iconMarkup(kind) {
    return `<span class="v29-guide-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[kind] || ICONS.report}</svg></span>`;
  }

  function loadUsage() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch { return {}; }
  }

  function saveUsage(usage) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(usage)); } catch { }
  }

  function recordUsage(slug) {
    const key = slug.startsWith('vitalwerte-') ? 'vitalwerte' : slug;
    const usage = loadUsage();
    usage[key] = Number(usage[key] || 0) + 1;
    saveUsage(usage);
    renderFrequent();
  }

  function frequentSlugs() {
    const usage = loadUsage();
    const baseOrder = LIBRARY_ORDER.filter(slug => slug !== 'vitalwerte-einzelwert' && slug !== 'vitalwerte-sammelerfassung');
    const candidates = [...new Set([...DEFAULT_FREQUENT, ...baseOrder])].filter(slug => META[slug]);
    return candidates.sort((a, b) => {
      const delta = Number(usage[b] || 0) - Number(usage[a] || 0);
      if (delta) return delta;
      const ai = DEFAULT_FREQUENT.indexOf(a); const bi = DEFAULT_FREQUENT.indexOf(b);
      if (ai >= 0 || bi >= 0) return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      return LIBRARY_ORDER.indexOf(a) - LIBRARY_ORDER.indexOf(b);
    }).slice(0, 6);
  }

  function shellElements() {
    return {
      shell: document.getElementById('appShell'), start: document.getElementById('startScreen'), workspace: document.getElementById('workspace'),
      composer: document.getElementById('composerWrap'), legal: document.querySelector('.legal-note'), home: document.getElementById('homeButton'), reset: document.getElementById('resetButton'),
    };
  }

  function ensureView() {
    if (view?.isConnected) return view;
    const main = document.querySelector('.main-content');
    if (!main) return null;
    view = document.getElementById('directGuideView') || document.createElement('section');
    view.id = 'directGuideView'; view.className = 'direct-guide-view'; view.hidden = true; view.setAttribute('aria-live', 'polite');
    if (!view.isConnected) main.insertBefore(view, main.querySelector('.legal-note'));
    return view;
  }

  function openFrame() {
    const target = ensureView(); const el = shellElements();
    if (!target || !el.shell || !el.start || !el.workspace || !el.composer) return null;
    el.shell.dataset.mode = 'direct-guide'; el.shell.dataset.v29GuideLibrary = 'true';
    el.start.hidden = true; el.workspace.hidden = true; el.composer.hidden = true; target.hidden = false;
    if (el.legal) el.legal.hidden = true; if (el.home) el.home.hidden = false; if (el.reset) el.reset.hidden = true;
    window.scrollTo({ top: 0, behavior: 'instant' });
    return target;
  }

  function closeToHome() {
    const el = shellElements();
    state = { source: 'home', current: null };
    if (view) view.hidden = true;
    if (el.shell) { el.shell.dataset.mode = 'start'; delete el.shell.dataset.v29GuideLibrary; }
    if (el.start) el.start.hidden = false; if (el.workspace) el.workspace.hidden = true; if (el.composer) el.composer.hidden = true;
    if (el.legal) el.legal.hidden = false; if (el.home) el.home.hidden = true; if (el.reset) el.reset.hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function headerHtml(title, subtitle, count, backLabel = 'Zurück') {
    return `<div class="direct-guide-head v29-library-guide-head">
      <button class="direct-guide-back" type="button" data-v29-guide-back aria-label="${escapeHtml(backLabel)}">‹</button>
      <div class="direct-guide-heading"><span>Komplette Anleitung</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div>
      ${count ? `<span class="direct-guide-count">${count} Schritte</span>` : ''}
    </div>`;
  }

  function specialCallout(guide) {
    if (!guide.specialTitle || !guide.specialText) return '';
    return `<li class="v29-guide-special"><div class="v29-guide-special-icon">!</div><div><strong>${escapeHtml(guide.specialTitle)}</strong><p>${escapeHtml(guide.specialText)}</p></div></li>`;
  }

  function renderGuide(slug, source = 'home') {
    if (slug === 'vitalwerte') return renderVitalChoice(source);
    const guide = GUIDES[slug]; if (!guide) return;
    const target = openFrame(); if (!target) return;
    state = { source, current: slug }; recordUsage(slug);
    const steps = guide.steps.map((step, index) => {
      const number = index + 1;
      const special = guide.specialAfter === number ? specialCallout(guide) : '';
      return `<li class="direct-guide-step"><span class="direct-guide-number" aria-hidden="true">${number}</span><div><p>${escapeHtml(step)}</p></div></li>${special}`;
    }).join('');
    target.innerHTML = `${headerHtml(guide.title, guide.subtitle, guide.steps.length, source === 'library' ? 'Zurück zu allen Anleitungen' : 'Zurück zum Hauptmenü')}
      ${guide.warning ? `<div class="direct-guide-callout warning"><strong>Wichtig</strong><p>${escapeHtml(guide.warning)}</p></div>` : ''}
      ${guide.note ? `<div class="direct-guide-callout"><strong>Hinweis</strong><p>${escapeHtml(guide.note)}</p></div>` : ''}
      <ol class="direct-guide-steps">${steps}</ol>
      <div class="direct-guide-footer"><button type="button" data-v29-guide-home>Zurück zum Hauptmenü</button></div>`;
  }

  function renderVitalChoice(source = 'home') {
    const target = openFrame(); if (!target) return;
    state = { source, current: 'vitalwerte' }; recordUsage('vitalwerte');
    target.innerHTML = `${headerHtml('Vitalwerte erfassen', 'Welche Erfassung brauchst du?', 0, source === 'library' ? 'Zurück zu allen Anleitungen' : 'Zurück zum Hauptmenü')}
      <div class="direct-guide-choices v29-vital-choice">
        <button type="button" data-v29-open-guide="vitalwerte-einzelwert">${iconMarkup('pulse')}<strong>Einzelnen Vitalwert</strong><span>Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz oder Atemalkohol.</span><i aria-hidden="true">›</i></button>
        <button type="button" data-v29-open-guide="vitalwerte-sammelerfassung">${iconMarkup('checklist')}<strong>Mehrere Vitalwerte</strong><span>Direkt über „Vitalwerte Sammelerf.“ mehrere Werte gemeinsam erfassen.</span><i aria-hidden="true">›</i></button>
      </div>`;
  }

  function renderLibrary() {
    const target = openFrame(); if (!target) return;
    state = { source: 'library', current: 'library' };
    const cards = LIBRARY_ORDER.map(slug => {
      const meta = META[slug]; if (!meta) return '';
      return `<button class="v29-library-card" type="button" data-v29-open-guide="${slug}">${iconMarkup(meta.icon)}<span><strong>${escapeHtml(meta.label)}</strong><small>${escapeHtml(meta.subtitle)}</small></span><i aria-hidden="true">›</i></button>`;
    }).join('');
    target.innerHTML = `<div class="v29-library-head">
      <button class="direct-guide-back" type="button" data-v29-guide-home aria-label="Zurück zum Hauptmenü">‹</button>
      <div><span>Übersicht</span><h1>Alle Anleitungen</h1><p>Wähle den Ablauf, den du gerade brauchst.</p></div>
    </div>
    <div class="v29-library-grid">${cards}
      <div class="v29-library-card is-later" aria-disabled="true">${iconMarkup('report')}<span><strong>Berichtssuche</strong><small>Wird fachlich noch überarbeitet · kommt später</small></span><b>Später</b></div>
    </div>`;
  }

  function renderFrequent() {
    const examples = document.querySelector('.examples'); if (!examples) return;
    examples.dataset.v29GuideLibrary = 'true';
    const label = examples.querySelector(':scope > span'); if (label) label.textContent = 'Häufig genutzt';
    for (const button of examples.querySelectorAll('button[data-direct-guide]')) button.hidden = true;
    examples.querySelectorAll('.v29-frequent-guide,.v29-all-guides-trigger').forEach(node => node.remove());
    for (const slug of frequentSlugs()) {
      const meta = META[slug];
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'v29-frequent-guide'; button.dataset.v29OpenGuide = slug;
      button.innerHTML = `${iconMarkup(meta.icon)}<span>${escapeHtml(meta.label)}</span><i aria-hidden="true">›</i>`;
      examples.append(button);
    }
    const all = document.createElement('button');
    all.type = 'button'; all.className = 'v29-all-guides-trigger'; all.dataset.v29OpenLibrary = 'true';
    all.innerHTML = '<span>Alle Anleitungen anzeigen</span><i aria-hidden="true">›</i>';
    examples.append(all);
  }

  function legacySlug(target) {
    const key = target?.dataset?.directGuide || '';
    return LEGACY_KEY_TO_SLUG[key] || '';
  }

  document.addEventListener('click', event => {
    const legacy = event.target.closest?.('.examples button[data-direct-guide]');
    if (legacy) {
      const slug = legacySlug(legacy); if (!slug) return;
      event.preventDefault(); event.stopImmediatePropagation(); renderGuide(slug, 'home'); return;
    }
    const library = event.target.closest?.('[data-v29-open-library]');
    if (library) { event.preventDefault(); renderLibrary(); return; }
    const open = event.target.closest?.('[data-v29-open-guide]');
    if (open) {
      event.preventDefault();
      const slug = open.dataset.v29OpenGuide; const source = state.current === 'library' ? 'library' : state.source;
      renderGuide(slug, source || 'home'); return;
    }
    if (event.target.closest?.('[data-v29-guide-home]')) { event.preventDefault(); closeToHome(); return; }
    if (event.target.closest?.('[data-v29-guide-back]')) {
      event.preventDefault();
      if (state.source === 'library') renderLibrary(); else closeToHome();
    }
  }, { capture: true });

  document.getElementById('homeButton')?.addEventListener('click', event => {
    if (document.getElementById('appShell')?.dataset.v29GuideLibrary !== 'true') return;
    event.preventDefault(); event.stopImmediatePropagation(); closeToHome();
  }, { capture: true });

  function initialize() {
    renderFrequent();
    new MutationObserver(() => {
      if (!document.querySelector('.examples')?.dataset.v29GuideLibrary) renderFrequent();
    }).observe(document.documentElement, { childList: true, subtree: true });
    window.__DOKOHILF_GUIDE_LIBRARY_V29__ = true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
