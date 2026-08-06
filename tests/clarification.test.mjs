import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../assets/clarification-ui.js');

const { normalizeOptions, rewriteRequestBody } = globalThis.DokoHilfClarification;
const frontend = await readFile(new URL('../assets/clarification-ui.js', import.meta.url), 'utf8');
const router = await readFile(new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url), 'utf8');

test('nur gültige und eindeutige freigegebene Auswahlwerte werden dargestellt', () => {
  const options = normalizeOptions([
    { label: 'Bericht durchstreichen', guideSlug: 'bericht-durchstreichen' },
    { label: 'Doppelt', guideSlug: 'bericht-durchstreichen' },
    { label: 'Durchführung stornieren', guideSlug: 'durchfuehrung-storno' },
    { label: '', guideSlug: 'ungueltig' },
    { label: 'Ungültig', guideSlug: '../secret' },
  ]);
  assert.deepEqual(options, [
    { label: 'Bericht durchstreichen', guideSlug: 'bericht-durchstreichen' },
    { label: 'Durchführung stornieren', guideSlug: 'durchfuehrung-storno' },
  ]);
});

test('angeklickte Auswahl wird exakt an den Router übergeben', () => {
  const body = JSON.stringify({ messages: [{ role: 'user', content: 'Bericht durchstreichen' }] });
  const rewritten = JSON.parse(rewriteRequestBody(body, 'bericht-durchstreichen'));
  assert.equal(rewritten.selectedGuideSlug, 'bericht-durchstreichen');
});

test('Frontend bietet höchstens drei große touchfreundliche Auswahlkarten', () => {
  assert.match(frontend, /slice\(0, 3\)/);
  assert.match(frontend, /clarification-option/);
  assert.match(frontend, /min-height:76px/);
  assert.match(frontend, /clarification-option-description/);
  assert.match(frontend, /choiceTitle/);
  assert.match(frontend, /dokohilf-ai-router/);
});

test('Router klärt unbestimmte Korrekturen und nutzt nur freigegebene Guides', () => {
  assert.match(router, /isCorrectionAmbiguous/);
  assert.match(router, /bericht-durchstreichen/);
  assert.match(router, /durchfuehrung-storno/);
  assert.match(router, /status=eq\.approved/);
  assert.match(router, /selectedGuideSlug/);
});

test('bestätigte freie Antworten bleiben im laufenden Guide und gehen exakt einen Schritt weiter', () => {
  assert.match(router, /isGuideProgressConfirmation/);
  assert.match(router, /currentGuideStep/);
  assert.match(router, /runGuideCommand\(origin, parsed, messages, guides, activeGuide, 'weiter'\)/);
  assert.match(router, /guide-context-clarification/);
});

test('Vitalwerte-Auswahl wird strukturiert in Einzel- und Sammelerfassung getrennt', () => {
  assert.match(router, /vitalEntryOptions/);
  assert.match(router, /vitalwerte-einzelwert-fortsetzen/);
  assert.match(router, /vitalwerte-sammelerfassung-fortsetzen/);
});

test('interne Freigabeformulierungen werden nicht an Nutzer weitergereicht', () => {
  assert.match(router, /neutralizeInternalText/);
  assert.match(router, /Dafür ist aktuell noch keine bestätigte Schritt-für-Schritt-Anleitung hinterlegt/);
  assert.doesNotMatch(frontend, /noch nicht freigegeben/);
});
