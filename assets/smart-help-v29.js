(() => {
  'use strict';

  const AI_MARKERS = [
    '/functions/v1/dokohilf-ai',
    '/functions/v1/dokohilf-chat-router',
  ];
  const INPUT_ROBUSTNESS_REVISION = '20260903-progressive-navigation-v68-1';
  const previousFetch = window.fetch.bind(window);

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

  function compactNormalize(value) {
    return normalize(value).replace(/[\s/-]+/g, '');
  }

  function hasCompactTerm(value, ...terms) {
    const compact = compactNormalize(value);
    return terms.some(term => {
      const wanted = compactNormalize(term);
      return wanted && compact.includes(wanted);
    });
  }

  function requestUrl(input) {
    return typeof input === 'string' ? input : input?.url;
  }

  function isAiRequest(input, init = {}) {
    const url = requestUrl(input);
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return typeof url === 'string' && AI_MARKERS.some(marker => url.includes(marker)) && method === 'POST';
  }

  function parseBody(body) {
    if (typeof body !== 'string' || !body) return null;
    try { return JSON.parse(body); } catch { return null; }
  }

  function latestUser(parsed) {
    if (!Array.isArray(parsed?.messages)) return '';
    return [...parsed.messages].reverse().find(message => message?.role === 'user')?.content || '';
  }

  function speechAlternatives(parsed, primaryText) {
    if (!Array.isArray(parsed?.speechAlternatives)) return [];
    const primary = normalize(primaryText);
    const seen = new Set();
    return parsed.speechAlternatives
      .filter(value => typeof value === 'string')
      .map(value => String(value || '').trim().slice(0, 350))
      .filter(value => {
        const key = normalize(value);
        if (!key || key === primary || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 4);
  }

  function helpLike(text) {
    const n = normalize(text);
    return /\b(ich brauche hilfe|brauch hilfe|hilf mir|kannst du mir helfen|komme nicht weiter|weiss nicht weiter|weis nicht weiter|ich weiss nicht|ich weis nicht|weiss nicht|weis nicht|keine ahnung|wo bin ich|ich bin verloren|verlaufen|blick nicht durch|blicke nicht durch|checke nicht|check nicht|verstehe nicht|versteh nicht|kapier nicht|raffe nicht|raff nicht|was meinst du|welches davon|und jetzt|was jetzt|hä|hae)\b/.test(n)
      || /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
      || /\b(wo ist|wo sind|wo finde ich|wie finde ich|wo muss ich|wo soll ich|wo klicken|wo drucken|wo druecken|was muss ich klicken|was soll ich klicken|welchen knopf|welchen button|welche taste)\b/.test(n)
      || /\b(das gibt es bei mir nicht|das gibt s bei mir nicht|hab ich nicht|habe ich nicht|steht bei mir nicht|sieht bei mir anders aus|bei mir ist es anders)\b/.test(n)
      || /\b(kannst du|kannst mir)\b.*\b(genauer|zeigen|helfen|sagen wo)\b/.test(n);
  }

  function hasEntryAction(text) {
    const n = normalize(text);
    return /\b(erfassen|eintragen|eingeben|anlegen|erstellen|schreiben|dokumentieren|neu machen|neu erfassen|korrigieren|durchstreichen|stornieren|geben|gabe|abhaken|kontrollieren|hochladen|uploaden|upload|loschen|loeschen|umbenennen|andern|aendern|bearbeiten|verschieben|ersetzen)\b/.test(n);
  }

  function hasNavigationIntent(text) {
    const n = normalize(text);
    return /\b(suche|such|finde|finden|wo ist|wo sind|wo finde|wie komme|ich will zu|ich mochte zu|offnen|oeffnen|aufrufen|ansehen|anschauen|zeigen)\b/.test(n)
      || n.split(' ').length <= 5;
  }

  function isLocationQuestion(text) {
    const n = normalize(text);
    return /\b(wo ist|wo sind|wo finde|wie finde|wie komme|wo muss|wo soll)\b/.test(n)
      || /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
      || /\b(kann|konnte)\b.*\b(nicht finden|nicht sehen|nicht offnen)\b/.test(n);
  }

  function isFalseSignOffCorrection(text) {
    const n = normalize(text);
    if (!hasCompactTerm(n, 'abgezeichnet')) return false;
    return /\b(falsch|versehentlich|irrtumlich)\b/.test(n);
  }

  function hasSignOffIntent(text) {
    const n = normalize(text);
    if (!n || isFalseSignOffCorrection(n)) return false;
    return hasCompactTerm(n, 'abzeichnen', 'abzuzeichnen')
      || /\b(zeichne|zeichnest|zeichnet|zeichn)\b.*\bab\b/.test(n)
      || (hasCompactTerm(n, 'abgezeichnet') && /\b(werden|mussen|sollen)\b/.test(n));
  }

  function hasEffectivenessTerm(text) {
    const n = normalize(text);
    return /\bwirksamkeit\b/.test(n) || hasCompactTerm(n, 'Wirksamkeitskontrolle');
  }

  function hasNeedMedicationTerm(text) {
    const n = normalize(text);
    return hasCompactTerm(
      n,
      'Bedarfsmedikation',
      'Bedarfsgabe',
      'Bedarfsmedikament',
      'Bedarf Medikament',
    );
  }

  function hasMeasuresWithoutTimeTerm(text) {
    return hasCompactTerm(text, 'Maßnahmen ohne Zeitangabe', 'Maßnahme ohne Zeitangabe');
  }

  function isUnconfirmedGoal(text) {
    const n = normalize(text);
    return /\b(berichte auswerten|berichte suchen|nach berichten suchen|abfrage|aufgaben|aktuelles|easy plan|easy-plan|easyplan)\b/.test(n)
      || hasCompactTerm(n, 'Berichtssuche', 'Bericht Suche', 'Easy Plan');
  }

  function inferTaskGuide(text) {
    const n = normalize(text);
    if (!n || isLocationQuestion(n)) return '';
    if (isFalseSignOffCorrection(n)) return 'durchfuehrung-storno';
    if (hasSignOffIntent(n)) return 'durchfuehrungsnachweis-finden';
    if (hasEffectivenessTerm(n)
      && (/\b(bedarf|medikation)\b/.test(n) || hasNeedMedicationTerm(n))) {
      return 'bedarfsmedikation-wirksamkeitskontrolle';
    }
    if (hasNeedMedicationTerm(n)
      && /\b(geben|gabe|dokumentieren|eintragen|erfassen|abhaken|machen|wie)\b/.test(n)) {
      return 'bedarfsmedikation-gabe';
    }
    if (hasMeasuresWithoutTimeTerm(n)
      && /\b(dokumentieren|eintragen|erfassen|offnen|oeffnen|machen|wie)\b/.test(n)) {
      return 'massnahmen-ohne-zeitangabe';
    }
    return '';
  }

  function inferNavigationGuide(text) {
    const n = normalize(text);
    if (isFalseSignOffCorrection(n)) return 'durchfuehrung-storno';
    if (hasSignOffIntent(n)) return 'durchfuehrungsnachweis-finden';
    if (!hasNavigationIntent(n) || hasEntryAction(n)) return '';

    if (/\b(berichte auswerten|berichte suchen|nach berichten suchen|abfrage)\b/.test(n)
      || hasCompactTerm(n, 'Berichtssuche', 'Bericht Suche')) return '';
    if (/\b(aufgaben|aktuelles|easy plan|easy-plan|easyplan)\b/.test(n)
      || hasCompactTerm(n, 'Easy Plan')) return '';

    if (hasEffectivenessTerm(n)
      && (/\b(bedarf|medikation)\b/.test(n) || hasNeedMedicationTerm(n))) {
      return 'bedarfsmedikation-wirksamkeitskontrolle-finden';
    }
    if (hasNeedMedicationTerm(n)) return 'bedarfsmedikation-finden';
    if (hasMeasuresWithoutTimeTerm(n)) return 'massnahmen-ohne-zeitangabe-finden';

    if (/\b(dokumente|vertrag|vertraege)\b/.test(n)
      || hasCompactTerm(n, 'Dateiablage', 'Wohnassistent Vertrag', 'Betreuerausweis', 'Arztbrief', 'Entlassungsbrief', 'Laborwerte')) {
      return 'dateiablage';
    }
    if (hasCompactTerm(n, 'Doku-Erweitert')) return 'doku-erweitert-finden';
    if (hasCompactTerm(n, 'Durchführungsnachweis', 'Durchfuehrungsnachweis')) return 'durchfuehrungsnachweis-finden';
    if (/\b(blutdruck|puls|temperatur|blutzucker|sauerstoff|spo2|vitalwert|vitalwerte)\b/.test(n)
      || hasCompactTerm(n, 'Blutdruck', 'Blutzucker', 'Sauerstoffsättigung', 'Sauerstoffsaettigung', 'Atemfrequenz', 'Atemalkohol', 'Vitalwert', 'Vitalwerte')) {
      return 'vitalwerte';
    }
    if (/\b(bericht|berichte)\b/.test(n) || hasCompactTerm(n, 'Berichtseintrag')) return 'berichte-finden';
    if (/\b(visite|visiten|sprechstunde)\b/.test(n) || hasCompactTerm(n, 'Sprechstunde')) return 'visiten-oeffnen';
    if (/\b(medikation|medikament|medikamente|medikationsplan)\b/.test(n) || hasCompactTerm(n, 'Medikationsplan')) return 'medikation-finden';
    if (/\b(formular|formulare|anfallsprotokoll|fallgesprach|gesprachsprotokoll|sturzprotokoll)\b/.test(n)
      || hasCompactTerm(n, 'Anfallsprotokoll', 'Fallgespräch', 'Fallgespraech', 'Gesprächsprotokoll', 'Gespraechsprotokoll', 'Sturzprotokoll')) {
      return 'formulare-finden';
    }
    if (/\b(anwesenheit|abwesenheit|an- und abwesenheit)\b/.test(n) || hasCompactTerm(n, 'An-/Abwesenheit', 'An-/Abwesenheiten')) return 'anwesenheiten-finden';
    if (/\b(ubergabe|uebergabe|was war los)\b/.test(n)) return 'uebergabe-finden';
    if (hasCompactTerm(n, 'Notfallblatt', 'Notfallbogen')) return 'notfallblatt-finden';
    if (hasCompactTerm(n, 'Stammdaten', 'Bewohnerübersicht', 'Bewohneruebersicht')) return 'stammdaten-finden';
    if (/\bplanung\b/.test(n)) return 'planung-finden';
    if (/\banalyse\b/.test(n)) return 'analyse-finden';
    if (/\bdoku\b/.test(n)) return 'doku-finden';
    return '';
  }

  function inferAlternativeGuide(parsed, userText, infer) {
    if (isUnconfirmedGoal(userText) || hasEntryAction(userText)) return '';
    for (const alternative of speechAlternatives(parsed, userText)) {
      const guideSlug = infer(alternative);
      if (guideSlug) return guideSlug;
    }
    return '';
  }

  function preparedBody(parsed, userText) {
    const activeGuide = String(parsed.guideSlug || '').trim();
    const alternatives = speechAlternatives(parsed, userText);
    if (activeGuide && (helpLike(userText) || alternatives.some(helpLike))) {
      return JSON.stringify({ ...parsed, smartHelpIntent: true });
    }

    if (!activeGuide && !parsed.selectedGuideSlug) {
      const taskGuideSlug = inferTaskGuide(userText) || inferAlternativeGuide(parsed, userText, inferTaskGuide);
      if (taskGuideSlug) {
        return JSON.stringify({
          ...parsed,
          selectedGuideSlug: taskGuideSlug,
          smartTaskIntent: true,
          ...(inferTaskGuide(userText) ? {} : { smartSpeechAlternativeIntent: true }),
        });
      }
      const selectedGuideSlug = inferNavigationGuide(userText) || inferAlternativeGuide(parsed, userText, inferNavigationGuide);
      if (selectedGuideSlug) {
        return JSON.stringify({
          ...parsed,
          selectedGuideSlug,
          smartNavigationIntent: true,
          ...(inferNavigationGuide(userText) ? {} : { smartSpeechAlternativeIntent: true }),
        });
      }
    }
    return null;
  }

  function loadFileStorageGuide() {
    if (window.__DOKOHILF_FILE_STORAGE_GUIDE_V46__ || document.querySelector('script[data-dokohilf-file-storage-v46]')) return;
    const script = document.createElement('script');
    script.src = 'assets/file-storage-guide-v46.js?v=20260812-file-storage-v46-1';
    script.dataset.dokohilfFileStorageV46 = 'true';
    document.head.append(script);
  }

  window.fetch = async (input, init = {}) => {
    if (!isAiRequest(input, init)) return previousFetch(input, init);
    const parsed = parseBody(init.body);
    if (!parsed) return previousFetch(input, init);
    const userText = String(latestUser(parsed) || '').trim();
    const body = preparedBody(parsed, userText);
    return previousFetch(input, body ? { ...init, body } : init);
  };

  window.DokoHilfSmartHelpV29 = {
    revision: INPUT_ROBUSTNESS_REVISION,
    normalize,
    compactNormalize,
    hasCompactTerm,
    isFalseSignOffCorrection,
    hasSignOffIntent,
    helpLike,
    isLocationQuestion,
    isUnconfirmedGoal,
    speechAlternatives,
    inferTaskGuide,
    inferNavigationGuide,
    inferAlternativeGuide,
    preparedBody,
  };
  window.__DOKOHILF_SMART_HELP_V29__ = true;
  loadFileStorageGuide();
})();