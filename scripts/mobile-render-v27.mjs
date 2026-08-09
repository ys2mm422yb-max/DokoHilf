import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE_URL = process.env.DOKOHILF_RENDER_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.DOKOHILF_RENDER_OUTPUT || 'artifacts/mobile-v29';
const USE_MOCK_SERVICES = process.env.DOKOHILF_UI_MOCK === '1';
const PROFILE = process.env.DOKOHILF_MOBILE_PROFILE || 'ios';
const VIEWPORT_WIDTH = Number(process.env.DOKOHILF_VIEWPORT_WIDTH || (PROFILE === 'android' ? 412 : 393));
const VIEWPORT_HEIGHT = Number(process.env.DOKOHILF_VIEWPORT_HEIGHT || (PROFILE === 'android' ? 915 : 852));
const DEVICE_SCALE_FACTOR = Number(process.env.DOKOHILF_DEVICE_SCALE_FACTOR || 2);
const BUILD_ID = JSON.parse(await readFile(new URL('../version.json', import.meta.url), 'utf8')).buildId;
if (!BUILD_ID) throw new Error('buildId fehlt in version.json');
const GREETING = 'Hey! Wobei brauchst du Hilfe?';
const VISIT_REPLY = 'Öffne „Doku-Erweitert“. Bist du in Doku-Erweitert?';
const VISIT_SPEECH = 'Öffne Doku-Erweitert.';
const USER_AGENT = PROFILE === 'android'
  ? 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
  : 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1';

function assert(condition, message) { if (!condition) throw new Error(message); }
function silentWav() {
  const sampleRate = 8000, samples = 640, dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0, 'ascii'); buffer.writeUInt32LE(36 + dataSize, 4); buffer.write('WAVE', 8, 'ascii');
  buffer.write('fmt ', 12, 'ascii'); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36, 'ascii'); buffer.writeUInt32LE(dataSize, 40);
  return buffer;
}

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
  deviceScaleFactor: DEVICE_SCALE_FACTOR,
  isMobile: true,
  hasTouch: true,
  colorScheme: 'dark',
  locale: 'de-DE',
  userAgent: USER_AGENT,
  serviceWorkers: 'block',
});
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => pageErrors.push(error.message));

await page.addInitScript(({ profile }) => {
  try { localStorage.setItem('dokohilf-privacy-ack-v1', 'yes'); } catch {}
  const systemSpeechCalls = [];
  window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__ = systemSpeechCalls;
  window.__DOKOHILF_LOCAL_VOICE_TEST_ADAPTER__ = {
    async prepare() {
      return {
        backend: profile === 'android' ? 'webgpu-ui-test' : 'wasm-ui-test',
        async synthesize() {
          const sampleRate = 8000, samples = 640, dataSize = samples * 2;
          const buffer = new ArrayBuffer(44 + dataSize), view = new DataView(buffer);
          const ascii = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
          ascii(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); ascii(8, 'WAVE'); ascii(12, 'fmt '); view.setUint32(16, 16, true);
          view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
          view.setUint16(32, 2, true); view.setUint16(34, 16, true); ascii(36, 'data'); view.setUint32(40, dataSize, true);
          return { wav: buffer, latencyMs: 1 };
        },
      };
    },
  };
  class FakeAudioContext {
    constructor() { this.state = 'running'; this.destination = {}; }
    async resume() { this.state = 'running'; }
    async decodeAudioData() { return { duration: .08 }; }
    createBufferSource() {
      const source = { buffer: null, onended: null, connect() {}, disconnect() {}, stop() {}, start() { setTimeout(() => source.onended?.(), 25); } };
      return source;
    }
  }
  Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext });
  Object.defineProperty(window, 'webkitAudioContext', { configurable: true, value: FakeAudioContext });
  class FakeRecognition {
    constructor() { this.lang = 'de-DE'; this.interimResults = false; this.continuous = false; this.maxAlternatives = 1; this.onstart = null; this.onresult = null; this.onerror = null; this.onend = null; }
    start() { this.onstart?.(); setTimeout(() => this.onend?.(), 60); }
    abort() { this.onend?.(); }
  }
  Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: FakeRecognition });
  Object.defineProperty(window, 'webkitSpeechRecognition', { configurable: true, value: FakeRecognition });
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    getVoices: () => [{ name: 'Forbidden System Voice', voiceURI: 'forbidden', lang: 'de-DE', localService: true }],
    speak(utterance) { systemSpeechCalls.push(String(utterance?.text || '')); }, cancel() {}, pause() {}, resume() {}, addEventListener() {}, onvoiceschanged: null,
  } });
  class FakeUtterance { constructor(text) { this.text = text; this.onstart = null; this.onend = null; this.onerror = null; } addEventListener() {} dispatchEvent() { return true; } }
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: FakeUtterance });
}, { profile: PROFILE });

