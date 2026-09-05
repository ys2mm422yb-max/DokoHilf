import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [orientationSource, navigationRaw, uxSource] = await Promise.all([
  readFile(new URL('../assets/orientation-help-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-navigation-catalog-v29.json', import.meta.url), 'utf8'),
  readFile(new URL('../assets/chat-guide-ux-v70.js', import.meta.url), 'utf8'),
]);

const navigation = JSON.parse(navigationRaw);
const texts = navigation.entries.map(entry => entry.text);
const expected = 'Doku-Erweitert ist ein Hauptreiter in der grünen Hauptleiste ganz oben, direkt rechts von Doku. Nach Auswahl von Doku-Erweitert erscheinen direkt darunter die zugehörigen Funktionen im weißen Funktionsband.';

test('v70 priorisiert nur den bereits bestätigten Doku-Erweitert-Ortstext', () => {
  assert.equal(navigation.voice, 'Supertonic-F1');
  assert.ok(texts.includes(expected));
  assert.ok(orientationSource.includes(`return '${expected}'`));
  assert.match(uxSource, /const api = window\.DokoHilfOrientationHelpV29/);
  assert.match(uxSource, /api\.isLocationQuestion\?\.\(text\) === true/);
  assert.match(uxSource, /const orientationText = isLocationQuestion \? text : 'Wo ist Doku-Erweitert'/);
  assert.match(uxSource, /api\.responseFor\?\.\(parsed, orientationText\)/);
  assert.match(uxSource, /source: 'confirmed-guide-orientation-v70'/);
  assert.doesNotMatch(uxSource, /speechSynthesis|SpeechSynthesisUtterance|cloud.*tts|elevenlabs/i);
});
