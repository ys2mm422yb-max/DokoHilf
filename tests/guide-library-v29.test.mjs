import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [library, css, copy, v29Ui, directGuides, mobileRender, migration, followupMigration, confirmed, voiceBuild, voiceRelease, sw, index, version, smartHelp] = await Promise.all([
  readFile(new URL('../assets/guide-library-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-library-v29.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/direct-guide-copy-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/v29-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/direct-guides-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/mobile-render-v27.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260808234500_workflow_library_polish_v29.sql', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260809112500_later_guides_stammdaten_v29.sql', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-supertonic-guide-audio-v28.py', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-release-catalog-v29.json', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
  readFile(new URL('../assets/smart-help-v29.js', import.meta.url), 'utf8'),
]);
const buildId = JSON.parse(version).buildId;

test('Bericht korrigieren bleibt klar vom Folgebericht getrennt', () => {
  assert.match(library, /title: 'Bericht korrigieren'/); assert.match(library, /Ein Folgebericht korrigiert den ursprünglichen Bericht nicht/); assert.match(library, /title: 'Folgebericht erstellen'/); assert.match(library, /bestehendes Geschehen[^']*ergänzen oder fortführen/); assert.match(migration, /ich habe mich in einem bericht verschrieben/); assert.match(confirmed, /Ein Folgebericht ist ein \*\*neuer Bericht mit Bezug zu einem bereits dokumentierten Geschehen\*\*/);
});

test('Aufgaben, Easy-Plan und Berichtssuche bleiben deaktivierte Später-Themen', () => {
  for (const label of ['Aufgaben · Aktuelles', 'Easy-Plan öffnen', 'Berichtssuche']) assert.match(library, new RegExp(label.replace('·', '·')));
  assert.match(library, /const LATER_ITEMS = Object\.freeze/);
  assert.match(library, /for \(const item of LATER_ITEMS\) grid\.append\(createLaterCard\(item\)\)/);
  assert.doesNotMatch(library, /LIBRARY_ORDER = \[[^\]]*(aufgaben-aktuelles|easyplan)/);
  assert.match(followupMigration, /where slug in \('aufgaben-aktuelles', 'easyplan'\)/);
  assert.match(followupMigration, /set status = 'draft'/);
  assert.match(migration, /where slug = 'berichtssuche'/);
  assert.doesNotMatch(smartHelp, /return 'aufgaben-aktuelles'|return 'easyplan'|return 'berichtssuche'/);
});

test('Visite und Vitalwerte behalten die bestätigten Fachdetails', () => {
  assert.match(library, /Den beim Bewohner hinterlegten durchführenden Arzt auswählen/); assert.match(library, /Sonderfall · Arzt nicht beim Bewohner hinterlegt\?/); assert.match(library, /Einrichtung, beim Arzt, telefonisch oder per Mail/); assert.match(voiceRelease, /Sonderfall: Nur wenn der durchführende Arzt beim Bewohner nicht hinterlegt ist/);
  for (const value of ['Blutdruck', 'Puls', 'Sauerstoffsättigung', 'Blutzucker', 'Temperatur', 'Atemfrequenz', 'Atemalkohol']) assert.match(library, new RegExp(value));
  assert.match(library, /Je nach ausgewähltem Vitalwert erscheinen die dazu passenden Eingabefelder/); assert.match(library, /Blutdruck: Systole und Diastole/); assert.match(voiceBuild, /Atemfrequenz oder Atemalkohol/);
});

test('Stammdaten erklärt den Einstieg über linke Bewohnerübersicht vollständig', () => {
  assert.match(library, /Zuerst „Berichte“ oder „Durchführungsnachweis“ öffnen/);
  assert.match(library, /Solange einer dieser beiden Bereiche geöffnet ist, siehst du links die Bewohnerübersicht/);
  assert.match(library, /gewünschten Bewohner doppelklicken/);
  assert.match(followupMigration, /Öffne zuerst den Bereich „Berichte“ oder „Durchführungsnachweis“/);
  assert.match(followupMigration, /siehst du links die Bewohnerübersicht/);
  assert.match(followupMigration, /Doppelklicke in der Bewohnerübersicht/);
});

test('Hauptmenü nutzt lokale Häufigkeit, eindeutige Icons und 15 fertige Top-Level-Anleitungen', () => {
  assert.match(library, /const STORAGE_KEY = 'dokohilf-guide-usage-v29'/); assert.match(library, /localStorage\.setItem\(STORAGE_KEY/); assert.match(library, /Häufig genutzt/); assert.match(library, /Alle Anleitungen/);
  for (const icon of ['doctor', 'visitList', 'pulse', 'reportEdit', 'reportSearch', 'tasks', 'plan', 'emergency', 'form', 'handover']) assert.match(library, new RegExp(`${icon}: '<`));
  assert.match(library, /'visiten-oeffnen': \{ label: 'Visiten öffnen'[^\n]*icon: 'visitList'/);
  assert.match(library, /Berichtssuche[^\n]*icon: 'reportSearch'/);
  const order = library.match(/const LIBRARY_ORDER = \[([\s\S]*?)\];/); assert.ok(order); const slugs = [...order[1].matchAll(/'([^']+)'/g)].map(match => match[1]); assert.equal(slugs.length, 15); assert.equal(new Set(slugs).size, 15);
});

test('Navigation questions route to deterministic confirmed navigation guides for all approved areas', () => {
  for (const slug of ['berichte-finden', 'doku-erweitert-finden', 'doku-finden', 'anwesenheiten-finden', 'medikation-finden', 'formulare-finden', 'durchfuehrungsnachweis-finden', 'analyse-finden', 'uebergabe-finden', 'notfallblatt-finden', 'stammdaten-finden']) {
    assert.match(followupMigration, new RegExp(`'${slug}'`));
    assert.match(smartHelp, new RegExp(`return '${slug}'`));
  }
  assert.match(followupMigration, /'visiten-finden'/);
  assert.match(followupMigration, /'vitalwerte-finden'/);
  assert.match(smartHelp, /return 'visiten-oeffnen'/);
  assert.match(smartHelp, /return 'vitalwerte'/);
  assert.match(followupMigration, /festen? Leiste/);
  assert.match(followupMigration, /„Doku-Erweitert“/);
  assert.match(followupMigration, /„Analyse“/);
});

test('Guide-Bibliothek initialisiert einmal, rendert echte DOM-Karten und heilt ihren Startbereich selbst', () => {
  assert.match(library, /__DOKOHILF_GUIDE_LIBRARY_V29__ === 'initializing'/); assert.match(library, /function createLibraryCard\(slug\)/); assert.match(library, /document\.createElement\('button'\)/); assert.match(library, /for \(const slug of LIBRARY_ORDER\) grid\.append\(createLibraryCard\(slug\)\)/); assert.match(library, /function frequentHomeValid\(examples\)/); assert.match(library, /if \(!frequentHomeValid\(examples\)\) renderFrequent\(\)/); assert.match(library, /window\.__DOKOHILF_GUIDE_LIBRARY_V29__ = true/);
});

test('genau ein Besitzer bleibt für Startbibliothek und Chatkopf', () => {
  assert.doesNotMatch(index, /DokoHilfLegacyDirectGuidesObserver|__DOKOHILF_LEGACY_DIRECT_GUIDES_OBSERVER_GUARD_V29__|window\.MutationObserver\s*=/);
  assert.match(directGuides, /function v29OwnsGuideLibrary\(examples\)/); assert.match(directGuides, /examples\?\.dataset\.v29GuideLibrary === 'true'/); assert.match(directGuides, /owner === true \|\| owner === 'initializing'/); assert.match(directGuides, /function v29OwnsChatCopy\(\)/); assert.match(directGuides, /document\.documentElement\.dataset\.dokohilfUi === 'v29'/); assert.match(directGuides, /if \(!examples \|\| v29OwnsGuideLibrary\(examples\) \|\| desiredButtonsPresent\(examples\)\) return false/); assert.match(directGuides, /if \(v29OwnsChatCopy\(\)\) return false/);
  assert.doesNotMatch(copy, /guideLibrarySnapshot|polishChatHead|ensureGuideLibraryAssets/); assert.match(copy, /ensureGuideLibraryOwnershipStyle/); assert.match(copy, /const view = document\.getElementById\('directGuideView'\)/);
  assert.match(v29Ui, /guideLibraryOwnsHome/); assert.match(v29Ui, /guideLibraryOwnsHome \? 'Häufig genutzt' : 'Häufige Abläufe · direkt öffnen'/); assert.match(v29Ui, /querySelectorAll\('button\[data-direct-guide\]'\)/);
});

test('statischer Legacy-Fallback ist vollständig und die Bibliothek lädt danach deterministisch', () => {
  const staticButtons = [...index.matchAll(/data-direct-guide="([^"]+)"/g)].map(match => match[1]); assert.deepEqual(staticButtons, ['bericht', 'visite', 'vitalwerte', 'anwesenheit', 'medikation', 'formular', 'uebergabe']);
  const copyIndex = index.indexOf(`assets/direct-guide-copy-v29.js?v=${buildId}`); const libraryIndex = index.indexOf(`assets/guide-library-v29.js?v=${buildId}-library1`); const appIndex = index.indexOf(`assets/app.js?v=${buildId}`); assert.ok(copyIndex >= 0 && libraryIndex > copyIndex && appIndex > libraryIndex);
});

test('Mobile Renderfreigabe prüft sichtbaren Bibliothekszustand', () => {
  assert.match(mobileRender, /window\.__DOKOHILF_GUIDE_LIBRARY_V29__ === true/); assert.match(mobileRender, /label === 'Häufig genutzt'/); assert.match(mobileRender, /\.v29-frequent-guide/); assert.match(mobileRender, /legacyHidden/); assert.match(mobileRender, /Alle Anleitungen/); assert.match(mobileRender, /Berichtssuche/); assert.match(mobileRender, /Aufgaben · Aktuelles/); assert.match(mobileRender, /Easy-Plan öffnen/);
});

test('Direktguide-Safe-Area und PWA-Core bleiben erhalten', () => {
  assert.match(css, /app-shell\[data-mode="direct-guide"\] > \.topbar/); assert.match(css, /env\(safe-area-inset-top\)/); assert.match(copy, /ensureLegacyCloseContract/); assert.match(sw, /mobile-polish-8/); assert.match(sw, new RegExp(`guide-library-v29\\.js\\?v=${buildId}-library1`)); assert.match(sw, new RegExp(`guide-library-v29\\.css\\?v=${buildId}-library1`));
});