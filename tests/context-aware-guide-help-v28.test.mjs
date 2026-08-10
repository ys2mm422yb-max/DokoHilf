import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../assets/routing-fix.js');

const { rewriteRouterInput, chatRouterEndpoint } = globalThis.DokoHilfRouting;
const router = await readFile(new URL('../supabase/functions/dokohilf-chat-router/index.ts', import.meta.url), 'utf8');
const conversationRouter = await readFile(new URL('../supabase/functions/dokohilf-conversation-router/index.ts', import.meta.url), 'utf8');

test('alter Chat-Router wird transparent auf den Completion-Wrapper vor dem kontextbewussten Router umgebogen', () => {
  assert.equal(
    rewriteRouterInput('https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai-router'),
    chatRouterEndpoint,
  );
  assert.match(chatRouterEndpoint, /dokohilf-conversation-router$/);
  assert.match(conversationRouter, /dokohilf-chat-router/, 'Completion-Wrapper muss alle normalen Anfragen an den bestehenden Chat-Router weiterreichen');
});

test('fremde Requests bleiben unangetastet', () => {
  const url = 'https://example.invalid/other';
  assert.equal(rewriteRouterInput(url), url);
});

test('laufender Guide beantwortet natürliche Hilferufe aus dem aktuell freigegebenen Schritt', () => {
  assert.match(router, /isExplicitHelp/);
  assert.match(router, /ich weiss nicht/);
  assert.match(router, /keine ahnung/);
  assert.match(router, /was meinst du/);
  assert.match(router, /smartHelpIntent/);
  assert.match(router, /step\.stuck/);
  assert.match(router, /status=eq\.approved/);
});

test('Hilferückfragen bleiben exakt auf dem aktuellen Guide-Schritt', () => {
  assert.match(router, /const currentIndex = currentStepIndex\(guide, suppliedStep\)/);
  assert.match(router, /stepResponse\(origin, guide, currentIndex/);
  assert.match(router, /guideStep: index \+ 1/);
  assert.doesNotMatch(router, /contextEvidenceStep|bestEvidence|questionTerms/);
});

test('kurze Suchfragen starten direkt einen freigegebenen Guide statt einer langen Übersicht', () => {
  assert.match(router, /inferNavigationGuide/);
  assert.match(router, /blutdruck\|puls\|temperatur/);
  assert.match(router, /return 'vitalwerte-einzelwert'/);
  assert.match(router, /selectedGuideSlug/);
  assert.match(router, /approved-guide-smart-start-v29-1/);
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
  assert.doesNotMatch(router, /helpOptions|helpTitle/);
});
