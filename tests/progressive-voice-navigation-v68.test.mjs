import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const smartHelpSource = await readFile('assets/smart-help-v29.js', 'utf8');
const orientationSource = await readFile('assets/orientation-help-v29.js', 'utf8');

function documentStub() {
  return {
    querySelector: () => ({}),
    createElement: () => ({ dataset: {} }),
    head: { append() {} },
  };
}

function loadSmartHelp() {
  const upstream = async () => new Response(JSON.stringify({ upstream: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
  const window = { fetch: upstream };
  vm.runInNewContext(smartHelpSource, {
    window,
    document: documentStub(),
    Request,
    Response,
    console,
  });
  return window.DokoHilfSmartHelpV29;
}

function bodyFor(helper, text) {
  const parsed = { messages: [{ role: 'user', content: text }] };
  const body = helper.preparedBody(parsed, text);
  return body ? JSON.parse(body) : null;
}

test('normale Vitalwerte- und Visiten-Suche startet kurze vorhandene Mehrschritt-Guides', () => {
  const helper = loadSmartHelp();
  assert.equal(bodyFor(helper, 'Wo finde ich Vitalwerte?')?.selectedGuideSlug, 'vitalwerte');
  assert.equal(bodyFor(helper, 'Vitalwerte')?.selectedGuideSlug, 'vitalwerte');
  assert.equal(bodyFor(helper, 'Wo finde ich Visiten?')?.selectedGuideSlug, 'visiten-oeffnen');
});

test('nicht freigegebene Ziele bleiben auch mit v68 ohne erfundenen Guide', () => {
  const helper = loadSmartHelp();
  assert.equal(bodyFor(helper, 'EasyPlan'), null);
  assert.equal(bodyFor(helper, 'Aufgaben Aktuelles'), null);
  assert.equal(bodyFor(helper, 'Berichtssuche'), null);
});

test('Produktionsreihenfolge gibt normale Suche an den kurzen Guide weiter statt an den langen Orientierungsblock', async () => {
  const upstreamBodies = [];
  const upstream = async (_input, init = {}) => {
    upstreamBodies.push(JSON.parse(init.body || '{}'));
    return new Response(JSON.stringify({ upstream: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  };
  const window = { fetch: upstream };
  const context = {
    window,
    document: documentStub(),
    Request,
    Response,
    console,
  };

  vm.runInNewContext(smartHelpSource, context);
  vm.runInNewContext(orientationSource, context);

  const response = await window.fetch('https://example.test/functions/v1/dokohilf-ai', {
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Wo finde ich Vitalwerte?' }] }),
  });

  assert.deepEqual(await response.json(), { upstream: true });
  assert.equal(response.headers.get('X-DokoHilf-Orientation'), null);
  assert.equal(upstreamBodies.length, 1);
  assert.equal(upstreamBodies[0].selectedGuideSlug, 'vitalwerte');
  assert.equal(upstreamBodies[0].smartNavigationIntent, true);
});

test('bestätigte Orientierung bleibt als Fallback erhalten, falls die vorgeschaltete Kurz-Routing-Schicht fehlt', async () => {
  let upstreamCalls = 0;
  const upstream = async () => {
    upstreamCalls += 1;
    return new Response(JSON.stringify({ upstream: true }));
  };
  const window = { fetch: upstream };
  vm.runInNewContext(orientationSource, {
    window,
    Request,
    Response,
    console,
  });

  const response = await window.fetch('https://example.test/functions/v1/dokohilf-ai', {
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Wo finde ich Vitalwerte?' }] }),
  });
  const payload = await response.json();
  assert.equal(upstreamCalls, 0);
  assert.equal(response.headers.get('X-DokoHilf-Orientation'), 'confirmed-v29-4');
  assert.match(payload.reply, /Doku-Erweitert/);
  assert.match(payload.reply, /Findest du es damit\?/);
});

test('Orientierung unterscheidet normale Suche und ausdrückliche Detailfrage', () => {
  const upstream = async () => new Response('{}');
  const window = { fetch: upstream };
  vm.runInNewContext(orientationSource, {
    window,
    Request,
    Response,
    console,
  });
  const helper = window.DokoHilfOrientationHelpV29;
  assert.equal(helper.isDetailedOrientationRequest('Wo finde ich Vitalwerte?'), false);
  assert.equal(helper.isDetailedOrientationRequest('Wo genau finde ich Vitalwerte?'), true);
  assert.equal(helper.isDetailedOrientationRequest('Ich finde Vitalwerte nicht'), true);
  assert.equal(helper.isDetailedOrientationRequest('Wo ist die grüne Hauptleiste?'), true);
});