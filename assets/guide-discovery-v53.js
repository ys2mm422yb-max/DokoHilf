(() => {
  'use strict';

  if (window.__DOKOHILF_GUIDE_DISCOVERY_V53__) return;
  window.__DOKOHILF_GUIDE_DISCOVERY_V53__ = true;

  const REVISION = '20260902-confirmed-term-input-v61-1';
  const AI_MARKERS = Object.freeze([
    '/functions/v1/dokohilf-ai',
    '/functions/v1/dokohilf-ai-router',
    '/functions/v1/dokohilf-chat-router',
    '/functions/v1/dokohilf-conversation-router',
  ]);
  const GUIDED_SLUGS = new Set([
    'bericht-neu',
    'bericht-durchstreichen',
    'bericht-folgebericht',
    'visite-anlegen',
    'visiten-oeffnen',
    'visite-status-durchgefuehrt',
    'vitalwerte-einzelwert',
    'vitalwerte-sammelerfassung',
    'anwesenheit',
    'medikation-ansehen',
    'formulare-anlegen',
    'uebergabeformular',
    'notfallblatt',
    'durchfuehrung-storno',
    'durchfuehrungsnachweis-oeffnen',
    'stammdaten',
    'bedarfsmedikation-gabe',
    'bedarfsmedikation-wirksamkeitskontrolle',
    'massnahmen-ohne-zeitangabe',
    'dateiablage',
  ]);
  const TITLE_TO_SLUG = Object.freeze({
    'Bericht anlegen': 'bericht-neu',
    'Bericht korrigieren': 'bericht-durchstreichen',
    'Folgebericht erstellen': 'bericht-folgebericht',
    'Visite anlegen': 'visite-anlegen',
    'Visiten öffnen': 'visiten-oeffnen',
    'Visitenstatus richtig setzen': 'visite-status-durchgefuehrt',
    'Einzelnen Vitalwert erfassen': 'vitalwerte-einzelwert',
    'Mehrere Vitalwerte erfassen': 'vitalwerte-sammelerfassung',
    'An-/Abwesenheit': 'anwesenheit',
    'Medikation ansehen': 'medikation-ansehen',
    'Formular anlegen': 'formulare-anlegen',
    'Übergabe anzeigen': 'uebergabeformular',
    'Notfallblatt öffnen': 'notfallblatt',
    'Durchführung stornieren': 'durchfuehrung-storno',
    'Durchführungsnachweis': 'durchfuehrungsnachweis-oeffnen',
    'Stammdaten öffnen': 'stammdaten',
    'Bedarfsmedikation dokumentieren': 'bedarfsmedikation-gabe',
    'Wirksamkeitskontrolle dokumentieren': 'bedarfsmedikation-wirksamkeitskontrolle',
    'Maßnahmen ohne Zeitangabe': 'massnahmen-ohne-zeitangabe',
    'Dateiablage öffnen': 'dateiablage',
  });
  const SEARCH_STOPWORDS = new Set([
    'ich', 'du', 'wir', 'wie', 'wo', 'was', 'ist', 'sind', 'bin', 'muss', 'mochte', 'moechte', 'will', 'kann', 'bitte',
    'eine', 'einen', 'einem', 'einer', 'der', 'die', 'das', 'den', 'dem', 'des', 'zu', 'zur', 'zum', 'im', 'in', 'am', 'an',
    'auf', 'fur', 'fuer', 'mir', 'mich', 'noch', 'mal', 'machen', 'finde', 'finden', 'offnen', 'oeffnen', 'zeigen',
  ]);

  let pendingGuideSlug = '';
  let scheduled = false;

  function normalize(value) {
    return String(value || '')
      .toLocaleLowerCase('de-DE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9\s/-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function compactNormalize(value) {
    return normalize(value).replace(/[\s/-]+/g, '');
  }

  function hasCompactTerm(value, ...terms) {
    const compact = compactNormalize(value);
    return terms.some(term => {
      const wanted = compactNormalize(term);
      return wanted && compact.includes(wanted);
    });
  }

  function isFalseSignOff(value) {
    const text = normalize(value);
    return /\b(falsch|versehentlich|irrtumlich)\b/.test(text)
      && hasCompactTerm(text, 'abgezeichnet');
  }

  function hasSignOffIntent(value) {
    const text = normalize(value);
    if (!text || isFalseSignOff(text)) return false;
    return hasCompactTerm(text, 'abzeichnen', 'abzuzeichnen')
      || /\b(zeichne|zeichnest|zeichnet|zeichn)\b.*\bab\b/.test(text)
      || (hasCompactTerm(text, 'abgezeichnet') && /\b(werden|mussen|sollen)\b/.test(text));
  }

  function smartTargets(value) {
    const text = normalize(value);
    if (!text) return [];

    if (isFalseSignOff(text)) return ['durchfuehrung-storno'];
    if (hasSignOffIntent(text)) return ['durchfuehrungsnachweis-oeffnen'];

    if (/\b(verschrieben|bericht korrigieren|falscher bericht|falschen bericht)\b/.test(text)
      || hasCompactTerm(text, 'Bericht durchstreichen')) {
      return ['bericht-durchstreichen'];
    }
    if (hasCompactTerm(text, 'Arztbrief', 'Entlassungsbrief', 'Laborwerte', 'Betreuerausweis', 'Dateiablage')) return ['dateiablage'];
    if (/\b(puls|temperatur|sauerstoff|spo2)\b/.test(text)
      || hasCompactTerm(text, 'Blutdruck', 'Blutzucker', 'Sauerstoffsättigung', 'Sauerstoffsaettigung', 'Atemfrequenz', 'Atemalkohol')) {
      return ['vitalwerte'];
    }
    if (hasCompactTerm(text, 'Notfallbogen')) return ['notfallblatt'];
    if (/\b(was war los)\b/.test(text)) return ['uebergabeformular'];
    return [];
  }

  function cardSlug(card) {
    if (!card) return '';
    if (card.dataset?.v46FileStorage === 'true') return 'dateiablage';
    return String(
      card.dataset?.v29OpenGuide
      || card.dataset?.v29OpenDurchfuehrungGuide
      || '',
    ).trim();
  }

  function searchTokens(value) {
    return normalize(value)
      .split(' ')
      .filter(Boolean)
      .filter(token => !SEARCH_STOPWORDS.has(token));
  }

  function cardMatches(card, rawQuery, targets = smartTargets(rawQuery)) {
    const query = normalize(rawQuery);
    if (!query) return true;
    const slug = cardSlug(card);
    if (targets.length) return targets.includes(slug);
    const haystack = normalize(`${card.textContent || ''} ${slug}`);
    const tokens = searchTokens(query);
    if (!tokens.length) return haystack.includes(query);
    return tokens.every(token => haystack.includes(token));
  }

  function syncSectionVisibility(grid) {
    let section = null;
    let sectionHasMatch = false;
    const finish = () => {
      if (section) section.classList.toggle('v42-search-hidden', !sectionHasMatch);
    };
    for (const child of [...grid.children]) {
      if (child.classList.contains('v35-library-section')) {
        finish();
        section = child;
        sectionHasMatch = false;
      } else if (child.classList.contains('v29-library-card') && !child.classList.contains('v42-search-hidden')) {
        sectionHasMatch = true;
      }
    }
    finish();
  }

  function ensureEmptyState(view, grid) {
    let empty = view.querySelector('.v53-library-search-empty');
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'v53-library-search-empty';
      empty.hidden = true;
      empty.setAttribute('role', 'status');
      empty.textContent = 'Keine passende Anleitung gefunden. Du kannst DokoHilf auch im Chat fragen.';
      grid.before(empty);
    }
    return empty;
  }

  function filterLibrarySmart(grid, rawQuery) {
    if (!grid) return;
    const view = grid.closest('#directGuideView') || document.getElementById('directGuideView');
    const targets = smartTargets(rawQuery);
    const cards = [...grid.querySelectorAll('.v29-library-card')];
    let matches = 0;
    for (const card of cards) {
      const visible = cardMatches(card, rawQuery, targets);
      card.classList.toggle('v42-search-hidden', !visible);
      if (visible) matches += 1;
    }
    syncSectionVisibility(grid);
    if (view) ensureEmptyState(view, grid).hidden = !normalize(rawQuery) || matches > 0;
    if (view) view.dataset.v53SearchMode = targets.length ? 'intent' : 'text';
  }

  function installSmartSearch() {
    const view = document.getElementById('directGuideView');
    const grid = view?.querySelector('.v29-library-grid');
    const input = view?.querySelector('.v42-library-search input[type="search"]');
    if (!view || !grid || !input) return;
    if (input.dataset.v53SmartSearch !== 'true') {
      input.dataset.v53SmartSearch = 'true';
      input.addEventListener('input', () => filterLibrarySmart(grid, input.value));
    }
    filterLibrarySmart(grid, input.value);
  }

  function currentGuideSlug() {
    const stateSlug = String(window.DokoHilfGuideLibraryV29?.getState?.()?.current || '');
    if (GUIDED_SLUGS.has(stateSlug)) return stateSlug;
    const title = document.querySelector('#directGuideView .direct-guide-heading h1')?.textContent?.trim() || '';
    const mapped = TITLE_TO_SLUG[title] || '';
    return GUIDED_SLUGS.has(mapped) ? mapped : '';
  }

  function ensureStyles() {
    if (document.getElementById('guideDiscoveryV53Styles')) return;
    const style = document.createElement('style');
    style.id = 'guideDiscoveryV53Styles';
    style.textContent = `
      .v53-guided-start{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;margin:0 0 14px;padding:14px 15px;border:1px solid rgba(76,225,178,.22);border-radius:18px;background:linear-gradient(145deg,rgba(10,58,49,.78),rgba(6,37,34,.9));box-shadow:0 12px 30px rgba(0,0,0,.12)}
      .v53-guided-start-copy{min-width:0;display:grid;gap:3px}.v53-guided-start-copy strong{color:#eafff7;font-size:14px;line-height:1.25}.v53-guided-start-copy span{color:#9bc8b9;font-size:11.5px;line-height:1.35}
      .v53-guided-start button{min-height:44px;padding:0 14px;border:1px solid rgba(126,244,203,.32);border-radius:13px;background:#0d7b5f;color:#fff;font:850 12px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 8px 22px rgba(5,66,51,.26);white-space:nowrap}
      .v53-guided-start button:active{transform:scale(.98)}.v53-guided-start button:focus-visible{outline:3px solid rgba(107,231,190,.28);outline-offset:2px}
      .v53-library-search-empty{margin:0 0 12px;padding:13px 14px;border:1px dashed rgba(130,170,159,.25);border-radius:15px;background:rgba(255,255,255,.025);color:#91aaa3;font-size:12px;line-height:1.45;text-align:center}
      .v53-library-search-empty[hidden]{display:none!important}
      @media(max-width:620px){.v53-guided-start{grid-template-columns:1fr;gap:10px;padding:13px}.v53-guided-start button{width:100%}}
    `;
    document.head.append(style);
  }

  function decorateGuidedStart() {
    const view = document.getElementById('directGuideView');
    const steps = view?.querySelector('ol.direct-guide-steps');
    const head = view?.querySelector('.direct-guide-head');
    if (!view || view.hidden || !steps || !head) return;
    const slug = currentGuideSlug();
    if (!slug) return;
    const title = view.querySelector('.direct-guide-heading h1')?.textContent?.trim() || slug;
    let panel = view.querySelector('.v53-guided-start');
    if (panel?.dataset.guideSlug === slug) return;
    panel?.remove();
    panel = document.createElement('div');
    panel.className = 'v53-guided-start';
    panel.dataset.guideSlug = slug;
    panel.innerHTML = `<div class="v53-guided-start-copy"><strong>Lieber Schritt für Schritt?</strong><span>DokoHilf startet diese Anleitung im Chat und führt dich einzeln durch die Schritte.</span></div><button type="button" data-v53-start-guide="${slug}">Schritt für Schritt starten</button>`;
    head.insertAdjacentElement('afterend', panel);
    panel.querySelector('button')?.setAttribute('data-v53-guide-label', title);
  }

  function isAiPost(input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url || '';
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return method === 'POST' && AI_MARKERS.some(marker => String(url).includes(marker));
  }

  function injectSelectedGuide(body, slug = pendingGuideSlug) {
    if (!slug || typeof body !== 'string' || !body) return body;
    try {
      const parsed = JSON.parse(body);
      return JSON.stringify({ ...parsed, selectedGuideSlug: slug, libraryGuidedStart: true });
    } catch {
      return body;
    }
  }

  function installFetchBridge() {
    if (window.__DOKOHILF_GUIDE_DISCOVERY_FETCH_V53__) return;
    const previousFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
      if (!pendingGuideSlug || !isAiPost(input, init)) return previousFetch(input, init);
      const slug = pendingGuideSlug;
      pendingGuideSlug = '';
      return previousFetch(input, { ...init, body: injectSelectedGuide(init.body, slug) });
    };
    window.__DOKOHILF_GUIDE_DISCOVERY_FETCH_V53__ = true;
  }

  function startGuidedGuide(slug, label) {
    if (!GUIDED_SLUGS.has(slug) || !window.DokoHilf?.sendMessage || !window.DokoHilf?.setMode) return false;
    pendingGuideSlug = slug;
    window.DokoHilfGuideProgress?.clearGuide?.();
    const view = document.getElementById('directGuideView');
    if (view) view.hidden = true;
    const shell = document.getElementById('appShell');
    if (shell) delete shell.dataset.v29GuideLibrary;
    const legal = document.querySelector('.legal-note');
    if (legal) legal.hidden = false;
    window.DokoHilf.setMode('chat', { greet: false });
    window.DokoHilf.sendMessage(String(label || TITLE_TO_SLUG[slug] || slug));
    return true;
  }

  function installClicks() {
    if (window.__DOKOHILF_GUIDE_DISCOVERY_CLICKS_V53__) return;
    document.addEventListener('click', event => {
      const button = event.target.closest?.('[data-v53-start-guide]');
      if (!button) return;
      event.preventDefault();
      const slug = String(button.dataset.v53StartGuide || '');
      const label = String(button.dataset.v53GuideLabel || button.closest('#directGuideView')?.querySelector('.direct-guide-heading h1')?.textContent || slug).trim();
      startGuidedGuide(slug, label);
    });
    window.__DOKOHILF_GUIDE_DISCOVERY_CLICKS_V53__ = true;
  }

  function sync() {
    scheduled = false;
    ensureStyles();
    installSmartSearch();
    decorateGuidedStart();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  function initialize() {
    installFetchBridge();
    installClicks();
    sync();
    const target = document.getElementById('appShell') || document.body;
    new MutationObserver(schedule).observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'data-mode'] });
    window.addEventListener('pageshow', schedule);
  }

  window.DokoHilfGuideDiscoveryV53 = Object.freeze({
    revision: REVISION,
    normalize,
    compactNormalize,
    hasCompactTerm,
    isFalseSignOff,
    hasSignOffIntent,
    smartTargets,
    searchTokens,
    cardMatches,
    filterLibrarySmart,
    currentGuideSlug,
    injectSelectedGuide,
    startGuidedGuide,
    guidedSlugs: () => [...GUIDED_SLUGS],
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
