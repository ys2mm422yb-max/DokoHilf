import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PROFILE = process.env.DOKOHILF_MOBILE_PROFILE || 'ios';
const WIDTH = Number(process.env.DOKOHILF_VIEWPORT_WIDTH || (PROFILE === 'android' ? 412 : 393));
const HEIGHT = Number(process.env.DOKOHILF_VIEWPORT_HEIGHT || (PROFILE === 'android' ? 915 : 852));
const BASE_URL = process.env.DOKOHILF_RENDER_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.DOKOHILF_RENDER_OUTPUT || `artifacts/local-voice-v28/${PROFILE}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function silentWav(durationMs = 80) {
  const sampleRate = 8000;
  const samples = Math.max(1, Math.floor(sampleRate * durationMs / 1000));
  const dataSize = samples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const ascii = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  ascii(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, 'data');
  view.setUint32(40, dataSize, true);
  return buffer;
}

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  serviceWorkers: 'block',
  userAgent: PROFILE === 'android'
    ? 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/139 Mobile Safari/537.36'
    : 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => pageErrors.push(error.message));

await page.addInitScript(({ profile }) => {
  try { localStorage.setItem('dokohilf-privacy-ack-v1', 'yes'); } catch {}

  const synthCalls = [];
  const systemSpeechCalls = [];
  window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__ = synthCalls;
  window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__ = systemSpeechCalls;
  window.__DOKOHILF_LOCAL_VOICE_TEST_ADAPTER__ = {
    async prepare() {
      return {
        backend: profile === 'android' ? 'webgpu-test' : 'wasm-test',
        async synthesize(text) {
          synthCalls.push(String(text || ''));
          return { wav: (() => {
            const sampleRate = 8000;
            const samples = 640;
            const dataSize = samples * 2;
            const buffer = new ArrayBuffer(44 + dataSize);
            const view = new DataView(buffer);
            const ascii = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
            ascii(0, 'RIFF');
            view.setUint32(4, 36 + dataSize, true);
            ascii(8, 'WAVE');
            ascii(12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, 1, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 2, true);
            view.setUint16(32, 2, true);
            view.setUint16(34, 16, true);
            ascii(36, 'data');
            view.setUint32(40, dataSize, true);
            return buffer;
          })(), latencyMs: 6 };
        },
      };
    },
  };

  class FakeAudioContext {
    constructor() { this.state = 'running'; this.destination = {}; }
    async resume() { this.state = 'running'; }
    async decodeAudioData() { return { duration: 0.08 }; }
    createBufferSource() {
      const source = {
        buffer: null,
        onended: null,
        connect() {},
        disconnect() {},
        stop() {},
        start() { setTimeout(() => source.onended?.(), 25); },
      };
      return source;
    }
  }
  Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext });
  Object.defineProperty(window, 'webkitAudioContext', { configurable: true, value: FakeAudioContext });

  class FakeRecognition {
    constructor() {
      this.lang = 'de-DE';
      this.interimResults = false;
      this.continuous = false;
      this.maxAlternatives = 1;
      this.onstart = null;
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
    }
    start() {
      this.onstart?.();
      setTimeout(() => this.onend?.(), 35);
    }
    abort() { this.onend?.(); }
  }
  Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: FakeRecognition });
  Object.defineProperty(window, 'webkitSpeechRecognition', { configurable: true, value: FakeRecognition });

  const speechSynthesis = {
    getVoices: () => [{ name: 'Forbidden System Voice', voiceURI: 'forbidden', lang: 'de-DE', localService: true }],
    speak(utterance) { systemSpeechCalls.push(String(utterance?.text || '')); },
    cancel() {}, pause() {}, resume() {}, addEventListener() {}, onvoiceschanged: null,
  };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: speechSynthesis });
  class FakeUtterance {
    constructor(text) { this.text = text; this.onerror = null; this.onend = null; this.onstart = null; }
    addEventListener() {}
    dispatchEvent() { return true; }
  }
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: FakeUtterance });
}, { profile: PROFILE });

let cloudTtsRequests = 0;
let unexpectedRouterRequests = 0;
await page.route(/\/functions\/v1\/dokohilf-tts(?:\?.*)?$/, async route => {
  cloudTtsRequests += 1;
  await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'cloud_tts_must_not_be_called_in_v28' }) });
});
await page.route(/\/functions\/v1\/dokohilf-ai-router(?:\?.*)?$/, async route => {
  unexpectedRouterRequests += 1;
  await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'detail_help_should_intercept' }) });
});

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  assert((await page.locator('#buildPill').innerText()).includes('v28'), 'Die gerenderte App ist nicht v28.');

  await page.locator('[data-select-mode="voice"]').click();
  await page.locator('.voice-focus-stage').waitFor({ state: 'visible' });
  await page.waitForFunction(() => (window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__?.length || 0) >= 1);
  const greetingCalls = await page.evaluate(() => [...window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__]);
  assert(greetingCalls[0]?.includes('Hallo'), 'Die Begrüßung wurde nicht durch die lokale Stimme erzeugt.');

  await page.waitForTimeout(120);
  const beforeFollowup = await page.evaluate(() => window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__.length);
  await page.evaluate(() => window.DokoHilf?.sendMessage?.('Ich finde die Vitalwerte nicht wo sind die?', { fromVoice: true }));
  await page.waitForFunction(before => (window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__?.length || 0) > before, beforeFollowup);

  const synthCalls = await page.evaluate(() => [...window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__]);
  const followups = synthCalls.slice(beforeFollowup);
  assert(followups.some(text => /Doku-Erweitert/i.test(text)), 'Die zweite Antwort wurde nicht mit derselben lokalen Stimme erzeugt.');

  await page.waitForTimeout(120);
  const systemCalls = await page.evaluate(() => [...window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__]);
  assert(systemCalls.length === 0, `Systemstimme wurde ${systemCalls.length}x aufgerufen.`);
  assert(cloudTtsRequests === 0, `Cloud-TTS wurde ${cloudTtsRequests}x aufgerufen.`);
  assert(unexpectedRouterRequests === 0, `Detailhilfe hat ${unexpectedRouterRequests} unnötige Router-Aufrufe erzeugt.`);

  const localState = await page.evaluate(() => window.DokoHilfLocalVoiceV28?.getState?.());
  assert(localState?.armed === true, 'Lokale Stimme wurde beim Voice-Einstieg nicht aktiviert.');
  assert(PROFILE === 'android' ? /webgpu/.test(localState.backend) : /wasm/.test(localState.backend), `Unerwartetes Test-Backend: ${localState?.backend}`);

  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    status: document.getElementById('voiceStatus')?.textContent || '',
    hint: document.getElementById('voiceHint')?.textContent || '',
  }));
  assert(geometry.scrollWidth <= geometry.viewportWidth + 1, `Horizontaler Overflow: ${geometry.scrollWidth} > ${geometry.viewportWidth}`);
  assert(!/Sofortstimme|Gerätestimme/i.test(`${geometry.status} ${geometry.hint}`), 'Voice-UI erwähnt noch die alte Systemstimme.');

  await page.screenshot({ path: `${OUTPUT_DIR}/local-voice-v28-${PROFILE}.png`, fullPage: false });
  await writeFile(`${OUTPUT_DIR}/summary.json`, JSON.stringify({
    profile: PROFILE,
    viewport: { width: WIDTH, height: HEIGHT },
    synthCalls,
    systemCalls,
    cloudTtsRequests,
    unexpectedRouterRequests,
    localState,
    geometry,
    consoleErrors,
    pageErrors,
  }, null, 2));

  assert(consoleErrors.length === 0, `Console-Fehler: ${consoleErrors.join(' | ')}`);
  assert(pageErrors.length === 0, `Page-Fehler: ${pageErrors.join(' | ')}`);
} finally {
  await context.close();
  await browser.close();
}
