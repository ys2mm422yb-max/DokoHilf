import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [index, css, experience, serviceWorker, version, tts, migration] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('assets/premium-ui-v27.css', 'utf8'),
  readFile('assets/experience-v27.js', 'utf8'),
  readFile('service-worker.js', 'utf8'),
  readFile('version.json', 'utf8'),
  readFile('supabase/functions/dokohilf-tts/index.ts', 'utf8'),
  readFile('supabase/migrations/20260806173000_remove_repeated_exercise_notices.sql', 'utf8'),
]);

test('build 27 assets are wired consistently', () => {
  assert.match(index, /dokohilf-build" content="20260806-27/);
  assert.match(index, /premium-ui-v27\.css\?v=20260806-27/);
  assert.match(index, /experience-v27\.js\?v=20260806-27/);
  assert.match(index, /KI · v27/);
  assert.match(serviceWorker, /BUILD_ID = '20260806-27'/);
  assert.match(serviceWorker, /premium-ui-v27\.css\?v=20260806-27/);
  assert.match(serviceWorker, /experience-v27\.js\?v=20260806-27/);
  assert.equal(JSON.parse(version).buildId, '20260806-27');
});

test('dark premium home and workflow shortcuts are present', () => {
  assert.match(css, /--v27-bg:#020c12/);
  assert.match(css, /color-scheme:dark/);
  assert.match(css, /\.examples\{display:grid/);
  assert.match(index, /Was möchtest du erledigen\?/);
  assert.match(index, /Häufige Abläufe/);
  assert.match(index, /Bericht anlegen/);
  assert.match(index, /Visite anlegen/);
  assert.match(index, /Medikation ansehen/);
  assert.doesNotMatch(index, /Fantasiedaten/);
});

test('voice starts quickly and keeps natural audio warm in memory', () => {
  assert.match(experience, /FAST_FALLBACK_MS = 2400/);
  assert.match(experience, /fastRace\(loadNaturalVoice/);
  assert.match(experience, /cloudPromise\.catch/);
  assert.match(experience, /payload\.nextSpokenText/);
  assert.match(experience, /memory = new Map/);
  assert.match(experience, /__DOKOHILF_DARK_PREMIUM_V27__/);
});

test('cloud voice uses shorter deadlines and a larger transient cache', () => {
  assert.match(tts, /VOICE_NAME = 'Gacrux'/);
  assert.match(tts, /VOICE_STYLE = 'natural-spoken-german-colleague-v8-hybrid-fast'/);
  assert.match(tts, /PRIMARY_TIMEOUT_MS = 3_200/);
  assert.match(tts, /FALLBACK_TIMEOUT_MS = 1_800/);
  assert.match(tts, /CACHE_TTL_MS = 60 \* 60_000/);
  assert.match(tts, /CACHE_LIMIT = 128/);
});

test('repeated exercise notices are removed centrally without weakening privacy', () => {
  assert.match(migration, /remove repeated/i);
  assert.match(migration, /guide\.steps::text ilike '%Fantasiedaten%'/);
  assert.match(index, /Keine persönlichen Daten eingeben/);
  assert.match(index, /Schutzfilter prüft jede Eingabe/);
});
