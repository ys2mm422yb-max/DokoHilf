import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE_URL = process.env.DOKOHILF_RENDER_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.DOKOHILF_RENDER_OUTPUT || 'artifacts/mobile-v27';

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  colorScheme: 'dark',
  locale: 'de-DE',
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', error => pageErrors.push(error.message));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function layoutState() {
  return page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    mode: document.getElementById('appShell')?.dataset.mode || null,
    voiceState: document.getElementById('appShell')?.dataset.voiceState || null,
  }));
}

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.locator('#startTitle').waitFor({ state: 'visible' });

  const privacyDialog = page.locator('#privacyAckV27');
  await privacyDialog.waitFor({ state: 'visible', timeout: 5_000 });
  assert(await page.getByRole('button', { name: 'Verstanden' }).isVisible(), 'Erststart-Datenschutzbestätigung fehlt.');
  await page.screenshot({ path: `${OUTPUT_DIR}/00-privacy-first-start.png`, fullPage: false });
  await page.getByRole('button', { name: 'Verstanden' }).click();
  await privacyDialog.waitFor({ state: 'detached' });

  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#startTitle').waitFor({ state: 'visible' });
  assert(await page.locator('#privacyAckV27').count() === 0, 'Datenschutzbestätigung erscheint innerhalb derselben App-Sitzung erneut.');
  assert(await page.evaluate(() => sessionStorage.getItem('dokohilf-privacy-ack-v1') === 'yes'), 'Datenschutzbestätigung wurde nicht sitzungsgebunden gespeichert.');

  const identity = await page.evaluate(() => ({
    title: document.title,
    build: document.querySelector('meta[name="dokohilf-build"]')?.content,
    version: document.getElementById('buildPill')?.textContent?.trim(),
    htmlBackground: getComputedStyle(document.documentElement).backgroundColor,
    bodyColor: getComputedStyle(document.body).color,
  }));
  assert(identity.title.includes('DokoHilf'), 'Falsche Seitenidentität.');
  assert(identity.build === '20260806-27', `Falscher Build: ${identity.build}`);
  assert(identity.version === 'KI · v27', `Falscher sichtbarer Marker: ${identity.version}`);
  assert(/rgb\((?:0|1|2|3|4|5|6|7|8|9|1\d|2\d),\s*(?:0|1|2|3|4|5|6|7|8|9|1\d|2\d),\s*(?:0|1|2|3|4|5|6|7|8|9|1\d|2\d)\)/.test(identity.htmlBackground), `Grundfläche ist nicht dunkel: ${identity.htmlBackground}`);

  const startLayout = await layoutState();
  assert(startLayout.documentWidth <= startLayout.viewportWidth + 1, 'Startseite hat horizontalen Überlauf.');
  assert(await page.locator('[data-select-mode="voice"]').isVisible(), 'Sprechen-Karte fehlt.');
  assert(await page.locator('[data-select-mode="chat"]').isVisible(), 'Schreiben-Karte fehlt.');
  assert(await page.getByRole('button', { name: 'Bericht anlegen' }).isVisible(), 'Häufiger Ablauf Bericht fehlt.');
  await page.screenshot({ path: `${OUTPUT_DIR}/01-start-dark-iphone.png`, fullPage: true });

  await page.getByRole('button', { name: 'Bericht anlegen' }).click();
  await page.locator('#workspace').waitFor({ state: 'visible' });
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
  const chatLayout = await layoutState();
  assert(chatLayout.documentWidth <= chatLayout.viewportWidth + 1, 'Chat hat horizontalen Überlauf.');
  await page.screenshot({ path: `${OUTPUT_DIR}/02-chat-compact-iphone.png`, fullPage: true });

  await page.locator('.guide-progress-menu summary').click();
  assert(await page.getByRole('button', { name: /Neu starten/i }).isVisible(), 'Neu starten fehlt im Menü.');
  assert(await page.getByRole('button', { name: /Anderer Ablauf/i }).isVisible(), 'Anderer Ablauf fehlt im Menü.');

  await page.evaluate(() => {
    document.getElementById('homeButton')?.click();
  });
  await page.locator('#startScreen').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /Sprechen/i }).first().click();
  await page.locator('#workspace').waitFor({ state: 'visible' });
  await page.waitForTimeout(200);

  const shell = page.locator('#appShell');
  await shell.evaluate(element => { element.dataset.voiceState = 'idle'; });
  const idleBox = await page.locator('.voice-focus-stage .voice-orb').boundingBox();
  assert(idleBox && idleBox.width <= 112, `Mikrofon ist im Leerlauf zu groß: ${idleBox?.width}`);
  await page.screenshot({ path: `${OUTPUT_DIR}/03-voice-idle-iphone.png`, fullPage: false });

  await shell.evaluate(element => { element.dataset.voiceState = 'listening'; });
  await page.waitForTimeout(300);
  const listeningBox = await page.locator('.voice-focus-stage .voice-orb').boundingBox();
  assert(listeningBox && idleBox && listeningBox.width >= idleBox.width + 35, `Mikrofon wird beim Zuhören nicht deutlich größer: idle ${idleBox?.width}, listening ${listeningBox?.width}`);
  const voiceLayout = await layoutState();
  assert(voiceLayout.documentWidth <= voiceLayout.viewportWidth + 1, 'Sprachmodus hat horizontalen Überlauf.');
  await page.screenshot({ path: `${OUTPUT_DIR}/04-voice-listening-iphone.png`, fullPage: false });

  assert(consoleErrors.length === 0, `Console-Fehler: ${consoleErrors.join(' | ')}`);
  assert(pageErrors.length === 0, `Page-Fehler: ${pageErrors.join(' | ')}`);

  const report = {
    passed: true,
    url: BASE_URL,
    viewport: { width: 393, height: 852, deviceScaleFactor: 2 },
    identity,
    privacyAcknowledgementSessionOnly: true,
    visibleCommands,
    progressHeight: progressBox?.height,
    idleOrbWidth: idleBox?.width,
    listeningOrbWidth: listeningBox?.width,
    consoleErrors,
    pageErrors,
  };
  await writeFile(`${OUTPUT_DIR}/report.json`, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log('DokoHilf mobile Renderprüfung bestanden.');
} catch (error) {
  await page.screenshot({ path: `${OUTPUT_DIR}/failure.png`, fullPage: true }).catch(() => {});
  await writeFile(`${OUTPUT_DIR}/report.json`, `${JSON.stringify({ passed: false, error: error.message, consoleErrors, pageErrors }, null, 2)}\n`, 'utf8');
  throw error;
} finally {
  await browser.close();
}
