import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [runtime, gate, experience, helper, ux, detail, contextHotfix, renderSync, applyLocal, applyDetail, build, builder, sourceCatalogText, extrasText, releaseText, version, index, worker] = await Promise.all([
  readFile(new URL('../assets/local-voice-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/local-voice-gate-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/experience-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/vendor/supertonic-web-v28.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../assets/ux-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/detail-help-polish-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/context-voice-hotfix-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/detail-help-render-sync-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/apply-local-voice-v28.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/apply-detail-help-v27.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-static-site-v27.sh', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-supertonic-guide-audio-v28.py', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-audio-catalog.json', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-extra-catalog-v28.json', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-release-catalog-v29.json', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
]);

const sourceCatalog = JSON.parse(sourceCatalogText);
const extraCatalog = JSON.parse(extrasText);
const releaseCatalog = JSON.parse(releaseText);
const buildId = JSON.parse(version).buildId;

test('v29 nutzt dieselbe kostenlose Supertonic-F1-Stimme statisch für Guides und lokal nur bei Bedarf', () => {
  assert.match(runtime, /Supertone\/supertonic-3\/resolve\/main/);
  assert.match(runtime, /const LANGUAGE = 'de';/);
  assert.match(runtime, /const IOS_TOTAL_STEPS = 2;/);
  assert.match(runtime, /voice_styles\/F1\.json/);
  assert.match(runtime, /meta\[name="dokohilf-build"\]/);
  assert.match(gate, /STATIC_VOICE = 'Supertonic-F1'/);
  assert.match(gate, /meta\[name="dokohilf-build"\]/);
  assert.match(gate, /STATIC_AUDIO_MANIFEST = `\.\/assets\/guide-audio-catalog\.json\?v=\$\{encodeURIComponent\(BUILD_ID\)\}`/);
  assert.match(gate, /static-supertonic-guide-v29/);
  assert.match(gate, /dokohilf-chat-router/);
  assert.match(gate, /loadStaticSupertonicVoice/);
  assert.match(gate, /DokoHilfLocalVoiceV28\.synthesize/);
  assert.ok(gate.indexOf('loadStaticSupertonicVoice(text)') < gate.indexOf('localFallback(text)'), 'Statisches Supertonic-Audio muss vor lokaler Inferenz geprüft werden.');
  assert.doesNotMatch(gate, /APPROVED_AUDIO_ENDPOINT|dokohilf-guide-audio\?manifest=1|X-DokoHilf-Voice': 'Gacrux/);
});

test('GitHub-Build erzeugt 160 bestätigte statische Sprachsätze ohne TTS-API mit Supertonic 3', () => {
  assert.match(builder, /from supertonic import TTS/);
  assert.match(builder, /TTS\(auto_download=True\)/);
  assert.match(builder, /lang='de'/);
  assert.match(builder, /voice_name=args\.voice/);
  assert.match(builder, /--extra-catalog/);
  assert.match(builder, /--release-catalog/);
  assert.match(builder, /merged_entries/);
  assert.match(builder, /BASE_GUIDE_COUNT = 93/);
  assert.match(builder, /EXTRA_SPEECH_COUNT = 18/);
  assert.match(builder, /RELEASE_SPEECH_COUNT = 49/);
  assert.match(builder, /STATIC_SPEECH_COUNT = BASE_GUIDE_COUNT \+ EXTRA_SPEECH_COUNT \+ RELEASE_SPEECH_COUNT/);
  assert.match(builder, /--validate-only/);
  assert.match(builder, /supertonic_text/);
  assert.match(builder, /'„': ''/);
  assert.match(build, /DOKOHILF_REQUIRE_STATIC_SUPERTONIC/);
  assert.match(build, /Statischer Supertonic-Sprachbestand unvollständig/);
  assert.equal(sourceCatalog.entries.length, 93);
  assert.equal(extraCatalog.entries.length, 18);
  assert.equal(releaseCatalog.entries.length, 49);
  const all = [...sourceCatalog.entries, ...extraCatalog.entries, ...releaseCatalog.entries];
  assert.equal(all.length, 160);
  const normalized = all.map(entry => String(entry.text || '').toLocaleLowerCase('de-DE').replace(/\s+/g, ' ').trim());
  assert.equal(new Set(normalized).size, 160);
  assert.match(extrasText, /Hier werden fachliche Beobachtungen und Ereignisse als Berichtseinträge dokumentiert/);
  assert.match(releaseText, /Wähle zuerst den gewünschten Bewohner und suche danach in der festen Leiste nach „Berichte“/);
  assert.match(releaseText, /Wenn du das Formular fertig bearbeitet hast, speicherst du es oben links in der Leiste/);
});

test('Bericht-Kontexthilfe bleibt im Bericht-Kontext und übernimmt keine Vitalwerte-Schaltfläche', () => {
  assert.match(contextHotfix, /'bericht-neu'/);
  assert.match(contextHotfix, /'bericht-folgebericht'/);
  assert.match(contextHotfix, /REPORT_ENTRY_SPEECH = 'Wähle zuerst den gewünschten Bewohner und suche danach in der festen Leiste nach Berichte\. Siehst du Berichte\?'/);
  assert.match(contextHotfix, /isVitalGuide\(slug\) \? 'Vitalwerte fehlt' : 'Der Menüpunkt fehlt'/);
  assert.match(renderSync, /startsWith\('vitalwerte'\)/);
  assert.match(renderSync, /: 'Der Menüpunkt fehlt'/);
  assert.doesNotMatch(renderSync, /'target-missing': 'Vitalwerte fehlt'/);
});

test('iOS nutzt WASM mit schnellerer lokaler Notinferenz, Android kann WebGPU bevorzugen', () => {
  assert.match(runtime, /if \(!isIOS\(\) && navigator\.gpu\)/);
  assert.match(runtime, /loaded = await load\('webgpu'\)/);
  assert.match(runtime, /loaded = await load\('wasm'\)/);
  assert.match(runtime, /isIOS\(\) \? IOS_TOTAL_STEPS : TOTAL_STEPS/);
  assert.match(runtime, /wasmThreads: 1/);
  assert.match(helper, /onnxruntime-web@1\.27\.0/);
});

test('Voice-Einstieg startet weiter sofort; das lokale Modell wird erst danach im Hintergrund vorgewärmt', () => {
  assert.match(runtime, /let armed = false;/);
  assert.match(runtime, /function arm\(\)/);
  assert.match(runtime, /function armAndPrepare\(\)/);
  assert.match(runtime, /if \(voiceEntry\) arm\(\);/);
  assert.match(contextHotfix, /const VOICE_WARM_DELAY_MS = 1200;/);
  assert.match(contextHotfix, /api\.armAndPrepare\(\)/);
  assert.match(contextHotfix, /window\.setTimeout\(warmLocalVoice, VOICE_WARM_DELAY_MS\)/);
  assert.match(runtime, /dokohilf-local-voice-model-v28-1/);
  assert.match(runtime, /no-generated-audio-storage/);
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(contextHotfix, /localStorage|sessionStorage|indexedDB/);
});

test('iPhone-Inferenz kann nicht endlos drehen und v29 beendet die lokale Notinferenz nach acht Sekunden', () => {
  assert.match(gate, /const IOS_LOCAL_TIMEOUT_MS = 8000;/);
  assert.match(gate, /const OTHER_LOCAL_TIMEOUT_MS = 35000;/);
  assert.match(gate, /local_voice_timeout/);
  assert.match(gate, /updateVoiceStatus\('Stimme nicht bereit'/);
  assert.match(contextHotfix, /const IOS_SYNTHESIS_TIMEOUT_MS = 8000;/);
  assert.match(contextHotfix, /new Error\('local_voice_timeout'\)/);
  assert.ok(gate.indexOf('IOS_LOCAL_TIMEOUT_MS = 8000') >= 0, 'Der finale v29-Gate muss die iPhone-Notinferenz nach acht Sekunden beenden.');
});

test('statische Supertonic-Audios erhalten einen neuen v29-Cache und der alte v28-Cache wird entfernt', () => {
  assert.match(gate, /dokohilf-static-supertonic-audio-v29-1/);
  assert.match(gate, /entry\.text/);
  assert.match(gate, /entry\.file/);
  assert.match(gate, /stripExerciseNotice/);
  assert.match(worker, /STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v29-1'/);
  assert.match(worker, /dokohilf-static-supertonic-audio-v28-1/);
  assert.match(worker, /caches\.delete\('dokohilf-static-supertonic-audio-v28-1'\)/);
  assert.match(worker, /guide-audio-catalog\.json/);
});

test('legacy Geräte-Sprachraces bleiben auch in v29 deaktiviert', () => {
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

test('v29 lädt keine alte Voice-Diagnostik oder Cloud-TTS-Sprachquelle im Releasebuild', () => {
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

test('v29 Build-ID, Load-Order, report spokenText und PWA-Revision sind explizit', () => {
  assert.match(version, new RegExp(`"buildId": "${buildId}"`));
  assert.match(index, /KI · v29/);
  const local = index.indexOf(`local-voice-v28.js?v=${buildId}`);
  const experienceIndex = index.indexOf(`experience-v27.js?v=${buildId}`);
  const uxIndex = index.indexOf(`ux-v27.js?v=${buildId}`);
  const uiIndex = index.indexOf(`v29-ui.js?v=${buildId}`);
  const gateIndex = index.indexOf(`local-voice-gate-v28.js?v=${buildId}`);
  const copyIndex = index.indexOf(`direct-guide-copy-v29.js?v=${buildId}`);
  const app = index.indexOf(`app.js?v=${buildId}`);
  assert(local >= 0 && local < experienceIndex && experienceIndex < uxIndex && uxIndex < uiIndex && uiIndex < gateIndex && gateIndex < copyIndex && copyIndex < app);
  assert.match(worker, /HOTFIX_REVISION = '20260808-smart-help-voice-ui-v29-1'/);
  assert.match(worker, /LOCAL_VOICE_MODEL_CACHE/);
  assert.match(worker, /STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v29-1'/);
  assert.match(applyDetail, /context-voice-hotfix-v28\.js\?v=\$\{BUILD_ID\}/);
  assert.match(applyDetail, /contextVoiceHotfixIndex < gateIndex/);
  assert.match(applyDetail, /20260808-context-voice-v29-1/);
  assert.match(build, /static-supertonic-guide-v29/);
  assert.match(build, /payload\.spokenText/);
  assert.match(build, /Sonderfall · nur bei 2 Kategorien/);
  assert.match(build, /Sturzprotokoll/);
});

test('Modellgewichte werden nicht ins Repository eingebettet; allgemeine statische Sprach-WAVs gehen nur in Pages', () => {
  assert.match(helper, /Model weights are NOT redistributed/);
  assert.doesNotMatch(helper, /data:application\/octet-stream;base64/);
  assert.match(build, /releaseSpeechCount/);
  assert.match(build, /Wähle zuerst den gewünschten Bewohner und suche danach/);
});
