import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [router, migration, orientationMigration, workflows, progress, voiceFocus] = await Promise.all([
  readFile(new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260806112000_vitalwerte_intent_guides.sql', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260902212000_vitalwerte_orientation_v63.sql', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-progress.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-focus-mode.js', import.meta.url), 'utf8'),
]);

test('eindeutige Erfassungsabsicht bleibt erhalten und fragt nur Einzel- oder Sammelerfassung', () => {
  assert.match(router, /detectVitalMode/);
  assert.match(router, /vitalChoiceResponse/);
  assert.match(router, /vital-entry-mode-choice/);
  assert.match(router, /Du möchtest Vitalwerte eingeben/);
  assert.doesNotMatch(router, /Möchtest du einen Vitalwert erfassen oder vorhandene Werte/);
});

test('benannter Einzelwert und mehrere Werte starten direkt die passenden Abläufe', () => {
  assert.match(router, /return startGuide\(origin, guides, 'vitalwerte-einzelwert'\)/);
  assert.match(router, /return startGuide\(origin, guides, 'vitalwerte-sammelerfassung'\)/);
  assert.match(router, /vitalTypes/);
});

test('Einzelwert und Sammelerfassung sind getrennte bestätigte Klickwege', () => {
  assert.match(migration, /vitalwerte-einzelwert/);
  assert.match(migration, /vitalwerte-sammelerfassung/);
  assert.match(migration, /Klicke oben links auf das grüne Plus/);
  assert.match(migration, /Pop-up-Fenster zur Auswahl eines Vitalwerts/);
  assert.match(migration, /Wähle „Sammelerfassung“/);
});

test('v63 bewahrt den bestehenden Vitalwerte-Weg und ergänzt nur bestätigte Alternativen', () => {
  assert.match(workflows, /Doku-Erweitert/);
  assert.match(workflows, /Vitalwerte Sammelerf\./);
  assert.match(workflows, /Doku → Vitalwerte/);
  assert.match(workflows, /Vitalwerte[^\n]*Übersicht[^\n]*Sammelerfassung/);
  assert.match(orientationMigration, /Doku-Erweitert/);
  assert.match(orientationMigration, /über „Doku“ erreichbar/);
  assert.match(orientationMigration, /Vitalwerte[^\n]*Übersicht[^\n]*„Sammelerfassung“/);
});

test('v63 entfernt Gewicht als nicht bestätigten Vitalwerte-Intent', () => {
  assert.match(orientationMigration, /array_remove\(coalesce\(aliases, array\[\]::text\[\]\), 'gewicht eingeben'\)/);
  assert.doesNotMatch(workflows, /\bGewicht\b/);
});

test('Auswahl nach geöffnetem Vitalwerte-Bereich nutzt Anschlussabläufe', () => {
  assert.match(router, /vitalwerte-einzelwert-fortsetzen/);
  assert.match(router, /vitalwerte-sammelerfassung-fortsetzen/);
  assert.match(router, /vitalAreaAlreadyOpen/);
  assert.match(router, /Wie möchtest du die Vitalwerte erfassen/);
});

test('Schrittzustand wird nicht mehr aus allen früheren Ja-Antworten gezählt', () => {
  assert.match(router, /parsed\.guideStep/);
  assert.match(router, /currentGuideIndex/);
  assert.match(progress, /guideStateVersion: 2/);
  assert.doesNotMatch(progress, /filter\(.*role.*user/);
});

test('Sprachmodus ist eine feste fokussierte Oberfläche ohne Chatverlauf', () => {
  assert.match(voiceFocus, /position:fixed/);
  assert.match(voiceFocus, /\.conversation.*display:none!important/);
  assert.match(voiceFocus, /voice-focus-actions/);
});