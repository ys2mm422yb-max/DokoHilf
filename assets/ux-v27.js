(() => {
  'use strict';
  const TTS_MARKER = '/functions/v1/dokohilf-tts';
  const HARD_FALLBACK_MS = 1900;
  const previousFetch = window.fetch.bind(window);
  const commands = new Set(['weiter', 'nochmal', 'zurück', 'zuruck', 'ich finde das nicht']);

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }
  function normalize(value) {
    return clean(value).toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
  }
  function stripReminder(value) {
    return String(value || '')
      .replace(/\s*(?:In Übungen|Bei Übungen)\s+(?:bitte\s+)?(?:ausschließlich|nur)\s+Fantasiedaten\s+verwenden\.?/gi, '')
      .replace(/\s*Verwende\s+in\s+Übungen\s+(?:ausschließlich|nur)\s+Fantasiedaten\.?/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const request = previousFetch(input, init);
    if (typeof url !== 'string' || !url.includes(TTS_MARKER) || method !== 'POST') return request;
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('dokohilf_immediate_voice_fallback')), HARD_FALLBACK_MS));
    request.catch(() => {});
    return Promise.race([request, timeout]);
  };

  function compactGuideMenu() {
    const bar = document.getElementById('guideProgress');
    const actions = bar?.querySelector('.guide-progress-actions');
    if (!bar || !actions || bar.querySelector('.guide-progress-menu')) return;
    const details = document.createElement('details');
    details.className = 'guide-progress-menu';
    details.innerHTML = '<summary aria-label="Ablaufoptionen">•••</summary><div class="guide-progress-menu-panel"></div>';
    const panel = details.querySelector('.guide-progress-menu-panel');
    [...actions.querySelectorAll('button')].forEach(button => panel.append(button));
    actions.hidden = true;
    bar.append(details);
  }

  function cleanConversation() {
    document.querySelectorAll('.message.assistant .bubble p,#voiceFocusText').forEach(node => {
      const cleaned = stripReminder(node.textContent);
      if (cleaned && cleaned !== node.textContent) node.textContent = cleaned;
    });
    document.querySelectorAll('.message.user').forEach(node => {
      if (commands.has(normalize(node.textContent))) node.classList.add('command-message-hidden');
    });
    const help = document.querySelector('[data-command="ich finde das nicht"]');
    if (help) help.textContent = 'Ich brauche Hilfe';
  }

  function polishVoice() {
    const shell = document.getElementById('appShell');
    const status = document.getElementById('voiceStatus');
    const hint = document.getElementById('voiceHint');
    const badge = document.querySelector('.voice-engine-badge');
    if (!shell || !status || !hint) return;
    const current = normalize(status.textContent);
    if (shell.dataset.voiceState === 'thinking' || current.includes('stimme wird vorbereitet') || current.includes('stimme ladt')) {
      status.textContent = 'Stimme startet …';
      hint.textContent = 'Nach spätestens zwei Sekunden geht es direkt weiter.';
    }
    if (badge && /geratestimme|ersatz/.test(normalize(badge.textContent))) badge.textContent = 'Sofortstimme';
  }

  function sync() {
    compactGuideMenu();
    cleanConversation();
    polishVoice();
  }

  function initialize() {
    sync();
    new MutationObserver(sync).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-voice-state'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
  window.DokoHilfUxV27 = { hardFallbackMs: HARD_FALLBACK_MS, stripReminder };
  window.__DOKOHILF_UX_CLEANUP_V27__ = true;
})();
