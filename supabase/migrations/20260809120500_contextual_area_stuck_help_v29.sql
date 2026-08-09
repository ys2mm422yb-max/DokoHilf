-- v29 follow-up: when a user is already inside a guide and cannot find the named area,
-- keep the current guide active and provide a concrete confirmed location hint.
-- Also remove cross-topic pending labels introduced by the previous migration.

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{0,stuck}',
      to_jsonb('„Doku-Erweitert“ findest du beim geöffneten Bewohner in der festen Leiste. Öffne „Doku-Erweitert“ und wähle danach „Visiten“.'::text),
      true
    ),
    updated_at = now(),
    change_note = 'Bereichs-Ortung für Visiten im laufenden Guide ergänzt.'
where slug = 'visite-anlegen'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{1,stuck}',
      to_jsonb('„Doku-Erweitert“ findest du beim geöffneten Bewohner in der festen Leiste. Öffne es und wähle darin „An-/Abwesenheiten“.'::text),
      true
    ),
    updated_at = now(),
    change_note = 'Bereichs-Ortung für An-/Abwesenheiten im laufenden Guide ergänzt.'
where slug = 'anwesenheit'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{1,stuck}',
      to_jsonb('„Doku-Erweitert“ findest du beim geöffneten Bewohner in der festen Leiste. Öffne es und wähle darin „Medikation“.'::text),
      true
    ),
    updated_at = now(),
    change_note = 'Bereichs-Ortung für Medikation im laufenden Guide ergänzt.'
where slug = 'medikation-ansehen'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{1,stuck}',
      to_jsonb('„Doku-Erweitert“ findest du beim geöffneten Bewohner in der festen Leiste. Öffne es und wähle darin „Formulare“.'::text),
      true
    ),
    updated_at = now(),
    change_note = 'Bereichs-Ortung für Formulare im laufenden Guide ergänzt.'
where slug = 'formulare-anlegen'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{1,stuck}',
      to_jsonb('„Doku-Erweitert“ findest du beim geöffneten Bewohner in der festen Leiste. Öffne es und wähle darin „Vitalwerte“.'::text),
      true
    ),
    updated_at = now(),
    change_note = 'Bereichs-Ortung für einzelne Vitalwerte im laufenden Guide ergänzt.'
where slug = 'vitalwerte-einzelwert'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{1,stuck}',
      to_jsonb('„Doku-Erweitert“ findest du beim geöffneten Bewohner in der festen Leiste. Öffne es und wähle direkt „Vitalwerte Sammelerf.“. „Vitalwerte“ und „Vitalwerte Sammelerf.“ sind zwei getrennte Einträge.'::text),
      true
    ),
    updated_at = now(),
    change_note = 'Bereichs-Ortung für Vitalwerte-Sammelerfassung im laufenden Guide präzisiert.'
where slug = 'vitalwerte-sammelerfassung'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(
        steps,
        '{0,stuck}',
        to_jsonb('„Doku“ findest du beim geöffneten Bewohner in der festen Leiste. Öffne dort „Doku“.'::text),
        true
      ),
      '{1,stuck}',
      to_jsonb('Öffne zuerst „Doku“ in der festen Leiste und wähle darin „Durchführungsnachweis“.'::text),
      true
    ),
    updated_at = now(),
    change_note = 'Bereichs-Ortung für Durchführung stornieren im laufenden Guide ergänzt.'
where slug = 'durchfuehrung-storno'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(
        steps,
        '{0,stuck}',
        to_jsonb('Den Reiter „Analyse“ findest du oben. Öffne dort „Analyse“.'::text),
        true
      ),
      '{1,stuck}',
      to_jsonb('Öffne oben zuerst „Analyse“ und wähle darin „Was war los?“.'::text),
      true
    ),
    updated_at = now(),
    change_note = 'Bereichs-Ortung für Übergabe/Was war los im laufenden Guide ergänzt.'
where slug = 'uebergabeformular'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{2,stuck}',
      to_jsonb('Ganz oben links öffnest du über das kleine rote Kreuz beziehungsweise den zugehörigen Pfeil das Menü. Darin wählst du „Notfallblatt aufrufen“.'::text),
      true
    ),
    updated_at = now(),
    change_note = 'Bereichs-Ortung für Notfallblatt im laufenden Guide ergänzt.'
where slug = 'notfallblatt'
  and status = 'approved';

-- Keep each pending marker only on its own topic.
update public.dokohilf_topics
set unconfirmed_actions = array_remove(
      coalesce(unconfirmed_actions, '{}'::text[]),
      'Easy-Plan fachlich später freigeben'
    ),
    updated_at = now()
where slug = 'aufgaben';

update public.dokohilf_topics
set unconfirmed_actions = array_remove(
      coalesce(unconfirmed_actions, '{}'::text[]),
      'Aufgaben · Aktuelles fachlich später freigeben'
    ),
    updated_at = now()
where slug = 'easyplan';
