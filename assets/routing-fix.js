(() => {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
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

  function isAiRequest(input) {
    const url = typeof input === 'string' ? input : input?.url;
    return typeof url === 'string' && url.includes('/functions/v1/dokohilf-ai');
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
      if (!isAiRequest(input)) return previousFetch(input, init);
      return previousFetch(input, {
        ...init,
        body: rewriteRequestBody(init.body),
      });
    };
    window.__DOKOHILF_GREETING_ROUTING_PATCH__ = true;
  }

  root.DokoHilfRouting = {
    normalize,
    stripLeadingGreeting,
    rewriteRequestBody,
    installFetchPatch,
  };

  installFetchPatch();
})();