let aiRequests = 0;
let rawTtsRequests = 0;
let staticAudioRequests = 0;
if (USE_MOCK_SERVICES) {
  for (const pattern of [
    /\/functions\/v1\/dokohilf-chat-router(?:\?.*)?$/,
    /\/functions\/v1\/dokohilf-ai-router(?:\?.*)?$/,
    /\/functions\/v1\/dokohilf-ai(?:\?.*)?$/,
  ]) {
    await page.route(pattern, async route => {
      aiRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          reply: VISIT_REPLY,
          spokenText: VISIT_SPEECH,
          guideSlug: 'visiten-oeffnen',
          guideTitle: 'Visiten öffnen',
          guideStep: 1,
          guideStepCount: 2,
          source: 'ui-render-v29-mock',
        }),
      });
    });
  }
  await page.route('**/assets/guide-audio-catalog.json*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        schemaVersion: 1,
        voice: 'Supertonic-F1',
        entries: [
          { file: 'assets/audio/guides/000.wav', text: GREETING },
          { file: 'assets/audio/guides/001.wav', text: VISIT_SPEECH },
        ],
      }),
    });
  });
  await page.route(/\/assets\/audio\/guides\/[^/?]+\.wav(?:\?.*)?$/, async route => {
    staticAudioRequests += 1;
    await route.fulfill({ status: 200, contentType: 'audio/wav', body: silentWav() });
  });
  await page.route(/\/functions\/v1\/dokohilf-tts(?:\?.*)?$/, async route => {
    rawTtsRequests += 1;
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'cloud_tts_forbidden_v29' }) });
  });
}

async function state() {
  return page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    mode: document.getElementById('appShell')?.dataset.mode || '',
    voiceState: document.getElementById('appShell')?.dataset.voiceState || '',
  }));
}

async function startupState() {
  return page.evaluate(() => {
    const title = document.getElementById('startTitle');
    const start = document.getElementById('startScreen');
    const shell = document.getElementById('appShell');
    const examples = document.querySelector('.examples');
    const titleStyle = title ? getComputedStyle(title) : null;
    const startStyle = start ? getComputedStyle(start) : null;
    const titleRect = title?.getBoundingClientRect();
    const startRect = start?.getBoundingClientRect();
    const legacy = examples ? [...examples.querySelectorAll('button[data-direct-guide]')] : [];
    return {
      readyState: document.readyState,
      href: location.href,
      titleExists: Boolean(title),
      titleText: title?.textContent?.trim() || '',
      titleDisplay: titleStyle?.display || '',
      titleVisibility: titleStyle?.visibility || '',
      titleOpacity: titleStyle?.opacity || '',
      titleRect: titleRect ? { x: titleRect.x, y: titleRect.y, width: titleRect.width, height: titleRect.height } : null,
      startExists: Boolean(start),
      startHidden: start?.hidden ?? null,
      startDisplay: startStyle?.display || '',
      startVisibility: startStyle?.visibility || '',
      startRect: startRect ? { x: startRect.x, y: startRect.y, width: startRect.width, height: startRect.height } : null,
      shellMode: shell?.dataset.mode || '',
      shellConnected: Boolean(shell?.isConnected),
      ui: document.documentElement.dataset.dokohilfUi || '',
      libraryFlag: window.__DOKOHILF_GUIDE_LIBRARY_V29__ === true,
      libraryOwner: examples?.dataset.v29GuideLibrary || '',
      examplesLabel: examples?.querySelector(':scope > span')?.textContent?.trim() || '',
      frequentCount: examples?.querySelectorAll('.v29-frequent-guide').length || 0,
      allGuidesCount: examples?.querySelectorAll('.v29-all-guides-trigger').length || 0,
      legacyCount: legacy.length,
      legacyHiddenCount: legacy.filter(button => getComputedStyle(button).display === 'none').length,
      activeElement: document.activeElement?.tagName || '',
    };
  });
}

