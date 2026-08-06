-- Sprachvarianten für konkret benannte Einzelwerte.
update public.dokohilf_guides
set aliases = array[
  'einzelnen vitalwert erfassen', 'einen vitalwert eingeben', 'blutdruck eingeben',
  'blutdruck eintragen', 'blutdruck erfassen', 'puls eingeben', 'puls eintragen',
  'temperatur eingeben', 'temperatur eintragen', 'gewicht eingeben', 'gewicht eintragen',
  'blutzucker eingeben', 'blutzucker eintragen', 'sauerstoffsättigung eingeben'
], updated_at = now()
where slug = 'vitalwerte-einzelwert';
