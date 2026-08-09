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
const GREETING = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.';
const VISIT_REPLY = 'Öffne „Doku erweitert“. Bist du in Doku erweitert?';
const VISIT_SPEECH = 'Öffne Doku erweitert.';
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
  await page.route('**/assets/audio/guides/*.wav', async route => {
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
      libraryFlag: window.__DOKOHILF_GUIDE_LIBRARY_V29__ ?? null,
      libraryOwner: examples?.dataset.v29GuideLibrary || '',
      examplesLabel: examples?.querySelector(':scope > span')?.textContent?.trim() || '',
      frequentCount: examples?.querySelectorAll('.v29-frequent-guide').length || 0,
      allGuidesCount: examples?.querySelectorAll('.v29-all-guides-trigger').length || 0,
      legacyCount: legacy.length,
      legacyHiddenCount: legacy.filter(button => button.hidden || getComputedStyle(button).display === 'none').length,
      activeElement: document.activeElement?.id || document.activeElement?.tagName || '',
    };
  });
}

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30_000 });
  const startup = await startupState();
  await writeFile(`${OUTPUT_DIR}/00-startup-${PROFILE}.json`, JSON.stringify({ startup, consoleErrors, pageErrors }, null, 2));
  console.log(`DOKOHILF_STARTUP_STATE ${JSON.stringify(startup)}`);
  console.log(`DOKOHILF_STARTUP_CONSOLE_ERRORS ${JSON.stringify(consoleErrors)}`);
  console.log(`DOKOHILF_STARTUP_PAGE_ERRORS ${JSON.stringify(pageErrors)}`);
  await page.screenshot({ path: `${OUTPUT_DIR}/00-startup-${PROFILE}.png`, fullPage: true }).catch(error => {
    console.log(`DOKOHILF_STARTUP_SCREENSHOT_ERROR ${error.message}`);
  });
  await page.locator('#startTitle').waitFor({ state: 'visible' });

  const identity = await page.evaluate(() => ({
    build: document.querySelector('meta[name="dokohilf-build"]')?.content,
    version: document.getElementById('buildPill')?.textContent?.trim(),
    ui: document.documentElement.dataset.dokohilfUi,
    bg: getComputedStyle(document.body).backgroundImage,
  }));
  assert(identity.build === BUILD_ID, `Gerenderte Seite hat nicht Build v29: ${identity.build}`);
  assert(identity.version === `DokoHilf v29 · Build ${BUILD_ID}`, `Falscher sichtbarer Marker: ${identity.version}`);
  assert(identity.ui === 'v29', `v29-UI-Layer fehlt: ${identity.ui}`);
  assert(identity.bg !== 'none', 'Dunkle v29-Hintergrundgestaltung fehlt.');

  const start = await state();
  assert(start.scrollWidth <= start.viewportWidth + 1, `Hauptmenü hat auf ${PROFILE} horizontalen Überlauf.`);
  assert(await page.locator('[data-select-mode="voice"]').isVisible(), 'Sprechen-Karte fehlt.');
  assert(await page.locator('[data-select-mode="chat"]').isVisible(), 'Schreiben-Karte fehlt.');
  await page.waitForFunction(() => {
    const examples = document.querySelector('.examples');
    const label = examples?.querySelector(':scope > span')?.textContent?.trim();
    return window.__DOKOHILF_GUIDE_LIBRARY_V29__ === true
      && examples?.dataset.v29GuideLibrary === 'true'
      && label === 'Häufig genutzt'
      && examples.querySelectorAll('.v29-frequent-guide').length === 6
      && Boolean(examples.querySelector('.v29-all-guides-trigger'));
  }, null, { timeout: 8_000 });
  const libraryHome = await page.evaluate(() => {
    const examples = document.querySelector('.examples');
    const legacy = [...examples.querySelectorAll('button[data-direct-guide]')];
    const frequent = [...examples.querySelectorAll('.v29-frequent-guide')];
    return {
      label: examples.querySelector(':scope > span')?.textContent?.trim(),
      frequentCount: frequent.length,
      allGuidesVisible: getComputedStyle(examples.querySelector('.v29-all-guides-trigger')).display !== 'none',
      legacyHidden: legacy.length === 7 && legacy.every(button => button.hidden && getComputedStyle(button).display === 'none'),
      iconVariants: new Set(frequent.map(button => button.querySelector('svg')?.innerHTML || '')).size,
    };
  });
  assert(libraryHome.label === 'Häufig genutzt', `Guide-Bibliothek hat falsche Überschrift: ${libraryHome.label}`);
  assert(libraryHome.frequentCount === 6, `Häufig genutzt muss sechs Karten zeigen: ${libraryHome.frequentCount}`);
  assert(libraryHome.allGuidesVisible, '„Alle Anleitungen anzeigen“ ist nicht sichtbar.');
  assert(libraryHome.legacyHidden, 'Legacy-Direktkarten sind trotz Guide-Bibliothek noch sichtbar.');
  assert(libraryHome.iconVariants >= 5, `Die häufig genutzten Guides verwenden nicht genügend unterschiedliche Icons: ${libraryHome.iconVariants}`);
  assert(await page.locator('.start-copy').evaluate(node => getComputedStyle(node, '::before').content.includes('DOKOHILF')), 'Neuer Hauptmenü-Kicker fehlt.');
  await page.screenshot({ path: `${OUTPUT_DIR}/01-main-v29-${PROFILE}.png`, fullPage: true });

  await page.locator('.v29-all-guides-trigger').click();
  await page.locator('.v29-library-head h1').waitFor({ state: 'visible' });
  const fullLibrary = await page.evaluate(() => {
    const active = [...document.querySelectorAll('.v29-library-card[data-v29-open-guide]')];
    const later = [...document.querySelectorAll('.v29-library-card.is-later')];
    return {
      title: document.querySelector('.v29-library-head h1')?.textContent?.trim(),
      guideCount: active.length,
      laterCount: later.length,
      laterTexts: later.map(card => card.textContent?.replace(/\s+/g, ' ').trim() || ''),
      activeIconVariants: new Set(active.map(card => card.querySelector('svg')?.innerHTML || '')).size,
    };
  });
  assert(fullLibrary.title === 'Alle Anleitungen', `Bibliothekstitel falsch: ${fullLibrary.title}`);
  assert(fullLibrary.guideCount === 15, `Es müssen 15 fertige Guides anklickbar sein: ${fullLibrary.guideCount}`);
  assert(fullLibrary.laterCount === 3, `Es müssen genau drei Später-Karten sichtbar sein: ${fullLibrary.laterCount}`);
  for (const expected of ['Aufgaben · Aktuelles', 'Easy-Plan öffnen', 'Berichtssuche']) {
    assert(fullLibrary.laterTexts.some(text => text.includes(expected) && text.includes('kommt später')), `${expected} ist nicht korrekt als später markiert.`);
  }
  assert(fullLibrary.activeIconVariants >= 12, `Die fertigen Guides verwenden zu viele wiederholte Icons: ${fullLibrary.activeIconVariants}`);
  await page.locator('[data-v29-guide-home]').click();
  await page.locator('#startScreen').waitFor({ state: 'visible' });

  await page.getByRole('button', { name: 'Bericht anlegen' }).click();
  const directGuide = page.locator('#directGuideView');
  await directGuide.waitFor({ state: 'visible' });
  assert(await directGuide.locator('.direct-guide-step').count() >= 8, 'Bericht-Anleitung ist unvollständig.');
  const reportCondition = directGuide.locator('.report-protocol-condition');
  await reportCondition.waitFor({ state: 'visible' });
  const reportText = await reportCondition.innerText();
  assert(reportText.includes('Fallgespräch') && reportText.includes('Sturzprotokoll'), 'Bericht-Sonderfall ist nicht korrekt sichtbar.');
  const guideState = await state();
  assert(guideState.scrollWidth <= guideState.viewportWidth + 1, 'Direkte Anleitung läuft horizontal über.');
  await page.screenshot({ path: `${OUTPUT_DIR}/02-report-guide-v29-${PROFILE}.png`, fullPage: true });
  await page.locator('[data-v29-guide-home]').click();
  await page.locator('#startScreen').waitFor({ state: 'visible' });

  await page.locator('[data-select-mode="chat"]').click();
  await page.locator('.chat-head').waitFor({ state: 'visible' });
  const chat = await page.evaluate(() => ({
    heading: document.querySelector('.chat-head h1')?.textContent?.trim(),
    eyebrowDisplay: getComputedStyle(document.querySelector('.chat-eyebrow')).display,
    composerVisible: !document.getElementById('composerWrap')?.hidden,
  }));
  assert(chat.heading === 'Was möchtest du erledigen?', `v29-Chatüberschrift falsch: ${chat.heading}`);
  assert(chat.eyebrowDisplay === 'none', 'Alte Chat-Eyebrow ist in v29 noch sichtbar.');
  assert(chat.composerVisible, 'Composer fehlt im Schreib-Chat.');
  const chatState = await state();
  assert(chatState.scrollWidth <= chatState.viewportWidth + 1, `Chat hat auf ${PROFILE} horizontalen Überlauf.`);

  const assistantBubbles = page.locator('.message.assistant:not(.typing) .bubble');
  const assistantCountBeforeSend = await assistantBubbles.count();
  await page.locator('#chatInput').fill('Wo sind die Visiten?');
  await page.getByRole('button', { name: 'Senden' }).click();
  const newAssistantBubble = assistantBubbles.nth(assistantCountBeforeSend);
  await newAssistantBubble.waitFor({ state: 'visible', timeout: 15_000 });
  const assistantText = await newAssistantBubble.innerText();
  assert(assistantText.includes('Doku erweitert'), `Kontextantwort fehlt: ${assistantText}`);
  await page.locator('.guide-progress').waitFor({ state: 'visible', timeout: 8_000 });
  await page.screenshot({ path: `${OUTPUT_DIR}/03-chat-v29-${PROFILE}.png`, fullPage: true });

  await page.evaluate(() => window.DokoHilf?.resetConversation?.({ keepMode: false }));
  await page.locator('#startScreen').waitFor({ state: 'visible' });
  await page.locator('[data-select-mode="voice"]').click();
  await page.locator('.voice-focus-stage').waitFor({ state: 'visible' });
  const orb = page.locator('.voice-focus-stage .voice-orb');
  await orb.waitFor({ state: 'visible' });

  await page.waitForTimeout(120);
  await page.evaluate(() => document.getElementById('pauseVoiceButton')?.click());
  await page.waitForTimeout(80);

  const visualStates = {};
  for (const voiceState of ['idle', 'listening', 'thinking', 'speaking', 'error']) {
    visualStates[voiceState] = await page.evaluate(value => {
      const shell = document.getElementById('appShell');
      const node = document.querySelector('.voice-focus-stage .voice-orb');
      shell.dataset.voiceState = value;
      const style = getComputedStyle(node);
      const before = getComputedStyle(node, '::before');
      return {
        state: shell.dataset.voiceState,
        animation: style.animationName,
        shadow: style.boxShadow,
        filter: style.filter,
        beforeAnimation: before.animationName,
        beforeBorder: before.borderColor,
      };
    }, voiceState);
  }
  assert(visualStates.listening.state === 'listening' && visualStates.listening.animation.includes('v29ListenBreath'), 'Listening-Animation fehlt.');
  assert(visualStates.thinking.state === 'thinking' && visualStates.thinking.beforeAnimation.includes('v29ThinkSpin'), 'Thinking-Zustand ist optisch nicht eigenständig.');
  assert(visualStates.speaking.state === 'speaking' && visualStates.speaking.animation.includes('v29SpeakPulse'), 'Speaking-Animation fehlt.');
  assert(visualStates.error.state === 'error' && visualStates.error.filter !== visualStates.idle.filter, 'Error-Zustand ist optisch nicht eigenständig.');
  const voiceState = await state();
  assert(voiceState.scrollWidth <= voiceState.viewportWidth + 1, `Sprachmodus hat auf ${PROFILE} horizontalen Überlauf.`);
  await page.evaluate(() => { document.getElementById('appShell').dataset.voiceState = 'speaking'; });
  await page.screenshot({ path: `${OUTPUT_DIR}/04-voice-speaking-v29-${PROFILE}.png`, fullPage: false });

  const systemSpeechCalls = await page.evaluate(() => [...(window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__ || [])]);
  assert(systemSpeechCalls.length === 0, `Systemstimme wurde ${systemSpeechCalls.length}x verwendet.`);
  if (USE_MOCK_SERVICES) {
    assert(aiRequests >= 1, 'Chat-Mock wurde nicht erreicht.');
    assert(rawTtsRequests === 0, `Cloud-TTS wurde ${rawTtsRequests}x erreicht.`);
    assert(staticAudioRequests >= 1, 'Statische Supertonic-WAV wurde im Sprachmodus nicht verwendet.');
  }
  assert(consoleErrors.length === 0, `Console-Fehler: ${consoleErrors.join(' | ')}`);
  assert(pageErrors.length === 0, `Page-Fehler: ${pageErrors.join(' | ')}`);

  await writeFile(`${OUTPUT_DIR}/summary.json`, JSON.stringify({
    profile: PROFILE,
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    identity,
    libraryHome,
    fullLibrary,
    assistantText,
    visualStates,
    aiRequests,
    rawTtsRequests,
    staticAudioRequests,
    systemSpeechCalls,
    consoleErrors,
    pageErrors,
  }, null, 2));
} finally {
  await context.close();
  await browser.close();
}
