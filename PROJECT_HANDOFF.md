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
- Weiterleitung und iPhone-Cache des privaten Audiokatalogs: `assets/voice-diagnostics.js`
- statischer Audio-Katalog: `assets/guide-audio-catalog.json`
- gemeinsamer Pages-Build: `scripts/build-static-site-v27.sh`
- echte mobile Renderprüfung: `scripts/mobile-render-v27.mjs`

Der öffentliche Pages-Build enthält **keine WAV-Binärdateien** und kein lokales Audio-Manifest. Freigegebene Guide-Audios werden aus einem privaten Supabase-Bucket über einen kontrollierten Leseendpunkt ausgeliefert und auf dem Gerät gecacht.

### Supabase

- `dokohilf-ai-router`: aktive Version **11**, Marker `conversational-guide-router-v9`
- `dokohilf-tts`: aktive Version **20**
- `dokohilf-guide-audio`: aktive Version **1**, öffentlicher Leseendpunkt für Manifest und freigegebene WAVs
- `dokohilf-guide-audio-build`: aktive Version **2**, temporärer und intern token-geschützter Builder
- `dokohilf-editor`: geschützter Redaktionsbereich
- freigegebene Guides: `public.dokohilf_guides`
- Themenzuordnungen: `public.dokohilf_topics`
- Audio-Registry: `public.dokohilf_static_guide_audio`
- interner Builderzustand: `public.dokohilf_internal_build_control`
- privater Storage-Bucket: `dokohilf-guide-audio`

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

### TTS v20

Der eigentliche Fehler von TTS v19 wurde gefunden: Das SDK-Komfortfeld `output_audio` ist beim rohen Gemini-Interactions-REST-Response nicht zuverlässig vorhanden. Das Audio liegt in `steps[].content[]`.

TTS v20:

- liest das rohe REST-Audio über Parser `raw-steps-content-v1`
- akzeptiert zusätzlich kompatible `inlineData`-/`inline_data`-Strukturen
- wandelt PCM in gültige RIFF/WAVE-Dateien um
- gibt echte Providerstatus 429/502/503/504 weiter, statt alles als 502 zu verschleiern
- weist Stimme, Modell, API-Weg, Parser, Stil, Cache und Laufzeit in Response-Headern nach
- verwendet primär `gemini-3.1-flash-tts-preview`
- verwendet als Fallback `gemini-2.5-flash-preview-tts`
- Stil: `natural-spoken-german-colleague-v10-rest-audio`

Live-Nachweis vom 6. August 2026:

- HTTP 200
- `Content-Type: audio/wav`
- 101804 Bytes
- Stimme `Gacrux`
- Modell `gemini-3.1-flash-tts-preview`
- API `interactions-v1beta`
- Parser `raw-steps-content-v1`
- gültiger RIFF/WAVE-Anfang

### Bekannte freigegebene Anweisungen

- Datenbasis: 23 freigegebene Guides, 108 Schritte, 92 eindeutige Schritttexte plus Begrüßung
- Zielbestand: exakt 93 geprüfte Gacrux-WAV-Dateien
- Quelle ausschließlich allgemeines `step.text` freigegebener Guides
- Nutzerantworten, Checks, Diktate, Namen, Fall- und Gesundheitsdaten sind ausgeschlossen
- `assets/experience-v27.js` sucht zuerst eine statische freigegebene Datei
- der Manifestendpunkt liefert Schema 2 mit Textschlüssel, Pfad, Größe, SHA-256, Stimme, Modell, API-Weg, Parser und Stil
- Service Worker und Browser-Cache verwenden verfügbare Dateien schnell und offline wieder
- fehlende statische Einträge fallen auf TTS v20 zurück
- nach rund 1,9 Sekunden startet die lokale Sofortstimme
- keine stummen Platzhalter, falschen Stimmen oder ungeprüften Dateien veröffentlichen

### Kontrollierter Teilrollout

