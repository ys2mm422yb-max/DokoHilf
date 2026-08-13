-- v51: product-confirmed detail help for Übergabe / „Was war los?“.
-- Confirmed on 2026-08-13:
-- * the button is labeled „Alle ausklappen“;
-- * it is positioned directly to the right of „Alle anzeigen“;
-- * after changing the period and refreshing the view, „Alle ausklappen“ must be chosen again.
-- The location/repeat wording is detail help for questions such as „Ich finde das nicht“;
-- the normal guide stays concise.

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(
        jsonb_set(
          steps,
          '{3,text}',
          to_jsonb('Wähle „Alle ausklappen“, damit sämtliche Einträge vollständig sichtbar werden.'::text),
          false
        ),
        '{3,stuck}',
        to_jsonb('„Alle ausklappen“ befindet sich rechts neben „Alle anzeigen“.'::text),
        true
      ),
      '{4,stuck}',
      to_jsonb('Wenn du den Zeitraum geändert und die Anzeige aktualisiert hast, wähle danach erneut „Alle ausklappen“, damit alle Einträge wieder vollständig geöffnet sind.'::text),
      true
    ),
    troubleshooting = (coalesce(troubleshooting, '{}'::jsonb) - 'alles_ausklappen')
      || jsonb_build_object(
        'alle_ausklappen',
        '„Alle ausklappen“ befindet sich rechts neben „Alle anzeigen“. Wenn du den Zeitraum geändert und die Anzeige aktualisiert hast, wähle danach erneut „Alle ausklappen“, damit alle Einträge wieder vollständig geöffnet sind.'
      ),
    aliases = case
      when 'alle ausklappen' = any(coalesce(aliases, array[]::text[])) then aliases
      else array_append(coalesce(aliases, array[]::text[]), 'alle ausklappen')
    end,
    version = version + 1,
    reviewed_at = now(),
    reviewed_role = 'product-confirmed',
    updated_at = now(),
    approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Übergabe-Detailhilfe präzisiert: „Alle ausklappen“ rechts neben „Alle anzeigen“; nach jeder Zeitraum-Aktualisierung erneut ausklappen.'
where slug = 'uebergabeformular'
  and status = 'approved';
