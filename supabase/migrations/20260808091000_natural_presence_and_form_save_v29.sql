-- v29: fachlich unveränderte, natürlichere An-/Abwesenheitsformulierungen
-- sowie der bestätigte Speicherschritt nach dem Bearbeiten eines Formulars.

update public.dokohilf_guides
set steps = jsonb_build_array(
  steps->0,
  steps->1,
  steps->2,
  steps->3,
  jsonb_build_object('text','Trage bei „Von“ immer Datum und Uhrzeit ein.','check','Sind bei „Von“ Datum und Uhrzeit eingetragen?'),
  jsonb_build_object('text','Trage bei „Bis“ nur dann Datum und Uhrzeit ein, wenn der Endzeitpunkt sicher feststeht. Wenn du den Endzeitpunkt noch nicht sicher kennst, lässt du „Bis“ einfach leer. Bitte nicht schätzen.','check','Steht der Endzeitpunkt sicher fest? Wenn nicht, bleibt „Bis“ leer.'),
  jsonb_build_object('text','Ergänze nur die Angaben, die du wirklich brauchst, zum Beispiel Ziel, Begleitung, Grund oder Bemerkung.','check','Ist alles eingetragen, was für diesen Eintrag gebraucht wird?'),
  jsonb_build_object('text','Speichere den Eintrag und prüfe kurz, ob er in der Übersicht erscheint.','check','Ist der Eintrag in der Übersicht sichtbar?')
),
troubleshooting = jsonb_build_object(
  'von_pflicht','Bei „Von“ gehören Datum und Uhrzeit immer dazu.',
  'bis_unsicher','Wenn der Endzeitpunkt noch nicht sicher feststeht, lässt du „Bis“ leer. Bitte nicht schätzen.'
),
version = greatest(version, 4),
updated_at = now()
where slug='anwesenheit' and status='approved';

update public.dokohilf_guides
set steps = steps || jsonb_build_array(
  jsonb_build_object(
    'text','Wenn du das Formular fertig bearbeitet hast, speicherst du es oben links in der Leiste.',
    'check','Wurde das Formular gespeichert?'
  )
),
version = greatest(version, 2),
updated_at = now()
where slug='formulare-anlegen' and status='approved'
  and not exists (
    select 1 from jsonb_array_elements(steps) step
    where coalesce(step->>'text','') like '%oben links in der Leiste%'
      and coalesce(step->>'text','') ilike '%speicher%'
  );
