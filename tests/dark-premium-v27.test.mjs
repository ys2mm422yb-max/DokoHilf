import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [index, css, uxCss, experience, diagnostics, localVoice, localGate, ux, app, serviceWorker, version, tts, migration] = await Promise.all([
  readFile('index.html', 'utf8'), readFile('assets/premium-ui-v27.css', 'utf8'), readFile('assets/ux-v27.css', 'utf8'),
  readFile('assets/experience-v27.js', 'utf8'), readFile('assets/voice-diagnostics.js', 'utf8'), readFile('assets/local-voice-v28.js', 'utf8'),
  readFile('assets/local-voice-gate-v28.js', 'utf8'), readFile('assets/ux-v27.js', 'utf8'), readFile('assets/app.js', 'utf8'),
  readFile('service-worker.js', 'utf8'), readFile('version.json', 'utf8'), readFile('supabase/functions/dokohilf-tts/index.ts', 'utf8'),
  readFile('supabase/migrations/20260806173000_remove_repeated_exercise_notices.sql', 'utf8'),
]);

test('v29 assets are wired consistently', () => {
  assert.match(index, /dokohilf-build" content="20260808-29/);
  assert.match(index, /premium-ui-v27\.css\?v=20260808-29/);
  assert.match(index, /ux-v27\.css\?v=20260808-29/);
  assert.match(index, /local-voice-v28\.js\?v=20260808-29/);
  assert.match(index, /local-voice-gate-v28\.js\?v=20260808-29/);
  assert.match(index, /KI · v29/);
  assert.match(serviceWorker, /BUILD_ID = '20260808-29'/);
  assert.match(serviceWorker, /local-voice-v28\.js\?v=20260808-29/);
  assert.match(serviceWorker, /local-voice-gate-v28\.js\?v=20260808-29/);
  assert.equal(JSON.parse(version).buildId, '20260808-29');
});

test('dark premium home and workflow shortcuts are present', () => {
  assert.match(css, /--v27-bg:#020c12/); assert.match(css, /color-scheme:dark/); assert.match(css, /\.examples\{display:grid/);
  assert.match(index, /Wobei brauchst du Hilfe\?|Was möchtest du erledigen\?/); assert.match(index, /Häufige Abläufe/);
  assert.match(index, /Bericht anlegen/); assert.match(index, /Visite anlegen/); assert.match(index, /Medikation ansehen/); assert.doesNotMatch(index, /Fantasiedaten/);
});

test('chat controls are compact and command bubbles stay hidden', () => {
  assert.match(uxCss, /guide-progress-menu/); assert.match(uxCss, /command-message-hidden/); assert.match(uxCss, /data-command="nochmal"/);
  assert.match(ux, /compactGuideMenu/); assert.match(ux, /commands = new Set/); assert.match(ux, /Ich brauche Hilfe/);
});

test('mobile synchronization is idempotent and cannot feed its own mutation observer', () => {
  assert.match(ux, /function setTextIfChanged/); assert.match(ux, /node\.textContent === value/); assert.match(ux, /let syncScheduled = false/);
  assert.match(ux, /function scheduleSync/); assert.match(ux, /requestAnimationFrame\(\(\) =>/); assert.match(ux, /new MutationObserver\(scheduleSync\)/);
  assert.doesNotMatch(ux, /new MutationObserver\(sync\)/); assert.match(ux, /__DOKOHILF_IDEMPOTENT_SYNC_V27__/);
});

test('published v29 voice is Supertonic-F1 static-first while old cloud/device paths stay inactive compatibility code', () => {
  assert.match(localVoice, /Supertone\/supertonic-3/); assert.match(localVoice, /const LANGUAGE = 'de'/);
  assert.match(localVoice, /if \(!isIOS\(\) && navigator\.gpu\)/); assert.match(localVoice, /loaded = await load\('wasm'\)/);
  assert.match(localGate, /DokoHilfLocalVoiceV28\.synthesize/); assert.match(localGate, /blockSystemSpeech/);
  assert.match(localGate, /dokohilf-static-supertonic-audio-v29-1/); assert.match(localGate, /IOS_LOCAL_TIMEOUT_MS = 8000/);
  assert.match(ux, /if \(localVoiceV28\(\)\) return previousFetch\(input, init\)/); assert.match(ux, /__DOKOHILF_LOCAL_VOICE_ONLY_V28__/);
  assert.match(app, /function speakWithSystemVoice/);
  assert.match(experience, /FAST_FALLBACK_MS = 2400/);
  assert.match(diagnostics, /dokohilf-guide-audio/);
  assert.match(uxCss, /data-voice-state="listening"/); assert.match(uxCss, /width:92px!important/);
  assert.doesNotMatch(serviceWorker, /dokohilf-guide-audio\?manifest=/);
});

test('server cloud voice is a permanent non-generating retirement endpoint', () => {
  assert.match(tts, /cloud_tts_retired_v28/); assert.match(tts, /status: 410/);
  assert.match(tts, /retired-cloud-tts-v28/);
  assert.doesNotMatch(tts, /Gacrux|gemini|generativelanguage|GEMINI_API_KEY|fetch\(/i);
});

test('central privacy acknowledgement replaces repeated exercise notices without weakening filter', () => {
  assert.match(migration, /privacy remains enforced centrally/i); assert.match(migration, /regexp_replace/); assert.match(migration, /steps::text ~\*/);
  assert.match(migration, /Fantasiedaten/); assert.match(migration, /raise exception 'Approved guide steps still contain repeated Fantasiedaten notices\.'/);
  assert.match(index, /Datenschutz aktiv|Keine persönlichen Daten eingeben/); assert.match(ux, /Kurz zum Datenschutz/);
  assert.match(ux, /PRIVACY_ACK_KEY = 'dokohilf-privacy-ack-v1'/); assert.match(ux, /Gespräch und persönliche Audioinhalte werden nicht gespeichert/);
  assert.match(app, /function clientPrivacyGuard/); assert.match(app, /BLOCK_MESSAGE/);
});
