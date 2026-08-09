import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [
  runtime, gate, contextHotfix, orientation, releasePolish, durchfuehrungWorkflows,
  applyLocal, applyDetail, build, builder, sourceCatalogText, extrasText, releaseText,
  workflowText, uiSpeechText, navigationText, contextSpeechText, chatRouter, version, index, worker,
] = await Promise.all([
  read('assets/local-voice-v28.js'),
  read('assets/local-voice-gate-v28.js'),
  read('assets/context-voice-hotfix-v28.js'),
  read('assets/orientation-help-v29.js'),
  read('assets/release-polish-v29.js'),
  read('assets/durchfuehrungs-workflows-v29.js'),
  read('scripts/apply-local-voice-v28.mjs'),
  read('scripts/apply-detail-help-v27.mjs'),
  read('scripts/build-static-site-v27.sh'),
  read('scripts/build-supertonic-guide-audio-v28.py'),
  read('assets/guide-audio-catalog.json'),
  read('assets/voice-extra-catalog-v28.json'),
  read('assets/voice-release-catalog-v29.json'),
  read('assets/voice-durchfuehrung-catalog-v29.json'),
  read('assets/voice-ui-catalog-v29.json'),
  read('assets/voice-navigation-catalog-v29.json'),
  read('assets/voice-context-help-catalog-v29.json'),
  read('supabase/functions/dokohilf-chat-router/index.ts'),
  read('version.json'),
  read('index.html'),
  read('service-worker.js'),
]);

const catalogs = {
  base: JSON.parse(sourceCatalogText),
  extra: JSON.parse(extrasText),
  release: JSON.parse(releaseText),
  workflow: JSON.parse(workflowText),
  ui: JSON.parse(uiSpeechText),
  navigation: JSON.parse(navigationText),
  context: JSON.parse(contextSpeechText),
};
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

