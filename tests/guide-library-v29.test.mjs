import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [library, css, copy, v29Ui, mobileRender, migration, confirmed, voiceBuild, voiceRelease, sw, index, version] = await Promise.all([
  readFile(new URL('../assets/guide-library-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-library-v29.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/direct-guide-copy-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/v29-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/mobile-render-v27.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260808234500_workflow_library_polish_v29.sql', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-supertonic-guide-audio-v28.py', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-release-catalog-v29.json', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
]);

const buildId = JSON.parse(version).buildId;

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

test('Guide-Bibliothek wird deterministisch beim App-Start geladen und der Legacy-Fallback ist vollständig stabil', () => {
  const cssIndex = index.indexOf(`assets/guide-library-v29.css?v=${buildId}-library1`);
  const copyIndex = index.indexOf(`assets/direct-guide-copy-v29.js?v=${buildId}`);
  const libraryIndex = index.indexOf(`assets/guide-library-v29.js?v=${buildId}-library1`);
  const appIndex = index.indexOf(`assets/app.js?v=${buildId}`);
  const staticButtons = [...index.matchAll(/data-direct-guide="([^"]+)"/g)].map(match => match[1]);
  assert.ok(cssIndex >= 0);
  assert.ok(copyIndex >= 0 && libraryIndex > copyIndex && appIndex > libraryIndex);
  assert.match(index, /data-dokohilf-guide-library-v29/);
  assert.match(index, /data-v27-ready="direct-guides-cross-platform"/);
  assert.deepEqual(staticButtons, ['bericht', 'visite', 'vitalwerte', 'anwesenheit', 'medikation', 'formular', 'uebergabe']);
});

test('Premium-v29 respektiert die Guide-Bibliothek als Besitzer des Bereichs Häufig genutzt', () => {
  assert.match(v29Ui, /guideLibraryOwnsHome/);
  assert.match(v29Ui, /guideLibraryOwnsHome \? 'Häufig genutzt' : 'Häufige Abläufe · direkt öffnen'/);
  assert.match(v29Ui, /querySelectorAll\('button\[data-direct-guide\]'\)/);
  assert.match(v29Ui, /\.examples button\[data-direct-guide\]\{/);
  assert.doesNotMatch(v29Ui, /\.examples button\{\n  position:relative/);
});

test('Guide-Bibliotheksbesitz repariert einen späteren Legacy-DOM-Reset ohne eigene Guide-Daten zu duplizieren', () => {
  assert.match(copy, /let guideLibrarySnapshot = ''/);
  assert.match(copy, /function guideLibraryHomeValid\(examples\)/);
  assert.match(copy, /label === 'Häufig genutzt'/);
  assert.match(copy, /examples\.querySelectorAll\('\.v29-frequent-guide'\)\.length === 6/);
  assert.match(copy, /legacy\.length === 7/);
  assert.match(copy, /legacy\.every\(button => button\.hidden\)/);
  assert.match(copy, /guideLibrarySnapshot = examples\.innerHTML/);
  assert.match(copy, /examples\.innerHTML = guideLibrarySnapshot/);
  assert.match(copy, /ensureGuideLibraryOwnershipStyle/);
  assert.doesNotMatch(copy, /const META|const GUIDES|LIBRARY_ORDER/);
});

test('Mobile Renderfreigabe prüft die sichtbare Bibliothek statt nur Legacy-Buttons im DOM', () => {
  assert.match(mobileRender, /window\.__DOKOHILF_GUIDE_LIBRARY_V29__ === true/);
  assert.match(mobileRender, /label === 'Häufig genutzt'/);
  assert.match(mobileRender, /\.v29-frequent-guide/);
  assert.match(mobileRender, /legacyHidden/);
  assert.match(mobileRender, /Alle Anleitungen/);
  assert.match(mobileRender, /Berichtssuche/);
});

test('Direktanleitungen respektieren die mobile Safe Area und werden als PWA-Core geladen', () => {
  assert.match(css, /app-shell\[data-mode="direct-guide"\] > \.topbar/);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /position:relative!important;top:auto!important/);
  assert.match(css, /padding-top:12px!important/);
  assert.match(copy, /ensureGuideLibraryAssets/);
  assert.match(copy, /ensureLegacyCloseContract/);
  assert.match(copy, /meta\[name="dokohilf-build"\]/);
  assert.match(copy, /GUIDE_LIBRARY_REVISION = 'library1'/);
  assert.match(copy, /encodeURIComponent\(BUILD_ID\)/);
  assert.doesNotMatch(copy, /guide-library-v29\.(?:js|css)\?v=20260809-29/);
  assert.match(sw, /mobile-polish-8/);
  assert.match(sw, new RegExp(`guide-library-v29\\.js\\?v=${buildId}-library1`));
  assert.match(sw, new RegExp(`guide-library-v29\\.css\\?v=${buildId}-library1`));
});