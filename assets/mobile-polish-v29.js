(() => {
  'use strict';

  const STYLE_ID = 'dokohilf-mobile-polish-v29';
  const css = `
html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .legal-note{display:none!important}
html[data-dokohilf-ui="v29"] .message.v29-mobile-welcome{display:none!important}
html[data-dokohilf-ui="v29"] .app-shell:not([data-v29-guide-active="true"]) .command-row[data-v29-mobile-initial="true"]{display:none!important}
html[data-dokohilf-ui="v29"] .workspace[hidden]{display:none!important}

@media(max-width:700px){
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .topbar{
    position:relative!important;top:auto!important;margin-top:6px!important;
  }
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .main-content{padding-top:20px!important}
  html[data-dokohilf-ui="v29"] .start-copy{margin-bottom:15px!important}
  html[data-dokohilf-ui="v29"] .start-copy:before{min-height:27px!important;margin-bottom:10px!important;padding:0 11px!important;font-size:9px!important}
  html[data-dokohilf-ui="v29"] .start-copy h1{font-size:clamp(36px,9.8vw,44px)!important;line-height:1!important}
  html[data-dokohilf-ui="v29"] .start-copy p{margin-top:10px!important;font-size:14px!important;line-height:1.4!important}
  html[data-dokohilf-ui="v29"] .start-copy:after{width:min(280px,72%)!important;height:22px!important;margin:9px auto 0!important;opacity:.58!important}

  html[data-dokohilf-ui="v29"] .mode-grid{gap:10px!important}
  html[data-dokohilf-ui="v29"] .mode-card{
    grid-template-columns:68px minmax(0,1fr) 38px!important;column-gap:13px!important;
    min-height:108px!important;padding:14px 15px!important;border-radius:23px!important;
  }
  html[data-dokohilf-ui="v29"] .mode-icon{width:62px!important;height:62px!important}
  html[data-dokohilf-ui="v29"] .mode-icon svg{width:32px!important;height:32px!important}
  html[data-dokohilf-ui="v29"] .mode-text strong{font-size:22px!important}
  html[data-dokohilf-ui="v29"] .mode-text small{margin-top:5px!important;font-size:13.5px!important;line-height:1.33!important}
  html[data-dokohilf-ui="v29"] .mode-arrow{width:36px!important;height:36px!important;font-size:28px!important}

  html[data-dokohilf-ui="v29"] .examples{margin-top:12px!important;padding:11px!important;gap:8px!important;border-radius:21px!important}
  html[data-dokohilf-ui="v29"] .examples>span{margin-bottom:2px!important;font-size:9.5px!important;letter-spacing:.11em!important}
  html[data-dokohilf-ui="v29"] .examples button{
    min-height:70px!important;padding:9px 8px 9px 49px!important;border-radius:15px!important;
    font-size:13.5px!important;line-height:1.12!important;word-break:normal!important;overflow-wrap:normal!important;hyphens:none!important;
  }
  html[data-dokohilf-ui="v29"] .examples button:before{left:9px!important;width:32px!important;height:32px!important;font-size:15px!important}
  html[data-dokohilf-ui="v29"] .examples button:after{margin-top:5px!important;font-size:10px!important}
  html[data-dokohilf-ui="v29"] .legal-note{margin-top:12px!important;padding-bottom:10px!important;font-size:10.5px!important}

  html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]){min-height:100dvh!important}
  html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .topbar{
    top:max(5px,env(safe-area-inset-top))!important;min-height:60px!important;padding:7px 8px!important;border-radius:19px!important;
  }
  html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .brand img{width:38px!important;height:38px!important;border-radius:12px!important}
  html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .brand strong{font-size:18px!important}
  html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .build-pill,
  html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .home-button,
  html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .new-button{height:38px!important;min-height:38px!important;border-radius:12px!important}
  html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .main-content{padding:12px 12px 8px!important}
  html[data-dokohilf-ui="v29"] .workspace:not([hidden]){min-height:calc(100dvh - 176px)!important;display:flex!important;flex-direction:column!important}
  html[data-dokohilf-ui="v29"] .mode-switch{margin-bottom:9px!important;min-height:43px!important}
  html[data-dokohilf-ui="v29"] .chat-head{margin-bottom:10px!important;padding:14px 15px!important;border-radius:19px!important}
  html[data-dokohilf-ui="v29"] .chat-head h1{font-size:27px!important;line-height:1.03!important}
  html[data-dokohilf-ui="v29"] .chat-head p{display:none!important}
  html[data-dokohilf-ui="v29"] .quick-prompts{margin-top:10px!important;gap:6px!important}
  html[data-dokohilf-ui="v29"] .quick-prompts button{min-height:34px!important;padding:0 11px!important;font-size:11.5px!important;border-radius:11px!important}
  html[data-dokohilf-ui="v29"] .conversation{flex:1 1 auto!important;min-height:0!important;margin-top:0!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="chat"]:not([data-v29-guide-active="true"]) .conversation{
    border-color:transparent!important;background:transparent!important;box-shadow:none!important;padding-left:0!important;padding-right:0!important;
  }
  html[data-dokohilf-ui="v29"] .messages{gap:8px!important}
  html[data-dokohilf-ui="v29"] .bubble{padding:12px 14px!important;font-size:14.5px!important;line-height:1.4!important;border-radius:17px!important}
  html[data-dokohilf-ui="v29"] .avatar{width:31px!important;height:31px!important;flex-basis:31px!important;border-radius:10px!important}
  html[data-dokohilf-ui="v29"] .command-row{gap:7px!important;margin-top:8px!important}
  html[data-dokohilf-ui="v29"] .command-row button{min-height:40px!important;border-radius:13px!important;font-size:12px!important}

  html[data-dokohilf-ui="v29"] .composer-wrap{padding:7px 8px calc(5px + env(safe-area-inset-bottom))!important}
  html[data-dokohilf-ui="v29"] .composer{gap:6px!important;padding:5px!important;border-radius:19px!important}
  html[data-dokohilf-ui="v29"] .composer textarea{min-height:44px!important;max-height:96px!important;padding:11px 12px!important;border-radius:14px!important;font-size:15px!important}
  html[data-dokohilf-ui="v29"] .small-mic{width:44px!important;min-width:44px!important;height:44px!important;min-height:44px!important;border-radius:14px!important}
  html[data-dokohilf-ui="v29"] .small-mic svg{width:25px!important;height:25px!important}
  html[data-dokohilf-ui="v29"] .send-button{min-width:94px!important;height:44px!important;min-height:44px!important;padding:0 14px!important;border-radius:14px!important;font-size:16px!important}
  html[data-dokohilf-ui="v29"] .composer-wrap>p{margin:4px 6px 0!important;font-size:9.5px!important;line-height:1.25!important}
}

@media(max-width:420px){
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .brand small{display:none!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .topbar{min-height:62px!important;padding:7px 8px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .brand img{width:40px!important;height:40px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .brand strong{font-size:19px!important}
  html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .build-pill{height:39px!important;min-height:39px!important}
  html[data-dokohilf-ui="v29"] .examples button{font-size:13px!important;padding-left:46px!important}
  html[data-dokohilf-ui="v29"] .examples button:before{left:8px!important;width:30px!important;height:30px!important}
  html[data-dokohilf-ui="v29"] .send-button{min-width:84px!important;padding:0 11px!important;font-size:15px!important}
}
`;

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function polishChat() {
    const shell = document.getElementById('appShell');
    const chatHead = document.getElementById('chatHead');
    if (!shell || !chatHead) return;

    const messages = document.getElementById('messages');
    if (messages) {
      [...messages.querySelectorAll('.message.assistant')].forEach(message => {
        const bubble = message.querySelector('.bubble');
        const text = (bubble?.textContent || '').replace(/\s+/g, ' ').trim();
        const isWelcome = /^Hallo!\s*Schreib einfach,?\s*was du in der Dokumentation machen möchtest\.?$/i.test(text);
        message.classList.toggle('v29-mobile-welcome', shell.dataset.mode === 'chat' && isWelcome);
      });
    }

    const commandRow = document.getElementById('commandRow');
    if (commandRow) {
      const activeGuide = shell.dataset.v29GuideActive === 'true';
      commandRow.dataset.v29MobileInitial = String(shell.dataset.mode === 'chat' && !activeGuide);
    }
  }

  installStyle();
  polishChat();

  const observer = new MutationObserver(() => polishChat());
  observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-mode', 'data-v29-guide-active', 'hidden'] });
  window.__DOKOHILF_MOBILE_POLISH_V29__ = true;
})();