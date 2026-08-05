import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [versionRaw, indexHtml, updateManager, serviceWorker] = await Promise.all([
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../assets/update-manager.js', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
]);

const version = JSON.parse(versionRaw);
const buildId = version.buildId;

test('Build-ID ist in allen Update-Komponenten konsistent', () => {
  assert.match(buildId, /^\d{8}-\d+$/);
  assert.match(indexHtml, new RegExp(`dokohilf-build" content="${buildId}`));
  assert.match(indexHtml, new RegExp(`update-manager\\.js\\?v=${buildId}`));
  assert.match(updateManager, /document\.querySelector\('meta\[name="dokohilf-build"\]'\)\?\.content/);
  assert.match(serviceWorker, new RegExp(`BUILD_ID = '${buildId}'`));
});

test('Versionsquelle wird ohne Cache geprüft', () => {
  assert.match(updateManager, /version\.json/);
  assert.match(updateManager, /cache: 'no-store'/);
  assert.match(updateManager, /pageshow/);
  assert.match(updateManager, /visibilitychange/);
  assert.match(updateManager, /controllerchange/);
});

test('Service Worker aktiviert neue Version und entfernt alte Caches', () => {
  assert.match(serviceWorker, /skipWaiting/);
  assert.match(serviceWorker, /clients\.claim/);
  assert.match(serviceWorker, /caches\.delete/);
  assert.match(serviceWorker, /DOKOHILF_UPDATED/);
  assert.match(serviceWorker, /version\.json/);
});

test('Versionsstatus ist für Nutzer sichtbar', () => {
  assert.match(updateManager, /Version \$\{BUILD_ID\}/);
  assert.match(updateManager, /Neue Version wird geladen/);
  assert.match(updateManager, /Aktuell/);
});
