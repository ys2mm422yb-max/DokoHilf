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

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function guideState() {
    try { return window.DokoHilfGuideProgress?.getCurrentGuide?.() || null; } catch { return null; }
  }

  function ensureFineTuneStyles() {
    if (document.getElementById('voicePolishFineTuneV36')) return;
    const style = document.createElement('style');
    style.id = 'voicePolishFineTuneV36';
    style.textContent = `
      html[data-dokohilf-ui="v29"] .app-shell[data-mode="voice"] .voice-focus-main{
        justify-content:center!important;
      }
      html[data-dokohilf-ui="v29"] .app-shell[data-mode="voice"] .voice-focus-main>.voice-focus-actions{
        flex:0 0 auto!important;
        width:min(650px,100%)!important;
        margin:2px auto 0!important;
      }
      html[data-dokohilf-ui="v29"] .app-shell[data-mode="voice"][data-voice-state="speaking"] .voice-copy>span:not(.voice-engine-badge){
        font-size:0!important;
      }
      html[data-dokohilf-ui="v29"] .app-shell[data-mode="voice"][data-voice-state="speaking"] .voice-copy>span:not(.voice-engine-badge):after{
        content:'Danach höre ich automatisch wieder zu.';
        display:block;
        margin-top:5px;
        color:#78978f;
        font-size:12.5px;
        line-height:1.35;
      }
      @media(max-width:620px){
        html[data-dokohilf-ui="v29"] .app-shell[data-mode="voice"] .voice-focus-stage .voice-orb{
          width:160px!important;height:160px!important;flex-basis:160px!important;
        }
        html[data-dokohilf-ui="v29"] .app-shell[data-mode="voice"][data-voice-state="listening"] .voice-focus-stage .voice-orb{
          width:170px!important;height:170px!important;flex-basis:170px!important;
        }
        html[data-dokohilf-ui="v29"] .app-shell[data-mode="voice"][data-voice-state="thinking"] .voice-focus-stage .voice-orb{
          width:150px!important;height:150px!important;flex-basis:150px!important;
        }
        html[data-dokohilf-ui="v29"] .app-shell[data-mode="voice"][data-voice-state="speaking"] .voice-focus-stage .voice-orb{
          width:180px!important;height:180px!important;flex-basis:180px!important;
        }
        html[data-dokohilf-ui="v29"] .app-shell[data-mode="voice"] .v36-voice-state{display:none!important}
        html[data-dokohilf-ui="v29"] .app-shell[data-mode="voice"].v36-no-guide .v36-voice-state{display:inline-flex!important}
        html[data-dokohilf-ui="v29"] .app-shell[data-mode="voice"] .voice-focus-main>.voice-focus-actions{
          width:min(560px,100%)!important;
          margin-top:0!important;
        }
      }
      @media(max-height:760px){
        html[data-dokohilf-ui="v29"] .app-shell[data-mode="voice"] .voice-focus-main{gap:12px!important}
      }
    `;
    document.head.append(style);
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

  function dockGuideActions() {
    const main = document.querySelector('#voiceFocusStage .voice-focus-main');
    const actions = document.getElementById('voiceFocusActions');
    if (!main || !actions || actions.parentElement === main) return;
    main.append(actions);
  }

  function polishContext() {
    const shell = document.getElementById('appShell');
    const step = document.getElementById('voiceFocusStep');
    const title = document.getElementById('voiceFocusTitle');
    if (!shell || !step || !title) return;

    const guide = guideState();
    shell.classList.toggle('v36-no-guide', !guide);
    if (guide) {
      setText(step, `Schritt ${guide.guideStep} von ${guide.guideStepCount}`);
      if (title.hidden) title.hidden = false;
      setText(title, guide.guideTitle || 'Aktiver Ablauf');
    } else {
      setText(step, 'Sprachmodus');
      if (!title.hidden) title.hidden = true;
      setText(title, '');
    }
  }

  function polishInstructionSpacing() {
    const text = document.getElementById('voiceFocusText');
    if (!text) return;
    const current = text.textContent || '';
    const polished = current.replace(/([.!?])(?=[A-ZÄÖÜ])/g, '$1 ');
    setText(text, polished);
  }

  function polishVoiceCopy() {
    const shell = document.getElementById('appShell');
    const status = document.getElementById('voiceStatus');
    const hint = document.getElementById('voiceHint');
    if (!shell || !status || !hint) return;

    const current = status.textContent.trim();
    if (/natürliche stimme wird vorbereitet/i.test(current)) {
      setText(status, 'DokoHilf bereitet die Antwort vor …');
      setText(hint, 'Einen kurzen Moment bitte.');
    } else if (/doko ?hilf spricht natürlich/i.test(current)) {
      setText(status, 'DokoHilf spricht …');
      setText(hint, 'Danach höre ich automatisch wieder zu.');
    }

    if (shell.dataset.voiceState === 'speaking' && /supertonic(?:-f1)?\s+wird\s+abgespielt/i.test(hint.textContent || '')) {
      setText(hint, 'Danach höre ich automatisch wieder zu.');
    }
  }

  function updateStateChip() {
    const shell = document.getElementById('appShell');
    const chip = ensureStateChip();
    if (!shell || !chip) return;
    setText(chip, STATE_LABELS[shell.dataset.voiceState] || 'Bereit');
  }

  function sync() {
    scheduled = false;
    ensureFineTuneStyles();
    ensureChatButton();
    dockGuideActions();
    polishContext();
    polishInstructionSpacing();
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

  window.DokoHilfVoicePolishV36 = {
    sync,
    dockGuideActions,
    polishContext,
    polishInstructionSpacing,
    polishVoiceCopy,
    updateStateChip,
  };
})();
