import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const [source, fixtureRaw] = await Promise.all([
  readFile(new URL('../assets/smart-help-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('./fixtures/v66-voice-chat-parity-cases.json', import.meta.url), 'utf8'),
]);

function loadSmartHelp() {
  const window = { fetch: async () => ({ ok: true }) };
  const document = {
    querySelector: () => null,
    head: { append: () => {} },
    createElement: () => ({ dataset: {} }),
  };
  vm.runInNewContext(source, { window, document, Request: class Request {} });
  return window.DokoHilfSmartHelpV29;
}

const smartHelp = loadSmartHelp();
const fixtures = JSON.parse(fixtureRaw);

test('synthetische Sprach-/Schreibfälle halten dieselben bestätigten Routing-Grenzen', () => {
  for (const fixture of fixtures.cases) {
    const parsed = {
      messages: [{ role: 'user', content: fixture.input }],
      ...(fixture.alternatives ? { speechAlternatives: fixture.alternatives } : {}),
    };
    const body = smartHelp.preparedBody(parsed, fixture.input);
    const actual = body ? JSON.parse(body).selectedGuideSlug || null : null;
    assert.equal(actual, fixture.expectedGuide, `${fixture.mode}: ${fixture.input}`);
  }
});
