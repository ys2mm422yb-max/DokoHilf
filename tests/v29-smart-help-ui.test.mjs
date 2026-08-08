import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('v29 is visible and cache-busted consistently', async () => {
  const [html, version, worker, localVoice, gate] = await Promise.all([
    read('index.html'), read('version.json'), read('service-worker.js'), read('assets/local-voice-v28.js'), read('assets/local-voice-gate-v28.js'),
  ]);
  const buildId = JSON.parse(version).buildId;
  assert.match(html, /KI · v29/);
  assert.match(html, new RegExp(`dokohilf-build" content="${buildId}`));
  assert.match(html, new RegExp(`v29-ui\\.js\\?v=${buildId}`));
  assert.match(worker, new RegExp(`BUILD_ID = '${buildId}'`));
  assert.match(localVoice, /Supertone\/supertonic-3/);
  assert.match(localVoice, /meta\[name="dokohilf-build"\]/);
  assert.match(gate, /meta\[name="dokohilf-build"\]/);
  assert.match(gate, /guide-audio-catalog\.json\?v=\$\{encodeURIComponent\(BUILD_ID\)\}/);
  assert.match(gate, /dokohilf-static-supertonic-audio-v29-1/);
  assert.match(gate, /IOS_LOCAL_TIMEOUT_MS = 8000/);
});

test('free-text help and the help button use the same contextual router path', async () => {
  const [smart, detail, router] = await Promise.all([
    read('assets/smart-help-v29.js'),
    read('assets/detail-help-v27.js'),
    read('supabase/functions/dokohilf-chat-router/index.ts'),
  ]);
  assert.match(smart, /ich brauche hilfe/);
  assert.match(smart, /ich weiss nicht/);
  assert.match(smart, /keine ahnung/);
  assert.match(smart, /was meinst du/);
  assert.match(smart, /smartHelpIntent: true/);
  assert.doesNotMatch(smart, /rewriteLatestUser|ich finde das nicht/);
  assert.match(detail, /__DOKOHILF_CONTEXTUAL_HELP_V29__/);
  assert.doesNotMatch(detail, /helpOptions|Was trifft bei dir zu\?|syntheticResponse|startSession/);
  assert.match(router, /smartHelpIntent/);
  assert.match(router, /approved-guide-context-help-v29-4/);
  assert.doesNotMatch(smart, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(detail, /localStorage|sessionStorage|indexedDB/);
});

test('Hallo ich suche den Blutdruck starts the approved single-value guide instead of an overview', async () => {
  const [smart, router] = await Promise.all([
    read('assets/smart-help-v29.js'),
    read('supabase/functions/dokohilf-chat-router/index.ts'),
  ]);
  assert.match(smart, /blutdruck\|puls\|temperatur/);
  assert.match(smart, /return 'vitalwerte-einzelwert'/);
  assert.match(smart, /selectedGuideSlug/);
  assert.match(router, /selectedGuideSlug/);
  assert.match(router, /approved-guide-smart-start-v29-1/);
  assert.match(router, /stepResponse\(origin, guide, 0/);
});

test('v29 redesign covers home, written chat and distinct voice states', async () => {
  const [css, ui, html, version] = await Promise.all([read('assets/v29-ui.css'), read('assets/v29-ui.js'), read('index.html'), read('version.json')]);
  const buildId = JSON.parse(version).buildId;
  assert.match(html, new RegExp(`assets\\/v29-ui\\.css\\?v=${buildId}`));
  assert.match(html, new RegExp(`assets\\/smart-help-v29\\.js\\?v=${buildId}`));
  assert.match(html, new RegExp(`assets\\/v29-ui\\.js\\?v=${buildId}`));
  assert.match(css, /\.start-copy:before/);
  assert.match(css, /\.mode-card:before/);
  assert.match(css, /\.chat-head:after/);
  assert.match(css, /data-voice-state="listening"/);
  assert.match(css, /data-voice-state="thinking"/);
  assert.match(css, /data-voice-state="speaking"/);
  assert.match(css, /@keyframes v29ListeningRing/);
  assert.match(css, /@keyframes v29ThinkSpin/);
  assert.match(css, /@keyframes v29VoiceBar/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(ui, /Frühere Nachrichten anzeigen/);
  assert.match(ui, /Was möchtest du erledigen\?/);
  assert.doesNotMatch(ui, /localStorage|sessionStorage|indexedDB/);
});

test('service worker precaches the new UI and smart-help layer', async () => {
  const worker = await read('service-worker.js');
  for (const asset of ['assets/v29-ui.css', 'assets/v29-ui.js', 'assets/smart-help-v29.js', 'assets/direct-guide-copy-v29.js']) {
    assert.ok(worker.includes(asset), `${asset} fehlt im Service Worker`);
  }
  assert.match(worker, /dokohilf-static-supertonic-audio-v28-1/);
  assert.match(worker, /dokohilf-local-voice-model-v28-1/);
});
