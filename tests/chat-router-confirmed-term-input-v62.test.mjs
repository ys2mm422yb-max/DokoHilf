import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const routerSource = await readFile(new URL('../supabase/functions/dokohilf-chat-router/index.ts', import.meta.url), 'utf8');

function sliceFunction(name, nextName) {
  const start = routerSource.indexOf(`function ${name}`);
  const end = routerSource.indexOf(`function ${nextName}`, start + 1);
  assert.notEqual(start, -1, `missing ${name}`);
  assert.notEqual(end, -1, `missing boundary ${nextName}`);
  return routerSource.slice(start, end);
}

function loadRoutingUnit() {
  let unit = [
    sliceFunction('normalize', 'compactNormalize'),
    sliceFunction('compactNormalize', 'hasCompactTerm'),
    sliceFunction('hasCompactTerm', 'corsHeaders'),
    sliceFunction('isFalseSignOffCorrection', 'hasSignOffIntent'),
    sliceFunction('hasSignOffIntent', 'isExplicitHelp'),
    sliceFunction('hasEntryAction', 'hasNavigationIntent'),
    sliceFunction('hasNavigationIntent', 'isUnconfirmedReportSearch'),
    sliceFunction('isUnconfirmedReportSearch', 'inferNavigationGuide'),
    sliceFunction('inferNavigationGuide', 'stepResponse'),
  ].join('\n');

  unit = unit
    .replace(/\(value: unknown\): string/g, '(value)')
    .replace(/\(value: unknown, \.\.\.terms: string\[\]\): boolean/g, '(value, ...terms)')
    .replace(/\(text: string\): boolean/g, '(text)')
    .replace(/\(text: string\): string/g, '(text)');

  return new Function(`${unit}\nreturn { normalize, compactNormalize, hasCompactTerm, isFalseSignOffCorrection, hasSignOffIntent, hasEntryAction, hasNavigationIntent, isUnconfirmedReportSearch, inferNavigationGuide };`)();
}

const router = loadRoutingUnit();

test('server router recognizes confirmed split and joined sign-off wording', () => {
  assert.equal(router.inferNavigationGuide('Ich muss Medikamente ab zeichnen'), 'durchfuehrungsnachweis-finden');
  assert.equal(router.inferNavigationGuide('Ich muss Medikamente abzuzeichnen'), 'durchfuehrungsnachweis-finden');
  assert.equal(router.inferNavigationGuide('Das muss ab gezeichnet werden'), 'durchfuehrungsnachweis-finden');
  assert.equal(router.inferNavigationGuide('Ich habe falsch ab gezeichnet'), 'durchfuehrung-storno');
  assert.equal(router.inferNavigationGuide('Versehentlich abgezeichnet'), 'durchfuehrung-storno');
});

test('server router gives split confirmed compound terms the same guide as canonical spelling', () => {
  const cases = [
    ['Wo finde ich den Durchführungs Nachweis?', 'Wo finde ich den Durchführungsnachweis?', 'durchfuehrungsnachweis-finden'],
    ['Wo finde ich Bedarfs Medikation?', 'Wo finde ich Bedarfsmedikation?', 'bedarfsmedikation-finden'],
    ['Wo finde ich die Wirksamkeits Kontrolle?', 'Wo finde ich die Wirksamkeitskontrolle?', 'bedarfsmedikation-wirksamkeitskontrolle-finden'],
    ['Wo finde ich Maßnahmen ohne Zeit Angabe?', 'Wo finde ich Maßnahmen ohne Zeitangabe?', 'massnahmen-ohne-zeitangabe-finden'],
    ['Wo ist Doku Erweitert?', 'Wo ist Doku-Erweitert?', 'doku-erweitert-finden'],
    ['Wo finde ich Vital Werte?', 'Wo finde ich Vitalwerte?', 'vitalwerte-finden'],
    ['Wo finde ich Blut Druck?', 'Wo finde ich Blutdruck?', 'vitalwerte-finden'],
    ['Wo finde ich Blut Zucker?', 'Wo finde ich Blutzucker?', 'vitalwerte-finden'],
    ['Wo finde ich Sauerstoff Sättigung?', 'Wo finde ich Sauerstoffsättigung?', 'vitalwerte-finden'],
    ['Wo ist der Medikations Plan?', 'Wo ist der Medikationsplan?', 'medikation-finden'],
    ['Wo ist das Sturz Protokoll?', 'Wo ist das Sturzprotokoll?', 'formulare-finden'],
    ['Wo ist das Fall Gespräch?', 'Wo ist das Fallgespräch?', 'formulare-finden'],
    ['Wo ist das Notfall Blatt?', 'Wo ist das Notfallblatt?', 'notfallblatt-finden'],
    ['Wo sind die Stamm Daten?', 'Wo sind die Stammdaten?', 'stammdaten-finden'],
  ];

  for (const [split, canonical, expected] of cases) {
    assert.equal(router.inferNavigationGuide(split), expected, split);
    assert.equal(router.inferNavigationGuide(canonical), expected, canonical);
  }
});

test('server router keeps confirmed professional boundaries while matching more robustly', () => {
  assert.equal(router.inferNavigationGuide('Medikamente abhaken'), '');
  assert.equal(router.hasSignOffIntent('Medikamente abhaken'), false);
  assert.equal(router.hasEntryAction('Medikamente abhaken'), true);

  assert.equal(router.inferNavigationGuide('Wo ist die Bericht Suche?'), '');
  assert.equal(router.isUnconfirmedReportSearch('Wo ist die Bericht Suche?'), true);
  assert.equal(router.inferNavigationGuide('Wo ist Easy Plan?'), '');
  assert.equal(router.inferNavigationGuide('Wo sind Aufgaben Aktuelles?'), '');

  assert.equal(router.inferNavigationGuide('Medikation ansehen'), 'medikation-finden');
  assert.equal(router.inferNavigationGuide('Wo ist Doku?'), 'doku-finden');
});

test('server router exposes the v62 revision without changing guide copy or voice technology', () => {
  assert.match(routerSource, /CHAT_ROUTER_REVISION = 'context-aware-v29-7-confirmed-term-input-v62'/);
  assert.match(routerSource, /approved-signoff-durchfuehrungsnachweis-v52/);
  assert.match(routerSource, /approved-signoff-storno-v52/);
  assert.match(routerSource, /approved-guide-smart-start-v44/);
  assert.doesNotMatch(routerSource, /speechSynthesis|SpeechSynthesisUtterance|cloud-tts|browser-tts/i);
});
