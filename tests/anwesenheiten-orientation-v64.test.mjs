import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [migration, workflows] = await Promise.all([
  readFile(new URL('../supabase/migrations/20260902221000_anwesenheiten_orientation_v64.sql', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
]);

test('v64 bewahrt den bestehenden An-/Abwesenheiten-Weg und ergänzt nur den bestätigten Alternativzugang', () => {
  assert.match(workflows, /Doku-Erweitert[^\n]*An-\/Abwesenheiten/);
  assert.match(workflows, /Doku → An-\/Abwesenheiten/);
  assert.match(migration, /Doku-Erweitert/);
  assert.match(migration, /über „Doku“ erreichbar/);
  assert.match(migration, /Der vorhandene Doku-Erweitert-Weg bleibt gültig/);
});

test('v64 verändert keine fachlichen Zeitregeln', () => {
  assert.match(workflows, /\*\*Von\*\* immer/);
  assert.match(workflows, /\*\*Bis\*\* nur/);
  assert.match(workflows, /Bis leer lassen und niemals schätzen/);
  assert.doesNotMatch(migration, /jsonb_set\s*\(\s*steps/);
});

test('v64 führt keine neuen Statusnamen oder Felder ein', () => {
  assert.doesNotMatch(migration, /Abwesend – Krankenhaus|Aktiv|Ziel|Begleitung|Grund\/Bemerkung/);
  assert.match(migration, /No status names, fields or documentation rules are changed/);
});