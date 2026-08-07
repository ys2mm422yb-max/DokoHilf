# ACTIVE WORK – iPhone Sprach-Hotfix v28

**Status:** Umsetzung / Freigabeprüfung läuft  
**Stand:** 7. August 2026  
**Branch:** `fix/ios-static-first-voice-v28-20260807`  
**Build:** `20260807-28` / sichtbare Version `v28`

## Reproduzierter Praxistest

Auf einem echten iPhone wurde v28 nach der Veröffentlichung erfolgreich geladen. Die App zeigte im fokussierten Sprachmodus jedoch dauerhaft „Lokale Stimme erzeugt Antwort …“, ohne hörbare Begrüßung.

Öffentlich dokumentiert werden ausschließlich das reproduzierte Produktverhalten, technische Ursachen und anonymisierte Ergebnisse.

## Ursache

Der erste v28-Release hatte den alten freigegebenen statischen Gacrux-Audiopfad im öffentlichen Build absichtlich vollständig deaktiviert. Gleichzeitig startete bereits der Einstieg in den Sprachmodus `armAndPrepare()` und damit den vollständigen lokalen Supertonic-3-Ladevorgang.

Auf iOS bedeutete das bereits für die Begrüßung:

- Download/Initialisierung des ungefähr 415 MB großen Modells,
- WASM-Inferenz im Safari/PWA-Prozess,
- keine zeitliche Obergrenze bis zur Antwort.

CI simuliert die lokale Engine und konnte dieses reale Geräteverhalten deshalb nicht nachweisen.

## Hotfix-Architektur

v28 bleibt ohne hörbare Systemstimme. Der Sprachweg wird aber auf **statisch zuerst, lokal nur bei Bedarf** geändert:

1. Für den gesprochenen Text wird zuerst ausschließlich der bestehende freigegebene `dokohilf-guide-audio`-Manifestpfad abgefragt.
2. Existiert dort ein passendes bestätigtes Gacrux-Audio, wird dieses direkt abgespielt.
3. Nur wenn kein freigegebenes Audio existiert, wird Supertonic lokal auf dem Gerät gestartet.
4. Das große Supertonic-Modell wird beim bloßen Öffnen des Sprachmodus nicht mehr vorab geladen.
5. iOS verwendet für freie lokale Sätze 2 Denoising-Schritte statt 5.
6. Lokale Inferenz erhält eine harte Obergrenze: iOS 20 Sekunden, andere Plattformen 35 Sekunden. Danach endet die Anfrage sichtbar statt endlos zu drehen.
7. `speechSynthesis` / Gerätestimme bleibt weiterhin blockiert.

Die statischen Audios sind ausschließlich vorab freigegebene allgemeine Bedienanweisungen. Keine Nutzertexte oder Gesprächsinhalte werden in diesen Cache geschrieben.

## Live-Stand der freigegebenen Audios vor dem Hotfix

Im festen DokoHilf-Supabase-Projekt live geprüft: Für Build `20260806-27` waren zum Zeitpunkt der Analyse 9 statische Gacrux-Audios registriert. Darunter befinden sich insbesondere:

- Index 0: die Begrüßung,
- Index 33: „Öffne Doku-Erweitert und wähle Visiten.“

Damit kann die reale iPhone-Begrüßung ohne Supertonic-Initialisierung sofort den schmalen freigegebenen Audiopfad verwenden. Eine vollständige 93/93-Bibliothek wird hier nicht behauptet.

## Datenschutz- und Fachgrenzen

Unverändert:

- dauerhaft keine realen Bewohner-, Gesundheits-, Mitarbeiter- oder Zugangsdaten,
- ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Projektinhalte,
- keine erfundenen Vivendi-Klickwege,
- `CONFIRMED_WORKFLOWS.md` bleibt fachliche Quelle,
- generierte freie Supertonic-Audios werden nicht dauerhaft gespeichert,
- nur freigegebene statische Bedien-Audios und Modellressourcen dürfen technisch gecacht werden.

## Pflicht-QA vor Merge

Der exakte PR-Head darf erst manuell gemergt werden, wenn mindestens:

- `Deploy DokoHilf` grün ist,
- `Validate local voice v28 iOS Android` grün ist,
- `Validate detailed help iOS Android` grün ist,
- die bestehende Mobile-/Dark-QA grün ist,
- iOS 393×852 beweist: Begrüßung nutzt statisches Audio und startet die lokale Testengine dabei nicht,
- Android 412×915 denselben statisch-zuerst Ablauf beweist,
- eine nicht statisch vorhandene Folgeantwort weiterhin lokal erzeugt wird,
- 0 hörbare Systemstimmenaufrufe und 0 Runtime-Cloud-TTS-Aufrufe auftreten,
- der Release-Build die neue Service-Worker-Revision `20260807-local-natural-voice-v28-2` enthält.

Nach Merge muss `gh-pages` dieselbe Revision ausliefern. Anschließend ist erneut ein echter iPhone-Praxistest erforderlich.
