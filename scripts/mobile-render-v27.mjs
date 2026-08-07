import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE_URL = process.env.DOKOHILF_RENDER_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.DOKOHILF_RENDER_OUTPUT || 'artifacts/mobile-v27';
const USE_MOCK_SERVICES = process.env.DOKOHILF_UI_MOCK === '1';
const PROFILE = process.env.DOKOHILF_MOBILE_PROFILE || 'ios';
const VIEWPORT_WIDTH = Number(process.env.DOKOHILF_VIEWPORT_WIDTH || 393);
const VIEWPORT_HEIGHT = Number(process.env.DOKOHILF_VIEWPORT_HEIGHT || 852);
const DEVICE_SCALE_FACTOR = Number(process.env.DOKOHILF_DEVICE_SCALE_FACTOR || 2);
const USER_AGENT = PROFILE === 'android'
  ? 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
  : 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';

function silentWav() {
  const samples = 2400;
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8, 'ascii');
  buffer.write('fmt ', 12, 'ascii');
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(24000, 24);
  buffer.writeUInt32LE(48000, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36, 'ascii');
  buffer.writeUInt32LE(dataSize, 40);
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
  reducedMotion: 'reduce',
  userAgent: USER_AGENT,
});
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', error => pageErrors.push(error.message));

if (USE_MOCK_SERVICES) {
  const reply = 'Öffne beim gewünschten Bewohner den Bereich „Berichte“.';
  await page.route(/\/functions\/v1\/dokohilf-ai(?:-router)?(?:\?.*)?$/, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        reply,
        spokenText: reply,
        nextSpokenText: 'Klicke oben links auf das grüne Plus für einen neuen Berichtseintrag.',
        guideSlug: 'bericht-anlegen',
        guideTitle: 'Bericht anlegen',
        guideStep: 1,
        guideStepCount: 7,
        source: 'ui-render-mock',
      }),
    });
  });
  await page.route(/\/functions\/v1\/dokohilf-guide-audio(?:\?.*)?$/, async route => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('manifest') === '1') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          schemaVersion: 1,
          buildId: '20260806-27',
          voice: 'Gacrux',
          source: 'ui-render-mock',
          entryCount: 0,
          entries: [],
        }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'audio/wav', headers: { 'Access-Control-Allow-Origin': '*' }, body: silentWav() });
  });
  await page.route(/\/functions\/v1\/dokohilf-tts(?:\?.*)?$/, async route => {
    const wav = silentWav();
    await route.fulfill({
      status: 200,
      contentType: 'audio/wav',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-DokoHilf-Voice': 'Gacrux',
        'X-DokoHilf-TTS-Model': 'ui-render-mock',
        'X-DokoHilf-TTS-API': 'ui-render-mock',
        'X-DokoHilf-Voice-Mode': 'ui-render-mock',
        'X-DokoHilf-Voice-Style': 'ui-render-mock',
        'X-DokoHilf-TTS-Latency': '0',
        'X-DokoHilf-TTS-Cache': 'hit',
      },
      body: wav,
    });
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function stableReload() {
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
      return;
    } catch (error) {
      lastError = error;
      if (!/ERR_ABORTED|frame was detached/i.test(String(error?.message || error))) throw error;
      await page.waitForTimeout(200);
      if (await page.locator('#startTitle').isVisible().catch(() => false)) return;
    }
  }
  throw lastError || new Error('Stabile Neuladung fehlgeschlagen.');
}

async function openDeterministicFirstStart() {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.locator('#startTitle').waitFor({ state: 'visible' });
  await page.evaluate(() => localStorage.removeItem('dokohilf-privacy-ack-v1'));
  await stableReload();
  await page.locator('#startTitle').waitFor({ state: 'visible' });
  const ackButton = page.locator('[data-privacy-ack]');
  await ackButton.waitFor({ state: 'visible', timeout: 8_000 });
  return ackButton;
}

async function layoutState() {
  return page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    mode: document.getElementById('appShell')?.dataset.mode || null,
    voiceState: document.getElementById('appShell')?.dataset.voiceState || null,
  }));
}

