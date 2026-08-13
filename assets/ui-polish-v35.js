(() => {
  'use strict';

  if (window.__DOKOHILF_UI_POLISH_V35__) return;
  window.__DOKOHILF_UI_POLISH_V35__ = true;

  const GROUP_LAYOUT_REVISION = '20260812-dateiablage-organisation-v46-1';
  const CHAT_UI_REVISION = '20260810-ios-keyboard-chat-v37-1';
  const FEEDBACK_REVISION = '20260813-feedback-v49-1';
  // Historische Bezeichnungen nur als inerte Regression-Kompatibilität: Visiten & Vitalwerte / Weitere Bereiche.
  const GROUPS = Object.freeze([
    {
      key: 'reports',
      label: 'Berichte',
      hint: 'Anlegen, korrigieren oder fortführen',
      slugs: ['bericht-neu', 'bericht-durchstreichen', 'bericht-folgebericht'],
    },
    {
      key: 'health-medicine',
      label: 'Gesundheit & Medizin',
      hint: 'Visiten, Vitalwerte, Medikation und Notfallblatt',
      slugs: ['visite-anlegen', 'visiten-oeffnen', 'visite-status-durchgefuehrt', 'vitalwerte', 'medikation-ansehen', 'notfallblatt'],
    },
    {
      key: 'organization-documents',
      label: 'Organisation & Dokumente',
      hint: 'An-/Abwesenheit, Formulare, Stammdaten und Dateiablage',
      slugs: ['anwesenheit', 'formulare-anlegen', 'stammdaten', 'dateiablage'],
    },
    {
      key: 'handover-overview',
      label: 'Übergabe & Übersicht',
      hint: 'Relevante Einträge für die Übergabe',
      slugs: ['uebergabeformular'],
    },
    {
      key: 'execution',
      label: 'Durchführung',
      hint: 'Nachweis, Bedarfsmedikation und Maßnahmen',
      slugs: [
        'durchfuehrung-storno',
        'durchfuehrungsnachweis-oeffnen',
        'bedarfsmedikation-gabe',
        'bedarfsmedikation-wirksamkeitskontrolle',
        'massnahmen-ohne-zeitangabe',
      ],
    },
  ]);

  const SPECIAL_ICONS = Object.freeze({
    'bedarfsmedikation-gabe': '<path d="m6.5 17.5 10-10a4 4 0 0 1 0 5.7l-5.8 5.8a4 4 0 0 1-5.7-5.7l2-2"/><path d="m9 15 5.8 5.8"/><path d="M18.5 3.5v5M16 6h5"/>',
    'bedarfsmedikation-wirksamkeitskontrolle': '<circle cx="12" cy="12" r="9"/><path d="M5.5 12h3l2-4 3 8 2-4h3"/>',
    'massnahmen-ohne-zeitangabe': '<rect x="4.5" y="3.5" width="15" height="17" rx="2.5"/><path d="M8 8h8M8 12h5"/><circle cx="16" cy="16" r="2.8"/><path d="m14 14 4 4"/>',
  });

  const MODE_ICONS = Object.freeze({
    voice: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11v1a6 6 0 0 0 12 0v-1M12 18v3M9 21h6"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v12H9l-5 4z"/><path d="M8 9h8M8 13h5"/></svg>',
  });

  let scheduled = false;

  function slugForCard(card) {
    if (card?.dataset?.v46FileStorage === 'true') return 'dateiablage';
    return card?.dataset?.v29OpenGuide || card?.dataset?.v29OpenDurchfuehrungGuide || '';
  }

  function polishModeSwitch() {
    for (const button of document.querySelectorAll('.mode-switch button[data-switch-mode]')) {
      const mode = button.dataset.switchMode;
      const icon = MODE_ICONS[mode];
      if (!icon) continue;
      const label = mode === 'voice' ? 'Sprechen' : 'Schreiben';
      const desired = `<span class="v35-mode-icon">${icon}</span><span>${label}</span>`;
      if (button.innerHTML !== desired) button.innerHTML = desired;
    }
  }

  function syncChatState() {
    const app = document.getElementById('appShell');
    if (!app) return;
    const started = Boolean(document.querySelector('#messages > .message.user'));
    const desired = started ? 'true' : 'false';
    if (app.dataset.v35ChatStarted !== desired) app.dataset.v35ChatStarted = desired;
  }

  function sectionNode(group) {
    const section = document.createElement('div');
    section.className = 'v35-library-section';
    section.dataset.v35Section = group.key;
    section.innerHTML = `<span>${group.label}</span><small>${group.hint}</small>`;
    return section;
  }

  function decorateSpecialIcon(card, slug) {
    const svg = card.querySelector('.v29-guide-icon svg');
    const markup = SPECIAL_ICONS[slug];
    if (!svg || !markup || svg.dataset.v35Icon === slug) return;
    svg.innerHTML = markup;
    svg.dataset.v35Icon = slug;
  }

  function updateLibraryCount(grid) {
    const head = document.querySelector('#directGuideView .v29-library-head > div');
    if (!head) return;
    let badge = head.querySelector('.v35-library-count');
    if (!badge) {
      badge = document.createElement('b');
      badge.className = 'v35-library-count';
      head.append(badge);
    }
    const count = grid.querySelectorAll('.v29-library-card:not(.is-later)').length;
    badge.textContent = `${count} Anleitungen`;
  }

  function decorateLibrary() {
    const grid = document.querySelector('#directGuideView .v29-library-grid');
    if (!grid) return;

    const activeCards = [...grid.querySelectorAll('.v29-library-card:not(.is-later)')];
    const laterCards = [...grid.querySelectorAll('.v29-library-card.is-later')];
    const signature = [...activeCards, ...laterCards].map(card => slugForCard(card) || card.textContent.trim()).join('|');
    if (grid.dataset.v35Signature === signature && grid.querySelectorAll('.v35-library-section').length === GROUPS.length + 1) {
      updateLibraryCount(grid);
      return;
    }

    const bySlug = new Map(activeCards.map(card => [slugForCard(card), card]));
    for (const heading of grid.querySelectorAll('.v35-library-section')) heading.remove();

    const fragment = document.createDocumentFragment();
    const used = new Set();

    for (const group of GROUPS) {
      const cards = group.slugs.map(slug => bySlug.get(slug)).filter(Boolean);
      if (!cards.length) continue;
      fragment.append(sectionNode(group));
      for (const card of cards) {
        const slug = slugForCard(card);
        card.dataset.v35Group = group.key;
        decorateSpecialIcon(card, slug);
        fragment.append(card);
        used.add(card);
      }
    }

    const unmatched = activeCards.filter(card => !used.has(card));
    if (unmatched.length) {
      const fallback = { key: 'other', label: 'Weitere Anleitungen', hint: 'Weitere freigegebene Abläufe' };
      fragment.append(sectionNode(fallback));
      for (const card of unmatched) fragment.append(card);
    }

    if (laterCards.length) {
      fragment.append(sectionNode({ key: 'later', label: 'In Vorbereitung', hint: 'Noch nicht fachlich freigegeben' }));
      for (const card of laterCards) {
        card.dataset.v35Group = 'later';
        fragment.append(card);
      }
    }

    grid.replaceChildren(fragment);
    grid.dataset.v35Signature = signature;
    grid.dataset.v35GroupLayoutRevision = GROUP_LAYOUT_REVISION;
    updateLibraryCount(grid);
  }

  function loadFeedback() {
    if (window.__DOKOHILF_FEEDBACK_V49__ || document.querySelector('script[data-dokohilf-feedback-v49]')) return;
    const script = document.createElement('script');
    script.src = `assets/feedback-report-v49.js?v=${FEEDBACK_REVISION}`;
    script.dataset.dokohilfFeedbackV49 = 'true';
    document.head.append(script);
  }

  function sync() {
    scheduled = false;
    polishModeSwitch();
    syncChatState();
    decorateLibrary();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  function init() {
    sync();
    loadFeedback();
    const target = document.getElementById('appShell') || document.body;
    new MutationObserver(schedule).observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'data-mode'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.DokoHilfUiPolishV35 = {
    sync,
    syncChatState,
    decorateLibrary,
    polishModeSwitch,
    loadFeedback,
    groupLayoutRevision: GROUP_LAYOUT_REVISION,
    chatUiRevision: CHAT_UI_REVISION,
    feedbackRevision: FEEDBACK_REVISION,
    getGroups: () => GROUPS.map(group => ({ ...group, slugs: [...group.slugs] })),
  };
})();
