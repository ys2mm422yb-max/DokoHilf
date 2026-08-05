# Audit der Basis-Anleitungen

**Stand:** 5. August 2026  
**Geltungsbereich:** geschützte DokoHilf-Wissensbasis

## Ziel

Alle bisher besprochenen Basisfunktionen wurden darauf geprüft, ob der Ablauf fachlich bestätigt, nur als Menüweg bestätigt oder noch nicht ausreichend verifiziert ist. DokoHilf darf keine internen Bedienwege erfinden.

## Vollständig bestätigte Abläufe

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

## Vorläufig nicht ausliefern

Folgende Detailabläufe bleiben auf `draft`, bis die konkrete Oberfläche fachlich bestätigt wurde:

- Abweichung im Durchführungsnachweis dokumentieren
- Durchführung stornieren
- neue Visite vollständig anlegen

## Routing-Regeln

- „Bericht verfassen“, „Bericht schreiben“ oder „Bericht erfassen“ startet den neuen Bericht.
- „Bericht durchstreichen“, „verschrieben“ oder „falsch geschrieben“ startet den Korrekturablauf.
- „Ich finde es nicht“ und „Ich finde Berichte nicht“ bleiben innerhalb einer laufenden Anleitung beim aktuellen Schritt.
- Ein anderes Thema wird nur bei einer eindeutig genannten neuen Bedienaufgabe gestartet.

## Datenschutz

- ausschließlich allgemeine Bedienfragen
- keine echten Namen, Berichte, Diagnosen, Medikationen, Vitalwerte oder sonstigen Falldaten
- keine Gesprächsspeicherung in Supabase oder im Browser-Dauerspeicher
- öffentlich nur Fantasiedaten

## Prüfergebnis

Zwölf natürliche Basisfragen wurden gegen den echten KI-Endpunkt getestet und jeweils dem korrekten freigegebenen Bereich zugeordnet. Der Bericht-Ablauf wurde zusätzlich über mehrere Schritte sowie mit dem Problemfall „Ich finde Berichte nicht“ geprüft.
