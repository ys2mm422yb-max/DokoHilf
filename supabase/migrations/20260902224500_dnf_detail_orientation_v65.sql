-- v65: keep the generic DNF route inside the confirmed boundary.
-- General sign-off is confirmed only up to the opened Durchführungsnachweis.
-- Dedicated, already confirmed detail guides remain separate.

update public.dokohilf_guides
set steps = jsonb_build_array(steps->0, steps->1),
    troubleshooting = coalesce(troubleshooting, '{}'::jsonb) || jsonb_build_object(
      'allgemeines_abzeichnen',
      'Für allgemeines Abzeichnen ist der bestätigte Weg nur bis zum geöffneten Durchführungsnachweis dokumentiert. Danach wird kein weiterer Klickweg erfunden, solange der konkrete Ablauf nicht ausdrücklich bestätigt ist.',
      'bestaetigte_detailwege',
      'Für Bedarfsmedikation, Wirksamkeitskontrolle, Maßnahmen ohne Zeitangabe und das Stornieren einer falschen Durchführung gibt es eigene bestätigte Abläufe.'
    ),
    version = version + 1,
    reviewed_at = now(),
    reviewed_role = 'product-confirmed',
    updated_at = now(),
    approved_at = now(),
    review_due_at = now() + interval '180 days',
    change_note = 'v65: unbestätigte allgemeine DNF-Folgeauswahl entfernt; der allgemeine Weg endet bewusst beim geöffneten Durchführungsnachweis, bestätigte Detailwege bleiben separat.'
where slug = 'durchfuehrungsnachweis-oeffnen'
  and status = 'approved'
  and jsonb_array_length(steps) = 3
  and steps->2->>'text' = 'Wähle jetzt, ob du eine Durchführung dokumentieren, eine falsche Durchführung stornieren oder nur einen Nachweis ansehen möchtest.';