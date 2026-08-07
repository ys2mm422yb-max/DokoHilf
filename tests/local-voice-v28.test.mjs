import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [runtime, gate, experience, helper, ux, detail, applyLocal, applyDetail, build, builder, sourceCatalogText, extrasText, version, index, worker] = await Promise.all([
  readFile(new URL('../assets/local-voice-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/local-voice-gate-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/experience-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/vendor/supertonic-web-v28.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../assets/ux-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/detail-help-polish-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/apply-local-voice-v28.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/apply-detail-help-v27.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-static-site-v27.sh', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-supertonic-guide-audio-v28.py', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-audio-catalog.json', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-extra-catalog-v28.json', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
]);

const sourceCatalog = JSON.parse(sourceCatalogText);
const extraCatalog = JSON.parse(extrasText);

test('v28 nutzt dieselbe kostenlose Supertonic-F1-Stimme statisch für Guides und lokal nur bei Bedarf', () => {
  assert.match(runtime, /Supertone\/supertonic-3\/resolve\/main/);
  assert.match(runtime, /const LANGUAGE = 'de';/);
  assert.match(runtime, /const IOS_TOTAL_STEPS = 2;/);
  assert.match(runtime, /voice_styles\/F1\.json/);
  assert.match(gate, /STATIC_VOICE = 'Supertonic-F1'/);
  assert.match(gate, /STATIC_AUDIO_MANIFEST = '.\/assets\/guide-audio-catalog\.json\?v=20260807-28'/);
  assert.match(gate, /static-supertonic-guide-v28/);
  assert.match(gate, /loadStaticSupertonicVoice/);
  assert.match(gate, /DokoHilfLocalVoiceV28\.synthesize/);
  assert.ok(gate.indexOf('loadStaticSupertonicVoice(text)') < gate.indexOf('localFallback(text)'), 'Statisches Supertonic-Audio muss vor lokaler Inferenz geprüft werden.');
  assert.doesNotMatch(gate, /APPROVED_AUDIO_ENDPOINT|dokohilf-guide-audio\?manifest=1|X-DokoHilf-Voice': 'Gacrux/);
});

test('GitHub-Build erzeugt alle bestätigten statischen Sprachsätze ohne TTS-API mit Supertonic 3', () => {
  assert.match(builder, /from supertonic import TTS/);
  assert.match(builder, /TTS\(auto_download=True\)/);
  assert.match(builder, /lang='de'/);
  assert.match(builder, /voice_name=args\.voice/);
  assert.match(builder, /--extra-catalog/);
  assert.match(builder, /merged_entries/);
  assert.match(builder, /BASE_GUIDE_COUNT = 93/);
  assert.match(builder, /EXTRA_SPEECH_COUNT = 18/);
  assert.match(builder, /STATIC_SPEECH_COUNT = BASE_GUIDE_COUNT \+ EXTRA_SPEECH_COUNT/);
  assert.match(builder, /--validate-only/);
  assert.match(builder, /supertonic_text/);
  assert.match(builder, /'„': ''/);
  assert.match(build, /DOKOHILF_REQUIRE_STATIC_SUPERTONIC/);
  assert.match(build, /Statischer Supertonic-Sprachbestand unvollständig/);
  assert.equal(sourceCatalog.entries.length, 93);
  assert.equal(extraCatalog.entries.length, 18);
  assert.equal(sourceCatalog.entries.length + extraCatalog.entries.length, 111);
  const normalized = [...sourceCatalog.entries, ...extraCatalog.entries]
    .map(entry => String(entry.text || '').toLocaleLowerCase('de-DE').replace(/\s+/g, ' ').trim());
  assert.equal(new Set(normalized).size, 111);
  assert.match(extrasText, /Okay\. Schau oben in die grüne Reiterleiste/);
  assert.match(extrasText, /Die Medikation darf hier nur angesehen werden/);
  assert.match(extrasText, /Der Ablauf ist erledigt/);
});

test('iOS nutzt WASM mit schnellerer lokaler Notinferenz, Android kann WebGPU bevorzugen', () => {
  assert.match(runtime, /if \(!isIOS\(\) && navigator\.gpu\)/);
  assert.match(runtime, /loaded = await load\('webgpu'\)/);
  assert.match(runtime, /loaded = await load\('wasm'\)/);
  assert.match(runtime, /isIOS\(\) \? IOS_TOTAL_STEPS : TOTAL_STEPS/);
  assert.match(runtime, /wasmThreads: 1/);
  assert.match(helper, /onnxruntime-web@1\.27\.0/);
});

test('Voice-Einstieg lädt das große lokale Modell nicht vorab', () => {
  assert.match(runtime, /let armed = false;/);
  assert.match(runtime, /function arm\(\)/);
  assert.match(runtime, /function armAndPrepare\(\)/);
  assert.match(runtime, /if \(voiceEntry\) arm\(\);/);
  assert.doesNotMatch(runtime, /if \(voiceEntry\) armAndPrepare\(\)/);
  assert.match(runtime, /dokohilf-local-voice-model-v28-1/);
  assert.match(runtime, /no-generated-audio-storage/);
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB/);
});

test('iPhone-Inferenz kann nicht endlos drehen', () => {
  assert.match(gate, /const IOS_LOCAL_TIMEOUT_MS = 20000;/);
  assert.match(gate, /const OTHER_LOCAL_TIMEOUT_MS = 35000;/);
  assert.match(gate, /local_voice_timeout/);
  assert.match(gate, /updateVoiceStatus\('Stimme nicht bereit'/);
});

test('statische Supertonic-Audios werden separat gecacht und enthalten nur Katalogtexte', () => {
  assert.match(gate, /dokohilf-static-supertonic-audio-v28-1/);
  assert.match(gate, /entry\.text/);
  assert.match(gate, /entry\.file/);
  assert.match(gate, /stripExerciseNotice/);
  assert.match(worker, /STATIC_AUDIO_CACHE/);
  assert.match(worker, /key !== STATIC_AUDIO_CACHE/);
  assert.match(worker, /guide-audio-catalog\.json/);
});

test('legacy Geräte-Sprachraces bleiben bei v28 deaktiviert', () => {
  assert.match(ux, /if \(localVoiceV28\(\)\) return previousFetch\(input, init\);/);
  assert.match(ux, /if \(localVoiceV28\(\)\) return;\n    const synth/);
  assert.match(detail, /&& !localVoiceV28\(\)/);
  assert.match(detail, /data-local-voice-only/);
});

test('Systemstimme bleibt blockiert und der bestehende lokale Guard bleibt aktiv', () => {
  assert.match(gate, /blockSystemSpeech/);
  assert.match(gate, /__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__/);
  assert.match(gate, /utterance\?\.onerror/);
  assert.match(applyLocal, /window\.__DOKOHILF_LOCAL_VOICE_V28__ === true/);
});

test('v28 lädt keine alte Voice-Diagnostik oder Cloud-TTS-Sprachquelle im Browser', () => {
  assert.match(applyLocal, /replace\(`  <script src="assets\/voice-diagnostics\.js/);
  assert.match(applyLocal, /if \(window\.__DOKOHILF_LOCAL_VOICE_V28__ !== true\) loadPrebuiltManifest/);
  assert.match(experience, /if \(window\.__DOKOHILF_LOCAL_VOICE_V28__ === true\) return previousFetch\(input, init\);/);
  assert.ok(
    experience.indexOf('window.__DOKOHILF_LOCAL_VOICE_V28__ === true') < experience.indexOf("url.includes(TTS_MARKER)"),
    'Die historische v27-Sprachschicht muss vor jedem alten TTS-Pfad aussteigen.',
  );
  assert.doesNotMatch(worker, /dokohilf-guide-audio\?manifest=/);
  assert.doesNotMatch(gate, /APPROVED_AUDIO_ENDPOINT|Gacrux/);
});

test('v28 Build-ID, Load-Order, report spokenText und Supertonic-PWA-Revision sind explizit', () => {
  assert.match(version, /"buildId": "20260807-28"/);
  assert.match(index, /KI · v28/);
  const local = index.indexOf('local-voice-v28.js?v=20260807-28');
  const experience = index.indexOf('experience-v27.js?v=20260807-28');
  const uxIndex = index.indexOf('ux-v27.js?v=20260807-28');
  const gateIndex = index.indexOf('local-voice-gate-v28.js?v=20260807-28');
  const app = index.indexOf('app.js?v=20260807-28');
  assert(local >= 0 && local < experience && experience < uxIndex && uxIndex < gateIndex && gateIndex < app);
  assert.match(worker, /HOTFIX_REVISION = '20260807-static-supertonic-guides-v28-4'/);
  assert.match(worker, /LOCAL_VOICE_MODEL_CACHE/);
  assert.match(worker, /STATIC_AUDIO_CACHE/);
  assert.match(applyDetail, /20260807-static-supertonic-guides-v28-4/);
  assert.match(build, /static-supertonic-guide-v28/);
  assert.match(build, /payload\.spokenText/);
  assert.match(build, /Sonderfall · nur bei 2 Kategorien/);
  assert.match(build, /Sturzprotokoll/);
});

test('Modellgewichte werden nicht ins Repository eingebettet; allgemeine statische Sprach-WAVs gehen nur in Pages', () => {
  assert.match(helper, /Model weights are NOT redistributed/);
  assert.doesNotMatch(helper, /data:application\/octet-stream;base64/);
  assert.match(build, /baseGuideCount/);
  assert.match(build, /Okay\. Schau oben in die grüne Reiterleiste/);
});
