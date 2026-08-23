(() => {
  'use strict';

  if (window.__DOKOHILF_INTENT_REGISTRY_V54__) return;

  const REVISION = '20260823-confirmed-intent-registry-v54-1';
  const AI_MARKERS = Object.freeze([
    '/functions/v1/dokohilf-ai',
    '/functions/v1/dokohilf-ai-router',
    '/functions/v1/dokohilf-chat-router',
    '/functions/v1/dokohilf-conversation-router',
  ]);
  const BLOCKED = Object.freeze([
    /\bberichtssuche\b/,
    /\bberichte (durchsuchen|auswerten|filtern)\b/,
    /\bnach (einem |dem |einem bestimmten |dem bestimmten )?bericht suchen\b/,
    /\bbericht.*\babfrage\b/,
    /\b(easy plan|easy-plan|easyplan)\b/,
    /\baufgaben\b.*\baktuelles\b/,
    /\baktuelles\b.*\baufgaben\b/,
  ]);
  const LIBRARY_SLUG = Object.freeze({
    'bericht-neu': 'bericht-neu',
    'bericht-durchstreichen': 'bericht-durchstreichen',
    'bericht-folgebericht': 'bericht-folgebericht',
    'berichte-finden': 'bericht-neu',
    'visite-anlegen': 'visite-anlegen',
    'visiten-finden': 'visiten-oeffnen',
    'vitalwerte-finden': 'vitalwerte',
    'anwesenheit': 'anwesenheit',
    'anwesenheiten-finden': 'anwesenheit',
    'formulare-anlegen': 'formulare-anlegen',
    'formulare-finden': 'formulare-anlegen',
    'bedarfsmedikation-finden': 'bedarfsmedikation-gabe',
    'bedarfsmedikation-gabe': 'bedarfsmedikation-gabe',
    'bedarfsmedikation-wirksamkeitskontrolle-finden': 'bedarfsmedikation-wirksamkeitskontrolle',
    'bedarfsmedikation-wirksamkeitskontrolle': 'bedarfsmedikation-wirksamkeitskontrolle',
    'massnahmen-ohne-zeitangabe-finden': 'massnahmen-ohne-zeitangabe',
    'massnahmen-ohne-zeitangabe': 'massnahmen-ohne-zeitangabe',
    'durchfuehrungsnachweis-finden': 'durchfuehrungsnachweis-oeffnen',
    'durchfuehrung-storno': 'durchfuehrung-storno',
    'medikation-finden': 'medikation-ansehen',
    'notfallblatt-finden': 'notfallblatt',
    'notfallblatt': 'notfallblatt',
    'uebergabe-finden': 'uebergabeformular',
    'uebergabeformular': 'uebergabeformular',
    'stammdaten-finden': 'stammdaten',
    'dateiablage': 'dateiablage',
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

  function hasCreateIntent(value) {
    const text = normalize(value);
    return /\b(anlegen|erstellen|dokumentieren|erfassen|eintragen|schreiben|verfassen|abhaken|kontrollieren|abzeichnen|abzuzeichnen)\b/.test(text)
      || /\b(lege|legst|legt|leg)\b.*\ban\b/.test(text)
      || /\b(trage|tragst|tragt|trag)\b.*\bein\b/.test(text)
      || /\b(erstelle|erstellst|erstellt|erstell)\b/.test(text)
      || /\b(dokumentiere|dokumentierst|dokumentiert|dokumentier)\b/.test(text)
      || /\b(erfasse|erfasst|erfass)\b/.test(text)
      || /\b(schreibe|schreibst|schreibt|schreib)\b/.test(text);
  }

  function hasOpenIntent(value) {
    const text = normalize(value);
    return /\b(offnen|ansehen|anschauen|nachsehen|aufrufen|finden|zeigen|suchen|anzeigen)\b/.test(text)
      || /\b(offne|offnest|offnet|offn)\b/.test(text)
      || /\b(rufe|rufst|ruft|ruf)\b.*\bauf\b/.test(text)
      || /\b(wo|wie)\b.*\b(finde|findest|finden|komme)\b/.test(text);
  }

  function isFalseSignOff(value) {
    const text = normalize(value);
    return /\b(falsch|versehentlich|irrtumlich)\b.*\babgezeichnet\b/.test(text)
      || /\babgezeichnet\b.*\b(falsch|versehentlich|irrtumlich)\b/.test(text);
  }

  function hasSignOffIntent(value) {
    const text = normalize(value);
    if (!text || isFalseSignOff(text)) return false;
    return /\b(abzeichnen|abzuzeichnen)\b/.test(text)
      || /\b(zeichne|zeichnest|zeichnet|zeichn)\b.*\bab\b/.test(text)
      || /\babgezeichnet\b.*\b(werden|mussen|sollen)\b/.test(text);
  }

  function blockedIntent(value) {
    const text = normalize(value);
    return Boolean(text && BLOCKED.some(pattern => pattern.test(text)));
  }

  function resolveGuide(value) {
    const text = normalize(value);
    if (!text || blockedIntent(text)) return '';

    // Tätigkeitsabsicht hat Vorrang vor dem Gegenstand. Das verhindert z. B.
    // „Medikamente abzeichnen“ -> Medikation und hält die bestätigte DNF-Regel ein.
    if (isFalseSignOff(text)) return 'durchfuehrung-storno';
    if (hasSignOffIntent(text)) return 'durchfuehrungsnachweis-finden';

    if (/\b(verschrieben|bericht korrigieren|bericht durchstreichen|falscher bericht|falschen bericht)\b/.test(text)) return 'bericht-durchstreichen';
    if (/\bfolgebericht\b/.test(text)) return 'bericht-folgebericht';

    if (/\b(wirksamkeitskontrolle|wirkungskontrolle|wirksamkeit)\b/.test(text)
      && /\b(bedarf|bedarfsmedikation|medikation)\b/.test(text)) {
      return hasOpenIntent(text) && !hasCreateIntent(text)
        ? 'bedarfsmedikation-wirksamkeitskontrolle-finden'
        : 'bedarfsmedikation-wirksamkeitskontrolle';
    }
    if (/\b(bedarfsmedikation|bedarfsgabe|bedarfsmedikament|bedarf medikament)\b/.test(text)) {
      return hasCreateIntent(text) || /\b(gabe|geben|machen)\b/.test(text)
        ? 'bedarfsmedikation-gabe'
        : 'bedarfsmedikation-finden';
    }
    if (/\b(massnahmen ohne zeitangabe|massnahme ohne zeitangabe)\b/.test(text)) {
      return hasCreateIntent(text) || /\bmachen\b/.test(text)
        ? 'massnahmen-ohne-zeitangabe'
        : 'massnahmen-ohne-zeitangabe-finden';
    }

    if (/\b(arztbrief|entlassungsbrief|laborwerte|betreuerausweis|dateiablage|dokumente)\b/.test(text)) return 'dateiablage';

    if (/\b(visite|visiten|sprechstunde|arztvisite)\b/.test(text)) {
      if (hasCreateIntent(text)) return 'visite-anlegen';
      if (hasOpenIntent(text) || /^visiten?$/.test(text)) return 'visiten-finden';
    }
    if (/\b(bericht|berichte|berichtseintrag|pflegebericht)\b/.test(text)) {
      if (hasCreateIntent(text)) return 'bericht-neu';
      if (hasOpenIntent(text) || /^berichte?$/.test(text)) return 'berichte-finden';
    }
    if (/\b(vitalwert|vitalwerte|blutdruck|puls|temperatur|blutzucker|sauerstoff|sauerstoffsattigung|spo2|atemfrequenz|atemalkohol)\b/.test(text)) {
      // Bei Erfassung mehrerer/einzelner Vitalwerte soll weiterhin die bestehende
      // bestätigte Auswahl-/Klärungslogik entscheiden; keine stille Festlegung.
      if (hasCreateIntent(text)) return '';
      return 'vitalwerte-finden';
    }
    if (/\b(anwesenheit|abwesenheit|an- und abwesenheit)\b/.test(text)) {
      return hasCreateIntent(text) ? 'anwesenheit' : 'anwesenheiten-finden';
    }
    if (/\b(formular|formulare|anfallsprotokoll|fallgesprach|gesprachsprotokoll|sturzprotokoll)\b/.test(text)) {
      return hasCreateIntent(text) ? 'formulare-anlegen' : 'formulare-finden';
    }
    if (/\b(durchfuhrungsnachweis|durchfuehrungsnachweis)\b/.test(text)) return 'durchfuehrungsnachweis-finden';
    if (/\b(medikation|medikationsplan|medikament|medikamente)\b/.test(text)) {
      if (/\b(andern|verandern|absetzen|pausieren|fortsetzen|loschen|korrigieren|dosieren|erhohen|senken)\b/.test(text)) return '';
      if (hasOpenIntent(text) || /^(medikation|medikamente?)$/.test(text)) return 'medikation-finden';
    }
    if (/\b(notfallblatt|notfallbogen)\b/.test(text)) return hasCreateIntent(text) ? 'notfallblatt' : 'notfallblatt-finden';
    if (/\b(ubergabe|uebergabe|was war los|schichtubergabe)\b/.test(text)) return hasCreateIntent(text) ? 'uebergabeformular' : 'uebergabe-finden';
    if (/\bstammdaten\b/.test(text)) return 'stammdaten-finden';
    if (/\bdoku-erweitert\b/.test(text)) return 'doku-erweitert-finden';
    if (/\banalyse\b/.test(text)) return 'analyse-finden';
    if (/\bplanung\b/.test(text)) return 'planung-finden';
    if (/\bdoku\b/.test(text)) return 'doku-finden';
    return '';
  }

  function libraryTargets(value) {
    const text = normalize(value);
    if (!text || blockedIntent(text)) return [];
    const routed = resolveGuide(text);
    const mapped = LIBRARY_SLUG[routed];
    if (mapped) return [mapped];
    // Suchbegriffe dürfen eine bestätigte komplette Anleitung finden, auch wenn
    // die Chatroute absichtlich keine Detail-Erfassung vorentscheidet.
    if (/\b(blutdruck|puls|temperatur|blutzucker|sauerstoff|sauerstoffsattigung|spo2|atemfrequenz|atemalkohol)\b/.test(text)) return ['vitalwerte'];
    return [];
  }

  function latestUser(parsed) {
    if (!Array.isArray(parsed?.messages)) return '';
    return [...parsed.messages].reverse().find(message => message?.role === 'user')?.content || '';
  }

  function isAiPost(input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url || '';
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return method === 'POST' && AI_MARKERS.some(marker => String(url).includes(marker));
  }

  function injectCanonicalRoute(body) {
    if (typeof body !== 'string' || !body) return body;
    try {
      const parsed = JSON.parse(body);
      if (parsed.guideSlug || parsed.selectedGuideSlug) return body;
      const userText = latestUser(parsed);
      if (!userText || blockedIntent(userText)) return body;
      const selectedGuideSlug = resolveGuide(userText);
      if (!selectedGuideSlug) return body;
      return JSON.stringify({
        ...parsed,
        selectedGuideSlug,
        confirmedIntentRegistryRevision: REVISION,
      });
    } catch {
      return body;
    }
  }

  function installFetchRegistry() {
    if (window.__DOKOHILF_INTENT_REGISTRY_FETCH_V54__) return;
    const previousFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
      if (!isAiPost(input, init)) return previousFetch(input, init);
      return previousFetch(input, { ...init, body: injectCanonicalRoute(init.body) });
    };
    window.__DOKOHILF_INTENT_REGISTRY_FETCH_V54__ = true;
  }

  function cardSlug(card) {
    if (!card) return '';
    if (card.dataset?.v46FileStorage === 'true') return 'dateiablage';
    return String(card.dataset?.v29OpenGuide || card.dataset?.v29OpenDurchfuehrungGuide || '').trim();
  }

  function applyLibraryTargets(input) {
    const targets = libraryTargets(input?.value || '');
    if (!targets.length) return;
    const view = input.closest?.('#directGuideView') || document.getElementById('directGuideView');
    const grid = view?.querySelector('.v29-library-grid');
    if (!grid) return;
    queueMicrotask(() => {
      const cards = [...grid.querySelectorAll('.v29-library-card')];
      for (const card of cards) card.classList.toggle('v42-search-hidden', !targets.includes(cardSlug(card)));
      let section = null;
      let hasMatch = false;
      const finish = () => { if (section) section.classList.toggle('v42-search-hidden', !hasMatch); };
      for (const child of [...grid.children]) {
        if (child.classList.contains('v35-library-section')) {
          finish();
          section = child;
          hasMatch = false;
        } else if (child.classList.contains('v29-library-card') && !child.classList.contains('v42-search-hidden')) {
          hasMatch = true;
        }
      }
      finish();
      if (view) view.dataset.v54IntentRegistry = REVISION;
    });
  }

  document.addEventListener('input', event => {
    const input = event.target?.closest?.('#directGuideView .v42-library-search input[type="search"]');
    if (input) applyLibraryTargets(input);
  }, { capture: true });

  window.DokoHilfIntentRegistryV54 = {
    revision: REVISION,
    normalize,
    hasCreateIntent,
    hasOpenIntent,
    isFalseSignOff,
    hasSignOffIntent,
    blockedIntent,
    resolveGuide,
    libraryTargets,
    injectCanonicalRoute,
  };
  window.__DOKOHILF_INTENT_REGISTRY_V54__ = true;
  installFetchRegistry();
})();
