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
- Andere Repositories und Supabase-Projekte niemals öffnen, verändern oder verbinden.
- Keine produktive Vivendi-Verbindung, keine nicht dokumentierten Schnittstellen und kein Scraping.
- Keine echten Bewohner-, Gesundheits-, Mitarbeiter- oder Zugangsdaten.
- Nutzerbilder und Screenshots bleiben ausschließlich im jeweiligen Chat. Sie dürfen niemals in GitHub, Supabase, Tests, Artefakte oder die App gelangen.

## 2. Verbindlicher GitHub-Ablauf

1. Vor jedem Eingriff `main`, offene Pull Requests, Actions, `gh-pages` und Supabase prüfen.
2. Nie direkt auf `main` arbeiten.
3. Eigener Branch und Pull Request pro Arbeitsblock.
4. Änderungen, Entscheidungen, Tests, Fehler und Restarbeiten dauerhaft im Repository dokumentieren.
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
- statischer Audio-Katalog: `assets/guide-audio-catalog.json`
- Audio-Manifest nach erfolgreicher Erzeugung: `assets/guide-audio-manifest.json`
- statische Audios nach erfolgreicher Erzeugung: `assets/audio/guides/*.wav`
- gemeinsamer Pages-Build: `scripts/build-static-site-v27.sh`
- echte mobile Renderprüfung: `scripts/mobile-render-v27.mjs`

### Supabase

- `dokohilf-ai-router`: aktive Version **11**, Marker `conversational-guide-router-v9`
- `dokohilf-tts`: aktive Version **19**
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

## 7. Sprache

Natürliche Stimme: **Gacrux**.

### Bekannte freigegebene Anweisungen

- Datenbasis: 23 freigegebene Guides, 108 Schritte, 92 eindeutige Schritttexte plus Begrüßung
- Ziel: exakt 93 vorproduzierte Gacrux-WAV-Dateien
- Quelle ausschließlich allgemeines `step.text` freigegebener Guides
- Nutzerantworten, Checks, Diktate, Namen, Fall- und Gesundheitsdaten sind ausgeschlossen
- `assets/experience-v27.js` sucht zuerst eine statische freigegebene Datei
- Service Worker ist für schnelle und Offline-Wiedergabe vorbereitet
- das finale Manifest muss Textschlüssel, Pfad, Größe, SHA-256, Stimme, Modell und Stil enthalten
- keine stummen Platzhalter, falschen Stimmen oder ungeprüften Dateien veröffentlichen

### Freie Antworten

- Primärmodell: `gemini-3.1-flash-tts-preview`
- Fallbackmodell: `gemini-2.5-flash-preview-tts`
- Stil: `natural-spoken-german-colleague-v9-interactions`
- TTS v19 verwendet primär Gemini Interactions `/v1beta/interactions`
- technischer Rückfallweg: Gemini 2.5 über Interactions, danach Generate Content
- erfolgreiche Antworten weisen Modell, API-Weg, Stimme, Stil, Cache und Laufzeit in Response-Headern nach
- Live-TTS wird nur für nicht katalogisierte freie Antworten verwendet
- Browser wartet höchstens rund 1,9 Sekunden; danach startet die lokale Sofortstimme
- dynamische Audios und Gesprächsinhalte bleiben flüchtig

## 8. Nachgewiesener externer Audio-Blocker

- Einzelne TTS-Anfragen schwankten beim externen Google-Dienst zwischen HTTP 200, 429, 502 und 504.
- Der aktuelle konkrete Providerstatus ist HTTP **429**: erschöpfte TTS-Quota.
- Offizielle Batchversuche wurden mit `FAILED_PRECONDITION` abgewiesen.
- Googles aktuelle Preisdokumentation weist die Gemini Batch API ausschließlich für die kostenpflichtige Stufe aus; der aktuelle API-Schlüssel erfüllt diese Voraussetzung nicht.
- Sowohl Gemini 3.1 Flash TTS als auch Gemini 2.5 Flash TTS unterstützen grundsätzlich Batch, aber nicht mit der aktuellen kostenlosen Freischaltung.
- Vollständige technische Dokumentation: `AUDIO_PROVIDER_BLOCKER.md`.
- Die temporären Supabase-Hilfstabellen und Exportstrukturen wurden gelöscht.
- Temporäre Audio-Export-, Batch-, Store- und Batch-Submit-Edge-Functions antworten nur noch mit HTTP 410.
- Es laufen keine selbstverändernden Audio-Workflows mehr auf dem finalen Branch.

