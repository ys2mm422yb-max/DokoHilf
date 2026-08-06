import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../assets/premium-ui-v26.css', import.meta.url), 'utf8');
const experience = await readFile(new URL('../assets/experience-v26.js', import.meta.url), 'utf8');
const worker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('Anweisung und Mikrofon liegen in getrennten Grid-Zeilen', () => {
  assert.match(css, /voice-focus-main/);
  assert.match(css, /grid-template-rows:minmax\(92px,auto\) minmax\(0,1fr\)/);
  assert.match(css, /voice-focus-instruction[\s\S]*max-height/);
  assert.match(css, /#voiceFocusConsoleSlot[\s\S]*min-height:0/);
});

test('lange Anweisungen bleiben lesbar und überdecken die Animation nicht', () => {
  assert.match(css, /voice-focus-instruction[\s\S]*overflow:auto/);
  assert.match(css, /overflow-wrap:anywhere/);
  assert.match(css, /z-index:4/);
  assert.match(css, /voice-focus-stage \.voice-orb[\s\S]*clamp/);
});

test('kleine und niedrige iPhones erhalten kleinere Animationen', () => {
  assert.match(css, /@media\(max-width:680px\)/);
  assert.match(css, /@media\(max-height:760px\)/);
  assert.match(css, /@media\(max-height:650px\)/);
  assert.match(css, /width:104px/);
});

test('Buggy Punkte im Ladehinweis werden vollständig entfernt', () => {
  assert.match(css, /voice-copy strong:after\{content:none/);
  assert.match(experience, /Stimme lädt/);
  assert.match(experience, /Die Anweisung ist schon vollständig sichtbar/);
});

test('Build 27 behält beide v26-Grundassets bei', () => {
  assert.match(html, /premium-ui-v26\.css\?v=20260806-27/);
  assert.match(html, /experience-v26\.js\?v=20260806-27/);
  assert.match(worker, /premium-ui-v26\.css\?v=20260806-27/);
  assert.match(worker, /experience-v26\.js\?v=20260806-27/);
});
