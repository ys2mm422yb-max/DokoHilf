-- v45: confirmed Dateiablage / Dokumente navigation and opening workflow.
-- Product confirmation 2026-08-12:
-- - open the resident's Stammdaten
-- - use the grey tab row and select "Dateiablage"
-- - "Dokumente" appears in the lower middle area
-- - choose the desired existing document and open it with a double click
-- - Word may take a short moment to open; do not start the action repeatedly
-- - examples such as contracts, Wohnassistent-Vertrag, Betreuerausweis,
--   Arztbrief, Entlassungsbrief and Laborwerte are search terms only;
--   DokoHilf never guarantees that a specific document exists.

insert into public.dokohilf_guides
  (slug, title, aliases, steps, troubleshooting, status, reviewed_at, reviewed_role, approved_at, change_note)
values (
  'dateiablage-dokumente',
  'Dokumente in der Dateiablage öffnen',
  array[
    'dateiablage',
    'dokumente dateiablage',
    'dokumente finden',
    'wo finde ich dokumente',
    'wo finde ich verträge',
    'wo finde ich vertrag',
    'wohnassistent-vertrag',
    'wo finde ich wohnassistent-vertrag',
    'betreuerausweis',
    'wo finde ich betreuerausweis',
    'arztbrief',
    'arztbriefe',
    'wo finde ich arztbrief',
    'entlassungsbrief',
    'entlassungsbriefe',
    'wo finde ich entlassungsbrief',
    'laborwerte',
    'wo finde ich laborwerte'
  ],
  jsonb_build_array(
    jsonb_build_object(
      'text', 'Öffne die Stammdaten des gewünschten Bewohners.',
      'check', 'Sind die Stammdaten des gewünschten Bewohners geöffnet?',
      'stuck', 'Öffne zuerst „Berichte“ oder „Durchführungsnachweis“. Solange einer dieser Bereiche geöffnet ist, siehst du links die Bewohnerübersicht. Doppelklicke dort auf den gewünschten Bewohner, um die Stammdaten zu öffnen.'
    ),
    jsonb_build_object(
      'text', 'Klicke in den geöffneten Stammdaten in der grauen Leiste auf „Dateiablage“.',
      'check', 'Ist „Dateiablage“ geöffnet?',
      'stuck', 'Suche in den geöffneten Stammdaten in der grauen Reiterleiste nach „Dateiablage“.'
    ),
    jsonb_build_object(
      'text', 'Im unteren mittleren Bereich findest du jetzt „Dokumente“. Suche dort das gewünschte Dokument.',
      'check', 'Siehst du das gewünschte Dokument unter „Dokumente“?',
      'stuck', 'Nach dem Klick auf „Dateiablage“ erscheint der Bereich „Dokumente“ im unteren mittleren Bereich. DokoHilf kann nicht bestätigen, ob ein bestimmtes Dokument beim Bewohner hinterlegt ist.'
    ),
    jsonb_build_object(
      'text', 'Öffne das gewünschte Dokument mit einem Doppelklick.',
      'check', 'Öffnet sich das Dokument in Word beziehungsweise wird Word geladen?',
      'stuck', 'Führe auf dem gewünschten Dokument einen Doppelklick aus.'
    ),
    jsonb_build_object(
      'text', 'Warte kurz, bis sich das Dokument in Word geöffnet hat. Starte den Vorgang währenddessen nicht mehrfach.',
      'check', 'Ist das Dokument in Word geöffnet?',
      'stuck', 'Das Öffnen in Word kann kurz dauern. Warte einen Moment, statt das Dokument mehrfach zu öffnen.'
    )
  ),
  jsonb_build_object(
    'dokument_nicht_vorhanden', 'DokoHilf kann nicht bestätigen, ob ein bestimmtes Dokument beim Bewohner hinterlegt ist. Prüfe nur die sichtbaren Dokumente in der Dateiablage.',
    'word_laed', 'Das Öffnen in Word kann kurz dauern. Warte einen Moment und starte den Vorgang nicht mehrfach.'
  ),
  'approved',
  now(),
  'product-confirmed',
  now(),
  'Dateiablage und Öffnen bereits hinterlegter Dokumente fachlich bestätigt; keine Aussage über das Vorhandensein eines konkreten Dokuments.'
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
      from unnest(coalesce(approved_guide_slugs, '{}'::text[]) || array['dateiablage-dokumente']) as value
    ),
    updated_at = now()
where slug = 'stammdaten';
