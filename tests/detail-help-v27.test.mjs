import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [help, polish, confirmed, buildScript, applyScript] = await Promise.all([
  readFile(new URL('../assets/detail-help-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/detail-help-polish-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-static-site-v27.sh', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/apply-detail-help-v27.mjs', import.meta.url), 'utf8'),
]);

test('Problemformulierungen öffnen einen eigenen Hilfemodus statt den Guide blind weiterzuschalten', () => {
  assert.match(help, /function isProblemSignal\(text\)/);
  assert.match(help, /finde\|sehe\|erkenne\|entdecke/);
  assert.match(help, /wo \(ist\|sind\)/);
  assert.match(help, /ich brauche hilfe/);
  assert.match(help, /helpMode/);
  assert.match(polish, /Okay\. Schau oben in die grüne Reiterleiste/);
  assert.doesNotMatch(polish, /Ich markiere noch keinen Schritt als erledigt/);
  assert.doesNotMatch(help, /sendMessage\('weiter'\)/);
});

test('Vitalwerte bekommen eine detaillierte bestätigte Orientierungsfrage', () => {
  assert.match(confirmed, /## Einzelnen Vitalwert erfassen/);
  assert.match(confirmed, /\*\*Doku-Erweitert\*\* öffnen/);
  assert.match(confirmed, /\*\*Vitalwerte\*\* und \*\*Vitalwerte Sammelerf\.\*\* sind zwei getrennte Menüeinträge/);
  assert.match(help, /Schau ganz oben in Vivendi in die grüne Reiterleiste und öffne \*\*Doku-Erweitert\*\*/);
  assert.match(help, /Vitalwerte Sammelerf\.\*\* als zwei getrennte Einträge/);
  assert.match(polish, /Suche in \*\*Doku-Erweitert\*\* nach \*\*Vitalwerte\*\*/);
  assert.match(help, /Doku-Erweitert ist offen/);
  assert.match(help, /„Vitalwerte“ fehlt/);
});

test('fehlender Menüpunkt führt nicht zu erfundenem Alternativweg', () => {
  assert.match(confirmed, /Detailhilfe darf nur aus bestätigten lokalen Bezeichnungen und bestätigten Alternativen bestehen/);
  assert.match(help, /habe ich dafür keinen bestätigten Alternativ-Klickweg/);
  assert.match(help, /Bitte nichts raten/);
  assert.match(help, /menschliche Unterstützung/);
  assert.match(polish, /Prüfe den Einstieg noch einmal/);
});

test('Chat und Voice verwenden dieselbe Hilfelogik und dieselben Auswahlwerte', () => {
  assert.match(help, /detail-help-options/);
  assert.match(help, /voice-detail-help-options/);
  assert.match(help, /data-detail-help-value/);
  assert.match(help, /fromVoice: document\.getElementById\('appShell'\)\?\.dataset\.mode === 'voice'/);
  assert.match(help, /session\.pendingOption/);
  assert.match(polish, /&& !localVoiceV28\(\)/);
});

test('Hilfemodus hält Weiter verborgen, bis der Zielpunkt wirklich gefunden wurde', () => {
  assert.match(help, /data-detail-help="true"\] #commandRow\{display:none!important\}/);
  assert.match(polish, /\.voice-focus-actions\{display:none!important\}/);
  assert.match(help, /helpMode: false/);
  assert.match(polish, /Perfekt\. Öffne jetzt \*\*Vitalwerte\*\*/);
});

test('Detailhilfe bleibt flüchtig und speichert keine Gesprächsdaten', () => {
  assert.doesNotMatch(help, /localStorage/);
  assert.doesNotMatch(help, /sessionStorage/);
  assert.doesNotMatch(help, /indexedDB/);
  assert.doesNotMatch(polish, /localStorage/);
  assert.doesNotMatch(polish, /sessionStorage/);
  assert.doesNotMatch(polish, /indexedDB/);
  assert.match(help, /const session = \{/);
});

test('v28-3 Release aktiviert Detailhilfe innerhalb der Static-first-Voice-Revision', () => {
  assert.match(buildScript, /apply-detail-help-v27\.mjs/);
  assert.match(buildScript, /assets\/detail-help-v27\.js/);
  assert.match(buildScript, /assets\/detail-help-polish-v27\.js/);
  assert.match(buildScript, /20260807-voice-guides-report-v28-3/);
  assert.match(applyScript, /detail-help-v27\.js\?v=\$\{BUILD_ID\}/);
  assert.match(applyScript, /detail-help-polish-v27\.js\?v=\$\{BUILD_ID\}/);
  assert.match(applyScript, /HOTFIX_REVISION = '\$\{REVISION\}'/);
  assert.match(applyScript, /clarificationIndex < helpIndex && helpIndex < progressIndex/);
  assert.match(applyScript, /localVoiceIndex < experienceIndex && experienceIndex < polishIndex && polishIndex < syncIndex && syncIndex < gateIndex/);
});
