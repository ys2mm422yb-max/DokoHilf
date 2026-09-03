import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [app, mobileAudio, ux] = await Promise.all([
  readFile(new URL('../assets/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/mobile-audio-fix.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/ux-v27.js', import.meta.url), 'utf8'),
]);

const activeVoiceSources = [app, mobileAudio, ux].join('\n');

test('v67 entfernt Browser- und Systemstimmen aus den aktiven Voice-Hilfsdateien', () => {
  assert.doesNotMatch(activeVoiceSources, /SpeechSynthesisUtterance/);
  assert.doesNotMatch(activeVoiceSources, /speechSynthesis/);
  assert.doesNotMatch(activeVoiceSources, /preferredSystemVoice|chooseBestSystemVoice|refreshSystemVoice|speakWithSystemVoice/);
  assert.doesNotMatch(activeVoiceSources, /Gerätestimme|Sofortstimme/);
});

test('bei fehlender statischer F1-Ausgabe bleibt die Antwort sichtbar und die App fällt nicht auf eine andere Stimme zurück', () => {
  assert.match(app, /function failStaticSpeech\(requestId\)/);
  assert.match(app, /failStaticSpeech\(requestId\)/);
  assert.match(app, /Sprachausgabe nicht verfügbar/);
  assert.match(app, /Die Antwort bleibt im Chat sichtbar/);
  assert.match(mobileAudio, /__DOKOHILF_SYSTEM_VOICE_RETIRED_V67__/);
  assert.match(ux, /__DOKOHILF_SYSTEM_VOICE_RETIRED_V67__/);
});
