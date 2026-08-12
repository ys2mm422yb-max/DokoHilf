import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../assets/local-voice-gate-v28.js', import.meta.url), 'utf8');
const GREETING = 'Hey! Wobei brauchst du Hilfe?';
const REPLY = `${GREETING}\n\nBitte nenne dein Ziel.`;
const FALLBACK = 'Ich habe die Antwort im Chat angezeigt.';

class FakeRequest {
  constructor(url, init = {}) {
    this.url = String(url);
    this.method = String(init.method || 'GET').toUpperCase();
  }
}

function runtime() {
  const audioHits = [];
  let manifestRequests = 0;

  const networkFetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || String(input || '');
    if (url.includes('/functions/v1/dokohilf-ai')) {
      return new Response(JSON.stringify({ reply: REPLY, spokenText: FALLBACK }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url.includes('assets/guide-audio-catalog.json')) {
      manifestRequests += 1;
      return new Response(JSON.stringify({
        entries: [
          { file: 'assets/audio/guides/000.wav', text: GREETING },
          { file: 'assets/audio/guides/001.wav', text: FALLBACK },
        ],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (url.includes('/assets/audio/guides/')) {
      audioHits.push(url);
      return new Response(new Uint8Array([1, 2, 3, 4]), {
        status: 200,
        headers: { 'Content-Type': 'audio/wav' },
      });
    }
    throw new Error(`unexpected_fetch:${url}`);
  };

  const document = {
    baseURI: 'https://example.test/',
    readyState: 'complete',
    documentElement: {},
    head: { append() {} },
    querySelector(selector) {
      if (selector === 'meta[name="dokohilf-build"]') return { content: 'test-build' };
      return null;
    },
    getElementById() { return null; },
    createElement() { return { id: '', textContent: '' }; },
    addEventListener() {},
  };

  class MutationObserver { observe() {} }
  class FakeEvent { constructor(type) { this.type = type; } }

  const window = {
    fetch: networkFetch,
    setTimeout,
    clearTimeout,
  };

  const context = {
    window,
    document,
    Request: FakeRequest,
    Response,
    URL,
    AbortController,
    MutationObserver,
    Event: FakeEvent,
    queueMicrotask,
    requestAnimationFrame: callback => callback(),
    setTimeout,
    clearTimeout,
    console,
  };
  window.window = window;
  vm.runInNewContext(source, context);
  return { window, audioHits, manifestRequests: () => manifestRequests };
}

test('generic router spokenText prefers an approved sentence from the visible reply', async () => {
  const { window, audioHits, manifestRequests } = runtime();

  const ai = await window.fetch('https://example.test/functions/v1/dokohilf-ai', {
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Ich möchte bitte' }] }),
  });
  assert.equal(ai.ok, true);

  const voice = await window.fetch('https://example.test/functions/v1/dokohilf-tts', {
    method: 'POST',
    body: JSON.stringify({ text: REPLY }),
  });
  assert.equal(voice.ok, true);
  assert.equal(voice.headers.get('X-DokoHilf-Voice'), 'Supertonic-F1');

  const state = window.DokoHilfStaticFirstVoiceV28.getState();
  assert.equal(state.lastSpokenMapping, FALLBACK);
  assert.equal(state.approvedReplyMatches, 1);
  assert.equal(state.staticMisses, 0);
  assert.match(state.lastStaticHit, /000\.wav$/);
  assert.equal(manifestRequests(), 1);
  assert.equal(audioHits.length, 1);
  assert.match(audioHits[0], /000\.wav$/);
  assert.doesNotMatch(audioHits[0], /001\.wav$/);
});

test('voice reply-match revision records the fallback-priority fix', () => {
  assert.match(source, /VOICE_REPLY_MATCH_REVISION = '20260812-static-voice-reply-match-v45-2'/);
  assert.match(source, /spokenKey === fallbackKey/);
  assert.match(source, /normalizeAudioKey\(replyEntry\.text\) !== fallbackKey/);
});
