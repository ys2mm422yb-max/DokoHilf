import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('assets/guide-audio-catalog.json', root), 'utf8'));
const experience = await readFile(new URL('assets/experience-v27.js', root), 'utf8');
const diagnostics = await readFile(new URL('assets/voice-diagnostics.js', root), 'utf8');
const tts = await readFile(new URL('supabase/functions/dokohilf-tts/index.ts', root), 'utf8');
const builder = await readFile(new URL('supabase/functions/dokohilf-guide-audio-build/index.ts', root), 'utf8');
const policy = await readFile(new URL('PREBUILT_AUDIO.md', root), 'utf8');
const rules = await readFile(new URL('PROJECT_RULES.md', root), 'utf8');
const acceleratedBuilder = await readFile(new URL('supabase/migrations/20260807093000_accelerate_static_guide_audio_builder.sql', root), 'utf8');
const resumedBuilder = await readFile(new URL('supabase/migrations/20260807095000_resume_static_guide_audio_builder.sql', root), 'utf8');

function normalizeKey(value) {
  return String(value || '')
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[„“”"']/g, '')
    .replace(/[^a-z0-9äöü\s./-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

test('catalog covers greeting and all 92 unique approved guide steps', () => {
  assert.equal(catalog.schemaVersion, 1);
  assert.equal(catalog.voice, 'Gacrux');
  assert.equal(catalog.entries.length, 93);
  assert.equal(new Set(catalog.entries.map(entry => entry.file)).size, 93);
  assert.equal(new Set(catalog.entries.map(entry => normalizeKey(entry.text))).size, 93);
});

test('browser maps the local compatibility request to the fixed private manifest endpoint', () => {
  assert.match(diagnostics, /LOCAL_MANIFEST_MARKER = '\/assets\/guide-audio-manifest\.json'/);
  assert.match(diagnostics, /GUIDE_AUDIO_ENDPOINT = 'https:\/\/efifbuqctylsujiauabg\.supabase\.co\/functions\/v1\/dokohilf-guide-audio'/);
  assert.match(diagnostics, /manifest=1&build=20260806-27/);
  assert.match(diagnostics, /GUIDE_AUDIO_CACHE = 'dokohilf-approved-guide-audio-20260806-27'/);
  assert.match(diagnostics, /fetchGuideManifest/);
  assert.match(diagnostics, /fetchCachedGuideAudio/);
  assert.match(diagnostics, /__DOKOHILF_REMOTE_GUIDE_AUDIO_V27__/);
});

test('browser prefers approved guide audio and only then uses timed live TTS', () => {
  assert.match(experience, /loadPrebuiltManifest/);
  assert.match(experience, /loadPrebuiltVoice/);
  assert.match(experience, /prebuilt-approved-guide/);
  assert.match(experience, /static-approved-guide/);
  assert.match(experience, /__DOKOHILF_PREBUILT_GUIDE_AUDIO_V1__/);
  assert.match(experience, /fastRace\(loadNaturalVoice/);
});

test('TTS source validates raw REST audio and exposes auditable evidence headers', () => {
  assert.match(tts, /VOICE_NAME = 'Gacrux'/);
  assert.match(tts, /INTERACTIONS_AUDIO_PARSER = 'raw-steps-content-v1'/);
  assert.match(tts, /extractInteractionAudio/);
  assert.match(tts, /root\.steps/);
  assert.match(tts, /step\.content/);
  assert.match(tts, /X-DokoHilf-TTS-Parser/);
  assert.match(tts, /Content-Type': 'audio\/wav'/);
});

test('static audio exception is narrow and excludes every user-content source', () => {
  assert.match(policy, /23 freigegebene Guides/);
  assert.match(policy, /92 eindeutige Schritttexte/);
  assert.match(policy, /Nutzerstimmen, Diktate, freie Antworten, Gesprächsverläufe/);
  assert.match(policy, /nicht dauerhaft gespeichert/);
  assert.match(rules, /allgemeine, fachlich freigegebene Guide-Anweisungen/);
  assert.match(rules, /Nutzerantworten, Checks, Diktate, Namen, Fallinhalte, Gesundheitsdaten und Gesprächsdaten/);
});

test('approved Gacrux library is built progressively every minute until complete', () => {
  assert.match(acceleratedBuilder, /cron\.unschedule\('dokohilf-static-guide-audio-v27'\)/);
  assert.match(acceleratedBuilder, /'\* \* \* \* \*'/);
  assert.match(acceleratedBuilder, /dokohilf_build_next_static_guide_audio\(\)/);
  assert.doesNotMatch(acceleratedBuilder, /Nutzerstimme|Diktat|Gespräch|personal|name|diagnos|medikament|vitalwert/i);
  assert.match(resumedBuilder, /cron\.unschedule\(jobid\)/);
  assert.match(resumedBuilder, /'\* \* \* \* \*'/);
  assert.match(resumedBuilder, /count\(\*\).*20260806-27/);
  assert.doesNotMatch(resumedBuilder, /[a-f0-9]{64}/i);
});

test('only the authenticated internal builder may bypass user-content privacy heuristics', () => {
  assert.match(builder, /'x-dokohilf-build-token': control\.data\.build_token/);
  assert.match(tts, /async function isTrustedStaticAudioBuilder/);
  assert.match(tts, /\^\[a-f0-9\]\{64\}\$/i);
  assert.match(tts, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(tts, /dokohilf_internal_build_control/);
  assert.match(tts, /constantTimeEqual\(suppliedToken, row\.build_token\)/);
  assert.match(tts, /!trustedStaticBuilder && isRateLimited\(req\)/);
  assert.match(tts, /!trustedStaticBuilder && containsDirectPersonalData\(text\)/);
  assert.doesNotMatch(builder, /build_token\s*=\s*['"][a-f0-9]{32,}['"]/i);
  assert.doesNotMatch(tts, /build_token\s*=\s*['"][a-f0-9]{32,}['"]/i);
});
