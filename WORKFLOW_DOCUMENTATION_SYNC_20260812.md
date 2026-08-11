# DokoHilf – GitHub-Dokumentationsabgleich bestätigter Klickwege

**Stand:** 12. August 2026  
**Scope:** ausschließlich GitHub-Dokumentation  
**Keine Produktänderung:** keine App-Datei, kein JavaScript, kein Router, keine Sprache, keine Migration, kein Supabase-Objekt verändert

## Anlass

Bei einem reinen Lese-Audit wurde festgestellt, dass mehrere später bestätigte und bereits funktionierende Klickweg-Details technisch in GitHub, Migrationen, Guides, Sprachkatalogen und Tests vorhanden waren, aber `CONFIRMED_WORKFLOWS.md` als zentrale dauerhafte Fachquelle nicht an allen Stellen auf denselben neuesten Stand nachgezogen worden war.

Die laufende App funktionierte bereits korrekt und durfte ausdrücklich nicht verändert werden. Deshalb wurde nur die Dokumentation synchronisiert.

## Nachgezogene bestätigte Details

### PR #101 – Visite

- normal den beim Bewohner hinterlegten Arzt auswählen;
- nur im Sonderfall das kleine Filtersymbol rechts neben der Arztauswahl aktivieren;
- bestätigte Orte: Einrichtung, beim Arzt, telefonisch, per Mail.

### PR #104 – Berichte / Vitalwerte

- Berichtskorrektur und Folgebericht bleiben fachlich klar getrennt;
- bestätigte Vitalwertbeispiele: Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz, Atemalkohol;
- Blutdruck mit Systole und Diastole;
- zusätzliche Felder beziehungsweise Einheiten nur nach der tatsächlich sichtbaren Maske erklären.

### PR #107 – Stammdaten

- Berichte oder Durchführungsnachweis öffnen;
- links erscheint die Bewohnerübersicht;
- gewünschten Bewohner doppelklicken;
- dadurch öffnen sich die Stammdaten.

### PR #109 – Durchführung und Navigationshierarchie

- feste grüne Hauptleiste und bestätigte Hauptbereiche;
- Bedarfsmedikation als eigener Ablauf im Durchführungsnachweis;
- automatische spätere Wirksamkeitskontrolle ohne erfundene Wartezeit;
- Maßnahmen ohne Zeitangabe im Durchführungsnachweis.

### PR #111 – Schichtübergabe und verständliche Eingabefelder

- normaler Bericht: `Wichtig für Schichtübergabe` nur bei Bedarf; Bericht in das große Textfeld darunter;
- Bedarfsmedikation: `Wichtig für Schichtübergabe` ist automatisch ausgewählt und bleibt gesetzt; Anlass in das Textfeld darunter;
- Maßnahmen ohne Zeitangabe: `Wichtig für Schichtübergabe` optional; Dokumentation im großen Textfeld darunter;
- konsistente Bezeichnung `Pop-up-Fenster`.

### PR #119 – Maßnahmen ohne Zeitangabe

- zum Öffnen von `Maßnahmen ohne Zeitangabe` den **kleinen Pfeil links daneben** verwenden;
- derselbe bestätigte Pfeil ist bereits im Direktguide, in der Orientierung, in den Sprachkatalogen, in der Migration und in Regressionstests vorhanden.

## Zusätzlich synchronisiert

- `PROJECT_HANDOFF.md` auf den aktuellen GitHub-Stand nach PR #136 gebracht;
- `main` und `gh-pages` mit ihren aktuellen verifizierten Commits dokumentiert;
- private Reichweitenmessung v41 als abgeschlossen dokumentiert;
- klargestellt, dass ältere `ACTIVE_WORK_*.md` historische abgeschlossene Arbeitsblöcke enthalten können und der jeweilige Status entscheidend ist;
- `ACTIVE_WORK_PRIVATE_USAGE_METRICS_V41.md` ausdrücklich als abgeschlossen / nicht aktiv markiert.

## Unverändert

- keine fachliche Anleitung in der App geändert;
- keine neue Anleitung freigegeben;
- keine bestehenden Guide-Schritte technisch verändert;
- keine Routing-/Completion-Logik verändert;
- keine statische Sprachdatei oder Sprachkopie verändert;
- keine Supabase-Migration ausgeführt;
- keine Edge Function deployed;
- keine Statistikwerte verändert;
- Berichtssuche bleibt offen;
- Easy-Plan bleibt offen;
- Aufgaben · Aktuelles bleibt offen;
- Medikation bleibt strikt nur ansehen.

## Dauerhafte Regel

Ab jetzt wird jeder neu bestätigte lokale Klickweg unmittelbar in `CONFIRMED_WORKFLOWS.md` nachgezogen. Technische Umsetzung in App, Migration, Test oder Sprache ersetzt diese zentrale Fachquelle nicht.