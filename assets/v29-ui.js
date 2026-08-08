(() => {
  'use strict';

  let historyExpanded = false;
  let scheduled = false;

  function shell() { return document.getElementById('appShell'); }
  function messages() { return document.getElementById('messages'); }

  function currentGuide() {
    return window.DokoHilfGuideProgress?.getCurrentGuide?.() || null;
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
      syncHistory();
    });
  }

  function initialize() {
    document.documentElement.dataset.dokohilfUi = 'v29';
    polishStaticCopy();
    ensureHistoryToggle();
    syncGuideState();
    window.addEventListener('dokohilf:guide-state', syncGuideState);
    const target = shell() || document.body;
    new MutationObserver(scheduleSync).observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'data-mode'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();

  window.DokoHilfUiV29 = { syncHistory, polishStaticCopy };
  window.__DOKOHILF_UI_V29__ = true;
})();
