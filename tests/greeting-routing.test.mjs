import test from 'node:test';
import assert from 'node:assert/strict';

await import('../assets/routing-fix.js');

const { stripLeadingGreeting, rewriteRequestBody } = globalThis.DokoHilfRouting;

test('reine Begrüßungen bleiben unverändert', () => {
  for (const value of ['Hallo', 'Hi!', 'Servus', 'Guten Morgen.']) {
    assert.equal(stripLeadingGreeting(value), value.trim());
  }
});

test('Begrüßung plus Bedienaufgabe verliert nur die Begrüßung', () => {
  const cases = [
    ['Hallo, ich möchte eine Visite anlegen', 'ich mochte eine visite anlegen'],
    ['Hi, ich muss einen Bericht löschen', 'ich muss einen bericht loschen'],
    ['Servus, ich möchte eine Durchführung stornieren', 'ich mochte eine durchfuhrung stornieren'],
    ['Guten Morgen, wo finde ich die Vitalwerte?', 'wo finde ich die vitalwerte'],
  ];

  for (const [input, expected] of cases) {
    assert.equal(stripLeadingGreeting(input), expected);
  }
});

test('nur die letzte Nutzernachricht wird für das Backend bereinigt', () => {
  const body = JSON.stringify({
    guideSlug: null,
    messages: [
      { role: 'assistant', content: 'Hallo! Wobei brauchst du Hilfe?' },
      { role: 'user', content: 'Hallo, ich möchte eine Visite anlegen' },
    ],
  });

  const rewritten = JSON.parse(rewriteRequestBody(body));
  assert.equal(rewritten.messages[0].content, 'Hallo! Wobei brauchst du Hilfe?');
  assert.equal(rewritten.messages[1].content, 'ich mochte eine visite anlegen');
});

test('ungültige oder fremde Request-Bodies bleiben unverändert', () => {
  assert.equal(rewriteRequestBody('kein json'), 'kein json');
  const body = JSON.stringify({ messages: [{ role: 'assistant', content: 'Hallo' }] });
  assert.equal(rewriteRequestBody(body), body);
});
