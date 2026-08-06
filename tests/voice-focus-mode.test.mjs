import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/voice-focus-mode.js', import.meta.url), 'utf8');

test('Sprachmodus zeigt nur aktuelle Anweisung und zentrale Animation', () => {
  assert.match(source, /voice-focus-instruction/);
  assert.match(source, /voice-focus-stage/);
  assert.match(source, /latestAssistantInstruction/);
  assert.match(source, /\.conversation.*display:none!important/);
  assert.match(source, /Aktuelle Anweisung/);
});

test('Sprechanimation liegt als feste Vollbildansicht über dem Chat', () => {
  assert.match(source, /position:fixed/);
  assert.match(source, /inset:64px 0 0/);
  assert.match(source, /overflow:hidden/);
  assert.match(source, /voiceFocusRing/);
  assert.match(source, /voiceFocusSpeak/);
});

test('Schrittsteuerung und Wechsel zum Chat bleiben erreichbar', () => {
  assert.match(source, /data-switch-mode="chat"/);
  assert.match(source, /voice-focus-actions/);
  assert.match(source, /data-voice-command="weiter"/);
  assert.match(source, /DokoHilfGuideProgress/);
  assert.match(source, /dokohilf:guide-state/);
});

test('Alte rote Kurzbefehle werden auch bei späterem Einfügen entfernt', () => {
  assert.match(source, /removeLegacyShortcuts/);
  assert.match(source, /notfallblattButton/);
  assert.match(source, /MutationObserver\(removeLegacyShortcuts\)/);
});

test('Sprachfokus speichert keine Gesprächsinhalte dauerhaft', () => {
  assert.doesNotMatch(source, /localStorage|indexedDB|sessionStorage/);
  assert.match(source, /MutationObserver/);
  assert.match(source, /textContent/);
});
