# ACTIVE WORK – kostenlose Voice-Guides und Bericht-Sonderfall v28

**Stand:** 7. August 2026  
**Status:** Umsetzung im PR; Merge erst nach vollständig grünem exakten Head  
**Branch:** `fix/voice-guides-report-conditions-v28-20260807`  
**PR:** `#85`  
**Build:** `20260807-28` / sichtbare Version `v28`

## Verbindliche Nutzerentscheidungen

DokoHilf bleibt dauerhaft eine **reine erklärende Bedienhilfe**:

- keine DokoHilf-Endnutzerkonten
- keine Bewohner-/Mitarbeiterprofile
- keine Fallakten oder personenbezogenen Eingabemasken
- keine Eingabe oder Speicherung von Bewohner-, Mitarbeiter- oder sonstigen Personendaten
- automatisierte Tests ausschließlich mit synthetischen UI-Zuständen, neutralen Platzhaltern und erfundenen Werten

Technische GitHub-/Supabase-Administrationskonten sind Infrastruktur und keine App-Benutzerkonten.

Für die Stimme gilt: **keine kostenpflichtige TTS-API und kein Wechsel auf eine System-/Gerätestimme.** Die reguläre DokoHilf-Stimme soll einheitlich Supertonic F1 sein.

## Reproduzierte Produktprobleme

- Auf einem realen iPhone wird eine vorbereitete Anweisung hörbar abgespielt; spätere Guide-Anweisungen können bei lokaler Supertonic-WASM-Inferenz stumm bleiben beziehungsweise hängen.
- Die vollständige Anleitung `Bericht anlegen` stellte die Protokollschritte 6–9 nicht deutlich genug als bedingten Sonderfall dar.

Fachlich bestätigt:

- `Kontakt – alles außer Arzt` → `Fallgespräch`
- `Sturzereignis` → `Sturzprotokoll`
- bei allen anderen Berichtskategorien Schritte 6–9 überspringen und direkt mit Schritt 10 fortfahren

## Neue kostenlose Voice-Architektur

Der reine On-Device-Supertonic-Ansatz ist auf realem iOS für normale Guide-Schritte nicht zuverlässig genug. Deshalb wird die Rechenarbeit für **bestätigte allgemeine Guide-Sätze** aus dem iPhone herausgenommen:

1. Der bestehende 93-Satz-Guide-Katalog bleibt die Quelle für bestätigte allgemeine Sprachanweisungen.
2. Der öffentliche GitHub-Actions-Releasejob erzeugt diese 93 Sätze mit **Supertonic 3 / Stimme F1 / Deutsch** als statische WAV-Dateien.
3. Die veröffentlichte PWA lädt den lokalen Katalog und spielt ein passendes statisches Supertonic-Audio ab.
4. Begrüßung und bestätigte Folgeanweisungen benötigen dadurch keine lokale iPhone-WASM-Inferenz.
5. Router-`spokenText` wird für die Sprachausgabe weiter berücksichtigt, damit kurze bestätigte Guide-Sätze zuverlässig getroffen werden.
6. Nur ein noch nicht vorbereiteter freier Satz darf als technischer Notweg lokal mit derselben Supertonic-F1-Stimme erzeugt werden; auf iOS gilt weiterhin eine harte Zeitgrenze.
7. System-/Gerätestimme bleibt blockiert.
8. Der aktive Browser-Sprachpfad ruft keine Cloud-TTS-API auf.

Neue/angepasste Kernkomponenten:

- `scripts/build-supertonic-guide-audio-v28.py`
- `assets/local-voice-gate-v28.js`
- `.github/workflows/pages.yml`
- `scripts/build-static-site-v27.sh`
- `service-worker.js`
- mobile Voice-/Detailhilfe-/Bericht-QA

## Cloud-Sprachaufbau deaktiviert

Der vorherige automatische serverseitige statische Sprachaufbau darf für den neuen kostenlosen Releasepfad nicht weitergenerieren.

Live im festen Supabase-Projekt gesetzt und verifiziert:

`public.dokohilf_internal_build_control.enabled = false`

Der vorhandene Cron kann technisch weiterhin ausgelöst werden, wird aber durch diesen Build-Schalter vor einer neuen Sprachgenerierung gestoppt. Der direkte Zugriff auf `cron.job` war über die verfügbare Datenbankrolle nicht erlaubt; deshalb wird **nicht** behauptet, der Cron selbst sei gelöscht oder deaktiviert.

## Bericht-Sonderfall

Die verbindliche Fachquelle und der aktive Supabase-Guide `bericht-neu` wurden auf die bestätigte Logik synchronisiert.

In der vollständigen Direktanleitung werden Schritte 6–9 visuell als eigener Sonderblock markiert. Der Block nennt beide Zuordnungen und weist ausdrücklich darauf hin, bei jeder anderen Kategorie direkt mit Schritt 10 fortzufahren.

## Öffentliche Produktgrenze

Öffentliche Projekttexte dürfen klar sagen, dass DokoHilf:

- ausschließlich erklärt,
- keine Endnutzerkonten besitzt,
- keine Personenprofile oder Fallakten führt,
- keine personenbezogenen Bewohner-/Mitarbeiterdaten entgegennimmt.

Das ist keine Einschränkung, die später „weggeplant“ werden soll, sondern eine dauerhafte Produktgrenze.

## Pflicht-QA vor Merge

Mindestens:

- kompletter GitHub-Actions-Build erzeugt exakt 93 statische Supertonic-F1-WAVs
- kein Cloud-TTS-Aufruf im aktiven Voice-Releasepfad
- Begrüßung und bestätigte Folgeanweisung bleiben ohne lokale iPhone-Inferenz
- lokaler Notweg verwendet ebenfalls Supertonic F1 und bleibt zeitlich begrenzt
- keine Systemstimme
- Bericht-Sonderfall: genau Schritte 6–9, beide Protokollnamen, sichtbare Überspringregel
- iOS `393×852` und Android `412×915` ohne Overflow/Überlagerung
- Detailhilfe-QA grün
- Datenschutz-/Produktgrenzen-Verträge grün
- kompletter Deploy-/Release-Nachweis grün
- exakter PR-Head geprüft und nur manuell gemergt

Nach Merge `main`, `gh-pages`, statische Audiozusammenfassung und Supabase-Build-Schalter live prüfen. Danach real auf dem iPhone mindestens Begrüßung plus mehrere bestätigte Guide-Schritte testen.
