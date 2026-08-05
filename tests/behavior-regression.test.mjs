import test from 'node:test';
import assert from 'node:assert/strict';
import { approvedGuides, expectedCaseCount, routingCases } from './fixtures/routing-fixtures.mjs';
import { evaluateCases, routeContract } from './helpers/routing-contract.mjs';

test('mindestens 100 natürliche Formulierungen sind fest abgedeckt', () => {
  assert.equal(routingCases.length, expectedCaseCount);
  assert.ok(routingCases.length >= 100);
  assert.ok(routingCases.filter(item => item.tags.includes('greeting')).length >= 3);
  assert.ok(routingCases.filter(item => item.tags.includes('asr-or-typo')).length >= 4);
  assert.ok(routingCases.filter(item => item.tags.includes('ambiguous')).length >= 5);
});

test('jede natürliche Formulierung liefert das erwartete Verhalten', () => {
  const results = evaluateCases(routingCases, approvedGuides);
  const failures = results.filter(result => !result.passed);
  assert.deepEqual(failures, []);
});

test('bereits bestätigte zentrale Klickwege dürfen nicht verschwinden', () => {
  const slugs = new Set(approvedGuides.map(guide => guide.slug));
  for (const required of [
    'bericht-neu',
    'bericht-durchstreichen',
    'durchfuehrung-storno',
    'visite-anlegen',
    'visite-status-durchgefuehrt',
    'vitalwerte',
    'uebergabeformular',
    'notfallblatt',
  ]) assert.ok(slugs.has(required), `Freigegebener Guide fehlt: ${required}`);
});

test('ein eindeutig genanntes neues Ziel ersetzt den vorherigen Ablauf', () => {
  const first = routeContract('Ich möchte einen Bericht schreiben', approvedGuides);
  const continuation = routeContract('weiter', approvedGuides);
  const switched = routeContract('Ich möchte eine Visite anlegen', approvedGuides);
  assert.equal(first.guideSlug, 'bericht-neu');
  assert.equal(continuation.kind, 'command-next');
  assert.equal(switched.guideSlug, 'visite-anlegen');
});

test('mehrdeutige Korrektur startet keinen zufälligen Guide', () => {
  for (const input of ['Ich habe falsch dokumentiert', 'Der Eintrag ist falsch', 'Ich muss etwas stornieren']) {
    const result = routeContract(input, approvedGuides);
    assert.equal(result.kind, 'clarify');
    assert.equal(result.guideSlug, null);
  }
});
