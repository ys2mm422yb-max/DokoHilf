import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [runtime, gate, worker, hotfixDoc] = await Promise.all([
  readFile(new URL('../assets/local-voice-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/local-voice-gate-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../ACTIVE_WORK_IOS_VOICE_HOTFIX_V28.md', import.meta.url), 'utf8'),
]);

test('iPhone Voice-Einstieg armt nur und startet das große Modell nicht', () => {
  assert.match(runtime, /function arm\(\)/);
  assert.match(runtime, /if \(voiceEntry\) arm\(\);/);
  assert.doesNotMatch(runtime, /if \(voiceEntry\) armAndPrepare\(\)/);
});

test('statisches Supertonic-Audio wird zwingend vor lokaler Supertonic-Inferenz geprüft', () => {
  const staticIndex = gate.indexOf('loadStaticSupertonicVoice(text)');
  const localIndex = gate.indexOf('localFallback(text)');
  assert(staticIndex >= 0 && localIndex > staticIndex);
  assert.match(gate, /static-supertonic-guide-v29/);
  assert.match(gate, /STATIC_VOICE = 'Supertonic-F1'/);
});

test('lokale iOS-Folgeantwort hat schnellere Inferenz und eine harte Zeitgrenze', () => {
  assert.match(runtime, /const IOS_TOTAL_STEPS = 2;/);
  assert.match(gate, /const IOS_LOCAL_TIMEOUT_MS = 8000;/);
  assert.match(gate, /local_voice_timeout/);
});

test('Systemstimme bleibt gesperrt und geänderte statische Sprachsätze werden einmalig frisch geladen', () => {
  assert.match(gate, /blockSystemSpeech/);
  assert.match(gate, /__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__/);
  assert.match(worker, /STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v29-1'/);
  assert.match(worker, /key !== STATIC_AUDIO_CACHE/);
  assert.match(worker, /await caches\.delete\(STATIC_AUDIO_CACHE\)/);
  assert.match(worker, /mobile-polish-7/);
  assert.match(worker, /20260808-smart-help-voice-ui-v29-1/);
});

test('Hotfix bleibt für iOS und Android mit neutraler öffentlicher Dokumentation abgesichert', () => {
  assert.match(hotfixDoc, /iOS 393×852/);
  assert.match(hotfixDoc, /Android 412×915/);
  assert.match(hotfixDoc, /ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Projektinhalte/);
  assert.doesNotMatch(hotfixDoc, /Nutzerbild|Screenshot.*Chat|Bilder.*Chat|Vivendi-Bilder/i);
  assert.match(hotfixDoc, /Status:\*\* abgeschlossen, gemergt und veröffentlicht/);
});
