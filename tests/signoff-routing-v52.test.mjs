import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [routing, chatRouter, migration, workflows, audioCatalog, serviceWorker, versionJson] = await Promise.all([
  read('assets/routing-fix.js'),
  read('supabase/functions/dokohilf-chat-router/index.ts'),
  read('supabase/migrations/20260822181400_abzeichnen_durchfuehrungsnachweis_v52.sql'),
  read('CONFIRMED_WORKFLOWS.md'),
  read('assets/guide-audio-catalog.json'),
  read('service-worker.js'),
  read('version.json'),
]);

function browserRoute(input) {
  const fakeWindow = {
    location: { hostname: 'example.invalid' },
    fetch: async () => new Response('{}', { status: 200 }),
  };
  const context = vm.createContext({ window: fakeWindow, Response, Request });
  vm.runInContext(routing, context, { filename: 'routing-fix.js' });
  return fakeWindow.DokoHilfRouting.inferSelectedGuideSlug(input);
}

test('jede aktuelle Abzeichnen-Absicht führt zum Durchführungsnachweis', () => {
  for (const input of [
    'Ich muss Medikamente abzeichnen',
    'Ich möchte Medikamente abzeichnen',
    'Maßnahme abzeichnen',
    'Wo kann ich das abzeichnen?',
    'Das muss abgezeichnet werden',
  ]) {
    assert.equal(browserRoute(input), 'durchfuehrungsnachweis-finden', input);
  }
});

test('Medikation ansehen bleibt getrennt und falsch abgezeichnet bleibt Storno', () => {
  assert.equal(browserRoute('Medikation ansehen'), 'medikation-finden');
  assert.equal(browserRoute('Medikamente anschauen'), 'medikation-finden');
  assert.equal(browserRoute('Ich habe das falsch abgezeichnet'), 'durchfuehrung-storno');
  assert.equal(browserRoute('Durchführung versehentlich abgezeichnet'), 'durchfuehrung-storno');
});

test('Backend priorisiert Abzeichnen vor der Medikamenten-Navigation', () => {
  assert.match(chatRouter, /function hasSignOffIntent\(text: string\): boolean/);
  assert.match(chatRouter, /function isFalseSignOffCorrection\(text: string\): boolean/);
  assert.match(chatRouter, /if \(hasSignOffIntent\(lastText\)\)/);
  assert.match(chatRouter, /loadGuide\('durchfuehrungsnachweis-finden'\)/);
  assert.match(chatRouter, /approved-signoff-durchfuehrungsnachweis-v52/);
  assert.match(chatRouter, /approved-signoff-storno-v52/);
  assert.match(chatRouter, /if \(hasSignOffIntent\(n\)\) return 'durchfuehrungsnachweis-finden'/);
});

test('bestätigter Guide beginnt beim Bewohner und endet am Durchführungsnachweis', () => {
  assert.match(migration, /where slug = 'durchfuehrungsnachweis-finden'/);
  assert.match(migration, /and version = 3/);
  assert.match(migration, /'Wähle zuerst den gewünschten Bewohner aus\.'/);
  assert.match(migration, /'Schau ganz oben in die feste grüne Hauptleiste und öffne „Doku“\. Direkt darunter erscheinen die zu „Doku“ gehörenden Funktionen\. Wähle dort „Durchführungsnachweis“\.'/);
  assert.match(migration, /'medikamente abzeichnen'/);
  assert.match(migration, /'maßnahme abzeichnen'/);
  assert.match(migration, /version = 4/);
  assert.doesNotMatch(migration, /Medikament.*anhaken|Tablette.*anhaken|Kästchen.*Medikament/i, 'nach Öffnen des Durchführungsnachweises darf kein unbestätigter Medikamenten-Klickweg erfunden werden');
});

test('Fachquelle hält Abzeichnen und reine Medikationsansicht ausdrücklich auseinander', () => {
  assert.match(workflows, /Wenn jemand etwas \*\*abzeichnen\*\* möchte/);
  assert.match(workflows, /richtigen Bewohner.*\*\*Doku → Durchführungsnachweis\*\*/s);
  assert.match(workflows, /Medikamente abzeichnen/);
  assert.match(workflows, /Doku-Erweitert → Medikation.*ausschließlich.*ansehen/s);
});

test('für den Hotfix werden ausschließlich bereits statisch vorhandene Supertonic-Sätze verwendet', () => {
  assert.match(audioCatalog, /Wähle zuerst den gewünschten Bewohner aus\./);
  assert.match(audioCatalog, /Schau ganz oben in die feste grüne Hauptleiste und öffne „Doku“\. Direkt darunter erscheinen die zu „Doku“ gehörenden Funktionen\. Wähle dort „Durchführungsnachweis“\./);
});

test('PWA übernimmt den Hotfix ohne öffentlichen Versionssprung', () => {
  assert.match(serviceWorker, /ROUTING_REVISION = '20260822-signoff-durchfuehrungsnachweis-v52-1'/);
  const version = JSON.parse(versionJson);
  assert.equal(version.appVersion, 'v31');
});
