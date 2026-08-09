import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PROFILE = process.env.DOKOHILF_MOBILE_PROFILE || 'ios';
const WIDTH = Number(process.env.DOKOHILF_VIEWPORT_WIDTH || (PROFILE === 'android' ? 412 : 393));
const HEIGHT = Number(process.env.DOKOHILF_VIEWPORT_HEIGHT || (PROFILE === 'android' ? 915 : 852));
const BASE_URL = process.env.DOKOHILF_RENDER_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.DOKOHILF_RENDER_OUTPUT || `artifacts/report-conditional-v29/${PROFILE}`;

function assert(condition, message) { if (!condition) throw new Error(message); }

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block',
  userAgent: PROFILE === 'android'
    ? 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/139 Mobile Safari/537.36'
    : 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();
const consoleErrors = []; const pageErrors = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => pageErrors.push(error.message));
await page.addInitScript(() => { try { localStorage.setItem('dokohilf-privacy-ack-v1', 'yes'); } catch {} });

const spokenReply = 'Öffne „Doku-Erweitert“ und wähle „Visiten“. Bist du dort?';
const spokenText = 'Öffne „Doku-Erweitert“ und wähle „Visiten“.';
let rawTtsRequests = 0;
let staticAudioRequests = 0;
const aiPayload = JSON.stringify({ reply: spokenReply, spokenText, guideSlug: 'visiten-oeffnen', guideStep: 1, guideStepCount: 2 });

for (const pattern of ['**/functions/v1/dokohilf-chat-router', '**/functions/v1/dokohilf-ai-router', '**/functions/v1/dokohilf-ai']) {
  await page.route(pattern, async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: aiPayload });
  });
}
await page.route('**/assets/guide-audio-catalog.json*', async route => {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ voice: 'Supertonic-F1', entries: [{ index: 33, text: spokenText, file: 'assets/audio/guides/033.wav' }] }) });
});
await page.route(/\/assets\/audio\/guides\/033\.wav(?:\?.*)?$/, async route => {
  staticAudioRequests += 1;
  await route.fulfill({ status: 200, contentType: 'audio/wav', body: Buffer.alloc(128) });
});
await page.route('**/functions/v1/dokohilf-tts', async route => {
  rawTtsRequests += 1;
  await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'tts_network_must_not_be_called_in_v29' }) });
});

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  assert((await page.locator('#buildPill').innerText()).includes('v29'), 'Test läuft nicht auf v29.');

  await page.waitForFunction(() => {
    const examples = document.querySelector('.examples');
    return window.__DOKOHILF_GUIDE_LIBRARY_V29__ === true
      && examples?.dataset.v29GuideLibrary === 'true'
      && examples.querySelector(':scope > span')?.textContent?.trim() === 'Häufig genutzt';
  });
  const reportCard = page.locator('.v29-frequent-guide[data-v29-open-guide="bericht-neu"]');
  await reportCard.waitFor({ state: 'visible' });
  await reportCard.click();
  const view = page.locator('#directGuideView');
  await view.waitFor({ state: 'visible' });
  const condition = view.locator('.report-protocol-condition');
  await condition.waitFor({ state: 'visible' });

  const conditionText = await condition.innerText();
  assert(conditionText.includes('Fallgespräch'), 'Fallgespräch fehlt im sichtbaren Sonderfall.');
  assert(conditionText.includes('Sturzprotokoll'), 'Sturzprotokoll fehlt im sichtbaren Sonderfall.');
  assert(conditionText.includes('Schritte 6–9'), 'Überspringbereich 6–9 fehlt.');
  assert(conditionText.includes('Schritt 10'), 'Sprungziel Schritt 10 fehlt.');

  const conditionalSteps = view.locator('.direct-guide-step.report-protocol-step');
  assert(await conditionalSteps.count() === 4, 'Es müssen genau vier Sonderfall-Schritte 6–9 markiert sein.');
  const numbers = await conditionalSteps.locator('.direct-guide-number').allInnerTexts();
  assert(JSON.stringify(numbers) === JSON.stringify(['6', '7', '8', '9']), `Falsche Sonderfall-Schritte: ${numbers.join(', ')}`);

  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    condition: document.querySelector('.report-protocol-condition')?.getBoundingClientRect().toJSON(),
    steps: [...document.querySelectorAll('.direct-guide-step.report-protocol-step')].map(node => node.getBoundingClientRect().toJSON()),
  }));
  assert(geometry.scrollWidth <= geometry.viewportWidth + 1, `Horizontaler Overflow: ${geometry.scrollWidth} > ${geometry.viewportWidth}`);
  for (const rect of [geometry.condition, ...geometry.steps]) assert(rect && rect.left >= -1 && rect.right <= geometry.viewportWidth + 1, 'Sonderfall-Element ragt horizontal aus dem Viewport.');

  await page.evaluate(async ({ reply }) => {
    await fetch('https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai-router', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Visite' }] }),
    });
    const response = await fetch('https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: reply }),
    });
    window.__REPORT_VOICE_RESULT__ = {
      ok: response.ok,
      voice: response.headers.get('X-DokoHilf-Voice'),
      mode: response.headers.get('X-DokoHilf-Voice-Mode'),
      state: window.DokoHilfStaticFirstVoiceV28?.getState?.(),
    };
  }, { reply: spokenReply });

  const voiceResult = await page.evaluate(() => window.__REPORT_VOICE_RESULT__);
  assert(voiceResult?.ok === true, 'Gemappter spokenText liefert kein statisches Audio.');
  assert(voiceResult?.voice === 'Supertonic-F1', `Falsche Stimme: ${voiceResult?.voice}`);
  assert(voiceResult?.mode === 'static-supertonic-only-v29', `Falscher Voice-Modus: ${voiceResult?.mode}`);
  assert(voiceResult?.state?.lastSpokenMapping === spokenText, 'Router-spokenText wurde nicht als Audioquelle übernommen.');
  assert(staticAudioRequests === 1, `Statisches Supertonic-Audio wurde ${staticAudioRequests}x geladen.`);
  assert(rawTtsRequests === 0, `TTS-Netzwerkpfad wurde ${rawTtsRequests}x erreicht.`);

  assert(consoleErrors.length === 0, `Console-Fehler: ${consoleErrors.join(' | ')}`);
  assert(pageErrors.length === 0, `Page-Fehler: ${pageErrors.join(' | ')}`);
  await writeFile(`${OUTPUT_DIR}/summary.json`, JSON.stringify({ profile: PROFILE, viewport: { width: WIDTH, height: HEIGHT }, conditionText, conditionalStepNumbers: numbers, geometry, voiceResult, staticAudioRequests, rawTtsRequests, consoleErrors, pageErrors }, null, 2));
} finally {
  await context.close();
  await browser.close();
}
