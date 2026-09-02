# DokoHilf – DNF-Detailorientierung v65

**Status:** in Umsetzung  
**Bezug:** Issue #167  
**Ausgangsstand:** `main` `710c596c0721093fb9134459a978c49737243578`

## Ziel

Den Durchführungsnachweis auf die bereits bestätigten Detailwege begrenzen und räumliche Details synchronisieren, ohne einen allgemeinen Abzeichnen-Ablauf zu erfinden.

## Bestätigter Stand

- Allgemeines Abzeichnen führt zum richtigen Bewohner und danach über `Doku → Durchführungsnachweis`.
- Nach dem geöffneten Durchführungsnachweis ist für allgemeines Abzeichnen kein weiterer Klickweg bestätigt.
- Falsch abgezeichnete Durchführungen haben einen eigenen bestätigten Storno-Ablauf.
- Bedarfsmedikation und spätere Wirksamkeitskontrolle haben eigene bestätigte Abläufe.
- Bei `Maßnahmen ohne Zeitangabe` wird der Bereich im Durchführungsnachweis über den kleinen Pfeil links daneben geöffnet.

## Umsetzung

- Die alte allgemeine Folgeauswahl im Guide `durchfuehrungsnachweis-oeffnen` wird entfernt. Sie war breiter als der bestätigte Fachstand.
- Der Guide endet damit bewusst nach `Doku → Durchführungsnachweis`.
- Bereits bestätigte Detailwege bleiben separat bestehen und werden nicht fachlich erweitert.
- `CONFIRMED_WORKFLOWS.md` wird beim bereits bestätigten Pfeil-Detail für `Maßnahmen ohne Zeitangabe` mit dem produktiven Guide synchronisiert.
- Keine neue medizinische oder pflegerische Entscheidungshilfe.
- Keine Screenshots, Originalunterlagen oder Echtdaten.

## Supabase-Sicherheit

Die geplante Inhaltsmigration wurde ausschließlich gegen `efifbuqctylsujiauabg` in `BEGIN … ROLLBACK` geprüft. Der erwartete Zustand hatte zwei DNF-Einstiegsschritte und die neue Begrenzung im Troubleshooting; eine anschließende Kontrollabfrage bestätigte, dass Produktion nach dem Rollback unverändert blieb.

## Freigabe

Merge erst nach vollständig grünem exakten PR-Head. Danach produktive Migration ausschließlich nach `efifbuqctylsujiauabg`, Veröffentlichung und Live-Prüfung. Erst anschließend folgt der separate Abgleich Sprachchat gegen Schreibchat.