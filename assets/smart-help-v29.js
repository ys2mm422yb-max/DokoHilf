(() => {
  'use strict';

  const AI_MARKER = '/functions/v1/dokohilf-ai';
  const SOURCE = 'smart-help-v29';
  const previousFetch = window.fetch.bind(window);

  const INITIAL_GUIDES = Object.freeze({
    vitalwerte: {
      slug: 'vitalwerte-einzelwert', title: 'Einzelnen Vitalwert erfassen', count: 7,
      text: 'Wähle zuerst den gewünschten Bewohner aus.', check: 'Ist der richtige Bewohner ausgewählt?',
    },
    berichte: {
      slug: 'bericht-neu', title: 'Neuen Berichtseintrag erfassen', count: 8,
      text: 'Öffne beim gewünschten Bewohner den Bereich „Berichte“.', check: 'Ist der richtige Bewohner geöffnet und bist du im Bereich „Berichte“?',
    },
    berichtssuche: {
      slug: 'berichtssuche', title: 'Gezielt nach Berichtseinträgen suchen', count: 4,
      text: 'Öffne oben den Reiter „Analyse“.', check: 'Bist du bei „Analyse“?',
    },
    visite: {
      slug: 'visiten-oeffnen', title: 'Visiten öffnen', count: 2,
      text: 'Öffne „Doku erweitert“.', check: 'Bist du in Doku erweitert?',
    },
    medikation: {
      slug: 'medikation-ansehen', title: 'Medikation ausschließlich ansehen', count: 3,
      text: 'Wähle zuerst den gewünschten Bewohner aus.', check: 'Ist der richtige Bewohner ausgewählt?',
    },
    formular: {
      slug: 'formulare-anlegen', title: 'Formular anlegen', count: 7,
      text: 'Wähle zuerst den gewünschten Bewohner aus.', check: 'Ist der richtige Bewohner ausgewählt?',
    },
    anwesenheit: {
      slug: 'anwesenheit', title: 'An- oder Abwesenheit erfassen', count: 8,
      text: 'Wähle zuerst den gewünschten Bewohner aus.', check: 'Ist der richtige Bewohner ausgewählt?',
    },
    uebergabe: {
      slug: 'uebergabeformular', title: 'Übergabe über „Was war los?“ anzeigen', count: 5,
      text: 'Öffne oben den Reiter „Analyse“.', check: 'Bist du bei „Analyse“?',
    },
    notfallblatt: {
      slug: 'notfallblatt', title: 'Notfallblatt in Word öffnen', count: 7,
      text: 'Wähle zuerst den Bewohner aus, für den du das Notfallblatt benötigst.', check: 'Ist der richtige Bewohner ausgewählt?',
    },
    durchfuehrung: {
      slug: 'durchfuehrungsnachweis-oeffnen', title: 'Durchführungsnachweis öffnen', count: 3,
      text: 'Öffne „Doku“.', check: 'Bist du im Bereich „Doku“?',
    },
    aufgaben: {
      slug: 'aufgaben-aktuelles', title: 'Aktuelles unter Aufgaben öffnen', count: 2,
      text: 'Öffne oben den Reiter „Aufgaben“.', check: 'Bist du bei „Aufgaben“?',
    },
    easyplan: {
      slug: 'easyplan', title: 'Easy-Plan öffnen', count: 2,
      text: 'Öffne oben den Reiter „Planung“.', check: 'Bist du bei „Planung“?',
    },
    stammdaten: {
      slug: 'stammdaten', title: 'Stammdaten öffnen', count: 2,
      text: 'Wechsle zurück zur Übersicht der Bewohner.', check: 'Siehst du die Bewohnerübersicht?',
    },
  });

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9\s/-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function requestUrl(input) {
    return typeof input === 'string' ? input : input?.url;
  }

  function isAiRequest(input, init = {}) {
    const url = requestUrl(input);
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return typeof url === 'string' && url.includes(AI_MARKER) && method === 'POST';
  }

  function parseBody(body) {
    if (typeof body !== 'string' || !body) return null;
    try { return JSON.parse(body); } catch { return null; }
  }

  function latestUser(parsed) {
    if (!Array.isArray(parsed?.messages)) return '';
    return [...parsed.messages].reverse().find(message => message?.role === 'user')?.content || '';
  }

  function helpLike(text) {
    const n = normalize(text);
    return /\b(ich brauche hilfe|brauch hilfe|hilf mir|komme nicht weiter|weiss nicht weiter|weis nicht weiter|weiss nicht wo|weis nicht wo|keine ahnung|wo bin ich|ich bin verloren|verlaufen|blick nicht durch|blicke nicht durch|checke nicht|check nicht|verstehe nicht|versteh nicht)\b/.test(n)
      || /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
      || /\b(wo ist|wo sind|wo finde ich|wie finde ich|wo muss ich|wo soll ich|wo klicken|was muss ich klicken|was soll ich klicken)\b/.test(n)
      || /\b(kannst du|kannst mir)\b.*\b(genauer|zeigen|helfen|sagen wo)\b/.test(n);
  }

  function hasNavigationIntent(text) {
    const n = normalize(text);
    return /\b(suche|such|finde|finden|wo ist|wo sind|wo finde|wie komme|ich will zu|ich mochte zu|offnen|oeffnen|aufrufen|ansehen|anschauen)\b/.test(n)
      || n.split(' ').length <= 5;
  }

  function inferInitialGuide(text) {
    const n = normalize(text);
    if (!hasNavigationIntent(n)) return null;

    if (/\b(berichtssuche|berichte auswerten|berichte suchen|nach berichten suchen|abfrage)\b/.test(n)) return INITIAL_GUIDES.berichtssuche;
    if (/\b(blutdruck|puls|temperatur|blutzucker|sauerstoff|spo2|vitalwert|vitalwerte)\b/.test(n)) return INITIAL_GUIDES.vitalwerte;
    if (/\b(bericht|berichte|berichtseintrag)\b/.test(n)) return INITIAL_GUIDES.berichte;
    if (/\b(visite|visiten|sprechstunde)\b/.test(n)) return INITIAL_GUIDES.visite;
    if (/\b(medikation|medikament|medikamente|medikationsplan)\b/.test(n)) return INITIAL_GUIDES.medikation;
    if (/\b(formular|formulare|anfallsprotokoll|fallgesprach|gesprachsprotokoll|sturzprotokoll)\b/.test(n)) return INITIAL_GUIDES.formular;
    if (/\b(anwesenheit|abwesenheit|an- und abwesenheit)\b/.test(n)) return INITIAL_GUIDES.anwesenheit;
    if (/\b(ubergabe|uebergabe|was war los)\b/.test(n)) return INITIAL_GUIDES.uebergabe;
    if (/\b(notfallblatt|notfallbogen)\b/.test(n)) return INITIAL_GUIDES.notfallblatt;
    if (/\b(durchfuhrungsnachweis|durchfuehrungsnachweis|durchfuhrung|durchfuehrung)\b/.test(n)) return INITIAL_GUIDES.durchfuehrung;
    if (/\b(aufgaben|aktuelles)\b/.test(n)) return INITIAL_GUIDES.aufgaben;
    if (/\b(easy plan|easy-plan|easyplan)\b/.test(n)) return INITIAL_GUIDES.easyplan;
    if (/\b(stammdaten)\b/.test(n)) return INITIAL_GUIDES.stammdaten;
    return null;
  }

  function compactStartResponse(guide) {
    return new Response(JSON.stringify({
      reply: `${guide.text}\n\n${guide.check}`,
      spokenText: guide.text,
      guideSlug: guide.slug,
      guideTitle: guide.title,
      guideStep: 1,
      guideStepCount: guide.count,
      completed: false,
      source: SOURCE,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-DokoHilf-Smart-Help': 'v29',
      },
    });
  }

  function rewriteAsHelp(parsed) {
    if (!Array.isArray(parsed?.messages)) return null;
    const messages = parsed.messages.map(message => ({ ...message }));
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index]?.role !== 'user') continue;
      messages[index].content = 'ich finde das nicht';
      return JSON.stringify({ ...parsed, messages, smartHelpIntent: true });
    }
    return null;
  }

  window.fetch = async (input, init = {}) => {
    if (!isAiRequest(input, init)) return previousFetch(input, init);
    const parsed = parseBody(init.body);
    if (!parsed) return previousFetch(input, init);
    const userText = String(latestUser(parsed) || '').trim();
    const activeGuide = String(parsed.guideSlug || '').trim();

    if (activeGuide && helpLike(userText)) {
      const body = rewriteAsHelp(parsed);
      if (body) return previousFetch(input, { ...init, body });
    }

    if (!activeGuide) {
      const guide = inferInitialGuide(userText);
      if (guide) return compactStartResponse(guide);
    }

    return previousFetch(input, init);
  };

  window.DokoHilfSmartHelpV29 = {
    normalize,
    helpLike,
    inferInitialGuide,
    rewriteAsHelp,
    initialGuides: INITIAL_GUIDES,
  };
  window.__DOKOHILF_SMART_HELP_V29__ = true;
})();
