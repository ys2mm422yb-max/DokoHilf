# DokoHilf – statische Supertonic-Sprachausgabe

**Stand:** 7. August 2026
**Ziel-Build:** `20260807-28` / PWA-Revision `20260807-static-supertonic-guides-v28-4`

## Zweck

Bestätigte DokoHilf-Anweisungen werden im geprüften GitHub-Releasebuild einmalig mit der kostenlosen Sprachengine **Supertonic 3**, Stimme **F1**, Deutsch erzeugt. Die veröffentlichte PWA spielt diese statischen WAV-Dateien ab und ruft dafür weder im Browser noch über Supabase eine Cloud-TTS-API auf.

## Vollständiger statischer Bestand

- 23 freigegebene Guides
- 108 Guide-Schritte
- 92 eindeutige Schritttexte plus eine allgemeine Begrüßung
- damit 93 bestätigte Guide-Sätze aus `assets/guide-audio-catalog.json`
- zusätzlich 18 feste Dialogsätze aus `assets/voice-extra-catalog-v28.json`
- insgesamt exakt **111 statische WAV-Dateien**

Der Build bricht ab, wenn die Quellen nicht exakt 93 + 18 eindeutige Sätze enthalten, wenn nicht exakt 111 WAV-Dateien erzeugt wurden oder wenn Katalog und Build-Zusammenfassung nicht `Supertonic-F1` ausweisen.

## Aktiver Sprachpfad

1. Ein passender bestätigter Satz wird aus dem veröffentlichten Supertonic-F1-Katalog abgespielt.
2. Nur für einen noch nicht vorbereiteten freien Satz darf ein zeitlich begrenzter technischer Notweg lokal im Browser dieselbe Supertonic-F1-Stimme erzeugen.
3. Das lokal erzeugte Audio bleibt flüchtig und wird nicht dauerhaft gespeichert.
4. Eine System-/Gerätestimme und Cloud-TTS sind keine regulären Fallbacks.

Repositoryquellen:

- `assets/guide-audio-catalog.json`: 93 bestätigte Guide-Sätze
- `assets/voice-extra-catalog-v28.json`: 18 feste Dialogsätze
- `scripts/build-supertonic-guide-audio-v28.py`: eindeutige Validierung und statische Erzeugung
- `assets/local-voice-gate-v28.js`: statischer Supertonic-Pfad und lokaler Notweg
- `.github/workflows/pages.yml`: vollständiger Releasebuild und Veröffentlichung desselben `_site`-Artefakts
- `scripts/build-static-site-v27.sh`: strenger 111-Dateien-Vertrag

## Stillgelegter alter Cloud-Aufbau

Der frühere Gacrux-/Gemini-Aufbau ist vollständig aus dem erzeugenden Pfad entfernt:

- `dokohilf-tts` antwortet nur noch als nicht-generierender Ruhestandsendpunkt mit `410 Gone`.
- `dokohilf-guide-audio-build` antwortet nur noch als nicht-generierender Ruhestandsendpunkt mit `410 Gone`.
- Für beide Funktionen ist `verify_jwt = true` gesetzt.
- Der interne Build-Schalter bleibt deaktiviert.
- Der frühere Cron `dokohilf-static-guide-audio-v27` wird per Migration entfernt.

Historische private Dateien oder Registryzeilen sind kein aktiver Audio-, Browser- oder Erzeugungspfad und werden von v28-4 nicht geladen.

## Datenschutz- und Produktgrenze

Die statischen Audios enthalten nur allgemeine, selbst formulierte und freigegebene Bedienanweisungen. **Nutzerstimmen, Diktate, freie Antworten, Gesprächsverläufe**, Namen, Bewohner-, Mitarbeiter-, Gesundheits- und Falldaten sind ausgeschlossen und werden nicht dauerhaft gespeichert.

DokoHilf ist nur eine erklärende Bedienhilfe. Es gibt keine Endnutzerkonten, Personenprofile, Fallakten oder personenbezogenen Eingabemasken; solche Funktionen werden auch später nicht eingeplant. Tests verwenden ausschließlich synthetische UI-Zustände, neutrale Platzhalter und erfundene technische Werte und bilden keine reale Person oder realen Fall nach.

## Aktualisierung

Ändert sich ein bestätigter Satz, wird der vollständige statische Bestand im nächsten Releasebuild neu erzeugt. Veröffentlicht wird nur, wenn Quellkataloge, 111 WAV-Dateien, Build-Zusammenfassung, mobile QA und der exakt geprüfte Git-Head übereinstimmen.
