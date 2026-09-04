-- v69: make the already confirmed Dateiablage boundary easier to understand.
-- This changes only the wording of the existing stuck help. It adds no menu,
-- field, action, document type, or alternative workflow.

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{3,stuck}',
      to_jsonb('Bleibe in der Dateiablage. Wenn das gewünschte Dokument nicht angezeigt wird, frag bitte kurz im Team, ob und wo es abgelegt ist.'::text),
      false
    ),
    version = version + 1,
    reviewed_at = now(),
    reviewed_role = 'product-confirmed',
    updated_at = now(),
    approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'v69: vorhandene Dateiablage-Hilfe natürlich formuliert; bestätigte Grenze bleibt Finden und Öffnen bereits vorhandener Dokumente.'
where slug = 'dateiablage'
  and status = 'approved'
  and steps->3->>'stuck' = 'Suche nur nach einem bereits vorhandenen Dokument. Wenn das gewünschte Dokument nicht angezeigt wird, ist nicht bestätigt, dass es dort hinterlegt ist.';
