-- v29: product-confirmed navigation hierarchy.
-- Doku, Doku-Erweitert, Planung and Analyse are fixed in the green top bar.
-- After selecting a top-level area, its related icons/functions appear directly below.
-- Berichte remains a confirmed fixed top-level area.

update public.dokohilf_guides
set steps = '[{"text":"Schau ganz oben in die feste grüne Hauptleiste. Dort findest du „Doku-Erweitert“. Öffne „Doku-Erweitert“.","check":"Ist „Doku-Erweitert“ geöffnet?","stuck":"„Doku-Erweitert“ steht ganz oben in der festen grünen Hauptleiste. Dort befinden sich auch „Doku“, „Planung“ und „Analyse“."}]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Feste grüne Hauptleiste und zweistufige Navigation ergänzt.'
where slug = 'doku-erweitert-finden' and status = 'approved';

update public.dokohilf_guides
set steps = '[{"text":"Schau ganz oben in die feste grüne Hauptleiste. Dort findest du „Doku“. Öffne „Doku“.","check":"Ist „Doku“ geöffnet?","stuck":"„Doku“ steht ganz oben in der festen grünen Hauptleiste. Dort befinden sich auch „Doku-Erweitert“, „Planung“ und „Analyse“."}]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Feste grüne Hauptleiste und zweistufige Navigation ergänzt.'
where slug = 'doku-finden' and status = 'approved';

update public.dokohilf_guides
set steps = '[{"text":"Schau ganz oben in die feste grüne Hauptleiste und öffne „Analyse“. Direkt darunter erscheinen die zu „Analyse“ gehörenden Funktionen.","check":"Ist „Analyse“ geöffnet?","stuck":"„Analyse“ steht ganz oben in der festen grünen Hauptleiste. Dort befinden sich auch „Doku“, „Doku-Erweitert“ und „Planung“."}]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Analyse als fester Hauptbereich der grünen Leiste präzisiert.'
where slug = 'analyse-finden' and status = 'approved';

update public.dokohilf_guides
set steps = '[{"text":"Beim geöffneten Bewohner findest du „Berichte“ ganz oben in der festen grünen Leiste. Wähle dort „Berichte“.","check":"Ist der Bereich „Berichte“ geöffnet?","stuck":"Bleibe beim geöffneten Bewohner und suche ganz oben in der festen grünen Leiste nach „Berichte“."}]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Berichte als fester Hauptbereich der grünen Leiste präzisiert.'
where slug = 'berichte-finden' and status = 'approved';

update public.dokohilf_guides
set steps = '[{"text":"Schau ganz oben in die feste grüne Hauptleiste und öffne „Doku“. Direkt darunter erscheinen die zu „Doku“ gehörenden Funktionen. Wähle dort „Durchführungsnachweis“.","check":"Ist der Durchführungsnachweis geöffnet?","stuck":"Zuerst ganz oben in der grünen Hauptleiste „Doku“ öffnen. Direkt darunter findest du „Durchführungsnachweis“."}]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Durchführungsnachweis mit grüner Hauptleiste und zweiter Ebene erklärt.'
where slug = 'durchfuehrungsnachweis-finden' and status = 'approved';

update public.dokohilf_guides
set steps = '[{"text":"Schau ganz oben in die feste grüne Hauptleiste und öffne „Doku-Erweitert“. Direkt darunter erscheinen die zu „Doku-Erweitert“ gehörenden Symbole. Wähle dort „Vitalwerte“.","check":"Ist der Bereich „Vitalwerte“ geöffnet?","stuck":"Zuerst ganz oben in der grünen Hauptleiste „Doku-Erweitert“ öffnen. Direkt darunter findest du das Symbol beziehungsweise den Bereich „Vitalwerte“."}]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Vitalwerte mit grüner Hauptleiste und zweiter Symbol-Ebene erklärt.'
where slug = 'vitalwerte-finden' and status = 'approved';

update public.dokohilf_guides
set steps = '[{"text":"Schau ganz oben in die feste grüne Hauptleiste und öffne „Doku-Erweitert“. Direkt darunter erscheinen die zu „Doku-Erweitert“ gehörenden Symbole. Wähle dort „Visiten“.","check":"Ist der Bereich „Visiten“ geöffnet?","stuck":"Zuerst ganz oben in der grünen Hauptleiste „Doku-Erweitert“ öffnen. Direkt darunter findest du „Visiten“."}]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Visiten mit grüner Hauptleiste und zweiter Symbol-Ebene erklärt.'
where slug = 'visiten-finden' and status = 'approved';

