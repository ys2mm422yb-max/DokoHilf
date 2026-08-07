# Aktiver Arbeitsstand – direkte häufige Anleitungen und Chatdesign

**Stand:** 7. August 2026  
**Status:** Umsetzung abgeschlossen; erneute vollständige Validierung läuft  
**Build:** `20260806-27`  
**Branch:** `feature/direct-guides-chat-polish-20260807`  
**Pull Request:** `#69`

## Nutzerwunsch

Der Nutzer hat zwei Produktänderungen ausdrücklich bestätigt:

1. Der Schreibmodus soll ruhiger und klarer wie ein eigener Chat wirken statt wie eine Mischung aus Formular, großer Überschrift und Chat.
2. Ein Tipp auf einen Eintrag unter **„Häufige Abläufe“** soll nicht zuerst einen normalen Chat öffnen. Stattdessen soll direkt die **vollständige Schritt-für-Schritt-Anleitung** des ausgewählten bestätigten Ablaufs sichtbar werden.

Die zugrunde liegenden lokalen Bilder bleiben ausschließlich im Chat und werden nicht in GitHub, Supabase, Tests oder Artefakte übernommen.

## Fachquelle

Direkte Anleitungen stammen ausschließlich aus `CONFIRMED_WORKFLOWS.md`. Vor Umsetzung wurden zusätzlich die aktuell freigegebenen Supabase-Guides geprüft. Keine neue fachliche Navigation wurde erfunden.

Im tatsächlich gerenderten Hauptmenü sind sieben häufige Abläufe sichtbar und werden daher alle direkt geführt:

- Bericht anlegen
- Visite anlegen
- Vitalwerte erfassen
- An-/Abwesenheit
- Medikation ansehen
- Formular anlegen
- Übergabe anzeigen

Vitalwerte verzweigen vor der Anleitung ausschließlich in die zwei bestätigten Varianten:

- einzelner Vitalwert über `Vitalwerte`
- mehrere Werte über `Vitalwerte Sammelerf.`

## Umsetzung

### `assets/direct-guides-v27.js`

Neue lokale, rein allgemeine Direktansicht:

- öffnet bei `data-direct-guide` einen eigenen UI-Modus `direct-guide`
- Chat, Workspace und Composer bleiben dabei verborgen
- zeigt die vollständigen bestätigten Schritte als nummerierte Karten
- zeigt bestätigte Sicherheitsregeln als Hinweis beziehungsweise Warnung
- Vitalwerte besitzen eine explizite Zwei-Wege-Auswahl
- Übergabe enthält exakt die vier bestätigten Schritte `Analyse → Was war los? → Alle anzeigen → Alles ausklappen`
- Rückkehr führt direkt ins Hauptmenü
- keine KI-Anfrage ist nötig, um eine häufige Anleitung zu öffnen
- keine Nutzer- oder Falldaten werden gespeichert

Zusätzlich besitzt die Datei jetzt bewusst die letzte Laufzeitkontrolle über die häufigen Abläufe und den kompakten Chatkopf. Grund: `assets/experience-v27.js` aus der bisherigen Build-27-Schicht baut diese Bereiche beim Start nachträglich um. Da `direct-guides-v27.js` danach geladen wird, setzt es anschließend verbindlich wieder:

- sieben `data-direct-guide`-Schaltflächen
- `Häufige Abläufe · direkt öffnen`
- `Schreib deine Frage.` als kompakten Chatkopf

Damit kann die ältere Experience-Schicht die neue Produktentscheidung nicht mehr überschreiben.

### `index.html`

Die statischen sechs Kern-Schaltflächen unter `Häufige Abläufe` verwenden bereits `data-direct-guide` statt `data-prompt`. Die siebte sichtbare Schaltfläche `Übergabe anzeigen`, die bisher durch die Experience-Schicht ergänzt wurde, wird zur Laufzeit ebenfalls als Direktanleitung gesetzt.

Der Schreibmodus enthält:

- Eyebrow `DokoHilf Chat`
- Überschrift `Schreib deine Frage.`
- kurze Erklärung statt großer Startseiten-artiger Einleitung

Die Schnellfragen innerhalb des Chatmodus bleiben bewusst Chat-Prompts. Damit bleibt die bestehende schrittweise Gesprächsführung weiterhin erreichbar.

### `assets/ux-v27.css`

- komplette Direktanleitung als ruhige dunkle Kartenliste
- eigene Kopfleiste mit Schrittzahl
- Warn- und Hinweiskarten
- responsive Vitalwerte-Auswahl
- mobile Direktanleitungen ohne horizontalen Überlauf
- Chatkopf deutlich niedriger
- kleinere Bubbles und kompaktere Abstände
- Schnellfragen als kleine Chips
- `Häufige Abläufe` kennzeichnen sichtbar `Anleitung ›`

