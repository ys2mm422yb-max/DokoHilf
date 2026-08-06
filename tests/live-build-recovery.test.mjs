import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, worker, version, router, experience, premiumCss25, premiumCss26, handoff, confirmed] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../assets/experience-v26.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/premium-ui-v25.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/premium-ui-v26.css', import.meta.url), 'utf8'),
  readFile(new URL('../PROJECT_HANDOFF.md', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
]);

test('Build 26 ist in HTML, Versionsdatei und Service Worker identisch', () => {
  assert.match(html, /dokohilf-build" content="20260806-26/);
  assert.equal(JSON.parse(version).buildId, '20260806-26');
  assert.match(worker, /BUILD_ID = '20260806-26'/);
});

test('die App leitet KI-Anfragen schon vor dem Hauptskript direkt an Router v26', () => {
  assert.match(html, /__DOKOHILF_DIRECT_ROUTER_V26__/);
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

test('Build 26 lädt Premium-Grunddesign und fehlerfreies Sprachlayout', () => {
  assert.match(html, /KI · v26/);
  assert.match(html, /premium-ui-v25\.css/);
  assert.match(html, /premium-ui-v26\.css/);
  assert.match(html, /experience-v26\.js/);
  assert.match(premiumCss25, /--dh-deep/);
  assert.match(premiumCss26, /grid-template-rows:minmax\(92px,auto\) minmax\(0,1fr\)/);
  assert.match(premiumCss26, /voice-copy strong:after\{content:none/);
  assert.doesNotMatch(html, /notfallblattButton/);
});

test('Sprachbegrüßung und nächste Schritte werden nur flüchtig vorbereitet', () => {
  assert.match(experience, /warmGreeting/);
  assert.match(experience, /nextSpokenText/);
  assert.match(experience, /const memory = new Map/);
  assert.match(experience, /requestIdleCallback/);
  assert.doesNotMatch(experience, /localStorage|indexedDB|caches\.open/);
});

test('Router v9 hält Ziele, erkennt neue Ziele und schützt Medikation', () => {
  assert.match(router, /conversational-guide-router-v9/);
  assert.match(router, /explicitGuideRoute/);
  assert.match(router, /isMedicationChangeRequest/);
  assert.match(router, /medication-view-only-safety-v9/);
  assert.match(router, /nextSpokenText/);
  assert.match(router, /Vitalwerte Sammelerf\./);
});

test('dauerhafte Übergabe verweist auf bestätigte anonymisierte Abläufe', () => {
  assert.match(handoff, /Jeder neue Chat liest zuerst vollständig/);
  assert.match(confirmed, /Bilder bleiben ausschließlich im Chat/);
  assert.match(confirmed, /Klienten auswählen/);
  assert.match(confirmed, /Bis leer lassen und niemals schätzen/);
});