function assertFits(result, label) {
  assert(result.scrollWidth <= result.viewportWidth + 1, `${label}: horizontaler Overflow ${result.scrollWidth}px > ${result.viewportWidth}px`);
}

async function waitForV29Start() {
  try {
    await page.waitForFunction(() => {
      const title = document.getElementById('startTitle');
      const shell = document.getElementById('appShell');
      const examples = document.querySelector('.examples');
      if (!title || !shell || shell.dataset.mode !== 'start' || !examples) return false;
      const titleStyle = getComputedStyle(title);
      const titleRect = title.getBoundingClientRect();
      const label = examples.querySelector(':scope > span')?.textContent?.trim();
      return window.__DOKOHILF_GUIDE_LIBRARY_V29__ === true
        && examples.dataset.v29GuideLibrary === 'true'
        && label === 'Häufig genutzt'
        && examples.querySelectorAll('.v29-frequent-guide').length === 6
        && examples.querySelectorAll('.v29-all-guides-trigger').length === 1
        && title.textContent.trim() === 'Was möchtest du erledigen?'
        && titleStyle.display !== 'none'
        && titleStyle.visibility !== 'hidden'
        && Number(titleStyle.opacity || 1) > 0
        && titleRect.width > 120
        && titleRect.height > 20;
    }, null, { timeout: 8_000 });
  } catch (error) {
    console.log('DOKOHILF_STARTUP_STATE', JSON.stringify(await startupState()));
    console.log('DOKOHILF_STARTUP_CONSOLE_ERRORS', JSON.stringify(consoleErrors));
    console.log('DOKOHILF_STARTUP_PAGE_ERRORS', JSON.stringify(pageErrors));
    throw error;
  }
}

await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
await waitForV29Start();
await page.waitForTimeout(250);
console.log('DOKOHILF_STARTUP_STATE', JSON.stringify(await startupState()));
console.log('DOKOHILF_STARTUP_CONSOLE_ERRORS', JSON.stringify(consoleErrors));
console.log('DOKOHILF_STARTUP_PAGE_ERRORS', JSON.stringify(pageErrors));
assertFits(await state(), `${PROFILE} Startseite`);

// Frequent guide card must open and return cleanly.
const frequentReport = page.locator('.v29-frequent-guide[data-v29-open-guide="bericht-neu"]');
await frequentReport.waitFor({ state: 'visible' });
await frequentReport.click();
const directView = page.locator('#directGuideView');
await directView.waitFor({ state: 'visible' });
assert((await directView.locator('h1').innerText()).includes('Bericht'), 'Häufiger Guide Bericht öffnet nicht korrekt.');
const reportSpecial = directView.locator('.report-protocol-condition');
await reportSpecial.waitFor({ state: 'visible' });
const reportSpecialText = await reportSpecial.innerText();
assert(reportSpecialText.includes('Fallgespräch'), 'Bericht-Sonderfall nennt das Fallgespräch nicht.');
assert(reportSpecialText.includes('Sturzprotokoll'), 'Bericht-Sonderfall nennt das Sturzprotokoll nicht.');
assert(reportSpecialText.includes('Schritte 6–9'), 'Bericht-Sonderfall grenzt Schritte 6–9 nicht sichtbar ab.');
assert(reportSpecialText.includes('Schritt 10'), 'Bericht-Sonderfall nennt das Sprungziel Schritt 10 nicht.');
const conditionalSteps = directView.locator('.direct-guide-step.report-protocol-step');
assert(await conditionalSteps.count() === 4, 'Bericht-Sonderfall muss genau vier Schritte markieren.');
await directView.locator('[data-v29-guide-back]').click();
await page.waitForFunction(() => document.getElementById('appShell')?.dataset.mode === 'start');

