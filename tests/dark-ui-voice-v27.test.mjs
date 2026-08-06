import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../assets/dark-ui-v27.css', import.meta.url), 'utf8');
const experience = await readFile(new URL('../assets/experience-v27.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const worker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const version = JSON.parse(await readFile(new URL('../version.json', import.meta.url), 'utf8'));

test('Build 27 ist in HTML, Version und Service Worker vollständig ausgerichtet', () => {
  assert.equal(version.buildId, '20260806-27');
  assert.match(html, /dokohilf-build" content="20260806-27/);
  assert.match(html, /data-build-id="20260806-27"/);
  assert.match(html, /KI · v27/);
  assert.match(worker, /BUILD_ID = '20260806-27'/);
});

test('dunkles Theme wird nach den bisherigen Stilen geladen und gecached', () => {
  const v26Position = html.indexOf('premium-ui-v26.css?v=20260806-27');
  const v27Position = html.indexOf('dark-ui-v27.css?v=20260806-27');
  assert.ok(v26Position >= 0);
  assert.ok(v27Position > v26Position);
  assert.match(worker, /dark-ui-v27\.css\?v=20260806-27/);
  assert.match(css, /--v27-bg:#020b13/);
  assert.match(css, /color-scheme:dark/);
  assert.match(css, /html,body[\s\S]*background:var\(--v27-bg\)!important/);
  assert.match(html, /theme-color" content="#020b13"/);
  assert.match(html, /apple-mobile-web-app-status-bar-style" content="black-translucent"/);
});

test('Startseite nutzt dunkle Karten und bestätigte häufige Abläufe', () => {
  assert.match(css, /mode-card[\s\S]*background:linear-gradient/);
  assert.match(css, /examples[\s\S]*grid-template-columns:repeat\(3/);
  assert.match(experience, /Bericht anlegen/);
  assert.match(experience, /Visite anlegen/);
  assert.match(experience, /Vitalwerte erfassen/);
  assert.match(experience, /An-\/Abwesenheit/);
  assert.match(experience, /Medikation ansehen/);
  assert.match(experience, /Formular erstellen/);
});

test('Chat und Sprachmodus werden ebenfalls dunkel überschrieben', () => {
  assert.match(css, /\.bubble[\s\S]*background:linear-gradient/);
  assert.match(css, /\.composer[\s\S]*background:rgba\(8,27,36/);
  assert.match(css, /voice-focus-stage[\s\S]*linear-gradient\(180deg,#020b13/);
  assert.match(css, /voice-focus-instruction[\s\S]*background:linear-gradient/);
  assert.match(css, /data-voice-state="fallback"/);
});

test('kleine und niedrige iPhones erhalten eigene Layoutgrenzen', () => {
  assert.match(css, /@media\(max-width:680px\)/);
  assert.match(css, /@media\(max-width:390px\)/);
  assert.match(css, /@media\(max-height:720px\)/);
  assert.match(css, /width:118px!important/);
});

test('TTS blockiert die Oberfläche höchstens kurz und fällt sichtbar zurück', () => {
  assert.match(experience, /TTS_VISIBLE_WAIT_MS = 2400/);
  assert.match(experience, /Promise\.race/);
  assert.match(experience, /status: 504/);
  assert.match(experience, /Gerätestimme wird verwendet/);
  assert.match(experience, /data.*voiceEngine|voiceEngine/);
  assert.match(experience, /__DOKOHILF_VOICE_RECOVERY_V27__/);
  assert.match(html, /experience-v27\.js\?v=20260806-27/);
  assert.match(worker, /experience-v27\.js\?v=20260806-27/);
});

test('v27 speichert weder Gespräch noch Audio dauerhaft', () => {
  assert.doesNotMatch(experience, /localStorage|indexedDB|caches\.open/);
});
