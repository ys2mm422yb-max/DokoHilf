# Aktiver Arbeitsstand – PWA-Installationssymbol iOS und Android

**Stand:** 7. August 2026  
**Build:** `20260806-27`  
**Branch:** `fix/pwa-install-icons-v3-20260807`  
**Status:** Umsetzung läuft; vollständige PR-Validierung steht noch aus

## Nutzerfeedback

Der Nutzer meldete nach dem ersten Icon-Restyling, dass auf dem Homescreen weiterhin das gleiche beziehungsweise alte App-Symbol sichtbar ist. Zusätzlich hat der Nutzer ausdrücklich festgelegt, dass DokoHilf **nicht nur auf dem iPhone**, sondern bei jeder mobilen Änderung auch auf **Android** passend funktionieren muss.

Die dauerhafte Cross-Platform-Regel steht in `ACTIVE_WORK_MOBILE_CROSS_PLATFORM.md` und gilt für die gesamte Webapp/PWA.

## Gefundene Ursache

Die bisherige Installationsmetadatenlage war zu schwach:

- `index.html` verwendete für `apple-touch-icon` nur `icon.svg`.
- `manifest.webmanifest` enthielt ausschließlich dasselbe SVG mit `sizes: any` und `purpose: any maskable`.
- iOS und Android konnten dadurch denselben bereits bekannten Icon-Pfad weiterverwenden beziehungsweise stark cachen.
- Es gab keine dedizierten Rastergrößen für iOS, Android und Android-maskable.

## Neues Design

Das neue Symbol ist bewusst näher an der dunklen Build-27-Oberfläche:

- vollflächiger dunkel-petrol/schwarzer Hintergrund statt eines zusätzlichen verschachtelten Icon-Kästchens;
- eine reduzierte Sprech-/Assistenzfläche;
- weißes Mikrofon als klare Hauptform;
- grün-blauer DokoHilf-Akzent;
- kleine Audiopegel links und rechts;
- ausreichend Innenabstand für Android `maskable`.

`icon-v3.svg` ist die diffbare Vektorquelle. Die Installations-PNGs werden deterministisch aus eigenem Code erzeugt; keine Nutzerbilder oder externen Assets werden verwendet.

## Plattformdateien

Verbindliche Auslieferung:

- iOS: `icon-touch-180-v3.png` – 180 × 180
- Android/PWA: `icon-192-v3.png` – 192 × 192
- Android/PWA: `icon-512-v3.png` – 512 × 512
- Android maskable: `icon-maskable-512-v3.png` – 512 × 512
- Browser-/UI-Vektorquelle: `icon-v3.svg`

Die neuen Dateinamen sind absichtlich versioniert, damit alte Homescreen-/Launcher-Cachepfade nicht erneut benutzt werden.

## Technische Umsetzung

### `scripts/generate-pwa-icons-v27.mjs`

Erzeugt die vier PNG-Dateien ohne externe Bibliothek. Der Renderer nutzt ausschließlich Node-Standardmodule und zeichnet das DokoHilf-Symbol deterministisch. Die PNG-Struktur wird direkt erzeugt.

### `scripts/apply-pwa-icons-v27.mjs`

Patcht ausschließlich die gebaute Site:

- Browser-Favicon auf `icon-v3.svg`;
- Apple Touch Icon auf das echte 180×180-PNG;
- sichtbares DokoHilf-Brand-Icon auf `icon-v3.svg`;
- Service-Worker-Revision auf `20260807-pwa-icons-cross-platform-1`;
- alle vier Installationsicons in den PWA-Core-Cache.

### `manifest.webmanifest`

Android erhält echte PNG-Einträge für 192×192 und 512×512 sowie einen separaten `maskable`-Eintrag.

### `scripts/build-static-site-v27.sh`

Der Release-Build:

1. erzeugt die vier Icon-PNGs;
2. setzt die neuen HTML-/Service-Worker-Referenzen;
3. verlangt alle vier Dateien;
4. prüft die iOS- und Android-Metadaten;
5. erlaubt im öffentlichen Build ausschließlich diese vier freigegebenen Rasterbilder;
6. blockiert weiterhin jedes andere JPG/JPEG/PNG und alle WAV-Dateien im Pages-Artefakt.

## Mobile QA

Die bestehende verpflichtende Mobile-QA aus PR #72 läuft weiterhin auf beiden Profilen:

- iOS: 393 × 852
- Android: 412 × 915

Der Icon-Block verändert keine Voice-/Chat-Geometrie. Der exakte Release-Build prüft zusätzlich die plattformspezifischen Installationsmetadaten und tatsächlich erzeugten PNG-Dateien.

## Datenschutz

Keine vom Nutzer hochgeladenen Bilder werden verwendet, kopiert, gespeichert oder veröffentlicht. Das neue Icon ist vollständig neu konstruiert und enthält keinerlei Personen-, Bewohner-, Gesundheits- oder Zugangsdaten.

## Noch erforderlich

- PR öffnen;
- exakten Head vollständig über alle DokoHilf-Workflows prüfen;
- auftretende Fehler nur auf diesem Branch korrigieren;
- nur vollständig grünen exakten Head manuell mergen;
- Branch nicht automatisch löschen;
- danach `main`, `gh-pages`, Manifest, Touch-Icon, Android-Icons und festen Hauptlink kontrollieren;
- finalen Stand in `PROJECT_HANDOFF.md` dokumentieren.
