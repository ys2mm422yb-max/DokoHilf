import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('assets/guide-audio-catalog.json', root), 'utf8'));
const extraCatalog = JSON.parse(await readFile(new URL('assets/voice-extra-catalog-v28.json', root), 'utf8'));
const experience = await readFile(new URL('assets/experience-v27.js', root), 'utf8');
const diagnostics = await readFile(new URL('assets/voice-diagnostics.js', root), 'utf8');
const tts = await readFile(new URL('supabase/functions/dokohilf-tts/index.ts', root), 'utf8');
const builder = await readFile(new URL('supabase/functions/dokohilf-guide-audio-build/index.ts', root), 'utf8');
const policy = await readFile(new URL('PREBUILT_AUDIO.md', root), 'utf8');
const rules = await readFile(new URL('PROJECT_RULES.md', root), 'utf8');
const config = await readFile(new URL('supabase/config.toml', root), 'utf8');
const retirement = await readFile(new URL('supabase/migrations/20260807214545_retire_legacy_cloud_voice.sql', root), 'utf8');

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

test('source catalogs cover exactly 93 guide sentences and 18 fixed dialog sentences', () => {
  assert.equal(catalog.schemaVersion, 1);
  assert.equal(catalog.entries.length, 93);
  assert.equal(extraCatalog.entries.length, 18);
  assert.equal(new Set(catalog.entries.map(entry => entry.file)).size, 93);
  assert.equal(new Set(catalog.entries.map(entry => normalizeKey(entry.text))).size, 93);
  const allTexts = [...catalog.entries, ...extraCatalog.entries].map(entry => normalizeKey(entry.text));
  assert.equal(new Set(allTexts).size, 111);
});

test('legacy compatibility browser code still points only at the fixed private audio endpoint', () => {
  assert.match(diagnostics, /LOCAL_MANIFEST_MARKER = '\/assets\/guide-audio-manifest\.json'/);
  assert.match(diagnostics, /GUIDE_AUDIO_ENDPOINT = 'https:\/\/efifbuqctylsujiauabg\.supabase\.co\/functions\/v1\/dokohilf-guide-audio'/);
  assert.match(diagnostics, /manifest=1&build=20260806-27/);
  assert.match(diagnostics, /GUIDE_AUDIO_CACHE = 'dokohilf-approved-guide-audio-20260806-27'/);
  assert.match(diagnostics, /fetchGuideManifest/);
  assert.match(diagnostics, /fetchCachedGuideAudio/);
  assert.match(diagnostics, /__DOKOHILF_REMOTE_GUIDE_AUDIO_V27__/);
});

test('legacy experience layer retains its old approved-audio compatibility path', () => {
  assert.match(experience, /loadPrebuiltManifest/);
  assert.match(experience, /loadPrebuiltVoice/);
  assert.match(experience, /prebuilt-approved-guide/);
  assert.match(experience, /static-approved-guide/);
  assert.match(experience, /__DOKOHILF_PREBUILT_GUIDE_AUDIO_V1__/);
  assert.match(experience, /fastRace\(loadNaturalVoice/);
});

test('alte serverseitige TTS- und Builder-Endpunkte sind nicht-generierende Ruhestandsendpunkte', () => {
  assert.match(tts, /cloud_tts_retired_v28/);
  assert.match(tts, /status: 410/);
  assert.match(builder, /legacy_cloud_audio_builder_retired_v28/);
  assert.match(builder, /status: 410/);
  assert.doesNotMatch(tts, /Gacrux|Gemini|generativelanguage|GEMINI_API_KEY|fetch\(/i);
  assert.doesNotMatch(builder, /x-dokohilf-build-token|dokohilf-tts|fetch\(/i);
});

test('static audio exception is narrow and excludes every user-content source', () => {
  assert.match(policy, /23 freigegebene Guides/);
  assert.match(policy, /92 eindeutige Schritttexte/);
  assert.match(policy, /93 bestätigte Guide-Sätze/);
  assert.match(policy, /18 feste Dialogsätze/);
  assert.match(policy, /111 statische WAV-Dateien/);
  assert.match(policy, /Nutzerstimmen, Diktate, freie Antworten, Gesprächsverläufe/);
  assert.match(policy, /nicht dauerhaft gespeichert/);
  assert.match(rules, /Allgemeine, fachlich freigegebene Guide-Anweisungen dürfen als statische Audiodateien/);
  assert.match(rules, /Nutzerantworten, Diktate, Namen, Fallinhalte, Gesundheitsdaten und Gesprächsdaten sind als statische Audioquelle ausgeschlossen/);
  assert.match(rules, /keine Benutzerkonten, keine Bewohner-\/Mitarbeiterprofile, keine Fallakten und keine personenbezogenen Eingabemasken/);
});

test('legacy cloud builder is disabled, JWT-geschützt and its cron is removed', () => {
  assert.match(config, /\[functions\.dokohilf-tts\][\s\S]*verify_jwt = true/);
  assert.match(config, /\[functions\.dokohilf-guide-audio-build\][\s\S]*verify_jwt = true/);
  assert.match(retirement, /enabled = false/);
  assert.match(retirement, /cron\.unschedule\(jobid\)/);
  assert.match(retirement, /dokohilf-static-guide-audio-v27/);
});

test('retired cloud functions contain no provider, token or personal-data processing path', () => {
  for (const source of [tts, builder]) {
    assert.doesNotMatch(source, /GEMINI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|build_token|fetch\(/i);
    assert.doesNotMatch(source, /name|diagnos|medikament|vitalwert/i);
  }
});
