# Aktiver Arbeitsstand – Detailhilfe bei „Ich brauche Hilfe / Ich finde das nicht“

**Stand:** 7. August 2026  
**Status:** **fertig, gemergt und auf `gh-pages` ausgeliefert**  
**Build:** `20260806-27`  
**Produkt-PR:** `#74` – gemergt  
**Finaler geprüfter Head:** `e770efa6060d9ced966d57870baa52eff04cc710`  
**Merge-Commit:** `644e93aa55997b0ac62c45db2daf232d1650a646`  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

## Nutzerentscheidung

Der Nutzer hat die veröffentlichte Führung praktisch getestet. Bei der Frage sinngemäß **„Ich finde die Vitalwerte nicht, wo sind die?“** startete DokoHilf zwar den passenden Guide, behandelte das Orientierungsproblem aber anschließend noch wie einen normalen Ablauf mit `Weiter`.

Seit PR #74 gilt deshalb verbindlich:

- Erkennt DokoHilf, dass jemand **einen Klickweg, Reiter oder Menüpunkt nicht findet**, wechselt die Führung in einen eigenen Orientierungs-/Detailhilfemodus.
- Der aktuelle Guide und aktuelle Schritt bleiben erhalten.
- Der Problemhinweis markiert den Schritt **nicht** als erledigt.
- `Weiter` wird während der Fehlersuche ausgeblendet.
- DokoHilf fragt zuerst, **was der Nutzer tatsächlich sieht**.
- Erst nach bestätigtem Fund des gesuchten Punkts wird der normale Guide wieder freigegeben.
- Nicht bestätigte Vivendi-Wege, Alternativmenüs oder Feldbezeichnungen dürfen nicht erfunden werden.
- Fehlt der bestätigte Punkt wirklich, stoppt DokoHilf und führt zum letzten sicheren Einstieg zurück oder empfiehlt menschliche Unterstützung.
- Dieselbe Logik gilt im Schreib- und Sprachmodus.

Die zugrunde liegenden Nutzerbilder bleiben ausschließlich im Chat. Sie wurden nicht in GitHub, Supabase, Tests, Issues, PRs, Artefakte oder die App übernommen.

## Erkennung typischer Probleme

Der Detailhilfemodus berücksichtigt unter anderem Formulierungen wie:

- `Ich finde das nicht`
- `Ich sehe den Menüpunkt nicht`
- `Wo sind die Vitalwerte?`
- `Wo ist ...?`
- `Wo muss ich klicken / drücken / tippen?`
- `Bei mir heißt das anders`
- `Ich bin auf einer anderen Seite / in einem anderen Reiter`
- `Ich weiß nicht, wo ich bin`
- `Ich komme nicht weiter`
- `Ich brauche Hilfe`

## Vitalwerte – jetzt bestätigtes Verhalten

Für den vom Nutzer gezeigten Fall läuft die Hilfe bewusst detailliert:

1. DokoHilf sagt ausdrücklich, dass jetzt **nur die richtige Stelle gesucht** und noch kein Schritt abgeschlossen wird.
2. Orientierung auf den bestätigten Einstieg **Doku-Erweitert**.
3. Erste strukturierte Rückfrage:
   - `Doku-Erweitert ist offen`
   - `Ich bin in Doku / einem anderen Reiter`
   - `Doku-Erweitert fehlt`
   - `Ich weiß nicht, wo ich bin`
4. Erst nach bestätigtem `Doku-Erweitert ist offen` erklärt DokoHilf genauer:
   - `Vitalwerte` und `Vitalwerte Sammelerf.` sind **zwei getrennte Einträge**.
   - Für einen einzelnen Vitalwert wird `Vitalwerte` benötigt.
5. Zweite strukturierte Rückfrage:
   - `Vitalwerte sehe ich`
   - `Ich sehe nur „Vitalwerte Sammelerf.“`
   - `„Vitalwerte“ fehlt`
   - `Ich bin mir nicht sicher`
6. Nur bei `Vitalwerte sehe ich` endet der Hilfemodus und `Weiter` darf wieder erscheinen.
7. Bei `Vitalwerte fehlt` wird nicht geraten. DokoHilf sagt ausdrücklich, dass kein bestätigter Alternativ-Klickweg vorliegt.

## Technische Umsetzung

### `assets/detail-help-v27.js`

Kontrollierte, flüchtige Client-Hilfelogik:

- erkennt Orientierungs-/Problemformulierungen vor einem normalen KI-Roundtrip;
- übernimmt bei laufendem Guide dessen Slug und Schritt;
- initialisiert bei eindeutig bestätigtem Ziel wie Vitalwerte einen sicheren Orientierungseinstieg;
- hält die Hilfesitzung ausschließlich im RAM;
- erzeugt strukturierte Rückfragen und Antwortschaltflächen;
- hält `guideStep` während der Fehlersuche stabil;
- blendet `#commandRow` und damit `Weiter` im `helpMode` aus;
- beendet die Hilfeschleife erst nach bestätigtem Fund oder bewusster Übergabe an menschliche Unterstützung;
- verwendet dieselben Antwortoptionen in Chat und Voice;
- greift nicht auf `localStorage`, `sessionStorage` oder `indexedDB` zu.

