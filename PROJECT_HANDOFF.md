# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 6. August 2026  
**Ziel-Build dieses Arbeitsblocks:** `20260806-25`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md` und diese Datei. Danach werden der tatsächliche GitHub-, GitHub-Actions-, GitHub-Pages- und Supabase-Stand geprüft. Veränderliche Zustände niemals nur aus dieser Übergabe übernehmen.

## 1. Projektgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`
- Fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`
- Andere Repositories und Projekte, insbesondere DungeonVeil, Runeborn oder dungeon, niemals öffnen, verändern oder verbinden.
- Keine Echtdaten, Bewohnerdaten, Gesundheitsdaten, Mitarbeiterdaten oder produktiven Zugänge.
- Keine produktive Vivendi-Datenbank, API, nicht dokumentierte Schnittstelle oder Scraping-Verbindung.
- Keine Herstellerlogos, geschützten Handbuchtexte oder internen Screenshots im öffentlichen Repository.

## 2. Verbindlicher GitHub-Arbeitsablauf

1. Vor jedem Eingriff echten Stand auf `main`, offene Pull Requests, Actions und Pages prüfen.
2. Nie direkt auf `main` arbeiten.
3. Eigener Branch pro Arbeitsblock.
4. Änderungen, Tests und Nachweise im Repository speichern.
5. Pull Request gegen `main` erstellen.
6. Nur den exakten PR-Head mergen, wenn alle erforderlichen Checks grün sind.
7. Kein Auto-Merge aktivieren.
8. Branches nicht automatisch löschen.
9. Veröffentlichung ausschließlich über den festen Hauptlink prüfen.
10. `gh-pages` ist der tatsächlich ausgelieferte Pages-Branch und wird durch `.github/workflows/publish-gh-pages.yml` aus `main` synchronisiert.

## 3. Architektur

### Frontend

- Statische PWA auf GitHub Pages
- Einstieg: `index.html`
- Kernlogik: `assets/app.js`
- Dialogzustand: `assets/guide-progress.js`
- strukturierte Auswahl: `assets/clarification-ui.js`
- Sprachfokus: `assets/voice-focus-mode.js`
- Audio-Entsperrung: `assets/mobile-audio-fix.js`
- Sprachdiagnose: `assets/voice-diagnostics.js`
- Updateverwaltung: `assets/update-manager.js`
- Premium-Design und schnelle Sprachvorbereitung ab Build 25:
  - `assets/premium-ui-v25.css`
  - `assets/experience-v25.js`

### Supabase Edge Functions

- `dokohilf-ai`: Kernrouting und Wissensantworten
- `dokohilf-ai-router`: zustandsbasierter Gesprächsrouter für freigegebene Guides
- `dokohilf-tts`: natürliche Sprachausgabe
- `dokohilf-editor`: geschützter Redaktionsbereich

### Wissensbasis

- Freigegebene Guides liegen in Supabase.
- Die KI versteht freie Formulierungen, darf bestätigte Klickwege jedoch nicht erfinden.
- Bedienanweisungen werden ausschließlich aus freigegebenen Guides ausgegeben.
- Freie Antworten innerhalb eines laufenden Guides werden durch den Router interpretiert und anschließend auf den gespeicherten Schrittzustand angewandt.

## 4. Bestätigte Abläufe

### Bericht erfassen

`Berichte → grünes Plus oben links → Pop-up „Neuen Berichtseintrag erfassen“ → Datum/Uhrzeit → Kategorie → Berichtstext → OK`

### Bericht korrigieren, stornieren oder löschen

Berichte werden nicht endgültig gelöscht:

`Berichte → Rechtsklick auf Eintrag → Eintrag bearbeiten → Durchstreichen → Grund → OK → sichtbares Durchstreichen prüfen`

### Durchführungsnachweis öffnen

`Doku → Durchführungsnachweis`

### Durchführung stornieren

`Doku → Durchführungsnachweis → Rechtsklick auf Durchführung → Durchführung stornieren → Grund → OK`

### Vitalwerte – einzelner Wert

1. gewünschten Bewohner auswählen
2. `Doku` oder `Doku erweitert` öffnen
3. `Vitalwerte` wählen
4. oben links auf das grüne Plus klicken
5. im Pop-up den gewünschten Vitalwert auswählen
6. Datum, Uhrzeit und Wert eintragen
7. speichern und Anzeige prüfen

### Vitalwerte – Sammelerfassung

1. gewünschten Bewohner auswählen
2. `Doku` oder `Doku erweitert` öffnen
3. `Vitalwerte` wählen
4. `Sammelerfassung` auswählen
5. mehrere benötigte Vitalwerte auswählen und eintragen
6. speichern und Anzeige prüfen

Sagt ein Nutzer bereits, dass er Vitalwerte **eingeben, eintragen oder erfassen** möchte, darf DokoHilf später nicht erneut nach „erfassen oder ansehen“ fragen. Es darf nur noch zwischen Einzelwert und Sammelerfassung unterscheiden.

### Visite dokumentieren

1. `Doku erweitert`
2. `Visiten`
3. grünes Plus oben links
4. sofort oben in der Leiste `Durchgeführt` auswählen
5. Datum und Uhrzeit
6. Arzt auswählen
7. Feld `Mitarbeiter` immer leer lassen
8. bei `Anforderung` eintragen, wer die Sprechstunde angefordert hat
9. Grund der Sprechstunde, zum Beispiel Kontrollbesuch
10. Ort: Einrichtung, beim Arzt oder telefonisch
11. rechts in `Bemerkung` Inhalt und Ergebnis der Visite eintragen
12. speichern und prüfen, dass die Visite als `durchgeführt` angezeigt wird

Visiten werden immer erst nach erfolgter Durchführung dokumentiert. Niemals den Begriff „abgeschlossen“ verwenden.

### Übergabe

`Analyse → Was war los → Alle anzeigen → Alle ausklappen`

### Notfallblatt

1. gewünschten Bewohner auswählen
2. ganz oben links auf das kleine rote Kreuz klicken
3. Pop-up öffnet sich; `Notfallblatt` ist normalerweise vorausgewählt
4. mit `OK` bestätigen
5. warten, bis das Word-Dokument geöffnet wird; Erstellung kann bis zu etwa drei Minuten dauern
6. Standby währenddessen verhindern

Das rote Kreuz ist ein Element der Dokumentationssoftware. DokoHilf selbst darf keinen irreführenden roten Plus- oder Notfall-Kurzbefehl anzeigen.

## 5. Gesprächsregeln

- Eine einmal klar genannte Absicht bleibt erhalten.
- `Ich möchte Vitalwerte eingeben` bedeutet bereits Erfassen, nicht Nachsehen.
- Normale Bestätigungen wie `Ich habe Blutdruck ausgewählt`, `ist geöffnet` oder `wurde gespeichert` führen genau einen Schritt weiter.
- Verneinungen und Probleme wie `noch nicht`, `geht nicht`, `ich finde das nicht` dürfen nicht als erledigt gelten.
- Frühere Ja-Antworten dürfen keine späteren Schritte überspringen.
- Bei fehlender Voraussetzung muss DokoHilf zum notwendigen früheren Schritt zurückführen.
- Bei unbekanntem Ablauf keinen Klickweg erfinden, sondern transparent auf einen fehlenden freigegebenen Guide hinweisen.

## 6. Sprachmodus

- Der Sprachmodus ist eine fokussierte Vollbildansicht.
- Sichtbar sind nur aktuelle Anweisung, zentrale Sprechanimation, Sprachstatus und notwendige Aktionen.
- Der Chatverlauf darf im Sprachmodus nicht nach unten wegrutschen.
- Nutzer können zum Chat wechseln.
- Natürliche Stimme bleibt `Gacrux`, solange ein späterer bestätigter Hörtest nichts anderes verlangt.
- Die Gerätestimme ist nur ein Ausfallersatz.
- Audio muss durch einen vertrauenswürdigen Nutzertipp auf iPhone und Android entsperrt werden.
- Keine Aussage, eine Stimme sei persönlich angehört worden, wenn nur technische WAV-Prüfungen vorliegen.

## 7. Designvorgabe

Startseite, Sprachmodus und normaler Chat müssen wie ein einheitliches hochwertiges Produkt wirken:

- ruhige, moderne grünbasierte Gestaltung
- klare Typografie und große Touchflächen
- konsistente Abstände, Radien, Schatten und Statusfarben
- keine zusammengewürfelten Einzelkomponenten
- keine irreführenden oder funktionslosen Bedienelemente
- Sprachmodus: starke zentrale Animation und aktuelle Anweisung
- Chat: gut lesbare Nachrichten, klare Eingabe und hochwertige Schnellaktionen
- Hauptmenü: verständliche Auswahl zwischen Sprachgespräch und Chat

Die visuelle Referenz für Build 25 wurde im Arbeitsblock „Premium UI und schnelle Stimme“ erzeugt. Umsetzung erfolgt codebasiert; UI-Text und Bedienelemente bleiben echte HTML-Komponenten.

## 8. Veröffentlichung und Updateverhalten

- `main` ist Integrationsbranch.
- `gh-pages` ist der tatsächlich veröffentlichte Branch.
- `.github/workflows/publish-gh-pages.yml` muss bei jedem Build die vollständige statische App kopieren und den exakten Build-Marker prüfen.
- `version.json`, `index.html`, `service-worker.js`, Asset-Queryparameter und Workflow-Prüfungen müssen dieselbe Build-ID verwenden.
- Öffentlicher Browser und installierte PWA müssen nach Veröffentlichung denselben Build anzeigen.
- Niemals alternative Cache-, Branch- oder Vorschau-URLs gegenüber dem Nutzer nennen.

## 9. Pflichtprüfungen vor Merge

- Syntaxprüfung aller geänderten JavaScript-Dateien
- statische Build- und Dateiprüfungen
- Datenschutz- und Sicherheitsverträge
- Routingregressionen
- Gesprächssequenzen
- Vitalwerte-Intenttests
- Sprachfokus- und mobile Layouttests
- Live-Routing-Smoke-Test
- Live-TTS-Smoke-Test mit gültigem WAV-Header
- sichtbarer Build-Marker im erzeugten Pages-Artefakt
- exakter PR-Head grün
- nach Merge tatsächlichen Inhalt von `gh-pages` und festem Hauptlink prüfen

## 10. Aktueller Arbeitsblock: Build 25

Ziele:

- Startseite, Sprachmodus und Chat vollständig in ein hochwertiges Designsystem überführen
- bestehende gute Gacrux-Stimme beibehalten
- TTS-Latenz deutlich reduzieren
- Begrüßung im Arbeitsspeicher vorladen, ohne Gesprächsinhalte dauerhaft zu speichern
- Flash-TTS als schnellen Primärweg prüfen, Pro nur als Rückfallweg
- In-Memory-Deduplizierung und optionalen Edge-Cache für identische neutrale Anweisungen verwenden
- alle neuen Dateien in Pages-Workflow und Service Worker aufnehmen
- diese Übergabe dauerhaft im Repository halten

## 11. Pflege dieser Datei

Nach jedem größeren Arbeitsblock sind mindestens zu aktualisieren:

- aktueller veröffentlichter Build
- wichtige Architekturänderungen
- neu bestätigte Klickwege
- offene Probleme
- neue harte Regeln und Nutzerentscheidungen
- relevante Pull Requests und Migrationsstände

Diese Datei ersetzt nicht die Prüfung des Live-Stands. Sie verhindert aber, dass ein neuer Chat fachliche Entscheidungen, bestätigte Abläufe und Arbeitsregeln erneut beim Nutzer erfragen muss.
