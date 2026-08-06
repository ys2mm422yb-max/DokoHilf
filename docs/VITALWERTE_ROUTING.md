# Vitalwerte-Routing

## Zielgedächtnis

Eine eindeutige Aussage wie „Ich möchte Vitalwerte eingeben“ startet den Erfassungsablauf. DokoHilf fragt später nicht erneut, ob die Person erfassen oder nur ansehen möchte.

## Verzweigung

Nach dem Öffnen von `Vitalwerte` wird nur noch die tatsächlich notwendige Entscheidung gestellt:

- einzelner Wert: grünes Plus → Pop-up → Vitalwert auswählen
- mehrere Werte: `Sammelerfassung`

## Schrittzustand

Der aktuelle Schritt wird mit `guideStep` und `guideStepCount` zwischen Oberfläche und Router übertragen. Frühere Bestätigungen im Gespräch dürfen keine späteren Schritte überspringen.

## Quellenbasis

Die allgemeine Produktfunktion Einzeleingabe/Sammelerfassung ist in offiziellen Connext-Unterlagen beschrieben. Der konkrete einrichtungsspezifische Einstieg mit grünem Plus und Pop-up wurde vom Nutzer bestätigt.
