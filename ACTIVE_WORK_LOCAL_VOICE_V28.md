# ACTIVE WORK – Lokale natürliche Stimme v28

**Status:** In Umsetzung / noch nicht veröffentlicht  
**Stand:** 7. August 2026  
**Branch:** `feat/local-natural-voice-v28`  
**Ziel-Build:** `20260807-28` / sichtbare Version `v28`

## Nutzerentscheidung

Der Nutzer möchte für den Sprachmodus:

- keine hörbare iOS-/Android-Systemstimme mehr,
- eine durchgehend gute/natürliche Stimme auch bei freien Folgeantworten,
- keine laufenden TTS-/Sprach-API-Kosten,
- iOS **und** Android als gleichwertig geprüfte Plattformen.

Der bisherige v27-Ansatz mit Gacrux-Cloud-TTS plus 160/180-ms-Gerätestimmen-Fallback ist für dieses Ziel fachlich verworfen.

## Live-Ursache des bisherigen Problems

Vor Start dieses Blocks im DokoHilf-Supabase-Projekt live geprüft:

- Text-/Router-Antworten typischerweise im Bereich weniger hundert Millisekunden.
- `dokohilf-tts` v21 zeigte reale erfolgreiche Gacrux-TTS-Laufzeiten um 12–13 Sekunden.
- Gleichzeitig wurden mehrfach HTTP 429 vom TTS-Pfad beobachtet.
- Der bisherige schnelle Client-Fallback konnte diese Providerlatenz nur mit der unerwünschten Gerätestimme kaschieren.

Daraus folgt: Kein weiterer Timeout-Hotfix. v28 trennt die hörbare Sprachausgabe vom Cloud-TTS.

## Gewählte v28-Architektur

Lokale Browser-TTS mit **Supertonic 3**:

- Modellquelle: `Supertone/supertonic-3`
- Sprache: Deutsch (`de`)
- Stimme für den ersten Praxistest: `F1`
- Inferenz: ONNX Runtime Web
- Android: WebGPU bevorzugt, WASM als lokaler Fallback
- iOS: WASM
- Qualitäts-/Geschwindigkeitsstartwert: 5 Denoising-Schritte
- generierte Antwort-Audios werden nicht dauerhaft gespeichert
- Modellressourcen dürfen nach dem ersten Download in `CacheStorage` auf dem Gerät bleiben
- kein Cloud-TTS-Aufruf für v28-Sprachausgabe
- keine hörbare `speechSynthesis`-/Gerätestimme als Fallback

Die Modellquelle umfasst laut aktueller Hugging-Face-Anzeige ungefähr 415 MB. Der erste Voice-Start kann daher deutlich länger dauern. Danach soll die lokale Modellablage weitere Antworten ohne erneuten vollständigen Download ermöglichen. Browser können Site-Daten/Cache bei Speicherdruck entfernen; deshalb darf DokoHilf einen erneuten Modelldownload nicht als unmöglich darstellen.

## Neue/angepasste Komponenten

Neu:

- `assets/local-voice-v28.js` – Modellaktivierung, lokaler Model-Cache, WebGPU/WASM-Auswahl, lokale TTS-Antworten
- `assets/local-voice-gate-v28.js` – finaler TTS-Gate vor `app.js`; erzwingt lokale Sprachausgabe und blockiert hörbare Systemstimme
- `assets/vendor/supertonic-web-v28.mjs` – angepasster Browser-Inferenzadapter
- `scripts/apply-local-voice-v28.mjs` – Release-Guard gegen alte Gacrux-/Systemstimmen-Pfade
- `tests/local-voice-v28.test.mjs` – deterministische Architekturverträge
- `scripts/local-voice-render-v28.mjs` – mobiler Interaktionstest mit lokaler Testengine
- `.github/workflows/local-voice-v28-mobile.yml` – Pflicht-QA für iOS und Android
- `THIRD_PARTY_NOTICES.md` – Lizenz-/Abhängigkeitshinweise

