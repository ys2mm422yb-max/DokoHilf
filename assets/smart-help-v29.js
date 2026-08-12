(() => {
  'use strict';

  const AI_MARKERS = [
    '/functions/v1/dokohilf-ai',
    '/functions/v1/dokohilf-chat-router',
  ];
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
    return /\b(erfassen|eintragen|eingeben|anlegen|erstellen|schreiben|dokumentieren|neu machen|neu erfassen|korrigieren|durchstreichen|stornieren|geben|gabe|abhaken|kontrollieren)\b/.test(n);
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

  function inferTaskGuide(text) {
    const n = normalize(text);
    if (!n || isLocationQuestion(n)) return '';
    if (/\b(wirksamkeitskontrolle|wirksamkeit)\b.*\b(bedarf|bedarfsmedikation|medikation)\b|\b(bedarf|bedarfsmedikation)\b.*\b(wirksamkeitskontrolle|wirksamkeit)\b/.test(n)) {
      return 'bedarfsmedikation-wirksamkeitskontrolle';
    }
    if (/\b(bedarfsmedikation|bedarfsgabe|bedarfsmedikament|bedarf medikament)\b/.test(n)
      && /\b(geben|gabe|dokumentieren|eintragen|erfassen|abhaken|machen|wie)\b/.test(n)) {
      return 'bedarfsmedikation-gabe';
    }
    if (/\b(massnahmen ohne zeitangabe|massnahme ohne zeitangabe)\b/.test(n)
      && /\b(dokumentieren|eintragen|erfassen|offnen|machen|wie)\b/.test(n)) {
      return 'massnahmen-ohne-zeitangabe';
    }
    return '';
  }

  function inferNavigationGuide(text) {
    const n = normalize(text);
    if (!hasNavigationIntent(n) || hasEntryAction(n)) return '';

    if (/\b(berichtssuche|berichte auswerten|berichte suchen|nach berichten suchen|abfrage)\b/.test(n)) return '';
    if (/\b(aufgaben|aktuelles|easy plan|easy-plan|easyplan)\b/.test(n)) return '';

    if (/\b(wirksamkeitskontrolle|wirksamkeit)\b.*\b(bedarf|bedarfsmedikation|medikation)\b|\b(bedarf|bedarfsmedikation)\b.*\b(wirksamkeitskontrolle|wirksamkeit)\b/.test(n)) {
      return 'bedarfsmedikation-wirksamkeitskontrolle-finden';
    }
    if (/\b(bedarfsmedikation|bedarfsgabe|bedarfsmedikament|bedarf medikament)\b/.test(n)) return 'bedarfsmedikation-finden';
    if (/\b(massnahmen ohne zeitangabe|massnahme ohne zeitangabe)\b/.test(n)) return 'massnahmen-ohne-zeitangabe-finden';

    if (/\b(dateiablage|dokumente|vertrag|vertraege|wohnassistent vertrag|betreuerausweis|arztbrief|entlassungsbrief|laborwerte)\b/.test(n)) return 'dateiablage';
    if (/\b(doku erweitert|doku-erweitert)\b/.test(n)) return 'doku-erweitert-finden';
    if (/\b(durchfuhrungsnachweis|durchfuehrungsnachweis)\b/.test(n)) return 'durchfuehrungsnachweis-finden';
    if (/\b(blutdruck|puls|temperatur|blutzucker|sauerstoff|spo2|vitalwert|vitalwerte)\b/.test(n)) return 'vitalwerte-finden';
    if (/\b(bericht|berichte|berichtseintrag)\b/.test(n)) return 'berichte-finden';
    if (/\b(visite|visiten|sprechstunde)\b/.test(n)) return 'visiten-finden';
    if (/\b(medikation|medikament|medikamente|medikationsplan)\b/.test(n)) return 'medikation-finden';
    if (/\b(formular|formulare|anfallsprotokoll|fallgesprach|gesprachsprotokoll|sturzprotokoll)\b/.test(n)) return 'formulare-finden';
    if (/\b(anwesenheit|abwesenheit|an- und abwesenheit)\b/.test(n)) return 'anwesenheiten-finden';
    if (/\b(ubergabe|uebergabe|was war los)\b/.test(n)) return 'uebergabe-finden';
    if (/\b(notfallblatt|notfallbogen)\b/.test(n)) return 'notfallblatt-finden';
    if (/\b(stammdaten|bewohnerubersicht|bewohneruebersicht)\b/.test(n)) return 'stammdaten-finden';
    if (/\bplanung\b/.test(n)) return 'planung-finden';
    if (/\banalyse\b/.test(n)) return 'analyse-finden';
    if (/\bdoku\b/.test(n)) return 'doku-finden';
    return '';
  }

  function preparedBody(parsed, userText) {
    const activeGuide = String(parsed.guideSlug || '').trim();
    if (activeGuide && helpLike(userText)) {
      return JSON.stringify({ ...parsed, smartHelpIntent: true });
    }

    if (!activeGuide && !parsed.selectedGuideSlug) {
      const taskGuideSlug = inferTaskGuide(userText);
      if (taskGuideSlug) {
        return JSON.stringify({
          ...parsed,
          selectedGuideSlug: taskGuideSlug,
          smartTaskIntent: true,
        });
      }
      const selectedGuideSlug = inferNavigationGuide(userText);
      if (selectedGuideSlug) {
        return JSON.stringify({
          ...parsed,
          selectedGuideSlug,
          smartNavigationIntent: true,
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
    normalize,
    helpLike,
    isLocationQuestion,
    inferTaskGuide,
    inferNavigationGuide,
    preparedBody,
  };
  window.__DOKOHILF_SMART_HELP_V29__ = true;
  loadFileStorageGuide();
})();