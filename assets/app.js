(() => {
  'use strict';

  const AI_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai';
  const MAX_HISTORY = 12;
  const BLOCK_MESSAGE = 'Diese Eingabe wird nicht an die KI übertragen. Bitte stelle nur eine allgemeine Bedienfrage und entferne alle echten Personen-, Fall- oder Gesundheitsdaten.';

  const state = {
    history: [],
    activeGuide: null,
    recognition: null,
    pending: false,
    conversationMode: false,
    autoListenAfterSpeech: false,
  };

  const el = {
    shell: document.getElementById('appShell'),
    welcome: document.getElementById('welcomeBlock'),
    quickStart: document.getElementById('quickStart'),
    messages: document.getElementById('messages'),
    form: document.getElementById('chatForm'),
    input: document.getElementById('chatInput'),
    send: document.querySelector('.send-button'),
    voiceButton: document.getElementById('voiceButton'),
    smallMic: document.getElementById('smallMicButton'),
    voiceStatus: document.getElementById('voiceStatus'),
    voiceHint: document.getElementById('voiceHint'),
    quickButtons: document.querySelector('.quick-grid'),
    commandRow: document.getElementById('commandRow'),
    reset: document.getElementById('resetButton'),
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function formatText(value) {
    return escapeHtml(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();
  }

  function setVoiceState(mode, title, hint = '') {
    el.shell.dataset.voiceState = mode;
    el.voiceStatus.textContent = title;
    el.voiceHint.textContent = hint;
  }

  function revealConversation() {
    el.welcome.hidden = true;
    el.quickStart.hidden = true;
    el.commandRow.hidden = false;
  }

  function scrollLatest() {
    requestAnimationFrame(() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'}));
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
    if (health && (caseLanguage || /\d/.test(raw))) return true;
    return raw.length > 260;
  }

  function setBusy(value) {
    state.pending = value;
    el.input.disabled = value;
    el.send.disabled = value;
    el.smallMic.disabled = value;
    el.voiceButton.disabled = value;
    el.send.textContent = value ? 'Warte …' : 'Senden';
  }

  async function sendMessage(rawText, {fromVoice = false} = {}) {
    const text = String(rawText || '').trim();
    if (!text || state.pending) return;
    addMessage('user', text);
    el.input.value = '';
    resizeInput();

    if (clientPrivacyGuard(text)) {
      addMessage('assistant', BLOCK_MESSAGE, 'blocked');
      setVoiceState('error', 'Eingabe geschützt', 'Die Nachricht wurde nicht übertragen.');
      return;
    }

    state.history.push({role:'user', content:text});
    state.history = state.history.slice(-MAX_HISTORY);
    const typing = addTyping();
    setBusy(true);
    setVoiceState('thinking', 'DokoHilf denkt nach …', 'Die Antwort kommt gleich.');

    try {
      const response = await fetch(AI_ENDPOINT, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:state.history, guideSlug:state.activeGuide}),
      });
      const payload = await response.json().catch(() => ({}));
      typing.remove();

      if (response.status === 422 || payload.blocked) {
        state.history.pop();
        addMessage('assistant', BLOCK_MESSAGE, 'blocked');
        setVoiceState('error', 'Eingabe geschützt', 'Die Nachricht wurde nicht an Gemini übertragen.');
        return;
      }
      if (!response.ok || typeof payload.reply !== 'string') throw new Error(payload.error || 'Die KI ist gerade nicht erreichbar.');

      state.activeGuide = payload.guideSlug || state.activeGuide;
      state.history.push({role:'assistant', content:payload.reply});
      state.history = state.history.slice(-MAX_HISTORY);
      addMessage('assistant', payload.reply);
      setVoiceState('idle', 'Bereit für deine Antwort', 'Sag zum Beispiel „weiter“ oder „ich finde das nicht“.');

      if (fromVoice || state.conversationMode) {
        state.autoListenAfterSpeech = true;
        speak(payload.reply);
      }
    } catch (error) {
      typing.remove();
      const message = error instanceof Error ? error.message : 'Die KI ist gerade nicht erreichbar.';
      addMessage('assistant', `Die KI ist gerade nicht erreichbar. ${message}`);
      setVoiceState('error', 'Verbindung unterbrochen', 'Du kannst es gleich noch einmal versuchen.');
    } finally {
      setBusy(false);
    }
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) {
      setVoiceState('idle','Antwort angezeigt','Vorlesen wird von diesem Browser nicht unterstützt.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text).replace(/\*\*/g,''));
    utterance.lang = 'de-DE';
    utterance.rate = .92;
    utterance.pitch = 1;
    utterance.onstart = () => setVoiceState('speaking','DokoHilf spricht …','Du kannst gleich antworten.');
    utterance.onend = () => {
      if (state.conversationMode && state.autoListenAfterSpeech) {
        state.autoListenAfterSpeech = false;
        setTimeout(() => startListening(true), 350);
      } else {
        setVoiceState('idle','Bereit für deine Antwort','Sag „weiter“ oder stelle eine Rückfrage.');
      }
    };
    utterance.onerror = () => setVoiceState('idle','Antwort angezeigt','Du kannst unten weiterschreiben.');
    window.speechSynthesis.speak(utterance);
  }

  function recognitionFactory() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return null;
    const recognition = new Recognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceState('listening','Ich höre zu …','Sprich jetzt deine Bedienfrage.');
    recognition.onresult = event => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) sendMessage(transcript,{fromVoice:true});
    };
    recognition.onerror = event => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        state.conversationMode = false;
        setVoiceState('error','Mikrofon nicht freigegeben','Erlaube den Zugriff oder nutze das Mikrofon der iPhone-Tastatur.');
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setVoiceState('error','Nicht verstanden','Tippe erneut auf das Mikrofon und sprich langsam.');
      } else {
        setVoiceState('idle','Bereit','Tippe erneut, sobald du sprechen möchtest.');
      }
    };
    recognition.onend = () => {
      if (el.shell.dataset.voiceState === 'listening') setVoiceState('idle','Bereit','Tippe erneut zum Sprechen.');
    };
    return recognition;
  }

  function startListening(conversationMode = false) {
    if (state.pending) return;
    if (conversationMode) state.conversationMode = true;
    if (!state.recognition) state.recognition = recognitionFactory();
    if (!state.recognition) {
      state.conversationMode = false;
      setVoiceState('error','Direktes Zuhören fehlt','Nutze das Mikrofon auf der iPhone-Tastatur. Antworten kann DokoHilf trotzdem vorlesen.');
      el.input.focus();
      return;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    try { state.recognition.start(); } catch { /* already started */ }
  }

  function resetConversation() {
    state.history = [];
    state.activeGuide = null;
    state.conversationMode = false;
    state.autoListenAfterSpeech = false;
    state.recognition?.abort();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    el.messages.innerHTML = '';
    el.welcome.hidden = false;
    el.quickStart.hidden = false;
    el.commandRow.hidden = true;
    setVoiceState('idle','Tippen und sprechen','Oder unten eine Frage schreiben.');
    el.input.value = '';
  }

  function resizeInput() {
    el.input.style.height = 'auto';
    el.input.style.height = `${Math.min(el.input.scrollHeight,130)}px`;
  }

  el.form.addEventListener('submit', event => {
    event.preventDefault();
    sendMessage(el.input.value);
  });
  el.input.addEventListener('input', resizeInput);
  el.input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); el.form.requestSubmit(); }
  });
  el.voiceButton.addEventListener('click', () => startListening(true));
  el.smallMic.addEventListener('click', () => startListening(false));
  el.quickButtons.addEventListener('click', event => {
    const button = event.target.closest('[data-prompt]');
    if (button) sendMessage(button.dataset.prompt);
  });
  el.commandRow.addEventListener('click', event => {
    const button = event.target.closest('[data-command]');
    if (button) sendMessage(button.dataset.command,{fromVoice:state.conversationMode});
  });
  el.reset.addEventListener('click', resetConversation);

  window.addEventListener('pagehide', () => {
    state.history = [];
    state.activeGuide = null;
  });

  window.DokoHilf = {sendMessage, resetConversation, getState:() => ({historyLength:state.history.length,activeGuide:state.activeGuide,pending:state.pending,conversationMode:state.conversationMode})};
})();
