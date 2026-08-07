# Aktiver Arbeitsstand – erneuter iPhone-Sprachtest und flüssige Sofortantwort

**Stand:** 7. August 2026  
**Status:** Umsetzung und Validierung laufen  
**Ausgangsbuild:** `20260806-27`  
**Branch:** `fix/fluid-voice-mobile-layout-20260807`

## Nutzer-Retest

Der Nutzer hat den veröffentlichten Stand nach PR #64/#65 erneut auf einem iPhone getestet und zwei Probleme bestätigt:

1. In der fokussierten Sprachansicht überschneiden beziehungsweise überlagern sich Darstellungen noch teilweise.
2. Die Begrüßung startet schnell, aber nach einer gesprochenen Frage dauert der Start der Antwort weiterhin zu lange.

Das neue Nutzerbild bleibt ausschließlich im Chat. Es wird weder ins Repository noch nach Supabase oder in Testartefakte übernommen.

## Technische Einordnung

Die Begrüßung ist bereits als vorbereitetes beziehungsweise gecachtes Audio verfügbar und startet deshalb schnell. Für Antworten nach Nutzereingaben kann weiterhin dynamisches Gacrux-TTS benötigt werden. Der bisherige Client-Fallback von 1,2 Sekunden ist für einen echten Sprachdialog weiterhin zu langsam und kann zusammen mit iOS-`speechSynthesis` wie ein Hängen wirken.

Der bekannte Provider bleibt außerdem grundsätzlich variabel und kann mehrere Sekunden benötigen oder HTTP 429 liefern. Deshalb darf dynamisches Cloud-TTS nicht mehr fühlbar vor der lokalen Antwort stehen.

## Umgesetzter Hotfix auf dem Branch

### Sprache

`assets/ux-v27.js`

- harter TTS-Fallback von 1200 ms auf **180 ms** reduziert
- langsame TTS-Anfrage wird weiterhin über `AbortController` beendet
- bereits fertiges/gecachtes Gacrux-Audio kann weiterhin zuerst gewinnen
- wenn Gacrux nicht praktisch sofort verfügbar ist, übernimmt die lokale Sofortstimme
- iOS-Resume-Watchdog reagiert früher: 60/140/280/520 ms
- sichtbarer Status heißt nun `Antwort startet …`

Ziel: Nach einer Nutzerfrage soll die Sprachausgabe praktisch sofort beginnen. Die natürliche Gacrux-Stimme bleibt ein Qualitätsbonus für bereits vorbereitete Schritte, aber kein Latenz-Blocker mehr.

### Layout

`assets/ux-v27.css`

- im Sprachmodus werden alle direkten Workspace-Geschwister außer `.voice-focus-stage` ausgeblendet
- die Voice-Bühne beginnt fest Safe-Area-abhängig unter der Kopfzeile
- `.voice-focus-inner` und `.voice-focus-main` verwenden eine eindeutige vertikale Flex-Stapelung statt konkurrierender Grid-Höhen
- Anweisung, Console-Slot und Aktionsleiste besitzen getrennte Flex-Bereiche
- Mikrofon wird auf kleinen beziehungsweise niedrigen iPhones stärker begrenzt
- Voice-Engine-Badge wird in der fokussierten Ansicht ausgeblendet, um doppelten Status und Überlagerungen zu vermeiden
- normaler `Version … Aktuell`-Status wird ausgeblendet; Update-/Fehlerzustände bleiben sichtbar

Zusätzlich wurde der Chat visuell verdichtet: klarere Gesprächsfläche, kompaktere mobile Schnellaktionen und kein redundanter aktueller Versionsstatus mitten in der Ansicht.

### PWA-Auslieferung

`service-worker.js`

- Hotfix-Revisionsmarker `20260807-fluid-voice-layout-1`
- Service-Worker-Datei ändert sich dadurch sicher und erzwingt einen neuen Install-/Aktivierungszyklus
- bestehende Build-27-Core-Dateien werden beim Installieren erneut in den Cache geschrieben

Das ist wichtig, weil Build-ID und Asset-URLs weiterhin `20260806-27` heißen. Der Revisionsmarker verhindert, dass eine bereits installierte PWA den alten 1,2-s-Stand dauerhaft weiterverwendet.

## Tests

`tests/voice-layout-v26.test.mjs` wurde auf die neue tatsächliche Vertragslage aktualisiert:

- keine sichtbaren Workspace-Reste neben der Voice-Bühne
- Flex-Stapelung und getrennte Bereiche
- Safe-Area-Inset
- kleine/niedrige iPhone-Geometrie
- 180-ms-Fallback
- früher iOS-Resume-Watchdog
- Service-Worker-Hotfixrevision

## Noch erforderlich

- PR öffnen
- vollständige GitHub-Actions-Prüfung auf dem exakten Head
- Fehler ausschließlich auf dem Branch beheben
- erst bei vollständig grünem exakten Head mergen
- danach `main`, `gh-pages`, festen Hauptlink und tatsächliche ausgelieferte Dateien prüfen
- `PROJECT_HANDOFF.md` auf den finalen Merge-/Live-Stand aktualisieren

## Bereits vorgemerkter nächster Produktblock

Nach diesem Stabilitätsfix bleibt die bereits bestätigte Produktarbeit offen:

- Detailhilfe hinter `Ich brauche Hilfe / Ich finde das nicht`
- häufige Abläufe sollen perspektivisch direkt eine vollständige Schritt-für-Schritt-Anleitung öffnen, statt zuerst einen normalen Chat zu erzeugen

Diese beiden Punkte werden getrennt von diesem akuten Sprach-/Layout-Hotfix umgesetzt, damit die dringende iPhone-Sprachkorrektur klein und sicher validierbar bleibt.
