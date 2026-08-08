(() => {
  'use strict';

  const AI_MARKER = '/functions/v1/dokohilf-ai';
  const SPEECH_CONTEXT_MS = 5000;
  let latestSpeech = null;

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function captureSpeechResult(event) {
    const result = event.results?.[0];
    if (!result) return;
    const alternatives = [];
    let confidence = 0;
    for (let index = 0; index < Math.min(result.length || 0, 3); index += 1) {
      const alternative = result[index];
      const transcript = String(alternative?.transcript || '').trim();
      if (!transcript) continue;
      if (!alternatives.some(item => normalize(item) === normalize(transcript))) alternatives.push(transcript);
      if (index === 0 && Number.isFinite(alternative?.confidence)) confidence = Number(alternative.confidence);
    }
    if (!alternatives.length) return;
    latestSpeech = { alternatives, confidence, capturedAt: Date.now() };
  }

  function wrapRecognitionConstructor(name) {
    const NativeRecognition = window[name];
    if (typeof NativeRecognition !== 'function' || NativeRecognition.__dokohilfWrapped) return;

    function DokoHilfRecognition(...args) {
      const instance = new NativeRecognition(...args);
      try { instance.maxAlternatives = 3; } catch { /* Browser entscheidet selbst. */ }
      instance.addEventListener?.('result', captureSpeechResult);
      return instance;
    }

    try {
      Object.setPrototypeOf(DokoHilfRecognition, NativeRecognition);
      DokoHilfRecognition.prototype = NativeRecognition.prototype;
      DokoHilfRecognition.__dokohilfWrapped = true;
      window[name] = DokoHilfRecognition;
    } catch {
      // Die Routerlogik funktioniert auch ohne Alternativen weiter.
    }
  }

  function isAiRequest(input) {
    const url = typeof input === 'string' ? input : input?.url;
    return typeof url === 'string' && url.includes(AI_MARKER) && !url.includes('dokohilf-ai-router');
  }

  function augmentRequestBody(body) {
    if (typeof body !== 'string' || !latestSpeech) return body;
    if (Date.now() - latestSpeech.capturedAt > SPEECH_CONTEXT_MS) {
      latestSpeech = null;
      return body;
    }

    try {
      const parsed = JSON.parse(body);
      const lastUser = Array.isArray(parsed.messages)
        ? [...parsed.messages].reverse().find(message => message?.role === 'user')?.content
        : '';
      const primary = latestSpeech.alternatives[0] || '';
      if (!lastUser || normalize(lastUser) !== normalize(primary)) return body;

      const augmented = JSON.stringify({
        ...parsed,
        inputMode: 'voice',
        speechAlternatives: latestSpeech.alternatives,
        speechConfidence: latestSpeech.confidence,
      });
      latestSpeech = null;
      return augmented;
    } catch {
      return body;
    }
  }

  function installFetchContext() {
    if (window.__DOKOHILF_CONVERSATION_INTELLIGENCE__) return;
    const previousFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
      if (!isAiRequest(input)) return previousFetch(input, init);
      return previousFetch(input, { ...init, body: augmentRequestBody(init.body) });
    };
    window.__DOKOHILF_CONVERSATION_INTELLIGENCE__ = true;
  }

  wrapRecognitionConstructor('SpeechRecognition');
  wrapRecognitionConstructor('webkitSpeechRecognition');
  installFetchContext();

  window.DokoHilfConversationIntelligence = {
    normalize,
    captureSpeechResult,
    augmentRequestBody,
  };
})();
