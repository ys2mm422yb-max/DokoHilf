-- v29: remove internal QA / approval wording from user-visible and spoken guide copy.
-- Fachliche Klickwege und safety constraints stay unchanged; only wording is simplified.

update public.dokohilf_guides
set steps = jsonb_set(
  jsonb_set(
    steps,
    '{2,text}',
    to_jsonb('Lege die gewünschten Suchkriterien und den Zeitraum fest.'::text),
    false
  ),
  '{3,check}',
  to_jsonb('Werden die gesuchten Einträge angezeigt?'::text),
  false
)
where slug = 'berichtssuche'
  and status = 'approved'
  and (
    coalesce(steps->2->>'text','') <> 'Lege die gewünschten Suchkriterien und den Zeitraum fest.'
    or coalesce(steps->3->>'check','') <> 'Werden die gesuchten Einträge angezeigt?'
  );

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{5}',
      coalesce(steps->5, '{}'::jsonb) || jsonb_build_object(
        'text', 'Fülle das geöffnete Formular wie gewohnt aus.',
        'check', 'Ist das Formular ausgefüllt?'
      ),
      false
    ),
    troubleshooting = jsonb_set(
      coalesce(troubleshooting, '{}'::jsonb),
      '{felder_unbestaetigt}',
      to_jsonb('Wenn du bei einem Feld unsicher bist, kläre die fachliche Angabe bitte im Team.'::text),
      true
    )
where slug = 'formulare-anlegen'
  and status = 'approved'
  and (
    coalesce(steps->5->>'text','') <> 'Fülle das geöffnete Formular wie gewohnt aus.'
    or coalesce(steps->5->>'check','') <> 'Ist das Formular ausgefüllt?'
    or coalesce(troubleshooting->>'felder_unbestaetigt','') <> 'Wenn du bei einem Feld unsicher bist, kläre die fachliche Angabe bitte im Team.'
  );

update public.dokohilf_guides
set steps = jsonb_set(
  steps,
  '{1,text}',
  to_jsonb('Öffne die gewünschte Person mit einem Doppelklick.'::text),
  false
)
where slug = 'stammdaten'
  and status = 'approved'
  and coalesce(steps->1->>'text','') <> 'Öffne die gewünschte Person mit einem Doppelklick.';

update public.dokohilf_guides
set steps = jsonb_set(
  steps,
  '{4,text}',
  to_jsonb('Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein. Bei Blutdruck sind beispielsweise Systole und Diastole erforderlich.'::text),
  false
)
where slug = 'vitalwerte-einzelwert'
  and status = 'approved'
  and coalesce(steps->4->>'text','') <> 'Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein. Bei Blutdruck sind beispielsweise Systole und Diastole erforderlich.';

update public.dokohilf_guides
set steps = jsonb_set(
  steps,
  '{2,text}',
  to_jsonb('Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein.'::text),
  false
)
where slug = 'vitalwerte-einzelwert-fortsetzen'
  and status = 'approved'
  and coalesce(steps->2->>'text','') <> 'Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein.';

update public.dokohilf_guides
set steps = jsonb_set(
  steps,
  '{3,text}',
  to_jsonb('Prüfe Datum und Uhrzeit und trage die gemessenen Werte ein.'::text),
  false
)
where slug = 'vitalwerte-sammelerfassung'
  and status = 'approved'
  and coalesce(steps->3->>'text','') <> 'Prüfe Datum und Uhrzeit und trage die gemessenen Werte ein.';

update public.dokohilf_guides
set steps = jsonb_set(
  steps,
  '{1,text}',
  to_jsonb('Wähle die benötigten Vitalwerte aus und trage die Werte ein.'::text),
  false
)
where slug = 'vitalwerte-sammelerfassung-fortsetzen'
  and status = 'approved'
  and coalesce(steps->1->>'text','') <> 'Wähle die benötigten Vitalwerte aus und trage die Werte ein.';

update public.dokohilf_guides
set troubleshooting = jsonb_set(
  coalesce(troubleshooting, '{}'::jsonb),
  '{aenderungswunsch}',
  to_jsonb('Hier geht es nur um das Ansehen der Medikation. Änderungen klärst du bitte über den dafür vorgesehenen Weg.'::text),
  true
)
where slug = 'medikation-ansehen'
  and status = 'approved'
  and coalesce(troubleshooting->>'aenderungswunsch','') <> 'Hier geht es nur um das Ansehen der Medikation. Änderungen klärst du bitte über den dafür vorgesehenen Weg.';
