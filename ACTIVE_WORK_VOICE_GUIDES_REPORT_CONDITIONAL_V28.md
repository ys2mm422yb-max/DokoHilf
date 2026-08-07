# ACTIVE WORK – kostenlose Voice-Guides und Bericht-Sonderfall v28

**Stand:** 7. August 2026  
**Status:** abgeschlossen, vollständig geprüft, manuell gemergt und veröffentlicht
**Branch:** `fix/static-supertonic-accountfree-v28-20260807`  
**Finaler PR-Head:** `6061f4d532ec4eddadd84bf6e658735ba35571ba`
**Merge-Commit:** `7eed2aec275464e90436c3686aae30671f3803e3`
**Build:** `20260807-28` / sichtbare Version `v28`  
**Ziel-PWA-Revision:** `20260807-static-supertonic-guides-v28-4`

## Verbindliche Nutzerentscheidungen

DokoHilf bleibt dauerhaft eine **reine erklärende Bedienhilfe**:

- keine DokoHilf-Endnutzerkonten
- keine Bewohner-/Mitarbeiterprofile
- keine Fallakten oder personenbezogenen Eingabemasken
- keine Eingabe oder Speicherung von Bewohner-, Mitarbeiter- oder sonstigen Personendaten
- automatisierte Tests ausschließlich mit synthetischen UI-Zuständen, neutralen Platzhaltern und erfundenen technischen Werten; keine reale Person und kein realer Fall werden nachgebildet

Technische GitHub-/Supabase-Administrationskonten sind Infrastruktur und keine App-Benutzerkonten.

Für die Stimme gilt: **keine kostenpflichtige TTS-API und kein Wechsel auf eine System-/Gerätestimme.** Die reguläre DokoHilf-Stimme soll einheitlich Supertonic F1 sein.

## Bereits veröffentlichter Bericht-Sonderfall

Aus PR #82/#83 bleibt verbindlich:

- `Kontakt – alles außer Arzt` → `Fallgespräch`
- `Sturzereignis` → `Sturzprotokoll`
- nur bei diesen zwei Kategorien gelten die Protokollschritte 6–9
- bei allen anderen Berichtskategorien Schritte 6–9 überspringen und direkt mit Schritt 10 fortfahren
- das kleine rote X entfernt nur die Protokollverknüpfung, nicht den Bericht

Die Darstellung dieses Sonderblocks bleibt Bestandteil der mobilen Regressionstests.

## Reproduziertes Voice-Problem

Der veröffentlichte v28-3-Stand kann bestätigte vorhandene Audios abspielen. Fehlt für den nächsten Guide-Satz jedoch ein fertiges Audio, fällt die App auf lokale Supertonic-WASM-Inferenz zurück. Auf einem realen iPhone ist dieser Weg für normale Guide-Folgeantworten weiterhin nicht zuverlässig genug.

Deshalb wird die Rechenarbeit für **bestätigte allgemeine Guide-Sätze** aus dem iPhone herausgenommen.

## Neue kostenlose Voice-Architektur

1. Der bestehende 93-Satz-Guide-Katalog bleibt die Quelle für bestätigte allgemeine Sprachanweisungen; 18 feste Dialogsätze ergänzen Begrüßung, Detailhilfe und Abschluss.
2. Der öffentliche GitHub-Actions-Releasejob erzeugt alle **111 Sätze** (93 + 18) mit **Supertonic 3 / Stimme F1 / Deutsch** als statische WAV-Dateien.
3. Die veröffentlichte PWA lädt den lokalen Katalog und spielt ein passendes statisches Supertonic-Audio ab.
4. Begrüßung und bestätigte Folgeanweisungen benötigen dadurch keine lokale iPhone-WASM-Inferenz.
5. Router-`spokenText` wird für die Sprachausgabe berücksichtigt, damit kurze bestätigte Guide-Sätze zuverlässig getroffen werden.
6. Nur ein noch nicht vorbereiteter freier Satz darf als technischer Notweg lokal mit derselben Supertonic-F1-Stimme erzeugt werden; auf iOS gilt weiterhin eine harte Zeitgrenze.
7. System-/Gerätestimme bleibt blockiert.
8. Der aktive Browser-Sprachpfad ruft keine Cloud-TTS-API auf.

Kernkomponenten:

- `scripts/build-supertonic-guide-audio-v28.py`
- `assets/local-voice-gate-v28.js`
- `.github/workflows/pages.yml`
- `scripts/build-static-site-v27.sh`
- `service-worker.js`
- mobile Voice-/Detailhilfe-/Bericht-QA

## Cloud-Sprachaufbau dauerhaft stillgelegt

Der vorherige automatische serverseitige statische Sprachaufbau darf für den neuen kostenlosen Releasepfad nicht weitergenerieren.

PR #86 ersetzt `dokohilf-tts`, `dokohilf-guide-audio-build` und die alte Gacrux-Auslieferung `dokohilf-guide-audio` durch nicht-generierende `410 Gone`-Ruhestandsendpunkte, aktiviert für alle drei `verify_jwt = true`, hält `public.dokohilf_internal_build_control.enabled = false` und entfernt den Cron `dokohilf-static-guide-audio-v27` per Migration. Damit kann weder der Browser noch der alte Serverpfad kostenpflichtiges Cloud-TTS erzeugen oder alte Gacrux-Audios ausliefern.

## Öffentliche Produktgrenze

Öffentliche Projekttexte sollen klar sagen, dass DokoHilf:

- ausschließlich erklärt,
- keine Endnutzerkonten besitzt,
- keine Personenprofile oder Fallakten führt,
- keine personenbezogenen Bewohner-/Mitarbeiterdaten entgegennimmt.

Das ist keine später aufzuweichende Planung, sondern eine dauerhafte Produktgrenze.

## Finaler QA-Nachweis

Auf dem exakten PR-Head grün:

- kompletter GitHub-Actions-Build erzeugt exakt 111 statische Supertonic-F1-WAVs (93 Guide-Sätze + 18 feste Dialogsätze)
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

GitHub-Runs auf Head `6061f4d`:

- Deploy DokoHilf #383 – success
- Validate dark iPhone UI v27 #123 – success
- Validate detailed help iOS Android #94 – success
- Validate local voice v28 iOS Android #71 – success
- Validate report conditional iOS Android #24 – success

Live-Supabase nach Merge:

- `dokohilf-tts` v22, `dokohilf-guide-audio-build` v4 und `dokohilf-guide-audio` v2: `verify_jwt = true`, nur `410 Gone`-Ruhestandscode, kein Provider-/Storagezugriff
- Build-Schalter `false`
- Cron `dokohilf-static-guide-audio-v27` entfernt
- Supabase Auth: 0 Nutzer
- Security-Advisories: 0 Hinweise; Performance-Advisories: 6 reine Infohinweise zu bislang ungenutzten Indizes

Der Pages-Workflow veröffentlicht dasselbe exakt geprüfte `_site` ausschließlich über den dafür zugelassenen `gh-pages`-Branch; der redundante, durch die Environment-Regeln verbotene API-Deployjob wurde entfernt. Nächster Schritt ist der reale iPhone-Test mit Begrüßung plus mehreren bestätigten Guide-Schritten.
