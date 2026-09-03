-- v66: remove unconfirmed An-/Abwesenheiten status examples.
-- The confirmed workflow only requires selecting the appropriate status; no concrete
-- local status labels are introduced or preserved here.

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{3,text}',
      to_jsonb('Wähle den passenden Status aus.'::text),
      false
    ),
    version = version + 1,
    reviewed_at = now(),
    reviewed_role = 'product-confirmed',
    updated_at = now(),
    approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'v66: nicht bestätigte Status-Beispiele entfernt; der Guide nennt nur noch die bestätigte Anweisung, den passenden Status auszuwählen.'
where slug = 'anwesenheit'
  and status = 'approved'
  and coalesce(steps->3->>'text','') <> 'Wähle den passenden Status aus.';
