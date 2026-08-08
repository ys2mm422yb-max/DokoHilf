import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../assets/routing-fix.js');

const { rewriteRouterInput, chatRouterEndpoint } = globalThis.DokoHilfRouting;
const router = await readFile(new URL('../supabase/functions/dokohilf-chat-router/index.ts', import.meta.url), 'utf8');

test('alter Chat-Router wird transparent auf den kontextbewussten Router umgebogen', () => {
  assert.equal(
    rewriteRouterInput('https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai-router'),
    chatRouterEndpoint,
  );
  assert.match(chatRouterEndpoint, /dokohilf-chat-router$/);
});

test('fremde Requests bleiben unangetastet', () => {
  const url = 'https://example.invalid/other';
  assert.equal(rewriteRouterInput(url), url);
});

test('laufender Guide beantwortet allgemeine Orientierung und Festhängen aus freigegebenem Wissen', () => {
  assert.match(router, /isExplicitHelp/);
  assert.match(router, /komme nicht weiter/);
  assert.match(router, /was muss ich/);
  assert.match(router, /bei mir heisst/);
  assert.match(router, /ich sehe nur/);
  assert.match(router, /looksLikeQuestion/);
  assert.match(router, /Object\.values\(guide\.troubleshooting/);
  assert.match(router, /status=eq\.approved/);
});

test('Hilferückfragen verändern den eigentlichen Guide-Fortschritt nicht', () => {
  assert.match(router, /guideStep: currentIndex \+ 1/);
  assert.match(router, /contextEvidenceStep/);
});

test('Bestätigungen und echte Themenwechsel bleiben beim bestehenden Stateful-Router', () => {
  assert.match(router, /isControlOrConfirmation/);
  assert.match(router, /explicitDifferentGoal/);
  assert.match(router, /forwardToExistingRouter/);
  assert.match(router, /dokohilf-ai-router/);
});

test('auch Wechsel zwischen verwandten Guides derselben Kategorie werden nicht als Hilfe verschluckt', () => {
  assert.match(router, /durchstreichen\|bericht loschen\|bericht korrigieren/);
  assert.match(router, /folgebericht/);
  assert.match(router, /berichtssuche/);
  assert.match(router, /sammelerfassung/);
  assert.match(router, /einzelwert/);
});

test('der Kontext-Router enthält keine fachfremden Vitalwerte-Fallbackkarten', () => {
  assert.doesNotMatch(router, /Vitalwerte fehlt/);
  assert.doesNotMatch(router, /Anderer Reiter \/ andere Seite/);
});
