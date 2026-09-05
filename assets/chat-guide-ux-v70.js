(() => {
  'use strict';

  if (window.__DOKOHILF_CHAT_GUIDE_UX_V70__) return;

  const REVISION = '20260905-chat-guide-back-dictation-v70-1';
  const AI_MARKERS = [
    '/functions/v1/dokohilf-ai',
    '/functions/v1/dokohilf-ai-router',
    '/functions/v1/dokohilf-chat-router',
  ];
  const previousFetch = window.fetch.bind(window);
  let dictation = null;
  let dictationHadResult = false;
  let dictationHadError = false;
  let dictationResetTimer = 0;

  function normalize(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizedLower(value) {
    return normalize(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss');
  }

  function requestUrl(input) {
    return typeof input === 'string' ? input : input?.url;
  }

  function isAiRequest(input, init = {}) {
    const url = requestUrl(input);
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return typeof url === 'string' && method === 'POST' && AI_MARKERS.some(marker => url.includes(marker));
  }

  function parseBody(body) {
    if (typeof body !== 'string' || !body) return null;
    try { return JSON.parse(body); } catch { return null; }
  }

  function latestUser(parsed) {
    if (!Array.isArray(parsed?.messages)) return '';
    return [...parsed.messages].reverse().find(message => message?.role === 'user')?.content || '';
  }

  function currentGuide(parsed = {}) {
    const uiGuide = window.DokoHilfGuideProgress?.getCurrentGuide?.();
    return {
      guideSlug: String(parsed.guideSlug || uiGuide?.guideSlug || '').trim(),
      guideTitle: String(uiGuide?.guideTitle || '').trim(),
      guideStep: Number(uiGuide?.guideStep || parsed.guideStep || 0) || 0,
      guideStepCount: Number(uiGuide?.guideStepCount || parsed.guideStepCount || 0) || 0,
    };
  }

  function isAmbiguousDokuErweitertMention(text) {
    const n = normalizedLower(text);
    if (!/\bdoku(?:\s*-\s*|\s+)erweitert\b/.test(n)) return false;
    return !/\b(ja|nein|geoffnet|offen|gefunden|erledigt|weiter|fertig|passt|da|dort|zuruck|nochmal)\b/.test(n);
  }

  function confirmedGuideOrientationPayload(parsed, text) {
    const guide = currentGuide(parsed);
    const api = window.DokoHilfOrientationHelpV29;
    if (!guide.guideSlug || !api) return null;
    const isLocationQuestion = api.isLocationQuestion?.(text) === true;
    const ambiguousDokuErweitert = isAmbiguousDokuErweitertMention(text);
    if (!isLocationQuestion && !ambiguousDokuErweitert) return null;
    const orientationText = isLocationQuestion ? text : 'Wo ist Doku-Erweitert';
    const payload = api.responseFor?.(parsed, orientationText);
    if (!payload?.spokenText) return null;
    return {
      ...payload,
      guideSlug: guide.guideSlug,
      ...(guide.guideTitle ? { guideTitle: guide.guideTitle } : {}),
      ...(guide.guideStep ? { guideStep: guide.guideStep } : {}),
      ...(guide.guideStepCount ? { guideStepCount: guide.guideStepCount } : {}),
      completed: false,
      source: 'confirmed-guide-orientation-v70',
    };
  }

  function localOrientationResponse(payload) {
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-DokoHilf-Orientation': 'guide-v70',
      },
    });
  }

  window.fetch = async (input, init = {}) => {
    if (!isAiRequest(input, init)) return previousFetch(input, init);
    const parsed = parseBody(init.body);
    if (!parsed) return previousFetch(input, init);
    const payload = confirmedGuideOrientationPayload(parsed, latestUser(parsed));
    if (payload) return localOrientationResponse(payload);
    return previousFetch(input, init);
  };

  function guideStep() {
    const current = window.DokoHilfGuideProgress?.getCurrentGuide?.();
    if (Number(current?.guideStep) >= 1) return Number(current.guideStep);
    const visible = document.getElementById('guideProgressStep')?.textContent || '';
    const match = visible.match(/Schritt\s+(\d+)/i);
    return Number(match?.[1] || 0);
  }

  function applyStepBackButton(button) {
    if (!(button instanceof HTMLElement)) return;
    const step = guideStep();
    button.dataset.v70StepBack = 'true';
    if (button.textContent !== 'Schritt zurück') button.textContent = 'Schritt zurück';
    button.setAttribute('aria-label', 'Einen Schritt zurück');
    button.title = step === 1 ? 'Du bist bereits beim ersten Schritt.' : 'Zum vorherigen Schritt';
    button.disabled = step === 1;
  }

  function refreshStepBackButtons() {
    document.querySelectorAll('[data-v54-step-help]').forEach(applyStepBackButton);
  }

  function requestStepBack() {
    const current = window.DokoHilfGuideProgress?.getCurrentGuide?.();
    if (Number(current?.guideStep || 0) <= 1) return false;
    const api = window.DokoHilf;
    if (!api?.sendMessage) return false;
    const fromVoice = document.getElementById('appShell')?.dataset.mode === 'voice';
    api.sendMessage('zurück', { fromVoice });
    return true;
  }

  function installStepBackCapture() {
    document.addEventListener('click', event => {
      const button = event.target?.closest?.('[data-v54-step-help]');
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      applyStepBackButton(button);
      if (!button.disabled) requestStepBack();
    }, true);
  }

  function installStyles() {
    if (document.getElementById('chatGuideUxV70Styles')) return;
    const style = document.createElement('style');
    style.id = 'chatGuideUxV70Styles';
    style.textContent = `
      [data-v54-step-help][data-v70-step-back="true"]{white-space:nowrap}
      [data-v54-step-help][data-v70-step-back="true"]::before{display:none!important;content:none!important}
      [data-v54-step-help][data-v70-step-back="true"]:disabled{cursor:not-allowed;opacity:.42;transform:none!important}
      #smallMicButton[data-dictation-state="listening"]{outline:2px solid rgba(74,232,178,.72);outline-offset:2px;background:rgba(22,155,113,.22)}
      #smallMicButton[data-dictation-state="listening"] svg{animation:dokohilfDictationPulse 1s ease-in-out infinite alternate}
      .chat-dictation-status{margin:4px 8px 0;color:#91b7aa;font-size:10.5px;font-weight:700;line-height:1.35;text-align:left}
      .chat-dictation-status[data-state="error"]{color:#e9adad}
      @keyframes dokohilfDictationPulse{from{transform:scale(.94);opacity:.72}to{transform:scale(1.05);opacity:1}}
    `;
    document.head.append(style);
  }

  function ensureDictationStatus() {
    let status = document.getElementById('chatDictationStatus');
    if (status) return status;
    const form = document.getElementById('chatForm');
    if (!form?.parentElement) return null;
    status = document.createElement('div');
    status.id = 'chatDictationStatus';
    status.className = 'chat-dictation-status';
    status.setAttribute('aria-live', 'polite');
    status.hidden = true;
    form.insertAdjacentElement('afterend', status);
    return status;
  }

  function setDictationState(state, message = '') {
    const mic = document.getElementById('smallMicButton');
    const status = ensureDictationStatus();
    if (mic) {
      mic.dataset.dictationState = state;
      mic.setAttribute('aria-pressed', state === 'listening' ? 'true' : 'false');
      mic.setAttribute('aria-label', state === 'listening' ? 'Diktat beenden' : 'Frage diktieren');
      mic.title = state === 'listening' ? 'Sprich jetzt. Noch einmal tippen beendet das Diktat.' : 'Sprache in das Textfeld diktieren';
    }
    if (status) {
      status.dataset.state = state;
      status.textContent = message;
      status.hidden = !message;
    }
  }

  function clearDictationResetTimer() {
    if (!dictationResetTimer) return;
    window.clearTimeout(dictationResetTimer);
    dictationResetTimer = 0;
  }

  function scheduleDictationReset(delay = 3200) {
    clearDictationResetTimer();
    dictationResetTimer = window.setTimeout(() => {
      if (!dictation) setDictationState('idle', '');
      dictationResetTimer = 0;
    }, delay);
  }

  function insertDictationText(input, transcript) {
    if (!(input instanceof HTMLTextAreaElement)) return '';
    const clean = normalize(transcript);
    if (!clean) return input.value;
    const current = String(input.value || '');
    const start = Number.isInteger(input.selectionStart) ? input.selectionStart : current.length;
    const end = Number.isInteger(input.selectionEnd) ? input.selectionEnd : start;
    const before = current.slice(0, start);
    const after = current.slice(end);
    const needsBeforeSpace = before && !/\s$/.test(before);
    const needsAfterSpace = after && !/^\s/.test(after);
    let next = `${before}${needsBeforeSpace ? ' ' : ''}${clean}${needsAfterSpace ? ' ' : ''}${after}`;
    const maxLength = Number(input.maxLength || 350);
    if (maxLength > 0) next = next.slice(0, maxLength);
    input.value = next;
    const caret = Math.min(next.length, before.length + (needsBeforeSpace ? 1 : 0) + clean.length);
    try { input.setSelectionRange(caret, caret); } catch { /* iOS may update selection after focus */ }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
    return next;
  }

  function dictationErrorMessage(code) {
    if (code === 'not-allowed' || code === 'service-not-allowed') {
      return 'Mikrofonzugriff nicht erlaubt. Erlaube ihn für DokoHilf oder nutze das Mikrofon der Tastatur.';
    }
    if (code === 'no-speech') return 'Ich habe nichts erkannt. Tippe erneut auf das Mikrofon und sprich dann los.';
    if (code === 'audio-capture') return 'Das Mikrofon ist gerade nicht verfügbar.';
    if (code === 'network') return 'Die Spracheingabe ist gerade nicht verfügbar. Versuch es erneut oder nutze das Mikrofon der Tastatur.';
    return 'Die Spracheingabe konnte nicht gestartet werden. Versuch es erneut oder nutze das Mikrofon der Tastatur.';
  }

  function stopDictation() {
    if (!dictation) return false;
    setDictationState('processing', 'Diktat wird beendet …');
    try { dictation.stop(); } catch { /* already ending */ }
    return true;
  }

  function startDictation() {
    if (dictation) return stopDictation();
    const appShell = document.getElementById('appShell');
    const input = document.getElementById('chatInput');
    if (appShell?.dataset.mode !== 'chat' || !(input instanceof HTMLTextAreaElement)) return false;

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setDictationState('error', 'Direkte Spracheingabe ist in diesem Browser nicht verfügbar. Nutze das Mikrofon der Tastatur.');
      input.focus();
      scheduleDictationReset(5000);
      return false;
    }

    clearDictationResetTimer();
    const recognition = new Recognition();
    dictation = recognition;
    dictationHadResult = false;
    dictationHadError = false;
    recognition.lang = 'de-DE';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 5;

    recognition.onstart = () => setDictationState('listening', 'Sprich jetzt. Der erkannte Text erscheint hier im Schreibchat und wird noch nicht gesendet.');
    recognition.onresult = event => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (!normalize(transcript)) return;
      dictationHadResult = true;
      insertDictationText(input, transcript);
      setDictationState('done', 'Text übernommen. Du kannst ihn prüfen, ändern und dann auf Senden tippen.');
    };
    recognition.onerror = event => {
      dictationHadError = true;
      setDictationState('error', dictationErrorMessage(String(event?.error || '')));
    };
    recognition.onend = () => {
      if (dictation === recognition) dictation = null;
      if (!dictationHadResult && !dictationHadError) setDictationState('idle', 'Diktat beendet. Tippe erneut auf das Mikrofon, wenn du weiter diktieren möchtest.');
      scheduleDictationReset(dictationHadError ? 5000 : 3200);
    };

    try {
      recognition.start();
      return true;
    } catch {
      dictation = null;
      dictationHadError = true;
      setDictationState('error', dictationErrorMessage('start'));
      scheduleDictationReset(5000);
      return false;
    }
  }

  function installDictationCapture() {
    document.addEventListener('click', event => {
      const mic = event.target?.closest?.('#smallMicButton');
      if (!mic) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      startDictation();
    }, true);
  }

  function dedupeConsecutiveAssistantMessages() {
    const messages = document.getElementById('messages');
    if (!messages) return false;
    const children = [...messages.children].filter(node => node.classList?.contains('message') && !node.classList.contains('typing'));
    if (children.length < 2) return false;
    const previous = children.at(-2);
    const latest = children.at(-1);
    if (!previous.classList.contains('assistant') || !latest.classList.contains('assistant')) return false;
    const previousText = normalize(previous.querySelector('.bubble')?.textContent);
    const latestText = normalize(latest.querySelector('.bubble')?.textContent);
    if (!previousText || previousText !== latestText) return false;
    latest.remove();
    return true;
  }

  function initUi() {
    installStyles();
    ensureDictationStatus();
    refreshStepBackButtons();
    installStepBackCapture();
    installDictationCapture();
    dedupeConsecutiveAssistantMessages();

    const observer = new MutationObserver(() => {
      refreshStepBackButtons();
      dedupeConsecutiveAssistantMessages();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('dokohilf:guide-state', refreshStepBackButtons);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initUi, { once: true });
  else initUi();

  window.DokoHilfChatGuideUxV70 = {
    revision: REVISION,
    currentGuide,
    isAmbiguousDokuErweitertMention,
    confirmedGuideOrientationPayload,
    applyStepBackButton,
    requestStepBack,
    insertDictationText,
    dictationErrorMessage,
    startDictation,
    stopDictation,
    dedupeConsecutiveAssistantMessages,
  };
  window.__DOKOHILF_CHAT_GUIDE_UX_V70__ = true;
})();
