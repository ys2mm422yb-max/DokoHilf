import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../assets/guide-progress.js');

const { formatProgress, addGuideStateToBody } = globalThis.DokoHilfGuideProgress;
const script = await readFile(new URL('../assets/guide-progress.js', import.meta.url), 'utf8');

test('Schrittanzeige wird verständlich formatiert', () => {
  assert.equal(formatProgress(1, 6), 'Schritt 1 von 6');
  assert.equal(formatProgress(3, 6), 'Schritt 3 von 6');
  assert.equal(formatProgress(0, 0), 'Schritt 1 von 1');
});

test('aktueller Guide-Schritt wird jeder KI-Anfrage explizit mitgegeben', () => {
  const body = addGuideStateToBody(
    JSON.stringify({ messages: [{ role: 'user', content: 'Ja' }], guideSlug: 'vitalwerte-erfassen' }),
    { guideSlug: 'vitalwerte-erfassen', guideStep: 2, guideStepCount: 3 },
  );
  const parsed = JSON.parse(body);
  assert.equal(parsed.guideStep, 2);
  assert.equal(parsed.guideStepCount, 3);
  assert.equal(parsed.guideStateVersion, 2);
});

test('Guide-Leiste besitzt alle erforderlichen Bedienaktionen', () => {
  assert.match(script, /data-guide-action="back"/);
  assert.match(script, /data-guide-action="restart"/);
  assert.match(script, /data-guide-action="change"/);
  assert.match(script, /currentGuide/);
  assert.match(script, /commandRow/);
});

test('Antwortmetadaten steuern den sichtbaren Schritt direkt', () => {
  assert.match(script, /payload\.guideStep/);
  assert.match(script, /payload\.guideStepCount/);
  assert.match(script, /guideStateVersion/);
  assert.match(script, /dokohilf:guide-state/);
  assert.doesNotMatch(script, /const STATE_ENDPOINT/);
  assert.doesNotMatch(script, /loadGuideState/);
});

test('Ablauf-Neustart setzt den Schrittzustand auf eins', () => {
  assert.match(script, /guideStep: 1/);
  assert.match(script, /api\.sendMessage\(currentGuide\.guideTitle \|\| currentGuide\.guideSlug\)/);
});
