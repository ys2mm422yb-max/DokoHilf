import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, worker, version, router, localVoice, premiumCss25, premiumCss26, premiumCss27, activeVoice, confirmed, rules] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../assets/local-voice-v28.js', import.meta.url), 'utf8'),
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

test('Mobile PWA kann alte Shell-Caches entfernen und den lokalen v28-Modellcache erhalten', () => {
  assert.match(html, /getRegistrations\(\)/);
  assert.match(html, /registration\.unregister/);
  assert.match(html, /name\.startsWith\('dokohilf-'\)/);
  assert.match(worker, /CLEAR_DOKOHILF_CACHES/);
  assert.match(worker, /navigationPreload\.enable/);
  assert.match(worker, /LOCAL_VOICE_MODEL_CACHE/);
  assert.match(worker, /key !== LOCAL_VOICE_MODEL_CACHE/);
});

test('Build 29 lädt Premium-Basisschichten, Voice-Balance und lokale Stimme gemeinsam', () => {
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

test('v29 erzeugt Sprache lokal und speichert nur Modellressourcen dauerhaft', () => {
  assert.match(localVoice, /Supertone\/supertonic-3\/resolve\/main/);
  assert.match(localVoice, /MODEL_CACHE = 'dokohilf-local-voice-model-v28-1'/);
  assert.match(localVoice, /no-generated-audio-storage/);
  assert.doesNotMatch(localVoice, /localStorage|sessionStorage|indexedDB/);
  assert.match(activeVoice, /kein Cloud-TTS-Aufruf für v28-Sprachausgabe/);
  assert.match(activeVoice, /keine hörbare `speechSynthesis`-\/Gerätestimme als Fallback/);
});

test('Router v9 hält Ziele, erkennt neue Ziele und schützt Medikation', () => {
  assert.match(router, /conversational-guide-router-v9/);
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
  assert.match(confirmed, /Öffentliche Dokumentation enthält keine Angaben zu Herkunft, Prüfmaterialien oder internen Ausgangsmaterialien/);
  assert.match(rules, /Dauerhaftes absolutes Echtdatenverbot/);
  assert.match(rules, /Eine spätere Freigabe darf dieses Verbot \*\*nicht\*\* aufheben oder abschwächen/);
  assert.match(confirmed, /Klienten auswählen/);
  assert.match(confirmed, /Bis leer lassen und niemals schätzen/);
});
