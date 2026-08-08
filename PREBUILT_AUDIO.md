# DokoHilf – statische Supertonic-Sprachausgabe

**Stand:** 8. August 2026  
**Ziel-Build:** `20260808-29` / PWA-Revision `20260808-context-voice-v29-1`

## Zweck

Bestätigte DokoHilf-Anweisungen werden im geprüften GitHub-Releasebuild einmalig mit der kostenlosen Sprachengine **Supertonic 3**, Stimme **F1**, Deutsch erzeugt. Die veröffentlichte PWA spielt diese statischen WAV-Dateien ab und ruft dafür weder im Browser noch über Supabase eine Cloud-TTS-API auf.

## Vollständiger statischer Bestand

- historischer Basiskatalog: 93 bestätigte Guide-Sätze aus `assets/guide-audio-catalog.json`
- 18 feste Dialogsätze aus `assets/voice-extra-catalog-v28.json`
- 49 zusätzliche v29-Sätze aus `assets/voice-release-catalog-v29.json`
  - aktualisierte beziehungsweise neue bestätigte Guide-Schritte
  - alle derzeit bestätigten `stuck`- und Troubleshooting-Texte, die nicht bereits als normaler Guide-Schritt vorhanden sind
- insgesamt exakt **160 statische WAV-Dateien**

Der v29-Build bricht ab, wenn die Quellen nicht exakt 93 + 18 + 49 eindeutige Sätze ergeben, wenn nicht exakt 160 WAV-Dateien erzeugt wurden oder wenn Katalog und Build-Zusammenfassung nicht `Supertonic-F1` ausweisen.

## Aktiver Sprachpfad

1. Ein passender bestätigter Satz wird aus dem veröffentlichten Supertonic-F1-Katalog abgespielt.
2. Das gilt in v29 auch für bestätigte Hilfe beim Festhängen, Orientierungsfragen und Troubleshooting innerhalb eines laufenden Guides.
3. Nur für einen wirklich noch nicht vorbereiteten freien Satz darf ein zeitlich begrenzter technischer Notweg lokal im Browser dieselbe Supertonic-F1-Stimme erzeugen.
4. Auf iPhone endet dieser Notweg nach kurzer Zeit statt die Oberfläche lange im Zustand „Stimme wird erzeugt“ hängen zu lassen.
5. Das lokal erzeugte Audio bleibt flüchtig und wird nicht dauerhaft gespeichert.
6. Eine System-/Gerätestimme und Cloud-TTS sind keine Fallbacks.

Repositoryquellen:

- `assets/guide-audio-catalog.json`: historischer Basiskatalog mit 93 bestätigten Sätzen
- `assets/voice-extra-catalog-v28.json`: 18 feste Dialogsätze
- `assets/voice-release-catalog-v29.json`: 49 neue beziehungsweise zusätzliche v29-Guide-/Hilfesätze
- `scripts/build-supertonic-guide-audio-v28.py`: eindeutige Validierung und statische Erzeugung
- `assets/local-voice-gate-v28.js`: statischer Supertonic-Pfad und zeitlich begrenzter lokaler Notweg
- `.github/workflows/pages.yml`: vollständiger Releasebuild und Veröffentlichung desselben `_site`-Artefakts
- `scripts/build-static-site-v27.sh`: strenger 160-Dateien-Vertrag für v29

## Stillgelegter alter Cloud-Aufbau

Der frühere Gacrux-/Gemini-Aufbau ist vollständig aus dem erzeugenden Pfad entfernt:

- `dokohilf-tts` antwortet nur noch als nicht-generierender Ruhestandsendpunkt mit `410 Gone`.
- `dokohilf-guide-audio-build` antwortet nur noch als nicht-generierender Ruhestandsendpunkt mit `410 Gone`.
- `dokohilf-guide-audio` liefert die alten Gacrux-Dateien nicht mehr aus und antwortet ebenfalls nur noch mit `410 Gone`.
- Für alle drei Funktionen ist `verify_jwt = true` gesetzt.
- Der interne Build-Schalter bleibt deaktiviert.
- Der frühere Cron `dokohilf-static-guide-audio-v27` wird per Migration entfernt.

Historische private Dateien oder Registryzeilen sind kein aktiver Audio-, Browser-, Auslieferungs- oder Erzeugungspfad und werden von v29 nicht geladen.

## Datenschutz- und Produktgrenze

Die statischen Audios enthalten nur allgemeine, selbst formulierte und freigegebene Bedienanweisungen. **Nutzerstimmen, Diktate, freie Antworten, Gesprächsverläufe**, Namen, Bewohner-, Mitarbeiter-, Gesundheits- und Falldaten sind ausgeschlossen und werden nicht dauerhaft gespeichert.

DokoHilf ist nur eine erklärende Bedienhilfe. Es gibt keine Endnutzerkonten, Personenprofile, Fallakten oder personenbezogenen Eingabemasken; solche Funktionen werden auch später nicht eingeplant. Tests verwenden ausschließlich synthetische UI-Zustände, neutrale Platzhalter und erfundene technische Werte und bilden keine reale Person oder realen Fall nach.

## Aktualisierung

Ändert sich ein bestätigter Satz, wird der vollständige statische Bestand im nächsten Releasebuild neu erzeugt. Veröffentlicht wird nur, wenn Quellkataloge, 160 WAV-Dateien, Build-Zusammenfassung, mobile QA und der exakt geprüfte Git-Head übereinstimmen.
