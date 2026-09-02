-- v64: align An-/Abwesenheiten orientation with all currently confirmed access paths.
-- Existing primary path stays valid: Doku-Erweitert -> An-/Abwesenheiten.
-- Additionally confirmed: Doku -> An-/Abwesenheiten.
-- No status names, fields or documentation rules are changed by this migration.

update public.dokohilf_guides
set troubleshooting = coalesce(troubleshooting, '{}'::jsonb) || jsonb_build_object(
      'alternativer_zugang',
      '„An-/Abwesenheiten“ ist beim ausgewählten Bewohner sowohl über „Doku-Erweitert“ als auch über „Doku“ erreichbar. Der vorhandene Doku-Erweitert-Weg bleibt gültig.'
    ),
    version = version + 1,
    reviewed_at = now(),
    reviewed_role = 'product-confirmed',
    updated_at = now(),
    approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'v64: bestätigten alternativen Zugang zu An-/Abwesenheiten über Doku ergänzt; bestehender Doku-Erweitert-Weg bleibt gültig.'
where slug in ('anwesenheit', 'anwesenheiten-finden')
  and status = 'approved';