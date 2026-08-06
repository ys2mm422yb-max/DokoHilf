# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 6. August 2026  
**Aktueller Ziel-Build:** `20260806-26`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md` und diese Datei. Danach werden der tatsächliche GitHub-, GitHub-Actions-, GitHub-Pages- und Supabase-Stand geprüft. Veränderliche Zustände niemals nur aus dieser Übergabe übernehmen.

## 1. Projektgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`
- Fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`
- Andere Repositories und Projekte, insbesondere DungeonVeil, Runeborn oder dungeon, niemals öffnen, verändern oder verbinden.
- Keine Echtdaten, Bewohnerdaten, Gesundheitsdaten, Mitarbeiterdaten oder produktiven Zugänge.
- Keine produktive Vivendi-Datenbank, API, nicht dokumentierte Schnittstelle oder Scraping-Verbindung.
- Keine Herstellerlogos, geschützten Handbuchtexte oder internen Screenshots im öffentlichen Repository.
- Die zur Bestätigung verwendeten Bilder bleiben ausschließlich im jeweiligen Chat. Sie dürfen niemals in GitHub, Supabase, Issues, Pull Requests, Tests, Artefakte oder die öffentliche App übernommen werden.
- In Repository und Supabase werden nur anonymisierte, selbst formulierte Klickwege und künstliche Testfälle gespeichert.

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

## 3. Verbindliche Fachquelle

`CONFIRMED_WORKFLOWS.md` enthält alle vom Nutzer bestätigten anonymisierten Klickwege. Bei einem Widerspruch mit älteren Texten gilt diese Datei als fachliche Quelle. Supabase-Guides müssen mit ihr übereinstimmen.

Aktuell bestätigt sind:

- Bericht anlegen einschließlich vorgelagerter Kategorieauswahl
- automatisch verknüpfte Protokolle bei `Kontakt – alles außer Arzt` und `Sturzereignis`
- Bericht durchstreichen
- Folgebericht erstellen
- falsch abgezeichnete Durchführung stornieren
- Visite mit vorgeschalteter Bewohnerauswahl und Status durchgeführt
- Vitalwerte als getrennte Einzel- und Sammelerfassung
- An-/Abwesenheit mit harter Von-/Bis-Regel
- Medikation ausschließlich ansehen
- Formulare anlegen
- Notfallblatt aufrufen
- Übergabe über `Was war los?`

## 4. Architektur

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
- Premium-Grunddesign: `assets/premium-ui-v25.css`
- Build-26-Sprachlayout ohne Text-/Mikrofonüberlappung: `assets/premium-ui-v26.css`
- Build-26-Sprachvorbereitung und flüchtiges Vorladen: `assets/experience-v26.js`

### Supabase Edge Functions

- `dokohilf-ai`: Kernrouting und Wissensantworten
- `dokohilf-ai-router`: zustandsbasierter Gesprächsrouter für freigegebene Guides
- `dokohilf-tts`: natürliche Sprachausgabe
- `dokohilf-editor`: geschützter Redaktionsbereich

### Wissensbasis

- Freigegebene Guides liegen in `public.dokohilf_guides`.
- Themenzuordnungen liegen in `public.dokohilf_topics`.
- Die KI darf bestätigte Klickwege niemals erfinden oder verändern.
- Freie Formulierungen werden auf freigegebene Ziele geroutet.
- Innerhalb eines laufenden Guides interpretiert Gemini nur die Bedeutung der Nutzerantwort. Die ausgegebenen Schritte stammen weiterhin ausschließlich aus freigegebenen Guides.

## 5. Gesprächslogik ab Router v9

Supabase-Funktion `dokohilf-ai-router`, aktive Zielversion: **11** mit Header `conversational-guide-router-v9`.

Verbindliches Verhalten:

- Eine einmal klar genannte Absicht bleibt erhalten.
- `Ich möchte Vitalwerte eingeben` bedeutet bereits Erfassen, nicht Nachsehen.
- Bei Vitalwerten wird nur noch zwischen Einzelwert und Sammelerfassung unterschieden.
- Normale Bestätigungen wie `Ich habe Blutdruck ausgewählt`, `ist geöffnet` oder `wurde gespeichert` führen genau einen Schritt weiter.
- Verneinungen und Probleme wie `noch nicht`, `geht nicht` oder `ich finde das nicht` gelten nicht als erledigt.
- Frühere Ja-Antworten dürfen keine späteren Schritte überspringen.
- Ein eindeutig genanntes neues Ziel ersetzt den alten Ablauf sauber.
- Mehrdeutige Korrekturen werden strukturiert geklärt.
- Unbekannte Abläufe werden nicht erfunden.
- Medikationsänderungen werden nicht angeleitet; angeboten wird ausschließlich der bestätigte Leseweg.
- Router-Antworten enthalten `spokenText` für die kurze Sprachausgabe und `nextSpokenText` zum Vorladen des nächsten bekannten Schritts.
- Gemini darf nur aus der Liste freigegebener Guide-Slugs auswählen und erhält ein kurzes Zeitlimit.

## 6. Sprachmodus ab Build 26

Natürliche Stimme: **Gacrux**.

Supabase-Funktion `dokohilf-tts`, aktive Zielversion: **16**.

Technik:

- Primärmodell: `gemini-2.5-flash-preview-tts` für schnelleren Start
- Fallback: `gemini-2.5-pro-preview-tts`
- Stil: `natural-spoken-german-colleague-v7-fast-start`
- serverseitiger flüchtiger Arbeitsspeicher-Cache für identische kurze Anweisungen
- clientseitiger flüchtiger Arbeitsspeicher-Cache
- der nächste bekannte Guide-Schritt wird bereits vorbereitet, während der aktuelle Schritt läuft
- sichtbare Anleitung bleibt vollständig; gesprochen wird nur die aktuelle Anweisung ohne die abschließende Kontrollfrage
- keine dauerhafte Speicherung von Audio oder Gesprächsinhalten
- Gerätestimme nur als Ausfallersatz
- Audio-Entsperrung erfolgt durch einen vertrauenswürdigen Nutzertipp auf iPhone und Android
- Keine Behauptung, eine Stimme persönlich angehört zu haben, wenn nur WAV, Header, Modell und Laufzeit technisch geprüft wurden.

### Externer TTS-Ausfall

- Der externe Gemini-TTS-Anbieter antwortete am 6. August 2026 in mehreren unveränderten Wiederholungen ausschließlich mit HTTP 502.
- Dieser Fremddienst-Ausfall wird im Actions-Artefakt dokumentiert; es liegt für diesen Lauf kein neuer gültiger WAV-Nachweis vor.
- Statische TTS-, Modell-, Stimmen-, Cache-, Fallback- und Datenschutztests bleiben verpflichtend und sind grün.
- Eine erfolgreiche, aber technisch falsche Antwort – falscher Inhaltstyp, WAV-Header, Stimme, Modell, Stil, Cache-Nachweis oder zu hohe Laufzeit – bleibt ein harter Testfehler.
- Ausschließlich dokumentierte HTTP-429/502/503/504- oder Timeout-Ausfälle nach mehreren unveränderten Wiederholungen dürfen den ansonsten vollständig grünen exakten Head nicht blockieren.

## 7. Sprachlayout und Design ab Build 26

- Startseite, Chat und Sprachmodus bleiben ein einheitliches hochwertiges Produkt.
- Die aktuelle Anweisung und die Mikrofonanimation liegen in getrennten Grid-Bereichen.
- Lange Anweisungen scrollen innerhalb ihrer Karte und dürfen die Animation nicht überdecken.
- Auf kleinen oder niedrigen iPhones wird die Animation automatisch verkleinert.
- Der fehlerhafte animierte Punkttext hinter dem Ladehinweis ist entfernt.
- Der Ladehinweis lautet kurz `Stimme lädt`; die sichtbare Anweisung ist währenddessen bereits lesbar.
- Große Touchflächen, klare Typografie, ruhige grünbasierte Gestaltung und konsistente Abstände bleiben verbindlich.

## 8. Datenschutz und Sicherheitsregeln

- Keine echten Namen, Berichte, Diagnosen, Medikamente, Messwerte oder anderen personenbezogenen Inhalte in App, Tests oder Dokumentation.
- Testfälle verwenden ausschließlich allgemeine Bedienfragen und Fantasiedaten.
- Keine persistente Gesprächshistorie im Browser.
- Keine persistente Audiospeicherung im Browser oder in Supabase.
- Medikation ist in DokoHilf ein reiner Leseweg.
- Nicht bestätigte Formularfelder oder fachliche Inhalte werden nicht erfunden.

## 9. Veröffentlichung und Updateverhalten

- `main` ist Integrationsbranch.
- `gh-pages` ist der tatsächlich veröffentlichte Branch.
- `.github/workflows/pages.yml` validiert Build, Router, TTS, Datenschutz, Dialoge und Layout.
- `.github/workflows/publish-gh-pages.yml` kopiert die vollständige statische App aus `main` nach `gh-pages`.
- `version.json`, `index.html`, `service-worker.js`, Asset-Queryparameter und Workflow-Prüfungen müssen dieselbe Build-ID verwenden.
- Öffentlicher Browser und installierte PWA müssen nach Veröffentlichung denselben Build anzeigen.
- Niemals alternative Cache-, Branch- oder Vorschau-URLs gegenüber dem Nutzer nennen.

## 10. Pflichtprüfungen vor Merge

- Syntaxprüfung aller geänderten JavaScript-Dateien
- statische Build- und Dateiprüfungen
- Datenschutz- und Sicherheitsverträge
- 165 Routingregressionen und Gesprächssequenzen
- Tests aller bestätigten Arbeitsabläufe
- Vitalwerte-Intenttests
- Zielwechsel- und Medikationssicherheitstests
- Sprachfokus- und mobile Layouttests
- Kurzbildschirmtests gegen Text-/Mikrofonüberlappung
- stabiler Live-Routing-Test gegen die aktive Edge Function
- Live-TTS-Test mit gültigem WAV-Header, Gacrux, Modell- und Cache-Nachweis; bei einem dokumentierten externen HTTP-429/502/503/504- oder Timeout-Ausfall gelten die Regeln aus Abschnitt 6
- sichtbarer Build-Marker im erzeugten Pages-Artefakt
- exakter PR-Head grün
- nach Merge tatsächlichen Inhalt von `main`, `gh-pages` und festem Hauptlink prüfen

## 11. Arbeitsblöcke und Stand

### Blöcke 1–4: Fachwissen und Standardabläufe

- Branch: `feat/confirmed-workflows-blocks-1-4`
- PR: `#45`
- Merge-Commit: `e5446014a6e4e6941101d4d1746a02e49d951729`
- Migration: `20260806153000_confirmed_workflows_blocks_1_4.sql`
- Supabase-Migration angewandt
- `CONFIRMED_WORKFLOWS.md` erstellt

