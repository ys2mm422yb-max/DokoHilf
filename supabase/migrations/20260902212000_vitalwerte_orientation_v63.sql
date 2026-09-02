-- v63: align Vitalwerte orientation with all currently confirmed, anonymized access paths.
-- Existing primary path stays valid: Doku-Erweitert -> Vitalwerte / Vitalwerte Sammelerf.
-- Additionally confirmed: Doku -> Vitalwerte; from an already opened Vitalwerte overview,
-- Sammelerfassung can be selected for multiple values.
-- No new fields, units or clinical values are introduced.

update public.dokohilf_guides
set troubleshooting = coalesce(troubleshooting, '{}'::jsonb) || jsonb_build_object(
      'alternativer_zugang',
      '„Vitalwerte“ ist beim ausgewählten Bewohner sowohl über „Doku-Erweitert“ als auch über „Doku“ erreichbar. Der vorhandene Doku-Erweitert-Weg bleibt gültig.'
    ),
    version = version + 1,
    reviewed_at = now(),
    reviewed_role = 'product-confirmed',
    updated_at = now(),
    approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'v63: bestätigten alternativen Vitalwerte-Zugang über Doku ergänzt; bestehender Doku-Erweitert-Weg bleibt gültig.'
where slug in ('vitalwerte', 'vitalwerte-erfassen', 'vitalwerte-finden')
  and status = 'approved';

update public.dokohilf_guides
set aliases = array_remove(coalesce(aliases, array[]::text[]), 'gewicht eingeben'),
    troubleshooting = coalesce(troubleshooting, '{}'::jsonb) || jsonb_build_object(
      'alternativer_zugang',
      '„Vitalwerte“ ist beim ausgewählten Bewohner sowohl über „Doku-Erweitert“ als auch über „Doku“ erreichbar. Danach über das grüne Plus beziehungsweise „Neu“ einen einzelnen Wert erfassen.'
    ),
    version = version + 1,
    reviewed_at = now(),
    reviewed_role = 'product-confirmed',
    updated_at = now(),
    approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'v63: alternativen Vitalwerte-Zugang ergänzt und unbestätigten Alias „gewicht eingeben“ entfernt.'
where slug = 'vitalwerte-einzelwert'
  and status = 'approved';

update public.dokohilf_guides
set troubleshooting = coalesce(troubleshooting, '{}'::jsonb) || jsonb_build_object(
      'alternativer_zugang',
      'Für mehrere Werte bleibt „Doku-Erweitert“ → „Vitalwerte Sammelerf.“ bestätigt. Alternativ kann bei bereits geöffneter „Vitalwerte“-Übersicht dort „Sammelerfassung“ gewählt werden.'
    ),
    version = version + 1,
    reviewed_at = now(),
    reviewed_role = 'product-confirmed',
    updated_at = now(),
    approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'v63: bestätigten alternativen Sammelerfassungs-Zugang aus der Vitalwerte-Übersicht ergänzt.'
where slug = 'vitalwerte-sammelerfassung'
  and status = 'approved';