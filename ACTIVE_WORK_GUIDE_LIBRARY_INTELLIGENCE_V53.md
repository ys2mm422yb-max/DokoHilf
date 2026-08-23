# DokoHilf – aktive Arbeit: intelligente Anleitungsbibliothek / v53

**Status:** IN ARBEIT  
**Stand:** 23. August 2026  
**Branch:** `feature/guide-library-intelligence-v53`  
**Ausgangs-main:** `9c920d55f52bbd0a2f6a8f11ce76777a06ec1094` (Merge PR #159)

## Nutzerentscheidung

Die bereits vorhandene Anleitungsbibliothek und ihre bereits vorhandene Suchleiste sollen verbessert werden. Es wird ausdrücklich **keine zweite Suchleiste** gebaut.

Verbesserungen, die ausschließlich auf bereits fachlich bestätigten Informationen beruhen, dürfen selbstständig umgesetzt werden. Sobald für eine Verbesserung ein nicht bestätigter Vivendi-Klickweg, Bildschirmzustand oder eine fachlich neue Synonym-Bedeutung nötig wäre, wird nicht geraten, sondern gezielt beim Nutzer nachgefragt.

## Scope dieses Arbeitsblocks

1. Die bestehende Suche wird aliasbewusst. Sie nutzt ausschließlich bereits freigegebene Guide-Titel und freigegebene Alias-Begriffe als zusätzliche Suchbegriffe.
2. Komplette Anleitungen erhalten einen direkten Einstieg `Schritt für Schritt starten` in den bereits vorhandenen freigegebenen Chat-Guide.
3. Der Einstieg setzt den Ziel-Guide deterministisch über `selectedGuideSlug`; es wird kein Klickweg durch KI geraten.
4. `Medikamente abzeichnen`, `Maßnahme abzeichnen` und andere bereits bestätigte Abzeichnen-Formulierungen führen bei der Bibliothekssuche zum Durchführungsnachweis. Der geführte Einstieg verwendet `durchfuehrungsnachweis-finden`, damit zuerst der gewünschte Bewohner ausgewählt wird.
5. Medikation bleibt separat und strikt nur zum Ansehen.
6. Berichtssuche, Easy-Plan und Aufgaben · Aktuelles bleiben `In Vorbereitung` und erhalten keinen geführten Start.

## Nicht im Scope

- keine neuen fachlichen Klickwege;
- keine neuen Supabase-Guides oder Migrationen;
- keine neue Sprachengine und keine neuen gesprochenen Sätze;
- keine Konten, Profile oder personenbezogenen Daten;
- keine Änderung von Berichtssuche, Easy-Plan oder Aufgaben · Aktuelles.

## Technische Umsetzung

- `assets/guide-library-intelligence-v53.js`: gemeinsame Registry für Bibliothekssuche und geführten Start auf Basis bereits freigegebener Aliase;
- `assets/release-polish-v29.js`: lädt die v53-Erweiterung;
- `tests/guide-library-intelligence-v53.test.mjs`: Regressionstests für Alias-Suche, Medikation-vs.-Abzeichnen, Berichtskorrektur, Vitalwerte, Dateiablage und exakten Guide-Start.

## Veröffentlichung

Wie immer: Branch → PR → exakten PR-Head prüfen → nur bei grünen Pflichtprüfungen mergen → öffentlichen `gh-pages`-Stand gezielt prüfen. Bestehende Live-Hotfixes auf `gh-pages` dürfen nicht blind durch den Main-Stand überschrieben werden.
