import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, worker, version, router] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url), 'utf8'),
]);

test('Build 24 ist in HTML, Versionsdatei und Service Worker identisch', () => {
  assert.match(html, /dokohilf-build" content="20260806-24/);
  assert.equal(JSON.parse(version).buildId, '20260806-24');
  assert.match(worker, /BUILD_ID = '20260806-24'/);
});

test('die App leitet KI-Anfragen schon vor dem Hauptskript direkt an den Router', () => {
  assert.match(html, /__DOKOHILF_DIRECT_ROUTER_V24__/);
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

test('der neue Stand ist sichtbar und entfernt den alten roten Kurzweg', () => {
  assert.match(html, /KI · v24/);
  assert.match(html, /dokohilfVisualRefreshV24/);
  assert.match(html, /#notfallblattButton/);
  assert.match(html, /display:none!important/);
});

test('die Formulierung aus dem Screenshot wird als Vitalwerte-Erfassung erkannt', () => {
  assert.match(router, /eingeben\|eintragen\|erfassen\|anlegen/);
  assert.match(router, /vital-entry-mode-choice/);
  assert.match(router, /Du möchtest Vitalwerte eingeben\. Geht es um einen einzelnen Wert oder um mehrere Werte gleichzeitig\?/);
});
