import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [library, css, copy, migration, confirmed, voiceBuild, voiceRelease, sw, index] = await Promise.all([
  readFile(new URL('../assets/guide-library-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-library-v29.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/direct-guide-copy-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260808234500_workflow_library_polish_v29.sql', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-supertonic-guide-audio-v28.py', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-release-catalog-v29.json', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
]);

test('Bericht korrigieren ist klar vom Folgebericht getrennt', () => {
  assert.match(library, /title: 'Bericht korrigieren'/);
  assert.match(library, /Ein Folgebericht korrigiert den ursprünglichen Bericht nicht/);
  assert.match(library, /Wenn der Inhalt anschließend korrekt neu dokumentiert werden soll, danach einen neuen Bericht anlegen/);
  assert.match(library, /title: 'Folgebericht erstellen'/);
  assert.match(library, /bestehendes Geschehen[^']*ergänzen oder fortführen/);
  assert.match(migration, /ich habe mich in einem bericht verschrieben/);
  assert.match(migration, /berichtstext korrigieren/);
  assert.match(confirmed, /Ein Folgebericht ist ein \*\*neuer Bericht mit Bezug zu einem bereits dokumentierten Geschehen\*\*/);
});

test('Berichtssuche bleibt bis zur fachlichen Überarbeitung aus der fertigen Bibliothek', () => {
  assert.match(library, /<strong>Berichtssuche<\/strong><small>Wird fachlich noch überarbeitet · kommt später<\/small>/);
  assert.doesNotMatch(library, /LIBRARY_ORDER = \[[^\]]*berichtssuche/);
  assert.match(migration, /set status = 'draft'/);
  assert.match(migration, /array_remove\(coalesce\(approved_guide_slugs/);
  assert.match(confirmed, /Berichtssuche[^\n]*nicht final|Berichtssuche[^\n]*später fachlich/i);
});

test('Visite zeigt Arztfilter nur als farblich getrennten Sonderfall und kennt Mail als Ort', () => {
  assert.match(library, /Den beim Bewohner hinterlegten durchführenden Arzt auswählen/);
  assert.match(library, /Sonderfall · Arzt nicht beim Bewohner hinterlegt\?/);
  assert.match(library, /Im Normalfall bleibt das Filtersymbol aus/);
  assert.match(library, /Einrichtung, beim Arzt, telefonisch oder per Mail/);
  assert.match(css, /\.v29-guide-special/);
  assert.match(migration, /'stuck', 'Wenn der durchführende Arzt beim Bewohner nicht hinterlegt ist/);
  assert.match(voiceRelease, /Sonderfall: Nur wenn der durchführende Arzt beim Bewohner nicht hinterlegt ist/);
});

test('Vitalwerte nennen nur die bestätigten lokalen Beispiele und bleiben feldabhängig', () => {
  for (const value of ['Blutdruck', 'Puls', 'Sauerstoffsättigung', 'Blutzucker', 'Temperatur', 'Atemfrequenz', 'Atemalkohol']) {
    assert.match(library, new RegExp(value));
    assert.match(migration, new RegExp(value));
  }
  assert.match(library, /Je nach ausgewähltem Vitalwert erscheinen die dazu passenden Eingabefelder/);
  assert.match(library, /Blutdruck: Systole und Diastole/);
  assert.match(confirmed, /Zusätzliche Felder oder Einheiten nicht pauschal vorgeben/);
  assert.match(voiceBuild, /Atemfrequenz oder Atemalkohol/);
});

test('Hauptmenü nutzt lokale Häufigkeit, passende Icons und eine vollständige Anleitungsübersicht', () => {
  assert.match(library, /const STORAGE_KEY = 'dokohilf-guide-usage-v29'/);
  assert.match(library, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(library, /Häufig genutzt/);
  assert.match(library, /Alle Anleitungen/);
  assert.match(library, /doctor: '<path/);
  assert.match(library, /pulse: '<path/);
  assert.match(library, /reportEdit: '<path/);
  assert.match(library, /emergency: '<path/);
  assert.match(library, /form: '<path/);
  assert.match(library, /handover: '<path/);
});

test('Guide-Bibliothek wird deterministisch beim App-Start geladen und nicht erst nach einem dynamischen Nachladen', () => {
  const cssIndex = index.indexOf('assets/guide-library-v29.css?v=20260808-29-library1');
  const copyIndex = index.indexOf('assets/direct-guide-copy-v29.js?v=20260808-29');
  const libraryIndex = index.indexOf('assets/guide-library-v29.js?v=20260808-29-library1');
  const appIndex = index.indexOf('assets/app.js?v=20260808-29');
  assert.ok(cssIndex >= 0);
  assert.ok(copyIndex >= 0 && libraryIndex > copyIndex && appIndex > libraryIndex);
  assert.match(index, /data-dokohilf-guide-library-v29/);
});

test('Direktanleitungen respektieren die mobile Safe Area und werden als PWA-Core geladen', () => {
  assert.match(css, /app-shell\[data-mode="direct-guide"\] > \.topbar/);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /position:relative!important;top:auto!important/);
  assert.match(css, /padding-top:12px!important/);
  assert.match(copy, /ensureGuideLibraryAssets/);
  assert.match(copy, /ensureLegacyCloseContract/);
  assert.match(copy, /guide-library-v29\.js\?v=20260808-29-library1/);
  assert.match(copy, /guide-library-v29\.css\?v=20260808-29-library1/);
  assert.match(sw, /mobile-polish-8/);
  assert.match(sw, /guide-library-v29\.js\?v=20260808-29-library1/);
  assert.match(sw, /guide-library-v29\.css\?v=20260808-29-library1/);
});
