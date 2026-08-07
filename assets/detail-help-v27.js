(() => {
  'use strict';

  const CORE_MARKER = '/functions/v1/dokohilf-ai';
  const HELP_SOURCE = 'detail-help-orientation-v27';

  const GUIDE_META = Object.freeze({
    vitalwerte: { title: 'Vitalwerte öffnen', count: 2, entry: 'Doku-Erweitert', target: 'Vitalwerte', family: 'vitalwerte' },
    'vitalwerte-erfassen': { title: 'Vitalwerte erfassen', count: 3, entry: 'Doku-Erweitert', target: 'Vitalwerte', family: 'vitalwerte' },
    'vitalwerte-einzelwert': { title: 'Einzelnen Vitalwert erfassen', count: 7, entry: 'Doku-Erweitert', target: 'Vitalwerte', family: 'vitalwerte' },
    'vitalwerte-einzelwert-fortsetzen': { title: 'Einzelnen Vitalwert erfassen', count: 4, entry: 'Vitalwerte', target: 'grünes Plus / Neu', family: 'vitalwerte' },
    'vitalwerte-sammelerfassung': { title: 'Mehrere Vitalwerte erfassen', count: 5, entry: 'Doku-Erweitert', target: 'Vitalwerte Sammelerf.', family: 'vitalwerte-batch' },
    'vitalwerte-sammelerfassung-fortsetzen': { title: 'Sammelerfassung öffnen', count: 3, entry: 'Doku-Erweitert', target: 'Vitalwerte Sammelerf.', family: 'vitalwerte-batch' },
    'visite-anlegen': { title: 'Visite beziehungsweise Sprechstunde dokumentieren', count: 11, entry: 'Doku-Erweitert', target: 'Visiten' },
    'visiten-oeffnen': { title: 'Visiten öffnen', count: 2, entry: 'Doku-Erweitert', target: 'Visiten' },
    anwesenheit: { title: 'An- oder Abwesenheit erfassen', count: 8, entry: 'Doku-Erweitert', target: 'An-/Abwesenheiten' },
    'medikation-ansehen': { title: 'Medikation ausschließlich ansehen', count: 3, entry: 'Doku-Erweitert', target: 'Medikation' },
    'formulare-anlegen': { title: 'Formular anlegen', count: 6, entry: 'Doku-Erweitert', target: 'Formulare' },
    uebergabeformular: { title: 'Übergabe über „Was war los?“ anzeigen', count: 5, entry: 'Analyse', target: 'Was war los?' },
    notfallblatt: { title: 'Notfallblatt in Word öffnen', count: 7, entry: 'kleines rotes Kreuz oben links', target: 'Notfallblatt aufrufen' },
    'durchfuehrungsnachweis-oeffnen': { title: 'Durchführungsnachweis öffnen', count: 3, entry: 'Doku', target: 'Durchführungsnachweis' },
    'durchfuehrung-storno': { title: 'Falsch abgezeichnete Durchführung stornieren', count: 7, entry: 'Doku', target: 'Durchführungsnachweis' },
    'bericht-neu': { title: 'Neuen Berichtseintrag erfassen', count: 8, entry: 'Berichte', target: 'grünes Plus' },
    'bericht-durchstreichen': { title: 'Bestehenden Berichtseintrag durchstreichen', count: 7, entry: 'Berichte', target: 'Eintrag bearbeiten' },
    'bericht-folgebericht': { title: 'Folgebericht erstellen', count: 6, entry: 'Berichte', target: 'Folgebericht erstellen' },
    berichtssuche: { title: 'Nach Berichtseinträgen suchen', count: 4, entry: 'Berichte', target: 'Berichtssuche' },
  });

  const HELP_OPTIONS = Object.freeze({
    orientation: [
      ['area-open', 'Doku-Erweitert ist offen', 'Ich sehe den Reiter bereits geöffnet.'],
      ['other-page', 'Ich bin in Doku / einem anderen Reiter', 'Ich sehe gerade eine andere Seite.'],
      ['entry-missing', 'Doku-Erweitert fehlt', 'Der Reiter ist oben nicht sichtbar.'],
      ['lost', 'Ich weiß nicht, wo ich bin', 'Bitte erst gemeinsam orientieren.'],
    ],
    vitalTarget: [
      ['target-found', 'Vitalwerte sehe ich', 'Der Eintrag ist sichtbar.'],
      ['batch-seen', 'Ich sehe nur „Vitalwerte Sammelerf.“', 'Der separate Sammel-Eintrag ist sichtbar.'],
      ['target-missing', '„Vitalwerte“ fehlt', 'Doku-Erweitert ist offen, der Eintrag fehlt aber.'],
      ['lost', 'Ich bin mir nicht sicher', 'Bitte noch einmal genauer orientieren.'],
    ],
    generic: [
      ['target-missing', 'Der Menüpunkt fehlt', 'Die genannte Bezeichnung ist nicht sichtbar.'],
      ['other-page', 'Ich bin auf einer anderen Seite', 'Ein anderer Reiter oder Bereich ist offen.'],
      ['renamed', 'Bei mir heißt es anders', 'Ich sehe eine andere Bezeichnung.'],
      ['lost', 'Ich weiß nicht, wo ich bin', 'Bitte erst gemeinsam orientieren.'],
    ],
    missing: [
      ['retry-entry', 'Einstieg noch einmal prüfen', 'Zum letzten bestätigten Einstieg zurück.'],
      ['human-help', 'Menschliche Hilfe holen', 'Keinen unbestätigten Klickweg ausprobieren.'],
    ],
  });

  const session = {
    active: false,
    guideSlug: null,
    guideStep: 1,
    guideStepCount: 1,
    stage: null,
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

  function isCoreRequest(input) {
    const url = typeof input === 'string' ? input : input?.url;
    return typeof url === 'string' && url.includes(CORE_MARKER) && !url.includes('dokohilf-ai-router');
  }

  function latestMessage(parsed, role) {
    if (!Array.isArray(parsed?.messages)) return '';
    return [...parsed.messages].reverse().find(message => message?.role === role)?.content || '';
  }

  function isProblemSignal(text) {
    const n = normalize(text);
    return /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
      || /\bwo\b.*\b(finde|ist|sind|finde ich|muss ich)\b/.test(n)
      || /\bwo (ist|sind)\b/.test(n)
      || /\b(wo muss ich|was muss ich)\b.*\b(klicken|drucken|druecken|tippen|hingehen)\b/.test(n)
      || /\b(bei mir heisst|bei mir heißt)\b.*\b(anders|nicht so)\b/.test(n)
      || /\b(andere seite|anderer reiter|falsche seite|falscher reiter)\b/.test(n)
      || /\b(komme nicht weiter|ich brauche hilfe|finde das nicht|finde es nicht)\b/.test(n);
  }

  function inferGuideSlug(text, explicitGuideSlug = '') {
    const explicit = String(explicitGuideSlug || '').trim();
    if (explicit && GUIDE_META[explicit]) return explicit;
    const n = normalize(text);
    if (/\b(vitalwert|vitalwerte|blutdruck|puls|temperatur|blutzucker|sauerstoff|spo2)\b/.test(n)) return 'vitalwerte';
    if (/\b(visite|visiten|sprechstunde)\b/.test(n)) return 'visiten-oeffnen';
    if (/\bmedikation\b/.test(n)) return 'medikation-ansehen';
    if (/\bformular|formulare|protokoll)\b/.test(n)) return 'formulare-anlegen';
    if (/\b(anwesenheit|abwesenheit)\b/.test(n)) return 'anwesenheit';
    if (/\bubergabe|uebergabe|was war los\b/.test(n)) return 'uebergabeformular';
    if (/\bnotfallblatt\b/.test(n)) return 'notfallblatt';
    if (/\bdurchfuhrungsnachweis|durchfuehrungsnachweis\b/.test(n)) return 'durchfuehrungsnachweis-oeffnen';
    if (/\bbericht|berichte\b/.test(n)) return 'bericht-neu';
    return explicit || '';
  }

  function options(kind) {
    return (HELP_OPTIONS[kind] || []).map(([value, label, description]) => ({ value, label, description }));
  }

  function guideMeta(slug, parsed = {}) {
    const known = GUIDE_META[slug] || {};
    const suppliedCount = Number(parsed.guideStepCount);
    return {
      title: known.title || String(slug || 'Aktueller Ablauf'),
      count: Number.isInteger(suppliedCount) && suppliedCount > 0 ? suppliedCount : (known.count || 1),
      entry: known.entry || '',
      target: known.target || '',
      family: known.family || '',
    };
  }

  function payloadFor(parsed, slug, reply, config = {}) {
    const meta = guideMeta(slug, parsed);
    const suppliedStep = Number(parsed.guideStep);
    const step = Number.isInteger(config.guideStep)
      ? config.guideStep
      : (Number.isInteger(suppliedStep) && suppliedStep >= 1 ? suppliedStep : session.guideStep || 1);
    const helpMode = config.helpMode !== false;
    return {
      reply,
      spokenText: String(config.spokenText || reply).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim(),
      guideSlug: slug,
      guideTitle: meta.title,
      guideStep: step,
      guideStepCount: meta.count,
      source: HELP_SOURCE,
      helpMode,
      ...(helpMode ? {
        helpTitle: config.helpTitle || 'Was siehst du gerade?',
        helpOptions: config.helpOptions || options('generic'),
      } : {}),
    };
  }

  function response(payload) {
    syncHelpUi(payload);
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-DokoHilf-Detail-Help': 'v27' },
    });
  }

  function startSession(parsed, slug, userText) {
    const meta = guideMeta(slug, parsed);
    const suppliedStep = Number(parsed.guideStep);
    session.active = true;
    session.guideSlug = slug;
    session.guideStep = Number.isInteger(suppliedStep) && suppliedStep >= 1 ? suppliedStep : 1;
    session.guideStepCount = meta.count;
    session.pendingOption = null;

    if (meta.family === 'vitalwerte' || meta.family === 'vitalwerte-batch' || slug === 'vitalwerte') {
      session.stage = 'orientation';
      return payloadFor(parsed, slug,
        'Okay – wir suchen jetzt **nur die richtige Stelle**. Ich markiere noch keinen Schritt als erledigt.\n\nSchau ganz oben in Vivendi in die grüne Reiterleiste und öffne **Doku-Erweitert**. In diesem Reiter liegen **Vitalwerte** und **Vitalwerte Sammelerf.** als zwei getrennte Einträge.\n\nWas siehst du gerade?', {
          guideStep: Math.min(session.guideStep, 1),
          helpTitle: 'Wo bist du gerade?',
          helpOptions: options('orientation'),
        });
    }

    session.stage = 'generic';
    const currentInstruction = String(latestMessage(parsed, 'assistant') || '').split(/\n\s*\n/)[0].trim();
    const entryText = meta.entry ? `Der bestätigte Einstieg für diesen Ablauf ist **${meta.entry}**.` : 'Wir bleiben beim aktuellen bestätigten Schritt.';
    const instructionText = currentInstruction ? `\n\nAktueller Hinweis: **${currentInstruction}**` : '';
    return payloadFor(parsed, slug,
      `Okay – wir bleiben bei diesem Schritt und tun **nicht** so, als wäre er erledigt.\n\n${entryText}${instructionText}\n\nWas genau ist das Problem?`, {
        helpTitle: 'Was trifft bei dir zu?',
        helpOptions: options('generic'),
      });
  }

  function vitalAreaOpen(parsed) {
    session.stage = 'vital-target';
    session.guideStep = Math.max(1, Math.min(2, session.guideStepCount));
    return payloadFor(parsed, session.guideSlug,
      'Gut. Bleib in **Doku-Erweitert**. Suche dort in der Symbolleiste nach **Vitalwerte**. **Vitalwerte Sammelerf.** ist ein eigener, getrennter Eintrag für mehrere Werte. Für einen einzelnen Vitalwert brauchst du **Vitalwerte**.\n\nSiehst du den Eintrag **Vitalwerte**?', {
        guideStep: session.guideStep,
        helpTitle: 'Was ist in Doku-Erweitert sichtbar?',
        helpOptions: options('vitalTarget'),
      });
  }

  function safeMissing(parsed, specific = '') {
    session.stage = 'missing';
    const meta = guideMeta(session.guideSlug, parsed);
    const target = specific || meta.target || 'der genannte Menüpunkt';
    const entry = meta.entry ? ` Prüfe nur noch einmal, ob **${meta.entry}** wirklich geöffnet beziehungsweise sichtbar ist.` : '';
    return payloadFor(parsed, session.guideSlug,
      `Dann gehen wir **nicht weiter**. Wenn **${target}** an der bestätigten Stelle wirklich fehlt, habe ich dafür keinen bestätigten Alternativ-Klickweg.${entry}\n\nBitte nichts raten oder irgendeinen ähnlich klingenden Menüpunkt ausprobieren. Wenn der Eintrag weiter fehlt, ist hier menschliche Unterstützung der sichere nächste Schritt.`, {
        helpTitle: 'Wie möchtest du weiter vorgehen?',
        helpOptions: options('missing'),
      });
  }

  function orientToEntry(parsed) {
    const meta = guideMeta(session.guideSlug, parsed);
    session.stage = meta.family?.startsWith('vitalwerte') || session.guideSlug === 'vitalwerte' ? 'orientation' : 'generic';
    const entry = meta.entry || 'den zuletzt bestätigten Einstieg';
    return payloadFor(parsed, session.guideSlug,
      `Okay. Orientiere dich zuerst nur am bestätigten Einstieg **${entry}**. Öffne beziehungsweise suche genau diese Bezeichnung und bleib dort.\n\nWenn du **${entry}** gefunden hast, sag mir, was du dort siehst. Ich führe dich dann erst zum nächsten bestätigten Klick weiter.`, {
        helpTitle: 'Hast du den bestätigten Einstieg gefunden?',
        helpOptions: meta.family?.startsWith('vitalwerte') || session.guideSlug === 'vitalwerte'
          ? options('orientation')
          : options('generic'),
      });
  }

  function finishVitalTarget(parsed) {
    session.active = false;
    session.stage = null;
    session.pendingOption = null;
    const step = Math.max(2, session.guideStep);
    const payload = payloadFor(parsed, session.guideSlug,
      'Perfekt. **Vitalwerte** ist gefunden. Öffne den Bereich jetzt. Sobald die Vitalwerte-Ansicht offen ist, kannst du mit **Weiter** fortfahren. Erst dann geht DokoHilf zum nächsten Schritt.', {
        guideStep: step,
        helpMode: false,
      });
    session.guideStep = step;
    return payload;
  }

  function handleOption(parsed, value) {
    const meta = guideMeta(session.guideSlug, parsed);
    if (value === 'area-open') return vitalAreaOpen(parsed);
    if (value === 'target-found') return finishVitalTarget(parsed);
    if (value === 'batch-seen') {
      session.stage = 'vital-target';
      return payloadFor(parsed, session.guideSlug,
        'Das hilft bei der Orientierung: **Vitalwerte Sammelerf.** ist tatsächlich ein eigener Eintrag. Für die normale Einzel-Erfassung suchst du zusätzlich nach **Vitalwerte**. Wenn **Vitalwerte** daneben beziehungsweise in derselben geöffneten Doku-Erweitert-Symbolleiste nicht vorhanden ist, gehe nicht auf Verdacht weiter.', {
          helpTitle: 'Siehst du zusätzlich „Vitalwerte“?',
          helpOptions: options('vitalTarget'),
        });
    }
    if (value === 'target-missing') return safeMissing(parsed, meta.target || 'Vitalwerte');
    if (value === 'entry-missing') return safeMissing(parsed, meta.entry || 'Doku-Erweitert');
    if (value === 'other-page' || value === 'lost' || value === 'retry-entry') return orientToEntry(parsed);
    if (value === 'renamed') {
      session.stage = 'renamed';
      return payloadFor(parsed, session.guideSlug,
        `Dann rate ich die Bezeichnung nicht. Der bestätigte Name an dieser Stelle ist **${meta.target || meta.entry || 'die Bezeichnung aus dem aktuellen Schritt'}**.\n\nWenn bei dir etwas anders heißt, schreib mir **nur die sichtbare Menübezeichnung** – keine Namen, Berichte oder Falldaten. Ist diese Variante noch nicht bestätigt, sage ich dir das ausdrücklich, statt einen neuen Klickweg zu erfinden.`, {
          helpTitle: 'Was möchtest du tun?',
          helpOptions: options('missing'),
        });
    }
    if (value === 'human-help') {
      session.active = false;
      session.stage = null;
      return payloadFor(parsed, session.guideSlug,
        'Das ist hier die sichere Entscheidung. Für diesen abweichenden Bildschirm liegt DokoHilf kein bestätigter Klickweg vor. Bitte lass dir die Stelle kurz von einer Kollegin, einem Kollegen oder einer zuständigen Ansprechperson zeigen. Der aktuelle Guide-Schritt bleibt dabei unverändert.', {
          helpMode: false,
        });
    }
    return orientToEntry(parsed);
  }

  function inferOptionFromText(text) {
    const n = normalize(text);
    if (/\b(doku erweitert|doku-erweitert)\b.*\b(offen|geoffnet|bin drin|sehe ich)\b/.test(n) || /^(doku erweitert|doku-erweitert)$/.test(n)) return 'area-open';
    if (/\bvitalwerte\b.*\b(sehe|gefunden|da|sichtbar)\b/.test(n) || /\bgefunden\b/.test(n) && session.stage === 'vital-target') return 'target-found';
    if (/\b(sammelerf|sammelerfassung)\b/.test(n) && /\b(nur|sehe|sichtbar)\b/.test(n)) return 'batch-seen';
    if (/\b(vitalwerte|menupunkt|eintrag)\b.*\b(fehlt|nicht da|nicht sichtbar|sehe.*nicht|finde.*nicht)\b/.test(n)) return 'target-missing';
    if (/\bdoku erweitert\b.*\b(fehlt|nicht da|nicht sichtbar|sehe.*nicht|finde.*nicht)\b/.test(n)) return 'entry-missing';
    if (/\b(andere seite|anderer reiter|in doku|falsche seite|falscher reiter)\b/.test(n)) return 'other-page';
    if (/\b(weiss nicht|weis nicht|keine ahnung wo|wo bin ich|verlaufen)\b/.test(n)) return 'lost';
    if (/\b(heisst anders|heißt anders|andere bezeichnung)\b/.test(n)) return 'renamed';
    if (/\b(menschliche hilfe|kollege|kollegin|ansprechperson)\b/.test(n)) return 'human-help';
    return '';
  }

  function handleSession(parsed, userText) {
    const option = session.pendingOption || inferOptionFromText(userText);
    session.pendingOption = null;
    if (option) return handleOption(parsed, option);

    const n = normalize(userText);
    if (/^(abbrechen|stop|stopp|hauptmenu|hauptmenü|neuer ablauf)$/.test(n)) {
      session.active = false;
      session.stage = null;
      clearHelpUi();
      return null;
    }

    if (session.stage === 'renamed') {
      const meta = guideMeta(session.guideSlug, parsed);
      const expected = normalize(meta.target || meta.entry);
      if (expected && normalize(userText).includes(expected)) return orientToEntry(parsed);
      return payloadFor(parsed, session.guideSlug,
        `Diese abweichende Bezeichnung ist für DokoHilf noch nicht als sicherer Klickweg bestätigt. Ich ändere den Ablauf deshalb nicht. Nutze den bestätigten Einstieg **${meta.entry || 'aus dem aktuellen Schritt'}** oder hole kurz menschliche Unterstützung.`, {
          helpTitle: 'Sicher weitergehen',
          helpOptions: options('missing'),
        });
    }

    return payloadFor(parsed, session.guideSlug,
      'Ich möchte dich hier nicht versehentlich weiterführen. Sag mir bitte zuerst, **was du auf dem Bildschirm siehst**. Wähle eine der Möglichkeiten unten oder beschreibe nur den sichtbaren Reiter beziehungsweise Menüpunkt.', {
        helpTitle: session.stage === 'vital-target' ? 'Was ist in Doku-Erweitert sichtbar?' : 'Was trifft bei dir zu?',
        helpOptions: session.stage === 'vital-target' ? options('vitalTarget') : (session.stage === 'orientation' ? options('orientation') : options('generic')),
      });
  }

  function parseRequestBody(body) {
    if (typeof body !== 'string') return null;
    try { return JSON.parse(body); } catch { return null; }
  }

  function installFetchHelp() {
    if (window.__DOKOHILF_DETAIL_HELP_FETCH_V27__) return;
    const previousFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      if (!isCoreRequest(input)) return previousFetch(input, init);
      const parsed = parseRequestBody(init.body);
      if (!parsed) return previousFetch(input, init);
      const userText = String(latestMessage(parsed, 'user') || '').trim();

      if (session.active) {
        const handled = handleSession(parsed, userText);
        if (handled) return response(handled);
      }

      if (isProblemSignal(userText)) {
        const slug = inferGuideSlug(userText, parsed.guideSlug);
        if (slug && GUIDE_META[slug]) return response(startSession(parsed, slug, userText));
      }

      const networkResponse = await previousFetch(input, init);
      networkResponse.clone().json()
        .then(payload => {
          if (payload?.helpMode === true) syncHelpUi(payload);
          else if (!session.active) clearHelpUi();
        })
        .catch(() => {});
      return networkResponse;
    };
    window.__DOKOHILF_DETAIL_HELP_FETCH_V27__ = true;
  }

  function installStyles() {
    if (document.getElementById('detailHelpStylesV27')) return;
    const style = document.createElement('style');
    style.id = 'detailHelpStylesV27';
    style.textContent = `
      .detail-help-options{display:grid;gap:10px;margin:12px 0 8px;padding:13px;border:1px solid rgba(112,240,170,.16);border-radius:19px;background:linear-gradient(145deg,rgba(8,31,37,.97),rgba(4,19,26,.97));box-shadow:0 16px 40px rgba(0,0,0,.22)}
      .detail-help-options[hidden],.voice-detail-help-options[hidden]{display:none!important}
      .detail-help-options>strong,.voice-detail-help-options>strong{color:#dff7ed;font-size:13px;line-height:1.35}
      .detail-help-list{display:grid;grid-template-columns:1fr 1fr;gap:9px}
      .detail-help-option{min-height:58px;padding:10px 12px;border:1px solid rgba(112,240,170,.18);border-radius:15px;background:rgba(255,255,255,.035);color:#eef9f5;font:inherit;text-align:left;touch-action:manipulation}
      .detail-help-option span{display:block;font-size:13px;font-weight:850;line-height:1.25}
      .detail-help-option small{display:block;margin-top:4px;color:#86a29a;font-size:11px;font-weight:650;line-height:1.3}
      .detail-help-option:active{transform:scale(.985)}
      .detail-help-option:focus-visible{outline:2px solid #70f0aa;outline-offset:2px}
      .app-shell[data-detail-help="true"] #commandRow{display:none!important}
      .voice-detail-help-options{width:min(680px,100%);display:grid;gap:8px;padding:10px;border:1px solid rgba(112,240,170,.16);border-radius:18px;background:rgba(4,20,27,.96)}
      .voice-detail-help-options .detail-help-list{grid-template-columns:1fr 1fr}
      @media(max-width:680px){.detail-help-list,.voice-detail-help-options .detail-help-list{grid-template-columns:1fr}.detail-help-option{min-height:52px}.detail-help-options{padding:10px;border-radius:17px}.voice-detail-help-options small{display:none}}
      @media(max-height:720px){.voice-detail-help-options .detail-help-option{min-height:44px;padding:8px 10px}.voice-detail-help-options>strong{font-size:11px}}
    `;
    document.head.append(style);
  }

  function ensureChatPanel() {
    let panel = document.getElementById('detailHelpOptionsV27');
    if (panel) return panel;
    panel = document.createElement('section');
    panel.id = 'detailHelpOptionsV27';
    panel.className = 'detail-help-options';
    panel.hidden = true;
    panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = '<strong>Was siehst du gerade?</strong><div class="detail-help-list"></div>';
    const commandRow = document.getElementById('commandRow');
    if (commandRow?.parentElement) commandRow.parentElement.insertBefore(panel, commandRow);
    return panel;
  }

  function ensureVoicePanel() {
    let panel = document.getElementById('voiceDetailHelpOptionsV27');
    if (panel) return panel;
    const main = document.querySelector('.voice-focus-main');
    if (!main) return null;
    panel = document.createElement('section');
    panel.id = 'voiceDetailHelpOptionsV27';
    panel.className = 'voice-detail-help-options';
    panel.hidden = true;
    panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = '<strong>Was siehst du gerade?</strong><div class="detail-help-list"></div>';
    const instruction = main.querySelector('.voice-focus-instruction');
    instruction?.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function fillPanel(panel, payload) {
    if (!panel) return;
    const heading = panel.querySelector(':scope > strong');
    const list = panel.querySelector('.detail-help-list');
    if (!list) return;
    if (heading) heading.textContent = String(payload.helpTitle || 'Was siehst du gerade?').slice(0, 100);
    list.innerHTML = '';
    for (const option of Array.isArray(payload.helpOptions) ? payload.helpOptions.slice(0, 4) : []) {
      const value = String(option?.value || '').trim();
      const label = String(option?.label || '').trim();
      if (!value || !label) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'detail-help-option';
      button.dataset.detailHelpValue = value;
      button.dataset.detailHelpLabel = label;
      const span = document.createElement('span');
      span.textContent = label;
      button.append(span);
      const description = String(option?.description || '').trim();
      if (description) {
        const small = document.createElement('small');
        small.textContent = description;
        button.append(small);
      }
      list.append(button);
    }
    panel.hidden = list.childElementCount === 0;
  }

  function syncHelpUi(payload) {
    if (typeof document === 'undefined') return;
    installStyles();
    const shell = document.getElementById('appShell');
    if (payload?.helpMode !== true) return clearHelpUi();
    if (shell) shell.dataset.detailHelp = 'true';
    const chat = ensureChatPanel();
    const voice = ensureVoicePanel();
    fillPanel(chat, payload);
    fillPanel(voice, payload);
    if (shell?.dataset.mode !== 'voice') chat?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearHelpUi() {
    if (typeof document === 'undefined') return;
    document.getElementById('appShell')?.removeAttribute('data-detail-help');
    for (const id of ['detailHelpOptionsV27', 'voiceDetailHelpOptionsV27']) {
      const panel = document.getElementById(id);
      if (!panel) continue;
      panel.hidden = true;
      const list = panel.querySelector('.detail-help-list');
      if (list) list.innerHTML = '';
    }
  }

  function installClicks() {
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-detail-help-value]');
      if (!button) return;
      const value = button.dataset.detailHelpValue;
      const label = button.dataset.detailHelpLabel;
      if (!value || !label || !window.DokoHilf?.sendMessage) return;
      event.preventDefault();
      session.pendingOption = value;
      window.DokoHilf.sendMessage(label, {
        fromVoice: document.getElementById('appShell')?.dataset.mode === 'voice',
      });
    });

    document.addEventListener('click', event => {
      if (!event.target.closest('#resetButton, #homeButton, [data-select-mode]')) return;
      session.active = false;
      session.stage = null;
      session.pendingOption = null;
      clearHelpUi();
    });
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    installStyles();
    installFetchHelp();
    installClicks();
    document.addEventListener('DOMContentLoaded', () => {
      ensureChatPanel();
      ensureVoicePanel();
    }, { once: true });
  }

  window.DokoHilfDetailHelpV27 = {
    normalize,
    isProblemSignal,
    inferGuideSlug,
    getState: () => ({ ...session }),
    clear: () => {
      session.active = false;
      session.stage = null;
      session.pendingOption = null;
      clearHelpUi();
    },
  };
  window.__DOKOHILF_DETAIL_HELP_V27__ = true;
})();
