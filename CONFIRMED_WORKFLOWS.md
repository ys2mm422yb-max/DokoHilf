# DokoHilf – bestätigte Arbeitsabläufe

**Status:** verbindliche fachliche Quelle  
**Stand:** 8. August 2026

Diese Datei enthält ausschließlich anonymisierte, selbst formulierte und fachlich bestätigte Klickwege. Öffentliche Dokumentation enthält keine Angaben zu Herkunft, Prüfmaterialien oder internen Ausgangsmaterialien.

Am 8. August 2026 wurden die kontextbezogene Hilfe, die Formulierungen bei An-/Abwesenheit und der abschließende Speicherschritt bei Formularen ergänzt beziehungsweise präzisiert. Die zuvor bestätigten Klickwege bleiben ansonsten unverändert.

## Allgemeine Regeln

- Zuerst immer den richtigen Bewohner auswählen, wenn der Ablauf bewohnerbezogen ist.
- Keine echten Bewohner-, Gesundheits- oder Mitarbeiterdaten in Tests verwenden.
- Ein Bericht wird nicht endgültig gelöscht, sondern durchgestrichen.
- Eine falsch abgezeichnete Durchführung wird im Durchführungsnachweis storniert.
- Visiten werden bei euch erst nach erfolgter Durchführung dokumentiert und immer als **durchgeführt** erfasst, niemals als abgeschlossen.
- Medikation wird in DokoHilf ausschließlich angesehen; DokoHilf leitet dort zu keiner Änderung an.
- Bei An- und Abwesenheit gehört **Von immer** dazu. **Bis** wird nur ausgefüllt, wenn der Endzeitpunkt sicher feststeht. Wenn er noch nicht sicher feststeht, bleibt das Feld leer; es wird nichts geschätzt.
- Wenn ein Nutzer einen Menüpunkt oder Schritt nicht findet, bleibt der aktuelle Guide-Schritt aktiv. DokoHilf darf nicht so tun, als sei der Schritt erledigt.
- Detailhilfe darf nur aus bestätigten lokalen Bezeichnungen, bestätigten Guide-Schritten und bestätigten Alternativen bestehen. Keine Klickwege oder Feldnamen erfinden.

## Detailhilfe bei Rückfragen oder wenn jemand nicht weiterkommt

Aussagen und Fragen wie **„Ich finde das nicht“**, **„Wo ist das?“**, **„Ich weiß nicht, wo ich bin“**, **„Ich komme nicht weiter“**, **„Bei mir heißt das anders“**, **„Was muss ich jetzt drücken?“** oder normale Rückfragen innerhalb eines laufenden Ablaufs bleiben im aktuellen Guide.

Verbindliche Regeln für diese Hilfeschleife:

1. Aktuelle Absicht und aktueller Guide-Schritt bleiben erhalten.
2. DokoHilf hilft zuerst mit den bestätigten Informationen des aktiven Guides: Schritttext, Prüffrage, `stuck`-Hinweis und Troubleshooting.
3. Eine Hilferückfrage darf den Guide nicht vor- oder zurückschalten.
4. Nur wenn die bestätigten Informationen für den beschriebenen Zustand nicht ausreichen, fragt DokoHilf nach den sichtbaren Menü- oder Buttonbezeichnungen beziehungsweise danach, was der Nutzer gerade sieht.
5. Danach nur mit bestätigten Bezeichnungen und bestätigten sicheren Rückwegen weiterhelfen.
6. Gibt es für den beschriebenen Zustand keine bestätigte Anleitung, muss DokoHilf das transparent sagen und darf nichts erfinden.
7. Ein ausdrücklicher Wechsel zu einem anderen Ziel darf den aktuellen Guide verlassen; auch verwandte Abläufe derselben Kategorie müssen sauber wechselbar bleiben.
8. Sprach- und Schreibmodus verwenden dieselbe fachliche Hilfelogik.

Die technische Umsetzung dieser Detailhilfe ist in `ACTIVE_WORK_DETAIL_HELP.md` dokumentiert.

