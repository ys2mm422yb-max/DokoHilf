(() => {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const LEGACY_ROUTER_MARKER = '/functions/v1/dokohilf-ai-router';
  const CHAT_ROUTER_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-chat-router';
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

  function requestUrl(input) {
    return typeof input === 'string' ? input : input?.url;
  }

  function isAiRequest(input) {
    const url = requestUrl(input);
    return typeof url === 'string' && url.includes('/functions/v1/dokohilf-ai');
  }

  function rewriteRouterInput(input) {
    const url = requestUrl(input);
    if (typeof url !== 'string' || !url.includes(LEGACY_ROUTER_MARKER)) return input;
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

    const rewritten = stripLeadingGreeting(last.content);
    if (!rewritten || rewritten === last.content.trim()) return body;

    last.content = rewritten;
    return JSON.stringify({ ...parsed, messages });
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
    window.__DOKOHILF_CONTEXT_AWARE_CHAT_ROUTER_V28__ = true;
  }

  root.DokoHilfRouting = {
    normalize,
    stripLeadingGreeting,
    rewriteRequestBody,
    rewriteRouterInput,
    chatRouterEndpoint: CHAT_ROUTER_ENDPOINT,
    installFetchPatch,
  };

  installFetchPatch();
})();
