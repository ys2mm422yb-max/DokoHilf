-- v29 follow-up: defer unfinished library entries and clarify Stammdaten entry.
-- Product confirmation 2026-08-09:
-- - Aufgaben · Aktuelles and Easy-Plan come later and must not be treated as approved guides.
-- - Stammdaten are reached from the left resident overview while Berichte or Durchführungsnachweis is open.

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
