import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [runtime, gate, helper, ux, detail, applyLocal, applyDetail, build, version, index, worker] = await Promise.all([
  readFile(new URL('../assets/local-voice-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/local-voice-gate-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/vendor/supertonic-web-v28.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../assets/ux-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/detail-help-polish-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/apply-local-voice-v28.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/apply-detail-help-v27.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-static-site-v27.sh', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
]);

test('v28 nutzt freigegebene statische Audios zuerst und Supertonic nur für freie Antworten', () => {
  assert.match(runtime, /Supertone\/supertonic-3\/resolve\/main/);
  assert.match(runtime, /const LANGUAGE = 'de';/);
  assert.match(runtime, /const TOTAL_STEPS = 5;/);
  assert.match(runtime, /const IOS_TOTAL_STEPS = 2;/);
  assert.match(runtime, /voice_styles\/F1\.json/);
  assert.match(runtime, /local-on-device-v28/);
  assert.match(gate, /APPROVED_AUDIO_MANIFEST/);
  assert.match(gate, /static-approved-guide-v28/);
  assert.match(gate, /loadApprovedStaticVoice/);
  assert.match(gate, /DokoHilfLocalVoiceV28\.synthesize/);
  assert.ok(gate.indexOf('loadApprovedStaticVoice(text)') < gate.indexOf('localFallback(text)'), 'Statisches freigegebenes Audio muss vor lokaler Inferenz geprüft werden.');
  assert.doesNotMatch(runtime, /GEMINI_API_KEY|dokohilf-tts'\s*,\s*\{/);
});

test('iOS nutzt WASM mit schnellerer Inferenz, Android kann WebGPU bevorzugen und auf WASM fallen', () => {
  assert.match(runtime, /if \(!isIOS\(\) && navigator\.gpu\)/);
  assert.match(runtime, /loaded = await load\('webgpu'\)/);
  assert.match(runtime, /loaded = await load\('wasm'\)/);
  assert.match(runtime, /isIOS\(\) \? IOS_TOTAL_STEPS : TOTAL_STEPS/);
  assert.match(runtime, /wasmThreads: 1/);
  assert.match(helper, /onnxruntime-web@1\.27\.0/);
});

test('Voice-Einstieg lädt das große Modell nicht mehr vorab; Modellressourcen bleiben lokal cachebar', () => {
  assert.match(runtime, /let armed = false;/);
  assert.match(runtime, /function arm\(\)/);
  assert.match(runtime, /function armAndPrepare\(\)/);
  assert.match(runtime, /if \(voiceEntry\) arm\(\);/);
  assert.doesNotMatch(runtime, /if \(voiceEntry\) armAndPrepare\(\)/);
  assert.match(runtime, /dokohilf-local-voice-model-v28-1/);
  assert.match(runtime, /caches\.open\(MODEL_CACHE\)/);
  assert.match(runtime, /no-generated-audio-storage/);
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(runtime, /cache\.put\([^\n]*(?:wav|audioResponse|result\.wav)/);
});

test('iPhone-Inferenz kann nicht mehr endlos drehen', () => {
  assert.match(gate, /const IOS_LOCAL_TIMEOUT_MS = 20000;/);
  assert.match(gate, /const OTHER_LOCAL_TIMEOUT_MS = 35000;/);
  assert.match(gate, /local_voice_timeout/);
  assert.match(gate, /updateVoiceStatus\('Lokale Stimme nicht bereit'/);
});

test('freigegebene statische Audios enthalten keine Nutzerdaten und werden getrennt gecacht', () => {
  assert.match(gate, /dokohilf-guide-audio\?manifest=1/);
  assert.match(gate, /APPROVED_AUDIO_BUILD = '20260806-27'/);
  assert.match(gate, /dokohilf-approved-guide-audio-v28-1/);
  assert.match(gate, /entry\.text/);
  assert.match(gate, /entry\.file/);
  assert.match(gate, /prebuilt-approved-guide/);
  assert.match(worker, /APPROVED_AUDIO_CACHE/);
  assert.match(worker, /key !== APPROVED_AUDIO_CACHE/);
});

test('legacy 180/160ms device-voice races are disabled whenever v28 is active', () => {
  assert.match(ux, /if \(localVoiceV28\(\)\) return previousFetch\(input, init\);/);
  assert.match(ux, /if \(localVoiceV28\(\)\) return;\n    const synth/);
  assert.match(detail, /&& !localVoiceV28\(\)/);
  assert.match(detail, /data-local-voice-only/);
});

test('system speech stays blocked and the release app keeps an explicit local-only fallback guard', () => {
  assert.match(gate, /blockSystemSpeech/);
  assert.match(gate, /__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__/);
  assert.match(gate, /utterance\?\.onerror/);
  assert.match(applyLocal, /window\.__DOKOHILF_LOCAL_VOICE_V28__ === true/);
  assert.match(applyLocal, /Lokale Stimme nicht bereit/);
});

test('v28 lädt keine alte Gacrux-Diagnostik, nutzt aber den schmalen freigegebenen Audio-Endpunkt', () => {
  assert.match(applyLocal, /replace\(`  <script src="assets\/voice-diagnostics\.js/);
  assert.match(applyLocal, /if \(window\.__DOKOHILF_LOCAL_VOICE_V28__ !== true\) loadPrebuiltManifest/);
  assert.match(applyLocal, /if \(window\.__DOKOHILF_LOCAL_VOICE_V28__ === true\) return;/);
  assert.doesNotMatch(worker, /dokohilf-guide-audio\?manifest=/);
  assert.match(gate, /APPROVED_AUDIO_ENDPOINT/);
  assert.match(gate, /method: 'GET'/);
});

test('v28 build ID, load order and PWA voice caches are explicit', () => {
  assert.match(version, /"buildId": "20260807-28"/);
  assert.match(version, /"release": "local-natural-voice"/);
  assert.match(index, /KI · v28/);
  const local = index.indexOf('local-voice-v28.js?v=20260807-28');
  const experience = index.indexOf('experience-v27.js?v=20260807-28');
  const uxIndex = index.indexOf('ux-v27.js?v=20260807-28');
  const gateIndex = index.indexOf('local-voice-gate-v28.js?v=20260807-28');
  const app = index.indexOf('app.js?v=20260807-28');
  assert(local >= 0 && local < experience && experience < uxIndex && uxIndex < gateIndex && gateIndex < app);
  assert.match(worker, /const BUILD_ID = '20260807-28';/);
  assert.match(worker, /HOTFIX_REVISION = '20260807-voice-guides-report-v28-3'/);
  assert.match(worker, /LOCAL_VOICE_MODEL_CACHE/);
  assert.match(worker, /APPROVED_AUDIO_CACHE/);
  assert.match(applyDetail, /20260807-voice-guides-report-v28-3/);
  assert.match(build, /local-voice-v28\.js/);
  assert.match(build, /local-voice-gate-v28\.js/);
  assert.match(build, /static-approved-guide-v28/);
  assert.match(build, /payload\.spokenText/);
  assert.match(build, /Sonderfall · nur bei 2 Kategorien/);
});

test('model weights and generated speech files are not redistributed inside the public bundle', () => {
  assert.match(helper, /Model weights are NOT redistributed/);
  assert.doesNotMatch(helper, /data:application\/octet-stream;base64/);
  assert.match(build, /Generierte Sprachdateien dürfen nicht im öffentlichen Pages-Build liegen/);
});
