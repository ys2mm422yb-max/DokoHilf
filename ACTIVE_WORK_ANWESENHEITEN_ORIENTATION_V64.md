# DokoHilf – An-/Abwesenheiten-Abgleich v64

**Status:** in Umsetzung  
**Ausgangsstand:** `main` `940467f7e32dba97d91105a49dba5696d8caa3e8`

## Ziel

Den bestehenden An-/Abwesenheiten-Bestand gegen die bereits bestätigte räumliche Orientierung abgleichen, ohne Statusnamen, Felder oder Dokumentationsregeln zu verändern.

## Bestätigter Stand

- Der bestehende Weg `Doku-Erweitert → An-/Abwesenheiten` bleibt gültig.
- Zusätzlich ist `Doku → An-/Abwesenheiten` als Zugang bestätigt.
- `Von` wird weiterhin immer mit Datum und Uhrzeit eingetragen.
- `Bis` wird weiterhin nur eingetragen, wenn der genaue Endzeitpunkt sicher bekannt ist; ansonsten bleibt es leer und wird niemals geschätzt.

## Umsetzung

- `CONFIRMED_WORKFLOWS.md` dokumentiert beide bestätigten Zugänge.
- Die Supabase-Inhaltsmigration ergänzt den alternativen Zugang nur als Troubleshooting/Orientierung.
- Bestehende Guide-Schritte und damit die hörbaren Supertonic-F1-Sätze bleiben unverändert.
- Keine neuen Statusnamen oder Vivendi-Felder werden eingeführt.
- Keine Screenshots, Originalunterlagen oder Echtdaten werden übernommen.

## Freigabe

Migration vorab vollständig in `BEGIN … ROLLBACK` ausschließlich gegen `efifbuqctylsujiauabg` geprüft; der Produktivstand war danach unverändert. Produktive Anwendung erst nach grünem exakten PR-Head und Merge. Danach Supabase, `main`, `gh-pages` und öffentlicher Hauptlink verifizieren.

Danach folgt als eigener Block: DNF-Detailwissen.