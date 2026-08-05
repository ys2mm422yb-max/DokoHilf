import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { routingCases } from './fixtures/routing-fixtures.mjs';

const [app, router, aiCore, tts] = await Promise.all([
  readFile(new URL('../assets/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-ai/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-tts/index.ts', import.meta.url), 'utf8'),
]);

function looksSensitive(value) {
  const text = String(value || '');
  return [
    /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i,
    /\b(?:\+49|0)[\d\s/()-]{7,}\b/,
    /\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/,
    /\b(?:herr|frau|bewohner|klient|patient)\s+[a-zäöüß-]{2,}/i,
    /\b(?:geburtsdatum|telefonnummer|adresse|aktenzeichen|versichertennummer|bewohnernummer)\b/i,
  ].some(pattern => pattern.test(text));
}

test('Client, KI-Router, Kernfunktion und TTS besitzen jeweils einen Echtdatenblock', () => {
  assert.match(app, /clientPrivacyGuard/);
  assert.match(app, /BLOCK_MESSAGE/);
  assert.match(router, /containsSensitiveData/);
  assert.match(aiCore, /containsSensitiveData/);
  assert.match(tts, /containsDirectPersonalData/);
});

test('offensichtliche Fantasie-Echtdatenmuster werden erkannt', () => {
  for (const fakeExample of [
    'Frau Beispiel hat einen Bericht',
    'Kontakt test.person@example.invalid',
    'Telefon 00000 000000',
    'Geburtsdatum 01.01.2099',
    'Bewohnernummer 000000',
  ]) assert.equal(looksSensitive(fakeExample), true, fakeExample);
});

test('allgemeine Bedienfragen bleiben erlaubt', () => {
  for (const input of [
    'Wie öffne ich die Vitalwerte?',
    'Ich möchte einen Bericht durchstreichen',
    'Wo finde ich die Visiten?',
    'Wie komme ich zur Übergabe?',
  ]) assert.equal(looksSensitive(input), false, input);
});

test('Routingfälle enthalten keine personenbezogenen Testinformationen', () => {
  const findings = routingCases.filter(testCase => looksSensitive(testCase.input));
  assert.deepEqual(findings, []);
});

test('Gesprächsverläufe werden nicht dauerhaft gespeichert', () => {
  assert.doesNotMatch(app, /localStorage/);
  assert.doesNotMatch(app, /indexedDB/);
  assert.match(app, /window\.addEventListener\('pagehide'/);
  assert.match(app, /state\.history = \[\]/);
});