try {
  const privacyButton = await openDeterministicFirstStart();
  const privacyDialog = page.locator('#privacyAckV27');
  assert(await privacyDialog.isVisible(), 'Erststart-Datenschutzbestätigung fehlt.');
  await page.screenshot({ path: `${OUTPUT_DIR}/00-privacy-first-start-${PROFILE}.png`, fullPage: false });
  await privacyButton.click();
  await privacyDialog.waitFor({ state: 'detached' });

  await stableReload();
  await page.locator('#startTitle').waitFor({ state: 'visible' });
  assert(await page.locator('#privacyAckV27').count() === 0, 'Datenschutzbestätigung erscheint nach Bestätigung erneut.');
  assert(await page.evaluate(() => localStorage.getItem('dokohilf-privacy-ack-v1') === 'yes'), 'Das einzige unpersönliche Datenschutz-Flag wurde nicht gespeichert.');

  const identity = await page.evaluate(() => ({
    title: document.title,
    build: document.querySelector('meta[name="dokohilf-build"]')?.content,
    version: document.getElementById('buildPill')?.textContent?.trim(),
    htmlBackground: getComputedStyle(document.documentElement).backgroundColor,
    bodyBackground: getComputedStyle(document.body).backgroundImage,
    bodyColor: getComputedStyle(document.body).color,
  }));
  assert(identity.title.includes('DokoHilf'), 'Falsche Seitenidentität.');
  assert(identity.build === '20260806-27', `Falscher Build: ${identity.build}`);
  assert(identity.version === 'KI · v27', `Falscher sichtbarer Marker: ${identity.version}`);
  assert(/rgb\((?:0|1|2|3|4|5|6|7|8|9|1\d|2\d),\s*(?:0|1|2|3|4|5|6|7|8|9|1\d|2\d),\s*(?:0|1|2|3|4|5|6|7|8|9|1\d|2\d)\)/.test(identity.htmlBackground), `Grundfläche ist nicht dunkel: ${identity.htmlBackground}`);
  assert(identity.bodyBackground !== 'none', 'Dunkle Hintergrundgestaltung fehlt.');

  const startLayout = await layoutState();
  assert(startLayout.documentWidth <= startLayout.viewportWidth + 1, `Startseite hat auf ${PROFILE} horizontalen Überlauf.`);
  assert(await page.locator('[data-select-mode="voice"]').isVisible(), 'Sprechen-Karte fehlt.');
  assert(await page.locator('[data-select-mode="chat"]').isVisible(), 'Schreiben-Karte fehlt.');
  await page.waitForFunction(() => document.querySelectorAll('.examples button[data-direct-guide]').length === 7, null, { timeout: 8_000 });
  assert(await page.locator('.examples button[data-direct-guide]').count() === 7, 'Die sieben sichtbaren häufigen Abläufe sind nicht vollständig als direkte Anleitungen verdrahtet.');
  assert(await page.locator('.examples button[data-prompt]').count() === 0, 'Alte Chat-Prompts haben die direkten Hauptmenü-Abläufe wieder überschrieben.');
  assert(await page.getByRole('button', { name: 'Übergabe anzeigen' }).isVisible(), 'Direkte Übergabe-Anleitung fehlt.');
  await page.screenshot({ path: `${OUTPUT_DIR}/01-start-dark-${PROFILE}.png`, fullPage: true });

  // Häufige Abläufe öffnen die vollständige Anleitung direkt – ohne KI-Roundtrip und ohne Chat dazwischen.
  await page.getByRole('button', { name: 'Bericht anlegen' }).click();
  const directGuide = page.locator('#directGuideView');
  await directGuide.waitFor({ state: 'visible' });
  assert(await page.locator('#workspace').isHidden(), 'Direkte Anleitung öffnet zusätzlich den Chat-Arbeitsbereich.');
  assert((await layoutState()).mode === 'direct-guide', 'Direkte Anleitung setzt keinen eigenen UI-Modus.');
  assert(await directGuide.locator('.direct-guide-step').count() === 12, 'Bericht-Anleitung ist nicht vollständig mit 12 bestätigten Schritten sichtbar.');
  const directGuideLabel = directGuide.locator('.direct-guide-heading > span').first();
  await directGuideLabel.waitFor({ state: 'visible' });
  assert((await directGuideLabel.textContent())?.trim() === 'Komplette Anleitung', 'Direkte Anleitung ist nicht eindeutig als komplette Anleitung gekennzeichnet.');
  const directGuideLayout = await layoutState();
  assert(directGuideLayout.documentWidth <= directGuideLayout.viewportWidth + 1, `Direkte Anleitung hat auf ${PROFILE} horizontalen Überlauf.`);
  const directBack = await directGuide.locator('.direct-guide-back').boundingBox();
  assert(directBack && directBack.width >= 40 && directBack.height >= 40, `Zurück-Touchziel ist auf ${PROFILE} zu klein.`);
  await page.screenshot({ path: `${OUTPUT_DIR}/02-direct-guide-${PROFILE}.png`, fullPage: true });

  await page.locator('[data-direct-guide-close]').first().click();
  await page.locator('#startScreen').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Vitalwerte erfassen' }).click();
  await directGuide.waitFor({ state: 'visible' });
  assert(await directGuide.locator('[data-direct-guide-variant]').count() === 2, 'Vitalwerte bietet nicht beide bestätigten Varianten an.');
  await directGuide.locator('[data-direct-guide-variant="vitalSammel"]').click();
  assert(await directGuide.locator('.direct-guide-step').count() === 6, 'Sammelerfassung zeigt nicht die vollständigen sechs bestätigten Schritte.');
  await page.locator('[data-direct-guide-close]').first().click();
  await page.locator('#startScreen').waitFor({ state: 'visible' });

  await page.getByRole('button', { name: 'Übergabe anzeigen' }).click();
  await directGuide.waitFor({ state: 'visible' });
  assert(await directGuide.locator('.direct-guide-step').count() === 4, 'Übergabe zeigt nicht die vier bestätigten Schritte.');
  await page.locator('[data-direct-guide-close]').first().click();
  await page.locator('#startScreen').waitFor({ state: 'visible' });

  // Der Schreibmodus bleibt als eigener kompakter Chat erreichbar.
  await page.locator('[data-select-mode="chat"]').click();
  await page.locator('#workspace').waitFor({ state: 'visible' });
  await page.locator('.chat-head').waitFor({ state: 'visible' });
  const chatEyebrow = page.locator('.chat-eyebrow');
  assert((await chatEyebrow.textContent())?.trim() === 'DokoHilf Chat', 'Kompakte Chat-Kennung fehlt.');
  assert((await page.locator('.chat-head h1').textContent())?.trim() === 'Schreib deine Frage.', 'Alte Build-27-Schicht überschreibt den kompakten Chatkopf.');
  const chatLayout = await layoutState();
  assert(chatLayout.documentWidth <= chatLayout.viewportWidth + 1, `Chat hat auf ${PROFILE} horizontalen Überlauf.`);
  const chatHeadBox = await page.locator('.chat-head').boundingBox();
  assert(chatHeadBox && chatHeadBox.height <= 190, `Chat-Kopf ist auf ${PROFILE} zu hoch: ${chatHeadBox?.height}`);
  await page.screenshot({ path: `${OUTPUT_DIR}/03-chat-clean-${PROFILE}.png`, fullPage: true });

  // Bestehender schrittweiser Chat und die Sprachbühne bleiben Regressionstests.
  await page.getByRole('button', { name: 'Visite', exact: true }).click();
  await page.locator('.message.assistant .bubble').last().waitFor({ state: 'visible', timeout: 20_000 });
  await page.waitForTimeout(350);

  const progress = page.locator('.guide-progress').first();
  await progress.waitFor({ state: 'visible', timeout: 15_000 });
  const progressBox = await progress.boundingBox();
  assert(progressBox && progressBox.height <= 92, `Ablaufsteuerung ist zu hoch: ${progressBox?.height}`);
  assert(await page.locator('.guide-progress-menu summary').isVisible(), 'Drei-Punkte-Menü fehlt.');

  const visibleCommands = await page.locator('#commandRow button').evaluateAll(buttons => buttons.filter(button => getComputedStyle(button).display !== 'none' && !button.hidden).map(button => button.textContent?.trim()));
  assert(visibleCommands.length === 2, `Erwartet zwei sichtbare Aktionen, gefunden: ${visibleCommands.join(', ')}`);
  assert(visibleCommands.includes('Weiter'), 'Aktion Weiter fehlt.');
  assert(visibleCommands.some(label => /Hilfe/i.test(label || '')), 'Hilfe-Aktion fehlt.');

  const visibleText = await page.locator('body').innerText();
  assert(!/In Übungen nur Fantasie|Im öffentlichen Test nur Fantasie/i.test(visibleText), 'Wiederholter Fantasiedaten-Hinweis ist im Guide sichtbar.');

  await page.locator('[data-switch-mode="voice"]').click();
  const voiceStage = page.locator('.voice-focus-stage');
  await voiceStage.waitFor({ state: 'visible', timeout: 15_000 });
  assert(await page.locator('#workspace').isHidden(), 'Der alte Arbeitsbereich bleibt im Vollbild-Sprachmodus sichtbar.');
  await page.waitForTimeout(250);

  const topbarBox = await page.locator('.topbar').boundingBox();
  const stageBox = await voiceStage.boundingBox();
  const instruction = page.locator('.voice-focus-instruction');
  await instruction.waitFor({ state: 'visible', timeout: 8_000 });
  const instructionBox = await instruction.boundingBox();
  assert(topbarBox && stageBox && stageBox.y >= topbarBox.y + topbarBox.height, `Sprachfläche liegt auf ${PROFILE} unter der Kopfzeile: topbar ${JSON.stringify(topbarBox)}, stage ${JSON.stringify(stageBox)}`);
  assert(!(await page.locator('.build-status').isVisible().catch(() => false)), 'Versionsstatus überlagert den fokussierten Sprachmodus.');

  const shell = page.locator('#appShell');
  await shell.evaluate(element => { element.dataset.voiceState = 'idle'; });
  const idleBox = await page.locator('.voice-focus-stage .voice-orb').boundingBox();
  assert(idleBox && idleBox.width <= 90, `Mikrofon ist im Leerlauf zu groß: ${idleBox?.width}`);
  await page.screenshot({ path: `${OUTPUT_DIR}/04-voice-idle-${PROFILE}.png`, fullPage: false });

  await shell.evaluate(element => { element.dataset.voiceState = 'listening'; });
  await page.waitForTimeout(300);
  const listeningBox = await page.locator('.voice-focus-stage .voice-orb').boundingBox();
  const actionsBox = await page.locator('.voice-focus-actions').boundingBox();
  assert(listeningBox && idleBox && listeningBox.width >= idleBox.width + 40, `Mikrofon wird beim Zuhören nicht deutlich größer: idle ${idleBox?.width}, listening ${listeningBox?.width}`);
  assert(listeningBox && listeningBox.width <= 140, `Mikrofon dominiert die mobile Fläche noch zu stark: ${listeningBox?.width}`);
  assert(instructionBox && listeningBox, 'Schrittkarte oder Mikrofon konnte nicht vermessen werden.');
  const instructionToOrbGap = listeningBox.y - (instructionBox.y + instructionBox.height);
  assert(instructionToOrbGap >= 8, `Schrittkarte und Mikrofon liegen zu dicht übereinander: ${instructionToOrbGap}`);
  assert(instructionToOrbGap <= 72, `Zwischen Schrittkarte und Mikrofon bleibt zu viel tote Fläche: ${instructionToOrbGap}`);
  const orbCenterY = listeningBox.y + listeningBox.height / 2;
  assert(stageBox && orbCenterY <= stageBox.y + stageBox.height * 0.62, `Mikrofon sitzt weiterhin zu tief: center ${orbCenterY}, stage ${JSON.stringify(stageBox)}`);
  assert(actionsBox && stageBox && actionsBox.y + actionsBox.height <= stageBox.y + stageBox.height + 1, 'Aktionsleiste ragt aus der Sprachbühne heraus.');

  const voiceLayout = await layoutState();
  assert(voiceLayout.documentWidth <= voiceLayout.viewportWidth + 1, `Sprachmodus hat auf ${PROFILE} horizontalen Überlauf.`);
  await page.screenshot({ path: `${OUTPUT_DIR}/05-voice-listening-balanced-${PROFILE}.png`, fullPage: false });

  assert(consoleErrors.length === 0, `Console-Fehler: ${consoleErrors.join(' | ')}`);
  assert(pageErrors.length === 0, `Page-Fehler: ${pageErrors.join(' | ')}`);

  const report = {
    passed: true,
    profile: PROFILE,
    url: BASE_URL,
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT, deviceScaleFactor: DEVICE_SCALE_FACTOR },
    mockServices: USE_MOCK_SERVICES,
    identity,
    privacyAcknowledgementStored: true,
    directGuideButtonCount: 7,
    directGuideStepCount: 12,
    handoverStepCount: 4,
    vitalVariantCount: 2,
    chatHeadHeight: chatHeadBox?.height,
    visibleCommands,
    progressHeight: progressBox?.height,
    topbarBottom: topbarBox ? topbarBox.y + topbarBox.height : null,
    voiceStageTop: stageBox?.y,
    instructionBottom: instructionBox ? instructionBox.y + instructionBox.height : null,
    idleOrbWidth: idleBox?.width,
    listeningOrbWidth: listeningBox?.width,
    instructionToOrbGap,
    listeningOrbCenterY: orbCenterY,
    consoleErrors,
    pageErrors,
  };
  await writeFile(`${OUTPUT_DIR}/report.json`, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`DokoHilf mobile Renderprüfung ${PROFILE} bestanden.`);
} catch (error) {
  await page.screenshot({ path: `${OUTPUT_DIR}/failure-${PROFILE}.png`, fullPage: true }).catch(() => {});
  await writeFile(`${OUTPUT_DIR}/report.json`, `${JSON.stringify({ passed: false, profile: PROFILE, error: error.message, consoleErrors, pageErrors }, null, 2)}\n`, 'utf8');
  throw error;
} finally {
  await browser.close();
}
