import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/voice-focus-mode.js', import.meta.url), 'utf8');

test('Sprachmodus zeigt nur aktuelle Anweisung und zentrale Animation', () => {
  assert.match(source, /voice-focus-instruction/);
  assert.match(source, /voice-focus-stage/);
  assert.match(source, /latestAssistantInstruction/);
  assert.match(source, /\.messages\{display:none!important\}/);
  assert.match(source, /Aktuelle Anweisung/);
});

test('Sprechanimation bleibt im sichtbaren Bereich und wird nicht mehr nach unten geschoben', () => {
  assert.match(source, /overflow:hidden!important/);
  assert.match(source, /height:calc\(100dvh - 64px\)/);
  assert.match(source, /position:relative!important/);
  assert.match(source, /bottom:auto!important/);
  assert.match(source, /voiceFocusRing/);
  assert.match(source, /voiceFocusSpeak/);
});

test('Schrittsteuerung und Wechsel zum Chat bleiben erreichbar', () => {
  assert.match(source, /data-switch-mode="chat"/);
  assert.match(source, /\.command-row\{position:fixed/);
  assert.match(source, /currentProgressLabel/);
  assert.match(source, /guideProgressTitle/);
  assert.match(source, /guideProgressStep/);
});

test('Sprachfokus speichert keine Gesprächsinhalte dauerhaft', () => {
  assert.doesNotMatch(source, /localStorage|indexedDB|sessionStorage/);
  assert.match(source, /MutationObserver/);
  assert.match(source, /textContent/);
});
