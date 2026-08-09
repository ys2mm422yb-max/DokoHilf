(() => {
  'use strict';

  if (window.__DOKOHILF_VOICE_POLISH_V36__) return;
  window.__DOKOHILF_VOICE_POLISH_V36__ = true;

  const STATE_LABELS = Object.freeze({
    idle: 'Bereit',
    listening: 'Hört zu',
    thinking: 'Denkt nach',
    speaking: 'Spricht',
    error: 'Hinweis',
  });

  let scheduled = false;

  function guideState() {
    try { return window.DokoHilfGuideProgress?.getCurrentGuide?.() || null; } catch { return null; }
  }

  function ensureChatButton() {
    const button = document.querySelector('#voiceFocusStage .voice-focus-toolbar [data-switch-mode="chat"]');
    if (!button || button.dataset.v36Ready === 'true') return button;
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v12H9l-5 4z"/><path d="M8 9h8M8 13h5"/></svg><span class="v36-chat-label">Chat</span>';
    button.setAttribute('aria-label', 'Chat anzeigen');
    button.dataset.v36Ready = 'true';
    return button;
  }

  function ensureStateChip() {
    const toolbar = document.querySelector('#voiceFocusStage .voice-focus-toolbar');
    if (!toolbar) return null;
    let chip = toolbar.querySelector('.v36-voice-state');
    if (!chip) {
      chip = document.createElement('span');
      chip.className = 'v36-voice-state';
      toolbar.prepend(chip);
    }
    return chip;
  }

  function polishContext() {
    const shell = document.getElementById('appShell');
    const step = document.getElementById('voiceFocusStep');
    const title = document.getElementById('voiceFocusTitle');
    if (!shell || !step || !title) return;

    const guide = guideState();
    shell.classList.toggle('v36-no-guide', !guide);
    if (guide) {
      step.textContent = `Schritt ${guide.guideStep} von ${guide.guideStepCount}`;
      title.hidden = false;
      title.textContent = guide.guideTitle || 'Aktiver Ablauf';
    } else {
      step.textContent = 'Sprachmodus';
      title.hidden = true;
      title.textContent = '';
    }
  }

  function polishVoiceCopy() {
    const shell = document.getElementById('appShell');
    const status = document.getElementById('voiceStatus');
    const hint = document.getElementById('voiceHint');
    if (!shell || !status || !hint) return;

    const current = status.textContent.trim();
    if (/natürliche stimme wird vorbereitet/i.test(current)) {
      status.textContent = 'DokoHilf bereitet die Antwort vor …';
      hint.textContent = 'Einen kurzen Moment bitte.';
    } else if (/doko ?hilf spricht natürlich/i.test(current)) {
      status.textContent = 'DokoHilf spricht …';
      hint.textContent = 'Danach höre ich automatisch wieder zu.';
    }
  }

  function updateStateChip() {
    const shell = document.getElementById('appShell');
    const chip = ensureStateChip();
    if (!shell || !chip) return;
    chip.textContent = STATE_LABELS[shell.dataset.voiceState] || 'Bereit';
  }

  function sync() {
    scheduled = false;
    ensureChatButton();
    polishContext();
    polishVoiceCopy();
    updateStateChip();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  function init() {
    sync();
    const shell = document.getElementById('appShell');
    const stage = document.getElementById('voiceFocusStage');
    if (shell) new MutationObserver(schedule).observe(shell, { attributes: true, attributeFilter: ['data-mode', 'data-voice-state'], childList: true, subtree: true });
    if (stage) new MutationObserver(schedule).observe(stage, { childList: true, subtree: true });
    window.addEventListener('dokohilf:guide-state', schedule);
    window.addEventListener('pageshow', schedule);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.DokoHilfVoicePolishV36 = { sync, polishContext, polishVoiceCopy, updateStateChip };
})();
