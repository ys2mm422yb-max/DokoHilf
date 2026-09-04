(() => {
  'use strict';

  const BUILD_ID = document.querySelector('meta[name="dokohilf-build"]')?.content || 'unknown';
  const VERSION_LABEL = 'v35';
  const GUIDE_DISCOVERY_REVISION = '20260823-guide-discovery-v53-1';
  const INTENT_REGISTRY_REVISION = '20260904-confirmed-intent-parity-v69-1';
  const STEP_HELP_REVISION = '20260823-step-help-v54-1';
  const SELF_TEST_REVISION = '20260823-self-test-v54-1';
  const UPDATE_NOTICE_MS = 10000;
  const RELOAD_KEY = 'dokohilf-build-reload';
  const PRODUCTION_ORIGIN = 'https://ys2mm422yb-max.github.io';
  const USAGE_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-usage-counter';
  let usageCountRequested = false;

  function installStyles() {
    if (document.getElementById('releasePolishV29Styles')) return;
    const style = document.createElement('style');
    style.id = 'releasePolishV29Styles';
    style.textContent = `
      .topbar .build-pill{display:none!important}
      .footer-version-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;margin:7px auto 0;padding:0 12px calc(8px + env(safe-area-inset-bottom))}
      .footer-version-button{display:inline-flex!important;align-items:center;justify-content:center;min-height:28px;padding:0 9px;border:1px solid rgba(130,170,159,.10);border-radius:999px;background:rgba(255,255,255,.025);color:#58736c;font-size:9.5px;font-weight:700;letter-spacing:.025em;opacity:.72}
      .footer-version-button:active{opacity:1}
      .footer-credit{font-size:9px;font-weight:600;letter-spacing:.035em;color:#46615a;opacity:.56;line-height:1.2;text-align:center}
      .update-toast{max-width:calc(100% - 28px);text-align:center;white-space:normal;transition:opacity .2s ease,transform .2s ease}
      .app-shell[data-mode="chat"] .update-toast{bottom:calc(96px + env(safe-area-inset-bottom))}
    `;
    document.head.append(style);
  }

  function moveVersionToFooter() {
    const pill = document.getElementById('buildPill');
    if (!pill || document.getElementById('footerVersionWrap')) return;
    const wrap = document.createElement('div');
    wrap.id = 'footerVersionWrap';
    wrap.className = 'footer-version-wrap';
    pill.hidden = false;
    pill.removeAttribute('hidden');
    pill.style.removeProperty('display');
    pill.classList.add('footer-version-button');
    pill.classList.remove('build-pill');
    pill.textContent = `DokoHilf ${VERSION_LABEL} · Build ${BUILD_ID}`;
    pill.setAttribute('aria-label', `DokoHilf ${VERSION_LABEL}, Build ${BUILD_ID}. Auf Update prüfen.`);
    const credit = document.createElement('span');
    credit.className = 'footer-credit';
    credit.textContent = 'Konzept & Umsetzung · MT';
    wrap.append(pill, credit);
    const buildStatus = document.getElementById('buildStatus');
    const legal = document.querySelector('.legal-note');
    if (buildStatus?.parentElement) buildStatus.insertAdjacentElement('afterend', wrap);
    else if (legal?.parentElement) legal.insertAdjacentElement('afterend', wrap);
    else document.body.append(wrap);
  }

  function wasJustUpdated() {
    try {
      const previous = JSON.parse(sessionStorage.getItem(RELOAD_KEY) || 'null');
      if (!previous?.at) return false;
      const age = Date.now() - Number(previous.at || 0);
      return age >= 0 && age < 30_000;
    } catch {
      return false;
    }
  }

  function showUpdateNotice() {
    if (!wasJustUpdated()) return;
    const toast = document.getElementById('updateToast');
    if (!toast) return;
    toast.textContent = 'DokoHilf wurde aktualisiert.';
    toast.hidden = false;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    window.setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(5px)';
      window.setTimeout(() => { toast.hidden = true; }, 220);
    }, UPDATE_NOTICE_MS);
  }

  function countAnonymousPageView() {
    if (usageCountRequested || window.location.origin !== PRODUCTION_ORIGIN) return;
    usageCountRequested = true;
    window.fetch(USAGE_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }).catch(() => {});
  }

  function loadScript(path, revision, marker, datasetKey) {
    return new Promise(resolve => {
      if (window[marker]) return void resolve(true);
      const selector = `script[data-${datasetKey}]`;
      const existing = document.querySelector(selector);
      if (existing) {
        existing.addEventListener('load', () => resolve(true), { once: true });
        existing.addEventListener('error', () => resolve(false), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = `${path}?v=${revision}`;
      script.setAttribute(`data-${datasetKey}`, 'true');
      script.addEventListener('load', () => resolve(true), { once: true });
      script.addEventListener('error', () => resolve(false), { once: true });
      document.head.append(script);
    });
  }

  function loadGuideDiscovery() {
    return loadScript('assets/guide-discovery-v53.js', GUIDE_DISCOVERY_REVISION, '__DOKOHILF_GUIDE_DISCOVERY_V53__', 'dokohilf-guide-discovery-v53');
  }

  async function loadV54Features() {
    // Die bestätigte Intent-Regelbasis wird bewusst zuerst geladen. Sie ist damit
    // die äußerste Routing-Schicht; ältere Routingmodule bleiben nur als Fallback.
    await loadScript('assets/intent-registry-v54.js', INTENT_REGISTRY_REVISION, '__DOKOHILF_INTENT_REGISTRY_V54__', 'dokohilf-intent-registry-v54');
    await loadGuideDiscovery();
    await Promise.all([
      loadScript('assets/step-help-v54.js', STEP_HELP_REVISION, '__DOKOHILF_STEP_HELP_V54__', 'dokohilf-step-help-v54'),
      loadScript('assets/self-test-v54.js', SELF_TEST_REVISION, '__DOKOHILF_SELF_TEST_V54__', 'dokohilf-self-test-v54'),
    ]);
  }

  function init() {
    installStyles();
    moveVersionToFooter();
    showUpdateNotice();
    countAnonymousPageView();
    loadV54Features();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.DokoHilfReleasePolishV29 = {
    buildId: BUILD_ID,
    versionLabel: VERSION_LABEL,
    guideDiscoveryRevision: GUIDE_DISCOVERY_REVISION,
    intentRegistryRevision: INTENT_REGISTRY_REVISION,
    stepHelpRevision: STEP_HELP_REVISION,
    selfTestRevision: SELF_TEST_REVISION,
    updateNoticeMs: UPDATE_NOTICE_MS,
    moveVersionToFooter,
    showUpdateNotice,
    countAnonymousPageView,
    loadGuideDiscovery,
    loadV54Features,
  };
  window.__DOKOHILF_RELEASE_POLISH_V29__ = true;
})();
