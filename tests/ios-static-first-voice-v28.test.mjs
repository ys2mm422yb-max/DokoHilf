import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [runtime, gate, worker, hotfixDoc] = await Promise.all([
  readFile(new URL('../assets/local-voice-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/local-voice-gate-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../ACTIVE_WORK_IOS_VOICE_HOTFIX_V28.md', import.meta.url), 'utf8'),
]);

test('mobiler Voice-Einstieg startet keine lokale Sprachinferenz', () => {
  assert.match(runtime, /__DOKOHILF_LOCAL_VOICE_RETIRED_V29__/);
  assert.match(runtime, /__DOKOHILF_STATIC_SUPERTONIC_ONLY_V29__/);
  assert.match(runtime, /on_device_voice_retired_static_supertonic_only/);
  assert.match(runtime, /armAndPrepare: retired/);
  assert.match(runtime, /synthesize: retired/);
  assert.doesNotMatch(runtime, /loadTextToSpeech|loadVoiceStyle|navigator\.gpu|onnxruntime|Supertone\/supertonic-3\/resolve\/main/);
});

test('statisches Supertonic-F1 ist der einzige Sprachpfad', () => {
  assert.match(gate, /loadStaticSupertonicVoice\(text\)/);
  assert.match(gate, /STATIC_VOICE = 'Supertonic-F1'/);
  assert.match(gate, /static-supertonic-only-v29/);
  assert.match(gate, /STATIC_FALLBACK_TEXT = 'Ich habe die Antwort im Chat angezeigt\.'/);
  assert.doesNotMatch(gate, /localFallback|DokoHilfLocalVoiceV28\.synthesize|IOS_LOCAL_TIMEOUT_MS|OTHER_LOCAL_TIMEOUT_MS|local_voice_timeout/);
});

test('auf iOS und Android gibt es keine lokale Inferenz oder Inferenz-Timeouts mehr', () => {
  assert.doesNotMatch(runtime, /IOS_TOTAL_STEPS|TOTAL_STEPS|synthesize\(/);
  assert.doesNotMatch(gate, /IOS_LOCAL_TIMEOUT_MS|OTHER_LOCAL_TIMEOUT_MS|local_voice_timeout/);
  assert.match(gate, /MANIFEST_TIMEOUT_MS = 3500/);
  assert.match(gate, /AUDIO_TIMEOUT_MS = 8000/);
});

test('Systemstimme bleibt gesperrt und statische Sprachdateien werden mit aktuellem Cache frisch gehalten', () => {
  assert.match(gate, /blockSystemSpeech/);
  assert.match(gate, /__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__/);
  assert.match(worker, /STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v29-2'/);
  assert.match(worker, /key !== STATIC_AUDIO_CACHE/);
  assert.match(worker, /dokohilf-local-voice-model-v28-1/);
  assert.match(worker, /dokohilf-static-supertonic-audio-v29-1/);
  assert.match(worker, /await caches\.delete\(STATIC_AUDIO_CACHE\)/);
  assert.match(worker, /HOTFIX_REVISION = '20260809-static-supertonic-orientation-ui-v29-2'/);
});

test('Hotfix bleibt für iOS und Android mit neutraler öffentlicher Dokumentation abgesichert', () => {
  assert.match(hotfixDoc, /iOS 393×852/);
  assert.match(hotfixDoc, /Android 412×915/);
  assert.match(hotfixDoc, /ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Projektinhalte/);
  assert.doesNotMatch(hotfixDoc, /Nutzerbild|Screenshot.*Chat|Bilder.*Chat|Vivendi-Bilder/i);
  assert.match(hotfixDoc, /Status:\*\* abgeschlossen, gemergt und veröffentlicht/);
});