## 9. Veröffentlichung

- `main` ist Integrationsbranch.
- `gh-pages` ist der tatsächlich ausgelieferte Branch.
- `scripts/build-static-site-v27.sh` erzeugt für beide Veröffentlichungswege denselben vollständigen Build.
- `version.json`, `index.html`, `service-worker.js`, Asset-Queryparameter und Workflows müssen dieselbe Build-ID enthalten.
- Build 27 darf nur veröffentlicht werden, wenn Manifest und exakt 93 WAV-Dateien im erzeugten Pages-Build liegen.
- Der normale PR-Prüflauf erzeugt keine Audios, sondern prüft ausschließlich den final committed Stand.

## 10. Pflichtprüfungen vor Merge

- Syntaxprüfung aller geänderten JavaScript-Dateien
- statische Build- und Datenschutzverträge
- 165 Routingregressionen und Gesprächssequenzen
- alle bestätigten Fachabläufe
- Vitalwerte-, Zielwechsel- und Medikationssicherheit
- Dark-UI, kompakte Guide-Steuerung und Erststart-Datenschutz
- gültiger RIFF-/WAVE-Header, Dateigröße und SHA-256 für alle 93 statischen Audios
- mobiler Playwright-Render auf 393 × 852 mit künstlichen Router- und Audioantworten
- kein horizontaler Überlauf
- kompakte Leerlauf- und größere aktive Mikrofonansicht
- Live-Router und zeitlich begrenzter Live-TTS-Fallback
- sichtbarer Build-Marker im Pages-Artefakt
- vollständig grüner exakter PR-Head

## 11. Abgeschlossene Stände

### Fachabläufe

- PR #45 gemergt
- `CONFIRMED_WORKFLOWS.md` erstellt
- Migration `20260806153000_confirmed_workflows_blocks_1_4.sql` angewandt

### Build 26

- PR #46 gemergt
- veröffentlichter Build `20260806-26`
- Router v9 und TTS v16 aktiviert

## 12. Aktiver Arbeitsstand Build 27

- finaler isolierter Branch: `feat/dark-premium-v27-final`
- finaler Draft-PR: **#51**
- PR #49 und PR #50 wurden als ersetzt geschlossen; ihre Branches wurden nicht gelöscht
- Ziel-Build: `20260806-27`
- TTS v19 ist aktiv
- Migration zur Entfernung wiederholter Übungshinweise wurde angewandt
- Dark-UI, kompakte Steuerung, Erststart-Datenschutz, statische Audioarchitektur, gemeinsamer Build und unabhängige mobile Renderprüfung liegen im finalen Branch
- alte selbstverändernde Audio-Workflows wurden aus dem finalen Branch entfernt
- unabhängiger UI-Workflow: `.github/workflows/ui-validation-v27.yml`
- **Harter Merge-Blocker:** `assets/guide-audio-manifest.json` und alle 93 gültigen Gacrux-WAV-Dateien fehlen noch wegen des externen Quota-/Paid-Tier-Blockers
- bis zur vollständigen Audioerzeugung und anschließendem exakten grünen Head bleibt PR #51 Draft und wird nicht gemergt

## 13. Pflege dieser Datei

Nach jedem größeren Arbeitsblock sind mindestens zu aktualisieren:

- veröffentlichter und Ziel-Build
- Architekturänderungen
- bestätigte Klickwege
- offene Probleme und harte Blocker
- neue Regeln und Nutzerentscheidungen
- Pull Requests, Funktionsversionen und Migrationen
- tatsächliche Test- und Veröffentlichungsnachweise

Diese Datei ersetzt niemals die Prüfung des echten Live-Stands. Sie verhindert, dass ein neuer Chat Entscheidungen und bestätigte Abläufe erneut beim Nutzer erfragen muss.
