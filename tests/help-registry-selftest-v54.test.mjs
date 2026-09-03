import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [registrySource, stepHelp, selfTest, release, backend, versionRaw] = await Promise.all([
  read('assets/intent-registry-v54.js'),
  read('assets/step-help-v54.js'),
  read('assets/self-test-v54.js'),
  read('assets/release-polish-v29.js'),
  read('supabase/functions/dokohilf-chat-router/index.ts'),
  read('version.json'),
]);

function loadRegistry() {
  const listeners = new Map();
  const document = {
    addEventListener(type, fn) { listeners.set(type, fn); },
    getElementById() { return null; },
  };
  const window = {
    fetch: async () => new Response('{}', { status: 200 }),
  };
  const context = vm.createContext({ window, document, Request, Response, queueMicrotask, URL, console });
  vm.runInContext(registrySource, context, { filename: 'intent-registry-v54.js' });
  return window.DokoHilfIntentRegistryV54;
}

const registry = loadRegistry();

test('zentrale Intent-Regel priorisiert Abzeichnen vor dem Medikamenten-Gegenstand', () => {
  assert.equal(registry.resolveGuide('Ich muss Medikamente abzeichnen'), 'durchfuehrungsnachweis-finden');
  assert.equal(registry.resolveGuide('Wo kann ich das abzeichnen?'), 'durchfuehrungsnachweis-finden');
  assert.equal(registry.resolveGuide('Ich habe Medikamente falsch abgezeichnet'), 'durchfuehrung-storno');
  assert.equal(registry.resolveGuide('Medikation ansehen'), 'medikation-finden');
  assert.notEqual(registry.resolveGuide('Medikamente abhaken'), 'durchfuehrungsnachweis-finden');
});

test('fachlich offene Ziele werden von der zentralen Regelbasis nicht umgebogen', () => {
  for (const input of ['Berichtssuche', 'Berichte durchsuchen', 'Easy-Plan', 'Aufgaben Aktuelles']) {
    assert.equal(registry.blockedIntent(input), true, input);
    assert.equal(registry.resolveGuide(input), '', input);
  }
});

test('bestehende Bibliothekssuche und Routing verwenden dieselbe bestätigte Begriffsbasis', () => {
  assert.deepEqual([...registry.libraryTargets('Sauerstoff')], ['vitalwerte']);
  assert.deepEqual([...registry.libraryTargets('Arztbrief')], ['dateiablage']);
  assert.deepEqual([...registry.libraryTargets('Was war los?')], ['uebergabeformular']);
  assert.deepEqual([...registry.libraryTargets('Medikamente abzeichnen')], ['durchfuehrungsnachweis-oeffnen']);
  assert.deepEqual([...registry.libraryTargets('falsch abgezeichnet')], ['durchfuehrung-storno']);
});

test('zentrale Fetch-Schicht setzt nur bestätigte Slugs und respektiert bereits aktive Guides', () => {
  const base = { messages: [{ role: 'user', content: 'Ich muss Medikamente abzeichnen' }] };
  const routed = JSON.parse(registry.injectCanonicalRoute(JSON.stringify(base)));
  assert.equal(routed.selectedGuideSlug, 'durchfuehrungsnachweis-finden');
  assert.match(routed.confirmedIntentRegistryRevision, /confirmed-intent-registry-v54/);

  const existing = JSON.stringify({ ...base, selectedGuideSlug: 'medikation-finden' });
  assert.equal(registry.injectCanonicalRoute(existing), existing);

  const blocked = JSON.stringify({ messages: [{ role: 'user', content: 'Easy-Plan' }] });
  assert.equal(registry.injectCanonicalRoute(blocked), blocked);
});

test('Backend bleibt für die kritischen Prioritätsregeln mit der zentralen Client-Regel synchron', () => {
  assert.match(backend, /function isFalseSignOffCorrection\(text: string\): boolean/);
  assert.match(backend, /function hasSignOffIntent\(text: string\): boolean/);
  assert.match(backend, /if \(isFalseSignOffCorrection\(lastText\)\)/);
  assert.match(backend, /if \(hasSignOffIntent\(lastText\)\)/);
  assert.match(backend, /durchfuehrung-storno/);
  assert.match(backend, /durchfuehrungsnachweis-finden/);
  assert.match(backend, /berichtssuche|berichte durchsuchen/);
  assert.match(backend, /easy plan|easy-plan|easyplan/);
});

test('sichtbare Hilfe zum Schritt nutzt nur die bestehende bestätigte Stuck-Hilfe', () => {
  assert.match(stepHelp, /Hilfe zum Schritt/);
  assert.match(stepHelp, /api\.sendMessage\('ich finde das nicht'\)/);
  assert.match(stepHelp, /DokoHilfGuideProgress\?\.getCurrentGuide/);
  assert.doesNotMatch(stepHelp, /localStorage|sessionStorage|indexedDB|cookie/i);
  assert.doesNotMatch(stepHelp, /Bewohner auswählen.*wenn/i, 'v54 darf keine neuen fachlichen Ersatzschritte erfinden');
});

test('Selbsttest bleibt lokal, datensparsam und prüft ausschließlich statische Supertonic-Stimme', () => {
  assert.match(selfTest, /DokoHilf prüfen/);
  assert.match(selfTest, /Supertonic-F1/);
  assert.match(selfTest, /method: 'OPTIONS'/);
  assert.match(selfTest, /navigator\.mediaDevices\?\.getUserMedia/);
  assert.match(selfTest, /for \(const track of stream\.getTracks\(\)\) track\.stop\(\)/);
  assert.match(selfTest, /Es wurde nichts gespeichert oder übertragen/);
  assert.doesNotMatch(selfTest, /MediaRecorder|speechSynthesis|SpeechSynthesisUtterance|openai|elevenlabs|cloud.*tts/i);
  assert.doesNotMatch(selfTest, /localStorage|sessionStorage|indexedDB|document\.cookie/i);
});

test('Registry, Guide Discovery, Schritthilfe und Selbsttest bleiben mit der aktuellen App-Version gekoppelt', () => {
  const version = JSON.parse(versionRaw);
  assert.match(version.appVersion, /^v\d+$/);
  assert.equal(typeof version.release, 'string');
  assert.ok(version.release.trim().length > 0);
  assert.match(release, new RegExp(`const VERSION_LABEL = '${version.appVersion}'`));

  const loader = release.match(/async function loadV54Features\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
  assert.ok(loader, 'loadV54Features missing');
  const registryAt = loader.indexOf("assets/intent-registry-v54.js");
  const discoveryAt = loader.indexOf('await loadGuideDiscovery()');
  const stepAt = loader.indexOf("assets/step-help-v54.js");
  const selfAt = loader.indexOf("assets/self-test-v54.js");
  assert.ok(registryAt >= 0 && discoveryAt > registryAt);
  assert.ok(stepAt > discoveryAt && selfAt > discoveryAt);
});
