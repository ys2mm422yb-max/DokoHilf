-- v29: make confirmed guides easier to understand and align the report-style entry window.
-- Product-confirmed clarification:
-- * normal report entries and measures without time can optionally be marked "Wichtig für Schichtübergabe"
-- * Bedarfsmedikation already has that marker selected automatically and it stays selected
-- * the documentation text is entered in the large text field below the category / handover option
-- * navigation uses the confirmed Doku-Erweitert spelling and hierarchy

update public.dokohilf_guides
set steps = '[
  {"text":"Öffne beim gewünschten Bewohner den Bereich „Berichte“.","check":"Ist der richtige Bewohner geöffnet und bist du bei „Berichte“?","stuck":"Wähle zuerst den gewünschten Bewohner. „Berichte“ findest du ganz oben in der festen grünen Leiste."},
  {"text":"Klicke oben links auf das grüne Plus, um einen neuen Berichtseintrag anzulegen.","check":"Hat sich die Auswahl der Berichtskategorie geöffnet?","stuck":"Das grüne Plus befindet sich oben links im Bereich „Berichte“."},
  {"text":"Wähle die passende Berichtskategorie aus. Danach öffnet sich das Fenster für den Berichtseintrag; oben siehst du die ausgewählte Kategorie.","check":"Ist die richtige Kategorie ausgewählt und das Fenster für den Berichtseintrag geöffnet?"},
  {"text":"Nur bei „Kontakt – alles außer Arzt“ und „Sturzereignis“: Prüfe das automatisch zugeordnete Protokoll. Wird es nicht benötigt, klicke zuerst auf den Protokollnamen und danach oben rechts auf das kleine rote X. Das entfernt nur die Protokollverknüpfung, nicht den Bericht. Bei allen anderen Berichtskategorien überspringst du diesen Schritt.","check":"Ist bei einer der beiden Sonderkategorien das richtige Zusatzprotokoll verknüpft oder entfernt? Bei jeder anderen Kategorie kannst du direkt weitermachen.","stuck":"Dieser Protokollschritt gilt nur für „Kontakt – alles außer Arzt“ und „Sturzereignis“. Das kleine rote X wird erst nutzbar, nachdem du den angezeigten Protokollnamen angeklickt hast."},
  {"text":"Prüfe Datum und Uhrzeit und ändere sie nur, wenn der tatsächliche Dokumentationszeitpunkt abweicht.","check":"Sind Datum und Uhrzeit korrekt?"},
  {"text":"Wenn der Bericht für die nächste Schicht wichtig ist, hake „Wichtig für Schichtübergabe“ an. Wenn nicht, lässt du den Haken frei. In das große Textfeld darunter trägst du ein, was dokumentiert werden soll.","check":"Ist die Übergabe-Auswahl passend gesetzt und der Berichtstext vollständig eingetragen?"},
  {"text":"Bestätige unten mit „OK“.","check":"Wurde der Bericht gespeichert?"},
  {"text":"Kontrolliere kurz, ob der neue Berichtseintrag im Berichteblatt sichtbar ist.","check":"Ist der neue Berichtseintrag sichtbar?"}
]'::jsonb,
    troubleshooting = jsonb_set(
      coalesce(troubleshooting, '{}'::jsonb),
      '{schichtuebergabe}',
      to_jsonb('„Wichtig für Schichtübergabe“ nur anhaken, wenn dieser Bericht für die nächste Schicht wichtig ist. Der eigentliche Berichtstext kommt in das große Textfeld darunter.'::text),
      true
    ),
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Berichtseintrag verständlicher erklärt; optionale Schichtübergabe und Textfeld eindeutig zugeordnet.'
where slug = 'bericht-neu' and status = 'approved';

