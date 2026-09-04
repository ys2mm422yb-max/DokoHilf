import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const router = await readFile(
  new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url),
  'utf8',
);

test('stuck help uses only the current step detail and never an unrelated troubleshooting entry', () => {
  assert.match(router, /const stepHelp = String\(step\.stuck \|\| ''\)\.trim\(\)/);
  assert.doesNotMatch(router, /Object\.values\(guide\.troubleshooting \|\| \{\}\)\[0\]/);
  assert.match(router, /const help = stepHelp \|\| fallback/);
});

test('missing detailed help asks naturally what is visible without adding a click path', () => {
  assert.match(router, /const fallback = 'Okay\. Was siehst du gerade\?'/);
  assert.match(router, /reply: stepHelp \? `\$\{help\}\\n\\nKlappt es so\?` : help/);
  assert.doesNotMatch(router, /noch keine genauere Positionsangabe bestätigt/);
  assert.doesNotMatch(router, /Ich erfinde keinen alternativen Klickweg/);
  assert.match(router, /approved-guide-router-stuck-gap-v10/);
});

test('stuck response keeps the same guide and step while approved step-specific help remains preferred', () => {
  assert.match(router, /guideSlug: guide\.slug/);
  assert.match(router, /guideStep: index \+ 1/);
  assert.match(router, /source: stepHelp \? 'approved-guide-router-stuck-v10' : 'approved-guide-router-stuck-gap-v10'/);
  assert.match(router, /ROUTER_VERSION = 'conversational-guide-router-v10'/);
});
