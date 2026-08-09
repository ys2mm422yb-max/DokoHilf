(() => {
  'use strict';

  const GUIDES = Object.freeze({
    'bedarfsmedikation-gabe': {
      title: 'Bedarfsmedikation dokumentieren',
      subtitle: 'Bedarfsgabe und spätere Wirksamkeitskontrolle',
      icon: 'medication',
      warning: 'Dokumentiere nur die tatsächlich verwendete Bedarfsmenge. Die Verordnung selbst wird in diesem Ablauf nicht verändert.',
      note: 'Nach der Bedarfsmedikationsgabe wird die Wirksamkeitskontrolle automatisch vom System angelegt. Du erstellst sie nicht selbst und bearbeitest sie erst zum vorgesehenen Zeitpunkt.',
      steps: [
        'Beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“ öffnen.',
        'Direkt darunter „Durchführungsnachweis“ öffnen.',
        'Im Durchführungsnachweis „Bedarfsmedikation“ suchen und auf den kleinen Pfeil links daneben klicken.',
        'Das gewünschte Bedarfsmedikament auswählen und rechts im kleinen Kästchen den Haken setzen.',
        'Im Pop-up-Fenster die Uhrzeit prüfen. Nur ändern, wenn der tatsächliche Zeitpunkt der Gabe abweicht.',
        '„Wichtig für Schichtübergabe“ ist bei Bedarfsmedikation bereits automatisch ausgewählt. Den Haken so lassen und darunter im Textfeld kurz den Anlass der Gabe eintragen.',
        'Falls tatsächlich eine geringere Bedarfsmenge verwendet wurde, rechts im Pop-up-Fenster die tatsächlich verwendete Menge eintragen. Die Verordnung selbst nicht verändern.',
        'Das Pop-up-Fenster unten mit „OK“ bestätigen.',
        'Nach dem Speichern wird die Wirksamkeitskontrolle automatisch vom System angelegt. Erst wenn sie zum vorgesehenen Zeitpunkt fällig ist, im Durchführungsnachweis öffnen.',
        'Die Wirksamkeitskontrolle abhaken und kurz eintragen, ob und wie die Bedarfsmedikation gewirkt beziehungsweise geholfen hat.',
        'Die Wirksamkeitskontrolle unten mit „OK“ bestätigen.',
      ],
    },
    'bedarfsmedikation-wirksamkeitskontrolle': {
      title: 'Wirksamkeitskontrolle dokumentieren',
      subtitle: 'Wirkung einer Bedarfsmedikation festhalten',
      icon: 'effect',
      note: 'Die Wirksamkeitskontrolle wird automatisch nach einer Bedarfsmedikationsgabe angelegt. DokoHilf nennt keine erfundene Wartezeit.',
      steps: [
        'Warten, bis die automatisch angelegte Wirksamkeitskontrolle zum vorgesehenen Zeitpunkt fällig ist.',
        'Beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“ öffnen.',
        'Direkt darunter „Durchführungsnachweis“ öffnen und die passende Wirksamkeitskontrolle suchen.',
        'Die Wirksamkeitskontrolle öffnen und abhaken.',
        'Kurz eintragen, ob und wie die Bedarfsmedikation gewirkt beziehungsweise geholfen hat.',
        'Das Pop-up-Fenster unten mit „OK“ bestätigen.',
      ],
    },
    'massnahmen-ohne-zeitangabe': {
      title: 'Maßnahmen ohne Zeitangabe',
      subtitle: 'Maßnahme im Durchführungsnachweis dokumentieren',
      icon: 'measure',
      note: 'Eine zusätzliche Zeitangabe oben rechts im Pop-up-Fenster ist optional.',
      steps: [
        'Beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“ öffnen.',
        'Direkt darunter „Durchführungsnachweis“ öffnen.',
        'Im Durchführungsnachweis „Maßnahmen ohne Zeitangabe“ öffnen.',
        'Die gewünschte Maßnahme auswählen, zum Beispiel „Klienten-Team Sitzung“ oder „Krise“.',
        'Im Pop-up-Fenster Datum und Uhrzeit prüfen. Nur ändern, wenn der tatsächliche Dokumentationszeitpunkt abweicht.',
        'Die passende Kategorie auswählen.',
        'Wenn die Maßnahme für die nächste Schicht wichtig ist, „Wichtig für Schichtübergabe“ anhaken. Danach in das Textfeld darunter kurz eintragen, was passiert ist oder was du gemacht beziehungsweise durchgeführt hast.',
        'Falls du zusätzlich eine Zeitangabe brauchst, kannst du sie oben rechts im Pop-up-Fenster ergänzen.',
        'Das Pop-up-Fenster unten mit „OK“ bestätigen.',
      ],
    },
  });

  const META = Object.freeze({
    'bedarfsmedikation-gabe': { label: 'Bedarfsmedikation dokumentieren', subtitle: 'Bedarfsgabe + Wirksamkeitskontrolle', icon: 'medication' },
    'bedarfsmedikation-wirksamkeitskontrolle': { label: 'Wirksamkeitskontrolle', subtitle: 'Wirkung der Bedarfsmedikation dokumentieren', icon: 'effect' },
    'massnahmen-ohne-zeitangabe': { label: 'Maßnahmen ohne Zeitangabe', subtitle: 'Maßnahme im Durchführungsnachweis', icon: 'measure' },
  });

  const ICONS = Object.freeze({
    medication: '<path d="m7 17 10-10a4 4 0 0 1 0 6L11 19a4 4 0 0 1-6-6l2-2"/><path d="m9 15 6 6"/>',
    effect: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/><path d="M12 3v3M21 12h-3"/>',
    measure: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/><path d="m15 16 1.5 1.5L20 14"/>',
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function iconMarkup(kind) {
    return `<span class="v29-guide-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[kind] || ICONS.measure}</svg></span>`;
  }

  function shellElements() {
    return {
      shell: document.getElementById('appShell'),
      start: document.getElementById('startScreen'),
      workspace: document.getElementById('workspace'),
      composer: document.getElementById('composerWrap'),
      legal: document.querySelector('.legal-note'),
      home: document.getElementById('homeButton'),
      reset: document.getElementById('resetButton'),
      view: document.getElementById('directGuideView'),
    };
  }

  function ensureView() {
    const existing = document.getElementById('directGuideView');
    if (existing) return existing;
    const main = document.querySelector('.main-content');
    if (!main) return null;
    const view = document.createElement('section');
    view.id = 'directGuideView';
    view.className = 'direct-guide-view';
    view.hidden = true;
    view.setAttribute('aria-live', 'polite');
    main.insertBefore(view, main.querySelector('.legal-note'));
    return view;
  }

  function openFrame() {
    const el = shellElements();
    const view = ensureView();
    if (!el.shell || !el.start || !el.workspace || !el.composer || !view) return null;
    el.shell.dataset.mode = 'direct-guide';
    el.shell.dataset.v29GuideLibrary = 'true';
    el.start.hidden = true;
    el.workspace.hidden = true;
    el.composer.hidden = true;
    view.hidden = false;
    if (el.legal) el.legal.hidden = true;
    if (el.home) el.home.hidden = false;
    if (el.reset) el.reset.hidden = true;
    window.scrollTo({ top: 0, behavior: 'instant' });
    return view;
  }

  function renderGuide(slug) {
    const guide = GUIDES[slug];
    const view = openFrame();
    if (!guide || !view) return;
    const steps = guide.steps.map((step, index) => `<li class="direct-guide-step"><span class="direct-guide-number" aria-hidden="true">${index + 1}</span><div><p>${escapeHtml(step)}</p></div></li>`).join('');
    view.innerHTML = `<div class="direct-guide-head v29-library-guide-head">
      <button class="direct-guide-back" type="button" data-v29-extra-back aria-label="Zurück zu allen Anleitungen">‹</button>
      <div class="direct-guide-heading"><span>Komplette Anleitung</span><h1>${escapeHtml(guide.title)}</h1><p>${escapeHtml(guide.subtitle)}</p></div>
      <span class="direct-guide-count">${guide.steps.length} Schritte</span>
    </div>
    ${guide.warning ? `<div class="direct-guide-callout warning"><strong>Wichtig</strong><p>${escapeHtml(guide.warning)}</p></div>` : ''}
    ${guide.note ? `<div class="direct-guide-callout"><strong>Hinweis</strong><p>${escapeHtml(guide.note)}</p></div>` : ''}
    <ol class="direct-guide-steps">${steps}</ol>
    <div class="direct-guide-footer"><button type="button" data-v29-extra-home>Zurück zum Hauptmenü</button></div>`;
  }

  function makeCard(slug) {
    const meta = META[slug];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'v29-library-card v29-durchfuehrung-card';
    button.dataset.v29OpenDurchfuehrungGuide = slug;
    button.innerHTML = `${iconMarkup(meta.icon)}<span><strong>${escapeHtml(meta.label)}</strong><small>${escapeHtml(meta.subtitle)}</small></span><i aria-hidden="true">›</i>`;
    return button;
  }

  function injectLibraryCards() {
    const grid = document.querySelector('#directGuideView .v29-library-grid');
    if (!grid || grid.querySelector('[data-v29-open-durchfuehrung-guide]')) return;
    const firstLater = grid.querySelector('.v29-library-card.is-later');
    for (const slug of Object.keys(META)) {
      const card = makeCard(slug);
      if (firstLater) grid.insertBefore(card, firstLater);
      else grid.append(card);
    }
    const active = grid.querySelectorAll('.v29-library-card:not(.is-later)').length;
    document.getElementById('directGuideView')?.setAttribute('data-v29-library-guide-count', String(active));
  }

  function goLibrary() {
    if (window.DokoHilfGuideLibraryV29?.renderLibrary) {
      window.DokoHilfGuideLibraryV29.renderLibrary();
      injectLibraryCards();
    }
  }

  document.addEventListener('click', event => {
    const open = event.target.closest?.('[data-v29-open-durchfuehrung-guide]');
    if (open) {
      event.preventDefault();
      event.stopImmediatePropagation();
      renderGuide(open.dataset.v29OpenDurchfuehrungGuide);
      return;
    }
    if (event.target.closest?.('[data-v29-extra-back]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      goLibrary();
      return;
    }
    if (event.target.closest?.('[data-v29-extra-home]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.getElementById('homeButton')?.click();
    }
  }, { capture: true });

  function init() {
    injectLibraryCards();
    const target = document.getElementById('appShell') || document.body;
    new MutationObserver(injectLibraryCards).observe(target, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.DokoHilfDurchfuehrungsWorkflowsV29 = {
    renderGuide,
    injectLibraryCards,
    slugs: Object.keys(GUIDES),
  };
  window.__DOKOHILF_DURCHFUEHRUNGS_WORKFLOWS_V29__ = true;
})();
