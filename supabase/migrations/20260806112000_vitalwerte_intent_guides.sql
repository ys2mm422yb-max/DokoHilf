-- Vitalwerte: Zielabsicht erhalten und Einzel-/Sammelerfassung sauber trennen.
-- Offizielle Produktbasis: Vivendi PD unterstützt Einzeleingabe und Sammelerfassung.
-- Der konkrete Einstieg über Vitalwerte sowie grünes Plus/Sammelerfassung wurde
-- durch den Nutzer für die Einrichtung bestätigt.

update public.dokohilf_guides
set
  aliases = array[
    'vitalwerte', 'vitalwerte öffnen', 'wo sind vitalwerte', 'vitalwerte ansehen',
    'vitalwertverlauf', 'werteverlauf', 'vorhandene vitalwerte ansehen'
  ],
  steps = jsonb_build_array(
    jsonb_build_object(
      'text', 'Öffne beim gewünschten Bewohner entweder „Doku erweitert“ oder „Doku“.',
      'check', 'Hast du einen der beiden Reiter geöffnet?',
      'stuck', 'Suche in der festen Leiste nach „Doku erweitert“ oder „Doku“.'
    ),
    jsonb_build_object(
      'text', 'Wähle „Vitalwerte“.',
      'check', 'Ist der Bereich „Vitalwerte“ geöffnet?',
      'stuck', 'Suche innerhalb des geöffneten Reiters nach „Vitalwerte“.'
    )
  ),
  version = version + 1,
  reviewed_at = now(),
  reviewed_role = 'durch Nutzer bestätigter Klickweg',
  change_note = 'Öffnen-Guide endet nach dem Öffnen und fragt nicht erneut nach Erfassen oder Ansehen.',
  updated_at = now()
where slug = 'vitalwerte';

