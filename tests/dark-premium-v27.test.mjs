import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [index, css, uxCss, experience, diagnostics, ux, app, serviceWorker, version, tts, migration] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('assets/premium-ui-v27.css', 'utf8'),
  readFile('assets/ux-v27.css', 'utf8'),
  readFile('assets/experience-v27.js', 'utf8'),
  readFile('assets/voice-diagnostics.js', 'utf8'),
  readFile('assets/ux-v27.js', 'utf8'),
  readFile('assets/app.js', 'utf8'),
  readFile('service-worker.js', 'utf8'),
  readFile('version.json', 'utf8'),
  readFile('supabase/functions/dokohilf-tts/index.ts', 'utf8'),
  readFile('supabase/migrations/20260806173000_remove_repeated_exercise_notices.sql', 'utf8'),
]);

test('build 27 assets are wired consistently', () => {
  assert.match(index, /dokohilf-build" content="20260806-27/);
  assert.match(index, /premium-ui-v27\.css\?v=20260806-27/);
  assert.match(index, /ux-v27\.css\?v=20260806-27/);
  assert.match(index, /experience-v27\.js\?v=20260806-27/);
  assert.match(index, /ux-v27\.js\?v=20260806-27/);
  assert.match(index, /KI · v27/);
  assert.match(serviceWorker, /BUILD_ID = '20260806-27'/);
  assert.match(serviceWorker, /premium-ui-v27\.css\?v=20260806-27/);
  assert.match(serviceWorker, /ux-v27\.css\?v=20260806-27/);
  assert.match(serviceWorker, /experience-v27\.js\?v=20260806-27/);
  assert.match(serviceWorker, /ux-v27\.js\?v=20260806-27/);
  assert.equal(JSON.parse(version).buildId, '20260806-27');
});

test('dark premium home and workflow shortcuts are present', () => {
  assert.match(css, /--v27-bg:#020c12/);
  assert.match(css, /color-scheme:dark/);
  assert.match(css, /\.examples\{display:grid/);
  assert.match(index, /Wobei brauchst du Hilfe\?|Was möchtest du erledigen\?/);
  assert.match(index, /Häufige Abläufe/);
  assert.match(index, /Bericht anlegen/);
  assert.match(index, /Visite anlegen/);
  assert.match(index, /Medikation ansehen/);
  assert.doesNotMatch(index, /Fantasiedaten/);
});

test('chat controls are compact and command bubbles stay hidden', () => {
  assert.match(uxCss, /guide-progress-menu/);
  assert.match(uxCss, /command-message-hidden/);
  assert.match(uxCss, /data-command="nochmal"/);
  assert.match(ux, /compactGuideMenu/);
  assert.match(ux, /commands = new Set/);
  assert.match(ux, /Ich brauche Hilfe/);
});

test('mobile synchronization is idempotent and cannot feed its own mutation observer', () => {
  assert.match(ux, /function setTextIfChanged/);
  assert.match(ux, /node\.textContent === value/);
  assert.match(ux, /let syncScheduled = false/);
  assert.match(ux, /function scheduleSync/);
  assert.match(ux, /requestAnimationFrame\(\(\) =>/);
  assert.match(ux, /new MutationObserver\(scheduleSync\)/);
  assert.doesNotMatch(ux, /new MutationObserver\(sync\)/);
  assert.match(ux, /__DOKOHILF_IDEMPOTENT_SYNC_V27__/);
});

test('voice starts quickly, uses static audio first and keeps idle microphone compact', () => {
  assert.match(experience, /FAST_FALLBACK_MS = 2400/);
  assert.match(experience, /loadPrebuiltVoice/);
  assert.match(experience, /fastRace\(loadNaturalVoice/);
  assert.match(experience, /payload\.nextSpokenText/);
  assert.match(experience, /memory = new Map/);
  assert.match(experience, /__DOKOHILF_DARK_PREMIUM_V27__/);
  assert.match(experience, /__DOKOHILF_PREBUILT_GUIDE_AUDIO_V1__/);
  assert.match(diagnostics, /dokohilf-guide-audio/);
  assert.match(diagnostics, /manifest=1&build=20260806-27/);
  assert.match(diagnostics, /fetchCachedGuideAudio/);
  assert.match(ux, /HARD_FALLBACK_MS = 180/);
  assert.match(ux, /dokohilf_immediate_voice_fallback/);
  assert.match(ux, /installSpeechSynthesisWatchdog/);
  assert.match(uxCss, /data-voice-state="listening"/);
  assert.match(uxCss, /width:92px!important/);
});

test('cloud voice uses raw Gemini Interactions REST audio, Gacrux and transient memory', () => {
  assert.match(tts, /VOICE_NAME = 'Gacrux'/);
  assert.match(tts, /VOICE_STYLE = 'natural-spoken-german-colleague-v10-rest-audio'/);
  assert.match(tts, /PRIMARY_MODEL = 'gemini-3\.1-flash-tts-preview'/);
  assert.match(tts, /FALLBACK_MODEL = 'gemini-2\.5-flash-preview-tts'/);
  assert.match(tts, /INTERACTIONS_API_REVISION = '2026-05-20'/);
  assert.match(tts, /INTERACTIONS_AUDIO_PARSER = 'raw-steps-content-v1'/);
  assert.match(tts, /v1beta\/interactions/);
  assert.match(tts, /response_format: \{ type: 'audio' \}/);
  assert.match(tts, /root\.steps/);
  assert.match(tts, /step\.content/);
  assert.match(tts, /X-DokoHilf-TTS-API/);
  assert.match(tts, /X-DokoHilf-TTS-Parser/);
  assert.match(tts, /pendingAudio/);
  assert.match(tts, /CACHE_TTL_MS = 2 \* 60 \* 60_000/);
  assert.match(tts, /TRANSKRIPT:/);
});

test('central privacy acknowledgement replaces repeated exercise notices without weakening filter', () => {
  assert.match(migration, /privacy remains enforced centrally/i);
  assert.match(migration, /regexp_replace/);
  assert.match(migration, /steps::text ~\*/);
  assert.match(migration, /Fantasiedaten/);
  assert.match(migration, /raise exception 'Approved guide steps still contain repeated Fantasiedaten notices\.'/);
  assert.match(index, /Datenschutz aktiv|Keine persönlichen Daten eingeben/);
  assert.match(ux, /Kurz zum Datenschutz/);
  assert.match(ux, /PRIVACY_ACK_KEY = 'dokohilf-privacy-ack-v1'/);
  assert.match(ux, /Gespräch und persönliche Audioinhalte werden nicht gespeichert/);
  assert.match(app, /function clientPrivacyGuard/);
  assert.match(app, /BLOCK_MESSAGE/);
});
