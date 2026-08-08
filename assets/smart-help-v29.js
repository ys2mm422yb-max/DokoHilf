(() => {
  'use strict';

  const AI_MARKER = '/functions/v1/dokohilf-ai';
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
    return /\b(ich brauche hilfe|brauch hilfe|hilf mir|kannst du mir helfen|komme nicht weiter|weiss nicht weiter|weis nicht weiter|weiss nicht wo|weis nicht wo|keine ahnung|wo bin ich|ich bin verloren|verlaufen|blick nicht durch|blicke nicht durch|checke nicht|check nicht|verstehe nicht|versteh nicht|kapier nicht|raffe nicht|raff nicht)\b/.test(n)
      || /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
      || /\b(wo ist|wo sind|wo finde ich|wie finde ich|wo muss ich|wo soll ich|wo klicken|wo drucken|wo druecken|was muss ich klicken|was soll ich klicken|welchen knopf|welchen button|welche taste)\b/.test(n)
      || /\b(das gibt es bei mir nicht|das gibt s bei mir nicht|hab ich nicht|habe ich nicht|steht bei mir nicht|sieht bei mir anders aus|bei mir ist es anders)\b/.test(n)
      || /\b(hä|hae|huh|was meinst du|welches davon|und jetzt|was jetzt)\b/.test(n)
      || /\b(kannst du|kannst mir)\b.*\b(genauer|zeigen|helfen|sagen wo)\b/.test(n);
  }

  function hasEntryAction(text) {
    const n = normalize(text);
    return /\b(erfassen|eintragen|eingeben|anlegen|erstellen|schreiben|dokumentieren|neu machen|neu erfassen|korrigieren|durchstreichen|stornieren)\b/.test(n);
  }

  function hasNavigationIntent(text) {
    const n = normalize(text);
    return /\b(suche|such|finde|finden|wo ist|wo sind|wo finde|wie komme|ich will zu|ich mochte zu|offnen|oeffnen|aufrufen|ansehen|anschauen|zeigen)\b/.test(n)
      || n.split(' ').length <= 5;
  }

  function inferNavigationGuide(text) {
    const n = normalize(text);
    if (!hasNavigationIntent(n) || hasEntryAction(n)) return '';

    if (/\b(berichtssuche|berichte auswerten|berichte suchen|nach berichten suchen|abfrage)\b/.test(n)) return 'berichtssuche';
    if (/\b(blutdruck|puls|temperatur|blutzucker|sauerstoff|spo2|vitalwert|vitalwerte)\b/.test(n)) return 'vitalwerte';
    if (/\b(bericht|berichte|berichtseintrag)\b/.test(n)) return 'bericht-neu';
    if (/\b(visite|visiten|sprechstunde)\b/.test(n)) return 'visiten-oeffnen';
    if (/\b(medikation|medikament|medikamente|medikationsplan)\b/.test(n)) return 'medikation-ansehen';
    if (/\b(formular|formulare|anfallsprotokoll|fallgesprach|gesprachsprotokoll|sturzprotokoll)\b/.test(n)) return 'formulare-anlegen';
    if (/\b(anwesenheit|abwesenheit|an- und abwesenheit)\b/.test(n)) return 'anwesenheit';
    if (/\b(ubergabe|uebergabe|was war los)\b/.test(n)) return 'uebergabeformular';
    if (/\b(notfallblatt|notfallbogen)\b/.test(n)) return 'notfallblatt';
    if (/\b(durchfuhrungsnachweis|durchfuehrungsnachweis|durchfuhrung|durchfuehrung)\b/.test(n)) return 'durchfuehrungsnachweis-oeffnen';
    if (/\b(aufgaben|aktuelles)\b/.test(n)) return 'aufgaben-aktuelles';
    if (/\b(easy plan|easy-plan|easyplan)\b/.test(n)) return 'easyplan';
    if (/\b(stammdaten)\b/.test(n)) return 'stammdaten';
    return '';
  }

  function rewriteLatestUser(parsed, replacement) {
    if (!Array.isArray(parsed?.messages)) return null;
    const messages = parsed.messages.map(message => ({ ...message }));
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index]?.role !== 'user') continue;
      messages[index].content = replacement;
      return { ...parsed, messages };
    }
    return null;
  }

  function preparedBody(parsed, userText) {
    const activeGuide = String(parsed.guideSlug || '').trim();
    if (activeGuide && helpLike(userText)) {
      const rewritten = rewriteLatestUser(parsed, 'ich finde das nicht');
      if (rewritten) return JSON.stringify({ ...rewritten, smartHelpIntent: true });
    }

    if (!activeGuide && !parsed.selectedGuideSlug) {
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
    inferNavigationGuide,
    preparedBody,
  };
  window.__DOKOHILF_SMART_HELP_V29__ = true;
})();
