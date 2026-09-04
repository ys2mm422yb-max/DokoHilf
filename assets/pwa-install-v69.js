(() => {
  'use strict';

  if (window.__DOKOHILF_PWA_INSTALL_V69__) return;

  const REVISION = '20260904-pwa-install-v69-1';
  let deferredPrompt = null;
  let entryNode = null;
  let statusNode = null;
  let opener = null;

  function captureInstallPrompt(event) {
    event.preventDefault();
    deferredPrompt = event;
    if (entryNode) entryNode.dataset.pwaInstallReady = 'true';
    if (statusNode) statusNode.textContent = '';
  }

  window.addEventListener('beforeinstallprompt', captureInstallPrompt);

  function platform() {
    const ua = String(navigator.userAgent || '');
    const ipadDesktopMode = navigator.platform === 'MacIntel' && Number(navigator.maxTouchPoints || 0) > 1;
    if (/iPad|iPhone|iPod/i.test(ua) || ipadDesktopMode) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    return 'other';
  }

  function isInstalled() {
    return window.matchMedia?.('(display-mode: standalone)')?.matches === true
      || navigator.standalone === true;
  }

  function instructions(kind = platform()) {
    if (kind === 'ios') {
      return {
        title: 'DokoHilf auf iPhone oder iPad installieren',
        intro: 'Auf iPhone und iPad wird DokoHilf über Safari zum Home-Bildschirm hinzugefügt.',
        steps: [
          'Öffne DokoHilf in Safari.',
          'Tippe auf „Teilen“ (Quadrat mit Pfeil nach oben). Falls „Teilen“ nicht sichtbar ist, tippe zuerst auf „Mehr“ (…).',
          'Wähle „Zum Home-Bildschirm“.',
          'Aktiviere „Als Web-App öffnen“ und tippe auf „Hinzufügen“.',
        ],
        note: 'Danach öffnest du DokoHilf direkt über das Symbol auf deinem Home-Bildschirm.',
      };
    }
    if (kind === 'android') {
      return {
        title: 'DokoHilf auf Android installieren',
        intro: 'Wenn der direkte Installationsdialog nicht erscheint, kannst du DokoHilf über das Chrome-Menü hinzufügen.',
        steps: [
          'Öffne DokoHilf in Chrome.',
          'Tippe oben rechts auf das Drei-Punkte-Menü (⋮).',
          'Wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.',
          'Bestätige die Installation.',
        ],
        note: 'Danach öffnest du DokoHilf direkt über das Symbol auf deinem Startbildschirm.',
      };
    }
    return {
      title: 'DokoHilf als App installieren',
      intro: 'Dein Browser zeigt die Installation im Browsermenü oder in der Adressleiste an, wenn sie unterstützt wird.',
      steps: [
        'Öffne das Browsermenü.',
        'Wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.',
        'Bestätige die Installation.',
      ],
      note: 'Nach der Installation lässt sich DokoHilf wie eine App öffnen.',
    };
  }

  function entrySubtitle(kind = platform()) {
    if (kind === 'ios') return 'Zum Home-Bildschirm hinzufügen und wie eine App öffnen.';
    if (kind === 'android') return 'Direkt installieren und vom Startbildschirm öffnen.';
    return 'Als App installieren und direkt öffnen.';
  }

  function makeEntry() {
    const wrap = document.createElement('section');
    wrap.className = 'pwa-install-v69';
    wrap.dataset.pwaInstallRevision = REVISION;
    wrap.setAttribute('aria-label', 'DokoHilf installieren');
    wrap.innerHTML = `
      <button class="pwa-install-v69-entry" type="button" data-pwa-install-action aria-describedby="pwaInstallV69Subtitle">
        <span class="pwa-install-v69-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 3v11m0 0 4-4m-4 4-4-4"/><path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg>
        </span>
        <span class="pwa-install-v69-copy"><small>Web-App</small><strong>DokoHilf installieren</strong><span id="pwaInstallV69Subtitle">${entrySubtitle()}</span></span>
        <span class="pwa-install-v69-arrow" aria-hidden="true">›</span>
      </button>
      <p class="pwa-install-v69-status" data-pwa-install-status aria-live="polite"></p>
    `;
    return wrap;
  }

  function makeDialog() {
    const backdrop = document.createElement('div');
    backdrop.className = 'pwa-install-v69-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML = '<section class="pwa-install-v69-dialog" role="dialog" aria-modal="true" aria-labelledby="pwaInstallV69Title"></section>';
    return backdrop;
  }

  function renderDialog(backdrop, kind = platform()) {
    const copy = instructions(kind);
    const dialog = backdrop.querySelector('.pwa-install-v69-dialog');
    dialog.dataset.pwaInstallPlatform = kind;
    dialog.innerHTML = `
      <div class="pwa-install-v69-head">
        <div><h2 id="pwaInstallV69Title">${copy.title}</h2><p>${copy.intro}</p></div>
        <button class="pwa-install-v69-close" type="button" data-pwa-install-close aria-label="Installationshinweise schließen">×</button>
      </div>
      <ol class="pwa-install-v69-steps">${copy.steps.map(step => `<li>${step}</li>`).join('')}</ol>
      <p class="pwa-install-v69-note">${copy.note}</p>
      <button class="pwa-install-v69-done" type="button" data-pwa-install-close>Verstanden</button>
    `;
  }

  function install() {
    if (document.querySelector('[data-pwa-install-revision]')) return;
    const shell = document.getElementById('appShell');
    const main = shell?.querySelector('.main-content');
    const legal = main?.querySelector('.legal-note');
    if (!shell || !main) return;

    const entry = makeEntry();
    const backdrop = makeDialog();
    if (legal) main.insertBefore(entry, legal);
    else main.append(entry);
    document.body.append(backdrop);

    const action = entry.querySelector('[data-pwa-install-action]');
    const status = entry.querySelector('[data-pwa-install-status]');
    entryNode = entry;
    statusNode = status;
    if (deferredPrompt) entry.dataset.pwaInstallReady = 'true';

    function syncInstalledState() {
      const installed = isInstalled();
      entry.hidden = installed;
      shell.dataset.pwaInstalled = installed ? 'true' : 'false';
      return installed;
    }

    function openInstructions(kind = platform()) {
      opener = document.activeElement;
      renderDialog(backdrop, kind);
      backdrop.hidden = false;
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => backdrop.querySelector('[data-pwa-install-close]')?.focus(), 0);
    }

    function closeInstructions() {
      backdrop.hidden = true;
      document.body.style.overflow = '';
      if (opener instanceof HTMLElement) opener.focus();
    }

    async function requestInstall() {
      status.textContent = '';
      if (syncInstalledState()) return;
      if (!deferredPrompt) {
        openInstructions();
        return;
      }

      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      entry.dataset.pwaInstallReady = 'false';
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice?.outcome === 'accepted') {
          status.textContent = 'DokoHilf wird installiert …';
        } else {
          status.textContent = 'Die Installation wurde nicht gestartet. Du kannst es jederzeit erneut versuchen.';
        }
      } catch {
        openInstructions();
      }
    }

    action.addEventListener('click', requestInstall);
    backdrop.addEventListener('click', event => {
      if (event.target === backdrop || event.target.closest?.('[data-pwa-install-close]')) closeInstructions();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !backdrop.hidden) closeInstructions();
    });
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      syncInstalledState();
    });
    window.addEventListener('pageshow', syncInstalledState);
    window.matchMedia?.('(display-mode: standalone)')?.addEventListener?.('change', syncInstalledState);
    syncInstalledState();

    window.DokoHilfPwaInstallV69 = Object.freeze({
      revision: REVISION,
      captureInstallPrompt,
      platform,
      isInstalled,
      instructions,
      entrySubtitle,
      openInstructions,
      closeInstructions,
      requestInstall,
      syncInstalledState,
    });
  }

  window.__DOKOHILF_PWA_INSTALL_V69__ = true;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
