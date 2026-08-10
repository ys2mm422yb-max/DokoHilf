(() => {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const AI_ROUTER_MARKER = '/functions/v1/dokohilf-ai';
  const CHAT_ROUTER_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-conversation-router';
  const ROUTING_REVISION = '20260810-natural-guide-completions-v40-1';
  const GREETINGS = [
    'guten morgen',
    'guten abend',
    'guten tag',
    'hallo',
    'servus',
    'moin',
    'hey',
    'hi',
  ];

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function stripLeadingGreeting(value) {
    const normalized = normalize(value);
    for (const greeting of GREETINGS) {
      if (normalized === greeting) return String(value || '').trim();
      if (normalized.startsWith(`${greeting} `)) {
        const remainder = normalized.slice(greeting.length).trim();
        return remainder || String(value || '').trim();
      }
    }
    return String(value || '').trim();
  }

  function hasCreateIntent(value) {
    const text = normalize(value);
    return /\b(anlegen|erstellen|dokumentieren|erfassen|eintragen|schreiben|verfassen|abhaken|kontrollieren)\b/.test(text)
      || /\b(lege|legst|legt|leg)\b.*\ban\b/.test(text)
      || /\b(trage|tragst|tragt|trag)\b.*\bein\b/.test(text)
      || /\b(erstelle|erstellst|erstellt|erstell)\b/.test(text)
      || /\b(dokumentiere|dokumentierst|dokumentiert|dokumentier)\b/.test(text)
      || /\b(erfasse|erfasst|erfass)\b/.test(text)
      || /\b(schreibe|schreibst|schreibt|schreib)\b/.test(text);
  }

  function hasOpenIntent(value) {
    const text = normalize(value);
    return /\b(offnen|ansehen|anschauen|nachsehen|aufrufen|finden|zeigen|suchen)\b/.test(text)
      || /\b(offne|offnest|offnet|offn)\b/.test(text)
      || /\b(rufe|rufst|ruft|ruf)\b.*\bauf\b/.test(text)
      || /\b(sehe|siehst|sieht|seh)\b.*\ban\b/.test(text)
      || /\b(schaue|schaust|schaut|schau)\b.*\ban\b/.test(text)
      || /\b(wo|wie)\b.*\b(finde|findest|finden|komme)\b/.test(text);
  }

  function inferSelectedGuideSlug(value) {
    const text = normalize(value);
    if (!text) return '';

    if (/\bfolgebericht\b/.test(text)) return 'bericht-folgebericht';

    if (/\b(visite|visiten|sprechstunde|arztvisite)\b/.test(text) && hasCreateIntent(text)) {
      return 'visite-anlegen';
    }

    if (/\b(bericht|berichtseintrag|pflegebericht)\b/.test(text) && hasCreateIntent(text)) {
      return 'bericht-neu';
    }

    if (/\b(anwesenheit|abwesenheit|an- und abwesenheit)\b/.test(text) && hasCreateIntent(text)) {
      return 'anwesenheit';
    }

    if (/\b(formular|formulare|anfallsprotokoll|fallgesprach|gesprachsprotokoll|sturzprotokoll)\b/.test(text) && hasCreateIntent(text)) {
      return 'formulare-anlegen';
    }

    if (/\bbedarfsmedikation\b/.test(text)) {
      if (hasOpenIntent(text)) return 'bedarfsmedikation-finden';
      if (hasCreateIntent(text) || /\b(gabe|geben|machen)\b/.test(text)) return 'bedarfsmedikation-gabe';
    }

    if (/\bwirksamkeitskontrolle\b/.test(text)) {
      if (hasOpenIntent(text)) return 'bedarfsmedikation-wirksamkeitskontrolle-finden';
      if (hasCreateIntent(text) || /\b(wirksamkeit|wirkung|machen)\b/.test(text)) {
        return 'bedarfsmedikation-wirksamkeitskontrolle';
      }
    }

    if (/\bmassnahmen ohne zeitangabe\b/.test(text)) {
      if (hasOpenIntent(text)) return 'massnahmen-ohne-zeitangabe-finden';
      if (hasCreateIntent(text) || /\bmachen\b/.test(text)) return 'massnahmen-ohne-zeitangabe';
    }

    if (/\b(durchfuhrungsnachweis|durchfuehrungsnachweis)\b/.test(text) && hasOpenIntent(text)) {
      return 'durchfuehrungsnachweis-oeffnen';
    }

    if (/\b(medikation|medikationsplan|medikamente)\b/.test(text)
      && hasOpenIntent(text)
      && !/\b(andern|verandern|absetzen|pausieren|fortsetzen|loschen|korrigieren|dosieren|erhohen|senken)\b/.test(text)) {
      return 'medikation-ansehen';
    }

    if (/\b(notfallblatt|notfallbogen)\b/.test(text) && (hasOpenIntent(text) || /^notfallblatt$/.test(text))) {
      return 'notfallblatt';
    }

    if (/\b(ubergabe|was war los|schichtubergabe)\b/.test(text) && (hasOpenIntent(text) || /\bubergabe\b/.test(text))) {
      return 'uebergabeformular';
    }

    return '';
  }

  function requestUrl(input) {
    return typeof input === 'string' ? input : input?.url;
  }

  function isAiRequest(input) {
    const url = requestUrl(input);
    return typeof url === 'string' && url.includes(AI_ROUTER_MARKER);
  }

  function isLocalUiSurface() {
    if (typeof window === 'undefined' || !window.location) return false;
    return /^(localhost|127\.0\.0\.1)$/.test(String(window.location.hostname || ''));
  }

  function rewriteRouterInput(input) {
    const url = requestUrl(input);
    if (typeof url !== 'string' || !url.includes(AI_ROUTER_MARKER) || isLocalUiSurface()) return input;
    if (typeof input === 'string') return CHAT_ROUTER_ENDPOINT;
    try { return new Request(CHAT_ROUTER_ENDPOINT, input); }
    catch { return CHAT_ROUTER_ENDPOINT; }
  }

  function rewriteRequestBody(body) {
    if (typeof body !== 'string' || !body) return body;
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return body;
    }
    if (!Array.isArray(parsed.messages) || !parsed.messages.length) return body;

    const messages = parsed.messages.map((message) => ({ ...message }));
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'user' || typeof last.content !== 'string') return body;

    let changed = false;
    const rewritten = stripLeadingGreeting(last.content);
    if (rewritten && rewritten !== last.content.trim()) {
      last.content = rewritten;
      changed = true;
    }

    const routingText = rewritten || last.content;
    const selectedGuideSlug = !parsed.guideSlug && !parsed.selectedGuideSlug
      ? inferSelectedGuideSlug(routingText)
      : '';
    if (selectedGuideSlug) changed = true;

    if (!changed) return body;
    return JSON.stringify({
      ...parsed,
      ...(selectedGuideSlug ? { selectedGuideSlug } : {}),
      clientRoutingRevision: ROUTING_REVISION,
      messages,
    });
  }

  function installFetchPatch() {
    if (typeof window === 'undefined' || window.__DOKOHILF_GREETING_ROUTING_PATCH__) return;
    const previousFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
      const routedInput = rewriteRouterInput(input);
      if (!isAiRequest(input)) return previousFetch(routedInput, init);
      return previousFetch(routedInput, {
        ...init,
        body: rewriteRequestBody(init.body),
      });
    };
    window.__DOKOHILF_GREETING_ROUTING_PATCH__ = true;
    window.__DOKOHILF_CONTEXT_AWARE_CHAT_ROUTER_V28__ = !isLocalUiSurface();
  }

  root.DokoHilfRouting = {
    normalize,
    stripLeadingGreeting,
    hasCreateIntent,
    hasOpenIntent,
    inferSelectedGuideSlug,
    rewriteRequestBody,
    rewriteRouterInput,
    chatRouterEndpoint: CHAT_ROUTER_ENDPOINT,
    revision: ROUTING_REVISION,
    installFetchPatch,
  };

  installFetchPatch();
})();