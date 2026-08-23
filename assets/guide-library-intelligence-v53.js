(() => {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const REVISION = '20260823-guide-library-intelligence-v53-1';
  const AI_MARKERS = [
    '/functions/v1/dokohilf-ai',
    '/functions/v1/dokohilf-ai-router',
    '/functions/v1/dokohilf-conversation-router',
    '/functions/v1/dokohilf-chat-router',
  ];

  const REGISTRY = Object.freeze({
    'bericht-neu': Object.freeze({
      stepGuideSlug: 'bericht-neu',
      startLabel: 'Bericht anlegen',
      directTitles: Object.freeze(['Bericht anlegen']),
      searchTerms: Object.freeze([
        'neuer bericht', 'bericht schreiben', 'bericht verfassen', 'berichtseintrag verfassen', 'bericht anlegen',
        'neuen berichtseintrag', 'bericht erfassen', 'dokumentation schreiben', 'doku schreiben', 'eintrag machen',
        'etwas dokumentieren', 'pflegebericht schreiben',
      ]),
    }),
    'bericht-durchstreichen': Object.freeze({
      stepGuideSlug: 'bericht-durchstreichen',
      startLabel: 'Bericht korrigieren',
      directTitles: Object.freeze(['Bericht korrigieren']),
      searchTerms: Object.freeze([
        'bericht berichtigen', 'bericht durchstreichen', 'bericht entfernen', 'bericht falsch geschrieben', 'bericht korrigieren',
        'bericht löschen', 'bericht rückgängig machen', 'bericht stornieren', 'berichtseintrag durchstreichen',
        'berichtstext korrigieren', 'eintrag korrigieren', 'falschen bericht wegmachen', 'falscher bericht',
        'fehler im bericht', 'ich habe mich in einem bericht verschrieben', 'im bericht verschrieben',
        'in einem bericht verschrieben', 'schreibfehler im bericht',
      ]),
    }),
    'bericht-folgebericht': Object.freeze({
      stepGuideSlug: 'bericht-folgebericht',
      startLabel: 'Folgebericht erstellen',
      directTitles: Object.freeze(['Folgebericht erstellen']),
      searchTerms: Object.freeze([
        'folgebericht', 'folgebericht erstellen', 'bericht fortsetzen', 'zu bericht weiteren bericht schreiben',
        'anschlussbericht', 'bericht weiterführen',
      ]),
    }),
    'visite-anlegen': Object.freeze({
      stepGuideSlug: 'visite-anlegen',
      startLabel: 'Visite anlegen',
      directTitles: Object.freeze(['Visite anlegen']),
      searchTerms: Object.freeze([
        'visite anlegen', 'visite dokumentieren', 'sprechstunde dokumentieren', 'arztvisite eintragen',
        'sprechstunde eintragen', 'neue visite', 'visite durchführen', 'visite durchgeführt',
      ]),
    }),
    'visiten-oeffnen': Object.freeze({
      stepGuideSlug: 'visiten-oeffnen',
      startLabel: 'Visiten öffnen',
      directTitles: Object.freeze(['Visiten öffnen']),
      searchTerms: Object.freeze([
        'visiten', 'visite öffnen', 'visiten öffnen', 'visiten ansehen', 'wo sind die visiten', 'arztvisiten ansehen',
        'wo ist visiten', 'wo finde ich visiten', 'ich finde visiten nicht', 'visiten finden',
      ]),
    }),
    'visite-status-durchgefuehrt': Object.freeze({
      stepGuideSlug: 'visite-status-durchgefuehrt',
      startLabel: 'Visitenstatus',
      directTitles: Object.freeze(['Visitenstatus richtig setzen']),
      searchTerms: Object.freeze([
        'visite durchgeführt', 'visite auf durchgeführt stellen', 'visite als durchgeführt markieren', 'visite abschließen',
        'visite beenden', 'visite fertig', 'status der visite', 'visitenstatus', 'wie schließe ich eine visite ab',
        'wie schliesse ich eine visite ab', 'schließe visite ab', 'schliesse visite ab', 'visite abschliessen',
      ]),
    }),
    vitalwerte: Object.freeze({
      stepGuideSlug: 'vitalwerte-erfassen',
      startLabel: 'Vitalwerte erfassen',
      directTitles: Object.freeze(['Vitalwerte erfassen']),
      searchTerms: Object.freeze([
        'vitalwerte erfassen', 'vitalwerte eingeben', 'vitalwerte eintragen', 'vitalwerte dokumentieren', 'neue vitalwerte',
        'vitalwerte anlegen', 'atemalkohol eingeben', 'atemalkohol erfassen', 'atemfrequenz eingeben',
        'atemfrequenz erfassen', 'blutdruck eingeben', 'blutzucker eingeben', 'einen vitalwert eingeben',
        'einzelnen vitalwert erfassen', 'gewicht eingeben', 'puls eingeben', 'sauerstoffsättigung eingeben',
        'temperatur eingeben', 'sammelerfassung vitalwerte', 'mehrere vitalwerte eingeben', 'mehrere vitalwerte erfassen',
        'vitalwerte gleichzeitig eingeben', 'vitalwerte sammelerfassung', 'vitalwerte sammel erfassung',
      ]),
    }),
    'vitalwerte-einzelwert': Object.freeze({
      stepGuideSlug: 'vitalwerte-einzelwert',
      startLabel: 'Einzelnen Vitalwert erfassen',
      directTitles: Object.freeze(['Einzelnen Vitalwert erfassen']),
      searchTerms: Object.freeze([]),
    }),
    'vitalwerte-sammelerfassung': Object.freeze({
      stepGuideSlug: 'vitalwerte-sammelerfassung',
      startLabel: 'Mehrere Vitalwerte erfassen',
      directTitles: Object.freeze(['Mehrere Vitalwerte erfassen']),
      searchTerms: Object.freeze([]),
    }),
    anwesenheit: Object.freeze({
      stepGuideSlug: 'anwesenheit',
      startLabel: 'An-/Abwesenheit',
      directTitles: Object.freeze(['An-/Abwesenheit']),
      searchTerms: Object.freeze([
        'anwesenheit', 'abwesenheit', 'an und abwesenheit', 'an- und abwesenheit', 'anwesenheit eintragen',
        'abwesenheit eintragen', 'status erfassen', 'krankenhaus abwesenheit',
      ]),
    }),
    'medikation-ansehen': Object.freeze({
      stepGuideSlug: 'medikation-ansehen',
      startLabel: 'Medikation ansehen',
      directTitles: Object.freeze(['Medikation ansehen']),
      searchTerms: Object.freeze([
        'medikation ansehen', 'medikamente anschauen', 'medikationsplan öffnen', 'medikamente ansehen',
        'wo ist die medikation', 'wo ist medikation', 'wo finde ich medikation', 'ich finde medikation nicht',
        'medikation finden',
      ]),
    }),
    'formulare-anlegen': Object.freeze({
      stepGuideSlug: 'formulare-anlegen',
      startLabel: 'Formular anlegen',
      directTitles: Object.freeze(['Formular anlegen']),
      searchTerms: Object.freeze([
        'formular anlegen', 'formulare', 'neues formular', 'anfallsprotokoll', 'fallgespräch', 'gesprächsprotokoll',
        'sturzprotokoll', 'formular erstellen', 'wo ist formulare', 'wo finde ich formulare',
        'ich finde formulare nicht', 'formulare finden',
      ]),
    }),
    uebergabeformular: Object.freeze({
      stepGuideSlug: 'uebergabeformular',
      startLabel: 'Übergabe anzeigen',
      directTitles: Object.freeze(['Übergabe anzeigen']),
      searchTerms: Object.freeze([
        'übergabe', 'was war los', 'übergabe öffnen', 'schichtübergabe', 'übergabe ansehen', 'übergabe finden',
        'alle ausklappen', 'wo ist übergabe', 'wo finde ich übergabe', 'ich finde übergabe nicht',
        'wo ist was war los', 'was war los finden',
      ]),
    }),
    notfallblatt: Object.freeze({
      stepGuideSlug: 'notfallblatt',
      startLabel: 'Notfallblatt öffnen',
      directTitles: Object.freeze(['Notfallblatt öffnen']),
      searchTerms: Object.freeze([
        'notfallblatt', 'notfallblatt öffnen', 'notfallblatt ausdrucken', 'notfallblatt drucken', 'rotes kreuz',
        'notfallblatt aufrufen', 'wo ist notfallblatt', 'wo finde ich notfallblatt', 'ich finde notfallblatt nicht',
        'notfallblatt finden',
      ]),
    }),
    'durchfuehrung-storno': Object.freeze({
      stepGuideSlug: 'durchfuehrung-storno',
      startLabel: 'Durchführung stornieren',
      directTitles: Object.freeze(['Durchführung stornieren']),
      searchTerms: Object.freeze([
        'durchführung stornieren', 'durchführungsnachweis stornieren', 'falsch abgezeichnet',
        'falsch abgezeichnete durchführung', 'nachweis rückgängig machen', 'maßnahme stornieren',
        'falschen nachweis entfernen',
      ]),
    }),
    'durchfuehrungsnachweis-oeffnen': Object.freeze({
      stepGuideSlug: 'durchfuehrungsnachweis-finden',
      startLabel: 'Durchführungsnachweis öffnen',
      directTitles: Object.freeze(['Durchführungsnachweis öffnen']),
      searchTerms: Object.freeze([
        'durchführungsnachweis', 'nachweise öffnen', 'durchführung ansehen', 'maßnahmen ansehen',
        'durchführungsnachweis finden', 'wo finde ich durchführungsnachweis', 'wo ist durchführungsnachweis',
        'ich finde durchführungsnachweis nicht', 'abzeichnen', 'etwas abzeichnen', 'durchführung abzeichnen',
        'ich möchte etwas abzeichnen', 'ich muss medikamente abzeichnen', 'maßnahme abzeichnen',
        'medikamente abzeichnen', 'medikation abzeichnen',
      ]),
    }),
    stammdaten: Object.freeze({
      stepGuideSlug: 'stammdaten',
      startLabel: 'Stammdaten öffnen',
      directTitles: Object.freeze(['Stammdaten öffnen']),
      searchTerms: Object.freeze([
        'stammdaten', 'bewohner öffnen', 'doppelklick bewohner', 'personenstammdaten', 'bewohnerdaten ansehen',
        'stammdaten ansehen', 'wo ist stammdaten', 'wo finde ich stammdaten', 'ich finde stammdaten nicht',
        'stammdaten finden', 'wo ist bewohnerübersicht',
      ]),
    }),
    'bedarfsmedikation-gabe': Object.freeze({
      stepGuideSlug: 'bedarfsmedikation-gabe',
      startLabel: 'Bedarfsmedikation dokumentieren',
      directTitles: Object.freeze(['Bedarfsmedikation dokumentieren']),
      searchTerms: Object.freeze([
        'bedarfsmedikation dokumentieren', 'bedarfsmedikation geben', 'bedarf geben', 'bedarfsgabe dokumentieren',
        'bedarfsmedikament dokumentieren', 'bedarfsmedikament geben', 'medikament bei bedarf dokumentieren',
      ]),
    }),
    'bedarfsmedikation-wirksamkeitskontrolle': Object.freeze({
      stepGuideSlug: 'bedarfsmedikation-wirksamkeitskontrolle',
      startLabel: 'Wirksamkeitskontrolle dokumentieren',
      directTitles: Object.freeze(['Wirksamkeitskontrolle dokumentieren']),
      searchTerms: Object.freeze([
        'wirksamkeitskontrolle', 'wirksamkeitskontrolle bedarfsmedikation', 'wirksamkeit bedarfsmedikation dokumentieren',
        'bedarf wirksamkeit dokumentieren', 'hat bedarfsmedikation geholfen dokumentieren', 'wirksamkeitskontrolle abhaken',
        'wo muss ich die wirksamkeitskontrolle abhaken',
      ]),
    }),
    'massnahmen-ohne-zeitangabe': Object.freeze({
      stepGuideSlug: 'massnahmen-ohne-zeitangabe',
      startLabel: 'Maßnahmen ohne Zeitangabe',
      directTitles: Object.freeze(['Maßnahmen ohne Zeitangabe']),
      searchTerms: Object.freeze([
        'maßnahmen ohne zeitangabe', 'massnahmen ohne zeitangabe', 'maßnahme ohne zeitangabe dokumentieren',
        'klienten-team sitzung dokumentieren', 'klienten team sitzung dokumentieren', 'krise dokumentieren',
        'wo sind maßnahmen ohne zeitangabe', 'wo finde ich maßnahmen ohne zeitangabe',
        'ich finde maßnahmen ohne zeitangabe nicht', 'maßnahmen ohne zeitangabe finden',
      ]),
    }),
    dateiablage: Object.freeze({
      stepGuideSlug: 'dateiablage',
      startLabel: 'Dateiablage öffnen',
      directTitles: Object.freeze(['Dateiablage öffnen']),
      searchTerms: Object.freeze([
        'dateiablage', 'dateiablage öffnen', 'wo finde ich dateiablage', 'dokumente', 'dokumente öffnen',
        'wo finde ich dokumente', 'vertrag', 'verträge', 'wohnassistent vertrag', 'betreuerausweis',
        'arztbrief', 'entlassungsbrief', 'laborwerte',
      ]),
    }),
  });

  function normalize(value) {
    return String(value || '')
      .toLocaleLowerCase('de-DE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9\s/-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function searchScore(slug, visibleText, rawQuery) {
    const query = normalize(rawQuery);
    if (!query) return 1;
    const entry = REGISTRY[slug] || null;
    const haystacks = [visibleText, slug, ...(entry?.searchTerms || []), ...(entry?.directTitles || [])]
      .map(normalize)
      .filter(Boolean);
    if (haystacks.some(value => value === query)) return 100;
    if (haystacks.some(value => value.startsWith(query))) return 80;
    if (haystacks.some(value => value.includes(query))) return 60;
    const joined = haystacks.join(' ');
    const tokens = query.split(' ').filter(Boolean);
    return tokens.length && tokens.every(token => joined.includes(token)) ? 40 : 0;
  }

  function rewriteGuidedRequestBody(body, selectedGuideSlug) {
    const slug = String(selectedGuideSlug || '').trim();
    if (typeof body !== 'string' || !body || !slug) return body;
    try {
      const parsed = JSON.parse(body);
      return JSON.stringify({
        ...parsed,
        selectedGuideSlug: slug,
        clientLibraryGuideRevision: REVISION,
      });
    } catch {
      return body;
    }
  }

  function guideForTitle(value) {
    const title = normalize(value);
    if (!title) return null;
    for (const [librarySlug, entry] of Object.entries(REGISTRY)) {
      if (entry.directTitles.some(candidate => normalize(candidate) === title)) {
        return { librarySlug, ...entry };
      }
    }
    return null;
  }

  root.DokoHilfGuideLibraryIntelligenceV53 = {
    revision: REVISION,
    registry: REGISTRY,
    normalize,
    searchScore,
    rewriteGuidedRequestBody,
    guideForTitle,
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let pendingGuideSlug = '';
  let scheduled = false;

  function requestUrl(input) {
    return typeof input === 'string' ? input : input?.url || '';
  }

  function isAiRequest(input) {
    const url = requestUrl(input);
    return typeof url === 'string' && AI_MARKERS.some(marker => url.includes(marker));
  }

  function cardSlug(card) {
    if (!card) return '';
    if (card.dataset?.v46FileStorage === 'true') return 'dateiablage';
    return card.dataset?.v29OpenDurchfuehrungGuide || card.dataset?.v29OpenGuide || '';
  }

  function updateSectionVisibility(grid) {
    const children = [...grid.children];
    let section = null;
    let sectionHasMatch = false;
    const finishSection = () => {
      if (section) section.classList.toggle('v42-search-hidden', !sectionHasMatch);
    };
    for (const child of children) {
      if (child.classList.contains('v35-library-section')) {
        finishSection();
        section = child;
        sectionHasMatch = false;
      } else if (child.classList.contains('v29-library-card') && !child.classList.contains('v42-search-hidden')) {
        sectionHasMatch = true;
      }
    }
    finishSection();
  }

  function applyIntelligentSearch(rawQuery) {
    const grid = document.querySelector('#directGuideView .v29-library-grid');
    if (!grid) return;
    const query = normalize(rawQuery);
    for (const card of grid.querySelectorAll('.v29-library-card')) {
      const slug = cardSlug(card);
      const score = slug
        ? searchScore(slug, card.textContent || '', query)
        : searchScore('', card.textContent || '', query);
      card.dataset.v53SearchScore = String(score);
      card.classList.toggle('v42-search-hidden', Boolean(query) && score <= 0);
    }
    updateSectionVisibility(grid);
    grid.dataset.v53IntelligentSearch = REVISION;
  }

  function installStyles() {
    if (document.getElementById('guideLibraryIntelligenceV53Styles')) return;
    const style = document.createElement('style');
    style.id = 'guideLibraryIntelligenceV53Styles';
    style.textContent = `
      .v53-guided-start{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;margin:0 0 16px;padding:14px 15px;border:1px solid rgba(68,218,168,.22);border-radius:18px;background:linear-gradient(145deg,rgba(10,64,53,.46),rgba(7,38,36,.64));box-shadow:0 10px 28px rgba(0,0,0,.10)}
      .v53-guided-start-copy{display:grid;gap:3px;min-width:0}.v53-guided-start-copy strong{color:#eafff7;font-size:14px;line-height:1.25}.v53-guided-start-copy span{color:#9fc6b9;font-size:11.5px;line-height:1.35}
      .v53-guided-start button{min-height:44px;padding:0 14px;border:1px solid rgba(96,236,190,.26);border-radius:13px;background:linear-gradient(145deg,#178868,#0d684f);color:#fff;font-size:12px;font-weight:900;white-space:nowrap;box-shadow:0 8px 20px rgba(4,66,49,.24)}
      .v53-guided-start button:active{transform:scale(.98)}
      @media(max-width:620px){.v53-guided-start{grid-template-columns:1fr}.v53-guided-start button{width:100%}}
    `;
    document.head.append(style);
  }

  function decorateCurrentGuide() {
    const view = document.getElementById('directGuideView');
    if (!view || view.hidden) return;
    const title = view.querySelector('.direct-guide-head h1')?.textContent || '';
    const entry = guideForTitle(title);
    const existing = view.querySelector('.v53-guided-start');
    if (!entry?.stepGuideSlug) {
      existing?.remove();
      return;
    }
    if (existing?.dataset?.v53StepGuide === entry.stepGuideSlug) return;
    existing?.remove();

    const panel = document.createElement('section');
    panel.className = 'v53-guided-start';
    panel.dataset.v53StepGuide = entry.stepGuideSlug;
    panel.innerHTML = `
      <div class="v53-guided-start-copy">
        <strong>Lieber Schritt für Schritt?</strong>
        <span>DokoHilf führt dich durch denselben bestätigten Ablauf.</span>
      </div>
      <button type="button" data-v53-start-guide="${entry.stepGuideSlug}" data-v53-start-label="${entry.startLabel.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">Schritt für Schritt starten</button>
    `;
    const head = view.querySelector('.direct-guide-head');
    head?.insertAdjacentElement('afterend', panel);
  }

  function hideDirectGuide() {
    const view = document.getElementById('directGuideView');
    if (view) view.hidden = true;
    const legal = document.querySelector('.legal-note');
    if (legal) legal.hidden = false;
    const shell = document.getElementById('appShell');
    if (shell) delete shell.dataset.v29GuideLibrary;
  }

  function startGuidedFlow(slug, label) {
    const api = window.DokoHilf;
    if (!api?.sendMessage || !api?.setMode) return false;
    pendingGuideSlug = String(slug || '').trim();
    if (!pendingGuideSlug) return false;
    hideDirectGuide();
    api.resetConversation?.({ keepMode: false });
    api.setMode('chat', { greet: false });
    api.sendMessage(String(label || '').trim() || 'Anleitung Schritt für Schritt starten');
    return true;
  }

  function installFetchPatch() {
    if (window.__DOKOHILF_LIBRARY_GUIDED_FETCH_V53__) return;
    const previousFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
      if (!pendingGuideSlug || !isAiRequest(input)) return previousFetch(input, init);
      const body = rewriteGuidedRequestBody(init.body, pendingGuideSlug);
      if (body === init.body) return previousFetch(input, init);
      pendingGuideSlug = '';
      return previousFetch(input, { ...init, body });
    };
    window.__DOKOHILF_LIBRARY_GUIDED_FETCH_V53__ = true;
  }

  function sync() {
    scheduled = false;
    installStyles();
    const input = document.querySelector('#directGuideView .v42-library-search input');
    applyIntelligentSearch(input?.value || '');
    decorateCurrentGuide();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  function initialize() {
    installFetchPatch();
    sync();
    const target = document.getElementById('appShell') || document.body;
    new MutationObserver(schedule).observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden', 'data-mode'],
    });
    document.addEventListener('input', event => {
      if (!event.target?.closest?.('.v42-library-search')) return;
      queueMicrotask(() => applyIntelligentSearch(event.target.value));
    });
    document.addEventListener('click', event => {
      const button = event.target.closest?.('[data-v53-start-guide]');
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      startGuidedFlow(button.dataset.v53StartGuide, button.dataset.v53StartLabel);
    }, { capture: true });
    window.addEventListener('pageshow', schedule);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();