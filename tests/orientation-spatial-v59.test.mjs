import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/orientation-help-v29.js', import.meta.url), 'utf8');
const catalog = JSON.parse(await readFile(new URL('../assets/voice-navigation-catalog-v29.json', import.meta.url), 'utf8'));
const serviceWorker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const workNote = await readFile(new URL('../ACTIVE_WORK_ORIENTATION_SPATIAL_V59.md', import.meta.url), 'utf8');

function loadWindow(guide = null) {
  const window = {
    fetch: async () => new Response(JSON.stringify({ source: 'delegated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
    DokoHilfGuideProgress: { getCurrentGuide: () => guide },
    DokoHilfSmartHelpV29: { preparedBody: () => '' },
  };
  new Function('window', 'Request', 'Response', source)(window, Request, Response);
  return window;
}

test('weißes Funktionsband wird räumlich als zweite Navigationsebene erklärt', () => {
  const window = loadWindow();
  for (const question of ['Wo ist das Funktionsband?', 'Was ist die weiße Leiste?', 'Wo ist die untere Leiste?']) {
    const text = window.DokoHilfOrientationHelpV29.orientationHelp(question);
    assert.match(text, /direkt unter der festen grünen Hauptleiste/i);
    assert.match(text, /Funktionen des gerade ausgewählten Hauptbereichs/i);
    assert.match(text, /Bericht und Durchführungsnachweis/i);
    assert.match(text, /nicht dieselbe Leiste wie die grüne Hauptleiste/i);
  }
});

test('DNF-Doku-Schritt beantwortet Funktionsband-Rückfrage lokal ohne Schrittwechsel', async () => {
  const window = loadWindow({
    guideSlug: 'durchfuehrungsnachweis-oeffnen',
    guideTitle: 'Durchführungsnachweis öffnen',
    guideStep: 1,
    guideStepCount: 3,
  });
  const response = await window.fetch('https://example.invalid/functions/v1/dokohilf-chat-router', {
    method: 'POST',
    body: JSON.stringify({
      guideSlug: 'durchfuehrungsnachweis-oeffnen',
      guideStep: 1,
      messages: [{ role: 'user', content: 'Was ist das weiße Funktionsband?' }],
    }),
  });
  const result = await response.json();
  assert.equal(result.source, 'confirmed-spatial-orientation-v59');
  assert.equal(result.guideStep, 1);
  assert.equal(result.completed, false);
  assert.match(result.spokenText, /direkt unter der festen grünen Hauptleiste/i);
});

test('neuer räumlicher Hilfesatz ist statisch über Supertonic-F1 katalogisiert', () => {
  const window = loadWindow();
  const text = window.DokoHilfOrientationHelpV29.whiteFunctionBandHelp();
  assert.equal(catalog.voice, 'Supertonic-F1');
  assert.ok(catalog.entries.some(entry => entry.text === text));
});

test('v59 ändert keine fachlichen Guides und dokumentiert die Datenschutzgrenze', () => {
  assert.match(workNote, /Keine Supabase-Guide-Schritte und keine fachlichen Klickwege in diesem Block ändern/i);
  assert.match(workNote, /Screenshots, Fotos, Video-Frames und Originalunterlagen.*niemals in GitHub oder Supabase/i);
  assert.match(workNote, /Vitalwerte/i);
  assert.match(workNote, /An-\/Abwesenheiten/i);
  assert.match(workNote, /Durchführungsnachweis/i);
  assert.match(workNote, /Bereich wechseln/i);
  assert.match(workNote, /Berichtssuche \/ Easy-Plan \/ Aufgaben · Aktuelles/i);
});

test('PWA aktiviert neue räumliche Orientierung ohne bestehende Revisionsmarker zu verlieren', () => {
  assert.match(serviceWorker, /SPATIAL_ORIENTATION_REVISION = '20260901-spatial-orientation-v59-1'/);
  assert.match(serviceWorker, /search-v55-dnf-orientation-v57-report-navigation-v58-spatial-orientation-v59/);
  assert.match(serviceWorker, /HOTFIX_REVISION = '20260809-static-supertonic-orientation-ui-v29-3'/);
  assert.match(serviceWorker, /ROUTING_REVISION = '20260822-signoff-durchfuehrungsnachweis-v52-1'/);
  assert.match(serviceWorker, /GUIDE_DISCOVERY_REVISION = '20260823-guide-discovery-v53-1'/);
});