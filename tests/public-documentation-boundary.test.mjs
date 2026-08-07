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
  assert.match(rules, /keine Benutzerkonten, keine Bewohner-\/Mitarbeiterprofile, keine Fallakten und keine personenbezogenen Eingabemasken/);
  assert.match(rules, /DokoHilf führt grundsätzlich keine Endnutzerkonten oder Personenprofile/);
  assert.match(rules, /organisatorischen Freigaben erlauben \*\*niemals\*\* die Verarbeitung von Echtdaten/);
  assert.doesNotMatch(rules, /Testkonten und Testdaten müssen/);
});

test('Fachquelle und Handoff veröffentlichen nur Ergebnisse statt interner Ausgangsmaterialien', () => {
  assert.match(workflows, /Öffentliche Dokumentation enthält keine Angaben zu Herkunft, Prüfmaterialien oder internen Ausgangsmaterialien/);
  assert.match(handoff, /Herkunft, Prüfmaterialien und interne Ausgangsmaterialien werden nicht öffentlich dokumentiert/);
  assert.match(readme, /Herkunft, Prüfmaterialien oder interne Ausgangsmaterialien werden nicht öffentlich dokumentiert/);
});

test('Hotfix-QA bleibt für beide mobilen Plattformen und synthetische Zustände verbindlich', () => {
  assert.match(voiceHotfix, /iOS 393×852/);
  assert.match(voiceHotfix, /Android 412×915/);
  assert.match(voiceHotfix, /dauerhaft keine realen Bewohner-, Gesundheits-, Mitarbeiter- oder Zugangsdaten/);
});
