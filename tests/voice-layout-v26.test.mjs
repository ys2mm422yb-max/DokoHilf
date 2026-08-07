import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const legacyCss = await readFile(new URL('../assets/premium-ui-v26.css', import.meta.url), 'utf8');
const currentCss = await readFile(new URL('../assets/premium-ui-v27.css', import.meta.url), 'utf8');
const currentUxCss = await readFile(new URL('../assets/ux-v27.css', import.meta.url), 'utf8');
const balanceCss = await readFile(new URL('../assets/voice-stage-balance-v27.css', import.meta.url), 'utf8');
const directCss = await readFile(new URL('../assets/direct-guides-chat-v27.css', import.meta.url), 'utf8');
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

test('aktuelle Basisschicht verhindert weiterhin Überlagerungen', () => {
  assert.match(currentUxCss, /workspace> :not\(\.voice-focus-stage\)\{display:none!important\}/);
  assert.match(currentUxCss, /voice-focus-inner\{[\s\S]*display:flex!important[\s\S]*flex-direction:column!important/);
  assert.match(currentUxCss, /voice-focus-main\{[\s\S]*flex:1 1 auto!important[\s\S]*overflow:hidden!important/);
  assert.match(currentUxCss, /voice-focus-instruction\{[\s\S]*overflow:auto!important/);
});

test('neue Balance-Schicht gruppiert Schritt, Mikrofon und Status statt den Konsolenbereich aufzuspannen', () => {
  assert.match(balanceCss, /voice-focus-inner\{[\s\S]*grid-template-rows:auto minmax\(0,1fr\) auto!important/);
  assert.match(balanceCss, /voice-focus-main\{[\s\S]*justify-content:flex-start!important[\s\S]*gap:16px!important/);
  assert.match(balanceCss, /#voiceFocusConsoleSlot\{[\s\S]*flex:0 0 auto!important[\s\S]*height:auto!important/);
  assert.match(balanceCss, /voice-console\{[\s\S]*justify-content:flex-start!important[\s\S]*height:auto!important/);
  assert.match(balanceCss, /data-voice-state="listening"[\s\S]*width:138px!important/);
});

test('iOS- und Android-Safe-Areas bleiben von den Direkt-Guide-Stilen unangetastet', () => {
  assert.match(currentUxCss, /data-mode="voice"\] \.build-status\{display:none!important\}/);
  assert.match(balanceCss, /voice-focus-stage\{[\s\S]*inset:calc\(max\(8px,env\(safe-area-inset-top\)\) \+ 80px\) 0 0!important/);
  assert.match(currentUxCss, /build-status\[data-state="current"\]\{display:none!important\}/);
  assert.doesNotMatch(directCss, /voice-focus-stage/);
  assert.match(directCss, /safe-area-inset-left/);
  assert.match(directCss, /safe-area-inset-right/);
});

test('kleine und niedrige Mobilgeräte behalten die verdichtete Sprachanzeige', () => {
  assert.match(legacyCss, /@media\(max-width:680px\)/);
  assert.match(currentCss, /voice-focus-stage/);
  assert.match(balanceCss, /@media\(max-width:680px\)/);
  assert.match(balanceCss, /gap:18px!important/);
  assert.match(balanceCss, /width:82px!important/);
  assert.match(balanceCss, /width:134px!important/);
  assert.match(balanceCss, /@media\(max-height:760px\)/);
  assert.match(balanceCss, /width:118px!important/);
});

test('Sprachantwort fällt nach höchstens 180 ms auf die sofortige Gerätestimme zurück', () => {
  assert.match(ux, /HARD_FALLBACK_MS = 180/);
  assert.match(ux, /dokohilf_immediate_voice_fallback/);
  assert.match(ux, /\[60, 140, 280, 520\]/);
  assert.match(ux, /Antwort startet/);
  assert.match(ux, /Sofortstimme/);
  assert.match(experience, /loadPrebuiltVoice/);
});

test('Service Worker erzwingt Direkt-Guide-Revision ohne die Voice-Balance zu verlieren', () => {
  assert.match(worker, /HOTFIX_REVISION = '20260807-direct-guides-cross-platform-1'/);
  assert.match(worker, /voice-stage-balance-v27\.css\?v=20260806-27/);
  assert.match(worker, /direct-guides-chat-v27\.css\?v=20260806-27/);
  assert.match(worker, /hotfixRevision: HOTFIX_REVISION/);
});

test('Build 27 lädt Voice-Balance und danach die getrennte Direkt-Guide-Schicht', () => {
  assert.match(html, /premium-ui-v26\.css\?v=20260806-27/);
  assert.match(html, /premium-ui-v27\.css\?v=20260806-27/);
  assert.match(html, /ux-v27\.css\?v=20260806-27[\s\S]*voice-stage-balance-v27\.css\?v=20260806-27[\s\S]*direct-guides-chat-v27\.css\?v=20260806-27/);
  assert.match(html, /experience-v27\.js\?v=20260806-27/);
  assert.match(worker, /premium-ui-v26\.css\?v=20260806-27/);
  assert.match(worker, /premium-ui-v27\.css\?v=20260806-27/);
  assert.match(worker, /ux-v27\.css\?v=20260806-27/);
  assert.match(worker, /voice-stage-balance-v27\.css\?v=20260806-27/);
  assert.match(worker, /direct-guides-chat-v27\.css\?v=20260806-27/);
});
