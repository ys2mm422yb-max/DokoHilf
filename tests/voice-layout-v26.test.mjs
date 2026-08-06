import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const legacyCss = await readFile(new URL('../assets/premium-ui-v26.css', import.meta.url), 'utf8');
const currentCss = await readFile(new URL('../assets/premium-ui-v27.css', import.meta.url), 'utf8');
const experience = await readFile(new URL('../assets/experience-v27.js', import.meta.url), 'utf8');
const worker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('bewährte Trennung von Anweisung und Mikrofon bleibt erhalten', () => {
  assert.match(legacyCss, /voice-focus-main/);
  assert.match(legacyCss, /grid-template-rows:minmax\(92px,auto\) minmax\(0,1fr\)/);
  assert.match(legacyCss, /voice-focus-instruction[\s\S]*max-height/);
  assert.match(legacyCss, /#voiceFocusConsoleSlot[\s\S]*min-height:0/);
});

test('lange Anweisungen bleiben lesbar und überdecken die Animation nicht', () => {
  assert.match(legacyCss, /voice-focus-instruction[\s\S]*overflow:auto/);
  assert.match(legacyCss, /overflow-wrap:anywhere/);
  assert.match(legacyCss, /z-index:4/);
  assert.match(legacyCss, /voice-focus-stage \.voice-orb[\s\S]*clamp/);
});

test('kleine und niedrige iPhones behalten die verdichtete Darstellung', () => {
  assert.match(legacyCss, /@media\(max-width:680px\)/);
  assert.match(legacyCss, /@media\(max-height:760px\)/);
  assert.match(legacyCss, /@media\(max-height:650px\)/);
  assert.match(legacyCss, /width:104px/);
  assert.match(currentCss, /@media\(max-width:680px\)/);
  assert.match(currentCss, /@media\(max-height:760px\)/);
});

test('Ladehinweis bleibt ohne buggy animierte Punkte', () => {
  assert.match(legacyCss, /voice-copy strong:after\{content:none/);
  assert.match(experience, /Stimme startet/);
  assert.match(experience, /Bekannte Schritte starten direkt/);
});

test('Build 27 lädt die bewährte v26-Basisschicht und die neue v27-Erfahrung gemeinsam', () => {
  assert.match(html, /premium-ui-v26\.css\?v=20260806-27/);
  assert.match(html, /premium-ui-v27\.css\?v=20260806-27/);
  assert.match(html, /experience-v27\.js\?v=20260806-27/);
  assert.match(worker, /premium-ui-v26\.css\?v=20260806-27/);
  assert.match(worker, /premium-ui-v27\.css\?v=20260806-27/);
  assert.match(worker, /experience-v27\.js\?v=20260806-27/);
});
