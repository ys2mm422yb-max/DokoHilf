import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [source, release, sw, version] = await Promise.all([
  read('assets/guide-discovery-v53.js'),
  read('assets/release-polish-v29.js'),
  read('service-worker.js'),
  read('version.json').then(JSON.parse),
]);

function loadApi() {
  const window = {};
  const document = {
    readyState: 'loading',
    addEventListener() {},
  };
  vm.runInNewContext(source, {
    window,
    document,
    console,
    URL,
    Request: class Request {},
    MutationObserver: class MutationObserver {},
    requestAnimationFrame() {},
    setTimeout,
    clearTimeout,
  });
  return window.DokoHilfGuideDiscoveryV53;
}

const api = loadApi();

test('v32 guide discovery remains wired after later public version bumps', () => {
  const publicVersion = Number(String(version.appVersion || '').replace(/^v/, ''));
  assert.ok(Number.isInteger(publicVersion) && publicVersion >= 32, `unexpected public version: ${version.appVersion}`);
  assert.match(release, /20260823-guide-discovery-v53-1/);
  assert.match(release, /guide-discovery-v53\.js/);
  assert.match(sw, /GUIDE_DISCOVERY_REVISION = '20260823-guide-discovery-v53-1'/);
  assert.match(sw, /guide-discovery-v53\.js\?v=20260823-guide-discovery-v53-1/);
  assert.match(sw, /HOTFIX_REVISION = '20260809-static-supertonic-orientation-ui-v29-3'/);
});

test('confirmed sign-off intent wins over medication wording in library search', () => {
  assert.deepEqual([...api.smartTargets('Ich muss Medikamente abzeichnen')], ['durchfuehrungsnachweis-oeffnen']);
  assert.deepEqual([...api.smartTargets('Wo kann ich das abzeichnen?')], ['durchfuehrungsnachweis-oeffnen']);
  assert.deepEqual([...api.smartTargets('Das muss noch abgezeichnet werden')], ['durchfuehrungsnachweis-oeffnen']);
});

test('false sign-off remains on the existing storno workflow', () => {
  assert.deepEqual([...api.smartTargets('Ich habe etwas falsch abgezeichnet')], ['durchfuehrung-storno']);
  assert.deepEqual([...api.smartTargets('Versehentlich abgezeichnet')], ['durchfuehrung-storno']);
});

test('smart search adds only already confirmed workflow synonyms', () => {
  assert.deepEqual([...api.smartTargets('Ich habe mich in einem Bericht verschrieben')], ['bericht-durchstreichen']);
  assert.deepEqual([...api.smartTargets('Wo ist der Arztbrief?')], ['dateiablage']);
  assert.deepEqual([...api.smartTargets('Sauerstoff messen')], ['vitalwerte']);
  assert.deepEqual([...api.smartTargets('Notfallbogen')], ['notfallblatt']);
  assert.deepEqual([...api.smartTargets('Was war los?')], ['uebergabeformular']);
  assert.deepEqual([...api.smartTargets('Medikamente abhaken')], [], 'Unbestätigte Gleichsetzung von „abhaken“ mit „abzeichnen“ bleibt gesperrt.');
});

test('smart filter can target injected library cards without changing guide content', () => {
  const dnf = { dataset: { v29OpenGuide: 'durchfuehrungsnachweis-oeffnen' }, textContent: 'Durchführungsnachweis Nachweis öffnen' };
  const meds = { dataset: { v29OpenGuide: 'medikation-ansehen' }, textContent: 'Medikation ansehen Medikamentenübersicht öffnen' };
  assert.equal(api.cardMatches(dnf, 'Medikamente abzeichnen'), true);
  assert.equal(api.cardMatches(meds, 'Medikamente abzeichnen'), false);
  assert.equal(api.cardMatches(meds, 'Medikation ansehen'), true);
});

test('library guided start selects the exact existing approved guide slug', () => {
  const body = api.injectSelectedGuide(JSON.stringify({ messages: [{ role: 'user', content: 'Medikation ansehen' }] }), 'medikation-ansehen');
  assert.deepEqual(JSON.parse(body), {
    messages: [{ role: 'user', content: 'Medikation ansehen' }],
    selectedGuideSlug: 'medikation-ansehen',
    libraryGuidedStart: true,
  });
  const guided = new Set(api.guidedSlugs());
  for (const slug of [
    'bericht-neu',
    'bericht-durchstreichen',
    'vitalwerte-einzelwert',
    'vitalwerte-sammelerfassung',
    'medikation-ansehen',
    'durchfuehrungsnachweis-oeffnen',
    'bedarfsmedikation-gabe',
    'massnahmen-ohne-zeitangabe',
    'dateiablage',
  ]) assert.equal(guided.has(slug), true, `Guided-Start fehlt für ${slug}`);
  assert.match(source, /Schritt für Schritt starten/);
  assert.match(source, /selectedGuideSlug/);
  assert.match(source, /setMode\('chat', \{ greet: false \}\)/);
});

test('guide discovery adds no persistence, accounts or new fachliche content source', () => {
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(source, /signIn|signUp|auth\.|password|email/i);
  assert.doesNotMatch(source, /supabase\.co\/rest|dokohilf_guides|insert\(|update\(/i);
});
