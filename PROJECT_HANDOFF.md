# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 6. August 2026  
**Veröffentlichter Build:** `20260806-26`  
**Aktueller Ziel-Build:** `20260806-27`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md` und diese Datei. Danach werden der tatsächliche GitHub-, GitHub-Actions-, GitHub-Pages- und Supabase-Stand geprüft. Veränderliche Zustände niemals nur aus dieser Übergabe übernehmen.

## 1. Projektgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`
- Region: Frankfurt, `eu-central-1`
- Fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`
- Andere Repositories und Supabase-Projekte niemals öffnen, verändern oder verbinden.
- Keine produktive Verbindung zur Dokumentationssoftware, keine nicht dokumentierten Schnittstellen und kein Scraping.
- Keine echten Bewohner-, Gesundheits-, Mitarbeiter- oder Zugangsdaten.
- Nutzerbilder und Screenshots bleiben ausschließlich im jeweiligen Chat. Sie dürfen niemals in GitHub, Supabase, Tests, Artefakte oder die App gelangen.

## 2. Verbindlicher GitHub-Ablauf

1. Vor jedem Eingriff `main`, offene Pull Requests, Actions, `gh-pages` und Supabase prüfen.
2. Nie direkt auf `main` arbeiten.
3. Eigener Branch und Pull Request pro Arbeitsblock.
4. Änderungen, Entscheidungen, Tests, Fehler und Restarbeiten dauerhaft im Repository dokumentieren.
5. Nur den vollständig grünen exakten PR-Head manuell mergen.
6. Kein Auto-Merge und keine automatische Branch-Löschung.
7. Nach Merge `main`, `gh-pages`, aktive Edge Functions und den festen Hauptlink kontrollieren.
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

## 4. Architektur des Ziel-Builds 27

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
- Weiterleitung und Gerätecache des privaten Audiokatalogs: `assets/voice-diagnostics.js`
- statischer Audio-Textkatalog: `assets/guide-audio-catalog.json`
- gemeinsamer Pages-Build: `scripts/build-static-site-v27.sh`
- mobile Renderprüfung: `scripts/mobile-render-v27.mjs`

Der öffentliche Pages-Build enthält keine WAV-Binärdateien und kein lokales Audio-Manifest. Freigegebene Guide-Audios werden aus einem privaten Supabase-Bucket über einen kontrollierten Leseendpunkt ausgeliefert und auf dem Gerät gecacht.

### Supabase

Aktiv und live nachgeprüft:

- `dokohilf-ai-router`: Version **11**, Marker `conversational-guide-router-v9`
- `dokohilf-tts`: Version **20**
- `dokohilf-guide-audio`: Version **1**, kontrollierter Manifest- und WAV-Leseendpunkt
- `dokohilf-guide-audio-build`: Version **2**, intern token-geschützter Builder
- `dokohilf-editor`: Version **1**, JWT-geschützter Redaktionsbereich
- freigegebene Guides: `public.dokohilf_guides`
- Themenzuordnungen: `public.dokohilf_topics`
- Audio-Registry: `public.dokohilf_static_guide_audio`
- interner Builderzustand: `public.dokohilf_internal_build_control`
- privater Storage-Bucket: `dokohilf-guide-audio`
- temporäre Diagnose-, Export-, Batch-, Store- und Snapshot-Endpunkte sind neutralisiert und antworten nur noch HTTP 410

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

## 6. Verbindliches Oberflächenziel Build 27

- dunkle Grundfläche in Petrol/Schwarz mit grünen und blauen Akzenten
- flache kompakte Kopfzeile
- Hauptmenü mit **Sprechen** und **Schreiben**
- häufige bestätigte Abläufe direkt im Hauptmenü
- einmalige Datenschutzbestätigung beim ersten Start; gespeichert wird ausschließlich `dokohilf-privacy-ack-v1=yes`
- keine wiederholten Fantasiedaten-Hinweise in normalen Guide-Schritten
- technischer Datenschutzfilter bleibt vollständig aktiv
- Ablaufsteuerung als schmale Fortschrittszeile
- `Zurück`, `Neu starten` und `Anderer Ablauf` im Drei-Punkte-Menü
- pro Schritt nur **Weiter** und **Ich brauche Hilfe** sichtbar
- Bedienkommandos erscheinen nicht als normale Chatnachrichten
- Mikrofon bleibt im Leerlauf kompakt und wird erst beim Zuhören oder Sprechen groß
- kleine und niedrige iPhones erhalten eine verdichtete Sprachansicht
- Sprachfokus zeigt `.voice-focus-stage`; der alte `#workspace` bleibt darin verborgen