- zuletzt verifizierter Bestand: **1/93**; vor jeder Aussage live neu prüfen
- Builderaufrufe ohne internes Token liefern HTTP 403
- das zufällige Buildertoken liegt ausschließlich in `public.dokohilf_internal_build_control` und niemals im Repository oder Browser
- der Cronjob `dokohilf-static-guide-audio-v27` versucht stündlich ausschließlich den nächsten fehlenden Index
- fertige Einträge werden nicht erneut erzeugt
- bei 93/93 deaktiviert sich der Builder und entfernt den Cronjob selbst
- wegen Google HTTP 429 kann der Bestand zeitweise nicht wachsen

## 8. Veröffentlichungsentscheidung

Das sichtbare Dark-UI-Update wird nicht länger durch Googles kostenlose 93er-TTS-Quota blockiert.

Für Build 27 gilt:

- mindestens ein vollständig geprüftes statisches Gacrux-Audio muss über den privaten Endpunkt verfügbar sein
- vorhandene statische Dateien werden bevorzugt
- fehlende Dateien nutzen TTS v20 und anschließend die Sofortstimme
- die App bleibt dadurch vollständig bedienbar
- der strenge 93/93-Test bleibt mit `DOKOHILF_REQUIRE_COMPLETE_AUDIO=1` erhalten und ist Pflicht für den späteren Abschluss des vollständigen Audiopakets

Damit sind zwei Ziele getrennt:

1. **Build 27:** dunkle Oberfläche, kompakte Bedienung, TTS-v20-Fehlerbehebung und sicherer Audio-Teilrollout
2. **Audioabschluss:** vollständige 93/93-Gacrux-Bibliothek nach verfügbarer Providerquota

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

Der vollständige 93/93-Bestand ist kein Merge-Blocker mehr für die sichtbare Build-27-Oberfläche, bleibt aber Pflicht für den separaten Audioabschluss.

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
- TTS v20 ist aktiv und live als gültiges Gacrux-WAV nachgewiesen
- `dokohilf-guide-audio` v1 und geschützter Builder v2 sind aktiv
- Migration zur Entfernung wiederholter Übungshinweise wurde angewandt
- Audio-Registry und interner Builderzustand wurden angelegt
- Builder ohne Token wurde mit HTTP 403 geprüft; interner Aufruf erreicht den Builder
- Dark-UI, kompakte Steuerung, Erststart-Datenschutz, privater Audioendpunkt, gemeinsamer Build und mobile Renderprüfung liegen im finalen Branch
- alte selbstverändernde Audio-Workflows wurden entfernt
- der Cronjob wurde wegen wiederholtem HTTP 429 von minütlich auf stündlich reduziert
- veröffentlichter Hauptlink zeigt weiterhin Build 26
- ältere Actions-Läufe wurden durch nachfolgende Branchänderungen abgebrochen und sind kein Nachweis für den aktuellen Head
- vor Merge muss auf dem letzten exakten Head ein neuer vollständiger Actions-Lauf ausgelöst und grün abgeschlossen werden
- kein Merge, kein Auto-Merge und keine Branch-Löschung vor diesem Nachweis

## 13. Neue Repositoryquellen

- `supabase/functions/dokohilf-guide-audio/index.ts`
- `supabase/functions/dokohilf-guide-audio-build/index.ts`
- `supabase/migrations/20260806194500_create_static_guide_audio_registry.sql`
- `supabase/migrations/20260806200500_secure_static_guide_audio_builder.sql`
- `scripts/live-static-guide-audio-smoke.mjs`

## 14. Pflege dieser Datei

Nach jedem größeren Arbeitsblock sind mindestens zu aktualisieren:

- veröffentlichter und Ziel-Build
- Architekturänderungen
- bestätigte Klickwege
- offene Probleme und harte Blocker
- neue Regeln und Nutzerentscheidungen
- Pull Requests, Funktionsversionen und Migrationen
- tatsächliche Test- und Veröffentlichungsnachweise

Diese Datei ersetzt niemals die Prüfung des echten Live-Stands. Sie verhindert, dass ein neuer Chat Entscheidungen und bestätigte Abläufe erneut beim Nutzer erfragen muss.
