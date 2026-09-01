# Active Work – Report navigation hierarchy v58

**Status:** in Prüfung  
**Branch:** `fix/report-navigation-hierarchy-v58`  
**Base:** `main` at `1728ff0489fd8c4fabe29add43a90770d5d8a3f1`

## Bestätigter fachlicher Stand

- `Doku` ist ein Hauptbereich in der festen grünen Hauptleiste.
- `Doku` liegt in der bestätigten Anordnung zwischen `Planung` und `Doku-Erweitert`.
- Nach Auswahl von `Doku` erscheint direkt darunter das weiße Funktionsband.
- `Bericht` liegt in diesem weißen Funktionsband unter `Doku`.
- `Bericht` beziehungsweise `Berichte` darf nicht als Hauptbereich der grünen Leiste beschrieben werden.

## Scope

Korrigiert ausschließlich die Navigation der Bericht-Familie:

- `berichte-finden`: eigentlicher Guide-Schritt und Stuck-Hilfe.
- `bericht-neu`: Stuck-Hilfe des Einstiegs.
- `bericht-durchstreichen`: Stuck-Hilfe des Einstiegs.
- `bericht-folgebericht`: Stuck-Hilfe des Einstiegs.
- statischer Supertonic-F1-Katalog für den geänderten Guide-Satz.
- PWA-Shell-Cache-Rotation, damit der korrigierte Sprachkatalog ausgeliefert wird.

Nicht geändert werden `berichtssuche`, andere Guide-Familien oder fachliche Berichtsschritte nach dem Öffnen des Bereichs.

## Datenbank-Sicherheit

Der geplante SQL-Stand wurde vor dem Commit im ausschließlich erlaubten Supabase-Projekt `efifbuqctylsujiauabg` innerhalb einer Transaktion ausgeführt und anschließend mit `ROLLBACK` vollständig verworfen. Die Kontrollabfrage danach bestätigte die unveränderten produktiven Versionen und Texte.

Die produktive Migration darf erst nach geprüftem PR-Merge angewendet werden.

## Prüfungen

Zusätzlicher Regressionstest: `tests/report-navigation-v58.test.mjs`.

Vor Merge müssen alle auf dem exakten PR-Head ausgelösten Pflichtworkflows erfolgreich sein. Nach Merge folgen produktive Migration, Publish nach `gh-pages` und Live-Prüfung.
