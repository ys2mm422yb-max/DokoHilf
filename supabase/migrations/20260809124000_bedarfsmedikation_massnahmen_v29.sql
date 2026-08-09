-- v29: product-confirmed workflows for Bedarfsmedikation, its automatic later
-- Wirksamkeitskontrolle, and Maßnahmen ohne Zeitangabe.
-- DokoHilf only explains the confirmed UI workflow. It never changes medication orders.

insert into public.dokohilf_guides (
  id, slug, title, aliases, steps, troubleshooting, status, version,
  reviewed_at, reviewed_role, created_at, updated_at,
  review_interval_days, review_due_at, approved_at, change_note
)
values
(
  gen_random_uuid(),
  'bedarfsmedikation-gabe',
  'Bedarfsmedikationsgabe dokumentieren',
  array[
    'bedarfsmedikation dokumentieren', 'bedarfsmedikation geben', 'bedarf geben',
    'bedarfsgabe dokumentieren', 'bedarfsmedikament dokumentieren', 'bedarfsmedikament geben',
    'medikament bei bedarf dokumentieren'
  ],
  '[
    {"text":"Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“.","check":"Ist „Doku“ geöffnet?","stuck":"„Doku“ ist ein fester Hauptbereich ganz oben in der grünen Leiste. Wähle dort „Doku“; die zugehörigen Unterpunkte erscheinen direkt darunter."},
    {"text":"Wähle darunter „Durchführungsnachweis“.","check":"Ist der Durchführungsnachweis geöffnet?","stuck":"Nach Auswahl von „Doku“ erscheint darunter „Durchführungsnachweis“."},
    {"text":"Suche im Durchführungsnachweis „Bedarfsmedikation“ und klicke auf den kleinen Pfeil links daneben.","check":"Ist die Bedarfsmedikation des ausgewählten Bewohners geöffnet?","stuck":"Bleibe im Durchführungsnachweis und suche den Eintrag „Bedarfsmedikation“. Direkt links daneben befindet sich der kleine Pfeil zum Öffnen."},
    {"text":"Wähle das gewünschte Bedarfsmedikament aus, indem du rechts im kleinen Kästchen den Haken setzt.","check":"Hat sich das Pop-up-Fenster geöffnet?","stuck":"Die Bedarfsmedikation ist geöffnet. Suche das gewünschte Medikament und setze ganz rechts in der zugehörigen Zeile den Haken im kleinen Kästchen."},
    {"text":"Prüfe im Pop-up die Uhrzeit und ergänze beziehungsweise korrigiere sie nur auf den tatsächlichen Zeitpunkt der Gabe.","check":"Stimmt die dokumentierte Uhrzeit?"},
    {"text":"Beschreibe unten im Pop-up kurz den Anlass beziehungsweise warum die Bedarfsmedikation gegeben wurde.","check":"Ist der Anlass dokumentiert?"},
    {"text":"Wenn tatsächlich eine geringere Bedarfsmenge eingenommen beziehungsweise gegeben wurde, dokumentiere rechts im Pop-up die tatsächlich verwendete Menge. Die Verordnung selbst wird dabei nicht verändert.","check":"Ist die tatsächlich verwendete Bedarfsmenge korrekt dokumentiert?","stuck":"Ändere hier nur die dokumentierte tatsächlich verwendete Bedarfsmenge. Die verordnete Bedarfsmedikation beziehungsweise Dosierung wird in diesem Ablauf nicht geändert."},
    {"text":"Bestätige das Pop-up unten mit „OK“.","check":"Ist die Bedarfsmedikationsgabe gespeichert?"},
    {"text":"Nach der dokumentierten Bedarfsmedikationsgabe wird die zugehörige Wirksamkeitskontrolle automatisch vom System angelegt. Du erstellst sie nicht selbst. Bearbeite sie erst, wenn sie zum vorgesehenen Zeitpunkt fällig ist.","check":"Ist klar, dass die Wirksamkeitskontrolle automatisch angelegt und später fällig wird?","stuck":"Die Wirksamkeitskontrolle wird automatisch zur Bedarfsmedikation angelegt. DokoHilf nennt keine erfundene Wartezeit."},
    {"text":"Wenn die Wirksamkeitskontrolle fällig ist, öffne sie im Durchführungsnachweis, hake sie ab und dokumentiere, ob und wie die Bedarfsmedikation gewirkt beziehungsweise geholfen hat.","check":"Ist die Wirkung dokumentiert?","stuck":"Suche zum vorgesehenen Zeitpunkt im Durchführungsnachweis die automatisch erzeugte Wirksamkeitskontrolle zur Bedarfsmedikation."},
    {"text":"Bestätige die Wirksamkeitskontrolle unten mit „OK“.","check":"Ist die Wirksamkeitskontrolle gespeichert?"}
  ]'::jsonb,
  '{"abgrenzung":"Die Bedarfsmedikationsgabe wird im Durchführungsnachweis dokumentiert. Die normale Medikationsübersicht bleibt ein separater Nur-Ansehen-Ablauf.","menge":"Nur die tatsächlich verwendete Bedarfsmenge dokumentieren; die Verordnung selbst nicht verändern.","wirksamkeit":"Die Wirksamkeitskontrolle wird automatisch angelegt und erst zum vorgesehenen Zeitpunkt im Durchführungsnachweis bearbeitet. DokoHilf erfindet keine konkrete Wartezeit."}'::jsonb,
  'approved', 1, now(), 'product-confirmed', now(), now(), 180, now() + interval '180 days', now(),
  'Bedarfsmedikationsgabe inklusive automatisch angelegter späterer Wirksamkeitskontrolle fachlich bestätigt.'
),
(
  gen_random_uuid(),
  'bedarfsmedikation-wirksamkeitskontrolle',
  'Wirksamkeitskontrolle nach Bedarfsmedikation dokumentieren',
  array[
    'wirksamkeitskontrolle', 'wirksamkeitskontrolle bedarfsmedikation',
    'wirksamkeit bedarfsmedikation dokumentieren', 'bedarf wirksamkeit dokumentieren',
    'hat bedarfsmedikation geholfen dokumentieren', 'wirksamkeitskontrolle abhaken',
    'wo muss ich die wirksamkeitskontrolle abhaken'
  ],
  '[
    {"text":"Nach einer Bedarfsmedikationsgabe wird die zugehörige Wirksamkeitskontrolle automatisch vom System angelegt. Du musst keine neue Kontrolle selbst erstellen.","check":"Ist klar, dass die Wirksamkeitskontrolle automatisch angelegt wird?","stuck":"Die Wirksamkeitskontrolle wird automatisch zur Bedarfsmedikation erzeugt."},
    {"text":"Sobald die Wirksamkeitskontrolle zum vorgesehenen Zeitpunkt fällig ist, wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“.","check":"Ist „Doku“ geöffnet?","stuck":"„Doku“ ist ein fester Hauptbereich ganz oben in der grünen Leiste."},
    {"text":"Wähle darunter „Durchführungsnachweis“ und suche dort die automatisch angelegte Wirksamkeitskontrolle zur Bedarfsmedikation.","check":"Hast du die passende Wirksamkeitskontrolle gefunden?","stuck":"Nach Auswahl von „Doku“ erscheint darunter „Durchführungsnachweis“. Dort wird die fällige Wirksamkeitskontrolle angezeigt."},
    {"text":"Öffne die Wirksamkeitskontrolle und hake sie als durchgeführt ab.","check":"Ist die Wirksamkeitskontrolle als durchgeführt markiert?"},
    {"text":"Dokumentiere kurz, ob und wie die Bedarfsmedikation gewirkt beziehungsweise geholfen hat.","check":"Ist die Wirkung beziehungsweise das Ergebnis beschrieben?"},
    {"text":"Bestätige das Pop-up zum Schluss unten mit „OK“.","check":"Ist die Wirksamkeitskontrolle gespeichert?"}
  ]'::jsonb,
  '{"zeitpunkt":"Bearbeite die Wirksamkeitskontrolle erst, wenn sie zum im System vorgesehenen Zeitpunkt fällig ist. DokoHilf nennt keine erfundene Dauer."}'::jsonb,
  'approved', 1, now(), 'product-confirmed', now(), now(), 180, now() + interval '180 days', now(),
  'Direkte Anleitung für die automatisch angelegte Wirksamkeitskontrolle nach Bedarfsmedikation.'
),
(
  gen_random_uuid(),
  'bedarfsmedikation-finden',
  'Bedarfsmedikation finden',
  array[
    'wo ist bedarfsmedikation', 'wo finde ich bedarfsmedikation', 'ich finde bedarfsmedikation nicht',
    'wie komme ich zur bedarfsmedikation', 'bedarfsmedikation finden'
  ],
  '[
    {"text":"Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“.","check":"Ist „Doku“ geöffnet?","stuck":"„Doku“ findest du ganz oben in der festen grünen Leiste."},
    {"text":"Wähle darunter „Durchführungsnachweis“.","check":"Ist der Durchführungsnachweis geöffnet?","stuck":"Nach Auswahl von „Doku“ erscheint darunter „Durchführungsnachweis“."},
    {"text":"Im Durchführungsnachweis findest du „Bedarfsmedikation“. Klicke auf den kleinen Pfeil links daneben, um die Bedarfsmedikation des ausgewählten Bewohners zu öffnen.","check":"Ist die Bedarfsmedikation geöffnet?"}
  ]'::jsonb,
  '{}'::jsonb,
  'approved', 1, now(), 'product-confirmed', now(), now(), 180, now() + interval '180 days', now(),
  'Deterministische Orientierung zur Bedarfsmedikation im Durchführungsnachweis.'
),
(
  gen_random_uuid(),
  'bedarfsmedikation-wirksamkeitskontrolle-finden',
  'Wirksamkeitskontrolle der Bedarfsmedikation finden',
  array[
    'wo ist wirksamkeitskontrolle bedarfsmedikation', 'wo finde ich die wirksamkeitskontrolle',
    'ich finde die wirksamkeitskontrolle nicht', 'wirksamkeitskontrolle finden'
  ],
  '[
    {"text":"Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“.","check":"Ist „Doku“ geöffnet?"},
    {"text":"Wähle darunter „Durchführungsnachweis“.","check":"Ist der Durchführungsnachweis geöffnet?"},
    {"text":"Zum vorgesehenen Zeitpunkt findest du dort die automatisch angelegte Wirksamkeitskontrolle zur zuvor dokumentierten Bedarfsmedikation.","check":"Siehst du die fällige Wirksamkeitskontrolle?","stuck":"Die Wirksamkeitskontrolle erscheint erst zum vorgesehenen Zeitpunkt im Durchführungsnachweis. DokoHilf nennt keine erfundene Wartezeit."}
  ]'::jsonb,
  '{}'::jsonb,
  'approved', 1, now(), 'product-confirmed', now(), now(), 180, now() + interval '180 days', now(),
  'Deterministische Orientierung zur später fälligen Wirksamkeitskontrolle der Bedarfsmedikation.'
),
(
  gen_random_uuid(),
  'massnahmen-ohne-zeitangabe',
  'Maßnahmen ohne Zeitangabe dokumentieren',
  array[
    'maßnahmen ohne zeitangabe', 'massnahmen ohne zeitangabe', 'maßnahme ohne zeitangabe dokumentieren',
    'klienten-team sitzung dokumentieren', 'klienten team sitzung dokumentieren', 'krise dokumentieren'
  ],
  '[
    {"text":"Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“.","check":"Ist „Doku“ geöffnet?","stuck":"„Doku“ ist ein fester Hauptbereich ganz oben in der grünen Leiste."},
    {"text":"Wähle darunter „Durchführungsnachweis“.","check":"Ist der Durchführungsnachweis geöffnet?","stuck":"Nach Auswahl von „Doku“ erscheint darunter „Durchführungsnachweis“."},
    {"text":"Öffne im Durchführungsnachweis „Maßnahmen ohne Zeitangabe“.","check":"Ist der Bereich „Maßnahmen ohne Zeitangabe“ geöffnet?","stuck":"Bleibe im Durchführungsnachweis und suche dort den Eintrag „Maßnahmen ohne Zeitangabe“."},
    {"text":"Wähle die gewünschte Maßnahme aus, zum Beispiel „Klienten-Team Sitzung“ oder „Krise“.","check":"Hat sich das Pop-up-Fenster geöffnet?"},
    {"text":"Prüfe im Pop-up Datum und Uhrzeit und ändere sie nur, wenn der tatsächliche Dokumentationszeitpunkt abweicht.","check":"Stimmen Datum und Uhrzeit?"},
    {"text":"Wähle die passende Kategorie aus.","check":"Ist die Kategorie ausgewählt?"},
    {"text":"Dokumentiere unter „Was war“, was bei der Maßnahme relevant war.","check":"Ist „Was war“ ausgefüllt?"},
    {"text":"Wenn du eine zusätzliche Zeitangabe dokumentieren möchtest, kannst du sie oben rechts im Pop-up ergänzen.","check":"Ist die optionale Zeitangabe so eingetragen, wie du sie brauchst?"},
    {"text":"Bestätige das Pop-up unten mit „OK“.","check":"Ist die Maßnahme gespeichert?"}
  ]'::jsonb,
  '{"popup":"Das Pop-up entspricht dem bekannten Berichtseintrag-Fenster: Datum und Uhrzeit prüfen, Kategorie wählen, unter „Was war“ dokumentieren; die zusätzliche Zeitangabe oben rechts ist optional."}'::jsonb,
  'approved', 1, now(), 'product-confirmed', now(), now(), 180, now() + interval '180 days', now(),
  'Maßnahmen ohne Zeitangabe im Durchführungsnachweis fachlich bestätigt.'
),
(
  gen_random_uuid(),
  'massnahmen-ohne-zeitangabe-finden',
  'Maßnahmen ohne Zeitangabe finden',
  array[
    'wo sind maßnahmen ohne zeitangabe', 'wo finde ich maßnahmen ohne zeitangabe',
    'ich finde maßnahmen ohne zeitangabe nicht', 'maßnahmen ohne zeitangabe finden'
  ],
  '[
    {"text":"Wähle beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku“.","check":"Ist „Doku“ geöffnet?"},
    {"text":"Wähle darunter „Durchführungsnachweis“.","check":"Ist der Durchführungsnachweis geöffnet?"},
    {"text":"Im Durchführungsnachweis findest du den Bereich „Maßnahmen ohne Zeitangabe“.","check":"Siehst du „Maßnahmen ohne Zeitangabe“?"}
  ]'::jsonb,
  '{}'::jsonb,
  'approved', 1, now(), 'product-confirmed', now(), now(), 180, now() + interval '180 days', now(),
  'Deterministische Orientierung zu Maßnahmen ohne Zeitangabe.'
)
on conflict (slug) do update set
  title = excluded.title,
  aliases = excluded.aliases,
  steps = excluded.steps,
  troubleshooting = excluded.troubleshooting,
  status = excluded.status,
  version = greatest(public.dokohilf_guides.version + 1, excluded.version),
  reviewed_at = excluded.reviewed_at,
  reviewed_role = excluded.reviewed_role,
  updated_at = excluded.updated_at,
  review_interval_days = excluded.review_interval_days,
  review_due_at = excluded.review_due_at,
  approved_at = excluded.approved_at,
  change_note = excluded.change_note;

update public.dokohilf_topics
set approved_guide_slugs = (
      select array_agg(distinct value order by value)
      from unnest(
        coalesce(approved_guide_slugs, '{}'::text[]) ||
        array[
          'bedarfsmedikation-gabe',
          'bedarfsmedikation-wirksamkeitskontrolle',
          'bedarfsmedikation-finden',
          'bedarfsmedikation-wirksamkeitskontrolle-finden',
          'massnahmen-ohne-zeitangabe',
          'massnahmen-ohne-zeitangabe-finden'
        ]
      ) as value
    ),
    updated_at = now()
where slug = 'durchfuehrungsnachweis';

update public.dokohilf_topics
set approved_guide_slugs = (
      select array_agg(distinct value order by value)
      from unnest(
        coalesce(approved_guide_slugs, '{}'::text[]) ||
        array[
          'bedarfsmedikation-gabe',
          'bedarfsmedikation-wirksamkeitskontrolle',
          'bedarfsmedikation-finden',
          'bedarfsmedikation-wirksamkeitskontrolle-finden'
        ]
      ) as value
    ),
    updated_at = now()
where slug = 'medikation';
