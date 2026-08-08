(() => {
  'use strict';

  const AREAS = [
    { id: 'berichte', label: 'Berichte', icon: 'B', description: 'Eintragen und korrigieren' },
    { id: 'doku', label: 'Doku', icon: 'D', description: 'Anwesenheit und Nachweise' },
    { id: 'doku-erweitert', label: 'Doku erweitert', icon: 'D+', description: 'Visiten, Werte, Medikation' },
    { id: 'planung', label: 'Planung', icon: 'P', description: 'EasyPlan' },
    { id: 'aufgaben', label: 'Aufgaben', icon: 'A', description: 'Aktuelles und Kalender' },
    { id: 'analyse', label: 'Analyse', icon: '↗', description: 'Übergabe und Abfrage' },
    { id: 'bewohner', label: 'Bewohner', icon: '⊙', description: 'Stammdaten öffnen' }
  ];

  const GUIDES = [
    {
      id: 'bericht-neu', area: 'berichte', title: 'Neuen Berichtseintrag anlegen', icon: '+', duration: '2–3 Min.', route: 'Berichte → grünes Plus → Neuer Berichtseintrag',
      description: 'Datum, Uhrzeit, Kategorie, Übergaberelevanz und Inhalt vollständig erfassen und anschließend bestätigen.',
      keywords: ['bericht', 'berichtseintrag', 'neuer bericht', 'schreiben', 'dokumentieren', 'übergabe', 'plus'], visual: 'report-new',
      steps: [
        ['Berichte öffnen', 'Klicke in der festen grauen Leiste auf „Berichte“. Dadurch öffnet sich die Übersicht der vorhandenen Einträge.', 'Achte darauf, dass der richtige fiktive Übungsbewohner ausgewählt ist.'],
        ['Grünes Plus wählen', 'Klicke oben links auf das grüne Plus und wähle anschließend „Neuer Berichtseintrag“.', 'Das Plus startet einen neuen Eintrag; vorhandene Einträge bleiben unverändert.'],
        ['Zeit und Kategorie festlegen', 'Prüfe Datum und Uhrzeit und wähle die passende Kategorie aus.', 'Die Kategorie sollte zum tatsächlichen Inhalt passen.'],
        ['Übergaberelevanz auswählen', 'Lege bei „Wichtig für Schichtübergabe“ fest, ob der Eintrag in der Übergabe sichtbar sein soll.', 'Nur „Ja“ wählen, wenn der Inhalt für die nächste Schicht wirklich relevant ist.'],
        ['Inhalt schreiben und bestätigen', 'Trage den Inhalt sachlich und nachvollziehbar ein. Schließe den Vorgang unten mit „OK“ ab.', 'Vor „OK“ noch einmal Bewohner, Zeit, Kategorie und Text prüfen.']
      ]
    },
    {
      id: 'bericht-durchstreichen', area: 'berichte', title: 'Berichtseintrag durchstreichen', icon: '≠', duration: '2 Min.', route: 'Berichte → Rechtsklick auf Eintrag → Eintrag bearbeiten → Durchstreichen',
      description: 'Einen fehlerhaften Eintrag nachvollziehbar durchstreichen und den Grund dazu dokumentieren.',
      keywords: ['bericht fehler', 'verschrieben', 'durchstreichen', 'korrigieren', 'eintrag bearbeiten', 'rechtsklick'], visual: 'report-strike',
      steps: [
        ['Eintrag auswählen', 'Öffne „Berichte“ und suche den fehlerhaften Berichtseintrag.', 'Vorher prüfen, ob wirklich der richtige Eintrag markiert ist.'],
        ['Kontextmenü öffnen', 'Klicke mit der rechten Maustaste auf den Berichtseintrag und wähle „Eintrag bearbeiten“.', 'Auf Geräten ohne rechte Maustaste kann der freigegebene Geräteablauf abweichen.'],
        ['Durchstreichen wählen', 'Wähle in der Bearbeitung die Funktion „Durchstreichen“.', 'Der ursprüngliche Eintrag bleibt aus Gründen der Nachvollziehbarkeit erkennbar.'],
        ['Begründung eintragen', 'Gib möglichst konkret an, warum der Eintrag durchgestrichen wird.', 'Keine neue Dokumentation in die Begründung mischen; nur den Korrekturgrund festhalten.'],
        ['Mit OK bestätigen', 'Prüfe die Auswahl und bestätige den Vorgang mit „OK“.', 'Danach kontrollieren, ob der Eintrag sichtbar als durchgestrichen gekennzeichnet ist.']
      ]
    },
    {
      id: 'anwesenheit', area: 'doku', title: 'An- und Abwesenheit dokumentieren', icon: '↔', duration: '2 Min.', route: 'Doku → An- und Abwesenheit',
      description: 'Den Anwesenheitsstatus einer Person im vorgesehenen Bereich prüfen oder erfassen.', keywords: ['anwesenheit', 'abwesenheit', 'anwesend', 'doku'], visual: 'attendance',
      steps: [['Doku öffnen','Klicke in der grauen Leiste auf „Doku“.',''],['Bereich wählen','Öffne „An- und Abwesenheit“.',''],['Status erfassen','Wähle Zeitraum und passenden Status.','Zeiten und Auswahl vor dem Speichern prüfen.'],['Bestätigen','Schließe den Vorgang über die vorgesehene Bestätigung ab.','']]
    },
    {
      id: 'durchfuehrung', area: 'doku', title: 'Durchführungsnachweis öffnen', icon: '✓', duration: '1 Min.', route: 'Doku → Durchführungsnachweis',
      description: 'Geplante Maßnahmen aufrufen und den aktuellen Dokumentationsstatus prüfen.', keywords: ['durchführungsnachweis', 'durchführung', 'nachweis', 'doku'], visual: 'execution',
      steps: [['Doku öffnen','Öffne den festen Reiter „Doku“.',''],['Nachweis aufrufen','Wähle den „Durchführungsnachweis“.',''],['Eintrag prüfen','Kontrolliere Datum, Maßnahme und bisherigen Status.',''],['Passende Aktion wählen','Dokumentiere nur die Aktion, die tatsächlich stattgefunden hat.','']]
    },
    {
      id: 'durchfuehrung-abweichung', area: 'doku', title: 'Abweichung dokumentieren', icon: '!', duration: '2 Min.', route: 'Doku → Durchführungsnachweis → Rechtsklick → Abweichung dokumentieren',
      description: 'Festhalten, wenn eine geplante Durchführung nicht oder anders als vorgesehen stattgefunden hat.', keywords: ['abweichung', 'nicht stattgefunden', 'anders durchgeführt', 'rechtsklick', 'durchführungsnachweis'], visual: 'execution-deviation',
      steps: [['Nachweis öffnen','Öffne „Doku“ und anschließend den „Durchführungsnachweis“.',''],['Zeile auswählen','Suche die betreffende geplante Durchführung.',''],['Rechtsklick ausführen','Öffne das Kontextmenü und wähle „Abweichung dokumentieren“.',''],['Abweichung beschreiben','Dokumentiere kurz und sachlich, was abweichend war oder weshalb die Durchführung nicht stattfand.','Keine Vermutungen eintragen.'],['Bestätigen','Prüfe den Text und bestätige den Vorgang.','']]
    },
    {
      id: 'durchfuehrung-stornieren', area: 'doku', title: 'Durchführung stornieren', icon: '×', duration: '2 Min.', route: 'Doku → Durchführungsnachweis → Rechtsklick → Durchführung stornieren',
      description: 'Eine bereits falsch dokumentierte Durchführung mit nachvollziehbarer Begründung stornieren.', keywords: ['durchführung stornieren', 'falsch dokumentiert', 'storno', 'rechtsklick'], visual: 'execution-cancel',
      steps: [['Nachweis öffnen','Öffne den Durchführungsnachweis und finde die bereits dokumentierte Durchführung.',''],['Eintrag kontrollieren','Prüfe Datum, Uhrzeit und Maßnahme besonders sorgfältig.',''],['Stornierung wählen','Rechtsklick auf den Eintrag und „Durchführung stornieren“ auswählen.',''],['Grund angeben','Trage ein, warum die Dokumentation storniert werden muss.','Der Grund sollte eine spätere Prüfung ermöglichen.'],['Bestätigen','Schließe die Stornierung über die Bestätigung ab und kontrolliere den Status.','']]
    },
    {
      id: 'visiten', area: 'doku-erweitert', title: 'Visite hinzufügen', icon: 'V', duration: '3 Min.', route: 'Doku erweitert → Visiten → Hinzufügen',
      description: 'Den Bereich Visiten öffnen und einen neuen fiktiven Visitenvorgang erfassen.', keywords: ['visite', 'visiten', 'arzt', 'doku erweitert'], visual: 'visit',
      steps: [['Doku erweitert öffnen','Klicke oben auf „Doku erweitert“.',''],['Visiten wählen','Öffne den Unterpunkt „Visiten“.',''],['Hinzufügen','Starte über die vorgesehene Hinzufügen-Funktion einen neuen Eintrag.',''],['Angaben prüfen','Erfasse die notwendigen Angaben und prüfe den ausgewählten Bewohner.',''],['Bestätigen','Speichere den Vorgang über die vorgesehene Bestätigung.','']]
    },
    {
      id: 'vitalwerte-erweitert', area: 'doku-erweitert', title: 'Vitalwerte über Doku erweitert', icon: '♡', duration: '2 Min.', route: 'Doku erweitert → Vitalwerte',
      description: 'Vitalwerte aufrufen, Verlauf prüfen und einen vorgesehenen Wert erfassen.', keywords: ['vitalwerte', 'blutdruck', 'puls', 'temperatur', 'doku erweitert'], visual: 'vitals',
      steps: [['Doku erweitert öffnen','Öffne „Doku erweitert“.',''],['Vitalwerte wählen','Klicke auf „Vitalwerte“.',''],['Wert auswählen','Wähle die passende Vitalwert-Art.',''],['Verlauf prüfen','Kontrolliere vorhandene Werte und den zeitlichen Verlauf.',''],['Wert erfassen','Nutze die vorgesehene Funktion zum Eintragen und bestätige die Eingabe.','']]
    },
    {
      id: 'medikation', area: 'doku-erweitert', title: 'Medikation ansehen', icon: 'M', duration: '1 Min.', route: 'Doku erweitert → Medikationen',
      description: 'Den Medikationsbereich ausschließlich zur Ansicht öffnen.', keywords: ['medikation', 'medikamente', 'ansehen', 'doku erweitert'], visual: 'medication',
      steps: [['Doku erweitert öffnen','Öffne den Bereich „Doku erweitert“.',''],['Medikationen wählen','Klicke auf „Medikationen“.',''],['Ansicht prüfen','Prüfe, ob die richtige fiktive Person ausgewählt ist.',''],['Informationen lesen','Nutze den Bereich zur vorgesehenen Ansicht.','DokoHilf trifft keine medizinischen Entscheidungen.']]
    },
    {
      id: 'vitalwerte-doku', area: 'doku', title: 'Vitalwerte über Doku öffnen', icon: '♡', duration: '1 Min.', route: 'Doku → Vitalwerte',
      description: 'Der zweite Arbeitsweg zu den Vitalwerten über den Hauptreiter Doku.', keywords: ['vitalwerte doku', 'zweiter weg', 'doku'], visual: 'vitals',
      steps: [['Doku öffnen','Klicke in der grauen Leiste auf „Doku“.',''],['Vitalwerte wählen','Öffne dort „Vitalwerte“.',''],['Wert auswählen','Wähle den benötigten Bereich.',''],['Prüfen oder erfassen','Führe die vorgesehene Ansicht oder Erfassung aus.','']]
    },
    {
      id: 'easyplan', area: 'planung', title: 'EasyPlan öffnen', icon: 'E', duration: '1 Min.', route: 'Planung → EasyPlan',
      description: 'Den häufig verwendeten Planungsbereich direkt aufrufen.', keywords: ['easyplan', 'easy plan', 'planung', 'plan'], visual: 'easyplan',
      steps: [['Planung öffnen','Klicke oben auf „Planung“.',''],['EasyPlan wählen','Öffne den Unterpunkt „EasyPlan“.',''],['Zeitraum prüfen','Kontrolliere den sichtbaren Zeitraum.',''],['Plan lesen','Nutze die freigegebenen Planungsinformationen.','']]
    },
    {
      id: 'aktuelles', area: 'aufgaben', title: 'Aktuelles und Kalender öffnen', icon: 'K', duration: '1 Min.', route: 'Aufgaben → Aktuelles',
      description: 'Den Bereich Aktuelles öffnen; Grundlage für die spätere Kalenderfunktion.', keywords: ['aufgaben', 'aktuelles', 'kalender', 'termine'], visual: 'tasks',
      steps: [['Aufgaben öffnen','Klicke in der grauen Leiste auf „Aufgaben“.',''],['Aktuelles wählen','Öffne den Unterpunkt „Aktuelles“.',''],['Einträge prüfen','Kontrolliere die sichtbaren Aufgaben und Termine.',''],['Kalender nutzen','Nutze die freigegebenen Kalenderfunktionen, sobald sie eingerichtet sind.','']]
    },
    {
      id: 'stammdaten', area: 'bewohner', title: 'Stammdaten per Doppelklick öffnen', icon: '2×', duration: '1 Min.', route: 'Bewohnerliste → Doppelklick auf Bewohner',
      description: 'Die Stammdaten der ausgewählten fiktiven Person direkt aus der Bewohnerliste öffnen.', keywords: ['stammdaten', 'bewohner', 'doppelklick', 'person'], visual: 'resident',
      steps: [['Bewohner finden','Suche die richtige Zeile in der Bewohnerliste.',''],['Auswahl kontrollieren','Prüfe Name und weitere sichtbare Zuordnung im freigegebenen System.',''],['Doppelklick','Führe einen Doppelklick auf die Bewohnerzeile aus.',''],['Stammdaten prüfen','Die Stammdatenansicht öffnet sich. Nutze nur die freigegebenen Bereiche.','']]
    },
    {
      id: 'uebergabe', area: 'analyse', title: 'Übergabeformular öffnen', icon: 'Ü', duration: '2 Min.', route: 'Analyse → Was war los → Übergabeformular',
      description: 'Die Übergabe über den Analysebereich aufrufen.', keywords: ['übergabe', 'übergabeformular', 'was war los', 'analyse'], visual: 'handover',
      steps: [['Analyse öffnen','Klicke oben auf „Analyse“.',''],['Was war los wählen','Öffne den Bereich „Was war los“.',''],['Übergabeformular öffnen','Wähle das Übergabeformular aus.',''],['Zeitraum prüfen','Kontrolliere Zeitraum und ausgewählten Bereich.',''],['Übergabe lesen','Lies die freigegebenen Übergabeinformationen.','']]
    },
    {
      id: 'abfrage', area: 'analyse', title: 'Berichtseintrag gezielt suchen', icon: '⌕', duration: '3 Min.', route: 'Analyse → Abfrage → Filter setzen',
      description: 'Mit der Abfrage gezielt Berichtseinträge nach Person, Zeitraum oder weiteren Kriterien suchen.', keywords: ['abfrage', 'bericht suchen', 'bericht finden', 'bewohner suchen', 'analyse', 'filter'], visual: 'query',
      steps: [['Analyse öffnen','Öffne den Reiter „Analyse“.',''],['Abfrage wählen','Starte die vorgesehene Abfrage.',''],['Filter setzen','Wähle nur die benötigten Kriterien, zum Beispiel fiktive Person und Zeitraum.','Je enger die Filter, desto übersichtlicher das Ergebnis.'],['Abfrage starten','Führe die Suche aus.',''],['Ergebnis prüfen','Kontrolliere, ob Zeitraum und Person zum gesuchten Eintrag passen.','']]
    }
  ];

  const QUICK_GUIDES = ['bericht-neu','bericht-durchstreichen','durchfuehrung','visiten','vitalwerte-erweitert','easyplan'];

  function loadFavorites() {
    try { return new Set(JSON.parse(window.localStorage.getItem('dokohilf-favorites') || '[]')); }
    catch (error) { return new Set(); }
  }

  function saveFavorites() {
    try { window.localStorage.setItem('dokohilf-favorites', JSON.stringify([...state.favorites])); }
    catch (error) { /* storage can be unavailable in restricted browser modes */ }
  }

  const state = {
    area: 'berichte',
    query: '',
    viewMode: 'list',
    activeGuide: null,
    step: 0,
    favorites: loadFavorites(),
    recognition: null,
    voiceTriggered: false,
    speaking: false
  };

  const els = {
    guideList: document.getElementById('guideList'),
    areaNavigation: document.getElementById('areaNavigation'),
    moduleTabs: document.getElementById('moduleTabs'),
    browserEyebrow: document.getElementById('browserEyebrow'),
    resultSummary: document.getElementById('resultSummary'),
    searchInput: document.getElementById('searchInput'),
    globalSearch: document.getElementById('globalSearch'),
    quickActions: document.getElementById('quickActions'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    drawerPath: document.getElementById('drawerPath'),
    drawerArea: document.getElementById('drawerArea'),
    drawerTitle: document.getElementById('drawerTitle'),
    drawerDescription: document.getElementById('drawerDescription'),
    drawerMeta: document.getElementById('drawerMeta'),
    drawerRoute: document.getElementById('drawerRoute'),
    stepNavigation: document.getElementById('stepNavigation'),
    schematicStage: document.getElementById('schematicStage'),
    stepCounter: document.getElementById('stepCounter'),
    stepTitle: document.getElementById('stepTitle'),
    stepText: document.getElementById('stepText'),
    stepNote: document.getElementById('stepNote'),
    previousStepButton: document.getElementById('previousStepButton'),
    nextStepButton: document.getElementById('nextStepButton'),
    favoriteGuideButton: document.getElementById('favoriteGuideButton'),
    speakGuideButton: document.getElementById('speakGuideButton'),
    voicePanel: document.getElementById('voicePanel'),
    voiceStatus: document.getElementById('voiceStatus'),
    voiceTranscript: document.getElementById('voiceTranscript'),
    voiceButton: document.getElementById('voiceButton'),
    toast: document.getElementById('toast')
  };

  function normalize(value) {
    return value.toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9+]+/g, ' ').trim();
  }

  function areaById(id) { return AREAS.find(area => area.id === id); }
  function guideById(id) { return GUIDES.find(guide => guide.id === id); }

  function renderAreas() {
    els.areaNavigation.innerHTML = AREAS.map(area => `
      <button class="area-link ${state.area === area.id ? 'active' : ''}" data-area="${area.id}">
        <span class="area-icon">${area.icon}</span>
        <span><b>${area.label}</b><small>${area.description}</small></span>
      </button>`).join('');
    [...els.moduleTabs.querySelectorAll('[data-area]')].forEach(button => button.classList.toggle('active', button.dataset.area === state.area));
  }

  function filteredGuides() {
    const q = normalize(state.query);
    if (q) {
      return GUIDES.map(guide => {
        const haystack = normalize([guide.title, guide.description, guide.route, guide.area, ...guide.keywords].join(' '));
        const terms = q.split(' ').filter(Boolean);
        const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 2 : 0) + (normalize(guide.title).includes(term) ? 3 : 0), 0);
        return { guide, score };
      }).filter(item => item.score > 0).sort((a,b) => b.score - a.score).map(item => item.guide);
    }
    if (state.area === 'all') return GUIDES;
    if (state.area === 'favorites') return GUIDES.filter(guide => state.favorites.has(guide.id));
    return GUIDES.filter(guide => guide.area === state.area);
  }

  function renderGuides() {
    const guides = filteredGuides();
    const currentArea = areaById(state.area);
    els.browserEyebrow.textContent = state.query ? 'Suchergebnis' : state.area === 'all' ? 'Alle Bereiche' : state.area === 'favorites' ? 'Merkliste' : currentArea?.label || 'Anleitungen';
    els.resultSummary.textContent = state.query ? `${guides.length} passende Anleitung${guides.length === 1 ? '' : 'en'} für „${state.query}“.` : state.area === 'favorites' ? 'Deine gemerkten Arbeitswege auf diesem Gerät.' : currentArea ? currentArea.description : 'Alle verfügbaren Arbeitswege.';
    els.guideList.className = `guide-list ${state.viewMode === 'compact' ? 'compact' : ''}`;
    if (!guides.length) {
      els.guideList.innerHTML = `<div style="padding:45px 10px;text-align:center;color:#6f7d77"><h3>Nichts Passendes gefunden</h3><p>Versuche einen allgemeineren Begriff, zum Beispiel „Bericht“, „Vitalwerte“ oder „Durchführung“.</p></div>`;
      return;
    }
    els.guideList.innerHTML = guides.map(guide => `
      <article class="guide-row" data-open-guide="${guide.id}" tabindex="0">
        <div class="guide-row-icon">${guide.icon}</div>
        <div>
          <h3>${guide.title}</h3>
          <p>${guide.description}</p>
          <div class="guide-row-meta"><span>${guide.duration}</span><span class="route-mini">${guide.route}</span>${state.favorites.has(guide.id) ? '<span>★ gemerkt</span>' : ''}</div>
        </div>
        <button class="guide-open" type="button" aria-label="${guide.title} öffnen">→</button>
      </article>`).join('');
  }

  function renderQuickActions() {
    els.quickActions.innerHTML = QUICK_GUIDES.map(id => {
      const guide = guideById(id);
      return `<button class="quick-chip" type="button" data-open-guide="${guide.id}"><span>${guide.icon}</span>${guide.title}</button>`;
    }).join('');
  }

  function setArea(area) {
    state.area = area;
    state.query = '';
    els.searchInput.value = '';
    renderAreas();
    renderGuides();
    document.querySelector('.workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function search(query, fromVoice = false) {
    state.query = query.trim();
    els.searchInput.value = state.query;
    renderGuides();
    document.querySelector('.workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const matches = filteredGuides();
    if (fromVoice && matches[0]) {
      openGuide(matches[0].id);
      speak(`Ich habe die Anleitung ${matches[0].title} geöffnet.`);
    } else if (fromVoice && !matches.length) {
      speak('Dazu habe ich noch keine passende Anleitung gefunden.');
    }
  }

  function openGuide(id) {
    const guide = guideById(id);
    if (!guide) return;
    state.activeGuide = guide;
    state.step = 0;
    els.drawerBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    els.drawerPath.textContent = guide.route;
    els.drawerArea.textContent = areaById(guide.area)?.label || '';
    els.drawerTitle.textContent = guide.title;
    els.drawerDescription.textContent = guide.description;
    els.drawerRoute.textContent = guide.route;
    els.drawerMeta.innerHTML = `<span>${guide.duration}</span><span>${guide.steps.length} Schritte</span><span>Schematische Demo</span>`;
    updateFavoriteButton();
    renderStep();
    setTimeout(() => document.getElementById('closeDrawerButton').focus(), 50);
  }

  function closeGuide() {
    stopSpeaking();
    els.drawerBackdrop.hidden = true;
    document.body.style.overflow = '';
    state.activeGuide = null;
  }

  function renderStep() {
    const guide = state.activeGuide;
    if (!guide) return;
    els.stepNavigation.innerHTML = guide.steps.map((step, index) => `<button class="step-nav-button ${index === state.step ? 'active' : ''}" type="button" data-step="${index}"><span class="step-number">${index + 1}</span><span>${step[0]}</span></button>`).join('');
    const [title, text, note] = guide.steps[state.step];
    els.stepCounter.textContent = `Schritt ${state.step + 1} von ${guide.steps.length}`;
    els.stepTitle.textContent = title;
    els.stepText.textContent = text;
    els.stepNote.textContent = note || '';
    els.previousStepButton.disabled = state.step === 0;
    els.previousStepButton.style.opacity = state.step === 0 ? '.45' : '1';
    els.nextStepButton.textContent = state.step === guide.steps.length - 1 ? 'Fertig ✓' : 'Weiter →';
    els.schematicStage.innerHTML = renderSchematic(guide.visual, state.step);
  }

  function renderSchematic(type, step) {
    const tabs = (active) => `<div class="demo-top"><span class="${active === 'Berichte' ? 'active' : ''}">Berichte</span><span class="${active === 'Doku' ? 'active' : ''}">Doku</span><span class="${active === 'Doku erweitert' ? 'active' : ''}">Doku erweitert</span><span class="${active === 'Planung' ? 'active' : ''}">Planung</span><span class="${active === 'Aufgaben' ? 'active' : ''}">Aufgaben</span><span class="${active === 'Analyse' ? 'active' : ''}">Analyse</span></div>`;
    const reportModal = `<div class="demo-modal"><div class="demo-modal-header">Neuer Berichtseintrag</div><div class="demo-form"><div class="demo-field"><label>Datum / Uhrzeit</label><b>05.08.2026 · 15:40</b></div><div class="demo-field"><label>Kategorie</label><b>Allgemeiner Bericht ▾</b></div><div class="demo-field full"><label>Wichtig für Schichtübergabe</label><div class="demo-radio"><span class="selected">Ja</span><span>Nein</span></div></div><div class="demo-field full"><label>Inhalt</label><b>Fiktiver Übungstext ohne Personenbezug …</b></div></div><div class="demo-modal-footer"><button class="demo-gray">Abbrechen</button><button class="demo-green">OK</button></div></div>`;
    if (type === 'report-new') {
      if (step === 0) return `<div class="demo-ui">${tabs('Berichte')}<div class="demo-content"><div class="demo-toolbar"><button class="demo-green">＋</button><button class="demo-gray">Aktualisieren</button></div><div class="demo-row"><strong>Allgemeiner Bericht</strong><small>Fiktiver Demo-Eintrag</small></div><div class="demo-callout" data-step="1" style="left:18px;top:52px">Berichte ist geöffnet</div></div></div>`;
      if (step === 1) return `<div class="demo-ui">${tabs('Berichte')}<div class="demo-content"><div class="demo-toolbar"><button class="demo-green">＋</button><button class="demo-gray">Aktualisieren</button></div><div class="demo-context" style="left:17px;top:55px"><button class="selected">Neuer Berichtseintrag</button><button>Weitere Aktion</button></div><div class="demo-callout" data-step="2" style="left:155px;top:58px">Grünes Plus → neuer Eintrag</div></div></div>`;
      return `<div class="demo-ui">${tabs('Berichte')}<div class="demo-content">${reportModal}<div class="demo-callout" data-step="${Math.min(step+1,4)}" style="right:12px;top:12px">${step === 2 ? 'Zeit und Kategorie' : step === 3 ? 'Übergabe Ja oder Nein' : 'Text prüfen und OK'}</div></div></div>`;
    }
    if (type === 'report-strike') {
      if (step < 2) return `<div class="demo-ui">${tabs('Berichte')}<div class="demo-content"><div class="demo-row"><strong>Allgemeiner Bericht</strong><small>Fiktiver korrekter Eintrag</small></div><div class="demo-row target"><strong>Eintrag mit Tippfehler</strong><small>Rechtsklick auf genau diese Zeile</small></div>${step === 1 ? '<div class="demo-context" style="right:55px;top:100px"><button class="selected">Eintrag bearbeiten</button><button>Weitere Aktion</button></div>' : ''}</div></div>`;
      if (step === 2) return `<div class="demo-ui">${tabs('Berichte')}<div class="demo-content"><div class="demo-modal"><div class="demo-modal-header">Eintrag bearbeiten</div><div class="demo-form"><div class="demo-field full"><label>Bearbeitung</label><b>◉ Durchstreichen</b></div></div><div class="demo-modal-footer"><button class="demo-green">Weiter</button></div></div></div></div>`;
      return `<div class="demo-ui">${tabs('Berichte')}<div class="demo-content"><div class="demo-modal"><div class="demo-modal-header">Durchstreichen</div><div class="demo-form"><div class="demo-field full"><label>Begründung</label><b>Fiktive Begründung für die Korrektur …</b></div></div><div class="demo-modal-footer"><button class="demo-gray">Abbrechen</button><button class="demo-green">OK</button></div></div><div class="demo-row" style="margin-top:12px"><strong class="strike-line">Eintrag mit Tippfehler</strong><small>bleibt nachvollziehbar sichtbar</small></div></div></div>`;
    }
    if (type === 'execution' || type === 'execution-deviation' || type === 'execution-cancel') {
      const context = type === 'execution-deviation' ? '<div class="demo-context" style="right:35px;top:89px"><button class="selected">Abweichung dokumentieren</button><button>Durchführung stornieren</button></div>' : type === 'execution-cancel' ? '<div class="demo-context" style="right:35px;top:89px"><button>Abweichung dokumentieren</button><button class="selected">Durchführung stornieren</button></div>' : '';
      if ((type !== 'execution' && step >= 3)) return `<div class="demo-ui">${tabs('Doku')}<div class="demo-content"><div class="demo-modal"><div class="demo-modal-header">${type === 'execution-cancel' ? 'Durchführung stornieren' : 'Abweichung dokumentieren'}</div><div class="demo-form"><div class="demo-field full"><label>${type === 'execution-cancel' ? 'Grund der Stornierung' : 'Beschreibung der Abweichung'}</label><b>Fiktive, sachliche Begründung …</b></div></div><div class="demo-modal-footer"><button class="demo-gray">Abbrechen</button><button class="demo-green">OK</button></div></div></div></div>`;
      return `<div class="demo-ui">${tabs('Doku')}<div class="demo-content"><div class="demo-toolbar"><button class="demo-gray">An- und Abwesenheit</button><button class="demo-green">Durchführungsnachweis</button><button class="demo-gray">Vitalwerte</button></div><div class="demo-row"><strong>Geplante Durchführung · 08:00</strong><small>Status: offen</small></div><div class="demo-row target"><strong>Dokumentierte Durchführung · 12:00</strong><small>Rechtsklick für weitere Aktionen</small></div>${(step >= 2 || type === 'execution') ? context : ''}</div></div>`;
    }
    if (type === 'vitals') return `<div class="demo-ui">${tabs('Doku erweitert')}<div class="demo-content"><div class="demo-toolbar"><button class="demo-green">Vitalwerte</button><button class="demo-gray">Neuer Wert</button></div><div class="demo-chart"><span style="height:42%"></span><span style="height:58%"></span><span class="warn" style="height:84%"></span><span style="height:61%"></span><span style="height:53%"></span></div><div class="demo-callout" data-step="${Math.min(step+1,4)}" style="right:20px;top:20px">Verlauf und Eingabe</div></div></div>`;
    if (type === 'easyplan' || type === 'tasks') return `<div class="demo-ui">${tabs(type === 'easyplan' ? 'Planung' : 'Aufgaben')}<div class="demo-content"><div class="demo-toolbar"><button class="demo-green">${type === 'easyplan' ? 'EasyPlan' : 'Aktuelles'}</button><button class="demo-gray">Woche</button></div><div class="demo-calendar"><div>Zeit</div><div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>08:00</div><div class="event">Demo-Termin</div><div></div><div class="event">Aufgabe</div><div></div><div></div><div>12:00</div><div></div><div class="event">Planung</div><div></div><div class="event">Aktuelles</div><div></div></div></div></div>`;
    if (type === 'query' || type === 'handover') return `<div class="demo-ui">${tabs('Analyse')}<div class="demo-content"><div class="demo-toolbar"><button class="demo-green">${type === 'handover' ? 'Was war los' : 'Abfrage'}</button></div><div class="demo-modal"><div class="demo-modal-header">${type === 'handover' ? 'Übergabeformular' : 'Berichtseinträge suchen'}</div><div class="demo-form"><div class="demo-field"><label>Demo-Person</label><b>Bewohner Demo 01</b></div><div class="demo-field"><label>Zeitraum</label><b>Heute</b></div><div class="demo-field full"><label>${type === 'handover' ? 'Ansicht' : 'Kategorie / Suchwort'}</label><b>${type === 'handover' ? 'Übergaberelevante Einträge' : 'Allgemeiner Bericht'}</b></div></div><div class="demo-modal-footer"><button class="demo-green">${type === 'handover' ? 'Öffnen' : 'Abfrage starten'}</button></div></div></div></div>`;
    if (type === 'resident') return `<div class="demo-ui">${tabs('')}<div class="demo-content"><div class="demo-row"><strong>Bewohner Demo 01</strong><small>Doppelklick auf die Zeile</small></div><div class="demo-row"><strong>Bewohner Demo 02</strong><small>Fiktiver Übungsdatensatz</small></div><div class="demo-callout" data-step="2" style="right:25px;top:25px">Doppelklick öffnet Stammdaten</div></div></div>`;
    if (type === 'attendance') return `<div class="demo-ui">${tabs('Doku')}<div class="demo-content"><div class="demo-toolbar"><button class="demo-green">An- und Abwesenheit</button></div><div class="demo-modal"><div class="demo-modal-header">Status erfassen</div><div class="demo-form"><div class="demo-field"><label>Von</label><b>05.08. · 08:00</b></div><div class="demo-field"><label>Bis</label><b>05.08. · 16:00</b></div><div class="demo-field full"><label>Status</label><b>Anwesend ▾</b></div></div><div class="demo-modal-footer"><button class="demo-green">OK</button></div></div></div></div>`;
    if (type === 'visit') return `<div class="demo-ui">${tabs('Doku erweitert')}<div class="demo-content"><div class="demo-toolbar"><button class="demo-green">Visiten</button><button class="demo-gray">＋ Hinzufügen</button></div><div class="demo-row"><strong>Fiktive Visite · Heute</strong><small>Demo-Eintrag ohne Echtdaten</small></div></div></div>`;
    if (type === 'medication') return `<div class="demo-ui">${tabs('Doku erweitert')}<div class="demo-content"><div class="demo-toolbar"><button class="demo-green">Medikationen</button></div><div class="demo-row"><strong>Nur Ansicht · öffentliche Demo</strong><small>Keine echten Präparate oder Dosierungen</small></div><div class="demo-row"><strong>Medikation A</strong><small>Fiktiver Platzhalter</small></div></div></div>`;
    return `<div class="demo-ui">${tabs('')}<div class="demo-content"><div class="demo-row"><strong>Schematische Bedienoberfläche</strong><small>Schritt ${step + 1}</small></div></div></div>`;
  }

  function updateFavoriteButton() {
    if (!state.activeGuide) return;
    const active = state.favorites.has(state.activeGuide.id);
    els.favoriteGuideButton.textContent = active ? '♥' : '♡';
    els.favoriteGuideButton.setAttribute('aria-label', active ? 'Aus Merkliste entfernen' : 'Anleitung merken');
  }

  function toggleFavorite() {
    const guide = state.activeGuide;
    if (!guide) return;
    if (state.favorites.has(guide.id)) state.favorites.delete(guide.id); else state.favorites.add(guide.id);
    saveFavorites();
    updateFavoriteButton();
    renderGuides();
    toast(state.favorites.has(guide.id) ? 'Zur Merkliste hinzugefügt' : 'Aus der Merkliste entfernt');
  }

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => els.toast.classList.remove('show'), 2200);
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) { toast('Vorlesen wird von diesem Browser nicht unterstützt.'); return; }
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = .95;
    utterance.onend = () => { state.speaking = false; els.speakGuideButton.innerHTML = '<span aria-hidden="true">◖</span> Vorlesen'; };
    state.speaking = true;
    els.speakGuideButton.innerHTML = '<span aria-hidden="true">■</span> Stoppen';
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    state.speaking = false;
    if (els.speakGuideButton) els.speakGuideButton.innerHTML = '<span aria-hidden="true">◖</span> Vorlesen';
  }

  function speakActiveGuide() {
    if (state.speaking) { stopSpeaking(); return; }
    const guide = state.activeGuide;
    if (!guide) return;
    const step = guide.steps[state.step];
    speak(`${guide.title}. ${els.stepCounter.textContent}. ${step[0]}. ${step[1]} ${step[2] || ''}`);
  }

  function setupRecognition() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return null;
    const recognition = new Recognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      els.voicePanel.hidden = false;
      els.voiceStatus.textContent = 'Sag, was du erledigen möchtest.';
      els.voiceTranscript.textContent = '…';
      els.voiceButton.classList.add('listening');
      els.voiceButton.setAttribute('aria-pressed', 'true');
    };
    recognition.onresult = event => {
      let transcript = '';
      let final = false;
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) final = true;
      }
      els.voiceTranscript.textContent = transcript || '…';
      if (final) {
        state.voiceTriggered = true;
        setTimeout(() => {
          stopRecognition();
          search(transcript, true);
        }, 350);
      }
    };
    recognition.onerror = event => {
      const messages = { 'not-allowed':'Mikrofonzugriff wurde nicht erlaubt.', 'no-speech':'Ich habe keine Sprache erkannt.', 'audio-capture':'Kein Mikrofon verfügbar.', 'network':'Die Spracherkennung konnte den Dienst nicht erreichen.' };
      els.voiceStatus.textContent = messages[event.error] || 'Die Spracherkennung ist gerade nicht verfügbar.';
      toast(els.voiceStatus.textContent);
    };
    recognition.onend = () => {
      els.voiceButton.classList.remove('listening');
      els.voiceButton.setAttribute('aria-pressed', 'false');
      if (!state.voiceTriggered) setTimeout(() => { els.voicePanel.hidden = true; }, 800);
      state.voiceTriggered = false;
    };
    return recognition;
  }

  function startRecognition() {
    if (!state.recognition) state.recognition = setupRecognition();
    if (!state.recognition) {
      toast('Sprachsuche wird von diesem Browser nicht unterstützt. Tippe deine Frage ein.');
      return;
    }
    try { state.recognition.start(); } catch (error) { /* already running */ }
  }

  function stopRecognition() {
    try { state.recognition?.stop(); } catch (error) { /* no active session */ }
    els.voicePanel.hidden = true;
    els.voiceButton.classList.remove('listening');
    els.voiceButton.setAttribute('aria-pressed', 'false');
  }

  document.addEventListener('click', event => {
    const areaButton = event.target.closest('[data-area]');
    if (areaButton) setArea(areaButton.dataset.area);
    const guideButton = event.target.closest('[data-open-guide]');
    if (guideButton) openGuide(guideButton.dataset.openGuide);
    const stepButton = event.target.closest('[data-step]');
    if (stepButton && state.activeGuide) { state.step = Number(stepButton.dataset.step); renderStep(); }
    const viewButton = event.target.closest('[data-view-mode]');
    if (viewButton) {
      state.viewMode = viewButton.dataset.viewMode;
      document.querySelectorAll('[data-view-mode]').forEach(button => button.classList.toggle('active', button === viewButton));
      renderGuides();
    }
  });

  document.addEventListener('keydown', event => {
    const guideRow = event.target.closest?.('.guide-row');
    if (guideRow && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openGuide(guideRow.dataset.openGuide); }
    if (event.key === 'Escape') { if (!els.voicePanel.hidden) stopRecognition(); else if (!els.drawerBackdrop.hidden) closeGuide(); }
  });

  els.globalSearch.addEventListener('submit', event => { event.preventDefault(); search(els.searchInput.value); });
  els.searchInput.addEventListener('input', () => { state.query = els.searchInput.value; renderGuides(); });
  els.voiceButton.addEventListener('click', startRecognition);
  document.getElementById('startVoiceHero').addEventListener('click', startRecognition);
  document.getElementById('voiceCardButton').addEventListener('click', startRecognition);
  document.getElementById('voiceCloseButton').addEventListener('click', stopRecognition);
  document.getElementById('stopVoiceButton').addEventListener('click', stopRecognition);
  document.getElementById('closeDrawerButton').addEventListener('click', closeGuide);
  els.drawerBackdrop.addEventListener('click', event => { if (event.target === els.drawerBackdrop) closeGuide(); });
  els.previousStepButton.addEventListener('click', () => { if (state.step > 0) { state.step -= 1; renderStep(); } });
  els.nextStepButton.addEventListener('click', () => {
    if (!state.activeGuide) return;
    if (state.step < state.activeGuide.steps.length - 1) { state.step += 1; renderStep(); }
    else { toast('Anleitung abgeschlossen'); closeGuide(); }
  });
  els.favoriteGuideButton.addEventListener('click', toggleFavorite);
  els.speakGuideButton.addEventListener('click', speakActiveGuide);
  document.getElementById('showAllButton').addEventListener('click', () => setArea('all'));
  document.getElementById('favoritesButton').addEventListener('click', () => setArea('favorites'));

  renderAreas();
  renderQuickActions();
  renderGuides();
})();
