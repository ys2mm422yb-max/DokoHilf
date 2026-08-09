import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [directCopy, v29Ui, contextVoice, extraVoice, releaseVoice, audioBuild, migration] = await Promise.all([
  readFile(new URL('../assets/direct-guide-copy-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/v29-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/context-voice-hotfix-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-extra-catalog-v28.json', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-release-catalog-v29.json', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-supertonic-guide-audio-v28.py', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260808200000_natural_user_facing_guide_copy_v29.sql', import.meta.url), 'utf8'),
]);

const forbiddenUserPhrases = [
  'Nicht bestätigte Formularfelder werden von DokoHilf nicht erfunden',
  'DokoHilf erfindet für noch nicht bestätigte Formularfelder keine Angaben',
  'Die Auswahl des Formulars ist bestätigt. Für nicht bestätigte Felder oder fachliche Inhalte wird kein Klickweg erfunden',
  'Dafür habe ich keinen bestätigten Weg',
  'DokoHilf darf bei diesem Ablauf nicht zu Änderungen an der Medikation anleiten',
];

test('direct guides and v29 chat show natural task copy instead of internal approval language', () => {
  assert.match(directCopy, /Das geöffnete Formular wie gewohnt ausfüllen\./);
  assert.match(v29Ui, /DokoHilf führt dich Schritt für Schritt\./);
  for (const phrase of forbiddenUserPhrases) {
    const pattern = new RegExp(phrase);
    assert.doesNotMatch(directCopy, pattern);
    assert.doesNotMatch(v29Ui, pattern);
  }
});

test('spoken response guard removes stale QA and approval wording from reply and spokenText', () => {
  assert.match(contextVoice, /function naturalizeUserCopy/);
  assert.match(contextVoice, /naturalizeUserCopy\(fixed\.reply\)/);
  assert.match(contextVoice, /naturalizeUserCopy\(fixed\.spokenText\)/);
  assert.match(contextVoice, /Im öffentlichen Test ausschließlich Fantasiedaten verwenden/);
  assert.match(contextVoice, /In Übungen nur Fantasiewerte verwenden/);
  assert.match(contextVoice, /Wenn die Bezeichnung bei dir anders ist, sag mir einfach/);
});

test('static voice catalogs contain user-facing fallback and help sentences', () => {
  assert.match(extraVoice, /Dazu habe ich keine passende Anleitung/);
  assert.match(extraVoice, /Hier geht es nur ums Nachsehen der Medikation/);
  assert.match(releaseVoice, /Wenn du bei einem Feld unsicher bist, kläre die fachliche Angabe bitte im Team/);
  assert.match(releaseVoice, /Hier geht es nur um das Ansehen der Medikation/);
  for (const phrase of forbiddenUserPhrases) {
    assert.doesNotMatch(extraVoice, new RegExp(phrase));
    assert.doesNotMatch(releaseVoice, new RegExp(phrase));
  }
});

test('static Supertonic build strips legacy exercise notices and rewrites old form copy', () => {
  assert.match(audioBuild, /Fülle das geöffnete Formular wie gewohnt aus\./);
  assert.match(audioBuild, /Im öffentlichen Test nur vollständig erfundene Personen verwenden/);
  assert.match(audioBuild, /In Übungen nur Fantasiewerte verwenden/);
});

test('Supabase migration cleans all identified live guide wording without changing click paths', () => {
  for (const slug of [
    'berichtssuche',
    'formulare-anlegen',
    'stammdaten',
    'vitalwerte-einzelwert',
    'vitalwerte-einzelwert-fortsetzen',
    'vitalwerte-sammelerfassung',
    'vitalwerte-sammelerfassung-fortsetzen',
    'medikation-ansehen',
  ]) {
    assert.match(migration, new RegExp(`slug = '${slug}'`));
  }
  assert.match(migration, /Fülle das geöffnete Formular wie gewohnt aus\./);
  assert.match(migration, /Lege die gewünschten Suchkriterien und den Zeitraum fest\./);
  assert.match(migration, /Öffne die gewünschte Person mit einem Doppelklick\./);
  assert.match(migration, /Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein\./);
});