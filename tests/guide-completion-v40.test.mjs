import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  APPROVED_COMPLETION_SLUGS,
  COMPLETION_REVISION,
  FORBIDDEN_CONTINUATION_TARGETS,
  GUIDE_COMPLETIONS,
  allCompletionSpokenTexts,
  completionForGuide,
  inferCompletionContinuation,
} from '../supabase/functions/dokohilf-conversation-router/guide-completion-contract.mjs';

const expectedApprovedSlugs = [
  'analyse-finden',
  'anwesenheit',
  'anwesenheiten-finden',
  'bedarfsmedikation-finden',
  'bedarfsmedikation-gabe',
  'bedarfsmedikation-wirksamkeitskontrolle',
  'bedarfsmedikation-wirksamkeitskontrolle-finden',
  'bericht-durchstreichen',
  'bericht-folgebericht',
  'bericht-neu',
  'berichte-finden',
  'doku-erweitert-finden',
  'doku-finden',
  'durchfuehrung-storno',
  'durchfuehrungsnachweis-finden',
  'durchfuehrungsnachweis-oeffnen',
  'formulare-anlegen',
  'formulare-finden',
  'massnahmen-ohne-zeitangabe',
  'massnahmen-ohne-zeitangabe-finden',
  'medikation-ansehen',
  'medikation-finden',
  'notfallblatt',
  'notfallblatt-finden',
  'planung-finden',
  'stammdaten',
  'stammdaten-finden',
  'uebergabe-finden',
  'uebergabeformular',
  'visite-anlegen',
  'visite-status-durchgefuehrt',
  'visiten-finden',
  'visiten-oeffnen',
  'vitalwerte',
  'vitalwerte-einzelwert',
  'vitalwerte-einzelwert-fortsetzen',
  'vitalwerte-erfassen',
  'vitalwerte-finden',
  'vitalwerte-sammelerfassung',
  'vitalwerte-sammelerfassung-fortsetzen',
].sort();

assert.equal(COMPLETION_REVISION, '20260810-natural-guide-completions-v40-1');
assert.deepEqual(APPROVED_COMPLETION_SLUGS, expectedApprovedSlugs, 'every approved guide must have an explicit completion contract');
assert.equal(Object.keys(GUIDE_COMPLETIONS).length, 40);

for (const [slug, completion] of Object.entries(GUIDE_COMPLETIONS)) {
  assert.ok(completion.reply?.trim(), `${slug} must have visible completion text`);
  assert.ok(completion.spokenText?.trim(), `${slug} must have static spoken completion text`);
  assert.doesNotMatch(completion.reply, /Der Ablauf ist erledigt|vorgesehenen Übersicht/i, `${slug} must not use the old computer-like completion`);
  assert.doesNotMatch(completion.spokenText, /Der Ablauf ist erledigt|vorgesehenen Übersicht/i, `${slug} must not speak the old generic completion`);
}

const attendanceCompletion = completionForGuide('anwesenheiten-finden');
assert.match(attendanceCompletion.reply, /Möchtest du dort jetzt eine An- oder Abwesenheit eintragen/);
let continuation = inferCompletionContinuation(attendanceCompletion.reply, 'Ja');
assert.deepEqual(continuation, {
  kind: 'reply',
  reply: 'Bevor du die An- oder Abwesenheit einträgst: Ist der richtige Bewohner ausgewählt?',
  spokenText: 'Bevor du die An- oder Abwesenheit einträgst: Ist der richtige Bewohner ausgewählt?',
});
continuation = inferCompletionContinuation(continuation.reply, 'Ja');
assert.deepEqual(continuation, { kind: 'start', guideSlug: 'anwesenheit', stepIndex: 2 }, 'already-open attendance area must continue at Neu instead of restarting navigation');

const visitCompletion = completionForGuide('visiten-finden');
assert.match(visitCompletion.reply, /Visite dokumentieren/);
assert.deepEqual(
  inferCompletionContinuation(visitCompletion.reply, 'Ja'),
  { kind: 'start', guideSlug: 'visite-anlegen', stepIndex: 1 },
  'already-open visit area must continue at the green plus / Neu step',
);

const reportCompletion = completionForGuide('berichte-finden');
assert.deepEqual(
  inferCompletionContinuation(reportCompletion.reply, 'Ja'),
  { kind: 'start', guideSlug: 'bericht-neu', stepIndex: 1 },
  'already-open report area must continue at the green plus step',
);

const formCompletion = completionForGuide('formulare-finden');
const formResident = inferCompletionContinuation(formCompletion.reply, 'Ja');
assert.match(formResident.reply, /richtige Bewohner ausgewählt/);
assert.deepEqual(
  inferCompletionContinuation(formResident.reply, 'Ja'),
  { kind: 'start', guideSlug: 'formulare-anlegen', stepIndex: 2 },
  'form follow-up must preserve the already-open form area',
);

