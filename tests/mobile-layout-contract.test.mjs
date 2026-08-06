import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [mobileAudio, voiceDiagnostics, voiceFocus, clarification, progress] = await Promise.all([
  readFile(new URL('../assets/mobile-audio-fix.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-diagnostics.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-focus-mode.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/clarification-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-progress.js', import.meta.url), 'utf8'),
]);

test('Sprachmodus nutzt die zentrale Fokusansicht statt der alten festen Sprachleiste', () => {
  assert.match(voiceFocus, /voice-focus-stage/);
  assert.match(voiceFocus, /voice-focus-instruction/);
  assert.match(voiceFocus, /height:calc\(100dvh - 64px\)/);
  assert.doesNotMatch(mobileAudio, /position:fixed!important/);
  assert.doesNotMatch(mobileAudio, /installPersistentVoiceControl/);
});

test('Alte Sprachleisten- und Notfall-Kurzbefehle werden ausdrücklich entfernt', () => {
  assert.match(mobileAudio, /removeLegacyVoiceUi/);
  assert.match(mobileAudio, /persistentVoiceControlStyles/);
  assert.match(mobileAudio, /notfallblattButton/);
  assert.doesNotMatch(mobileAudio, /addNotfallblattShortcut/);
});

test('iOS- und Android-Safe-Area sowie Bildschirmtastatur werden berücksichtigt', () => {
  assert.match(voiceFocus, /safe-area-inset-bottom/);
  assert.match(voiceFocus, /safe-area-inset-left/);
  assert.match(voiceFocus, /safe-area-inset-right/);
  assert.match(voiceDiagnostics, /visualViewport/);
  assert.match(voiceDiagnostics, /--dokohilf-keyboard-offset/);
  assert.match(voiceDiagnostics, /orientationchange/);
});

test('Touchflächen bleiben auf Mobilgeräten ausreichend groß', () => {
  assert.match(clarification, /min-height:56px/);
  assert.match(progress, /min-height:38px/);
  assert.match(voiceFocus, /min-height:44px!important/);
  assert.match(voiceFocus, /width:clamp\(168px/);
});

test('Aktuelle Anweisung und Ablaufsteuerung bleiben im Sprachmodus sichtbar', () => {
  assert.match(voiceFocus, /latestAssistantInstruction/);
  assert.match(voiceFocus, /currentProgressLabel/);
  assert.match(voiceFocus, /\.command-row\{position:fixed/);
  assert.match(voiceFocus, /data-switch-mode="chat"/);
  assert.match(voiceDiagnostics, /pageshow/);
});
