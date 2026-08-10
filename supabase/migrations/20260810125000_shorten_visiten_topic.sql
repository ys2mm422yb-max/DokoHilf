-- DokoHilf: keep the general Visiten topic concise and aligned with approved guides.
-- This migration changes only general, non-personal help content.

update public.dokohilf_topics
set overview = 'Bei Visiten hilft DokoHilf mit den bestätigten Abläufen zum Öffnen, Dokumentieren und richtigen Status.',
    capabilities = array[
      'Visiten öffnen',
      'Visite dokumentieren',
      'Status „durchgeführt“ richtig setzen'
    ]::text[],
    variant_note = '',
    reviewed_at = now(),
    updated_at = now()
where slug = 'visiten'
  and status = 'approved';
