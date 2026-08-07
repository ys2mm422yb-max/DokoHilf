# Aktiver Arbeitsstand – iPhone-Sprachbühne visuell ausbalancieren

**Stand:** 7. August 2026  
**Status:** abgeschlossen und veröffentlicht  
**Build:** `20260806-27`  
**Produkt-PR:** `#70`

## Nutzer-Retest

Nach dem veröffentlichten Überlappungs-/Latenzfix aus PR #67 wurde auf dem iPhone bestätigt: Die Ansicht war sichtbar besser, aber noch nicht zufriedenstellend.

Der verbleibende Qualitätsmangel war überwiegend **Geometrie und visuelle Hierarchie**:

- zwischen Schrittkarte und Mikrofon lag zu viel tote vertikale Fläche
- das aktive Mikrofon saß optisch zu tief und wirkte von der Schrittkarte getrennt
- Status und Pause wirkten wie ein eigener dritter Block statt als Teil der Mikrofoninteraktion
- die unteren Aktionen waren erreichbar, aber der Gesamtbildschirm wirkte nicht wie eine zusammenhängende Sprachbühne

Öffentlich dokumentiert werden ausschließlich das beobachtete Produktverhalten, technische Ursachen und anonymisierte Ergebnisse.

## Ziel

Die Sprachansicht soll auf einem typischen iPhone wie **ein kontinuierlicher Ablauf** wirken:

`Schrittfortschritt → Schrittkarte → Mikrofon → Status/Pause → Aktionen`

Dabei bleiben unverändert:

- keine Überlagerung mit Kopfzeile oder Versionsstatus
- 180-ms-Sofortfallback für freie Sprachantworten
- bestehende Fachlogik
- bestehende Sprachzustände
- Aktionen `Weiter` und `Ich brauche Hilfe`

## Umsetzung

### `assets/voice-stage-balance-v27.css`

Neue klar abgegrenzte letzte CSS-Schicht ausschließlich für die fokussierte Sprachbühne:

- `voice-focus-inner` als feste Drei-Zonen-Struktur: Kopf / Bühne / Aktionen
- `voice-focus-main` als kontinuierliche vertikale Gruppe statt aufgespannter Restfläche
- `#voiceFocusConsoleSlot` hat keine volle Resthöhe mehr
- Schrittkarte und Voice-Console stehen direkt im normalen Fluss
- aktives Zuhören/Sprechen auf iPhone maximal etwa 134–138 px statt 154 px
- Leerlauf etwa 82–86 px
- Status direkt unter dem Mikrofon
- Pausenbutton kompakter
- Aktionen bleiben als klarer Footer mit Safe-Area-Abstand
- auf niedrigen Geräten zusätzliche Verdichtung

Der Kernunterschied zum vorherigen Stand ist nicht nur ein kleinerer Kreis: Die Console wird nicht mehr auf die gesamte verbliebene Höhe aufgespannt. Dadurch kann das Mikrofon nicht mehr in die Mitte einer riesigen Leerfläche rutschen.

### `index.html`

`voice-stage-balance-v27.css` wird bewusst **nach** `ux-v27.css` geladen, damit diese eine klar definierte Endgeometrie besitzt.

### `service-worker.js`

- neue PWA-Revision `20260807-voice-stage-balance-3`
- Balance-CSS wird im Core-Cache geführt
- installierte iPhone-PWAs erhalten den neuen visuellen Stand trotz gleichbleibender Build-ID

### `scripts/build-static-site-v27.sh`

Der veröffentlichbare Site-Build verlangt jetzt ausdrücklich:

- vorhandene Balance-CSS
- Link im HTML
- Cache-Eintrag im Service Worker
- korrekte Hotfixrevision

## Verschärfte iPhone-Renderprüfung

`scripts/mobile-render-v27.mjs` testet jetzt nicht mehr nur `keine Überlappung` und `kein horizontaler Overflow`.

Der Test hält einen aktiven Guide offen, wechselt **mit bestehender Schrittkarte** in den Sprachmodus und vermisst auf 393 × 852:

- Abstand Kopfzeile → Voice Stage
- sichtbare Schrittkarte
- Leerlauf-Mikrofon maximal 90 px
- aktives Mikrofon maximal 140 px
- Abstand Schrittkarte → Mikrofon mindestens 8 px, höchstens 72 px
- Mittelpunkt des aktiven Mikrofons liegt im oberen 62-%-Bereich der Voice Stage und damit nicht mehr zu tief
- Aktionsleiste bleibt vollständig innerhalb der Bühne
- kein horizontaler Overflow

Damit würde dieselbe übergroße tote Fläche künftig als Regression fehlschlagen.

## Trennung zu anderen Produktblöcken

Der damalige PR #69 blieb bewusst getrennt. Dieser Block veränderte ausschließlich die Voice-Geometrie und ihre Tests. Direkte häufige Anleitungen und der größere Chat-Umbau wurden separat bearbeitet.

## Abschluss

- PR #70 wurde auf vollständig grünem exakten Head manuell gemergt;
- Branch wurde nicht automatisch gelöscht;
- `main`, `gh-pages`, Service Worker und die tatsächlich ausgelieferte Balance-CSS wurden geprüft.
