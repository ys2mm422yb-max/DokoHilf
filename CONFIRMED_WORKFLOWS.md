# DokoHilf – bestätigte Arbeitsabläufe

**Status:** verbindliche fachliche Quelle  
**Stand:** 12. August 2026

Diese Datei enthält ausschließlich anonymisierte, selbst formulierte und fachlich bestätigte Klickwege. Sie ist die verbindliche fachliche Source of Truth für DokoHilf. Die App, Router und Sprache dürfen keine davon abweichenden oder erfundenen lokalen Klickwege ausgeben.

Der Stand umfasst die bis einschließlich PR #119 bestätigten fachlichen Ergänzungen sowie die danach erfolgten Routing-/UI-/Completion-Änderungen, die diese Klickwege nicht verändert haben. Insbesondere sind die später bestätigten Details aus PR #101, #104, #107, #109, #111 und #119 hier vollständig nachgezogen.

## Allgemeine Regeln

- Zuerst immer den richtigen Bewohner auswählen, wenn der Ablauf bewohnerbezogen ist.
- Keine echten Bewohner-, Gesundheits- oder Mitarbeiterdaten in Tests verwenden.
- Ein falscher Bericht wird nicht endgültig gelöscht oder durch einen Folgebericht korrigiert, sondern durchgestrichen.
- Soll der Inhalt danach korrekt neu dokumentiert werden, wird anschließend ein neuer Bericht angelegt.
- Ein Folgebericht ist ein neuer Bericht, der sich auf ein bereits dokumentiertes Geschehen bezieht und dieses ergänzt oder fortführt. Er verändert den ursprünglichen Bericht nicht.
- Eine falsch abgezeichnete Durchführung wird im Durchführungsnachweis storniert.
- Visiten werden erst nach erfolgter Durchführung dokumentiert und immer als **durchgeführt** erfasst, niemals als abgeschlossen.
- Die normale Medikationsübersicht unter **Doku-Erweitert → Medikation** wird in DokoHilf ausschließlich angesehen; DokoHilf leitet dort zu keiner Änderung an.
- Die **Bedarfsmedikationsgabe** ist davon getrennt: Sie wird als eigener bestätigter Dokumentationsablauf im **Durchführungsnachweis** erfasst. Dabei wird nur die tatsächlich verwendete Bedarfsmenge dokumentiert; die Verordnung selbst wird nicht verändert.
- Bei An- und Abwesenheit wird **Von immer** eingetragen. **Bis nur**, wenn der genaue Endzeitpunkt zu 100 Prozent bekannt ist. Niemals schätzen.
- Bei einem normalen Bericht ist **„Wichtig für Schichtübergabe“ optional** und wird nur gesetzt, wenn der Bericht für die nächste Schicht wichtig ist.
- Bei einer **Bedarfsmedikation** ist **„Wichtig für Schichtübergabe“ automatisch ausgewählt** und bleibt gesetzt; der Anlass wird im Textfeld darunter dokumentiert.
- Bei **Maßnahmen ohne Zeitangabe** ist **„Wichtig für Schichtübergabe“ optional**; die Dokumentation erfolgt im großen Textfeld darunter.
- Wenn ein Nutzer einen Menüpunkt oder Schritt nicht findet, bleibt der aktuelle Guide-Schritt aktiv. DokoHilf darf nicht so tun, als sei der Schritt erledigt.
- Detailhilfe darf nur aus bestätigten lokalen Bezeichnungen und bestätigten Alternativen bestehen. Keine Klickwege oder Feldnamen erfinden.
- Die Anleitung **Berichtssuche / Analyse → Abfrage** ist nicht final und bleibt fachlich offen.
- Der genaue **Easy-Plan**-Ablauf ist nicht final und bleibt fachlich offen.
- **Aufgaben · Aktuelles** bleibt fachlich offen und wird nicht als fertiger Guide ausgegeben.

## Bestätigte Navigationsstruktur

