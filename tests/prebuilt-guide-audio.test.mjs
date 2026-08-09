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
const legacyAudio = await readFile(new URL('supabase/functions/dokohilf-guide-audio/index.ts', root), 'utf8');
const policy = await readFile(new URL('PREBUILT_AUDIO.md', root), 'utf8');
const audioStatus = await readFile(new URL('AUDIO_GENERATION_STATUS.md', root), 'utf8');
const providerStatus = await readFile(new URL('AUDIO_PROVIDER_BLOCKER.md', root), 'utf8');
const thirdParty = await readFile(new URL('THIRD_PARTY_NOTICES.md', root), 'utf8');
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

test('base speech catalog mirrors the current approved guide snapshot', () => {
  assert.equal(catalog.schemaVersion, 1);
  assert.equal(catalog.voice, 'Supertonic-F1');
  assert.equal(catalog.entries.length, 130);
  assert.equal(extraCatalog.entries.length, 33);
  assert.equal(new Set(catalog.entries.map(entry => normalizeKey(entry.text))).size, 130);
  assert.equal(new Set(extraCatalog.entries.map(entry => normalizeKey(entry.text))).size, 33);
  assert.match(catalog.generatedFrom, /40 approved dokohilf_guides/);
  assert.match(catalog.generatedFrom, /129 unique approved step texts plus greeting/);
  const sourceText = catalog.entries.map(entry => entry.text).join('\n');
  assert.doesNotMatch(sourceText, /Doku erweitert|Öffne oben den Reiter „Aufgaben“|Wähle darunter „Aktuelles“|^Wähle „Easy-Plan“\.$/m);
  assert.match(sourceText, /„Planung“ findest du ganz oben in der festen grünen Hauptleiste/);
  assert.match(sourceText, /Wichtig für Schichtübergabe.*Bedarfsmedikation/s);
  assert.match(sourceText, /Öffne beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“/);
  assert.match(sourceText, /große Textfeld darunter/);
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

test('alte serverseitige TTS-, Builder- und Gacrux-Auslieferungsendpunkte sind Ruhestandsendpunkte', () => {
  assert.match(tts, /cloud_tts_retired_v28/);
  assert.match(tts, /status: 410/);
  assert.match(builder, /legacy_cloud_audio_builder_retired_v28/);
  assert.match(builder, /status: 410/);
  assert.match(legacyAudio, /legacy_gacrux_audio_delivery_retired_v28/);
  assert.match(legacyAudio, /status: 410/);
  assert.doesNotMatch(tts, /Gacrux|Gemini|generativelanguage|GEMINI_API_KEY|fetch\(/i);
  assert.doesNotMatch(builder, /x-dokohilf-build-token|dokohilf-tts|fetch\(/i);
  assert.doesNotMatch(legacyAudio, /SUPABASE_SERVICE_ROLE_KEY|createClient|storage|fetch\(/i);
});

test('öffentliche Voice-Dokumentation beschreibt nur noch statische Supertonic-Ausgabe', () => {
  assert.match(audioStatus, /130 Basiseinträge/);
  assert.match(audioStatus, /keine lokale Inferenz/i);
  assert.match(providerStatus, /keinen Gacrux-, Gemini-TTS- oder Systemstimmen-Rollbackpfad/);
  assert.match(thirdParty, /kein Rollback- oder Fallbackpfad mehr/);
  assert.doesNotMatch(thirdParty, /Rollback-Bestand erhalten/);
  assert.match(policy, /40.*freigegebene Guides/s);
  assert.match(policy, /129.*Schritttexte/s);
  assert.match(policy, /130 Basissätze/);
  assert.match(policy, /33.*Dialog/s);
  assert.match(policy, /keinen.*Browser.*Geräte.*Systemstimmen.*WebGPU.*WASM.*Cloud-TTS/s);
});

test('static audio exception is narrow and excludes every user-content source', () => {
  assert.match(policy, /Nutzerstimmen, Diktate, freie Antworten, Gesprächsverläufe/);
  assert.match(policy, /nicht dauerhaft gespeichert/);
  assert.match(rules, /Allgemeine, fachlich freigegebene Guide-Anweisungen dürfen als statische Audiodateien/);
  assert.match(rules, /Nutzerantworten, Diktate, Namen, Fallinhalte, Gesundheitsdaten und Gesprächsdaten sind als statische Audioquelle ausgeschlossen/);
  assert.match(rules, /keine App-Konten oder Anmeldung, keine Bewohner-\/Mitarbeiterprofile, keine Fallakten und keine personenbezogenen Eingabemasken/);
});

test('legacy cloud builder is disabled, JWT-geschützt and its cron is removed', () => {
  assert.match(config, /\[functions\.dokohilf-tts\][\s\S]*verify_jwt = true/);
  assert.match(config, /\[functions\.dokohilf-guide-audio-build\][\s\S]*verify_jwt = true/);
  assert.match(config, /\[functions\.dokohilf-guide-audio\][\s\S]*verify_jwt = true/);
  assert.match(retirement, /enabled = false/);
  assert.match(retirement, /cron\.unschedule\(jobid\)/);
  assert.match(retirement, /dokohilf-static-guide-audio-v27/);
});

test('retired cloud functions contain no provider, token or personal-data processing path', () => {
  for (const source of [tts, builder, legacyAudio]) {
    assert.doesNotMatch(source, /GEMINI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|build_token|fetch\(/i);
    assert.doesNotMatch(source, /name|diagnos|medikament|vitalwert/i);
  }
});
