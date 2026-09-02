import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [migration, workflows, directGuides] = await Promise.all([
  readFile(new URL('../supabase/migrations/20260902224500_dnf_detail_orientation_v65.sql', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
  readFile(new URL('../assets/durchfuehrungs-workflows-v29.js', import.meta.url), 'utf8'),
]);

test('allgemeines Abzeichnen endet weiterhin bewusst beim geöffneten Durchführungsnachweis', () => {
  assert.match(workflows, /Ab dem geöffneten Durchführungsnachweis erfindet DokoHilf für ein allgemeines Abzeichnen keinen weiteren Klickweg/);
  assert.match(migration, /allgemeines_abzeichnen/);
  assert.match(migration, /bestätigte Weg nur bis zum geöffneten Durchführungsnachweis/);
});

test('v65 entfernt die alte unbestätigte allgemeine Folgeauswahl statt sie zu erweitern', () => {
  assert.match(migration, /jsonb_build_array\(steps->0, steps->1\)/);
  assert.match(migration, /Wähle jetzt, ob du eine Durchführung dokumentieren, eine falsche Durchführung stornieren oder nur einen Nachweis ansehen möchtest/);
  assert.doesNotMatch(migration, /Was möchtest du im Durchführungsnachweis machen: eine Bedarfsmedikation/);
});

test('bestätigter kleine-Pfeil-Weg für Maßnahmen ohne Zeitangabe bleibt dokumentiert', () => {
  assert.match(workflows, /Maßnahmen ohne Zeitangabe[^\n]*kleinen Pfeil links daneben/);
  assert.match(directGuides, /Maßnahmen ohne Zeitangabe[^\n]*kleinen Pfeil links daneben/);
});

test('DNF-Detailwege bleiben auf bereits bestätigte Fälle begrenzt', () => {
  assert.match(migration, /Bedarfsmedikation, Wirksamkeitskontrolle, Maßnahmen ohne Zeitangabe und das Stornieren einer falschen Durchführung/);
  assert.match(workflows, /Bedarfsmedikationsgabe dokumentieren/);
  assert.match(workflows, /Wirksamkeitskontrolle der Bedarfsmedikation/);
  assert.match(workflows, /Falsch abgezeichnete Durchführung stornieren/);
});