- Ganz oben befindet sich eine **feste grüne Hauptleiste**.
- Bestätigte Hauptbereiche dort sind **Berichte, Doku, Doku-Erweitert, Planung und Analyse**.
- Nach Auswahl eines Hauptbereichs erscheinen direkt darunter die zu diesem Bereich gehörenden Symbole beziehungsweise Funktionen.
- Unter **Doku-Erweitert** befinden sich die bestätigten Bereiche **Vitalwerte**, **Visiten**, **Medikation**, **Formulare** und **An-/Abwesenheiten**.
- Unter **Doku** befindet sich der bestätigte Bereich **Durchführungsnachweis**.
- Unter **Analyse** befindet sich der bestätigte Einstieg **Was war los?** für die Übergabeansicht.
- **Planung** selbst ist als Hauptbereich bestätigt; der genaue Easy-Plan-Ablauf bleibt offen.
- Wenn ein Nutzer einen Unterbereich nicht findet, erklärt DokoHilf zuerst den übergeordneten Hauptbereich in der grünen Leiste und anschließend die darunter erscheinende Funktion.

## Detailhilfe bei „Ich brauche Hilfe / Ich finde das nicht“

Die Aktion **„Hilfe zum Schritt“** beziehungsweise freie Aussagen wie **„Ich finde das nicht“**, **„Bei mir heißt das anders“**, **„Ich bin auf einer anderen Seite“** oder **„Was muss ich jetzt drücken?“** öffnen eine Hilfeschleife innerhalb des laufenden Guides.

Verbindlich:

1. Aktuelle Absicht und aktueller Guide-Schritt bleiben erhalten.
2. DokoHilf darf den Schritt nicht als erledigt markieren, nur weil Hilfe angefordert wurde.
3. Orientierung erfolgt nur mit bestätigten Bezeichnungen und bestätigten sicheren Rückwegen.
4. Gibt es für den beschriebenen Zustand noch keinen bestätigten Weg, wird das transparent gesagt.
5. In diesem Fall zum letzten sicheren bestätigten Schritt zurückführen oder menschliche Unterstützung empfehlen.
6. Sprach- und Schreibmodus verwenden dieselbe fachliche Hilfelogik.

Bestätigte Orientierungsanker:

- **Doku, Doku-Erweitert, Planung und Analyse** sind Hauptbereiche ganz oben in der festen grünen Leiste.
- **Durchführungsnachweis** liegt unter **Doku**.
- **Vitalwerte, Visiten, Medikation, Formulare und An-/Abwesenheiten** liegen unter **Doku-Erweitert**.
- **Bedarfsmedikation** und **Maßnahmen ohne Zeitangabe** werden im **Durchführungsnachweis** gefunden und jeweils über den **kleinen Pfeil links daneben** geöffnet.
- Die Wirksamkeitskontrolle einer Bedarfsmedikation wird automatisch angelegt und zum vorgesehenen Zeitpunkt im **Durchführungsnachweis** bearbeitet.
- **Stammdaten** werden über die Bewohnerübersicht links geöffnet, nachdem **Berichte** oder **Durchführungsnachweis** geöffnet wurden.

## Bericht anlegen

1. Richtigen Bewohner öffnen.
2. Bereich **Berichte** öffnen.
3. Oben links auf das grüne Plus klicken.
4. In der geöffneten Auswahl die Berichtskategorie wählen.
5. Danach öffnet sich die Eingabemaske für den Bericht.
6. Nur bei **Kontakt – alles außer Arzt** und **Sturzereignis** prüfen, ob ein zusätzliches Protokoll automatisch verknüpft ist.
7. Bei **Kontakt – alles außer Arzt** ist das **Fallgespräch** verknüpft; bei **Sturzereignis** das **Sturzprotokoll**.
8. Wird das automatisch verknüpfte Protokoll benötigt, bleibt es verknüpft.
9. Wird es nicht benötigt, den angezeigten Protokollnamen anklicken und anschließend oben rechts auf das kleine rote X klicken.
10. Das rote X entfernt nur die Protokollverknüpfung, nicht den Bericht.
11. Datum und Uhrzeit prüfen.
12. Wenn der Bericht für die nächste Schicht wichtig ist, **„Wichtig für Schichtübergabe“** anhaken. Wenn nicht, den Haken nicht setzen.
13. In das große Textfeld darunter den Bericht eintragen.
14. Mit **OK** bestätigen und den neuen Eintrag kontrollieren.

