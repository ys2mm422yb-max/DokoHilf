# Audio-Erzeugungsstatus

**Stand:** 7. August 2026
**Status:** PR #86 in Prüfung; der bisherige Gacrux-Aufbau ist ersetzt
**Ziel:** exakt 111 kostenlose Supertonic-F1-WAV-Dateien

## Aktueller Vertrag

- 93 bestätigte allgemeine Guide-Sätze aus `assets/guide-audio-catalog.json`
- 18 feste Dialogsätze aus `assets/voice-extra-catalog-v28.json`
- insgesamt exakt 111 eindeutige Sätze
- Erzeugung ausschließlich im geprüften GitHub-Releasebuild mit Supertonic 3, Stimme F1, Deutsch
- Veröffentlichung nur bei exakt 111 gültigen WAV-Dateien und übereinstimmender Build-Zusammenfassung
- statische Wiedergabe zuerst; lokale Supertonic-F1-Inferenz nur für einen noch nicht vorbereiteten freien Satz
- keine System-/Gerätestimme und keine Cloud-TTS-API als Sprachpfad

Die 111 WAV-Dateien werden nicht in den Quellbranch committed. Der Releasejob erzeugt sie reproduzierbar und veröffentlicht sie zusammen mit dem dazugehörigen Katalog im exakt geprüften Pages-Artefakt.

## Stillgelegter Altbestand

Die frühere private Gacrux-Registry und vorhandene alte Audiodateien sind nur historischer Bestand. v28-4 lädt sie nicht. Die früheren TTS-, Builder- und Gacrux-Auslieferungsfunktionen antworten ausschließlich mit `410 Gone`, verlangen ein gültiges JWT und enthalten weder Provider- noch Storagezugriff. Der interne Build-Schalter bleibt `false`; der Cron `dokohilf-static-guide-audio-v27` wird entfernt.

Der frühere Stand `1/93`, `7/93` oder `9/93` ist für den aktuellen Sprachpfad ohne Bedeutung und darf nicht mehr als Ausbauziel verwendet werden.

## Prüfung

Quellkataloge ohne Modelldownload prüfen:

```bash
python3 scripts/build-supertonic-guide-audio-v28.py --validate-only
```

Der vollständige GitHub-Releasejob erzeugt anschließend alle 111 Dateien und baut daraus die veröffentlichbare Site mit `DOKOHILF_REQUIRE_STATIC_SUPERTONIC=1`.

Die verbindliche Architektur und Datenschutzgrenze stehen in `PREBUILT_AUDIO.md`, `PROJECT_RULES.md` und `PROJECT_HANDOFF.md`.
