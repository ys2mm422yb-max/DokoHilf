-- v29 follow-up: defer unfinished library entries, clarify Stammdaten entry,
-- and add deterministic navigation help for confirmed areas.
-- Product confirmation 2026-08-09:
-- - Aufgaben · Aktuelles and Easy-Plan come later and must not be treated as approved guides.
-- - Stammdaten are reached from the left resident overview while Berichte or Durchführungsnachweis is open.
-- - "Wo ist / ich finde ... nicht" should explain the confirmed location for every approved area.

update public.dokohilf_guides
set status = 'draft',
    approved_at = null,
    updated_at = now(),
    change_note = 'Kommt fachlich später; bis zur erneuten Freigabe nicht als fertige Anleitung verwenden.'
where slug in ('aufgaben-aktuelles', 'easyplan')
  and status = 'approved';

update public.dokohilf_topics
set approved_guide_slugs = array_remove(
      array_remove(coalesce(approved_guide_slugs, '{}'::text[]), 'aufgaben-aktuelles'),
      'easyplan'
    ),
    unconfirmed_actions = (
      select array_agg(distinct value order by value)
      from unnest(
        coalesce(unconfirmed_actions, '{}'::text[]) ||
        array['Aufgaben · Aktuelles fachlich später freigeben', 'Easy-Plan fachlich später freigeben']
      ) as value
    ),
    updated_at = now()
where 'aufgaben-aktuelles' = any(coalesce(approved_guide_slugs, '{}'::text[]))
   or 'easyplan' = any(coalesce(approved_guide_slugs, '{}'::text[]));

update public.dokohilf_guides
set steps = jsonb_build_array(
      jsonb_build_object(
        'text', 'Öffne zuerst den Bereich „Berichte“ oder „Durchführungsnachweis“. Wenn du den Durchführungsnachweis nutzt, gehst du über „Doku“ → „Durchführungsnachweis“.',
        'check', 'Bist du in „Berichte“ oder „Durchführungsnachweis“?',
        'stuck', 'Wenn du den Durchführungsnachweis öffnen möchtest: „Doku“ → „Durchführungsnachweis“.'
      ),
      jsonb_build_object(
        'text', 'Solange du in einem dieser beiden Bereiche bist, siehst du links die Bewohnerübersicht.',
        'check', 'Siehst du links die Bewohnerübersicht?',
        'stuck', 'Bleibe in „Berichte“ oder „Durchführungsnachweis“; dort bleibt die Bewohnerübersicht links sichtbar.'
      ),
      jsonb_build_object(
        'text', 'Doppelklicke in der Bewohnerübersicht auf den gewünschten Bewohner.',
        'check', 'Haben sich die Stammdaten geöffnet?',
        'stuck', 'Führe auf dem gewünschten Bewohner einen schnellen Doppelklick mit der linken Maustaste aus.'
      )
    ),
    updated_at = now(),
    change_note = 'Einstieg in die linke Bewohnerübersicht über Berichte oder Durchführungsnachweis fachlich ergänzt.'
where slug = 'stammdaten'
  and status = 'approved';

insert into public.dokohilf_guides
  (slug, title, aliases, steps, troubleshooting, status, reviewed_at, reviewed_role, approved_at, change_note)
