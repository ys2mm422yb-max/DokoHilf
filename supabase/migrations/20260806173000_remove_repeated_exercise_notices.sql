-- Build 27: privacy remains enforced centrally, but approved guides no longer repeat
-- exercise/fantasy-data notices inside individual operating steps.

update public.dokohilf_guides as guide
set
  steps = cleaned.steps,
  version = guide.version + 1,
  change_note = concat_ws(' ', guide.change_note, 'Wiederholte Fantasiedaten-Hinweise aus einzelnen Schritten entfernt; zentraler Datenschutz-Hinweis bleibt bestehen.'),
  reviewed_at = now()
from lateral (
  select jsonb_agg(
    case
      when step.value ? 'text' then jsonb_set(
        step.value,
        '{text}',
        to_jsonb(
          btrim(
            regexp_replace(
              step.value ->> 'text',
              '\s*(In Übungen ausschließlich Fantasiedaten verwenden\.?|In Übungen nur Fantasiedaten verwenden\.?|Verwende in Übungen ausschließlich Fantasiedaten\.?|Verwende dabei nur Fantasiedaten\.?|In Übungen ausschließlich mit Fantasiedaten arbeiten\.?)',
              '',
              'gi'
            )
          )
        ),
        false
      )
      else step.value
    end
    order by step.ordinality
  ) as steps
  from jsonb_array_elements(guide.steps) with ordinality as step(value, ordinality)
) as cleaned
where guide.status = 'approved'
  and guide.steps::text ilike '%Fantasiedaten%';

-- Verification: repeated notices must not remain in approved guide steps.
do $$
begin
  if exists (
    select 1
    from public.dokohilf_guides
    where status = 'approved'
      and steps::text ilike '%Fantasiedaten%'
  ) then
    raise exception 'Approved guide steps still contain repeated Fantasiedaten notices.';
  end if;
end
$$;
