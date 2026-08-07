(() => {
  'use strict';

  const BUILD_ID = '20260806-27';
  const TTS_MARKER = '/functions/v1/dokohilf-tts';
  const AI_MARKER = '/functions/v1/dokohilf-ai';
  const DEVICE_FALLBACK_MS = 160;
  const previousFetch = window.fetch.bind(window);

  function shell() {
    return document.getElementById('appShell');
  }

  function isVoiceMode() {
    return shell()?.dataset.mode === 'voice';
  }

  function isTtsRequest(input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return typeof url === 'string' && url.includes(TTS_MARKER) && method === 'POST';
  }

  function isAiRequest(input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return typeof url === 'string' && url.includes(AI_MARKER) && method === 'POST';
  }

  function deviceFallbackResponse() {
    return new Response('', {
      status: 503,
      headers: {
        'X-DokoHilf-Voice-Fallback': 'device-immediate',
        'Cache-Control': 'no-store',
      },
    });
  }

  function raceVoiceTts(input, init) {
    const cloud = Promise.resolve(previousFetch(input, init)).catch(() => deviceFallbackResponse());
    let timer;
    const fallback = new Promise(resolve => {
      timer = setTimeout(() => resolve(deviceFallbackResponse()), DEVICE_FALLBACK_MS);
    });
    cloud.catch(() => {});
    return Promise.race([cloud, fallback]).finally(() => clearTimeout(timer));
  }

  function textOnly(value) {
    return String(value || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  }

  function firstBold(value) {
    return String(value || '').match(/\*\*(.+?)\*\*/)?.[1]?.trim() || '';
  }

  function shortLabel(value, fallback) {
    const label = String(value || '').trim();
    if (!label) return fallback;
    return label.length <= 34 ? label : fallback;
  }

  function simplifyOptions(options) {
    const replacements = {
      'area-open': 'Doku-Erweitert offen',
      'other-page': 'Anderer Reiter / andere Seite',
      'entry-missing': 'Doku-Erweitert fehlt',
      lost: 'Ich weiß nicht, wo ich bin',
      'target-found': 'Vitalwerte sehe ich',
      'batch-seen': 'Nur Sammelerfassung sichtbar',
      'target-missing': 'Vitalwerte fehlt',
      'retry-entry': 'Einstieg noch einmal prüfen',
      'human-help': 'Kollegin / Kollegen fragen',
      renamed: 'Bei mir heißt es anders',
    };
    return (Array.isArray(options) ? options : []).slice(0, 4).map(option => ({
      ...option,
      label: replacements[option?.value] || shortLabel(option?.label, 'Andere Ansicht'),
      description: '',
    }));
  }

  function simplifyDetailPayload(payload) {
    if (!payload || typeof payload !== 'object' || typeof payload.reply !== 'string') return payload;
    const original = payload.reply;
    const title = String(payload.helpTitle || '');
    let reply = original;
    let spokenText = '';

    if (payload.helpMode === true && title === 'Wo bist du gerade?') {
      reply = 'Okay. Schau oben in die grüne Reiterleiste. Siehst du **Doku-Erweitert**?';
      spokenText = 'Okay. Schau oben in die grüne Reiterleiste. Siehst du Doku-Erweitert?';
    } else if (payload.helpMode === true && title === 'Was ist in Doku-Erweitert sichtbar?') {
      reply = 'Suche in **Doku-Erweitert** nach **Vitalwerte**. **Vitalwerte Sammelerf.** ist ein eigener Eintrag. Siehst du **Vitalwerte**?';
      spokenText = 'Suche in Doku-Erweitert nach Vitalwerte. Siehst du Vitalwerte?';
    } else if (payload.helpMode === true && title === 'Siehst du zusätzlich „Vitalwerte“?') {
      reply = '**Vitalwerte Sammelerf.** ist für mehrere Werte. Siehst du daneben auch **Vitalwerte**?';
      spokenText = 'Vitalwerte Sammelerfassung ist für mehrere Werte. Siehst du daneben auch Vitalwerte?';
    } else if (payload.helpMode === true && title === 'Hast du den bestätigten Einstieg gefunden?') {
      const entry = firstBold(original) || 'den Einstieg';
      reply = `Suche zuerst **${entry}**. Hast du ihn gefunden?`;
      spokenText = `Suche zuerst ${entry}. Hast du ihn gefunden?`;
    } else if (payload.helpMode === true && title === 'Wie möchtest du weiter vorgehen?') {
      reply = 'Der Menüpunkt ist dort nicht zu sehen. Prüfe den Einstieg noch einmal. Wenn er weiter fehlt, frag kurz eine Kollegin oder einen Kollegen.';
      spokenText = textOnly(reply);
    } else if (payload.helpMode === true && title === 'Was möchtest du tun?') {
      reply = 'Bei dir heißt der Punkt anders. Welche Bezeichnung siehst du?';
      spokenText = textOnly(reply);
    } else if (payload.helpMode === true) {
      reply = 'Okay. Was siehst du gerade?';
      spokenText = reply;
    } else if (/Vitalwerte\*\* ist gefunden|Vitalwerte.*gefunden/i.test(original)) {
      reply = 'Perfekt. Öffne jetzt **Vitalwerte**. Wenn die Ansicht offen ist, tippe auf **Weiter**.';
      spokenText = 'Perfekt. Öffne jetzt Vitalwerte. Wenn die Ansicht offen ist, tippe auf Weiter.';
    } else if (/menschliche Unterstützung|Kollegin|Kollegen|Ansprechperson/i.test(original)) {
      reply = 'Dafür habe ich keinen bestätigten Weg. Frag bitte kurz eine Kollegin oder einen Kollegen.';
      spokenText = textOnly(reply);
    }

    return {
      ...payload,
      reply,
      spokenText: spokenText || textOnly(reply),
      ...(payload.helpMode === true ? { helpOptions: simplifyOptions(payload.helpOptions) } : {}),
    };
  }

  async function rewriteDetailResponse(response) {
    if (!response?.ok || response.headers.get('X-DokoHilf-Detail-Help') !== 'v27') return response;
    const payload = await response.clone().json().catch(() => null);
    if (!payload) return response;
    const simplified = simplifyDetailPayload(payload);
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('X-DokoHilf-Detail-Help-Polish', 'v27');
    return new Response(JSON.stringify(simplified), { status: response.status, headers });
  }

  window.fetch = async (input, init = {}) => {
    if (isTtsRequest(input, init) && isVoiceMode()) {
      return raceVoiceTts(input, init);
    }

    const response = await previousFetch(input, init);
    if (isAiRequest(input, init)) return rewriteDetailResponse(response);
    return response;
  };

  function installStyles() {
    if (document.getElementById('detailHelpPolishStylesV27')) return;
    const style = document.createElement('style');
    style.id = 'detailHelpPolishStylesV27';
    style.textContent = `
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-inner{grid-template-rows:auto minmax(0,1fr);gap:9px;padding-top:10px;padding-bottom:calc(18px + env(safe-area-inset-bottom))}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-main{width:100%;min-height:0;justify-content:flex-start;gap:10px;overflow-y:auto;overscroll-behavior:contain;padding:0 0 8px}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-instruction{padding:13px 15px;border-radius:18px}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-instruction p{font-size:clamp(17px,4.5vw,20px);line-height:1.28;letter-spacing:-.015em}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-detail-help-options{width:min(680px,100%);padding:9px;gap:8px;border-radius:16px}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-detail-help-options>strong{font-size:12px;line-height:1.25}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-detail-help-options .detail-help-list{grid-template-columns:1fr 1fr!important;gap:8px}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-detail-help-options .detail-help-option{min-height:52px!important;padding:8px 10px!important;border-radius:13px}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-detail-help-options .detail-help-option span{font-size:12px;line-height:1.18}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-detail-help-options .detail-help-option small{display:none!important}
      .app-shell[data-mode="voice"][data-detail-help="true"] #voiceFocusConsoleSlot{margin-top:0}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-stage .voice-orb{width:96px!important;height:96px!important;box-shadow:0 16px 42px rgba(6,77,59,.22),0 0 0 8px rgba(11,107,82,.055)!important}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-stage .orb-rings{inset:-9px!important}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-stage .orb-rings:before{inset:-9px!important}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-stage .orb-rings:after{inset:-17px!important}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-stage .mic-symbol svg{width:44px!important;height:44px!important}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-stage .voice-copy{margin-top:7px!important}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-stage .voice-copy strong{font-size:15px!important;line-height:1.15!important}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-stage .voice-copy>span:not(.voice-engine-badge){display:none!important}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-stage .pause-button{display:none!important}
      .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-actions{display:none!important}
      @media(max-width:420px){
        .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-top{gap:7px}
        .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-toolbar button{min-height:36px;padding:0 10px}
        .app-shell[data-mode="voice"][data-detail-help="true"] .voice-detail-help-options .detail-help-option{min-height:50px!important;padding:7px 8px!important}
      }
      @media(max-height:760px){
        .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-instruction{padding:10px 12px}
        .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-instruction p{font-size:16px}
        .app-shell[data-mode="voice"][data-detail-help="true"] .voice-focus-stage .voice-orb{width:82px!important;height:82px!important}
        .app-shell[data-mode="voice"][data-detail-help="true"] .voice-detail-help-options .detail-help-option{min-height:46px!important}
      }
    `;
    document.head.append(style);
  }

  function installMarker() {
    shell()?.setAttribute('data-voice-followup-fallback-ms', String(DEVICE_FALLBACK_MS));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      installStyles();
      installMarker();
    }, { once: true });
  } else {
    installStyles();
    installMarker();
  }

  window.DokoHilfDetailHelpPolishV27 = {
    simplifyDetailPayload,
    deviceFallbackMs: DEVICE_FALLBACK_MS,
    buildId: BUILD_ID,
  };
  window.__DOKOHILF_DETAIL_HELP_POLISH_V27__ = true;
})();