## Bericht anlegen

1. Richtigen Bewohner öffnen.
2. Bereich **Berichte** öffnen.
3. Oben links auf das grüne Plus klicken.
4. In der geöffneten Auswahl die Berichtskategorie wählen.
5. Danach öffnet sich die Eingabemaske für den Bericht.
6. **Nur bei zwei Kategorien gilt der folgende Protokollblock:** Bei **Kontakt – alles außer Arzt** ist automatisch das **Fallgespräch** verknüpft. Bei **Sturzereignis** ist automatisch das **Sturzprotokoll** verknüpft. Bei allen anderen Berichtskategorien die Schritte 6–9 überspringen und direkt mit Schritt 10 fortfahren.
7. Nur in diesem Sonderfall: Wird das automatisch verknüpfte Protokoll benötigt, bleibt es verknüpft.
8. Nur in diesem Sonderfall: Wird es nicht benötigt, den angezeigten Protokollnamen anklicken und anschließend oben rechts auf das kleine rote X klicken.
9. Das rote X entfernt nur die Protokollverknüpfung, nicht den Bericht.
10. Datum und Uhrzeit prüfen.
11. Berichtstext eintragen.
12. Mit OK bestätigen und den Eintrag kontrollieren.

## Bericht durchstreichen

1. Berichte öffnen.
2. Falschen Eintrag mit der rechten Maustaste anklicken.
3. **Eintrag bearbeiten** wählen.
4. **Durchstreichen** wählen.
5. Im Feld **Bemerkung zur Bearbeitung** den Grund eintragen.
6. Mit OK bestätigen.
7. Sichtbares Durchstreichen kontrollieren.

## Folgebericht erstellen

1. Berichte öffnen.
2. Ursprünglichen Bericht suchen.
3. Bericht mit der rechten Maustaste anklicken.
4. **Folgebericht erstellen** wählen.
5. Folgebericht in der geöffneten Maske vervollständigen.
6. Mit OK bestätigen und sichtbaren Eintrag kontrollieren.

## Falsch abgezeichnete Durchführung stornieren

1. **Doku** öffnen.
2. **Durchführungsnachweis** öffnen.
3. Falsch abgezeichnete Durchführung suchen.
4. Rechtsklick auf den Eintrag.
5. **Durchführung stornieren** wählen.
6. Stornogrund eintragen und mit OK bestätigen.
7. Stornokennzeichnung kontrollieren.

## Visite oder Sprechstunde dokumentieren

1. **Doku-Erweitert** öffnen.
2. **Visiten** wählen.
3. Oben links auf das grüne Plus beziehungsweise **Neu** klicken.
4. Im Fenster **Klienten auswählen** den Bewohner auswählen.
5. Danach öffnet sich **Neue Visite**.
6. Oben auf **Durchführen** klicken; dadurch wird die Visite als durchgeführt erfasst.
7. Datum, Beginn und gegebenenfalls Ende prüfen.
8. Durchführenden Arzt auswählen.
9. **Mitarbeiter** bleibt auf **ohne Mitarbeiter** beziehungsweise leer.
10. Bei **Anforderung** eintragen, wer die Sprechstunde angefordert hat.
11. Grund eintragen, zum Beispiel Kontrollbesuch.
12. Ort auswählen: Einrichtung, beim Arzt oder telefonisch.
13. Rechts in **Bemerkung** Inhalt und Ergebnis der Visite eintragen.
14. Speichern und prüfen, dass die Visite unter den durchgeführten Visiten erscheint.

## Einzelnen Vitalwert erfassen

1. Bewohner auswählen.
2. **Doku-Erweitert** öffnen.
3. **Vitalwerte** wählen.
4. Oben links auf das grüne Plus beziehungsweise **Neu** klicken.
5. Im Pop-up den gewünschten Vitalwert auswählen.
6. Datum und Uhrzeit prüfen.
7. Wert eintragen; bei Blutdruck zum Beispiel Systole und Diastole.
8. Nur bei Bedarf Messart, Qualität oder Bemerkung ergänzen.
9. Mit OK bestätigen und den Wert kontrollieren.

