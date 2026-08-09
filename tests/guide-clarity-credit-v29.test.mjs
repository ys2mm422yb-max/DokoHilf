import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [durchfuehrung, copyPolish, releasePolish, workflowVoice, releaseVoice, migration, localGate, version] = await Promise.all([
  readFile(new URL('assets/durchfuehrungs-workflows-v29.js', root), 'utf8'),
  readFile(new URL('assets/direct-guide-copy-v29.js', root), 'utf8'),
  readFile(new URL('assets/release-polish-v29.js', root), 'utf8'),
  readFile(new URL('assets/voice-durchfuehrung-catalog-v29.json', root), 'utf8'),
  readFile(new URL('assets/voice-release-catalog-v29.json', root), 'utf8'),
  readFile(new URL('supabase/migrations/20260809143000_guide_clarity_handover_v29.sql', root), 'utf8'),
  readFile(new URL('assets/local-voice-gate-v28.js', root), 'utf8'),
  readFile(new URL('version.json', root), 'utf8'),
]);

test('Maßnahmen ohne Zeitangabe erklärt Übergabe-Auswahl und Textfeld statt falschem Was-war-Feld', () => {
  assert.match(durchfuehrung, /Wichtig für Schichtübergabe/);
  assert.match(durchfuehrung, /Textfeld darunter/);
  assert.match(durchfuehrung, /Pop-up-Fenster/);
  assert.doesNotMatch(durchfuehrung, /Unter „Was war“ dokumentieren/);
});

test('Bedarfsmedikation lässt die automatisch gesetzte Schichtübergabe bestehen', () => {
  assert.match(durchfuehrung, /bei Bedarfsmedikation bereits automatisch ausgewählt/);
  assert.match(durchfuehrung, /Den Haken so lassen|Lass den Haken so/);
  assert.match(workflowVoice, /bei Bedarfsmedikation bereits automatisch ausgewählt/);
});

test('Berichtseintrag erklärt die optionale Schichtübergabe verständlich', () => {
  assert.match(copyPolish, /Wenn der Bericht für die nächste Schicht wichtig ist/);
  assert.match(copyPolish, /Textfeld darunter/);
  assert.match(releaseVoice, /Wenn der Bericht für die nächste Schicht wichtig ist/);
});

test('alte Doku-erweitert-Schreibweise wird aus dem aktuellen Release-Sprachkatalog entfernt', () => {
  assert.doesNotMatch(releaseVoice, /Doku erweitert/);
  assert.match(releaseVoice, /Doku-Erweitert/);
  assert.match(releaseVoice, /Wähle direkt darunter „Visiten“/);
  assert.match(releaseVoice, /Wähle direkt darunter „Vitalwerte“/);
});

test('kanonische Migration korrigiert Bericht, Durchführung und alte Navigation gemeinsam', () => {
  for (const slug of [
    'bericht-neu',
    'bedarfsmedikation-gabe',
    'massnahmen-ohne-zeitangabe',
    'visiten-oeffnen',
    'vitalwerte',
    'vitalwerte-erfassen',
    'vitalwerte-einzelwert-fortsetzen',
  ]) assert.match(migration, new RegExp(`slug = '${slug}'`));
  assert.match(migration, /große Textfeld darunter/);
  assert.match(migration, /Pop-up-Fenster/);
  assert.doesNotMatch(migration, /Dokumentiere unter „Was war“/);
});

test('Urheberhinweis bleibt dezent bei der Versionszeile', () => {
  assert.match(releasePolish, /Konzept & Umsetzung · MT/);
  assert.match(releasePolish, /footer-credit/);
  assert.match(releasePolish, /font-size:9px/);
});

test('Build 33 erzwingt neue statische WAVs statt alter iPhone-Caches', () => {
  assert.equal(JSON.parse(version).buildId, '20260809-33');
  assert.match(localGate, /audioUrl\.searchParams\.set\('v', BUILD_ID\)/);
  assert.match(localGate, /fetchWithTimeout\(audioHref, AUDIO_TIMEOUT_MS, \{ cache: 'no-store' \}\)/);
});
