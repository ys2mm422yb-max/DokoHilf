import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/orientation-help-v29.js', import.meta.url), 'utf8');

function harness(guide) {
  let forwarded = 0;
  const window = {
    fetch: async () => {
      forwarded += 1;
      return new Response(JSON.stringify({ source: 'delegated-smart-help' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
    DokoHilfGuideProgress: {
      getCurrentGuide: () => guide,
    },
    DokoHilfSmartHelpV29: {
      preparedBody: parsed => JSON.stringify({ ...parsed, smartHelpIntent: true }),
    },
  };

  new Function('window', 'Request', 'Response', source)(window, Request, Response);
  return { window, forwarded: () => forwarded };
}

async function ask(h, text, guideSlug, guideStep) {
  const response = await h.window.fetch('https://example.invalid/functions/v1/dokohilf-chat-router', {
    method: 'POST',
    body: JSON.stringify({
      guideSlug,
      guideStep,
      messages: [{ role: 'user', content: text }],
    }),
  });
  return response.json();
}

test('Durchführungsnachweis beantwortet Doku- und Leistenfragen vor generischem Smart Help', async () => {
  const h = harness({
    guideSlug: 'durchfuehrungsnachweis-oeffnen',
    guideTitle: 'Durchführungsnachweis öffnen',
    guideStep: 1,
    guideStepCount: 3,
  });

  const doku = await ask(h, 'Ich finde Doku nicht', 'durchfuehrungsnachweis-oeffnen', 1);
  assert.equal(doku.source, 'confirmed-durchfuehrung-orientation-v56');
  assert.match(doku.spokenText, /Doku ist ein Hauptbereich|Doku.*festen Leiste/i);
  assert.equal(doku.guideStep, 1);
  assert.equal(doku.completed, false);

  const leiste = await ask(h, 'Wo ist die feste Leiste?', 'durchfuehrungsnachweis-oeffnen', 1);
  assert.equal(leiste.source, 'confirmed-durchfuehrung-orientation-v56');
  assert.match(leiste.spokenText, /feste grüne Leiste ist ganz oben/i);
  assert.doesNotMatch(leiste.spokenText, /richtigen Bereich/i);
  assert.equal(h.forwarded(), 0);
});

test('Reiter-Rückfrage wird im Doku-Schritt verständlich erklärt ohne neuen Klickweg', async () => {
  const h = harness({
    guideSlug: 'durchfuehrungsnachweis-oeffnen',
    guideTitle: 'Durchführungsnachweis öffnen',
    guideStep: 1,
    guideStepCount: 3,
  });

  const result = await ask(h, 'Was meinst du mit Reiter?', 'durchfuehrungsnachweis-oeffnen', 1);
  assert.equal(result.source, 'confirmed-durchfuehrung-orientation-v56');
  assert.match(result.spokenText, /Doku ist ein Hauptbereich in der festen Leiste/i);
  assert.match(result.spokenText, /Doku-Erweitert/i);
  assert.doesNotMatch(result.spokenText, /Bereich wechseln|richtigen Bereich/i);
  assert.equal(result.guideStep, 1);
  assert.equal(h.forwarded(), 0);
});

test('resident-first Signoff-Guide nutzt dieselbe Orientierung nur an seinem Doku-Schritt', async () => {
  const h = harness({
    guideSlug: 'durchfuehrungsnachweis-finden',
    guideTitle: 'Durchführungsnachweis finden',
    guideStep: 2,
    guideStepCount: 2,
  });

  const result = await ask(h, 'Wo ist Doku?', 'durchfuehrungsnachweis-finden', 2);
  assert.equal(result.source, 'confirmed-durchfuehrung-orientation-v56');
  assert.equal(result.guideStep, 2);
  assert.equal(result.completed, false);
});

test('andere Guides behalten ihre bestehende Smart-Help-Reihenfolge', async () => {
  const h = harness({
    guideSlug: 'vitalwerte-einzelwert',
    guideTitle: 'Vitalwert erfassen',
    guideStep: 1,
    guideStepCount: 4,
  });

  const result = await ask(h, 'Wo ist die feste Leiste?', 'vitalwerte-einzelwert', 1);
  assert.equal(result.source, 'delegated-smart-help');
  assert.equal(h.forwarded(), 1);
});

test('v56 bleibt auf bestätigte Orientierung begrenzt und enthält keine Bereichsprüfung', () => {
  assert.match(source, /20260901-durchfuehrungs-orientation-v56-1/);
  assert.match(source, /durchfuehrungsnachweis-oeffnen.*step === 1/s);
  assert.match(source, /durchfuehrungsnachweis-finden.*step === 2/s);
  assert.doesNotMatch(source, /prüfe.*richtigen Bereich|richtigen Bereich.*prüfe/i);
});
