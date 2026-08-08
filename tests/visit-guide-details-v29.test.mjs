import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [copy, library, confirmed, migration, voiceBuilder, voiceRelease] = await Promise.all([
  readFile('assets/direct-guide-copy-v29.js', 'utf8'),
  readFile('assets/guide-library-v29.js', 'utf8'),
  readFile('CONFIRMED_WORKFLOWS.md', 'utf8'),
  readFile('supabase/migrations/20260808234500_workflow_library_polish_v29.sql', 'utf8'),
  readFile('scripts/build-supertonic-guide-audio-v28.py', 'utf8'),
  readFile('assets/voice-release-catalog-v29.json', 'utf8'),
]);

const doctorText = 'Den beim Bewohner hinterlegten durchführenden Arzt auswählen.';
const locationText = 'Den Ort auswählen: Einrichtung, beim Arzt, telefonisch oder per Mail.';
const specialText = 'Sonderfall · Arzt nicht beim Bewohner hinterlegt?';
const voiceLocationText = 'Trage den Grund ein, zum Beispiel „Kontrollbesuch“, und wähle den Ort: Einrichtung, beim Arzt, telefonisch oder per Mail.';

test('direkte Visitenanleitung trennt normalen Arzt-Schritt vom seltenen Filter-Sonderfall', () => {
  assert.match(copy, /function polishVisit\(view\)/);
  assert.ok(copy.includes(doctorText));
  assert.ok(copy.includes(specialText));
  assert.match(copy, /insertSpecialAfter/);
  assert.match(copy, /paragraphs\[7\]/);
  assert.match(library, /Im Normalfall bleibt das Filtersymbol aus/);
});

test('direkte Visitenanleitung enthält alle vier Ortsoptionen', () => {
  assert.ok(copy.includes(locationText));
  assert.match(copy, /paragraphs\[11\]/);
  assert.match(copy, /v29VisitMailLocation/);
});

test('verbindliche Fachquelle dokumentiert normalen Arztweg und Filter-Sonderfall separat', () => {
  assert.match(confirmed, /Den beim Bewohner hinterlegten durchführenden Arzt auswählen/);
  assert.match(confirmed, /\*\*Sonderfall Arztauswahl:\*\*/);
  assert.match(confirmed, /kleine \*\*Filtersymbol\*\*/);
  assert.match(confirmed, /Einrichtung, beim Arzt, telefonisch oder per Mail/);
});

test('Supabase-Guide spricht den Filter nur in stuck/help aus', () => {
  assert.ok(migration.includes(doctorText));
  assert.match(migration, /'stuck', 'Wenn der durchführende Arzt beim Bewohner nicht hinterlegt ist/);
  assert.match(migration, /arzt_filter/);
  assert.match(migration, /Im Normalfall bleibt das Filtersymbol aus/);
});

test('statische Supertonic-Sprachausgabe nutzt normalen Arztweg und kennt Sonderfall sowie Mail', () => {
  assert.ok(voiceBuilder.includes(doctorText));
  assert.ok(voiceBuilder.includes(voiceLocationText));
  assert.match(voiceBuilder, /Wähle im Feld „Arzt“/);
  assert.match(voiceRelease, /Sonderfall: Nur wenn der durchführende Arzt beim Bewohner nicht hinterlegt ist/);
});
