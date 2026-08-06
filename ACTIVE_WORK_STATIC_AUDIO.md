# Aktiver Arbeitsstand – Build 27 und statische Guide-Stimme

**Finaler Branch:** `feat/dark-premium-v27-release`  
**Finaler Draft-PR:** `#52`  
**Veröffentlichter Hauptstand:** Build `20260806-26`  
**Ziel:** Build `20260806-27`

## Enthalten

- vollständiges dunkles Build-27-Design
- kompakte Guide-Steuerung und zwei sichtbare Hauptaktionen
- ausgeblendete technische Kommandonachrichten
- einmalige Datenschutzbestätigung
- entfernte wiederholte Fantasiedaten-Hinweise
- zeitlich begrenzter Live-TTS-Fallback
- TTS v20 mit funktionierendem Roh-REST-Audioparser
- Katalog mit 92 eindeutigen freigegebenen Guide-Schritten plus Begrüßung
- privater Supabase-Audiobucket und kontrollierter Manifest-/WAV-Endpunkt
- token-geschützter, fortsetzbarer Builder
- stündlicher nächster-fehlender-Index-Job
- Service-Worker- und iPhone-Cache für verfügbare statische Dateien
- Live-Prüfung für Manifest, RIFF/WAVE, Dateigröße und SHA-256

## Nachweise

- TTS v20 aktiv
- Live-TTS: HTTP 200, `audio/wav`, 101804 Bytes, Gacrux, Gemini 3.1, Interactions API, Parser `raw-steps-content-v1`
- Builder ohne internes Token: HTTP 403
- interner Builderaufruf erreicht die Funktion
- privates Manifest: Schema 2, Gacrux, zuletzt 1/93
- Datei 000: HTTP 200, `audio/wav`, 301484 Bytes, passender SHA-256-Header
- weitere unterschiedliche TTS-Erzeugungen aktuell durch Google HTTP 429 begrenzt
- temporärer Quell-Snapshot-Endpunkt wieder deaktiviert: HTTP 410

## Release-Trennung

Build 27 wird nicht mehr durch die vollständige 93er-Bibliothek blockiert. Die App nutzt:

1. vorhandene statische Gacrux-Datei
2. TTS v20 für fehlende statische Einträge
3. nach rund 1,9 Sekunden die lokale Sofortstimme

Der vollständige 93/93-Abschluss bleibt separat streng prüfbar.

## Bereinigte Altregressionen

- `tests/voice-diagnostics.test.mjs` auf TTS v20 und privaten Audiocache migriert
- `tests/live-build-recovery.test.mjs` auf Build 27 migriert
- `tests/voice-layout-v26.test.mjs` behält v26-Layoutschutz, prüft aber die Build-27-Einbindung

Die fachlichen Router- und Klickwegregressionen wurden nicht abgeschwächt.

## Noch vor Merge von Build 27 erforderlich

- in GitHub **Actions → Deploy DokoHilf → Run workflow** den Branch `feat/dark-premium-v27-release` einmal manuell starten
- zusätzlich **Actions → Validate dark iPhone UI v27 → Run workflow** auf demselben Branch starten
- Grund: GitHub unterdrückt Workflowereignisse, die durch die verbundene GitHub-App selbst erzeugt werden; der Connector bietet keinen direkten Dispatch
- alle deterministischen Fach-, Datenschutz- und Sicherheitsverträge grün
- iPhone-Renderprüfung auf 393 × 852 grün
- Live-Router grün
- Live-TTS v20 grün oder dokumentierter zulässiger externer Ausfall
- verfügbarer privater Audiobestand grün geprüft
- Pages-Build grün
- erst danach manueller Merge des exakten PR-#52-Heads
- kein Auto-Merge und keine Branch-Löschung
- nach Merge `main`, `gh-pages`, Supabase und festen Hauptlink prüfen

## Späterer Audioabschluss

- Bestand live bis 93/93 verfolgen
- bei 93/93 strengen Lauf ausführen:

```bash
DOKOHILF_REQUIRE_COMPLETE_AUDIO=1 node scripts/live-static-guide-audio-smoke.mjs
```

- Builder muss sich danach deaktiviert und den Cronjob entfernt haben
- Abschlussstand in `PROJECT_HANDOFF.md` dokumentieren
