(() => {
  'use strict';

  const AI_MARKERS = [
    '/functions/v1/dokohilf-ai',
    '/functions/v1/dokohilf-ai-router',
    '/functions/v1/dokohilf-chat-router',
  ];
  const DURCHFUEHRUNG_ORIENTATION_REVISION = '20260901-spatial-orientation-v59-1';
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

  function isLocationQuestion(text) {
    const n = normalize(text);
    return /\b(wo ist|wo sind|wo finde|wie finde|wie komme|wo muss|wo soll)\b/.test(n)
      || /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
      || /\b(kann|konnte)\b.*\b(nicht finden|nicht sehen|nicht offnen)\b/.test(n)
      || /\b(suche|such)\b.*\b(wo|nicht)\b/.test(n);
  }

  function greenMainBarHelp() {
    return 'Die feste grüne Hauptleiste ist ganz oben im Vivendi-Fenster. Diese feste grüne Leiste enthält unter anderem Doku, Doku-Erweitert, Planung und Analyse. Doku liegt zwischen Planung und Doku-Erweitert. Direkt darunter befindet sich das weiße Funktionsband des ausgewählten Hauptbereichs. Bericht und Durchführungsnachweis gehören unter Doku zu diesem unteren Funktionsband; Bericht ist kein Hauptbereich der grünen Leiste.';
  }

  function whiteFunctionBandHelp() {
    return greenMainBarHelp();
  }

  function dokuTabHelp() {
    return 'Doku ist ein Hauptreiter in der grünen Hauptleiste ganz oben im Vivendi-Fenster. Doku liegt zwischen Planung und Doku-Erweitert. Wenn du Doku auswählst, erscheint direkt darunter das weiße Funktionsband mit den zugehörigen Funktionen. Dort findest du den Durchführungsnachweis.';
  }

  function reportLocationHelp() {
    return 'Bericht ist kein Hauptreiter in der grünen Leiste. Öffne oben in der grünen Hauptleiste Doku. Direkt darunter erscheint das weiße Funktionsband; dort findest du Bericht.';
  }

  function orientationHelp(text) {
    const n = normalize(text);
    const mentionsKnownBar = /\b(feste leiste|hauptleiste|grune leiste|funktionsband|weisse leiste|weisses band|untere leiste|funktionsleiste)\b/.test(n);
    if (!isLocationQuestion(n) && !mentionsKnownBar) return '';

    if (/\b(funktionsband|weisse leiste|weisses band|untere leiste|funktionsleiste)\b/.test(n)) {
      return whiteFunctionBandHelp();
    }
    if (/\b(feste leiste|hauptleiste|grune leiste)\b/.test(n)) {
      return greenMainBarHelp();
    }
    if (/\b(wirksamkeitskontrolle|wirksamkeit).*\b(bedarf|bedarfsmedikation|medikation)\b|\b(bedarf|bedarfsmedikation).*\b(wirksamkeitskontrolle|wirksamkeit)\b/.test(n)) {
      return 'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste Doku. Darunter erscheint der Durchführungsnachweis. Nach der dafür vorgesehenen Zeit findest du dort die automatisch erzeugte Wirksamkeitskontrolle zur Bedarfsmedikation.';
    }
    if (/\b(bedarfsmedikation|bedarfsgabe|bedarfsmedikament|bedarf medikament)\b/.test(n)) {
      return 'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste Doku. Darunter erscheint der Durchführungsnachweis. Dort findest du Bedarfsmedikation. Klicke auf den kleinen Pfeil links daneben, um sie zu öffnen.';
    }
    if (/\b(massnahmen ohne zeitangabe|massnahme ohne zeitangabe)\b/.test(n)) {
      return 'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste Doku. Darunter erscheint der Durchführungsnachweis. Dort findest du den Bereich Maßnahmen ohne Zeitangabe. Klicke auf den kleinen Pfeil links daneben, um ihn zu öffnen.';
    }
    if (/\b(doku erweitert|doku-erweitert)\b/.test(n)) {
      return 'Doku-Erweitert ist ein Hauptreiter in der grünen Hauptleiste ganz oben, direkt rechts von Doku. Nach Auswahl von Doku-Erweitert erscheinen direkt darunter die zugehörigen Funktionen im weißen Funktionsband.';
    }
    if (/\b(durchfuhrungsnachweis|durchfuehrungsnachweis)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku in der grünen Hauptleiste ganz oben. Doku liegt zwischen Planung und Doku-Erweitert. Nach der Auswahl erscheint direkt darunter das weiße Funktionsband; dort findest du den Durchführungsnachweis.';
    }
    if (/\b(vitalwert|vitalwerte|blutdruck|puls|temperatur|blutzucker|sauerstoff|spo2)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku-Erweitert in der festen Leiste. Doku-Erweitert steht ganz oben in der grünen Leiste. Innerhalb von Doku-Erweitert findest du Vitalwerte: Nach der Auswahl erscheinen darunter die Unterpunkte beziehungsweise Symbole, dort wählst du Vitalwerte.';
    }
    if (/\b(visite|visiten|sprechstunde)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku-Erweitert in der festen Leiste. Doku-Erweitert steht ganz oben in der grünen Leiste. Innerhalb von Doku-Erweitert findest du Visiten: Nach der Auswahl erscheinen darunter die Unterpunkte beziehungsweise Symbole, dort wählst du Visiten.';
    }
    if (/\b(medikation|medikament|medikamente|medikationsplan)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku-Erweitert in der festen Leiste. Doku-Erweitert steht ganz oben in der grünen Leiste. Innerhalb von Doku-Erweitert findest du Medikation: Nach der Auswahl erscheinen darunter die Unterpunkte beziehungsweise Symbole, dort wählst du Medikation.';
    }
    if (/\b(formular|formulare|anfallsprotokoll|fallgesprach|gesprachsprotokoll|sturzprotokoll)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku-Erweitert in der festen Leiste. Doku-Erweitert steht ganz oben in der grünen Leiste. Innerhalb von Doku-Erweitert findest du Formulare: Nach der Auswahl erscheinen darunter die Unterpunkte beziehungsweise Symbole, dort wählst du Formulare.';
    }
    if (/\b(anwesenheit|abwesenheit|an- und abwesenheit)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku-Erweitert in der festen Leiste. Doku-Erweitert steht ganz oben in der grünen Leiste. Innerhalb von Doku-Erweitert findest du An-/Abwesenheiten: Nach der Auswahl erscheinen darunter die Unterpunkte beziehungsweise Symbole, dort wählst du An-/Abwesenheiten.';
    }
    if (/\b(bericht|berichte|berichtseintrag)\b/.test(n)) {
      return reportLocationHelp();
    }
    if (/\b(ubergabe|uebergabe|was war los)\b/.test(n)) {
      return 'Öffne oben zuerst Analyse. Analyse steht ganz oben in der festen grünen Leiste. Nach der Auswahl erscheinen darunter die zugehörigen Unterpunkte; dort findest du Was war los. Darüber öffnest du die Übergabeansicht.';
    }
    if (/\bplanung\b/.test(n)) {
      return 'Planung ist ein Hauptbereich ganz oben in der festen grünen Leiste. Wähle dort Planung. Die zugehörigen Unterpunkte beziehungsweise Symbole erscheinen danach direkt darunter. Der genaue Easy-Plan-Ablauf bleibt vorerst offen.';
    }
    if (/\banalyse\b/.test(n)) {
      return 'Den Reiter Analyse findest du oben in der festen grünen Leiste. Nach der Auswahl erscheinen direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole.';
    }
    if (/\b(notfallblatt|notfallbogen|rotes kreuz)\b/.test(n)) {
      return 'Bleibe beim gewünschten Bewohner. Ganz oben links öffnest du über das kleine rote Kreuz beziehungsweise den zugehörigen Pfeil das Menü und wählst Notfallblatt aufrufen.';
    }
    if (/\b(stammdaten|bewohnerubersicht|bewohneruebersicht)\b/.test(n)) {
      return 'Öffne zuerst Bericht oder den Durchführungsnachweis. Beides findest du unter Doku: Wähle ganz oben in der festen grünen Hauptleiste Doku. Direkt darunter erscheint das weiße Funktionsband mit Bericht und Durchführungsnachweis. Dann bleibt links die Bewohnerübersicht sichtbar. Doppelklicke dort auf den gewünschten Bewohner, um die Stammdaten zu öffnen.';
    }
    if (/\bdoku\b/.test(n)) {
      return dokuTabHelp();
    }
    return '';
  }

  function currentGuide(parsed) {
    const uiGuide = window.DokoHilfGuideProgress?.getCurrentGuide?.();
    return {
      guideSlug: String(parsed?.guideSlug || uiGuide?.guideSlug || '').trim() || null,
      guideTitle: String(uiGuide?.guideTitle || '').trim() || undefined,
      guideStep: Number(uiGuide?.guideStep || parsed?.guideStep || 0) || undefined,
      guideStepCount: Number(uiGuide?.guideStepCount || parsed?.guideStepCount || 0) || undefined,
    };
  }

  function payloadFor(parsed, spokenText, source = 'confirmed-area-orientation-v29-4') {
    if (!spokenText) return null;
    const guide = currentGuide(parsed);
    return {
      reply: `${spokenText}\n\nFindest du es damit?`,
      spokenText,
      guideSlug: guide.guideSlug,
      ...(guide.guideTitle ? { guideTitle: guide.guideTitle } : {}),
      ...(guide.guideStep ? { guideStep: guide.guideStep } : {}),
      ...(guide.guideStepCount ? { guideStepCount: guide.guideStepCount } : {}),
      completed: false,
      source,
    };
  }

  function responseFor(parsed, text) {
    return payloadFor(parsed, orientationHelp(text));
  }

  function isDurchfuehrungsDokuStep(parsed) {
    const guide = currentGuide(parsed);
    const slug = String(guide.guideSlug || '');
    const step = Number(guide.guideStep || 0);
    return (slug === 'durchfuehrungsnachweis-oeffnen' && step === 1)
      || (slug === 'durchfuehrungsnachweis-finden' && step === 2);
  }

  function durchfuehrungsStepOrientation(parsed, text) {
    if (!isDurchfuehrungsDokuStep(parsed)) return null;
    const n = normalize(text);

    if (/\b(funktionsband|weisse leiste|weisses band|untere leiste|funktionsleiste)\b/.test(n)) {
      return payloadFor(parsed, whiteFunctionBandHelp(), 'confirmed-spatial-orientation-v59');
    }

    // Im laufenden Doku-Schritt ist mit „Leiste“ eindeutig die zuvor genannte
    // grüne Hauptleiste gemeint. Deshalb nicht an generisches Smart Help delegieren.
    if (isLocationQuestion(n) && /\bleiste\b/.test(n)) {
      return payloadFor(parsed, greenMainBarHelp(), 'confirmed-durchfuehrung-orientation-v57');
    }

    if (/\breiter\b/.test(n) && /\b(was|welcher|welche|welches|meinst|bedeutet)\b/.test(n)) {
      return payloadFor(parsed, dokuTabHelp(), 'confirmed-durchfuehrung-orientation-v57');
    }

    const asksAboutConfirmedDokuOrientation = /\b(doku|feste leiste|hauptleiste|grune leiste)\b/.test(n)
      || (isLocationQuestion(n) && /\b(leiste|doku)\b/.test(n));
    if (!asksAboutConfirmedDokuOrientation) return null;

    const spokenText = /\bdoku\b/.test(n) ? dokuTabHelp() : orientationHelp(text);
    return payloadFor(parsed, spokenText, 'confirmed-durchfuehrung-orientation-v57');
  }

  function smartHelpBody(parsed, text) {
    const prepared = window.DokoHilfSmartHelpV29?.preparedBody?.(parsed, text);
    if (typeof prepared !== 'string' || !prepared) return '';
    const candidate = parseBody(prepared);
    if (!candidate) return '';
    if (!candidate.selectedGuideSlug && !candidate.smartHelpIntent && !candidate.smartTaskIntent && !candidate.smartNavigationIntent) return '';
    return prepared;
  }

  function localResponse(payload, header = 'confirmed-v29-4') {
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-DokoHilf-Orientation': header,
      },
    });
  }

  window.fetch = async (input, init = {}) => {
    if (!isAiRequest(input, init)) return previousFetch(input, init);
    const parsed = parseBody(init.body);
    if (!parsed) return previousFetch(input, init);
    const userText = latestUser(parsed);

    const scopedOrientation = durchfuehrungsStepOrientation(parsed, userText);
    if (scopedOrientation) return localResponse(scopedOrientation, 'durchfuehrung-v57');

    const delegatedBody = smartHelpBody(parsed, userText);
    if (delegatedBody) return previousFetch(input, { ...init, body: delegatedBody });
    const payload = responseFor(parsed, userText);
    if (!payload) return previousFetch(input, init);
    return localResponse(payload);
  };

  window.DokoHilfOrientationHelpV29 = {
    revision: DURCHFUEHRUNG_ORIENTATION_REVISION,
    normalize,
    isLocationQuestion,
    greenMainBarHelp,
    whiteFunctionBandHelp,
    dokuTabHelp,
    reportLocationHelp,
    orientationHelp,
    responseFor,
    isDurchfuehrungsDokuStep,
    durchfuehrungsStepOrientation,
    smartHelpBody,
  };
  window.__DOKOHILF_ORIENTATION_HELP_V29__ = true;
})();
