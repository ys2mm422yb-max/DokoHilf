import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../supabase/migrations/20260809124000_bedarfsmedikation_massnahmen_v29.sql', import.meta.url),
  'utf8',
);

test('Bedarfsmedikation erzeugt automatisch eine Wirksamkeitskontrolle ohne erfundene Zeitangabe', () => {
  assert.match(migration, /'bedarfsmedikation-wirksamkeitskontrolle'/);
  assert.match(migration, /automatisch vom System angelegt/);
  assert.match(migration, /keine neue Kontrolle selbst erstellen/);
  assert.match(migration, /zum vorgesehenen Zeitpunkt fällig/);
  assert.doesNotMatch(migration, /\b(?:15|30|45|60|90|120)\s*(?:min|minuten|minute)\b/i);
});

test('Wirksamkeitskontrolle wird im Durchführungsnachweis dokumentiert und unten mit OK abgeschlossen', () => {
  assert.match(migration, /festen grünen Leiste „Doku“/);
  assert.match(migration, /Wähle darunter „Durchführungsnachweis“/);
  assert.match(migration, /hake sie als durchgeführt ab/);
  assert.match(migration, /ob und wie die Bedarfsmedikation gewirkt beziehungsweise geholfen hat/);
  assert.match(migration, /Bestätige das Pop-up zum Schluss unten mit „OK“/);
});

test('Ablauf ist für Medikation und Durchführungsnachweis freigegeben', () => {
  assert.match(migration, /'approved'/);
  assert.match(migration, /'product-confirmed'/);
  assert.match(migration, /where slug = 'durchfuehrungsnachweis'/);
  assert.match(migration, /where slug = 'medikation'/);
  assert.match(migration, /wirksamkeitskontrolle bedarfsmedikation/);
  assert.match(migration, /wo muss ich die wirksamkeitskontrolle abhaken/);
});
