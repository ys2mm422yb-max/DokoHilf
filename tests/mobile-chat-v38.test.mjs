import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [mobilePolish, uiPolishCss, worker] = await Promise.all([
  readFile(new URL('../assets/mobile-polish-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/ui-polish-v35.css', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
]);

test('finale Mobile-Schicht hält das Chat-Eingabefeld auf mindestens 16px', () => {
  assert.match(uiPolishCss, /\.composer textarea\{[\s\S]*?font-size:16px!important/);
  assert.match(mobilePolish, /\.composer textarea\{[^}]*font-size:16px!important/);
  assert.doesNotMatch(mobilePolish, /\.composer textarea\{[^}]*font-size:15px!important/);
  assert.match(mobilePolish, /\.composer textarea\{[^}]*-webkit-text-size-adjust:100%/);
});

test('mobiler Chat füllt den sichtbaren Viewport und hält den Composer unten', () => {
  assert.match(mobilePolish, /CHAT_VIEWPORT_REVISION = '20260810-mobile-chat-viewport-v38-1'/);
  assert.match(mobilePolish, /height:var\(--dokohilf-chat-viewport-height,100dvh\)!important/);
  assert.match(mobilePolish, /\.main-content\{[\s\S]*?overflow-y:auto!important/);
  assert.match(mobilePolish, /\.composer-wrap\{[\s\S]*?position:relative!important/);
  assert.match(mobilePolish, /function syncChatViewport\(\)/);
  assert.match(mobilePolish, /window\.visualViewport/);
  assert.match(mobilePolish, /function syncLatestMessage\(\)/);
  assert.match(mobilePolish, /scrollIntoView\(\{ block: 'end'/);
});

test('aktive Chat-Schritte nutzen klarere Aktionsbeschriftungen', () => {
  assert.match(mobilePolish, /Erledigt, weiter/);
  assert.match(mobilePolish, /Hilfe zum Schritt/);
  assert.match(mobilePolish, /setAttribute\('enterkeyhint', 'send'\)/);
  assert.match(mobilePolish, /message\.user \.bubble\{color:#f7fffb!important/);
  assert.match(mobilePolish, /composer-wrap>p\{[^}]*font-size:10\.5px!important/);
});

test('PWA veröffentlicht die neue Chat-Viewport-Revision', () => {
  assert.match(worker, /CHAT_UI_REVISION = '20260810-mobile-chat-viewport-v38-1'/);
  assert.match(worker, /chatUiRevision: CHAT_UI_REVISION/);
});
