import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PROFILE = process.env.DOKOHILF_MOBILE_PROFILE || 'ios';
const WIDTH = Number(process.env.DOKOHILF_VIEWPORT_WIDTH || (PROFILE === 'android' ? 412 : 393));
const HEIGHT = Number(process.env.DOKOHILF_VIEWPORT_HEIGHT || (PROFILE === 'android' ? 915 : 852));
const SCALE = Number(process.env.DOKOHILF_DEVICE_SCALE_FACTOR || 2);
const BASE_URL = process.env.DOKOHILF_RENDER_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.DOKOHILF_RENDER_OUTPUT || `artifacts/detail-help-v27/${PROFILE}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: SCALE,
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

  const localCalls = [];
  const systemCalls = [];
  window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__ = localCalls;
  window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__ = systemCalls;
  window.__DOKOHILF_LOCAL_VOICE_TEST_ADAPTER__ = {
    async prepare() {
      return {
        backend: profile === 'android' ? 'webgpu-test' : 'wasm-test',
        async synthesize(text) {
          localCalls.push(String(text || ''));
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
          return { wav: buffer, latencyMs: 6 };
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
        connect() {}, disconnect() {}, stop() {},
        start() { setTimeout(() => source.onended?.(), 25); },
      };
      return source;
    }
  }
  Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext });
  Object.defineProperty(window, 'webkitAudioContext', { configurable: true, value: FakeAudioContext });

  class FakeRecognition {
    constructor() { this.lang = 'de-DE'; this.interimResults = false; this.continuous = false; this.maxAlternatives = 1; this.onstart = null; this.onresult = null; this.onerror = null; this.onend = null; }
    start() { this.onstart?.(); setTimeout(() => this.onend?.(), 35); }
    abort() { this.onend?.(); }
  }
  Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: FakeRecognition });
  Object.defineProperty(window, 'webkitSpeechRecognition', { configurable: true, value: FakeRecognition });

  const synth = {
    getVoices: () => [{ name: 'Forbidden System Voice', voiceURI: 'forbidden', lang: 'de-DE', localService: true }],
    cancel() {}, pause() {}, resume() {}, addEventListener() {}, onvoiceschanged: null,
    speak(utterance) { systemCalls.push(String(utterance?.text || '')); },
  };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth });
  class FakeUtterance {
    constructor(text) { this.text = String(text || ''); this.onstart = null; this.onend = null; this.onerror = null; }
    addEventListener() {}
    dispatchEvent() { return true; }
  }
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: FakeUtterance });
}, { profile: PROFILE });

let unexpectedRouterRequests = 0;
let cloudTtsRequests = 0;
await page.route(/\/functions\/v1\/dokohilf-ai-router(?:\?.*)?$/, async route => {
  unexpectedRouterRequests += 1;
  await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'detail_help_should_intercept_before_router' }) });
});
await page.route(/\/functions\/v1\/dokohilf-tts(?:\?.*)?$/, async route => {
  cloudTtsRequests += 1;
  await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'cloud_tts_forbidden_in_v28' }) });
});

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  assert((await page.locator('#buildPill').innerText()).includes('v28'), 'Detailhilfe-Test läuft nicht auf v28.');

  await page.locator('[data-select-mode="chat"]').click();
  await page.locator('#workspace').waitFor({ state: 'visible' });
  await page.locator('#chatInput').fill('Hallo ich finde die Vitalwerte nicht wo sind die?');
  await page.getByRole('button', { name: 'Senden' }).click();
  const chatHelp = page.locator('#detailHelpOptionsV27');
  await chatHelp.waitFor({ state: 'visible' });
  await page.waitForFunction(() => [...document.querySelectorAll('.message.assistant .bubble p')].at(-1)?.textContent?.includes('Schau oben in die grüne Reiterleiste'));

  const firstReply = await page.locator('.message.assistant .bubble p').last().innerText();
  assert(firstReply.includes('Doku-Erweitert'), 'Detaillierte Vitalwerte-Orientierung nennt Doku-Erweitert nicht.');
  assert(!/erledigt|tun nicht so|markiere/i.test(firstReply), 'Interne Guide-Zustandsformulierungen werden dem Nutzer angezeigt.');
  assert(await chatHelp.locator('[data-detail-help-value]').count() === 4, 'Orientierungsfrage bietet nicht vier strukturierte Antworten.');
  assert((await page.locator('#guideProgressStep').innerText()).includes('Schritt 1 von 2'), 'Detailhilfe hält Vitalwerte nicht bei Schritt 1 von 2.');
  assert(await page.locator('#commandRow').evaluate(node => getComputedStyle(node).display) === 'none', 'Weiter ist während der Detailhilfe noch sichtbar.');

  await page.getByRole('button', { name: 'Doku-Erweitert offen' }).click();
  await page.waitForFunction(() => document.querySelector('#guideProgressStep')?.textContent?.includes('Schritt 2 von 2'));
  await page.waitForFunction(() => [...document.querySelectorAll('.message.assistant .bubble p')].at(-1)?.textContent?.includes('Siehst du Vitalwerte'));
  const secondReply = await page.locator('.message.assistant .bubble p').last().innerText();
  assert(secondReply.includes('Vitalwerte Sammelerf.'), 'Zweiter Orientierungsschritt erklärt den getrennten Sammel-Eintrag nicht.');
  assert(secondReply.length < 180, 'Zweiter Orientierungsschritt ist unnötig lang.');

  await page.getByRole('button', { name: 'Vitalwerte fehlt' }).click();
  await page.waitForFunction(() => [...document.querySelectorAll('.message.assistant .bubble p')].at(-1)?.textContent?.includes('Prüfe den Einstieg noch einmal'));
  const missingReply = await page.locator('.message.assistant .bubble p').last().innerText();
  assert(!missingReply.includes('bestätigten Alternativ-Klickweg'), 'Interne Fachgrenzen-Sprache wird wortwörtlich angezeigt.');
  assert((await page.locator('#guideProgressStep').innerText()).includes('Schritt 2 von 2'), 'Fehlersuche hat den Guide-Schritt verändert.');

  const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  assert(dimensions.width <= dimensions.viewport + 1, `Detailhilfe hat horizontalen Overflow: ${dimensions.width} > ${dimensions.viewport}`);
  await page.screenshot({ path: `${OUTPUT_DIR}/detail-help-chat-${PROFILE}.png`, fullPage: true });

  await page.evaluate(() => window.DokoHilf?.resetConversation?.({ keepMode: false }));
  await page.locator('#startScreen').waitFor({ state: 'visible' });
  await page.locator('[data-select-mode="voice"]').click();
  await page.locator('.voice-focus-stage').waitFor({ state: 'visible' });
  await page.waitForFunction(() => (window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__?.length || 0) >= 1);
  const localCallsBefore = await page.evaluate(() => window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__.length);

  await page.evaluate(() => window.DokoHilf?.sendMessage?.('Ich finde die Vitalwerte nicht wo sind die?', { fromVoice: true }));
  const voiceHelp = page.locator('#voiceDetailHelpOptionsV27');
  await voiceHelp.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('#voiceFocusText')?.textContent?.includes('Schau oben in die grüne Reiterleiste'));
  await page.waitForFunction(before => (window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__?.length || 0) > before, localCallsBefore);

  const voiceText = await page.locator('#voiceFocusText').innerText();
  assert(!/erledigt|tun nicht so|markiere/i.test(voiceText), 'Voice-Modus zeigt interne Zustandsformulierungen.');
  assert(await voiceHelp.locator('[data-detail-help-value]').count() === 4, 'Voice-Modus verwendet nicht dieselben strukturierten Detailfragen.');
  assert(await page.locator('#appShell').getAttribute('data-detail-help') === 'true', 'Voice-Modus setzt den Detailhilfe-Zustand nicht.');

  const localCalls = await page.evaluate(() => [...window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__]);
  assert(localCalls.slice(localCallsBefore).some(text => text.includes('Doku-Erweitert')), 'Folgeantwort wurde nicht über die lokale v28-Stimme erzeugt.');
  const systemCalls = await page.evaluate(() => [...window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__]);
  assert(systemCalls.length === 0, `Systemstimme wurde ${systemCalls.length}x aufgerufen.`);
  assert(cloudTtsRequests === 0, `Cloud-TTS wurde ${cloudTtsRequests}x aufgerufen.`);

  const geometry = await page.evaluate(() => {
    const rect = selector => document.querySelector(selector)?.getBoundingClientRect();
    const optionRects = [...document.querySelectorAll('#voiceDetailHelpOptionsV27 [data-detail-help-value]')].map(node => node.getBoundingClientRect());
    const actions = document.querySelector('#voiceFocusActions');
    return {
      instruction: rect('.voice-focus-instruction'), panel: rect('#voiceDetailHelpOptionsV27'), orb: rect('.voice-focus-stage .voice-orb'),
      actionsDisplay: actions ? getComputedStyle(actions).display : 'missing',
      optionRects: optionRects.map(item => ({ x: item.x, y: item.y, width: item.width, height: item.height })),
      scrollWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth,
    };
  });
  assert(geometry.actionsDisplay === 'none', 'Voice-Aktionen konkurrieren noch mit der Detailfrage.');
  assert(geometry.orb?.width <= 110, `Mikrofon bleibt in Detailhilfe zu groß: ${geometry.orb?.width}`);
  assert(geometry.instruction && geometry.panel && geometry.instruction.bottom <= geometry.panel.top + 1, 'Frage und Auswahlkarten überlappen sich.');
  assert(geometry.panel && geometry.orb && geometry.panel.bottom <= geometry.orb.top + 1, 'Auswahlkarten und Mikrofon überlappen sich.');
  assert(geometry.optionRects.length === 4, 'Vier Detailoptionen fehlen im Voice-Layout.');
  assert(Math.abs(geometry.optionRects[0].y - geometry.optionRects[1].y) < 2, 'Voice-Optionen sind nicht zweispaltig angeordnet.');
  assert(geometry.optionRects[2].y > geometry.optionRects[0].y, 'Zweite Optionszeile fehlt.');
  assert(geometry.scrollWidth <= geometry.viewportWidth + 1, 'Voice-Detailhilfe erzeugt horizontalen Overflow.');

  await page.screenshot({ path: `${OUTPUT_DIR}/detail-help-voice-${PROFILE}.png`, fullPage: false });
  assert(unexpectedRouterRequests === 0, `Detailhilfe hat ${unexpectedRouterRequests} unnötige Router-Anfragen ausgelöst.`);
  assert(consoleErrors.length === 0, `Console-Fehler: ${consoleErrors.join(' | ')}`);
  assert(pageErrors.length === 0, `Page-Fehler: ${pageErrors.join(' | ')}`);

  await writeFile(`${OUTPUT_DIR}/detail-help-summary.json`, JSON.stringify({
    profile: PROFILE,
    viewport: { width: WIDTH, height: HEIGHT },
    routerRequests: unexpectedRouterRequests,
    cloudTtsRequests,
    localCalls,
    systemCalls,
    geometry,
    consoleErrors,
    pageErrors,
  }, null, 2));
} finally {
  await context.close();
  await browser.close();
}
