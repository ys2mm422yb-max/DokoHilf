import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const migration = await read('supabase/migrations/20260901181000_report_navigation_hierarchy_v58.sql');
const catalogText = await read('assets/guide-audio-catalog.json');
const catalog = JSON.parse(catalogText);
const worker = await read('service-worker.js');

const correctedStep = 'Beim geöffneten Bewohner öffnest du oben in der festen grünen Hauptleiste „Doku“. Im weißen Funktionsband direkt darunter wählst du „Bericht“. Danach ist der Bereich „Berichte“ geöffnet.';
const correctedStuck = '„Doku“ liegt oben in der festen grünen Hauptleiste zwischen „Planung“ und „Doku-Erweitert“. Öffne „Doku“ und wähle im weißen Funktionsband direkt darunter „Bericht“.';
const sharedReportStuck = 'Wähle zuerst den gewünschten Bewohner. Öffne oben in der festen grünen Hauptleiste „Doku“ und wähle im weißen Funktionsband direkt darunter „Bericht“.';

test('Berichte finden follows confirmed Doku then Bericht hierarchy', () => {
  assert.ok(migration.includes(correctedStep));
  assert.ok(migration.includes(correctedStuck));
  assert.doesNotMatch(migration, /findest du „Berichte“ ganz oben in der festen grünen Leiste/);
  assert.doesNotMatch(migration, /suche ganz oben in der festen grünen Leiste nach „Berichte“/i);
});

test('all approved report-family stuck hints use the same corrected parent-child navigation', () => {
  for (const slug of ['bericht-neu', 'bericht-durchstreichen', 'bericht-folgebericht']) {
    assert.match(migration, new RegExp(`where slug = '${slug}'[\\s\\S]*?status = 'approved'`));
  }
  assert.equal(migration.split(sharedReportStuck).length - 1, 3);
  assert.doesNotMatch(migration, /where slug = 'berichtssuche'/);
});

test('corrected report step remains statically speakable with Supertonic F1', () => {
  assert.equal(catalog.voice, 'Supertonic-F1');
  assert.ok(catalog.entries.some(entry => entry.text === correctedStep));
  assert.ok(!catalog.entries.some(entry => entry.text === 'Beim geöffneten Bewohner findest du „Berichte“ ganz oben in der festen grünen Leiste. Wähle dort „Berichte“.'));
});

test('shell cache rotates so clients receive the corrected catalog', () => {
  assert.match(worker, /report-navigation-v58/);
  assert.match(worker, /STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v29-2'/);
  assert.match(worker, /HOTFIX_REVISION = '20260809-static-supertonic-orientation-ui-v29-3'/);
});
