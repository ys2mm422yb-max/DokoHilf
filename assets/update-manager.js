(() => {
  'use strict';

  const BUILD_ID = '20260805-14';
  const VERSION_URL = './version.json';
  const RELOAD_KEY = 'dokohilf-build-reload';
  const CHECK_INTERVAL_MS = 5 * 60 * 1000;

  let registration = null;
  let checking = false;
  let targetBuildId = null;

  function ensureStatusElement() {
    let status = document.getElementById('buildStatus');
    if (status) return status;

    const style = document.createElement('style');
    style.id = 'buildStatusStyles';
    style.textContent = `
      .build-status{display:flex;justify-content:center;align-items:center;gap:7px;margin:12px auto 0;padding:7px 10px;width:max-content;max-width:100%;border:1px solid rgba(11,107,82,.16);border-radius:999px;background:rgba(255,255,255,.72);color:#47645b;font-size:12px;line-height:1.2}
      .build-status[data-state="updating"]{color:#8a5b00;background:#fff5d9;border-color:#eccb6a}
      .build-status[data-state="error"]{color:#9b2424;background:#fff0f0;border-color:#e8a6a6}
      .build-status strong{font-weight:750;color:inherit}
    `;
    document.head.append(style);

    status = document.createElement('div');
    status.id = 'buildStatus';
    status.className = 'build-status';
    status.dataset.state = 'current';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.innerHTML = `<strong>Version ${BUILD_ID}</strong><span>Aktuell</span>`;

    const legal = document.querySelector('.legal-note');
    if (legal) legal.insertAdjacentElement('afterend', status);
    else document.body.append(status);
    return status;
  }

  function setStatus(state, text) {
    const status = ensureStatusElement();
    status.dataset.state = state;
    status.innerHTML = `<strong>Version ${BUILD_ID}</strong><span>${text}</span>`;
  }

  async function fetchRemoteVersion() {
    const separator = VERSION_URL.includes('?') ? '&' : '?';
    const response = await fetch(`${VERSION_URL}${separator}check=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) throw new Error(`version_${response.status}`);
    const payload = await response.json();
    if (!payload || typeof payload.buildId !== 'string' || !payload.buildId) {
      throw new Error('version_invalid');
    }
    return payload.buildId;
  }

  function reloadOnce(buildId) {
    const key = buildId || 'controller-change';
    try {
      if (sessionStorage.getItem(RELOAD_KEY) === key) return;
      sessionStorage.setItem(RELOAD_KEY, key);
    } catch {
      // Ein Reload bleibt auch ohne Session Storage möglich.
    }
    window.location.reload();
  }

  async function activateWaitingWorker() {
    if (!registration) return false;
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }
    await registration.update().catch(() => {});
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }
    return false;
  }

  async function checkForUpdate(reason = 'manual') {
    if (checking) return;
    checking = true;
    try {
      const remoteBuildId = await fetchRemoteVersion();
      if (remoteBuildId === BUILD_ID) {
        targetBuildId = null;
        try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* no-op */ }
        setStatus('current', 'Aktuell');
        return;
      }

      targetBuildId = remoteBuildId;
      setStatus('updating', 'Neue Version wird geladen …');
      const activated = await activateWaitingWorker();
      if (!activated && reason !== 'startup') {
        window.setTimeout(() => reloadOnce(remoteBuildId), 900);
      }
    } catch {
      setStatus('error', 'Updateprüfung gerade nicht möglich');
    } finally {
      checking = false;
    }
  }

  async function registerUpdateWorker() {
    ensureStatusElement();
    if (!('serviceWorker' in navigator)) {
      setStatus('error', 'Automatische Updates werden nicht unterstützt');
      return;
    }

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      setStatus('updating', 'Neue Version wird geladen …');
      reloadOnce(targetBuildId || 'controller-change');
    });

    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.type !== 'DOKOHILF_UPDATED') return;
      const buildId = event.data.buildId;
      if (buildId && buildId !== BUILD_ID) {
        targetBuildId = buildId;
        setStatus('updating', 'Neue Version wird geladen …');
        reloadOnce(buildId);
      }
    });

    try {
      registration = await navigator.serviceWorker.register('./service-worker.js', {
        updateViaCache: 'none',
      });
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        setStatus('updating', 'Neue Version wird vorbereitet …');
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
      await registration.update().catch(() => {});
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      await checkForUpdate('startup');
    } catch {
      setStatus('error', 'Updateprüfung gerade nicht möglich');
    }
  }

  window.addEventListener('pageshow', () => checkForUpdate('pageshow'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate('visible');
  });
  window.setInterval(() => checkForUpdate('interval'), CHECK_INTERVAL_MS);

  window.DokoHilfUpdate = {
    buildId: BUILD_ID,
    checkForUpdate,
    getRegistration: () => registration,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerUpdateWorker, { once: true });
  } else {
    registerUpdateWorker();
  }
})();
