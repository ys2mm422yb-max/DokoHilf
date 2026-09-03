import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const smart = await read('assets/smart-help-v29.js');
const direct = await read('assets/file-storage-guide-v46.js');
const speech = JSON.parse(await read('assets/voice-file-storage-catalog-v46.json'));
const worker = await read('service-worker.js');
const builder = await read('scripts/build-supertonic-guide-audio-v28.py');
const uiPolish = await read('assets/ui-polish-v35.js');

function smartHelpRuntime() {
  const context = {
    window: {
      fetch: async () => ({ ok: true }),
      __DOKOHILF_FILE_STORAGE_GUIDE_V46__: true,
    },
    document: {
      querySelector: () => null,
      createElement: () => ({ dataset: {} }),
      head: { append: () => {} },
    },
    Request: class Request {},
    console,
  };
  context.window.window = context.window;
  vm.runInNewContext(smart, context);
  return context.window.DokoHilfSmartHelpV29;
}

test('Dateiablage aliases route deterministically to the approved guide', () => {
  const runtime = smartHelpRuntime();
  for (const phrase of [
    'Dateiablage',
    'Wo finde ich Dokumente?',
    'Vertrag öffnen',
    'Wohnassistent Vertrag',
    'Betreuerausweis',
    'Arztbrief',
    'Entlassungsbrief',
    'Laborwerte',
  ]) {
    assert.equal(runtime.inferNavigationGuide(phrase), 'dateiablage', phrase);
  }
  for (const phrase of [
    'Laborwerte eintragen',
    'Dokumente hochladen',
    'Dokumente löschen',
    'Dokumente umbenennen',
    'Dokumente ändern',
    'Dokumente bearbeiten',
    'Dokumente verschieben',
    'Dokumente ersetzen',
  ]) {
    assert.equal(runtime.inferNavigationGuide(phrase), '', phrase);
  }
});

test('Dateiablage is grouped under Organisation & Dokumente instead of Weitere Anleitungen', () => {
  assert.match(uiPolish, /key: 'organization-documents'[\s\S]*label: 'Organisation & Dokumente'[\s\S]*slugs: \['anwesenheit', 'formulare-anlegen', 'stammdaten', 'dateiablage'\]/);
  assert.match(uiPolish, /card\?\.dataset\?\.v46FileStorage === 'true'\) return 'dateiablage'/);
  assert.match(uiPolish, /GROUP_LAYOUT_REVISION = '20260812-dateiablage-organisation-v46-1'/);
});

test('direct guide contains only the confirmed find/open path', () => {
  for (const text of [
    'Öffne die Stammdaten des gewünschten Bewohners.',
    'Klicke in der grauen Leiste auf „Dateiablage“.',
    'Unten mittig erscheint der Bereich „Dokumente“.',
    'Wenn es in der Dateiablage hinterlegt ist',
    'Öffne das vorhandene Dokument per Doppelklick.',
    'Klicke nicht mehrfach doppelt.',
  ]) assert.ok(direct.includes(text), text);

  assert.match(direct, /nicht zum Hochladen, Löschen, Umbenennen oder Ändern/);
  assert.match(direct, /wenn sie hinterlegt sind/);
  assert.doesNotMatch(direct, /Datei hochladen|Dokument löschen|Dokument umbenennen|Datei bearbeiten/);
});

test('all five approved guide sentences are statically prebuilt with Supertonic-F1', () => {
  assert.equal(speech.voice, 'Supertonic-F1');
  assert.equal(speech.entries.length, 5);
  const texts = speech.entries.map(entry => entry.text);
  for (const expected of [
    'Öffne die Stammdaten des gewünschten Bewohners.',
    'Klicke in der grauen Leiste auf „Dateiablage“.',
    'Unten mittig erscheint der Bereich „Dokumente“.',
    'Suche dort das gewünschte vorhandene Dokument. Wenn es in der Dateiablage hinterlegt ist, wähle es aus.',
    'Öffne das vorhandene Dokument per Doppelklick. Es kann kurz dauern, bis sich Word öffnet. Klicke nicht mehrfach doppelt.',
  ]) assert.ok(texts.includes(expected), expected);

  assert.match(builder, /EXPECTED_FILE_STORAGE_COUNT = 5/);
  assert.match(builder, /file_storage_catalog = load_catalog\(args\.file_storage_catalog\)/);
  assert.match(builder, /context_stuck_catalog = load_catalog\(args\.context_stuck_catalog\)/);
  assert.match(builder, /completion_catalog, file_storage_catalog, context_stuck_catalog/);
  assert.match(builder, /file_storage_count = len\(file_storage_catalog\.get\('entries'\) or \[\]\)/);
  assert.match(builder, /if file_storage_count != EXPECTED_FILE_STORAGE_COUNT/);
  assert.match(builder, /entries = merged_entries\(\*catalogs\.values\(\), completion_catalog, file_storage_catalog, context_stuck_catalog\)/);
});

test('PWA refreshes the grouping and voice fixes while keeping the existing build id', () => {
  assert.match(worker, /LIBRARY_LAYOUT_REVISION = '20260812-dateiablage-organisation-v46-1'/);
  assert.match(worker, /VOICE_REPLY_MATCH_REVISION = '20260812-static-voice-reply-match-v45-2'/);
  assert.match(worker, /FILE_STORAGE_REVISION = '20260812-file-storage-guide-v46-1'/);
  assert.match(worker, /file-storage-guide-v46\.js\?v=20260812-file-storage-v46-1/);
  assert.match(worker, /fileStorageRevision: FILE_STORAGE_REVISION/);
  assert.match(smart, /file-storage-guide-v46\.js\?v=20260812-file-storage-v46-1/);
});
