import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/smart-help-v29.js', import.meta.url), 'utf8');

test('v66 lässt klare Primärabsicht vor ASR-Alternativen gewinnen', () => {
  assert.match(source, /if \(isUnconfirmedGoal\(userText\) \|\| hasEntryAction\(userText\)\) return '';/);
  assert.match(source, /inferTaskGuide\(userText\) \|\| inferAlternativeGuide/);
  assert.match(source, /inferNavigationGuide\(userText\) \|\| inferAlternativeGuide/);
});
