import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('build 36 voice fine tune removes technical copy and balances 393px guide mode', async () => {
  const ui = await read('assets/voice-polish-v36.js');

  assert.match(ui, /voicePolishFineTuneV36/);
  assert.match(ui, /\.voice-focus-main\{/);
  assert.match(ui, /justify-content:center!important/);
  assert.match(ui, /\.voice-focus-main>\.voice-focus-actions/);
  assert.match(ui, /dockGuideActions/);
  assert.match(ui, /main\.append\(actions\)/);

  for (const size of ['160px', '170px', '150px', '180px']) {
    assert.ok(ui.includes(size), `mobile Orb-Größe fehlt: ${size}`);
  }

  assert.match(ui, /\.v36-no-guide \.v36-voice-state\{display:inline-flex!important\}/);
  assert.match(ui, /polishInstructionSpacing/);
  assert.match(ui, /\(\[\.!\?\]\)\(\?=\[A-ZÄÖÜ\]\)/);
  assert.match(ui, /supertonic\(\?:-f1\)\?/i);
  assert.match(ui, /font-size:0!important/);
  assert.match(ui, /Danach höre ich automatisch wieder zu\./);
  assert.doesNotMatch(ui, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(ui, /fetch\(|sendMessage\(|guideSlug\s*=/);
});
