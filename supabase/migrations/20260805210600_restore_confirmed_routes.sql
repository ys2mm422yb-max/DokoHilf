begin;

update dokohilf_guides
set status = 'approved',
    aliases = array[
      'bericht durchstreichen','berichtseintrag durchstreichen','im bericht verschrieben','falscher bericht',
      'eintrag korrigieren','fehler im bericht','bericht falsch geschrieben','bericht löschen','bericht loeschen',
      'bericht stornieren','bericht entfernen','bericht rückgängig machen','bericht rueckgaengig machen',
      'falschen bericht löschen','falschen bericht entfernen','bericht wegmachen','eintrag löschen','eintrag stornieren'
    ],
    steps = jsonb_set(
      steps,
      '{0,text}',
      to_jsonb('Ein Berichtseintrag wird zur Nachvollziehbarkeit nicht endgültig gelöscht, sondern durchgestrichen. Öffne den Reiter „Berichte“.'::text),
      false
    ),
    version = greatest(version, 2) + 1,
    reviewed_at = now(),
    reviewed_role = 'durch Nutzer bestätigter Klickweg'
where slug = 'bericht-durchstreichen';

update dokohilf_guides
set status = 'approved',
    aliases = array[
      'durchführung stornieren','durchfuehrung stornieren','durchführungsnachweis stornieren',
      'durchfuehrungsnachweis stornieren','falsch dokumentierte durchführung','falsch dokumentierte durchfuehrung',
      'nachweis löschen','nachweis loeschen','durchführung rückgängig','durchfuehrung rueckgaengig',
      'falschen nachweis entfernen','maßnahme stornieren','massnahme stornieren','dokumentation stornieren'
    ],
    version = greatest(version, 1) + 1,
    reviewed_at = now(),
    reviewed_role = 'durch Nutzer bestätigter Klickweg'
where slug = 'durchfuehrung-storno';

update dokohilf_guides
set status = 'approved',
    aliases = array[
      'visite','visite anlegen','visite hinzufügen','visite hinzufuegen','neue visite','arztvisite',
      'visite eintragen','visite erstellen','pflegevisite anlegen','neue pflegevisite','visite dokumentieren'
    ],
    version = greatest(version, 1) + 1,
    reviewed_at = now(),
    reviewed_role = 'durch Nutzer bestätigter Klickweg'
where slug = 'visite-anlegen';

update dokohilf_topics
set aliases = array[
      'bericht','berichte','pflegebericht','berichteblatt','berichtseintrag','dokumentation schreiben',
      'bericht löschen','bericht loeschen','bericht stornieren','bericht durchstreichen','falscher bericht'
    ],
    approved_guide_slugs = array['bericht-neu','bericht-durchstreichen','berichtssuche'],
    unconfirmed_actions = array['bestehenden Bericht inhaltlich verändern'],
    reviewed_at = now()
where slug = 'berichte';

update dokohilf_topics
set approved_guide_slugs = array['durchfuehrungsnachweis-oeffnen','durchfuehrung-storno'],
    unconfirmed_actions = array[
      'Abweichung dokumentieren','Abweichung bei einer Maßnahme dokumentieren',
      'Ad-hoc-Maßnahme anlegen','ungeplante Maßnahme anlegen'
    ],
    reviewed_at = now()
where slug = 'durchfuehrungsnachweis';

update dokohilf_topics
set approved_guide_slugs = array['visiten-oeffnen','visite-anlegen','visite-status-durchgefuehrt'],
    unconfirmed_actions = array[
      'Visite ungültig setzen','Visite als nicht möglich kennzeichnen','Arbeitsauftrag aus Visite erzeugen'
    ],
    reviewed_at = now()
where slug = 'visiten';

commit;
