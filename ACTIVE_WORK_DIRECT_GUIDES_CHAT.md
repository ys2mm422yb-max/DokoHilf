# Aktiver Arbeitsstand – direkte häufige Anleitungen und Chatdesign

**Stand:** 7. August 2026  
**Status:** Umsetzung abgeschlossen, Validierung ausstehend  
**Build:** `20260806-27`  
**Branch:** `feature/direct-guides-chat-polish-20260807`

## Nutzerwunsch

Der Nutzer hat zwei Produktänderungen ausdrücklich bestätigt:

1. Der Schreibmodus soll ruhiger und klarer wie ein eigener Chat wirken statt wie eine Mischung aus Formular, großer Überschrift und Chat.
2. Ein Tipp auf einen Eintrag unter **„Häufige Abläufe“** soll nicht zuerst einen normalen Chat öffnen. Stattdessen soll direkt die **vollständige Schritt-für-Schritt-Anleitung** des ausgewählten bestätigten Ablaufs sichtbar werden.

Die zugrunde liegenden lokalen Bilder bleiben ausschließlich im Chat und werden nicht in GitHub, Supabase, Tests oder Artefakte übernommen.

## Fachquelle

Direkte Anleitungen stammen ausschließlich aus `CONFIRMED_WORKFLOWS.md`. Vor Umsetzung wurden zusätzlich die aktuell freigegebenen Supabase-Guides geprüft. Keine neue fachliche Navigation wurde erfunden.

Direkt verfügbar:

- Bericht anlegen
- Visite anlegen
- Vitalwerte erfassen
- An-/Abwesenheit
- Medikation ansehen
- Formular erstellen

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
- Rückkehr führt direkt ins Hauptmenü
- keine KI-Anfrage ist nötig, um eine häufige Anleitung zu öffnen
- keine Nutzer- oder Falldaten werden gespeichert

### `index.html`

Die sechs Hauptmenü-Schaltflächen unter `Häufige Abläufe` verwenden jetzt `data-direct-guide` statt `data-prompt`.

Der Schreibmodus erhält eine kompaktere Kopie:

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

`tests/direct-guides-v27.test.mjs` prüft:

- exakt sechs direkte häufige Abläufe
- kein alter Bericht-/Visite-Chat-Prompt auf diesen Hauptmenü-Schaltflächen
- bestätigte Bericht-/Visite-Inhalte
- ausschließlich zwei Vitalwerte-Varianten
- harte An-/Abwesenheits- und Medikationsregeln
- eigener Direkt-Guide-Modus ohne Chat/Composer
- kompakter Chatvertrag
- PWA-Core-Cache und Revisionsmarker

### Echter iPhone-Render

`scripts/mobile-render-v27.mjs` wurde erweitert. Auf 393 × 852 muss der Test jetzt tatsächlich:

1. `Bericht anlegen` im Hauptmenü anklicken
2. direkt die vollständige 12-Schritt-Anleitung sehen
3. bestätigen, dass der Chat-Arbeitsbereich verborgen bleibt
4. horizontalen Überlauf ausschließen
5. Vitalwerte öffnen und genau zwei Varianten sehen
6. die sechs Schritte der Sammelerfassung sehen
7. anschließend den Schreibmodus öffnen
8. den kompakten Chatkopf und die Begrüßung prüfen
9. danach weiterhin den bestehenden schrittweisen Chat und den Sprachmodus testen

## Noch erforderlich

- Pull Request öffnen
- exakten Head vollständig über beide DokoHilf-Workflows prüfen
- Fehler nur auf diesem Branch korrigieren
- nur vollständig grünen exakten Head manuell mergen
- Branch nicht automatisch löschen
- nach Merge `main`, `gh-pages`, festen Hauptlink und PWA-Dateien prüfen
- abschließenden Live-Stand in `PROJECT_HANDOFF.md` dokumentieren

## Separat offen

Die fachlich dialogische Detailhilfe hinter **„Ich brauche Hilfe / Ich finde das nicht“** bleibt ein eigener Arbeitsblock gemäß `ACTIVE_WORK_DETAIL_HELP.md`. Dieser Direkt-Guide-Block erfindet dafür keine Zwischenlogik vorweg.