## Bericht korrigieren / durchstreichen

Wenn ein bereits gespeicherter Bericht falsch formuliert ist oder ein Schreibfehler korrigiert werden soll, wird der ursprüngliche Bericht durchgestrichen. Ein Folgebericht ist **keine Korrektur** des ursprünglichen Textes.

1. **Berichte** öffnen.
2. Falschen Eintrag mit der rechten Maustaste anklicken.
3. **Eintrag bearbeiten** wählen.
4. **Durchstreichen** wählen.
5. Im Feld **Bemerkung zur Bearbeitung** den Grund eintragen.
6. Mit **OK** bestätigen.
7. Sichtbares Durchstreichen kontrollieren.

Soll der Inhalt anschließend korrekt neu dokumentiert werden, danach **einen neuen Bericht anlegen**.

## Folgebericht erstellen

Ein Folgebericht ist ein **neuer Bericht mit Bezug zu einem bereits dokumentierten Geschehen**. Er ergänzt oder führt dieses Geschehen fort. Der ursprüngliche Bericht wird dadurch weder verändert noch korrigiert.

1. **Berichte** öffnen.
2. Ursprünglichen Bericht suchen, auf dessen Geschehen sich der neue Eintrag beziehen soll.
3. Bericht mit der rechten Maustaste anklicken.
4. **Folgebericht erstellen** wählen.
5. Datum und Uhrzeit prüfen und den neuen ergänzenden beziehungsweise fortführenden Inhalt eintragen.
6. Mit **OK** bestätigen und sichtbaren Eintrag kontrollieren.

## Durchführungsnachweis öffnen

1. Beim gewünschten Bewohner oben **Doku** öffnen.
2. Direkt darunter **Durchführungsnachweis** wählen.

Ein bloßes „Ja“ nach dem Finden des Durchführungsnachweises beendet keinen Ablauf. DokoHilf fragt nach dem tatsächlichen Ziel, zum Beispiel Bedarfsmedikation, Wirksamkeitskontrolle, Maßnahmen ohne Zeitangabe, Storno oder nur ansehen.

## Falsch abgezeichnete Durchführung stornieren

1. **Doku** ganz oben in der festen grünen Leiste öffnen.
2. Darunter **Durchführungsnachweis** öffnen.
3. Falsch abgezeichnete Durchführung suchen.
4. Rechtsklick auf den Eintrag.
5. **Durchführung stornieren** wählen.
6. Stornogrund eintragen und mit **OK** bestätigen.
7. Stornokennzeichnung kontrollieren.

## Bedarfsmedikationsgabe dokumentieren

Dieser Ablauf ist von der reinen Medikationsansicht getrennt und findet im **Durchführungsnachweis** statt.

1. Beim gewünschten Bewohner ganz oben in der festen grünen Leiste **Doku** öffnen.
2. Darunter **Durchführungsnachweis** öffnen.
3. Im Durchführungsnachweis **Bedarfsmedikation** suchen und auf den **kleinen Pfeil links daneben** klicken.
4. Das gewünschte Bedarfsmedikament auswählen und rechts im kleinen Kästchen den Haken setzen.
5. Im Pop-up-Fenster die Uhrzeit prüfen. Nur ändern, wenn der tatsächliche Zeitpunkt der Gabe abweicht.
6. **„Wichtig für Schichtübergabe“ ist automatisch ausgewählt. Den Haken so lassen.**
7. Im Textfeld darunter kurz den Anlass der Gabe eintragen.
8. Falls tatsächlich eine geringere Bedarfsmenge verwendet wurde, rechts im Pop-up-Fenster die tatsächlich verwendete Menge eintragen. **Die Verordnung selbst nicht verändern.**
9. Das Pop-up-Fenster unten mit **OK** bestätigen.
10. Nach dem Speichern wird die **Wirksamkeitskontrolle automatisch vom System angelegt**.
11. Erst wenn sie zum vorgesehenen Zeitpunkt fällig ist, die passende Wirksamkeitskontrolle im Durchführungsnachweis öffnen und abhaken.
12. Kurz eintragen, ob und wie die Bedarfsmedikation gewirkt beziehungsweise geholfen hat.
13. Die Wirksamkeitskontrolle unten mit **OK** bestätigen.

