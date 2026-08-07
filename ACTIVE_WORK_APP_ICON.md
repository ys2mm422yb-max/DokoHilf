# DokoHilf – App-Icon an v27-Design angleichen

**Status:** In Umsetzung  
**Stand:** 7. August 2026  
**Branch:** `design/app-icon-20260807`

## Nutzerauftrag

Das Webapp-/Homescreen-Symbol soll deutlich besser zum tatsächlichen DokoHilf-Appdesign passen.

## Designentscheidung

Das bisherige helle grüne Symbol mit großer weißer Fläche, gelbem Glanzstern und eher illustrativem Look wird durch ein ruhigeres, dunkles App-Icon ersetzt.

Verbindliche Richtung:

- dunkle Petrol-/Schwarz-Grundfläche passend zu Build 27
- dezente grüne und blaue Lichtakzente aus dem bestehenden UI
- subtile Rasterstruktur wie in der App
- weiterhin eindeutig DokoHilf: Sprechblase + Mikrofon
- keine Schrift im Icon
- keine gelbe Dekoration und keine cartoonartige weiße Großfläche
- wichtige Geometrie bleibt innerhalb der maskable-safe-zone
- auch in kleiner Homescreen-/Favicon-Größe klar erkennbar

## Betroffene Dateien

- `icon.svg`
- `manifest.webmanifest`

`manifest.webmanifest` wird zusätzlich auf die echten dunklen Build-27-Farben ausgerichtet:

- `background_color`: `#020c12`
- `theme_color`: `#061018`

## Lokale visuelle Prüfung

Vor dem Commit wurde die SVG-Fassung lokal gerendert und geprüft:

- native Vorschau: 512 × 512
- Kleingrößenprüfung: 64 × 64
- Mikrofon und Sprechblase bleiben in 64 × 64 eindeutig lesbar
- Farben entsprechen den v27-Tokens `#020c12`, `#70f0aa`, `#1fcf83`, `#4fa6ff`
- SVG ist als XML valide

## Veröffentlichungsregel

- keine Änderung direkt auf `main`
- Pull Request mit exaktem Head
- vorhandene DokoHilf-Prüfungen müssen grün sein
- kein Auto-Merge
- Branch nach Merge nicht automatisch löschen
- nach Merge `main`, Pages und öffentlichen Hauptlink prüfen

## Hinweis zu bereits installierten iPhone-Homescreen-Icons

iOS kann das Homescreen-Icon einer bereits hinzugefügten Webapp länger zwischenspeichern. Der veröffentlichte Webstand wird aktualisiert; falls ein bereits installiertes Symbol trotzdem alt bleibt, kann ein erneutes Entfernen und Hinzufügen zum Homescreen erforderlich sein. Das ist ein iOS-Cacheverhalten und kein Grund, mehrere alternative öffentliche Links zu verwenden.
