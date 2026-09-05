import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [source, release, worker, versionRaw] = await Promise.all([
  read('assets/context-help-availability-v71.js'),
  read('assets/release-polish-v29.js'),
  read('service-worker.js'),
  read('version.json'),
]);

function runtime(initialGuide) {
  let guide = initialGuide;
  const listeners = new Map();
  const attrs = new Map();
  const button = {
    dataset: {},
    disabled: false,
    title: '',
    setAttribute(name, value) { attrs.set(name, String(value)); },
    getAttribute(name) { return attrs.get(name) || null; },
  };
  const styles = [];
  const document = {
    readyState: 'complete',
    head: { append(node) { styles.push(node); } },
    createElement(tag) { return { tagName: tag.toUpperCase(), id: '', textContent: '' }; },
    getElementById(id) { return styles.find(node => node.id === id) || null; },
    querySelector(selector) {
      return selector === '#commandRow [data-command="ich finde das nicht"]' ? button : null;
    },
    addEventListener() {},
  };
  const window = {
    DokoHilfGuideProgress: { getCurrentGuide: () => guide ? { ...guide } : null },
    addEventListener(type, fn) { listeners.set(type, fn); },
  };
  const context = vm.createContext({ window, document, console, Object, Number, String, Boolean });
  vm.runInContext(source, context, { filename: 'context-help-availability-v71.js' });
  return {
    api: window.DokoHilfContextHelpAvailabilityV71,
    button,
    styles,
    setGuide(next) { guide = next; },
    dispatch(type) { listeners.get(type)?.(); },
  };
}

test('„Berichte finden“ Schritt 1 hat bestätigte Zusatzhilfe und lässt „Ich finde es nicht“ aktiv', () => {
  const run = runtime({ guideSlug: 'berichte-finden', guideStep: 1, guideStepCount: 1 });
  assert.equal(run.api.hasConfirmedHelp(), true);
  assert.equal(run.button.disabled, false);
  assert.equal(run.button.dataset.v71ContextHelp, 'true');
  assert.equal(run.button.getAttribute('aria-disabled'), 'false');
  assert.match(run.button.getAttribute('aria-label'), /Ich finde es nicht/);
  assert.match(source, /content:'Ich finde es nicht'/);
});

test('Button ist auf einem Schritt ohne bestätigte stuck-Hilfe nicht drückbar', () => {
  const run = runtime({ guideSlug: 'bericht-neu', guideStep: 3, guideStepCount: 8 });
  assert.equal(run.api.hasConfirmedHelp(), false);
  assert.equal(run.button.disabled, true);
  assert.equal(run.button.getAttribute('aria-disabled'), 'true');
  assert.match(run.button.title, /keine zusätzliche bestätigte Erklärung verfügbar/);
});

test('Verfügbarkeit folgt exakt dem aktuellen Guide-Schritt statt pauschal dem Guide', () => {
  const run = runtime({ guideSlug: 'bericht-neu', guideStep: 3, guideStepCount: 8 });
  assert.equal(run.button.disabled, true);

  run.setGuide({ guideSlug: 'bericht-neu', guideStep: 4, guideStepCount: 8 });
  run.dispatch('dokohilf:guide-state');
  assert.equal(run.api.hasConfirmedHelp(), true);
  assert.equal(run.button.disabled, false);

  run.setGuide({ guideSlug: 'vitalwerte-einzelwert-fortsetzen', guideStep: 1, guideStepCount: 4 });
  run.dispatch('dokohilf:guide-state');
  assert.equal(run.api.hasConfirmedHelp(), false);
  assert.equal(run.button.disabled, true);
});

test('v71 verändert weder Schritt-zurück noch fachliche Hilfeinhalte oder Sprachausgabe', () => {
  assert.doesNotMatch(source, /data-v54-step-help|Schritt zurück/);
  assert.doesNotMatch(source, /speechSynthesis|SpeechSynthesisUtterance|cloud.*tts|elevenlabs/i);
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|document\.cookie/i);
  assert.doesNotMatch(source, /feste grüne|weißen Funktionsband|Bewohner öffnen|klicke|wähle dort/i, 'v71 darf keine fachlichen Ersatzschritte enthalten');
});

test('v71 ist im aktuellen Build nach v70 geladen und offline gecacht', () => {
  const version = JSON.parse(versionRaw);
  assert.equal(version.appVersion, 'v36');
  assert.equal(version.buildId, '20260905-45');
  assert.equal(version.release, 'context-help-availability-v71');
  assert.match(release, /CONTEXT_HELP_AVAILABILITY_REVISION = '20260905-context-help-availability-v71-1'/);
  const loader = release.match(/async function loadV54Features\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
  assert.ok(loader.indexOf('assets/context-help-availability-v71.js') > loader.indexOf('assets/chat-guide-ux-v70.js'));
  assert.match(worker, /BUILD_ID = '20260905-45'/);
  assert.match(worker, /context-help-availability-v71\.js\?v=20260905-context-help-availability-v71-1/);
  assert.match(worker, /context-help-availability-v71/);
});
