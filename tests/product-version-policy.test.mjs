import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [versionRaw, releasePolish, policy, rules] = await Promise.all([
  read('version.json'),
  read('assets/release-polish-v29.js'),
  read('PRODUCT_VERSIONING.md'),
  read('PROJECT_RULES.md'),
]);

const version = JSON.parse(versionRaw);
const match = releasePolish.match(/const VERSION_LABEL = '(v\d+)'/);

test('visible footer version matches canonical productVersion', () => {
  assert.match(version.productVersion, /^v\d+$/);
  assert.ok(match, 'Footer VERSION_LABEL fehlt');
  assert.equal(match[1], version.productVersion);
});

test('product version policy is permanently documented in GitHub', () => {
  assert.match(policy, /größeren, für Nutzer merkbaren Update/);
  assert.match(policy, /version\.json.*productVersion/s);
  assert.match(policy, /assets\/release-polish-v29\.js/);
  assert.match(policy, /tests\/product-version-policy\.test\.mjs/);
  assert.match(policy, /Vor dem Merge eines größeren Produktupdates/);
  assert.match(rules, /Sichtbare Versionsbezeichnungen.*bei jedem Versionssprung/s);
});
