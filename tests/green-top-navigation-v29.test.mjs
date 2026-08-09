import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('fixed green top bar and dependent sub-row are explained consistently', async () => {
  const [orientation, speech, migration] = await Promise.all([
    read('assets/orientation-help-v29.js'),
    read('assets/voice-extra-catalog-v28.json'),
    read('supabase/migrations/20260809133000_green_top_navigation_v29.sql'),
  ]);

  for (const value of ['Doku-Erweitert', 'Doku', 'Planung', 'Analyse']) {
    assert.match(orientation, new RegExp(value));
    assert.match(speech, new RegExp(value));
    assert.match(migration, new RegExp(value));
  }

  assert.match(orientation, /ganz oben in der festen grünen Leiste/i);
  assert.match(orientation, /erscheinen direkt darunter die dazugehörigen Unterpunkte beziehungsweise Symbole/i);
  assert.match(migration, /ganz oben in der grünen Leiste/i);
  assert.match(migration, /direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole/i);
});

test('Planning location is routable while Easy-Plan workflow stays unconfirmed', async () => {
  const [smart, migration] = await Promise.all([
    read('assets/smart-help-v29.js'),
    read('supabase/migrations/20260809133000_green_top_navigation_v29.sql'),
  ]);

  assert.match(smart, /if \(\/\\bplanung\\b\/\.test\(n\)\) return 'planung-finden'/);
  assert.match(smart, /easy plan\|easy-plan\|easyplan/);
  assert.match(smart, /return '';/);
  assert.match(migration, /'planung-finden'/);
  assert.match(migration, /Easy-Plan bleibt fachlich später/);
  assert.doesNotMatch(migration, /'easyplan'\s*,\s*'approved'/);
});

test('nested guides say main area above and sub-item below', async () => {
  const migration = await read('supabase/migrations/20260809133000_green_top_navigation_v29.sql');

  for (const child of ['Visiten', 'Vitalwerte', 'An-/Abwesenheiten', 'Medikation', 'Formulare']) {
    assert.match(migration, new RegExp(`Doku-Erweitert[\\s\\S]*darunter[\\s\\S]*${child}`));
  }
  assert.match(migration, /Doku[\s\S]*darunter[\s\S]*Durchführungsnachweis/);
  assert.match(migration, /Analyse[\s\S]*darunter[\s\S]*Was war los\?/);
});
