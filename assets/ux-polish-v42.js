(() => {
  'use strict';

  if (window.__DOKOHILF_UX_POLISH_V42__) return;
  window.__DOKOHILF_UX_POLISH_V42__ = true;

  const REVISION = '20260812-voice-library-ux-v42-1';
  const SEARCH_PLACEHOLDER = 'Anleitung suchen …';
  const CHAT_PLACEHOLDER = 'Beschreibe kurz, wobei du Hilfe brauchst …';
  let scheduled = false;

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function normalize(value) {
    return String(value || '')
      .toLocaleLowerCase('de-DE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function currentGuide() {
    try { return window.DokoHilfGuideProgress?.getCurrentGuide?.() || null; } catch { return null; }
  }

  function isVoicePaused() {
    return /fortsetzen/i.test(document.getElementById('pauseVoiceButton')?.textContent || '');
  }

  function polishVoiceCopy() {
    const shell = document.getElementById('appShell');
    const status = document.getElementById('voiceStatus');
    const hint = document.getElementById('voiceHint');
    if (!shell || !status || !hint || shell.dataset.mode !== 'voice') return;

    const state = shell.dataset.voiceState || 'idle';
    if (state === 'error') return;

    if (state === 'listening') {
      setText(status, 'DokoHilf hört zu …');
      setText(hint, 'Sprich einfach los.');
      return;
    }
    if (state === 'thinking') {
      setText(status, 'DokoHilf denkt nach …');
      setText(hint, '');
      return;
    }
    if (state === 'speaking') {
      setText(status, 'DokoHilf spricht …');
      setText(hint, 'Danach höre ich automatisch wieder zu.');
      return;
    }
    if (isVoicePaused()) {
      setText(status, 'Gespräch pausiert');
      setText(hint, 'Tippe auf das Mikrofon zum Fortsetzen.');
      return;
    }
    setText(status, 'Bereit');
    setText(hint, 'Tippe auf das Mikrofon.');
  }

  function formatVoiceInstruction() {
    const text = document.getElementById('voiceFocusText');
    if (!text) return;
    const compact = String(text.textContent || '').replace(/\s+/g, ' ').trim();
    if (!compact) return;
    const match = compact.match(/^(.+[.!])\s+([^.!?]{3,150}\?)$/);
    const desired = match ? `${match[1]}\n${match[2]}` : compact;
    setText(text, desired);
  }

  function nextButtonLabel(instruction) {
    const text = normalize(instruction);
    if (!/\?$/.test(String(instruction || '').trim())) return 'Weiter';
    if (/geoffnet|offen/.test(text)) return 'Ja, ist offen';
    if (/sichtbar|siehst|sehen|gefunden|findest/.test(text)) return 'Ja, sehe ich';
    return 'Ja, weiter';
  }

  function polishVoiceActions() {
    const actions = document.getElementById('voiceFocusActions');
    if (!actions) return;

    const repeat = actions.querySelector('button[data-voice-command="nochmal"]');
    const stuck = actions.querySelector('button[data-voice-command="ich finde das nicht"]');
    const next = actions.querySelector('button[data-voice-command="weiter"]');
    const instruction = document.getElementById('voiceFocusText')?.textContent || '';

    if (repeat) {
      setText(repeat, 'Nochmal anhören');
      repeat.setAttribute('aria-label', 'Aktuellen Schritt nochmal anhören');
    }
    if (stuck && stuck.dataset.v42HelpCopy !== 'true') {
      stuck.innerHTML = '<span>Ich finde das nicht</span><small>Zeig mir genauer, wo das ist</small>';
      stuck.dataset.v42HelpCopy = 'true';
    }
    if (next) setText(next, nextButtonLabel(instruction));
  }

  function ensureVoiceProgress() {
    const holder = document.querySelector('#voiceFocusStage .voice-focus-progress');
    if (!holder) return null;
    let track = holder.querySelector('.v42-voice-progress');
    if (!track) {
      track = document.createElement('span');
      track.className = 'v42-voice-progress';
      track.setAttribute('aria-hidden', 'true');
      track.innerHTML = '<i></i>';
      holder.append(track);
    }
    return track;
  }

  function updateVoiceProgress() {
    const track = ensureVoiceProgress();
    if (!track) return;
    const guide = currentGuide();
    const step = Number(guide?.guideStep || 0);
    const count = Number(guide?.guideStepCount || 0);
    const active = Number.isFinite(step) && Number.isFinite(count) && step > 0 && count > 0;
    track.classList.toggle('v42-empty', !active);
    const progress = active ? Math.min(100, Math.max(0, (step / count) * 100)) : 0;
    track.style.setProperty('--v42-progress', `${progress}%`);
  }

  function ensureFrequentHint() {
    const examples = document.querySelector('.examples[data-v29-guide-library="true"]');
    if (!examples) return;
    let hint = examples.querySelector('.v42-frequent-hint');
    if (!hint) {
      hint = document.createElement('small');
      hint.className = 'v42-frequent-hint';
      const label = examples.querySelector(':scope > span');
      if (label) label.after(hint); else examples.prepend(hint);
    }
    setText(hint, 'Deine meistgenutzten Anleitungen');
  }

  function decorateLaterCards() {
    for (const card of document.querySelectorAll('#directGuideView .v29-library-card.is-later')) {
      const subtitle = card.querySelector('small');
      if (subtitle) setText(subtitle, 'Noch nicht verfügbar');
    }
  }

  function filterLibrary(grid, rawQuery) {
    if (!grid) return;
    const query = normalize(rawQuery);
    const cards = [...grid.querySelectorAll('.v29-library-card')];
    for (const card of cards) {
      const matches = !query || normalize(card.textContent).includes(query);
      card.classList.toggle('v42-search-hidden', !matches);
    }

    const children = [...grid.children];
    let section = null;
    let sectionHasMatch = false;
    const finishSection = () => {
      if (section) section.classList.toggle('v42-search-hidden', !sectionHasMatch);
    };
    for (const child of children) {
      if (child.classList.contains('v35-library-section')) {
        finishSection();
        section = child;
        sectionHasMatch = false;
      } else if (child.classList.contains('v29-library-card') && !child.classList.contains('v42-search-hidden')) {
        sectionHasMatch = true;
      }
    }
    finishSection();
  }

  function ensureLibrarySearch() {
    const view = document.getElementById('directGuideView');
    const head = view?.querySelector('.v29-library-head');
    const grid = view?.querySelector('.v29-library-grid');
    if (!view || !head || !grid) return;

    let wrap = view.querySelector('.v42-library-search');
    if (!wrap) {
      wrap = document.createElement('label');
      wrap.className = 'v42-library-search';
      wrap.innerHTML = '<span class="sr-only">Anleitungen durchsuchen</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><input type="search" autocomplete="off" autocapitalize="none" spellcheck="false">';
      grid.before(wrap);
      const input = wrap.querySelector('input');
      if (input) {
        input.placeholder = SEARCH_PLACEHOLDER;
        input.setAttribute('aria-label', 'Anleitung suchen');
        input.addEventListener('input', () => filterLibrary(grid, input.value));
      }
    }
    const input = wrap.querySelector('input');
    filterLibrary(grid, input?.value || '');
  }

  function polishChatPlaceholder() {
    const input = document.getElementById('chatInput');
    if (input && !/tastatur-mikrofon/i.test(input.placeholder || '')) input.placeholder = CHAT_PLACEHOLDER;
  }

  function sync() {
    scheduled = false;
    polishVoiceCopy();
    formatVoiceInstruction();
    polishVoiceActions();
    updateVoiceProgress();
    ensureFrequentHint();
    decorateLaterCards();
    ensureLibrarySearch();
    polishChatPlaceholder();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  function init() {
    sync();
    const target = document.getElementById('appShell') || document.body;
    new MutationObserver(schedule).observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-mode', 'data-voice-state'],
    });
    window.addEventListener('dokohilf:guide-state', schedule);
    window.addEventListener('pageshow', schedule);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.DokoHilfUxPolishV42 = {
    sync,
    revision: REVISION,
    normalize,
    filterLibrary,
    nextButtonLabel,
  };
})();