// "All guides" is a real library and can open every active card.
const allGuidesButton = page.locator('.v29-all-guides-trigger');
await allGuidesButton.waitFor({ state: 'visible' });
await allGuidesButton.click();
await directView.waitFor({ state: 'visible' });
const libraryHeading = directView.locator('h1');
await libraryHeading.waitFor({ state: 'visible' });
assert((await libraryHeading.innerText()).includes('Alle Anleitungen'), 'Alle-Anleitungen-Ansicht fehlt.');
await page.waitForFunction(() => {
  const view = document.getElementById('directGuideView');
  const grid = view?.querySelector('.v29-library-grid');
  return Boolean(grid)
    && grid.querySelectorAll('.v29-library-card[data-v29-open-durchfuehrung-guide]').length === 3
    && view?.getAttribute('data-v29-library-guide-count') === '18';
}, null, { timeout: 8_000 });
const activeLibraryCards = directView.locator('.v29-library-card:not(.is-later)');
assert(await activeLibraryCards.count() === 18, `Es müssen 18 fertige Guides anklickbar sein: ${await activeLibraryCards.count()}`);
const laterCards = directView.locator('.v29-library-card.is-later');
assert(await laterCards.count() === 3, `Es müssen genau 3 fachlich offene Später-Karten bleiben: ${await laterCards.count()}`);
for (const expected of ['Aufgaben · Aktuelles', 'Easy-Plan öffnen', 'Berichtssuche']) {
  const card = laterCards.filter({ hasText: expected });
  assert(await card.count() === 1, `Später-Karte fehlt: ${expected}`);
  const laterState = await card.evaluate(node => ({
    ariaDisabled: node.getAttribute('aria-disabled'),
    hasGuideTarget: node.hasAttribute('data-v29-open-guide') || node.hasAttribute('data-v29-open-durchfuehrung-guide'),
    hasNestedInteractive: Boolean(node.querySelector('button, a[href], [data-v29-open-guide], [data-v29-open-durchfuehrung-guide]')),
  }));
  assert(laterState.ariaDisabled === 'true', `Später-Karte muss als nicht verfügbar markiert sein: ${expected}`);
  assert(!laterState.hasGuideTarget && !laterState.hasNestedInteractive, `Später-Karte darf keinen anklickbaren Guide-Pfad besitzen: ${expected}`);
}

const librarySlugs = await activeLibraryCards.evaluateAll(cards => cards.map(card => card.getAttribute('data-v29-open-guide') || card.getAttribute('data-v29-open-durchfuehrung-guide')));
for (const slug of librarySlugs) {
  const selector = `[data-v29-open-guide="${slug}"], [data-v29-open-durchfuehrung-guide="${slug}"]`;
  const card = directView.locator(selector).first();
  await card.scrollIntoViewIfNeeded();
  await card.click();

  if (slug === 'vitalwerte') {
    const choices = ['vitalwerte-einzelwert', 'vitalwerte-sammelerfassung'];
    for (let index = 0; index < choices.length; index += 1) {
      const choiceSlug = choices[index];
      const choice = directView.locator(`[data-v29-open-guide="${choiceSlug}"]`);
      assert(await choice.count() === 1, `Vitalwerte-Auswahl fehlt: ${choiceSlug}`);
      await choice.click();
      assert((await directView.locator('.direct-guide-step').count()) > 0, `Vitalwerte-Unterguide ${choiceSlug} hat keine sichtbaren Schritte.`);
      await directView.locator('[data-v29-guide-back]').click();
      await page.waitForFunction(() => document.querySelector('#directGuideView .v29-library-grid') && !document.getElementById('directGuideView').hidden);
      if (index < choices.length - 1) {
        const vitalCard = directView.locator('[data-v29-open-guide="vitalwerte"]');
        await vitalCard.scrollIntoViewIfNeeded();
        await vitalCard.click();
        await page.waitForFunction(() => document.querySelector('#directGuideView .v29-vital-choice'));
      }
    }
    continue;
  }

  assert((await directView.locator('.direct-guide-step').count()) > 0, `Guide ${slug} hat keine sichtbaren Schritte.`);
  const backSelector = slug === 'bedarfsmedikation-gabe' || slug === 'bedarfsmedikation-wirksamkeitskontrolle' || slug === 'massnahmen-ohne-zeitangabe'
    ? '[data-v29-extra-back]'
    : '[data-v29-guide-back]';
  await directView.locator(backSelector).click();
  await page.waitForFunction(() => document.querySelector('#directGuideView .v29-library-grid') && !document.getElementById('directGuideView').hidden);
}

