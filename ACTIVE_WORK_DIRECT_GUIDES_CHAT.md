# Aktiver Arbeitsstand – direkte häufige Anleitungen und Chatdesign

**Stand:** 7. August 2026  
**Status:** abgeschlossen und veröffentlicht  
**Build:** `20260806-27`  
**Produkt-PR:** `#72`

## Nutzerwunsch

Zwei Produktänderungen wurden ausdrücklich bestätigt:

1. Der Schreibmodus soll ruhiger und klarer wie ein eigener Chat wirken.
2. Ein Tipp auf einen Eintrag unter **„Häufige Abläufe“** soll nicht zuerst einen normalen Chat öffnen. Stattdessen soll direkt die **vollständige Schritt-für-Schritt-Anleitung** des ausgewählten bestätigten Ablaufs sichtbar werden.

Zusätzlich gilt seit PR #71 verbindlich: jede mobile Änderung muss auf **iOS und Android** funktionieren und geprüft werden.

Öffentlich dokumentiert werden ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Ergebnisse.

## Warum PR #69 nicht gemergt wurde

PR #69 (`feature/direct-guides-chat-polish-20260807`) war fachlich weitgehend korrekt; 130/130 deterministische Tests waren zuletzt grün. Der echte Mobile-Render scheiterte jedoch mit:

`Die sieben sichtbaren häufigen Abläufe sind nicht vollständig als direkte Anleitungen verdrahtet.`

Ursache: ältere Build-27-Laufzeitlogik konnte die Hauptmenü-Schaltflächen nachträglich wieder als Chat-Prompts aufbauen. Danach kamen weitere Änderungen auf `main` hinzu, insbesondere die balancierte Sprachbühne und die neue iOS-/Android-Baseline. Der alte PR wurde deshalb durch PR #72 ersetzt.

## Fachquelle

Direkte Anleitungen stammen ausschließlich aus `CONFIRMED_WORKFLOWS.md`. Es werden keine zusätzlichen Klickwege erfunden.

Direkt geführt werden sieben sichtbare häufige Abläufe:

- Bericht anlegen
- Visite anlegen
- Vitalwerte erfassen
- An-/Abwesenheit
- Medikation ansehen
- Formular anlegen
- Übergabe anzeigen

Vitalwerte verzweigen ausschließlich in die beiden bestätigten Varianten:

- einzelner Vitalwert über `Vitalwerte`
- mehrere Werte über `Vitalwerte Sammelerf.`

## Umsetzung

### `assets/direct-guides-v27.js`

- eigener UI-Modus `direct-guide`
- vollständige nummerierte Anleitung ohne KI-Roundtrip
- bestätigte Warnungen/Hinweise sichtbar
- robuste, idempotente Laufzeit-Synchronisierung
- MutationObserver plus `requestAnimationFrame` stellt die sieben Direkt-Schaltflächen wieder her, falls eine ältere Build-27-Schicht sie nachträglich verändert
- kompakter Chatkopf wird ebenso stabilisiert
- keine dauerhafte Speicherung von Nutzer- oder Gesprächsinhalten

### `assets/direct-guides-chat-v27.css`

Die Direktanleitungen und der kompakte Chat liegen bewusst in einer **eigenen CSS-Schicht nach der Voice-Balance**. Diese Datei enthält keine `voice-focus-stage`-Regeln und darf die veröffentlichte Sprachgeometrie nicht überschreiben.

- dunkle nummerierte Schritt-Karten
- klare Warn- und Hinweiskarten
- Vitalwerte-Auswahl
- große Touch-Ziele
- Safe-Area-Abstände links/rechts/unten
- mobile Darstellung ohne horizontalen Overflow
- kompakter Chatkopf, Chips und Bubbles

### PWA

Service-Worker-Revision: `20260807-direct-guides-cross-platform-1`.

Core-Cache enthält zusätzlich:

- `assets/direct-guides-v27.js`
- `assets/direct-guides-chat-v27.css`

Die vorhandene `voice-stage-balance-v27.css` bleibt vollständig erhalten.

## Cross-Platform-QA

`scripts/mobile-render-v27.mjs` ist nicht mehr auf einen festen iPhone-Viewport beschränkt. Der gleiche reale Interaktionsablauf wird im verpflichtenden Pages-Workflow zweimal ausgeführt:

- iOS-Profil: **393 × 852**
- Android-/Pixel-Profil: **412 × 915**

Beide Profile prüfen unter anderem:

- kein horizontaler Overflow
- sieben sichtbare Direktanleitungen, keine alten Hauptmenü-Chat-Prompts
- Bericht direkt mit 12 Schritten
- Vitalwerte genau mit zwei Varianten; Sammelerfassung mit 6 Schritten
- Übergabe direkt mit 4 Schritten
- kompakter Chat
- bestehender schrittweiser Chat
- bestehende Voice-Balance inklusive Schrittkarte, Mikrofon und Aktionen
- keine Console-/Page-Errors

## Abschluss

- PR #72 wurde auf vollständig grünem exakten Head manuell gemergt;
- der alte PR #69 wurde als ersetzt geschlossen;
- Branches wurden nicht automatisch gelöscht;
- `main`, `gh-pages`, Service Worker und der feste Hauptlink wurden anschließend geprüft.
