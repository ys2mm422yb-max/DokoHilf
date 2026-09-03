import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [versionRaw, indexHtml, updateManager, serviceWorker] = await Promise.all([
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../assets/update-manager.js', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
]);

const { buildId } = JSON.parse(versionRaw);
const previousBuildId = '20260812-41';

function buildNumber(value) {
  const match = String(value).match(/^(\d{8})-(\d+)$/);
  if (!match) return null;
  return Number(`${match[1]}${match[2].padStart(4, '0')}`);
}

test('aktueller Build ist neuer als der vorherige veröffentlichte Build', () => {
  assert.ok(buildNumber(buildId) > buildNumber(previousBuildId));
});

test('HTML, Versionsquelle und Service Worker verwenden denselben Build', () => {
  assert.match(indexHtml, new RegExp(`dokohilf-build" content="${buildId}`));
  assert.match(indexHtml, new RegExp(`app\\.js\\?v=${buildId}`));
  assert.match(serviceWorker, new RegExp(`BUILD_ID = '${buildId}'`));
  assert.match(serviceWorker, /PROGRESSIVE_NAVIGATION_REVISION = '20260903-progressive-navigation-v68-1'/);
  assert.match(serviceWorker, /progressive-navigation-v68/);
  assert.match(serviceWorker, /progressiveNavigationRevision: PROGRESSIVE_NAVIGATION_REVISION/g);
});

test('alte DokoHilf-Caches werden beim Aktivieren entfernt', () => {
  assert.match(serviceWorker, /key\.startsWith\('dokohilf-'\) && key !== CACHE_NAME/);
  assert.match(serviceWorker, /\.map\(key => caches\.delete\(key\)\)/);
  assert.match(serviceWorker, /clients\.claim/);
});

test('installierte PWA erkennt den Versionswechsel und lädt nur einmal neu', () => {
  assert.match(updateManager, /version\.json/);
  assert.match(updateManager, /cache: 'no-store'/);
  assert.match(updateManager, /controllerchange/);
  assert.match(updateManager, /RELOAD_KEY/);
  assert.match(updateManager, /sessionStorage\.getItem\(RELOAD_KEY\)/);
  assert.match(updateManager, /window\.location\.reload/);
});

test('Build 24 besitzt zusätzlich einen selbstheilenden iPhone-PWA-Reset', () => {
  assert.match(indexHtml, /getRegistrations\(\)/);
  assert.match(indexHtml, /registration\.unregister/);
  assert.match(indexHtml, /name\.startsWith\('dokohilf-'\)/);
  assert.match(indexHtml, /DokoHilfHardRefresh/);
  assert.match(serviceWorker, /CLEAR_DOKOHILF_CACHES/);
  assert.match(serviceWorker, /navigationPreload\.enable/);
});

test('Updateprüfung läuft bei App-Start und Rückkehr aus dem Hintergrund', () => {
  assert.match(updateManager, /registerUpdateWorker/);
  assert.match(updateManager, /pageshow/);
  assert.match(updateManager, /visibilitychange/);
  assert.match(updateManager, /setInterval/);
});
