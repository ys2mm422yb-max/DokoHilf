import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../supabase/migrations/20260809120500_contextual_area_stuck_help_v29.sql', import.meta.url),
  'utf8',
);

test('aktive Guides erklären die bestätigten Einstiege zu allen wichtigen Bereichen', () => {
  for (const slug of [
    'visite-anlegen',
    'anwesenheit',
    'medikation-ansehen',
    'formulare-anlegen',
    'vitalwerte-einzelwert',
    'vitalwerte-sammelerfassung',
    'durchfuehrung-storno',
    'uebergabeformular',
    'notfallblatt',
  ]) {
    assert.match(migration, new RegExp(`where slug = '${slug}'`));
  }

  assert.match(migration, /Doku-Erweitert.*festen Leiste/);
  assert.match(migration, /wähle danach „Visiten“/);
  assert.match(migration, /wähle darin „An-\/Abwesenheiten“/);
  assert.match(migration, /wähle darin „Medikation“/);
  assert.match(migration, /wähle darin „Formulare“/);
  assert.match(migration, /wähle darin „Vitalwerte“/);
  assert.match(migration, /Vitalwerte Sammelerf\./);
  assert.match(migration, /„Doku“.*festen Leiste/);
  assert.match(migration, /Durchführungsnachweis/);
  assert.match(migration, /Reiter „Analyse“ findest du oben/);
  assert.match(migration, /„Was war los\?“/);
  assert.match(migration, /„Notfallblatt aufrufen“/);
});

test('Später-Markierungen bleiben intern sauber nach Thema getrennt', () => {
  assert.match(migration, /where slug = 'aufgaben'/);
  assert.match(migration, /Easy-Plan fachlich später freigeben/);
  assert.match(migration, /where slug = 'easyplan'/);
  assert.match(migration, /Aufgaben · Aktuelles fachlich später freigeben/);
});
