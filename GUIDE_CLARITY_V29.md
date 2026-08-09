# DokoHilf v29 – verständliche Guide-Texte

Dieser Patch vereinheitlicht die bestätigten Abläufe, ohne neue Klickwege zu erfinden.

- Berichtseinträge: „Wichtig für Schichtübergabe“ ist optional; der Berichtstext kommt in das große Textfeld darunter.
- Bedarfsmedikation: „Wichtig für Schichtübergabe“ ist automatisch ausgewählt und bleibt gesetzt; der Anlass kommt in das Textfeld darunter.
- Maßnahmen ohne Zeitangabe: Schichtübergabe ist optional; dokumentiert wird im großen Textfeld darunter.
- „Pop-up-Fenster“ wird als verständlichere Bezeichnung verwendet.
- Veraltete Wege über „Doku erweitert“ beziehungsweise Vitalwerte über „Doku“ werden entfernt; bestätigt bleibt „Doku-Erweitert“.
- Footer: dezenter Hinweis „Konzept & Umsetzung · MT“ direkt bei der Versionszeile.

Die produktive Migration `20260809143000_guide_clarity_handover_v29.sql` darf erst nach erfolgreichem Merge des exakten PR-Heads angewendet werden. Sie wurde vorab vollständig in einer `BEGIN … ROLLBACK`-Transaktion gegen die DokoHilf-Produktion geprüft.
