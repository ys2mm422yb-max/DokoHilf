import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [index, updateManager, versionRaw, rules] = await Promise.all([
  read('index.html'),
  read('assets/update-manager.js'),
  read('version.json'),
  read('PROJECT_RULES.md'),
]);
const version = JSON.parse(versionRaw);

function matchOne(source, pattern, label) {
  const match = source.match(pattern);
  assert.ok(match, `${label} fehlt`);
  return match[1];
}

test('visible app release version is one maintained value everywhere', () => {
  const metaVersion = matchOne(index, /<meta name="dokohilf-release" content="(v\d+)">/, 'Release-Meta');
  const pillVersion = matchOne(index, /id="buildPill"[^>]*>KI · (v\d+)<\/button>/, 'sichtbare KI-Version');
  assert.equal(metaVersion, pillVersion);
  assert.equal(version.displayVersion, metaVersion);
  assert.ok(Number(metaVersion.slice(1)) >= 30, `veraltete sichtbare Releaseversion ${metaVersion}`);
  assert.doesNotMatch(index, />KI · v29<\/button>/);
});

test('bottom update status uses the same visible release version and separate build id', () => {
  assert.match(updateManager, /meta\[name="dokohilf-release"\]/);
  assert.match(updateManager, /DokoHilf \$\{DISPLAY_VERSION\}/);
  assert.match(updateManager, /Build \$\{BUILD_ID\}/);
  assert.match(updateManager, /displayVersion: DISPLAY_VERSION/);
});

test('project rules make visible release maintenance a merge requirement', () => {
  assert.match(rules, /in der App sichtbare DokoHilf-Releaseversion/);
  assert.match(rules, /`KI · vXX`/);
  assert.match(rules, /`version\.json\.displayVersion`/);
  assert.match(rules, /größeren, für Nutzer klar sichtbaren Funktions- oder Oberflächenupdate/);
  assert.match(rules, /veraltete sichtbare Versionsnummer ist ein Merge-Blocker/);
});
