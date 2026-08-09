# Audio-Erzeugungsstatus

**Stand:** 9. August 2026  
**Status:** v29 – ausschließlich statische Supertonic-F1-WAVs  
**Ziel-Build:** `20260809-34`

## Aktueller Vertrag

- 40 freigegebene Guides in Supabase
- 129 eindeutige freigegebene Guide-Schritttexte
- 130 Basiseinträge inklusive Begrüßungsquelle in `assets/guide-audio-catalog.json`
- weitere kontrollierte Quellen: 33 Dialog, 49 Release, 39 Durchführung, 1 UI, 17 Navigation, 10 Kontext
- Erzeugung ausschließlich im geprüften GitHub-Releasebuild mit Supertonic 3, Stimme F1, Deutsch
- die endgültige WAV-Zahl wird nach Deduplizierung dynamisch aus allen kontrollierten Quellen abgeleitet
- Veröffentlichung nur bei übereinstimmendem Katalog, WAV-Bestand und Build-Zusammenfassung
- ausschließlich statische Wiedergabe; **keine lokale Inferenz**, keine System-/Gerätestimme und keine Cloud-TTS-API

Die WAV-Dateien werden nicht in den Quellbranch committed. Der Releasejob erzeugt sie reproduzierbar und veröffentlicht sie zusammen mit dem dazugehörigen Katalog im exakt geprüften Pages-Artefakt.

## Schutz vor veralteten Sprachwegen

Der Basiskatalog wird als Snapshot der aktuell freigegebenen Supabase-Guide-Schritte gepflegt. Der Builder blockiert bekannte Altwege wie die Schreibweise `Doku erweitert`, `Aufgaben → Aktuelles` und einen direkten erfundenen Easy-Plan-Schritt. Die bestätigte Navigation verwendet `Doku-Erweitert` und die feste grüne Hauptleiste.

## Stillgelegter Altbestand

Die frühere private Gacrux-Registry und alte Audiodateien sind nur historischer Bestand. Die früheren TTS-, Builder- und Gacrux-Auslieferungsfunktionen sind nicht-generierende Ruhestandsendpunkte. Browsercode lädt keine Supertonic-Modellgewichte und erzeugt kein Audio lokal.

## Prüfung

Quellkataloge ohne Modelldownload prüfen:

```bash
python3 scripts/build-supertonic-guide-audio-v28.py --validate-only
```

Der vollständige GitHub-Releasejob erzeugt anschließend den dynamisch ermittelten statischen WAV-Bestand und baut daraus die veröffentlichbare Site mit `DOKOHILF_REQUIRE_STATIC_SUPERTONIC=1`.

Die verbindliche Architektur und Datenschutzgrenze stehen in `STATIC_VOICE_POLICY.md`, `PREBUILT_AUDIO.md`, `PROJECT_RULES.md` und `PROJECT_HANDOFF.md`.
