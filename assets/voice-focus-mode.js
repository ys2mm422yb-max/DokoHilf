(() => {
  'use strict';

  const DEFAULT_INSTRUCTION = 'Tippe auf das Mikrofon und sag mir, wobei du Hilfe brauchst.';
  const root = typeof window !== 'undefined' ? window : globalThis;
  let observersInstalled = false;
  let actionsInstalled = false;

  function cleanInstruction(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  root.DokoHilfVoiceFocus = { cleanInstruction };
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  function installStyles() {
    if (document.getElementById('voiceFocusStyles')) return;
    const style = document.createElement('style');
    style.id = 'voiceFocusStyles';
    style.textContent = `
      html.dokohilf-voice-focus,body.dokohilf-voice-focus{height:100%;overflow:hidden!important;overscroll-behavior:none;background:#eef7f4}
      .voice-focus-stage{display:none;position:fixed;z-index:26;inset:64px 0 0;overflow:hidden;background:
        radial-gradient(circle at 50% 35%,rgba(38,169,132,.16),transparent 34%),
        linear-gradient(180deg,#f8fcfb 0%,#edf7f3 52%,#e8f3ef 100%)}
      .voice-focus-inner{width:min(760px,100%);height:100%;margin:0 auto;padding:18px max(14px,env(safe-area-inset-left)) calc(96px + env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-right));display:grid;grid-template-rows:auto 1fr auto;gap:16px;align-items:center}
      .voice-focus-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .voice-focus-progress{min-width:0;display:grid;gap:2px}
      .voice-focus-progress span{color:#5a7a70;font-size:11px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}
      .voice-focus-progress strong{overflow:hidden;color:#123c31;font-size:15px;line-height:1.25;text-overflow:ellipsis;white-space:nowrap}
      .voice-focus-toolbar{display:flex;gap:8px;flex:0 0 auto}
      .voice-focus-toolbar button{min-height:40px;padding:0 13px;border:1px solid rgba(11,107,82,.17);border-radius:999px;background:rgba(255,255,255,.9);color:#0b5d49;font-size:12px;font-weight:850;box-shadow:0 8px 22px rgba(8,67,50,.08);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
      .voice-focus-main{min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px}
      .voice-focus-instruction{width:min(680px,100%);padding:20px 22px;border:1px solid rgba(11,107,82,.14);border-radius:26px;background:rgba(255,255,255,.94);box-shadow:0 20px 54px rgba(8,67,50,.12);text-align:center;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
      .voice-focus-instruction p{margin:0;color:#14201c;font-size:clamp(20px,4.8vw,30px);font-weight:760;line-height:1.31;letter-spacing:-.025em;text-wrap:balance}
      .voice-focus-stage .voice-console{position:relative!important;display:flex!important;visibility:visible!important;opacity:1!important;width:auto!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;transform:none!important;flex-direction:column;align-items:center;text-align:center}
      .voice-focus-stage .voice-orb{width:clamp(184px,29vh,238px)!important;height:clamp(184px,29vh,238px)!important;margin:0!important;border:1px solid rgba(255,255,255,.58)!important;box-shadow:0 28px 76px rgba(6,77,59,.28),0 0 0 18px rgba(11,107,82,.07),0 0 0 39px rgba(11,107,82,.035),inset 0 1px 0 rgba(255,255,255,.48)!important}
      .voice-focus-stage .orb-rings{inset:-17px!important;border-width:2px!important;animation:voiceFocusRing 2.6s ease-in-out infinite}
      .voice-focus-stage .orb-rings:before{inset:-16px!important;animation:voiceFocusRing 2.6s .35s ease-in-out infinite}
      .voice-focus-stage .orb-rings:after{inset:-34px!important;animation:voiceFocusRing 2.6s .7s ease-in-out infinite}
      .voice-focus-stage .mic-symbol svg{width:78px!important;height:78px!important}
      .voice-focus-stage .voice-wave{gap:7px!important}
      .voice-focus-stage .voice-wave i{width:8px!important;height:36px;border-radius:8px!important;animation-duration:.86s!important}
      .voice-focus-stage .voice-copy{margin:18px 0 0!important;text-align:center!important}
      .voice-focus-stage .voice-copy strong{display:block!important;max-width:88vw;font-size:20px!important;line-height:1.2!important;white-space:normal!important}
      .voice-focus-stage .voice-copy>span:not(.voice-engine-badge){display:block!important;margin-top:5px!important;font-size:13px!important;line-height:1.35!important}
      .voice-focus-stage .voice-engine-badge{margin:8px auto 0!important}
      .voice-focus-stage .pause-button{min-height:42px!important;margin:12px 0 0!important;padding:0 17px!important;border-radius:999px!important;font-size:12px!important}
      .voice-focus-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:min(720px,100%)}
      .voice-focus-actions button{min-height:50px;padding:0 8px;border:1px solid rgba(11,107,82,.16);border-radius:15px;background:rgba(255,255,255,.94);color:#153e33;font-size:13px;font-weight:850;box-shadow:0 8px 22px rgba(8,67,50,.08)}
      .voice-focus-actions button[data-voice-command="ich finde das nicht"]{background:#fff8df;border-color:#ead796}
      .app-shell[data-mode="voice"]{padding-bottom:0!important}
      .app-shell[data-mode="voice"] .topbar{position:fixed;left:0;right:0;top:0;z-index:31;min-height:64px;height:64px}
      .app-shell[data-mode="voice"] .brand small{display:none!important}
      .app-shell[data-mode="voice"] .main-content{padding:0!important;width:100%!important;max-width:none!important;margin:0!important}
      .app-shell[data-mode="voice"] .workspace{display:block!important}
      .app-shell[data-mode="voice"] .mode-switch,.app-shell[data-mode="voice"] .conversation,.app-shell[data-mode="voice"] .chat-head,.app-shell[data-mode="voice"] .legal-note,.app-shell[data-mode="voice"] .guide-progress{display:none!important}
      .app-shell[data-mode="voice"] .voice-focus-stage{display:block!important}
      .app-shell[data-mode="voice"][data-voice-state="listening"] .voice-focus-instruction{border-color:rgba(37,111,208,.24);box-shadow:0 20px 54px rgba(37,111,208,.13)}
      .app-shell[data-mode="voice"][data-voice-state="speaking"] .voice-focus-instruction{border-color:rgba(96,68,173,.22);box-shadow:0 20px 54px rgba(96,68,173,.12)}
      .app-shell[data-mode="voice"][data-voice-state="speaking"] .voice-orb{animation:voiceFocusSpeak 1.2s ease-in-out infinite!important}
      @keyframes voiceFocusRing{0%,100%{opacity:.26;transform:scale(.96)}50%{opacity:.82;transform:scale(1.045)}}
      @keyframes voiceFocusSpeak{0%,100%{transform:scale(1)}50%{transform:scale(1.038)}}
      @media(max-width:640px){
        .voice-focus-inner{padding-top:12px;gap:11px}
        .voice-focus-main{gap:16px}
        .voice-focus-instruction{padding:16px;border-radius:21px}
        .voice-focus-instruction p{font-size:clamp(18px,5.3vw,24px);line-height:1.28}
        .voice-focus-stage .voice-orb{width:clamp(168px,27vh,214px)!important;height:clamp(168px,27vh,214px)!important}
        .voice-focus-actions{grid-template-columns:1fr 1fr}
        .voice-focus-actions button{min-height:46px}
        .voice-focus-toolbar button{min-height:37px;padding:0 11px;font-size:11px}
      }
      @media(max-height:720px){
        .voice-focus-inner{padding-top:9px;padding-bottom:calc(82px + env(safe-area-inset-bottom));gap:8px}
        .voice-focus-main{gap:10px}
        .voice-focus-instruction{padding:13px 15px}.voice-focus-instruction p{font-size:18px}
        .voice-focus-stage .voice-orb{width:150px!important;height:150px!important}
        .voice-focus-stage .voice-copy{margin-top:9px!important}
        .voice-focus-stage .pause-button{margin-top:8px!important}
        .voice-focus-actions button{min-height:42px}
      }
      @media(prefers-reduced-motion:reduce){.voice-focus-stage .orb-rings,.voice-focus-stage .orb-rings:before,.voice-focus-stage .orb-rings:after,.app-shell[data-mode="voice"][data-voice-state="speaking"] .voice-orb{animation:none!important}}
    `;
    document.head.append(style);
  }

  function removeLegacyShortcuts() {
    const selectors = [
      '#notfallblattButton',
      '.notfallblatt-button',
      '.persistent-voice-control',
      '[data-notfallblatt-shortcut]',
      'button[aria-label*="Notfallblatt"]',
    ];
    for (const node of document.querySelectorAll(selectors.join(','))) node.remove();
    document.getElementById('persistentVoiceControlStyles')?.remove();
  }

  function ensureStage() {
    let stage = document.getElementById('voiceFocusStage');
    if (stage) return stage;
    const workspace = document.getElementById('workspace');
    const consoleElement = document.getElementById('voiceConsole');
    if (!workspace || !consoleElement) return null;

    stage = document.createElement('section');
    stage.id = 'voiceFocusStage';
    stage.className = 'voice-focus-stage';
    stage.setAttribute('aria-label', 'Fokussiertes Sprachgespräch');
    stage.innerHTML = `
      <div class="voice-focus-inner">
        <div class="voice-focus-top">
          <div class="voice-focus-progress">
            <span id="voiceFocusStep">Bereit</span>
            <strong id="voiceFocusTitle">DokoHilf</strong>
          </div>
          <div class="voice-focus-toolbar">
            <button type="button" data-switch-mode="chat">Chat anzeigen</button>
          </div>
        </div>
        <div class="voice-focus-main">
          <div class="voice-focus-instruction" aria-live="polite" aria-atomic="true">
            <p id="voiceFocusText">${DEFAULT_INSTRUCTION}</p>
          </div>
          <div id="voiceFocusConsoleSlot"></div>
        </div>
        <div class="voice-focus-actions" id="voiceFocusActions" hidden>
          <button type="button" data-voice-command="weiter">Weiter</button>
          <button type="button" data-voice-command="nochmal">Nochmal</button>
          <button type="button" data-voice-command="ich finde das nicht">Ich finde das nicht</button>
          <button type="button" data-voice-command="zurück">Zurück</button>
        </div>
      </div>
    `;
    stage.querySelector('#voiceFocusConsoleSlot')?.append(consoleElement);
    workspace.prepend(stage);
    return stage;
  }

  function latestAssistantInstruction() {
    const nodes = [...document.querySelectorAll('#messages .message.assistant:not(.typing) .bubble p')];
    return cleanInstruction(nodes.at(-1)?.textContent || '');
  }

  function currentGuide() {
    return window.DokoHilfGuideProgress?.getCurrentGuide?.() || null;
  }

  function updateInstruction() {
    const text = document.getElementById('voiceFocusText');
    const title = document.getElementById('voiceFocusTitle');
    const step = document.getElementById('voiceFocusStep');
    const actions = document.getElementById('voiceFocusActions');
    if (!text || !title || !step || !actions) return;
    const guide = currentGuide();
    text.textContent = latestAssistantInstruction() || DEFAULT_INSTRUCTION;
    title.textContent = guide?.guideTitle || 'DokoHilf';
    step.textContent = guide
      ? `Schritt ${guide.guideStep} von ${guide.guideStepCount}`
      : 'Aktuelle Anweisung';
    actions.hidden = !guide;
  }

  function syncMode() {
    removeLegacyShortcuts();
    const shell = document.getElementById('appShell');
    const stage = ensureStage();
    if (!shell || !stage) return;
    const active = shell.dataset.mode === 'voice';
    stage.hidden = !active;
    document.documentElement.classList.toggle('dokohilf-voice-focus', active);
    document.body.classList.toggle('dokohilf-voice-focus', active);
    if (active) {
      updateInstruction();
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    }
  }

  function installObservers() {
    if (observersInstalled) return;
    observersInstalled = true;
    const shell = document.getElementById('appShell');
    const messages = document.getElementById('messages');
    if (shell) {
      new MutationObserver(syncMode).observe(shell, {
        attributes: true,
        attributeFilter: ['data-mode', 'data-voice-state'],
      });
    }
    if (messages) {
      new MutationObserver(updateInstruction).observe(messages, { childList: true, subtree: true });
    }
    new MutationObserver(removeLegacyShortcuts).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('dokohilf:guide-state', updateInstruction);
  }

  function installActions() {
    if (actionsInstalled) return;
    actionsInstalled = true;
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-voice-command]');
      if (!button || !window.DokoHilf?.sendMessage) return;
      window.DokoHilf.sendMessage(button.dataset.voiceCommand, { fromVoice: true });
    });
  }

  function initialize() {
    installStyles();
    removeLegacyShortcuts();
    ensureStage();
    installObservers();
    installActions();
    updateInstruction();
    syncMode();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
  window.addEventListener('pageshow', initialize);

  window.__DOKOHILF_VOICE_FOCUS_MODE__ = true;
  window.__DOKOHILF_VOICE_FOCUS_V2__ = true;
})();
