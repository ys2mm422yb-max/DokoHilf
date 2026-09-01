import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/orientation-help-v29.js', import.meta.url), 'utf8');
const navigationCatalog = JSON.parse(await readFile(new URL('../assets/voice-navigation-catalog-v29.json', import.meta.url), 'utf8'));
const navigationSpeech = new Set((navigationCatalog.entries || []).map(entry => entry.text));

function harness() {
  let forwarded = 0;
  const window = {
    fetch: async () => {
      forwarded += 1;
      return new Response(JSON.stringify({ source: 'delegated-smart-help' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
    DokoHilfGuideProgress: {
      getCurrentGuide: () => ({
        guideSlug: 'bericht-neu',
        guideTitle: 'Neuen Berichtseintrag erfassen',
        guideStep: 1,
        guideStepCount: 8,
      }),
    },
    DokoHilfSmartHelpV29: {
      preparedBody: parsed => JSON.stringify({ ...parsed, smartHelpIntent: true }),
    },
  };
  new Function('window', 'Request', 'Response', source)(window, Request, Response);
  return { window, forwarded: () => forwarded };
}

test('Funktionsband-Frage hat guideübergreifend Vorrang vor generischem Smart Help', async () => {
  const h = harness();
  const response = await h.window.fetch('https://example.invalid/functions/v1/dokohilf-chat-router', {
    method: 'POST',
    body: JSON.stringify({
      guideSlug: 'bericht-neu',
      guideStep: 1,
      messages: [{ role: 'user', content: 'Was ist das weiße Funktionsband?' }],
    }),
  });
  const result = await response.json();

  assert.equal(result.source, 'confirmed-area-orientation-v29-4');
  assert.equal(result.guideSlug, 'bericht-neu');
  assert.equal(result.guideStep, 1);
  assert.equal(result.completed, false);
  assert.match(result.spokenText, /weiße Funktionsband/i);
  assert.match(result.spokenText, /beschriftete Symbole beziehungsweise Schaltflächen/i);
  assert.ok(navigationSpeech.has(result.spokenText));
  assert.equal(h.forwarded(), 0);
});
