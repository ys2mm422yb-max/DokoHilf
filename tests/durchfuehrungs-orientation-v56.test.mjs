import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/orientation-help-v29.js', import.meta.url), 'utf8');
const navigationCatalog = JSON.parse(await readFile(new URL('../assets/voice-navigation-catalog-v29.json', import.meta.url), 'utf8'));
const navigationSpeech = new Set((navigationCatalog.entries || []).map(entry => entry.text));

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

test('Durchführungsnachweis beantwortet Doku- und Leistenfragen lokal und mit korrekter Hierarchie', async () => {
  const h = harness({
    guideSlug: 'durchfuehrungsnachweis-oeffnen',
    guideTitle: 'Durchführungsnachweis öffnen',
    guideStep: 1,
    guideStepCount: 3,
  });

  const doku = await ask(h, 'Ich finde Doku nicht', 'durchfuehrungsnachweis-oeffnen', 1);
  assert.equal(doku.source, 'confirmed-durchfuehrung-orientation-v57');
  assert.match(doku.spokenText, /Doku ist ein Hauptreiter/i);
  assert.match(doku.spokenText, /zwischen Planung und Doku-Erweitert/i);
  assert.match(doku.spokenText, /weiße Funktionsband/i);
  assert.equal(doku.guideStep, 1);
  assert.equal(doku.completed, false);
  assert.ok(navigationSpeech.has(doku.spokenText), 'Doku-Hilfe muss als statische Supertonic-F1-Sprachquelle katalogisiert sein');

  const leiste = await ask(h, 'Wo ist die Leiste?', 'durchfuehrungsnachweis-oeffnen', 1);
  assert.equal(leiste.source, 'confirmed-durchfuehrung-orientation-v57');
  assert.match(leiste.spokenText, /feste grüne Hauptleiste ist ganz oben/i);
  assert.match(leiste.spokenText, /Bericht ist kein Hauptbereich der grünen Leiste/i);
  assert.doesNotMatch(leiste.spokenText, /Schnellzugriffsleiste|welche Leiste|welchen Bereich/i);
  assert.doesNotMatch(leiste.spokenText, /richtigen Bereich/i);
  assert.equal(leiste.guideStep, 1);
  assert.ok(navigationSpeech.has(leiste.spokenText), 'Leisten-Hilfe muss als statische Supertonic-F1-Sprachquelle katalogisiert sein');
  assert.equal(h.forwarded(), 0);
});

test('Reiter-Rückfrage erklärt Doku als Hauptreiter und nutzt katalogisierte statische Sprache', async () => {
  const h = harness({
    guideSlug: 'durchfuehrungsnachweis-oeffnen',
    guideTitle: 'Durchführungsnachweis öffnen',
    guideStep: 1,
    guideStepCount: 3,
  });

  const result = await ask(h, 'Was meinst du mit Reiter?', 'durchfuehrungsnachweis-oeffnen', 1);
  assert.equal(result.source, 'confirmed-durchfuehrung-orientation-v57');
  assert.match(result.spokenText, /Doku ist ein Hauptreiter/i);
  assert.match(result.spokenText, /Doku.*zwischen Planung und Doku-Erweitert/i);
  assert.match(result.spokenText, /weiße Funktionsband/i);
  assert.doesNotMatch(result.spokenText, /derselben Ebene wie Berichte|Berichte.*Hauptbereich/i);
  assert.doesNotMatch(result.spokenText, /Bereich wechseln|richtigen Bereich/i);
  assert.equal(result.guideStep, 1);
  assert.ok(navigationSpeech.has(result.spokenText), 'Reiter-Hilfe muss vorhandene statische Supertonic-F1-Sprache verwenden');
  assert.equal(h.forwarded(), 0);
});

test('resident-first Signoff-Guide nutzt dieselbe korrigierte Orientierung nur an seinem Doku-Schritt', async () => {
  const h = harness({
    guideSlug: 'durchfuehrungsnachweis-finden',
    guideTitle: 'Durchführungsnachweis finden',
    guideStep: 2,
    guideStepCount: 2,
  });

  const result = await ask(h, 'Wo ist Doku?', 'durchfuehrungsnachweis-finden', 2);
  assert.equal(result.source, 'confirmed-durchfuehrung-orientation-v57');
  assert.match(result.spokenText, /Doku ist ein Hauptreiter/i);
  assert.equal(result.guideStep, 2);
  assert.equal(result.completed, false);
  assert.ok(navigationSpeech.has(result.spokenText));
  assert.equal(h.forwarded(), 0);
});

test('Bericht-Ort wird nicht mehr als grüner Hauptreiter beschrieben und bleibt statisch sprechbar', () => {
  const h = harness(null);
  const text = h.window.DokoHilfOrientationHelpV29.orientationHelp('Wo finde ich Bericht?');
  assert.match(text, /Bericht ist kein Hauptreiter in der grünen Leiste/i);
  assert.match(text, /Doku/i);
  assert.match(text, /weiße Funktionsband/i);
  assert.doesNotMatch(text, /Berichte ist ein Hauptbereich|derselben Ebene wie Doku/i);
  assert.ok(navigationSpeech.has(text));
});

test('andere Guides behalten ihre bestehende Smart-Help-Reihenfolge', async () => {
  const h = harness({
    guideSlug: 'vitalwerte-einzelwert',
    guideTitle: 'Vitalwert erfassen',
    guideStep: 1,
    guideStepCount: 4,
  });

  const result = await ask(h, 'Wo ist die Leiste?', 'vitalwerte-einzelwert', 1);
  assert.equal(result.source, 'delegated-smart-help');
  assert.equal(h.forwarded(), 1);
});

test('v60 bleibt auf bestätigte Orientierung begrenzt und enthält keine falsche Bericht-Hierarchie', () => {
  assert.match(source, /20260902-spatial-orientation-v60-1/);
  assert.match(source, /durchfuehrungsnachweis-oeffnen.*step === 1/s);
  assert.match(source, /durchfuehrungsnachweis-finden.*step === 2/s);
  assert.doesNotMatch(source, /prüfe.*richtigen Bereich|richtigen Bereich.*prüfe/i);
  assert.doesNotMatch(source, /Berichte ist ein Hauptbereich|Doku ist ein Hauptbereich.*derselben Ebene wie Berichte/i);
  assert.equal(navigationCatalog.voice, 'Supertonic-F1');
  assert.equal(navigationCatalog.entries.length, 17);
});
