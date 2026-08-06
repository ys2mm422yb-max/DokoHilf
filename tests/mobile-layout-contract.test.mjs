import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [mobileAudio, voiceDiagnostics, voiceFocus, clarification, progress, taskInterface] = await Promise.all([
  readFile(new URL('../assets/mobile-audio-fix.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-diagnostics.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-focus-mode.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/clarification-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-progress.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/task-interface.js', import.meta.url), 'utf8'),
]);

test('Sprachmodus nutzt die feste Fokusansicht statt der alten Sprachleiste', () => {
  assert.match(voiceFocus, /voice-focus-stage/);
  assert.match(voiceFocus, /voice-focus-instruction/);
  assert.match(voiceFocus, /position:fixed/);
  assert.match(voiceFocus, /inset:64px 0 0/);
  assert.doesNotMatch(mobileAudio, /position:fixed!important/);
  assert.doesNotMatch(mobileAudio, /installPersistentVoiceControl/);
});

test('Alte Sprachleisten und rote Kurzbefehle werden dauerhaft entfernt', () => {
  assert.match(mobileAudio, /removeLegacyVoiceUi/);
  assert.match(taskInterface, /removeLegacyShortcuts/);
  assert.match(taskInterface, /notfallblattButton/);
  assert.match(taskInterface, /label === '\+'/);
  assert.match(voiceFocus, /removeLegacyShortcuts/);
  assert.doesNotMatch(mobileAudio, /addNotfallblattShortcut/);
});

test('iOS- und Android-Safe-Area sowie Bildschirmtastatur werden berücksichtigt', () => {
  assert.match(voiceFocus, /safe-area-inset-bottom/);
  assert.match(voiceFocus, /safe-area-inset-left/);
  assert.match(voiceFocus, /safe-area-inset-right/);
  assert.match(voiceDiagnostics, /visualViewport/);
  assert.match(voiceDiagnostics, /--dokohilf-keyboard-offset/);
  assert.match(voiceDiagnostics, /orientationchange/);
  assert.match(taskInterface, /safe-area-inset-bottom/);
});

test('Touchflächen bleiben auf Mobilgeräten ausreichend groß', () => {
  assert.match(clarification, /min-height:76px/);
  assert.match(progress, /min-height:38px/);
  assert.match(voiceFocus, /min-height:(?:40|46)px/);
  assert.match(taskInterface, /min-height:48px!important/);
});

test('Aktuelle Anweisung und Ablaufsteuerung bleiben im Sprachmodus sichtbar', () => {
  assert.match(voiceFocus, /latestAssistantInstruction/);
  assert.match(voiceFocus, /DokoHilfGuideProgress/);
  assert.match(voiceFocus, /voice-focus-actions/);
  assert.match(voiceFocus, /data-switch-mode="chat"/);
  assert.match(taskInterface, /voice-focus-instruction/);
  assert.match(voiceDiagnostics, /pageshow/);
});
