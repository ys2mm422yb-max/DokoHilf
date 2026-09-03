import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');

test('v67 entfernt jeden Browser-/Systemstimmen-Fallback aus der App', () => {
  assert.doesNotMatch(app, /SpeechSynthesisUtterance/);
  assert.doesNotMatch(app, /speechSynthesis/);
  assert.doesNotMatch(app, /preferredSystemVoice|chooseBestSystemVoice|refreshSystemVoice|speakWithSystemVoice/);
});

test('bei fehlender statischer F1-Ausgabe bleibt die Antwort sichtbar und die App fällt nicht auf eine andere Stimme zurück', () => {
  assert.match(app, /function failStaticSpeech\(requestId\)/);
  assert.match(app, /failStaticSpeech\(requestId\)/);
  assert.match(app, /Sprachausgabe nicht verfügbar/);
  assert.match(app, /Die Antwort bleibt im Chat sichtbar/);
});
