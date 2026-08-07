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

test('freigegebenes Audio wird zwingend vor Supertonic geprüft', () => {
  const staticIndex = gate.indexOf('loadApprovedStaticVoice(text)');
  const localIndex = gate.indexOf('localFallback(text)');
  assert(staticIndex >= 0 && localIndex > staticIndex);
  assert.match(gate, /static-approved-guide-v28/);
  assert.match(gate, /prebuilt-approved-guide/);
});

test('lokale iOS-Folgeantwort hat schnellere Inferenz und eine harte Zeitgrenze', () => {
  assert.match(runtime, /const IOS_TOTAL_STEPS = 2;/);
  assert.match(gate, /const IOS_LOCAL_TIMEOUT_MS = 20000;/);
  assert.match(gate, /local_voice_timeout/);
});

test('Systemstimme bleibt gesperrt und freigegebener Cache überlebt normalen PWA-Aktivierer', () => {
  assert.match(gate, /blockSystemSpeech/);
  assert.match(gate, /__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__/);
  assert.match(worker, /APPROVED_AUDIO_CACHE = 'dokohilf-approved-guide-audio-v28-1'/);
  assert.match(worker, /key !== APPROVED_AUDIO_CACHE/);
  assert.match(worker, /20260807-local-natural-voice-v28-2/);
});

test('Hotfix bleibt für iOS und Android mit neutraler öffentlicher Dokumentation abgesichert', () => {
  assert.match(hotfixDoc, /iOS 393×852/);
  assert.match(hotfixDoc, /Android 412×915/);
  assert.match(hotfixDoc, /ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Projektinhalte/);
  assert.doesNotMatch(hotfixDoc, /Nutzerbild|Screenshot.*Chat|Bilder.*Chat|Vivendi-Bilder/i);
  assert.match(hotfixDoc, /9 statische Gacrux-Audios/);
});
