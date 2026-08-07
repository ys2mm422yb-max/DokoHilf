# ACTIVE WORK – Lokale natürliche Stimme v28

**Status:** Veröffentlicht / technischer Release abgeschlossen  
**Stand:** 7. August 2026  
**Implementierungsbranch:** `feat/local-natural-voice-v28` (bewusst behalten)  
**Release-Build:** `20260807-28` / sichtbare Version `v28`  
**Release-PR:** `#78`  
**Merge-Commit:** `e5f5c421404175218824f47a8cdacc34c84f7b71`

## Nutzerentscheidung

Für den Sprachmodus gelten folgende Ziele:

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

Die Modellquelle umfasst laut bei der Implementierung geprüfter Hugging-Face-Anzeige ungefähr 415 MB. Der erste Voice-Start kann daher deutlich länger dauern. Danach soll die lokale Modellablage weitere Antworten ohne erneuten vollständigen Download ermöglichen. Browser können Site-Daten/Cache bei Speicherdruck entfernen; deshalb darf DokoHilf einen erneuten Modelldownload nicht als unmöglich darstellen.

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
- `scripts/mobile-render-v27.mjs` → allgemeine iOS-/Android-UI-QA nutzt eine lokale v28-Testengine; Service-Worker-Transitions werden dort bewusst blockiert, weil sie separat geprüft werden
- bestehende Detailhilfe-Mobile-QA wurde auf lokale v28-Stimme umgestellt

## Gefundener und behobener Release-Fehler

Der erste v28-Sprachkürzer verwendete nur die ersten zwei Sätze einer längeren Detailhilfeantwort. Dadurch konnten einleitende Sätze die eigentliche Handlungsanweisung abschneiden, etwa bevor „Doku-Erweitert“ gesprochen wurde. Vor der Freigabe wurde `compactText()` so korrigiert, dass die komplette sinnvolle Passage bis zur Zeichenbegrenzung berücksichtigt wird.

## Sicherheits-/Datenschutzgrenzen

Unverändert:

- dauerhaft keine realen Bewohner-, Gesundheits-, Mitarbeiter-, Fall- oder Zugangsdaten,
- ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Projektinhalte,
- freie Nutzereingaben weiterhin durch bestehenden DokoHilf-Schutzfilter,
- keine erfundenen Vivendi-Klickwege.

Neu für lokale TTS:

- die Sprachsynthese des bereits freigegebenen Antworttexts erfolgt auf dem Gerät,
- der generierte Audioinhalt wird nicht dauerhaft gespeichert,
- nur Modell-/Runtime-Ressourcen werden lokal gecacht.

## Lizenz-/Rolloutgrenze

Supertonic 3 wird laut bei der Implementierung geprüfter Model Card unter OpenRAIL-M angeboten; der Beispielcode ist dort als MIT-lizenziert ausgewiesen. Modellgewichte werden nicht in DokoHilf weiterverteilt. Details stehen in `THIRD_PARTY_NOTICES.md`.

Das ist **keine automatische rechtliche Freigabe** für einen organisationsweiten produktiven Einsatz. Vor einem echten Arbeitsplatz-Rollout müssen Lizenz-/Datenschutz-/IT-Vorgaben separat bestätigt werden. Das dauerhafte Echtdatenverbot aus `PROJECT_RULES.md` bleibt unabhängig davon bestehen.

## Erbrachter Freigabenachweis

PR #78 wurde erst auf dem exakten Head `591f945d68675aa323090143ca2934957e5c093c` manuell gemergt, nachdem alle vier Pflichtworkflows auf genau diesem Head grün waren:

1. `Validate local voice v28 iOS Android` – grün; Pflicht-Viewport **iOS 393×852** und **Android 412×915** jeweils erfolgreich,
2. `Validate detailed help iOS Android` – grün; beide mobilen Plattformprofile erfolgreich,
3. `Validate dark iPhone UI v27` – grün,
4. `Deploy DokoHilf` – grün; darin 132/132 deterministische Fach-/Privacy-/UI-Verträge, iOS-/Android-Render, Routerprüfung und exakter statischer Release-Build erfolgreich.

Nach dem Merge wurde verifiziert:

- `main/version.json` → `20260807-28`, Release `local-natural-voice`,
- `gh-pages/version.json` → ebenfalls `20260807-28`,
- `gh-pages/index.html` lädt `local-voice-v28.js` und `local-voice-gate-v28.js`,
- `gh-pages/service-worker.js` → `HOTFIX_REVISION = '20260807-local-natural-voice-v28-1'`,
- lokale Modellcache-Ausnahme `dokohilf-local-voice-model-v28-1` ist im veröffentlichten Service Worker enthalten.

## Was CI nicht beweisen kann

CI simuliert die lokale Inferenzengine und lädt absichtlich nicht ca. 415 MB Modellgewichte pro Lauf. Dadurch prüft CI Verkabelung, Ausgabepfad, Plattformlayout und das Verbot von Cloud-/System-TTS, aber **nicht** subjektive Klangqualität oder echte Supertonic-Inferenzgeschwindigkeit auf einem konkreten iPhone/Android-Gerät.

Nach Veröffentlichung ist deshalb ein realer Praxistest erforderlich:

- v28 sichtbar?
- einmaliger Modelldownload abgeschlossen?
- Begrüßung hörbar?
- freie Folgeantwort hörbar ohne erneuten Tap?
- Klangqualität akzeptabel?
- Antwortzeit auf echtem iPhone und Android akzeptabel?

Wenn Klang oder Geschwindigkeit auf realen Geräten nicht ausreichen, wird nicht wieder auf die Computerstimme zurückgefallen. Dann wird die lokale Engine/Voice beziehungsweise das Modell neu bewertet.
