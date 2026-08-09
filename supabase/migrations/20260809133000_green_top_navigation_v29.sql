-- v29: clarify the confirmed Vivendi navigation hierarchy.
-- Product confirmation 2026-08-09:
-- - Doku-Erweitert, Doku, Planung and Analyse are fixed main areas at the very top in the green bar.
-- - After selecting a main area, its related sub-items/icons appear directly below.
-- - Existing confirmed Berichte location remains in the fixed top bar.
-- - Only the location of Planung is confirmed here; Easy-Plan workflows remain unconfirmed/draft.

insert into public.dokohilf_guides
  (slug, title, aliases, steps, troubleshooting, status, reviewed_at, reviewed_role, approved_at, change_note)
values (
  'planung-finden',
  'Planung finden',
  array['wo ist planung', 'wo finde ich planung', 'ich finde planung nicht', 'planung finden', 'wie komme ich zu planung'],
  jsonb_build_array(jsonb_build_object(
    'text', '„Planung“ ist ein fester Hauptbereich ganz oben in der grünen Leiste. Wähle dort „Planung“. Danach erscheinen direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole.',
    'check', 'Ist „Planung“ geöffnet?',
    'stuck', 'Suche ganz oben in der festen grünen Leiste nach „Planung“. Die Unterpunkte erscheinen erst darunter, nachdem du „Planung“ ausgewählt hast.'
  )),
  '{}'::jsonb,
  'approved',
  now(),
  'product-confirmed',
  now(),
  'Nur die bestätigte Position von Planung in der festen grünen Hauptleiste; Easy-Plan bleibt fachlich später.'
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
      from unnest(coalesce(approved_guide_slugs, '{}'::text[]) || array['planung-finden']) as value
    ),
    updated_at = now()
where slug = 'easyplan';

with navigation(slug, step_text, check_text, stuck_text, note) as (
  values
    (
      'doku-erweitert-finden',
      '„Doku-Erweitert“ ist ein fester Hauptbereich ganz oben in der grünen Leiste. Wähle dort „Doku-Erweitert“. Danach erscheinen direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole.',
      'Ist „Doku-Erweitert“ geöffnet?',
      'Suche ganz oben in der festen grünen Leiste nach „Doku-Erweitert“. Die Unterpunkte erscheinen erst darunter, nachdem du „Doku-Erweitert“ ausgewählt hast.',
      'Feste grüne Hauptleiste und darunter erscheinende Unterpunkte fachlich klargestellt.'
    ),
    (
      'doku-finden',
      '„Doku“ ist ein fester Hauptbereich ganz oben in der grünen Leiste. Wähle dort „Doku“. Danach erscheinen direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole.',
      'Ist „Doku“ geöffnet?',
      'Suche ganz oben in der festen grünen Leiste nach „Doku“. Die Unterpunkte erscheinen erst darunter, nachdem du „Doku“ ausgewählt hast.',
      'Feste grüne Hauptleiste und darunter erscheinende Unterpunkte fachlich klargestellt.'
    ),
    (
      'analyse-finden',
      '„Analyse“ ist ein fester Hauptbereich ganz oben in der grünen Leiste. Wähle dort „Analyse“. Danach erscheinen direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole.',
      'Ist „Analyse“ geöffnet?',
      'Suche ganz oben in der festen grünen Leiste nach „Analyse“. Die Unterpunkte erscheinen erst darunter, nachdem du „Analyse“ ausgewählt hast.',
      'Analyse als fester Hauptbereich in der grünen oberen Leiste fachlich klargestellt.'
    ),
    (
      'berichte-finden',
      'Beim geöffneten Bewohner findest du „Berichte“ ganz oben in der festen grünen Leiste. Wähle dort „Berichte“.',
      'Ist der Bereich „Berichte“ geöffnet?',
      'Bleibe beim geöffneten Bewohner und suche ganz oben in der festen grünen Leiste nach „Berichte“.',
      'Position von Berichte in der festen grünen oberen Leiste sprachlich präzisiert.'
    ),
    (
      'visiten-finden',
      'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „Visiten“.',
      'Ist der Bereich „Visiten“ geöffnet?',
      'Ganz oben „Doku-Erweitert“ wählen; danach erscheint darunter „Visiten“.',
      'Hierarchie Hauptbereich oben, Unterpunkt darunter fachlich klargestellt.'
    ),
    (
      'vitalwerte-finden',
      'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „Vitalwerte“.',
      'Ist der Bereich „Vitalwerte“ geöffnet?',
      'Ganz oben „Doku-Erweitert“ wählen; danach erscheint darunter „Vitalwerte“.',
      'Hierarchie Hauptbereich oben, Unterpunkt darunter fachlich klargestellt.'
    ),
    (
      'anwesenheiten-finden',
      'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „An-/Abwesenheiten“.',
      'Ist der Bereich „An-/Abwesenheiten“ geöffnet?',
      'Ganz oben „Doku-Erweitert“ wählen; danach erscheint darunter „An-/Abwesenheiten“.',
      'Hierarchie Hauptbereich oben, Unterpunkt darunter fachlich klargestellt.'
    ),
    (
      'medikation-finden',
      'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „Medikation“.',
      'Ist die Medikamentenübersicht geöffnet?',
      'Ganz oben „Doku-Erweitert“ wählen; danach erscheint darunter „Medikation“.',
      'Hierarchie Hauptbereich oben, Unterpunkt darunter fachlich klargestellt.'
    ),
    (
      'formulare-finden',
      'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „Formulare“.',
      'Ist der Bereich „Formulare“ geöffnet?',
      'Ganz oben „Doku-Erweitert“ wählen; danach erscheint darunter „Formulare“.',
      'Hierarchie Hauptbereich oben, Unterpunkt darunter fachlich klargestellt.'
    ),
    (
      'durchfuehrungsnachweis-finden',
      'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „Durchführungsnachweis“.',
      'Ist der Durchführungsnachweis geöffnet?',
      'Ganz oben „Doku“ wählen; danach erscheint darunter „Durchführungsnachweis“.',
      'Hierarchie Hauptbereich oben, Unterpunkt darunter fachlich klargestellt.'
    ),
    (
      'uebergabe-finden',
      'Wähle ganz oben in der festen grünen Leiste „Analyse“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „Was war los?“. Darüber öffnest du die Übergabeansicht.',
      'Ist „Was war los?“ geöffnet?',
      'Ganz oben „Analyse“ wählen; danach erscheint darunter „Was war los?“.',
      'Analyse oben und Was war los darunter fachlich klargestellt.'
    )
)
update public.dokohilf_guides as guide
set steps = jsonb_build_array(jsonb_build_object(
      'text', navigation.step_text,
      'check', navigation.check_text,
      'stuck', navigation.stuck_text
    )),
    updated_at = now(),
    change_note = navigation.note