values
  (
    'berichte-finden',
    'Berichte finden',
    array['wo ist berichte', 'wo finde ich berichte', 'ich finde berichte nicht', 'berichte finden', 'wie komme ich zu berichte'],
    jsonb_build_array(jsonb_build_object(
      'text', 'Beim geöffneten Bewohner findest du „Berichte“ in der festen Leiste. Wähle dort „Berichte“.',
      'check', 'Ist der Bereich „Berichte“ geöffnet?',
      'stuck', 'Bleibe beim geöffneten Bewohner und suche in der festen Leiste nach „Berichte“.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für den Bereich Berichte.'
  ),
  (
    'doku-erweitert-finden',
    'Doku-Erweitert finden',
    array['wo ist doku erweitert', 'wo finde ich doku erweitert', 'ich finde doku erweitert nicht', 'doku erweitert finden'],
    jsonb_build_array(jsonb_build_object(
      'text', '„Doku-Erweitert“ findest du beim geöffneten Bewohner in der festen Leiste. Wähle dort „Doku-Erweitert“.',
      'check', 'Ist „Doku-Erweitert“ geöffnet?',
      'stuck', 'Suche beim geöffneten Bewohner in der festen Leiste nach „Doku-Erweitert“.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für Doku-Erweitert.'
  ),
  (
    'doku-finden',
    'Doku finden',
    array['wo ist doku', 'wo finde ich doku', 'ich finde doku nicht', 'doku finden'],
    jsonb_build_array(jsonb_build_object(
      'text', '„Doku“ findest du beim geöffneten Bewohner in der festen Leiste. Wähle dort „Doku“.',
      'check', 'Ist „Doku“ geöffnet?',
      'stuck', 'Suche beim geöffneten Bewohner in der festen Leiste nach „Doku“.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für Doku.'
  ),
  (
    'visiten-finden',
    'Visiten finden',
    array['wo ist visiten', 'wo finde ich visiten', 'ich finde visiten nicht', 'visiten finden'],
    jsonb_build_array(jsonb_build_object(
      'text', 'Öffne beim gewünschten Bewohner „Doku-Erweitert“ in der festen Leiste und wähle dort „Visiten“.',
      'check', 'Ist der Bereich „Visiten“ geöffnet?',
      'stuck', 'Erst „Doku-Erweitert“ in der festen Leiste öffnen, danach darin „Visiten“ wählen.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für Visiten.'
  ),
  (
    'vitalwerte-finden',
    'Vitalwerte finden',
    array['wo ist vitalwerte', 'wo finde ich vitalwerte', 'ich finde vitalwerte nicht', 'vitalwerte finden'],
    jsonb_build_array(jsonb_build_object(
      'text', 'Öffne beim gewünschten Bewohner „Doku-Erweitert“ in der festen Leiste und wähle dort „Vitalwerte“.',
      'check', 'Ist der Bereich „Vitalwerte“ geöffnet?',
      'stuck', 'Erst „Doku-Erweitert“ in der festen Leiste öffnen, danach darin „Vitalwerte“ wählen.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für Vitalwerte.'
  ),
  (
    'anwesenheiten-finden',
    'An-/Abwesenheiten finden',
    array['wo ist anwesenheit', 'wo ist abwesenheit', 'wo finde ich anwesenheit', 'ich finde anwesenheit nicht', 'an abwesenheiten finden'],
    jsonb_build_array(jsonb_build_object(
      'text', 'Öffne beim gewünschten Bewohner „Doku-Erweitert“ in der festen Leiste und wähle dort „An-/Abwesenheiten“.',
      'check', 'Ist der Bereich „An-/Abwesenheiten“ geöffnet?',
      'stuck', 'Erst „Doku-Erweitert“ in der festen Leiste öffnen, danach darin „An-/Abwesenheiten“ wählen.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für An-/Abwesenheiten.'
  ),
  (
    'medikation-finden',
    'Medikation finden',
    array['wo ist medikation', 'wo finde ich medikation', 'ich finde medikation nicht', 'medikation finden'],
    jsonb_build_array(jsonb_build_object(
      'text', 'Öffne beim gewünschten Bewohner „Doku-Erweitert“ in der festen Leiste und wähle dort „Medikation“.',
      'check', 'Ist die Medikamentenübersicht geöffnet?',
      'stuck', 'Erst „Doku-Erweitert“ in der festen Leiste öffnen, danach darin „Medikation“ wählen.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für Medikation; weiterhin nur zum Ansehen.'
  ),
  (
    'formulare-finden',
    'Formulare finden',
    array['wo ist formulare', 'wo finde ich formulare', 'ich finde formulare nicht', 'formulare finden'],
    jsonb_build_array(jsonb_build_object(
      'text', 'Öffne beim gewünschten Bewohner „Doku-Erweitert“ in der festen Leiste und wähle dort „Formulare“.',
      'check', 'Ist der Bereich „Formulare“ geöffnet?',
      'stuck', 'Erst „Doku-Erweitert“ in der festen Leiste öffnen, danach darin „Formulare“ wählen.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für Formulare.'
  ),
  (
    'durchfuehrungsnachweis-finden',
    'Durchführungsnachweis finden',
    array['wo ist durchführungsnachweis', 'wo finde ich durchführungsnachweis', 'ich finde durchführungsnachweis nicht', 'durchführungsnachweis finden'],
    jsonb_build_array(jsonb_build_object(
      'text', 'Öffne beim gewünschten Bewohner „Doku“ in der festen Leiste und wähle dort „Durchführungsnachweis“.',
      'check', 'Ist der Durchführungsnachweis geöffnet?',
      'stuck', 'Erst „Doku“ in der festen Leiste öffnen, danach darin „Durchführungsnachweis“ wählen.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für den Durchführungsnachweis.'
  ),
  (
    'analyse-finden',
    'Analyse finden',
    array['wo ist analyse', 'wo finde ich analyse', 'ich finde analyse nicht', 'analyse finden'],
    jsonb_build_array(jsonb_build_object(
      'text', 'Den Reiter „Analyse“ findest du oben. Öffne dort „Analyse“.',
      'check', 'Ist „Analyse“ geöffnet?',
      'stuck', 'Suche oben nach dem Reiter „Analyse“.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für Analyse.'
  ),
  (
    'uebergabe-finden',
    'Übergabe finden',
    array['wo ist übergabe', 'wo finde ich übergabe', 'ich finde übergabe nicht', 'wo ist was war los', 'was war los finden'],
    jsonb_build_array(jsonb_build_object(
      'text', 'Öffne oben den Reiter „Analyse“ und wähle dort „Was war los?“. Darüber öffnest du die Übergabeansicht.',
      'check', 'Ist „Was war los?“ geöffnet?',
      'stuck', 'Oben zuerst „Analyse“ öffnen und darin „Was war los?“ wählen.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für die Übergabeansicht.'
  ),
  (
    'notfallblatt-finden',
    'Notfallblatt finden',
    array['wo ist notfallblatt', 'wo finde ich notfallblatt', 'ich finde notfallblatt nicht', 'notfallblatt finden'],
    jsonb_build_array(jsonb_build_object(
      'text', 'Wähle den gewünschten Bewohner. Ganz oben links öffnest du über das kleine rote Kreuz beziehungsweise den zugehörigen Pfeil das Menü und wählst „Notfallblatt aufrufen“.',
      'check', 'Ist das Fenster für das Notfallblatt geöffnet?',
      'stuck', 'Das kleine rote Kreuz beziehungsweise der Pfeil sitzt ganz oben links.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für das Notfallblatt.'
  ),
  (
    'stammdaten-finden',
    'Stammdaten finden',
    array['wo ist stammdaten', 'wo finde ich stammdaten', 'ich finde stammdaten nicht', 'stammdaten finden', 'wo ist bewohnerübersicht'],
    jsonb_build_array(jsonb_build_object(
      'text', 'Öffne zuerst „Berichte“ oder „Durchführungsnachweis“. Solange einer dieser Bereiche geöffnet ist, siehst du links die Bewohnerübersicht. Doppelklicke dort auf den gewünschten Bewohner, um die Stammdaten zu öffnen.',
      'check', 'Haben sich die Stammdaten geöffnet?',
      'stuck', 'Für den Durchführungsnachweis: „Doku“ → „Durchführungsnachweis“. Danach bleibt links die Bewohnerübersicht sichtbar.'
    )),
    '{}'::jsonb, 'approved', now(), 'product-confirmed', now(),
    'Deterministische Orientierung für Stammdaten über die linke Bewohnerübersicht.'
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