DokoHilf nennt keine erfundene Wartezeit und legt die Wirksamkeitskontrolle nicht selbst an.

## Wirksamkeitskontrolle der Bedarfsmedikation

Wenn direkt nach der später fälligen Wirksamkeitskontrolle gefragt wird, nicht erneut bei der ursprünglichen Bedarfsgabe beginnen.

1. Warten, bis die automatisch angelegte Wirksamkeitskontrolle zum vorgesehenen Zeitpunkt fällig ist.
2. Beim gewünschten Bewohner **Doku** öffnen.
3. Darunter **Durchführungsnachweis** öffnen und die passende Wirksamkeitskontrolle suchen.
4. Wirksamkeitskontrolle öffnen und abhaken.
5. Kurz eintragen, ob und wie die Bedarfsmedikation gewirkt beziehungsweise geholfen hat.
6. Unten mit **OK** bestätigen.

## Maßnahmen ohne Zeitangabe dokumentieren

1. Beim gewünschten Bewohner ganz oben in der festen grünen Leiste **Doku** öffnen.
2. Darunter **Durchführungsnachweis** öffnen.
3. Im Durchführungsnachweis **Maßnahmen ohne Zeitangabe** suchen und auf den **kleinen Pfeil links daneben** klicken.
4. Gewünschte Maßnahme auswählen, zum Beispiel **Klienten-Team Sitzung** oder **Krise**.
5. Im Pop-up-Fenster Datum und Uhrzeit prüfen. Nur ändern, wenn der tatsächliche Dokumentationszeitpunkt abweicht.
6. Passende Kategorie auswählen.
7. Wenn die Maßnahme für die nächste Schicht wichtig ist, **„Wichtig für Schichtübergabe“** anhaken. Wenn nicht, den Haken nicht setzen.
8. In das große Textfeld darunter kurz eintragen, was passiert ist beziehungsweise was gemacht oder durchgeführt wurde.
9. Falls zusätzlich eine Zeitangabe benötigt wird, kann sie oben rechts im Pop-up-Fenster ergänzt werden. Diese zusätzliche Zeitangabe ist optional.
10. Das Pop-up-Fenster unten mit **OK** bestätigen.

## Visite oder Sprechstunde dokumentieren

1. Ganz oben in der festen grünen Hauptleiste **Doku-Erweitert** öffnen.
2. Darunter **Visiten** wählen.
3. Oben links auf das grüne Plus beziehungsweise **Neu** klicken.
4. Im Fenster **Klienten auswählen** den Bewohner auswählen.
5. Danach öffnet sich **Neue Visite**.
6. Oben auf **Durchführen** klicken; dadurch wird die Visite als **durchgeführt** erfasst.
7. Datum, Beginn und gegebenenfalls Ende prüfen.
8. Den beim Bewohner hinterlegten durchführenden Arzt auswählen.
9. **Mitarbeiter** bleibt auf **ohne Mitarbeiter** beziehungsweise leer.
10. Bei **Anforderung** eintragen, wer die Sprechstunde angefordert hat.
11. Grund eintragen, zum Beispiel Kontrollbesuch.
12. Ort auswählen: **Einrichtung, beim Arzt, telefonisch oder per Mail**.
13. Rechts in **Bemerkung** Inhalt und Ergebnis der Visite eintragen.
14. Speichern und prüfen, dass die Visite unter den durchgeführten Visiten erscheint.

**Sonderfall Arztauswahl:** Nur wenn der durchführende Arzt beim Bewohner **nicht** hinterlegt ist, rechts neben der Arztauswahl das kleine **Filtersymbol** aktivieren. Dann stehen alle im System hinterlegten Ärzte zur Auswahl. Im Normalfall bleibt dieses Filtersymbol aus.

## Visiten öffnen

1. **Doku-Erweitert** öffnen.
2. **Visiten** wählen.

Nach erfolgreichem Finden und dem Wunsch, eine Visite zu dokumentieren, darf der bereits erreichte Kontext erhalten bleiben und direkt beim grünen Plus beziehungsweise **Neu** weitergeführt werden.