update public.dokohilf_guides
set steps = '[{"text":"Schau ganz oben in die feste grüne Hauptleiste und öffne „Doku-Erweitert“. Direkt darunter erscheinen die zu „Doku-Erweitert“ gehörenden Symbole. Wähle dort „Medikation“.","check":"Ist die Medikamentenübersicht geöffnet?","stuck":"Zuerst ganz oben in der grünen Hauptleiste „Doku-Erweitert“ öffnen. Direkt darunter findest du „Medikation“."}]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Medikation mit grüner Hauptleiste und zweiter Symbol-Ebene erklärt.'
where slug = 'medikation-finden' and status = 'approved';

update public.dokohilf_guides
set steps = '[{"text":"Schau ganz oben in die feste grüne Hauptleiste und öffne „Doku-Erweitert“. Direkt darunter erscheinen die zu „Doku-Erweitert“ gehörenden Symbole. Wähle dort „Formulare“.","check":"Ist der Bereich „Formulare“ geöffnet?","stuck":"Zuerst ganz oben in der grünen Hauptleiste „Doku-Erweitert“ öffnen. Direkt darunter findest du „Formulare“."}]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Formulare mit grüner Hauptleiste und zweiter Symbol-Ebene erklärt.'
where slug = 'formulare-finden' and status = 'approved';

update public.dokohilf_guides
set steps = '[{"text":"Schau ganz oben in die feste grüne Hauptleiste und öffne „Doku-Erweitert“. Direkt darunter erscheinen die zu „Doku-Erweitert“ gehörenden Symbole. Wähle dort „An-/Abwesenheiten“.","check":"Ist der Bereich „An-/Abwesenheiten“ geöffnet?","stuck":"Zuerst ganz oben in der grünen Hauptleiste „Doku-Erweitert“ öffnen. Direkt darunter findest du „An-/Abwesenheiten“."}]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'An-/Abwesenheiten mit grüner Hauptleiste und zweiter Symbol-Ebene erklärt.'
where slug = 'anwesenheiten-finden' and status = 'approved';

update public.dokohilf_guides
set steps = '[{"text":"Schau ganz oben in die feste grüne Hauptleiste und öffne „Analyse“. Direkt darunter erscheinen die zu „Analyse“ gehörenden Funktionen. Wähle dort „Was war los?“, um die Übergabeansicht zu öffnen.","check":"Ist „Was war los?“ geöffnet?","stuck":"Zuerst ganz oben in der grünen Hauptleiste „Analyse“ öffnen. Direkt darunter findest du „Was war los?“."}]'::jsonb,
    version = version + 1,
    reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'Übergabe mit grüner Hauptleiste und zweiter Ebene erklärt.'
where slug = 'uebergabe-finden' and status = 'approved';

insert into public.dokohilf_guides (
  id, slug, title, aliases, steps, troubleshooting, status, version,
  reviewed_at, reviewed_role, created_at, updated_at,
  review_interval_days, review_due_at, approved_at, change_note
)
values (
  gen_random_uuid(),
  'planung-finden',
  'Planung finden',
  array['planung finden','wo ist planung','wo finde ich planung','ich finde planung nicht','wie komme ich zu planung'],
  '[{"text":"„Planung“ findest du ganz oben in der festen grünen Hauptleiste. Öffne dort „Planung“. Danach erscheinen direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole.","check":"Ist „Planung“ geöffnet?","stuck":"Suche ganz oben in der festen grünen Hauptleiste nach „Planung“. Dort befinden sich auch „Doku“, „Doku-Erweitert“ und „Analyse“."}]'::jsonb,
  '{"abgrenzung":"Der Hauptbereich Planung ist bestätigt. Der genaue Easy-Plan-Ablauf bleibt fachlich offen und wird nicht erfunden."}'::jsonb,
  'approved', 1, now(), 'product-confirmed', now(), now(), 180, now() + interval '180 days', now(),
  'Planung als fester Hauptbereich der grünen Leiste bestätigt.'
)
on conflict (slug) do update set
  title = excluded.title,
  aliases = excluded.aliases,
  steps = excluded.steps,
  troubleshooting = excluded.troubleshooting,
  status = excluded.status,
  version = public.dokohilf_guides.version + 1,
  reviewed_at = excluded.reviewed_at,
  reviewed_role = excluded.reviewed_role,
  updated_at = excluded.updated_at,
  review_interval_days = excluded.review_interval_days,
  review_due_at = excluded.review_due_at,
  approved_at = excluded.approved_at,
  change_note = excluded.change_note;

