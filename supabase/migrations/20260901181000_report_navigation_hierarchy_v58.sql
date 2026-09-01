-- v58: align the report guide family with the confirmed two-level navigation hierarchy.
-- Confirmed hierarchy: Doku is a main tab in the fixed green top bar; Bericht is a function
-- in the white band directly below Doku. Do not describe Bericht/Berichte as a green main tab.

update public.dokohilf_guides
set steps = jsonb_set(
      jsonb_set(
        steps,
        '{0,text}',
        to_jsonb('Beim geöffneten Bewohner öffnest du oben in der festen grünen Hauptleiste „Doku“. Im weißen Funktionsband direkt darunter wählst du „Bericht“. Danach ist der Bereich „Berichte“ geöffnet.'::text),
        false
      ),
      '{0,stuck}',
      to_jsonb('„Doku“ liegt oben in der festen grünen Hauptleiste zwischen „Planung“ und „Doku-Erweitert“. Öffne „Doku“ und wähle im weißen Funktionsband direkt darunter „Bericht“.'::text),
      false
    ),
    change_note = 'Bericht-Navigation korrigiert: Doku ist Hauptreiter; Bericht liegt im weißen Funktionsband darunter.'
where slug = 'berichte-finden'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{0,stuck}',
      to_jsonb('Wähle zuerst den gewünschten Bewohner. Öffne oben in der festen grünen Hauptleiste „Doku“ und wähle im weißen Funktionsband direkt darunter „Bericht“.'::text),
      false
    ),
    change_note = 'Bericht-Navigation in der Schritt-Hilfe korrigiert: Doku → Bericht.'
where slug = 'bericht-neu'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{0,stuck}',
      to_jsonb('Wähle zuerst den gewünschten Bewohner. Öffne oben in der festen grünen Hauptleiste „Doku“ und wähle im weißen Funktionsband direkt darunter „Bericht“.'::text),
      false
    ),
    change_note = 'Bericht-Navigation in der Schritt-Hilfe korrigiert: Doku → Bericht.'
where slug = 'bericht-durchstreichen'
  and status = 'approved';

update public.dokohilf_guides
set steps = jsonb_set(
      steps,
      '{0,stuck}',
      to_jsonb('Wähle zuerst den gewünschten Bewohner. Öffne oben in der festen grünen Hauptleiste „Doku“ und wähle im weißen Funktionsband direkt darunter „Bericht“.'::text),
      false
    ),
    change_note = 'Bericht-Navigation in der Schritt-Hilfe korrigiert: Doku → Bericht.'
where slug = 'bericht-folgebericht'
  and status = 'approved';
