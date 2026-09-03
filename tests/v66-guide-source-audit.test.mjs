import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [workflows, catalogRaw, extrasRaw, contextRaw] = await Promise.all([
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-audio-catalog.json', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-extra-catalog-v28.json', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-context-stuck-catalog-v48.json', import.meta.url), 'utf8'),
]);

const audioText = [catalogRaw, extrasRaw, contextRaw].join('\n');

test('v66-Sprachkatalog bleibt an der bestätigten Navigationshierarchie', () => {
  assert.match(workflows, /Doku[^\n]*Bericht/);
  assert.match(workflows, /Bericht[^\n]*kein Hauptbereich/i);
  assert.ok(!audioText.includes('Berichte ist ein Hauptbereich'));
  assert.ok(!audioText.includes('Hauptbereiche Berichte, Doku-Erweitert, Doku, Planung und Analyse'));
  assert.match(audioText, /Bericht ist kein Hauptbereich der grünen Leiste/);
});

test('offene Fachthemen erscheinen nicht als erfundene Klickwege', () => {
  assert.match(workflows, /Berichtssuche[^\n]*nicht final/i);
  assert.match(workflows, /Easy-Plan[^\n]*fachlich offen/i);
  assert.ok(!audioText.includes('Wähle „Easy-Plan“.'));
  assert.ok(!audioText.includes('Öffne oben den Reiter „Aufgaben“.'));
});
