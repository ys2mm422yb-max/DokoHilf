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

function silentWav(durationMs = 250) {
  const sampleRate = 8000;
  const samples = Math.max(1, Math.floor(sampleRate * durationMs / 1000));
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  return buffer;
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
    ? 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/138 Mobile Safari/537.36'
    : 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => pageErrors.push(error.message));

await page.addInitScript(() => {
  try { localStorage.setItem('dokohilf-privacy-ack-v1', 'yes'); } catch {}

  class FakeUtterance {
    constructor(text) {
      this.text = String(text || '');
      this.lang = '';
      this.rate = 1;
      this.pitch = 1;
      this.voice = null;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
    }
  }

  const calls = [];
  const synth = {
    paused: false,
    speaking: false,
    pending: false,
    getVoices: () => [{ name: 'DokoHilf Test Deutsch', voiceURI: 'test-de', lang: 'de-DE', localService: true }],
    cancel() { this.speaking = false; },
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    speak(utterance) {
      calls.push(String(utterance?.text || ''));
      this.speaking = true;
      queueMicrotask(() => utterance?.onstart?.());
      setTimeout(() => {
        this.speaking = false;
        utterance?.onend?.();
      }, 25);
    },
  };

  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: FakeUtterance });
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth });
  window.__DOKOHILF_TEST_SPEECH_CALLS__ = calls;
});

await page.route(/\/functions\/v1\/dokohilf-guide-audio(?:\?.*)?$/, async route => {
  const url = new URL(route.request().url());
  if (url.searchParams.has('manifest')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ buildId: '20260806-27', voice: 'Gacrux', entries: [], complete: false }),
    });
    return;
  }
  await route.fulfill({
    status: 200,
    contentType: 'audio/wav',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: silentWav(),
  });
});

await page.route(/\/functions\/v1\/dokohilf-tts(?:\?.*)?$/, async route => {
  await new Promise(resolve => setTimeout(resolve, 450));
  await route.fulfill({
    status: 200,
    contentType: 'audio/wav',
    headers: { 'Access-Control-Allow-Origin': '*', 'X-DokoHilf-Voice': 'Gacrux' },
    body: silentWav(),
  });
});