update public.dokohilf_guides
set steps = '[
  {"text":"Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“.","check":"Ist „Doku“ geöffnet?","stuck":"„Doku“ ist ein Hauptbereich ganz oben in der festen grünen Leiste."},
  {"text":"Wähle direkt darunter „Durchführungsnachweis“.","check":"Ist der Durchführungsnachweis geöffnet?","stuck":"Nach Auswahl von „Doku“ erscheint darunter „Durchführungsnachweis“."},
  {"text":"Suche im Durchführungsnachweis „Bedarfsmedikation“ und klicke auf den kleinen Pfeil links daneben.","check":"Ist die Bedarfsmedikation des ausgewählten Bewohners geöffnet?","stuck":"Bleibe im Durchführungsnachweis und suche „Bedarfsmedikation“. Direkt links daneben befindet sich der kleine Pfeil zum Öffnen."},
  {"text":"Wähle das gewünschte Bedarfsmedikament aus und setze rechts im kleinen Kästchen den Haken.","check":"Hat sich das Pop-up-Fenster geöffnet?","stuck":"Suche das gewünschte Medikament und setze ganz rechts in der zugehörigen Zeile den Haken."},
  {"text":"Prüfe im Pop-up-Fenster die Uhrzeit. Ändere sie nur, wenn der tatsächliche Zeitpunkt der Gabe abweicht.","check":"Stimmt die Uhrzeit der tatsächlichen Gabe?"},
  {"text":"„Wichtig für Schichtübergabe“ ist bei Bedarfsmedikation bereits automatisch ausgewählt. Lass den Haken so. In das Textfeld darunter trägst du kurz den Anlass der Gabe ein.","check":"Ist der Haken für die Schichtübergabe gesetzt und der Anlass eingetragen?"},
  {"text":"Falls tatsächlich eine geringere Bedarfsmenge verwendet wurde, trägst du rechts im Pop-up-Fenster die tatsächlich verwendete Menge ein. Die Verordnung selbst wird nicht verändert.","check":"Ist die tatsächlich verwendete Menge korrekt dokumentiert?","stuck":"Hier wird nur die tatsächlich verwendete Bedarfsmenge dokumentiert. Die verordnete Dosierung wird in diesem Ablauf nicht geändert."},
  {"text":"Bestätige das Pop-up-Fenster unten mit „OK“.","check":"Ist die Bedarfsmedikationsgabe gespeichert?"},
  {"text":"Nach dem Speichern wird die Wirksamkeitskontrolle automatisch vom System angelegt. Öffne sie erst, wenn sie zum vorgesehenen Zeitpunkt fällig ist.","check":"Ist klar, dass die Wirksamkeitskontrolle automatisch angelegt wird?","stuck":"Du legst die Wirksamkeitskontrolle nicht selbst an. DokoHilf nennt keine erfundene Wartezeit."},
  {"text":"Wenn die Wirksamkeitskontrolle fällig ist, öffnest du sie im Durchführungsnachweis, hakst sie ab und trägst kurz ein, ob und wie die Bedarfsmedikation gewirkt beziehungsweise geholfen hat.","check":"Ist die Wirkung dokumentiert?","stuck":"Suche zum vorgesehenen Zeitpunkt im Durchführungsnachweis die automatisch erzeugte Wirksamkeitskontrolle zur Bedarfsmedikation."},
  {"text":"Bestätige die Wirksamkeitskontrolle unten mit „OK“.","check":"Ist die Wirksamkeitskontrolle gespeichert?"}
]'::jsonb,
    troubleshooting = '{"abgrenzung":"Die Bedarfsmedikationsgabe wird im Durchführungsnachweis dokumentiert. Die normale Medikationsübersicht bleibt ein separater Nur-Ansehen-Ablauf.","menge":"Nur die tatsächlich verwendete Bedarfsmenge dokumentieren; die Verordnung selbst nicht verändern.","schichtuebergabe":"Bei Bedarfsmedikation ist „Wichtig für Schichtübergabe“ automatisch ausgewählt. Den Haken so lassen.","wirksamkeit":"Die Wirksamkeitskontrolle wird automatisch angelegt und erst zum vorgesehenen Zeitpunkt bearbeitet. DokoHilf erfindet keine konkrete Wartezeit."}'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Bedarfsmedikation verständlicher erklärt; automatische Schichtübergabe und Textfeld eindeutig zugeordnet.'
where slug = 'bedarfsmedikation-gabe' and status = 'approved';

