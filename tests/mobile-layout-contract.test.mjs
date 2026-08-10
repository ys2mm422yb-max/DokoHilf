import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [mobileAudio, voiceDiagnostics, voiceFocus, clarification, progress, uiPolishCss, uiPolish, worker] = await Promise.all([
  readFile(new URL('../assets/mobile-audio-fix.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-diagnostics.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/voice-focus-mode.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/clarification-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-progress.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/ui-polish-v35.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/ui-polish-v35.js', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
]);

test('Sprachmodus nutzt die feste Fokusansicht statt der alten Sprachleiste', () => {
  assert.match(voiceFocus, /voice-focus-stage/);
  assert.match(voiceFocus, /voice-focus-instruction/);
  assert.match(voiceFocus, /position:fixed/);
  assert.match(voiceFocus, /inset:64px 0 0/);
  assert.doesNotMatch(mobileAudio, /position:fixed!important/);
  assert.doesNotMatch(mobileAudio, /installPersistentVoiceControl/);
});

test('Alte Sprachleisten- und Notfall-Kurzbefehle werden ausdrücklich entfernt', () => {
  assert.match(mobileAudio, /removeLegacyVoiceUi/);
  assert.match(mobileAudio, /persistentVoiceControlStyles/);
  assert.match(mobileAudio, /notfallblattButton/);
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
});

test('iPhone Chat verhindert Fokuszoom und hält den Composer im sichtbaren Bereich', () => {
  assert.match(uiPolishCss, /\.composer textarea\{[\s\S]*?font-size:16px!important/);
  assert.match(uiPolishCss, /\.composer textarea\{[\s\S]*?min-width:0!important/);
  assert.match(uiPolishCss, /-webkit-text-size-adjust:100%/);
  assert.match(uiPolishCss, /\.composer \.small-mic,[\s\S]*?\.composer \.send-button\{[\s\S]*?flex:0 0 auto!important/);
  assert.match(uiPolishCss, /\.composer-wrap\{[\s\S]*?overflow-x:clip!important/);
});

test('laufender Chat blendet nur Starterkarte und technischen Footer aus', () => {
  assert.match(uiPolish, /CHAT_UI_REVISION = '20260810-ios-keyboard-chat-v37-1'/);
  assert.match(uiPolish, /function syncChatState\(\)/);
  assert.match(uiPolish, /#messages > \.message\.user/);
  assert.match(uiPolish, /app\.dataset\.v35ChatStarted/);
  assert.match(uiPolishCss, /data-v35-chat-started="true"\][\s\S]*?\.chat-head/);
  assert.match(uiPolishCss, /data-v35-chat-started="true"\][\s\S]*?\.footer-version-wrap/);
  assert.match(worker, /CHAT_UI_REVISION = '20260810-ios-keyboard-chat-v37-1'/);
  assert.match(worker, /chatUiRevision: CHAT_UI_REVISION/);
});

test('Touchflächen bleiben auf Mobilgeräten ausreichend groß', () => {
  assert.match(clarification, /min-height:56px/);
  assert.match(progress, /min-height:40px/);
  assert.match(voiceFocus, /min-height:46px/);
  assert.match(voiceFocus, /width:clamp\(168px/);
});

test('Aktuelle Anweisung und Ablaufsteuerung bleiben im Sprachmodus sichtbar', () => {
  assert.match(voiceFocus, /latestAssistantInstruction/);
  assert.match(voiceFocus, /DokoHilfGuideProgress/);
  assert.match(voiceFocus, /voice-focus-actions/);
  assert.match(voiceFocus, /data-switch-mode="chat"/);
  assert.match(voiceDiagnostics, /pageshow/);
});
