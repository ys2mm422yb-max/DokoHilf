import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [
  runtime,
  gate,
  contextHotfix,
  orientation,
  releasePolish,
  durchfuehrungWorkflows,
  applyLocal,
  applyDetail,
  build,
  builder,
  sourceCatalogText,
  extrasText,
  releaseText,
  workflowText,
  uiSpeechText,
  version,
  index,
  worker,
] = await Promise.all([
  readFile(new URL('../assets/local-voice-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/local-voice-gate-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/context-voice-hotfix-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/orientation-help-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/release-polish-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/durchfuehrungs-workflows-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/apply-local-voice-v28.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/apply-detail-help-v27.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-static-site-v27.sh', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-supertonic-guide-audio-v28.py', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-audio-catalog.json', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-extra-catalog-v28.json', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-release-catalog-v29.json', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-durchfuehrung-catalog-v29.json', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-ui-catalog-v29.json', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
]);

const sourceCatalog = JSON.parse(sourceCatalogText);
const extraCatalog = JSON.parse(extrasText);
const releaseCatalog = JSON.parse(releaseText);
const workflowCatalog = JSON.parse(workflowText);
const uiSpeechCatalog = JSON.parse(uiSpeechText);
const buildId = JSON.parse(version).buildId;

test('Sprachausgabe ist ausschließlich statisches Supertonic-F1', () => {
  assert.match(gate, /STATIC_VOICE = 'Supertonic-F1'/);
  assert.match(gate, /static-supertonic-only-v29/);
  assert.match(gate, /__DOKOHILF_STATIC_SUPERTONIC_ONLY_V29__/);
  assert.match(gate, /loadStaticSupertonicVoice/);
  assert.match(gate, /Ich habe die Antwort im Chat angezeigt/);
  assert.doesNotMatch(gate, /localFallback|DokoHilfLocalVoiceV28\.synthesize|IOS_LOCAL_TIMEOUT_MS|OTHER_LOCAL_TIMEOUT_MS/);
  assert.doesNotMatch(runtime, /Supertone\/supertonic-3\/resolve\/main|loadTextToSpeech|loadVoiceStyle|navigator\.gpu|onnxruntime/);
  assert.match(runtime, /on_device_voice_retired_static_supertonic_only/);
  assert.match(runtime, /__DOKOHILF_LOCAL_VOICE_RETIRED_V29__/);
  assert.match(runtime, /__DOKOHILF_STATIC_SUPERTONIC_ONLY_V29__/);
});

test('System- und Gerätestimme bleiben blockiert', () => {
  assert.match(gate, /blockSystemSpeech/);
  assert.match(gate, /__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__/);
  assert.match(gate, /static-supertonic-only/);
  assert.match(applyLocal, /__DOKOHILF_STATIC_SUPERTONIC_ONLY_V29__/);
  assert.match(applyLocal, /Sprachausgabe nicht verfügbar/);
  assert.doesNotMatch(contextHotfix, /warmLocalVoice|armAndPrepare|local_voice_timeout|IOS_SYNTHESIS_TIMEOUT_MS/);
  assert.match(contextHotfix, /voiceMode: 'static-supertonic-only'/);
});

test('GitHub-Build erzeugt 216 feste Supertonic-F1-Sätze', () => {
  assert.match(builder, /from supertonic import TTS/);
  assert.match(builder, /TTS\(auto_download=True\)/);
  assert.match(builder, /lang='de'/);
  assert.match(builder, /BASE_GUIDE_COUNT = 93/);
  assert.match(builder, /EXTRA_SPEECH_COUNT = 33/);
  assert.match(builder, /RELEASE_SPEECH_COUNT = 49/);
  assert.match(builder, /WORKFLOW_SPEECH_COUNT = 40/);
  assert.match(builder, /UI_SPEECH_COUNT = 1/);
  assert.match(builder, /STATIC_SPEECH_COUNT = BASE_GUIDE_COUNT \+ EXTRA_SPEECH_COUNT \+ RELEASE_SPEECH_COUNT \+ WORKFLOW_SPEECH_COUNT \+ UI_SPEECH_COUNT/);
  assert.equal(sourceCatalog.entries.length, 93);
  assert.equal(extraCatalog.entries.length, 33);
  assert.equal(releaseCatalog.entries.length, 49);
  assert.equal(workflowCatalog.entries.length, 40);
  assert.equal(uiSpeechCatalog.entries.length, 1);
  assert.equal(sourceCatalog.entries.length + extraCatalog.entries.length + releaseCatalog.entries.length + workflowCatalog.entries.length + uiSpeechCatalog.entries.length, 216);
  assert.match(uiSpeechText, /Hey! Wobei brauchst du Hilfe\?/);
  assert.match(extrasText, /Ich habe die Antwort im Chat angezeigt/);
  assert.match(workflowText, /Bedarfsmedikation/);
  assert.match(workflowText, /Wirksamkeitskontrolle/);
  assert.match(workflowText, /Maßnahmen ohne Zeitangabe/);
  assert.match(build, /expected_count" != 216/);
  assert.match(build, /staticSpeechCount\": 216/);
});

test('Sprachstart wird kurz und beginnt mit Hey', () => {
  assert.match(applyLocal, /const newGreeting = 'Hey! Wobei brauchst du Hilfe\?'/);
  assert.match(applyLocal, /const oldGreeting = 'Hallo! Sag mir einfach/);
  assert.match(uiSpeechText, /Hey! Wobei brauchst du Hilfe\?/);
  assert.match(build, /Hey! Wobei brauchst du Hilfe/);
});

test('Orientierung erklärt bestätigte Bereiche eine Ebene zurück', () => {
  assert.match(orientation, /Doku-Erweitert ist ein Hauptbereich in der festen Leiste, auf derselben Ebene wie Berichte und Doku/);
  assert.match(orientation, /Innerhalb von Doku-Erweitert findest du Vitalwerte/);
  assert.match(orientation, /Innerhalb von Doku-Erweitert findest du Visiten/);
  assert.match(orientation, /Innerhalb von Doku-Erweitert findest du Medikation/);
  assert.match(orientation, /Innerhalb von Doku-Erweitert findest du Formulare/);
  assert.match(orientation, /Innerhalb von Doku-Erweitert findest du An-\/Abwesenheiten/);
  assert.match(orientation, /Innerhalb von Doku findest du den Durchführungsnachweis/);
  assert.match(orientation, /Berichte ist ein Hauptbereich in der festen Leiste/);
  assert.match(orientation, /Analyse findest du Was war los/);
  assert.match(orientation, /kleine rote Kreuz beziehungsweise den zugehörigen Pfeil/);
  assert.match(orientation, /Bedarfsmedikation/);
  assert.match(orientation, /Wirksamkeitskontrolle/);
  assert.match(orientation, /Maßnahmen ohne Zeitangabe/);
  assert.match(orientation, /__DOKOHILF_ORIENTATION_HELP_V29__/);
});

test('Aufgaben, Easy-Plan und Berichtssuche erhalten keine erfundene Orientierung', () => {
  assert.doesNotMatch(orientation, /Easy-Plan|Easy Plan|Aufgaben · Aktuelles|Berichtssuche/);
});

test('Neue Durchführung-Workflows sind als direkte Guides vorhanden', () => {
  assert.match(durchfuehrungWorkflows, /bedarfsmedikation-gabe/);
  assert.match(durchfuehrungWorkflows, /bedarfsmedikation-wirksamkeitskontrolle/);
  assert.match(durchfuehrungWorkflows, /massnahmen-ohne-zeitangabe/);
  assert.match(durchfuehrungWorkflows, /kleinen Pfeil links daneben/);
  assert.match(durchfuehrungWorkflows, /rechts im kleinen Kästchen/);
  assert.match(durchfuehrungWorkflows, /Verordnung selbst nicht verändern/);
  assert.match(durchfuehrungWorkflows, /automatisch erzeugte Wirksamkeitskontrolle/);
  assert.match(durchfuehrungWorkflows, /„Was war“/);
  assert.match(durchfuehrungWorkflows, /unten mit „OK“ bestätigen/);
  assert.match(durchfuehrungWorkflows, /__DOKOHILF_DURCHFUEHRUNGS_WORKFLOWS_V29__/);
});

test('Versionsplakette ist oben verborgen und nur unten dezent verfügbar', () => {
  assert.match(index, /id="buildPill" type="button" hidden/);
  assert.match(releasePolish, /footer-version-wrap/);
  assert.match(releasePolish, /footer-version-button/);
  assert.match(releasePolish, /pill\.classList\.remove\('build-pill'\)/);
  assert.match(releasePolish, /DokoHilf \$\{VERSION_LABEL\} · Build \$\{BUILD_ID\}/);
  assert.match(releasePolish, /UPDATE_NOTICE_MS = 10000/);
});

test('Build-ID, PWA und neue Assets sind konsistent', () => {
  assert.equal(buildId, '20260809-32');
  assert.match(index, new RegExp(`dokohilf-build" content="${buildId}`));
  assert.match(index, new RegExp(`orientation-help-v29\\.js\\?v=${buildId}`));
  assert.match(index, new RegExp(`release-polish-v29\\.js\\?v=${buildId}`));
  assert.match(worker, new RegExp(`BUILD_ID = '${buildId}'`));
  assert.match(worker, /STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v29-2'/);
  assert.match(worker, /orientation-help-v29\.js\?v=20260809-32/);
  assert.match(worker, /release-polish-v29\.js\?v=20260809-32/);
  assert.doesNotMatch(worker, /LOCAL_VOICE_MODEL_CACHE/);
  assert.match(applyDetail, /20260809-static-supertonic-orientation-ui-v29-3/);
  assert.match(applyDetail, /durchfuehrungs-workflows-v29\.js/);
});

test('Release-Gate verbietet lokale Inferenz technisch', () => {
  assert.match(build, /On-Device-Spracherzeugung ist im Release verboten/);
  assert.match(build, /Supertone\/supertonic-3\/resolve\/main/);
  assert.match(build, /loadTextToSpeech\\|loadVoiceStyle\\|navigator\.gpu\\|localFallback/);
  assert.match(build, /Hey! Wobei brauchst du Hilfe/);
  assert.match(build, /216 statischen Supertonic-F1-WAVs/);
  assert.match(build, /Bedarfsmedikation/);
  assert.match(build, /Maßnahmen ohne Zeitangabe/);
});
