-- v52: product-confirmed routing for every current sign-off intent ("abzeichnen").
-- Confirmed on 2026-08-22:
-- * when somebody wants to sign off something, DokoHilf leads to the selected resident's Durchführungsnachweis;
-- * this includes medication sign-off and must not be confused with the view-only medication overview;
-- * a falsely signed-off item remains a separate correction/storno intent;
-- * no unconfirmed click path inside the Durchführungsnachweis is added here.
--
-- The two guide step texts already exist in the approved static Supertonic-F1 catalog,
-- so this change does not introduce any new audible sentence.

do $$
declare
  affected_rows integer;
begin
  update public.dokohilf_guides
  set steps = jsonb_build_array(
        jsonb_build_object(
          'text', 'Wähle zuerst den gewünschten Bewohner aus.',
          'check', 'Ist der richtige Bewohner ausgewählt?'
        ),
        jsonb_build_object(
          'text', 'Schau ganz oben in die feste grüne Hauptleiste und öffne „Doku“. Direkt darunter erscheinen die zu „Doku“ gehörenden Funktionen. Wähle dort „Durchführungsnachweis“.',
          'check', 'Ist der Durchführungsnachweis geöffnet?',
          'stuck', 'Zuerst ganz oben in der grünen Hauptleiste „Doku“ öffnen. Direkt darunter findest du „Durchführungsnachweis“.'
        )
      ),
      aliases = array(
        select distinct alias_value
        from unnest(
          coalesce(aliases, array[]::text[])
          || array[
            'abzeichnen',
            'etwas abzeichnen',
            'medikamente abzeichnen',
            'medikation abzeichnen',
            'maßnahme abzeichnen',
            'durchführung abzeichnen',
            'ich muss medikamente abzeichnen',
            'ich möchte etwas abzeichnen'
          ]::text[]
        ) as alias_value
        order by alias_value
      ),
      troubleshooting = coalesce(troubleshooting, '{}'::jsonb)
        || jsonb_build_object(
          'abzeichnen',
          'Zum Abzeichnen zuerst den richtigen Bewohner auswählen und anschließend über „Doku“ den „Durchführungsnachweis“ öffnen. Die Medikationsübersicht unter „Doku-Erweitert“ → „Medikation“ bleibt ausschließlich zum Ansehen.'
        ),
      version = 4,
      reviewed_at = now(),
      reviewed_role = 'product-confirmed',
      updated_at = now(),
      approved_at = now(),
      review_due_at = now() + interval '180 days',
      change_note = 'Abzeichnen führt beim ausgewählten Bewohner über Doku zum Durchführungsnachweis; Medikamentenansicht bleibt ausschließlich zum Ansehen.'
  where slug = 'durchfuehrungsnachweis-finden'
    and status = 'approved'
    and version = 3;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Expected exactly one approved durchfuehrungsnachweis-finden guide at version 3, updated % rows', affected_rows;
  end if;
end
$$;
