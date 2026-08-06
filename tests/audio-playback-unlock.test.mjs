import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/mobile-audio-fix.js', import.meta.url), 'utf8');

test('AudioContext wird vor der verzögerten Cloud-Wiedergabe geteilt und entsperrt', () => {
  assert.match(source, /NativeAudioContext/);
  assert.match(source, /sharedAudioContext/);
  assert.match(source, /installSharedAudioContext/);
  assert.match(source, /context\.resume\(\)/);
  assert.match(source, /createBuffer\(1, 1/);
});

test('iPhone und Android entsperren Audio direkt im vertrauenswürdigen Nutzerereignis', () => {
  assert.match(source, /event\.isTrusted/);
  assert.match(source, /pointerdown/);
  assert.match(source, /touchend/);
  assert.match(source, /data-select-mode="voice"/);
  assert.match(source, /#voiceButton/);
});

test('Gerätestimme wird einmalig lautlos vorbereitet und Diagnosezustand bereitgestellt', () => {
  assert.match(source, /SpeechSynthesisUtterance\(' '\)/);
  assert.match(source, /silent\.volume = 0/);
  assert.match(source, /DokoHilfAudioUnlock/);
  assert.match(source, /__DOKOHILF_AUDIO_UNLOCK_V3__/);
});