## 7. Sprache

Natürliche Stimme: **Gacrux**.

### TTS v20

Der Fehler von TTS v19 wurde behoben: Das rohe Gemini-Interactions-REST-Audio liegt zuverlässig in `steps[].content[]`, nicht zwingend im SDK-Komfortfeld `output_audio`.

TTS v20:

- liest das rohe REST-Audio über Parser `raw-steps-content-v1`
- akzeptiert kompatible `inlineData`- und `inline_data`-Strukturen
- wandelt PCM in gültige RIFF/WAVE-Dateien um
- gibt echte Providerstatus 429/502/503/504 weiter
- weist Stimme, Modell, API-Weg, Parser, Stil, Cache und Laufzeit in Response-Headern nach
- verwendet primär `gemini-3.1-flash-tts-preview`
- verwendet als Fallback `gemini-2.5-flash-preview-tts`
- Stil: `natural-spoken-german-colleague-v10-rest-audio`

Bereits nachgewiesener gültiger Live-Abruf:

- HTTP 200
- `Content-Type: audio/wav`
- 101804 Bytes
- Stimme `Gacrux`
- Modell `gemini-3.1-flash-tts-preview`
- API `interactions-v1beta`
- Parser `raw-steps-content-v1`
- gültiger RIFF/WAVE-Anfang

### Statische freigegebene Anweisungen

- Datenbasis: 23 freigegebene Guides, 108 Schritte, 92 eindeutige Schritttexte plus Begrüßung
- Zielbestand: exakt 93 geprüfte Gacrux-WAV-Dateien
- Quelle ausschließlich allgemeines `step.text` freigegebener Guides
- Nutzerantworten, Checks, Diktate, Namen, Fall- und Gesundheitsdaten sind ausgeschlossen
- vorhandene statische Dateien werden vor Live-TTS verwendet
- fehlende statische Einträge fallen auf TTS v20 zurück
- nach rund 1,9 Sekunden startet die lokale Sofortstimme
- keine stummen Platzhalter, falschen Stimmen oder ungeprüften Dateien veröffentlichen

## 8. Live-Audit vom 6. August 2026

Supabase-Projekt `efifbuqctylsujiauabg` ist `ACTIVE_HEALTHY`.

Nachgeprüft:

- 23 freigegebene Guides
- 108 freigegebene Schritte
- Audio-Registry: 1/93
- privater Bucket: ein Audioobjekt, `public=false`
- Datei 000: `20260806-27/000.wav`, 301484 Bytes
- SHA-256: `007bc2cd09297f0d45150bb79cd82ed5c7e85ca83263b7023f11732bfd4bac82`
- Gacrux, Gemini 3.1 Flash TTS, Interactions API, Parser `raw-steps-content-v1`
- Builder aktiviert
- Cronjob `dokohilf-static-guide-audio-v27`: aktiv, `0 * * * *`
- Builderfunktion nur für `service_role` ausführbar; `anon` und `authenticated` haben kein Execute-Recht
- Audio- und Buildertabellen mit RLS
- Supabase-Sicherheitsberater: keine Lints
- Performance-Berater meldet nur informative, bisher unbenutzte Indizes neuer Redaktionsbereiche
- weitere neue Audioerzeugungen werden derzeit häufig durch Provider-HTTP-429 begrenzt

Der vollständige 93/93-Bestand ist kein Merge-Blocker für die sichtbare Build-27-Oberfläche. Er bleibt ein separater strenger Abschluss.

## 9. Veröffentlichung

- `main` ist Integrationsbranch.
- `gh-pages` ist der tatsächlich ausgelieferte Branch.
- `scripts/build-static-site-v27.sh` erzeugt für beide Veröffentlichungswege denselben Build.
- `version.json`, `index.html`, `service-worker.js`, Asset-Queryparameter und Workflows müssen dieselbe Build-ID enthalten.
- Der Pages-Build enthält keine Audio-Binärdateien.
- Vor Veröffentlichung müssen der verfügbare private Audiobestand, Live-TTS v20, Router, Datenschutzverträge und iPhone-Render geprüft sein.

## 10. Pflichtprüfungen vor Merge von Build 27

- Syntaxprüfung aller geänderten JavaScript-Dateien
- statische Build-, Sicherheits- und Datenschutzverträge
- 165 Routingregressionen und Gesprächssequenzen
- alle bestätigten Fachabläufe
- Vitalwerte-, Zielwechsel- und Medikationssicherheit
- Dark-UI, kompakte Guide-Steuerung und Erststart-Datenschutz
- mobiler Playwright-Render auf 393 × 852 mit künstlichen Router- und Audioantworten
- kein horizontaler Überlauf
- kompakte Leerlauf- und größere aktive Mikrofonansicht
- Live-Router
- Live-TTS v20 mit Gacrux und Parsernachweis
- privates Audio-Manifest mit mindestens einem geprüften Eintrag
- RIFF/WAVE-, Größen- und SHA-256-Prüfung der verfügbaren statischen Dateien
- sichtbarer Build-Marker im Pages-Artefakt
- vollständig grüner exakter PR-Head

