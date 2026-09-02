# DokoHilf – Vitalwerte-Abgleich v63

**Status:** in Umsetzung  
**Bezug:** Issue #167  
**Ausgangsstand:** `main` `e372db57e82e489c0ceaef41e7bba808b9a1995e`

## Ziel

Den bestehenden Vitalwerte-Bestand gegen die bereits bestätigte räumliche Orientierung abgleichen, ohne einen gültigen Weg zu ersetzen oder neue Felder beziehungsweise Vitalwerte zu erfinden.

## Bestätigter Stand

- Der bestehende Weg `Doku-Erweitert → Vitalwerte` bleibt gültig.
- Zusätzlich ist `Doku → Vitalwerte` als Zugang bestätigt.
- Für mehrere Werte bleibt der direkte Eintrag `Doku-Erweitert → Vitalwerte Sammelerf.` bestätigt.
- Ist die Vitalwerte-Übersicht bereits geöffnet, kann dort alternativ `Sammelerfassung` gewählt werden.
- Als lokale Vitalwerte sind weiterhin nur die bereits bestätigten Beispiele Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz und Atemalkohol dokumentiert.
- `Gewicht` ist in der aktuellen fachlichen Source of Truth nicht bestätigt und darf deshalb nicht als eigener Routing-Alias behandelt werden.

## Umsetzung

- `CONFIRMED_WORKFLOWS.md` dokumentiert beide bestätigten Vitalwerte-Zugänge und beide bestätigten Wege zur Sammelerfassung.
- Die neue Supabase-Inhaltsmigration ergänzt die alternativen Zugänge nur als Troubleshooting/Orientierung; die vorhandenen Hauptschritte bleiben bestehen.
- Der unbestätigte Alias `gewicht eingeben` wird aus `vitalwerte-einzelwert` entfernt.
- Keine neue hörbare Formulierung und keine Änderung am statischen Supertonic-F1-Katalog.
- Keine Screenshots, Originalunterlagen oder Echtdaten werden übernommen.

## Freigabe

Migration vorab vollständig in `BEGIN … ROLLBACK` gegen ausschließlich `efifbuqctylsujiauabg` geprüft. Produktive Anwendung erst nach grünem exakten PR-Head und Merge. Danach Supabase, `main`, `gh-pages` und öffentlicher Hauptlink verifizieren.

Danach folgt als eigener Block: An-/Abwesenheiten.