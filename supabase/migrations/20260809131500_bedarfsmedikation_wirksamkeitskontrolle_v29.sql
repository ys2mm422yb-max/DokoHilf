-- v29: product-confirmed workflow for the automatic efficacy check after PRN medication.
-- Product confirmation 2026-08-09:
-- - After a Bedarfsmedikation, the system automatically creates a Wirksamkeitskontrolle.
-- - The control becomes due after the configured/intended interval; DokoHilf must not invent a concrete duration.
-- - The due control is completed in Doku -> Durchführungsnachweis.
-- - The user marks the control as completed and documents whether/how the medication helped.
-- - The final pop-up is always confirmed at the bottom with OK.

insert into public.dokohilf_guides
  (slug, title, aliases, steps, troubleshooting, status, reviewed_at, reviewed_role, approved_at, change_note)
values (
  'bedarfsmedikation-wirksamkeitskontrolle',
  'Wirksamkeitskontrolle nach Bedarfsmedikation',
  array[
    'wirksamkeitskontrolle',
    'wirksamkeitskontrolle bedarfsmedikation',
    'bedarfsmedikation kontrollieren',
    'bedarfsmedikation wirkung dokumentieren',
    'bedarfsmedikament hat geholfen',
    'wirkung von bedarfsmedikation',
    'wo muss ich die wirksamkeitskontrolle abhaken',
    'bedarfsmedikation abhaken'
  ],
  jsonb_build_array(
    jsonb_build_object(
      'text', 'Nach einer Bedarfsmedikation legt das System die zugehörige Wirksamkeitskontrolle automatisch an. Du musst dafür keine neue Kontrolle selbst erstellen.',
      'check', 'Ist klar, dass die Wirksamkeitskontrolle automatisch angelegt wird?',
      'stuck', 'Die Wirksamkeitskontrolle wird nach der Bedarfsmedikation automatisch vom System erzeugt.'
    ),
    jsonb_build_object(
      'text', 'Sobald die Wirksamkeitskontrolle zum vorgesehenen Zeitpunkt fällig ist, öffne beim gewünschten Bewohner „Doku“ und danach „Durchführungsnachweis“.',
      'check', 'Ist der Durchführungsnachweis geöffnet?',
      'stuck', 'Beim geöffneten Bewohner zuerst „Doku“ in der festen Leiste öffnen und darin „Durchführungsnachweis“ wählen.'
    ),
    jsonb_build_object(
      'text', 'Suche im Durchführungsnachweis die automatisch angelegte Wirksamkeitskontrolle zur Bedarfsmedikation und öffne sie.',
      'check', 'Ist die passende Wirksamkeitskontrolle geöffnet?',
      'stuck', 'Suche nach der fälligen Wirksamkeitskontrolle, die automatisch zur Bedarfsmedikation angelegt wurde.'
    ),
    jsonb_build_object(
      'text', 'Hake die Wirksamkeitskontrolle als durchgeführt ab.',
      'check', 'Ist die Wirksamkeitskontrolle als durchgeführt markiert?'
    ),
    jsonb_build_object(
      'text', 'Im geöffneten Pop-up dokumentierst du kurz, ob und wie die Bedarfsmedikation gewirkt beziehungsweise geholfen hat.',
      'check', 'Ist die Wirkung beziehungsweise das Ergebnis kurz beschrieben?'
    ),
    jsonb_build_object(
      'text', 'Bestätige das Pop-up zum Schluss unten mit „OK“. Damit ist die Wirksamkeitskontrolle abgeschlossen.',
      'check', 'Wurde das Pop-up mit „OK“ bestätigt?'
    )
  ),
  '{}'::jsonb,
  'approved',
  now(),
  'product-confirmed',
  now(),
  'Automatisch erzeugte Wirksamkeitskontrolle nach Bedarfsmedikation inklusive Abschluss-Pop-up mit OK fachlich bestätigt.'
)
on conflict (slug) do update
set title = excluded.title,
    aliases = excluded.aliases,
    steps = excluded.steps,
    troubleshooting = excluded.troubleshooting,
    status = excluded.status,
    reviewed_at = excluded.reviewed_at,
    reviewed_role = excluded.reviewed_role,
    approved_at = excluded.approved_at,
    updated_at = now(),
    change_note = excluded.change_note;

update public.dokohilf_topics
set approved_guide_slugs = (
      select array_agg(distinct value order by value)
      from unnest(coalesce(approved_guide_slugs, '{}'::text[]) || array['bedarfsmedikation-wirksamkeitskontrolle']) as value
    ),
    updated_at = now()
where slug in ('durchfuehrungsnachweis', 'medikation');
