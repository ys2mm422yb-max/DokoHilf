# Aktiver Arbeitsstand – Build 27 mit statischer Guide-Stimme

**Branch:** `feat/dark-premium-static-guide-audio-v27`  
**Basis:** vollständiger Dark-UI-Stand aus PR #49  
**Status:** in Arbeit

## Ursache der Abtrennung

PR #49 wurde parallel verändert. Ein dort angelegter Audiokatalog wurde wieder entfernt, bevor die zugehörigen WAV-Dateien erzeugt werden konnten. Damit die finale Umsetzung nicht erneut überschrieben wird, läuft die vollständige statische Guide-Audio-Umsetzung auf diesem isolierten Nachfolge-Branch.

## Enthalten

- vollständiges dunkles Build-27-Design
- kompakte Guide-Steuerung und zwei Hauptaktionen
- ausgeblendete technische Kommandonachrichten
- entfernte wiederholte Fantasiedaten-Hinweise
- zeitlich begrenzter Live-TTS-Fallback
- Katalog mit 92 eindeutigen freigegebenen Guide-Schritten plus Begrüßung
- Generator, Manifest-/WAV-/Hash-Tests und Service-Worker-Unterstützung für statische Gacrux-Audios

## Noch vor Merge erforderlich

- alle 93 WAV-Dateien erfolgreich erzeugen und committen
- Pages- und Publish-Workflows um Audioverzeichnis erweitern
- Projektregeln und dauerhafte Übergabe auf die enge Ausnahme für statische allgemeine Guide-Audios aktualisieren
- vollständige Tests und mobile Renderprüfung
- PR #49 als ersetzt schließen
- exakten grünen Head manuell mergen
- `main`, `gh-pages`, Supabase und festen Hauptlink prüfen
