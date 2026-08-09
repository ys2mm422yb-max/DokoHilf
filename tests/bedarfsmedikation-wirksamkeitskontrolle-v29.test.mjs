import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../supabase/migrations/20260809131500_bedarfsmedikation_wirksamkeitskontrolle_v29.sql', import.meta.url),
  'utf8',
);

test('Bedarfsmedikation erzeugt automatisch eine Wirksamkeitskontrolle ohne erfundene Zeitangabe', () => {
  assert.match(migration, /'bedarfsmedikation-wirksamkeitskontrolle'/);
  assert.match(migration, /legt das System die zugehörige Wirksamkeitskontrolle automatisch an/);
  assert.match(migration, /keine neue Kontrolle selbst erstellen/);
  assert.match(migration, /zum vorgesehenen Zeitpunkt fällig/);
  assert.doesNotMatch(migration, /\b(?:15|30|45|60|90|120)\s*(?:min|minuten|minute)\b/i);
});

test('Wirksamkeitskontrolle wird im Durchführungsnachweis dokumentiert und unten mit OK abgeschlossen', () => {
  assert.match(migration, /„Doku“ und danach „Durchführungsnachweis“/);
  assert.match(migration, /Hake die Wirksamkeitskontrolle als durchgeführt ab/);
  assert.match(migration, /ob und wie die Bedarfsmedikation gewirkt beziehungsweise geholfen hat/);
  assert.match(migration, /Bestätige das Pop-up zum Schluss unten mit „OK“/);
  assert.match(migration, /Damit ist die Wirksamkeitskontrolle abgeschlossen/);
});

test('Ablauf ist für Medikation und Durchführungsnachweis freigegeben', () => {
  assert.match(migration, /'approved'/);
  assert.match(migration, /'product-confirmed'/);
  assert.match(migration, /where slug in \('durchfuehrungsnachweis', 'medikation'\)/);
  assert.match(migration, /wirksamkeitskontrolle bedarfsmedikation/);
  assert.match(migration, /wo muss ich die wirksamkeitskontrolle abhaken/);
});
