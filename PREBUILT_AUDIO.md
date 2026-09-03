# DokoHilf – statische Supertonic-Sprachausgabe

**Stand:** 3. September 2026  
**Ziel-Build:** `20260903-42` / v34

## Zweck

Alle hörbaren DokoHilf-Sätze werden im geprüften GitHub-Releasebuild einmalig mit der kostenlosen Sprachengine **Supertonic 3**, Stimme **F1**, Deutsch erzeugt. Die veröffentlichte PWA spielt ausschließlich diese statischen WAV-Dateien ab.

Es gibt **keinen** Browser-, Geräte-, Systemstimmen-, WebGPU-/WASM- oder Cloud-TTS-Notweg. Wenn ein frei formulierter sichtbarer Antworttext nicht exakt als statischer Sprachsatz vorbereitet ist, spricht DokoHilf nur einen ebenfalls vorab erzeugten neutralen Fallbacksatz; der vollständige Text bleibt im Chat sichtbar.

## Aktueller statischer Quellenbestand

Der Basiskatalog ist ein versionierter Snapshot aller aktuell freigegebenen Guide-Schritte:

- **41** freigegebene Guides im aktuellen freigegebenen Guide-Snapshot
- **133** eindeutige freigegebene Schritttexte
- plus eine allgemeine Begrüßungsquelle = **134 Basissätze** in `assets/guide-audio-catalog.json`
- zusätzlich **33** feste Dialogsätze
- **49** Release-/UI-Sätze
- **39** Durchführungssätze
- **1** kurzer Sprachstartsatz
- **17** Navigationssätze
- **10** Kontext-Hilfesätze

Der Releasebuilder führt diese Quellen zusammen, entfernt Dubletten und leitet die endgültige Zahl der statischen WAV-Dateien **dynamisch** aus dem zusammengeführten Katalog ab. Eine alte fest verdrahtete Gesamtzahl ist ausdrücklich nicht mehr zulässig.

## Verbindliche Regeln

- Der Basiskatalog darf keine veralteten Wege wie `Doku erweitert`, `Aufgaben → Aktuelles`, einen erfundenen direkten Easy-Plan-Schritt, eine falsche Bericht-Hierarchie oder nicht bestätigte An-/Abwesenheits-Statusbeispiele enthalten.
- `Doku-Erweitert` wird nur mit der bestätigten Schreibweise und Hierarchie verwendet.
- Nicht bestätigte Details bleiben offen und werden weder textlich noch als Audio ergänzt.
- Textänderung = vollständige Audio-Neuerzeugung im Releasebuild.
- Der Build bricht ab, wenn erwartete Quellen fehlen, alte verbotene Basissätze wieder auftauchen oder Katalog/WAV-Zahl/Build-Zusammenfassung nicht übereinstimmen.
- Die veröffentlichte Stimme bleibt ausschließlich **Supertonic-F1**.
- Der kurze Sprachstart lautet **„Hey! Wobei brauchst du Hilfe?“**.

Repositoryquellen:

- `assets/guide-audio-catalog.json`: Snapshot aller aktuell freigegebenen Guide-Schritte plus Begrüßungsquelle
- `assets/voice-extra-catalog-v28.json`: feste Dialogsätze
- `assets/voice-release-catalog-v29.json`: Release-Sätze
- `assets/voice-durchfuehrung-catalog-v29.json`: Durchführungssätze
- `assets/voice-ui-catalog-v29.json`: kurzer Sprachstart
- `assets/voice-navigation-catalog-v29.json`: bestätigte Navigation
- `assets/voice-context-help-catalog-v29.json`: Kontext-Hilfe
- `scripts/build-supertonic-guide-audio-v28.py`: Validierung, Deduplizierung und statische Erzeugung
- `assets/local-voice-gate-v28.js`: ausschließlich statische Wiedergabe; System-/Gerätestimmen bleiben blockiert
- `.github/workflows/pages.yml`: vollständiger Releasebuild und Veröffentlichung desselben `_site`-Artefakts

## Stillgelegter alter Cloud-/Lokalinferenz-Aufbau

Die früheren TTS-, Builder- und Gacrux-Auslieferungsfunktionen sind reine Ruhestandsendpunkte. Browsercode lädt keine Supertonic-Modellgewichte und erzeugt kein Audio lokal. Historische private Dateien oder Registryzeilen sind kein aktiver Audio-, Browser-, Auslieferungs- oder Erzeugungspfad.

## Datenschutz- und Produktgrenze

Die statischen Audios enthalten ausschließlich allgemeine freigegebene Bedienanweisungen. **Nutzerstimmen, Diktate, freie Antworten, Gesprächsverläufe**, Namen, Bewohner-, Mitarbeiter-, Gesundheits- und Falldaten sind als Audioquelle ausgeschlossen und werden nicht dauerhaft gespeichert.

DokoHilf ist eine öffentliche erklärende Bedienhilfe ohne Endnutzerkonten, Personenprofile oder Fallakten.

## Aktualisierung

Ändert sich ein freigegebener Guide-Schritt, wird der Basiskatalog aktualisiert und der vollständige statische Sprachbestand im nächsten Release neu erzeugt. Veröffentlicht wird nur, wenn Quellkataloge, WAV-Dateien, Build-Zusammenfassung, mobile QA und der exakt geprüfte Git-Head übereinstimmen.
