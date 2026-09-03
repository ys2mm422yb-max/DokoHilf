import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [library, workflows, migration, stuckCatalogRaw, baseCatalogRaw, version, worker] = await Promise.all([
  read('assets/guide-library-v29.js'),
  read('CONFIRMED_WORKFLOWS.md'),
  read('supabase/migrations/20260813104500_uebergabe_alle_ausklappen_detail_v51.sql'),
  read('assets/voice-context-stuck-catalog-v48.json'),
  read('assets/guide-audio-catalog.json'),
  read('version.json'),
  read('service-worker.js'),
]);
const stuckCatalog = JSON.parse(stuckCatalogRaw);
const baseCatalog = JSON.parse(baseCatalogRaw);
const stuckSpeechTexts = stuckCatalog.entries.map(entry => entry.text);
const baseSpeechTexts = baseCatalog.entries.map(entry => entry.text);

const EXPAND_STEP = 'Wähle „Alle ausklappen“, damit sämtliche Einträge vollständig sichtbar werden.';
const LOCATION_HELP = '„Alle ausklappen“ befindet sich rechts neben „Alle anzeigen“.';
const REFRESH_HELP = 'Wenn du den Zeitraum geändert und die Anzeige aktualisiert hast, wähle danach erneut „Alle ausklappen“, damit alle Einträge wieder vollständig geöffnet sind.';

test('direct Übergabe guide uses the confirmed Alle ausklappen label', () => {
  assert.ok(library.includes('„Alle ausklappen“ wählen, damit sämtliche Einträge vollständig sichtbar werden.'));
  const handover = library.match(/uebergabeformular:\s*\{[\s\S]*?\n\s*\},\n\s*notfallblatt:/)?.[0] || '';
  assert.ok(handover, 'Übergabe guide block missing');
  assert.doesNotMatch(handover, /„Alles ausklappen“/);
});

test('binding workflow records location and repeat-after-refresh detail help', () => {
  assert.match(workflows, /\*\*Alle ausklappen\*\*/);
  assert.match(workflows, /rechts neben \*\*Alle anzeigen\*\*/);
  assert.match(workflows, /Zeitraum geändert und die Anzeige aktualisiert[\s\S]*erneut \*\*Alle ausklappen\*\*/);
});

test('Supabase migration updates only the confirmed Übergabe guide detail', () => {
  assert.match(migration, /where slug = 'uebergabeformular'/);
  assert.match(migration, /status = 'approved'/);
  assert.ok(migration.includes(EXPAND_STEP));
  assert.ok(migration.includes(LOCATION_HELP));
  assert.ok(migration.includes(REFRESH_HELP));
  assert.match(migration, /'\{3,stuck\}'/);
  assert.match(migration, /'\{4,stuck\}'/);
  assert.match(migration, /'alle ausklappen' = any/);
  assert.match(migration, /- 'alles_ausklappen'/);
});

test('all current approved Übergabe sentences have free static Supertonic keys', () => {
  assert.equal(baseCatalog.voice, 'Supertonic-F1');
  assert.equal(stuckCatalog.voice, 'Supertonic-F1');
  assert.equal(stuckSpeechTexts.length, 63);
  assert.match(String(stuckCatalog.generatedFrom || ''), /63 eindeutige freigegebene stuck-Hilfetexte/);
  assert.ok(baseSpeechTexts.includes(EXPAND_STEP), `missing static base speech: ${EXPAND_STEP}`);
  for (const text of [LOCATION_HELP, REFRESH_HELP]) {
    assert.ok(stuckSpeechTexts.includes(text), `missing static stuck speech: ${text}`);
  }
});

test('v31 handover detail correction remains active after later public version bumps', () => {
  assert.match(worker, /HANDOVER_DETAIL_REVISION = '20260813-uebergabe-alle-ausklappen-v51-1'/);
  assert.match(worker, /handoverDetailRevision: HANDOVER_DETAIL_REVISION/g);
  const parsed = JSON.parse(version);
  const publicVersion = Number(String(parsed.appVersion || '').replace(/^v/, ''));
  assert.ok(Number.isInteger(publicVersion) && publicVersion >= 31, `unexpected public version: ${parsed.appVersion}`);
});
