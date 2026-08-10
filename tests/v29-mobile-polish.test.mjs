import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [polish, axisFix, index, sw, version] = await Promise.all([
  readFile(new URL('../assets/mobile-polish-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/card-axis-fix-v29.css', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8'),
]);

const buildId = JSON.parse(version).buildId;

test('mobile polish loads after the premium v29 presentation layer and the critical axis stylesheet is cache-busted', () => {
  const premium = index.indexOf(`assets/v29-ui.js?v=${buildId}`);
  const mobile = index.indexOf(`assets/mobile-polish-v29.js?v=${buildId}-cardaxis1`);
  assert.ok(premium >= 0 && mobile > premium);
  assert.match(index, new RegExp(`assets/card-axis-fix-v29\\.css\\?v=${buildId}-cardaxis1`));
  assert.match(sw, new RegExp(`card-axis-fix-v29\\.css\\?v=${buildId}-cardaxis1`));
  assert.match(sw, new RegExp(`mobile-polish-v29\\.js\\?v=${buildId}-cardaxis1`));
  assert.match(sw, /CHAT_UI_REVISION = '20260810-mobile-chat-viewport-v38-1'/);
  assert.match(sw, /mobile-polish-8/);
});

test('start and typed-chat headers cannot float over mobile content', () => {
  assert.match(polish, /data-mode="start"\] \.topbar,[\s\S]*data-mode="chat"\] \.topbar\{[\s\S]*position:relative!important;top:auto!important/);
  assert.match(polish, /\.workspace\[hidden\]\{display:none!important\}/);
  assert.match(polish, /data-mode="chat"\] \.workspace:not\(\[hidden\]\)\{[\s\S]*min-height:100%!important;[\s\S]*display:flex!important;[\s\S]*flex-direction:column!important/);
});

test('home cards use absolute 50-percent axis centering independent of runtime grid placement', () => {
  assert.match(axisFix, /#startScreen \.mode-card\{[\s\S]*position:relative!important;[\s\S]*display:block!important/);
  assert.match(axisFix, /#startScreen \.mode-card \.mode-icon\{[\s\S]*position:absolute!important;[\s\S]*top:50%!important;[\s\S]*transform:translateY\(-50%\)!important/);
  assert.match(axisFix, /#startScreen \.mode-card \.mode-arrow\{[\s\S]*position:absolute!important;[\s\S]*top:50%!important;[\s\S]*transform:translateY\(-50%\)!important/);
  assert.match(axisFix, /#startScreen \.mode-card \.mode-text\{[\s\S]*display:flex!important;[\s\S]*justify-content:center!important/);
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

test('typed chat fills the visual viewport and keeps minimum mobile touch targets', () => {
  assert.match(polish, /\.chat-head h1\{font-size:24px!important/);
  assert.match(polish, /\.chat-head p\{display:none!important\}/);
  assert.match(polish, /data-mode="chat"\]\:not\(\[data-v29-guide-active="true"\]\) \.conversation/);
  assert.match(polish, /data-mode="chat"\]\{[\s\S]*min-height:100dvh!important;[\s\S]*height:var\(--dokohilf-chat-viewport-height,100dvh\)!important;[\s\S]*padding-bottom:0!important;[\s\S]*display:flex!important/);
  assert.match(polish, /data-mode="chat"\] \.main-content\{[\s\S]*min-height:0!important;[\s\S]*overflow-y:auto!important/);
  assert.match(polish, /\.composer-wrap\{[\s\S]*position:relative!important;[\s\S]*flex:0 0 auto!important/);
  assert.doesNotMatch(polish, /\.composer-wrap\{[^}]*position:sticky!important/);
  assert.match(polish, /\.composer\{gap:5px!important;padding:3px!important/);
  assert.match(polish, /\.composer textarea\{[\s\S]*min-height:44px!important;[\s\S]*font-size:16px!important/);
  assert.doesNotMatch(polish, /\.composer textarea\{[^}]*font-size:15px!important/);
  assert.match(polish, /\.small-mic\{width:44px!important/);
  assert.match(polish, /\.send-button\{min-width:80px!important;height:44px!important/);
  assert.match(polish, /function syncChatViewport\(\)/);
  assert.match(polish, /window\.visualViewport/);
  assert.match(polish, /Erledigt, weiter/);
  assert.match(polish, /Hilfe zum Schritt/);
});