### `service-worker.js`

- `assets/direct-guides-v27.js` wird als Core-Datei gecacht
- neue Revision `20260807-direct-guides-chat-2`, damit installierte PWAs den neuen Hauptmenü-/Chatstand erhalten

## Tests

### Deterministisch

`tests/direct-guides-v27.test.mjs` prüft jetzt:

- die Laufzeitübernahme aller sieben sichtbaren häufigen Abläufe
- bestätigte Bericht-/Visite-Inhalte
- ausschließlich zwei Vitalwerte-Varianten
- die vier bestätigten Übergabe-Schritte
- harte An-/Abwesenheits- und Medikationsregeln
- eigener Direkt-Guide-Modus ohne Chat/Composer
- dass der kompakte Chatkopf nach dem älteren Experience-Pass erneut gesetzt wird
- PWA-Core-Cache und Revisionsmarker

Der Test ist ausdrücklich Bestandteil des verpflichtenden `Deploy DokoHilf`-Workflows. Zusätzlich prüft der Workflow Syntax und Vorhandensein von `assets/direct-guides-v27.js` sowie, dass die Datei keinen `localStorage`- oder `indexedDB`-Zugriff enthält.

### Echter iPhone-Render

`scripts/mobile-render-v27.mjs` prüft auf 393 × 852 jetzt tatsächlich:

1. sieben sichtbare häufige Abläufe als Direktanleitungen
2. `Bericht anlegen` öffnet direkt die vollständige 12-Schritt-Anleitung
3. Chat-Arbeitsbereich bleibt dabei verborgen
4. kein horizontaler Überlauf
5. Vitalwerte bietet genau zwei Varianten
6. Sammelerfassung zeigt sechs bestätigte Schritte
7. Übergabe zeigt exakt vier bestätigte Schritte
8. anschließend kompakter Schreibmodus mit `Schreib deine Frage.`
9. bestehender schrittweiser Chat bleibt erreichbar
10. Sprachmodus bleibt geometrisch überlappungsfrei

## Validierungsverlauf PR #69

### Run #268

Der erste Hauptlauf erreichte:

- 165/165 Routingfälle erfolgreich
- 3/3 Gesprächssequenzen erfolgreich
- 12/12 bestätigte Workflow-Marker vorhanden
- 121 von 122 damals registrierten deterministischen Tests erfolgreich

Einziger Fehler: veralteter Service-Worker-Revisionsvertrag in `tests/voice-layout-v26.test.mjs`. Er erwartete noch `20260807-fluid-voice-layout-1`. Die neue Produktrevision `20260807-direct-guides-chat-2` wurde daraufhin korrekt als aktueller Vertrag registriert.

### Run #271

Nach Aufnahme des neuen Direkt-Guide-Tests waren **129/129 deterministische Tests grün**. Der echte iPhone-Render deckte anschließend einen realen Laufzeitkonflikt auf:

- Auf dem gerenderten Screenshot erschienen weiterhin sieben alte häufige Abläufe als Chat-Prompts.
- Ursache war `assets/experience-v27.js`: dessen `ensureWorkflowButtons()` ersetzt die Startseiten-Schaltflächen nach dem statischen HTML erneut.
- Dieselbe Schicht überschreibt außerdem den kompakten Chatkopf.

Das Render-Artefakt enthielt keine Console- oder Page-Errors. Der Test hat damit einen echten Produktkonflikt zwischen zwei Frontend-Schichten gefunden, keinen flüchtigen Browserfehler.

Korrektur:

- `direct-guides-v27.js` setzt nach der Experience-Schicht alle sieben sichtbaren häufigen Abläufe verbindlich als Direktanleitungen.
- `Übergabe anzeigen` wurde als bestätigte vierstufige Direktanleitung ergänzt.
- der kompakte Chatkopf wird nach der Experience-Schicht ebenfalls verbindlich wiederhergestellt.
- iPhone-Test prüft jetzt explizit alle sieben Direkt-Schaltflächen, Übergabe und den tatsächlich sichtbaren Chatkopf.

## Noch erforderlich

- aktuellen exakten PR-#69-Head vollständig über beide DokoHilf-Workflows prüfen
- Fehler nur auf diesem Branch korrigieren
- nur vollständig grünen exakten Head manuell mergen
- Branch nicht automatisch löschen
- nach Merge `main`, `gh-pages`, festen Hauptlink und PWA-Dateien prüfen
- abschließenden Live-Stand in `PROJECT_HANDOFF.md` dokumentieren

## Separat offen

Die fachlich dialogische Detailhilfe hinter **„Ich brauche Hilfe / Ich finde das nicht“** bleibt ein eigener Arbeitsblock gemäß `ACTIVE_WORK_DETAIL_HELP.md`. Dieser Direkt-Guide-Block erfindet dafür keine Zwischenlogik vorweg.
