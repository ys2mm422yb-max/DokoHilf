import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../assets/voice-diagnostics.js');

const { fallbackReason, calculateKeyboardOffset } = globalThis.DokoHilfVoiceDiagnostics;
const diagnostics = await readFile(new URL('../assets/voice-diagnostics.js', import.meta.url), 'utf8');
const tts = await readFile(new URL('../supabase/functions/dokohilf-tts/index.ts', import.meta.url), 'utf8');
const experience = await readFile(new URL('../assets/experience-v27.js', import.meta.url), 'utf8');

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

test('Cloud-TTS ist ein nicht-generierender Ruhestandsendpunkt', () => {
  assert.match(tts, /cloud_tts_retired_v28/);
  assert.match(tts, /status: 410/);
  assert.match(tts, /retired-cloud-tts-v28/);
  assert.match(tts, /Supertonic-F1/);
  assert.doesNotMatch(tts, /Gacrux|Gemini|generativelanguage|GEMINI_API_KEY|fetch\(/i);
});

test('Client kürzt nur die Sprachausgabe und lädt den nächsten Guide-Schritt vor', () => {
  assert.match(experience, /warmGreeting/);
  assert.match(experience, /optimizeSpokenText/);
  assert.match(experience, /nextSpokenText/);
  assert.match(experience, /prefetchText/);
  assert.match(experience, /const memory = new Map/);
  assert.match(experience, /loadPrebuiltVoice/);
  assert.match(experience, /fastRace\(loadNaturalVoice/);
  assert.doesNotMatch(experience, /localStorage|indexedDB|caches\.open/);
});

test('freigegebene Guide-Audios nutzen ausschließlich den festen privaten Cache-Endpunkt', () => {
  assert.match(diagnostics, /GUIDE_AUDIO_ENDPOINT = 'https:\/\/efifbuqctylsujiauabg\.supabase\.co\/functions\/v1\/dokohilf-guide-audio'/);
  assert.match(diagnostics, /manifest=1&build=20260806-27/);
  assert.match(diagnostics, /dokohilf-approved-guide-audio-20260806-27/);
  assert.match(diagnostics, /fetchGuideManifest/);
  assert.match(diagnostics, /fetchCachedGuideAudio/);
});
