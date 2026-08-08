(() => {
  'use strict';

  const PREMIUM_HOME_REVISION = '20260808-premium-home-v29-1';
  let historyExpanded = false;
  let scheduled = false;

  const premiumCss = `
html[data-dokohilf-ui="v29"] body{
  background:
    radial-gradient(circle at 10% 0%,rgba(41,227,151,.105),transparent 26rem),
    radial-gradient(circle at 92% 25%,rgba(48,138,255,.07),transparent 30rem),
    linear-gradient(180deg,#01090f 0%,#031118 48%,#01080d 100%)!important;
}
html[data-dokohilf-ui="v29"] .topbar{
  position:sticky!important;top:max(7px,env(safe-area-inset-top))!important;z-index:50!important;
  width:min(840px,calc(100% - 24px))!important;min-height:74px!important;margin:10px auto 0!important;padding:10px 12px!important;
  border:1px solid rgba(80,228,170,.20)!important;border-radius:24px!important;
  background:linear-gradient(135deg,rgba(5,24,31,.94),rgba(6,40,38,.91))!important;
  box-shadow:0 18px 55px rgba(0,0,0,.38),inset 0 1px rgba(255,255,255,.065)!important;
  backdrop-filter:blur(18px) saturate(125%);-webkit-backdrop-filter:blur(18px) saturate(125%);
}
html[data-dokohilf-ui="v29"] .brand{gap:12px!important;min-width:0!important}
html[data-dokohilf-ui="v29"] .brand img{
  width:48px!important;height:48px!important;padding:3px!important;border-radius:16px!important;
  border:1px solid rgba(66,234,167,.20)!important;background:linear-gradient(145deg,rgba(7,38,43,.98),rgba(2,16,26,.98))!important;
  box-shadow:0 10px 30px rgba(0,0,0,.28),0 0 24px rgba(40,222,147,.08)!important;
}
html[data-dokohilf-ui="v29"] .brand span{min-width:0!important}
html[data-dokohilf-ui="v29"] .brand strong{font-size:22px!important;line-height:1.05!important;letter-spacing:-.045em!important}
html[data-dokohilf-ui="v29"] .brand small{display:block!important;margin-top:3px!important;color:#8aa59f!important;font-size:11.5px!important;line-height:1.2!important;letter-spacing:.005em!important;white-space:nowrap!important}
html[data-dokohilf-ui="v29"] .top-actions{gap:7px!important}
html[data-dokohilf-ui="v29"] .build-pill{
  min-width:82px!important;height:44px!important;min-height:44px!important;padding:0 13px!important;border-radius:15px!important;
  background:linear-gradient(145deg,rgba(42,205,134,.18),rgba(14,96,70,.19))!important;border-color:rgba(72,236,164,.34)!important;
  color:#61efa9!important;font-size:13px!important;font-weight:850!important;box-shadow:inset 0 1px rgba(255,255,255,.05),0 10px 28px rgba(9,118,78,.11)!important;
}
html[data-dokohilf-ui="v29"] .home-button{width:44px!important;min-width:44px!important;height:44px!important;min-height:44px!important;padding:0!important;border-radius:15px!important}
html[data-dokohilf-ui="v29"] .home-button span{display:none!important}
html[data-dokohilf-ui="v29"] .home-button svg{width:22px!important;height:22px!important}
html[data-dokohilf-ui="v29"] .new-button{min-width:68px!important;height:44px!important;min-height:44px!important;padding:0 13px!important;border-radius:15px!important;font-size:14px!important}

html[data-dokohilf-ui="v29"] .main-content{padding-top:38px!important}
html[data-dokohilf-ui="v29"] .start-screen{width:min(820px,100%)!important;margin:0 auto!important}
html[data-dokohilf-ui="v29"] .start-copy{margin-bottom:24px!important;text-align:center!important}
html[data-dokohilf-ui="v29"] .start-copy:before{
  min-height:32px!important;padding:0 14px!important;margin-bottom:18px!important;border-color:rgba(59,230,158,.25)!important;
  background:linear-gradient(145deg,rgba(20,92,69,.14),rgba(8,35,38,.32))!important;color:#53e8a2!important;
  font-size:10px!important;font-weight:900!important;letter-spacing:.16em!important;box-shadow:inset 0 1px rgba(255,255,255,.025)!important;
}
html[data-dokohilf-ui="v29"] .start-copy h1{
  max-width:690px!important;margin:0 auto!important;font-size:clamp(46px,7vw,64px)!important;line-height:.99!important;
  letter-spacing:-.065em!important;text-wrap:balance!important;text-shadow:0 8px 38px rgba(0,0,0,.34)!important;
}
html[data-dokohilf-ui="v29"] .start-copy h1 [data-v29-home-accent]{color:#42e99b!important;text-shadow:0 0 30px rgba(50,229,151,.10)!important}
html[data-dokohilf-ui="v29"] .start-copy p{max-width:590px!important;margin:16px auto 0!important;color:#91aaa5!important;font-size:16px!important;line-height:1.45!important}
html[data-dokohilf-ui="v29"] .start-copy:after{
  content:'';display:block;width:min(350px,78%);height:34px;margin:14px auto 0;
  background:repeating-linear-gradient(90deg,rgba(61,234,154,.86) 0 2px,transparent 2px 7px);
  clip-path:polygon(0 48%,8% 46%,16% 42%,24% 35%,32% 26%,40% 12%,48% 3%,56% 17%,64% 29%,72% 37%,80% 43%,90% 47%,100% 49%,100% 51%,90% 53%,80% 57%,72% 63%,64% 71%,56% 83%,48% 97%,40% 88%,32% 74%,24% 65%,16% 58%,8% 54%,0 52%);
  opacity:.82;filter:drop-shadow(0 0 8px rgba(42,225,145,.18));
}

html[data-dokohilf-ui="v29"] .mode-grid{display:grid!important;grid-template-columns:1fr!important;gap:14px!important;margin-top:0!important}
html[data-dokohilf-ui="v29"] .mode-card{
  display:grid!important;grid-template-columns:96px minmax(0,1fr) 48px!important;align-items:center!important;column-gap:20px!important;
  min-height:144px!important;padding:19px 22px!important;border-radius:30px!important;overflow:hidden!important;text-align:left!important;
  transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease!important;
}
html[data-dokohilf-ui="v29"] .mode-card.voice-card{
  border:1px solid rgba(57,235,159,.47)!important;
  background:radial-gradient(circle at 9% 44%,rgba(25,198,122,.22),transparent 25%),linear-gradient(115deg,rgba(6,76,58,.82),rgba(4,48,45,.91) 52%,rgba(3,28,34,.97))!important;
  box-shadow:0 20px 58px rgba(0,0,0,.33),inset 0 1px rgba(133,255,206,.08),0 0 40px rgba(35,216,140,.045)!important;
}
html[data-dokohilf-ui="v29"] .mode-card.chat-card{
  border:1px solid rgba(61,151,255,.42)!important;
  background:radial-gradient(circle at 9% 44%,rgba(36,122,239,.20),transparent 25%),linear-gradient(115deg,rgba(7,48,84,.91),rgba(5,35,63,.94) 54%,rgba(3,23,37,.98))!important;
  box-shadow:0 20px 58px rgba(0,0,0,.33),inset 0 1px rgba(142,195,255,.065),0 0 40px rgba(47,132,244,.045)!important;
}
html[data-dokohilf-ui="v29"] .mode-card:before{width:280px!important;height:280px!important;right:-110px!important;top:-105px!important;opacity:.74!important}
html[data-dokohilf-ui="v29"] .mode-icon{
  width:82px!important;height:82px!important;margin:0!important;border-radius:50%!important;display:grid!important;place-items:center!important;
  box-shadow:0 16px 42px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.07)!important;
}
html[data-dokohilf-ui="v29"] .voice-card .mode-icon{background:linear-gradient(145deg,rgba(33,207,130,.24),rgba(9,83,62,.42))!important;border:1px solid rgba(65,235,159,.42)!important}
html[data-dokohilf-ui="v29"] .chat-card .mode-icon{background:linear-gradient(145deg,rgba(44,136,246,.24),rgba(13,62,112,.45))!important;border:1px solid rgba(76,159,255,.39)!important}
html[data-dokohilf-ui="v29"] .mode-icon svg{width:43px!important;height:43px!important;stroke-width:2.1!important}
html[data-dokohilf-ui="v29"] .mode-text{min-width:0!important;align-self:center!important}
html[data-dokohilf-ui="v29"] .mode-text strong{display:block!important;font-size:27px!important;line-height:1.06!important;letter-spacing:-.045em!important;color:#f8fffc!important}
html[data-dokohilf-ui="v29"] .mode-text small{display:block!important;margin-top:8px!important;max-width:430px!important;color:#9ab2ad!important;font-size:15.5px!important;line-height:1.42!important}
html[data-dokohilf-ui="v29"] .mode-arrow{
  width:46px!important;height:46px!important;border-radius:50%!important;font-size:35px!important;line-height:1!important;
  border:1px solid rgba(255,255,255,.11)!important;background:rgba(255,255,255,.035)!important;box-shadow:inset 0 1px rgba(255,255,255,.035)!important;
}
html[data-dokohilf-ui="v29"] .voice-card .mode-arrow{color:#5bf0a8!important;border-color:rgba(74,232,163,.25)!important;background:rgba(27,153,104,.10)!important}
html[data-dokohilf-ui="v29"] .chat-card .mode-arrow{color:#55a8ff!important;border-color:rgba(77,157,247,.25)!important;background:rgba(38,107,184,.10)!important}
html[data-dokohilf-ui="v29"] .mode-card:active{transform:scale(.992)!important}

html[data-dokohilf-ui="v29"] .examples{
  display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;margin-top:18px!important;padding:17px!important;
  border:1px solid rgba(116,200,179,.13)!important;border-radius:27px!important;
  background:linear-gradient(145deg,rgba(5,23,29,.74),rgba(2,14,21,.82))!important;box-shadow:0 20px 55px rgba(0,0,0,.18),inset 0 1px rgba(255,255,255,.022)!important;
}
html[data-dokohilf-ui="v29"] .examples>span{
  grid-column:1/-1!important;margin:0 2px 4px!important;color:#819c95!important;font-size:10.5px!important;font-weight:900!important;letter-spacing:.13em!important;text-transform:uppercase!important;
}
html[data-dokohilf-ui="v29"] .examples button{
  position:relative!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;
  min-width:0!important;min-height:86px!important;padding:12px 12px 12px 68px!important;border:1px solid rgba(125,211,186,.13)!important;border-radius:18px!important;
  background:linear-gradient(145deg,rgba(8,31,38,.96),rgba(5,22,30,.96))!important;color:#f5fbf9!important;
  font-size:15.5px!important;font-weight:820!important;line-height:1.16!important;text-align:left!important;letter-spacing:-.015em!important;
  box-shadow:inset 0 1px rgba(255,255,255,.025),0 10px 25px rgba(0,0,0,.13)!important;
}
html[data-dokohilf-ui="v29"] .examples button:before{
  content:attr(data-home-symbol);position:absolute;left:13px;top:50%;transform:translateY(-50%);width:42px;height:42px;display:grid;place-items:center;
  border:1px solid rgba(62,230,156,.26);border-radius:50%;background:linear-gradient(145deg,rgba(32,181,119,.26),rgba(8,78,58,.34));
  color:#55eda5;font-size:20px;font-weight:800;line-height:1;box-shadow:inset 0 1px rgba(255,255,255,.055),0 8px 22px rgba(0,0,0,.18);
}
html[data-dokohilf-ui="v29"] .examples button:after{content:'Anleitung ›';display:block;margin-top:7px;color:#7f9d95;font-size:11.5px;font-weight:720;line-height:1;letter-spacing:0}
html[data-dokohilf-ui="v29"] .examples button:hover{border-color:rgba(70,231,160,.28)!important;background:linear-gradient(145deg,rgba(10,39,44,.98),rgba(6,26,33,.98))!important}
html[data-dokohilf-ui="v29"] #startScreen .safety-note{display:none!important}
html[data-dokohilf-ui="v29"] .legal-note{max-width:680px!important;margin:17px auto 0!important;padding:0 18px calc(13px + env(safe-area-inset-bottom))!important;color:#607b75!important;font-size:11.5px!important;line-height:1.5!important;text-align:center!important}
html[data-dokohilf-ui="v29"] .app-shell[data-mode="start"] .composer-wrap{display:none!important}

html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .topbar{min-height:66px!important}
html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .brand img{width:42px!important;height:42px!important;border-radius:14px!important}
html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .brand strong{font-size:19px!important}
html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .brand small{display:none!important}
html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .main-content{padding-top:18px!important}
html[data-dokohilf-ui="v29"] .workspace{width:min(760px,100%)!important;margin:0 auto!important}
html[data-dokohilf-ui="v29"] .mode-switch{
  position:relative!important;top:auto!important;z-index:10!important;width:min(390px,100%)!important;min-height:48px!important;margin:0 auto 15px!important;padding:4px!important;
  border:1px solid rgba(112,198,176,.12)!important;border-radius:17px!important;background:rgba(4,22,29,.86)!important;box-shadow:0 12px 30px rgba(0,0,0,.17)!important;
}
html[data-dokohilf-ui="v29"] .mode-switch button{min-height:40px!important;border-radius:13px!important;font-size:13px!important}
html[data-dokohilf-ui="v29"] .chat-head{margin-bottom:14px!important;padding:18px 19px!important;border-radius:23px!important;background:linear-gradient(145deg,rgba(7,28,35,.88),rgba(4,18,26,.78))!important}
html[data-dokohilf-ui="v29"] .chat-head h1{font-size:clamp(30px,5vw,39px)!important;line-height:1.03!important;letter-spacing:-.052em!important}
html[data-dokohilf-ui="v29"] .chat-head p{margin-top:9px!important;font-size:14.5px!important;line-height:1.43!important}
html[data-dokohilf-ui="v29"] .quick-prompts{margin-top:13px!important;gap:7px!important}
html[data-dokohilf-ui="v29"] .quick-prompts button{min-height:39px!important;padding:0 13px!important;border-radius:999px!important}
html[data-dokohilf-ui="v29"] .conversation{margin-top:0!important}
html[data-dokohilf-ui="v29"] .command-row{gap:8px!important;margin-top:10px!important}
html[data-dokohilf-ui="v29"] .command-row button{min-height:46px!important;border-radius:15px!important;font-size:13px!important}
html[data-dokohilf-ui="v29"] .composer-wrap{border-top-color:rgba(78,230,160,.15)!important;background:linear-gradient(180deg,rgba(1,9,14,.80),rgba(2,15,20,.98))!important;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}

@media(max-width:700px){
  html[data-dokohilf-ui="v29"] .topbar{width:calc(100% - 16px)!important;margin-top:6px!important;min-height:68px!important;padding:8px 9px!important;border-radius:21px!important}
  html[data-dokohilf-ui="v29"] .main-content{padding:30px 12px 20px!important}
  html[data-dokohilf-ui="v29"] .start-copy{margin-bottom:20px!important}
  html[data-dokohilf-ui="v29"] .start-copy:before{margin-bottom:14px!important}
  html[data-dokohilf-ui="v29"] .start-copy h1{font-size:clamp(42px,11vw,52px)!important}
  html[data-dokohilf-ui="v29"] .start-copy p{margin-top:13px!important;font-size:15px!important}
  html[data-dokohilf-ui="v29"] .start-copy:after{height:29px!important;margin-top:12px!important}
  html[data-dokohilf-ui="v29"] .mode-card{grid-template-columns:78px minmax(0,1fr) 42px!important;column-gap:15px!important;min-height:126px!important;padding:16px 17px!important;border-radius:27px!important}
  html[data-dokohilf-ui="v29"] .mode-icon{width:68px!important;height:68px!important}
  html[data-dokohilf-ui="v29"] .mode-icon svg{width:36px!important;height:36px!important}
  html[data-dokohilf-ui="v29"] .mode-text strong{font-size:23px!important}
  html[data-dokohilf-ui="v29"] .mode-text small{margin-top:6px!important;font-size:14px!important;line-height:1.38!important}
  html[data-dokohilf-ui="v29"] .mode-arrow{width:40px!important;height:40px!important;font-size:30px!important}
  html[data-dokohilf-ui="v29"] .examples{padding:12px!important;gap:9px!important;border-radius:23px!important}
  html[data-dokohilf-ui="v29"] .examples button{min-height:82px!important;padding:11px 10px 11px 60px!important;border-radius:17px!important;font-size:14.5px!important}
  html[data-dokohilf-ui="v29"] .examples button:before{left:11px;width:39px;height:39px;font-size:18px}
  html[data-dokohilf-ui="v29"] .examples button:after{margin-top:6px;font-size:11px}
}
@media(max-width:420px){
  html[data-dokohilf-ui="v29"] .brand{gap:9px!important}
  html[data-dokohilf-ui="v29"] .brand img{width:43px!important;height:43px!important;border-radius:14px!important}
  html[data-dokohilf-ui="v29"] .brand strong{font-size:19px!important}
  html[data-dokohilf-ui="v29"] .brand small{font-size:9.8px!important;max-width:190px!important;overflow:hidden!important;text-overflow:ellipsis!important}
  html[data-dokohilf-ui="v29"] .build-pill{min-width:72px!important;height:42px!important;min-height:42px!important;padding:0 9px!important;font-size:12px!important}
  html[data-dokohilf-ui="v29"] .home-button{width:42px!important;min-width:42px!important;height:42px!important;min-height:42px!important}
  html[data-dokohilf-ui="v29"] .new-button{min-width:58px!important;height:42px!important;min-height:42px!important;padding:0 10px!important;font-size:13px!important}
  html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .brand img{width:37px!important;height:37px!important}
  html[data-dokohilf-ui="v29"] .app-shell:not([data-mode="start"]) .brand strong{font-size:17px!important}
  html[data-dokohilf-ui="v29"] .start-copy h1{font-size:42px!important}
  html[data-dokohilf-ui="v29"] .start-copy p{font-size:14.5px!important}
  html[data-dokohilf-ui="v29"] .mode-card{grid-template-columns:70px minmax(0,1fr) 38px!important;column-gap:12px!important;min-height:120px!important;padding:14px!important}
  html[data-dokohilf-ui="v29"] .mode-icon{width:62px!important;height:62px!important}
  html[data-dokohilf-ui="v29"] .mode-icon svg{width:33px!important;height:33px!important}
  html[data-dokohilf-ui="v29"] .mode-text strong{font-size:21px!important}
  html[data-dokohilf-ui="v29"] .mode-text small{font-size:13.2px!important}
  html[data-dokohilf-ui="v29"] .mode-arrow{width:37px!important;height:37px!important;font-size:27px!important}
  html[data-dokohilf-ui="v29"] .examples{gap:8px!important;padding:10px!important}
  html[data-dokohilf-ui="v29"] .examples>span{font-size:9.4px!important;letter-spacing:.105em!important}
  html[data-dokohilf-ui="v29"] .examples button{min-height:80px!important;padding:10px 8px 10px 55px!important;font-size:13.7px!important}
  html[data-dokohilf-ui="v29"] .examples button:before{left:9px;width:36px;height:36px;font-size:16px}
  html[data-dokohilf-ui="v29"] .examples button:after{font-size:10.5px}
  html[data-dokohilf-ui="v29"] .chat-head{padding:16px!important}
  html[data-dokohilf-ui="v29"] .chat-head h1{font-size:31px!important}
}
`;

  function shell() { return document.getElementById('appShell'); }
  function messages() { return document.getElementById('messages'); }

  function currentGuide() {
    return window.DokoHilfGuideProgress?.getCurrentGuide?.() || null;
  }

  function ensurePremiumStyles() {
    if (document.getElementById('v29PremiumHomeStyles')) return;
    const style = document.createElement('style');
    style.id = 'v29PremiumHomeStyles';
    style.textContent = premiumCss;
    document.head.append(style);
  }

  function symbolForButton(button) {
    const value = `${button?.textContent || ''} ${button?.dataset?.prompt || ''}`.toLocaleLowerCase('de-DE');
    if (value.includes('bericht')) return '▤';
    if (value.includes('visite')) return '▦';
    if (value.includes('vital')) return '♥';
    if (value.includes('an-/abwesen') || value.includes('abwesen')) return '●';
    if (value.includes('medikation')) return '✚';
    if (value.includes('formular')) return '≣';
    if (value.includes('übergabe')) return '↑';
    return '›';
  }

  function polishPremiumHome() {
    ensurePremiumStyles();
    const title = document.getElementById('startTitle');
    if (title && !title.querySelector('[data-v29-home-accent]')) {
      title.innerHTML = 'Was möchtest du <span data-v29-home-accent>erledigen?</span>';
    }
    const brandSmall = document.querySelector('.brand small');
    if (brandSmall && brandSmall.textContent !== 'Dein KI-Assistent für Dokumentation') {
      brandSmall.textContent = 'Dein KI-Assistent für Dokumentation';
    }
    const examples = document.querySelector('.examples');
    const examplesLabel = examples?.querySelector(':scope > span');
    if (examplesLabel && examplesLabel.textContent !== 'Häufige Abläufe · direkt öffnen') {
      examplesLabel.textContent = 'Häufige Abläufe · direkt öffnen';
    }
    for (const button of examples?.querySelectorAll('button') || []) {
      button.dataset.homeSymbol = symbolForButton(button);
    }
    document.documentElement.dataset.dokohilfHome = 'premium-v29-1';
  }

  function ensureHistoryToggle() {
    const conversation = document.querySelector('.conversation');
    const list = messages();
    if (!conversation || !list) return null;
    let button = document.getElementById('v29HistoryToggle');
    if (button) return button;
    button = document.createElement('button');
    button.id = 'v29HistoryToggle';
    button.className = 'v29-history-toggle';
    button.type = 'button';
    button.hidden = true;
    button.addEventListener('click', () => {
      historyExpanded = !historyExpanded;
      syncHistory();
    });
    list.before(button);
    return button;
  }

  function syncHistory() {
    const list = messages();
    const button = ensureHistoryToggle();
    const active = Boolean(currentGuide());
    shell()?.toggleAttribute('data-v29-guide-active', active);
    if (!list || !button) return;

    const nodes = [...list.querySelectorAll(':scope > .message')];
    nodes.forEach(node => node.classList.remove('v29-history-collapsed', 'v29-current-answer', 'v29-past-answer'));

    const assistants = nodes.filter(node => node.classList.contains('assistant') && !node.classList.contains('typing'));
    assistants.forEach((node, index) => node.classList.add(index === assistants.length - 1 ? 'v29-current-answer' : 'v29-past-answer'));

    if (!active || nodes.length <= 5) {
      button.hidden = true;
      return;
    }

    const keep = 4;
    const collapsible = nodes.slice(0, Math.max(0, nodes.length - keep));
    if (!historyExpanded) collapsible.forEach(node => node.classList.add('v29-history-collapsed'));
    button.hidden = collapsible.length === 0;
    button.textContent = historyExpanded
      ? 'Frühere Nachrichten ausblenden'
      : `Frühere Nachrichten anzeigen · ${collapsible.length}`;
  }

  function polishStaticCopy() {
    const heading = document.querySelector('.chat-head h1');
    const copy = document.querySelector('.chat-head p');
    if (heading) heading.textContent = 'Was möchtest du erledigen?';
    if (copy) copy.textContent = 'Schreib es so, wie du es sagen würdest. DokoHilf führt dich Schritt für Schritt.';
    const input = document.getElementById('chatInput');
    if (input) input.placeholder = 'Frag einfach …';
  }

  function syncGuideState(event) {
    const active = Boolean(event?.detail || currentGuide());
    const app = shell();
    if (app) app.dataset.v29GuideActive = active ? 'true' : 'false';
    historyExpanded = false;
    syncHistory();
  }

  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      polishStaticCopy();
      polishPremiumHome();
      syncHistory();
    });
  }

  function initialize() {
    document.documentElement.dataset.dokohilfUi = 'v29';
    document.documentElement.dataset.dokohilfPremiumHomeRevision = PREMIUM_HOME_REVISION;
    ensurePremiumStyles();
    polishStaticCopy();
    polishPremiumHome();
    ensureHistoryToggle();
    syncGuideState();
    window.addEventListener('dokohilf:guide-state', syncGuideState);
    window.addEventListener('pageshow', scheduleSync);
    const target = shell() || document.body;
    new MutationObserver(scheduleSync).observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'data-mode'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();

  window.DokoHilfUiV29 = { syncHistory, polishStaticCopy, polishPremiumHome };
  window.__DOKOHILF_UI_V29__ = true;
})();