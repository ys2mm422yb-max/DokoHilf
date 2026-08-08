import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [polish, index, sw] = await Promise.all([
  readFile(new URL('../assets/mobile-polish-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
]);

test('mobile polish loads after the premium v29 presentation layer', () => {
  const premium = index.indexOf('assets/v29-ui.js?v=20260808-29');
  const mobile = index.indexOf('assets/mobile-polish-v29.js?v=20260808-29');
  assert.ok(premium >= 0 && mobile > premium);
  assert.match(sw, /mobile-polish-v29\.js\?v=20260808-29/);
});

test('start screen header no longer floats and hidden workspace stays hidden', () => {
  assert.match(polish, /\.app-shell\[data-mode="start"\] \.topbar\{[\s\S]*position:relative!important;top:auto!important/);
  assert.match(polish, /\.workspace\[hidden\]\{display:none!important\}/);
  assert.match(polish, /\.workspace:not\(\[hidden\]\)\{[\s\S]*display:flex!important/);
});

test('mobile cards and frequent flows are intentionally compact', () => {
  assert.match(polish, /min-height:108px!important/);
  assert.match(polish, /grid-template-columns:68px minmax\(0,1fr\) 38px!important/);
  assert.match(polish, /min-height:70px!important/);
  assert.match(polish, /hyphens:none!important/);
});

test('typed chat removes duplicated welcome chrome and compacts the composer', () => {
  assert.match(polish, /message\.querySelector\('\.bubble'\)/);
  assert.match(polish, /v29-mobile-welcome/);
  assert.match(polish, /\.chat-head p\{display:none!important\}/);
  assert.match(polish, /data-mode="chat"\]\:not\(\[data-v29-guide-active="true"\]\) \.conversation/);
  assert.match(polish, /\.composer textarea\{min-height:44px!important/);
  assert.match(polish, /\.send-button\{min-width:94px!important;height:44px!important/);
});