insert into public.dokohilf_guides (
  slug, title, aliases, steps, troubleshooting, status, version,
  reviewed_at, reviewed_role, approved_at, change_note
) values
(
  'vitalwerte-erfassen',
  'Vitalwerte erfassen',
  array[
    'vitalwerte erfassen', 'vitalwerte eingeben', 'vitalwerte eintragen',
    'vitalwerte dokumentieren', 'neue vitalwerte', 'vitalwerte anlegen'
  ],
  jsonb_build_array(
    jsonb_build_object(
      'text', 'Öffne beim gewünschten Bewohner entweder „Doku erweitert“ oder „Doku“.',
      'check', 'Hast du einen der beiden Reiter geöffnet?',
      'stuck', 'Suche in der festen Leiste nach „Doku erweitert“ oder „Doku“.'
    ),
    jsonb_build_object(
      'text', 'Wähle „Vitalwerte“.',
      'check', 'Ist der Bereich „Vitalwerte“ geöffnet?',
      'stuck', 'Suche innerhalb des geöffneten Reiters nach „Vitalwerte“.'
    ),
    jsonb_build_object(
      'text', 'Für einen einzelnen Wert klickst du oben links auf das grüne Plus. Für mehrere Werte gleichzeitig wählst du „Sammelerfassung“.',
      'check', 'Möchtest du einen einzelnen Vitalwert oder mehrere Vitalwerte gleichzeitig erfassen?',
      'stuck', 'Das grüne Plus und „Sammelerfassung“ findest du im geöffneten Bereich „Vitalwerte“.'
    )
  ),
  jsonb_build_object(
    'auswahl', 'Ein einzelner Wert führt über das grüne Plus. Mehrere Werte gleichzeitig werden über „Sammelerfassung“ eingegeben.'
  ),
  'approved', 2, now(), 'durch Nutzer bestätigter Klickweg', now(),
  'Erfassungsabsicht bleibt erhalten; nur die notwendige Wahl Einzelwert oder Sammelerfassung wird abgefragt.'
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
  approved_at = coalesce(public.dokohilf_guides.approved_at, excluded.approved_at),
  change_note = excluded.change_note,
  updated_at = now();

insert into public.dokohilf_guides (
  slug, title, aliases, steps, troubleshooting, status, version,
  reviewed_at, reviewed_role, approved_at, change_note
) values
(
  'vitalwerte-einzelwert',
  'Einzelnen Vitalwert erfassen',
  array[
    'einzelnen vitalwert erfassen', 'einen vitalwert eingeben', 'blutdruck eingeben',
    'blutdruck erfassen', 'puls eingeben', 'temperatur eingeben', 'gewicht eingeben',
    'blutzucker eingeben', 'sauerstoffsättigung eingeben'
  ],
  jsonb_build_array(
    jsonb_build_object('text', 'Öffne beim gewünschten Bewohner entweder „Doku erweitert“ oder „Doku“.', 'check', 'Hast du einen der beiden Reiter geöffnet?'),
    jsonb_build_object('text', 'Wähle „Vitalwerte“.', 'check', 'Ist der Bereich „Vitalwerte“ geöffnet?'),
    jsonb_build_object('text', 'Klicke oben links auf das grüne Plus.', 'check', 'Hat sich das Pop-up-Fenster zur Auswahl eines Vitalwerts geöffnet?', 'stuck', 'Suche oben links im Bereich „Vitalwerte“ nach dem kleinen grünen Plus.'),
    jsonb_build_object('text', 'Wähle im Pop-up den Vitalwert aus, den du erfassen möchtest, zum Beispiel Blutdruck, Puls, Temperatur oder Gewicht.', 'check', 'Ist der richtige Vitalwert ausgewählt?'),
    jsonb_build_object('text', 'Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein. In Übungen ausschließlich Fantasiewerte verwenden.', 'check', 'Sind Zeitpunkt und Wert korrekt eingetragen?'),
    jsonb_build_object('text', 'Bestätige mit „OK“ beziehungsweise „Speichern“.', 'check', 'Wurde der Vitalwert gespeichert?'),
    jsonb_build_object('text', 'Kontrolliere, ob der neue Wert in der Vitalwertübersicht erscheint.', 'check', 'Ist der neue Wert sichtbar?')
  ),
  jsonb_build_object(
    'plus_nicht_sichtbar', 'Suche oben links im geöffneten Bereich „Vitalwerte“ nach dem kleinen grünen Plus.',
    'popup_nicht_offen', 'Prüfe, ob du direkt im Bereich „Vitalwerte“ auf das grüne Plus geklickt hast.'
  ),
  'approved', 1, now(), 'durch Nutzer bestätigter Klickweg', now(),
  'Einzelerfassung: grünes Plus öffnet ein Pop-up, anschließend wird der Vitalwert ausgewählt.'
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
  approved_at = coalesce(public.dokohilf_guides.approved_at, excluded.approved_at),
  change_note = excluded.change_note,
  updated_at = now();

insert into public.dokohilf_guides (
  slug, title, aliases, steps, troubleshooting, status, version,
  reviewed_at, reviewed_role, approved_at, change_note
) values
(
  'vitalwerte-einzelwert-fortsetzen',
  'Einzelnen Vitalwert erfassen – Vitalwerte bereits geöffnet',
  array['einzelwert', 'einzelerfassung', 'grünes plus', 'einen wert', 'einzelnen wert'],
  jsonb_build_array(
    jsonb_build_object('text', 'Klicke oben links auf das grüne Plus.', 'check', 'Hat sich das Pop-up-Fenster zur Auswahl eines Vitalwerts geöffnet?', 'stuck', 'Suche oben links im Bereich „Vitalwerte“ nach dem kleinen grünen Plus.'),
    jsonb_build_object('text', 'Wähle im Pop-up den Vitalwert aus, den du erfassen möchtest, zum Beispiel Blutdruck, Puls, Temperatur oder Gewicht.', 'check', 'Ist der richtige Vitalwert ausgewählt?'),
    jsonb_build_object('text', 'Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein. In Übungen ausschließlich Fantasiewerte verwenden.', 'check', 'Sind Zeitpunkt und Wert korrekt eingetragen?'),
    jsonb_build_object('text', 'Bestätige mit „OK“ beziehungsweise „Speichern“.', 'check', 'Wurde der Vitalwert gespeichert?'),
    jsonb_build_object('text', 'Kontrolliere, ob der neue Wert in der Vitalwertübersicht erscheint.', 'check', 'Ist der neue Wert sichtbar?')
  ),
  '{}'::jsonb,
  'approved', 1, now(), 'durch Nutzer bestätigter Anschlussablauf', now(),
  'Anschluss nach der Wahl Einzelwert im bereits geöffneten Vitalwerte-Bereich.'
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
  approved_at = coalesce(public.dokohilf_guides.approved_at, excluded.approved_at),
  change_note = excluded.change_note,
  updated_at = now();

insert into public.dokohilf_guides (
  slug, title, aliases, steps, troubleshooting, status, version,
  reviewed_at, reviewed_role, approved_at, change_note
) values
(
  'vitalwerte-sammelerfassung',
  'Mehrere Vitalwerte über Sammelerfassung erfassen',
  array[
    'sammelerfassung vitalwerte', 'mehrere vitalwerte eingeben',
    'mehrere vitalwerte erfassen', 'vitalwerte gleichzeitig eingeben',
    'alle vitalwerte eingeben'
  ],
  jsonb_build_array(
    jsonb_build_object('text', 'Öffne beim gewünschten Bewohner entweder „Doku erweitert“ oder „Doku“.', 'check', 'Hast du einen der beiden Reiter geöffnet?'),
    jsonb_build_object('text', 'Wähle „Vitalwerte“.', 'check', 'Ist der Bereich „Vitalwerte“ geöffnet?'),
    jsonb_build_object('text', 'Wähle „Sammelerfassung“, wenn du mehrere Vitalwerte gleichzeitig eingeben möchtest.', 'check', 'Ist die Sammelerfassung geöffnet?', 'stuck', 'Suche im geöffneten Bereich „Vitalwerte“ nach „Sammelerfassung“.'),
    jsonb_build_object('text', 'Wähle in der Sammelerfassung die benötigten Vitalwerte aus.', 'check', 'Sind alle gewünschten Vitalwerte ausgewählt?'),
    jsonb_build_object('text', 'Prüfe Datum und Uhrzeit und trage die gemessenen Werte ein. In Übungen ausschließlich Fantasiewerte verwenden.', 'check', 'Sind Zeitpunkt und Werte korrekt eingetragen?'),
    jsonb_build_object('text', 'Bestätige mit „OK“ beziehungsweise „Speichern“.', 'check', 'Wurden die Vitalwerte gespeichert?'),
    jsonb_build_object('text', 'Kontrolliere, ob die neuen Werte in der Vitalwertübersicht erscheinen.', 'check', 'Sind die neuen Werte sichtbar?')
  ),
  jsonb_build_object('sammelerfassung_nicht_sichtbar', 'Suche im geöffneten Bereich „Vitalwerte“ nach „Sammelerfassung“. Die Funktion ist für mehrere Werte gleichzeitig gedacht.'),
  'approved', 1, now(), 'offizielle Produktfunktion und durch Nutzer bestätigter Einstieg', now(),
  'Sammelerfassung als eigener Ablauf für mehrere Vitalwerte gleichzeitig.'
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
  approved_at = coalesce(public.dokohilf_guides.approved_at, excluded.approved_at),
  change_note = excluded.change_note,
  updated_at = now();

insert into public.dokohilf_guides (
  slug, title, aliases, steps, troubleshooting, status, version,
  reviewed_at, reviewed_role, approved_at, change_note
) values
(
  'vitalwerte-sammelerfassung-fortsetzen',
  'Sammelerfassung – Vitalwerte bereits geöffnet',
  array['sammelerfassung', 'mehrere werte', 'mehrere gleichzeitig'],
  jsonb_build_array(
    jsonb_build_object('text', 'Wähle „Sammelerfassung“, um mehrere Vitalwerte gleichzeitig einzugeben.', 'check', 'Ist die Sammelerfassung geöffnet?', 'stuck', 'Suche im geöffneten Bereich „Vitalwerte“ nach „Sammelerfassung“.'),
    jsonb_build_object('text', 'Wähle in der Sammelerfassung die benötigten Vitalwerte aus.', 'check', 'Sind alle gewünschten Vitalwerte ausgewählt?'),
    jsonb_build_object('text', 'Prüfe Datum und Uhrzeit und trage die gemessenen Werte ein. In Übungen ausschließlich Fantasiewerte verwenden.', 'check', 'Sind Zeitpunkt und Werte korrekt eingetragen?'),
    jsonb_build_object('text', 'Bestätige mit „OK“ beziehungsweise „Speichern“.', 'check', 'Wurden die Vitalwerte gespeichert?'),
    jsonb_build_object('text', 'Kontrolliere, ob die neuen Werte in der Vitalwertübersicht erscheinen.', 'check', 'Sind die neuen Werte sichtbar?')
  ),
  '{}'::jsonb,
  'approved', 1, now(), 'offizielle Produktfunktion und durch Nutzer bestätigter Einstieg', now(),
  'Anschluss nach der Wahl Sammelerfassung im bereits geöffneten Vitalwerte-Bereich.'
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
  approved_at = coalesce(public.dokohilf_guides.approved_at, excluded.approved_at),
  change_note = excluded.change_note,
  updated_at = now();

-- Der alte Anschlussguide bleibt nur als Alias-kompatibler Übergang bestehen,
-- wird aber nicht mehr direkt geroutet.
update public.dokohilf_guides
set status = 'draft',
    change_note = 'Ersetzt durch getrennte Einzelwert- und Sammelerfassungsabläufe.',
    updated_at = now()
where slug = 'vitalwerte-erfassen-fortsetzen';

update public.dokohilf_topics
set
  overview = 'Vitalwerte können einzeln oder über die Sammelerfassung für mehrere Werte gleichzeitig erfasst und anschließend als Verlauf ausgewertet werden.',
  capabilities = array[
    'Vitalwerte öffnen', 'einzelnen Vitalwert über das grüne Plus erfassen',
    'mehrere Vitalwerte über Sammelerfassung erfassen', 'Verlauf ansehen',
    'über Abfrage oder Bericht auswerten'
  ],
  approved_guide_slugs = array[
    'vitalwerte', 'vitalwerte-erfassen', 'vitalwerte-einzelwert',
    'vitalwerte-einzelwert-fortsetzen', 'vitalwerte-sammelerfassung',
    'vitalwerte-sammelerfassung-fortsetzen'
  ],
  source_basis = 'Connext Produktinformation Vivendi PD: Vitalwerte über Einzeleingabe oder Sammelerfassung; einrichtungsspezifischer Einstieg durch Nutzer bestätigt.',
  reviewed_at = now(),
  updated_at = now()
where slug = 'vitalwerte';
