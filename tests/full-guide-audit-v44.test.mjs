import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [library, copy, routing, chatRouter, conversationRouter] = await Promise.all([
  read('assets/guide-library-v29.js'),
  read('assets/direct-guide-copy-v29.js'),
  read('assets/routing-fix.js'),
  read('supabase/functions/dokohilf-chat-router/index.ts'),
  read('supabase/functions/dokohilf-conversation-router/index.ts'),
]);

test('jeder sichtbare Sonderhinweis hat nur eine kanonische Renderquelle', () => {
  const canonicalSpecials = [...library.matchAll(/specialAfter:\s*\d+/g)];
  assert.equal(canonicalSpecials.length, 2, 'Visite und Einzel-Vitalwerte sind die zwei bestätigten Inline-Sonderhinweise');
  assert.match(library, /specialTitle: 'Sonderfall · Arzt nicht beim Bewohner hinterlegt\?'/);
  assert.match(library, /specialTitle: 'Beispiele'/);

  assert.doesNotMatch(copy, /function\s+insertSpecialAfter|insertSpecialAfter\s*\(/, 'Copy-Polish darf keinen zweiten Hinweisblock erzeugen');
  assert.doesNotMatch(copy, /v29VisitDoctorSpecial|data-v29-visit-doctor-special/);
  assert.match(copy, /function dedupeSpecialCallouts\(view\)/, 'globale Duplikatsperre muss aktiv bleiben');
  assert.match(copy, /view\.dataset\.v44DeduplicatedSpecials/);
});

test('Berichtskategorie und bereits sichtbares Textfeld bleiben ein Schritt statt zwei', () => {
  assert.match(copy, /v44ReportMaskConsolidated/);
  assert.match(copy, /step\.remove\(\)/);
  assert.match(copy, /Das große Textfeld für den Bericht ist unten in derselben Maske bereits sichtbar/);
  assert.match(copy, /renumberSteps\(view\)/);
  assert.match(copy, /Wichtig für Schichtübergabe/);
});

test('Navigation und Dokumentation werden im Browser-Router strikt getrennt', () => {
  const fakeWindow = {
    location: { hostname: 'example.invalid' },
    fetch: async () => new Response('{}', { status: 200 }),
  };
  const context = vm.createContext({ window: fakeWindow, Response, Request });
  vm.runInContext(routing, context, { filename: 'routing-fix.js' });
  const route = fakeWindow.DokoHilfRouting.inferSelectedGuideSlug;

  const navigationCases = [
    ['Bericht suchen', 'berichte-finden'],
    ['Visiten finden', 'visiten-finden'],
    ['Vitalwerte finden', 'vitalwerte-finden'],
    ['Formulare öffnen', 'formulare-finden'],
    ['Anwesenheit suchen', 'anwesenheiten-finden'],
    ['Medikation ansehen', 'medikation-finden'],
    ['Notfallblatt öffnen', 'notfallblatt-finden'],
    ['Übergabe anzeigen', 'uebergabe-finden'],
    ['Stammdaten finden', 'stammdaten-finden'],
  ];
  for (const [input, expected] of navigationCases) assert.equal(route(input), expected, input);

  assert.equal(route('Bericht anlegen'), 'bericht-neu');
  assert.equal(route('Visite dokumentieren'), 'visite-anlegen');
  assert.equal(route('Anwesenheit eintragen'), 'anwesenheit');
  assert.equal(route('Formular erstellen'), 'formulare-anlegen');

  for (const unconfirmed of ['Berichtssuche', 'Berichte durchsuchen', 'Easy Plan öffnen', 'Aufgaben öffnen']) {
    assert.equal(route(unconfirmed), '', `${unconfirmed} darf keinen bestätigten Ablauf vortäuschen`);
  }
});

test('Backend-Navigation verwendet dieselben bestätigten Finden-Guides', () => {
  for (const slug of [
    'berichte-finden', 'visiten-finden', 'vitalwerte-finden', 'formulare-finden',
    'anwesenheiten-finden', 'medikation-finden', 'uebergabe-finden',
    'notfallblatt-finden', 'stammdaten-finden', 'durchfuehrungsnachweis-finden',
  ]) assert.match(chatRouter, new RegExp(`return '${slug}'`));

  assert.match(chatRouter, /function isUnconfirmedReportSearch\(text: string\)/);
  assert.match(chatRouter, /approved-guide-smart-start-v44/);
});

test('laufende Guides fallen bei Weiter nicht mehr in die alte generische Completion zurück', () => {
  assert.match(conversationRouter, /approved-guide-positive-advance-v44/);
  assert.match(conversationRouter, /if \(currentIndex >= guide\.steps\.length - 1\) return renderCompletion/);
  assert.doesNotMatch(conversationRouter, /Der Ablauf ist erledigt|vorgesehenen Übersicht/);

  assert.match(chatRouter, /LEGACY_FALSE_COMPLETION/);
  assert.match(chatRouter, /Der Ablauf ist erledigt\|vorgesehenen Übersicht\|Kontrolliere zum Schluss den Eintrag/);
  assert.match(chatRouter, /legacy-completion-guard-v44/);
  assert.match(chatRouter, /Alles klar\. Wenn du noch etwas brauchst, sag einfach Bescheid\./);
});
