import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [mobileAudio, voiceDiagnostics, clarification, progress, styles] = await Promise.all([
  readFile(new URL('../assets/mobile-audio-fix.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-diagnostics.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/clarification-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-progress.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/styles.css', import.meta.url), 'utf8'),
]);

test('Sprachleiste ist auf kleinen und großen Mobilansichten fest sichtbar', () => {
  assert.match(mobileAudio, /@media \(max-width:900px\)/);
  assert.match(mobileAudio, /@media \(max-width:380px\)/);
  assert.match(mobileAudio, /position:fixed!important/);
  assert.match(mobileAudio, /visibility:visible!important/);
  assert.match(mobileAudio, /z-index:100!important/);
});

test('iOS- und Android-Safe-Area sowie Bildschirmtastatur werden berücksichtigt', () => {
  assert.match(mobileAudio, /safe-area-inset-bottom/);
  assert.match(mobileAudio, /safe-area-inset-left/);
  assert.match(mobileAudio, /safe-area-inset-right/);
  assert.match(voiceDiagnostics, /visualViewport/);
  assert.match(voiceDiagnostics, /--dokohilf-keyboard-offset/);
  assert.match(voiceDiagnostics, /orientationchange/);
});

test('Touchflächen bleiben auf Mobilgeräten ausreichend groß', () => {
  assert.match(clarification, /min-height:56px/);
  assert.match(progress, /min-height:38px/);
  assert.match(mobileAudio, /min-height:42px/);
  assert.match(styles, /touch-action/);
});

test('feste Sprachleiste überdeckt Nachrichten und Steuerungen nicht', () => {
  assert.match(mobileAudio, /padding-bottom:calc\(126px/);
  assert.match(voiceDiagnostics, /padding-bottom:calc\(142px/);
  assert.match(mobileAudio, /scroll-margin-top:88px/);
  assert.match(voiceDiagnostics, /syncVoiceConsole/);
});

test('Moduswechsel und Rückkehr in die PWA stellen Sprachleiste wieder her', () => {
  assert.match(mobileAudio, /MutationObserver/);
  assert.match(mobileAudio, /attributeFilter: \['data-mode'\]/);
  assert.match(voiceDiagnostics, /pageshow/);
  assert.match(voiceDiagnostics, /visibilitychange/);
});
