# DokoHilf – verbindliche Cross-Platform-Freigabe

**Status:** verbindlich  
**Stand:** 10. August 2026

Diese Regel gilt dauerhaft für jede Produktänderung an DokoHilf.

## Pflichtplattformen

DokoHilf muss auf beiden unterstützten mobilen Plattformen funktionieren:

- **iPhone / iOS**
- **Android**

Eine Änderung darf nicht gemergt oder veröffentlicht werden, wenn ein relevanter Test auf einer der beiden Plattformen fehlschlägt.

## Was bei Produktänderungen geprüft werden muss

Je nach betroffenem Bereich müssen die vorhandenen mobilen Render- und Interaktionstests mindestens sicherstellen:

- App und Hauptmenü rendern ohne horizontalen Überlauf;
- Bibliothek und Gruppen werden vollständig dargestellt;
- Karten und Buttons sind antippbar;
- direkte Anleitungen lassen sich öffnen und zurücknavigieren;
- Chat funktioniert auf beiden Plattformprofilen;
- Sprachmodus funktioniert auf beiden Plattformprofilen;
- statische Supertonic-Sprachausgabe bleibt frei von System-/Gerätestimmen und Cloud-TTS;
- keine Console- oder Page-Errors im mobilen Render;
- PWA-/Update-Verhalten blockiert keine Plattform.

## GitHub-Freigabe

Für Produkt-/Releaseänderungen gilt weiterhin der exakte-Head-Prozess aus `PROJECT_RULES.md` und `PROJECT_HANDOFF.md`.

- Alle acht etablierten Produkt-Workflows müssen auf demselben exakten PR-Head grün sein.
- Dazu gehören ausdrücklich die vorhandenen iPhone-/iOS- und Android-Render-/Interaktionstests.
- Kein Auto-Merge.
- Nach dem manuellen Merge werden `main`, `gh-pages` und der öffentliche Hauptlink verifiziert.

## Testdaten

Alle mobilen Tests bleiben vollständig synthetisch. Keine reale Person, kein realer Bewohner, Mitarbeiter, Fall oder Gesundheitsdatensatz wird nachgebildet oder verwendet.

Diese Datei ist eine dauerhafte DokoHilf-Projektregel und wird vor jeder Produktarbeit zusammen mit den übrigen Kernregeln gelesen.
