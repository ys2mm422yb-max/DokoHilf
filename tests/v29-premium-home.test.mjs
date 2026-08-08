import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [ui, sw] = await Promise.all([
  readFile(new URL('../assets/v29-ui.js', import.meta.url), 'utf8'),
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

test('premium home refreshes the PWA shell without changing the established v29 release contract', () => {
  assert.match(sw, /HOTFIX_REVISION = '20260808-smart-help-voice-ui-v29-1'/);
  assert.match(sw, /dokohilf-shell-\$\{BUILD_ID\}-mobile-polish-5/);
  assert.match(sw, /hardRefresh: true/);
});
