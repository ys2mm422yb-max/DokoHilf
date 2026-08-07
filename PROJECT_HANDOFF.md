# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 7. August 2026  
**Veröffentlichter Build:** `20260806-27`  
**Aktueller Produktstand:** Build 27 live; nächster Produktblock ist Detailhilfe bei „Ich brauche Hilfe / Ich finde das nicht“

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, diese Datei und vorhandene `ACTIVE_WORK_*.md`. Danach werden der tatsächliche GitHub-, Actions-, Pages- und Supabase-Stand live geprüft. GitHub ist das dauerhafte Arbeitsgedächtnis; alte Chats sind keine notwendige Voraussetzung zur Fortsetzung.

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

Finaler Produktnachweis:

- PR #53 **„Finale Build-27-Validierung und iPhone-Renderfix“** wurde am 7. August 2026 gemergt.
- Merge-Commit: `5d58167e2df9c78493f2e4ef880ac293be8aa2be`
- final geprüfter Feature-Head vor Merge: `0ca4cd911297b22702f38b82b8caafeab9975a4e`
- `Deploy DokoHilf` Run #238: erfolgreich
- `Validate dark iPhone UI v27` Run #17: erfolgreich
- `version.json` auf `main`: Build `20260806-27`, Release `dark-premium-fast-voice`
- öffentlicher Hauptlink liefert Build-Marker `20260806-27` mit HTTP 200
- Supabase-Projekt ist `ACTIVE_HEALTHY`

Historischer Hinweis: PR #52 ist in GitHub ebenfalls als geschlossen und gemergt markiert. Für den aktuellen Produktstand ist der tatsächlich veröffentlichte `main`- und Pages-Stand maßgeblich; nicht aus alten PR-Beschreibungen ableiten.

## 5. Build-27-Architektur

### Frontend

- statische PWA auf GitHub Pages
- `index.html`
- `assets/app.js` – Kernlogik
- `assets/guide-progress.js` – Gesprächszustand
- `assets/clarification-ui.js` – strukturierte Auswahl
- `assets/voice-focus-mode.js` – Sprachfokus
- `assets/mobile-audio-fix.js` – Audio-Entsperrung
- `assets/update-manager.js` – Updates
- `assets/premium-ui-v27.css` – Dark-Design
- `assets/ux-v27.css`, `assets/ux-v27.js` – kompakte Bedienung und Erststart-Datenschutz
- `assets/experience-v27.js` – statische und dynamische Sprachausgabe
- `assets/voice-diagnostics.js` – privater Audiokatalog und Gerätecache
- `assets/guide-audio-catalog.json` – statischer Audio-Textkatalog
- `scripts/build-static-site-v27.sh` – exakter Pages-Build
- `scripts/mobile-render-v27.mjs` – mobiler Rendernachweis

### Supabase

Zuletzt live bestätigt:

- `dokohilf-ai-router` v11
- `dokohilf-tts` v20
- `dokohilf-guide-audio` v1
- `dokohilf-guide-audio-build` v2
- `dokohilf-editor` v1
- `public.dokohilf_guides`
- `public.dokohilf_topics`
- `public.dokohilf_static_guide_audio`
- `public.dokohilf_internal_build_control`
- privater Bucket `dokohilf-guide-audio`
- freigegebene Guide-Audios liegen im **privaten Supabase-Bucket** `dokohilf-guide-audio` und werden nur über den kontrollierten Guide-Audio-Endpunkt ausgeliefert
- alte Diagnose-, Export-, Batch-, Store- und Snapshot-Endpunkte neutralisiert auf HTTP 410

## 6. Sprache und Audio

Natürliche Stimme: **Gacrux**.

TTS v20:

- Roh-REST-Parser `raw-steps-content-v1`
- primär `gemini-3.1-flash-tts-preview`
- Fallback `gemini-2.5-flash-preview-tts`
- gültige RIFF/WAVE-Ausgabe
- echte Providerstatus 429/502/503/504 werden weitergegeben
- vorhandene statische freigegebene Audios werden vor Live-TTS verwendet
- danach Live-TTS v20
- nach rund 1,9 Sekunden lokale Sofortstimme als Fallback

Statische Audioquelle ausschließlich allgemeines `step.text` freigegebener Guides. Keine Nutzerstimmen, Diktate, freien Antworten, Namen, Fall- oder Gesundheitsdaten speichern.

Der vollständige 93/93-Audiobestand ist ein separater Ausbauzustand und kein Blocker für den veröffentlichten Build 27. Veränderliche Bestandszahlen immer live aus Supabase prüfen.

## 7. Verbindliche Fachquelle

`CONFIRMED_WORKFLOWS.md` ist die einzige verbindliche Quelle für lokale bestätigte Klickwege. Router, Supabase-Guides, Detailhilfe und Tests müssen damit übereinstimmen. Keine fehlenden Feldnamen oder Klickwege erfinden.

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

## 8. Bildbasierte Nachbestätigung vom 7. August 2026

Der Nutzer hat erneut lokale Bilder zu mehreren Abläufen geschickt. Die Bilder selbst bleiben Chat-only und dürfen niemals nach GitHub oder Supabase übernommen werden.

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

## 9. Aktiver nächster Produktblock: Detailhilfe

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

## 10. Aktueller Dokumentations-Arbeitsblock

Arbeitsbranch: `docs/handoff-20260807`

Zweck:

- ausdrückliche dauerhafte GitHub-Dokumentationspflicht verankern
- neue Bild-Nachbestätigungen anonymisiert dokumentieren
- Detailhilfe als nächsten Produktblock festhalten
- diese Übergabe vom alten Pre-Release-Stand auf den tatsächlich veröffentlichten Build 27 aktualisieren

Vor Merge dieses Dokumentationsblocks gelten weiterhin die Projektregeln für Branch, PR, Prüfung und Merge. Branch nicht löschen.

## 11. Pflicht für jeden neuen Chat

1. `PROJECT_RULES.md` lesen.
2. `CONFIRMED_WORKFLOWS.md` lesen.
3. `PROJECT_HANDOFF.md` lesen.
4. alle `ACTIVE_WORK_*.md` prüfen.
5. Live-GitHub prüfen: `main`, offene PRs, aktuelle Heads, Actions und `gh-pages`.
6. Live-Supabase prüfen, wenn der Arbeitsblock Supabase, Router, Audio oder Guides betrifft.
7. Exakt beim dokumentierten nächsten ausführbaren Schritt fortfahren.
8. Nach eigener Arbeit Repository-Dokumentation wieder aktualisieren.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
