# DokoHilf – Durchführungsnachweis Orientierung v57

**Status:** IN ARBEIT  
**Scope:** ausschließlich Korrektur der bestätigten Orientierung im bestehenden Durchführungsnachweis-Ablauf  
**App-Version:** v33 / Build `20260812-41`

## Anlass

Beim Live-Test der v56-Orientierung wurden zwei Fehler sichtbar:

1. `Bericht` wurde fälschlich als Hauptbereich der grünen Hauptleiste beschrieben.
2. Die Folgefrage `Wo ist die Leiste?` fiel trotz laufendem Doku-Schritt in die generische Smart-Help-Klärung zurück.

Der eigentliche bestätigte Klickweg zum Durchführungsnachweis bleibt unverändert.

## Bestätigte Navigationshierarchie

- Ganz oben befindet sich die grüne Hauptleiste.
- `Doku` ist dort ein Hauptreiter und liegt in der bestätigten Anordnung zwischen `Planung` und `Doku-Erweitert`.
- Nach Auswahl von `Doku` erscheint direkt darunter ein weißes Funktionsband.
- `Bericht` und `Durchführungsnachweis` befinden sich unter `Doku` in diesem weißen Funktionsband.
- `Bericht` ist **kein** Hauptreiter der grünen Hauptleiste.
- Es wird keine routinemäßige Bereichsprüfung in den Durchführungsnachweis-Ablauf aufgenommen.

Interne Ausgangsmaterialien oder Screenshots werden nicht in Repository, Supabase, Tests oder App übernommen. Dokumentiert werden ausschließlich die anonymisierten bestätigten Navigationsfakten.

## Technische Ursache

`durchfuehrungsStepOrientation()` erkannte die Frage `Wo ist die Leiste?` als Doku-Orientierungsfrage. Anschließend wurde jedoch `orientationHelp()` aufgerufen. Diese Funktion lieferte für das alleinige Wort `Leiste` keinen lokalen Hilfetext, weil nur Varianten wie `feste Leiste`, `Hauptleiste` oder `grüne Leiste` direkt abgedeckt waren. Dadurch wurde ein leerer lokaler Payload verworfen und die Anfrage an das generische Smart Help weitergereicht.

Zusätzlich enthielt die gemeinsame Orientierungsbeschreibung ältere falsche Hierarchieformulierungen, in denen `Berichte` auf dieselbe Ebene wie `Doku` gesetzt wurde.

## Umsetzung

- `assets/orientation-help-v29.js`
  - Revision `20260901-durchfuehrungs-orientation-v57-1`.
  - gemeinsame bestätigte Beschreibung der grünen Hauptleiste korrigiert.
  - Doku-Hilfe beschreibt Doku als Hauptreiter zwischen Planung und Doku-Erweitert.
  - Bericht-Hilfe beschreibt Bericht ausdrücklich als Funktion unter Doku im weißen Funktionsband.
  - `Wo ist die Leiste?` wird im laufenden Doku-Schritt eindeutig lokal beantwortet und nicht mehr an generisches Smart Help delegiert.
  - Reiter-Erklärung korrigiert.
- `CONFIRMED_WORKFLOWS.md`
  - bestätigte Navigationshierarchie präzisiert.
- `tests/durchfuehrungs-orientation-v56.test.mjs`
  - Regression für die exakte Formulierung `Wo ist die Leiste?`.
  - Regression gegen die falsche Einordnung von Bericht als Hauptreiter.
  - bestehende Grenzen des DNF-Ablaufs bleiben geprüft.
- `service-worker.js`
  - nur Shell-Cache auf v57 rotiert; bestehende Release-/Hotfix-Marker bleiben erhalten.

## Supabase

Keine Migration, keine Inhaltsänderung und kein Function-Deploy erforderlich. Das produktive Projekt bleibt unverändert.

## Freigabe

Branch → Pull Request → vollständig grüne Prüfungen am exakten finalen PR-Head → manueller Merge → Veröffentlichung → Prüfung von `main`, `gh-pages` und dem festen öffentlichen Hauptlink.
