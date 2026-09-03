import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/orientation-help-v29.js', import.meta.url), 'utf8');
const catalog = JSON.parse(await readFile(new URL('../assets/voice-navigation-catalog-v29.json', import.meta.url), 'utf8'));
const serviceWorker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const workNote = await readFile(new URL('../ACTIVE_WORK_ORIENTATION_SPATIAL_V59.md', import.meta.url), 'utf8');

function loadWindow(guide = null) {
  const window = {
    fetch: async () => new Response(JSON.stringify({ source: 'delegated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
    DokoHilfGuideProgress: { getCurrentGuide: () => guide },
    DokoHilfSmartHelpV29: { preparedBody: () => '' },
  };
  new Function('window', 'Request', 'Response', source)(window, Request, Response);
  return window;
}

test('weißes Funktionsband wird räumlich als zweite Navigationsebene erklärt', () => {
  const window = loadWindow();
  for (const question of [
    'Wo ist das Funktionsband?',
    'Was ist die weiße Leiste?',
    'Wo ist die untere Leiste?',
    'Wo ist das weiße Funktionen Band?',
    'Wo ist das Weißefunktionsband?',
  ]) {
    const text = window.DokoHilfOrientationHelpV29.orientationHelp(question);
    assert.match(text, /feste grüne Hauptleiste ist ganz oben/i);
    assert.match(text, /Direkt darunter befindet sich das weiße Funktionsband/i);
    assert.match(text, /Bericht und Durchführungsnachweis/i);
    assert.match(text, /Bericht ist kein Hauptbereich der grünen Leiste/i);
  }
});

test('DNF-Doku-Schritt beantwortet Spracherkennungsvarianten lokal ohne Schrittwechsel', async () => {
  const variants = [
    'Was ist das weiße Funktionsband?',
    'Wo ist das weiße Funktionen Band?',
    'Wo ist das Weißefunktionsband?',
    'Wo ist die weiße Liste?',
  ];

  for (const guide of [
    {
      guideSlug: 'durchfuehrungsnachweis-oeffnen',
      guideTitle: 'Durchführungsnachweis öffnen',
      guideStep: 1,
      guideStepCount: 3,
    },
    {
      guideSlug: 'durchfuehrungsnachweis-finden',
      guideTitle: 'Durchführungsnachweis finden',
      guideStep: 2,
      guideStepCount: 2,
    },
  ]) {
    const window = loadWindow(guide);
    for (const content of variants) {
      const response = await window.fetch('https://example.invalid/functions/v1/dokohilf-chat-router', {
        method: 'POST',
        body: JSON.stringify({
          guideSlug: guide.guideSlug,
          guideStep: guide.guideStep,
          messages: [{ role: 'user', content }],
        }),
      });
      const result = await response.json();
      assert.equal(result.source, 'confirmed-spatial-orientation-v60');
      assert.equal(result.guideStep, guide.guideStep);
      assert.equal(result.completed, false);
      assert.match(result.spokenText, /Direkt darunter befindet sich das weiße Funktionsband/i);
    }
  }
});

test('mehrdeutige Liste-Variante wird außerhalb des DNF-Kontexts nicht global umgedeutet', () => {
  const window = loadWindow();
  assert.equal(window.DokoHilfOrientationHelpV29.orientationHelp('Wo ist die weiße Liste?'), '');
  assert.equal(window.DokoHilfOrientationHelpV29.isWhiteFunctionBandReference('Wo ist die weiße Liste?'), false);
  assert.equal(window.DokoHilfOrientationHelpV29.isWhiteFunctionBandReference('Wo ist die weiße Liste?', { allowContextualListAlias: true }), true);
});

test('räumliche Hilfe nutzt bereits katalogisierte statische Supertonic-F1-Sprache', () => {
  const window = loadWindow();
  const text = window.DokoHilfOrientationHelpV29.whiteFunctionBandHelp();
  assert.equal(catalog.voice, 'Supertonic-F1');
  assert.equal(catalog.entries.length, 17);
  assert.ok(catalog.entries.some(entry => entry.text === text));
});

test('v60 ändert keine fachlichen Guides und hält die neutrale Veröffentlichungsgrenze ein', () => {
  assert.match(workNote, /Keine Supabase-Guide-Schritte und keine fachlichen Klickwege in diesem Block ändern/i);
  assert.match(workNote, /ausschließlich anonymisierte, selbst formulierte und bereits bestätigte Bedien- und Orientierungsinformationen/i);
  assert.match(workNote, /Nicht bestätigte Details bleiben offen und werden nicht ergänzt/i);
  assert.match(workNote, /bereits vorhandenen.*Supertonic-F1-Satz wiederverwenden/i);
  assert.match(workNote, /Spracherkennungsvarianten/i);
  assert.match(workNote, /Vitalwerte/i);
  assert.match(workNote, /An-\/Abwesenheiten/i);
  assert.match(workNote, /Durchführungsnachweis/i);
  assert.match(workNote, /Bereich wechseln/i);
  assert.match(workNote, /Berichtssuche \/ Easy-Plan \/ Aufgaben · Aktuelles/i);
});

test('PWA aktiviert v60 ohne bestehende Revisionsmarker zu verlieren', () => {
  assert.match(serviceWorker, /SPATIAL_ORIENTATION_REVISION = '20260902-spatial-orientation-v60-1'/);
  assert.match(serviceWorker, /search-v55-dnf-orientation-v57-report-navigation-v58-spatial-orientation-v60/);
  assert.match(serviceWorker, /HOTFIX_REVISION = '20260809-static-supertonic-orientation-ui-v29-3'/);
  assert.match(serviceWorker, /ROUTING_REVISION = '20260822-signoff-durchfuehrungsnachweis-v52-1'/);
  assert.match(serviceWorker, /GUIDE_DISCOVERY_REVISION = '20260823-guide-discovery-v53-1'/);
});
