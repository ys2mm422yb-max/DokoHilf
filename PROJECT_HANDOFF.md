# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 6. August 2026  
**Aktueller Ziel-Build:** `20260806-27`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md` und diese Datei. Danach werden der tatsächliche GitHub-, GitHub-Actions-, GitHub-Pages- und Supabase-Stand geprüft. Veränderliche Zustände niemals nur aus dieser Übergabe übernehmen.

## 1. Projektgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`
- Fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`
- Andere Repositories oder Projekte niemals öffnen, verändern oder verbinden.
- Keine produktive Vivendi-Datenbank, API, nicht dokumentierte Schnittstelle oder Scraping-Verbindung.
- Keine echten Bewohner-, Gesundheits-, Mitarbeiter- oder Zugangsdaten in App, Tests, Dokumentation oder Logs.
- Die zur Bestätigung verwendeten Bilder bleiben ausschließlich im jeweiligen Chat. Sie dürfen niemals in GitHub, Supabase, Issues, Pull Requests, Tests, Artefakte oder die öffentliche App übernommen werden.
- In Repository und Supabase werden nur anonymisierte, selbst formulierte Klickwege und künstliche Testfälle gespeichert.

## 2. Verbindlicher GitHub-Arbeitsablauf

1. Vor jedem Eingriff echten Stand von `main`, offenen Pull Requests, Actions, `gh-pages` und Supabase prüfen.
2. Nie direkt auf `main` arbeiten.
3. Eigener Branch pro Arbeitsblock.
4. Änderungen, Tests und Nachweise im Repository speichern.
5. Pull Request gegen `main` erstellen.
6. Nur den exakten PR-Head mergen, wenn alle verpflichtenden Checks grün sind.
7. Kein Auto-Merge aktivieren.
8. Branches nicht automatisch löschen.
9. Nach Merge `main`, `gh-pages`, aktive Edge Functions und festen Hauptlink kontrollieren.
10. Niemals alternative Vorschau-, Cache-, Branch- oder Query-Links gegenüber dem Nutzer nennen.

## 3. Verbindliche Fachquelle

`CONFIRMED_WORKFLOWS.md` ist die fachliche Quelle für alle vom Nutzer bestätigten anonymisierten Klickwege. Supabase-Guides und Routerantworten müssen damit übereinstimmen. Nicht bestätigte Klickwege, Feldnamen oder fachliche Inhalte werden nicht erfunden.

Bestätigt sind unter anderem:

- Bericht anlegen
- automatisch verknüpfte Protokolle bei `Kontakt – alles außer Arzt` und `Sturzereignis`
- Bericht durchstreichen
- Folgebericht erstellen
- falsch abgezeichnete Durchführung stornieren
- Visite mit vorgeschalteter Bewohnerauswahl und Status **durchgeführt**
- Vitalwerte als getrennte Einzel- und Sammelerfassung
- An-/Abwesenheit mit harter Von-/Bis-Regel
- Medikation ausschließlich ansehen
- Formulare anlegen
- Notfallblatt öffnen
- Übergabe über `Analyse → Was war los? → Alle anzeigen → Alles ausklappen`

## 4. Architektur

### Frontend

- Statische PWA auf GitHub Pages
- Einstieg: `index.html`
- Kernlogik: `assets/app.js`
- Gesprächszustand: `assets/guide-progress.js`
- strukturierte Auswahl: `assets/clarification-ui.js`
- Sprachfokus: `assets/voice-focus-mode.js`
- Audio-Entsperrung: `assets/mobile-audio-fix.js`
- Updateverwaltung: `assets/update-manager.js`
- Premium-Grunddesign: `assets/premium-ui-v25.css`
- Build-26-Sprachlayout: `assets/premium-ui-v26.css`
- Build-27-Dark-Design: `assets/premium-ui-v27.css`
- Build-27-Dialog- und Sprachvorbereitung: `assets/experience-v27.js`
- Build-27-Kompaktsteuerung und Sofortfallback: `assets/ux-v27.css` und `assets/ux-v27.js`

### Supabase Edge Functions

- `dokohilf-ai`: Kernrouting und Wissensantworten
- `dokohilf-ai-router`: zustandsbasierter Gesprächsrouter
- `dokohilf-tts`: natürliche Sprachausgabe
- `dokohilf-editor`: geschützter Redaktionsbereich

### Wissensbasis

- Freigegebene Guides liegen in `public.dokohilf_guides`.
- Themenzuordnungen liegen in `public.dokohilf_topics`.
- Freie Formulierungen werden auf freigegebene Ziele geroutet.
- Innerhalb laufender Guides stammen ausgegebene Schritte ausschließlich aus freigegebenen Guides.

## 5. Gesprächslogik

Aktive Routerfunktion: `dokohilf-ai-router`, Version **11**, Header `conversational-guide-router-v9`.

Verbindliches Verhalten:

- Eine klar genannte Absicht bleibt erhalten.
- `Ich möchte Vitalwerte eingeben` bedeutet bereits Erfassen, nicht Nachsehen.
- Bei Vitalwerten wird nur noch zwischen Einzelwert und Sammelerfassung unterschieden.
- Bestätigungen führen genau einen Schritt weiter.
- Verneinungen und Probleme gelten nicht als erledigt.
- Ein klar genanntes neues Ziel ersetzt den alten Ablauf sauber.
- Mehrdeutige Korrekturen werden strukturiert geklärt.
- Medikationsänderungen werden nicht angeleitet; angeboten wird ausschließlich der bestätigte Leseweg.
- Routerantworten enthalten `spokenText` und `nextSpokenText` zum Vorladen der nächsten Sprachausgabe.

## 6. Build 27 – dunkles Design und vereinfachte Bedienung

Ziel: Hauptmenü, Chat und Sprachmodus wirken wie ein zusammenhängendes hochwertiges Produkt.

Verbindlich ab Build 27:

- dunkle Grundfläche in Petrol/Schwarz mit grünen und blauen Akzenten
- kompakte Kopfzeile
- Hauptmenü mit zwei klaren Wegen: **Sprechen** und **Schreiben**
- sechs häufige Abläufe direkt im Hauptmenü
- nur ein kompakter Datenschutz-Hinweis im Hauptmenü
- keine wiederholten Fantasiedaten-Sätze in normalen Guide-Schritten
- Ablaufkarte im Chat als schmale Fortschrittszeile
- `Zurück`, `Neu starten` und `Anderer Ablauf` liegen im Drei-Punkte-Menü
- pro Schritt nur zwei sichtbare Hauptaktionen: **Weiter** und **Ich brauche Hilfe**
- Bedienkommandos wie `weiter` werden nicht als normale Chatnachricht dargestellt
- lange Sprachhinweise dürfen Mikrofonanimation und Bedienelemente nicht überdecken
- auf kleinen beziehungsweise niedrigen iPhones wird die Sprachansicht automatisch verdichtet

Der Datenschutzfilter bleibt vollständig aktiv. Entfernt wird nur die störende Wiederholung desselben Übungshinweises in nahezu jedem Schritt.

## 7. Build 27 – Sprache

Natürliche Stimme: **Gacrux**.

Aktive Supabase-Funktion: `dokohilf-tts`, Version **17**.

Technik:

- Primärmodell: `gemini-3.1-flash-tts-preview`
- kompatibler Rückfallweg: `gemini-2.5-flash-preview-tts`
- Stil: `natural-spoken-german-colleague-v8-low-latency`
- identische gleichzeitige Anfragen werden serverseitig zusammengeführt
- flüchtiger Servercache: höchstens 96 Einträge, zwei Stunden Lebensdauer
- flüchtiger Clientcache und Vorladen des nächsten bekannten Guide-Schritts
- Begrüßung und häufige erste Schritte werden im Hintergrund vorbereitet
- der aktuelle Sprachversuch wartet im Browser höchstens 1,9 Sekunden
- ist Gacrux bis dahin nicht bereit, startet sofort die Gerätestimme; die natürliche Anfrage darf im Hintergrund den flüchtigen Cache füllen
- keine dauerhafte Speicherung von Audio oder Gesprächsinhalten
- keine Behauptung, eine Stimme persönlich angehört zu haben, wenn nur WAV, Header, Modell und Laufzeit technisch geprüft wurden

## 8. Datenschutz und Sicherheit

- Keine echten Namen, Berichte, Diagnosen, Medikamente, Messwerte oder personenbezogenen Inhalte verwenden.
- Keine persistente Gesprächshistorie im Browser.
- Keine persistente Audiospeicherung im Browser oder in Supabase.
- Medikation ist in DokoHilf ein reiner Leseweg.
- Nicht bestätigte Formularfelder werden nicht erfunden.
- Der sichtbare Hauptmenü-Hinweis ersetzt nicht den technischen Schutzfilter.

## 9. Veröffentlichung und Updateverhalten

- `main` ist Integrationsbranch.
- `gh-pages` ist der tatsächlich ausgelieferte Branch.
- `.github/workflows/pages.yml` validiert Build, Router, TTS, Datenschutz, Dialoge und Layout.
- `.github/workflows/publish-gh-pages.yml` synchronisiert die vollständige statische App aus `main` nach `gh-pages`.
- `version.json`, `index.html`, `service-worker.js`, Asset-Queryparameter und Workflows müssen dieselbe Build-ID verwenden.
- Browser und installierte PWA müssen nach Veröffentlichung denselben Build anzeigen.

## 10. Pflichtprüfungen vor Merge

- Syntaxprüfung aller geänderten JavaScript-Dateien
- statische Build- und Dateiprüfungen
- Datenschutz- und Sicherheitsverträge
- 165 Routingregressionen und Gesprächssequenzen
- Tests aller bestätigten Arbeitsabläufe
- Vitalwerte-, Zielwechsel- und Medikationssicherheitstests
- Dark-UI- und Kompaktsteuerungstests
- mobile Sprachlayouttests
- Live-Routing-Test gegen die aktive Edge Function
- Live-TTS-Test mit gültigem WAV-Header, Gacrux, Modell-, Stil-, Cache- und Laufzeitnachweis
- dokumentierte externe HTTP-429/502/503/504- oder Timeout-Ausfälle dürfen nur nach unveränderten Wiederholungen als Fremddienst-Ausfall behandelt werden
- sichtbarer Build-Marker im Pages-Artefakt
- exakter PR-Head grün

## 11. Arbeitsstände

### Blöcke 1–4: bestätigte Fachabläufe

- PR `#45`, gemergt
- Merge-Commit `e5446014a6e4e6941101d4d1746a02e49d951729`
- `CONFIRMED_WORKFLOWS.md` erstellt
- Migration `20260806153000_confirmed_workflows_blocks_1_4.sql` angewandt

