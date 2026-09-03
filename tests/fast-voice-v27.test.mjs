import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const experience = await readFile('assets/experience-v27.js', 'utf8');
const diagnostics = await readFile('assets/voice-diagnostics.js', 'utf8');
const ux = await readFile('assets/ux-v27.js', 'utf8');
const server = await readFile('supabase/functions/dokohilf-tts/index.ts', 'utf8');
const migration = await readFile('supabase/migrations/20260806173000_remove_repeated_exercise_notices.sql', 'utf8');

test('legacy timeout wrapper bleibt unter dem aktuellen statischen Voice-Marker inaktiv', () => {
  assert.match(ux, /HARD_FALLBACK_MS = 180/);
  assert.match(ux, /if \(localVoiceV28\(\)\) return previousFetch\(input, init\)/);
  assert.match(ux, /Promise\.race\(\[request, timeout\]\)/);
  assert.match(ux, /new AbortController\(\)/);
  assert.match(ux, /controller\.abort\(\)/);
  assert.match(experience, /nextSpokenText/);
  assert.match(experience, /prefetch(?:Text)?/);
  assert.doesNotMatch(experience, /localStorage|indexedDB|caches\.open/);
  assert.doesNotMatch(ux, /indexedDB|caches\.open/);
});

test('Browser- und Systemstimmen-Watchdog ist dauerhaft entfernt', () => {
  assert.doesNotMatch(ux, /installSpeechSynthesisWatchdog/);
  assert.doesNotMatch(ux, /speechSynthesis/);
  assert.doesNotMatch(ux, /synth\.resume\(\)/);
  assert.doesNotMatch(ux, /Gerätestimme|Sofortstimme|Gacrux/);
  assert.match(ux, /__DOKOHILF_SYSTEM_VOICE_RETIRED_V67__/);
});

test('persistent browser storage is limited to one privacy acknowledgement boolean', () => {
  assert.match(ux, /PRIVACY_ACK_KEY = 'dokohilf-privacy-ack-v1'/);
  assert.match(ux, /localStorage\.getItem\(PRIVACY_ACK_KEY\)/);
  assert.match(ux, /localStorage\.setItem\(PRIVACY_ACK_KEY, 'yes'\)/);
  const directKeys = [...ux.matchAll(/localStorage\.(?:getItem|setItem)\(([^,)]+)/g)].map(match => match[1].trim());
  assert.deepEqual([...new Set(directKeys)], ['PRIVACY_ACK_KEY']);
});

test('approved guide audio uses the fixed private Supabase manifest and cache', () => {
  assert.match(diagnostics, /dokohilf-guide-audio/);
  assert.match(diagnostics, /manifest=1&build=20260806-27/);
  assert.match(diagnostics, /dokohilf-approved-guide-audio-20260806-27/);
  assert.match(diagnostics, /isLocalManifestRequest/);
  assert.match(diagnostics, /fetchGuideManifest/);
  assert.match(diagnostics, /fetchCachedGuideAudio/);
  assert.match(diagnostics, /__DOKOHILF_REMOTE_GUIDE_AUDIO_V27__/);
  assert.match(experience, /loadPrebuiltVoice/);
  assert.match(experience, /prebuilt-approved-guide/);
});

test('serverseitige Cloud-Stimme ist dauerhaft stillgelegt und erzeugt kein Audio mehr', () => {
  assert.match(server, /cloud_tts_retired_v28/);
  assert.match(server, /status: 410/);
  assert.match(server, /retired-cloud-tts-v28/);
  assert.match(server, /Supertonic-F1/);
  assert.doesNotMatch(server, /Gacrux|Gemini|generativelanguage|GEMINI_API_KEY|fetch\(/i);
});

test('normal guides no longer repeat the training-data sentence', () => {
  assert.match(migration, /Wiederholte Fantasiedaten-Hinweise/);
  assert.match(migration, /regexp_replace/);
  assert.match(ux, /stripReminder/);
});
