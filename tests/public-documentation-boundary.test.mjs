import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [readme, rules, workflows, handoff, voiceHotfix] = await Promise.all([
  readFile(new URL('../README.md', import.meta.url), 'utf8'),
  readFile(new URL('../PROJECT_RULES.md', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
  readFile(new URL('../PROJECT_HANDOFF.md', import.meta.url), 'utf8'),
  readFile(new URL('../ACTIVE_WORK_IOS_VOICE_HOTFIX_V28.md', import.meta.url), 'utf8'),
]);

const publicCore = [readme, rules, workflows, handoff, voiceHotfix];
const obsoleteTestAccountTerm = ['Test', 'konten'].join('');

test('öffentliche Kernquellen verwenden ausschließlich die neutrale Veröffentlichungsgrenze', () => {
  for (const text of publicCore) {
    assert.match(text, /selbst formuliert|selbst erstell/i);
    assert.match(text, /anonymisiert/i);
    assert.match(text, /veröffentlichungsfähig/i);
  }
});

test('PROJECT_RULES macht das Echtdatenverbot dauerhaft und die App zur reinen Erklärungshilfe', () => {
  assert.match(rules, /Dauerhaftes absolutes Echtdatenverbot/);
  assert.match(rules, /dauerhaft, ohne Ausnahme und unabhängig von späteren betrieblichen, technischen oder datenschutzrechtlichen Freigaben/);
  assert.match(rules, /Eine spätere Freigabe darf dieses Verbot \*\*nicht\*\* aufheben oder abschwächen/);
  assert.match(rules, /ausschließlich eine \*\*erklärende Schritt-für-Schritt-Bedienhilfe\*\*/);
  assert.match(rules, /keine App-Konten oder Anmeldung, keine Bewohner-\/Mitarbeiterprofile, keine Fallakten und keine personenbezogenen Eingabemasken/);
  assert.match(rules, /DokoHilf führt grundsätzlich keinerlei App-Konten, Anmeldungen oder Personenprofile/);
  assert.match(rules, /Solche Funktionen sind nicht Teil des Produkts und werden nicht vorsorglich eingeplant/);
  assert.match(rules, /Diese Tests bilden keine reale Person und keinen realen Fall nach/);
  assert.match(readme, /Solche Funktionen werden auch später nicht eingeplant/);
  assert.match(readme, /Tests bilden weder reale Personen noch reale Fälle nach/);
  assert.match(handoff, /keine reale Person und kein realer Fall werden nachgebildet/);
  assert.match(rules, /organisatorischen Freigaben erlauben \*\*niemals\*\* die Verarbeitung von Echtdaten/);
  for (const text of publicCore) assert.equal(text.includes(obsoleteTestAccountTerm), false);
});

test('Fachquelle und Handoff bleiben auf bestätigte veröffentlichungsfähige Inhalte begrenzt', () => {
  assert.match(workflows, /ausschließlich anonymisierte, selbst formulierte und fachlich bestätigte Klickwege/);
  assert.match(handoff, /ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Inhalte/);
  assert.match(readme, /ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Ergebnisse/);
});

test('Hotfix-QA bleibt für beide mobilen Plattformen und synthetische Zustände verbindlich', () => {
  assert.match(voiceHotfix, /iOS 393×852/);
  assert.match(voiceHotfix, /Android 412×915/);
  assert.match(voiceHotfix, /dauerhaft keine realen Bewohner-, Gesundheits-, Mitarbeiter- oder Zugangsdaten/);
});