update public.dokohilf_guides
set steps = '[
  {"text":"Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“.","check":"Ist „Doku“ geöffnet?","stuck":"„Doku“ ist ein Hauptbereich ganz oben in der festen grünen Leiste."},
  {"text":"Wähle direkt darunter „Durchführungsnachweis“.","check":"Ist der Durchführungsnachweis geöffnet?","stuck":"Nach Auswahl von „Doku“ erscheint darunter „Durchführungsnachweis“."},
  {"text":"Öffne im Durchführungsnachweis „Maßnahmen ohne Zeitangabe“.","check":"Ist „Maßnahmen ohne Zeitangabe“ geöffnet?","stuck":"Bleibe im Durchführungsnachweis und suche dort „Maßnahmen ohne Zeitangabe“."},
  {"text":"Wähle die gewünschte Maßnahme aus, zum Beispiel „Klienten-Team Sitzung“ oder „Krise“.","check":"Hat sich das Pop-up-Fenster geöffnet?"},
  {"text":"Prüfe im Pop-up-Fenster Datum und Uhrzeit. Ändere sie nur, wenn der tatsächliche Dokumentationszeitpunkt abweicht.","check":"Stimmen Datum und Uhrzeit?"},
  {"text":"Wähle die passende Kategorie aus.","check":"Ist die passende Kategorie ausgewählt?"},
  {"text":"Wenn die Maßnahme für die nächste Schicht wichtig ist, hake „Wichtig für Schichtübergabe“ an. Wenn nicht, lässt du den Haken frei. In das große Textfeld darunter schreibst du kurz, was passiert ist und was du gemacht beziehungsweise durchgeführt hast.","check":"Ist die Übergabe-Auswahl passend gesetzt und die Durchführung verständlich dokumentiert?"},
  {"text":"Falls du zusätzlich eine Zeitangabe brauchst, kannst du sie oben rechts im Pop-up-Fenster ergänzen.","check":"Ist die zusätzliche Zeitangabe bei Bedarf eingetragen?"},
  {"text":"Bestätige das Pop-up-Fenster unten mit „OK“.","check":"Ist die Maßnahme gespeichert?"}
]'::jsonb,
    troubleshooting = '{"popup":"Im Pop-up-Fenster zuerst Datum und Uhrzeit prüfen und die Kategorie wählen. „Wichtig für Schichtübergabe“ ist bei Bedarf optional. Der eigentliche Dokumentationstext kommt in das große Textfeld darunter; eine zusätzliche Zeitangabe oben rechts ist ebenfalls optional."}'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Maßnahmen ohne Zeitangabe verständlicher erklärt; optionale Schichtübergabe und Textfeld eindeutig zugeordnet.'
where slug = 'massnahmen-ohne-zeitangabe' and status = 'approved';

-- Remove old navigation wording that still contradicted the confirmed green hierarchy.
update public.dokohilf_guides
set steps = '[
  {"text":"Öffne beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“.","check":"Ist „Doku-Erweitert“ geöffnet?","stuck":"„Doku-Erweitert“ steht ganz oben in der festen grünen Leiste."},
  {"text":"Wähle direkt darunter „Visiten“.","check":"Ist der Bereich „Visiten“ geöffnet?","stuck":"Nach Auswahl von „Doku-Erweitert“ findest du darunter „Visiten“."}
]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Alte Bezeichnung Doku erweitert entfernt und bestätigte Doku-Erweitert-Navigation vereinheitlicht.'
where slug = 'visiten-oeffnen' and status = 'approved';

update public.dokohilf_guides
set steps = '[
  {"text":"Öffne beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“.","check":"Ist „Doku-Erweitert“ geöffnet?","stuck":"„Doku-Erweitert“ steht ganz oben in der festen grünen Leiste."},
  {"text":"Wähle direkt darunter „Vitalwerte“.","check":"Ist der Bereich „Vitalwerte“ geöffnet?","stuck":"Nach Auswahl von „Doku-Erweitert“ findest du darunter „Vitalwerte“."}
]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Vitalwerte nur noch über den bestätigten Hauptbereich Doku-Erweitert erklärt.'
where slug = 'vitalwerte' and status = 'approved';

update public.dokohilf_guides
set steps = '[
  {"text":"Öffne beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“.","check":"Ist „Doku-Erweitert“ geöffnet?","stuck":"„Doku-Erweitert“ steht ganz oben in der festen grünen Leiste."},
  {"text":"Für einen einzelnen Wert wählst du darunter „Vitalwerte“. Für mehrere Werte wählst du direkt „Vitalwerte Sammelerf.“.","check":"Weißt du, ob du einen einzelnen oder mehrere Vitalwerte erfassen möchtest?","stuck":"„Vitalwerte“ und „Vitalwerte Sammelerf.“ sind zwei getrennte Einträge direkt unter „Doku-Erweitert“."}
]'::jsonb,
    troubleshooting = '{"auswahl":"Einzelner Wert: Doku-Erweitert → Vitalwerte. Mehrere Werte: Doku-Erweitert → Vitalwerte Sammelerf."}'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Veralteten Doku-Vitalwerte-Weg entfernt und die zwei bestätigten Vitalwerte-Einstiege vereinheitlicht.'
where slug = 'vitalwerte-erfassen' and status = 'approved';

-- Friendlier terminology for the existing single-value continuation without changing its logic.
update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(steps, '{0,text}', to_jsonb('Klicke oben links auf das grüne Plus beziehungsweise „Neu“. Danach öffnet sich das Pop-up-Fenster zur Auswahl des Vitalwerts.'::text), true),
      '{1,text}', to_jsonb('Wähle im Pop-up-Fenster den Vitalwert aus, den du erfassen möchtest.'::text), true
    ),
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Pop-up als Pop-up-Fenster und Auswahl einfacher erklärt.'
where slug = 'vitalwerte-einzelwert-fortsetzen' and status = 'approved';
