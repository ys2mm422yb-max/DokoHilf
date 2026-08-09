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

update public.dokohilf_guides
set steps = jsonb_build_array(jsonb_build_object(
      'text', '„Doku-Erweitert“ ist ein fester Hauptbereich ganz oben in der grünen Leiste. Wähle dort „Doku-Erweitert“. Danach erscheinen direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole.',
      'check', 'Ist „Doku-Erweitert“ geöffnet?',
      'stuck', 'Suche ganz oben in der festen grünen Leiste nach „Doku-Erweitert“. Die Unterpunkte erscheinen erst darunter, nachdem du „Doku-Erweitert“ ausgewählt hast.'
    )),
    updated_at = now(),
    change_note = 'Feste grüne Hauptleiste und darunter erscheinende Unterpunkte fachlich klargestellt.'
where slug = 'doku-erweitert-finden' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_build_array(jsonb_build_object(
      'text', '„Doku“ ist ein fester Hauptbereich ganz oben in der grünen Leiste. Wähle dort „Doku“. Danach erscheinen direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole.',
      'check', 'Ist „Doku“ geöffnet?',
      'stuck', 'Suche ganz oben in der festen grünen Leiste nach „Doku“. Die Unterpunkte erscheinen erst darunter, nachdem du „Doku“ ausgewählt hast.'
    )),
    updated_at = now(),
    change_note = 'Feste grüne Hauptleiste und darunter erscheinende Unterpunkte fachlich klargestellt.'
where slug = 'doku-finden' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_build_array(jsonb_build_object(
      'text', '„Analyse“ ist ein fester Hauptbereich ganz oben in der grünen Leiste. Wähle dort „Analyse“. Danach erscheinen direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole.',
      'check', 'Ist „Analyse“ geöffnet?',
      'stuck', 'Suche ganz oben in der festen grünen Leiste nach „Analyse“. Die Unterpunkte erscheinen erst darunter, nachdem du „Analyse“ ausgewählt hast.'
    )),
    updated_at = now(),
    change_note = 'Analyse als fester Hauptbereich in der grünen oberen Leiste fachlich klargestellt.'
where slug = 'analyse-finden' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_build_array(jsonb_build_object(
      'text', 'Beim geöffneten Bewohner findest du „Berichte“ ganz oben in der festen grünen Leiste. Wähle dort „Berichte“.',
      'check', 'Ist der Bereich „Berichte“ geöffnet?',
      'stuck', 'Bleibe beim geöffneten Bewohner und suche ganz oben in der festen grünen Leiste nach „Berichte“.'
    )),
    updated_at = now(),
    change_note = 'Position von Berichte in der festen grünen oberen Leiste sprachlich präzisiert.'
where slug = 'berichte-finden' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_build_array(jsonb_build_object(
      'text', 'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „Visiten“.',
      'check', 'Ist der Bereich „Visiten“ geöffnet?',
      'stuck', 'Ganz oben „Doku-Erweitert“ wählen; danach erscheint darunter „Visiten“.'
    )),
    updated_at = now(),
    change_note = 'Hierarchie Hauptbereich oben, Unterpunkt darunter fachlich klargestellt.'
where slug = 'visiten-finden' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_build_array(jsonb_build_object(
      'text', 'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „Vitalwerte“.',
      'check', 'Ist der Bereich „Vitalwerte“ geöffnet?',
      'stuck', 'Ganz oben „Doku-Erweitert“ wählen; danach erscheint darunter „Vitalwerte“.'
    )),
    updated_at = now(),
    change_note = 'Hierarchie Hauptbereich oben, Unterpunkt darunter fachlich klargestellt.'
where slug = 'vitalwerte-finden' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_build_array(jsonb_build_object(
      'text', 'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „An-/Abwesenheiten“.',
      'check', 'Ist der Bereich „An-/Abwesenheiten“ geöffnet?',
      'stuck', 'Ganz oben „Doku-Erweitert“ wählen; danach erscheint darunter „An-/Abwesenheiten“.'
    )),
    updated_at = now(),
    change_note = 'Hierarchie Hauptbereich oben, Unterpunkt darunter fachlich klargestellt.'
where slug = 'anwesenheiten-finden' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_build_array(jsonb_build_object(
      'text', 'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „Medikation“.',
      'check', 'Ist die Medikamentenübersicht geöffnet?',
      'stuck', 'Ganz oben „Doku-Erweitert“ wählen; danach erscheint darunter „Medikation“.''
    )),
    updated_at = now(),
    change_note = 'Hierarchie Hauptbereich oben, Unterpunkt darunter fachlich klargestellt.'
where slug = 'medikation-finden' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_build_array(jsonb_build_object(
      'text', 'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „Formulare“.',
      'check', 'Ist der Bereich „Formulare“ geöffnet?',
      'stuck', 'Ganz oben „Doku-Erweitert“ wählen; danach erscheint darunter „Formulare“.''
    )),
    updated_at = now(),
    change_note = 'Hierarchie Hauptbereich oben, Unterpunkt darunter fachlich klargestellt.'
where slug = 'formulare-finden' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_build_array(jsonb_build_object(
      'text', 'Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „Durchführungsnachweis“.',
      'check', 'Ist der Durchführungsnachweis geöffnet?',
      'stuck', 'Ganz oben „Doku“ wählen; danach erscheint darunter „Durchführungsnachweis“.''
    )),
    updated_at = now(),
    change_note = 'Hierarchie Hauptbereich oben, Unterpunkt darunter fachlich klargestellt.'
where slug = 'durchfuehrungsnachweis-finden' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_build_array(jsonb_build_object(
      'text', 'Wähle ganz oben in der festen grünen Leiste „Analyse“. Danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole. Wähle dort „Was war los?“. Darüber öffnest du die Übergabeansicht.',
      'check', 'Ist „Was war los?“ geöffnet?',
      'stuck', 'Ganz oben „Analyse“ wählen; danach erscheint darunter „Was war los?“.''
    )),
    updated_at = now(),
    change_note = 'Analyse oben und Was war los darunter fachlich klargestellt.'
where slug = 'uebergabe-finden' and status = 'approved';

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
