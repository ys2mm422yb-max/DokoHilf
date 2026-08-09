import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [library, extraGuides, voiceGate, footer] = await Promise.all([
  read('assets/guide-library-v29.js'),
  read('assets/durchfuehrungs-workflows-v29.js'),
  read('assets/local-voice-gate-v28.js'),
  read('assets/release-polish-v29.js'),
]);

const baseGuides = [
  'bericht-neu', 'bericht-durchstreichen', 'bericht-folgebericht',
  'visite-anlegen', 'visiten-oeffnen', 'visite-status-durchgefuehrt',
  'vitalwerte', 'anwesenheit', 'medikation-ansehen', 'formulare-anlegen',
  'uebergabeformular', 'notfallblatt', 'durchfuehrung-storno',
  'durchfuehrungsnachweis-oeffnen', 'stammdaten',
];
const extra = [
  'bedarfsmedikation-gabe',
  'bedarfsmedikation-wirksamkeitskontrolle',
  'massnahmen-ohne-zeitangabe',
];

test('alle 18 freigegebenen Bibliothekswege sind im UI verdrahtet', () => {
  for (const slug of baseGuides) assert.match(library, new RegExp(`['"]${slug}['"]`), `Basis-Guide fehlt: ${slug}`);
  for (const slug of extra) assert.match(extraGuides, new RegExp(`['"]${slug}['"]`), `Durchführungs-Guide fehlt: ${slug}`);
  assert.match(extraGuides, /insertBefore\(card, firstLater\)/);
  assert.equal(baseGuides.length + extra.length, 18);
});

test('Vitalwerte führt bewusst über Einzelwert oder Sammelerfassung', () => {
  assert.match(library, /renderVitalChoice/);
  assert.match(library, /vitalwerte-einzelwert/);
  assert.match(library, /vitalwerte-sammelerfassung/);
  assert.match(library, /data-v29-open-guide/);
});

test('die drei fachlich offenen Karten bleiben sichtbar aber nicht als Guide anklickbar', () => {
  for (const label of ['Aufgaben · Aktuelles', 'Easy-Plan öffnen', 'Berichtssuche']) assert.match(library, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(library, /class="v29-library-card is-later"/);
  assert.match(library, /aria-disabled="true"/);
});

test('statische WAVs ignorieren alte Build-Caches und den HTTP-Cache', () => {
  assert.match(voiceGate, /cacheKeyUrl\.searchParams\.set\('dokohilf-build', BUILD_ID\)/);
  assert.match(voiceGate, /cache\?\.match\(cacheKey\)/);
  assert.match(voiceGate, /fetchWithTimeout\(audioUrl, AUDIO_TIMEOUT_MS, \{ cache: 'no-store' \}\)/);
  assert.match(voiceGate, /cache\?\.put\(cacheKey, response\.clone\(\)\)/);
  assert.doesNotMatch(voiceGate, /fetchWithTimeout\(audioUrl, AUDIO_TIMEOUT_MS, \{ cache: 'force-cache' \}\)/);
});

test('MT-Hinweis bleibt dezent im Footer', () => {
  assert.match(footer, /Konzept & Umsetzung · MT/);
  assert.match(footer, /footer-credit/);
});
