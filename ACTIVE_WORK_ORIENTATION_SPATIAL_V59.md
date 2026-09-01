# DokoHilf – räumliche Vivendi-Orientierung v59

**Status:** kleiner, fachlich begrenzter Orientierungsblock  
**Bezug:** Issue #167  
**Stand:** 1. September 2026

## Ziel

DokoHilf soll bei Rückfragen wie „Wo ist die Leiste?“, „Was ist das weiße Funktionsband?“ oder „Welche Leiste meinst du?“ die bereits bestätigte räumliche Hierarchie verständlich erklären, ohne bestehende Klickwege zu verändern oder neue Vivendi-Abläufe zu erfinden.

## Datenschutz- und Quellen-Grenze

- Screenshots, Fotos, Video-Frames und Originalunterlagen bleiben ausschließlich außerhalb des Repositories und werden niemals in GitHub oder Supabase gespeichert.
- Es werden keine Namen, Bewohner-, Mitarbeiter-, Fall-, Gesundheits-, Organisations- oder sonstigen personenbezogenen beziehungsweise vertraulichen Inhalte aus Arbeitsunterlagen übernommen.
- Gespeichert werden ausschließlich anonymisierte, selbst formulierte und bereits bestätigte Bedien- und Orientierungsinformationen.
- Tests verwenden ausschließlich synthetische, nicht personenähnliche Inhalte.

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

## Nächste Schritte – jeweils separat prüfen und veröffentlichen

1. **Vitalwerte:** bestehenden Doku-Erweitert-Weg gegen die zusätzlich bestätigte Position unter Doku prüfen. Einen alternativen Zugang nur ergänzen, wenn beide Wege im aktuellen bestätigten Stand sauber miteinander vereinbar sind.
2. **An-/Abwesenheiten:** bestehenden Doku-Erweitert-Weg separat gegen den zusätzlich gezeigten Doku-Zugang prüfen; keine globale Umstellung.
3. **Durchführungsnachweis:** vorhandene Guides mit den zusätzlich bestätigten Detailinformationen zum normalen Abzeichnen und zu Abweichungen vergleichen. Nur ausdrücklich bestätigte Schritte ergänzen; DokoHilf trifft keine fachliche Entscheidung, was abzuzeichnen ist.
4. **Bereich wechseln:** eigene Anleitung erst erstellen, wenn der exakte Wechselweg vollständig bestätigt ist. Die bloße Anzeige des aktuellen Bereichs reicht dafür nicht.
5. **Berichtssuche / Easy-Plan / Aufgaben · Aktuelles:** bleiben bewusst offen, solange kein vollständiger bestätigter Ablauf vorliegt.

Für jeden weiteren Block gilt: aktuelles GitHub- und Supabase-Wissen lesen → Widersprüche/Lücken bestimmen → nur diese Lücke ändern → Regressionstests → Exact-PR-Head-Prüfung → Merge → Veröffentlichung → Live-Prüfung.
