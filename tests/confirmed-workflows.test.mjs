import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../supabase/migrations/20260806153000_confirmed_workflows_blocks_1_4.sql', import.meta.url),
  'utf8',
);
const reportCorrection = await readFile(
  new URL('../supabase/migrations/20260812131000_correct_report_textfield_visibility_v43.sql', import.meta.url),
  'utf8',
);

test('Berichtskategorie wird gewählt, während das Textfeld bereits in der Maske sichtbar ist', () => {
  assert.match(migration, /Auswahl der Berichtskategorie/);
  assert.match(reportCorrection, /Das große Textfeld für den Bericht ist in dieser Maske bereits unten sichtbar/);
  assert.match(reportCorrection, /es öffnet sich durch die Kategorieauswahl nicht erst neu/);
  assert.doesNotMatch(reportCorrection, /Danach öffnet sich die Eingabemaske/);
  assert.match(migration, /bericht-folgebericht/);
  assert.match(migration, /Bemerkung zur Bearbeitung/);
});

test('automatische Zusatzprotokolle sind nur bei den zwei bestätigten Kategorien erklärt', () => {
  assert.match(migration, /Kontakt – alles außer Arzt/);
  assert.match(migration, /Sturzereignis/);
  assert.match(migration, /Protokollnamen/);
  assert.match(migration, /kleine rote X/);
  assert.match(migration, /entfernt nur die Protokollverknüpfung/);
});

test('Visite enthält Bewohnerauswahl und ausschließlich Status durchgeführt', () => {
  assert.match(migration, /Klienten auswählen/);
  assert.match(migration, /Maske „Neue Visite“/);
  assert.match(migration, /auf „Durchführen“/);
  assert.match(migration, /niemals den Status „abgeschlossen“/);
  assert.match(migration, /ohne Mitarbeiter/);
});

test('Vitalwerte unterscheiden bestätigte Einzel- und Sammelerfassung', () => {
  assert.match(migration, /„Doku-Erweitert“ und wähle „Vitalwerte“/);
  assert.match(migration, /Pop-up zur Auswahl des Vitalwerts/);
  assert.match(migration, /„Vitalwerte Sammelerf\.“/);
  assert.match(migration, /zwei getrennte Einträge/);
});

test('An- und Abwesenheit verbietet geschätzte Bis-Zeitpunkte', () => {
  assert.match(migration, /„Von“ immer vollständig/);
  assert.match(migration, /zu 100 Prozent bekannt/);
  assert.match(migration, /lasse „Bis“ leer und schätze niemals/);
});

test('Medikation ist ein harter Nur-Lese-Ablauf', () => {
  assert.match(migration, /Medikation ausschließlich ansehen/);
  assert.match(migration, /keinerlei Änderungen/);
  assert.match(migration, /Keine Dosierung ändern/);
});

test('Formulare, Notfallblatt und Übergabe verwenden die bestätigten Bezeichnungen', () => {
  assert.match(migration, /formulare-anlegen/);
  assert.match(migration, /Anfallsprotokoll/);
  assert.match(migration, /„Notfallblatt aufrufen“/);
  assert.match(migration, /„Notfallblatt_Allgemein“/);
  assert.match(migration, /„Alles ausklappen“/);
});

test('Migration speichert ausschließlich anonymisierte Textwege', () => {
  assert.match(migration, /No screenshots, names, resident data/);
  assert.doesNotMatch(migration, /\.jpe?g|\.png|IMG_|F85660|E490DC|70614E/i);
});
