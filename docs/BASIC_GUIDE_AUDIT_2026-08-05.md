# Audit der Basis-Anleitungen

**Stand:** 5. August 2026  
**Geltungsbereich:** geschützte DokoHilf-Wissensbasis

## Ziel

Alle bisher besprochenen Basisfunktionen wurden darauf geprüft, ob der Ablauf fachlich bestätigt, nur als Menüweg bestätigt oder noch nicht ausreichend verifiziert ist. DokoHilf darf keine internen Bedienwege erfinden.

Öffentlich verfügbare Produkttutorials dienen ausschließlich dazu, Fachbegriffe, Funktionszusammenhänge und mögliche Varianten einzuordnen. Ein konkreter Klickweg wird erst freigegeben, wenn er für die tatsächlich verwendete Einrichtungsoberfläche bestätigt wurde. Verbindliche Einrichtungsregeln haben immer Vorrang vor allgemeinen Produktmöglichkeiten.

## Vollständig bestätigte Abläufe und Regeln

- Neuen Berichtseintrag erfassen
  - Berichte öffnen
  - grünes Plus oben links
  - Pop-up „Neuen Berichtseintrag erfassen“
  - Datum und Uhrzeit prüfen oder ändern
  - erforderliche Kategorie wählen
  - Bericht mit Fantasiedaten verfassen
  - mit OK speichern
- Übergabe anzeigen
  - Analyse
  - Was war los
  - Alle anzeigen
  - Alle ausklappen
- Notfallblatt öffnen
  - rotes Kreuz in der festen Leiste
  - Notfallblatt auswählen
  - mit OK bestätigen
  - Word-Erstellung abwarten
  - bis zu etwa drei Minuten am PC bleiben und Standby verhindern
- Verbindliche Visitenstatus-Regel
  - Visiten niemals auf „abgeschlossen“ setzen
  - eine bearbeitete Visite immer auf „durchgeführt“ stellen
  - auch Fragen wie „Visite abschließen“, „Visite beenden“ oder „Welcher Status?“ müssen auf diese Regel führen

## Als Menüweg bestätigt

Diese Anleitungen führen nur so weit, wie der Ablauf sicher bestätigt ist:

- Doku → An- und Abwesenheit
- Doku → Durchführungsnachweis
- Doku erweitert → Medikationen, ausschließlich ansehen
- Doku erweitert → Visiten
- Doku oder Doku erweitert → Vitalwerte
- Planung → Easy-Plan
- Aufgaben → Aktuelles
- Bewohnerübersicht → Doppelklick → Stammdaten
- Analyse → Abfrage → Berichtssuche

## Fachlich eingeordnete Themenbereiche

Für alle vorhandenen Bereiche wurde eine geschützte Hintergrundebene aufgebaut. Sie kennt Fachbegriffe und typische Zusammenhänge, erzeugt daraus aber keine ungeprüften Klickwege:

- Berichte und Berichteblatt
- Übergabe und Übersicht
- Durchführungsnachweis und Maßnahmen
- Visiten und Pflegevisiten
- Vitalwerte und Verlauf
- Medikation und Verordnungen
- An- und Abwesenheiten
- Planung und Easy-Plan
- Stammdaten und Klientenakte
- Analyse, Abfragen und Auswertungen
- Aufgaben und Aktuelles
- Notfall- und Verlegungsblatt
- Oberfläche, Startansichten und Berechtigungen

Desktop- und Weboberflächen werden als unterschiedliche Varianten behandelt und dürfen nicht miteinander vermischt werden.

## Vorläufig nicht als Klickanleitung ausliefern

Folgende Detailabläufe bleiben gesperrt, bis die konkrete Einrichtungsoberfläche fachlich bestätigt wurde:

- bestehenden Bericht durchstreichen oder bearbeiten
- Abweichung im Durchführungsnachweis im Detail dokumentieren
- Durchführung stornieren
- neue Visite vollständig anlegen
- Visite im Detail dokumentieren
- Medikation anlegen oder verändern
- An-/Abwesenheitsstatus im Detail verändern oder stornieren
- komplexe Abfragen, Exporte oder administrative Konfigurationen

Bei Visiten gilt unabhängig davon immer die bestätigte Statusregel: **nicht „abgeschlossen“, sondern „durchgeführt“**.

## Routing-Regeln

- „Bericht verfassen“, „Bericht schreiben“, „Pflegebericht schreiben“ oder „Bericht erfassen“ startet den neuen Bericht.
- „Bericht durchstreichen“, „verschrieben“ oder „falsch geschrieben“ wird dem Berichtsbereich zugeordnet, liefert aber ohne bestätigten Ablauf keinen erfundenen Klickweg.
- „Wo finde ich …?“ startet den passenden bestätigten Einstieg und wird nicht als Problem mit einem bereits laufenden Schritt behandelt.
- „Ich finde es nicht“ und „Ich finde Berichte nicht“ bleiben innerhalb einer laufenden Anleitung beim aktuellen Schritt.
- „Visite abschließen“, „Visite fertig“, „Visite beenden“ und Fragen zum Visitenstatus führen immer zur Regel „durchgeführt“.
- Ein anderes Thema wird nur bei einer eindeutig genannten neuen Bedienaufgabe gestartet.

## Datenschutz

- ausschließlich allgemeine Bedienfragen
- keine echten Namen, Berichte, Diagnosen, Medikationen, Vitalwerte oder sonstigen Falldaten
- keine Gesprächsspeicherung in Supabase oder im Browser-Dauerspeicher
- öffentlich nur Fantasiedaten
- Hintergrundwissen und Anleitungen sind nicht öffentlich aus der Datenbank lesbar

## Prüfergebnis

Die vollständige Themenmatrix wurde gegen den echten KI-Endpunkt getestet. Geprüft wurden alle vorhandenen Basisbereiche, freie Formulierungen, bestätigte Einstiege, nicht freigegebene Detailaktionen, laufendes Chatgedächtnis, „Ich finde es nicht“-Fälle und der Echtdatenblock.

Die Visitenstatus-Regel wurde zusätzlich mit mehreren Formulierungen getestet. „Wie schließe ich eine Visite ab?“, „Die Visite ist fertig“, „Welchen Status nehme ich?“ und „auf durchgeführt stellen“ liefern jeweils eindeutig: **niemals abgeschlossen, immer durchgeführt**.
