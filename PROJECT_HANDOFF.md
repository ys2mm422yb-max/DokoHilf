# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 7. August 2026  
**Veröffentlichter Build:** `20260806-27`  
**Aktueller Produktstand:** Build 27 live; Sprachstart und iPhone-Sprachlayout nachgebessert; statische Gacrux-Bibliothek baut sich kontrolliert weiter auf  
**Nächster Produktblock:** Detailhilfe bei „Ich brauche Hilfe / Ich finde das nicht“

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, diese Datei und alle vorhandenen `ACTIVE_WORK_*.md`. Danach werden der tatsächliche GitHub-, Actions-, Pages- und Supabase-Stand live geprüft. GitHub ist das dauerhafte Arbeitsgedächtnis; alte Chats sind keine notwendige Voraussetzung zur Fortsetzung.

## 1. Projektgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`
- Region: Frankfurt, `eu-central-1`
- Fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`
- Andere Repositories oder Supabase-Projekte niemals öffnen, verändern oder verbinden.
- Keine produktive Verbindung zur Dokumentationssoftware, kein Scraping und keine nicht dokumentierten Schnittstellen.
- Keine echten Bewohner-, Gesundheits-, Mitarbeiter- oder Zugangsdaten in Repository, Supabase, Tests oder Artefakten.
- Nutzerbilder und Screenshots bleiben ausschließlich im jeweiligen Chat. Nur anonymisierte, selbst formulierte Klickwege dürfen daraus übernommen werden.

## 2. Dauerhafte GitHub-Dokumentationspflicht

Diese Regel ist seit 7. August 2026 ausdrücklich vom Nutzer bestätigt und in `PROJECT_RULES.md` verankert.

Nach jedem relevanten Arbeitsblock dauerhaft dokumentieren:

- neue Nutzerentscheidungen und fachliche Bestätigungen
- betroffene Dateien, Komponenten und Supabase-Bereiche
- tatsächliche Tests und deren Ergebnisse
- Fehler, Ursachen und offene Blocker
- Branch, Pull Request und exakten Head
- Merge- und Veröffentlichungsstand
- nächsten ausführbaren Schritt

Bestätigte Klickwege gehören nach `CONFIRMED_WORKFLOWS.md`. Laufende größere Aufgaben erhalten eine `ACTIVE_WORK_*.md`. Diese Datei hält den aktuellen Gesamtstand. Ein neuer Chat soll aus GitHub ohne Rekonstruktion alter Chats weiterarbeiten können.

## 3. Verbindlicher GitHub-Ablauf

1. Vor jedem Eingriff `main`, offene Pull Requests, Actions, `gh-pages` und Supabase prüfen.
2. Nie direkt auf `main` arbeiten.
3. Eigener Branch und Pull Request pro Arbeitsblock.
4. Änderungen, Entscheidungen, Tests, Fehler und Restarbeiten dauerhaft im Repository dokumentieren.
5. Nur einen vollständig geprüften exakten PR-Head mergen.
6. Kein Auto-Merge und keine automatische Branch-Löschung.
7. Nach Merge `main`, `gh-pages`, aktive Edge Functions und den festen Hauptlink kontrollieren.
8. Gegenüber dem Nutzer keine alternativen Preview-, Branch-, Cache- oder Query-Links nennen.

## 4. Aktueller veröffentlichter Stand – Build 27

Build `20260806-27` ist veröffentlicht und live.

Basis-Release:

- PR #53 **„Finale Build-27-Validierung und iPhone-Renderfix“** wurde am 7. August 2026 gemergt.
- Merge-Commit: `5d58167e2df9c78493f2e4ef880ac293be8aa2be`
- final geprüfter Feature-Head: `0ca4cd911297b22702f38b82b8caafeab9975a4e`
- `version.json`: Build `20260806-27`, Release `dark-premium-fast-voice`

Nachgelagerter App-Icon-Block:

- PR #62 veröffentlichte das dunkle, zum Build-27-Design passende App-/Homescreen-Icon.
- Merge-Commit: `10fedecd38d25fb2eb29d2061383cce8d26a5a39`
- Details: `ACTIVE_WORK_APP_ICON.md`

Nachgelagerter Sprach-/Layout-Fix:

- PR #64 **„Beschleunige Sprachstart und korrigiere iPhone-Überlappungen“**
- finaler exakter Head: `6ddc93f7f1e22258132b741b80866c9615a2ea91`
- Merge-Commit: `d3f8d16956defeefa7d9a4d5cbbd76c63d03db9a`
- exakter Head vollständig grün
- `gh-pages/assets/ux-v27.js` live mit `HARD_FALLBACK_MS = 1200`
- `gh-pages/assets/ux-v27.css` live mit Safe-Area-Sprachlayout und im Sprachmodus ausgeblendetem Versionsstatus

Serverseitiger statischer Gacrux-Fix:

- PR #65 **„Erlaube sicheren Aufbau der vollständigen Gacrux-Guidebibliothek“**
- finaler exakter Head: `affff5b53b0ae1a5f0b97688b5a6b49d78bd94a1`
- Merge-Commit: `6afc9267756b5fa1617b8b067f246598a44bd90a`
- `Deploy DokoHilf` Run #256 vollständig erfolgreich
- Details und Live-Nachweise: `ACTIVE_WORK_VOICE_RELIABILITY.md`

## 5. Build-27-Frontendarchitektur

- statische PWA auf GitHub Pages
- `index.html`
- `assets/app.js` – Kernlogik
- `assets/guide-progress.js` – Gesprächszustand
- `assets/clarification-ui.js` – strukturierte Auswahl
- `assets/voice-focus-mode.js` – Sprachfokus
- `assets/mobile-audio-fix.js` – Audio-Entsperrung
- `assets/update-manager.js` – Updates
- `assets/premium-ui-v27.css` – Dark-Design
- `assets/ux-v27.css`, `assets/ux-v27.js` – kompakte Bedienung, iPhone-Sprachlayout, 1,2-s-Sprachfallback und Erststart-Datenschutz
- `assets/experience-v27.js` – statische und dynamische Sprachausgabe
- `assets/voice-diagnostics.js` – privater Audiokatalog und Gerätecache
- `assets/guide-audio-catalog.json` – 93 allgemeine statische Audio-Texte
- `scripts/build-static-site-v27.sh` – exakter Pages-Build
- `scripts/mobile-render-v27.mjs` – mobiler Rendernachweis inklusive realer Geometrieprüfung von Kopfzeile und Sprachfläche

## 6. Aktueller Supabase-Stand

Zuletzt live bestätigt:

- `dokohilf-ai-router` v11
- `dokohilf-tts` **v21**
- `dokohilf-guide-audio` v1
- `dokohilf-guide-audio-build` **v3**
- `dokohilf-editor` v1
- `public.dokohilf_guides`
- `public.dokohilf_topics`
- `public.dokohilf_static_guide_audio`
- `public.dokohilf_internal_build_control`
- privater Bucket `dokohilf-guide-audio`
- alte Diagnose-, Export-, Batch-, Store- und Snapshot-Endpunkte neutralisiert auf HTTP 410

Freigegebene statische Guide-Audios liegen im privaten Bucket und werden nur über den kontrollierten Guide-Audio-Endpunkt ausgeliefert.

## 7. Sprache und Audio – aktueller Stand

Natürliche Stimme: **Gacrux**.

`dokohilf-tts` v21:

- Roh-REST-Parser `raw-steps-content-v1`
- primär `gemini-3.1-flash-tts-preview`
- Fallback `gemini-2.5-flash-preview-tts`
- gültige RIFF/WAVE-Ausgabe
- echte Providerstatus 429/502/503/504 werden weitergegeben
- öffentliche Browser-/Sprachanfragen behalten den strengen Datenschutzfilter
- der interne statische Builder erhält nur nach serverseitiger Tokenprüfung einen engen Sonderpfad für bereits fachlich freigegebene allgemeine Guide-Texte
- Tokenprüfung erfolgt serverseitig gegen `dokohilf_internal_build_control`; kein Tokenwert liegt im Repository oder Browser

Client-Reihenfolge:

1. vorhandenes statisches freigegebenes Gacrux-Audio
2. dynamisches Gacrux-TTS
3. nach **1,2 Sekunden** lokale Sofortstimme
4. iOS-Resume-Watchdog verhindert einen stumm pausierten `speechSynthesis`-Fallback

Der Live-Provider kann weiterhin zeitweise 429 liefern oder 6–13 Sekunden benötigen. Diese Providerlatenz blockiert den Nutzer aber nicht mehr so lange, weil der Client früh auf die Sofortstimme wechselt.

## 8. Statische Gacrux-Bibliothek

Ziel: 93/93 allgemeine, fachlich freigegebene Texte.

Sicherheitsgrenze:

- ausschließlich allgemeine freigegebene `step.text`-Inhalte
- keine Nutzerstimmen
- keine Diktate
- keine freien Antworten
- keine Gesprächsverläufe
- keine Namen, Fall- oder Gesundheitsdaten

Aktiver Builder:

- `dokohilf-guide-audio-build` v3
- genau ein Eintrag pro Minute
- Cron: `dokohilf-static-guide-audio-v27`
- Schedule zuletzt live bestätigt: `* * * * *`
- der Builder deaktiviert seine Steuerung und entfernt den Cronjob selbst bei 93/93

Live-Nachweis nach PR #65:

- zuvor durch Privacy-Heuristik blockierter allgemeiner Index 4 erfolgreich erstellt
- HTTP 200, Registry-Zuwachs von 4 auf 5
- der vom Nutzer aktuell verwendete Visiten-Schritt Katalogindex 33 wurde zusätzlich erfolgreich statisch erzeugt
- letzter Abschlussstand: **7/93**, Indizes `0,1,2,3,4,5,33`

Diese Bestandszahl ist absichtlich veränderlich. Jeder neue Chat muss sie bei Audioarbeit live aus Supabase prüfen.

## 9. Verbindliche Fachquelle

`CONFIRMED_WORKFLOWS.md` ist die einzige verbindliche Quelle für lokal bestätigte Klickwege. Router, Supabase-Guides, Detailhilfe und Tests müssen damit übereinstimmen. Keine fehlenden Feldnamen oder Klickwege erfinden.

Bestätigt sind insbesondere:

- Bericht anlegen einschließlich Kategorieauswahl und automatisch verknüpfter Protokolle
- Bericht durchstreichen
- Folgebericht erstellen
- falsch abgezeichnete Durchführung stornieren
- Visite/Sprechstunde dokumentieren mit vorgeschalteter Klientenauswahl und Status **durchgeführt**
- Vitalwerte als getrennte Einzel- und Sammelerfassung
- An-/Abwesenheit mit harter Von-/Bis-Regel
- Medikation ausschließlich ansehen
- Formulare anlegen
- Notfallblatt öffnen
- Übergabe über `Analyse → Was war los? → Alle anzeigen → Alles ausklappen`

## 10. Bildbasierte Nachbestätigung vom 7. August 2026

Die vom Nutzer geschickten lokalen Bilder bleiben Chat-only und dürfen niemals nach GitHub oder Supabase übernommen werden.

Anonymisiert erneut bestätigt:

- `Doku-Erweitert → Visiten → Neu → Klienten auswählen → Neue Visite → Durchführen`
- Bericht anlegen mit Kategorieauswahl
- Einzel-Vitalwerte und separater Menüpunkt `Vitalwerte Sammelerf.`
- Bericht über `Eintrag bearbeiten → Durchstreichen`
- `Doku → Durchführungsnachweis → Durchführung stornieren`
- kleines rotes Kreuz → `Notfallblatt aufrufen`
- `Formulare → Neu → Formular anlegen → Protokoll auswählen → OK`
- `Analyse → Was war los? → Alle anzeigen → Alles ausklappen`

Die vollständigen anonymisierten Schritte stehen in `CONFIRMED_WORKFLOWS.md`.

## 11. Aktiver nächster Produktblock: Detailhilfe

Datei: `ACTIVE_WORK_DETAIL_HELP.md`

Nutzerwunsch: Wenn jemand einen Schritt oder Menüpunkt nicht findet, soll DokoHilf detailliert und dialogisch nachfragen können, statt nur einen Standardhilfetext zu zeigen.

Verbindliche Richtung:

- bestehender aktueller Guide-Schritt bleibt aktiv
- `Ich brauche Hilfe` und freie Aussagen wie `Ich finde das nicht` öffnen eine Hilfeschleife
- zuerst sichtbaren Zustand klären: Menüpunkt fehlt, anderer Name, andere Seite/Reiter, Orientierung verloren
- nur bestätigte lokale Bezeichnungen und bestätigte sichere Rückwege verwenden
- niemals neue Klickwege erfinden
- wenn keine bestätigte Lösung existiert, das transparent sagen und zum letzten sicheren Schritt beziehungsweise zu menschlicher Hilfe führen
- Sprach- und Schreibmodus verwenden dieselbe fachliche Hilfelogik
- Hilfe darf einen Schritt nicht automatisch als erledigt markieren

**Umsetzung ist noch nicht erfolgt.** Der nächste Entwickler soll diesen Block aus `ACTIVE_WORK_DETAIL_HELP.md` aufnehmen, implementieren, testen, dokumentieren und erst nach vollständiger Prüfung veröffentlichen.

## 12. Pflicht für jeden neuen Chat

1. `PROJECT_RULES.md` lesen.
2. `CONFIRMED_WORKFLOWS.md` lesen.
3. `PROJECT_HANDOFF.md` lesen.
4. alle `ACTIVE_WORK_*.md` prüfen.
5. Live-GitHub prüfen: `main`, offene PRs, aktuelle Heads, Actions und `gh-pages`.
6. Live-Supabase prüfen, wenn der Arbeitsblock Supabase, Router, Audio oder Guides betrifft.
7. Bei Audioarbeit den veränderlichen statischen Audio-Bestand und den Cronzustand live prüfen.
8. Exakt beim dokumentierten nächsten ausführbaren Schritt fortfahren.
9. Nach eigener Arbeit Repository-Dokumentation wieder aktualisieren.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
