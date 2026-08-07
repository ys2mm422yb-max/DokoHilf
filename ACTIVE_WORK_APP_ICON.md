# DokoHilf – App-Icon an v27-Design angleichen

**Status:** Abgeschlossen und veröffentlicht  
**Stand:** 7. August 2026  
**Arbeitsbranch:** `design/app-icon-20260807`  
**Produkt-PR:** #62

## Nutzerauftrag

Das Webapp-/Homescreen-Symbol soll deutlich besser zum tatsächlichen DokoHilf-Appdesign passen.

## Umgesetzte Designentscheidung

Das bisherige helle grüne Symbol mit großer weißer Fläche, gelbem Glanzstern und eher illustrativem Look wurde durch ein ruhigeres, dunkles App-Icon ersetzt.

Umgesetzt:

- dunkle Petrol-/Schwarz-Grundfläche passend zu Build 27
- dezente grüne und blaue Lichtakzente aus dem bestehenden UI
- subtile Rasterstruktur wie in der App
- weiterhin eindeutig DokoHilf: Sprechblase + Mikrofon
- keine Schrift im Icon
- keine gelbe Dekoration und keine cartoonartige weiße Großfläche
- wichtige Geometrie innerhalb der maskable-safe-zone
- auch in kleiner Homescreen-/Favicon-Größe klar erkennbar

## Geänderte Produktdateien

- `icon.svg`
- `manifest.webmanifest`

`manifest.webmanifest` wurde auf die echten dunklen Build-27-Farben ausgerichtet:

- `background_color`: `#020c12`
- `theme_color`: `#061018`

## Lokale visuelle Prüfung

Vor dem Produkt-PR wurde die SVG-Fassung lokal gerendert und geprüft:

- native Vorschau: 512 × 512
- Kleingrößenprüfung: 64 × 64
- Mikrofon und Sprechblase bleiben in 64 × 64 eindeutig lesbar
- Farben entsprechen den v27-Tokens `#020c12`, `#70f0aa`, `#1fcf83`, `#4fa6ff`
- SVG ist als XML valide

## CI-Verlauf

PR #62, erster Head `03ca78ea01cacc02c5174f163b4fff3b3549c441`:

- 165/165 Routingfälle bestanden
- 3/3 Gesprächssequenzen bestanden
- 117/117 deterministische Fach-, Datenschutz- und UI-Vertragstests bestanden
- anschließender Playwright-iPhone-Renderlauf scheiterte einmalig in `page.reload` mit `net::ERR_ABORTED; maybe frame was detached?`
- deshalb kein Merge auf diesem Head

PR #62, finaler exakter Head `62e0b683ec33bcaf8d677494f72bfd8115ea5beb`:

- `Deploy DokoHilf` Run #244 vollständig erfolgreich
- iPhone-Render erfolgreich
- Live-Router erfolgreich
- dynamischer Voice-Fallback erfolgreich
- privates freigegebenes Guide-Audio erfolgreich geprüft
- exakter releasbarer statischer Site-Build erfolgreich

## Merge und Veröffentlichung

- PR #62 manuell gemergt
- Merge-Commit: `10fedecd38d25fb2eb29d2061383cce8d26a5a39`
- kein Auto-Merge verwendet
- Arbeitsbranch nicht automatisch gelöscht
- `gh-pages/icon.svg` enthält nach Veröffentlichung das neue dunkle Symbol
- `gh-pages/manifest.webmanifest` enthält `background_color: #020c12` und `theme_color: #061018`
- veröffentlichter Produktbuild bleibt `20260806-27`; geändert wurde die visuelle PWA-Marke, nicht der fachliche Build

## Hinweis zu bereits installierten iPhone-Homescreen-Icons

iOS kann das Homescreen-Icon einer bereits hinzugefügten Webapp länger zwischenspeichern. Wenn ein bereits installiertes Symbol trotz veröffentlichter Änderung alt bleibt, kann ein erneutes Entfernen und Hinzufügen zum Homescreen erforderlich sein. Das ist iOS-Cacheverhalten und kein Grund, alternative öffentliche Links zu verwenden.

## Nächster Produktstand

Der App-Icon-Arbeitsblock ist abgeschlossen. Der vorher dokumentierte nächste größere Produktblock bleibt die Detailhilfe für `Ich brauche Hilfe / Ich finde das nicht`.
