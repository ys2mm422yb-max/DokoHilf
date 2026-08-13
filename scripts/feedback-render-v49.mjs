import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const url = process.env.DOKOHILF_RENDER_URL || 'http://127.0.0.1:4173/';
const output = process.env.DOKOHILF_RENDER_OUTPUT || 'artifacts/feedback-v49';
const width = Number(process.env.DOKOHILF_VIEWPORT_WIDTH || 393);
const height = Number(process.env.DOKOHILF_VIEWPORT_HEIGHT || 852);

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
const page = await context.newPage();

try {
  await page.goto(url, { waitUntil: 'networkidle' });

  const privacyAck = page.getByRole('button', { name: 'Verstanden' });
  if (await privacyAck.isVisible().catch(() => false)) {
    await privacyAck.click();
    await page.locator('#privacyAckV27').waitFor({ state: 'detached' });
  }

  const trigger = page.getByRole('button', { name: 'Fehler oder Hinweis melden' });
  await trigger.waitFor({ state: 'visible' });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Fehler oder Hinweis melden' });
  await dialog.waitFor({ state: 'visible' });
  await page.getByLabel('Kategorie').waitFor({ state: 'visible' });
  await page.getByLabel('Kurze Beschreibung').waitFor({ state: 'visible' });
  await page.getByText('Aktuelle Stelle mitsenden', { exact: true }).waitFor({ state: 'visible' });
  await page.getByText(/keine Namen, Bewohner-\/Klienten- oder Gesundheitsdaten/i).waitFor({ state: 'visible' });

  const snapshot = await page.evaluate(() => ({
    revision: window.DokoHilfFeedbackV49?.revision || null,
    endpoint: window.DokoHilfFeedbackV49?.endpoint || null,
    categories: window.DokoHilfFeedbackV49?.categories || [],
    buttonText: document.querySelector('[data-feedback-open]')?.textContent?.trim() || '',
    dialogVisible: !document.querySelector('.feedback-v49-backdrop')?.hidden,
    appVersion: window.DokoHilfReleasePolishV29?.versionLabel || null,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  }));

  if (snapshot.revision !== '20260813-feedback-v49-1') throw new Error(`Unexpected revision ${snapshot.revision}`);
  if (!String(snapshot.endpoint).endsWith('/functions/v1/dokohilf-feedback')) throw new Error('Feedback endpoint missing');
  if (snapshot.categories.length !== 5) throw new Error(`Expected 5 categories, got ${snapshot.categories.length}`);
  if (!snapshot.dialogVisible) throw new Error('Feedback dialog is not visible');
  if (snapshot.appVersion !== 'v31') throw new Error(`Expected v31, got ${snapshot.appVersion}`);
  if (snapshot.horizontalOverflow) throw new Error('Feedback UI causes horizontal overflow');

  await page.screenshot({ path: `${output}/feedback-dialog.png`, fullPage: true });
  await writeFile(`${output}/snapshot.json`, JSON.stringify(snapshot, null, 2) + '\n');
} finally {
  await browser.close();
}
