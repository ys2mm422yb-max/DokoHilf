import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, worker, version, router, experience, premiumCss, handoff] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../assets/experience-v25.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/premium-ui-v25.css', import.meta.url), 'utf8'),
  readFile(new URL('../PROJECT_HANDOFF.md', import.meta.url), 'utf8'),
]);

test('Build 25 ist in HTML, Versionsdatei und Service Worker identisch', () => {
  assert.match(html, /dokohilf-build" content="20260806-25/);
  assert.equal(JSON.parse(version).buildId, '20260806-25');
  assert.match(worker, /BUILD_ID = '20260806-25'/);
});

test('die App leitet KI-Anfragen schon vor dem Hauptskript direkt an den Router', () => {
  assert.match(html, /__DOKOHILF_DIRECT_ROUTER_V25__/);
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

test('der neue Stand ist sichtbar, hochwertig und ohne alten roten Kurzweg', () => {
  assert.match(html, /KI · v25/);
  assert.match(html, /premium-ui-v25\.css/);
  assert.match(html, /experience-v25\.js/);
  assert.match(html, /Wobei brauchst du Hilfe\?/);
  assert.match(premiumCss, /--dh-deep/);
  assert.match(premiumCss, /voice-focus-stage/);
  assert.match(premiumCss, /composer-wrap/);
  assert.doesNotMatch(html, /notfallblattButton/);
});

test('Sprachbegrüßung wird nur flüchtig im Arbeitsspeicher vorbereitet', () => {
  assert.match(experience, /warmGreeting/);
  assert.match(experience, /const memory = new Map/);
  assert.match(experience, /requestIdleCallback/);
  assert.doesNotMatch(experience, /localStorage|indexedDB|caches\.open/);
});

test('die Formulierung aus dem Screenshot wird als Vitalwerte-Erfassung erkannt', () => {
  assert.match(router, /eingeben\|eintragen\|erfassen\|anlegen/);
  assert.match(router, /vital-entry-mode-choice/);
  assert.match(router, /Du möchtest Vitalwerte eingeben\. Geht es um einen einzelnen Wert oder um mehrere Werte gleichzeitig\?/);
});

test('dauerhafte Übergabe enthält Startprotokoll und bestätigte Kernabläufe', () => {
  assert.match(handoff, /Jeder neue Chat liest zuerst vollständig/);
  assert.match(handoff, /Vitalwerte – Sammelerfassung/);
  assert.match(handoff, /Visite dokumentieren/);
  assert.match(handoff, /gh-pages/);
});
