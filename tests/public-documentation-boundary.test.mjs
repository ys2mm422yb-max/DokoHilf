import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url);
const EXCLUDED_DIRS = new Set(['.git', 'node_modules', '_site', 'artifacts']);

async function markdownFiles(dirUrl, out = []) {
  const entries = await readdir(dirUrl, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      await markdownFiles(new URL(`${entry.name}/`, dirUrl), out);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      out.push(new URL(entry.name, dirUrl));
    }
  }
  return out;
}

const files = await markdownFiles(ROOT);
const docs = await Promise.all(files.map(async url => ({
  path: relative(new URL('.', ROOT).pathname, url.pathname),
  text: await readFile(url, 'utf8'),
})));

const forbiddenPublicProvenance = [
  /Nutzerbild(?:er|es|ern)?/i,
  /Nutzer[- ]?Screenshot(?:s)?/i,
  /Vivendi[- ]?Bild(?:er)?/i,
  /Bildbasierte Nachbestätigungen/i,
  /zugrunde liegende[nr]* (?:Nutzer)?bilder/i,
  /Bilder[^\n]{0,100}(?:bleiben|ausschließlich)[^\n]{0,80}Chat/i,
  /Screenshot(?:s)?[^\n]{0,100}(?:bleiben|ausschließlich)[^\n]{0,80}Chat/i,
  /anhand (?:neuer )?(?:lokaler )?(?:Nutzer)?bilder/i,
  /aus (?:den|dem) Bild(?:ern)? (?:abgeleitet|bestätigt)/i,
  /Bild aus dem Chat/i,
];

test('öffentliche Markdown-Dokumentation nennt keine Herkunft aus visuellen Prüfmaterialien', () => {
  const violations = [];
  for (const doc of docs) {
    for (const pattern of forbiddenPublicProvenance) {
      if (pattern.test(doc.text)) violations.push(`${doc.path}: ${pattern}`);
    }
  }
  assert.deepEqual(violations, [], `Unzulässige öffentliche Herkunftshinweise:\n${violations.join('\n')}`);
});

test('PROJECT_RULES macht das Echtdatenverbot dauerhaft und nicht freigabefähig', async () => {
  const rules = await readFile(new URL('../PROJECT_RULES.md', import.meta.url), 'utf8');
  assert.match(rules, /Dauerhaftes absolutes Echtdatenverbot/);
  assert.match(rules, /dauerhaft, ohne Ausnahme und unabhängig von späteren betrieblichen, technischen oder datenschutzrechtlichen Freigaben/);
  assert.match(rules, /Eine spätere Freigabe darf dieses Verbot \*\*nicht\*\* aufheben oder abschwächen/);
  assert.match(rules, /Testkonten und Testdaten müssen vollständig synthetisch sein/);
  assert.doesNotMatch(rules, /Bis zur schriftlichen Freigabe durch Arbeitgeber, IT und Datenschutz gilt/);
});

test('öffentliche Kernquellen verwenden die neutrale Veröffentlichungsgrenze', async () => {
  const [readme, rules, workflows, handoff] = await Promise.all([
    readFile(new URL('../README.md', import.meta.url), 'utf8'),
    readFile(new URL('../PROJECT_RULES.md', import.meta.url), 'utf8'),
    readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
    readFile(new URL('../PROJECT_HANDOFF.md', import.meta.url), 'utf8'),
  ]);
  for (const text of [readme, rules, workflows, handoff]) {
    assert.match(text, /selbst formuliert|selbst erstell/i);
    assert.match(text, /anonymisiert/i);
    assert.match(text, /veröffentlichungsfähig/i);
  }
});