from navigation
where guide.slug = navigation.slug
  and guide.status = 'approved';

-- Contextual help inside active guides uses the same hierarchy.
update public.dokohilf_guides
set steps = jsonb_set(steps, '{0,stuck}', to_jsonb('„Doku-Erweitert“ ist ganz oben in der festen grünen Leiste. Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole. Wähle dort „Visiten“.'::text), true),
    updated_at = now()
where slug = 'visite-anlegen' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(steps, '{1,stuck}', to_jsonb('„Doku-Erweitert“ ist ganz oben in der festen grünen Leiste. Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole. Wähle dort „An-/Abwesenheiten“.'::text), true),
    updated_at = now()
where slug = 'anwesenheit' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(steps, '{1,stuck}', to_jsonb('„Doku-Erweitert“ ist ganz oben in der festen grünen Leiste. Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole. Wähle dort „Medikation“.'::text), true),
    updated_at = now()
where slug = 'medikation-ansehen' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(steps, '{1,stuck}', to_jsonb('„Doku-Erweitert“ ist ganz oben in der festen grünen Leiste. Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole. Wähle dort „Formulare“.'::text), true),
    updated_at = now()
where slug = 'formulare-anlegen' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(steps, '{1,stuck}', to_jsonb('„Doku-Erweitert“ ist ganz oben in der festen grünen Leiste. Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole. Wähle dort „Vitalwerte“.'::text), true),
    updated_at = now()
where slug = 'vitalwerte-einzelwert' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(steps, '{1,stuck}', to_jsonb('„Doku-Erweitert“ ist ganz oben in der festen grünen Leiste. Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole. „Vitalwerte“ und „Vitalwerte Sammelerf.“ sind zwei getrennte Einträge; wähle für mehrere Werte „Vitalwerte Sammelerf.“.'::text), true),
    updated_at = now()
where slug = 'vitalwerte-sammelerfassung' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(steps, '{0,stuck}', to_jsonb('„Doku“ ist ganz oben in der festen grünen Leiste. Wähle dort „Doku“; danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole.'::text), true),
      '{1,stuck}', to_jsonb('Wähle ganz oben in der festen grünen Leiste zuerst „Doku“. Danach erscheint darunter „Durchführungsnachweis“.'::text), true
    ),
    updated_at = now()
where slug = 'durchfuehrung-storno' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(steps, '{0,stuck}', to_jsonb('„Analyse“ ist ganz oben in der festen grünen Leiste. Wähle dort „Analyse“; danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole.'::text), true),
      '{1,stuck}', to_jsonb('Wähle ganz oben in der festen grünen Leiste zuerst „Analyse“. Danach erscheint darunter „Was war los?“.'::text), true
    ),
    updated_at = now()
where slug = 'uebergabeformular' and status = 'approved';