Angepasst:

- `index.html` / `version.json` → echter v28-Schnitt
- `service-worker.js` → neue Shell-Revision und Erhalt des lokalen Modellcaches
- `assets/ux-v27.js` → 180-ms-Systemstimmenpfad bei v28 deaktiviert
- `assets/detail-help-polish-v27.js` → 160-ms-Systemstimmenpfad bei v28 deaktiviert
- `scripts/apply-detail-help-v27.mjs` → v28-Build-ID und korrekte Voice-/Detailhilfe-Reihenfolge
- `scripts/build-static-site-v27.sh` → erzeugt den v28-Release und prüft lokale Voice-Guards
- bestehende Detailhilfe-Mobile-QA wird auf lokale v28-Stimme umgestellt

## Sicherheits-/Datenschutzgrenzen

Unverändert:

- keine Nutzerbilder/Screenshots in Repo, Supabase, Testartefakte oder App übernehmen,
- keine echten Bewohner-/Gesundheits-/Mitarbeiter-/Zugangsdaten,
- freie Nutzereingaben weiterhin durch bestehenden DokoHilf-Schutzfilter,
- keine erfundenen Vivendi-Klickwege.

Neu für lokale TTS:

- die Sprachsynthese des bereits freigegebenen Antworttexts soll auf dem Gerät erfolgen,
- der generierte Audioinhalt wird nicht dauerhaft gespeichert,
- nur Modell-/Runtime-Ressourcen werden lokal gecacht.

## Lizenz-/Rolloutgrenze

Supertonic 3 wird laut Model Card unter OpenRAIL-M angeboten; der Beispielcode ist laut Model Card MIT-lizenziert. Modellgewichte werden nicht in DokoHilf weiterverteilt. Details stehen in `THIRD_PARTY_NOTICES.md`.

Das ist **keine automatische rechtliche Freigabe** für einen organisationsweiten produktiven Einsatz. Vor einem echten Arbeitsplatz-Rollout müssen Lizenz-/Datenschutz-/IT-Vorgaben separat bestätigt werden.

## Pflichtnachweis vor Merge

Der exakte PR-Head darf erst gemergt werden, wenn mindestens:

1. alle deterministischen v28-Voice-Verträge grün sind,
2. exakter statischer Release-Build grün ist,
3. iOS 393×852: Begrüßung + zweite Detailhilfeantwort über dieselbe lokale Testengine, 0 Cloud-TTS, 0 Systemstimme,
4. Android 412×915: derselbe Nachweis,
5. bestehende Detailhilfe-Interaktion auf iOS + Android weiterhin grün,
6. allgemeine DokoHilf-/Release-QA weiterhin grün,
7. `gh-pages` nach Merge tatsächlich `v28` und die neue Voice-Revision ausliefert.

## Was CI nicht beweisen kann

CI simuliert die lokale Inferenzengine und lädt absichtlich nicht ca. 415 MB Modellgewichte pro Lauf. Dadurch prüft CI Verkabelung, Ausgabepfad, Plattformlayout und das Verbot von Cloud-/System-TTS, aber **nicht** subjektive Klangqualität oder echte Supertonic-Inferenzgeschwindigkeit auf einem konkreten iPhone/Android-Gerät.

Nach Veröffentlichung ist deshalb ein realer Praxistest zwingend:

- v28 sichtbar?
- einmaliger Modelldownload abgeschlossen?
- Begrüßung hörbar?
- freie Folgeantwort hörbar ohne erneuten Tap?
- Klangqualität akzeptabel?
- Antwortzeit auf echtem iPhone und Android akzeptabel?

Wenn Klang oder Geschwindigkeit auf realen Geräten nicht ausreichen, wird nicht wieder auf die Computerstimme zurückgefallen. Dann wird die lokale Engine/Voice bzw. das Modell neu bewertet.
