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
3. `assets/guide-discovery-v53.js` – Intent-Sonderfälle der Bibliothek; die normale Token-Suche ist bei getrennten Wörtern bereits toleranter.
4. `supabase/functions/dokohilf-chat-router/index.ts` – serverseitige deterministische Navigation und Abzeichnen-Erkennung.

## Umsetzung in diesem PWA-Block

- Kompakte Vergleichsform innerhalb der drei betroffenen Frontend-Module: Leerzeichen, Bindestriche und Schrägstriche werden nur für den Vergleich bereits bestätigter Begriffe ignoriert.
- Keine allgemeine unscharfe oder phonetische Erkennung. Wörter werden nicht frei geraten.
- Bereits bestätigte Begriffe wie Durchführungsnachweis, Doku-Erweitert, Bedarfsmedikation, Wirksamkeitskontrolle, Maßnahmen ohne Zeitangabe, Vitalwerte, Blutdruck, Blutzucker, Medikationsplan, Formular-/Protokollbegriffe, Notfallblatt, Stammdaten/Bewohnerübersicht und Dateiablage-Begriffe erhalten Split-/Join-Toleranz.
- Die Bibliotheks-Sonderlogik erhält dieselbe Toleranz für bestätigte Intents wie Abzeichnen, Bericht durchstreichen, Dateiablage-, Vitalwerte- und Notfallblatt-Aliase.
- Abzeichnen bleibt vor normaler Medikation priorisiert; getrenntes `ab zeichnen` beziehungsweise `ab gezeichnet` wird erkannt.
- `abhaken` wird ausdrücklich **nicht** allgemein als Abzeichnen interpretiert.
- Berichtssuche, Easy-Plan und Aufgaben · Aktuelles bleiben auch bei getrennter Schreibweise gesperrt/offen.
- Vorhandene statische Supertonic-F1-Antworttexte werden unverändert wiederverwendet; der Navigationskatalog bleibt bei 17 Einträgen.

## Noch separat zu bearbeiten

Der serverseitige `dokohilf-chat-router` zeigt denselben Fehlertyp. Er wird nach diesem PWA-Block separat gehärtet, damit ein produktiver Supabase-Function-Deploy nicht mit einer PWA-Erkennungsänderung vermischt wird. Vor diesem Router-Deploy wird der aktuelle Supabase-Stand erneut geprüft; danach gelten wieder Branch → Exact-PR-Head → Merge → Function-Deploy → Live-Prüfung.

Danach folgen aus Issue #167 weiterhin die fachlich getrennten Orientierungsblöcke: Vitalwerte gegen den bestehenden bestätigten Ablauf abgleichen, An-/Abwesenheiten abgleichen und erst anschließend zusätzliche DNF-Details bearbeiten. Kein vorhandener Klickweg wird allein aufgrund räumlicher Bildinformation umgeschrieben.

## Release-Grenze

Der vorherige v60-Merge (#177) ist auf `main` und `gh-pages` veröffentlicht und kontrolliert. Für v61 gilt daher: vollständige Regressionen → exakter PR-Head → Merge → Veröffentlichung → Live-Prüfung.
