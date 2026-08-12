import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [index, sw, version, ux, v29, css, routing] = await Promise.all([
  read('index.html'),
  read('service-worker.js'),
  read('version.json').then(JSON.parse),
  read('assets/ux-polish-v42.js'),
  read('assets/v29-ui.js'),
  read('assets/ux-polish-v42.css'),
  read('tests/helpers/routing-contract.mjs'),
]);

test('UX polish v42 is wired after the established v36 presentation layer', () => {
  assert.match(index, /ux-polish-v42\.css\?v=.*-ux42/);
  assert.match(index, /ux-polish-v42\.js\?v=.*-ux42/);
  assert.ok(index.indexOf('voice-polish-v36.css') < index.indexOf('ux-polish-v42.css'));
  assert.ok(index.indexOf('voice-polish-v36.js') < index.indexOf('ux-polish-v42.js'));
  assert.match(sw, /UX_POLISH_REVISION = '20260812-voice-library-ux-v42-2'/);
  assert.match(sw, /ux-polish-v42\.css\?v=.*-ux42/);
  assert.match(sw, /ux-polish-v42\.js\?v=.*-ux42/);
  assert.equal(version.release, 'placeholder-stuck-help-fix-v42');
});

test('voice states use calm user-facing DokoHilf copy without technical engine wording', () => {
  for (const copy of [
    'DokoHilf hört zu …',
    'DokoHilf denkt nach …',
    'DokoHilf spricht …',
    'Gespräch pausiert',
  ]) assert.ok(ux.includes(copy), `Voice-Zustand fehlt: ${copy}`);

  assert.doesNotMatch(ux, /Lokale Stimme erzeugt Antwort/i);
  assert.doesNotMatch(ux, /Sprachausgabe läuft direkt auf diesem Gerät/i);
  assert.doesNotMatch(ux, /Supertonic-F1 wird abgespielt/i);
  assert.match(css, /data-voice-state="thinking"/);
  assert.match(css, /v42ThinkingRing/);
  assert.match(css, /v42ThinkingWave/);
});

test('guide actions keep the existing safe commands while becoming clearer', () => {
  assert.match(ux, /button\[data-voice-command="nochmal"\]/);
  assert.match(ux, /Nochmal anhören/);
  assert.match(ux, /Aktuellen Schritt nochmal anhören/);
  assert.match(ux, /button\[data-voice-command="ich finde das nicht"\]/);
  assert.match(ux, /Zeig mir genauer, wo das ist/);
  assert.match(ux, /Ja, ist offen/);
  assert.match(ux, /Ja, sehe ich/);
  assert.match(routing, /command-repeat/);
  assert.match(routing, /command-stuck/);
  assert.doesNotMatch(ux, /sendMessage\(/);
});

test('voice guide gets only a visual progress bar and display-only instruction splitting', () => {
  assert.match(ux, /v42-voice-progress/);
  assert.match(ux, /guideStep/);
  assert.match(ux, /guideStepCount/);
  assert.match(ux, /formatVoiceInstruction/);
  assert.match(css, /--v42-progress/);
  assert.match(css, /white-space:pre-line/);
});

test('library gains ephemeral search while automatic frequent-use ordering stays the only home shortcut logic', () => {
  assert.match(ux, /Anleitung suchen …/);
  assert.match(ux, /filterLibrary/);
  assert.match(ux, /v42-search-hidden/);
  assert.match(ux, /Deine meistgenutzten Anleitungen/);
  assert.match(ux, /Noch nicht verfügbar/);
  assert.doesNotMatch(ux, /Zuletzt genutzt|Favorit/i);
  assert.doesNotMatch(ux, /localStorage|sessionStorage|indexedDB|document\.cookie/);
});

test('chat placeholder has one owner value and v42 adds no persistence, network or new speech path', () => {
  assert.match(ux, /const CHAT_PLACEHOLDER = 'Frag einfach …'/);
  assert.match(v29, /input\.placeholder !== 'Frag einfach …'/);
  assert.doesNotMatch(ux, /Beschreibe kurz, wobei du Hilfe brauchst …/);
  assert.doesNotMatch(ux, /fetch\(|XMLHttpRequest|WebSocket|speechSynthesis|AudioContext/);
  assert.doesNotMatch(ux, /localStorage|sessionStorage|indexedDB|document\.cookie/);
});