### Blöcke 5–9: intelligente Dialoge und Build 26

- PR `#46`, gemergt
- Merge-Commit `374969932028a7f47aea0bbcc4b7f31d23bae441`
- Build `20260806-26` veröffentlicht
- Router v9 und TTS v16 aktiviert

### Build 27: Dark-UI, Sofortstimme und reduzierte Hinweise

- Branch: `feat/dark-premium-fast-voice-v27`
- Ziel-Build: `20260806-27`
- TTS v17 ist aktiv.
- Migration `remove_repeated_exercise_notices_v2` wurde im freigegebenen Supabase-Projekt erfolgreich angewandt.
- Vor Merge muss der exakte PR-Head vollständig grün sein.
- Nach Merge sind `main`, `gh-pages`, aktiver TTS-Stand und fester Hauptlink zu kontrollieren.

## 12. Pflege dieser Datei

Nach jedem größeren Arbeitsblock sind mindestens zu aktualisieren:

- aktueller veröffentlichter Build
- wichtige Architekturänderungen
- neu bestätigte Klickwege
- offene Probleme
- neue harte Regeln und Nutzerentscheidungen
- relevante Pull Requests, Funktionsversionen und Migrationsstände

Diese Datei ersetzt niemals die Prüfung des echten Live-Stands. Sie verhindert, dass ein neuer Chat fachliche Entscheidungen, bestätigte Abläufe und Arbeitsregeln erneut beim Nutzer erfragen muss.
