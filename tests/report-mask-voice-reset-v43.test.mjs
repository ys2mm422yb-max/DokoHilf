import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [confirmed, migration, directHotfix, audioCatalog, mobileAudio] = await Promise.all([
  read('CONFIRMED_WORKFLOWS.md'),
  read('supabase/migrations/20260812131000_correct_report_textfield_visibility_v43.sql'),
  read('assets/report-guide-hotfix-v43.js'),
  read('assets/guide-audio-catalog.json'),
  read('assets/mobile-audio-fix.js'),
]);

const approvedReportText = 'Das große Textfeld für den Bericht ist in dieser Maske bereits unten sichtbar';

test('Bericht anlegen sagt nicht mehr, dass das Textfeld erst nach der Kategorieauswahl geöffnet wird', () => {
  assert.match(confirmed, /Das große Textfeld für den Bericht ist unten in derselben Maske bereits sichtbar/);
  assert.match(confirmed, /sich nicht erst durch die Auswahl der Berichtskategorie öffnet/);
  assert.doesNotMatch(confirmed, /Danach öffnet sich die Eingabemaske für den Bericht/);

  assert.match(migration, new RegExp(approvedReportText));
  assert.match(migration, /version = 10/);
  assert.match(migration, /version = 9/);
  assert.match(migration, /precondition failed/);

  assert.match(directHotfix, new RegExp(approvedReportText));
  assert.match(directHotfix, /title !== 'Bericht anlegen'/);

  assert.match(audioCatalog, new RegExp(approvedReportText));
  assert.doesNotMatch(audioCatalog, /Danach öffnet sich das Fenster für den Berichtseintrag/);
});

test('Neu in einem laufenden Sprachmodus entsperrt Audio erneut im trusted gesture', () => {
  assert.match(mobileAudio, /event\.isTrusted/);
  assert.match(mobileAudio, /dataset\.mode === 'voice'/);
  assert.match(mobileAudio, /target\.closest\('#resetButton'\)/);
  assert.match(mobileAudio, /pointerdown/);
  assert.match(mobileAudio, /touchend/);
  assert.match(mobileAudio, /unlockAudioPlayback/);
});
