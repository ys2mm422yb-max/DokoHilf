import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [index, sw, version] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8').then(JSON.parse),
]);

test('installed PWA can detect and force the guide-library release', () => {
  const meta = index.match(/<meta name="dokohilf-build" content="([^"]+)"/);
  const inline = index.match(/const BUILD_ID = '([^']+)'/);
  const worker = sw.match(/const BUILD_ID = '([^']+)'/);
  assert.ok(meta?.[1]);
  assert.equal(meta[1], version.buildId);
  assert.equal(inline?.[1], version.buildId);
  assert.equal(worker?.[1], version.buildId);
  assert.match(index, new RegExp(`guide-library-v29\\.css\\?v=${version.buildId}-library1`));
  assert.match(index, new RegExp(`guide-library-v29\\.js\\?v=${version.buildId}-library1`));
  assert.match(sw, new RegExp(`guide-library-v29\\.js\\?v=${version.buildId}-library1`));
  assert.match(sw, /mobile-polish-8/);
});
