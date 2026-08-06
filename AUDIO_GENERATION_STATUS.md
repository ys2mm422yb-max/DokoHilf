# Audio-Erzeugungsstatus

**Stand:** 6. August 2026  
**Ziel:** 93 allgemeine, freigegebene Gacrux-WAV-Dateien  
**Zuletzt verifiziert:** 1/93

Der Wert ist veränderlich und muss vor jeder Aussage live über den Manifestendpunkt oder `public.dokohilf_static_guide_audio` geprüft werden.

## Aktuelle Architektur

- privater Supabase-Bucket `dokohilf-guide-audio`
- Registry `public.dokohilf_static_guide_audio`
- Manifest-/WAV-Endpunkt `dokohilf-guide-audio`
- token-geschützter Builder `dokohilf-guide-audio-build` v2
- interner Zustand `public.dokohilf_internal_build_control`
- stündlicher Cronjob `dokohilf-static-guide-audio-v27`
- keine WAV-Binärdateien im öffentlichen GitHub- oder Pages-Build

## Qualitätsbedingung jedes vorhandenen Eintrags

- gültiger RIFF-/WAVE-Header
- Dateigröße größer als 44 Bytes
- übereinstimmender SHA-256
- Stimme Gacrux
- Modellnachweis
- API-Weg
- Parser `raw-steps-content-v1`
- Stilnachweis
- ausschließlich allgemeiner freigegebener Guide-Text

## Build-27-Bedingung

Für die sichtbare Dark-UI-Veröffentlichung reicht ein korrekt geprüfter Teilbestand, weil fehlende statische Schritte automatisch TTS v20 und danach die lokale Sofortstimme verwenden.

Prüfung:

```bash
node scripts/live-static-guide-audio-smoke.mjs
```

## Vollständiger Audioabschluss

Der Audioausbau gilt erst als abgeschlossen, wenn:

- Manifest `complete: true` meldet
- exakt 93 eindeutige Einträge vorhanden sind
- alle Einträge gültige Größen und SHA-256 besitzen
- repräsentative WAV-Abrufe erfolgreich sind
- der Builder deaktiviert ist
- der Cronjob entfernt wurde

Strenge Prüfung:

```bash
DOKOHILF_REQUIRE_COMPLETE_AUDIO=1 node scripts/live-static-guide-audio-smoke.mjs
```

Die vollständige 93er-Bibliothek ist ein eigener Abschlusszustand und kein Blocker mehr für die bereits funktionsfähige Build-27-Oberfläche.
