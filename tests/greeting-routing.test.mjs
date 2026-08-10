import test from 'node:test';
import assert from 'node:assert/strict';

await import('../assets/routing-fix.js');

const {
  stripLeadingGreeting,
  inferSelectedGuideSlug,
  rewriteRequestBody,
  rewriteRouterInput,
  chatRouterEndpoint,
} = globalThis.DokoHilfRouting;

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

test('natürliche deutsche Aktionsformen starten nur bestätigte konkrete Guides', () => {
  const cases = [
    ['Wie lege ich eine Visite an?', 'visite-anlegen'],
    ['Wie lege ich einen Bericht an?', 'bericht-neu'],
    ['Wie trage ich eine Abwesenheit ein?', 'anwesenheit'],
    ['Wie erstelle ich ein Sturzprotokoll?', 'formulare-anlegen'],
    ['Wie dokumentiere ich eine Bedarfsmedikation?', 'bedarfsmedikation-gabe'],
    ['Wo finde ich die Wirksamkeitskontrolle?', 'bedarfsmedikation-wirksamkeitskontrolle-finden'],
    ['Wie dokumentiere ich die Wirksamkeitskontrolle?', 'bedarfsmedikation-wirksamkeitskontrolle'],
    ['Wie öffne ich den Durchführungsnachweis?', 'durchfuehrungsnachweis-oeffnen'],
    ['Wie sehe ich die Medikation an?', 'medikation-ansehen'],
    ['Wie rufe ich das Notfallblatt auf?', 'notfallblatt'],
    ['Wie rufe ich die Übergabe auf?', 'uebergabeformular'],
  ];

  for (const [input, expected] of cases) {
    assert.equal(inferSelectedGuideSlug(input), expected, input);
  }
});

test('mehrdeutige oder fachlich gesperrte Ziele werden nicht lokal erzwungen', () => {
  assert.equal(inferSelectedGuideSlug('Wie trage ich Vitalwerte ein?'), '');
  assert.equal(inferSelectedGuideSlug('Wie ändere ich die Medikation?'), '');
  assert.equal(inferSelectedGuideSlug('Wie benutze ich Easy-Plan?'), '');
});

test('nur die letzte Nutzernachricht wird für das Backend bereinigt und eindeutig geroutet', () => {
  const body = JSON.stringify({
    guideSlug: null,
    messages: [
      { role: 'assistant', content: 'Hallo! Wobei brauchst du Hilfe?' },
      { role: 'user', content: 'Hallo, wie lege ich eine Visite an?' },
    ],
  });

  const rewritten = JSON.parse(rewriteRequestBody(body));
  assert.equal(rewritten.messages[0].content, 'Hallo! Wobei brauchst du Hilfe?');
  assert.equal(rewritten.messages[1].content, 'wie lege ich eine visite an');
  assert.equal(rewritten.selectedGuideSlug, 'visite-anlegen');
  assert.equal(rewritten.clientRoutingRevision, '20260810-natural-guide-completions-v40-1');
});

test('ein laufender Guide wird durch lokale Intent-Erkennung nicht ungefragt überschrieben', () => {
  const body = JSON.stringify({
    guideSlug: 'bericht-neu',
    messages: [{ role: 'user', content: 'Wie lege ich eine Visite an?' }],
  });
  assert.equal(rewriteRequestBody(body), body);
});

test('alte KI-Endpunkte werden direkt auf den completion-aware Conversation-Router umgebogen', () => {
  assert.match(chatRouterEndpoint, /dokohilf-conversation-router$/);
  assert.equal(
    rewriteRouterInput('https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai'),
    chatRouterEndpoint,
  );
  assert.equal(
    rewriteRouterInput('https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai-router'),
    chatRouterEndpoint,
  );
  assert.equal(rewriteRouterInput(chatRouterEndpoint), chatRouterEndpoint);
});

test('ungültige oder fremde Request-Bodies bleiben unverändert', () => {
  assert.equal(rewriteRequestBody('kein json'), 'kein json');
  const body = JSON.stringify({ messages: [{ role: 'assistant', content: 'Hallo' }] });
  assert.equal(rewriteRequestBody(body), body);
});

await import('./guide-completion-v40.test.mjs');
