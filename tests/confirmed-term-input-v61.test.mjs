import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const smartSource = await readFile(new URL('../assets/smart-help-v29.js', import.meta.url), 'utf8');
const orientationSource = await readFile(new URL('../assets/orientation-help-v29.js', import.meta.url), 'utf8');
const serviceWorker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const navigationCatalog = JSON.parse(await readFile(new URL('../assets/voice-navigation-catalog-v29.json', import.meta.url), 'utf8'));
const navigationSpeech = new Set((navigationCatalog.entries || []).map(entry => entry.text));

function loadSmart() {
  const window = {
    fetch: async () => new Response('{}', { status: 200 }),
  };
  const document = {
    querySelector: () => ({ dataset: { dokohilfFileStorageV46: 'true' } }),
    createElement: () => ({ dataset: {} }),
    head: { append: () => {} },
  };
  new Function('window', 'document', 'Request', 'Response', smartSource)(window, document, Request, Response);
  return window.DokoHilfSmartHelpV29;
}

function loadOrientation() {
  const window = {
    fetch: async () => new Response('{}', { status: 200 }),
    DokoHilfGuideProgress: { getCurrentGuide: () => null },
    DokoHilfSmartHelpV29: { preparedBody: () => '' },
  };
  new Function('window', 'Request', 'Response', orientationSource)(window, Request, Response);
  return window.DokoHilfOrientationHelpV29;
}

test('bestätigte zusammengesetzte Navigationsbegriffe funktionieren getrennt oder verbunden', () => {
  const smart = loadSmart();
  const cases = new Map([
    ['Wo finde ich den Durchführungs Nachweis?', 'durchfuehrungsnachweis-finden'],
    ['Wo finde ich den Durchfuehrungs Nachweis?', 'durchfuehrungsnachweis-finden'],
    ['Wo ist DokuErweitert?', 'doku-erweitert-finden'],
    ['Wo finde ich Bedarfs Medikation?', 'bedarfsmedikation-finden'],
    ['Wo finde ich die Wirksamkeits Kontrolle der Bedarfs Medikation?', 'bedarfsmedikation-wirksamkeitskontrolle-finden'],
    ['Wo finde ich Maßnahmen ohne Zeit Angabe?', 'massnahmen-ohne-zeitangabe-finden'],
    ['Wo finde ich Vital Werte?', 'vitalwerte-finden'],
    ['Wo finde ich Blut Druck?', 'vitalwerte-finden'],
    ['Wo finde ich Blut Zucker?', 'vitalwerte-finden'],
    ['Wo finde ich Sauerstoff Sättigung?', 'vitalwerte-finden'],
    ['Wo finde ich den Medikations Plan?', 'medikation-finden'],
    ['Wo ist das Sturz Protokoll?', 'formulare-finden'],
    ['Wo ist das Fall Gespräch?', 'formulare-finden'],
    ['Wo ist das Notfall Blatt?', 'notfallblatt-finden'],
    ['Wo sind die Stamm Daten?', 'stammdaten-finden'],
    ['Wo ist die Bewohner Übersicht?', 'stammdaten-finden'],
    ['Wo ist der Arzt Brief?', 'dateiablage'],
    ['Wo ist die Datei Ablage?', 'dateiablage'],
  ]);

  for (const [input, expected] of cases) {
    assert.equal(smart.inferNavigationGuide(input), expected, input);
  }
});

test('fachliche Grenzen bleiben trotz robuster Schreibweise erhalten', () => {
  const smart = loadSmart();
  assert.equal(smart.inferNavigationGuide('Wo ist die Bericht Suche?'), '');
  assert.equal(smart.inferNavigationGuide('Wo ist EasyPlan?'), '');
  assert.equal(smart.inferNavigationGuide('Wo sind Aufgaben Aktuelles?'), '');
});

test('abzeichnen bleibt robust und abhaken wird nicht versehentlich zum Abzeichnen', () => {
  const smart = loadSmart();
  assert.equal(smart.inferTaskGuide('Ich muss Medikamente ab zeichnen'), 'durchfuehrungsnachweis-finden');
  assert.equal(smart.inferTaskGuide('Ich muss Medikamente abzuzeichnen'), 'durchfuehrungsnachweis-finden');
  assert.equal(smart.inferTaskGuide('Ich habe falsch ab gezeichnet'), 'durchfuehrung-storno');
  assert.equal(smart.inferTaskGuide('Medikamente abhaken'), '');
  assert.equal(smart.inferNavigationGuide('Medikamente abhaken'), '');
});

test('bestehende Orientierungstexte reagieren auf Split-Varianten ohne neue Sprachsätze', () => {
  const orientation = loadOrientation();
  const inputs = [
    'Wo finde ich den Durchführungs Nachweis?',
    'Wo ist DokuErweitert?',
    'Wo finde ich Bedarfs Medikation?',
    'Wo finde ich die Wirksamkeits Kontrolle der Bedarfs Medikation?',
    'Wo finde ich Maßnahmen ohne Zeit Angabe?',
    'Wo finde ich Vital Werte?',
    'Wo finde ich den Medikations Plan?',
    'Wo ist das Sturz Protokoll?',
    'Wo ist das Notfall Blatt?',
    'Wo sind die Stamm Daten?',
    'Wo ist die Bewohner Übersicht?',
  ];

  for (const input of inputs) {
    const text = orientation.orientationHelp(input);
    assert.ok(text, input);
    assert.ok(navigationSpeech.has(text), `${input}: Antwort muss vorhandene statische Supertonic-F1-Sprache bleiben`);
  }
  assert.equal(navigationCatalog.voice, 'Supertonic-F1');
  assert.equal(navigationCatalog.entries.length, 17);
});

test('v60 Listen-Ausnahme bleibt eng und wird nicht als allgemeine Fuzzy-Erkennung ausgeweitet', () => {
  const orientation = loadOrientation();
  assert.equal(orientation.orientationHelp('Wo ist die weiße Liste?'), '');
  assert.match(orientation.inputRevision, /confirmed-term-input-v61/);
});

test('PWA rotiert nur den Shell-Cache und bewahrt die bestätigten Release-Grenzen', () => {
  assert.match(serviceWorker, /INPUT_ROBUSTNESS_REVISION = '20260902-confirmed-term-input-v61-1'/);
  assert.match(serviceWorker, /spatial-orientation-v60-confirmed-term-input-v61/);
  assert.match(serviceWorker, /HOTFIX_REVISION = '20260809-static-supertonic-orientation-ui-v29-3'/);
  assert.match(serviceWorker, /ROUTING_REVISION = '20260822-signoff-durchfuehrungsnachweis-v52-1'/);
  assert.match(serviceWorker, /GUIDE_DISCOVERY_REVISION = '20260823-guide-discovery-v53-1'/);
});