const medicationFind = completionForGuide('medikation-finden');
assert.match(medicationFind.reply, /ansehen/i);
assert.match(medicationFind.reply, /Änderungen werden hier nicht angeleitet/i);
assert.equal(inferCompletionContinuation(medicationFind.reply, 'Ja'), null, 'medication view must never transition into a change flow');

const planning = completionForGuide('planung-finden');
assert.match(planning.reply, /Wenn du dort etwas Bestimmtes suchst/);
assert.doesNotMatch(planning.reply, /Easy.?Plan|Aufgaben|Aktuelles/i, 'Planning orientation must not expose an unconfirmed Easy-Plan flow');

const vitalGeneric = completionForGuide('vitalwerte-erfassen');
const vitalYes = inferCompletionContinuation(vitalGeneric.reply, 'Ja');
assert.equal(vitalYes.kind, 'reply');
assert.match(vitalYes.reply, /einzelnen Vitalwert oder mehrere Werte/i, 'plain yes must not falsely complete an unresolved vital choice');
assert.deepEqual(
  inferCompletionContinuation(vitalGeneric.reply, 'einen einzelnen Wert'),
  { kind: 'start', guideSlug: 'vitalwerte-einzelwert', stepIndex: 0 },
);
assert.deepEqual(
  inferCompletionContinuation(vitalGeneric.reply, 'mehrere gleichzeitig'),
  { kind: 'start', guideSlug: 'vitalwerte-sammelerfassung', stepIndex: 0 },
);

const executionChoice = completionForGuide('durchfuehrungsnachweis-oeffnen');
const executionYes = inferCompletionContinuation(executionChoice.reply, 'Ja');
assert.equal(executionYes.kind, 'reply');
assert.match(executionYes.reply, /Bedarfsmedikation.*Wirksamkeitskontrolle.*Maßnahme.*Storno.*ansehen/i, 'plain yes must ask for the actual execution target');
assert.deepEqual(
  inferCompletionContinuation(executionChoice.reply, 'Storno'),
  { kind: 'start', guideSlug: 'durchfuehrung-storno', stepIndex: 2 },
);
assert.deepEqual(
  inferCompletionContinuation(executionChoice.reply, 'Wirksamkeitskontrolle'),
  { kind: 'start', guideSlug: 'bedarfsmedikation-wirksamkeitskontrolle-finden', stepIndex: 2 },
);

const completionPrompts = Object.values(GUIDE_COMPLETIONS).map(item => item.reply);
const continuationSamples = [
  ...completionPrompts.flatMap(prompt => ['Ja', 'Nein', 'Storno', 'Bedarfsmedikation', 'Wirksamkeitskontrolle', 'Maßnahmen ohne Zeitangabe', 'einzeln', 'mehrere'].map(answer => inferCompletionContinuation(prompt, answer))),
].filter(Boolean);
for (const item of continuationSamples) {
  if (item.kind !== 'start') continue;
  assert.ok(expectedApprovedSlugs.includes(item.guideSlug), `continuation target ${item.guideSlug} must be approved`);
  assert.ok(!FORBIDDEN_CONTINUATION_TARGETS.includes(item.guideSlug), `unconfirmed target ${item.guideSlug} must stay blocked`);
}
for (const forbidden of FORBIDDEN_CONTINUATION_TARGETS) {
  assert.ok(!expectedApprovedSlugs.includes(forbidden), `${forbidden} must not appear in approved completion coverage`);
}

const completionCatalog = JSON.parse(await readFile(new URL('../assets/voice-completion-catalog-v40.json', import.meta.url), 'utf8'));
const catalogTexts = [...new Set((completionCatalog.entries || []).map(entry => String(entry.text || '').trim()).filter(Boolean))].sort();
assert.equal(completionCatalog.entries.length, 44, 'completion voice source count is part of the static release contract');
assert.deepEqual(catalogTexts, allCompletionSpokenTexts(), 'every audible completion/follow-up must be present in the static Supertonic catalog');

const conversationRouter = await readFile(new URL('../supabase/functions/dokohilf-conversation-router/index.ts', import.meta.url), 'utf8');
assert.match(conversationRouter, /approved-guide-natural-completion-v44/);
assert.match(conversationRouter, /approved-guide-completion-followup-v44/);
assert.match(conversationRouter, /approved-guide-positive-advance-v44/);
assert.match(conversationRouter, /dokohilf-chat-router/, 'all non-completion behavior must continue through the existing chat router');
assert.doesNotMatch(conversationRouter, /Der Ablauf ist erledigt/);

const routingFix = await readFile(new URL('../assets/routing-fix.js', import.meta.url), 'utf8');
assert.match(routingFix, /dokohilf-conversation-router/);
assert.match(routingFix, /20260822-signoff-durchfuehrungsnachweis-v52-1/);

console.log('Guide completion v40/v44 regression tests passed.');