## Einzelnen Vitalwert erfassen

1. Bewohner auswählen.
2. Ganz oben in der festen grünen Hauptleiste **Doku-Erweitert** öffnen.
3. Darunter **Vitalwerte** wählen.
4. Oben links auf das grüne Plus beziehungsweise **Neu** klicken.
5. Im Pop-up-Fenster den gewünschten Vitalwert auswählen, zum Beispiel **Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz oder Atemalkohol**.
6. Datum und Uhrzeit prüfen.
7. Den gemessenen Wert eintragen. Je nach ausgewähltem Vitalwert erscheinen die passenden Eingabefelder. Bei **Blutdruck** zum Beispiel **Systole und Diastole**.
8. Zusätzliche Angaben wie Messart, Qualität oder Bemerkung nur ergänzen, wenn sie benötigt werden.
9. Mit **OK** bestätigen und den neuen Wert in der Übersicht kontrollieren.

Zusätzliche Felder oder Einheiten nicht pauschal vorgeben, sondern so übernehmen, wie sie in der geöffneten Maske angezeigt werden.

## Mehrere Vitalwerte erfassen

1. Bewohner auswählen.
2. Ganz oben in der festen grünen Hauptleiste **Doku-Erweitert** öffnen.
3. Darunter direkt **Vitalwerte Sammelerf.** wählen.
4. Die benötigten Vitalwerte für die gemeinsame Erfassung auswählen.
5. Datum, Uhrzeit und die gemessenen Werte eintragen.
6. Mit **OK** beziehungsweise **Speichern** bestätigen und die Werte in der Übersicht kontrollieren.

**Vitalwerte** und **Vitalwerte Sammelerf.** sind zwei getrennte Menüeinträge. Eine bloße Zustimmung nach „Vitalwerte erfassen“ darf deshalb nicht als abgeschlossener Ablauf behandelt werden; zuerst Einzelwert oder Sammelerfassung klären.

## An- und Abwesenheit erfassen

1. Bewohner auswählen.
2. Ganz oben in der festen grünen Hauptleiste **Doku-Erweitert** öffnen.
3. Darunter **An-/Abwesenheiten** wählen.
4. Oben links **Neu** wählen.
5. Passenden Status auswählen.
6. **Von** immer mit Datum und Uhrzeit eintragen.
7. **Bis** nur eintragen, wenn der genaue Endzeitpunkt zu 100 Prozent sicher bekannt ist.
8. Ist das Ende unsicher, **Bis leer lassen und niemals schätzen**.
9. Nur benötigte weitere Angaben wie Ziel, Begleitung oder Grund/Bemerkung ergänzen.
10. Speichern und Eintrag kontrollieren.

Wenn der Bereich bereits gefunden wurde und anschließend eine An-/Abwesenheit eingetragen werden soll, zuerst den richtigen Bewohner prüfen und danach direkt bei **Neu** weiterführen; die bereits erledigte Navigation nicht unnötig wiederholen.

## Medikation ansehen

1. Bewohner auswählen.
2. Ganz oben in der festen grünen Hauptleiste **Doku-Erweitert** öffnen.
3. Darunter **Medikation** wählen.
4. Medikamentenübersicht ausschließlich ansehen.

Keine Dosierung ändern, nichts pausieren, fortsetzen, absetzen, korrigieren, ergänzen oder löschen. Es gibt keinen Anschlussdialog in einen Medikations-Änderungsablauf.

## Formular anlegen

1. Bewohner auswählen.
2. Ganz oben in der festen grünen Hauptleiste **Doku-Erweitert** öffnen.
3. Darunter **Formulare** wählen.
4. Oben links **Neu** klicken.
5. Im Fenster **Formular anlegen** das benötigte Formular auswählen, zum Beispiel **Anfallsprotokoll, Fallgespräch, Gesprächsprotokoll oder Sturzprotokoll**.
6. Mit **OK** bestätigen.
7. Das geöffnete Formular wie gewohnt ausfüllen.
8. Wenn das Formular fertig bearbeitet ist, oben links in der Leiste speichern.

