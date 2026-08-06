# DokoHilf – vorproduzierte Guide-Sprachausgaben

**Stand:** 6. August 2026  
**Ziel-Build:** `20260806-27`

## Zweck

Bekannte, freigegebene Guide-Schritte sollen nicht bei jeder Nutzung erneut an einen externen TTS-Dienst gesendet werden. Sie werden mit der freigegebenen Stimme **Gacrux** erzeugt, in einem privaten Supabase-Storage-Bucket gespeichert und ausschließlich über den kontrollierten Edge-Endpunkt `dokohilf-guide-audio` ausgeliefert.

Vorhandene statische Dateien starten schneller und bleiben nach dem Gerätecache auch bei einem vorübergehenden Providerausfall verfügbar. Fehlt ein statischer Eintrag, nutzt DokoHilf TTS v20 und nach rund 1,9 Sekunden die lokale Sofortstimme.

## Datenbasis

- 23 freigegebene Guides
- 108 Guide-Schritte
- 92 eindeutige Schritttexte
- zusätzlich eine allgemeine Begrüßung
- Quelle ausschließlich `public.dokohilf_guides` mit Status `approved`
- keine Checks, Nutzerantworten, Bewohnerdaten oder Gesprächsinhalte in den Audiodateien

## Repositoryquellen

- `assets/guide-audio-catalog.json`: vollständiger überprüfbarer Textkatalog
- `assets/experience-v27.js`: bevorzugt statische Audios vor Live-TTS
- `assets/voice-diagnostics.js`: leitet den bisherigen Manifestaufruf auf den privaten Endpunkt und cached Manifest sowie WAVs auf dem Gerät
- `service-worker.js`: cached freigegebene Audios für wiederholte und Offline-Nutzung
- `supabase/functions/dokohilf-guide-audio/index.ts`: Manifest- und WAV-Auslieferung
- `supabase/functions/dokohilf-guide-audio-build/index.ts`: token-geschützte, fortsetzbare Erzeugung
- `scripts/live-static-guide-audio-smoke.mjs`: Live-Prüfung von Manifest, RIFF/WAVE, Größe und SHA-256

## Supabase-Speicher

- privater Bucket: `dokohilf-guide-audio`
- Registry: `public.dokohilf_static_guide_audio`
- interner Builderzustand: `public.dokohilf_internal_build_control`
- Manifestformat: Schema 2
- jeder Eintrag enthält Index, Textschlüssel, Text, Endpunkt, Größe, SHA-256, Stimme, Modell, API-Weg, Parser, Stil und Erstellzeit

Der öffentliche GitHub-Pages-Build enthält keine WAV-Binärdateien und kein lokales Audio-Manifest.

## Sicherheitsgrenze

Die Ausnahme von der sonstigen Regel „Audio nur flüchtig“ gilt ausschließlich für statische, allgemeine und fachlich freigegebene Bedienanweisungen.

**Nutzerstimmen, Diktate, freie Antworten, Gesprächsverläufe werden nicht dauerhaft gespeichert.** Dasselbe gilt für Namen, Fallinhalte, Gesundheitsdaten, Checks und individuelle Eingaben.

Nicht dauerhaft gespeichert werden:

- Nutzerstimmen
- Diktate
- freie Antworten
- Gesprächsverläufe
- Namen
- Fallinhalte
- Gesundheitsdaten
- Checks und individuelle Eingaben

Die Builder-Funktion verlangt ein zufälliges internes Token. Dieses Token wird in einer nicht öffentlich lesbaren Supabase-Tabelle erzeugt und liegt niemals in GitHub oder im Browser. Ein Aufruf ohne Token wurde mit HTTP 403 geprüft.

## Kontrollierter Teilrollout

Google begrenzt neue TTS-Erzeugungen aktuell zeitweise mit HTTP 429. Deshalb:

- wird nur der jeweils nächste fehlende Index versucht
- werden fertige Dateien nicht erneut erzeugt
- läuft der Versuch höchstens stündlich
- stoppt sich der Builder bei 93/93 selbst
- blockiert der Teilbestand die sichtbare Build-27-Oberfläche nicht

Der normale Build-27-Test verlangt mindestens einen vollständig geprüften Eintrag. Der vollständige Audioabschluss wird separat streng geprüft:

```bash
DOKOHILF_REQUIRE_COMPLETE_AUDIO=1 node scripts/live-static-guide-audio-smoke.mjs
```

## Aktualisierung

Ändert sich ein freigegebener Guide-Schritt, muss der Katalog neu aus dem freigegebenen Datenbestand erstellt werden. Der betroffene Registryeintrag und die zugehörige Storage-Datei müssen ersetzt und anschließend Manifest-, Größen-, Hash- und WAV-Prüfungen erneut ausgeführt werden. Alte Audiodateien dürfen nicht still weiterverwendet werden.
