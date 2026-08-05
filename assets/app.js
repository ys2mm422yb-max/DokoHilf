(() => {
  'use strict';

  const AI_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai';
  const WORKFLOWS = window.DOKOHILF_WORKFLOWS || {};
  const MAX_HISTORY = 14;

  const state = {
    history: readSessionHistory(),
    autoSpeak: readSetting('dokohilf-auto-speak') === 'true',
    speechMode: false,
    recognition: null,
    pending: false,
    lastAssistantText: '',
    fallbackWorkflowId: null,
    fallbackStepIndex: 0,
  };

  const elements = {
    messages: document.getElementById('messages'),
    form: document.getElementById('chatForm'),
    input: document.getElementById('chatInput'),
    mic: document.getElementById('micButton'),
    voiceStart: document.getElementById('voiceStart'),
    speechToggle: document.getElementById('speechToggle'),
    reset: document.getElementById('resetButton'),
    welcome: document.getElementById('welcomeBlock'),
    listeningBar: document.getElementById('listeningBar'),
    stopListening: document.getElementById('stopListening'),
    quickActions: document.getElementById('quickActions'),
    send: document.querySelector('.send-button'),
    statusText: document.getElementById('aiStatusText'),
  };

  function readSetting(key) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  }

  function writeSetting(key, value) {
    try { window.localStorage.setItem(key, value); } catch { /* optional */ }
  }

  function readSessionHistory() {
    try {
      const parsed = JSON.parse(window.sessionStorage.getItem('dokohilf-ai-history') || '[]');
      return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY) : [];
    } catch {
      return [];
    }
  }

  function saveSessionHistory() {
    try {
      window.sessionStorage.setItem('dokohilf-ai-history', JSON.stringify(state.history.slice(-MAX_HISTORY)));
    } catch { /* optional */ }
  }

  function clearSessionHistory() {
    state.history = [];
    try { window.sessionStorage.removeItem('dokohilf-ai-history'); } catch { /* optional */ }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function formatAiText(value) {
    const safe = escapeHtml(value).trim();
    return safe
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .split(/\n{2,}/)
      .map(paragraph => paragraph.replace(/\n/g, '<br>'))
      .join('</p><p>');
  }

  function stripMarkup(value) {
    const holder = document.createElement('div');
    holder.innerHTML = value;
    return holder.textContent || '';
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9äöü\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function setWelcomeVisible(visible) {
    elements.welcome.hidden = !visible;
  }

  function scrollToLatest() {
    requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
  }

  function setBusy(busy) {
    state.pending = busy;
    elements.form.setAttribute('aria-busy', String(busy));
    elements.input.disabled = busy;
    elements.mic.disabled = busy;
    elements.send.disabled = busy;
    elements.send.textContent = busy ? 'Warte …' : 'Senden';
  }

  function addUserMessage(text) {
    setWelcomeVisible(false);
    const node = document.createElement('div');
    node.className = 'message user';
    node.innerHTML = `<div class="bubble"><p>${escapeHtml(text)}</p></div>`;
    elements.messages.append(node);
    scrollToLatest();
  }

  function addAssistantMessage(text, { plain = false, speakAfter = true, cssClass = '' } = {}) {
    setWelcomeVisible(false);
    const html = plain ? formatAiText(text) : text;
    state.lastAssistantText = stripMarkup(html);

    const node = document.createElement('div');
    node.className = `message assistant ${cssClass}`.trim();
    node.innerHTML = `<div class="avatar" aria-hidden="true">D</div><div class="bubble"><p>${html}</p></div>`;
    elements.messages.append(node);

    if (speakAfter && (state.autoSpeak || state.speechMode)) {
      speak(state.lastAssistantText, { listenAfter: state.speechMode });
    }
    scrollToLatest();
    return node;
  }

  function addTypingIndicator() {
    const node = document.createElement('div');
    node.className = 'message assistant typing-message';
    node.innerHTML = '<div class="avatar" aria-hidden="true">D</div><div class="bubble typing-bubble"><span></span><span></span><span></span><em>DokoHilf denkt nach …</em></div>';
    elements.messages.append(node);
    scrollToLatest();
    return node;
  }

  function speak(text, { listenAfter = false } = {}) {
    if (!('speechSynthesis' in window) || !text) {
      if (listenAfter) startListening({ silent: true });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.93;
    utterance.pitch = 1;
    utterance.onend = () => {
      if (listenAfter && state.speechMode && !state.pending) {
        window.setTimeout(() => startListening({ silent: true }), 250);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  function updateSpeechToggle() {
    elements.speechToggle.setAttribute('aria-pressed', String(state.autoSpeak));
    elements.speechToggle.querySelector('[aria-hidden]').textContent = state.autoSpeak ? '🔊' : '🔈';
    elements.speechToggle.querySelector('.button-label').textContent = state.autoSpeak ? 'Vorlesen an' : 'Vorlesen aus';
  }

  function toggleAutoSpeak(forceValue, announce = true) {
    state.autoSpeak = typeof forceValue === 'boolean' ? forceValue : !state.autoSpeak;
    writeSetting('dokohilf-auto-speak', String(state.autoSpeak));
    updateSpeechToggle();
    if (announce && state.autoSpeak) speak('Vorlesen ist eingeschaltet.');
    if (!state.autoSpeak && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function updateAiStatus(text, mode = 'ready') {
    if (!elements.statusText) return;
    elements.statusText.textContent = text;
    elements.statusText.closest('.ai-status')?.setAttribute('data-status', mode);
  }

  function privacyGuard(text) {
    const normalized = normalize(text);
    const riskyPatterns = [
      /\b(geboren|geburtsdatum|adresse|telefonnummer|diagnose|medikation|medikament)\b/,
      /\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/,
      /\b(herr|frau)\s+[a-zäöüß-]{2,}\b/,
    ];
    return riskyPatterns.some(pattern => pattern.test(normalized));
  }

  async function askGemini(text) {
    state.history.push({ role: 'user', content: text });
    state.history = state.history.slice(-MAX_HISTORY);
    saveSessionHistory();

    const typing = addTypingIndicator();
    setBusy(true);
    updateAiStatus('KI antwortet …', 'busy');

    try {
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: state.history }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || typeof payload.reply !== 'string') {
        throw new Error(payload.error || 'Die KI konnte gerade nicht antworten.');
      }

      const reply = payload.reply.trim();
      state.history.push({ role: 'assistant', content: reply });
      state.history = state.history.slice(-MAX_HISTORY);
      saveSessionHistory();
      typing.remove();
      addAssistantMessage(reply, { plain: true });
      updateAiStatus('Gemini-KI aktiv', 'ready');
    } catch (error) {
      typing.remove();
      updateAiStatus('Einfache Hilfe aktiv', 'fallback');
      const message = error instanceof Error ? error.message : 'Die KI ist gerade nicht erreichbar.';
      addAssistantMessage(`<strong>Die KI ist gerade nicht erreichbar.</strong><br>${escapeHtml(message)}<br><br>Ich nutze solange die einfache Schritt-Hilfe.`, { speakAfter: false, cssClass: 'error-message' });
      handleFallback(text);
    } finally {
      setBusy(false);
      elements.input.focus();
    }
  }

  function matchWorkflow(text) {
    const normalized = normalize(text);
    let best = null;
    let bestScore = 0;
    for (const [id, workflow] of Object.entries(WORKFLOWS)) {
      if (!Array.isArray(workflow.aliases)) continue;
      let score = 0;
      for (const alias of workflow.aliases) {
        const candidate = normalize(alias);
        if (normalized.includes(candidate)) score += candidate.split(' ').length * 4;
        else score += candidate.split(' ').filter(word => word.length > 3 && normalized.includes(word)).length;
      }
      if (score > bestScore) {
        best = id;
        bestScore = score;
      }
    }
    return bestScore >= 2 ? best : null;
  }

  function showFallbackStep() {
    const workflow = WORKFLOWS[state.fallbackWorkflowId];
    const step = workflow?.steps?.[state.fallbackStepIndex];
    if (!workflow || !step) return;
    addAssistantMessage(`<strong>${escapeHtml(step.text)}</strong><br>Wenn du dort bist, sag „weiter“.`);
  }

  function startFallbackWorkflow(id) {
    if (!WORKFLOWS[id]) return;
    state.fallbackWorkflowId = id;
    state.fallbackStepIndex = 0;
    showFallbackStep();
  }

  function handleFallback(text) {
    const normalized = normalize(text);
    const workflow = state.fallbackWorkflowId ? WORKFLOWS[state.fallbackWorkflowId] : null;

    if (workflow && ['weiter', 'bin dort', 'ja', 'ok', 'okay', 'gemacht'].some(command => normalized === command || normalized.startsWith(`${command} `))) {
      if (state.fallbackStepIndex < workflow.steps.length - 1) {
        state.fallbackStepIndex += 1;
        showFallbackStep();
      } else {
        addAssistantMessage('Geschafft. Die Anleitung ist abgeschlossen.');
        state.fallbackWorkflowId = null;
        state.fallbackStepIndex = 0;
      }
      return;
    }

    if (workflow && (normalized.includes('finde') || normalized.includes('sehe') || normalized.includes('geht nicht'))) {
      const step = workflow.steps[state.fallbackStepIndex];
      addAssistantMessage(`<strong>Kein Problem.</strong> ${escapeHtml(step.stuck || 'Schau bitte noch einmal beim markierten Menüpunkt nach.')}`);
      return;
    }

    const matched = matchWorkflow(text);
    if (matched) {
      startFallbackWorkflow(matched);
      return;
    }

    addAssistantMessage('Dazu habe ich in der einfachen Hilfe noch keine sichere Anleitung. Versuch es bitte später erneut mit der KI.');
  }

  function handleMessage(rawText) {
    const text = String(rawText || '').trim();
    if (!text || state.pending) return;
    addUserMessage(text);
    const normalized = normalize(text);

    if (normalized.includes('nicht mehr vorlesen') || normalized === 'stopp vorlesen') {
      toggleAutoSpeak(false, false);
      addAssistantMessage('Vorlesen ist ausgeschaltet.', { speakAfter: false });
      return;
    }

    if (normalized === 'vorlesen' || normalized.includes('lies vor')) {
      toggleAutoSpeak(true, false);
      if (state.lastAssistantText) speak(state.lastAssistantText);
      else addAssistantMessage('Vorlesen ist eingeschaltet.');
      return;
    }

    if (normalized === 'neu' || normalized.includes('neue unterhaltung') || normalized.includes('neu anfangen')) {
      resetConversation();
      return;
    }

    if (privacyGuard(text)) {
      addAssistantMessage('Bitte entferne echte Personen- oder Gesundheitsdaten. Für diesen Test nur Fantasiedaten verwenden.');
      return;
    }

    askGemini(text);
  }

  function setupRecognition() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return null;

    const recognition = new Recognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      elements.listeningBar.hidden = false;
      elements.mic.classList.add('listening');
      elements.mic.setAttribute('aria-label', 'Spracheingabe läuft');
    };

    recognition.onresult = event => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      elements.input.value = '';
      autoResizeInput();
      handleMessage(transcript);
    };

    recognition.onerror = event => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        state.speechMode = false;
        addAssistantMessage('Der Mikrofonzugriff wurde nicht erlaubt. Nutze das Mikrofon auf der iPhone-Tastatur oder tippe deine Frage ein.');
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        addAssistantMessage('Ich konnte dich gerade nicht verstehen. Versuch es bitte noch einmal.');
      }
    };

    recognition.onend = () => {
      elements.listeningBar.hidden = true;
      elements.mic.classList.remove('listening');
      elements.mic.setAttribute('aria-label', 'Spracheingabe starten');
    };

    return recognition;
  }

  function startListening({ conversationMode = false, silent = false } = {}) {
    if (state.pending) return;
    if (!state.recognition) state.recognition = setupRecognition();

    if (!state.recognition) {
      state.speechMode = false;
      if (!silent) {
        toggleAutoSpeak(true, false);
        addAssistantMessage('Direktes Zuhören wird von diesem Browser nicht angeboten. Tippe auf das Mikrofon der iPhone-Tastatur zum Diktieren; meine Antworten lese ich dir trotzdem vor.');
      }
      elements.input.focus();
      return;
    }

    if (conversationMode) {
      state.speechMode = true;
      toggleAutoSpeak(true, false);
      addAssistantMessage('Gut, wir sprechen jetzt miteinander. Ich höre zu.', { speakAfter: false });
    }

    try { state.recognition.start(); } catch { /* already active */ }
  }

  function stopConversationMode() {
    state.speechMode = false;
    state.recognition?.abort();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    elements.listeningBar.hidden = true;
  }

  function resetConversation() {
    stopConversationMode();
    clearSessionHistory();
    state.fallbackWorkflowId = null;
    state.fallbackStepIndex = 0;
    elements.messages.innerHTML = '';
    setWelcomeVisible(true);
    updateAiStatus('Gemini-KI aktiv', 'ready');
  }

  function autoResizeInput() {
    elements.input.style.height = 'auto';
    elements.input.style.height = `${Math.min(elements.input.scrollHeight, 150)}px`;
  }

  function restoreConversation() {
    if (!state.history.length) return;
    setWelcomeVisible(false);
    for (const message of state.history) {
      if (message.role === 'user') addUserMessage(message.content);
      else addAssistantMessage(message.content, { plain: true, speakAfter: false });
    }
  }

  elements.form.addEventListener('submit', event => {
    event.preventDefault();
    const text = elements.input.value.trim();
    elements.input.value = '';
    autoResizeInput();
    handleMessage(text);
  });

  elements.input.addEventListener('input', autoResizeInput);
  elements.input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      elements.form.requestSubmit();
    }
  });

  elements.mic.addEventListener('click', () => startListening());
  elements.voiceStart.addEventListener('click', () => startListening({ conversationMode: true }));
  elements.stopListening.addEventListener('click', stopConversationMode);
  elements.speechToggle.addEventListener('click', () => toggleAutoSpeak());
  elements.reset.addEventListener('click', resetConversation);
  elements.quickActions.addEventListener('click', event => {
    const button = event.target.closest('[data-prompt]');
    if (button) handleMessage(button.dataset.prompt);
  });

  updateSpeechToggle();
  restoreConversation();

  window.DokoHilf = {
    handleMessage,
    resetConversation,
    startListening,
    getState: () => ({
      historyLength: state.history.length,
      autoSpeak: state.autoSpeak,
      speechMode: state.speechMode,
      pending: state.pending,
    }),
  };
})();
