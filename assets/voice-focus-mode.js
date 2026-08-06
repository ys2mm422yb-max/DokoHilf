(() => {
  'use strict';

  const DEFAULT_INSTRUCTION = 'Tippe auf das Mikrofon und sag mir, wobei du Hilfe brauchst.';
  const root = typeof window !== 'undefined' ? window : globalThis;

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
      html.dokohilf-voice-focus,body.dokohilf-voice-focus{overflow:hidden!important;overscroll-behavior:none}
      .voice-focus-stage{display:none;position:relative;isolation:isolate;min-height:0}
      .voice-focus-toolbar{position:absolute;top:3px;right:3px;z-index:5}
      .voice-focus-toolbar button{min-height:40px;padding:0 13px;border:1px solid rgba(11,107,82,.18);border-radius:999px;background:rgba(255,255,255,.9);color:#0b5d49;font-size:12px;font-weight:800;box-shadow:0 8px 24px rgba(8,67,50,.1);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
      .voice-focus-instruction{position:relative;z-index:2;width:min(720px,100%);padding:19px 20px;border:1px solid rgba(11,107,82,.16);border-radius:24px;background:rgba(255,255,255,.93);box-shadow:0 18px 46px rgba(8,67,50,.11);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);text-align:center}
      .voice-focus-kicker{display:block;color:#47786a;font-size:11px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}
      .voice-focus-instruction p{margin:8px auto 0;max-width:650px;color:#14201c;font-size:clamp(20px,4.6vw,30px);font-weight:760;line-height:1.3;letter-spacing:-.025em;text-wrap:balance}
      .voice-focus-stage::before{content:'';position:absolute;z-index:-1;width:350px;height:350px;left:50%;top:55%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(21,154,121,.14),rgba(21,154,121,0) 70%);pointer-events:none}
      .app-shell[data-mode="voice"] .main-content{width:100%!important;height:calc(100dvh - 70px);padding:0 14px calc(104px + env(safe-area-inset-bottom))!important;overflow:hidden}
      .app-shell[data-mode="voice"] .workspace{height:100%;display:block!important}
      .app-shell[data-mode="voice"] .mode-switch{display:none!important}
      .app-shell[data-mode="voice"] .chat-head,.app-shell[data-mode="voice"] .messages,.app-shell[data-mode="voice"] .legal-note,.app-shell[data-mode="voice"] .guide-progress{display:none!important}
      .app-shell[data-mode="voice"] .voice-focus-stage{display:flex!important;height:100%;max-width:780px;margin:0 auto;padding:18px 4px 8px;flex-direction:column;align-items:center;justify-content:center;gap:18px}
      .app-shell[data-mode="voice"] .voice-focus-stage .voice-console{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;z-index:2!important;display:flex!important;visibility:visible!important;opacity:1!important;width:auto!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;transform:none!important;grid-template-columns:none!important;flex-direction:column;align-items:center;text-align:center}
      .app-shell[data-mode="voice"] .voice-focus-stage .voice-orb{width:clamp(178px,31vh,236px)!important;height:clamp(178px,31vh,236px)!important;min-width:0!important;margin:0!important;border:1px solid rgba(255,255,255,.5);box-shadow:0 24px 70px rgba(6,77,59,.27),0 0 0 18px rgba(11,107,82,.07),0 0 0 38px rgba(11,107,82,.035),inset 0 1px 0 rgba(255,255,255,.45)!important}
      .app-shell[data-mode="voice"] .voice-focus-stage .orb-rings{inset:-16px!important;border-width:2px!important;animation:voiceFocusRing 2.5s ease-in-out infinite}
      .app-shell[data-mode="voice"] .voice-focus-stage .orb-rings:before{inset:-15px!important;animation:voiceFocusRing 2.5s .35s ease-in-out infinite}
      .app-shell[data-mode="voice"] .voice-focus-stage .orb-rings:after{inset:-32px!important;animation:voiceFocusRing 2.5s .7s ease-in-out infinite}
      .app-shell[data-mode="voice"] .voice-focus-stage .mic-symbol svg{width:76px!important;height:76px!important}
      .app-shell[data-mode="voice"] .voice-focus-stage .voice-wave{gap:7px!important}
      .app-shell[data-mode="voice"] .voice-focus-stage .voice-wave i{width:8px!important;height:34px;border-radius:8px!important;animation-duration:.86s!important}
      .app-shell[data-mode="voice"] .voice-focus-stage .voice-copy{margin:17px 0 0!important;text-align:center!important}
      .app-shell[data-mode="voice"] .voice-focus-stage .voice-copy strong{display:block!important;max-width:90vw;overflow:visible!important;font-size:20px!important;line-height:1.2!important;text-overflow:clip!important;white-space:normal!important}
      .app-shell[data-mode="voice"] .voice-focus-stage .voice-copy>span:not(.voice-engine-badge){display:block!important;margin-top:4px!important;font-size:13px!important;line-height:1.35!important}
      .app-shell[data-mode="voice"] .voice-focus-stage .voice-engine-badge{margin:8px auto 0!important}
      .app-shell[data-mode="voice"] .voice-focus-stage .pause-button{min-height:42px!important;max-width:none!important;margin:12px 0 0!important;padding:0 16px!important;border-radius:999px!important;font-size:12px!important}
      .app-shell[data-mode="voice"] .conversation{position:static!important;margin:0!important;max-width:none!important}
      .app-shell[data-mode="voice"] .command-row{position:fixed;z-index:130;left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));bottom:calc(9px + env(safe-area-inset-bottom));width:min(740px,calc(100% - 20px));margin:0 auto!important;padding:8px;grid-template-columns:repeat(4,1fr)!important;gap:7px!important;border:1px solid rgba(11,107,82,.15);border-radius:18px;background:rgba(255,255,255,.95);box-shadow:0 16px 42px rgba(8,67,50,.2);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
      .app-shell[data-mode="voice"] .command-row button{min-height:48px!important;padding:0 8px!important;border-radius:12px!important;font-size:12px!important}
      .app-shell[data-mode="voice"][data-voice-state="listening"] .voice-focus-instruction{border-color:rgba(37,111,208,.25);box-shadow:0 18px 46px rgba(37,111,208,.12)}
      .app-shell[data-mode="voice"][data-voice-state="speaking"] .voice-focus-instruction{border-color:rgba(96,68,173,.22);box-shadow:0 18px 46px rgba(96,68,173,.12)}
      .app-shell[data-mode="voice"][data-voice-state="speaking"] .voice-orb{animation:voiceFocusSpeak 1.2s ease-in-out infinite!important}
      @keyframes voiceFocusRing{0%,100%{opacity:.28;transform:scale(.96)}50%{opacity:.85;transform:scale(1.04)}}
      @keyframes voiceFocusSpeak{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
      @media(max-width:640px){
        .app-shell[data-mode="voice"] .main-content{height:calc(100dvh - 64px);padding-left:10px!important;padding-right:10px!important}
        .app-shell[data-mode="voice"] .voice-focus-stage{padding-top:10px;gap:13px}
        .voice-focus-toolbar button{min-height:36px;padding:0 11px;font-size:11px}
        .voice-focus-instruction{padding:15px;border-radius:20px}
        .voice-focus-instruction p{font-size:clamp(18px,5.1vw,24px);line-height:1.28}
        .app-shell[data-mode="voice"] .voice-focus-stage .voice-orb{width:clamp(168px,29vh,214px)!important;height:clamp(168px,29vh,214px)!important}
        .app-shell[data-mode="voice"] .command-row{grid-template-columns:repeat(2,1fr)!important}
        .app-shell[data-mode="voice"] .command-row button{min-height:44px!important}
      }
      @media(max-height:690px){
        .app-shell[data-mode="voice"] .voice-focus-stage{gap:9px;justify-content:flex-start;padding-top:44px}
        .voice-focus-instruction{padding:12px 14px}.voice-focus-instruction p{font-size:18px;margin-top:5px}
        .app-shell[data-mode="voice"] .voice-focus-stage .voice-orb{width:154px!important;height:154px!important}
        .app-shell[data-mode="voice"] .voice-focus-stage .voice-copy{margin-top:10px!important}
      }
      @media(prefers-reduced-motion:reduce){.app-shell[data-mode="voice"] .voice-focus-stage .orb-rings,.app-shell[data-mode="voice"] .voice-focus-stage .orb-rings:before,.app-shell[data-mode="voice"] .voice-focus-stage .orb-rings:after,.app-shell[data-mode="voice"][data-voice-state="speaking"] .voice-orb{animation:none!important}}
    `;
    document.head.append(style);
  }

  function ensureStage() {
    let stage = document.getElementById('voiceFocusStage');
    if (stage) return stage;
    const workspace = document.getElementById('workspace');
    const consoleElement = document.getElementById('voiceConsole');
    const conversation = document.querySelector('.conversation');
    if (!workspace || !consoleElement || !conversation) return null;

    stage = document.createElement('section');
    stage.id = 'voiceFocusStage';
    stage.className = 'voice-focus-stage';
    stage.setAttribute('aria-label', 'Fokussiertes Sprachgespräch');
    stage.innerHTML = `
      <div class="voice-focus-toolbar"><button type="button" data-switch-mode="chat" aria-label="Chatverlauf anzeigen">Chatverlauf</button></div>
      <div class="voice-focus-instruction" aria-live="polite" aria-atomic="true">
        <span class="voice-focus-kicker" id="voiceFocusKicker">Aktuelle Anweisung</span>
        <p id="voiceFocusText">${DEFAULT_INSTRUCTION}</p>
      </div>
    `;
    stage.append(consoleElement);
    workspace.insertBefore(stage, conversation);
    return stage;
  }

  function latestAssistantInstruction() {
    const nodes = [...document.querySelectorAll('#messages .message.assistant:not(.typing) .bubble p')];
    return cleanInstruction(nodes.at(-1)?.textContent || '');
  }

  function currentProgressLabel() {
    const title = cleanInstruction(document.getElementById('guideProgressTitle')?.textContent || '');
    const step = cleanInstruction(document.getElementById('guideProgressStep')?.textContent || '');
    if (title && step) return `${title} · ${step}`;
    return title || 'Aktuelle Anweisung';
  }

  function updateInstruction() {
    const text = document.getElementById('voiceFocusText');
    const kicker = document.getElementById('voiceFocusKicker');
    if (!text || !kicker) return;
    const nextText = latestAssistantInstruction() || DEFAULT_INSTRUCTION;
    const nextKicker = currentProgressLabel();
    if (text.textContent !== nextText) text.textContent = nextText;
    if (kicker.textContent !== nextKicker) kicker.textContent = nextKicker;
  }

  function syncMode() {
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

  function observeProgress() {
    const progress = document.getElementById('guideProgress');
    if (!progress || progress.dataset.voiceFocusObserver === 'active') return false;
    progress.dataset.voiceFocusObserver = 'active';
    new MutationObserver(updateInstruction).observe(progress, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
    return true;
  }

  function observeChanges() {
    const shell = document.getElementById('appShell');
    const messages = document.getElementById('messages');
    if (shell && shell.dataset.voiceFocusObserver !== 'active') {
      shell.dataset.voiceFocusObserver = 'active';
      new MutationObserver(syncMode).observe(shell, {
        attributes: true,
        attributeFilter: ['data-mode', 'data-voice-state'],
      });
    }
    if (messages && messages.dataset.voiceFocusObserver !== 'active') {
      messages.dataset.voiceFocusObserver = 'active';
      new MutationObserver(updateInstruction).observe(messages, { childList: true, subtree: true });
    }
    if (!observeProgress()) {
      const workspace = document.getElementById('workspace');
      if (workspace && workspace.dataset.voiceFocusDiscovery !== 'active') {
        workspace.dataset.voiceFocusDiscovery = 'active';
        const discovery = new MutationObserver(() => {
          if (observeProgress()) discovery.disconnect();
        });
        discovery.observe(workspace, { childList: true });
      }
    }
  }

  function initialize() {
    installStyles();
    ensureStage();
    observeChanges();
    updateInstruction();
    syncMode();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
  window.addEventListener('pageshow', initialize);

  window.__DOKOHILF_VOICE_FOCUS_MODE__ = true;
})();