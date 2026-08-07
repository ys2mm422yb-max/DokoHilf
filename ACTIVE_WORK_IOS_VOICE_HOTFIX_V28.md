# ACTIVE WORK – iPhone Sprach-Hotfix v28

**Status:** abgeschlossen, gemergt und veröffentlicht  
**Stand:** 7. August 2026  
**Implementierungsbranch:** `fix/ios-static-first-voice-v28-20260807` (bewusst behalten)  
**Produkt-PR:** `#80`  
**Finaler geprüfter Head:** `d10be14fee6a6e2389f57b203379d05f541e5e60`  
**Merge-Commit:** `725fbbab510ff2af300b1074577420c74ca9f477`  
**Build:** `20260807-28` / sichtbare Version `v28`  
**PWA-Hotfixrevision:** `20260807-local-natural-voice-v28-2`

## Reproduzierter Praxistest

Auf einem echten iPhone wurde v28 nach der ersten Veröffentlichung erfolgreich geladen. Die App blieb im fokussierten Sprachmodus jedoch dauerhaft bei „Lokale Stimme erzeugt Antwort …“, ohne hörbare Begrüßung.

Öffentlich dokumentiert werden ausschließlich das reproduzierte Produktverhalten, technische Ursachen und anonymisierte Ergebnisse.

## Ursache

Der erste v28-Release hatte den freigegebenen statischen Gacrux-Audiopfad vollständig aus dem aktiven Runtime-Pfad entfernt. Gleichzeitig startete bereits der Einstieg in den Sprachmodus `armAndPrepare()` und damit den vollständigen lokalen Supertonic-3-Ladevorgang.

Auf iOS bedeutete das bereits für die Begrüßung:

- Download/Initialisierung des ungefähr 415 MB großen Modells,
- WASM-Inferenz im Safari/PWA-Prozess,
- keine zeitliche Obergrenze bis zur Antwort.

CI simuliert die lokale Engine und konnte dieses reale Geräteverhalten im ersten v28-Release deshalb nicht nachweisen.

## Veröffentlichte Hotfix-Architektur

v28 bleibt ohne hörbare Systemstimme. Der Sprachweg ist jetzt **statisch zuerst, lokal nur bei Bedarf**:

1. Für den gesprochenen Text wird zuerst ausschließlich der bestehende freigegebene `dokohilf-guide-audio`-Manifestpfad abgefragt.
2. Existiert dort ein passendes bestätigtes Gacrux-Audio, wird dieses direkt abgespielt.
3. Nur wenn kein freigegebenes Audio existiert, wird Supertonic lokal auf dem Gerät gestartet.
4. Das große Supertonic-Modell wird beim bloßen Öffnen des Sprachmodus nicht mehr vorab geladen.
5. iOS verwendet für freie lokale Sätze 2 Denoising-Schritte statt 5.
6. Lokale Inferenz hat eine harte Obergrenze: iOS 20 Sekunden, andere Plattformen 35 Sekunden. Danach endet die Anfrage sichtbar statt endlos zu drehen.
7. `speechSynthesis` / Gerätestimme bleibt blockiert.
8. Freie lokal erzeugte Audios werden nicht dauerhaft gespeichert.

Die statischen Audios sind ausschließlich vorab freigegebene allgemeine Bedienanweisungen. Nutzertexte oder Gesprächsinhalte werden nicht in diesen Cache geschrieben.

## Live-Stand der freigegebenen Audios bei der Analyse

Im festen DokoHilf-Supabase-Projekt waren zum Zeitpunkt der Analyse für Build `20260806-27` 9 statische Gacrux-Audios registriert. Darunter:

- Index 0: Begrüßung,
- Index 33: „Öffne Doku-Erweitert und wähle Visiten.“

Dieser Bestand ist veränderlich und muss bei zukünftiger Audioarbeit erneut live geprüft werden.

## Datenschutz- und Fachgrenzen

Verbindlich:

- dauerhaft keine realen Bewohner-, Gesundheits-, Mitarbeiter-, Fall- oder Zugangsdaten,
- das Echtdatenverbot ist auch durch spätere organisatorische Freigaben nicht aufhebbar,
- ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Projektinhalte,
- vollständig synthetische Testdaten,
- keine erfundenen Klickwege,
- `CONFIRMED_WORKFLOWS.md` bleibt fachliche Quelle,
- generierte freie Supertonic-Audios werden nicht dauerhaft gespeichert,
- nur freigegebene statische Bedien-Audios und Modellressourcen dürfen technisch gecacht werden.

## Finaler Pflicht-QA-Nachweis

Exakter Produkt-Head `d10be14fee6a6e2389f57b203379d05f541e5e60`:

- `Deploy DokoHilf` Run **#355** – success
- `Validate local voice v28 iOS Android` Run **#43** – success
- `Validate detailed help iOS Android` Run **#66** – success
- `Validate dark iPhone UI v27` Run **#98** – success

Geprüft wurden unter anderem:

- iOS 393×852,
- Android 412×915,
- Begrüßung über den statischen freigegebenen Audiopfad ohne Start der lokalen Inferenzengine,
- nicht statisch vorhandene Folgeantwort über die lokale v28-Testengine,
- keine hörbare Systemstimme,
- kein Runtime-Cloud-TTS für v28,
- harte iOS-Inferenzgrenze,
- Detailhilfe und mobile Geometrie,
- exakter releasbarer statischer Site-Build,
- dauerhafte neutrale Veröffentlichungs- und Echtdatenregeln.

## Veröffentlichung nach Merge

PR #80 wurde manuell mit exakt diesem grünen Head gemergt. Der Implementierungsbranch wurde nicht automatisch gelöscht.

Nach Merge verifiziert:

- `main` enthält Merge-Commit `725fbbab510ff2af300b1074577420c74ca9f477`,
- `main/PROJECT_RULES.md` enthält das dauerhafte absolute Echtdatenverbot,
- `gh-pages/service-worker.js` enthält `HOTFIX_REVISION = '20260807-local-natural-voice-v28-2'`,
- `gh-pages` lädt `local-voice-v28.js` und `local-voice-gate-v28.js`,
- der ausgelieferte Gate verwendet den freigegebenen statischen Audiopfad vor lokaler Supertonic-Inferenz.

## Nächster erforderlicher Praxistest

Der technische Release ist abgeschlossen. Der nächste sinnvolle Schritt ist ein erneuter Test auf dem echten iPhone:

1. DokoHilf vollständig schließen und neu öffnen.
2. Prüfen, dass `KI · v28` sichtbar ist.
3. Sprachmodus öffnen: die Begrüßung muss ohne vollständige Supertonic-Initialisierung starten.
4. Danach eine freie Folgefrage stellen und Antwortzeit sowie Klang prüfen.

Wenn eine freie Folgeantwort auf einem realen iPhone weiterhin zu langsam oder stumm bleibt, wird nicht wieder auf die Systemstimme zurückgefallen. Dann muss die lokale Freitext-Engine separat neu bewertet werden.
