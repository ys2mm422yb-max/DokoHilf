(() => {
  'use strict';

  const AI_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai';
  const TTS_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts';
  const MAX_HISTORY = 12;
  const BLOCK_MESSAGE = 'Diese Eingabe wird nicht an die KI übertragen. Bitte stelle nur eine allgemeine Bedienfrage und entferne alle echten Personen-, Fall- oder Gesundheitsdaten.';

  const state = {
    mode: 'start',
    history: [],
    activeGuide: null,
    recognition: null,
    pending: false,
    voicePaused: true,
    speaking: false,
    shouldListenAfterSpeech: false,
    reloadingForUpdate: false,
    audioContext: null,
    audioSource: null,
    ttsAbort: null,
    speechRequestId: 0,
    preferredSystemVoice: null,
  };

  const el = {
    shell: document.getElementById('appShell'),
    startScreen: document.getElementById('startScreen'),
    workspace: document.getElementById('workspace'),
    voiceConsole: document.getElementById('voiceConsole'),
    chatHead: document.getElementById('chatHead'),
    messages: document.getElementById('messages'),
    commandRow: document.getElementById('commandRow'),
    composerWrap: document.getElementById('composerWrap'),
    form: document.getElementById('chatForm'),
    input: document.getElementById('chatInput'),
    send: document.querySelector('.send-button'),
    smallMic: document.getElementById('smallMicButton'),
    voiceButton: document.getElementById('voiceButton'),
    pauseVoice: document.getElementById('pauseVoiceButton'),
    voiceStatus: document.getElementById('voiceStatus'),
    voiceHint: document.getElementById('voiceHint'),
    reset: document.getElementById('resetButton'),
    home: document.getElementById('homeButton'),
    updateToast: document.getElementById('updateToast'),
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[char]));
  }

  function formatText(value) {
    return escapeHtml(value)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function setVoiceState(mode, title, hint = '') {
    el.shell.dataset.voiceState = mode;
    el.voiceStatus.textContent = title;
    el.voiceHint.textContent = hint;
  }

  function setMode(mode, { greet = true } = {}) {
    state.mode = mode;
    el.shell.dataset.mode = mode;
    el.startScreen.hidden = mode !== 'start';
    el.workspace.hidden = mode === 'start';
    el.voiceConsole.hidden = mode !== 'voice';
    el.chatHead.hidden = mode !== 'chat';
    el.composerWrap.hidden = mode !== 'chat';
    el.home.hidden = mode === 'start';
    el.reset.hidden = mode === 'start';

    if (mode === 'start') {
      pauseVoiceConversation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (mode === 'chat') {
      pauseVoiceConversation();
      setVoiceState('idle', 'Chatmodus', 'Schreib deine Frage unten.');
      if (greet && !state.history.length) {
        addMessage('assistant', 'Hallo! Schreib einfach, was du in der Dokumentation machen möchtest.');
      }
      setTimeout(() => el.input.focus(), 80);
      return;
    }

    state.voicePaused = false;
    el.pauseVoice.textContent = 'Gespräch pausieren';
    if (greet && !state.history.length) {
      const greeting = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.';
      addMessage('assistant', greeting);
      state.shouldListenAfterSpeech = true;
      speak(greeting);
    } else {
      setVoiceState('idle', 'Bereit zum Sprechen', 'Tippe auf das Mikrofon.');
      startListening();
    }
  }

  function revealConversation() {
    el.commandRow.hidden = false;
  }

  function scrollLatest() {
    requestAnimationFrame(() => window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    }));
  }

  function addMessage(role, text, cssClass = '') {
    revealConversation();
    const node = document.createElement('div');
    node.className = `message ${role} ${cssClass}`.trim();
    if (role === 'assistant') {
      node.innerHTML = `<div class="avatar" aria-hidden="true">D</div><div class="bubble"><p>${formatText(text)}</p></div>`;
    } else {
      node.innerHTML = `<div class="bubble"><p>${escapeHtml(text)}</p></div>`;
    }
    el.messages.append(node);
    scrollLatest();
    return node;
  }

  function addTyping() {
    const node = document.createElement('div');
    node.className = 'message assistant typing';
    node.innerHTML = '<div class="avatar" aria-hidden="true">D</div><div class="bubble"><i></i><i></i><i></i></div>';
    el.messages.append(node);
    scrollLatest();
    return node;
  }

  function clientPrivacyGuard(text) {
    const raw = String(text || '').trim();
    const n = normalize(raw);
    const direct = [
      /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i,
      /\b(?:\+49|0)[\d\s/()-]{7,}\b/,
      /\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/,
      /\b(?:herr|frau|bewohner(?:in)?|klient(?:in)?|patient(?:in)?)\s+[a-zäöüß-]{2,}/i,
      /\b(?:straße|strasse|weg|platz|allee)\s*\d+/i,
      /\b(?:geburtsdatum|telefonnummer|adresse|aktenzeichen|versichertennummer)\b/i,
      /\b\d{5}\s+[a-zäöüß-]{3,}/i,
    ];
    if (direct.some(re => re.test(raw))) return true;
    const health = /\b(diagnose|blutdruck|puls|temperatur|medikament|dosis|mg|ml|insulin|schmerz|wunde|berichtstext|übergabeinhalt)\b/i.test(n);
    const caseLanguage = /\b(hat|bekommt|nimmt|leidet|war heute|ist gestürzt|verweigert|bewohner|klient|patient)\b/i.test(n);
    return (health && (caseLanguage || /\d/.test(raw))) || raw.length > 260;
  }

  function setBusy(value) {
    state.pending = value;
    el.input.disabled = value;
    el.send.disabled = value;
    el.smallMic.disabled = value;
    el.voiceButton.disabled = value;
    el.send.textContent = value ? 'Warte …' : 'Senden';
  }

  async function sendMessage(rawText, { fromVoice = false } = {}) {
    const text = String(rawText || '').trim();
    if (!text || state.pending) return;

    addMessage('user', text);
    el.input.value = '';
    resizeInput();

    if (clientPrivacyGuard(text)) {
      addMessage('assistant', BLOCK_MESSAGE, 'blocked');
      setVoiceState('error', 'Eingabe geschützt', 'Die Nachricht wurde nicht übertragen.');
      if (fromVoice) speak(BLOCK_MESSAGE);
      return;
    }

    state.history.push({ role: 'user', content: text });
    state.history = state.history.slice(-MAX_HISTORY);
    const typing = addTyping();
    setBusy(true);
    setVoiceState('thinking', 'DokoHilf denkt nach …', 'Einen Moment bitte.');

    try {
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: state.history, guideSlug: state.activeGuide }),
      });
      const payload = await response.json().catch(() => ({}));
      typing.remove();

      if (response.status === 422 || payload.blocked) {
        state.history.pop();
        addMessage('assistant', BLOCK_MESSAGE, 'blocked');
        setVoiceState('error', 'Eingabe geschützt', 'Nicht an Gemini übertragen.');
        if (fromVoice || state.mode === 'voice') speak(BLOCK_MESSAGE);
        return;
      }
      if (!response.ok || typeof payload.reply !== 'string') {
        throw new Error(payload.error || 'Die KI ist gerade nicht erreichbar.');
      }

      state.activeGuide = payload.guideSlug || null;
      state.history.push({ role: 'assistant', content: payload.reply });
      state.history = state.history.slice(-MAX_HISTORY);
      addMessage('assistant', payload.reply);

      if (state.mode === 'voice' || fromVoice) {
        state.shouldListenAfterSpeech = !state.voicePaused;
        speak(payload.reply);
      } else {
        setVoiceState('idle', 'Antwort bereit', 'Du kannst direkt weiterschreiben.');
      }
    } catch (error) {
      typing.remove();
      const message = error instanceof Error ? error.message : 'Die KI ist gerade nicht erreichbar.';
      const friendly = `${message} Deine Frage bleibt im Gespräch erhalten. Versuch es gleich noch einmal.`;
      addMessage('assistant', friendly);
      setVoiceState('error', 'Kurz nicht erreichbar', 'Versuch es gleich erneut.');
      if (state.mode === 'voice') speak(friendly);
    } finally {
      setBusy(false);
    }
  }

  function cleanSpeechText(text) {
    return String(text || '')
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function chooseBestSystemVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const score = voice => {
      const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
      const language = String(voice.lang || '').toLowerCase();
      let points = 0;
      if (language === 'de-de') points += 80;
      else if (language.startsWith('de')) points += 60;
      if (voice.localService) points += 8;
      if (/anna|petra|marlene|helena|katja|google.*deutsch|google.*german|siri/.test(name)) points += 25;
      if (/premium|enhanced|natural/.test(name)) points += 18;
      if (/compact|espeak/.test(name)) points -= 25;
      return points;
    };

    return [...voices].sort((a, b) => score(b) - score(a))[0] || null;
  }

  function refreshSystemVoice() {
    state.preferredSystemVoice = chooseBestSystemVoice();
  }

  async function unlockAudioEngine() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!state.audioContext) state.audioContext = new AudioContextClass();
    if (state.audioContext.state === 'suspended') {
      try { await state.audioContext.resume(); } catch { return null; }
    }
    return state.audioContext;
  }

  function cancelSpeech() {
    state.speechRequestId += 1;
    state.ttsAbort?.abort();
    state.ttsAbort = null;
    if (state.audioSource) {
      try { state.audioSource.stop(); } catch { /* already stopped */ }
      try { state.audioSource.disconnect(); } catch { /* no-op */ }
      state.audioSource = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    state.speaking = false;
  }

  function finishSpeech(requestId) {
    if (requestId !== state.speechRequestId) return;
    state.speaking = false;
    state.audioSource = null;
    state.ttsAbort = null;

    if (state.mode === 'voice' && state.shouldListenAfterSpeech && !state.voicePaused) {
      state.shouldListenAfterSpeech = false;
      setTimeout(startListening, 320);
    } else {
      setVoiceState(
        'idle',
        'Bereit',
        state.mode === 'voice' ? 'Tippe auf das Mikrofon.' : 'Du kannst weiterschreiben.',
      );
    }
  }

  function speakWithSystemVoice(text, requestId) {
    if (window.__DOKOHILF_LOCAL_VOICE_V28__ === true) {
      setVoiceState('error', 'Lokale Stimme nicht bereit', 'Tippe auf das Mikrofon, um die Stimme erneut zu laden.');
      window.setTimeout(() => finishSpeech(requestId), 900);
      return;
    }
    if (!('speechSynthesis' in window) || requestId !== state.speechRequestId) {
      finishSpeech(requestId);
      return;
    }

    refreshSystemVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.97;
    utterance.pitch = 1;
    if (state.preferredSystemVoice) utterance.voice = state.preferredSystemVoice;
    utterance.onstart = () => {
      if (requestId === state.speechRequestId) {
        setVoiceState('speaking', 'DokoHilf spricht …', 'Danach höre ich automatisch weiter zu.');
      }
    };
    utterance.onend = () => finishSpeech(requestId);
    utterance.onerror = () => finishSpeech(requestId);
    window.speechSynthesis.speak(utterance);
  }

  async function speak(text) {
    const clean = cleanSpeechText(text);
    if (!clean) return;

    cancelSpeech();
    const requestId = state.speechRequestId;
    state.speaking = true;
    setVoiceState('thinking', 'Natürliche Stimme wird vorbereitet …', 'Einen kurzen Moment bitte.');

    const controller = new AbortController();
    state.ttsAbort = controller;

    try {
      const response = await fetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('tts_unavailable');
      const audioBytes = await response.arrayBuffer();
      if (requestId !== state.speechRequestId) return;

      const context = await unlockAudioEngine();
      if (!context) throw new Error('audio_context_unavailable');
      const audioBuffer = await context.decodeAudioData(audioBytes.slice(0));
      if (requestId !== state.speechRequestId) return;

      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      source.onended = () => finishSpeech(requestId);
      state.audioSource = source;
      setVoiceState('speaking', 'DokoHilf spricht natürlich …', 'Danach höre ich automatisch weiter zu.');
      source.start(0);
    } catch (error) {
      if (requestId !== state.speechRequestId || error?.name === 'AbortError') return;
      speakWithSystemVoice(clean, requestId);
    }
  }

  function recognitionFactory() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return null;
    const recognition = new Recognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceState('listening', 'Ich höre zu …', 'Sprich jetzt ganz normal.');
    recognition.onresult = event => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) sendMessage(transcript, { fromVoice: true });
    };
    recognition.onerror = event => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        state.voicePaused = true;
        setVoiceState('error', 'Mikrofon nicht freigegeben', 'Erlaube den Zugriff oder nutze den Chatmodus.');
      } else if (event.error === 'no-speech') {
        setVoiceState('idle', 'Nichts gehört', 'Tippe erneut auf das Mikrofon.');
      } else if (event.error !== 'aborted') {
        setVoiceState('error', 'Nicht verstanden', 'Tippe erneut und sprich langsam.');
      }
    };
    recognition.onend = () => {
      if (el.shell.dataset.voiceState === 'listening') {
        setVoiceState('idle', 'Bereit', 'Tippe erneut zum Sprechen.');
      }
    };
    return recognition;
  }

  function startListening() {
    if (state.pending || state.speaking || state.mode !== 'voice') return;
    state.voicePaused = false;
    el.pauseVoice.textContent = 'Gespräch pausieren';
    if (!state.recognition) state.recognition = recognitionFactory();
    if (!state.recognition) {
      state.voicePaused = true;
      setVoiceState('error', 'Direktes Zuhören fehlt', 'Wechsle zum Chat und nutze dort das Tastatur-Mikrofon.');
      return;
    }
    try { state.recognition.start(); } catch { /* already active */ }
  }

  function pauseVoiceConversation() {
    state.voicePaused = true;
    state.shouldListenAfterSpeech = false;
    state.recognition?.abort();
    cancelSpeech();
    if (el.pauseVoice) el.pauseVoice.textContent = 'Gespräch fortsetzen';
    if (state.mode === 'voice') {
      setVoiceState('idle', 'Gespräch pausiert', 'Tippe auf das Mikrofon zum Fortsetzen.');
    }
  }

  async function toggleVoicePause() {
    await unlockAudioEngine();
    if (state.voicePaused) startListening();
    else pauseVoiceConversation();
  }

  function resetConversation({ keepMode = true } = {}) {
    const mode = keepMode ? state.mode : 'start';
    pauseVoiceConversation();
    state.history = [];
    state.activeGuide = null;
    state.pending = false;
    el.messages.innerHTML = '';
    el.commandRow.hidden = true;
    el.input.value = '';
    resizeInput();
    if (mode === 'start') setMode('start', { greet: false });
    else setMode(mode, { greet: true });
  }

  function resizeInput() {
    el.input.style.height = 'auto';
    el.input.style.height = `${Math.min(el.input.scrollHeight, 130)}px`;
  }

  function handlePromptButton(button) {
    const prompt = button?.dataset?.prompt;
    if (!prompt) return;
    if (state.mode === 'start') setMode('chat', { greet: false });
    sendMessage(prompt);
  }

  el.form.addEventListener('submit', event => {
    event.preventDefault();
    sendMessage(el.input.value);
  });

  el.input.addEventListener('input', resizeInput);
  el.input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      el.form.requestSubmit();
    }
  });

  document.addEventListener('click', event => {
    const modeButton = event.target.closest('[data-select-mode]');
    if (modeButton) {
      const mode = modeButton.dataset.selectMode;
      if (mode === 'voice') unlockAudioEngine();
      return setMode(mode);
    }

    const switchButton = event.target.closest('[data-switch-mode]');
    if (switchButton) {
      const mode = switchButton.dataset.switchMode;
      if (mode === 'voice') unlockAudioEngine();
      return setMode(mode, { greet: false });
    }

    const promptButton = event.target.closest('[data-prompt]');
    if (promptButton) return handlePromptButton(promptButton);

    const commandButton = event.target.closest('[data-command]');
    if (commandButton) {
      return sendMessage(commandButton.dataset.command, { fromVoice: state.mode === 'voice' });
    }
  });

  el.voiceButton.addEventListener('click', toggleVoicePause);
  el.pauseVoice.addEventListener('click', toggleVoicePause);

  el.smallMic.addEventListener('click', () => {
    if (state.mode !== 'chat') return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      el.input.focus();
      el.input.placeholder = 'Nutze das Mikrofon deiner Tastatur …';
      return;
    }
    const dictation = new Recognition();
    dictation.lang = 'de-DE';
    dictation.interimResults = false;
    dictation.onresult = event => {
      el.input.value = event.results?.[0]?.[0]?.transcript || '';
      resizeInput();
      el.input.focus();
    };
    try { dictation.start(); } catch { /* no-op */ }
  });

  el.reset.addEventListener('click', () => resetConversation({ keepMode: true }));
  el.home.addEventListener('click', () => resetConversation({ keepMode: false }));

  window.addEventListener('pagehide', () => {
    state.history = [];
    state.activeGuide = null;
    cancelSpeech();
  });

  async function registerAutoUpdate() {
    if (!('serviceWorker' in navigator)) return;
    let refreshed = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshed || state.reloadingForUpdate) return;
      refreshed = true;
      state.reloadingForUpdate = true;
      window.location.reload();
    });

    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js', {
        updateViaCache: 'none',
      });
      const activateWaiting = () => registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      activateWaiting();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) activateWaiting();
        });
      });
      registration.update().catch(() => {});
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {});
      });
    } catch { /* App remains usable without offline update support. */ }
  }

  if ('speechSynthesis' in window) {
    refreshSystemVoice();
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshSystemVoice);
    window.speechSynthesis.onvoiceschanged = refreshSystemVoice;
  }

  registerAutoUpdate();
  setMode('start', { greet: false });

  window.DokoHilf = {
    sendMessage,
    setMode,
    resetConversation,
    speak,
    getState: () => ({
      mode: state.mode,
      historyLength: state.history.length,
      activeGuide: state.activeGuide,
      pending: state.pending,
      voicePaused: state.voicePaused,
      speaking: state.speaking,
    }),
  };
})();