test('GitHub-Build leitet die Gesamtzahl aus allen kontrollierten Sprachkatalogen ab', () => {
  assert.match(builder, /from supertonic import TTS/);
  assert.match(builder, /TTS\(auto_download=True\)/);
  assert.match(builder, /lang='de'/);
  assert.match(builder, /EXPECTED_SOURCE_COUNTS/);
  assert.match(builder, /'base': 93/);
  assert.match(builder, /'extra': 33/);
  assert.match(builder, /'release': 49/);
  assert.match(builder, /'workflow': 39/);
  assert.match(builder, /'ui': 1/);
  assert.match(builder, /'navigation': 17/);
  assert.match(builder, /'context': 10/);
  assert.match(builder, /static_speech_count = len\(entries\)/);
  assert.doesNotMatch(builder, /STATIC_SPEECH_COUNT\s*=/);

  assert.equal(catalogs.base.entries.length, 93);
  assert.equal(catalogs.extra.entries.length, 33);
  assert.equal(catalogs.release.entries.length, 49);
  assert.equal(catalogs.workflow.entries.length, 39);
  assert.equal(catalogs.ui.entries.length, 1);
  assert.equal(catalogs.navigation.entries.length, 17);
  assert.equal(catalogs.context.entries.length, 10);

  assert.match(uiSpeechText, /Hey! Wobei brauchst du Hilfe\?/);
  assert.match(extrasText, /Ich habe die Antwort im Chat angezeigt/);
  assert.match(workflowText, /Bedarfsmedikation/);
  assert.match(workflowText, /Wirksamkeitskontrolle/);
  assert.match(workflowText, /Maßnahmen ohne Zeitangabe/);
  assert.match(navigationText, /festen grünen Leiste/);
  assert.match(contextSpeechText, /Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole/);
  assert.match(build, /wav_count.*expected_count/s);
  assert.match(build, /summary_count.*expected_count/s);
  assert.match(build, /sourceCounts/);
  assert.doesNotMatch(build, /exakt 233|expected_count" != 233/);
});

test('Sprachstart wird kurz und der veröffentlichte Katalog verwendet denselben Schlüssel', () => {
  assert.match(applyLocal, /const newGreeting = 'Hey! Wobei brauchst du Hilfe\?'/);
  assert.match(applyLocal, /const oldGreeting = 'Hallo! Sag mir einfach/);
  assert.match(uiSpeechText, /Hey! Wobei brauchst du Hilfe\?/);
  assert.match(build, /Hey! Wobei brauchst du Hilfe/);
  assert.match(builder, /def canonical_catalog_text\(value: str\)/);
  assert.match(builder, /if text == LONG_VOICE_GREETING:\s+return SHORT_VOICE_GREETING/s);
  assert.match(builder, /text = canonical_catalog_text\(raw\.get\('text', ''\)\)/);
  assert.match(builder, /SHORT_VOICE_GREETING not in published_texts/);
  assert.match(builder, /LONG_VOICE_GREETING in published_texts/);
  assert.match(builder, /legacy long voice greeting must not remain a published static catalog key/);
});

test('Kontext-Hilfe spricht nur den statisch katalogisierten Basissatz', () => {
  assert.match(chatRouter, /const visibleInstruction = extra \? `\$\{instruction\} \$\{extra\}`\.trim\(\) : instruction/);
  assert.match(chatRouter, /reply: `\$\{visibleInstruction\}/);
  assert.match(chatRouter, /spokenText: instruction/);
  assert.match(chatRouter, /approved-guide-context-help-v29-5/);
  assert.doesNotMatch(chatRouter, /spokenText: visibleInstruction/);
});

test('Orientierung erklärt grüne Hauptleiste und zweite Ebene', () => {
  assert.match(orientation, /festen grünen Leiste/);
  assert.match(orientation, /Planung und Analyse/);
  assert.match(orientation, /Unterpunkte beziehungsweise Symbole/);
  assert.match(orientation, /Doku-Erweitert.*Vitalwerte/s);
  assert.match(orientation, /Doku-Erweitert.*Visiten/s);
  assert.match(orientation, /Doku-Erweitert.*Medikation/s);
  assert.match(orientation, /Doku-Erweitert.*Formulare/s);
  assert.match(orientation, /Doku-Erweitert.*An-\/Abwesenheiten/s);
  assert.match(orientation, /Doku.*Durchführungsnachweis/s);
  assert.match(orientation, /Analyse.*Was war los/s);
  assert.match(orientation, /Bedarfsmedikation/);
  assert.match(orientation, /Wirksamkeitskontrolle/);
  assert.match(orientation, /Maßnahmen ohne Zeitangabe/);
  assert.match(orientation, /__DOKOHILF_ORIENTATION_HELP_V29__/);
});

test('Unbestätigte Detailwege werden weiterhin nicht erfunden', () => {
  assert.doesNotMatch(orientation, /Aufgaben · Aktuelles|Berichtssuche/);
  assert.match(orientation, /Der genaue Easy-Plan-Ablauf bleibt vorerst offen/);
});

test('Neue Durchführung-Workflows sind als direkte Guides vorhanden', () => {
  assert.match(durchfuehrungWorkflows, /bedarfsmedikation-gabe/);
  assert.match(durchfuehrungWorkflows, /bedarfsmedikation-wirksamkeitskontrolle/);
  assert.match(durchfuehrungWorkflows, /massnahmen-ohne-zeitangabe/);
  assert.match(durchfuehrungWorkflows, /festen grünen Leiste/);
  assert.match(durchfuehrungWorkflows, /kleinen Pfeil links daneben/);
  assert.match(durchfuehrungWorkflows, /rechts im kleinen Kästchen/);
  assert.match(durchfuehrungWorkflows, /Verordnung selbst nicht verändern/);
  assert.match(durchfuehrungWorkflows, /automatisch.*Wirksamkeitskontrolle/s);
  assert.match(durchfuehrungWorkflows, /„Was war“/);
  assert.match(durchfuehrungWorkflows, /unten mit „OK“ bestätigen/);
  assert.match(durchfuehrungWorkflows, /insertBefore\(card, firstLater\)/);
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
  assert.doesNotMatch(worker, /LOCAL_VOICE_MODEL_CACHE/);
  assert.match(applyDetail, /20260809-static-supertonic-orientation-ui-v29-3/);
  assert.match(applyDetail, /durchfuehrungs-workflows-v29\.js/);
});

test('Release-Gate verbietet lokale Inferenz technisch', () => {
  assert.match(build, /On-Device-Spracherzeugung ist im Release verboten/);
  assert.match(build, /Supertone\/supertonic-3\/resolve\/main/);
  assert.match(build, /loadTextToSpeech\\|loadVoiceStyle\\|navigator\.gpu\\|localFallback/);
  assert.match(build, /vollständig katalogisierten statischen Supertonic-F1-WAVs/);
  assert.match(build, /Bedarfsmedikation/);
  assert.match(build, /Maßnahmen ohne Zeitangabe/);
});
