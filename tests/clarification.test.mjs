import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../assets/clarification-ui.js');
const { normalizeOptions, rewriteRequestBody } = globalThis.DokoHilfClarification;
const frontend = await readFile(new URL('../assets/clarification-ui.js', import.meta.url), 'utf8');
const router = await readFile(new URL('../supabase/functions/dokohilf-ai-router/index.ts', import.meta.url), 'utf8');

test('nur gültige, eindeutige und beschriebene Auswahlwerte werden dargestellt', () => {
  const options = normalizeOptions([
    { label: 'Einzelwert erfassen', guideSlug: 'vitalwerte-erfassen', description: 'Grünes Plus und Pop-up' },
    { label: 'Doppelt', guideSlug: 'vitalwerte-erfassen' },
    { label: 'Sammelerfassung', guideSlug: 'vitalwerte-sammelerfassung', description: 'Mehrere Werte gleichzeitig' },
    { label: '', guideSlug: 'ungueltig' },
    { label: 'Ungültig', guideSlug: '../secret' },
  ]);
  assert.deepEqual(options, [
    { label: 'Einzelwert erfassen', guideSlug: 'vitalwerte-erfassen', description: 'Grünes Plus und Pop-up' },
    { label: 'Sammelerfassung', guideSlug: 'vitalwerte-sammelerfassung', description: 'Mehrere Werte gleichzeitig' },
  ]);
});
test('angeklickte Auswahl wird exakt an den Router übergeben', () => {
  const body = JSON.stringify({ messages: [{ role: 'user', content: 'Einzelwert erfassen' }] });
  const rewritten = JSON.parse(rewriteRequestBody(body, 'vitalwerte-erfassen'));
  assert.equal(rewritten.selectedGuideSlug, 'vitalwerte-erfassen');
});
test('Auswahloberfläche zeigt Titel, Beschreibung und touchfreundliche Karten', () => {
  assert.match(frontend, /choiceTitle/); assert.match(frontend, /clarification-option-description/); assert.match(frontend, /min-height:76px/); assert.match(frontend, /slice\(0, 3\)/); assert.match(frontend, /dokohilf-ai-router/);
});
test('Router merkt das Erfassungsziel und fragt nur nach Einzel- oder Sammelerfassung', () => {
  assert.match(router, /detectVitalEntryMode/); assert.match(router, /vital-entry-mode-choice/); assert.match(router, /Wie möchtest du die Vitalwerte erfassen/); assert.match(router, /vitalwerte-sammelerfassung/); assert.match(router, /Grünes Plus oben links/);
});
test('Router führt aktive Guides mit explizitem Schrittzustand statt über alte Ja-Zählung', () => {
  assert.match(router, /currentIndex/); assert.match(router, /guideStep/); assert.match(router, /renderGuideStep/); assert.match(router, /approved-guide-router-/); assert.doesNotMatch(router, /messages:\s*replaceLastUser/);
});