## 11. Abgeschlossene Stände

### Fachabläufe

- PR #45 gemergt
- `CONFIRMED_WORKFLOWS.md` erstellt
- Migration `20260806153000_confirmed_workflows_blocks_1_4.sql` angewandt

### Build 26

- PR #46 gemergt
- Build `20260806-26` auf `main` und `gh-pages` veröffentlicht
- Router v9 und TTS v16 aktiviert
- PR #47 mit finaler Build-26-Übergabe gemergt

### Build-27-Vorarbeit

- PR #49, #50 und #51 als ersetzt geschlossen; Branches nicht gelöscht
- PR #52 enthält den vollständigen Build-27-Produktstand und bleibt bis zur erfolgreichen Prüfung von PR #53 offen
- TTS v20, privater Guide-Audio-Endpunkt, Builder, Registry, privater Bucket und stündlicher Cronjob sind aktiv
- veraltete Build-26- und TTS-v16-Testannahmen wurden auf Build 27 migriert
- iPhone-Renderprüfung wurde auf die tatsächlich sichtbare Vollbild-Sprachansicht korrigiert

## 12. Aktiver Arbeitsstand Build 27

- **einziger finaler Release-Branch:** `release/build-27-final-validation`
- **einziger finaler Release-PR:** **#53**
- Zielbranch: `main`
- Ziel-Build: `20260806-27`
- PR #53 ist offen und mergebar
- PR #52 bleibt bis zum grünen Nachweis von PR #53 offen und wird danach als ersetzt geschlossen; sein Branch bleibt bestehen
- veröffentlichter Hauptlink zeigt weiterhin Build 26
- kein Merge und keine Veröffentlichung von Build 27 vor vollständig grünem exakten PR-#53-Head

## 13. Offener technischer CI-Punkt

- GitHub unterdrückt Workflowereignisse, die durch die verbundene GitHub-App selbst erzeugt werden.
- Das wurde mit Push, PR-Neuanlage, Schließen/Wiederöffnen und `ready_for_review` geprüft.
- Ein direkter Workflow-Dispatch ist im verbundenen GitHub-Connector nicht verfügbar.
- Auf dem aktuellen PR-#53-Head existiert deshalb noch kein Actions-Lauf und kein Statuscheck.
- Ältere Actions-Läufe gehören zu früheren Heads und sind kein Nachweis für den aktuellen Release-Head.
- Vor Merge muss der Workflow **Deploy DokoHilf** einmal über die GitHub-Oberfläche manuell auf dem Branch `release/build-27-final-validation` gestartet werden.
- Erst nach vollständig grünem Lauf auf dem dann exakten Head darf manuell gemergt werden.
- Kein Auto-Merge und keine Branch-Löschung vorher.

## 14. Neue Repositoryquellen Build 27

- `assets/premium-ui-v27.css`
- `assets/ux-v27.css`
- `assets/ux-v27.js`
- `assets/experience-v27.js`
- `assets/guide-audio-catalog.json`
- `supabase/functions/dokohilf-guide-audio/index.ts`
- `supabase/functions/dokohilf-guide-audio-build/index.ts`
- `supabase/migrations/20260806194500_create_static_guide_audio_registry.sql`
- `supabase/migrations/20260806200500_secure_static_guide_audio_builder.sql`
- `supabase/migrations/20260806204000_deny_public_audio_table_access.sql`
- `scripts/live-static-guide-audio-smoke.mjs`
- `scripts/mobile-render-v27.mjs`
- `scripts/build-static-site-v27.sh`

## 15. Pflege dieser Datei

Nach jedem größeren Arbeitsblock sind mindestens zu aktualisieren:

- veröffentlichter und Ziel-Build
- Architekturänderungen
- bestätigte Klickwege
- offene Probleme und harte Blocker
- neue Regeln und Nutzerentscheidungen
- Pull Requests, Funktionsversionen und Migrationen
- tatsächliche Test- und Veröffentlichungsnachweise

Diese Datei ersetzt niemals die Prüfung des echten Live-Stands. Sie verhindert, dass ein neuer Chat Entscheidungen und bestätigte Abläufe erneut beim Nutzer erfragen muss.
