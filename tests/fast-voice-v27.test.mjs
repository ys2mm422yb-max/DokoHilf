import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const experience = await readFile('assets/experience-v27.js', 'utf8');
const ux = await readFile('assets/ux-v27.js', 'utf8');
const server = await readFile('supabase/functions/dokohilf-tts/index.ts', 'utf8');
const migration = await readFile('supabase/migrations/20260806173000_remove_repeated_exercise_notices.sql', 'utf8');

test('client starts the immediate fallback instead of waiting indefinitely', () => {
  assert.match(ux, /HARD_FALLBACK_MS = 1900/);
  assert.match(ux, /Promise\.race\(\[request, timeout\]\)/);
  assert.match(experience, /nextSpokenText/);
  assert.match(experience, /prefetch(?:Text)?/);
  assert.doesNotMatch(ux, /localStorage|indexedDB|caches\.open/);
});

test('server uses the current low-latency TTS model and keeps Gacrux', () => {
  assert.match(server, /PRIMARY_MODEL = 'gemini-3\.1-flash-tts-preview'/);
  assert.match(server, /FALLBACK_MODEL = 'gemini-2\.5-flash-preview-tts'/);
  assert.match(server, /VOICE_NAME = 'Gacrux'/);
  assert.match(server, /pendingAudio/);
  assert.match(server, /CACHE_TTL_MS = 2 \* 60 \* 60_000/);
  assert.match(server, /TRANSKRIPT:/);
});

test('normal guides no longer repeat the training-data sentence', () => {
  assert.match(migration, /Wiederholte Fantasiedaten-Hinweise/);
  assert.match(migration, /regexp_replace/);
  assert.match(ux, /stripReminder/);
});
