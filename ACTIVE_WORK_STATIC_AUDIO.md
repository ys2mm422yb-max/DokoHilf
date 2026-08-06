# Aktiver Arbeitsstand – Build 27 und statische Guide-Stimme

**Finaler Branch:** `release/build-27-final-validation`  
**Finaler Pull Request:** `#53`  
**Ersetzter Release-PR:** `#52`  
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
- korrigierte Playwright-Prüfung für die sichtbare Vollbild-Sprachansicht auf 393 × 852

## Live nachgeprüfter Stand vom 6. August 2026

- Supabase-Projekt `efifbuqctylsujiauabg` ist aktiv und gesund
- 23 freigegebene Guides mit 108 Schritten
- TTS v20, Router v11, Guide-Audio v1 und Builder v2 aktiv
- privates Manifest: Schema 2, Gacrux, 1/93
- Datei 000: 301484 Bytes, gültiger SHA-256-Eintrag
- privater Bucket mit genau einem Audioobjekt
- Builder aktiviert; Cronjob `dokohilf-static-guide-audio-v27` aktiv und stündlich
- weitere unterschiedliche TTS-Erzeugungen aktuell durch Google HTTP 429 begrenzt
- temporäre Diagnose-, Export-, Batch-, Store- und Snapshot-Endpunkte sind auf HTTP 410 neutralisiert
- Supabase-Sicherheitsberater: keine Lints

## Release-Trennung

Build 27 wird nicht durch die vollständige 93er-Bibliothek blockiert. Die App nutzt:

1. vorhandene statische Gacrux-Datei
2. TTS v20 für fehlende statische Einträge
3. nach rund 1,9 Sekunden die lokale Sofortstimme

Der vollständige 93/93-Abschluss bleibt separat streng prüfbar.

## Manueller Lauf #229 und Korrektur

Der erste manuell gestartete Lauf auf Head `369e7a127b78833927697f842fa54fc136d26436` bestand 114 von 117 Tests. Die drei Vertragsabweichungen wurden behoben:

- Mobile Build-27-Regeln werden jetzt aus der tatsächlich aktiven Schicht `assets/ux-v27.css` geprüft.
- Der Datenschutztest prüft die tatsächlich angewandte SQL-Migration mit `regexp_replace`, Regex-Verifikation und harter Exception-Grenze.
- Die Audio-Datenschutzdokumentation benennt die ausgeschlossenen Nutzerinhalte zusätzlich in einem eindeutigen Satz.

Keine Fach-, Sicherheits- oder Datenschutzregel wurde abgeschwächt.

## Noch vor Merge von Build 27 erforderlich

- in GitHub **Actions → Deploy DokoHilf → Run workflow** den Branch `release/build-27-final-validation` erneut manuell starten
- dieser Workflow enthält Syntax-, Fach-, Datenschutz-, Sicherheits-, Live-Router-, Live-TTS-, privaten Audio-, Pages-Build- und Playwright-iPhone-Prüfungen
- Grund: GitHub unterdrückt Workflowereignisse, die durch die verbundene GitHub-App selbst erzeugt werden; der verbundene Connector stellt keinen Workflow-Dispatch bereit
- erst nach vollständig grünem Lauf auf dem dann exakten PR-#53-Head darf manuell gemergt werden
- kein Auto-Merge und keine Branch-Löschung
- PR #52 erst danach als ersetzt schließen; Branch nicht löschen
- nach Merge `main`, `gh-pages`, Supabase und den festen Hauptlink prüfen

## Späterer Audioabschluss

- Bestand live bis 93/93 verfolgen
- bei 93/93 strengen Lauf ausführen:

```bash
DOKOHILF_REQUIRE_COMPLETE_AUDIO=1 node scripts/live-static-guide-audio-smoke.mjs
```

- Builder muss sich danach deaktiviert und den Cronjob entfernt haben
- Abschlussstand in `PROJECT_HANDOFF.md` dokumentieren
