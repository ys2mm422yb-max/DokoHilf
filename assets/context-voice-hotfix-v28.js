(() => {
  'use strict';

  const AI_MARKER = '/functions/v1/dokohilf-ai';
  const REPORT_GUIDES = new Set([
    'bericht-neu',
    'bericht-durchstreichen',
    'bericht-folgebericht',
    'berichtssuche',
  ]);
  const REPORT_ENTRY_REPLY = 'Wähle zuerst den gewünschten Bewohner und suche danach in der festen Leiste nach **Berichte**. Siehst du **Berichte**?';
  const REPORT_ENTRY_SPEECH = 'Wähle zuerst den gewünschten Bewohner und suche danach in der festen Leiste nach Berichte. Siehst du Berichte?';
  const STATIC_SPEECH_BY_SOURCE = new Map([
    ['clarification-v14', 'Ich habe dich noch nicht sicher verstanden. Was möchtest du in der Dokumentation öffnen oder erledigen?'],
    ['context-required-clarification-v9', 'Was möchtest du erfassen oder ansehen? Nenne bitte den Bereich, zum Beispiel Vitalwerte oder Berichte.'],
    ['structured-clarification-v9', 'Was möchtest du korrigieren: einen Bericht oder eine Durchführung?'],
    ['speech-recognition-clarification-v9', 'Ich habe „Albert erfassen“ verstanden. Meinst du Vitalwerte erfassen?'],
    ['guide-context-clarification-v9', 'Ich bleibe beim aktuellen Schritt. Ist er erledigt, soll ich ihn wiederholen oder brauchst du Hilfe dabei?'],
    ['guide-cancel-v9', 'Okay, ich stoppe diesen Ablauf. Was möchtest du stattdessen erledigen?'],
    ['ai-dialogue-cancel-v9', 'Okay, ich stoppe diesen Ablauf. Was möchtest du stattdessen erledigen?'],
    ['neutral-unavailable-guide-v9', 'Dafür ist aktuell noch keine bestätigte Schritt-für-Schritt-Anleitung hinterlegt. Beschreibe bitte genauer, welche vorhandene Funktion du nutzen möchtest.'],
  ]);
  const previousFetch = window.fetch.bind(window);

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
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

  function approvedStaticSpokenText(payload) {
    if (!payload || typeof payload !== 'object') return '';
    return STATIC_SPEECH_BY_SOURCE.get(String(payload.source || '').trim()) || '';
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

    const staticSpeech = approvedStaticSpokenText(fixed);
    if (staticSpeech && staticSpeech !== fixed.spokenText) {
      fixed = { ...fixed, spokenText: staticSpeech };
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
    headers.set('X-DokoHilf-Context-Hotfix', 'natural-copy-static-voice-v45-1');
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
      attributeFilter: ['hidden', 'data-detail-help'],
    });
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
    approvedStaticSpokenText,
    reportSpeech: REPORT_ENTRY_SPEECH,
    voiceMode: 'static-supertonic-only',
  };
  window.__DOKOHILF_CONTEXT_VOICE_HOTFIX_V28__ = true;
})();
