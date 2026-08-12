-- DokoHilf v43: correct the confirmed report-entry guide.
-- The large report text field is already visible in the report-entry mask;
-- choosing the report category does not open that text field afterwards.

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(
        steps,
        '{2,text}',
        to_jsonb('Wähle die passende Berichtskategorie aus. Das große Textfeld für den Bericht ist in dieser Maske bereits unten sichtbar; es öffnet sich durch die Kategorieauswahl nicht erst neu.'::text),
        false
      ),
      '{2,check}',
      to_jsonb('Ist die richtige Berichtskategorie ausgewählt und ist das große Textfeld unten sichtbar?'::text),
      false
    ),
    version = 10,
    updated_at = now(),
    change_note = 'Bericht anlegen: Textfeld ist bereits in der Maske sichtbar; kein erfundener Öffnungsschritt.'
where slug = 'bericht-neu'
  and status = 'approved'
  and version = 9
  and steps->2->>'text' = 'Wähle die passende Berichtskategorie aus. Danach öffnet sich das Fenster für den Berichtseintrag; oben siehst du die ausgewählte Kategorie.';

do $$
begin
  if not exists (
    select 1
    from public.dokohilf_guides
    where slug = 'bericht-neu'
      and status = 'approved'
      and version = 10
      and steps->2->>'text' = 'Wähle die passende Berichtskategorie aus. Das große Textfeld für den Bericht ist in dieser Maske bereits unten sichtbar; es öffnet sich durch die Kategorieauswahl nicht erst neu.'
      and steps->2->>'check' = 'Ist die richtige Berichtskategorie ausgewählt und ist das große Textfeld unten sichtbar?'
  ) then
    raise exception 'bericht-neu precondition failed; refusing to overwrite an unexpected guide state';
  end if;
end
$$;
