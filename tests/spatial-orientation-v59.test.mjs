import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/orientation-help-v29.js', import.meta.url), 'utf8');
const navigationCatalog = JSON.parse(await readFile(new URL('../assets/voice-navigation-catalog-v29.json', import.meta.url), 'utf8'));
const serviceWorker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const workDoc = await readFile(new URL('../ACTIVE_WORK_SPATIAL_ORIENTATION_V59.md', import.meta.url), 'utf8');
const navigationSpeech = new Set((navigationCatalog.entries || []).map(entry => entry.text));

function harness(guide = null) {
  let forwarded = 0;
  const window = {
    fetch: async () => {
      forwarded += 1;
      return new Response(JSON.stringify({ source: 'delegated-smart-help' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
    DokoHilfGuideProgress: { getCurrentGuide: () => guide },
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

test('v59 erklärt das weiße Funktionsband räumlich und statisch sprechbar', () => {
  const h = harness();
  const text = h.window.DokoHilfOrientationHelpV29.orientationHelp('Was ist das weiße Funktionsband?');

  assert.match(text, /grüne Hauptleiste.*ganz oben/i);
  assert.match(text, /direkt unter.*grünen Hauptleiste.*weiße Funktionsband/i);
  assert.match(text, /beschriftete Symbole beziehungsweise Schaltflächen/i);
  assert.match(text, /Doku.*Bericht und Durchführungsnachweis/i);
  assert.doesNotMatch(text, /Bericht.*Hauptreiter der grünen Leiste/i);
  assert.ok(navigationSpeech.has(text), 'räumliche Hilfe muss im statischen Supertonic-F1-Katalog liegen');
  assert.equal(h.window.DokoHilfOrientationHelpV29.spatialRevision, '20260901-spatial-orientation-v59-1');
});

test('v59 versteht weiße Leiste als Funktionsband und nicht als neuen Klickweg', () => {
  const h = harness();
  const text = h.window.DokoHilfOrientationHelpV29.orientationHelp('Wo ist die weiße Leiste?');

  assert.match(text, /weiße Funktionsband/i);
  assert.match(text, /gerade ausgewählten Hauptbereichs/i);
  assert.doesNotMatch(text, /Bereich wechseln|richtigen Bereich prüfen/i);
  assert.ok(navigationSpeech.has(text));
});

test('DNF-Schritt beantwortet Funktionsband-Rückfrage lokal ohne Fortschritt', async () => {
  const h = harness({
    guideSlug: 'durchfuehrungsnachweis-oeffnen',
    guideTitle: 'Durchführungsnachweis öffnen',
    guideStep: 1,
    guideStepCount: 3,
  });

  const result = await ask(h, 'Was meinst du mit Funktionsband?', 'durchfuehrungsnachweis-oeffnen', 1);
  assert.equal(result.source, 'confirmed-spatial-orientation-v59');
  assert.equal(result.guideStep, 1);
  assert.equal(result.completed, false);
  assert.match(result.spokenText, /weiße Funktionsband/i);
  assert.ok(navigationSpeech.has(result.spokenText));
  assert.equal(h.forwarded(), 0);
});

test('v59 ändert den bestehenden Vitalwerte-Weg noch nicht', () => {
  const h = harness();
  const text = h.window.DokoHilfOrientationHelpV29.orientationHelp('Wo finde ich Vitalwerte?');
  assert.match(text, /Doku-Erweitert/i);
  assert.doesNotMatch(text, /zuerst Doku in der grünen Hauptleiste/i);
});

test('Roadmap hält Datenschutzgrenze und Schritt-für-Schritt-Scope fest', () => {
  assert.match(workDoc, /Originale visuelle Quellen.*weder in GitHub noch in Supabase gespeichert/i);
  assert.match(workDoc, /Keine Namen, Personen-, Bewohner-, Mitarbeiter-, Fall-, Gesundheits-/i);
  assert.match(workDoc, /Nächste Schritte – strikt einzeln/i);
  assert.match(workDoc, /Vitalwerte/i);
  assert.match(workDoc, /An-\/Abwesenheiten/i);
  assert.match(workDoc, /Durchführungsnachweis – Detailwissen/i);
  assert.match(workDoc, /Bereich wechseln/i);
  assert.doesNotMatch(workDoc, /https?:\/\//i);
  assert.doesNotMatch(workDoc, /data:image|base64/i);
});

test('PWA aktiviert v59 und bewahrt bestehende Hotfix-Marker', () => {
  assert.match(serviceWorker, /20260901-spatial-orientation-v59-1/);
  assert.match(serviceWorker, /search-v55-dnf-orientation-v57-report-navigation-v58-spatial-orientation-v59/);
  assert.match(serviceWorker, /20260809-static-supertonic-orientation-ui-v29-3/);
  assert.match(serviceWorker, /20260822-signoff-durchfuehrungsnachweis-v52-1/);
  assert.match(serviceWorker, /20260823-search-flicker-hotfix-v55-1/);
  assert.match(serviceWorker, /20260823-guide-discovery-v53-1/);
});
