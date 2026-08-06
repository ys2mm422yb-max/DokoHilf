(() => {
  'use strict';

  const BUILD_ID = '20260806-27';
  const TTS_ENDPOINT_MARKER = '/functions/v1/dokohilf-tts';
  const TTS_VISIBLE_WAIT_MS = 2400;
  const previousFetch = window.fetch.bind(window);
  let fallbackTimer = null;

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function ttsUrl(input) {
    return typeof input === 'string' ? input : input?.url;
  }

  function isTtsPost(input, init) {
    const url = ttsUrl(input);
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return typeof url === 'string' && url.includes(TTS_ENDPOINT_MARKER) && method === 'POST';
  }

  function setFallbackStatus(reason = 'timeout') {
    const shell = document.getElementById('appShell');
    const status = document.getElementById('voiceStatus');
    const hint = document.getElementById('voiceHint');
    if (!shell || !status || !hint) return;

    shell.dataset.voiceEngine = 'device';
    if (shell.dataset.voiceState === 'thinking') shell.dataset.voiceState = 'fallback';
    status.textContent = 'Gerätestimme wird verwendet';
    hint.textContent = reason === 'timeout'
      ? 'Die natürliche Stimme braucht zu lange. DokoHilf spricht sofort mit der Gerätestimme weiter.'
      : 'Die natürliche Stimme ist gerade nicht erreichbar. DokoHilf spricht mit der Gerätestimme weiter.';
  }

  function syntheticTimeoutResponse() {
    return new Response(JSON.stringify({
      error: 'Die natürliche Stimme braucht zu lange. Gerätestimme wird verwendet.',
      fallback: 'device',
    }), {
      status: 504,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-DokoHilf-TTS-Fallback': 'device-timeout',
      },
    });
  }

  window.fetch = async (input, init = {}) => {
    if (!isTtsPost(input, init)) return previousFetch(input, init);

    let timerId;
    const timeout = new Promise(resolve => {
      timerId = window.setTimeout(() => {
        setFallbackStatus('timeout');
        resolve(syntheticTimeoutResponse());
      }, TTS_VISIBLE_WAIT_MS);
    });

    try {
      const response = await Promise.race([
        previousFetch(input, init),
        timeout,
      ]);
      window.clearTimeout(timerId);
      if (response && !response.ok) setFallbackStatus('unavailable');
      return response;
    } catch (error) {
      window.clearTimeout(timerId);
      setFallbackStatus('unavailable');
      throw error;
    }
  };

  function monitorVoiceLoading() {
    const shell = document.getElementById('appShell');
    const status = document.getElementById('voiceStatus');
    if (!shell || !status) return;

    const update = () => {
      const text = clean(status.textContent).toLowerCase();
      const thinking = shell.dataset.voiceState === 'thinking' || text === 'stimme lädt';
      if (!thinking) {
        window.clearTimeout(fallbackTimer);
        fallbackTimer = null;
        return;
      }
      if (fallbackTimer) return;
      fallbackTimer = window.setTimeout(() => {
        fallbackTimer = null;
        const stillLoading = shell.dataset.voiceState === 'thinking'
          || clean(status.textContent).toLowerCase() === 'stimme lädt';
        if (stillLoading) setFallbackStatus('timeout');
      }, TTS_VISIBLE_WAIT_MS + 250);
    };

    new MutationObserver(update).observe(status, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    new MutationObserver(update).observe(shell, {
      attributes: true,
      attributeFilter: ['data-voice-state'],
    });
    update();
  }

  function makePrompt(label, prompt, extra = {}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.dataset.prompt = prompt;
    for (const [key, value] of Object.entries(extra)) button.dataset[key] = value;
    return button;
  }

  function upgradeFrequentFlows() {
    const examples = document.querySelector('.examples');
    if (!examples || examples.dataset.v27Ready === 'true') return;
    examples.dataset.v27Ready = 'true';

    const title = document.createElement('span');
    title.textContent = 'Häufige Abläufe';

    const buttons = [
      makePrompt('Bericht anlegen', 'Ich möchte einen Bericht anlegen'),
      makePrompt('Visite anlegen', 'Wie lege ich eine Visite an?'),
      makePrompt('Vitalwerte erfassen', 'Ich möchte Vitalwerte eingeben'),
      makePrompt('An-/Abwesenheit', 'Ich möchte eine An- oder Abwesenheit erfassen'),
      makePrompt('Medikation ansehen', 'Wie kann ich die Medikation ansehen?'),
      makePrompt('Formular erstellen', 'Ich möchte ein Formular anlegen'),
      makePrompt('Alle Abläufe anzeigen', 'Welche bestätigten Abläufe kannst du mir zeigen?', { allGuides: 'true' }),
    ];

    examples.replaceChildren(title, ...buttons);
  }

  function polishBrand() {
    const small = document.querySelector('.brand small');
    if (small) small.textContent = 'Deine unabhängige Bedienungshilfe';
    document.documentElement.dataset.dokohilfTheme = 'dark-v27';
    document.documentElement.style.colorScheme = 'dark';
  }

  function initialize() {
    polishBrand();
    upgradeFrequentFlows();
    monitorVoiceLoading();
  }

  initialize();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  }
  window.addEventListener('pageshow', initialize);

  window.DokoHilfExperienceV27 = {
    buildId: BUILD_ID,
    visibleTtsWaitMs: TTS_VISIBLE_WAIT_MS,
    setFallbackStatus,
  };
  window.__DOKOHILF_DARK_UI_V27__ = true;
  window.__DOKOHILF_VOICE_RECOVERY_V27__ = true;
})();
