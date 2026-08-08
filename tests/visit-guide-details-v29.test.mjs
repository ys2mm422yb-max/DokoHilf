import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [copy, confirmed, migration, voiceBuilder] = await Promise.all([
  readFile('assets/direct-guide-copy-v29.js', 'utf8'),
  readFile('CONFIRMED_WORKFLOWS.md', 'utf8'),
  readFile('supabase/migrations/20260808224000_visite_doctor_filter_and_mail_location_v29.sql', 'utf8'),
  readFile('scripts/build-supertonic-guide-audio-v28.py', 'utf8'),
]);

const doctorText = 'Den durchführenden Arzt auswählen. Nur wenn er beim Bewohner fehlt, rechts daneben das kleine Filtersymbol aktivieren und aus allen systemweit hinterlegten Ärzten wählen.';
const locationText = 'Den Ort auswählen: Einrichtung, beim Arzt, telefonisch oder per Mail.';
const voiceLocationText = 'Trage den Grund ein, zum Beispiel „Kontrollbesuch“, und wähle den Ort: Einrichtung, beim Arzt, telefonisch oder per Mail.';

test('direkte Visitenanleitung zeigt den Arztfilter nur als Ausnahmefall', () => {
  assert.match(copy, /function polishVisit\(view\)/);
  assert.ok(copy.includes(doctorText));
  assert.match(copy, /paragraphs\[7\]/);
  assert.match(copy, /v29VisitDoctorFilter/);
});

test('direkte Visitenanleitung enthält alle vier Ortsoptionen', () => {
  assert.ok(copy.includes(locationText));
  assert.match(copy, /paragraphs\[11\]/);
  assert.match(copy, /v29VisitMailLocation/);
});

test('verbindliche Fachquelle dokumentiert Arztfilter und per Mail', () => {
  assert.match(confirmed, /Nur wenn der Arzt beim Bewohner noch nicht hinterlegt ist/);
  assert.match(confirmed, /kleine \*\*Filtersymbol\*\*/);
  assert.match(confirmed, /Einrichtung, beim Arzt, telefonisch oder per Mail/);
});

test('Supabase-Guide übernimmt dieselben bestätigten Details', () => {
  assert.ok(migration.includes(doctorText));
  assert.ok(migration.includes(voiceLocationText));
  assert.match(migration, /arzt_filter/);
  assert.match(migration, /systemweit hinterlegten Ärzte/);
});

test('statische Supertonic-Sprachausgabe ersetzt die alten Visitenformulierungen', () => {
  assert.ok(voiceBuilder.includes(doctorText));
  assert.ok(voiceBuilder.includes(voiceLocationText));
  assert.match(voiceBuilder, /Wähle im Feld „Arzt“/);
  assert.match(voiceBuilder, /beim Arzt oder telefonisch/);
});
