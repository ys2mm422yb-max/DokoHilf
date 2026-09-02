# DokoHilf – robuste Erkennung bestätigter Begriffe v61

**Status:** laufender technischer Robustheitsblock  
**Bezug:** Issue #167  
**Stand:** 2. September 2026

## Ziel

DokoHilf soll bereits fachlich bestätigte Begriffe auch dann zuverlässig erkennen, wenn mobile Spracheingabe oder normale Texteingabe zusammengesetzte Wörter trennt, verbindet oder mit Bindestrich beziehungsweise Schrägstrich schreibt. Dabei werden keine neuen Vivendi-Begriffe, Klickwege oder fachlichen Abläufe erfunden.

Beispiele für den technischen Fehlertyp sind `Durchführungs Nachweis` statt `Durchführungsnachweis`, `Bedarfs Medikation` statt `Bedarfsmedikation` oder `Notfall Blatt` statt `Notfallblatt`.

## Datenschutz- und Materialgrenze

- Keine Screenshots, Fotos, Video-Frames, OCR-Ausgaben oder Originalunterlagen werden in GitHub oder Supabase gespeichert.
- Keine Namen, Bewohner-, Mitarbeiter-, Fall-, Gesundheits- oder Organisationsdaten werden übernommen.
- Tests verwenden ausschließlich synthetische, abstrakte Eingaben ohne reale Person oder realen Fall.
- Gespeichert werden nur selbst formulierte technische Erkennungsvarianten bereits bestätigter Begriffe.

## Audit des bestehenden Stands

Der gleiche starre Wortabgleich wurde an mehreren Stellen gefunden:

1. `assets/orientation-help-v29.js` – räumliche Hilfen und bestätigte Bereichsbegriffe.
2. `assets/smart-help-v29.js` – deterministische Guide-Auswahl für freie Chat-/Spracheingaben.
3. `assets/guide-discovery-v53.js` – insbesondere Intent-Sonderfälle der Bibliothek; die normale Token-Suche ist bei getrennten Wörtern bereits toleranter.
4. `supabase/functions/dokohilf-chat-router/index.ts` – serverseitige deterministische Navigation und Abzeichnen-Erkennung.

## Umsetzung in diesem Frontend-Block

- Gemeinsame kompakte Vergleichsform innerhalb der betroffenen Frontend-Module: Leerzeichen, Bindestriche und Schrägstriche werden nur für den Vergleich bekannter Begriffe ignoriert.
- Keine allgemeine unscharfe oder phonetische Erkennung. Wörter werden nicht frei geraten.
- Bereits bestätigte Begriffe wie Durchführungsnachweis, Doku-Erweitert, Bedarfsmedikation, Wirksamkeitskontrolle, Maßnahmen ohne Zeitangabe, Vitalwerte, Blutdruck, Blutzucker, Medikationsplan, Formular-/Protokollbegriffe, Notfallblatt, Stammdaten/Bewohnerübersicht und Dateiablage-Begriffe erhalten Split-/Join-Toleranz.
- Abzeichnen bleibt vor normaler Medikation priorisiert; getrenntes `ab zeichnen` beziehungsweise `ab gezeichnet` wird erkannt.
- `abhaken` wird ausdrücklich **nicht** allgemein als Abzeichnen interpretiert.
- Berichtssuche, Easy-Plan und Aufgaben · Aktuelles bleiben auch bei getrennter Schreibweise gesperrt/offen.
- Vorhandene statische Supertonic-F1-Antworttexte werden unverändert wiederverwendet; der Navigationskatalog bleibt bei 17 Einträgen.

## Noch separat zu bearbeiten

Die Bibliotheks-Sonderlogik in `guide-discovery-v53.js` und der serverseitige `dokohilf-chat-router` zeigen denselben Fehlertyp. Sie werden nach diesem Frontend-Block separat gehärtet, damit eine Änderung am produktiven Router nicht mit einer PWA-Erkennungsänderung vermischt wird. Vor dem Router-Deploy wird der aktuelle Supabase-Stand erneut geprüft; danach gelten wieder Exact-PR-Head → Merge → Function-Deploy → Live-Prüfung.

## Release-Grenze

Der v61-Branch darf nicht gemergt werden, bevor der vorherige v60-Merge (#177) tatsächlich nach `gh-pages` veröffentlicht und kontrolliert ist. Danach: vollständige Regressionen → exakter PR-Head → Merge → Veröffentlichung → Live-Prüfung.
