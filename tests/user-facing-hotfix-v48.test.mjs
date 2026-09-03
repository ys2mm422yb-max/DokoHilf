import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [contextHotfix, reportHotfix, builder, worker, stuckCatalogRaw, baseCatalogRaw] = await Promise.all([
  read('assets/context-voice-hotfix-v28.js'),
  read('assets/report-guide-hotfix-v43.js'),
  read('scripts/build-supertonic-guide-audio-v28.py'),
  read('service-worker.js'),
  read('assets/voice-context-stuck-catalog-v48.json'),
  read('assets/guide-audio-catalog.json'),
]);
const stuckCatalog = JSON.parse(stuckCatalogRaw);
const baseCatalog = JSON.parse(baseCatalogRaw);
const stuckTexts = stuckCatalog.entries.map(entry => entry.text);
const baseTexts = baseCatalog.entries.map(entry => entry.text);
const EXPAND_STEP = 'Wähle „Alle ausklappen“, damit sämtliche Einträge vollständig sichtbar werden.';

test('approved stuck-help replies are prebuilt with free static Supertonic', () => {
  assert.equal(stuckCatalog.voice, 'Supertonic-F1');
  assert.equal(baseCatalog.voice, 'Supertonic-F1');
  assert.equal(stuckTexts.length, 63);
  assert.match(String(stuckCatalog.generatedFrom || ''), /63 eindeutige freigegebene stuck-Hilfetexte/);
  assert.ok(baseTexts.includes(EXPAND_STEP), EXPAND_STEP);
  for (const text of [
    'Bleibe in den geöffneten Stammdaten. Suche in der grauen Leiste nach „Dateiablage“.',
    'Bleibe in „Dateiablage“. Der Bereich „Dokumente“ erscheint unten mittig.',
    'Warte kurz, bis sich Word öffnet, und führe den Doppelklick nicht mehrfach aus.',
    'Du legst die Wirksamkeitskontrolle nicht selbst an. Eine konkrete Wartezeit ist hier nicht festgelegt.',
    '„Alle ausklappen“ befindet sich rechts neben „Alle anzeigen“.',
    'Wenn du den Zeitraum geändert und die Anzeige aktualisiert hast, wähle danach erneut „Alle ausklappen“, damit alle Einträge wieder vollständig geöffnet sind.',
  ]) assert.ok(stuckTexts.includes(text), text);

  const joined = stuckTexts.join('\n');
  assert.doesNotMatch(joined, /Einen anderen Klickweg erfindet DokoHilf nicht|DokoHilf kann nicht garantieren|DokoHilf hilft hier nur|DokoHilf nennt keine erfundene Wartezeit/);
});

test('context-stuck help remains the last static speech source', () => {
  assert.match(builder, /EXPECTED_CONTEXT_STUCK_COUNT = 63/);
  assert.match(builder, /--context-stuck-catalog/);
  assert.match(builder, /entries = merged_entries\(\*catalogs\.values\(\), completion_catalog, file_storage_catalog, context_stuck_catalog\)/);
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
  assert.match(contextHotfix, /fill\.style\.setProperty\('transition', 'none', 'important'\)/);
  assert.match(contextHotfix, /fill\.getAnimations\?\.\(\)/);
  assert.match(contextHotfix, /void fill\.offsetWidth/);
  assert.match(contextHotfix, /fill\.style\.setProperty\('width', '100%', 'important'\)/);
  assert.match(contextHotfix, /fill\.style\.removeProperty\('transition'\)/);
  assert.match(contextHotfix, /track\.dataset\.v48Final = finalStep \? 'true' : 'false'/);
  assert.match(contextHotfix, /VOICE_PROGRESS_REVISION = '20260902-voice-chat-parity-v66-1'/);
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