### Blöcke 5–9: KI, Sprache, Layout, Gesamtprüfung und Veröffentlichung

- Branch: `feat/intelligent-router-fast-voice-layout-v26`
- PR: `#46`
- Ziel-Build: `20260806-26`
- Router v9 und TTS v16 sind aktiv.
- Geprüfter Head vor dieser Übergabeergänzung: `6dff72269ffc7c317d4915cc89b8eb34b30264e1`.
- Prüfergebnis: 165/165 Routingfälle, 3/3 Gesprächssequenzen, 12/12 Workflow-Marker, 99/99 Tests, 14/14 Live-Dialoge und Screenshot-Regressionsprüfung grün.
- TTS-Anbieter HTTP 502; fehlender WAV-Nachweis transparent als Artefakt dokumentiert.
- Nach dieser Übergabeergänzung den neuen exakten Head erneut prüfen. Danach Merge, `main`, `gh-pages` und öffentlicher Hauptlink kontrollieren.

## 12. Pflege dieser Datei

Nach jedem größeren Arbeitsblock sind mindestens zu aktualisieren:

- aktueller veröffentlichter Build
- wichtige Architekturänderungen
- neu bestätigte Klickwege
- offene Probleme
- neue harte Regeln und Nutzerentscheidungen
- relevante Pull Requests, Funktionsversionen und Migrationsstände

Diese Datei ersetzt nicht die Prüfung des Live-Stands. Sie verhindert, dass ein neuer Chat fachliche Entscheidungen, bestätigte Abläufe und Arbeitsregeln erneut beim Nutzer erfragen muss.
