import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [app, router] = await Promise.all([
  readFile(new URL('../assets/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-conversation-router/index.ts', import.meta.url), 'utf8'),
]);

test('Spracherkennungsalternativen werden vor Routing datenschutzseitig begrenzt', () => {
  assert.match(app, /safeSpeechAlternatives/);
  assert.match(app, /clientPrivacyGuard\(text\)/);
  assert.match(router, /sanitizeSpeechAlternatives/);
  assert.match(router, /containsSensitiveData\(text\)/);
});
