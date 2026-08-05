import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../assets/guide-progress.js');

const { formatProgress } = globalThis.DokoHilfGuideProgress;
const script = await readFile(new URL('../assets/guide-progress.js', import.meta.url), 'utf8');
const edgeFunction = await readFile(new URL('../supabase/functions/dokohilf-guide-state/index.ts', import.meta.url), 'utf8');

test('Schrittanzeige wird verständlich formatiert', () => {
  assert.equal(formatProgress(1, 6), 'Schritt 1 von 6');
  assert.equal(formatProgress(3, 6), 'Schritt 3 von 6');
  assert.equal(formatProgress(0, 0), 'Schritt 1 von 1');
});

test('Guide-Leiste besitzt alle erforderlichen Bedienaktionen', () => {
  assert.match(script, /Schritt zurück/);
  assert.match(script, /Ablauf neu starten/);
  assert.match(script, /Anderen Ablauf wählen/);
  assert.match(script, /currentGuide/);
  assert.match(script, /commandRow/);
});

test('Fortschritts-Endpunkt gibt nur Metadaten und keine Klickschritte zurück', () => {
  assert.match(edgeFunction, /guideStepCount/);
  assert.match(edgeFunction, /guideStep/);
  assert.match(edgeFunction, /guideTitle/);
  assert.doesNotMatch(edgeFunction, /steps:\s*guide\.steps/);
});
