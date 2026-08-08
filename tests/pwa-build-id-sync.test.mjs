import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [index, sw, version, buildScript, mobileRender] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
  readFile(new URL('../version.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../scripts/build-static-site-v27.sh', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/mobile-render-v27.mjs', import.meta.url), 'utf8'),
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

test('active release tooling derives the build id instead of pinning the previous release', () => {
  assert.match(buildScript, /version\.json/);
  assert.match(buildScript, /meta\[name="dokohilf-build"\]/);
  assert.match(buildScript, /encodeURIComponent\(BUILD_ID\)/);
  assert.match(mobileRender, /readFile\(new URL\('\.\.\/version\.json', import\.meta\.url\)/);
  assert.doesNotMatch(mobileRender, /const BUILD_ID = '\d{8}-\d+';/);
  assert.doesNotMatch(buildScript, /STATIC_AUDIO_MANIFEST = '\.\/assets\/guide-audio-catalog\.json\?v=\d{8}-\d+'/);
});
