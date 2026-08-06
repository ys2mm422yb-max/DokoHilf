import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const router = await readFile(
  new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url),
  'utf8',
);

test('Router v9 erkennt die neu bestätigten Ziele deterministisch', () => {
  assert.match(router, /slug: 'bericht-folgebericht'/);
  assert.match(router, /slug: 'bericht-durchstreichen'/);
  assert.match(router, /slug: 'durchfuehrung-storno'/);
  assert.match(router, /slug: 'bericht-neu'/);
  assert.match(router, /slug: 'visite-anlegen'/);
  assert.match(router, /slug: 'anwesenheit'/);
  assert.match(router, /slug: 'formulare-anlegen'/);
  assert.match(router, /slug: 'notfallblatt'/);
  assert.match(router, /slug: 'uebergabeformular'/);
  assert.match(router, /slug: 'medikation-ansehen'/);
});

test('ein klar genanntes neues Ziel kann einen laufenden Guide ersetzen', () => {
  assert.match(router, /explicitGuideRoute\(\[text, \.\.\.alternatives\], guides\)/);
  assert.match(router, /explicit && explicit\.slug !== activeGuide\.slug/);
  assert.match(router, /Ich wechsle zum passenden Ablauf/);
});

test('Bestätigungen gehen exakt einen Schritt weiter und Verneinungen nicht', () => {
  assert.match(router, /isPositiveConfirmation/);
  assert.match(router, /noch nicht\|falsch\|keine\|kein\|geht nicht/);
  assert.match(router, /runGuideCommand\(origin, parsed, messages, activeGuide, 'weiter'\)/);
});

test('Medikationsänderungen werden blockiert und nur der Leseweg angeboten', () => {
  assert.match(router, /isMedicationChangeRequest/);
  assert.match(router, /medicationSafetyResponse/);
  assert.match(router, /Änderungen an Dosierung, Verordnung oder Medikamenten werden hier nicht angeleitet/);
  assert.match(router, /medikation-ansehen/);
});

test('Router liefert kurze Sprachausgabe und den nächsten Schritt zum Vorladen', () => {
  assert.match(router, /spokenText/);
  assert.match(router, /nextSpokenText/);
  assert.match(router, /spokenStep\(next\)/);
  assert.match(router, /approved-guide-stateful-v9/);
});

test('Gemini interpretiert nur freie Antworten innerhalb bestätigter Guides', () => {
  assert.match(router, /Erfinde niemals Klickwege/);
  assert.match(router, /start_guide/);
  assert.match(router, /AbortSignal\.timeout\(5_000\)/);
  assert.match(router, /guides\.some\(guide => guide\.slug === parsed\.guideSlug\)/);
});
