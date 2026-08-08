import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../supabase/migrations/20260806153000_confirmed_workflows_blocks_1_4.sql', import.meta.url),
  'utf8',
);
const v29 = await readFile(
  new URL('../supabase/migrations/20260808091000_natural_presence_and_form_save_v29.sql', import.meta.url),
  'utf8',
);
const confirmed = await readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8');
const directCopy = await readFile(new URL('../assets/direct-guide-copy-v29.js', import.meta.url), 'utf8');

test('Berichtskategorie wird vor der Eingabemaske gewählt', () => {
  assert.match(migration, /Auswahl der Berichtskategorie/);
  assert.match(migration, /Danach öffnet sich die Eingabemaske/);
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

test('v29 formuliert Von/Bis natürlicher, ohne die Nicht-schätzen-Regel zu ändern', () => {
  assert.match(v29, /Trage bei „Von“ immer Datum und Uhrzeit ein/);
  assert.match(v29, /Endzeitpunkt sicher feststeht/);
  assert.match(v29, /lässt du „Bis“ einfach leer/);
  assert.match(v29, /Bitte nicht schätzen/);
  assert.doesNotMatch(v29, /100 Prozent/);
  assert.match(directCopy, /v29NaturalPresence/);
  assert.doesNotMatch(directCopy, /100 Prozent/);
});

test('v29 ergänzt nach dem Bearbeiten eines Formulars den bestätigten Speicherschritt oben links', () => {
  assert.match(v29, /Wenn du das Formular fertig bearbeitet hast, speicherst du es oben links in der Leiste/);
  assert.match(v29, /Wurde das Formular gespeichert/);
  assert.match(directCopy, /data-v29-form-save-step/);
  assert.match(directCopy, /8 Schritte/);
  assert.match(confirmed, /oben links in der Leiste speichern/);
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

test('Migrationen speichern ausschließlich anonymisierte Textwege', () => {
  assert.match(migration, /No screenshots, names, resident data/);
  assert.doesNotMatch(`${migration}\n${v29}`, /\.jpe?g|\.png|IMG_|F85660|E490DC|70614E/i);
});