let unexpectedRouterRequests = 0;
await page.route(/\/functions\/v1\/dokohilf-ai-router(?:\?.*)?$/, async route => {
  unexpectedRouterRequests += 1;
  await route.fulfill({
    status: 500,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'detail_help_should_intercept_before_router' }),
  });
});

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.locator('[data-select-mode="chat"]').click();
  await page.locator('#workspace').waitFor({ state: 'visible' });

  await page.locator('#chatInput').fill('Hallo ich finde die Vitalwerte nicht wo sind die?');
  await page.getByRole('button', { name: 'Senden' }).click();
  const chatHelp = page.locator('#detailHelpOptionsV27');
  await chatHelp.waitFor({ state: 'visible' });
  await page.waitForFunction(() => [...document.querySelectorAll('.message.assistant .bubble p')].at(-1)?.textContent?.includes('Schau oben in die grüne Reiterleiste'));

  const firstReply = await page.locator('.message.assistant .bubble p').last().innerText();
  assert(firstReply.includes('Schau oben in die grüne Reiterleiste'), 'Detailhilfe startet nicht mit der kurzen Orientierung.');
  assert(firstReply.includes('Doku-Erweitert'), 'Detaillierte Vitalwerte-Orientierung nennt Doku-Erweitert nicht.');
  assert(!/erledigt|tun nicht so|markiere/i.test(firstReply), 'Interne Guide-Zustandsformulierungen werden dem Nutzer noch angezeigt.');
  assert(await chatHelp.locator('[data-detail-help-value]').count() === 4, 'Orientierungsfrage bietet nicht vier strukturierte Antworten.');
  assert((await page.locator('#guideProgressStep').innerText()).includes('Schritt 1 von 2'), 'Detailhilfe hält Vitalwerte nicht bei Schritt 1 von 2.');
  const commandDisplay = await page.locator('#commandRow').evaluate(node => getComputedStyle(node).display);
  assert(commandDisplay === 'none', 'Weiter ist während der Detailhilfe noch sichtbar.');

  await page.getByRole('button', { name: 'Doku-Erweitert offen' }).click();
  await page.waitForFunction(() => document.querySelector('#guideProgressStep')?.textContent?.includes('Schritt 2 von 2'));
  await page.waitForFunction(() => [...document.querySelectorAll('.message.assistant .bubble p')].at(-1)?.textContent?.includes('Siehst du Vitalwerte'));
  const secondReply = await page.locator('.message.assistant .bubble p').last().innerText();
  assert(secondReply.includes('Vitalwerte Sammelerf.'), 'Zweiter Orientierungsschritt erklärt den getrennten Sammel-Eintrag nicht.');
  assert(secondReply.length < 180, 'Zweiter Orientierungsschritt ist wieder unnötig lang.');

  await page.getByRole('button', { name: 'Vitalwerte fehlt' }).click();
  await page.waitForFunction(() => [...document.querySelectorAll('.message.assistant .bubble p')].at(-1)?.textContent?.includes('Prüfe den Einstieg noch einmal'));
  const missingReply = await page.locator('.message.assistant .bubble p').last().innerText();
  assert(missingReply.includes('Prüfe den Einstieg noch einmal'), 'Fehlender Menüpunkt bietet keinen klaren nächsten sicheren Schritt.');
  assert(!missingReply.includes('bestätigten Alternativ-Klickweg'), 'Interne Fachgrenzen-Sprache wird weiterhin wortwörtlich angezeigt.');
  assert((await page.locator('#guideProgressStep').innerText()).includes('Schritt 2 von 2'), 'Fehlersuche hat den aktuellen Guide-Schritt unzulässig verändert.');

  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  assert(dimensions.width <= dimensions.viewport + 1, `Detailhilfe hat horizontalen Overflow: ${dimensions.width} > ${dimensions.viewport}`);
  await page.screenshot({ path: `${OUTPUT_DIR}/detail-help-chat-${PROFILE}.png`, fullPage: true });

  await page.evaluate(() => window.DokoHilf?.resetConversation?.({ keepMode: false }));
  await page.locator('#startScreen').waitFor({ state: 'visible' });
  await page.locator('[data-select-mode="voice"]').click();
  await page.locator('.voice-focus-stage').waitFor({ state: 'visible' });
  await page.waitForTimeout(250);
  const speechCallsBefore = await page.evaluate(() => window.__DOKOHILF_TEST_SPEECH_CALLS__?.length || 0);

  await page.evaluate(() => window.DokoHilf?.sendMessage?.('Ich finde die Vitalwerte nicht wo sind die?', { fromVoice: true }));
  const voiceHelp = page.locator('#voiceDetailHelpOptionsV27');
  await voiceHelp.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('#voiceFocusText')?.textContent?.includes('Schau oben in die grüne Reiterleiste'));
  await page.waitForFunction(before => (window.__DOKOHILF_TEST_SPEECH_CALLS__?.length || 0) > before, speechCallsBefore);

  const voiceText = await page.locator('#voiceFocusText').innerText();
  assert(voiceText.includes('Schau oben in die grüne Reiterleiste'), 'Voice-Modus zeigt nicht die kurze Detailfrage.');
  assert(!/erledigt|tun nicht so|markiere/i.test(voiceText), 'Voice-Modus zeigt weiterhin interne Zustandsformulierungen.');
  assert(await voiceHelp.locator('[data-detail-help-value]').count() === 4, 'Voice-Modus verwendet nicht dieselben strukturierten Detailfragen.');
  assert(await page.locator('#appShell').getAttribute('data-detail-help') === 'true', 'Voice-Modus setzt den Detailhilfe-Zustand nicht.');

  const speechCalls = await page.evaluate(() => [...(window.__DOKOHILF_TEST_SPEECH_CALLS__ || [])]);
  assert(speechCalls.slice(speechCallsBefore).some(text => text.includes('Schau oben in die grüne Reiterleiste')), 'Folgeantwort wurde nicht über die sofortige Gerätestimme gesprochen.');

  const geometry = await page.evaluate(() => {
    const rect = selector => document.querySelector(selector)?.getBoundingClientRect();
    const optionRects = [...document.querySelectorAll('#voiceDetailHelpOptionsV27 [data-detail-help-value]')].map(node => node.getBoundingClientRect());
    const actions = document.querySelector('#voiceFocusActions');
    return {
      instruction: rect('.voice-focus-instruction'),
      panel: rect('#voiceDetailHelpOptionsV27'),
      orb: rect('.voice-focus-stage .voice-orb'),
      actionsDisplay: actions ? getComputedStyle(actions).display : 'missing',
      optionRects: optionRects.map(item => ({ x: item.x, y: item.y, width: item.width, height: item.height })),
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  assert(geometry.actionsDisplay === 'none', 'Voice-Weiter/Nochmal/Hilfe-Aktionen konkurrieren noch mit der Detailfrage.');
  assert(geometry.orb?.width <= 110, `Mikrofon bleibt in Detailhilfe zu groß: ${geometry.orb?.width}`);
  assert(geometry.instruction && geometry.panel && geometry.instruction.bottom <= geometry.panel.top + 1, 'Frage und Auswahlkarten überlappen sich.');
  assert(geometry.panel && geometry.orb && geometry.panel.bottom <= geometry.orb.top + 1, 'Auswahlkarten und Mikrofon überlappen sich.');
  assert(geometry.optionRects.length === 4, 'Vier Detailoptionen fehlen im Voice-Layout.');
  assert(Math.abs(geometry.optionRects[0].y - geometry.optionRects[1].y) < 2, 'Voice-Optionen sind nicht kompakt zweispaltig angeordnet.');
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
    speechCalls,
    geometry,
    consoleErrors,
    pageErrors,
  }, null, 2));
} finally {
  await context.close();
  await browser.close();
}
