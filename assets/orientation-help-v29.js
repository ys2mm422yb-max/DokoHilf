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
    if (!isLocationQuestion(n) && !/\b(feste leiste|hauptleiste)\b/.test(n)) return '';

    if (/\b(feste leiste|hauptleiste)\b/.test(n)) {
      return 'Die feste Leiste gehört zur geöffneten Bewohneransicht. Dort findest du die Hauptbereiche Berichte, Doku und Doku-Erweitert.';
    }
    if (/\b(doku erweitert|doku-erweitert)\b/.test(n)) {
      return 'Bleibe beim geöffneten Bewohner. Doku-Erweitert ist ein Hauptbereich in der festen Leiste, auf derselben Ebene wie Berichte und Doku.';
    }
    if (/\b(durchfuhrungsnachweis|durchfuehrungsnachweis)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku in der festen Leiste. Innerhalb von Doku findest du den Durchführungsnachweis.';
    }
    if (/\b(vitalwert|vitalwerte|blutdruck|puls|temperatur|blutzucker|sauerstoff|spo2)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku-Erweitert in der festen Leiste. Innerhalb von Doku-Erweitert findest du Vitalwerte.';
    }
    if (/\b(visite|visiten|sprechstunde)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku-Erweitert in der festen Leiste. Innerhalb von Doku-Erweitert findest du Visiten.';
    }
    if (/\b(medikation|medikament|medikamente|medikationsplan)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku-Erweitert in der festen Leiste. Innerhalb von Doku-Erweitert findest du Medikation.';
    }
    if (/\b(formular|formulare|anfallsprotokoll|fallgesprach|gesprachsprotokoll|sturzprotokoll)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku-Erweitert in der festen Leiste. Innerhalb von Doku-Erweitert findest du Formulare.';
    }
    if (/\b(anwesenheit|abwesenheit|an- und abwesenheit)\b/.test(n)) {
      return 'Öffne beim gewünschten Bewohner zuerst Doku-Erweitert in der festen Leiste. Innerhalb von Doku-Erweitert findest du An-/Abwesenheiten.';
    }
    if (/\b(bericht|berichte|berichtseintrag)\b/.test(n)) {
      return 'Bleibe beim geöffneten Bewohner. Berichte ist ein Hauptbereich in der festen Leiste, auf derselben Ebene wie Doku und Doku-Erweitert.';
    }
    if (/\b(ubergabe|uebergabe|was war los)\b/.test(n)) {
      return 'Öffne oben zuerst Analyse. Innerhalb von Analyse findest du Was war los. Darüber öffnest du die Übergabeansicht.';
    }
    if (/\banalyse\b/.test(n)) {
      return 'Den Reiter Analyse findest du oben.';
    }
    if (/\b(notfallblatt|notfallbogen|rotes kreuz)\b/.test(n)) {
      return 'Bleibe beim gewünschten Bewohner. Ganz oben links öffnest du über das kleine rote Kreuz beziehungsweise den zugehörigen Pfeil das Menü und wählst Notfallblatt aufrufen.';
    }
    if (/\b(stammdaten|bewohnerubersicht|bewohneruebersicht)\b/.test(n)) {
      return 'Öffne zuerst Berichte oder den Durchführungsnachweis. Dann bleibt links die Bewohnerübersicht sichtbar. Doppelklicke dort auf den gewünschten Bewohner, um die Stammdaten zu öffnen.';
    }
    if (/\bdoku\b/.test(n)) {
      return 'Bleibe beim geöffneten Bewohner. Doku ist ein Hauptbereich in der festen Leiste, auf derselben Ebene wie Berichte und Doku-Erweitert.';
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
      source: 'confirmed-area-orientation-v29-2',
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
        'X-DokoHilf-Orientation': 'confirmed-v29-2',
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
