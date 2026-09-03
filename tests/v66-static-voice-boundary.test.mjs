import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [gate, hotfix, buildScript, catalogRaw] = await Promise.all([
  readFile(new URL('../assets/local-voice-gate-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/context-voice-hotfix-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-supertonic-guide-audio-v28.py', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-audio-catalog.json', import.meta.url), 'utf8'),
]);

const catalog = JSON.parse(catalogRaw);
const published = catalog.entries.map(entry => String(entry.text || '')).join('\n');

test('v66 behält ausschließlich den statischen Supertonic-F1-Pfad', () => {
  assert.match(gate, /STATIC_VOICE\s*=\s*'Supertonic-F1'/);
  assert.match(gate, /static-supertonic-only-v29/);
  assert.match(hotfix, /static-supertonic/i);
  assert.match(buildScript, /voice.*F1/i);
  assert.equal(catalog.voice, 'Supertonic-F1');
});

test('bekannte veraltete Navigations- und DNF-Sätze sind nicht mehr veröffentlichbar', () => {
  const forbidden = [
    'Berichte ist ein Hauptbereich',
    'Hauptbereiche Berichte, Doku-Erweitert, Doku, Planung und Analyse',
    'Wähle „Alles ausklappen“',
    'Was möchtest du im Durchführungsnachweis machen: eine Bedarfsmedikation dokumentieren',
    'Wähle den passenden Status aus, zum Beispiel „Abwesend“',
  ];
  for (const fragment of forbidden) assert.ok(!published.includes(fragment), fragment);
  assert.match(buildScript, /FORBIDDEN_PUBLISHED_FRAGMENTS/);
});
