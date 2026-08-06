import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('assets/guide-audio-catalog.json', root), 'utf8'));
const experience = await readFile(new URL('assets/experience-v27.js', root), 'utf8');
const diagnostics = await readFile(new URL('assets/voice-diagnostics.js', root), 'utf8');
const tts = await readFile(new URL('supabase/functions/dokohilf-tts/index.ts', root), 'utf8');
const policy = await readFile(new URL('PREBUILT_AUDIO.md', root), 'utf8');
const rules = await readFile(new URL('PROJECT_RULES.md', root), 'utf8');

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
