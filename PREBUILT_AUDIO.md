# DokoHilf – vorproduzierte Guide-Sprachausgaben

**Stand:** 6. August 2026  
**Ziel-Build:** `20260806-27`

## Zweck

Bekannte, freigegebene Guide-Schritte werden nicht bei jeder Nutzung erneut an einen externen TTS-Dienst gesendet. Sie werden einmal mit der freigegebenen Stimme **Gacrux** erzeugt und als statische WAV-Dateien mit der PWA ausgeliefert.

Damit starten Begrüßung und bestätigte Klickwege deutlich schneller und bleiben auch bei einem Ausfall des externen TTS-Anbieters verfügbar. Nur freie, nicht im Katalog vorhandene Antworten nutzen weiterhin den zeitlich begrenzten Live-TTS-Weg und danach die lokale Sofortstimme.

## Datenbasis

- 23 freigegebene Guides
- 108 Guide-Schritte
- 92 eindeutige Schritttexte
- zusätzlich eine allgemeine Begrüßung
- Quelle ausschließlich `public.dokohilf_guides` mit Status `approved`
- keine Checks, Nutzerantworten, Bewohnerdaten oder Gesprächsinhalte in den Audiodateien

## Dateien

- `assets/guide-audio-catalog.json`: vollständiger, überprüfbarer Textkatalog
- `scripts/generate-guide-audio.mjs`: deterministische Erzeugung und WAV-/Header-Prüfung
- `assets/guide-audio-manifest.json`: erzeugter Index mit Textschlüssel, Dateipfad, Größe und SHA-256
- `assets/audio/guides/*.wav`: statische freigegebene Gacrux-Audios
- `assets/experience-v27.js`: bevorzugt statische Audios vor Live-TTS
- `service-worker.js`: cached freigegebene Audios für wiederholte und Offline-Nutzung

## Sicherheitsgrenze

Die Ausnahme von der sonstigen Regel „Audio nur flüchtig“ gilt ausschließlich für diese statischen, allgemeinen und fachlich freigegebenen Bedienanweisungen. Nutzerstimmen, Diktate, freie Antworten, Gesprächsverläufe und personenbezogene Inhalte werden weiterhin nicht dauerhaft gespeichert.

## Aktualisierung

Ändert sich ein freigegebener Guide-Schritt, muss der Katalog neu aus dem freigegebenen Datenbestand erstellt, das betroffene Audio neu erzeugt und der vollständige Manifest-/Hash-Test erneut ausgeführt werden. Alte Audiodateien dürfen nicht still weiterverwendet werden.
