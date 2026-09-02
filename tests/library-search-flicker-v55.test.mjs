import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [uxSource, discoverySource, swSource, version] = await Promise.all([
  read('assets/ux-polish-v42.js'),
  read('assets/guide-discovery-v53.js'),
  read('service-worker.js'),
  read('version.json').then(JSON.parse),
]);

function loadUxApi(smartFilter) {
  const window = smartFilter ? { DokoHilfGuideDiscoveryV53: { filterLibrarySmart: smartFilter } } : {};
  const document = {
    readyState: 'loading',
    addEventListener() {},
  };
  vm.runInNewContext(uxSource, {
    window,
    document,
    console,
    MutationObserver: class MutationObserver {},
    requestAnimationFrame() {},
  });
  return window.DokoHilfUxPolishV42;
}

function loadDiscoveryApi() {
  const window = {
    fetch: async () => new Response('{}', { status: 200 }),
    addEventListener() {},
  };
  const document = {
    readyState: 'loading',
    addEventListener() {},
  };
  vm.runInNewContext(discoverySource, {
    window,
    document,
    console,
    Request,
    Response,
    MutationObserver: class MutationObserver {},
    requestAnimationFrame() {},
  });
  return window.DokoHilfGuideDiscoveryV53;
}

test('v33 search hotfix delegates the legacy search owner to the smart filter', () => {
  assert.equal(version.appVersion, 'v33');
  assert.match(uxSource, /20260823-search-flicker-hotfix-v55-1/);
  assert.match(swSource, /UX_POLISH_REVISION = '20260823-search-flicker-hotfix-v55-1'/);
  assert.match(swSource, /static-supertonic-2-search-v55/);

  const calls = [];
  const api = loadUxApi((grid, query) => calls.push({ grid, query }));
  const grid = { marker: 'library-grid' };
  api.applyLibraryFilter(grid, 'Sauerstoff');
  assert.deepEqual(calls, [{ grid, query: 'Sauerstoff' }]);
});

test('the library input and sync path no longer invoke the legacy substring filter directly', () => {
  assert.match(uxSource, /input\.addEventListener\('input', \(\) => applyLibraryFilter\(grid, input\.value\)\)/);
  assert.match(uxSource, /applyLibraryFilter\(grid, input\?\.value \|\| ''\)/);
  assert.doesNotMatch(uxSource, /input\.addEventListener\('input', \(\) => filterLibrary\(grid, input\.value\)\)/);
});

test('Sauerstoff remains a confirmed smart-search alias for Vitalwerte', () => {
  const discovery = loadDiscoveryApi();
  assert.deepEqual([...discovery.smartTargets('Sauerstoff')], ['vitalwerte']);
  assert.deepEqual([...discovery.smartTargets('Sauerstoff Sättigung')], ['vitalwerte']);
});
