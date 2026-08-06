# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 6. August 2026  
**Veröffentlichter Build:** `20260806-26`  
**Aktueller Ziel-Build:** `20260806-27`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md` und diese Datei. Danach werden der tatsächliche GitHub-, GitHub-Actions-, GitHub-Pages- und Supabase-Stand geprüft. Veränderliche Zustände niemals nur aus dieser Übergabe übernehmen.

## 1. Projektgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`
- Fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`
- Andere Repositories oder Projekte niemals öffnen, verändern oder verbinden.
- Keine produktive Vivendi-Verbindung, keine nicht dokumentierte Schnittstelle und kein Scraping.
- Keine echten Bewohner-, Gesundheits-, Mitarbeiter- oder Zugangsdaten.
- Nutzerbilder und Screenshots bleiben ausschließlich im jeweiligen Chat und dürfen niemals in GitHub, Supabase, Tests, Artefakte oder App gelangen.

## 2. GitHub-Arbeitsablauf

1. Vor jedem Eingriff `main`, offene Pull Requests, Actions, `gh-pages` und Supabase prüfen.
2. Nie direkt auf `main` arbeiten.
3. Eigener Branch und Pull Request pro Arbeitsblock.
4. Änderungen, Entscheidungen, Tests, Fehler und Restarbeiten im Repository dokumentieren.
5. Nur den vollständig grünen exakten PR-Head manuell mergen.
6. Kein Auto-Merge und keine automatische Branch-Löschung.
7. Nach Merge `main`, `gh-pages`, aktive Edge Functions und festen Hauptlink kontrollieren.
8. Gegenüber dem Nutzer niemals alternative Preview-, Branch-, Cache- oder Query-Links nennen.

## 3. Verbindliche Fachquelle

`CONFIRMED_WORKFLOWS.md` enthält alle bestätigten anonymisierten Klickwege. Supabase-Guides und Routerantworten müssen damit übereinstimmen. Nicht bestätigte Abläufe, Feldnamen oder fachliche Inhalte werden nicht erfunden.

Bestätigt sind:

- Bericht anlegen einschließlich Kategorieauswahl und automatisch verknüpfter Protokolle
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

- statische PWA auf GitHub Pages
- Einstieg: `index.html`
- Kernlogik: `assets/app.js`
- Gesprächszustand: `assets/guide-progress.js`
- strukturierte Auswahl: `assets/clarification-ui.js`
- Sprachfokus: `assets/voice-focus-mode.js`
- Audio-Entsperrung: `assets/mobile-audio-fix.js`
- Updateverwaltung: `assets/update-manager.js`
- Dark-Design: `assets/premium-ui-v27.css`
- kompakte Bedienung und Erststart-Datenschutz: `assets/ux-v27.css` und `assets/ux-v27.js`
- statische und dynamische Sprachausgabe: `assets/experience-v27.js`
- statischer Audio-Katalog: `assets/guide-audio-catalog.json`
- vollständiges Audio-Manifest: `assets/guide-audio-manifest.json`
- Teilfortschritt während der Erzeugung: `assets/guide-audio-manifest.partial.json` und `assets/guide-audio-generation-status.json`
- statische Audios: `assets/audio/guides/*.wav`
- resumierbarer Generator: `scripts/generate-guide-audio.mjs`
- gemeinsame Pages-Erzeugung: `scripts/build-static-site-v27.sh`

### Supabase

- `dokohilf-ai-router`: aktive Version **11**, Marker `conversational-guide-router-v9`
- `dokohilf-tts`: aktive Version **18**
- `dokohilf-editor`: geschützter Redaktionsbereich
- freigegebene Guides: `public.dokohilf_guides`
- Themenzuordnungen: `public.dokohilf_topics`

## 5. Gesprächslogik

- Eine klar genannte Absicht bleibt erhalten.
- `Ich möchte Vitalwerte eingeben` bedeutet bereits Erfassen.
- Bei Vitalwerten wird nur zwischen Einzelwert und Sammelerfassung unterschieden.
- Bestätigungen führen exakt einen Schritt weiter.
- Verneinungen und Probleme gelten nicht als erledigt.
- Ein klar genanntes neues Ziel ersetzt den alten Ablauf sauber.
- Medikationsänderungen werden blockiert; angeboten wird ausschließlich der bestätigte Leseweg.
- Ausgegebene Klickschritte stammen nur aus freigegebenen Guides.
- Routerantworten enthalten `spokenText` und `nextSpokenText`.

## 6. Build 27 – verbindliches Oberflächenziel

- dunkle Grundfläche in Petrol/Schwarz mit grünen und blauen Akzenten
- flache kompakte Kopfzeile
- Hauptmenü mit **Sprechen** und **Schreiben**
- häufige bestätigte Abläufe direkt im Hauptmenü
- einmalige Datenschutzbestätigung beim ersten Start; gespeichert wird nur `dokohilf-privacy-ack-v1=yes`
- keine wiederholten Fantasiedaten-Hinweise in normalen Guide-Schritten
- technischer Datenschutzfilter bleibt vollständig aktiv
- Ablaufsteuerung als schmale Fortschrittszeile
- `Zurück`, `Neu starten` und `Anderer Ablauf` im Drei-Punkte-Menü
- pro Schritt nur **Weiter** und **Ich brauche Hilfe** sichtbar
- Bedienkommandos erscheinen nicht als normale Chatnachrichten
- Mikrofon bleibt im Leerlauf kompakt und wird erst beim Zuhören oder Sprechen groß
- kleine und niedrige iPhones erhalten eine verdichtete Sprachansicht

## 7. Build 27 – statische und dynamische Stimme

Natürliche Stimme: **Gacrux**.

### Statische bekannte Anweisungen

- Datenbasis: 23 freigegebene Guides, 108 Schritte, 92 eindeutige Schritttexte plus Begrüßung
- Ziel: exakt 93 vorproduzierte Gacrux-WAV-Dateien
- Quelle ausschließlich allgemeines `step.text` freigegebener Guides
- Nutzerantworten, Checks, Diktate, Namen, Fall- oder Gesundheitsdaten sind ausgeschlossen
- `assets/experience-v27.js` sucht zuerst eine statische freigegebene Datei
- Service Worker cached die statischen Dateien für schnelle und Offline-Wiedergabe
- Manifest enthält Textschlüssel, Pfad, Größe, SHA-256, Stimme, Modell und Stil
- der Generator verarbeitet höchstens zwölf fehlende Texte je Runde, speichert jede erfolgreiche WAV-Datei und schreibt einen Teilfortschritt
- HTTP 429/502/503/504 oder Timeouts verwerfen keine zuvor erfolgreichen Dateien mehr
- ein Fortschrittscommit startet automatisch die nächste Runde; nach höchstens 24 automatischen Runden bleibt ein ehrlicher harter Blocker bestehen
- Details und enge Datenschutz-Ausnahme: `PREBUILT_AUDIO.md` und `PROJECT_RULES.md`

### Freie Antworten und Erzeugungsdienst

- Primärmodell: `gemini-3.1-flash-tts-preview`
- Fallbackmodell: `gemini-2.5-flash-preview-tts`
- Stil: `natural-spoken-german-colleague-v9-interactions`
- TTS v18 verwendet primär die aktuelle Gemini-Interactions-API `/v1beta/interactions` mit `response_format: audio`
- technischer Rückfallweg: Gemini 2.5 über Interactions, danach der bisherige Generate-Content-Endpunkt
- erfolgreiche Antworten weisen Modell, API-Weg, Stimme, Stil, Cache und Laufzeit in den Response-Headern nach
- Live-TTS wird nur für nicht katalogisierte freie Antworten verwendet
- Browser wartet höchstens rund 1,9 Sekunden; danach startet die lokale Sofortstimme
- dynamische Audios und Gesprächsinhalte bleiben flüchtig

## 8. Veröffentlichung

- `main` ist Integrationsbranch.
- `gh-pages` ist der tatsächlich ausgelieferte Branch.
- `scripts/build-static-site-v27.sh` muss für beide Veröffentlichungswege denselben vollständigen Build erzeugen.
- `version.json`, `index.html`, `service-worker.js`, Asset-Queryparameter und Workflows müssen dieselbe Build-ID enthalten.
- Build 27 darf nur veröffentlicht werden, wenn Manifest und exakt 93 WAV-Dateien im erzeugten Pages-Build liegen.
- der normale PR-Prüflauf erzeugt keine Audios mehr parallel, sondern prüft ausschließlich den vollständig committed Audio-Stand.

## 9. Pflichtprüfungen vor Merge

- Syntaxprüfung aller geänderten JavaScript-Dateien
- statische Build- und Datenschutzverträge
- 165 Routingregressionen und Gesprächssequenzen
- alle bestätigten Fachabläufe
- Vitalwerte-, Zielwechsel- und Medikationssicherheit
- Dark-UI, kompakte Guide-Steuerung und Erststart-Datenschutz
- gültiger RIFF-/WAVE-Header, Dateigröße und SHA-256 für alle 93 statischen Audios
- mobiler Playwright-Render auf 393 × 852 mit künstlicher Oberfläche
- kein horizontaler Überlauf
- kompakte Leerlauf- und größere aktive Mikrofonansicht
- Live-Router und zeitlich begrenzter Live-TTS-Fallback
- Live-TTS-Nachweis mit Gacrux, Modell, Interactions-/Fallback-API, Stil, Cache und WAV-Header
- sichtbarer Build-Marker im Pages-Artefakt
- vollständig grüner exakter PR-Head

## 10. Abgeschlossene Stände

### Fachabläufe

- PR #45 gemergt
- `CONFIRMED_WORKFLOWS.md` erstellt
- Migration `20260806153000_confirmed_workflows_blocks_1_4.sql` angewandt

### Build 26

- PR #46 gemergt
- veröffentlichter Build `20260806-26`
- Router v9 und TTS v16 aktiviert

## 11. Aktiver Arbeitsstand Build 27

- finaler Branch: `feat/dark-premium-static-guide-audio-v27`
- finaler Draft-PR: **#50**
- PR #49 wurde als vollständig ersetzt geschlossen; sein Branch wurde nicht gelöscht
- Ziel-Build: `20260806-27`
- TTS v18 mit Gemini Interactions ist aktiv
- Migration zur Entfernung wiederholter Übungshinweise wurde angewandt
- Dark-UI, kompakte Steuerung, Erststart-Datenschutz, statische Audioarchitektur, resumierbarer Generator, Manifesttests, gemeinsamer Build und mobile Renderprüfung sind im Branch angelegt
- konkurrierende All-or-nothing-Audio-Workflows wurden entfernt; einziger Generator ist `.github/workflows/direct-generate-audio-v27.yml`
- **Offener harter Merge-Blocker:** `assets/guide-audio-manifest.json` und alle 93 WAV-Dateien müssen tatsächlich vollständig im Branch liegen und anschließend im exakten PR-Head grün geprüft sein
- bis dahin bleibt PR #50 als Draft offen und wird nicht gemergt

## 12. Pflege dieser Datei

Nach jedem größeren Arbeitsblock sind mindestens zu aktualisieren:

- veröffentlichter und Ziel-Build
- Architekturänderungen
- bestätigte Klickwege
- offene Probleme und harte Blocker
- neue Regeln und Nutzerentscheidungen
- Pull Requests, Funktionsversionen und Migrationen
- tatsächliche Test- und Veröffentlichungsnachweise

Diese Datei ersetzt niemals die Prüfung des echten Live-Stands. Sie verhindert, dass ein neuer Chat Entscheidungen und bestätigte Abläufe erneut beim Nutzer erfragen muss.
