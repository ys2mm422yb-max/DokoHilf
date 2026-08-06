import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../assets/voice-diagnostics.js');

const { fallbackReason, calculateKeyboardOffset } = globalThis.DokoHilfVoiceDiagnostics;
const diagnostics = await readFile(new URL('../assets/voice-diagnostics.js', import.meta.url), 'utf8');
const tts = await readFile(new URL('../supabase/functions/dokohilf-tts/index.ts', import.meta.url), 'utf8');

test('Fallback-Gründe werden verständlich und ohne Gesprächsinhalte abgebildet', () => {
  assert.equal(fallbackReason(new Error('tts_timeout')), 'Zeitüberschreitung der natürlichen Stimme');
  assert.equal(fallbackReason(new Error('tts_unavailable')), 'Natürliche Stimme ist gerade nicht erreichbar');
  assert.equal(fallbackReason(new Error('decode failed')), 'Audiodatei konnte nicht abgespielt werden');
});

test('Tastaturversatz hält die Sprachleiste im sichtbaren Bereich', () => {
  assert.equal(calculateKeyboardOffset(500, 0, 800), 300);
  assert.equal(calculateKeyboardOffset(800, 0, 800), 0);
  assert.equal(calculateKeyboardOffset(600, 40, 800), 160);
});

test('aktive natürliche Stimme und Gerätestimmen-Fallback sind sichtbar', () => {
  assert.match(diagnostics, /Natürliche Stimme/);
  assert.match(diagnostics, /Gerätestimme als Ersatz/);
  assert.match(diagnostics, /X-DokoHilf-Voice/);
  assert.match(diagnostics, /dataset\.voiceEngine/);
  assert.match(diagnostics, /dataset\.fallbackReason/);
});

test('mobile Lebenszyklen und Safe-Area werden überwacht', () => {
  assert.match(diagnostics, /visualViewport/);
  assert.match(diagnostics, /orientationchange/);
  assert.match(diagnostics, /visibilitychange/);
  assert.match(diagnostics, /safe-area-inset-bottom/);
  assert.match(diagnostics, /--dokohilf-keyboard-offset/);
});

test('Diagnose speichert keine Gesprächsinhalte dauerhaft', () => {
  assert.doesNotMatch(diagnostics, /localStorage/);
  assert.doesNotMatch(diagnostics, /indexedDB/);
  assert.doesNotMatch(diagnostics, /console\.(log|info|warn|error)/);
});

test('Cloud-TTS nutzt Gacrux über den schnellen Flash-Pfad mit Pro-Fallback', () => {
  assert.match(tts, /PRIMARY_MODEL = 'gemini-2.5-flash-preview-tts'/);
  assert.match(tts, /FALLBACK_MODEL = 'gemini-2.5-pro-preview-tts'/);
  assert.match(tts, /VOICE_NAME = 'Gacrux'/);
  assert.match(tts, /VOICE_STYLE = 'natural-spoken-german-colleague-v6-fast'/);
  assert.match(tts, /PRIMARY_TIMEOUT_MS = 8_000/);
  assert.match(tts, /FALLBACK_TIMEOUT_MS = 14_000/);
  assert.match(tts, /X-DokoHilf-TTS-Latency/);
  assert.match(tts, /X-DokoHilf-TTS-Cache/);
  assert.match(tts, /audioCache/);
  assert.match(tts, /erfahrene Kollegin/);
  assert.match(tts, /Kein(?:e)? Moderation/);
});
