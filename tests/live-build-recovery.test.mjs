import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, worker, version, router, experience, diagnostics, premiumCss25, premiumCss26, premiumCss27, handoff, confirmed] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../assets/experience-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-diagnostics.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/premium-ui-v25.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/premium-ui-v26.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/premium-ui-v27.css', import.meta.url), 'utf8'),
  readFile(new URL('../PROJECT_HANDOFF.md', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
]);

test('Build 27 ist in HTML, Versionsdatei und Service Worker identisch', () => {
  assert.match(html, /dokohilf-build" content="20260806-27/);
  assert.equal(JSON.parse(version).buildId, '20260806-27');
  assert.match(worker, /BUILD_ID = '20260806-27'/);
});

test('die App leitet KI-Anfragen schon vor dem Hauptskript direkt an den bestätigten Router', () => {
  assert.match(html, /__DOKOHILF_DIRECT_ROUTER_V27__/);
  assert.match(html, /dokohilf-ai-router/);
  assert.match(html, /routedInput/);
});

test('iPhone-PWA kann alte Service Worker und DokoHilf-Caches selbst entfernen', () => {
  assert.match(html, /getRegistrations\(\)/);
  assert.match(html, /registration\.unregister/);
  assert.match(html, /name\.startsWith\('dokohilf-'\)/);
  assert.match(worker, /CLEAR_DOKOHILF_CACHES/);
  assert.match(worker, /navigationPreload\.enable/);
  assert.match(worker, /AUDIO_CACHE_NAME/);
});

test('Build 27 lädt Premium-Basisschichten und das dunkle Sprachlayout gemeinsam', () => {
  assert.match(html, /KI · v27/);
  assert.match(html, /premium-ui-v25\.css\?v=20260806-27/);
  assert.match(html, /premium-ui-v26\.css\?v=20260806-27/);
  assert.match(html, /premium-ui-v27\.css\?v=20260806-27/);
  assert.match(html, /experience-v27\.js\?v=20260806-27/);
  assert.match(premiumCss25, /--dh-deep/);
  assert.match(premiumCss26, /grid-template-rows:minmax\(92px,auto\) minmax\(0,1fr\)/);
  assert.match(premiumCss26, /voice-copy strong:after\{content:none/);
  assert.match(premiumCss27, /--v27-bg:#020c12/);
  assert.doesNotMatch(html, /notfallblattButton/);
});

test('Sprachbegrüßung und freie Antworten bleiben flüchtig, freigegebene Guide-Audios eng begrenzt', () => {
  assert.match(experience, /warmGreeting/);
  assert.match(experience, /nextSpokenText/);
  assert.match(experience, /const memory = new Map/);
  assert.match(experience, /loadPrebuiltVoice/);
  assert.doesNotMatch(experience, /localStorage|indexedDB|caches\.open/);
  assert.match(diagnostics, /dokohilf-approved-guide-audio-20260806-27/);
  assert.match(diagnostics, /GUIDE_AUDIO_ENDPOINT/);
  assert.doesNotMatch(diagnostics, /localStorage|indexedDB/);
});

test('Router v9 hält Ziele, erkennt neue Ziele und schützt Medikation', () => {
  assert.match(router, /conversational-guide-router-v9/);
  assert.match(router, /explicitGuideRoute/);
  assert.match(router, /isMedicationChangeRequest/);
  assert.match(router, /medication-view-only-safety-v9/);
  assert.match(router, /nextSpokenText/);
  assert.match(router, /Vitalwerte Sammelerf\./);
});

test('dauerhafte Übergabe verweist auf bestätigte anonymisierte Abläufe und den aktuellen Sprachstand', () => {
  assert.match(handoff, /Jeder neue Chat liest zuerst vollständig/);
  assert.match(handoff, /dokohilf-tts` \*\*v21\*\*/);
  assert.match(handoff, /dokohilf-guide-audio-build` \*\*v3\*\*/);
  assert.match(handoff, /raw-steps-content-v1/);
  assert.match(handoff, /privaten (?:Supabase-)?Bucket/);
  assert.match(handoff, /1,2 Sekunden/);
  assert.match(confirmed, /Bilder bleiben ausschließlich im Chat/);
  assert.match(confirmed, /Klienten auswählen/);
  assert.match(confirmed, /Bis leer lassen und niemals schätzen/);
});
