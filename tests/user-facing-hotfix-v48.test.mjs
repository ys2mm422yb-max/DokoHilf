import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [contextHotfix, reportHotfix, builder, worker, stuckCatalogRaw] = await Promise.all([
  read('assets/context-voice-hotfix-v28.js'),
  read('assets/report-guide-hotfix-v43.js'),
  read('scripts/build-supertonic-guide-audio-v28.py'),
  read('service-worker.js'),
  read('assets/voice-context-stuck-catalog-v48.json'),
]);
const stuckCatalog = JSON.parse(stuckCatalogRaw);
const stuckTexts = stuckCatalog.entries.map(entry => entry.text);

test('approved stuck-help replies are prebuilt with free static Supertonic', () => {
  assert.equal(stuckCatalog.voice, 'Supertonic-F1');
  assert.equal(stuckTexts.length, 62);
  for (const text of [
    'Bleibe in den geöffneten Stammdaten. Suche in der grauen Leiste nach „Dateiablage“.',
    'Bleibe in „Dateiablage“. Der Bereich „Dokumente“ erscheint unten mittig.',
    'Warte kurz, bis sich Word öffnet, und führe den Doppelklick nicht mehrfach aus.',
    'Du legst die Wirksamkeitskontrolle nicht selbst an. Eine konkrete Wartezeit ist hier nicht festgelegt.',
  ]) assert.ok(stuckTexts.includes(text), text);

  const joined = stuckTexts.join('\n');
  assert.doesNotMatch(joined, /Einen anderen Klickweg erfindet DokoHilf nicht|DokoHilf kann nicht garantieren|DokoHilf hilft hier nur|DokoHilf nennt keine erfundene Wartezeit/);
});

test('new help speech is appended after every existing numbered WAV source', () => {
  assert.match(builder, /EXPECTED_CONTEXT_STUCK_COUNT = 62/);
  assert.match(builder, /--context-stuck-catalog/);
  assert.match(builder, /completion_catalog, file_storage_catalog, context_stuck_catalog/);
  assert.match(builder, /Context-stuck help is appended last so every previously published numbered WAV/);
  assert.match(builder, /contextStuckSourceCount/);
});

test('internal product-rule wording is converted to normal user-facing help', () => {
  assert.match(contextHotfix, /Bleibe in den geöffneten Stammdaten\. Suche in der grauen Leiste nach „Dateiablage“\./);
  assert.match(contextHotfix, /Bleibe in „Dateiablage“\. Der Bereich „Dokumente“ erscheint unten mittig\./);
  assert.match(contextHotfix, /Warte kurz, bis sich Word öffnet, und führe den Doppelklick nicht mehrfach aus\./);
  assert.match(contextHotfix, /Eine konkrete Wartezeit ist hier nicht festgelegt\./);
});

test('voice progress is forced immediately to exactly 100 percent at the final step', () => {
  assert.match(contextHotfix, /const finalStep = active && step >= count/);
  assert.match(contextHotfix, /finalStep \? 100/);
  assert.match(contextHotfix, /fill\.style\.setProperty\('transition', finalStep \? 'none' : 'width \.28s ease', 'important'\)/);
  assert.match(contextHotfix, /fill\.style\.setProperty\('width', `\$\{progress\}%`, 'important'\)/);
  assert.match(contextHotfix, /track\.dataset\.v48Final = finalStep \? 'true' : 'false'/);
  assert.match(contextHotfix, /VOICE_PROGRESS_REVISION = '20260812-final-step-progress-v48-1'/);
});

test('report special-case block continues with step 9 after the consolidated step', () => {
  assert.match(reportHotfix, /OLD_TARGET = 'Schritt 10'/);
  assert.match(reportHotfix, /NEW_TARGET = 'Schritt 9'/);
  assert.match(reportHotfix, /paragraph\.textContent = corrected/);
  assert.match(reportHotfix, /dokohilfReportContinuationV48/);
  assert.match(reportHotfix, /continuationStep: 9/);
});

test('installed PWAs receive the v48 user-facing hotfix', () => {
  assert.match(worker, /USER_FACING_HOTFIX_REVISION = '20260812-voice-copy-progress-report-v48-1'/);
  assert.match(worker, /userFacingHotfixRevision: USER_FACING_HOTFIX_REVISION/g);
});
