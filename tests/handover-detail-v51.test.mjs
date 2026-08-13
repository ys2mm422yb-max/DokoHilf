import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [library, workflows, migration, catalogRaw, version] = await Promise.all([
  read('assets/guide-library-v29.js'),
  read('CONFIRMED_WORKFLOWS.md'),
  read('supabase/migrations/20260813104500_uebergabe_alle_ausklappen_detail_v51.sql'),
  read('assets/voice-context-stuck-catalog-v48.json'),
  read('version.json'),
]);
const catalog = JSON.parse(catalogRaw);
const speechTexts = catalog.entries.map(entry => entry.text);

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

test('all new approved Übergabe sentences have free static Supertonic keys', () => {
  assert.equal(catalog.voice, 'Supertonic-F1');
  assert.equal(speechTexts.length, 65);
  for (const text of [EXPAND_STEP, LOCATION_HELP, REFRESH_HELP]) {
    assert.ok(speechTexts.includes(text), `missing static speech: ${text}`);
  }
});

test('small detail correction keeps public app version v31', () => {
  assert.equal(JSON.parse(version).appVersion, 'v31');
});
