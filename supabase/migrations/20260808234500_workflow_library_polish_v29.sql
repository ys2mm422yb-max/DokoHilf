-- v29 workflow library polish.
-- Keeps confirmed click paths, clarifies report correction vs. follow-up,
-- marks report search as pending review, and enriches confirmed visit/vital copy.

update public.dokohilf_guides
set title = 'Bericht korrigieren / durchstreichen',
    aliases = (
      select array_agg(distinct value order by value)
      from unnest(coalesce(aliases, '{}'::text[]) || array[
        'bericht korrigieren',
        'bericht berichtigen',
        'berichtstext korrigieren',
        'bericht falsch geschrieben',
        'im bericht verschrieben',
        'in einem bericht verschrieben',
        'ich habe mich in einem bericht verschrieben',
        'schreibfehler im bericht'
      ]) as value
    ),
    steps = jsonb_set(
      steps,
      '{6,text}',
      to_jsonb('Kontrolliere, ob der Bericht sichtbar durchgestrichen ist. Soll der Inhalt korrekt neu dokumentiert werden, legst du anschließend einen neuen Bericht an. Ein Folgebericht korrigiert den ursprünglichen Bericht nicht.'::text),
      false
    ),
    troubleshooting = coalesce(troubleshooting, '{}'::jsonb) || jsonb_build_object(
      'folgebericht_abgrenzung', 'Ein Folgebericht ergänzt oder führt ein bereits dokumentiertes Geschehen fort. Er verändert den ursprünglichen Bericht nicht.',
      'neu_schreiben', 'Wenn der falsche Bericht durchgestrichen ist und der Inhalt korrekt neu dokumentiert werden soll, danach einen neuen Bericht anlegen.'
    ),
    change_note = 'Berichtskorrektur klar von Folgebericht getrennt; zusätzliche Korrektur-Aliase ergänzt.'
where slug = 'bericht-durchstreichen'
  and status = 'approved';

update public.dokohilf_guides
set troubleshooting = coalesce(troubleshooting, '{}'::jsonb) || jsonb_build_object(
      'zweck', 'Ein Folgebericht ist ein neuer Bericht mit Bezug zu einem bereits dokumentierten Geschehen. Er ergänzt oder führt dieses Geschehen fort und korrigiert den ursprünglichen Bericht nicht.'
    ),
    change_note = 'Zweck des Folgeberichts gegenüber einer Berichtskorrektur fachlich abgegrenzt.'
where slug = 'bericht-folgebericht'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{5}',
      coalesce(steps->5, '{}'::jsonb) || jsonb_build_object(
        'text', 'Den beim Bewohner hinterlegten durchführenden Arzt auswählen.',
        'check', 'Ist der durchführende Arzt ausgewählt?',
        'stuck', 'Wenn der durchführende Arzt beim Bewohner nicht hinterlegt ist, aktiviere rechts neben der Arztauswahl das kleine Filtersymbol. Dann stehen alle systemweit hinterlegten Ärzte zur Auswahl.'
      ),
      false
    ),
    troubleshooting = coalesce(troubleshooting, '{}'::jsonb) || jsonb_build_object(
      'arzt_filter', 'Sonderfall: Nur wenn der durchführende Arzt beim Bewohner nicht hinterlegt ist, rechts neben der Arztauswahl das kleine Filtersymbol aktivieren. Danach stehen alle im System hinterlegten Ärzte zur Auswahl. Im Normalfall bleibt das Filtersymbol aus.'
    ),
    change_note = 'Arztfilter als seltener Sonderfall statt als regulärer Schritt formuliert; Ortsoption per Mail bleibt bestätigt.'
where slug = 'visite-anlegen'
  and status = 'approved';

update public.dokohilf_guides
set aliases = (
      select array_agg(distinct value order by value)
      from unnest(coalesce(aliases, '{}'::text[]) || array[
        'atemfrequenz eingeben',
        'atemfrequenz erfassen',
        'atemalkohol eingeben',
        'atemalkohol erfassen'
      ]) as value
    ),
    steps = jsonb_set(
      jsonb_set(
        steps,
        '{3,text}',
        to_jsonb('Wähle im Pop-up den Vitalwert aus, den du erfassen möchtest, zum Beispiel Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz oder Atemalkohol.'::text),
        false
      ),
      '{4,text}',
      to_jsonb('Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein. Je nach ausgewähltem Vitalwert erscheinen die passenden Eingabefelder. Bei Blutdruck sind zum Beispiel Systole und Diastole erforderlich.'::text),
      false
    ),
    troubleshooting = coalesce(troubleshooting, '{}'::jsonb) || jsonb_build_object(
      'beispiele', 'Bei euch können unter anderem Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz und Atemalkohol erfasst werden. Zusätzliche Felder oder Einheiten so übernehmen, wie sie in der geöffneten Maske angezeigt werden.'
    ),
    change_note = 'Bestätigte lokale Vitalwert-Auswahl und kontextabhängige Eingabefelder ergänzt.'
where slug = 'vitalwerte-einzelwert'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(
        steps,
        '{1,text}',
        to_jsonb('Wähle im Pop-up den Vitalwert aus, den du erfassen möchtest, zum Beispiel Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz oder Atemalkohol.'::text),
        false
      ),
      '{2,text}',
      to_jsonb('Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein. Je nach ausgewähltem Vitalwert erscheinen die passenden Eingabefelder. Bei Blutdruck sind zum Beispiel Systole und Diastole erforderlich.'::text),
      false
    ),
    troubleshooting = coalesce(troubleshooting, '{}'::jsonb) || jsonb_build_object(
      'beispiele', 'Bei euch können unter anderem Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz und Atemalkohol erfasst werden.'
    ),
    change_note = 'Fortsetzungs-Guide auf bestätigte lokale Vitalwert-Auswahl aktualisiert.'
where slug = 'vitalwerte-einzelwert-fortsetzen'
  and status = 'approved';

update public.dokohilf_guides
set status = 'draft',
    change_note = 'Fachliche Überarbeitung der Berichtssuche steht noch aus; bis dahin nicht als fertige Anleitung verwenden.'
where slug = 'berichtssuche'
  and status = 'approved';

update public.dokohilf_topics
set approved_guide_slugs = array_remove(coalesce(approved_guide_slugs, '{}'::text[]), 'berichtssuche'),
    unconfirmed_actions = (
      select array_agg(distinct value order by value)
      from unnest(coalesce(unconfirmed_actions, '{}'::text[]) || array['Berichtssuche fachlich neu prüfen']) as value
    ),
    updated_at = now()
where 'berichtssuche' = any(coalesce(approved_guide_slugs, '{}'::text[]));
