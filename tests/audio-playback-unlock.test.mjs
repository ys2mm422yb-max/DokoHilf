import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/mobile-audio-fix.js', import.meta.url), 'utf8');

test('AudioContext wird für die statische Audiowiedergabe geteilt und entsperrt', () => {
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

test('Audio-Entsperrung verwendet keine Browser- oder Systemstimme', () => {
  assert.doesNotMatch(source, /SpeechSynthesisUtterance/);
  assert.doesNotMatch(source, /speechSynthesis/);
  assert.match(source, /audioPrimed = Boolean\(context\?\.state === 'running'\)/);
  assert.match(source, /DokoHilfAudioUnlock/);
  assert.match(source, /__DOKOHILF_AUDIO_UNLOCK_V3__/);
  assert.match(source, /__DOKOHILF_SYSTEM_VOICE_RETIRED_V67__/);
});
