-- v29 hotfix: "Maßnahmen ohne Zeitangabe" is expanded with the same small
-- arrow left of the row that is already confirmed for Bedarfsmedikation.
-- Keep task guidance, find/orientation guidance and static speech consistent.

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(
        steps,
        '{2,text}',
        to_jsonb('Suche im Durchführungsnachweis „Maßnahmen ohne Zeitangabe“ und klicke auf den kleinen Pfeil links daneben.'::text),
        false
      ),
      '{2,stuck}',
      to_jsonb('Bleibe im Durchführungsnachweis und suche dort „Maßnahmen ohne Zeitangabe“. Direkt links daneben befindet sich der kleine Pfeil zum Öffnen.'::text),
      true
    ),
    version = version + 1,
    reviewed_at = now(),
    reviewed_role = 'product-confirmed',
    updated_at = now(),
    approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Maßnahmen ohne Zeitangabe: bestätigten kleinen Pfeil links zum Öffnen ergänzt.'
where slug = 'massnahmen-ohne-zeitangabe'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(
        jsonb_set(
          steps,
          '{2,text}',
          to_jsonb('Im Durchführungsnachweis findest du „Maßnahmen ohne Zeitangabe“. Klicke auf den kleinen Pfeil links daneben, um den Bereich zu öffnen.'::text),
          false
        ),
        '{2,check}',
        to_jsonb('Ist „Maßnahmen ohne Zeitangabe“ geöffnet?'::text),
        true
      ),
      '{2,stuck}',
      to_jsonb('Bleibe im Durchführungsnachweis und suche „Maßnahmen ohne Zeitangabe“. Direkt links daneben befindet sich der kleine Pfeil zum Öffnen.'::text),
      true
    ),
    version = version + 1,
    reviewed_at = now(),
    reviewed_role = 'product-confirmed',
    updated_at = now(),
    approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Orientierung zu Maßnahmen ohne Zeitangabe um den bestätigten kleinen Pfeil links ergänzt.'
where slug = 'massnahmen-ohne-zeitangabe-finden'
  and status = 'approved';