### Wrapper-Reihenfolge

Die Release-Injektion ist absichtlich:

`clarification-ui.js → detail-help-v27.js → guide-progress.js`

Dadurch:

- sieht die Detailhilfe den ursprünglichen Bedienwunsch **bevor** die normale Routerlogik ihn umschreibt;
- kann `guide-progress.js` die synthetische sichere Hilfsantwort trotzdem lesen und den aktuellen Schritt korrekt anzeigen;
- bleibt die bestehende serverseitige Routerlogik eine zweite Sicherheitsebene für alle nicht lokal abgefangenen Fälle.

Die Einbindung erfolgt über `scripts/apply-detail-help-v27.mjs` beim exakten Release-Build.

### PWA-Auslieferung

Der ausgelieferte Service Worker auf `gh-pages` trägt:

`HOTFIX_REVISION = '20260807-detail-help-cross-platform-1'`

und cached:

`./assets/detail-help-v27.js?v=20260806-27`

Im ausgelieferten `index.html` liegt die Datei tatsächlich zwischen `clarification-ui.js` und `guide-progress.js`.

## Cross-Platform-QA

Die verbindliche Mobile-Regel aus PR #71 bleibt erfüllt. Der reale Detailhilfe-Test läuft auf:

- iOS: **393 × 852**
- Android/Pixel: **412 × 915**

Auf beiden Profilen wird derselbe Vitalwerte-Problemfall vollständig durchgeklickt:

1. freie Frage `Hallo ich finde die Vitalwerte nicht wo sind die?`;
2. Detailhilfe statt normalem `Weiter`;
3. vier strukturierte Orientierungsantworten;
4. zunächst `Schritt 1 von 2`;
5. `Weiter` verborgen;
6. nach `Doku-Erweitert ist offen` detaillierter Schritt 2;
7. Erklärung des separaten Eintrags `Vitalwerte Sammelerf.`;
8. `Vitalwerte fehlt` stoppt an der Fachgrenze;
9. kein erfundener Alternativweg;
10. Guide wird nicht als erledigt markiert;
11. kein horizontaler Overflow;
12. dieselbe Hilfelogik im Voice-Modus;
13. für diesen eindeutig lokalen Hilfefall kein unnötiger AI-Router-Roundtrip.

## Finaler Validierungsstand PR #74

Exakter Head `e770efa6060d9ced966d57870baa52eff04cc710`:

- **Deploy DokoHilf #296** – erfolgreich
- **Validate dark iPhone UI v27 #49** – erfolgreich
- **Validate detailed help iOS Android #7** – erfolgreich
  - Source-/Syntaxverträge grün
  - 7/7 neue deterministische Detailhilfe-Tests grün
  - exakter Release-Build grün
  - realer Detailhilfe-Render auf iOS grün
  - realer Detailhilfe-Render auf Android grün

PR #74 wurde danach manuell mit exakt diesem Head gemergt. Der Branch wurde nicht automatisch gelöscht.

## Live-/Repository-Verifikation nach Merge

Verifiziert:

- `main` enthält Merge-Commit `644e93aa55997b0ac62c45db2daf232d1650a646`;
- PR #74 ist `closed` + `merged`;
- `gh-pages/service-worker.js` enthält Revision `20260807-detail-help-cross-platform-1` und `detail-help-v27.js` im Core-Cache;
- `gh-pages/index.html` lädt `clarification-ui.js → detail-help-v27.js → guide-progress.js` in der vorgesehenen Reihenfolge;
- die bisherige PWA-Icon-Auslieferung für iOS und Android bleibt erhalten.

## Datenschutz und Fachgrenze

Keine Nutzerbilder, Echtdaten, Namen, Bewohner-, Gesundheits-, Mitarbeiter- oder Zugangsdaten wurden in die Umsetzung übernommen. Die automatisierten Screenshots enthalten ausschließlich künstliche App-Zustände und Bedienfragen.

Detailhilfe darf weiterhin nur aus `CONFIRMED_WORKFLOWS.md` und anderen ausdrücklich bestätigten DokoHilf-Fachquellen ableiten. Wenn eine sichtbare Abweichung nicht bestätigt ist, sagt DokoHilf das offen und erfindet keinen Klickweg.

## Nächster sinnvoller Ausbau

Die Grundlogik ist fertig und live. Weitere Detailhilfen können nun **pro bestätigtem Ablauf** mit zusätzlichen sicheren Bildschirmzuständen ergänzt werden – zum Beispiel Visite, Bericht, Formulare oder Durchführung – ohne das Grundverhalten neu zu bauen.

## Dauerhafte Dokumentationsregel

Jeder zukünftige DokoHilf-Arbeitsblock hinterlässt seinen echten Stand dauerhaft im Repository: Entscheidung, betroffene Dateien/Komponenten, Tests, Fehler, Blocker, aktueller PR/Head sowie der nächste ausführbare Schritt. Ein neuer Chat soll die Arbeit aus GitHub fortsetzen können, ohne alte Chats rekonstruieren zu müssen.
