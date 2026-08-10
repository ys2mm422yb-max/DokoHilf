(() => {
  'use strict';

  const STYLE_ID = 'dokohilf-mobile-polish-v29';
  const CHAT_VIEWPORT_REVISION = '20260810-mobile-chat-viewport-v38-1';
  let previousMode = '';
  const css = `
html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .legal-note{display:none!important}
html[data-dokohilf-ui="v29"] .message.v29-mobile-welcome{display:none!important}
html[data-dokohilf-ui="v29"] .app-shell:not([data-v29-guide-active="true"]) .command-row[data-v29-mobile-initial="true"]{display:none!important}
html[data-dokohilf-ui="v29"] .workspace[hidden]{display:none!important}

@media(max-width:700px){
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .topbar,
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .topbar{
    position:relative!important;top:auto!important;margin-top:6px!important;transform:none!important;
  }

  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .main-content{padding-top:14px!important}
  html[data-dokohilf-ui="v29"] .start-copy{margin-bottom:11px!important}
  html[data-dokohilf-ui="v29"] .start-copy:before{min-height:25px!important;margin-bottom:8px!important;padding:0 10px!important;font-size:8.5px!important}
  html[data-dokohilf-ui="v29"] .start-copy h1{font-size:clamp(34px,9.2vw,42px)!important;line-height:.99!important}
  html[data-dokohilf-ui="v29"] .start-copy p{margin-top:8px!important;font-size:13.5px!important;line-height:1.38!important}
  html[data-dokohilf-ui="v29"] .start-copy:after{width:min(265px,70%)!important;height:18px!important;margin:7px auto 0!important;opacity:.56!important}

  html[data-dokohilf-ui="v29"] .mode-grid{gap:9px!important}
  html[data-dokohilf-ui="v29"] .mode-card{
    grid-template-columns:54px minmax(0,1fr) 34px!important;grid-template-rows:1fr!important;column-gap:12px!important;align-items:center!important;
    min-height:94px!important;padding:11px 13px!important;border-radius:21px!important;
  }
  html[data-dokohilf-ui="v29"] .mode-icon{
    width:50px!important;height:50px!important;grid-column:1!important;grid-row:1!important;place-self:center!important;margin:0!important;transform:none!important;
  }
  html[data-dokohilf-ui="v29"] .mode-icon svg{width:27px!important;height:27px!important}
  html[data-dokohilf-ui="v29"] .mode-text{
    min-width:0!important;grid-column:2!important;grid-row:1!important;align-self:center!important;display:flex!important;flex-direction:column!important;justify-content:center!important;margin:0!important;
  }
  html[data-dokohilf-ui="v29"] .mode-text strong{font-size:20px!important;line-height:1.08!important}
  html[data-dokohilf-ui="v29"] .mode-text small{margin-top:4px!important;font-size:12.8px!important;line-height:1.3!important}
  html[data-dokohilf-ui="v29"] .mode-arrow{
    position:static!important;right:auto!important;top:auto!important;grid-column:3!important;grid-row:1!important;place-self:center!important;transform:none!important;
    width:34px!important;height:34px!important;font-size:26px!important;margin:0!important;
  }

  html[data-dokohilf-ui="v29"] .examples{margin-top:10px!important;padding:10px!important;gap:7px!important;border-radius:20px!important}
  html[data-dokohilf-ui="v29"] .examples>span{margin-bottom:1px!important;font-size:9px!important;letter-spacing:.1em!important}
  html[data-dokohilf-ui="v29"] .examples button{
    min-height:64px!important;padding:8px 7px 8px 45px!important;border-radius:14px!important;
    font-size:12.8px!important;line-height:1.12!important;word-break:normal!important;overflow-wrap:normal!important;hyphens:none!important;
  }
  html[data-dokohilf-ui="v29"] .examples button:before{left:8px!important;width:29px!important;height:29px!important;font-size:14px!important}
  html[data-dokohilf-ui="v29"] .examples button:after{margin-top:4px!important;font-size:9.5px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .legal-note{margin-top:10px!important;padding-bottom:9px!important;font-size:10px!important}

  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"]{
    min-height:100dvh!important;
    height:var(--dokohilf-chat-viewport-height,100dvh)!important;
    max-height:var(--dokohilf-chat-viewport-height,100dvh)!important;
    padding-bottom:0!important;
    overflow:hidden!important;
    display:flex!important;
    flex-direction:column!important;
  }
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .topbar{
    flex:0 0 auto!important;
    min-height:58px!important;padding:6px 8px!important;border-radius:18px!important;
  }
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .brand img{width:36px!important;height:36px!important;border-radius:11px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .brand strong{font-size:17px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .build-pill,
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .home-button,
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .new-button{height:36px!important;min-height:36px!important;border-radius:11px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .main-content{
    flex:1 1 auto!important;
    min-height:0!important;
    width:100%!important;
    overflow-y:auto!important;
    overflow-x:hidden!important;
    overscroll-behavior-y:contain!important;
    -webkit-overflow-scrolling:touch;
    padding:8px 12px 4px!important;
  }
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .workspace:not([hidden]){
    min-height:100%!important;
    display:flex!important;
    flex-direction:column!important;
  }
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .mode-switch{max-width:340px!important;margin:0 auto 8px!important;min-height:39px!important;padding:4px!important;border-radius:14px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .mode-switch button{min-height:37px!important;font-size:12px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .guide-progress{top:0!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .chat-head{margin-bottom:8px!important;padding:12px 13px!important;border-radius:18px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .chat-head h1{font-size:24px!important;line-height:1.02!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .chat-head p{display:none!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .quick-prompts{margin-top:8px!important;gap:5px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .quick-prompts button{min-height:32px!important;padding:0 10px!important;font-size:11px!important;border-radius:10px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .conversation{min-height:0!important;margin:0!important;overflow:visible!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"]:not([data-v29-guide-active="true"]) .conversation{
    border:0!important;background:transparent!important;box-shadow:none!important;padding:0!important;
  }
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .messages{gap:8px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .messages:empty{display:none!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .bubble{padding:11px 13px!important;font-size:14px!important;line-height:1.38!important;border-radius:16px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .message.user .bubble{color:#f7fffb!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .message.assistant.v29-current-answer .bubble{color:#edf9f4!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .avatar{width:30px!important;height:30px!important;flex-basis:30px!important;border-radius:9px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .command-row{gap:6px!important;margin-top:7px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .command-row button{min-height:44px!important;border-radius:12px!important;font-size:11.5px!important}

  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .composer-wrap{
    position:relative!important;left:auto!important;right:auto!important;bottom:auto!important;z-index:30!important;
    flex:0 0 auto!important;width:100%!important;margin-top:0!important;
    padding:5px 8px calc(4px + env(safe-area-inset-bottom))!important;
    border-top-color:rgba(78,230,160,.10)!important;background:rgba(1,10,15,.94)!important;
  }
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .composer{gap:5px!important;padding:3px!important;border:1px solid rgba(117,217,188,.13)!important;border-radius:17px!important;background:rgba(6,24,30,.94)!important;box-shadow:0 10px 28px rgba(0,0,0,.28)!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .composer textarea{
    min-width:0!important;min-height:44px!important;max-height:88px!important;padding:10px 11px!important;
    border-radius:13px!important;font-size:16px!important;-webkit-text-size-adjust:100%;text-size-adjust:100%;
  }
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .small-mic{width:44px!important;min-width:44px!important;height:44px!important;min-height:44px!important;border-radius:13px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .small-mic svg{width:24px!important;height:24px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .send-button{min-width:80px!important;height:44px!important;min-height:44px!important;padding:0 12px!important;border-radius:13px!important;font-size:15px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .composer-wrap>p{margin:3px 5px 0!important;color:#78918b!important;font-size:10.5px!important;line-height:1.2!important}
}

@media(max-width:420px){
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .brand small{display:none!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .topbar{min-height:60px!important;padding:6px 8px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .brand img{width:38px!important;height:38px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .brand strong{font-size:18px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .build-pill{height:37px!important;min-height:37px!important}
  html[data-dokohilf-ui="v29"] .examples button{font-size:12.5px!important;padding-left:43px!important}
  html[data-dokohilf-ui="v29"] .examples button:before{left:7px!important;width:28px!important;height:28px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .build-pill{min-width:72px!important;padding:0 9px!important;font-size:12px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .home-button{width:36px!important;min-width:36px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .new-button{min-width:55px!important;padding:0 9px!important;font-size:12px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"] .send-button{min-width:76px!important;padding:0 10px!important;font-size:14px!important}
}
`;

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function isInitialWelcome(message) {
    const bubble = message.querySelector('.bubble');
    const text = (bubble?.textContent || '').replace(/\s+/g, ' ').trim();
    return /^Hallo!\s*Schreib einfach,?\s*was du in der Dokumentation machen möchtest\.?$/i.test(text);
  }

  function syncChatViewport() {
    const shell = document.getElementById('appShell');
    if (!shell) return;
    if (shell.dataset.mode !== 'chat') {
      shell.style.removeProperty('--dokohilf-chat-viewport-height');
      return;
    }
    const viewportHeight = Number(window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 0);
    if (!viewportHeight) return;
    shell.style.setProperty('--dokohilf-chat-viewport-height', `${Math.max(240, Math.round(viewportHeight))}px`);
  }

  function polishChat() {
    const shell = document.getElementById('appShell');
    const chatHead = document.getElementById('chatHead');
    if (!shell || !chatHead) return;

    const mode = shell.dataset.mode || 'start';
    const activeGuide = shell.dataset.v29GuideActive === 'true';
    const initialChat = mode === 'chat' && !activeGuide;
    const messages = document.getElementById('messages');

    syncChatViewport();

    if (messages && initialChat) {
      [...messages.querySelectorAll('.message.assistant')].forEach(message => {
        if (isInitialWelcome(message)) message.remove();
      });
    }

    const commandRow = document.getElementById('commandRow');
    if (commandRow && mode === 'chat') {
      const initialValue = String(!activeGuide);
      if (commandRow.dataset.v29MobileInitial !== initialValue) commandRow.dataset.v29MobileInitial = initialValue;
      if (commandRow.hidden !== !activeGuide) commandRow.hidden = !activeGuide;
    }

    if (previousMode !== mode) {
      previousMode = mode;
      if (mode === 'chat') requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
    }
  }

  function installViewportObservers() {
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', syncChatViewport);
    viewport?.addEventListener('scroll', syncChatViewport);
    window.addEventListener('resize', syncChatViewport);
    window.addEventListener('orientationchange', () => window.setTimeout(syncChatViewport, 100));
    window.addEventListener('pageshow', syncChatViewport);
  }

  installStyle();
  installViewportObservers();
  polishChat();

  const observer = new MutationObserver(() => polishChat());
  observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-mode', 'data-v29-guide-active', 'hidden'] });
  window.__DOKOHILF_MOBILE_POLISH_V29__ = true;
  window.DokoHilfMobilePolishV29 = {
    sync: polishChat,
    syncChatViewport,
    revision: CHAT_VIEWPORT_REVISION,
  };
})();