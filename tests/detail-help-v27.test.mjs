import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [help, contextHotfix, confirmed, smart, router] = await Promise.all([
  readFile(new URL('../assets/detail-help-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/context-voice-hotfix-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
  readFile(new URL('../assets/smart-help-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-chat-router/index.ts', import.meta.url), 'utf8'),
]);

test('v29 erkennt Hilferufe, erzeugt aber keinen lokalen Sonderdialog mehr', () => {
  assert.match(help, /function isProblemSignal\(text\)/);
  assert.match(help, /ich brauche hilfe/);
  assert.match(help, /weiss nicht/);
  assert.match(help, /keine ahnung/);
  assert.match(help, /__DOKOHILF_CONTEXTUAL_HELP_V29__/);
  assert.doesNotMatch(help, /helpOptions|helpTitle|syntheticResponse|startSession|handleSession/);
});

test('freie Texte und Hilfe-Button landen beim selben Server-Kontextpfad', () => {
  assert.match(smart, /smartHelpIntent: true/);
  assert.match(router, /smartHelpIntent/);
  assert.match(router, /approved-guide-context-help-v29-4/);
  assert.match(router, /stepResponse\(origin, guide, currentIndex/);
});

test('Vitalwerte verwenden den bestätigten Einzelwert-Ablauf mit Bewohner als erstem Schritt', () => {
  assert.match(confirmed, /## Einzelnen Vitalwert erfassen/);
  assert.match(confirmed, /1\. Bewohner auswählen\./);
  assert.match(confirmed, /2\. \*\*Doku-Erweitert\*\* öffnen\./);
  assert.match(confirmed, /3\. \*\*Vitalwerte\*\* wählen\./);
  assert.match(smart, /return 'vitalwerte-einzelwert'/);
});

test('Bericht-Hilfe verwendet den bestätigten Einstieg statt Vitalwerte-Fallback', () => {
  assert.match(contextHotfix, /Wähle zuerst den gewünschten Bewohner und suche danach in der festen Leiste nach \*\*Berichte\*\*/);
  assert.doesNotMatch(router, /Vitalwerte fehlt/);
});

test('Hilferückfragen verändern den Guide-Schritt nicht', () => {
  assert.match(router, /const currentIndex = currentStepIndex\(guide, suppliedStep\)/);
  assert.match(router, /guideStep: index \+ 1/);
  assert.doesNotMatch(router, /contextEvidenceStep|bestEvidence/);
});

test('Detailhilfe bleibt flüchtig und speichert keine Gesprächsdaten', () => {
  for (const source of [help, contextHotfix, smart]) {
    assert.doesNotMatch(source, /localStorage/);
    assert.doesNotMatch(source, /sessionStorage/);
    assert.doesNotMatch(source, /indexedDB/);
  }
});

test('iPhone-Synthese wird nach acht Sekunden sauber freigegeben', () => {
  assert.match(contextHotfix, /IOS_SYNTHESIS_TIMEOUT_MS = 8000/);
  assert.match(contextHotfix, /local_voice_timeout/);
});
