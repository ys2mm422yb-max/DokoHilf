# DokoHilf – Durchführungsnachweis Orientierung v56

**Status:** IN ARBEIT  
**Scope:** ausschließlich Orientierungshilfe im bestehenden Durchführungsnachweis-Ablauf  
**App-Version:** v33 / Build `20260812-41`

## Ziel

Im laufenden Durchführungsnachweis-Guide soll eine Folgefrage wie „Wo ist die feste Leiste?“ nicht mehr lediglich dieselbe Schritt-Hilfe wiederholen. Der eigentliche bestätigte Klickweg bleibt unverändert.

## Verbindlicher fachlicher Umfang

- `Doku` ist ein Hauptbereich in der festen grünen Hauptleiste ganz oben.
- Nach Auswahl von `Doku` erscheinen direkt darunter die zugehörigen Funktionen.
- `Durchführungsnachweis` liegt unter `Doku`.
- Keine routinemäßige Prüfung des aktuellen Bereichs in diesen Ablauf aufnehmen.
- Kein neuer Klickweg für allgemeines Abzeichnen nach dem geöffneten Durchführungsnachweis.
- Normaler Medikationsbereich bleibt ausschließlich zum Ansehen.

Die fachliche Source of Truth bleibt `CONFIRMED_WORKFLOWS.md`. Es werden keine Prüfmaterialien oder internen Ausgangsunterlagen im Repository dokumentiert oder gespeichert.

## Technische Umsetzung

`assets/orientation-help-v29.js` beantwortet bestätigte Orientierungsrückfragen vor dem generischen Smart-Help-Pfad, aber ausschließlich bei:

- `durchfuehrungsnachweis-oeffnen`, Schritt 1 (`Doku` öffnen),
- `durchfuehrungsnachweis-finden`, Schritt 2 (resident-first Guide, `Doku`/Durchführungsnachweis).

Bestätigte Fragen wie „Wo ist Doku?“, „Wo ist die feste Leiste?“ oder „Was meinst du mit Reiter?“ bleiben auf demselben Guide-Schritt und erhalten die vorhandene bestätigte Orientierung. Alle anderen Guides behalten ihre bisherige Hilfelogik.

Für die Sprachausgabe werden ausschließlich bereits vorhandene Sätze aus dem statischen Supertonic-F1-Katalog wiederverwendet. Es wird keine neue TTS-Quelle und kein Fallback eingeführt.

Der Service-Worker rotiert nur den Shell-Cache, damit die geänderte Frontend-Hilfe trotz unveränderter v33-/Build-ID sicher ausgeliefert wird. Bestehende Release-/Hotfix-Marker bleiben unverändert erhalten.

## Supabase

Keine Migration, keine Inhaltsänderung und kein Function-Deploy erforderlich. Die bestehenden approved Guides bleiben unverändert.

## Regressionen

`tests/durchfuehrungs-orientation-v56.test.mjs` prüft insbesondere:

- Doku-Rückfrage im DNF-Guide liefert bestätigte Orientierung statt Wiederholung,
- Folgefrage zur festen grünen Leiste erklärt die Leiste konkret,
- Reiter-Rückfrage bleibt beim aktuellen Schritt,
- keine Bereichsprüfung wird ergänzt,
- resident-first Einstieg bleibt unverändert,
- andere Guides behalten die bestehende Smart-Help-Reihenfolge.

## Veröffentlichung

Merge erst nach vollständig grünen Prüfungen auf dem exakten finalen PR-Head. Danach `main`, `gh-pages` und der feste öffentliche Hauptlink real prüfen. Vor dieser Prüfung ist der Block nicht als live oder abgeschlossen zu bezeichnen.