-- Contextual help inside active guides uses the same confirmed hierarchy.
update public.dokohilf_guides
set steps = jsonb_set(steps, '{0,stuck}', to_jsonb('„Doku-Erweitert“ ist ganz oben in der festen grünen Leiste. Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole. Wähle dort „Visiten“.'::text), true),
    version = version + 1, reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(), review_due_at = now() + interval '180 days'
where slug = 'visite-anlegen' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(steps, '{1,stuck}', to_jsonb('„Doku-Erweitert“ ist ganz oben in der festen grünen Leiste. Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole. Wähle dort „An-/Abwesenheiten“.'::text), true),
    version = version + 1, reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(), review_due_at = now() + interval '180 days'
where slug = 'anwesenheit' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(steps, '{1,stuck}', to_jsonb('„Doku-Erweitert“ ist ganz oben in der festen grünen Leiste. Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole. Wähle dort „Medikation“.'::text), true),
    version = version + 1, reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(), review_due_at = now() + interval '180 days'
where slug = 'medikation-ansehen' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(steps, '{1,stuck}', to_jsonb('„Doku-Erweitert“ ist ganz oben in der festen grünen Leiste. Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole. Wähle dort „Formulare“.'::text), true),
    version = version + 1, reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(), review_due_at = now() + interval '180 days'
where slug = 'formulare-anlegen' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(steps, '{1,stuck}', to_jsonb('„Doku-Erweitert“ ist ganz oben in der festen grünen Leiste. Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole. Wähle dort „Vitalwerte“.'::text), true),
    version = version + 1, reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(), review_due_at = now() + interval '180 days'
where slug = 'vitalwerte-einzelwert' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(steps, '{1,stuck}', to_jsonb('„Doku-Erweitert“ ist ganz oben in der festen grünen Leiste. Wähle es dort; danach erscheinen darunter die Unterpunkte beziehungsweise Symbole. „Vitalwerte“ und „Vitalwerte Sammelerf.“ sind zwei getrennte Einträge; wähle für mehrere Werte „Vitalwerte Sammelerf.“.'::text), true),
    version = version + 1, reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(), review_due_at = now() + interval '180 days'
where slug = 'vitalwerte-sammelerfassung' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(steps, '{0,stuck}', to_jsonb('„Doku“ ist ganz oben in der festen grünen Leiste. Wähle dort „Doku“; danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole.'::text), true),
      '{1,stuck}', to_jsonb('Wähle ganz oben in der festen grünen Leiste zuerst „Doku“. Danach erscheint darunter „Durchführungsnachweis“.'::text), true
    ),
    version = version + 1, reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(), review_due_at = now() + interval '180 days'
where slug = 'durchfuehrung-storno' and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(steps, '{0,stuck}', to_jsonb('„Analyse“ ist ganz oben in der festen grünen Leiste. Wähle dort „Analyse“; danach erscheinen darunter die zugehörigen Unterpunkte beziehungsweise Symbole.'::text), true),
      '{1,stuck}', to_jsonb('Wähle ganz oben in der festen grünen Leiste zuerst „Analyse“. Danach erscheint darunter „Was war los?“.'::text), true
    ),
    version = version + 1, reviewed_at = now(), reviewed_role = 'product-confirmed', updated_at = now(), approved_at = now(), review_due_at = now() + interval '180 days'
where slug = 'uebergabeformular' and status = 'approved';

update public.dokohilf_topics
set approved_guide_slugs = (
      select array_agg(distinct value order by value)
      from unnest(coalesce(approved_guide_slugs, '{}'::text[]) || array['planung-finden']) as value
    ),
    updated_at = now()
where slug = 'easyplan';
