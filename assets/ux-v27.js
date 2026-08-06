(() => {
  'use strict';
  const TTS_MARKER = '/functions/v1/dokohilf-tts';
  const HARD_FALLBACK_MS = 1900;
  const PRIVACY_ACK_KEY = 'dokohilf-privacy-ack-v1';
  const previousFetch = window.fetch.bind(window);
  const commands = new Set(['weiter', 'nochmal', 'zurück', 'zuruck', 'ich finde das nicht', 'ich brauche hilfe']);
  let syncScheduled = false;
  let observer = null;

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalize(value) {
    return clean(value).toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
  }

  function setTextIfChanged(node, value) {
    if (!node || node.textContent === value) return false;
    node.textContent = value;
    return true;
  }

  function stripReminder(value) {
    return String(value || '')
      .replace(/\s*(?:In Übungen|Bei Übungen)\s+(?:bitte\s+)?(?:ausschließlich|nur)\s+Fantasiedaten\s+verwenden\.?/gi, '')
      .replace(/\s*(?:In Übungen|Bei Übungen)\s+(?:bitte\s+)?(?:ausschließlich|nur)\s+Fantasiewerte\s+verwenden\.?/gi, '')
      .replace(/\s*Verwende\s+in\s+Übungen\s+(?:ausschließlich|nur)\s+Fantasiedaten\.?/gi, '')
      .replace(/\s*Im öffentlichen Test\s+(?:bitte\s+)?(?:ausschließlich|nur)\s+(?:vollständig erfundene Personen|Fantasiedaten)\s+verwenden\.?/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function hasPrivacyAcknowledgement() {
    try { return window.localStorage.getItem(PRIVACY_ACK_KEY) === 'yes'; }
    catch { return false; }
  }

  function rememberPrivacyAcknowledgement() {
    try { window.localStorage.setItem(PRIVACY_ACK_KEY, 'yes'); }
    catch { /* In eingeschränkten Browsermodi gilt die Bestätigung nur für die aktuelle Ansicht. */ }
  }

  function showPrivacyAcknowledgement() {
    if (hasPrivacyAcknowledgement() || document.getElementById('privacyAckV27')) return;
    const dialog = document.createElement('section');
    dialog.id = 'privacyAckV27';
    dialog.className = 'privacy-ack-v27';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'privacyAckV27Title');
    dialog.innerHTML = `
      <div class="privacy-ack-v27-card">
        <div class="privacy-ack-v27-icon" aria-hidden="true">✓</div>
        <h2 id="privacyAckV27Title">Kurz zum Datenschutz</h2>
        <p>DokoHilf ist nur für allgemeine Bedienfragen. <strong>Gib keine Namen, Berichte, Diagnosen, Medikamente, Vitalwerte oder andere persönliche Angaben ein.</strong></p>
        <button type="button" data-privacy-ack>Verstanden</button>
      </div>
    `;
    document.body.append(dialog);
    const button = dialog.querySelector('[data-privacy-ack]');
    button?.addEventListener('click', () => {
      rememberPrivacyAcknowledgement();
      dialog.remove();
      document.querySelector('[data-select-mode="voice"], [data-select-mode="chat"]')?.focus();
    }, { once: true });
    requestAnimationFrame(() => button?.focus());
  }

  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const request = previousFetch(input, init);
    if (typeof url !== 'string' || !url.includes(TTS_MARKER) || method !== 'POST') return request;
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('dokohilf_immediate_voice_fallback')), HARD_FALLBACK_MS);
    });
    request.catch(() => {});
    return Promise.race([request, timeout]).finally(() => clearTimeout(timer));
  };

  function compactGuideMenu() {
    const bar = document.getElementById('guideProgress');
    const actions = bar?.querySelector('.guide-progress-actions');
    if (!bar || !actions || bar.querySelector('.guide-progress-menu')) return false;
    const details = document.createElement('details');
    details.className = 'guide-progress-menu';
    details.innerHTML = '<summary aria-label="Ablaufoptionen">•••</summary><div class="guide-progress-menu-panel"></div>';
    const panel = details.querySelector('.guide-progress-menu-panel');
    [...actions.querySelectorAll('button')].forEach(button => panel.append(button));
    actions.hidden = true;
    bar.append(details);
    return true;
  }

  function cleanConversation() {
    let changed = false;
    document.querySelectorAll('.message.assistant .bubble p,#voiceFocusText').forEach(node => {
      const current = node.textContent || '';
      const cleaned = stripReminder(current);
      if (cleaned && cleaned !== current) changed = setTextIfChanged(node, cleaned) || changed;
    });
    document.querySelectorAll('.message.user').forEach(node => {
      if (commands.has(normalize(node.textContent)) && !node.classList.contains('command-message-hidden')) {
        node.classList.add('command-message-hidden');
        changed = true;
      }
    });
    const help = document.querySelector('[data-command="ich finde das nicht"]');
    changed = setTextIfChanged(help, 'Ich brauche Hilfe') || changed;
    return changed;
  }

  function polishPrivacyCopy() {
    const note = document.querySelector('.composer-wrap > p');
    return setTextIfChanged(note, 'Gespräch und persönliche Audioinhalte werden nicht gespeichert. Der Schutzfilter prüft jede Eingabe.');
  }

  function polishVoice() {
    const shell = document.getElementById('appShell');
    const status = document.getElementById('voiceStatus');
    const hint = document.getElementById('voiceHint');
    const badge = document.querySelector('.voice-engine-badge');
    if (!shell || !status || !hint) return false;
    let changed = false;
    const current = normalize(status.textContent);
    if (shell.dataset.voiceState === 'thinking' || current.includes('stimme wird vorbereitet') || current.includes('stimme ladt')) {
      changed = setTextIfChanged(status, 'Stimme startet …') || changed;
      changed = setTextIfChanged(hint, 'Bekannte Schritte starten direkt. Freie Antworten wechseln nach kurzer Zeit zur Sofortstimme.') || changed;
    }
    if (badge && /geratestimme|ersatz/.test(normalize(badge.textContent))) {
      changed = setTextIfChanged(badge, 'Sofortstimme') || changed;
    }
    return changed;
  }

  function sync() {
    compactGuideMenu();
    cleanConversation();
    polishPrivacyCopy();
    polishVoice();
  }

  function scheduleSync() {
    if (syncScheduled) return;
    syncScheduled = true;
    requestAnimationFrame(() => {
      syncScheduled = false;
      sync();
    });
  }

  function initialize() {
    showPrivacyAcknowledgement();
    sync();
    if (observer) return;
    observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-voice-state'],
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
  window.DokoHilfUxV27 = {
    hardFallbackMs: HARD_FALLBACK_MS,
    privacyAckKey: PRIVACY_ACK_KEY,
    hasPrivacyAcknowledgement,
    showPrivacyAcknowledgement,
    stripReminder,
    setTextIfChanged,
    scheduleSync,
  };
  window.__DOKOHILF_UX_CLEANUP_V27__ = true;
  window.__DOKOHILF_PRIVACY_ACK_V27__ = true;
  window.__DOKOHILF_IDEMPOTENT_SYNC_V27__ = true;
})();
