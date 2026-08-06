import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [router, migration, progress, voiceFocus] = await Promise.all([
  readFile(new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260806112000_vitalwerte_intent_guides.sql', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-progress.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-focus-mode.js', import.meta.url), 'utf8'),
]);

test('eindeutige Erfassungsabsicht startet direkt einen Erfassungsablauf', () => {
  assert.match(router, /wantsVitalEntry/);
  assert.match(router, /return startGuide\(origin, guides, 'vitalwerte-erfassen'\)/);
  assert.doesNotMatch(router, /Möchtest du einen Vitalwert erfassen oder vorhandene Werte/);
});

test('Einzelwert und Sammelerfassung sind getrennte bestätigte Abläufe', () => {
  assert.match(migration, /vitalwerte-einzelwert/);
  assert.match(migration, /vitalwerte-sammelerfassung/);
  assert.match(migration, /Klicke oben links auf das grüne Plus/);
  assert.match(migration, /Pop-up-Fenster zur Auswahl eines Vitalwerts/);
  assert.match(migration, /Wähle „Sammelerfassung“/);
});

test('der Router fragt nur noch Einzelwert oder mehrere Werte', () => {
  assert.match(router, /vitalEntryOptions/);
  assert.match(router, /vitalwerte-einzelwert-fortsetzen/);
  assert.match(router, /vitalwerte-sammelerfassung-fortsetzen/);
  assert.match(router, /vital-entry-choice/);
});

test('Schrittzustand wird nicht mehr aus allen früheren Ja-Antworten gezählt', () => {
  assert.match(router, /parsed\.guideStep/);
  assert.match(router, /currentGuideStep/);
  assert.match(progress, /guideStateVersion: 2/);
  assert.doesNotMatch(progress, /filter\(.*role.*user/);
});

test('Sprachmodus ist eine feste fokussierte Oberfläche ohne Chatverlauf', () => {
  assert.match(voiceFocus, /position:fixed/);
  assert.match(voiceFocus, /\.conversation.*display:none!important/);
  assert.match(voiceFocus, /voice-focus-actions/);
});