## Mehrere Vitalwerte erfassen

1. Bewohner auswählen.
2. **Doku-Erweitert** öffnen.
3. Direkt **Vitalwerte Sammelerf.** wählen.
4. Benötigte Vitalwerte auswählen.
5. Datum, Uhrzeit und Werte eintragen.
6. Speichern und kontrollieren.

**Vitalwerte** und **Vitalwerte Sammelerf.** sind zwei getrennte Menüeinträge.

## An- und Abwesenheit erfassen

1. Bewohner auswählen.
2. **Doku-Erweitert** öffnen.
3. **An-/Abwesenheiten** wählen.
4. Oben links **Neu** wählen.
5. Passenden Status auswählen.
6. Bei **Von** immer Datum und Uhrzeit eintragen.
7. Bei **Bis** nur dann Datum und Uhrzeit eintragen, wenn der Endzeitpunkt sicher feststeht.
8. Wenn der Endzeitpunkt noch nicht sicher feststeht, **Bis einfach leer lassen**. Bitte nicht schätzen.
9. Nur die Angaben ergänzen, die wirklich gebraucht werden, zum Beispiel Ziel, Begleitung, Grund oder Bemerkung.
10. Speichern und kurz prüfen, ob der Eintrag in der Übersicht erscheint.

## Medikation ansehen

1. Bewohner auswählen.
2. **Doku-Erweitert** öffnen.
3. **Medikation** wählen.
4. Medikamentenübersicht ausschließlich ansehen.

Keine Dosierung ändern, nichts pausieren, fortsetzen, absetzen, korrigieren, ergänzen oder löschen.

## Formular anlegen

1. Bewohner auswählen.
2. **Doku-Erweitert** öffnen.
3. **Formulare** wählen.
4. Oben links **Neu** klicken.
5. Im Fenster **Formular anlegen** das benötigte Formular auswählen, zum Beispiel Anfallsprotokoll, Fallgespräch, Gesprächsprotokoll oder Sturzprotokoll.
6. Mit OK bestätigen.
7. Das geöffnete Formular nach der gültigen fachlichen Vorgabe bearbeiten. Nicht bestätigte Felder werden von DokoHilf nicht erfunden.
8. Wenn das Formular fertig bearbeitet ist, **oben links in der Leiste speichern**.

## Notfallblatt öffnen

1. Bewohner auswählen.
2. Ganz oben links auf das kleine rote Kreuz beziehungsweise den zugehörigen Pfeil klicken.
3. **Notfallblatt aufrufen** wählen.
4. **Notfallblatt_Allgemein** ist normalerweise bereits ausgewählt.
5. Einen Grund der Einweisung nur bei Bedarf eintragen.
6. Mit OK bestätigen.
7. Bis zu etwa drei Minuten warten, bis sich Word öffnet.
8. Standby verhindern und den Vorgang nicht mehrfach starten.

## Übergabe anzeigen

1. **Analyse** öffnen.
2. **Was war los?** wählen.
3. Oben links **Alle anzeigen** anklicken.
4. **Alles ausklappen** wählen.
5. Zeitraum nur bei Bedarf ändern und Anzeige aktualisieren.

In der aufgeklappten Ansicht können unter anderem **durchgeführte Visiten** und **neue/geänderte Formulare (mit Abschluss)** erscheinen. Diese sichtbaren Kategorien wurden am 7. August 2026 erneut bestätigt.

## Umgang mit noch nicht bestätigten Details

- Keine Klickwege, Feldnamen oder fachlichen Inhalte erfinden.
- Bei unbekannten Formularfeldern transparent sagen, dass dafür noch keine bestätigte Anleitung vorliegt.
- Bei Varianten immer die fachlich bestätigten lokalen Bezeichnungen bevorzugen.
- Öffentlich werden ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Fachinhalte dokumentiert.
