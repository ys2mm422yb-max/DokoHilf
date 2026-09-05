import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const [uxSource, orientationSource] = await Promise.all([
  readFile(new URL('../assets/chat-guide-ux-v70.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/orientation-help-v29.js', import.meta.url), 'utf8'),
]);

function runtime() {
  let backendCalls = 0;
  const window = {
    fetch: async () => {
      backendCalls += 1;
      return new Response(JSON.stringify({ reply: 'BACKEND' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    },
    DokoHilfGuideProgress: {
      getCurrentGuide: () => ({ guideSlug: 'visite-anlegen', guideTitle: 'Visite anlegen', guideStep: 2, guideStepCount: 11 }),
    },
    DokoHilfSmartHelpV29: { preparedBody: parsed => JSON.stringify({ ...parsed, smartHelpIntent: true }) },
    setTimeout,
    clearTimeout,
  };
  const document = {
    readyState: 'loading',
    addEventListener() {},
    getElementById() { return null; },
    querySelectorAll() { return []; },
  };
  const context = vm.createContext({
    window,
    document,
    Request,
    Response,
    Event,
    HTMLElement: class {},
    HTMLTextAreaElement: class {},
    MutationObserver: class {},
    console,
    setTimeout,
    clearTimeout,
  });
  vm.runInContext(orientationSource, context, { filename: 'orientation-help-v29.js' });
  vm.runInContext(uxSource, context, { filename: 'chat-guide-ux-v70.js' });
  return { window, backendCalls: () => backendCalls };
}

test('„Donuts Doku erweitert“ wird nicht als erledigter Schritt gewertet, sondern nutzt bestätigte Orientierung', async () => {
  const { window, backendCalls } = runtime();
  const response = await window.fetch('https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai', {
    method: 'POST',
    body: JSON.stringify({
      guideSlug: 'visite-anlegen',
      guideStep: 2,
      guideStepCount: 11,
      messages: [{ role: 'user', content: 'Donuts Doku erweitert' }],
    }),
  });
  const payload = await response.json();
  assert.match(payload.spokenText, /Doku-Erweitert ist ein Hauptreiter/);
  assert.equal(payload.guideStep, 2);
  assert.equal(payload.completed, false);
  assert.equal(backendCalls(), 0);
});

test('klare Fortschrittsantworten mit Doku-Erweitert bleiben im bestehenden Guide-Routing', async () => {
  for (const text of ['Doku erweitert ist geöffnet', 'Doku erweitert gefunden', 'Ja, Doku erweitert ist da']) {
    const { window, backendCalls } = runtime();
    const response = await window.fetch('https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai', {
      method: 'POST',
      body: JSON.stringify({
        guideSlug: 'visite-anlegen',
        guideStep: 2,
        guideStepCount: 11,
        messages: [{ role: 'user', content: text }],
      }),
    });
    const payload = await response.json();
    assert.equal(payload.reply, 'BACKEND', text);
    assert.equal(backendCalls(), 1, text);
  }
});

test('Schritt-zurück-UI trägt kein altes Fragezeichen-Symbol mehr', () => {
  assert.match(uxSource, /\[data-v54-step-help\]\[data-v70-step-back="true"\]::before\{display:none!important;content:none!important\}/);
});