const libraryHome = directView.locator('[data-v29-guide-home]').filter({ hasText: 'Zurück zum Hauptmenü' });
assert(await libraryHome.count() === 1, 'In der Anleitungsbibliothek muss genau ein Button „Zurück zum Hauptmenü“ vorhanden sein.');
await libraryHome.click();
await page.waitForFunction(() => document.getElementById('appShell')?.dataset.mode === 'start');

// Chat route and contextual help must stay inside confirmed guide context.
await page.locator('[data-select-mode="chat"]').click();
await page.waitForFunction(() => document.getElementById('appShell')?.dataset.mode === 'chat');
assertFits(await state(), `${PROFILE} Chatmodus`);
if (USE_MOCK_SERVICES) {
  const form = page.locator('#chatForm');
  await page.locator('#chatInput').fill('Wo sind die Visiten?');
  await form.evaluate(node => node.requestSubmit());
  await page.waitForFunction(() => document.querySelectorAll('#messages .message.assistant').length > 0);
  assert(aiRequests > 0, 'KI-Router wurde im Chatmodus nicht angesprochen.');
}

// Voice mode must use the static WAV route and never raw TTS/system speech.
await page.locator('[data-switch-mode="voice"]').click();
await page.waitForFunction(() => document.getElementById('appShell')?.dataset.mode === 'voice');
assertFits(await state(), `${PROFILE} Sprachmodus`);
if (USE_MOCK_SERVICES) {
  await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('000.wav'));
  assert(staticAudioRequests > 0, 'Statische Supertonic-Begrüßung wurde im Sprachmodus nicht verwendet.');
  const before = staticAudioRequests;
  const ttsBefore = rawTtsRequests;
  await page.evaluate(() => window.DokoHilf?.sendMessage?.('Wo sind die Visiten?', { fromVoice: true }));
  await page.waitForFunction(text => document.querySelector('#voiceFocusText')?.textContent?.includes(text), VISIT_SPEECH);
  await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('001.wav'));
  assert(staticAudioRequests > before, 'Statische Supertonic-WAV wurde für die Voice-Antwort nicht verwendet.');
  assert(rawTtsRequests === ttsBefore, 'Cloud-TTS-Netzwerkpfad wurde im Sprachmodus verwendet.');
  const systemSpeechCalls = await page.evaluate(() => window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__ || []);
  assert(systemSpeechCalls.length === 0, `Systemstimme wurde ${systemSpeechCalls.length}x verwendet.`);
  const voiceState = await page.evaluate(() => window.DokoHilfStaticFirstVoiceV28?.getState?.());
  assert(voiceState?.lastStaticHit?.includes('001.wav'), 'Voice-Antwort wurde nicht aus dem statischen Supertonic-Katalog abgespielt.');
}

assert(consoleErrors.length === 0, `Console-Fehler: ${consoleErrors.join(' | ')}`);
assert(pageErrors.length === 0, `Page-Fehler: ${pageErrors.join(' | ')}`);
await writeFile(`${OUTPUT_DIR}/summary.json`, JSON.stringify({ profile: PROFILE, buildId: BUILD_ID, staticAudioRequests, rawTtsRequests, consoleErrors, pageErrors }, null, 2));
await context.close();
await browser.close();
