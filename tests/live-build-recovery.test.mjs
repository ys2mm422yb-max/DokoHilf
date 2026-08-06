import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, worker, version, router, experience26, experience27, premiumCss25, premiumCss26, darkCss27, handoff, confirmed, activeWork] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../assets/experience-v26.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/experience-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/premium-ui-v25.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/premium-ui-v26.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/dark-ui-v27.css', import.meta.url), 'utf8'),
  readFile(new URL('../PROJECT_HANDOFF.md', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
  readFile(new URL('../ACTIVE_WORK.md', import.meta.url), 'utf8'),
]);

test('Build 27 ist in HTML, Versionsdatei und Service Worker identisch', () => {
  assert.match(html, /dokohilf-build" content="20260806-27/);
  assert.equal(JSON.parse(version).buildId, '20260806-27');
  assert.match(worker, /BUILD_ID = '20260806-27'/);
});

test('die App leitet KI-Anfragen schon vor dem Hauptskript direkt an Router v27', () => {
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
});

test('Build 27 lädt dunkles Design nach den bewährten v25/v26-Grundlagen', () => {
  assert.match(html, /KI · v27/);
  assert.match(html, /premium-ui-v25\.css\?v=20260806-27/);
  assert.match(html, /premium-ui-v26\.css\?v=20260806-27/);
  assert.match(html, /dark-ui-v27\.css\?v=20260806-27/);
  assert.match(html, /experience-v26\.js\?v=20260806-27/);
  assert.match(html, /experience-v27\.js\?v=20260806-27/);
  assert.match(premiumCss25, /--dh-deep/);
  assert.match(premiumCss26, /grid-template-rows:minmax\(92px,auto\) minmax\(0,1fr\)/);
  assert.match(darkCss27, /--v27-bg:#020b13/);
  assert.match(darkCss27, /color-scheme:dark/);
  assert.doesNotMatch(html, /notfallblattButton/);
});

test('Sprachbegrüßung bleibt flüchtig und v27 begrenzt den sichtbaren TTS-Wartezustand', () => {
  assert.match(experience26, /warmGreeting/);
  assert.match(experience26, /nextSpokenText/);
  assert.match(experience26, /const memory = new Map/);
  assert.match(experience26, /requestIdleCallback/);
  assert.doesNotMatch(experience26, /localStorage|indexedDB|caches\.open/);
  assert.match(experience27, /TTS_VISIBLE_WAIT_MS = 2400/);
  assert.match(experience27, /Gerätestimme wird verwendet/);
  assert.doesNotMatch(experience27, /localStorage|indexedDB|caches\.open/);
});

test('Router v9 hält Ziele, erkennt neue Ziele und schützt Medikation', () => {
  assert.match(router, /conversational-guide-router-v9/);
  assert.match(router, /explicitGuideRoute/);
  assert.match(router, /isMedicationChangeRequest/);
  assert.match(router, /medication-view-only-safety-v9/);
  assert.match(router, /nextSpokenText/);
  assert.match(router, /Vitalwerte Sammelerf\./);
});

test('dauerhafte Übergabe und aktiver Arbeitsstand verweisen auf bestätigte anonymisierte Abläufe', () => {
  assert.match(handoff, /Jeder neue Chat liest zuerst vollständig/);
  assert.match(activeWork, /tatsächlicher Live-Stand/i);
  assert.match(activeWork, /CONFIRMED_WORKFLOWS\.md/);
  assert.match(confirmed, /Bilder bleiben ausschließlich im Chat/);
  assert.match(confirmed, /Klienten auswählen/);
  assert.match(confirmed, /Bis leer lassen und niemals schätzen/);
});
