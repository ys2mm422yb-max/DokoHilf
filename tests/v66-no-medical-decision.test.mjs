import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../ACTIVE_WORK_VOICE_CHAT_PARITY_GUIDE_AUDIT_V66.md', import.meta.url), 'utf8');

test('v66 erweitert keine fachlichen oder medizinischen Entscheidungsregeln', () => {
  assert.match(source, /Keine neuen Vivendi-Felder, Statusnamen, Menüpunkte oder Klickwege/);
  assert.match(source, /fachlich offen/);
});
