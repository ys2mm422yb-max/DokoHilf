# DokoHilf – räumliche Vivendi-Orientierung v59/v60

**Status:** kleiner, fachlich begrenzter Orientierungsblock  
**Bezug:** Issue #167  
**Stand:** 2. September 2026

## Ziel

DokoHilf soll bei Rückfragen wie „Wo ist die Leiste?“, „Was ist das weiße Funktionsband?“ oder „Welche Leiste meinst du?“ die bereits bestätigte räumliche Hierarchie verständlich erklären, ohne bestehende Klickwege zu verändern oder neue Vivendi-Abläufe zu erfinden.

## Datenschutzgrenze

- Es werden keine Namen, Bewohner-, Mitarbeiter-, Fall-, Gesundheits-, Organisations- oder sonstigen personenbezogenen beziehungsweise vertraulichen Inhalte übernommen.
- Gespeichert werden ausschließlich anonymisierte, selbst formulierte und bereits bestätigte Bedien- und Orientierungsinformationen.
- Tests verwenden ausschließlich synthetische, nicht personenähnliche Inhalte.
- Nicht bestätigte Details bleiben offen und werden nicht ergänzt.

## Bereits bestätigte räumliche Orientierung

- Ganz oben im Vivendi-Fenster befindet sich die feste grüne Hauptleiste.
- In dieser Hauptleiste liegen unter anderem Doku, Doku-Erweitert, Planung und Analyse.
- Doku liegt in der bestätigten Anordnung zwischen Planung und Doku-Erweitert.
- Direkt unter der grünen Hauptleiste befindet sich das weiße Funktionsband des jeweils ausgewählten Hauptbereichs.
- Das weiße Funktionsband ist eine zweite Navigationsebene und nicht dieselbe Leiste wie die grüne Hauptleiste.
- Bei ausgewähltem Doku liegen Bericht und Durchführungsnachweis im weißen Funktionsband darunter.
- Bericht ist kein Hauptreiter der grünen Hauptleiste.

## Umsetzung v59

- Gemeinsame Hilfe für „weißes Funktionsband“, „weiße Leiste“, „untere Leiste“ und „Funktionsleiste“ ergänzen.
- Im laufenden Durchführungsnachweis-Doku-Schritt diese Rückfragen lokal und kontextbezogen beantworten.
- Für die hörbare Antwort einen bereits vorhandenen, bestätigten statischen Supertonic-F1-Satz wiederverwenden; keinen neuen Sprachkatalog-Eintrag erzeugen.
- PWA-Cache-Revision anheben, damit die neue Orientierung auf Mobilgeräten zuverlässig aktualisiert wird.
- Keine Supabase-Guide-Schritte und keine fachlichen Klickwege in diesem Block ändern.

## Praxistest-Regressionskorrektur v60

Ein anschließender mobiler Praxistest hat gezeigt, dass die räumliche Antwort fachlich korrekt ist, die Erkennung aber zu streng auf einzelne Schreibweisen begrenzt war. Spracherkennungsvarianten können Wörter trennen, verbinden oder einen ähnlich klingenden Begriff liefern.

v60 erweitert deshalb ausschließlich die Intent-Erkennung für das bereits bestätigte weiße Funktionsband:

- getrennte Varianten wie „Funktionen Band“ und „Funktions Band“ werden verstanden;
- zusammengeschriebene Varianten werden verstanden;
- die bereits bestätigten Begriffe „weiße Leiste“, „untere Leiste“ und „Funktionsleiste“ bleiben erhalten;
- die mögliche Spracherkennungsvariante „weiße Liste“ wird nur im laufenden bestätigten Durchführungsnachweis-Doku-Schritt als „weiße Leiste“ interpretiert; außerhalb dieses Kontexts bleibt „Liste“ bewusst mehrdeutig und wird nicht automatisch umgedeutet;
- der laufende Guide-Schritt bleibt unverändert und wird nicht als erledigt markiert;
- die hörbare Antwort bleibt exakt der bereits katalogisierte Supertonic-F1-Satz; der statische Sprachkatalog wird nicht erweitert;
- keine fachlichen Klickwege, Supabase-Guide-Daten oder gesperrten Bereiche werden geändert.

Dokumentiert werden ausschließlich die abstrahierten technischen Regressionen und die bereits bestätigte Bedienorientierung.

## Nächste Schritte – jeweils separat prüfen und veröffentlichen

1. **Vitalwerte:** bestehenden Doku-Erweitert-Weg gegen die zusätzlich bestätigte Position unter Doku prüfen. Einen alternativen Zugang nur ergänzen, wenn beide Wege im aktuellen bestätigten Stand sauber miteinander vereinbar sind.
2. **An-/Abwesenheiten:** bestehenden Doku-Erweitert-Weg separat gegen den zusätzlich bestätigten Doku-Zugang prüfen; keine globale Umstellung.
3. **Durchführungsnachweis:** vorhandene Guides mit den zusätzlich bestätigten Detailinformationen zum normalen Abzeichnen und zu Abweichungen vergleichen. Nur ausdrücklich bestätigte Schritte ergänzen; DokoHilf trifft keine fachliche Entscheidung, was abzuzeichnen ist.
4. **Bereich wechseln:** eigene Anleitung erst erstellen, wenn der exakte Wechselweg vollständig bestätigt ist. Die bloße Anzeige des aktuellen Bereichs reicht dafür nicht.
5. **Berichtssuche / Easy-Plan / Aufgaben · Aktuelles:** bleiben bewusst offen, solange kein vollständiger bestätigter Ablauf vorliegt.

Für jeden weiteren Block gilt: aktuelles GitHub- und Supabase-Wissen lesen → Widersprüche/Lücken bestimmen → nur diese Lücke ändern → Regressionstests → Exact-PR-Head-Prüfung → Merge → Veröffentlichung → Live-Prüfung.
