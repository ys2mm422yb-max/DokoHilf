import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [uxSource, orientationSource, releaseSource, workerSource, versionRaw] = await Promise.all([
  read('assets/chat-guide-ux-v70.js'),
  read('assets/orientation-help-v29.js'),
  read('assets/release-polish-v29.js'),
  read('service-worker.js'),
  read('version.json'),
]);

const version = JSON.parse(versionRaw);
const AI_URL = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai';

function createRuntime() {
  let backendCalls = 0;
  let guideState = {
    guideSlug: 'visite-anlegen',
    guideTitle: 'Visite anlegen',
    guideStep: 2,
    guideStepCount: 11,
  };

  class FakeHTMLElement {}
  class FakeTextArea extends FakeHTMLElement {
    constructor(value = '') {
      super();
      this.value = value;
      this.selectionStart = value.length;
      this.selectionEnd = value.length;
      this.maxLength = 350;
      this.events = [];
      this.focused = false;
    }
    setSelectionRange(start, end) {
      this.selectionStart = start;
      this.selectionEnd = end;
    }
    dispatchEvent(event) {
      this.events.push(event.type);
      return true;
    }
    focus() { this.focused = true; }
  }

  const document = {
    readyState: 'loading',
    addEventListener() {},
    getElementById() { return null; },
    querySelectorAll() { return []; },
  };

  const window = {
    fetch: async () => {
      backendCalls += 1;
      return new Response(JSON.stringify({ reply: 'BACKEND' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
    DokoHilfGuideProgress: {
      getCurrentGuide: () => guideState ? { ...guideState } : null,
    },
    DokoHilfSmartHelpV29: {
      preparedBody(parsed) {
        return JSON.stringify({ ...parsed, smartHelpIntent: true });
      },
    },
    setTimeout,
    clearTimeout,
  };

  const context = vm.createContext({
    window,
    document,
    Request,
    Response,
    Event,
    HTMLElement: FakeHTMLElement,
    HTMLTextAreaElement: FakeTextArea,
    MutationObserver: class {},
    CustomEvent,
    console,
    setTimeout,
    clearTimeout,
  });

  vm.runInContext(orientationSource, context, { filename: 'orientation-help-v29.js' });
  vm.runInContext(uxSource, context, { filename: 'chat-guide-ux-v70.js' });

  return {
    window,
    FakeTextArea,
    backendCalls: () => backendCalls,
    setGuideState(value) { guideState = value; },
  };
}

test('aktive Visite beantwortet „Wo ist Doku erweitert“ aus bestätigter Orientierung und bleibt auf Schritt 2', async () => {
  const runtime = createRuntime();
  const response = await runtime.window.fetch(AI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guideSlug: 'visite-anlegen',
      guideStep: 2,
      guideStepCount: 11,
      messages: [{ role: 'user', content: 'Wo ist Doku erweitert' }],
    }),
  });
  const payload = await response.json();

  assert.match(payload.reply, /Doku-Erweitert ist ein Hauptreiter in der grünen Hauptleiste ganz oben/);
  assert.equal(payload.guideSlug, 'visite-anlegen');
  assert.equal(payload.guideStep, 2);
  assert.equal(payload.guideStepCount, 11);
  assert.equal(payload.completed, false);
  assert.equal(payload.source, 'confirmed-guide-orientation-v70');
  assert.equal(runtime.backendCalls(), 0, 'bestätigte Ortsfrage darf nicht zuerst zur generischen Schritthilfe gehen');
});

test('normale Schrittantworten werden durch v70 nicht in Orts-Hilfe umgebogen', async () => {
  const runtime = createRuntime();
  const response = await runtime.window.fetch(AI_URL, {
    method: 'POST',
    body: JSON.stringify({
      guideSlug: 'visite-anlegen',
      guideStep: 2,
      guideStepCount: 11,
      messages: [{ role: 'user', content: 'Der Bereich Visiten ist geöffnet' }],
    }),
  });
  const payload = await response.json();
  assert.equal(payload.reply, 'BACKEND');
  assert.equal(runtime.backendCalls(), 1);
});

test('ohne aktiven Guide bleibt eine Ortsfrage im bestehenden Routing', async () => {
  const runtime = createRuntime();
  runtime.setGuideState(null);
  const response = await runtime.window.fetch(AI_URL, {
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Wo ist Doku erweitert' }] }),
  });
  const payload = await response.json();
  assert.equal(payload.reply, 'BACKEND');
  assert.equal(runtime.backendCalls(), 1);
});

test('sichtbare alte Schritthilfe wird zu „Schritt zurück“ und nutzt den bestehenden Zurück-Befehl', () => {
  assert.match(uxSource, /button\.textContent = 'Schritt zurück'/);
  assert.match(uxSource, /api\.sendMessage\('zurück', \{ fromVoice \}\)/);
  assert.match(uxSource, /button\.disabled = step === 1/);
  assert.match(uxSource, /event\.stopImmediatePropagation\(\)/);
  assert.doesNotMatch(uxSource, /Hilfe zum Schritt/);
});

test('Chat-Mikrofon diktiert in das Textfeld, bleibt im Schreibchat und sendet nicht automatisch', () => {
  const runtime = createRuntime();
  const input = new runtime.FakeTextArea('Bitte');
  const result = runtime.window.DokoHilfChatGuideUxV70.insertDictationText(input, 'Doku erweitert öffnen');

  assert.equal(result, 'Bitte Doku erweitert öffnen');
  assert.equal(input.value, 'Bitte Doku erweitert öffnen');
  assert.ok(input.events.includes('input'));
  assert.equal(input.focused, true);
  assert.match(uxSource, /window\.SpeechRecognition \|\| window\.webkitSpeechRecognition/);
  assert.match(uxSource, /recognition\.maxAlternatives = 5/);
  assert.match(uxSource, /wird noch nicht gesendet/);
  assert.doesNotMatch(uxSource, /sendMessage\(transcript|sendMessage\(input\.value/);
  assert.doesNotMatch(uxSource, /speechSynthesis|SpeechSynthesisUtterance|cloud.*tts|elevenlabs/i);
});

test('Diktat zeigt verständliche Fehler statt eines wirkungslosen Mikrofons', () => {
  const runtime = createRuntime();
  const api = runtime.window.DokoHilfChatGuideUxV70;
  assert.match(api.dictationErrorMessage('not-allowed'), /Mikrofonzugriff nicht erlaubt/);
  assert.match(api.dictationErrorMessage('no-speech'), /nichts erkannt/);
  assert.match(api.dictationErrorMessage('audio-capture'), /Mikrofon.*nicht verfügbar/);
  assert.match(api.dictationErrorMessage('network'), /Spracheingabe.*nicht verfügbar/);
});

test('v36/v70 ist versions- und offline-sicher eingebunden', () => {
  assert.equal(version.appVersion, 'v36');
  assert.equal(version.buildId, '20260905-44');
  assert.equal(version.release, 'chat-guide-back-dictation-v70');
  assert.match(releaseSource, /const VERSION_LABEL = 'v36'/);
  assert.match(releaseSource, /CHAT_GUIDE_UX_REVISION = '20260905-chat-guide-back-dictation-v70-1'/);
  assert.match(releaseSource, /assets\/chat-guide-ux-v70\.js/);
  const featureLoader = releaseSource.match(/async function loadV54Features\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
  assert.ok(featureLoader.indexOf('assets/chat-guide-ux-v70.js') > featureLoader.indexOf('assets/step-help-v54.js'));
  assert.match(workerSource, /BUILD_ID = '20260905-44'/);
  assert.match(workerSource, /chat-guide-ux-v70\.js\?v=20260905-chat-guide-back-dictation-v70-1/);
  assert.match(workerSource, /chat-guide-back-dictation-v70/);
});

test('v70 speichert weder Diktat noch Guide-Hilfe dauerhaft im Browser', () => {
  assert.doesNotMatch(uxSource, /localStorage|sessionStorage|indexedDB|document\.cookie/i);
});
