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
  assert.match(sw, /mobile-polish-4/);
});

test('start and typed-chat headers cannot float over mobile content', () => {
  assert.match(polish, /data-mode="start"\] \.topbar,[\s\S]*data-mode="chat"\] \.topbar\{[\s\S]*position:relative!important;top:auto!important/);
  assert.match(polish, /\.workspace\[hidden\]\{display:none!important\}/);
  assert.match(polish, /data-mode="chat"\] \.workspace:not\(\[hidden\]\)\{min-height:0!important;display:block!important\}/);
});

test('home cards keep icon, copy and arrow on one centered mobile axis', () => {
  assert.match(polish, /grid-template-columns:54px minmax\(0,1fr\) 34px!important;grid-template-rows:1fr!important;column-gap:12px!important;align-items:center!important/);
  assert.match(polish, /min-height:94px!important/);
  assert.match(polish, /\.mode-icon\{[\s\S]*grid-column:1!important;grid-row:1!important;place-self:center!important/);
  assert.match(polish, /\.mode-text\{[\s\S]*grid-column:2!important;grid-row:1!important;align-self:center!important;display:flex!important;flex-direction:column!important;justify-content:center!important/);
  assert.match(polish, /\.mode-arrow\{[\s\S]*position:static!important;right:auto!important;top:auto!important;grid-column:3!important;grid-row:1!important;place-self:center!important;transform:none!important/);
});

test('home frequent flows stay compact without breaking touch layout', () => {
  assert.match(polish, /min-height:64px!important/);
  assert.match(polish, /hyphens:none!important/);
});

test('initial typed chat removes duplicate welcome and guide controls until a guide is active', () => {
  assert.match(polish, /function isInitialWelcome/);
  assert.match(polish, /if \(isInitialWelcome\(message\)\) message\.remove\(\)/);
  assert.match(polish, /if \(commandRow\.hidden !== !activeGuide\) commandRow\.hidden = !activeGuide/);
  assert.match(polish, /messages:empty\{display:none!important\}/);
  assert.match(polish, /requestAnimationFrame\(\(\) => window\.scrollTo/);
});

test('typed chat is visually lighter and keeps minimum mobile touch targets', () => {
  assert.match(polish, /\.chat-head h1\{font-size:24px!important/);
  assert.match(polish, /\.chat-head p\{display:none!important\}/);
  assert.match(polish, /data-mode="chat"\]\:not\(\[data-v29-guide-active="true"\]\) \.conversation/);
  assert.match(polish, /data-mode="chat"\]\{min-height:100dvh!important;padding-bottom:0!important\}/);
  assert.match(polish, /\.composer-wrap\{position:sticky!important;[\s\S]*bottom:0!important/);
  assert.match(polish, /\.composer\{gap:5px!important;padding:3px!important/);
  assert.match(polish, /\.composer textarea\{min-height:44px!important/);
  assert.match(polish, /\.small-mic\{width:44px!important/);
  assert.match(polish, /\.send-button\{min-width:80px!important;height:44px!important/);
});
