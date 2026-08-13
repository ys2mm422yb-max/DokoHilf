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

  const homeSnapshot = await page.evaluate(() => {
    const triggerNode = document.querySelector('[data-feedback-open]');
    const start = document.getElementById('startScreen');
    return {
      revision: window.DokoHilfFeedbackV49?.revision || null,
      endpoint: window.DokoHilfFeedbackV49?.endpoint || null,
      categories: window.DokoHilfFeedbackV49?.categories || [],
      appVersion: window.DokoHilfReleasePolishV29?.versionLabel || null,
      shellMode: document.getElementById('appShell')?.dataset.mode || null,
      triggerParentIsStart: Boolean(triggerNode && start?.contains(triggerNode)),
      triggerText: triggerNode?.textContent?.replace(/\s+/g, ' ').trim() || '',
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });

  if (homeSnapshot.revision !== '20260813-feedback-home-only-v50-1') throw new Error(`Unexpected revision ${homeSnapshot.revision}`);
  if (!String(homeSnapshot.endpoint).endsWith('/functions/v1/dokohilf-feedback')) throw new Error('Feedback endpoint missing');
  if (homeSnapshot.categories.length !== 5) throw new Error(`Expected 5 categories, got ${homeSnapshot.categories.length}`);
  if (homeSnapshot.appVersion !== 'v31') throw new Error(`Expected v31, got ${homeSnapshot.appVersion}`);
  if (homeSnapshot.shellMode !== 'start') throw new Error(`Feedback did not start on home: ${homeSnapshot.shellMode}`);
  if (!homeSnapshot.triggerParentIsStart) throw new Error('Feedback entry is not contained by startScreen');
  if (homeSnapshot.horizontalOverflow) throw new Error('Feedback home entry causes horizontal overflow');

  await page.screenshot({ path: `${output}/feedback-home.png`, fullPage: true });

  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Fehler oder Hinweis melden' });
  await dialog.waitFor({ state: 'visible' });
  await page.getByLabel('Kategorie').waitFor({ state: 'visible' });
  await page.getByLabel('Kurze Beschreibung').waitFor({ state: 'visible' });
  await page.getByText(/automatisch nur die aktuelle DokoHilf-Build-ID/i).waitFor({ state: 'visible' });
  await page.getByText(/keine Namen, Bewohner-\/Klienten- oder Gesundheitsdaten/i).waitFor({ state: 'visible' });
  if (await page.getByText('Aktuelle Stelle mitsenden', { exact: true }).count()) throw new Error('Obsolete location toggle is still rendered');
  await page.screenshot({ path: `${output}/feedback-dialog.png`, fullPage: true });
  await page.getByRole('button', { name: 'Abbrechen' }).click();

  await page.locator('[data-v29-open-library]').click();
  await page.locator('#directGuideView').waitFor({ state: 'visible' });
  const libraryVisible = await trigger.isVisible().catch(() => false);
  if (libraryVisible) throw new Error('Feedback entry is visible in Alle Anleitungen');
  await page.screenshot({ path: `${output}/feedback-library-hidden.png`, fullPage: true });

  await page.locator('[data-v29-guide-home]').first().click();
  await page.locator('#startScreen').waitFor({ state: 'visible' });
  await page.locator('[data-select-mode="voice"]').click();
  await page.waitForFunction(() => document.getElementById('appShell')?.dataset.mode === 'voice');
  const voiceVisible = await trigger.isVisible().catch(() => false);
  if (voiceVisible) throw new Error('Feedback entry is visible in voice mode');

  await page.locator('#homeButton').click();
  await page.waitForFunction(() => document.getElementById('appShell')?.dataset.mode === 'start');
  await page.locator('[data-select-mode="chat"]').click();
  await page.waitForFunction(() => document.getElementById('appShell')?.dataset.mode === 'chat');
  const chatVisible = await trigger.isVisible().catch(() => false);
  if (chatVisible) throw new Error('Feedback entry is visible in chat mode');

  const snapshot = {
    ...homeSnapshot,
    dialogHasLocationToggle: false,
    libraryVisible,
    voiceVisible,
    chatVisible,
  };
  await writeFile(`${output}/snapshot.json`, JSON.stringify(snapshot, null, 2) + '\n');
} finally {
  await browser.close();
}
