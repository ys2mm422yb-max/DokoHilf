-- v28: Bericht-Guides behalten auch bei Orientierungsfragen konkrete Hilfe.
-- Keine neue fachliche Logik: ergänzt nur den bereits bestätigten Einstieg
-- für Guides, deren erster Schritt den Bereich „Berichte“ öffnet.

update public.dokohilf_guides
set steps = jsonb_set(
  steps,
  '{0,stuck}',
  to_jsonb('Wähle zuerst den gewünschten Bewohner und suche danach in der festen Leiste nach „Berichte“.'::text),
  true
),
updated_at = now()
where status = 'approved'
  and slug like 'bericht-%'
  and coalesce(steps->0->>'text', '') like '%Bereich „Berichte“%'
  and coalesce(steps->0->>'stuck', '') = '';
