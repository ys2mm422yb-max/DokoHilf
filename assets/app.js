(() => {
  'use strict';

  const DISCLAIMER = 'Diese Anwendung ist eine unabhängige interne Arbeitshilfe der Einrichtung. Sie wurde nicht vom Hersteller der eingesetzten Dokumentationssoftware entwickelt, betrieben oder geprüft.';
  const WORKFLOWS = window.DOKOHILF_WORKFLOWS || {};

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  }

  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch { /* Storage may be unavailable in private or embedded contexts. */ }
  }

  function storageRemove(key) {
    try { window.localStorage.removeItem(key); } catch { /* Nothing to remove. */ }
  }

  const state = {
    workflowId: null,
    stepIndex: 0,
    autoSpeak: storageGet('dokohilf-auto-speak') === 'true',
    speechMode: false,
    recognition: null,
    lastAssistantText: '',
    awaitingChoice: null
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
    quickActions: document.getElementById('quickActions')
  };

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

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  }

  function setWelcomeVisible(visible) {
    elements.welcome.hidden = !visible;
  }

  function scrollToLatest() {
    requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
  }

  function addUserMessage(text) {
    setWelcomeVisible(false);
    const node = document.createElement('div');
    node.className = 'message user';
    node.innerHTML = `<div class="bubble"><p>${escapeHtml(text)}</p></div>`;
    elements.messages.append(node);
    scrollToLatest();
  }

  function addAssistantMessage(text, options = {}) {
    setWelcomeVisible(false);
    state.lastAssistantText = stripMarkup(text);
    const node = document.createElement('div');
    node.className = 'message assistant';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = 'D';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    let content = '';
    if (options.step) {
      content += `<div class="step-label"><span>${options.step.current}</span>Schritt ${options.step.current} von ${options.step.total}</div>`;
    }
    content += `<p>${text}</p>`;

    if (options.route?.length) {
      content += `<div class="route" aria-label="Menüweg">${options.route.map((part, index) => `${index ? '<i>›</i>' : ''}<span>${escapeHtml(part)}</span>`).join('')}</div>`;
    }

    if (options.choices?.length) {
      content += `<div class="choice-list">${options.choices.map(choice => `<button type="button" data-choice="${escapeHtml(choice.target)}">${escapeHtml(choice.label)}</button>`).join('')}</div>`;
    }

    if (options.focus) {
      content += `<div class="assistant-actions"><button type="button" data-action="show-diagram">Bild zeigen</button><button type="button" data-action="repeat">Nochmal erklären</button>${options.step ? '<button class="primary" type="button" data-action="next">Weiter</button>' : ''}</div>`;
      content += `<div class="diagram" hidden><div class="diagram-bar"><span class="diagram-tab">Doku</span><span class="diagram-tab active">${escapeHtml(options.route?.[0] || 'Bereich')}</span><span class="diagram-tab">Planung</span></div><div class="diagram-body"><div class="diagram-focus">${escapeHtml(options.focus)}</div></div></div>`;
    }

    bubble.innerHTML = content;
    node.append(avatar, bubble);
    elements.messages.append(node);

    node.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
      const choiceId = button.dataset.choice;
      addUserMessage(button.textContent.trim());
      startWorkflow(choiceId);
    }));

    node.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'show-diagram') {
        const diagram = node.querySelector('.diagram');
        diagram.hidden = !diagram.hidden;
        button.textContent = diagram.hidden ? 'Bild zeigen' : 'Bild ausblenden';
      } else if (action === 'repeat') {
        repeatStep();
      } else if (action === 'next') {
        nextStep();
      }
    }));

    if (state.autoSpeak || state.speechMode || options.forceSpeak) speak(state.lastAssistantText);
    scrollToLatest();
  }

  function stripMarkup(text) {
    const holder = document.createElement('div');
    holder.innerHTML = text;
    return holder.textContent || '';
  }

  function speak(text) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  function updateSpeechToggle() {
    elements.speechToggle.setAttribute('aria-pressed', String(state.autoSpeak));
    elements.speechToggle.querySelector('[aria-hidden]').textContent = state.autoSpeak ? '🔊' : '🔈';
    elements.speechToggle.querySelector('.button-label').textContent = state.autoSpeak ? 'Vorlesen an' : 'Vorlesen aus';
  }

  function toggleAutoSpeak(forceValue) {
    state.autoSpeak = typeof forceValue === 'boolean' ? forceValue : !state.autoSpeak;
    storageSet('dokohilf-auto-speak', String(state.autoSpeak));
    updateSpeechToggle();
    if (state.autoSpeak) speak('Vorlesen ist eingeschaltet.');
    else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function currentWorkflow() {
    return state.workflowId ? WORKFLOWS[state.workflowId] : null;
  }

  function startWorkflow(id) {
    const workflow = WORKFLOWS[id];
    if (!workflow) return;
    state.workflowId = id;
    state.stepIndex = 0;
    state.awaitingChoice = null;
    persistState();

    if (workflow.choice) {
      state.awaitingChoice = id;
      addAssistantMessage(`Alles klar. Was möchtest du beim <strong>Durchführungsnachweis</strong> machen?`, { choices: workflow.choice });
      return;
    }

    addAssistantMessage(`Alles klar. Ich führe dich durch <strong>„${escapeHtml(workflow.title)}“</strong>. Wir machen immer nur einen Schritt. Sag danach einfach <strong>„weiter“</strong>.`);
    showStep();
  }

  function showStep() {
    const workflow = currentWorkflow();
    if (!workflow?.steps?.length) return;
    const current = workflow.steps[state.stepIndex];
    addAssistantMessage(`<strong>${escapeHtml(current.text)}</strong><br>Wenn du dort bist, sag einfach „weiter“.`, {
      step: { current: state.stepIndex + 1, total: workflow.steps.length },
      route: current.route,
      focus: current.focus
    });
    persistState();
  }

  function nextStep() {
    const workflow = currentWorkflow();
    if (!workflow?.steps) {
      addAssistantMessage('Sag mir bitte zuerst, wobei du Hilfe brauchst.');
      return;
    }
    if (state.stepIndex >= workflow.steps.length - 1) {
      addAssistantMessage(`Geschafft. <strong>„${escapeHtml(workflow.title)}“</strong> ist abgeschlossen. Möchtest du noch etwas machen?`);
      state.workflowId = null;
      state.stepIndex = 0;
      persistState();
      return;
    }
    state.stepIndex += 1;
    showStep();
  }

  function previousStep() {
    const workflow = currentWorkflow();
    if (!workflow?.steps) {
      addAssistantMessage('Es läuft gerade keine Anleitung. Sag mir einfach, was du machen möchtest.');
      return;
    }
    if (state.stepIndex === 0) {
      addAssistantMessage('Du bist bereits beim ersten Schritt.');
      showStep();
      return;
    }
    state.stepIndex -= 1;
    showStep();
  }

  function repeatStep() {
    const workflow = currentWorkflow();
    if (!workflow?.steps) {
      if (state.lastAssistantText) addAssistantMessage(state.lastAssistantText);
      return;
    }
    showStep();
  }

  function stuckHelp() {
    const workflow = currentWorkflow();
    if (!workflow?.steps) {
      addAssistantMessage('Kein Problem. Beschreibe kurz, was du gerade siehst oder was du machen möchtest. Zum Beispiel: „Ich bin bei Berichte und finde das Plus nicht.“');
      return;
    }
    const current = workflow.steps[state.stepIndex];
    addAssistantMessage(`<strong>Kein Problem.</strong> ${escapeHtml(current.stuck)}<br><br>Siehst du es jetzt?`, {
      route: current.route,
      focus: current.focus
    });
  }

  function resetConversation({ announce = true } = {}) {
    state.workflowId = null;
    state.stepIndex = 0;
    state.awaitingChoice = null;
    state.speechMode = false;
    storageRemove('dokohilf-session');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    elements.messages.innerHTML = '';
    setWelcomeVisible(true);
    if (announce) {
      addAssistantMessage('Neue Unterhaltung gestartet. Was möchtest du machen?');
    }
  }

  function persistState() {
    storageSet('dokohilf-session', JSON.stringify({ workflowId: state.workflowId, stepIndex: state.stepIndex }));
  }

  function restoreState() {
    try {
      const saved = JSON.parse(storageGet('dokohilf-session') || 'null');
      if (saved?.workflowId && WORKFLOWS[saved.workflowId]?.steps) {
        state.workflowId = saved.workflowId;
        state.stepIndex = Math.min(Number(saved.stepIndex) || 0, WORKFLOWS[saved.workflowId].steps.length - 1);
        addAssistantMessage(`Du warst zuletzt bei <strong>„${escapeHtml(WORKFLOWS[saved.workflowId].title)}“</strong>. Soll ich dort weitermachen?`, {
          choices: [
            { label: 'Ja, weitermachen', target: '__resume__' },
            { label: 'Nein, neu anfangen', target: '__reset__' }
          ]
        });
      }
    } catch {
      storageRemove('dokohilf-session');
    }
  }

  function matchWorkflow(text) {
    const normalized = normalize(text);
    let best = null;
    let bestScore = 0;
    for (const [id, workflow] of Object.entries(WORKFLOWS)) {
      if (!workflow.aliases) continue;
      let score = 0;
      for (const alias of workflow.aliases) {
        const normalizedAlias = normalize(alias);
        if (normalized.includes(normalizedAlias)) score += normalizedAlias.split(' ').length * 4;
        else {
          const words = normalizedAlias.split(' ');
          score += words.filter(word => word.length > 3 && normalized.includes(word)).length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = id;
      }
    }
    return bestScore >= 2 ? best : null;
  }

  function handleMessage(rawText) {
    const text = String(rawText || '').trim();
    if (!text) return;
    addUserMessage(text);
    const normalized = normalize(text);

    if (['weiter', 'fertig', 'gemacht', 'bin dort', 'ich bin dort', 'ja', 'ok', 'okay', 'passt', 'geschafft'].some(command => normalized === command || normalized.startsWith(command + ' '))) {
      nextStep();
      return;
    }
    if (normalized.includes('zuruck') || normalized.includes('vorheriger schritt')) {
      previousStep();
      return;
    }
    if (normalized.includes('nochmal') || normalized.includes('wiederhol') || normalized.includes('noch einmal')) {
      repeatStep();
      return;
    }
    if (normalized.includes('finde') || normalized.includes('sehe') || normalized.includes('klappt nicht') || normalized.includes('geht nicht') || normalized.includes('wo ist')) {
      const matched = matchWorkflow(text);
      if (matched && !state.workflowId) startWorkflow(matched);
      else stuckHelp();
      return;
    }
    if (normalized.includes('vorlesen') || normalized.includes('lies vor')) {
      toggleAutoSpeak(true);
      if (state.lastAssistantText) speak(state.lastAssistantText);
      return;
    }
    if (normalized === 'stopp' || normalized.includes('nicht mehr vorlesen')) {
      toggleAutoSpeak(false);
      addAssistantMessage('Vorlesen ist ausgeschaltet.');
      return;
    }
    if (normalized.includes('abbrechen') || normalized.includes('neu anfangen') || normalized.includes('anderes thema')) {
      resetConversation();
      return;
    }
    if (normalized.includes('was kannst du') || normalized.includes('hilfe')) {
      addAssistantMessage('Du kannst mich zum Beispiel fragen: „Wie schreibe ich einen Bericht?“, „Wo finde ich Vitalwerte?“, „Wie storniere ich einen Durchführungsnachweis?“ oder „Wo ist EasyPlan?“');
      return;
    }

    const workflowId = matchWorkflow(text);
    if (workflowId) {
      startWorkflow(workflowId);
      return;
    }

    if (state.workflowId) {
      addAssistantMessage('Ich bin mir nicht sicher, ob du weitergehen möchtest. Sag bitte <strong>„weiter“</strong>, <strong>„zurück“</strong>, <strong>„nochmal“</strong> oder beschreibe, was du nicht findest.');
    } else {
      addAssistantMessage('Das habe ich noch nicht sicher erkannt. Sag es bitte etwas einfacher, zum Beispiel: <strong>„Neuer Bericht“</strong>, <strong>„Vitalwerte“</strong>, <strong>„Visite“</strong>, <strong>„EasyPlan“</strong> oder <strong>„Durchführungsnachweis“</strong>.');
    }
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
      elements.input.value = transcript;
      autoResizeInput();
      handleMessage(transcript);
      elements.input.value = '';
      autoResizeInput();
    };
    recognition.onerror = event => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        addAssistantMessage('Der Mikrofonzugriff wurde nicht erlaubt. Du kannst den Text eintippen oder die Diktierfunktion deiner Tastatur benutzen.');
      } else if (event.error !== 'aborted') {
        addAssistantMessage('Ich konnte dich gerade nicht verstehen. Versuch es bitte noch einmal oder tippe deine Frage ein.');
      }
    };
    recognition.onend = () => {
      elements.listeningBar.hidden = true;
      elements.mic.classList.remove('listening');
      elements.mic.setAttribute('aria-label', 'Spracheingabe starten');
    };
    return recognition;
  }

  function startListening({ conversationMode = false } = {}) {
    if (!state.recognition) state.recognition = setupRecognition();
    if (!state.recognition) {
      addAssistantMessage('Dein Browser bietet hier keine direkte Spracherkennung an. Nutze bitte das Mikrofon auf der iPhone-Tastatur zum Diktieren. Das Vorlesen der Antworten funktioniert trotzdem.');
      elements.input.focus();
      return;
    }
    if (conversationMode) {
      state.speechMode = true;
      toggleAutoSpeak(true);
      addAssistantMessage('Ich höre zu. Sag mir einfach, was du machen möchtest.', { forceSpeak: true });
    }
    try {
      state.recognition.start();
    } catch {
      // Recognition is already running.
    }
  }

  function autoResizeInput() {
    elements.input.style.height = 'auto';
    elements.input.style.height = `${Math.min(elements.input.scrollHeight, 150)}px`;
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
  elements.stopListening.addEventListener('click', () => state.recognition?.abort());
  elements.speechToggle.addEventListener('click', () => toggleAutoSpeak());
  elements.reset.addEventListener('click', () => resetConversation());
  elements.quickActions.addEventListener('click', event => {
    const button = event.target.closest('[data-prompt]');
    if (button) handleMessage(button.dataset.prompt);
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-choice]');
    if (!button) return;
    if (button.dataset.choice === '__resume__') {
      addUserMessage('Ja, weitermachen');
      showStep();
    } else if (button.dataset.choice === '__reset__') {
      addUserMessage('Nein, neu anfangen');
      resetConversation({ announce: true });
    }
  });

  updateSpeechToggle();
  restoreState();

  window.DokoHilf = {
    handleMessage,
    startWorkflow,
    nextStep,
    previousStep,
    repeatStep,
    resetConversation,
    getState: () => ({ ...state }),
    disclaimer: DISCLAIMER
  };
})();
