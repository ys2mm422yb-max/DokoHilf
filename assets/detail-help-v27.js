(() => {
  'use strict';

  const CORE_MARKERS = [
    '/functions/v1/dokohilf-ai',
    '/functions/v1/dokohilf-chat-router',
  ];

  const GUIDE_META = Object.freeze({
    vitalwerte: { title: 'Vitalwerte öffnen' },
    'vitalwerte-erfassen': { title: 'Vitalwerte erfassen' },
    'vitalwerte-einzelwert': { title: 'Einzelnen Vitalwert erfassen' },
    'vitalwerte-einzelwert-fortsetzen': { title: 'Einzelnen Vitalwert erfassen' },
    'vitalwerte-sammelerfassung': { title: 'Mehrere Vitalwerte erfassen' },
    'vitalwerte-sammelerfassung-fortsetzen': { title: 'Sammelerfassung öffnen' },
    'visite-anlegen': { title: 'Visite beziehungsweise Sprechstunde dokumentieren' },
    'visiten-oeffnen': { title: 'Visiten öffnen' },
    anwesenheit: { title: 'An- oder Abwesenheit erfassen' },
    'medikation-ansehen': { title: 'Medikation ausschließlich ansehen' },
    'formulare-anlegen': { title: 'Formular anlegen' },
    uebergabeformular: { title: 'Übergabe über „Was war los?“ anzeigen' },
    notfallblatt: { title: 'Notfallblatt in Word öffnen' },
    'durchfuehrungsnachweis-oeffnen': { title: 'Durchführungsnachweis öffnen' },
    'durchfuehrung-storno': { title: 'Falsch abgezeichnete Durchführung stornieren' },
    'bericht-neu': { title: 'Neuen Berichtseintrag erfassen' },
    'bericht-durchstreichen': { title: 'Bestehenden Berichtseintrag durchstreichen' },
    'bericht-folgebericht': { title: 'Folgebericht erstellen' },
  });

  const session = {
    active: false,
    guideSlug: null,
    guideStep: 1,
    guideStepCount: 1,
    stage: 'contextual-v29',
    pendingOption: null,
  };

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9\s/-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isProblemSignal(text) {
    const n = normalize(text);
    return /\b(ich brauche hilfe|brauch hilfe|hilf mir|komme nicht weiter|weiss nicht|weis nicht|keine ahnung|checke nicht|check nicht|verstehe nicht|versteh nicht|was meinst du|was jetzt|und jetzt)\b/.test(n)
      || /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
      || /\b(wo ist|wo sind|wo finde ich|wie finde ich|wo muss ich|wo soll ich|wo klicken|wo drucken|wo druecken|was muss ich klicken|was soll ich klicken|welchen knopf|welchen button|welche taste)\b/.test(n)
      || /\b(sieht bei mir anders aus|bei mir ist es anders|bei mir heisst|bei mir steht)\b/.test(n);
  }

  function inferGuideSlug(text, explicitGuideSlug = '') {
    const explicit = String(explicitGuideSlug || '').trim();
    if (explicit && GUIDE_META[explicit]) return explicit;
    const n = normalize(text);
    if (/\b(blutdruck|puls|temperatur|blutzucker|sauerstoff|spo2|vitalwert|vitalwerte)\b/.test(n)) return 'vitalwerte-einzelwert';
    if (/\b(visite|visiten|sprechstunde)\b/.test(n)) return 'visiten-oeffnen';
    if (/\b(medikation|medikament|medikamente)\b/.test(n)) return 'medikation-ansehen';
    if (/\b(formular|formulare|anfallsprotokoll|fallgesprach|gesprachsprotokoll|sturzprotokoll)\b/.test(n)) return 'formulare-anlegen';
    if (/\b(anwesenheit|abwesenheit)\b/.test(n)) return 'anwesenheit';
    if (/\b(ubergabe|uebergabe|was war los)\b/.test(n)) return 'uebergabeformular';
    if (/\b(notfallblatt|notfallbogen)\b/.test(n)) return 'notfallblatt';
    if (/\b(durchfuhrungsnachweis|durchfuehrungsnachweis)\b/.test(n)) return 'durchfuehrungsnachweis-oeffnen';
    if (/\b(bericht|berichte)\b/.test(n)) return 'bericht-neu';
    return explicit || '';
  }

  function isCoreRequest(input) {
    const url = typeof input === 'string' ? input : input?.url;
    return typeof url === 'string' && CORE_MARKERS.some(marker => url.includes(marker));
  }

  function clearHelpUi() {
    if (typeof document === 'undefined') return;
    document.getElementById('appShell')?.removeAttribute('data-detail-help');
    for (const id of ['detailHelpOptionsV27', 'voiceDetailHelpOptionsV27']) {
      const panel = document.getElementById(id);
      if (panel) panel.remove();
    }
  }

  function syncSession(payload) {
    if (!payload || typeof payload !== 'object') return;
    const slug = String(payload.guideSlug || '').trim();
    if (!slug) return;
    const step = Number(payload.guideStep);
    const count = Number(payload.guideStepCount);
    session.active = true;
    session.guideSlug = slug;
    session.guideStep = Number.isInteger(step) && step >= 1 ? step : 1;
    session.guideStepCount = Number.isInteger(count) && count >= 1 ? count : session.guideStepCount;
  }

  function installFetchBridge() {
    if (window.__DOKOHILF_DETAIL_HELP_FETCH_V29__) return;
    const previousFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      const response = await previousFetch(input, init);
      if (!isCoreRequest(input)) return response;
      response.clone().json()
        .then(payload => {
          syncSession(payload);
          clearHelpUi();
        })
        .catch(() => clearHelpUi());
      return response;
    };
    window.__DOKOHILF_DETAIL_HELP_FETCH_V29__ = true;
  }

  function clearSession() {
    session.active = false;
    session.guideSlug = null;
    session.guideStep = 1;
    session.guideStepCount = 1;
    session.pendingOption = null;
    clearHelpUi();
  }

  function getState() {
    const live = window.DokoHilfGuideProgress?.getCurrentGuide?.();
    if (live?.guideSlug) {
      return {
        ...session,
        active: true,
        guideSlug: live.guideSlug,
        guideStep: Number(live.guideStep) || session.guideStep || 1,
        guideStepCount: Number(live.guideStepCount) || session.guideStepCount || 1,
      };
    }
    return { ...session };
  }

  function installCleanup() {
    clearHelpUi();
    const target = document.getElementById('appShell') || document.body;
    if (!target || window.__DOKOHILF_DETAIL_HELP_CLEANUP_V29__) return;
    const observer = new MutationObserver(clearHelpUi);
    observer.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-detail-help'] });
    window.__DOKOHILF_DETAIL_HELP_CLEANUP_V29__ = observer;
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    installFetchBridge();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', installCleanup, { once: true });
    } else {
      installCleanup();
    }
    document.addEventListener('click', event => {
      if (event.target.closest?.('#resetButton, #homeButton, [data-select-mode]')) clearSession();
    });
  }

  window.DokoHilfDetailHelpV27 = {
    normalize,
    isProblemSignal,
    inferGuideSlug,
    getState,
    clear: clearSession,
    clearHelpUi,
  };
  window.__DOKOHILF_DETAIL_HELP_V27__ = true;
  window.__DOKOHILF_CONTEXTUAL_HELP_V29__ = true;
})();
