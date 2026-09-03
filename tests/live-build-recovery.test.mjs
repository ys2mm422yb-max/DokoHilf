import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, worker, version, router, localVoice, localGate, premiumCss25, premiumCss26, premiumCss27, activeVoice, confirmed, rules] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../assets/local-voice-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/local-voice-gate-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/premium-ui-v25.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/premium-ui-v26.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/premium-ui-v27.css', import.meta.url), 'utf8'),
  readFile(new URL('../ACTIVE_WORK_LOCAL_VOICE_V28.md', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
  readFile(new URL('../PROJECT_RULES.md', import.meta.url), 'utf8'),
]);

const buildId = JSON.parse(version).buildId;

test('Build 29 ist in HTML, Versionsdatei und Service Worker identisch', () => {
  assert.match(html, new RegExp(`dokohilf-build\\" content=\\"${buildId}`));
  assert.match(worker, new RegExp(`BUILD_ID = '${buildId}'`));
  assert.match(html, /KI · v29/);
});

test('die App leitet KI-Anfragen schon vor dem Hauptskript direkt an den bestätigten Router', () => {
  assert.match(html, /__DOKOHILF_DIRECT_ROUTER_V27__/);
  assert.match(html, /dokohilf-ai-router/);
  assert.match(html, /routedInput/);
});

test('Mobile PWA entfernt alte Shell- und lokale Modellcaches und erneuert statisches Audio', () => {
  assert.match(html, /getRegistrations\(\)/);
  assert.match(html, /registration\.unregister/);
  assert.match(html, /name\.startsWith\('dokohilf-'\)/);
  assert.match(worker, /CLEAR_DOKOHILF_CACHES/);
  assert.match(worker, /navigationPreload\.enable/);
  assert.match(worker, /STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v29-2'/);
  assert.match(worker, /dokohilf-local-voice-model-v28-1/);
  assert.match(worker, /await caches\.delete\(STATIC_AUDIO_CACHE\)/);
  assert.doesNotMatch(worker, /LOCAL_VOICE_MODEL_CACHE/);
});

test('Build 29 lädt Premium-Basisschichten, Voice-Balance und statische Stimme gemeinsam', () => {
  assert.match(html, new RegExp(`premium-ui-v25\\.css\\?v=${buildId}`));
  assert.match(html, new RegExp(`premium-ui-v26\\.css\\?v=${buildId}`));
  assert.match(html, new RegExp(`premium-ui-v27\\.css\\?v=${buildId}`));
  assert.match(html, new RegExp(`voice-stage-balance-v27\\.css\\?v=${buildId}`));
  assert.match(html, new RegExp(`local-voice-v28\\.js\\?v=${buildId}`));
  assert.match(html, new RegExp(`local-voice-gate-v28\\.js\\?v=${buildId}`));
  assert.match(premiumCss25, /--dh-deep/);
  assert.match(premiumCss26, /grid-template-rows:minmax\(92px,auto\) minmax\(0,1fr\)/);
  assert.match(premiumCss26, /voice-copy strong:after\{content:none/);
  assert.match(premiumCss27, /--v27-bg:#020c12/);
  assert.doesNotMatch(html, /notfallblattButton/);
});

test('v29 spielt ausschließlich vorab erzeugtes Supertonic-F1 ab', () => {
  assert.match(localVoice, /__DOKOHILF_LOCAL_VOICE_RETIRED_V29__/);
  assert.match(localVoice, /on_device_voice_retired_static_supertonic_only/);
  assert.doesNotMatch(localVoice, /Supertone\/supertonic-3\/resolve\/main|MODEL_CACHE|loadTextToSpeech|loadVoiceStyle|navigator\.gpu/);
  assert.match(localGate, /STATIC_VOICE = 'Supertonic-F1'/);
  assert.match(localGate, /loadStaticSupertonicVoice/);
  assert.match(localGate, /static-supertonic-only-v29/);
  assert.doesNotMatch(localGate, /localFallback|DokoHilfLocalVoiceV28\.synthesize/);
  assert.match(activeVoice, /kein Cloud-TTS-Aufruf für v28-Sprachausgabe/);
  assert.match(activeVoice, /keine hörbare `speechSynthesis`-\/Gerätestimme als Fallback/);
});

test('Router v10 hält Ziele, erkennt neue Ziele und schützt Medikation', () => {
  assert.match(router, /conversational-guide-router-v10/);
  assert.match(router, /explicitGuideRoute/);
  assert.match(router, /isMedicationChangeRequest/);
  assert.match(router, /medication-view-only-safety-v9/);
  assert.match(router, /nextSpokenText/);
  assert.match(router, /Vitalwerte Sammelerf\./);
});

test('dauerhafte Fach-, Mobile- und Veröffentlichungsgrenzen bleiben dokumentiert', () => {
  assert.match(activeVoice, /iOS \*\*und\*\* Android/);
  assert.match(activeVoice, /iOS 393×852/);
  assert.match(activeVoice, /Android 412×915/);
  assert.match(activeVoice, /ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Projektinhalte/);
  assert.match(confirmed, /ausschließlich anonymisierte, selbst formulierte und fachlich bestätigte Klickwege/);
  assert.match(rules, /Dauerhaftes absolutes Echtdatenverbot/);
  assert.match(rules, /Eine spätere Freigabe darf dieses Verbot \*\*nicht\*\* aufheben oder abschwächen/);
  assert.match(confirmed, /Klienten auswählen/);
  assert.match(confirmed, /Bis leer lassen und niemals schätzen/);
});
