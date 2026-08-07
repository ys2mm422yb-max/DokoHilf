import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const legacyCss = await readFile(new URL('../assets/premium-ui-v26.css', import.meta.url), 'utf8');
const currentCss = await readFile(new URL('../assets/premium-ui-v27.css', import.meta.url), 'utf8');
const currentUxCss = await readFile(new URL('../assets/ux-v27.css', import.meta.url), 'utf8');
const experience = await readFile(new URL('../assets/experience-v27.js', import.meta.url), 'utf8');
const ux = await readFile(new URL('../assets/ux-v27.js', import.meta.url), 'utf8');
const worker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('bewährte Trennung von Anweisung und Mikrofon bleibt erhalten', () => {
  assert.match(legacyCss, /voice-focus-main/);
  assert.match(legacyCss, /grid-template-rows:minmax\(92px,auto\) minmax\(0,1fr\)/);
  assert.match(legacyCss, /voice-focus-instruction[\s\S]*max-height/);
  assert.match(legacyCss, /#voiceFocusConsoleSlot[\s\S]*min-height:0/);
});

test('aktuelle Sprachfläche nutzt eine robuste Flex-Stapelung ohne überlagerte Altansicht', () => {
  assert.match(currentUxCss, /workspace> :not\(\.voice-focus-stage\)\{display:none!important\}/);
  assert.match(currentUxCss, /voice-focus-inner\{[\s\S]*display:flex!important[\s\S]*flex-direction:column!important/);
  assert.match(currentUxCss, /voice-focus-main\{[\s\S]*flex:1 1 auto!important[\s\S]*overflow:hidden!important/);
  assert.match(currentUxCss, /#voiceFocusConsoleSlot\{[\s\S]*flex:1 1 auto!important[\s\S]*place-items:center!important/);
  assert.match(currentUxCss, /voice-focus-instruction\{[\s\S]*overflow:auto!important/);
});

test('iPhone Safe-Area trennt Kopfzeile, Versionsstatus und Sprachfläche', () => {
  assert.match(currentUxCss, /data-mode="voice"\] \.build-status\{display:none!important\}/);
  assert.match(currentUxCss, /voice-focus-stage\{inset:calc\(max\(8px,env\(safe-area-inset-top\)\) \+ 86px\) 0 0!important/);
  assert.match(currentUxCss, /build-status\[data-state="current"\]\{display:none!important\}/);
});

test('kleine und niedrige iPhones behalten die verdichtete Darstellung', () => {
  assert.match(legacyCss, /@media\(max-width:680px\)/);
  assert.match(legacyCss, /@media\(max-height:760px\)/);
  assert.match(legacyCss, /@media\(max-height:650px\)/);
  assert.match(currentCss, /voice-focus-stage/);
  assert.match(currentUxCss, /@media\(max-width:680px\)/);
  assert.match(currentUxCss, /width:92px!important/);
  assert.match(currentUxCss, /width:154px!important/);
  assert.match(currentUxCss, /@media\(max-height:720px\)/);
  assert.match(currentUxCss, /width:78px!important/);
  assert.match(currentUxCss, /width:126px!important/);
});

test('Sprachantwort fällt nach höchstens 180 ms auf die sofortige Gerätestimme zurück', () => {
  assert.match(ux, /HARD_FALLBACK_MS = 180/);
  assert.match(ux, /dokohilf_immediate_voice_fallback/);
  assert.match(ux, /\[60, 140, 280, 520\]/);
  assert.match(ux, /Antwort startet/);
  assert.match(ux, /Sofortstimme/);
  assert.match(experience, /loadPrebuiltVoice/);
});

test('Service Worker erzwingt die Auslieferung des Sprach- und Layout-Hotfixes', () => {
  assert.match(worker, /HOTFIX_REVISION = '20260807-fluid-voice-layout-1'/);
  assert.match(worker, /hotfixRevision: HOTFIX_REVISION/);
});

test('Build 27 lädt die bewährte v26-Basisschicht und die neue v27-Erfahrung gemeinsam', () => {
  assert.match(html, /premium-ui-v26\.css\?v=20260806-27/);
  assert.match(html, /premium-ui-v27\.css\?v=20260806-27/);
  assert.match(html, /ux-v27\.css\?v=20260806-27/);
  assert.match(html, /experience-v27\.js\?v=20260806-27/);
  assert.match(worker, /premium-ui-v26\.css\?v=20260806-27/);
  assert.match(worker, /premium-ui-v27\.css\?v=20260806-27/);
  assert.match(worker, /ux-v27\.css\?v=20260806-27/);
  assert.match(worker, /experience-v27\.js\?v=20260806-27/);
});