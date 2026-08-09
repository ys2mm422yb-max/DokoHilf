-- v29 product-confirmed follow-up for Bedarfsmedikation.
-- Product confirmation 2026-08-09:
-- - After a Bedarfsmedikation, Vivendi automatically creates a Wirksamkeitskontrolle.
-- - It becomes due after the time configured by the system; DokoHilf must not invent a duration.
-- - The due control is completed in Doku -> Durchführungsnachweis.
-- - The user records whether the Bedarfsmedikation worked/helped.
-- - The final pop-up at the bottom is always confirmed with OK.

insert into public.dokohilf_guides
  (slug, title, aliases, steps, troubleshooting, status, reviewed_at, reviewed_role, approved_at, change_note)
values (
  'bedarfsmedikation-wirksamkeitskontrolle',
  'Wirksamkeit nach Bedarfsmedikation dokumentieren',
  array[
    'wirksamkeitskontrolle',
    'wirkungskontrolle',
    'wirksamkeit nach bedarfsmedikation',
    'nach bedarfsmedikation',
    'bedarfsmedikation hat gewirkt',
    'bedarfsmedikation hat geholfen',
    'wirksamkeitskontrolle abhaken',
    'wirksamkeitskontrolle im durchführungsnachweis'
  ],
  jsonb_build_array(
    jsonb_build_object(
      'text', 'Nach der Gabe einer Bedarfsmedikation legt Vivendi automatisch eine Wirksamkeitskontrolle an. Sie wird nach der im System vorgesehenen Zeit fällig.',
      'check', 'Ist die automatisch angelegte Wirksamkeitskontrolle inzwischen fällig?',
      'stuck', 'Die Wirksamkeitskontrolle wird automatisch angelegt. Warte bis zu dem im System vorgesehenen Zeitpunkt; DokoHilf nennt dafür keine erfundene Zeitangabe.'
    ),
    jsonb_build_object(
      'text', 'Wenn die Wirksamkeitskontrolle fällig ist, öffne beim gewünschten Bewohner „Doku“ und danach „Durchführungsnachweis“ und suche den automatisch angelegten Eintrag.',
      'check', 'Hast du die Wirksamkeitskontrolle zur Bedarfsmedikation im Durchführungsnachweis gefunden?',
      'stuck', '„Doku“ findest du beim geöffneten Bewohner in der festen Leiste. Öffne dort „Doku“ und danach „Durchführungsnachweis“.'
    ),
    jsonb_build_object(
      'text', 'Hake die Wirksamkeitskontrolle als durchgeführt ab und beschreibe kurz, ob die Bedarfsmedikation gewirkt beziehungsweise geholfen hat.',
      'check', 'Ist die Wirksamkeitskontrolle abgehakt und die Wirkung beschrieben?'
    ),
    jsonb_build_object(
      'text', 'Zum Abschluss erscheint unten ein Pop-up-Fenster. Bestätige es immer mit „OK“.',
      'check', 'Hast du das abschließende Pop-up mit „OK“ bestätigt?'
    )
  ),
  '{}'::jsonb,
  'approved',
  now(),
  'product-confirmed',
  now(),
  'Wirksamkeitskontrolle nach Bedarfsmedikation inklusive automatischer Anlage, Durchführungsnachweis, Wirkungsdokumentation und abschließendem OK bestätigt.'
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
set approved_guide_slugs = case
      when 'bedarfsmedikation-wirksamkeitskontrolle' = any(coalesce(approved_guide_slugs, '{}'::text[]))
        then coalesce(approved_guide_slugs, '{}'::text[])
      else array_append(coalesce(approved_guide_slugs, '{}'::text[]), 'bedarfsmedikation-wirksamkeitskontrolle')
    end,
    updated_at = now()
where slug in ('medikation', 'durchfuehrungsnachweis');