Wenn der Formularbereich bereits gefunden wurde, richtigen Bewohner prüfen und danach direkt bei **Neu** weiterführen.

## Stammdaten öffnen

1. Zuerst **Berichte** oder **Durchführungsnachweis** öffnen. Den Durchführungsnachweis erreicht man über **Doku → Durchführungsnachweis**.
2. Solange einer dieser beiden Bereiche geöffnet ist, ist links die **Bewohnerübersicht** sichtbar.
3. In der Bewohnerübersicht den gewünschten Bewohner **doppelklicken**. Dadurch öffnen sich die Stammdaten.

Dieser bestätigte Weg wurde in PR #107 ergänzt und gehört dauerhaft zur Fachquelle.

## Notfallblatt öffnen

1. Bewohner auswählen.
2. Ganz oben links auf das kleine rote Kreuz beziehungsweise den zugehörigen Pfeil klicken.
3. **Notfallblatt aufrufen** wählen.
4. **Notfallblatt_Allgemein** ist normalerweise bereits ausgewählt.
5. Einen Grund der Einweisung nur bei Bedarf eintragen.
6. Mit **OK** bestätigen.
7. Bis zu etwa drei Minuten warten, bis sich Word öffnet.
8. Standby verhindern und den Vorgang nicht mehrfach starten.

## Übergabe anzeigen

1. Ganz oben in der festen grünen Hauptleiste **Analyse** öffnen.
2. Darunter **Was war los?** wählen.
3. Oben links **Alle anzeigen** anklicken.
4. **Alles ausklappen** wählen, damit sämtliche Einträge vollständig sichtbar werden.
5. Zeitraum nur bei Bedarf ändern und die Anzeige aktualisieren.

In der aufgeklappten Ansicht können unter anderem **durchgeführte Visiten** und **neue/geänderte Formulare (mit Abschluss)** erscheinen.

## Bestätigte kontextverkürzte Anschlüsse

Bereits erreichte Navigation darf erhalten bleiben, wenn der nächste Schritt fachlich bestätigt ist:

- **Berichte gefunden** → bei gewünschtem neuen Bericht direkt beim grünen Plus weiter.
- **Visiten gefunden/geöffnet** → bei gewünschter Dokumentation direkt beim grünen Plus beziehungsweise **Neu** weiter.
- **An-/Abwesenheiten gefunden** → richtigen Bewohner prüfen → direkt bei **Neu** weiter.
- **Formulare gefunden** → richtigen Bewohner prüfen → direkt bei **Neu** weiter.
- **Bedarfsmedikation, Wirksamkeitskontrolle und Maßnahmen ohne Zeitangabe gefunden** → bereits erreichten Durchführungs-Kontext beibehalten.
- Nach einem **durchgestrichenen Bericht** darf angeboten werden, den korrigierten Inhalt als **neuen Bericht** zu dokumentieren. Ein Folgebericht bleibt davon getrennt.

## Umgang mit noch nicht bestätigten Details

- Keine Klickwege, Feldnamen oder fachlichen Inhalte erfinden.
- Die Berichtssuche über Analyse/Abfrage bleibt fachlich offen und aus der fertigen Anleitungsbibliothek heraus.
- **Planung** ist als Hauptbereich bestätigt; der genaue Easy-Plan-Ablauf bleibt fachlich offen.
- **Aufgaben · Aktuelles** bleibt fachlich offen.
- Bei Varianten immer die fachlich bestätigten lokalen Bezeichnungen bevorzugen.
- Öffentlich werden ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Fachinhalte dokumentiert.

## Dokumentationspflege

- Neue bestätigte lokale Klickwege werden **sofort** in dieser Datei nachgezogen.
- Eine technische Umsetzung in App, Migration, Sprache oder Test reicht nicht als dauerhafte Dokumentation aus, solange diese Datei nicht synchron ist.
- Änderungen an Routing, UI, Sprache oder Completion-Logik dürfen bestehende bestätigte Klickwege nicht stillschweigend verändern.
- Historische PRs und Migrationen dienen nur als Nachweis; diese Datei beschreibt den aktuell gültigen fachlichen Stand.