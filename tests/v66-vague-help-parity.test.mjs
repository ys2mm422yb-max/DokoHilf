import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const router = await readFile(new URL('../supabase/functions/dokohilf-conversation-router/index.ts', import.meta.url), 'utf8');

test('v66 gibt bei vager Eingabe sichtbar und hörbar denselben bestätigten Satz zurück', () => {
  assert.match(router, /reply:\s*VAGUE_HELP_REPLY/);
  assert.match(router, /spokenText:\s*VAGUE_HELP_REPLY/);
});
