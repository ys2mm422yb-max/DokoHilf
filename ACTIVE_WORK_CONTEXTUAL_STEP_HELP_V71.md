# DokoHilf – kontextueller Schritt-Hilfe-Knopf v71

**Status:** in Arbeit  
**Stand:** 5. September 2026  
**Branch:** `feature/contextual-step-help-button-v71-20260905`  
**Basis:** `85b16a6f84b7f6262775fd679520b1d81effc46d` (verifizierter v70-Produktstand auf `main`)

## Nutzerbeobachtung

Auf einem physischen iPhone zeigte der laufende Chat-Guide unter der aktuellen Antwort weiterhin den Knopf **„Hilfe zum Schritt“**. Gewünscht ist eine eindeutige Formulierung wie **„Ich finde es nicht“**. Außerdem darf dieser Knopf nur aktiv sein, wenn für den aktuellen freigegebenen Schritt tatsächlich eine andere bestätigte Erklärung existiert.

## Bestätigte Ursache

Der untere Knopf stammt aus der bestehenden `command-row` mit dem unveränderten sicheren Befehl `data-command="ich finde das nicht"`. `assets/mobile-polish-v29.js` überschrieb dessen sichtbaren Text bisher bei jedem UI-Sync mit **„Hilfe zum Schritt“**.

Die freigegebenen Guide-Schritte liegen in Supabase `dokohilf_guides.steps`. Ein Schritt besitzt nur dann eine eigene alternative Erklärung, wenn sein freigegebenes Feld `stuck` nicht leer ist. Ohne `stuck` würde die bestehende Routerlogik im Wesentlichen beim normalen Schritttext bleiben; deshalb soll der Knopf dann nicht aktiv sein.

## Umsetzung

- Sichtbarer Text des unteren Hilfe-Knopfs: **„Ich finde es nicht“**.
- Der bestehende Command `ich finde das nicht` bleibt technisch unverändert; dadurch wird weiterhin ausschließlich die bereits bestätigte Schritthilfe verwendet.
- Der Knopf wird nur aktiviert, wenn der aktuelle freigegebene Schritt einen eigenen bestätigten `stuck`-Text besitzt.
- Fehlt eine andere bestätigte Erklärung, ist der Knopf deaktiviert und erhält einen passenden `aria-label`/Tooltip.
- Die Verfügbarkeit wird bei Guide-/Schrittwechsel erneut synchronisiert.
- Keine neuen Klickwege, Fachinhalte oder Erklärtexte werden erzeugt.
- Keine Änderung an Medikation, Datenschutz, Konten oder Personenbezug.
- Keine Änderung an TTS: Supertonic 3 / F1 bleibt unverändert; keine System-/Browser-/Cloud-Stimme.
- Keine Supabase-Migration und kein Edge-Function-Deploy erforderlich.

## Source-of-Truth-Prüfung

Am 5. September 2026 wurde ausschließlich Supabase-Projekt `efifbuqctylsujiauabg` read-only geprüft:

- 41 Guides `approved`, 5 Guides `draft`.
- 70 freigegebene Guide-Schritte besitzen aktuell einen nichtleeren `stuck`-Text.
- Beispiel aus dem iPhone-Screenshot: `berichte-finden`, Schritt 1 besitzt eine eigene bestätigte `stuck`-Erklärung und muss den Knopf daher aktiv anzeigen.
- Gegenbeispiel: `visite-anlegen`, Schritt 2 besitzt keinen eigenen `stuck`-Text und muss den Knopf deaktivieren.

Die im Frontend verwendete Verfügbarkeitsliste ist ein Release-Snapshot genau dieses freigegebenen Stands. Fachtexte selbst werden nicht kopiert oder neu formuliert; der bestehende Router liefert weiterhin den bestätigten Inhalt.

## Regressionstests

Neu: `tests/contextual-step-help-button-v71.test.mjs`

Geprüft werden mindestens:

- `berichte-finden`, Schritt 1 → Hilfe verfügbar.
- `visite-anlegen`, Schritte 1/3/6 → verfügbar; Schritt 2 → nicht verfügbar.
- `vitalwerte-einzelwert-fortsetzen`, Schritt 1 → nicht verfügbar.
- Sichtbarer Text wird **„Ich finde es nicht“**.
- Deaktivierung, `aria-label` und Availability-Marker stimmen mit dem Schrittzustand überein.
- Bestehender Befehl `ich finde das nicht` bleibt erhalten.
- Keine neue Browser-Speicherung und keine neue TTS-Implementierung.

## Freigabe

Produktänderung: Die verbindlichen iOS-/Android- und Exact-Head-Prüfungen müssen auf demselben finalen PR-Head erfolgreich sein. Erst danach manueller Merge. Anschließend `main`, vollständigen Deploy, `gh-pages` und öffentlichen DokoHilf-Stand prüfen. Vor dieser Prüfung wird der Hotfix nicht als live oder fertig bezeichnet.
