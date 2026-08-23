import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [source, releasePolish] = await Promise.all([
  read('assets/guide-library-intelligence-v53.js'),
  read('assets/release-polish-v29.js'),
]);

const context = {};
vm.runInNewContext(source, context, { filename: 'guide-library-intelligence-v53.js' });
const api = context.DokoHilfGuideLibraryIntelligenceV53;

test('v53 exposes one deterministic library intelligence registry', () => {
  assert.ok(api);
  assert.equal(api.revision, '20260823-guide-library-intelligence-v53-1');
  assert.equal(api.registry['bericht-neu'].stepGuideSlug, 'bericht-neu');
  assert.equal(api.registry['medikation-ansehen'].stepGuideSlug, 'medikation-ansehen');
  assert.equal(api.registry['durchfuehrungsnachweis-oeffnen'].stepGuideSlug, 'durchfuehrungsnachweis-finden');
  assert.equal(api.registry.dateiablage.stepGuideSlug, 'dateiablage');
});

test('existing library search understands approved aliases instead of card text only', () => {
  assert.ok(api.searchScore('durchfuehrungsnachweis-oeffnen', 'Durchführungsnachweis Nachweis öffnen', 'Medikamente abzeichnen') > 0);
  assert.equal(api.searchScore('medikation-ansehen', 'Medikation ansehen Medikationsübersicht öffnen', 'Medikamente abzeichnen'), 0);
  assert.ok(api.searchScore('medikation-ansehen', 'Medikation ansehen', 'Medikamente ansehen') > 0);
  assert.ok(api.searchScore('bericht-durchstreichen', 'Bericht korrigieren', 'im Bericht verschrieben') > 0);
  assert.equal(api.searchScore('bericht-neu', 'Bericht anlegen', 'im Bericht verschrieben'), 0);
  assert.ok(api.searchScore('vitalwerte', 'Vitalwerte erfassen', 'Sauerstoffsättigung eingeben') > 0);
  assert.ok(api.searchScore('dateiablage', 'Dateiablage öffnen', 'Arztbrief') > 0);
  assert.ok(api.searchScore('uebergabeformular', 'Übergabe anzeigen', 'Was war los') > 0);
});

test('guided start injects only an explicit approved guide selection into the next request', () => {
  const original = JSON.stringify({
    messages: [{ role: 'user', content: 'Durchführungsnachweis öffnen' }],
    guideSlug: null,
  });
  const rewritten = JSON.parse(api.rewriteGuidedRequestBody(original, 'durchfuehrungsnachweis-finden'));
  assert.equal(rewritten.selectedGuideSlug, 'durchfuehrungsnachweis-finden');
  assert.equal(rewritten.clientLibraryGuideRevision, api.revision);
  assert.deepEqual(rewritten.messages, [{ role: 'user', content: 'Durchführungsnachweis öffnen' }]);
});

test('v53 does not promote fachlich unconfirmed later items into guided starts', () => {
  const serialized = JSON.stringify(api.registry);
  assert.doesNotMatch(serialized, /berichtssuche/i);
  assert.doesNotMatch(serialized, /easy[- ]?plan/i);
  assert.doesNotMatch(serialized, /aufgaben.*aktuelles/i);
});

test('release layer loads the enhancement without adding a second search field', () => {
  assert.match(releasePolish, /guide-library-intelligence-v53\.js/);
  assert.match(releasePolish, /20260823-guide-library-intelligence-v53-1/);
  assert.doesNotMatch(source, /createElement\(['"]input['"]\)/);
  assert.match(source, /\.v42-library-search/);
  assert.match(source, /Schritt für Schritt starten/);
});
