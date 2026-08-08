import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [ui, axisCss, sw] = await Promise.all([
  readFile(new URL('../assets/v29-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/card-axis-fix-v29.css', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
]);

test('v29 premium home keeps the start screen free of the composer', () => {
  assert.match(ui, /\.app-shell\[data-mode="start"\] \.composer-wrap\{display:none!important\}/);
});

test('v29 premium home renders the accepted visual hierarchy', () => {
  assert.match(ui, /Dein KI-Assistent für Dokumentation/);
  assert.match(ui, /Was möchtest du <span data-v29-home-accent>erledigen\?<\/span>/);
  assert.match(ui, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(ui, /Häufige Abläufe · direkt öffnen/);
  assert.match(ui, /data-home-symbol/);
  assert.match(ui, /mode-card\.voice-card/);
  assert.match(ui, /mode-card\.chat-card/);
});

test('mobile header reserves the iPhone status-bar safe area', () => {
  assert.match(axisCss, /env\(safe-area-inset-top\)/);
  assert.match(axisCss, /margin-top:max\(10px,calc\(env\(safe-area-inset-top\) \+ 8px\)\)!important/);
  assert.match(axisCss, /\.app-shell\[data-mode="start"\] > \.topbar/);
  assert.match(axisCss, /\.app-shell\[data-mode="chat"\] > \.topbar/);
});

test('premium home refreshes the PWA shell without changing the established v29 release contract', () => {
  assert.match(sw, /HOTFIX_REVISION = '20260808-smart-help-voice-ui-v29-1'/);
  assert.match(sw, /dokohilf-shell-\$\{BUILD_ID\}-mobile-polish-6/);
  assert.match(sw, /hardRefresh: true/);
});
