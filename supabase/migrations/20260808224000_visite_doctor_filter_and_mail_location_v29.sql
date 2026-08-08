-- v29: confirmed Visite details for doctor selection and Ort.
-- Normal case stays resident-specific: only use the system-wide doctor filter if the doctor is not already assigned to the resident.

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(
        steps,
        '{5}',
        coalesce(steps->5, '{}'::jsonb) || jsonb_build_object(
          'text', 'Den durchführenden Arzt auswählen. Nur wenn er beim Bewohner fehlt, rechts daneben das kleine Filtersymbol aktivieren und aus allen systemweit hinterlegten Ärzten wählen.',
          'check', 'Ist der durchführende Arzt ausgewählt?',
          'stuck', 'Den durchführenden Arzt auswählen. Nur wenn er beim Bewohner fehlt, rechts daneben das kleine Filtersymbol aktivieren und aus allen systemweit hinterlegten Ärzten wählen.'
        ),
        false
      ),
      '{8}',
      coalesce(steps->8, '{}'::jsonb) || jsonb_build_object(
        'text', 'Trage den Grund ein, zum Beispiel „Kontrollbesuch“, und wähle den Ort: Einrichtung, beim Arzt, telefonisch oder per Mail.',
        'check', 'Sind Grund und Ort eingetragen?'
      ),
      false
    ),
    troubleshooting = jsonb_set(
      coalesce(troubleshooting, '{}'::jsonb),
      '{arzt_filter}',
      to_jsonb('Nur wenn der durchführende Arzt beim Bewohner nicht hinterlegt ist, aktiviere rechts neben der Arztauswahl das kleine Filtersymbol. Dann stehen alle systemweit hinterlegten Ärzte zur Auswahl.'::text),
      true
    )
where slug = 'visite-anlegen'
  and status = 'approved'
  and (
    coalesce(steps->5->>'text','') <> 'Den durchführenden Arzt auswählen. Nur wenn er beim Bewohner fehlt, rechts daneben das kleine Filtersymbol aktivieren und aus allen systemweit hinterlegten Ärzten wählen.'
    or coalesce(steps->5->>'stuck','') <> 'Den durchführenden Arzt auswählen. Nur wenn er beim Bewohner fehlt, rechts daneben das kleine Filtersymbol aktivieren und aus allen systemweit hinterlegten Ärzten wählen.'
    or coalesce(steps->8->>'text','') <> 'Trage den Grund ein, zum Beispiel „Kontrollbesuch“, und wähle den Ort: Einrichtung, beim Arzt, telefonisch oder per Mail.'
    or coalesce(troubleshooting->>'arzt_filter','') <> 'Nur wenn der durchführende Arzt beim Bewohner nicht hinterlegt ist, aktiviere rechts neben der Arztauswahl das kleine Filtersymbol. Dann stehen alle systemweit hinterlegten Ärzte zur Auswahl.'
  );
