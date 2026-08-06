import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../assets/voice-diagnostics.js');

const { fallbackReason, calculateKeyboardOffset } = globalThis.DokoHilfVoiceDiagnostics;
const diagnostics = await readFile(new URL('../assets/voice-diagnostics.js', import.meta.url), 'utf8');
const tts = await readFile(new URL('../supabase/functions/dokohilf-tts/index.ts', import.meta.url), 'utf8');
const experience = await readFile(new URL('../assets/experience-v25.js', import.meta.url), 'utf8');

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

test('Cloud-TTS behält Gacrux über den bewährten Pro-Pfad mit Flash-Fallback', () => {
  assert.match(tts, /PRIMARY_MODEL = 'gemini-2.5-pro-preview-tts'/);
  assert.match(tts, /FALLBACK_MODEL = 'gemini-2.5-flash-preview-tts'/);
  assert.match(tts, /VOICE_NAME = 'Gacrux'/);
  assert.match(tts, /VOICE_STYLE = 'natural-spoken-german-colleague-v5'/);
  assert.match(tts, /REQUEST_TIMEOUT_MS = 20_000/);
  assert.match(tts, /X-DokoHilf-TTS-Latency/);
  assert.match(tts, /erfahrene Kollegin/);
  assert.match(tts, /Nicht vorlesen und nicht moderieren/);
});

test('Client bereitet die Begrüßung vor und kürzt nur den gesprochenen Prüfteil', () => {
  assert.match(experience, /warmGreeting/);
  assert.match(experience, /optimizeSpokenText/);
  assert.match(experience, /Sag kurz Bescheid, wenn du soweit bist/);
  assert.match(experience, /const memory = new Map/);
  assert.doesNotMatch(experience, /localStorage|indexedDB/);
});
