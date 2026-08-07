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

test('v28 uses an on-device German Supertonic voice instead of cloud TTS', () => {
  assert.match(runtime, /Supertone\/supertonic-3\/resolve\/main/);
  assert.match(runtime, /const LANGUAGE = 'de';/);
  assert.match(runtime, /const TOTAL_STEPS = 5;/);
  assert.match(runtime, /voice_styles\/F1\.json/);
  assert.match(runtime, /local-on-device-v28/);
  assert.match(gate, /DokoHilfLocalVoiceV28\.synthesize/);
  assert.doesNotMatch(runtime, /GEMINI_API_KEY|dokohilf-tts'\s*,\s*\{/);
});

test('iOS gets WASM while Android can prefer WebGPU and fall back to WASM', () => {
  assert.match(runtime, /if \(!isIOS\(\) && navigator\.gpu\)/);
  assert.match(runtime, /loaded = await load\('webgpu'\)/);
  assert.match(runtime, /loaded = await load\('wasm'\)/);
  assert.match(runtime, /wasmThreads: 1/);
  assert.match(helper, /onnxruntime-web@1\.27\.0/);
});

test('voice model is downloaded only after an explicit voice action and only model assets persist', () => {
  assert.match(runtime, /let armed = false;/);
  assert.match(runtime, /function armAndPrepare\(\)/);
  assert.match(runtime, /dokohilf-local-voice-model-v28-1/);
  assert.match(runtime, /caches\.open\(MODEL_CACHE\)/);
  assert.match(runtime, /no-generated-audio-storage/);
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(runtime, /cache\.put\([^\n]*(?:wav|audioResponse|result\.wav)/);
});

test('legacy 180/160ms device-voice races are disabled whenever v28 is active', () => {
  assert.match(ux, /if \(localVoiceV28\(\)\) return previousFetch\(input, init\);/);
  assert.match(ux, /if \(localVoiceV28\(\)\) return;\n    const synth/);
  assert.match(detail, /&& !localVoiceV28\(\)/);
  assert.match(detail, /data-local-voice-only/);
});

test('system speech is blocked and the release app has an explicit local-only fallback guard', () => {
  assert.match(gate, /blockSystemSpeech/);
  assert.match(gate, /__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__/);
  assert.match(gate, /utterance\?\.onerror/);
  assert.match(applyLocal, /window\.__DOKOHILF_LOCAL_VOICE_V28__ === true/);
  assert.match(applyLocal, /Lokale Stimme nicht bereit/);
});

test('v28 release does not load legacy Gacrux diagnostics or prewarm Gacrux audio', () => {
  assert.match(applyLocal, /replace\(`  <script src="assets\/voice-diagnostics\.js/);
  assert.match(applyLocal, /if \(window\.__DOKOHILF_LOCAL_VOICE_V28__ !== true\) loadPrebuiltManifest/);
  assert.match(applyLocal, /if \(window\.__DOKOHILF_LOCAL_VOICE_V28__ === true\) return;/);
  assert.doesNotMatch(worker, /dokohilf-guide-audio\?manifest=/);
  assert.doesNotMatch(worker, /cacheApprovedGuideAudio/);
});

test('v28 build ID, load order and PWA model-cache survival are explicit', () => {
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
  assert.match(worker, /LOCAL_VOICE_MODEL_CACHE/);
  assert.match(worker, /key !== LOCAL_VOICE_MODEL_CACHE/);
  assert.match(applyDetail, /20260807-local-natural-voice-v28-1/);
  assert.match(build, /local-voice-v28\.js/);
  assert.match(build, /local-voice-gate-v28\.js/);
});

test('model weights are not redistributed inside the public repository bundle', () => {
  assert.match(helper, /Model weights are NOT redistributed/);
  assert.doesNotMatch(helper, /data:application\/octet-stream;base64/);
  assert.match(build, /Generierte Sprachdateien dürfen nicht im öffentlichen Pages-Build liegen/);
});
