import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/mobile-polish-v29.js', import.meta.url), 'utf8');
const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function createRuntime(initialGuide = null) {
  let guide = initialGuide;
  const document = {
    documentElement: {},
    head: { appendChild() {} },
    getElementById() { return null; },
    createElement() { return {}; },
  };
  const window = {
    DokoHilfGuideProgress: {
      getCurrentGuide: () => guide ? { ...guide } : null,
    },
    addEventListener() {},
    setTimeout,
    matchMedia() { return { matches: false }; },
  };
  const context = vm.createContext({
    window,
    document,
    MutationObserver: class { observe() {} },
    requestAnimationFrame(callback) { if (typeof callback === 'function') callback(); },
    console,
    setTimeout,
  });
  vm.runInContext(source, context, { filename: 'mobile-polish-v29.js' });
  return {
    api: window.DokoHilfMobilePolishV29,
    setGuide(next) { guide = next; },
  };
}

function fakeButton() {
  return {
    textContent: 'Hilfe zum Schritt',
    disabled: false,
    dataset: {},
    title: '',
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
  };
}

test('Berichte finden Schritt 1 bietet die bestätigte alternative Erklärung an', () => {
  const runtime = createRuntime({ guideSlug: 'berichte-finden', guideStep: 1, guideStepCount: 1 });
  assert.equal(runtime.api.hasAlternativeStepHelp(), true);
});

test('Visite aktiviert Hilfe nur an Schritten mit eigenem bestätigten stuck-Text', () => {
  const runtime = createRuntime({ guideSlug: 'visite-anlegen', guideStep: 1, guideStepCount: 11 });
  assert.equal(runtime.api.hasAlternativeStepHelp(), true);
  runtime.setGuide({ guideSlug: 'visite-anlegen', guideStep: 2, guideStepCount: 11 });
  assert.equal(runtime.api.hasAlternativeStepHelp(), false);
  runtime.setGuide({ guideSlug: 'visite-anlegen', guideStep: 3, guideStepCount: 11 });
  assert.equal(runtime.api.hasAlternativeStepHelp(), true);
  runtime.setGuide({ guideSlug: 'visite-anlegen', guideStep: 6, guideStepCount: 11 });
  assert.equal(runtime.api.hasAlternativeStepHelp(), true);
});

test('Ablauf ohne zusätzliche Schritt-Erklärung deaktiviert den Hilfe-Knopf', () => {
  const runtime = createRuntime({ guideSlug: 'vitalwerte-einzelwert-fortsetzen', guideStep: 1, guideStepCount: 4 });
  assert.equal(runtime.api.hasAlternativeStepHelp(), false);
});

test('Knopf heißt Ich finde es nicht und ist nur mit anderer bestätigter Erklärung aktiv', () => {
  const runtime = createRuntime({ guideSlug: 'berichte-finden', guideStep: 1, guideStepCount: 1 });
  const help = fakeButton();
  const row = { querySelector: selector => selector.includes('ich finde das nicht') ? help : null };

  runtime.api.syncStepHelpButton(row);
  assert.equal(help.textContent, 'Ich finde es nicht');
  assert.equal(help.disabled, false);
  assert.equal(help.dataset.stepHelpAvailable, 'true');
  assert.match(help.attributes['aria-label'], /Andere bestätigte Erklärung/);

  runtime.setGuide({ guideSlug: 'visite-anlegen', guideStep: 2, guideStepCount: 11 });
  runtime.api.syncStepHelpButton(row);
  assert.equal(help.textContent, 'Ich finde es nicht');
  assert.equal(help.disabled, true);
  assert.equal(help.dataset.stepHelpAvailable, 'false');
  assert.match(help.attributes['aria-label'], /keine zusätzliche bestätigte Erklärung/);
});

test('bestehender sichere Hilfe-Befehl bleibt unverändert verdrahtet', () => {
  assert.match(indexSource, /data-command="ich finde das nicht"/);
  assert.doesNotMatch(source, /help\.textContent\s*!==\s*'Hilfe zum Schritt'/);
  assert.match(source, /STEP_HELP_AVAILABILITY_REVISION = '20260905-contextual-step-help-button-v71-1'/);
  assert.equal(createRuntime().api.stepHelpGuideCount, 41);
});

test('UI-Hotfix führt keine neue Speicherung oder TTS-Ausgabe ein', () => {
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|document\.cookie/i);
  assert.doesNotMatch(source, /speechSynthesis|SpeechSynthesisUtterance|cloud.*tts|elevenlabs/i);
});
