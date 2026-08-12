(() => {
  'use strict';

  if (window.__DOKOHILF_FILE_STORAGE_GUIDE_V46__) return;

  const GUIDE = Object.freeze({
    title: 'Dateiablage öffnen',
    subtitle: 'Vorhandene Dokumente finden und in Word öffnen',
    steps: Object.freeze([
      'Öffne die Stammdaten des gewünschten Bewohners.',
      'Klicke in der grauen Leiste auf „Dateiablage“.',
      'Unten mittig erscheint der Bereich „Dokumente“.',
      'Suche dort das gewünschte vorhandene Dokument. Wenn es in der Dateiablage hinterlegt ist, wähle es aus.',
      'Öffne das vorhandene Dokument per Doppelklick. Es kann kurz dauern, bis sich Word öffnet. Klicke nicht mehrfach doppelt.',
    ]),
  });

  let scheduled = false;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[char]));
  }

  function iconMarkup() {
    return '<span class="v29-guide-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h5M9 12h7M9 16h7"/></svg></span>';
  }

  function ensureLibraryCard() {
    const grid = document.querySelector('#directGuideView .v29-library-grid');
    if (!grid || grid.querySelector('[data-v46-file-storage]')) return false;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'v29-library-card';
    button.dataset.v46FileStorage = 'true';
    button.innerHTML = `${iconMarkup()}<span><strong>Dateiablage öffnen</strong><small>Dokumente, Verträge, Briefe und Nachweise finden</small></span><i aria-hidden="true">›</i>`;

    const firstLater = grid.querySelector('.v29-library-card.is-later');
    if (firstLater) grid.insertBefore(button, firstLater);
    else grid.append(button);

    const view = document.getElementById('directGuideView');
    if (view) view.dataset.v46FileStorageGuide = 'available';
    return true;
  }

  function renderGuide() {
    const view = document.getElementById('directGuideView');
    const shell = document.getElementById('appShell');
    if (!view || !shell) return false;

    shell.dataset.mode = 'direct-guide';
    shell.dataset.v29GuideLibrary = 'true';
    view.hidden = false;
    const steps = GUIDE.steps.map((step, index) => `
      <li class="direct-guide-step">
        <span class="direct-guide-number" aria-hidden="true">${index + 1}</span>
        <div><p>${escapeHtml(step)}</p></div>
      </li>
    `).join('');

    view.innerHTML = `
      <div class="direct-guide-head v29-library-guide-head">
        <button class="direct-guide-back" type="button" data-v29-open-library="true" aria-label="Zurück zu allen Anleitungen">‹</button>
        <div class="direct-guide-heading">
          <span>Komplette Anleitung</span>
          <h1>${escapeHtml(GUIDE.title)}</h1>
          <p>${escapeHtml(GUIDE.subtitle)}</p>
        </div>
        <span class="direct-guide-count">${GUIDE.steps.length} Schritte</span>
      </div>
      <div class="direct-guide-callout warning">
        <strong>Wichtig</strong>
        <p>Hier geht es nur darum, bereits vorhandene Dokumente zu finden und zu öffnen. DokoHilf leitet nicht zum Hochladen, Löschen, Umbenennen oder Ändern von Dateien an.</p>
      </div>
      <div class="direct-guide-callout">
        <strong>Hinweis</strong>
        <p>Zum Beispiel können dort – wenn sie hinterlegt sind – Verträge, Betreuerausweise, Arzt- oder Entlassungsbriefe und Laborwerte liegen.</p>
      </div>
      <ol class="direct-guide-steps">${steps}</ol>
      <div class="direct-guide-footer"><button type="button" data-v29-guide-home>Zurück zum Hauptmenü</button></div>
    `;
    view.dataset.v46FileStorageGuide = 'open';
    window.scrollTo({ top: 0, behavior: 'instant' });
    return true;
  }

  function sync() {
    scheduled = false;
    ensureLibraryCard();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest?.('[data-v46-file-storage]');
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    renderGuide();
  }, { capture: true });

  function initialize() {
    schedule();
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
    window.DokoHilfFileStorageGuideV46 = Object.freeze({
      getGuide: () => ({ title: GUIDE.title, subtitle: GUIDE.subtitle, steps: [...GUIDE.steps] }),
      renderGuide,
      ensureLibraryCard,
    });
    window.__DOKOHILF_FILE_STORAGE_GUIDE_V46__ = true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
