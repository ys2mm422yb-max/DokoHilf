(() => {
  'use strict';

  const AI_MARKER = '/functions/v1/dokohilf-ai';
  const REPORT_GUIDES = new Set([
    'bericht-neu',
    'bericht-durchstreichen',
    'bericht-folgebericht',
    'berichtssuche',
  ]);
  const REPORT_ENTRY_REPLY = 'Wähle zuerst den gewünschten Bewohner. Öffne oben in der festen grünen Hauptleiste **Doku** und wähle im weißen Funktionsband direkt darunter **Bericht**. Ist der Bereich **Berichte** geöffnet?';
  const REPORT_ENTRY_SPEECH = 'Öffne oben in der festen grünen Hauptleiste Doku und wähle im weißen Funktionsband direkt darunter Bericht. Ist der Bereich Berichte geöffnet?';
  const VOICE_PROGRESS_REVISION = '20260902-voice-chat-parity-v66-1';
  const previousFetch = window.fetch.bind(window);

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function naturalizeUserCopy(value) {
    if (typeof value !== 'string') return value;
    return value
      .replace(
        'Fülle das Formular nach der bei euch gültigen fachlichen Vorgabe aus. DokoHilf erfindet für noch nicht bestätigte Formularfelder keine Angaben.',
        'Fülle das geöffnete Formular wie gewohnt aus.',
      )
      .replace(
        'Das geöffnete Formular nach der bei euch gültigen fachlichen Vorgabe bearbeiten. Nicht bestätigte Formularfelder werden von DokoHilf nicht erfunden.',
        'Das geöffnete Formular wie gewohnt ausfüllen.',
      )
      .replace(
        'Die Auswahl des Formulars ist bestätigt. Für nicht bestätigte Felder oder fachliche Inhalte wird kein Klickweg erfunden.',
        'Wenn du bei einem Feld unsicher bist, kläre die fachliche Angabe bitte im Team.',
      )
      .replace(
        'DokoHilf darf bei diesem Ablauf nicht zu Änderungen an der Medikation anleiten.',
        'Hier geht es nur um das Ansehen der Medikation. Änderungen klärst du bitte über den dafür vorgesehenen Weg.',
      )
      .replace(
        'Bleibe in den geöffneten Stammdaten und suche in der grauen Leiste nach „Dateiablage“. Einen anderen Klickweg erfindet DokoHilf nicht.',
        'Bleibe in den geöffneten Stammdaten. Suche in der grauen Leiste nach „Dateiablage“.',
      )
      .replace(
        'Bleibe in „Dateiablage“. Der bestätigte Bereich heißt „Dokumente“ und erscheint unten mittig.',
        'Bleibe in „Dateiablage“. Der Bereich „Dokumente“ erscheint unten mittig.',
      )
      .replace(
        'DokoHilf kann nicht garantieren, dass ein bestimmtes Dokument hinterlegt ist. Suche nur nach bereits vorhandenen Dokumenten; nichts hochladen, löschen, umbenennen oder verändern.',
        'Bleibe in der Dateiablage. Wenn das gewünschte Dokument nicht angezeigt wird, frag bitte kurz im Team, ob und wo es abgelegt ist.',
      )
      .replace(
        'Suche nur nach einem bereits vorhandenen Dokument. Wenn das gewünschte Dokument nicht angezeigt wird, ist nicht bestätigt, dass es dort hinterlegt ist.',
        'Bleibe in der Dateiablage. Wenn das gewünschte Dokument nicht angezeigt wird, frag bitte kurz im Team, ob und wo es abgelegt ist.',
      )
      .replace(
        'Warte kurz auf Word und starte den Doppelklick nicht mehrfach. DokoHilf hilft hier nur beim Öffnen vorhandener Dokumente.',
        'Warte kurz, bis sich Word öffnet, und führe den Doppelklick nicht mehrfach aus.',
      )
      .replace(
        'Du legst die Wirksamkeitskontrolle nicht selbst an. DokoHilf nennt keine erfundene Wartezeit.',
        'Du legst die Wirksamkeitskontrolle nicht selbst an. Eine konkrete Wartezeit ist hier nicht festgelegt.',
      )
      .replace(
        'Die Wirksamkeitskontrolle erscheint erst zum vorgesehenen Zeitpunkt im Durchführungsnachweis. DokoHilf nennt keine erfundene Wartezeit.',
        'Die Wirksamkeitskontrolle erscheint erst zum vorgesehenen Zeitpunkt im Durchführungsnachweis. Eine konkrete Wartezeit ist hier nicht festgelegt.',
      )
      .replace('Dafür habe ich keinen bestätigten Weg.', 'Dazu habe ich keine passende Anleitung.')
      .replace('Hast du den bestätigten Einstieg gefunden?', 'Hast du den Einstieg gefunden?')
      .replace(
        'Wenn die Bezeichnung bei dir abweicht, nenne mir nur die sichtbaren Menü- oder Buttonbezeichnungen; ich erfinde keinen alternativen Klickweg.',
        'Wenn die Bezeichnung bei dir anders ist, sag mir einfach, welche Menü- oder Buttonbezeichnungen du siehst.',
      )
      .replace(/\s*Im öffentlichen Test ausschließlich Fantasiedaten verwenden\.?/gi, '')
      .replace(/\s*Im öffentlichen Test nur vollständig erfundene Personen verwenden\.?/gi, '')
      .replace(/\s*In Übungen nur Fantasiewerte verwenden\.?/gi, '')
      .replace(/Werden die gesuchten Fantasie-Einträge angezeigt\?/gi, 'Werden die gesuchten Einträge angezeigt?')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  function isAiRequest(input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return typeof url === 'string' && url.includes(AI_MARKER) && method === 'POST';
  }

  function isReportGuide(slug) {
    return REPORT_GUIDES.has(String(slug || '').trim());
  }

  function isVitalGuide(slug) {
    return String(slug || '').startsWith('vitalwerte');
  }

  function currentGuideSlug() {
    return window.DokoHilfDetailHelpV27?.getState?.().guideSlug
      || window.DokoHilfGuideProgress?.getCurrentGuide?.()?.guideSlug
      || '';
  }

  function contextualOptionLabel(value, slug, fallback = '') {
    if (value !== 'target-missing') return fallback;
    return isVitalGuide(slug) ? 'Vitalwerte fehlt' : 'Der Menüpunkt fehlt';
  }

  function fixHelpOptions(options, slug) {
    if (!Array.isArray(options)) return options;
    return options.map(option => {
      if (!option || typeof option !== 'object') return option;
      const value = String(option.value || '');
      const label = contextualOptionLabel(value, slug, String(option.label || ''));
      return label && label !== option.label ? { ...option, label } : option;
    });
  }

  function fixPayload(payload) {
    if (!payload || typeof payload !== 'object') return payload;
    const slug = String(payload.guideSlug || currentGuideSlug() || '');
    let fixed = payload;

    if (payload.helpMode === true && Array.isArray(payload.helpOptions)) {
      fixed = { ...fixed, helpOptions: fixHelpOptions(payload.helpOptions, slug) };
    }

    if (isReportGuide(slug) && payload.helpMode === true) {
      const title = String(payload.helpTitle || '');
      const reply = String(payload.reply || '');
      const asksForEntry = title === 'Was trifft bei dir zu?'
        || title === 'Hast du den bestätigten Einstieg gefunden?'
        || title === 'Hast du den Einstieg gefunden?'
        || /suche zuerst\s+\*\*?berichte/i.test(reply)
        || /was siehst du gerade/i.test(reply);
      if (asksForEntry) {
        fixed = {
          ...fixed,
          reply: REPORT_ENTRY_REPLY,
          spokenText: REPORT_ENTRY_SPEECH,
          guideSlug: slug,
        };
      }
    }

    const naturalReply = naturalizeUserCopy(fixed.reply);
    const naturalSpeech = naturalizeUserCopy(fixed.spokenText);
    const naturalTitle = naturalizeUserCopy(fixed.helpTitle);
    if (naturalReply !== fixed.reply || naturalSpeech !== fixed.spokenText || naturalTitle !== fixed.helpTitle) {
      fixed = {
        ...fixed,
        ...(typeof naturalReply === 'string' ? { reply: naturalReply } : {}),
        ...(typeof naturalSpeech === 'string' ? { spokenText: naturalSpeech } : {}),
        ...(typeof naturalTitle === 'string' ? { helpTitle: naturalTitle } : {}),
      };
    }

    return fixed;
  }

  async function rewriteAiResponse(response) {
    if (!response?.ok) return response;
    const payload = await response.clone().json().catch(() => null);
    if (!payload || typeof payload !== 'object') return response;
    const fixed = fixPayload(payload);
    if (fixed === payload) return response;
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('X-DokoHilf-Context-Hotfix', 'voice-chat-parity-v66-1');
    return new Response(JSON.stringify(fixed), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  window.fetch = async (input, init = {}) => {
    const response = await previousFetch(input, init);
    return isAiRequest(input, init) ? rewriteAiResponse(response) : response;
  };

  function syncVoiceProgress() {
    const track = document.querySelector('#voiceFocusStage .v42-voice-progress');
    const fill = track?.querySelector('i');
    if (!track || !fill) return;
    let guide = null;
    try { guide = window.DokoHilfGuideProgress?.getCurrentGuide?.() || null; } catch { guide = null; }
    const step = Number(guide?.guideStep || 0);
    const count = Number(guide?.guideStepCount || 0);
    const active = Number.isFinite(step) && Number.isFinite(count) && step > 0 && count > 0;
    const finalStep = active && step >= count;
    const progress = active
      ? (finalStep ? 100 : Math.min(100, Math.max(0, (step / count) * 100)))
      : 0;
    track.style.setProperty('--v42-progress', `${progress}%`);
    if (finalStep) {
      fill.style.setProperty('transition', 'none', 'important');
      try {
        for (const animation of fill.getAnimations?.() || []) animation.cancel();
      } catch {}
      void fill.offsetWidth;
      fill.style.setProperty('width', '100%', 'important');
    } else {
      fill.style.removeProperty('transition');
      fill.style.setProperty('width', `${progress}%`, 'important');
    }
    track.dataset.v48Progress = active ? `${step}/${count}:${progress}` : 'empty';
    track.dataset.v48Final = finalStep ? 'true' : 'false';
  }

  function syncRenderedLabels() {
    const slug = currentGuideSlug();
    for (const panel of [
      document.getElementById('detailHelpOptionsV27'),
      document.getElementById('voiceDetailHelpOptionsV27'),
    ]) {
      if (!panel || panel.hidden) continue;
      for (const button of panel.querySelectorAll('[data-detail-help-value]')) {
        const value = String(button.dataset.detailHelpValue || '');
        const label = contextualOptionLabel(value, slug, String(button.dataset.detailHelpLabel || ''));
        if (!label) continue;
        const span = button.querySelector('span');
        if (span && span.textContent !== label) span.textContent = label;
        if (button.dataset.detailHelpLabel !== label) button.dataset.detailHelpLabel = label;
      }
    }
    syncVoiceProgress();
  }

  function installRenderSync() {
    const target = document.getElementById('appShell') || document.body;
    if (!target || window.__DOKOHILF_CONTEXT_VOICE_HOTFIX_OBSERVER__) return;
    syncRenderedLabels();
    const observer = new MutationObserver(syncRenderedLabels);
    observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden', 'data-detail-help', 'data-mode', 'data-voice-state'],
    });
    window.addEventListener('dokohilf:guide-state', syncVoiceProgress);
    window.addEventListener('pageshow', syncVoiceProgress);
    window.__DOKOHILF_CONTEXT_VOICE_HOTFIX_OBSERVER__ = observer;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installRenderSync, { once: true });
  } else {
    installRenderSync();
  }

  window.DokoHilfContextVoiceHotfixV28 = {
    fixPayload,
    fixHelpOptions,
    contextualOptionLabel,
    naturalizeUserCopy,
    syncVoiceProgress,
    reportSpeech: REPORT_ENTRY_SPEECH,
    voiceMode: 'static-supertonic-only',
    voiceProgressRevision: VOICE_PROGRESS_REVISION,
  };
  window.__DOKOHILF_CONTEXT_VOICE_HOTFIX_V28__ = true;
})();
