# Aktiver Arbeitsstand – Abzeichnen → Durchführungsnachweis v52

**Stand:** 22. August 2026  
**Status:** in Prüfung  
**Öffentliche Version:** v31 bleibt unverändert  
**Branch:** `fix/abzeichnen-durchfuehrungsnachweis-20260822`

## Bestätigte Produktentscheidung

Wenn jemand etwas **abzeichnen** möchte, führt DokoHilf immer zum **Durchführungsnachweis des richtigen Bewohners**. Das gilt ausdrücklich auch für Formulierungen wie „Ich muss Medikamente abzeichnen“.

Dabei bleiben die bestehenden Grenzen unverändert:

- zuerst den richtigen Bewohner auswählen;
- danach **Doku → Durchführungsnachweis**;
- die normale Ansicht **Doku-Erweitert → Medikation** bleibt ausschließlich zum Ansehen;
- „falsch abgezeichnet“ bleibt ein Korrekturfall und führt weiterhin zum bestätigten Storno-Ablauf;
- nach dem Öffnen des Durchführungsnachweises wird für allgemeines Abzeichnen kein weiterer, noch nicht bestätigter Klickweg erfunden.

## Umsetzung

- `CONFIRMED_WORKFLOWS.md`: neue verbindliche allgemeine Abzeichnen-Regel und eigener kurzer Orientierungsabschnitt.
- `assets/routing-fix.js`: Abzeichnen wird vor der normalen Fachbereichserkennung deterministisch zum `durchfuehrungsnachweis-finden`-Guide geroutet; falsch abgezeichnet bleibt Storno.
- `supabase/functions/dokohilf-chat-router/index.ts`: dieselbe Priorität serverseitig, auch wenn Client-Routing nicht greift oder bereits ein anderer Guide aktiv ist.
- `supabase/migrations/20260822181400_abzeichnen_durchfuehrungsnachweis_v52.sql`: bestehender approved Guide `durchfuehrungsnachweis-finden` wird von v3 auf v4 erweitert und beginnt künftig mit der Auswahl des richtigen Bewohners; Abzeichnen-Aliase werden ergänzt.
- `service-worker.js`: Routing-Revision `20260822-signoff-durchfuehrungsnachweis-v52-1`, damit installierte PWAs den Hotfix übernehmen.
- `tests/signoff-routing-v52.test.mjs`: Regressionstests für Medikamente, allgemeines Abzeichnen, Medikation ansehen, falsch abgezeichnet, Supabase-Vertrag, statische Sprache und v31.

## Sprache

Es werden keine neuen hörbaren Sätze eingeführt. Beide Schritte des erweiterten Guides verwenden bereits vorhandene statische Supertonic-F1-Sätze aus dem bestehenden Katalog:

1. `Wähle zuerst den gewünschten Bewohner aus.`
2. `Schau ganz oben in die feste grüne Hauptleiste und öffne „Doku“. Direkt darunter erscheinen die zu „Doku“ gehörenden Funktionen. Wähle dort „Durchführungsnachweis“.`

Damit bleibt die kostenlose statische Spracharchitektur unverändert.

## Supabase-Dry-Run

Die geplante Guideänderung wurde am 22.08.2026 vollständig gegen den aktuellen Produktionsstand in `BEGIN … ROLLBACK` ausgeführt. Innerhalb der Transaktion entstand erwartungsgemäß Guide-Version 4 mit Bewohner-Schritt, Durchführungsnachweis-Schritt und Abzeichnen-Aliasen. Nach dem Rollback wurde erneut abgefragt: produktiv ist weiterhin unverändert Version 3 vorhanden.

## Freigabeplan

1. Pull Request erstellen und alle etablierten DokoHilf-Pflichtgates auf exakt demselben Head abwarten, einschließlich iOS/Android und Versions-/Voice-Prüfungen.
2. Erst nach grünen Gates mit Expected-Head-Schutz mergen.
3. Danach produktive Supabase-Migration anwenden und `dokohilf-chat-router` aus dem gemergten Repository-Stand deployen.
4. Abschließend `main`, `gh-pages`, festen Hauptlink und den produktiven Guide/Router real verifizieren.
