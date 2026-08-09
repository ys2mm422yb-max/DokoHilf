(() => {
  'use strict';

  const AI_MARKERS = [
    '/functions/v1/dokohilf-ai',
    '/functions/v1/dokohilf-ai-router',
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

  function isLocationQuestion(text) {
    const n = normalize(text);
    return /\b(wo ist|wo sind|wo finde|wie finde|wie komme|wo muss|wo soll)\b/.test(n)
      || /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
      || /\b(kann|konnte)\b.*\b(nicht finden|nicht sehen|nicht offnen)\b/.test(n)
      || /\b(suche|such)\b.*\b(wo|nicht)\b/.test(n);
  }

  function orientationHelp(text) {
    const n = normalize(text);
    if (!isLocationQuestion(n) && !/\b(feste leiste|hauptleiste|grune leiste)\b/.test(n)) return '';

    if (/\b(feste leiste|hauptleiste|grune leiste)\b/.test(n)) {
      return 'Die feste grüne Leiste ist ganz oben. Dort findest du die Hauptbereiche Berichte, Doku-Erweitert, Doku, Planung und Analyse. Wenn du einen Hauptbereich auswählst, erscheinen direkt darunter die dazugehörigen Unterpunkte beziehungsweise Symbole.';
    }
    if (/\b(wirksamkeitskontrolle|wirksamkeit).*\b(bedarf|bedarfsmedikation|medikation)\b|\b(bedarf|bedarfsmedikation).*\b(wirksamkeitskontrolle|wirksamkeit)\b/.test(n)) {
      return 'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste Doku. Darunter erscheint der Durchführungsnachweis. Nach der dafür vorgesehenen Zeit findest du dort die automatisch erzeugte Wirksamkeitskontrolle zur Bedarfsmedikation.';
    }
    if (/\b(bedarfsmedikation|bedarfsgabe|bedarfsmedikament|bedarf medikament)\b/.test(n)) {
      return 'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste Doku. Darunter erscheint der Durchführungsnachweis. Dort findest du Bedarfsmedikation. Klicke auf den kleinen Pfeil links daneben, um sie zu öffnen.';
    }
    if (/\b(massnahmen ohne zeitangabe|massnahme ohne zeitangabe)\b/.test(n)) {
      return 'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste Doku. Darunter erscheint der Durchführungsnachweis. Dort findest du den Bereich Maßnahmen ohne Zeitangabe.';
    }
    if (/\b(doku erweitert|doku-erweitert)\b/.test(n)) {
      return 'Doku-Erweitert ist ein Hauptbereich in der festen Leiste, auf derselben Ebene wie Berichte und Doku. Die feste Leiste ist ganz oben und grün; dort stehen außerdem Planung und Analyse. Nach Auswahl von Doku-Erweitert erscheinen direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole.';
    }
    if (/\b(durchfuhrungsnachweis|durchfuehrungsnachweis)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku in der festen Leiste. Doku steht ganz oben in der grünen Leiste. Nach der Auswahl erscheinen darunter die zugehörigen Unterpunkte; dort findest du den Durchführungsnachweis.';
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
      return 'Bleibe beim geöffneten Bewohner. Berichte ist ein Hauptbereich in der festen Leiste, auf derselben Ebene wie Doku und Doku-Erweitert. Die feste Leiste ist ganz oben und grün; dort stehen auch Planung und Analyse.';
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
      return 'Öffne zuerst Berichte oder den Durchführungsnachweis. Für den Durchführungsnachweis wählst du ganz oben in der festen grünen Leiste Doku und danach den darunter erscheinenden Durchführungsnachweis. Dann bleibt links die Bewohnerübersicht sichtbar. Doppelklicke dort auf den gewünschten Bewohner, um die Stammdaten zu öffnen.';
    }
    if (/\bdoku\b/.test(n)) {
      return 'Bleibe beim geöffneten Bewohner. Doku ist ein Hauptbereich in der festen Leiste, auf derselben Ebene wie Berichte und Doku-Erweitert. Die feste Leiste ist ganz oben und grün; dort stehen außerdem Planung und Analyse. Nach Auswahl von Doku erscheinen direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole.';
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

  function responseFor(parsed, text) {
    const spokenText = orientationHelp(text);
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
      source: 'confirmed-area-orientation-v29-4',
    };
  }

  window.fetch = async (input, init = {}) => {
    if (!isAiRequest(input, init)) return previousFetch(input, init);
    const parsed = parseBody(init.body);
    if (!parsed) return previousFetch(input, init);
    const payload = responseFor(parsed, latestUser(parsed));
    if (!payload) return previousFetch(input, init);
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-DokoHilf-Orientation': 'confirmed-v29-4',
      },
    });
  };

  window.DokoHilfOrientationHelpV29 = {
    normalize,
    isLocationQuestion,
    orientationHelp,
    responseFor,
  };
  window.__DOKOHILF_ORIENTATION_HELP_V29__ = true;
})();
