(() => {
  'use strict';

  if (window.__DOKOHILF_SELF_TEST_V54__) return;
  const REVISION = '20260823-self-test-v54-1';
  const ROUTER_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-conversation-router';
  const STATIC_VOICE = 'Supertonic-F1';
  let running = false;

  function installStyles() {
    if (document.getElementById('selfTestV54Styles')) return;
    const style = document.createElement('style');
    style.id = 'selfTestV54Styles';
    style.textContent = `
      .v54-selftest-entry{display:inline-flex;align-items:center;justify-content:center;min-height:28px;padding:0 9px;border:1px solid rgba(130,170,159,.13);border-radius:999px;background:rgba(255,255,255,.025);color:#648078;font-size:9.5px;font-weight:750;opacity:.78}
      .v54-selftest-entry:active{opacity:1}.app-shell:not([data-mode="start"]) .v54-selftest-entry{display:none!important}
      .v54-selftest-backdrop{position:fixed;inset:0;z-index:9997;display:grid;place-items:center;padding:18px;background:rgba(2,12,16,.72);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
      .v54-selftest-backdrop[hidden]{display:none!important}.v54-selftest-dialog{width:min(520px,100%);max-height:min(760px,calc(100dvh - 36px));overflow:auto;border:1px solid rgba(91,218,176,.22);border-radius:24px;background:linear-gradient(155deg,#0b211f,#071613);box-shadow:0 26px 70px rgba(0,0,0,.38);color:#eafff7}
      .v54-selftest-head{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;padding:19px 19px 12px}.v54-selftest-head h2{margin:0;font-size:20px;line-height:1.2}.v54-selftest-head p{margin:5px 0 0;color:#9dbbb1;font-size:12px;line-height:1.45}
      .v54-selftest-close{width:38px;height:38px;flex:0 0 auto;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.05);color:#dff7ef;font-size:20px}
      .v54-selftest-list{display:grid;gap:9px;padding:4px 14px 14px}.v54-selftest-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:center;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.035)}
      .v54-selftest-dot{width:30px;height:30px;display:grid;place-items:center;border-radius:10px;background:rgba(255,255,255,.07);font-size:14px;font-weight:900}.v54-selftest-row[data-state="ok"] .v54-selftest-dot{background:rgba(28,179,132,.17);color:#76e6c0}.v54-selftest-row[data-state="warn"] .v54-selftest-dot{background:rgba(231,174,54,.15);color:#ffd378}.v54-selftest-row[data-state="error"] .v54-selftest-dot{background:rgba(222,78,78,.16);color:#ff9d9d}
      .v54-selftest-copy{min-width:0}.v54-selftest-copy strong{display:block;font-size:13px;color:#eafff7}.v54-selftest-copy span{display:block;margin-top:2px;color:#8faea4;font-size:11px;line-height:1.35}.v54-selftest-row button{min-height:34px;padding:0 10px;border:1px solid rgba(83,223,177,.22);border-radius:10px;background:#0d6f57;color:#fff;font-size:10.5px;font-weight:800}
      .v54-selftest-actions{display:flex;gap:9px;padding:0 14px 14px}.v54-selftest-run{flex:1;min-height:44px;border:0;border-radius:14px;background:#0b7a5d;color:#fff;font-size:12px;font-weight:900}.v54-selftest-note{margin:0 14px 16px;padding:11px 12px;border-radius:13px;background:rgba(255,255,255,.035);color:#789990;font-size:10.5px;line-height:1.45}
      @media(max-width:520px){.v54-selftest-backdrop{padding:10px}.v54-selftest-dialog{max-height:calc(100dvh - 20px);border-radius:20px}.v54-selftest-row{grid-template-columns:30px minmax(0,1fr)}.v54-selftest-row button{grid-column:2;width:100%}}
    `;
    document.head.append(style);
  }

  function ensureEntry() {
    if (document.querySelector('[data-v54-selftest-open]')) return;
    const wrap = document.getElementById('footerVersionWrap');
    if (!wrap) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'v54-selftest-entry';
    button.dataset.v54SelftestOpen = 'true';
    button.textContent = 'DokoHilf prüfen';
    button.setAttribute('aria-label', 'DokoHilf technisch prüfen');
    wrap.insertBefore(button, wrap.querySelector('.footer-credit') || null);
  }

  function ensureDialog() {
    let backdrop = document.getElementById('selfTestV54Backdrop');
    if (backdrop) return backdrop;
    backdrop = document.createElement('div');
    backdrop.id = 'selfTestV54Backdrop';
    backdrop.className = 'v54-selftest-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <section class="v54-selftest-dialog" role="dialog" aria-modal="true" aria-labelledby="selfTestV54Title">
        <div class="v54-selftest-head"><div><h2 id="selfTestV54Title">DokoHilf prüfen</h2><p>Kurzer technischer Selbsttest – ohne Bewohner-, Mitarbeiter- oder Falldaten.</p></div><button class="v54-selftest-close" type="button" data-v54-selftest-close aria-label="Schließen">×</button></div>
        <div class="v54-selftest-list">
          <div class="v54-selftest-row" data-check="app" data-state="idle"><span class="v54-selftest-dot">·</span><div class="v54-selftest-copy"><strong>App & Version</strong><span>Noch nicht geprüft.</span></div></div>
          <div class="v54-selftest-row" data-check="connection" data-state="idle"><span class="v54-selftest-dot">·</span><div class="v54-selftest-copy"><strong>Verbindung</strong><span>Noch nicht geprüft.</span></div></div>
          <div class="v54-selftest-row" data-check="router" data-state="idle"><span class="v54-selftest-dot">·</span><div class="v54-selftest-copy"><strong>DokoHilf-Dienst</strong><span>Noch nicht geprüft.</span></div></div>
          <div class="v54-selftest-row" data-check="voice" data-state="idle"><span class="v54-selftest-dot">·</span><div class="v54-selftest-copy"><strong>Statische Supertonic-Stimme</strong><span>Noch nicht geprüft.</span></div></div>
          <div class="v54-selftest-row" data-check="microphone" data-state="idle"><span class="v54-selftest-dot">·</span><div class="v54-selftest-copy"><strong>Mikrofon</strong><span>Die Verfügbarkeit wird geprüft; ein echter Zugriff erfolgt nur nach Tippen.</span></div><button type="button" data-v54-mic-test>Mikrofon testen</button></div>
        </div>
        <div class="v54-selftest-actions"><button class="v54-selftest-run" type="button" data-v54-selftest-run>Technik prüfen</button></div>
        <p class="v54-selftest-note">Der Test speichert nichts dauerhaft. Beim Mikrofontest wird nur kurz der Gerätezugriff geprüft; es wird nichts aufgenommen, transkribiert oder übertragen.</p>
      </section>`;
    document.body.append(backdrop);
    return backdrop;
  }

  function row(name) { return ensureDialog().querySelector(`[data-check="${name}"]`); }
  function setResult(name, state, text) {
    const target = row(name);
    if (!target) return;
    target.dataset.state = state;
    const dot = target.querySelector('.v54-selftest-dot');
    const copy = target.querySelector('.v54-selftest-copy span');
    if (dot) dot.textContent = state === 'ok' ? '✓' : state === 'error' ? '!' : state === 'warn' ? '?' : '·';
    if (copy) copy.textContent = text;
  }

  async function fetchJsonNoStore(url) {
    const separator = String(url).includes('?') ? '&' : '?';
    const response = await fetch(`${url}${separator}selftest=${Date.now()}`, { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function checkApp() {
    try {
      const payload = await fetchJsonNoStore('./version.json');
      const localVersion = window.DokoHilfReleasePolishV29?.versionLabel || '';
      const localBuild = window.DokoHilfReleasePolishV29?.buildId || document.querySelector('meta[name="dokohilf-build"]')?.content || '';
      if (!payload?.appVersion || !payload?.buildId) throw new Error('Versionsdaten fehlen');
      if (payload.appVersion !== localVersion || payload.buildId !== localBuild) {
        setResult('app', 'warn', `Neu laden empfohlen: geladen ${localVersion || '?'} / ${localBuild || '?'}, aktuell ${payload.appVersion} / ${payload.buildId}.`);
        return;
      }
      setResult('app', 'ok', `${payload.appVersion} · Build ${payload.buildId} ist aktuell.`);
    } catch {
      setResult('app', 'error', 'Versionsprüfung gerade nicht möglich.');
    }
  }

  async function checkConnection() {
    if (navigator.onLine === false) {
      setResult('connection', 'error', 'Gerät meldet keine Internetverbindung.');
      return;
    }
    try {
      const response = await fetch(`./version.json?connection=${Date.now()}`, { cache: 'no-store', credentials: 'omit' });
      setResult('connection', response.ok ? 'ok' : 'warn', response.ok ? 'Internetverbindung funktioniert.' : `Verbindung antwortet mit HTTP ${response.status}.`);
    } catch {
      setResult('connection', 'error', 'DokoHilf konnte das Netz gerade nicht erreichen.');
    }
  }

  async function checkRouter() {
    try {
      const response = await fetch(ROUTER_ENDPOINT, {
        method: 'OPTIONS',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });
      setResult('router', response.ok ? 'ok' : 'warn', response.ok ? 'DokoHilf-Dienst ist erreichbar.' : `Dienst antwortet mit HTTP ${response.status}.`);
    } catch {
      setResult('router', 'error', 'DokoHilf-Dienst ist gerade nicht erreichbar.');
    }
  }

  async function checkVoice() {
    try {
      const manifestUrl = window.DokoHilfStaticSupertonicV29?.manifestUrl || './assets/guide-audio-catalog.json';
      const payload = await fetchJsonNoStore(manifestUrl);
      if (payload?.voice !== STATIC_VOICE) throw new Error('voice_mismatch');
      const entries = Array.isArray(payload.entries) ? payload.entries : [];
      const playable = entries.find(entry => typeof entry?.file === 'string' && entry.file);
      if (!playable) {
        setResult('voice', 'warn', `${STATIC_VOICE}-Katalog ist vorhanden; Audiodatei konnte in dieser Ansicht nicht einzeln geprüft werden.`);
        return;
      }
      const audio = await fetch(new URL(playable.file, document.baseURI), { cache: 'no-store', credentials: 'omit' });
      if (!audio.ok || !/audio\/wav/i.test(audio.headers.get('content-type') || '')) throw new Error('audio_invalid');
      const bytes = await audio.arrayBuffer();
      if (bytes.byteLength < 256) throw new Error('audio_empty');
      setResult('voice', 'ok', `${STATIC_VOICE} und eine statische WAV-Datei sind erreichbar.`);
    } catch {
      setResult('voice', 'error', 'Statische Supertonic-Sprachausgabe konnte nicht vollständig geprüft werden.');
    }
  }

  async function checkMicrophoneCapability() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setResult('microphone', 'error', 'Dieser Browser stellt keinen Mikrofonzugriff bereit.');
      return;
    }
    try {
      if (navigator.permissions?.query) {
        const permission = await navigator.permissions.query({ name: 'microphone' });
        if (permission.state === 'denied') {
          setResult('microphone', 'error', 'Mikrofon ist im Browser blockiert.');
          return;
        }
        if (permission.state === 'granted') {
          setResult('microphone', 'ok', 'Mikrofonfreigabe ist vorhanden.');
          return;
        }
      }
    } catch { /* iOS unterstützt die Permission-Abfrage teilweise nicht. */ }
    setResult('microphone', 'warn', 'Mikrofon ist technisch verfügbar. Tippe für einen echten Zugriffstest auf „Mikrofon testen“.');
  }

  async function testMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) return void setResult('microphone', 'error', 'Mikrofonzugriff wird nicht unterstützt.');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      for (const track of stream.getTracks()) track.stop();
      setResult('microphone', 'ok', 'Mikrofonzugriff funktioniert. Es wurde nichts gespeichert oder übertragen.');
    } catch (error) {
      const name = String(error?.name || '');
      const denied = /NotAllowed|PermissionDenied/i.test(name);
      setResult('microphone', denied ? 'error' : 'warn', denied ? 'Mikrofonzugriff wurde nicht erlaubt.' : 'Mikrofon konnte gerade nicht geöffnet werden.');
    }
  }

  async function runAll() {
    if (running) return;
    running = true;
    const button = ensureDialog().querySelector('[data-v54-selftest-run]');
    if (button) { button.disabled = true; button.textContent = 'Prüfung läuft …'; }
    for (const name of ['app', 'connection', 'router', 'voice']) setResult(name, 'idle', 'Wird geprüft …');
    await Promise.all([checkApp(), checkConnection(), checkRouter(), checkVoice(), checkMicrophoneCapability()]);
    if (button) { button.disabled = false; button.textContent = 'Erneut prüfen'; }
    running = false;
  }

  function openDialog() {
    const backdrop = ensureDialog();
    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    backdrop.querySelector('[data-v54-selftest-close]')?.focus();
    runAll();
  }
  function closeDialog() {
    const backdrop = ensureDialog();
    backdrop.hidden = true;
    document.body.style.removeProperty('overflow');
  }

  document.addEventListener('click', event => {
    if (event.target?.closest?.('[data-v54-selftest-open]')) { event.preventDefault(); openDialog(); return; }
    if (event.target?.closest?.('[data-v54-selftest-close]')) { event.preventDefault(); closeDialog(); return; }
    if (event.target?.closest?.('[data-v54-selftest-run]')) { event.preventDefault(); runAll(); return; }
    if (event.target?.closest?.('[data-v54-mic-test]')) { event.preventDefault(); testMicrophone(); return; }
    if (event.target?.id === 'selfTestV54Backdrop') closeDialog();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !ensureDialog().hidden) closeDialog(); });

  installStyles();
  const observer = new MutationObserver(ensureEntry);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureEntry, { once: true });
  else ensureEntry();

  window.DokoHilfSelfTestV54 = {
    revision: REVISION,
    routerEndpoint: ROUTER_ENDPOINT,
    staticVoice: STATIC_VOICE,
    runAll,
    testMicrophone,
    openDialog,
  };
  window.__DOKOHILF_SELF_TEST_V54__ = true;
})();
